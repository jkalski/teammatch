from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class TeamResponse(BaseModel):
    id: str
    course_id: str
    match_run_id: Optional[str] = None
    name: str
    team_code: str
    skill_balance_score: Optional[float] = None
    schedule_overlap_score: Optional[float] = None
    experience_balance_score: Optional[float] = None
    overall_score: Optional[float] = None
    explanation: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True