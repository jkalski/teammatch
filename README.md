@"
# TeamMatch AI

TeamMatch AI is a web app that forms fair, schedule-compatible project teams for CS courses by collecting student skills + availability and generating balanced groups with explainable reasoning.

## Tech Stack
- Frontend: Flutter (Web)
- Backend: Firebase (Auth, Firestore, Hosting)
- Matching Service: Cloud Run or Firebase Cloud Functions
- AI: OpenAI API (optional)

## Repo Structure
- /frontend - Flutter app
- /backend - Matching service + endpoints
- /docs - proposal, diagrams, deployment proof
- /scripts - matching experiments
- /data - sample inputs (no real PII)
"@ | Out-File -Encoding utf8 README.md
