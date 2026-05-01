from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Boolean
from sqlalchemy.sql import func
from app.core.database import Base
import uuid

# Represents the checkins table in the database
class CheckIn(Base):
    __tablename__ = "checkins"

    # Primary key — auto-generated UUID for each check-in
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))

    # Foreign keys linking the check-in to a student, team, and course
    student_id = Column(String, ForeignKey("students.id"), nullable=False)
    team_id = Column(String, ForeignKey("teams.id"), nullable=False)
    course_id = Column(String, ForeignKey("courses.id"), nullable=False)

    # Core weekly progress fields
    hours_worked = Column(Integer, nullable=False)
    tasks_planned = Column(String, nullable=True)
    tasks_completed = Column(String, nullable=False)
    what_i_worked_on = Column(String, nullable=False)
    next_week_plan = Column(String, nullable=True)

    # Status and contribution tracking
    completion_status = Column(String, nullable=True)   # on_track / behind / ahead / blocked
    contribution_type = Column(String, nullable=True)   # e.g. Coding, Design, Research
    confidence_level = Column(Integer, nullable=True)   # self-rated 1–5 scale

    # Help and blocker flags — used by instructor analytics to flag at-risk students
    blocked_by = Column(String, nullable=True)
    needs_help = Column(Boolean, default=False)
    blockers = Column(String, nullable=True)

    # Optional fields
    evidence_url = Column(String, nullable=True)    # link to PR, doc, or demo
    peer_shoutout = Column(String, nullable=True)   # recognize a teammate

    # Tracks the week number this check-in belongs to
    week_number = Column(Integer, nullable=False)

    # Edit tracking — records if and when a student updated their submission
    is_edited = Column(Boolean, default=False)
    edited_at = Column(DateTime(timezone=True), nullable=True)

    # Auto-set by the database when the record is created
    created_at = Column(DateTime(timezone=True), server_default=func.now())
