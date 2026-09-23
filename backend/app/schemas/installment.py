from typing import Optional

from datetime import datetime

from pydantic import BaseModel, Field


class InstallmentCreate(BaseModel):

    loan_id: str

    principal_amount: float = Field(
        ...,
        gt=0
    )

    installment_date: str


class InstallmentResponse(BaseModel):

    id: str

    loan_id: str

    member_id: str

    group_id: str

    subgroup_id: Optional[str] = None

    principal_amount: float

    interest_amount: float

    total_amount: float

    remaining_balance: float

    installment_date: str

    created_at: Optional[datetime] = None