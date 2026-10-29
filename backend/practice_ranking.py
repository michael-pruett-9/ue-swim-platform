"""Rank supplied practice windows using the existing conflict checker."""

from conflict_detection import _interval, find_conflicts, validate_transition_minutes


def rank_practice_windows(swimmers, day, candidate_windows, transition_minutes=0):
    """Return windows ordered by conflict count, preserving input order for ties.

    Swimmers use the same structure as find_conflicts. Each candidate is a
    dictionary with startTime and endTime in 24-hour HH:MM format. Results
    contain those times, conflict_count, and full conflicting_swimmers records
    (including names). Inputs are not modified. An empty candidate list returns
    an empty list. Validation of each window is delegated to find_conflicts;
    its ValueError propagates if the day or an examined interval is invalid.
    transition_minutes defaults to zero and is passed to the shared checker.
    """
    validate_transition_minutes(transition_minutes)
    swimmers = list(swimmers)
    results = []
    for window in candidate_windows:
        conflicts = find_conflicts(
            swimmers, day, window["startTime"], window["endTime"], transition_minutes
        )
        results.append({
            "startTime": window["startTime"],
            "endTime": window["endTime"],
            "conflict_count": conflicts["conflict_count"],
            "conflicting_swimmers": conflicts["conflicting_swimmers"],
        })

    # Python's stable sort keeps the original order of equally ranked windows.
    return sorted(results, key=lambda result: result["conflict_count"])


def recommend_practice_windows(
    swimmers, day, earliest_start, latest_end, duration_minutes, transition_minutes=0
):
    """Generate and rank all same-day quarter-hour practice candidates.

    Bounds must be HH:MM on 15-minute boundaries. Duration must be an integer
    in (30, 45, 60, 75, 90, 105, 120) and fit within the bounds. Invalid inputs
    raise ValueError. Weekday and schedule validation are delegated to the
    existing ranking/conflict checker, as are transition rules. Inputs are not
    mutated. All results are returned; ties retain chronological start order.
    """
    validate_transition_minutes(transition_minutes)
    start, end = _interval(earliest_start, latest_end)
    if start % 15 or end % 15:
        raise ValueError("Earliest start and latest end must be on 15-minute boundaries.")
    if type(duration_minutes) is not int or duration_minutes not in (30, 45, 60, 75, 90, 105, 120):
        raise ValueError("Duration minutes must be an integer: 30, 45, 60, 75, 90, 105, or 120.")
    if duration_minutes > end - start:
        raise ValueError("Practice duration must fit between earliest start and latest end.")

    candidates = []
    for candidate_start in range(start, end - duration_minutes + 1, 15):
        candidate_end = candidate_start + duration_minutes
        candidates.append({
            "startTime": f"{candidate_start // 60:02d}:{candidate_start % 60:02d}",
            "endTime": f"{candidate_end // 60:02d}:{candidate_end % 60:02d}",
        })

    # A valid range always produces at least one candidate, so the existing
    # checker validates the weekday even when the swimmer collection is empty.
    return rank_practice_windows(swimmers, day, candidates, transition_minutes)
