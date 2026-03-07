from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, ARRAY
from sqlalchemy.sql import func
from app.core.database import Base
import uuid

class Student(Base):
    __tablename__ = "students"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, nullable=False)
    name = Column(String, nullable=False)
    course_id = Column(String, ForeignKey("courses.id"), nullable=False)
    team_id = Column(String, ForeignKey("teams.id"), nullable=True)
    
    # Survey responses
    skills = Column(ARRAY(String), nullable=True)
    experience_level = Column(String, nullable=True)  # beginner / intermediate / advanced
    availability = Column(ARRAY(String), nullable=True)  # e.g. ["Mon 9am", "Wed 3pm"]
    leadership_preference = Column(String, nullable=True)  # leader / contributor / flexible
    role_preference = Column(String, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())