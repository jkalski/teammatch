from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class NotificationResponse(BaseModel):
    id: str
    student_id: str
    course_id: str
    instructor_id: str
    type: str
    message: str
    is_read: bool
    is_resolved: bool
    flag_reason: Optional[str] = None
    resolved_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True

class NotificationCreate(BaseModel):
    student_id: str
    course_id: str
    instructor_id: str
    type: str
    message: str
    flag_reason: Optional[str] = None