from sqlalchemy import Column, String, DateTime, ForeignKey, Boolean
from sqlalchemy.sql import func
from app.core.database import Base
import uuid

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    student_id = Column(String, ForeignKey("students.id"), nullable=False)
    course_id = Column(String, ForeignKey("courses.id"), nullable=False)
    instructor_id = Column(String, nullable=False)

    # Notification details
    type = Column(String, nullable=False)
    # LOW_CONTRIBUTION / MISSING_CHECKIN / INSTRUCTOR_NUDGE / REQUEST_UPDATE

    message = Column(String, nullable=False)
    is_read = Column(Boolean, default=False)
    is_resolved = Column(Boolean, default=False)

    # Flag details
    flag_reason = Column(String, nullable=True)
    # missing_checkins / low_hours / no_evidence / peers_report

    resolved_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())