# TeamMatch

TeamMatch is a cloud-native web application that forms balanced, schedule-compatible project teams for computer science courses. It collects student skills and availability, then uses a deterministic optimization engine to generate fair, explainable team assignments for instructors.

## Tech Stack
- **Frontend:** Next.js (TypeScript, Tailwind CSS) → Azure Static Web Apps
- **Backend API:** FastAPI (Python) → Azure App Service
- **Database:** PostgreSQL → Azure Database for PostgreSQL
- **Job Queue:** Azure Service Bus
- **Matching Agent:** Python container → Azure Container Instances
- **CI/CD:** GitHub Actions → Azure

## Requirements
- **OS:** Linux, macOS, or Windows (WSL recommended on Windows)
- **Node.js:** 20+
- **npm:** 10+
- **Python:** 3.11+

### Backend Setup
1. `cd teammatch/backend`
2. `python -m venv .venv`
3. `source .venv/bin/activate` (Linux/macOS) or `.venv\\Scripts\\activate` (Windows)
4. `pip install -r requirements.txt`

### Frontend Setup
1. `cd teammatch/frontend`
2. `npm install`

### Run Tests
1. `cd teammatch/backend`
2. `pytest`

## Repo Structure
- `/frontend` - Next.js web application
- `/backend` - FastAPI REST API
- `/agent` - Matching engine and optimization logic
- `/infra` - Azure infrastructure configuration
- `/docs` - Architecture, PRD, and deployment documentation
- `.github/workflows` - CI/CD pipelines

## Features
- Student skill and availability survey
- Instructor-defined team constraints
- Deterministic team optimization engine
- Explainable team assignment summaries
- Async job processing for match runs