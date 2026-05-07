from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.team import Team
from app.models.student import Student
from app.models.checkin import CheckIn
from app.models.matchrun import MatchRun
from app.schemas.team import TeamResponse
import os
import anthropic

router = APIRouter(prefix="/teams", tags=["teams"])

@router.get("/course/{course_id}", response_model=list[TeamResponse])
def get_teams_by_course(course_id: str, db: Session = Depends(get_db)):
    latest_run = (
        db.query(MatchRun)
        .filter(MatchRun.course_id == course_id, MatchRun.status == "COMPLETED")
        .order_by(MatchRun.completed_at.desc())
        .first()
    )
    if latest_run:
        return db.query(Team).filter(Team.match_run_id == latest_run.id).all()
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

@router.post("/{team_id}/analyze")
def analyze_team_health(team_id: str, db: Session = Depends(get_db)):
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        raise HTTPException(status_code=503, detail="AI analysis not configured.")

    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")

    members = db.query(Student).filter(Student.team_id == team_id).all()
    checkins = db.query(CheckIn).filter(CheckIn.team_id == team_id).order_by(CheckIn.week_number, CheckIn.created_at).all()

    member_map = {m.id: m.name for m in members}

    # Build per-student check-in summary
    student_checkins: dict[str, list[str]] = {m.id: [] for m in members}
    for c in checkins:
        if c.student_id in student_checkins:
            flags = []
            if c.needs_help:
                flags.append("NEEDS HELP")
            if c.completion_status == "behind":
                flags.append("BEHIND")
            if c.completion_status == "blocked":
                flags.append("BLOCKED")
            if c.blockers:
                flags.append(f"blocker: {c.blockers}")
            flag_str = f" [{', '.join(flags)}]" if flags else ""
            student_checkins[c.student_id].append(
                f"  Week {c.week_number}: {c.hours_worked}h, {c.completion_status or 'unknown'}, "
                f"confidence {c.confidence_level}/5, worked on: {c.what_i_worked_on}{flag_str}"
            )

    member_sections = []
    for m in members:
        lines = student_checkins[m.id]
        history = "\n".join(lines) if lines else "  (no check-ins yet)"
        member_sections.append(
            f"- {m.name} | {m.experience_level} | {m.leadership_preference} | skills: {', '.join(m.skills or [])}\n{history}"
        )

    team_info = (
        f"Team: {team.name}\n"
        f"Overall score: {round((team.overall_score or 0) * 100)}% "
        f"(skill {round((team.skill_balance_score or 0) * 100)}%, "
        f"schedule {round((team.schedule_overlap_score or 0) * 100)}%, "
        f"experience {round((team.experience_balance_score or 0) * 100)}%)\n\n"
        f"Members and check-in history:\n" + "\n\n".join(member_sections)
    )

    prompt = f"""You are an instructor assistant analyzing team health for a university software engineering course.

{team_info}

Provide a structured analysis in exactly this format — use the exact section headers shown:

## Team Health Summary
2-3 sentences describing the overall health, collaboration dynamic, and progress trajectory of this team.

## At-Risk Students
List each student who is behind, struggling, or needs help by full name. For each, give one specific reason based on their check-in data. If no students are at risk, write "None identified."

## Instructor Recommendations
3-4 concrete, actionable steps the instructor should take this week to support this team.

## Week-by-Week Action Plan
A brief plan for the next 3 weeks showing what the instructor and team should focus on each week to get back on track or stay on track.
"""

    client = anthropic.Anthropic(api_key=api_key)
    message = client.messages.create(
        model="claude-opus-4-7",
        max_tokens=1024,
        messages=[{"role": "user", "content": prompt}],
    )

    return {"analysis": message.content[0].text}
