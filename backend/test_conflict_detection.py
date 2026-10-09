"""Run from the repository root with unittest discovery in backend/."""

import copy
import unittest

from conflict_detection import find_conflicts


def mock_class(start="10:00", end="11:00", day="Monday"):
    return {"day": day, "startTime": start, "endTime": end}


def mock_swimmer(swimmer_id="mock-001", classes=None):
    return {
        "id": swimmer_id,
        "name": f"Mock Swimmer {swimmer_id}",
        "classes": [mock_class()] if classes is None else classes,
    }


class ConflictDetectionTests(unittest.TestCase):
    def setUp(self):
        self.swimmer = mock_swimmer()

    def assert_conflict(self, start, end, expected):
        result = find_conflicts([self.swimmer], "Monday", start, end)
        self.assertEqual(result["conflicting_swimmers"], [self.swimmer] if expected else [])
        self.assertEqual(result["conflict_count"], int(expected))

    def test_no_conflict(self):
        self.assert_conflict("08:00", "09:00", False)
        self.assert_conflict("12:00", "13:00", False)

    def test_partial_overlap(self):
        self.assert_conflict("09:30", "10:30", True)
        self.assert_conflict("10:30", "11:30", True)

    def test_practice_contains_class(self):
        self.assert_conflict("09:00", "12:00", True)

    def test_class_contains_practice(self):
        self.assert_conflict("10:15", "10:45", True)

    def test_identical_intervals(self):
        self.assert_conflict("10:00", "11:00", True)

    def test_touching_boundaries_do_not_conflict(self):
        self.assert_conflict("09:00", "10:00", False)
        self.assert_conflict("11:00", "12:00", False)

    def test_different_day(self):
        result = find_conflicts([self.swimmer], "Tuesday", "10:00", "11:00")
        self.assertEqual(result, {"conflicting_swimmers": [], "conflict_count": 0})

    def test_multiple_swimmers_and_multiple_conflicting_classes(self):
        swimmers = [
            self.swimmer,
            mock_swimmer("mock-002", [mock_class("12:00", "13:00")]),
            mock_swimmer("mock-003", [mock_class("09:00", "10:30"), mock_class("10:30", "12:00")]),
            mock_swimmer("mock-004", [mock_class(day="Tuesday")]),
            mock_swimmer("mock-005", []),
        ]
        original = copy.deepcopy(swimmers)
        result = find_conflicts(swimmers, "Monday", "10:00", "11:00")
        self.assertEqual(result["conflicting_swimmers"], [swimmers[0], swimmers[2]])
        self.assertEqual(result["conflict_count"], 2)
        self.assertEqual(swimmers, original)

    def test_empty_collection(self):
        self.assertEqual(find_conflicts([], "Monday", "10:00", "11:00"),
                         {"conflicting_swimmers": [], "conflict_count": 0})

    def test_optional_class_label(self):
        self.swimmer["classes"][0]["label"] = "Sample Class"
        self.assert_conflict("10:00", "11:00", True)

    def test_invalid_practice_times(self):
        for start, end in [("9:00", "11:00"), ("24:00", "25:00"),
                           ("10:60", "11:00"), ("10:00", "10:00"),
                           ("11:00", "10:00")]:
            with self.subTest(start=start, end=end), self.assertRaises(ValueError):
                find_conflicts([], "Monday", start, end)

    def test_invalid_class_interval(self):
        swimmer = mock_swimmer(classes=[mock_class("11:00", "10:00")])
        with self.assertRaises(ValueError):
            find_conflicts([swimmer], "Monday", "10:00", "11:00")

    def test_zero_transition_matches_default(self):
        for start, end in [("09:00", "10:00"), ("11:00", "12:00"), ("10:30", "11:30")]:
            with self.subTest(start=start):
                self.assertEqual(
                    find_conflicts([self.swimmer], "Monday", start, end, 0),
                    find_conflicts([self.swimmer], "Monday", start, end),
                )

    def test_transition_after_class(self):
        for minutes in [5, 10, 15, 30]:
            for gap in [0, minutes - 1, minutes, minutes + 1]:
                with self.subTest(minutes=minutes, gap=gap):
                    result = find_conflicts([self.swimmer], "Monday", f"11:{gap:02d}", "12:00", minutes)
                    self.assertEqual(result["conflict_count"], int(gap < minutes))

    def test_transition_before_class(self):
        for minutes in [5, 10, 15, 30]:
            for gap in [0, minutes - 1, minutes, minutes + 1]:
                end = "10:00" if gap == 0 else f"09:{60 - gap:02d}"
                with self.subTest(minutes=minutes, gap=gap):
                    result = find_conflicts([self.swimmer], "Monday", "08:00", end, minutes)
                    self.assertEqual(result["conflict_count"], int(gap < minutes))

    def test_all_weekdays_with_transition(self):
        for day in ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]:
            with self.subTest(day=day):
                swimmer = mock_swimmer(classes=[mock_class(day=day)])
                self.assertEqual(find_conflicts([swimmer], day, "11:05", "12:00", 10)["conflict_count"], 1)

    def test_invalid_transition(self):
        for value in [-1, 1.5, True, "5", None]:
            with self.subTest(value=value), self.assertRaises(ValueError):
                find_conflicts([], "Monday", "10:00", "11:00", value)

    def test_invalid_weekday(self):
        with self.assertRaises(ValueError):
            find_conflicts([], "Mon", "10:00", "11:00")


if __name__ == "__main__":
    unittest.main()
