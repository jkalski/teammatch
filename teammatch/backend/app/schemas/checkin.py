from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class CheckInCreate(BaseModel):
    student_id: str
    team_id: str
    course_id: str
    hours_worked: int
    tasks_planned: Optional[str] = None
    tasks_completed: str
    what_i_worked_on: str
    next_week_plan: Optional[str] = None
    completion_status: Optional[str] = None
    contribution_type: Optional[str] = None
    confidence_level: Optional[int] = None
    blocked_by: Optional[str] = None
    needs_help: bool = False
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
    tasks_planned: Optional[str] = None
    tasks_completed: str
    what_i_worked_on: str
    next_week_plan: Optional[str] = None
    completion_status: Optional[str] = None
    contribution_type: Optional[str] = None
    confidence_level: Optional[int] = None
    blocked_by: Optional[str] = None
    needs_help: bool
    blockers: Optional[str] = None
    evidence_url: Optional[str] = None
    peer_shoutout: Optional[str] = None
    week_number: int
    is_edited: bool
    edited_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True