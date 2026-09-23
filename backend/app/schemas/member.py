from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field


class MemberCreate(BaseModel):
    name: str = Field(..., min_length=2)
    phone: Optional[str] = None
    address: Optional[str] = None
    account_no: str = Field(..., min_length=1)
    opening_balance: float = Field(..., ge=0)
    subgroup_id: Optional[str] = None


class MemberResponse(BaseModel):

    id: str

    name: str

    phone: Optional[str] = None

    address: Optional[str] = None

    account_no: str

    opening_balance: float

    current_balance: float

    status: str

    subgroup_id: Optional[str] = None

    created_at: Optional[datetime] = None