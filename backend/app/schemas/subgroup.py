from typing import Optional
from datetime import datetime

from pydantic import BaseModel, Field


class SubgroupCreate(BaseModel):
    name: str = Field(..., min_length=2)
    description: Optional[str] = None
    group_id: str = Field(..., min_length=1)


class SubgroupResponse(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    group_id: str
    group_name: Optional[str] = None
    created_at: Optional[datetime] = None