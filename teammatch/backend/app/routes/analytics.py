from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.team import Team
from app.models.student import Student
from app.models.checkin import CheckIn

router = APIRouter(prefix="/analytics", tags=["analytics"])

@router.get("/course/{course_id}")
def get_course_analytics(course_id: str, db: Session = Depends(get_db)):
    teams = db.query(Team).filter(Team.course_id == course_id).all()
    result = []
    for team in teams:
        students = db.query(Student).filter(Student.team_id == team.id).all()
        checkins = (
            db.query(CheckIn)
            .filter(CheckIn.team_id == team.id)
            .order_by(CheckIn.week_number)
            .all()
        )
        checkins_by_student: dict = {s.id: [] for s in students}
        for c in checkins:
            if c.student_id in checkins_by_student:
                checkins_by_student[c.student_id].append({
                    "week_number": c.week_number,
                    "hours_worked": c.hours_worked,
                    "confidence_level": c.confidence_level,
                    "completion_status": c.completion_status,
                    "needs_help": c.needs_help,
                    "blockers": c.blockers,
                })
        result.append({
            "team": {
                "id": team.id,
                "name": team.name,
                "overall_score": team.overall_score,
            },
            "students": [
                {"id": s.id, "name": s.name, "experience_level": s.experience_level}
                for s in students
            ],
            "checkins_by_student": checkins_by_student,
        })
    return result
