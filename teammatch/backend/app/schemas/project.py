from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

class MilestoneCreate(BaseModel):
    title: str
    description: Optional[str] = None
    due_date: Optional[datetime] = None

class MilestoneUpdate(BaseModel):
    completed: bool
    due_date: Optional[datetime] = None

class MilestoneResponse(BaseModel):
    id: str
    project_id: str
    title: str
    description: Optional[str] = None
    due_date: Optional[datetime] = None
    completed: bool
    created_at: datetime

    class Config:
        from_attributes = True

class ProjectCreate(BaseModel):
    course_id: str
    name: str
    description: Optional[str] = None
    deadline: Optional[datetime] = None

class ProjectAssign(BaseModel):
    team_id: str

class ProjectResponse(BaseModel):
    id: str
    course_id: str
    team_id: Optional[str] = None
    name: str
    description: Optional[str] = None
    deadline: Optional[datetime] = None
    status: str
    created_at: datetime
    milestones: List[MilestoneResponse] = []

    class Config:
        from_attributes = True
