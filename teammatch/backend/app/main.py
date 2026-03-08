from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.courses import router as courses_router

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

@app.get("/")
def root():
    return {"message": "TeamMatch API is running"}

@app.get("/health")
def health():
    return {"status": "ok"}