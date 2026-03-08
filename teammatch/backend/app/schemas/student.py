from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

class StudentCreate(BaseModel):
    email: str
    name: str
    course_id: str
    skills: List[str] = []
    experience_level: str  # beginner / intermediate / advanced
    availability: List[str] = []
    leadership_preference: str  # leader / contributor / flexible
    role_preference: Optional[str] = None

class StudentResponse(BaseModel):
    id: str
    email: str
    name: str
    course_id: str
    team_id: Optional[str] = None
    skills: Optional[List[str]] = None
    experience_level: Optional[str] = None
    availability: Optional[List[str]] = None
    leadership_preference: Optional[str] = None
    role_preference: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True