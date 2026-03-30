from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.project import Project, Milestone
from app.schemas.project import ProjectCreate, ProjectAssign, ProjectResponse, MilestoneCreate, MilestoneUpdate, MilestoneResponse
import uuid

router = APIRouter(prefix="/projects", tags=["projects"])


@router.post("/", response_model=ProjectResponse)
def create_project(project: ProjectCreate, db: Session = Depends(get_db)):
    new_project = Project(
        id=str(uuid.uuid4()),
        course_id=project.course_id,
        name=project.name,
        description=project.description,
        deadline=project.deadline,
    )
    db.add(new_project)
    db.commit()
    db.refresh(new_project)
    new_project.milestones = []
    return new_project


@router.get("/course/{course_id}", response_model=list[ProjectResponse])
def get_projects_by_course(course_id: str, db: Session = Depends(get_db)):
    projects = db.query(Project).filter(Project.course_id == course_id).all()
    for p in projects:
        p.milestones = db.query(Milestone).filter(Milestone.project_id == p.id).all()
    return projects


@router.get("/team/{team_id}", response_model=list[ProjectResponse])
def get_projects_by_team(team_id: str, db: Session = Depends(get_db)):
    projects = db.query(Project).filter(Project.team_id == team_id).all()
    for p in projects:
        p.milestones = db.query(Milestone).filter(Milestone.project_id == p.id).all()
    return projects


@router.patch("/{project_id}/assign", response_model=ProjectResponse)
def assign_project(project_id: str, body: ProjectAssign, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    project.team_id = body.team_id
    db.commit()
    db.refresh(project)
    project.milestones = db.query(Milestone).filter(Milestone.project_id == project.id).all()
    return project


@router.post("/{project_id}/milestones", response_model=MilestoneResponse)
def create_milestone(project_id: str, milestone: MilestoneCreate, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    new_milestone = Milestone(
        id=str(uuid.uuid4()),
        project_id=project_id,
        title=milestone.title,
        description=milestone.description,
        due_date=milestone.due_date,
    )
    db.add(new_milestone)
    db.commit()
    db.refresh(new_milestone)
    return new_milestone


@router.patch("/milestones/{milestone_id}", response_model=MilestoneResponse)
def update_milestone(milestone_id: str, body: MilestoneUpdate, db: Session = Depends(get_db)):
    milestone = db.query(Milestone).filter(Milestone.id == milestone_id).first()
    if not milestone:
        raise HTTPException(status_code=404, detail="Milestone not found")
    milestone.completed = body.completed
    db.commit()
    db.refresh(milestone)
    return milestone
