from pydantic import BaseModel
from datetime import datetime
from typing import Optional

# Defines what fields are accepted when a student submits a check-in (POST /checkins/)
class CheckInCreate(BaseModel):
    # Links the check-in to a specific student, team, and course
    student_id: str
    team_id: str
    course_id: str

    # Core weekly progress fields — required
    hours_worked: int
    tasks_completed: str
    what_i_worked_on: str
    week_number: int

    # Optional progress details
    tasks_planned: Optional[str] = None
    next_week_plan: Optional[str] = None

    # Status fields — how the student rates their own progress
    completion_status: Optional[str] = None  # on_track / behind / ahead / blocked
    contribution_type: Optional[str] = None  # e.g. Backend Development, Design
    confidence_level: Optional[int] = None   # self-rated 1–5 scale

    # Help and blocker flags
    needs_help: bool = False
    blockers: Optional[str] = None
    blocked_by: Optional[str] = None

    # Optional extras
    evidence_url: Optional[str] = None   # link to PR, doc, or demo
    peer_shoutout: Optional[str] = None  # recognize a teammate


# Defines what gets returned after a check-in is saved — includes server-generated fields
class CheckInResponse(BaseModel):
    # Auto-generated unique ID for this check-in
    id: str

    # Same fields as CheckInCreate
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

    # Server-managed metadata
    is_edited: bool                      # true if the student updated their submission
    edited_at: Optional[datetime] = None # timestamp of last edit
    created_at: datetime                 # when the check-in was originally submitted

    # Allows Pydantic to read directly from the SQLAlchemy database object
    class Config:
        from_attributes = True
