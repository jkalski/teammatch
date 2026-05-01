# TeamMatch Database Design Document

## 1. Document Control
- Project: TeamMatch
- Document Type: Database Design
- Version: 1.0
- Date: 2026-04-09
- Status: Draft

## 2. Purpose
This document defines the logical relational database design for TeamMatch based on the current backend SQLAlchemy models.

## 3. Database Technology and Conventions
- ORM: SQLAlchemy
- Intended RDBMS: PostgreSQL
- Primary key strategy: UUID strings (`id` fields)
- Timestamp convention: timezone-aware `DateTime`
- Naming convention: snake_case table and column names

## 4. Entity Overview
Core entities:
- courses
- students
- projects
- milestones
- teams
- matchruns
- checkins
- contributions
- notifications

## 5. Table Specifications

### 5.1 courses
Purpose: Represents a course section with team configuration.

Columns:
- id (PK, string, not null)
- name (string, not null)
- instructor_id (string, not null)
- team_size (integer, not null, default 4)
- team_code (string, unique, not null)
- created_at (datetime with timezone, server default now)
- updated_at (datetime with timezone, nullable)

Constraints:
- Primary Key: id
- Unique: team_code

### 5.2 students
Purpose: Stores student identity and survey/profile data.

Columns:
- id (PK, string, not null)
- email (string, unique, not null)
- name (string, not null)
- course_id (FK -> courses.id, not null)
- team_id (FK -> teams.id, nullable)
- skills (array<string>, nullable)
- experience_level (string, nullable)
- availability (array<string>, nullable)
- leadership_preference (string, nullable)
- role_preference (string, nullable)
- created_at (datetime with timezone, server default now)
- updated_at (datetime with timezone, nullable)

Constraints:
- Primary Key: id
- Foreign Keys: course_id, team_id
- Unique: email

### 5.3 projects
Purpose: Defines projects belonging to a course.

Columns:
- id (PK, string, not null)
- course_id (FK -> courses.id, not null)
- team_id (FK -> teams.id, nullable)
- name (string, not null)
- description (text, nullable)
- deadline (datetime with timezone, nullable)
- status (string, default active)
- created_at (datetime with timezone, server default now)
- updated_at (datetime with timezone, nullable)

Constraints:
- Primary Key: id
- Foreign Keys: course_id, team_id

### 5.4 milestones
Purpose: Tracks milestones under a project.

Columns:
- id (PK, string, not null)
- project_id (FK -> projects.id, not null)
- title (string, not null)
- description (text, nullable)
- due_date (datetime with timezone, nullable)
- completed (boolean, default false)
- created_at (datetime with timezone, server default now)

Constraints:
- Primary Key: id
- Foreign Key: project_id

### 5.5 teams
Purpose: Represents generated or instructor-managed teams.

Columns:
- id (PK, string, not null)
- course_id (FK -> courses.id, not null)
- match_run_id (string, nullable)
- name (string, not null)
- team_code (string, unique, not null)
- skill_balance_score (float, nullable)
- schedule_overlap_score (float, nullable)
- experience_balance_score (float, nullable)
- overall_score (float, nullable)
- explanation (string, nullable)
- created_at (datetime with timezone, server default now)
- updated_at (datetime with timezone, nullable)

Constraints:
- Primary Key: id
- Foreign Key: course_id
- Unique: team_code

Note:
- `match_run_id` currently exists without an explicit FK constraint to `matchruns.id`.

### 5.6 matchruns
Purpose: Tracks execution lifecycle and output metadata of a match run.

Columns:
- id (PK, string, not null)
- course_id (FK -> courses.id, not null)
- status (string, not null, default PENDING)
- roster_snapshot_id (string, nullable)
- constraints_snapshot (string, nullable)
- total_teams (string, nullable)
- error_reason (string, nullable)
- started_at (datetime with timezone, nullable)
- completed_at (datetime with timezone, nullable)
- created_at (datetime with timezone, server default now)

Constraints:
- Primary Key: id
- Foreign Key: course_id

Note:
- `total_teams` is modeled as a string in current schema.

### 5.7 checkins
Purpose: Stores periodic student check-in submissions.

Columns:
- id (PK, string, not null)
- student_id (FK -> students.id, not null)
- team_id (FK -> teams.id, not null)
- course_id (FK -> courses.id, not null)
- hours_worked (integer, not null)
- tasks_planned (string, nullable)
- tasks_completed (string, not null)
- what_i_worked_on (string, not null)
- next_week_plan (string, nullable)
- completion_status (string, nullable)
- contribution_type (string, nullable)
- confidence_level (integer, nullable)
- blocked_by (string, nullable)
- needs_help (boolean, default false)
- blockers (string, nullable)
- evidence_url (string, nullable)
- peer_shoutout (string, nullable)
- week_number (integer, not null)
- is_edited (boolean, default false)
- edited_at (datetime with timezone, nullable)
- created_at (datetime with timezone, server default now)

Constraints:
- Primary Key: id
- Foreign Keys: student_id, team_id, course_id

### 5.8 contributions
Purpose: Aggregated contribution metrics per student/team/course/time window.

Columns:
- id (PK, string, not null)
- student_id (FK -> students.id, not null)
- team_id (FK -> teams.id, not null)
- course_id (FK -> courses.id, not null)
- overall_score (float, not null, default 0.0)
- hours_score (float, not null, default 0.0)
- tasks_score (float, not null, default 0.0)
- evidence_score (float, not null, default 0.0)
- consistency_score (float, not null, default 0.0)
- status (string, not null, default ON_TRACK)
- week_number (integer, not null)
- checkins_submitted (integer, default 0)
- checkins_missed (integer, default 0)
- last_checkin_date (datetime with timezone, nullable)
- created_at (datetime with timezone, server default now)
- updated_at (datetime with timezone, nullable)

Constraints:
- Primary Key: id
- Foreign Keys: student_id, team_id, course_id

### 5.9 notifications
Purpose: Stores instructor/student notification records.

Columns:
- id (PK, string, not null)
- student_id (FK -> students.id, not null)
- course_id (FK -> courses.id, not null)
- instructor_id (string, not null)
- type (string, not null)
- message (string, not null)
- is_read (boolean, default false)
- is_resolved (boolean, default false)
- flag_reason (string, nullable)
- resolved_at (datetime with timezone, nullable)
- created_at (datetime with timezone, server default now)

Constraints:
- Primary Key: id
- Foreign Keys: student_id, course_id

## 6. Relationship Summary
- One course has many students.
- One course has many projects.
- One course has many teams.
- One course has many matchruns.
- One project has many milestones.
- One team has many students (via students.team_id).
- One student has many checkins.
- One student has many contributions.
- One student has many notifications.
- One team has many checkins and contributions.

## 7. Cardinality Matrix
- courses (1) -> (N) students
- courses (1) -> (N) projects
- courses (1) -> (N) teams
- courses (1) -> (N) matchruns
- projects (1) -> (N) milestones
- teams (1) -> (N) students
- students (1) -> (N) checkins
- students (1) -> (N) contributions
- students (1) -> (N) notifications

## 8. Indexing Recommendations
Existing unique indexes:
- courses.team_code
- teams.team_code
- students.email

Recommended additional indexes:
- students.course_id
- students.team_id
- projects.course_id
- milestones.project_id
- teams.course_id
- checkins.student_id
- checkins.team_id
- checkins.course_id
- checkins.week_number
- contributions.student_id
- contributions.team_id
- contributions.course_id
- contributions.week_number
- matchruns.course_id
- matchruns.status
- notifications.student_id
- notifications.course_id
- notifications.is_read

## 9. Data Integrity and Validation Rules
- Enforce valid status values in application/service layer:
  - matchruns.status: PENDING, RUNNING, COMPLETED, FAILED
  - contributions.status: ON_TRACK, WATCH, FLAG
  - notifications.type: LOW_CONTRIBUTION, MISSING_CHECKIN, INSTRUCTOR_NUDGE, REQUEST_UPDATE
- Require `week_number` for checkins and contributions.
- Require student to belong to same course as referenced team when creating checkins/contributions (application-level validation).

## 10. Potential Schema Improvements
- Add FK constraint: teams.match_run_id -> matchruns.id.
- Change matchruns.total_teams from string to integer.
- Add composite unique constraints if required by business rules:
  - checkins(student_id, week_number, course_id)
  - contributions(student_id, week_number, course_id)
- Consider enum types for status/type columns to reduce invalid values.
- Add soft-delete fields (`is_active` or `deleted_at`) if archival behavior is needed.

## 11. Migration and Versioning Notes
- Schema changes should be managed through Alembic migrations.
- Any data type corrections (for example, `total_teams`) should include safe backfill logic.

## 12. ERD (Text Representation)
- courses.id <- students.course_id
- courses.id <- projects.course_id
- courses.id <- teams.course_id
- courses.id <- matchruns.course_id
- courses.id <- checkins.course_id
- courses.id <- contributions.course_id
- courses.id <- notifications.course_id
- teams.id <- students.team_id
- teams.id <- projects.team_id
- projects.id <- milestones.project_id
- students.id <- checkins.student_id
- students.id <- contributions.student_id
- students.id <- notifications.student_id
- teams.id <- checkins.team_id
- teams.id <- contributions.team_id
