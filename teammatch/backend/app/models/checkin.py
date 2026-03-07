from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Boolean
from sqlalchemy.sql import func
from app.core.database import Base
import uuid

class CheckIn(Base):
    __tablename__ = "checkins"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    student_id = Column(String, ForeignKey("students.id"), nullable=False)
    team_id = Column(String, ForeignKey("teams.id"), nullable=False)
    course_id = Column(String, ForeignKey("courses.id"), nullable=False)

    # Weekly progress fields
    hours_worked = Column(Integer, nullable=False)
    tasks_completed = Column(String, nullable=False)  # stored as JSON string list
    what_i_worked_on = Column(String, nullable=False)
    blockers = Column(String, nullable=True)
    evidence_url = Column(String, nullable=True)  # GitHub/Drive link
    peer_shoutout = Column(String, nullable=True)

    # Meta
    week_number = Column(Integer, nullable=False)
    is_edited = Column(Boolean, default=False)
    edited_at = Column(DateTime(timezone=True), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())