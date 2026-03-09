from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.matchrun import MatchRun
from app.schemas.matchrun import MatchRunCreate, MatchRunResponse
import uuid

router = APIRouter(prefix="/matchruns", tags=["matchruns"])

@router.post("/", response_model=MatchRunResponse)
def create_match_run(run: MatchRunCreate, db: Session = Depends(get_db)):
    new_run = MatchRun(
        id=str(uuid.uuid4()),
        course_id=run.course_id,
        status="PENDING"
    )
    db.add(new_run)
    db.commit()
    db.refresh(new_run)
    return new_run

@router.get("/{run_id}", response_model=MatchRunResponse)
def get_match_run(run_id: str, db: Session = Depends(get_db)):
    run = db.query(MatchRun).filter(MatchRun.id == run_id).first()
    if not run:
        raise HTTPException(status_code=404, detail="Match run not found")
    return run

@router.get("/course/{course_id}", response_model=list[MatchRunResponse])
def get_match_runs_by_course(course_id: str, db: Session = Depends(get_db)):
    return db.query(MatchRun).filter(MatchRun.course_id == course_id).all()