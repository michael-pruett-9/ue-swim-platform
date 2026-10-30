# Project Context

## Project
UE Swimming & Diving Scheduling and Performance Platform

## Purpose
This is a two-semester senior Computer Science project for the
University of Evansville Swimming & Diving team.

The platform is intended to combine scheduling and swimming
performance information that is currently spread across multiple
systems.

## Client and Users
Primary client:
- University of Evansville Swimming & Diving coaching staff
- Head coach is the main client

Users:
- Coaches
- Swimmers

The head coach has reviewed the project direction and supports
the current feature set.

## Main Problem
UE Swimming & Diving currently handles class schedules, team
schedules, meet results, and other team information across multiple
systems.

Because UE does not have one protected athletics practice period,
coaches manually compare swimmers' class schedules when determining
practice times.

## Planned Overall Feature Scope

1. Unified scheduling and calendar
2. Scheduling conflict detection and coach availability dashboard
3. Swimming performance tracking and analytics
4. Athlete and team goal tracking
5. Optional practice tracking

## MVP Priority

The initial prototype priorities were (now implemented with fictional data):

1. displaying sample swimmer schedules
2. detecting schedule conflicts
3. identifying/ranking low-conflict practice windows

Do NOT attempt to build all features immediately.

## Planned Technology

Frontend:
- React

Backend:
- Python

Database:
- Relational database
- SQLite may be used initially for local development

Potential external data:
- SwimCloud
- ARMS
- CSV/file imports

External integrations must NOT be required for the application
to function.

## Responsible Computing

Important concerns:
- privacy of athlete schedules
- security
- coach vs swimmer permissions
- appropriate handling of performance data

Do not use real private student-athlete data during early development.
Use mock/sample data.

## Current Development Philosophy

This semester:
- functionality first
- core architecture
- working prototype
- sample data
- conflict detection workflow

Later:
- UI polish
- additional features
- real data if appropriate/allowed
- external integrations if feasible
- deployment/testing
## Current Project State

A working local Prototype v1 is implemented as of October 2026. React/Vite
communicates with Python/FastAPI through the Vite development proxy. The
backend runs in backend/.venv with Uvicorn.

Current endpoints:
- GET /api/health
- POST /api/conflicts
- POST /api/rank-practice-windows
- POST /api/recommend-practice-windows

Coach and Swimmer prototype views, 20 fictional swimmers, full-week scheduling
support, transition-aware conflict checking and ranking, weekly calendar,
performance histories, roster browsing, and visual polish are implemented.
See Working Prototype v1 below and README.md for the current feature inventory
and exact startup/test commands.

No database, authentication, external integrations, real athlete data, or
production deployment setup is implemented. The role selector is a local UI
demonstration, not an access-control boundary.

## Development Guardrails

When assisting with this project:

- Read this file before making significant changes.
- Do not attempt to build the full application at once.
- Prefer small, understandable, testable changes.
- Preserve existing working features and API behavior unless explicitly asked to change them.
- Run relevant backend tests and frontend build/checks after code changes; report results and limitations.
- Explain important files and implementation decisions.
- Do not add unnecessary libraries or dependencies.
- Do not use real student-athlete data during prototype development.
- Use sample/mock data until explicitly told otherwise.
- Do not implement external integrations unless explicitly requested.
- Do not implement authentication or complex permissions yet unless explicitly requested.
- Preserve the existing repository structure unless there is a strong reason to change it.
- Prioritize functionality and clarity over visual polish during the first semester.


## Working Prototype v1 - October 2026

Implemented functionality:

- React/Vite frontend and Python/FastAPI backend with a working /api connection.
- Coach and Swimmer prototype roles, Switch Role, and fictional swimmer identity
  selection on the landing screen. Navigation uses React state, not routing.
- Exactly 20 fictional swimmers with Monday-Friday class schedules.
- Monday-Sunday scheduling support, single-practice conflict detection, and
  configurable transition time (UI options: 0, 5, 10, 15, 30 minutes).
- Required gaps apply before and after practice on the selected day. Exact gaps
  are allowed; zero transition retains the original overlap rules.
- Dynamic practice-time recommendation generation. The Coach selects a weekday,
  earliest allowable start, latest allowable end, practice duration, and required
  transition time. The backend generates every valid candidate start time in
  15-minute increments and ranks the resulting practice windows by conflicting-
  swimmer count.
- Supported practice durations are 30, 45, 60, 75, 90, 105, and 120 minutes.
  Recommendation ties preserve chronological order and reuse the existing
  conflict-detection logic rather than duplicating scheduling calculations.
- Coach Scheduling emphasizes the five best recommendations by default, identifies
  the first result as the Best Option, reports the total number of generated
  windows, lists conflicting swimmers, and allows the Coach to expand the table
  to view all recommendations.
- Coach Dashboard, Scheduling, Calendar, Performance, and Roster sections.
- Coach roster selection with one swimmer's class schedule displayed at a time.
- Weekly Coach calendar with fictional practices, a meet, team travel, and an
  optional selected-swimmer class overlay from the existing schedule dataset.
- Swimmer Dashboard, Calendar, and Performance restricted in the UI to the
  fictional identity selected before entering Swimmer mode.
- Fictional SCY specialties spanning freestyle, backstroke, breaststroke,
  butterfly, and IM. Each swimmer has 3-5 tracked events with three chronological
  fictional meet results per event, stored as numeric seconds.
- Personal best, most recent time, improvement in seconds/percentage, results
  history, and simple progression lists; lower swimming times are better.
- Responsive purple-and-neutral prototype styling with explicit status labels.
- Reusable hour/minute/AM-PM controls in Coach Scheduling, including required
  placeholders and five-minute choices. API times remain 24-hour HH:MM strings.
- Backend unittest coverage for conflict logic, transitions, ranking, and APIs;
  frontend production build checking through npm run build.

All athlete-related information remains fictional/mock data. Calendar team
events are display data and are not automatically included in the scheduling
API requests. Scheduling does not support overnight intervals or cross-day
transition checks. Calendar data is an undated sample week, not a live calendar.
The Swimmer dashboard labels the first event in that mock week accordingly.
Performance calculations use local mock data; there is no SwimCloud connection.

## Completed Milestones and Current Roadmap

Steps through 8C are complete: setup, conflict checking, transition-aware
scheduling, role views, roster expansion, Coach organization, weekly calendar,
performance tracking, Swimmer dashboard and identity selection, varied SCY
event profiles, visual polish, scheduling time-control polish, and dynamic
practice-time recommendations.

Step 8 is complete:

- Step 8A: backend candidate-window generation and recommendation logic
- Step 8B: FastAPI recommendation endpoint
- Step 8C: Coach "Find Best Practice Times" interface

The recommendation workflow now allows the Coach to choose the weekday,
earliest allowable practice start, latest allowable practice end, practice
duration, and transition requirement. Candidate practices are generated every
15 minutes within those limits and ranked using the existing conflict-detection
logic.

Current planned development order:

1. Step 9 - Performance progression graph
2. Step 10 - Relational database and persistence
3. Step 11 - Client feedback and usability testing

Later directions include authentication and real role permissions, athlete/team
goals, optional practice tracking, approved imports if feasible, deployment,
mobile-friendly improvements, and continued UI refinement.

These later directions are not currently implemented features.