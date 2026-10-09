"""Rank supplied practice windows using the existing conflict checker."""

from conflict_detection import find_conflicts


def rank_practice_windows(swimmers, day, candidate_windows):
    """Return windows ordered by conflict count, preserving input order for ties.

    Swimmers use the same structure as find_conflicts. Each candidate is a
    dictionary with startTime and endTime in 24-hour HH:MM format. Results
    contain those times, conflict_count, and full conflicting_swimmers records
    (including names). Inputs are not modified. An empty candidate list returns
    an empty list. Validation of each window is delegated to find_conflicts;
    its ValueError propagates if the day or an examined interval is invalid.
    """
    swimmers = list(swimmers)
    results = []
    for window in candidate_windows:
        conflicts = find_conflicts(swimmers, day, window["startTime"], window["endTime"])
        results.append({
            "startTime": window["startTime"],
            "endTime": window["endTime"],
            "conflict_count": conflicts["conflict_count"],
            "conflicting_swimmers": conflicts["conflicting_swimmers"],
        })

    # Python's stable sort keeps the original order of equally ranked windows.
    return sorted(results, key=lambda result: result["conflict_count"])
