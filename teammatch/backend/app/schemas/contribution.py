from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class ContributionResponse(BaseModel):
    id: str
    student_id: str
    team_id: str
    course_id: str
    overall_score: float
    hours_score: float
    tasks_score: float
    evidence_score: float
    consistency_score: float
    status: str
    week_number: int
    checkins_submitted: int
    checkins_missed: int
    last_checkin_date: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True