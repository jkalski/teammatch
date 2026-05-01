from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.notification import Notification
from app.schemas.notification import NotificationCreate, NotificationResponse
import uuid

router = APIRouter(prefix="/notifications", tags=["notifications"])

@router.post("/", response_model=NotificationResponse)
def create_notification(notification: NotificationCreate, db: Session = Depends(get_db)):
    new_notification = Notification(
        id=str(uuid.uuid4()),
        student_id=notification.student_id,
        course_id=notification.course_id,
        instructor_id=notification.instructor_id,
        type=notification.type,
        message=notification.message,
        flag_reason=notification.flag_reason
    )
    db.add(new_notification)
    db.commit()
    db.refresh(new_notification)
    return new_notification

@router.get("/student/{student_id}", response_model=list[NotificationResponse])
def get_notifications_by_student(student_id: str, db: Session = Depends(get_db)):
    return db.query(Notification).filter(Notification.student_id == student_id).all()

@router.patch("/{notification_id}/read", response_model=NotificationResponse)
def mark_as_read(notification_id: str, db: Session = Depends(get_db)):
    notification = db.query(Notification).filter(Notification.id == notification_id).first()
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    notification.is_read = True
    db.commit()
    db.refresh(notification)
    return notification

@router.patch("/student/{student_id}/read-all", response_model=list[NotificationResponse])
def mark_all_as_read(student_id: str, db: Session = Depends(get_db)):
    notifications = db.query(Notification).filter(Notification.student_id == student_id).all()
    if not notifications:
        return []

    for notification in notifications:
        notification.is_read = True

    db.commit()
    for notification in notifications:
        db.refresh(notification)

    return notifications