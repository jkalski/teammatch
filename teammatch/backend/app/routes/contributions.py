from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.contribution import Contribution
from app.schemas.contribution import ContributionResponse

router = APIRouter(prefix="/contributions", tags=["contributions"])

@router.get("/student/{student_id}", response_model=list[ContributionResponse])
def get_contributions_by_student(student_id: str, db: Session = Depends(get_db)):
    return db.query(Contribution).filter(Contribution.student_id == student_id).all()

@router.get("/course/{course_id}", response_model=list[ContributionResponse])
def get_contributions_by_course(course_id: str, db: Session = Depends(get_db)):
    return db.query(Contribution).filter(Contribution.course_id == course_id).all()

@router.get("/team/{team_id}", response_model=list[ContributionResponse])
def get_contributions_by_team(team_id: str, db: Session = Depends(get_db)):
    return db.query(Contribution).filter(Contribution.team_id == team_id).all()