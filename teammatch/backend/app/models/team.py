from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Float
from sqlalchemy.sql import func
from app.core.database import Base
import uuid

class Team(Base):
    __tablename__ = "teams"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    course_id = Column(String, ForeignKey("courses.id"), nullable=False)
    match_run_id = Column(String, ForeignKey("matchruns.id"), nullable=False)
    name = Column(String, nullable=False)  # e.g. "Team 1"
    team_code = Column(String, unique=True, nullable=False)

    # Scoring metrics
    skill_balance_score = Column(Float, nullable=True)
    schedule_overlap_score = Column(Float, nullable=True)
    experience_balance_score = Column(Float, nullable=True)
    overall_score = Column(Float, nullable=True)

    # Explainability
    explanation = Column(String, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())