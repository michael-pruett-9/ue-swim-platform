"""Standalone class/practice overlap checks for the scheduling prototype."""

import re


def _minutes(time):
    """Convert a strict 24-hour HH:MM string to minutes after midnight."""
    if not isinstance(time, str) or not re.fullmatch(r"(?:[01][0-9]|2[0-3]):[0-5][0-9]", time):
        raise ValueError("Times must use 24-hour HH:MM format.")
    hours, minutes = map(int, time.split(":"))
    return hours * 60 + minutes


def _interval(start_time, end_time):
    start, end = _minutes(start_time), _minutes(end_time)
    if start >= end:
        raise ValueError("An interval must start before it ends on the same day.")
    return start, end


def find_conflicts(swimmers, day, practice_start_time, practice_end_time):
    """Return conflicting swimmer records and their count without modifying input.

    Each swimmer has unique `id`, `name`, and `classes` fields. Each class has
    `day`, `startTime`, `endTime`, and optionally `label`, matching the frontend
    mock data. Days use full English names, such as "Monday".

    Only classes on the requested day are examined. Times must be HH:MM and
    intervals must have positive duration within one day; invalid examined
    intervals raise ValueError. No buffer or overnight intervals are supported.
    Each swimmer is included once even if several classes overlap practice.
    """
    weekdays = ("Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday")
    if day not in weekdays:
        raise ValueError("Use a full weekday name, such as 'Monday'.")
    practice_start, practice_end = _interval(practice_start_time, practice_end_time)
    conflicting_swimmers = []

    for swimmer in swimmers:
        has_conflict = False
        for entry in swimmer["classes"]:
            if entry["day"] != day:
                continue
            class_start, class_end = _interval(entry["startTime"], entry["endTime"])
            if class_start < practice_end and practice_start < class_end:
                has_conflict = True
        if has_conflict:
            conflicting_swimmers.append(swimmer)

    return {
        "conflicting_swimmers": conflicting_swimmers,
        "conflict_count": len(conflicting_swimmers),
    }
