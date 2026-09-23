from typing import Optional
from datetime import datetime

from pydantic import BaseModel, Field


class LoanCreate(BaseModel):
    member_id: str
    group_id: str
    subgroup_id: Optional[str] = None

    principal_amount: float = Field(..., gt=0)

    # Default monthly interest rate
    interest_rate: float = Field(
        default=1.0,
        ge=0
    )

    # Service charge when a new loan is taken
    service_charge: float = Field(
        default=0,
        ge=0
    )

    # YYYY-MM-DD
    loan_date: str


class LoanResponse(BaseModel):
    id: str

    member_id: str
    group_id: str
    subgroup_id: Optional[str] = None

    # Original / accumulated principal
    principal_amount: float

    # Current remaining principal
    principal_balance: float

    # Monthly interest rate
    interest_rate: float

    # Total interest charged so far
    total_interest_charged: float

    # Total service charge
    service_charge: float

    loan_date: str
    status: str

    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None