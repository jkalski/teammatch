from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.course import Course
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