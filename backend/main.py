"""
Parthbhoomi Society Maintenance Tracker — FastAPI Backend
=========================================================
Local development server. Production uses Supabase directly from the frontend.

Run:
    cd backend
    pip install -r requirements.txt
    python main.py          # starts on http://localhost:8000
    
Docs:
    http://localhost:8000/docs      (Swagger UI)
    http://localhost:8000/redoc     (ReDoc)
"""

from contextlib import asynccontextmanager
from datetime import datetime
import math
import random

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session, selectinload

import uvicorn

from database import SessionLocal, engine, get_db
from db_model import Base, User, Tenement, Due, Installment, Notice, SocietySetting
from db_schema import (
    UserLogin, UserOut,
    TenementCreate, TenementUpdate, TenementOut,
    InstallmentCreate, DueOut,
    NoticeCreate, NoticeOut,
    SettingUpdate, SettingOut,
)

# ── Password hashing ──────────────────────────────────────────────────────────
try:
    import bcrypt as _bcrypt

    def hash_password(plain: str) -> str:
        return _bcrypt.hashpw(plain.encode(), _bcrypt.gensalt()).decode()

    def verify_password(plain: str, hashed: str) -> bool:
        if not hashed.startswith("$2"):
            return plain == hashed          # legacy plain-text fallback
        return _bcrypt.checkpw(plain.encode(), hashed.encode())

except ImportError:
    def hash_password(plain: str) -> str:           # type: ignore[misc]
        return plain

    def verify_password(plain: str, hashed: str) -> bool:  # type: ignore[misc]
        return plain == hashed


# ── Month / Year constants ────────────────────────────────────────────────────
ALL_MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
]
DEFAULT_YEARS     = [2025, 2026, 2027]
DEFAULT_MAINT_AMT = 500.0


# ── Helpers ───────────────────────────────────────────────────────────────────
def _recalc_due_status(due: Due, maintenance_amount: float) -> None:
    """Recalculate and update a Due's status + amount_paid from its installments."""
    total = sum(i.amount for i in due.installments)
    due.amount_paid = total
    if total <= 0:
        due.status       = "Unpaid"
        due.date_cleared = None
        due.reference    = None
        due.method       = None
    elif total >= maintenance_amount:
        due.status = "Paid"
    else:
        due.status       = "Partial"
        due.date_cleared = None
        due.reference    = None
        due.method       = None


def _get_maintenance_amount(db: Session) -> float:
    setting = db.query(SocietySetting).filter(
        SocietySetting.key == "maintenance_amount"
    ).first()
    return float(setting.value) if setting else DEFAULT_MAINT_AMT


def _load_tenements(db: Session):
    """Eagerly load tenements → dues → installments in one query."""
    return (
        db.query(Tenement)
        .options(
            selectinload(Tenement.dues).selectinload(Due.installments)
        )
        .all()
    )


def _load_tenement(db: Session, tenement_number: str) -> Tenement:
    t = (
        db.query(Tenement)
        .filter(Tenement.tenement_number == tenement_number)
        .options(
            selectinload(Tenement.dues).selectinload(Due.installments)
        )
        .first()
    )
    if not t:
        raise HTTPException(status_code=404, detail=f"Tenement {tenement_number} not found")
    return t


def _load_due(db: Session, tenement_number: str, month: str, year: int) -> Due:
    due = (
        db.query(Due)
        .filter(
            Due.tenement_number == tenement_number,
            Due.month == month,
            Due.year  == year,
        )
        .options(selectinload(Due.installments))
        .first()
    )
    if not due:
        raise HTTPException(
            status_code=404,
            detail=f"Due not found for unit {tenement_number} · {month} {year}"
        )
    return due


def _create_default_dues(tenement_number: str, maintenance_amount: float) -> list[Due]:
    """Generate Due records: past/current months = Unpaid, future months = Unbilled."""
    now = datetime.utcnow()
    cy = now.year
    cm_idx = now.month - 1  # 0-based index for current month

    dues = []
    for year in DEFAULT_YEARS:
        for m_idx, month in enumerate(ALL_MONTHS):
            if year < cy or (year == cy and m_idx <= cm_idx):
                initial_status = "Unpaid"
            else:
                initial_status = "Unbilled"

            dues.append(
                Due(
                    tenement_number=tenement_number,
                    month=month,
                    year=year,
                    status=initial_status,
                    amount=maintenance_amount,
                    amount_paid=0.0,
                )
            )
    return dues


# ── Startup / Shutdown ────────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create all tables if they don't exist yet
    Base.metadata.create_all(bind=engine)

    # Seed admin user + default maintenance amount on first run
    db = SessionLocal()
    try:
        if not db.query(User).filter(User.username == "ADMIN-01").first():
            db.add(User(
                username="ADMIN-01",
                password=hash_password("password"),
                role="admin",
                name="Society Committee Treasurer",
            ))
            print("[seed] Created admin user  ADMIN-01 / password")

        if not db.query(SocietySetting).filter(
            SocietySetting.key == "maintenance_amount"
        ).first():
            db.add(SocietySetting(key="maintenance_amount", value=str(DEFAULT_MAINT_AMT)))
            print(f"[seed] Created default maintenance amount ₹{DEFAULT_MAINT_AMT}")

        db.commit()
    finally:
        db.close()

    yield  # ── app runs ──


# ── App ───────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="Parthbhoomi Society Maintenance Tracker",
    description="Local FastAPI backend (temporary). Production → Supabase.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─────────────────────────────────────────────────────────────────────────────
# Health
# ─────────────────────────────────────────────────────────────────────────────
@app.get("/", tags=["Health"])
def health_check():
    return {"status": "ok", "message": "Parthbhoomi Society Maintenance Tracker API"}


# ─────────────────────────────────────────────────────────────────────────────
# Auth
# ─────────────────────────────────────────────────────────────────────────────
@app.post("/auth/login", response_model=UserOut, tags=["Auth"])
def login(body: UserLogin, db: Session = Depends(get_db)):
    """
    Verify credentials and return user info.
    username is either the tenement number (e.g. "42") or "ADMIN-01".
    """
    user = db.query(User).filter(User.username == body.username).first()
    if not user or not verify_password(body.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
        )
    return user


# ─────────────────────────────────────────────────────────────────────────────
# Society Settings
# ─────────────────────────────────────────────────────────────────────────────
@app.get("/settings/maintenance_amount", response_model=SettingOut, tags=["Settings"])
def get_maintenance_amount(db: Session = Depends(get_db)):
    """Fetch the current monthly maintenance amount."""
    setting = db.query(SocietySetting).filter(
        SocietySetting.key == "maintenance_amount"
    ).first()
    if not setting:
        raise HTTPException(status_code=404, detail="Setting not found")
    return setting


@app.post("/settings/maintenance_amount", response_model=SettingOut, tags=["Settings"])
def update_maintenance_amount(body: SettingUpdate, db: Session = Depends(get_db)):
    """Update the monthly maintenance amount (admin only)."""
    try:
        val = float(body.value)
        if val <= 0:
            raise ValueError
    except ValueError:
        raise HTTPException(status_code=400, detail="Value must be a positive number")

    setting = db.query(SocietySetting).filter(
        SocietySetting.key == "maintenance_amount"
    ).first()
    if setting:
        setting.value = str(val)
    else:
        setting = SocietySetting(key="maintenance_amount", value=str(val))
        db.add(setting)
    db.commit()
    db.refresh(setting)
    return setting


# ─────────────────────────────────────────────────────────────────────────────
# Tenements
# ─────────────────────────────────────────────────────────────────────────────
@app.get("/tenements", response_model=list[TenementOut], tags=["Tenements"])
def get_tenements(db: Session = Depends(get_db)):
    """
    Return all tenements with their full dues + installments.
    Response shape is identical to what Supabase returns so apiService.js
    mapping code works with both backends.
    """
    return _load_tenements(db)


@app.post("/tenements", response_model=TenementOut, status_code=status.HTTP_201_CREATED, tags=["Tenements"])
def register_tenement(body: TenementCreate, db: Session = Depends(get_db)):
    """
    Register a new tenement unit and create its resident user account.
    Automatically generates Unbilled Due records for all months in DEFAULT_YEARS.
    """
    # Validate unit number
    if not body.tenement_number.strip().isdigit():
        raise HTTPException(status_code=400, detail="Tenement number must be digits only (1–60)")
    num = int(body.tenement_number)
    if not (1 <= num <= 60):
        raise HTTPException(status_code=400, detail="Tenement number must be between 1 and 60")

    formatted = str(num)

    # Check for duplicates
    if db.query(Tenement).filter(Tenement.tenement_number == formatted).first():
        raise HTTPException(status_code=409, detail=f"Tenement {formatted} is already registered")
    if db.query(User).filter(User.username == formatted).first():
        raise HTTPException(status_code=409, detail=f"User for unit {formatted} already exists")

    maint_amount = _get_maintenance_amount(db)

    # Create tenement
    tenement = Tenement(
        tenement_number=formatted,
        owner_name=body.owner_name or f"Resident Unit {formatted}",
        contact=body.contact,
    )
    db.add(tenement)
    db.flush()  # get the tenement into the session before adding dues

    # Create default Unbilled dues
    for due in _create_default_dues(formatted, maint_amount):
        db.add(due)

    # Create resident user
    db.add(User(
        username=formatted,
        password=hash_password(body.password),
        role="resident",
        name=tenement.owner_name,
    ))

    db.commit()
    return _load_tenement(db, formatted)


@app.put("/tenements/{tenement_number}", response_model=TenementOut, tags=["Tenements"])
def update_tenement_profile(
    tenement_number: str,
    body: TenementUpdate,
    db: Session = Depends(get_db),
):
    """Update a resident's owner name and contact number."""
    tenement = _load_tenement(db, tenement_number)
    tenement.owner_name = body.owner_name.strip()
    if body.contact is not None:
        tenement.contact = body.contact.strip()

    # Keep the User.name in sync
    user = db.query(User).filter(User.username == tenement_number).first()
    if user:
        user.name = tenement.owner_name

    db.commit()
    return _load_tenement(db, tenement_number)


@app.delete("/tenements/{tenement_number}", tags=["Tenements"])
def delete_tenement(tenement_number: str, db: Session = Depends(get_db)):
    """
    Delete a tenement unit, its dues, installments, and resident user account.
    """
    tenement = db.query(Tenement).filter(Tenement.tenement_number == tenement_number).first()
    if not tenement:
        raise HTTPException(status_code=404, detail=f"Tenement {tenement_number} not found")

    user = db.query(User).filter(User.username == tenement_number).first()
    if user:
        db.delete(user)

    db.delete(tenement)
    db.commit()
    return {"success": True, "deleted_tenement_number": tenement_number}


# ─────────────────────────────────────────────────────────────────────────────
# Dues — Mark a month as Unpaid (billing activation)
# ─────────────────────────────────────────────────────────────────────────────
@app.patch(
    "/tenements/{tenement_number}/dues/{month}/{year}/activate",
    response_model=DueOut,
    tags=["Dues"],
)
def activate_due(
    tenement_number: str,
    month: str,
    year: int,
    db: Session = Depends(get_db),
):
    """
    Transition a Due from Unbilled → Unpaid (i.e. the admin has started billing that month).
    """
    due = _load_due(db, tenement_number, month, year)
    if due.status != "Unbilled":
        raise HTTPException(status_code=400, detail="Due is already billed")
    due.status = "Unpaid"
    db.commit()
    return _load_due(db, tenement_number, month, year)


# ─────────────────────────────────────────────────────────────────────────────
# Installments — Add payment
# ─────────────────────────────────────────────────────────────────────────────
@app.post(
    "/tenements/{tenement_number}/dues/{month}/{year}/installments",
    response_model=DueOut,
    tags=["Dues"],
)
def add_installment(
    tenement_number: str,
    month: str,
    year: int,
    body: InstallmentCreate,
    db: Session = Depends(get_db),
):
    """
    Record a payment installment for a specific month's due.
    Automatically updates the due status: Unpaid → Partial → Paid.
    """
    due = _load_due(db, tenement_number, month, year)

    if due.status == "Unbilled":
        due.status = "Unpaid"

    maint_amount = _get_maintenance_amount(db)
    remaining    = maint_amount - (due.amount_paid or 0)

    if body.amount > remaining + 0.01:  # small float tolerance
        raise HTTPException(
            status_code=400,
            detail=f"Payment ₹{body.amount} exceeds remaining balance ₹{remaining:.0f}"
        )

    installment = Installment(
        due_id=due.id,
        tenement_number=tenement_number,
        month=month,
        year=year,
        amount=body.amount,
        date=body.date,
        reference=body.reference,
        method=body.method,
    )
    db.add(installment)
    db.flush()

    # Reload installments to recalculate totals
    db.refresh(due)
    _recalc_due_status(due, maint_amount)

    # If fully paid, stamp the clearing details from the LAST installment
    if due.status == "Paid":
        due.date_cleared = body.date
        due.reference    = body.reference
        due.method       = body.method

    db.commit()
    return _load_due(db, tenement_number, month, year)


# ─────────────────────────────────────────────────────────────────────────────
# Dues — Revert payment (clear all installments)
# ─────────────────────────────────────────────────────────────────────────────
@app.delete(
    "/tenements/{tenement_number}/dues/{month}/{year}/revert",
    response_model=DueOut,
    tags=["Dues"],
)
def revert_payment(
    tenement_number: str,
    month: str,
    year: int,
    db: Session = Depends(get_db),
):
    """
    Revert all installments for a month — sets the due back to Unpaid.
    """
    due = _load_due(db, tenement_number, month, year)

    if due.status in ("Unbilled", "Unpaid"):
        raise HTTPException(status_code=400, detail="Nothing to revert — due is already Unpaid/Unbilled")

    # Delete all installments for this due
    db.query(Installment).filter(Installment.due_id == due.id).delete()

    due.status       = "Unpaid"
    due.amount_paid  = 0.0
    due.date_cleared = None
    due.reference    = None
    due.method       = None

    db.commit()
    return _load_due(db, tenement_number, month, year)


# ─────────────────────────────────────────────────────────────────────────────
# Notices
# ─────────────────────────────────────────────────────────────────────────────
@app.get("/notices", response_model=list[NoticeOut], tags=["Notices"])
def get_notices(db: Session = Depends(get_db)):
    """Return all notices, newest first."""
    return (
        db.query(Notice)
        .order_by(Notice.created_at.desc())
        .all()
    )


@app.post("/notices", response_model=NoticeOut, status_code=status.HTTP_201_CREATED, tags=["Notices"])
def create_notice(body: NoticeCreate, db: Session = Depends(get_db)):
    """Publish a new society notice."""
    notice_id = f"N{int(datetime.utcnow().timestamp())}-{random.randint(100, 999)}"
    notice = Notice(
        id=notice_id,
        title=body.title.strip(),
        content=body.content.strip(),
        date=datetime.utcnow().strftime("%Y-%m-%d"),
    )
    db.add(notice)
    db.commit()
    db.refresh(notice)
    return notice


@app.delete("/notices/{notice_id}", tags=["Notices"])
def delete_notice(notice_id: str, db: Session = Depends(get_db)):
    """Delete a notice by its ID."""
    notice = db.query(Notice).filter(Notice.id == notice_id).first()
    if not notice:
        raise HTTPException(status_code=404, detail="Notice not found")
    db.delete(notice)
    db.commit()
    return {"success": True, "deleted_id": notice_id}


# ─────────────────────────────────────────────────────────────────────────────
# Entry point
# ─────────────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)