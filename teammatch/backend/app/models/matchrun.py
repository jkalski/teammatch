from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.core.database import Base
import uuid

class MatchRun(Base):
    __tablename__ = "matchruns"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    course_id = Column(String, ForeignKey("courses.id"), nullable=False)
    status = Column(String, nullable=False, default="PENDING")
    # PENDING → RUNNING → COMPLETED → FAILED

    # Input snapshot
    roster_snapshot_id = Column(String, nullable=True)
    constraints_snapshot = Column(String, nullable=True)

    # Results
    total_teams = Column(String, nullable=True)
    error_reason = Column(String, nullable=True)

    # Timestamps
    started_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())