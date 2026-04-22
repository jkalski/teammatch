from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.course import Course
from app.models.student import Student
from app.models.team import Team
from app.models.matchrun import MatchRun
from app.models.checkin import CheckIn
from app.models.notification import Notification
from app.models.contribution import Contribution
from app.models.project import Project, Milestone
from app.schemas.course import CourseCreate, CourseResponse
import uuid

router = APIRouter(prefix="/courses", tags=["courses"])

@router.post("/", response_model=CourseResponse)
def create_course(course: CourseCreate, db: Session = Depends(get_db)):
    new_course = Course(
        id=str(uuid.uuid4()),
        name=course.name,
        instructor_id=course.instructor_id,
        team_size=course.team_size,
        team_code=str(uuid.uuid4())[:8].upper()
    )
    db.add(new_course)
    db.commit()
    db.refresh(new_course)
    return new_course

@router.get("/", response_model=list[CourseResponse])
def get_courses(db: Session = Depends(get_db)):
    return db.query(Course).all()

@router.get("/{course_id}", response_model=CourseResponse)
def get_course(course_id: str, db: Session = Depends(get_db)):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course

@router.delete("/{course_id}", status_code=204)
def delete_course(course_id: str, db: Session = Depends(get_db)):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    # Delete in FK-safe order
    db.query(CheckIn).filter(CheckIn.course_id == course_id).delete()
    db.query(Notification).filter(Notification.course_id == course_id).delete()
    db.query(Contribution).filter(Contribution.course_id == course_id).delete()

    projects = db.query(Project).filter(Project.course_id == course_id).all()
    for p in projects:
        db.query(Milestone).filter(Milestone.project_id == p.id).delete()
    db.query(Project).filter(Project.course_id == course_id).delete()

    db.query(Student).filter(Student.course_id == course_id).update({"team_id": None})
    db.query(Student).filter(Student.course_id == course_id).delete()
    db.query(Team).filter(Team.course_id == course_id).delete()
    db.query(MatchRun).filter(MatchRun.course_id == course_id).delete()

    db.delete(course)
    db.commit()