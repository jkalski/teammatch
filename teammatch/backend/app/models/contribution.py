from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Float
from sqlalchemy.sql import func
from app.core.database import Base
import uuid

class Contribution(Base):
    __tablename__ = "contributions"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    student_id = Column(String, ForeignKey("students.id"), nullable=False)
    team_id = Column(String, ForeignKey("teams.id"), nullable=False)
    course_id = Column(String, ForeignKey("courses.id"), nullable=False)

    # Computed scores
    overall_score = Column(Float, nullable=False, default=0.0)
    hours_score = Column(Float, nullable=False, default=0.0)
    tasks_score = Column(Float, nullable=False, default=0.0)
    evidence_score = Column(Float, nullable=False, default=0.0)
    consistency_score = Column(Float, nullable=False, default=0.0)

    # Status
    status = Column(String, nullable=False, default="ON_TRACK")
    # ON_TRACK / WATCH / FLAG

    # Context
    week_number = Column(Integer, nullable=False)
    checkins_submitted = Column(Integer, default=0)
    checkins_missed = Column(Integer, default=0)
    last_checkin_date = Column(DateTime(timezone=True), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())