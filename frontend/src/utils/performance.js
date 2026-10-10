import { mockPerformance } from '../data/mockPerformance.js';

export function getSwimmerResults(swimmerId) {
  return mockPerformance.filter((result) => result.swimmerId === swimmerId)
    .sort((a, b) => a.date.localeCompare(b.date));
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
