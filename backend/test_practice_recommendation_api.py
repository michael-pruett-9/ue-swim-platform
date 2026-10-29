"""Recommendation HTTP tests using the existing dependency-free ASGI helper."""

import unittest

import test_scheduling_api


class PracticeRecommendationApiTests(unittest.IsolatedAsyncioTestCase):
    request = test_scheduling_api.SchedulingApiTests.request
    path = "/api/recommend-practice-windows"

    def payload(self, **changes):
        payload = {
            "swimmers": [{"id": "mock-001", "name": "Mock Swimmer Alpha", "classes": [
                {"day": "Monday", "startTime": "09:00", "endTime": "10:00", "label": "Sample Math"},
            ]}],
            "day": "Monday", "earliestStartTime": "09:00", "latestEndTime": "11:00",
            "practiceDurationMinutes": 30, "transitionMinutes": 0,
        }
        payload.update(changes)
        return payload

    async def test_success_ranking_and_records(self):
        payload = self.payload()
        status, rows = await self.request(self.path, payload)
        self.assertEqual(status, 200)
        self.assertEqual(len(rows), 7)
        self.assertEqual([r["conflict_count"] for r in rows], [0, 0, 0, 1, 1, 1, 1])
        self.assertEqual([r["startTime"] for r in rows],
                         ["10:00", "10:15", "10:30", "09:00", "09:15", "09:30", "09:45"])
        self.assertEqual(rows[-1]["conflicting_swimmers"], payload["swimmers"])
        self.assertEqual(set(rows[0]), {"startTime", "endTime", "conflict_count", "conflicting_swimmers"})

    async def test_generation_duration_and_bounds(self):
        status, rows = await self.request(self.path, self.payload(
            swimmers=[], earliestStartTime="13:00", latestEndTime="18:30", practiceDurationMinutes=90))
        self.assertEqual(status, 200)
        self.assertEqual(len(rows), 17)
        self.assertEqual(rows[0]["startTime"], "13:00")
        self.assertEqual(rows[-1]["endTime"], "18:30")
        for index, row in enumerate(rows):
            start = int(row["startTime"][:2]) * 60 + int(row["startTime"][3:])
            end = int(row["endTime"][:2]) * 60 + int(row["endTime"][3:])
            self.assertEqual(start, 780 + 15 * index)
            self.assertEqual(end - start, 90)
            self.assertLessEqual(end, 1110)

    async def test_transition_affects_results(self):
        for minutes, count in [(0, 0), (15, 0), (30, 1)]:
            with self.subTest(minutes=minutes):
                status, rows = await self.request(self.path, self.payload(
                    earliestStartTime="10:15", latestEndTime="10:45", transitionMinutes=minutes))
                self.assertEqual(status, 200)
                self.assertEqual(rows[0]["conflict_count"], count)

    async def test_default_transition_is_zero(self):
        payload = self.payload()
        expected = await self.request(self.path, payload)
        del payload["transitionMinutes"]
        self.assertEqual(await self.request(self.path, payload), expected)

    async def test_all_weekdays(self):
        for day in ("Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"):
            with self.subTest(day=day):
                payload = self.payload(day=day)
                payload["swimmers"][0]["classes"][0]["day"] = day
                status, rows = await self.request(self.path, payload)
                self.assertEqual(status, 200)
                self.assertEqual(rows[-1]["conflict_count"], 1)

    async def assert_invalid(self, **changes):
        status, body = await self.request(self.path, self.payload(**changes))
        self.assertEqual(status, 422)
        self.assertTrue(body["detail"])

    async def test_invalid_durations(self):
        for value in (22, 0, 135, 30.0, True, "30", None):
            with self.subTest(value=value):
                await self.assert_invalid(practiceDurationMinutes=value)

    async def test_invalid_transitions(self):
        for value in (-1, 1.5, True, "15", None):
            with self.subTest(value=value):
                await self.assert_invalid(transitionMinutes=value)

    async def test_invalid_times_and_boundaries(self):
        for field in ("earliestStartTime", "latestEndTime"):
            for value in ("9:00", "09:05", "09:60", "24:00", None):
                with self.subTest(field=field, value=value):
                    await self.assert_invalid(**{field: value})

    async def test_invalid_ranges(self):
        for start, end in (("11:00", "11:00"), ("12:00", "11:00"), ("23:00", "01:00"), ("09:00", "09:15")):
            with self.subTest(start=start, end=end):
                await self.assert_invalid(earliestStartTime=start, latestEndTime=end)

    async def test_invalid_weekday(self):
        await self.assert_invalid(day="Mon")

    async def test_missing_fields_and_duplicate_swimmers(self):
        self.assertEqual((await self.request(self.path, {}))[0], 422)
        swimmer = self.payload()["swimmers"][0]
        await self.assert_invalid(swimmers=[swimmer, swimmer])

    async def test_existing_health(self):
        self.assertEqual(await self.request("/api/health"), (200, {"status": "ok"}))

    async def test_existing_conflicts(self):
        swimmers = self.payload()["swimmers"]
        self.assertEqual(await self.request("/api/conflicts", {
            "swimmers": swimmers, "day": "Monday", "practiceStartTime": "09:00", "practiceEndTime": "09:30",
        }), (200, {"conflicting_swimmers": swimmers, "conflict_count": 1}))

    async def test_existing_predefined_ranking(self):
        status, rows = await self.request("/api/rank-practice-windows", {
            "swimmers": self.payload()["swimmers"], "day": "Monday", "candidateWindows": [
                {"startTime": "09:05", "endTime": "09:35"},
                {"startTime": "11:05", "endTime": "11:35"},
            ],
        })
        self.assertEqual(status, 200)
        self.assertEqual([row["startTime"] for row in rows], ["11:05", "09:05"])
        self.assertEqual([row["conflict_count"] for row in rows], [0, 1])


if __name__ == "__main__":
    unittest.main()
