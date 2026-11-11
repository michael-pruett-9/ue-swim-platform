import assert from 'node:assert/strict';
import { filterPerformanceResults, summarizeSelectedResults } from '../src/utils/performance.js';
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
const alpha = getSwimmerResults('mock-001');
const selected = filterPerformanceResults(alpha, '50 Freestyle', '2026-27');
const selectedSummary = summarizeSelectedResults(selected);
assert.equal(selectedSummary.count, 3);
assert.equal(selectedSummary.best.timeSeconds, 23.41);
assert.equal(selectedSummary.latest.timeSeconds, 23.45);
assert.equal(selectedSummary.improvement.toFixed(2), '0.09');
assert.deepEqual(summarizeSelectedResults([...selected].reverse()), selectedSummary);
assert.equal(summarizeSelectedResults([selected[0]]).improvement, null);
assert.equal(summarizeSelectedResults([]).count, 0);
assert.equal(summarizeSelectedResults([{ ...selected[0] }, { ...selected[1], timeSeconds: 23.50 }]).improvement, 0);
for (const profile of performanceProfiles) {
  const history = getSwimmerResults(profile.swimmerId);
  const before = JSON.stringify(history);
  assert.equal(filterPerformanceResults(history).length, history.length);
  for (const season of ['all', ...seasons]) {
    const filtered = filterPerformanceResults(history, 'all', season);
    const summary = summarizeSelectedResults(filtered, false);
    assert.equal(summary.count, filtered.length);
    assert.deepEqual(summary.latest, filtered.at(-1));
    assert.equal(summary.best, null);
    assert.equal(summary.improvement, null);
  }
  for (const event of Object.keys(profile.times)) {
    for (const season of seasons) {
      const filtered = filterPerformanceResults(history, event, season);
      assert.equal(filtered.length, 3);
      assert.ok(filtered.every((result) => result.event === event && result.season === season));
      assert.deepEqual(summarizeSelectedResults(filtered), summarizeSelectedResults([...filtered].reverse()));
    }
  }
  assert.equal(JSON.stringify(history), before);
}
console.log('History filter/summary checks passed for all swimmers, including Alpha values, display-order independence, empty/single results, and zero improvement.');
console.log('Performance validation passed: 20 swimmers, 72 swimmer/event pairs, 2 seasons, 432 results.');
assert.equal(summarizeSelectedResults(selected, false).best, null);
assert.equal(summarizeSelectedResults(selected, false).improvement, null);
console.log('All-events summaries preserve count/latest and skip best/improvement calculations.');
