import { mockPerformance } from '../data/mockPerformance.js';

export function getSwimmerResults(swimmerId) {
  return mockPerformance.filter((result) => result.swimmerId === swimmerId)
    .sort((a, b) => a.date.localeCompare(b.date));
}

// Accept a swimmer's full history or an event-filtered history. Never mutate it.
export function groupResultsBySeason(results) {
  const groups = {};
  [...results].sort((a, b) => a.season.localeCompare(b.season) || a.date.localeCompare(b.date))
    .forEach((result) => {
      (groups[result.season] ??= []).push(result);
    });
  return groups;
}

export function getAvailableSeasons(results) {
  return Object.keys(groupResultsBySeason(results));
}

export function getSeasonResults(results, season) {
  return groupResultsBySeason(results)[season] ?? [];
}

export function summarizeEvent(history) {
  const earliest = history[0].timeSeconds;
  const best = Math.min(...history.map((result) => result.timeSeconds));
  return { earliest, best, improvement: earliest - best };
}

export function filterPerformanceResults(results, event = 'all', season = 'all') {
  return results.filter((result) => (event === 'all' || result.event === event)
    && (season === 'all' || result.season === season))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function summarizeSelectedResults(results, compareTimes = true) {
  const history = [...results].sort((a, b) => a.date.localeCompare(b.date));
  if (!history.length) return { count: 0, best: null, latest: null, improvement: null };
  if (!compareTimes) return { count: history.length, best: null, latest: history.at(-1), improvement: null };
  const { best, improvement } = summarizeEvent(history);
  return {
    count: history.length,
    best: history.find((result) => result.timeSeconds === best),
    latest: history.at(-1),
    improvement: history.length > 1 ? improvement : null,
  };
}

export function formatSwimTime(seconds) {
  const hundredths = Math.round(seconds * 100);
  const minutes = Math.floor(hundredths / 6000);
  const remainder = ((hundredths % 6000) / 100).toFixed(2);
  return minutes ? `${minutes}:${remainder.padStart(5, '0')}` : remainder;
}
