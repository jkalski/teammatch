# TeamMatch Functional Requirements Document

## 1. Document Control
- **Project**: TeamMatch
- **Document Type**: Functional Requirements
- **Version**: 1.0
- **Date**: 2026-04-09
- **Status**: Draft

## 2. Purpose
This document defines the functional requirements for TeamMatch, a system that collects student profile and contribution data, forms balanced teams, tracks team progress, and issues notifications to users and instructors.

## 3. Scope
TeamMatch includes:
- A **frontend** web application for student and instructor interactions.
- A **backend API** for data management and orchestration.
- A **matching agent** that computes team assignments.
- Supporting infrastructure for persistence, queueing, and notification workflows.

Out of scope:
- Non-academic use cases unrelated to class projects.
- Manual grading logic not tied to team matching or contribution tracking.

## 4. User Roles
- **Student**: Provides profile/survey/check-in data, views teams and notifications.
- **Instructor**: Creates courses/projects, initiates matching runs, reviews outcomes.
- **System Administrator** (optional operational role): Manages deployment configuration and operational access.

## 5. Assumptions and Dependencies
- Users are authenticated before accessing protected features.
- Course and project metadata exist before team matching runs.
- Matching logic depends on available student profiles, skills, and constraints.
- Notification delivery depends on configured messaging services.

## 6. Functional Requirements

### FR-01 Authentication and Session Management
1. The system shall provide login functionality for users.
2. The system shall restrict protected pages and APIs to authenticated users.
3. The system shall map authenticated users to an authorized role (Student or Instructor).
4. The system shall terminate sessions on logout and revoke client-side access tokens.

### FR-02 Course Management
1. The system shall allow instructors to create, read, update, and archive course records.
2. The system shall allow instructors to view enrolled students per course.
3. The system shall prevent duplicate course identifiers within the same term.

### FR-03 Student Profile Management
1. The system shall allow students to create and update personal profile data relevant to teaming.
2. The system shall store structured skill information and preferences.
3. The system shall allow instructors to view student profile completeness at course level.

### FR-04 Project and Milestone Management
1. The system shall allow instructors to create projects associated with a course.
2. The system shall support project milestones/check-in windows.
3. The system shall allow updates to project metadata prior to locking a matching run.

### FR-05 Survey and Preference Collection
1. The system shall present a survey form to students for skill, availability, and preference input.
2. The system shall validate required survey fields before submission.
3. The system shall store each student’s latest submitted survey response.
4. The system shall keep historical responses for auditability when responses are updated.

### FR-06 Contribution and Check-in Tracking
1. The system shall allow students to submit periodic check-ins.
2. The system shall allow recording of contribution indicators per student and milestone.
3. The system shall support structured check-in fields and free-text comments.
4. The system shall allow instructors to view contribution trends at team and student levels.

### FR-07 Team Matching Execution
1. The system shall allow an instructor to trigger a matching run for a selected project/course.
2. The system shall validate preconditions before running (minimum student count, available data, team size constraints).
3. The system shall execute a scoring and weighting pipeline to generate candidate team assignments.
4. The system shall persist each match run with metadata, inputs snapshot reference, and output team assignments.
5. The system shall expose run status values (e.g., pending, running, completed, failed).

### FR-08 Matching Constraints and Balancing
1. The system shall support configurable target team size.
2. The system shall attempt to maximize skill complementarity across teams.
3. The system shall attempt to avoid highly imbalanced experience distributions.
4. The system shall support exclusion constraints (e.g., do-not-pair conditions) when configured.
5. The system shall produce deterministic results when the same input and seed/configuration are used.

### FR-09 Explainability and Results Review
1. The system shall generate a rationale summary for each team assignment.
2. The system shall provide instructor-facing views of team composition and relevant scoring factors.
3. The system shall allow instructors to compare current run results with prior runs.

### FR-10 Team and Assignment Management
1. The system shall store team entities linked to course, project, and run identifiers.
2. The system shall allow instructors to finalize a generated team set.
3. The system shall allow controlled re-run of matching and preserve prior run history.

### FR-11 Notification Management
1. The system shall notify students when teams are published.
2. The system shall notify instructors upon matching run completion or failure.
3. The system shall provide a notifications list view for users.
4. The system shall record notification status (queued, sent, failed).

### FR-12 Run History and Auditability
1. The system shall provide a history page listing prior match runs.
2. The system shall retain timestamped records of runs, inputs references, and outputs.
3. The system shall provide traceable identifiers for troubleshooting and audit.

### FR-13 Data Access APIs
1. The backend shall expose REST endpoints for courses, students, projects, teams, match runs, contributions, check-ins, and notifications.
2. API endpoints shall validate request schema and return structured error messages on invalid input.
3. API endpoints shall enforce role-based authorization by resource type.

### FR-14 Error Handling and User Feedback
1. The system shall present actionable error messages for failed submissions and failed match runs.
2. The system shall allow retry of failed matching runs where preconditions are met.
3. The system shall surface progress indicators for asynchronous run processing.

### FR-15 Reporting Views
1. The system shall provide dashboard views for instructors to monitor project/team status.
2. The system shall provide student views for team assignment, notifications, and check-in tasks.

## 7. Functional Non-Goals
- The system does not automatically grade student work.
- The system does not replace instructor judgment for final team approval.

## 8. Acceptance Criteria Summary
- Users can authenticate and access role-appropriate pages.
- Instructors can manage courses/projects and initiate matching runs.
- Students can submit surveys and check-ins.
- Matching runs generate persisted teams and status updates.
- Notifications are generated and visible to intended recipients.
- Historical run data is accessible for review and audit.

## 9. Traceability Matrix (High-Level)
| Requirement Group | Primary Components |
|---|---|
| Authentication | Frontend login pages, auth library, backend security |
| Data Management | Backend routes/models/schemas for domain entities |
| Matching | Agent scoring, weighting, matching, explainability modules |
| Notifications | Notification engine and backend notification routes |
| Audit/History | Match run storage, history view, run logger |

## 10. Future Enhancements (Informational)
- Instructor-defined weighting presets per project type.
- What-if simulation before publishing teams.
- Exportable run reports for external review.
