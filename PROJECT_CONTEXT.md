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

## Core Features

1. Unified scheduling and calendar
2. Scheduling conflict detection and coach availability dashboard
3. Swimming performance tracking and analytics
4. Athlete and team goal tracking
5. Optional practice tracking

## MVP Priority

The first prototype should focus on:

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

The GitHub repository and local development workspace have been created.

Current repository structure includes:

- frontend/
- backend/
- docs/
  - architecture/
  - requirements/
- PROJECT_CONTEXT.md
- README.md

The React/Vite frontend is initialized and running locally.

The Python/FastAPI backend is initialized inside a project virtual
environment and running locally with Uvicorn.

The backend currently includes a health-check endpoint:

GET /api/health

which returns:

{"status":"ok"}

The React frontend successfully communicates with the FastAPI backend
and displays a connected status.

No database, authentication, external integrations, or real
student-athlete data have been implemented yet.


## Development Guardrails

When assisting with this project:

- Read this file before making significant changes.
- Do not attempt to build the full application at once.
- Prefer small, understandable, testable changes.
- Explain important files and implementation decisions.
- Do not add unnecessary libraries or dependencies.
- Do not use real student-athlete data during prototype development.
- Use sample/mock data until explicitly told otherwise.
- Do not implement external integrations unless explicitly requested.
- Do not implement authentication or complex permissions yet unless explicitly requested.
- Preserve the existing repository structure unless there is a strong reason to change it.
- Prioritize functionality and clarity over visual polish during the first semester.


## Prototype v1 - Current Development Step
### Step 1C - Transition Time and Full-Week Scheduling

Practice-window ranking is now implemented end-to-end.

The system currently supports:

- checking one proposed practice time for conflicts
- ranking multiple candidate practice windows
- displaying conflicting swimmer names
- displaying results in the React frontend

Current task:

Add configurable transition time between a swimmer's scheduled
commitment and practice.

The user should be able to select:

- 0 minutes
- 5 minutes
- 10 minutes
- 15 minutes
- 30 minutes

The transition time should apply in both directions:

- after a class/commitment before practice begins
- after practice before a class/commitment begins

If the available gap is exactly equal to the selected transition
time, it should be allowed and should NOT count as a conflict.

A transition time of 0 minutes must preserve the current conflict
behavior.

The single-time conflict checker and practice-window ranking should
both use the selected transition time.

Scheduling should support all seven weekdays:

- Monday
- Tuesday
- Wednesday
- Thursday
- Friday
- Saturday
- Sunday

Current mock class data does not yet contain realistic information for
all seven days. The system should still support all seven days so that
future class schedules, team events, meets, travel, appointments, and
other commitments can use the same scheduling model.

Do not expand the roster to a full mock team during this step.

A larger mock roster with approximately 20-25 swimmers and Monday-Friday
class schedules will be added during the dashboard/calendar development
stage.

Do not add a database, authentication, external integrations, or real
student-athlete data during this step.