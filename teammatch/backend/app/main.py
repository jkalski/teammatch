from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.courses import router as courses_router
from app.routes.students import router as students_router
from app.routes.matchruns import router as matchruns_router
from app.routes.teams import router as teams_router
from app.routes.checkins import router as checkins_router
from app.routes.contributions import router as contributions_router
from app.routes.notifications import router as notifications_router
from app.routes.projects import router as projects_router

# Import all models so SQLAlchemy knows about them
from app.models import course, student, team, matchrun, checkin, contribution, notification
from app.models.project import Project, Milestone

app = FastAPI(
    title="TeamMatch API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(courses_router)
app.include_router(students_router)
app.include_router(matchruns_router)
app.include_router(teams_router)
app.include_router(checkins_router)
app.include_router(contributions_router)
app.include_router(notifications_router)
app.include_router(projects_router)

@app.get("/")
def root():
    return {"message": "TeamMatch API is running"}

@app.get("/health")
def health():
    return {"status": "ok"}