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

export function formatSwimTime(seconds) {
  const hundredths = Math.round(seconds * 100);
  const minutes = Math.floor(hundredths / 6000);
  const remainder = ((hundredths % 6000) / 100).toFixed(2);
  return minutes ? `${minutes}:${remainder.padStart(5, '0')}` : remainder;
}
