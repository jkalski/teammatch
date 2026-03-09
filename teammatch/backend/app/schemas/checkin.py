from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class CheckInCreate(BaseModel):
    student_id: str
    team_id: str
    course_id: str
    hours_worked: int
    tasks_completed: str
    what_i_worked_on: str
    blockers: Optional[str] = None
    evidence_url: Optional[str] = None
    peer_shoutout: Optional[str] = None
    week_number: int

class CheckInResponse(BaseModel):
    id: str
    student_id: str
    team_id: str
    course_id: str
    hours_worked: int
    tasks_completed: str
    what_i_worked_on: str
    blockers: Optional[str] = None
    evidence_url: Optional[str] = None
    peer_shoutout: Optional[str] = None
    week_number: int
    is_edited: bool
    edited_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True