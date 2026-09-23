from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field


class SavingCreate(BaseModel):
    member_id: str
    group_id: str
    subgroup_id: Optional[str] = None
    amount: float = Field(..., ge=0)
    date: str
    month: int = Field(..., ge=1, le=12)
    year: int


class BulkSavingCreate(BaseModel):
    subgroup_id: str
    amount: float = Field(..., ge=0)
    date: str
    month: int = Field(..., ge=1, le=12)
    year: int


class SavingResponse(BaseModel):
    id: str
    member_id: str
    group_id: str
    subgroup_id: Optional[str] = None
    amount: float
    date: str
    month: int
    year: int
    created_at: Optional[datetime] = None