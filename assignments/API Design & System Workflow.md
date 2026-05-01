# Assignment: API Design & System Workflow

Project: TeamMatch  
Date: 2026-04-09  
Version: 1.0

## Objective
Design how TeamMatch works by defining APIs and explaining end-to-end data flow across UI, backend, and database.

## Part 1: API Design
The APIs below are aligned with the implemented backend routes and current data model.

| API Name | Method | Input | Output | Module | Related Database Table(s) |
|---|---|---|---|---|---|
| Create Course | POST | name, instructor_id, team_size | course object (id, team_code, metadata) | Course | courses |
| Get Courses | GET | none | list of courses | Course | courses |
| Create Student Profile | POST | name, email, course_id, skills[], experience_level, availability[], leadership_preference, role_preference | student object (id and profile data) | Student Profile | students |
| Get Students by Course | GET | course_id (path) | list of students in course | Student Profile | students |
| Create Match Run | POST | course_id | matchrun object (id, status=PENDING) | Team Matching | matchruns |
| Get Match Runs by Course | GET | course_id (path) | list of match runs | Team Matching | matchruns |
| Get Teams by Course | GET | course_id (path) | list of teams with balance scores and explanation | Team Management | teams |
| Create Project | POST | course_id, name, description, deadline | project object | Project | projects |
| Assign Project to Team | PATCH | project_id (path), team_id | updated project object | Project | projects, teams |
| Create Milestone | POST | project_id (path), title, description, due_date | milestone object | Project | milestones |
| Submit Check-in | POST | student_id, team_id, course_id, week_number, hours_worked, tasks_completed, what_i_worked_on, optional structured fields | checkin object | Check-in | checkins |
| Get Contributions by Team | GET | team_id (path) | list of contribution score records | Contribution | contributions |
| Create Notification | POST | student_id, course_id, instructor_id, type, message, flag_reason | notification object | Notification | notifications |
| Get Notifications by Student | GET | student_id (path) | list of notifications | Notification | notifications |
| Mark Notification as Read | PATCH | notification_id (path) | updated notification object | Notification | notifications |

## Part 2: API Grouping

### 1. Course Module
- POST /courses/
- GET /courses/
- GET /courses/{course_id}

### 2. Student Profile Module
- POST /students/
- GET /students/course/{course_id}
- GET /students/{student_id}

### 3. Team Matching Module
- POST /matchruns/
- GET /matchruns/{run_id}
- GET /matchruns/course/{course_id}

### 4. Team Management Module
- GET /teams/course/{course_id}
- GET /teams/matchrun/{match_run_id}
- GET /teams/{team_id}

### 5. Project & Milestone Module
- POST /projects/
- GET /projects/course/{course_id}
- GET /projects/team/{team_id}
- PATCH /projects/{project_id}/assign
- POST /projects/{project_id}/milestones
- PATCH /projects/milestones/{milestone_id}

### 6. Check-in Module
- POST /checkins/
- GET /checkins/student/{student_id}
- GET /checkins/team/{team_id}

### 7. Contribution Module
- GET /contributions/student/{student_id}
- GET /contributions/course/{course_id}
- GET /contributions/team/{team_id}

### 8. Notification Module
- POST /notifications/
- GET /notifications/student/{student_id}
- PATCH /notifications/{notification_id}/read

## Part 3: System Workflow (One Feature)
Feature Selected: Student Weekly Check-in Submission

1. User Action (UI)
- Student opens Check-in page and fills out weekly form fields.
- Student clicks Submit.

2. API Call
- UI sends POST request to /checkins/ with form payload.

3. Backend Processing
- Backend validates required fields (student_id, team_id, course_id, week_number, hours_worked, tasks_completed, what_i_worked_on).
- Backend creates a new CheckIn record.

4. Database Operation
- Data is inserted into checkins table.
- Related analytics jobs/services can later read this record to update contributions and risk status.

5. Response
- Backend returns created checkin JSON.
- UI displays submission success and updates user status/history.

Compact flow:
Student submits form -> POST /checkins/ -> Check-in backend logic -> INSERT checkins -> success response -> UI confirmation

## Part 4: AI Integration
AI Feature: AI-Assisted Team Formation + Explainability

### 1. API(s) used
- POST /matchruns/ to start matching workflow.
- GET /teams/matchrun/{match_run_id} and GET /teams/course/{course_id} to retrieve generated teams and scores.

### 2. AI Input
- Student survey/profile data from students table (skills, availability, experience, preferences).
- Course constraints from courses table (team_size).
- Optional historical engagement signals from checkins and contributions.

### 3. AI Output
- Team assignments persisted in teams.
- Team balance scores: skill_balance_score, schedule_overlap_score, experience_balance_score, overall_score.
- Explanation text saved in teams.explanation.

### 4. UI Location
- Instructor Dashboard: start match run and monitor run list.
- Teams Page: display generated teams, score bars, and team explanation text.

## Part 5: Error Handling
At least three key error cases are defined below.

### Case 1: Invalid Input
- Example: Missing required fields in student survey or check-in payload.
- Detection: Request schema validation / application validation fails.
- API Behavior: Return 400 or validation error response with specific field messages.
- UI Behavior: Highlight invalid fields and show actionable validation text.

### Case 2: Missing Data
- Example: GET /teams/course/{course_id} for a course with no generated teams yet.
- Detection: Query returns empty result set.
- API Behavior: Return 200 with empty list (or 404 where resource not found is appropriate).
- UI Behavior: Show empty-state message such as No teams found for this course yet.

### Case 3: System Error
- Example: Database unavailable while creating notification or check-in.
- Detection: Exception during commit/query.
- API Behavior: Return 500 with generic error payload and log technical detail server-side.
- UI Behavior: Show retry-friendly message and preserve user input where possible.

## Alignment Notes
This API and workflow design is consistent with:
- Functional Requirements Document
- Database Design Document
- Model UI Design & AI Integration document

## Submission Checklist
- Structured document: Completed
- Minimum 5 to 10 APIs: Completed (15 listed)
- One workflow explanation: Completed (Student Weekly Check-in Submission)
- Clear and logical design: Completed
