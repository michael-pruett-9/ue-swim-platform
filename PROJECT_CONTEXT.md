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
### Step 7B - Prototype Visual Polish

The core prototype functionality is now implemented.

Current prototype functionality includes:

- Coach and Swimmer prototype roles
- 20 fictional swimmers
- weekly class schedules
- conflict detection
- configurable transition time
- ranked practice windows
- Coach dashboard
- roster browsing
- weekly team calendar
- Coach performance browsing
- Swimmer dashboard
- Swimmer calendar
- Swimmer performance
- realistic fictional swimming event specialties and results

The next step is a coordinated visual polish pass.

The prototype should begin to look like a believable University of
Evansville Swimming & Diving web platform while remaining clearly
identified as a prototype using fictional data.

Visual goals:

- clean and modern layout
- consistent spacing
- strong page hierarchy
- readable typography
- consistent cards, forms, buttons, and tables
- University of Evansville-inspired purple accents
- clear active navigation
- clearer Coach and Swimmer identity
- clearer success, warning, conflict, and status information
- responsive behavior for reasonable laptop/tablet widths

Use plain CSS and the existing React structure.

Do not add a UI framework or new dependency.

Do not redesign or change the underlying functionality.

Do not use the official UE logo unless an approved asset is later
provided.

Prioritize usability and professionalism over decorative effects.

The application should still clearly state that prototype data is
fictional/mock data.