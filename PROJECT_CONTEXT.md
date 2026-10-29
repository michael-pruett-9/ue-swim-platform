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
- Ranking of predefined candidate practice windows by conflicting-swimmer count,
  preserving original order for ties and reusing the conflict checker.
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

Steps through 7C are complete: setup, conflict checking, ranking, transition
time, role views, roster expansion, Coach organization, calendar, performance,
Swimmer dashboard and identity selection, varied SCY event profiles, visual
polish, and scheduling time-control polish.

Current planned development order:

1. Step 8 - Dynamic practice-time recommendation
2. Step 9 - Performance progression graph
3. Step 10 - Relational database and persistence
4. Step 11 - Client feedback and usability testing

Later directions include authentication and real role permissions, athlete/team
goals, optional practice tracking, approved imports if feasible, deployment,
and continued UI refinement.

These later directions are not currently implemented features.


## Step 8 - Dynamic Practice-Time Recommendation Specification

The existing predefined practice-window ranking is useful for the prototype,
but the next scheduling improvement is to generate realistic candidate practice
times dynamically.

The existing manual "Check a Practice Time" workflow must remain available.

Dynamic recommendation rules:

- Candidate practice start times use 15-minute boundaries only:
  :00, :15, :30, and :45.
- The Coach chooses the weekday.
- The Coach chooses the practice duration.
- Allowed practice durations are:
  30, 45, 60, 75, 90, 105, and 120 minutes.
- The Coach chooses an earliest allowable start time.
- The Coach chooses a latest allowable end time.
- The existing required transition-time setting remains part of the calculation.
- Suggested practices must start at or after the earliest allowable start.
- Suggested practices must end at or before the latest allowable end.
- Overnight practice intervals are not supported.
- Candidate windows are generated chronologically in 15-minute increments.
- Existing conflict-detection logic must be reused rather than duplicated.
- Candidate windows are ranked from fewest conflicts to most conflicts.
- When multiple windows have the same conflict count, chronological order
  should be preserved.
- The eventual Coach interface should emphasize the best recommendations rather
  than overwhelming the user with every possible window.
- The intended prototype defaults are an earliest start of 5:30 AM and a latest
  end of 6:30 PM, but the Coach will eventually be able to change those values.

Step 8 will be implemented incrementally:

### Step 8A
Create and test the backend logic that generates candidate practice windows and
ranks them using the existing scheduling logic.

Do not change the API or frontend during Step 8A.

### Step 8B
Expose the dynamic recommendation logic through a FastAPI endpoint while
preserving all existing endpoints and behavior.

### Step 8C
Integrate the recommendation feature into Coach Scheduling. Replace the current
predefined ranking workflow with a "Find Best Practice Times" workflow while
keeping the existing manual "Check a Practice Time" feature.

Do not implement Steps 8B or 8C until explicitly requested.