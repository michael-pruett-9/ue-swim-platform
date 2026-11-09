import assert from 'node:assert/strict';
import { mockPerformance, performanceProfiles, performanceEvents } from '../src/data/mockPerformance.js';
import { mockSchedules } from '../src/data/mockSchedules.js';
import { getSwimmerResults, getAvailableSeasons, getSeasonResults, groupResultsBySeason, summarizeEvent } from '../src/utils/performance.js';

const seasons = ['2025-26', '2026-27'];
const dates = {
  '2025-26': ['2025-09-06', '2025-09-20', '2025-10-04'],
  '2026-27': ['2026-09-05', '2026-09-19', '2026-10-03'],
};
const rosterIds = mockSchedules.map((swimmer) => swimmer.id).sort();
assert.equal(rosterIds.length, 20);
assert.equal(new Set(rosterIds).size, 20);
assert.deepEqual([...new Set(mockPerformance.map((result) => result.swimmerId))].sort(), rosterIds);
assert.deepEqual(performanceProfiles.map((profile) => profile.swimmerId).sort(), rosterIds);
assert.equal(new Set(mockPerformance.map((result) => result.id)).size, mockPerformance.length);
assert.deepEqual(getAvailableSeasons(mockPerformance), seasons);

for (const result of mockPerformance) {
  assert.ok(seasons.includes(result.season));
  assert.ok(performanceEvents.includes(result.event));
  assert.ok(Number.isFinite(result.timeSeconds) && result.timeSeconds > 0);
  assert.equal(Number(result.timeSeconds.toFixed(2)), result.timeSeconds);
  assert.ok(result.meet.startsWith('Mock'));
}

for (const profile of performanceProfiles) {
  const results = getSwimmerResults(profile.swimmerId);
  const events = Object.keys(profile.times);
  assert.ok(events.length >= 3 && events.length <= 5);
  assert.deepEqual([...new Set(results.map((result) => result.event))].sort(), [...events].sort());
  assert.deepEqual(results.map((result) => result.date), results.map((result) => result.date).sort());
  assert.equal(results.at(-1).date, '2026-10-03');
  for (const event of events) {
    const history = results.filter((result) => result.event === event);
    const snapshot = JSON.stringify(history);
    assert.deepEqual(getAvailableSeasons(history), seasons);
    const groups = groupResultsBySeason(history);
    for (const season of seasons) {
      const seasonResults = getSeasonResults(history, season);
      assert.equal(seasonResults.length, 3);
      assert.deepEqual(seasonResults.map((result) => result.date), dates[season]);
      assert.deepEqual(groups[season], seasonResults);
    }
    assert.deepEqual(getSeasonResults(history, 'missing-season'), []);
    const { earliest, best, improvement } = summarizeEvent(history);
    assert.equal(earliest, history[0].timeSeconds);
    assert.equal(best, Math.min(...history.map((result) => result.timeSeconds)));
    assert.equal(improvement, earliest - best);
    assert.equal(JSON.stringify(history), snapshot);
  }
}
assert.equal(mockPerformance.length, 432);
console.log('Performance validation passed: 20 swimmers, 72 swimmer/event pairs, 2 seasons, 432 results.');
