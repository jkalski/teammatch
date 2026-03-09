from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.team import Team
from app.schemas.team import TeamResponse

router = APIRouter(prefix="/teams", tags=["teams"])

@router.get("/course/{course_id}", response_model=list[TeamResponse])
def get_teams_by_course(course_id: str, db: Session = Depends(get_db)):
    return db.query(Team).filter(Team.course_id == course_id).all()

@router.get("/matchrun/{match_run_id}", response_model=list[TeamResponse])
def get_teams_by_matchrun(match_run_id: str, db: Session = Depends(get_db)):
    return db.query(Team).filter(Team.match_run_id == match_run_id).all()

@router.get("/{team_id}", response_model=TeamResponse)
def get_team(team_id: str, db: Session = Depends(get_db)):
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    return team