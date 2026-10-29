"""Dynamic candidate generation and integration with the existing ranker."""

import copy
import unittest

from practice_ranking import rank_practice_windows, recommend_practice_windows


class PracticeRecommendationTests(unittest.TestCase):
    def setUp(self):
        self.swimmers = [
            {"id": "mock-001", "name": "Mock Swimmer Alpha", "classes": [
                {"day": "Monday", "startTime": "09:00", "endTime": "10:00", "label": "Sample Math"},
            ]},
            {"id": "mock-002", "name": "Mock Swimmer Beta", "classes": [
                {"day": "Monday", "startTime": "09:30", "endTime": "10:30"},
            ]},
        ]

    def test_example_generation_and_complete_set(self):
        results = recommend_practice_windows([], "Monday", "13:00", "18:30", 90)
        self.assertEqual(len(results), 17)
        self.assertEqual((results[0]["startTime"], results[0]["endTime"]), ("13:00", "14:30"))
        self.assertEqual((results[-1]["startTime"], results[-1]["endTime"]), ("17:00", "18:30"))
        starts = []
        for result in results:
            hours, minutes = map(int, result["startTime"].split(":"))
            starts.append(hours * 60 + minutes)
            self.assertLessEqual(result["endTime"], "18:30")
            self.assertEqual(result["conflict_count"], 0)
        self.assertEqual(starts, list(range(780, 1021, 15)))

    def test_every_allowed_duration(self):
        for duration in (30, 45, 60, 75, 90, 105, 120):
            with self.subTest(duration=duration):
                results = recommend_practice_windows([], "Monday", "08:00", "12:00", duration)
                self.assertEqual(len(results), (240 - duration) // 15 + 1)
                for result in results:
                    start = sum(int(part) * factor for part, factor in zip(result["startTime"].split(":"), (60, 1)))
                    end = sum(int(part) * factor for part, factor in zip(result["endTime"].split(":"), (60, 1)))
                    self.assertEqual(end - start, duration)
                    self.assertLessEqual(end, 720)

    def test_exact_fit(self):
        result = recommend_practice_windows([], "Monday", "13:15", "14:00", 45)
        self.assertEqual(len(result), 1)
        self.assertEqual(result[0]["startTime"], "13:15")

    def test_same_day_edges(self):
        for start, end in [("00:00", "00:30"), ("23:15", "23:45")]:
            with self.subTest(start=start):
                result = recommend_practice_windows([], "Sunday", start, end, 30)
                self.assertEqual((result[0]["startTime"], result[0]["endTime"]), (start, end))

    def test_invalid_duration(self):
        for duration in (22, 0, -30, 135, 30.0, True, "30", None):
            with self.subTest(duration=duration), self.assertRaises(ValueError):
                recommend_practice_windows([], "Monday", "08:00", "12:00", duration)

    def test_invalid_earliest_start(self):
        for start in ("8:00", "08:05", "08:10", "08:60", "24:00", "08:00:00", None):
            with self.subTest(start=start), self.assertRaises(ValueError):
                recommend_practice_windows([], "Monday", start, "12:00", 30)

    def test_invalid_latest_end(self):
        for end in ("9:00", "12:05", "12:10", "12:60", "24:00", "12:00:00", None):
            with self.subTest(end=end), self.assertRaises(ValueError):
                recommend_practice_windows([], "Monday", "08:00", end, 30)

    def test_equal_reversed_and_overnight_bounds(self):
        for start, end in [("09:00", "09:00"), ("10:00", "09:00"), ("23:00", "01:00")]:
            with self.subTest(start=start, end=end), self.assertRaises(ValueError):
                recommend_practice_windows([], "Monday", start, end, 30)

    def test_duration_cannot_fit(self):
        with self.assertRaises(ValueError):
            recommend_practice_windows([], "Monday", "09:00", "09:15", 30)

    def test_all_weekdays(self):
        for day in ("Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"):
            with self.subTest(day=day):
                swimmers = copy.deepcopy(self.swimmers)
                for swimmer in swimmers:
                    swimmer["classes"][0]["day"] = day
                self.assertEqual(recommend_practice_windows(swimmers, day, "09:30", "10:00", 30)[0]["conflict_count"], 2)

    def test_invalid_weekdays(self):
        for day in ("Mon", "monday", "", None, 1):
            with self.subTest(day=day), self.assertRaises(ValueError):
                recommend_practice_windows([], day, "08:00", "09:00", 30)

    def test_ranking_and_chronological_ties(self):
        results = recommend_practice_windows(self.swimmers, "Monday", "09:00", "11:00", 30)
        self.assertEqual([r["conflict_count"] for r in results], [0, 1, 1, 1, 2, 2, 2])
        self.assertEqual([r["startTime"] for r in results],
                         ["10:30", "09:00", "10:00", "10:15", "09:15", "09:30", "09:45"])

    def test_records_and_names_preserved(self):
        result = recommend_practice_windows(self.swimmers, "Monday", "09:30", "10:00", 30)[0]
        self.assertEqual(result["conflicting_swimmers"], self.swimmers)
        self.assertEqual([s["name"] for s in result["conflicting_swimmers"]],
                         ["Mock Swimmer Alpha", "Mock Swimmer Beta"])

    def test_transition_changes_result_and_exact_gap_allowed(self):
        for transition, expected in [(0, 0), (15, 0), (30, 1)]:
            with self.subTest(transition=transition):
                result = recommend_practice_windows(self.swimmers, "Monday", "10:45", "11:15", 30, transition)
                self.assertEqual(result[0]["conflict_count"], expected)

    def test_zero_and_default_match_existing_ranker(self):
        windows = [{"startTime": "09:00", "endTime": "09:30"},
                   {"startTime": "09:15", "endTime": "09:45"},
                   {"startTime": "09:30", "endTime": "10:00"}]
        expected = rank_practice_windows(self.swimmers, "Monday", windows)
        self.assertEqual(recommend_practice_windows(self.swimmers, "Monday", "09:00", "10:00", 30), expected)
        self.assertEqual(recommend_practice_windows(self.swimmers, "Monday", "09:00", "10:00", 30, 0), expected)

    def test_invalid_transitions(self):
        for transition in (-1, True, 5.5, "5", None):
            with self.subTest(transition=transition), self.assertRaises(ValueError):
                recommend_practice_windows([], "Monday", "09:00", "10:00", 30, transition)

    def test_inputs_not_mutated(self):
        original = copy.deepcopy(self.swimmers)
        recommend_practice_windows(self.swimmers, "Monday", "08:00", "12:00", 45, 15)
        self.assertEqual(self.swimmers, original)


if __name__ == "__main__":
    unittest.main()
