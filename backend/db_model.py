from sqlalchemy import (
    Column, Integer, String, Float, Text,
    DateTime, ForeignKey, UniqueConstraint,
)
from sqlalchemy.orm import declarative_base, relationship
from datetime import datetime

Base = declarative_base()


# ── User ──────────────────────────────────────────────────────────────────────
class User(Base):
    """
    Login credentials.
    username = tenement number (e.g. "42") for residents, or "ADMIN-01" for admin.
    password is bcrypt-hashed.
    """
    __tablename__ = "users"

    id         = Column(Integer, primary_key=True, autoincrement=True)
    username   = Column(String(50),  unique=True, nullable=False)
    password   = Column(String(255), nullable=False)          # bcrypt hash
    role       = Column(String(20),  nullable=False, default="resident")  # 'admin' | 'resident'
    name       = Column(String(100), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


# ── Tenement ──────────────────────────────────────────────────────────────────
class Tenement(Base):
    """One physical housing unit in the society."""
    __tablename__ = "tenements"

    id               = Column(Integer, primary_key=True, autoincrement=True)
    tenement_number  = Column(String(10), unique=True, nullable=False)
    owner_name       = Column(String(100), nullable=False)
    contact          = Column(String(30), nullable=True)
    created_at       = Column(DateTime, default=datetime.utcnow)

    dues = relationship("Due", back_populates="tenement", cascade="all, delete-orphan")


# ── Due ───────────────────────────────────────────────────────────────────────
class Due(Base):
    """
    One month's maintenance record for a tenement.
    status: 'Unbilled' | 'Unpaid' | 'Partial' | 'Paid'
    """
    __tablename__ = "dues"
    __table_args__ = (
        UniqueConstraint("tenement_number", "month", "year", name="uq_due_unit_month_year"),
    )

    id               = Column(Integer, primary_key=True, autoincrement=True)
    tenement_number  = Column(String(10), ForeignKey("tenements.tenement_number", ondelete="CASCADE"), nullable=False)
    month            = Column(String(20), nullable=False)       # e.g. "July"
    year             = Column(Integer,    nullable=False)
    status           = Column(String(20), nullable=False, default="Unbilled")
    amount           = Column(Float,      nullable=False)       # monthly maintenance amount
    amount_paid      = Column(Float,      nullable=False, default=0.0)
    date_cleared     = Column(String(20), nullable=True)        # YYYY-MM-DD, set when Paid
    reference        = Column(String(100), nullable=True)
    method           = Column(String(50),  nullable=True)       # Cash | Cheque | Bank Transfer

    tenement     = relationship("Tenement",    back_populates="dues")
    installments = relationship("Installment", back_populates="due", cascade="all, delete-orphan")


# ── Installment ───────────────────────────────────────────────────────────────
class Installment(Base):
    """
    An individual payment towards a Due. A Due may have multiple installments
    (partial payments) that together sum up to the full maintenance amount.
    """
    __tablename__ = "installments"

    id               = Column(Integer, primary_key=True, autoincrement=True)
    due_id           = Column(Integer, ForeignKey("dues.id", ondelete="CASCADE"), nullable=False)
    tenement_number  = Column(String(10), nullable=False)       # denormalized for easy filtering
    month            = Column(String(20), nullable=False)
    year             = Column(Integer,    nullable=False)
    amount           = Column(Float,      nullable=False)
    date             = Column(String(20), nullable=False)       # YYYY-MM-DD
    reference        = Column(String(100), nullable=True)
    method           = Column(String(50),  nullable=False)      # Cash | Cheque | Bank Transfer

    due = relationship("Due", back_populates="installments")


# ── Notice ────────────────────────────────────────────────────────────────────
class Notice(Base):
    """Society-wide announcement published by the admin."""
    __tablename__ = "notices"

    id         = Column(String(60), primary_key=True)           # e.g. "N1720000000-342"
    title      = Column(String(255), nullable=False)
    content    = Column(Text,        nullable=False)
    date       = Column(String(20),  nullable=False)            # YYYY-MM-DD
    created_at = Column(DateTime, default=datetime.utcnow)


# ── SocietySetting ────────────────────────────────────────────────────────────
class SocietySetting(Base):
    """
    Key-value store for admin-configurable global settings.
    Currently used key: 'maintenance_amount'
    """
    __tablename__ = "society_settings"

    id    = Column(Integer, primary_key=True, autoincrement=True)
    key   = Column(String(100), unique=True, nullable=False)
    value = Column(String(255), nullable=False)
