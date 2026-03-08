from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class CourseCreate(BaseModel):
    name: str
    instructor_id: str
    team_size: int = 4

class CourseResponse(BaseModel):
    id: str
    name: str
    instructor_id: str
    team_size: int
    team_code: str
    created_at: datetime

    class Config:
        from_attributes = True