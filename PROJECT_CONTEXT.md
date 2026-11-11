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

The head coach has reviewed both the project direction and current working prototype and responded positively to the implemented scheduling and performance features. Additional client feedback emphasized interest in expanded performance progression analytics, including year-to-year comparisons, as well as future athlete goal tracking and optional practice-time/result logging.

## Main Problem
UE Swimming & Diving currently handles class schedules, team
schedules, meet results, and other team information across multiple
systems.

Because UE does not have one protected athletics practice period,
coaches manually compare swimmers' class schedules when determining
practice times.

## Planned Overall Feature Scope

1. Unified scheduling and calendar
2. Scheduling conflict detection and coach availability/recommendation tools
3. Swimming performance tracking and analytics, including multi-season progression and year-to-year comparison
4. Athlete and team goal tracking
5. Optional practice logging and practice-performance progression

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

Coach and Swimmer prototype views, 20 fictional swimmers, full-week scheduling support, transition-aware conflict checking, dynamically generated practice-time recommendations, weekly calendar, performance histories, swimmer-specific progression graphs, roster browsing, and visual polish are implemented.

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
- Personal best, most recent time, improvement in seconds/percentage, and chronological results history; lower swimming times are better.
- Responsive swimmer/event progression graphs built from the existing fictional performance data. Results are plotted chronologically, faster times appear higher, the personal-best result is identified, longer events retain minutes:seconds.hundredths formatting, and a textual progression list remains available beneath the graph.
- Coach mode can graph any fictional swimmer's tracked events, while Swimmer mode remains restricted to the fictional identity selected on the landing screen.
- Responsive purple-and-neutral prototype styling with explicit status labels.
- Reusable hour/minute/AM-PM controls in Coach Scheduling, including required
  placeholders and five-minute choices. API times remain 24-hour HH:MM strings.
- Backend unittest coverage for conflict logic, transitions, ranking, and APIs;
  frontend production build checking through npm run build.
- Performance progression graphs display chronological fictional meet results
  for a selected event. Graph points are keyboard/mouse/touch interactive and
  display meet, date, time, PB status, result-to-result change, and distance
  from personal best.

All athlete-related information remains fictional/mock data. Calendar team
events are display data and are not automatically included in the scheduling
API requests. Scheduling does not support overnight intervals or cross-day
transition checks. Calendar data is an undated sample week, not a live calendar.
The Swimmer dashboard labels the first event in that mock week accordingly.
Performance calculations use local mock data; there is no SwimCloud connection.

Recent client feedback supports expanding the performance side of the platform. Planned performance work includes richer interactive progression information and year-to-year or season-to-season comparisons. The client also expressed interest in future goal tracking and optional practice-result logging so athletes and coaches could review progression from practice data separately from official meet performance. These are planned features and are not currently implemented.



## Completed Milestones and Current Roadmap

Steps through 9C-1 are complete: setup, conflict checking, transition-aware
scheduling, role views, roster expansion, Coach organization, weekly calendar,
performance tracking, Swimmer dashboard and identity selection, varied SCY
event profiles, visual polish, scheduling time-control polish, dynamic
practice-time recommendations, interactive performance progression graphs, and
multi-season fictional performance history.

Step 8 is complete:

- Step 8A: backend candidate-window generation and recommendation logic
- Step 8B: FastAPI recommendation endpoint
- Step 8C: Coach "Find Best Practice Times" interface

The recommendation workflow allows the Coach to choose the weekday, earliest allowable practice start, latest allowable practice end, practice duration, and transition requirement. Candidate practices are generated every 15 minutes within those limits and ranked using the existing conflict-detection logic.

Step 9 is focused on expanding performance progression and analytics:

- Step 9A - Complete: responsive swimmer/event progression graph using existing
  fictional meet results.
- Step 9B - Complete: interactive graph points with mouse, keyboard, and touch
  details including meet/date, time, PB status, result-to-result change, and
  distance from personal best.
- Step 9C-1 - Complete: multi-season fictional performance history. All 20
  fictional swimmers now have results across the 2025-26 and 2026-27 seasons
  while preserving their existing event specialties.
- Step 9C-2 - Next: season filtering and progression-graph cleanup so users can
  view one season at a time without crowded date labels while retaining access
  to complete historical results.
- Step 9C-3 - Planned: year-to-year/season-to-season visual comparison.
- Step 9D - Planned: additional useful performance filtering and customization
  based on client feedback.

Current planned development order:

1. Step 9C-2 - Season filtering and progression graph cleanup
2. Step 9C-3 - Year-to-year / season-to-season comparison
3. Step 9D - Additional performance filtering and customization
4. Step 10 - Relational database and persistence
5. Step 10C/10D - Coach roster management and active/historical swimmer status
6. Step 11 - Athlete/team goals and optional practice logging/progression
7. Step 12 - Authentication, deployment, and application packaging
8. Step 13 - Client feedback and usability testing

Future roster management should preserve historical athlete information rather
than permanently removing useful performance history. Swimmers should eventually
have an active/historical status. Only active swimmers should participate in
current scheduling conflict and practice recommendation calculations, while
historical swimmers may remain available for appropriate performance/history
views.

Client feedback from the head coach specifically supports expanding performance
progression tools, including year-to-year performance comparison, and eventually
allowing athletes to record practice information and track practice progression.
These are planned directions and should continue to be implemented incrementally.