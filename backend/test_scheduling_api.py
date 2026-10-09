"""Exercise FastAPI HTTP handling in-process without additional dependencies."""

import json
import unittest

from main import app


class SchedulingApiTests(unittest.IsolatedAsyncioTestCase):
    async def request(self, path, payload=None):
        messages = []

        async def receive():
            return {"type": "http.request", "body": json.dumps(payload).encode(), "more_body": False}

        async def send(message):
            messages.append(message)

        await app({
            "type": "http", "asgi": {"version": "3.0"}, "http_version": "1.1",
            "method": "GET" if payload is None else "POST", "scheme": "http",
            "path": path, "raw_path": path.encode(), "query_string": b"",
            "root_path": "", "headers": [(b"content-type", b"application/json")],
            "server": ("localhost", 8000), "client": ("localhost", 12345),
        }, receive, send)
        status = next(m["status"] for m in messages if m["type"] == "http.response.start")
        body = b"".join(m.get("body", b"") for m in messages if m["type"] == "http.response.body")
        return status, json.loads(body)

    def payload(self, ranking=False, day="Monday"):
        data = {
            "day": day,
            "swimmers": [{"id": "mock-001", "name": "Mock Swimmer Alpha", "classes": [
                {"day": day, "startTime": "10:00", "endTime": "11:00"},
            ]}],
        }
        if ranking:
            data["candidateWindows"] = [
                {"startTime": "11:05", "endTime": "12:00"},
                {"startTime": "13:00", "endTime": "14:00"},
            ]
        else:
            data.update(practiceStartTime="11:05", practiceEndTime="12:00")
        return data

    async def test_conflict_transition_and_default(self):
        payload = self.payload()
        for value, expected in [(None, 0), (0, 0), (5, 0), (10, 1)]:
            with self.subTest(value=value):
                if value is not None:
                    payload["transitionMinutes"] = value
                status, result = await self.request("/api/conflicts", payload)
                self.assertEqual(status, 200)
                self.assertEqual(result["conflict_count"], expected)

    async def test_ranking_transition_and_default(self):
        payload = self.payload(ranking=True)
        for value, starts, counts in [(None, ["11:05", "13:00"], [0, 0]),
                                      (0, ["11:05", "13:00"], [0, 0]),
                                      (10, ["13:00", "11:05"], [0, 1])]:
            with self.subTest(value=value):
                if value is not None:
                    payload["transitionMinutes"] = value
                status, results = await self.request("/api/rank-practice-windows", payload)
                self.assertEqual(status, 200)
                self.assertEqual([r["startTime"] for r in results], starts)
                self.assertEqual([r["conflict_count"] for r in results], counts)

    async def test_all_weekdays_on_both_endpoints(self):
        for day in ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]:
            for ranking, path in [(False, "/api/conflicts"), (True, "/api/rank-practice-windows")]:
                with self.subTest(day=day, path=path):
                    payload = self.payload(ranking, day)
                    payload["transitionMinutes"] = 10
                    status, result = await self.request(path, payload)
                    self.assertEqual(status, 200)
                    self.assertEqual(result[-1]["conflict_count"] if ranking else result["conflict_count"], 1)

    async def test_invalid_transition_on_both_endpoints(self):
        for ranking, path in [(False, "/api/conflicts"), (True, "/api/rank-practice-windows")]:
            for value in [-1, 2.5, True, "10", None]:
                with self.subTest(path=path, value=value):
                    payload = self.payload(ranking)
                    payload["transitionMinutes"] = value
                    self.assertEqual((await self.request(path, payload))[0], 422)

    async def test_health_unchanged(self):
        self.assertEqual(await self.request("/api/health"), (200, {"status": "ok"}))


if __name__ == "__main__":
    unittest.main()
