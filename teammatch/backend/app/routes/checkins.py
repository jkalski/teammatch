from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.checkin import CheckIn
from app.schemas.checkin import CheckInCreate, CheckInResponse
import uuid

router = APIRouter(prefix="/checkins", tags=["checkins"])

@router.post("/", response_model=CheckInResponse)
def create_checkin(checkin: CheckInCreate, db: Session = Depends(get_db)):
    new_checkin = CheckIn(
        id=str(uuid.uuid4()),
        student_id=checkin.student_id,
        team_id=checkin.team_id,
        course_id=checkin.course_id,
        hours_worked=checkin.hours_worked,
        tasks_planned=checkin.tasks_planned,
        tasks_completed=checkin.tasks_completed,
        what_i_worked_on=checkin.what_i_worked_on,
        next_week_plan=checkin.next_week_plan,
        completion_status=checkin.completion_status,
        contribution_type=checkin.contribution_type,
        confidence_level=checkin.confidence_level,
        blocked_by=checkin.blocked_by,
        needs_help=checkin.needs_help,
        blockers=checkin.blockers,
        evidence_url=checkin.evidence_url,
        peer_shoutout=checkin.peer_shoutout,
        week_number=checkin.week_number
    )
    db.add(new_checkin)
    db.commit()
    db.refresh(new_checkin)
    return new_checkin

@router.get("/student/{student_id}", response_model=list[CheckInResponse])
def get_checkins_by_student(student_id: str, db: Session = Depends(get_db)):
    return db.query(CheckIn).filter(CheckIn.student_id == student_id).all()

@router.get("/team/{team_id}", response_model=list[CheckInResponse])
def get_checkins_by_team(team_id: str, db: Session = Depends(get_db)):
    return db.query(CheckIn).filter(CheckIn.team_id == team_id).order_by(CheckIn.created_at.desc()).all()

@router.get("/course/{course_id}", response_model=list[CheckInResponse])
def get_checkins_by_course(course_id: str, db: Session = Depends(get_db)):
    return db.query(CheckIn).filter(CheckIn.course_id == course_id).order_by(CheckIn.created_at.desc()).all()