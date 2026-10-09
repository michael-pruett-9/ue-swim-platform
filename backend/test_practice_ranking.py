"""Tests for ranking supplied practice windows; no API or database needed."""

import copy
import unittest

from practice_ranking import rank_practice_windows


class PracticeRankingTests(unittest.TestCase):
    def setUp(self):
        self.swimmers = [
            {
                "id": "mock-001", "name": "Mock Swimmer Alpha",
                "classes": [
                    {"day": "Monday", "startTime": "09:00", "endTime": "10:00"},
                    {"day": "Monday", "startTime": "10:00", "endTime": "11:00"},
                ],
            },
            {
                "id": "mock-002", "name": "Mock Swimmer Beta",
                "classes": [
                    {"day": "Monday", "startTime": "10:00", "endTime": "11:00"},
                    {"day": "Tuesday", "startTime": "14:00", "endTime": "15:00"},
                ],
            },
        ]
        self.windows = [
            {"startTime": "09:30", "endTime": "10:30"},
            {"startTime": "12:00", "endTime": "13:00"},
            {"startTime": "09:00", "endTime": "10:00"},
        ]

    def test_different_counts_sorted_lowest_first(self):
        results = rank_practice_windows(self.swimmers, "Monday", self.windows)
        self.assertEqual([r["conflict_count"] for r in results], [0, 1, 2])
        self.assertEqual(
            [(r["startTime"], r["endTime"]) for r in results],
            [("12:00", "13:00"), ("09:00", "10:00"), ("09:30", "10:30")],
        )

    def test_zero_conflict_window(self):
        results = rank_practice_windows(self.swimmers, "Monday", [self.windows[1]])
        self.assertEqual(results, [{
            "startTime": "12:00", "endTime": "13:00",
            "conflict_count": 0, "conflicting_swimmers": [],
        }])

    def test_ties_preserve_input_order_not_time_order(self):
        windows = [
            {"startTime": "10:30", "endTime": "10:45"},
            {"startTime": "12:00", "endTime": "13:00"},
            {"startTime": "10:00", "endTime": "10:15"},
        ]
        results = rank_practice_windows(self.swimmers, "Monday", windows)
        self.assertEqual([r["startTime"] for r in results], ["12:00", "10:30", "10:00"])
        self.assertEqual([r["conflict_count"] for r in results], [0, 2, 2])

    def test_conflicting_names_and_records(self):
        results = rank_practice_windows(self.swimmers, "Monday", self.windows)
        self.assertEqual([s["name"] for s in results[1]["conflicting_swimmers"]],
                         ["Mock Swimmer Alpha"])
        self.assertEqual([s["name"] for s in results[2]["conflicting_swimmers"]],
                         ["Mock Swimmer Alpha", "Mock Swimmer Beta"])
        self.assertEqual(results[2]["conflicting_swimmers"], self.swimmers)

    def test_selected_weekday(self):
        results = rank_practice_windows(self.swimmers, "Tuesday", self.windows)
        self.assertEqual([r["conflict_count"] for r in results], [0, 0, 0])

    def test_touching_boundary(self):
        results = rank_practice_windows(self.swimmers, "Monday", [
            {"startTime": "11:00", "endTime": "12:00"},
        ])
        self.assertEqual(results[0]["conflict_count"], 0)

    def test_inputs_are_unchanged(self):
        original = copy.deepcopy((self.swimmers, self.windows))
        rank_practice_windows(self.swimmers, "Monday", self.windows)
        self.assertEqual((self.swimmers, self.windows), original)

    def test_empty_candidates(self):
        self.assertEqual(rank_practice_windows(self.swimmers, "Monday", []), [])

    def test_no_swimmers(self):
        results = rank_practice_windows([], "Monday", self.windows)
        self.assertEqual([r["startTime"] for r in results], [w["startTime"] for w in self.windows])
        self.assertTrue(all(r["conflict_count"] == 0 and r["conflicting_swimmers"] == [] for r in results))

    def test_invalid_window_uses_existing_validation(self):
        with self.assertRaises(ValueError):
            rank_practice_windows(self.swimmers, "Monday", [
                {"startTime": "11:00", "endTime": "10:00"},
            ])


if __name__ == "__main__":
    unittest.main()
