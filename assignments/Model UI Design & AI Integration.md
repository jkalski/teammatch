# TeamMatch: Module, UI Design & AI Integration

Project: TeamMatch

## 1. Modules & Responsibilities
- User & Identity Module: Role selection (student/instructor), local session context, access flow control -> (students, courses)
- Course Module: Create and manage courses, team size, enrollment context -> (courses)
- Student Profile Module: Capture survey data (skills, experience, availability, preferences) -> (students)
- Team Matching Module: Trigger and track match runs, generate team groupings and scores -> (matchruns, teams, students)
- Project & Milestone Module: Create projects, assign projects to teams, manage milestones -> (projects, milestones, teams)
- Check-in & Contribution Module: Weekly check-ins and derived contribution analytics -> (checkins, contributions)
- Notification Module: Student alerts and instructor nudges for progress risks -> (notifications)
- AI Module: Team optimization + explainability + contribution risk scoring -> (students, checkins, contributions, teams, matchruns)

## 2. UI Screens
- Login Page -> role selector (student/instructor), name input, email input, continue button
- Instructor Dashboard -> course list sidebar, overview cards, student list table, match run trigger, run history tab
- Student Survey Page -> personal info form, skills multi-select, availability multi-select, experience and leadership preferences, submit action
- Join Course Page -> student ID + course join flow
- Teams Page -> course/team lookup, team cards, score bars, member list, explanation panel, project/milestone details
- Projects Page -> create project, assign to team, milestone tracking
- Check-in Page -> weekly progress fields, structured status inputs, evidence URL, submit
- Notifications Page -> notification list, unread indicator, mark as read action, CTA to submit check-in
- History Page -> previous match runs and outcomes

## 3. Navigation Flow
- Instructor Flow: Login -> Dashboard -> Create/Select Course -> View Students -> Trigger Match Run -> Teams -> Projects -> History
- Student Flow: Login -> Survey -> Join Course -> Teams -> Check-in -> Notifications
- Recovery Paths:
  - Notifications -> Check-in (for missing/low contribution cases)
  - Dashboard -> Match Runs -> Teams (for run result review)

## 4. AI Feature
Feature: AI Team Matching and Contribution Insights
- Input:
  - Student profile attributes (skills, experience_level, availability, leadership_preference, role_preference)
  - Course constraints (team_size)
  - Check-in and contribution signals (hours, completion status, consistency, evidence)
- Output:
  - Suggested team assignments with balance metrics (skill, schedule, experience, overall)
  - Team-level explanation text describing assignment rationale
  - Contribution risk indicators for notifications (for example: low contribution, missing check-in)
- UI Placement:
  - Instructor Dashboard/Match Runs: run status and execution control
  - Teams Page: balance scores + explanation per team
  - Notifications Page: AI-derived alerts and intervention prompts

## 5. Mapping (UI -> API -> DB)
- Login Continue -> client-side role/session set -> students (existing identity context) / courses (instructor context)
- Create Course (Dashboard) -> POST /courses/ -> courses
- Load Courses (Dashboard) -> GET /courses/ -> courses
- Submit Student Survey -> POST /students/ -> students
- Load Students by Course -> GET /students/course/{course_id} -> students
- Trigger Match Run -> POST /matchruns/ -> matchruns
- Load Match Runs by Course -> GET /matchruns/course/{course_id} -> matchruns
- Load Teams by Course -> GET /teams/course/{course_id} -> teams
- Load Teams by Match Run -> GET /teams/matchrun/{match_run_id} -> teams
- Create Project -> POST /projects/ -> projects
- Load Projects by Course -> GET /projects/course/{course_id} -> projects + milestones
- Load Projects by Team -> GET /projects/team/{team_id} -> projects + milestones
- Assign Project to Team -> PATCH /projects/{project_id}/assign -> projects
- Create Milestone -> POST /projects/{project_id}/milestones -> milestones
- Update Milestone -> PATCH /projects/milestones/{milestone_id} -> milestones
- Submit Check-in -> POST /checkins/ -> checkins
- Load Check-ins by Student -> GET /checkins/student/{student_id} -> checkins
- Load Check-ins by Team -> GET /checkins/team/{team_id} -> checkins
- Load Contributions by Student -> GET /contributions/student/{student_id} -> contributions
- Load Contributions by Team -> GET /contributions/team/{team_id} -> contributions
- Load Contributions by Course -> GET /contributions/course/{course_id} -> contributions
- Create Notification -> POST /notifications/ -> notifications
- Load Student Notifications -> GET /notifications/student/{student_id} -> notifications
- Mark Notification Read -> PATCH /notifications/{notification_id}/read -> notifications

## 6. Existing System Comparison
Example: Manual Team Formation + Spreadsheet Tracking (common classroom baseline)
- Current:
  - Instructor manually groups students with limited visibility into skill balance.
  - Progress tracking is scattered across messages/forms and not centralized.
  - Intervention on low participation is reactive and delayed.
- Limitation:
  - No algorithmic balancing for skills/availability.
  - No structured, persistent linkage between team assignment and weekly contribution evidence.
  - Weak explainability for why teams were formed.
- Our System (TeamMatch):
  - AI-assisted team generation with measurable balance scores.
  - Explainability output attached to each generated team.
  - Integrated workflow across survey, matching, project milestones, check-ins, and notifications.
  - Better UI continuity for both instructor and student paths.
