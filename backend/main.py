from typing import Annotated, Literal

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field, model_validator

from conflict_detection import find_conflicts
from practice_ranking import rank_practice_windows


Weekday = Literal["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
TimeString = Annotated[str, Field(pattern=r"^(?:[01][0-9]|2[0-3]):[0-5][0-9]$")]


class ClassSchedule(BaseModel):
    day: Weekday
    startTime: TimeString
    endTime: TimeString
    label: str | None = None

    @model_validator(mode="after")
    def check_interval(self):
        if self.startTime >= self.endTime:
            raise ValueError("Class startTime must be before endTime on the same day.")
        return self


class SwimmerSchedule(BaseModel):
    id: str
    name: str
    classes: list[ClassSchedule]


class ConflictRequest(BaseModel):
    swimmers: list[SwimmerSchedule]
    day: Weekday
    practiceStartTime: TimeString
    practiceEndTime: TimeString
    transitionMinutes: int = Field(default=0, ge=0, strict=True)

    @model_validator(mode="after")
    def check_unique_swimmers(self):
        ids = [swimmer.id for swimmer in self.swimmers]
        if len(ids) != len(set(ids)):
            raise ValueError("Swimmer ids must be unique.")
        return self

class CandidateWindow(BaseModel):
    startTime: TimeString
    endTime: TimeString


class RankingRequest(BaseModel):
    swimmers: list[SwimmerSchedule]
    day: Weekday
    candidateWindows: list[CandidateWindow]
    transitionMinutes: int = Field(default=0, ge=0, strict=True)

    @model_validator(mode="after")
    def check_unique_swimmers(self):
        ids = [swimmer.id for swimmer in self.swimmers]
        if len(ids) != len(set(ids)):
            raise ValueError("Swimmer ids must be unique.")
        return self


app = FastAPI(docs_url=None, redoc_url=None, openapi_url=None)


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.post("/api/conflicts")
def conflicts(request: ConflictRequest):
    try:
        return find_conflicts(
            [swimmer.model_dump(exclude_none=True) for swimmer in request.swimmers],
            request.day,
            request.practiceStartTime,
            request.practiceEndTime,
            request.transitionMinutes,
        )
    except ValueError as error:
        raise HTTPException(status_code=422, detail=str(error)) from error


@app.post("/api/rank-practice-windows")
def rank_windows(request: RankingRequest):
    try:
        return rank_practice_windows(
            [swimmer.model_dump(exclude_none=True) for swimmer in request.swimmers],
            request.day,
            [window.model_dump() for window in request.candidateWindows],
            request.transitionMinutes,
        )
    except ValueError as error:
        raise HTTPException(status_code=422, detail=str(error)) from error
