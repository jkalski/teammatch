from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class MatchRunCreate(BaseModel):
    course_id: str

class MatchRunResponse(BaseModel):
    id: str
    course_id: str
    status: str
    total_teams: Optional[str] = None
    error_reason: Optional[str] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True