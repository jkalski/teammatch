from sqlalchemy.orm import Session
from sqlalchemy.sql import func
from app.models.student import Student
from app.models.team import Team
from app.models.matchrun import MatchRun
import uuid
import random
from itertools import combinations

EXP_SCORE = {"beginner": 1, "intermediate": 2, "advanced": 3}


def _skill_balance(members: list[Student]) -> float:
    all_skills = [s for m in members for s in (m.skills or [])]
    if not all_skills:
        return 0.0
    unique = len(set(all_skills))
    return min(unique / len(all_skills), 1.0)


def _experience_balance(members: list[Student]) -> float:
    scores = [EXP_SCORE.get(m.experience_level or "beginner", 1) for m in members]
    if len(set(scores)) == 1:
        return 0.4
    spread = max(scores) - min(scores)
    return min(spread / 2.0, 1.0)


def _schedule_overlap(members: list[Student]) -> float:
    avails = [set(m.availability or []) for m in members]
    if len(avails) < 2:
        return 1.0
    overlaps = []
    for a, b in combinations(avails, 2):
        union = a | b
        if union:
            overlaps.append(len(a & b) / len(union))
    return sum(overlaps) / len(overlaps) if overlaps else 0.0


def _score_team(members: list[Student]) -> dict:
    skill = _skill_balance(members)
    exp = _experience_balance(members)
    sched = _schedule_overlap(members)
    overall = round(0.4 * skill + 0.35 * exp + 0.25 * sched, 3)
    return {
        "skill_balance_score": round(skill, 3),
        "experience_balance_score": round(exp, 3),
        "schedule_overlap_score": round(sched, 3),
        "overall_score": overall,
    }


def _explanation(scores: dict, members: list[Student]) -> str:
    skills = list(set(s for m in members for s in (m.skills or [])))[:6]
    skill_str = ", ".join(skills) if skills else "varied"
    return (
        f"Overall balance: {scores['overall_score']:.0%}. "
        f"Skills covered: {skill_str}. "
        f"Experience mix: {', '.join(m.experience_level or 'unknown' for m in members)}. "
        f"Schedule overlap: {scores['schedule_overlap_score']:.0%}."
    )


def _form_teams(students: list[Student], team_size: int) -> list[list[Student]]:
    # Seed with one leader or flexible per team, then fill greedily
    leaders = [s for s in students if s.leadership_preference == "leader"]
    flexible = [s for s in students if s.leadership_preference == "flexible"]
    contributors = [s for s in students if s.leadership_preference == "contributor"]

    seeds = leaders + flexible + contributors
    remaining = list(students)
    random.shuffle(remaining)

    num_teams = max(1, len(students) // team_size)
    teams: list[list[Student]] = [[] for _ in range(num_teams)]
    assigned = set()

    # Seed each team with one leader/flexible if available
    for i in range(num_teams):
        for seed in seeds:
            if seed.id not in assigned:
                teams[i].append(seed)
                assigned.add(seed.id)
                break

    # Fill remaining slots by picking whoever most improves the team's skill diversity
    unassigned = [s for s in remaining if s.id not in assigned]

    for s in unassigned:
        # Find the team with fewest members that benefits most from this student's skills
        best_team = min(
            (t for t in teams if len(t) < team_size),
            key=lambda t: (
                len(t),
                -len(set(s.skills or []) - set(sk for m in t for sk in (m.skills or [])))
            ),
            default=None,
        )
        if best_team is not None:
            best_team.append(s)
        else:
            # Overflow: add to smallest team
            smallest = min(teams, key=len)
            smallest.append(s)

    return [t for t in teams if t]


def run_matching(run_id: str, course_id: str, team_size: int, _db: Session):
    from app.core.database import SessionLocal
    db = SessionLocal()
    run = db.query(MatchRun).filter(MatchRun.id == run_id).first()
    if not run:
        db.close()
        return

    try:
        run.status = "RUNNING"
        run.started_at = func.now()
        db.commit()

        students = db.query(Student).filter(Student.course_id == course_id).all()
        if not students:
            run.status = "FAILED"
            run.error_reason = "No students enrolled in this course."
            db.commit()
            return

        # Clear old team assignments for this course's students
        for s in students:
            s.team_id = None
        db.commit()

        # Delete old teams from previous runs for this course
        old_teams = db.query(Team).filter(Team.course_id == course_id).all()
        for t in old_teams:
            db.delete(t)
        db.commit()

        team_groups = _form_teams(students, team_size)

        for i, members in enumerate(team_groups):
            scores = _score_team(members)
            team = Team(
                id=str(uuid.uuid4()),
                course_id=course_id,
                match_run_id=run_id,
                name=f"Team {i + 1}",
                team_code=str(uuid.uuid4())[:6].upper(),
                skill_balance_score=scores["skill_balance_score"],
                experience_balance_score=scores["experience_balance_score"],
                schedule_overlap_score=scores["schedule_overlap_score"],
                overall_score=scores["overall_score"],
                explanation=_explanation(scores, members),
            )
            db.add(team)
            db.flush()

            for student in members:
                student.team_id = team.id

        run.status = "COMPLETED"
        run.completed_at = func.now()
        run.total_teams = str(len(team_groups))
        db.commit()

    except Exception as e:
        db.rollback()
        run = db.query(MatchRun).filter(MatchRun.id == run_id).first()
        if run:
            run.status = "FAILED"
            run.error_reason = str(e)
            db.commit()
    finally:
        db.close()
