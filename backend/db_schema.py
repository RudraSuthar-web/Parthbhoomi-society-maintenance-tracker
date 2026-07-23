from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List


# ── Auth ───────────────────────────────────────────────────────────────────────
class UserLogin(BaseModel):
    username: str
    password: str

class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    username: str
    role: str
    name: str


# ── Installments ───────────────────────────────────────────────────────────────
class InstallmentCreate(BaseModel):
    """Body sent when recording a payment installment."""
    amount:    float = Field(..., gt=0, description="Amount paid in this installment (₹)")
    date:      str   = Field(..., description="Date of payment YYYY-MM-DD")
    reference: Optional[str] = Field(None, description="Cheque number / transaction reference")
    method:    str   = Field(..., description="Cash | Cheque | Bank Transfer")

class InstallmentOut(BaseModel):
    """
    Response shape matches exactly what Supabase returns,
    so apiService.js mapping code works with both backends.
    """
    model_config = ConfigDict(from_attributes=True)
    amount:    float
    date:      str
    reference: Optional[str] = None
    method:    str


# ── Dues ───────────────────────────────────────────────────────────────────────
class DueOut(BaseModel):
    """
    Response shape matches Supabase 'dues' table column names (snake_case).
    apiService.js maps: amount_paid -> amountPaid, date_cleared -> dateCleared, etc.
    """
    model_config = ConfigDict(from_attributes=True)
    id:           int
    month:        str
    year:         int
    status:       str
    amount:       float
    amount_paid:  float = 0.0
    date_cleared: Optional[str] = None
    reference:    Optional[str] = None
    method:       Optional[str] = None
    installments: List[InstallmentOut] = []


# ── Tenements ──────────────────────────────────────────────────────────────────
class TenementCreate(BaseModel):
    """Body sent when registering a new tenement unit."""
    tenement_number: str  = Field(..., max_length=10)
    owner_name:      str  = Field(..., max_length=100)
    contact:         Optional[str] = None
    password:        str  = Field(..., min_length=4)

class TenementUpdate(BaseModel):
    """Body sent when updating a resident's profile."""
    owner_name: str
    contact:    Optional[str] = None

class TenementOut(BaseModel):
    """
    Response shape matches Supabase 'tenements' table column names.
    apiService.js maps: tenement_number -> tenementNumber, owner_name -> ownerName.
    """
    model_config = ConfigDict(from_attributes=True)
    tenement_number: str
    owner_name:      str
    contact:         Optional[str] = None
    dues:            List[DueOut] = []


# ── Notices ────────────────────────────────────────────────────────────────────
class NoticeCreate(BaseModel):
    title:   str = Field(..., max_length=255)
    content: str

class NoticeOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id:      str
    title:   str
    content: str
    date:    str


# ── Settings ───────────────────────────────────────────────────────────────────
class SettingUpdate(BaseModel):
    value: str = Field(..., description="New value for the setting (stored as string)")

class SettingOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    key:   str
    value: str