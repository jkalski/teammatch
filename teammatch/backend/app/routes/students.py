from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.student import Student
from app.schemas.student import StudentCreate, StudentResponse
import uuid

router = APIRouter(prefix="/students", tags=["students"])

@router.post("/", response_model=StudentResponse)
def create_student(student: StudentCreate, db: Session = Depends(get_db)):
    existing = db.query(Student).filter(Student.email == student.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Student with this email already exists")
    
    new_student = Student(
        id=str(uuid.uuid4()),
        email=student.email,
        name=student.name,
        course_id=student.course_id,
        skills=student.skills,
        experience_level=student.experience_level,
        availability=student.availability,
        leadership_preference=student.leadership_preference,
        role_preference=student.role_preference
    )
    db.add(new_student)
    db.commit()
    db.refresh(new_student)
    return new_student

@router.get("/course/{course_id}", response_model=list[StudentResponse])
def get_students_by_course(course_id: str, db: Session = Depends(get_db)):
    return db.query(Student).filter(Student.course_id == course_id).all()

@router.get("/{student_id}", response_model=StudentResponse)
def get_student(student_id: str, db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return student