// Entirely invented short-course-yard results, not real athlete performances.
// Rows link to roster IDs only: [swimmerId, 50 free, 100 free, 200 free].
const baselineTimes = [
  ['mock-001', 25.50, 56.20, 125.40],
  ['mock-002', 23.80, 52.40, 117.80],
  ['mock-003', 27.10, 59.30, 132.60],
  ['mock-004', 24.60, 54.10, 121.20],
  ['mock-005', 26.30, 57.80, 128.90],
  ['mock-006', 22.90, 50.50, 113.40],
  ['mock-007', 28.20, 62.10, 139.30],
  ['mock-008', 25.10, 55.70, 124.60],
  ['mock-009', 24.20, 53.20, 119.50],
  ['mock-010', 27.60, 60.80, 136.20],
  ['mock-011', 23.40, 51.60, 115.90],
  ['mock-012', 26.80, 58.90, 131.70],
  ['mock-013', 25.90, 57.10, 127.30],
  ['mock-014', 22.50, 49.80, 111.80],
  ['mock-015', 28.70, 63.40, 142.10],
  ['mock-016', 24.90, 54.80, 122.70],
  ['mock-017', 26.00, 57.50, 129.10],
  ['mock-018', 23.60, 52.00, 116.60],
  ['mock-019', 27.30, 60.10, 134.50],
  ['mock-020', 25.30, 55.90, 125.80],
];

export const performanceEvents = ['50 Freestyle', '100 Freestyle', '200 Freestyle'];
const meets = [
  { date: '2026-09-05', meet: 'Mock Season Opener' },
  { date: '2026-09-19', meet: 'Mock Fall Invitational' },
  { date: '2026-10-03', meet: 'Mock October Meet' },
];

// Deterministic sample results; some latest swims are slower than a prior best.
export const mockPerformance = baselineTimes.flatMap(([swimmerId, ...times], swimmerIndex) =>
  performanceEvents.flatMap((event, eventIndex) => meets.map((meet, meetIndex) => {
    const improvement = [0.6, 1.2, 2.4][eventIndex];
    const reductions = [0, improvement, swimmerIndex % 2 === 0 ? improvement / 2 : improvement * 1.5];
    return {
      id: `${swimmerId}-${eventIndex}-${meetIndex}`,
      swimmerId,
      event,
      timeSeconds: Number((times[eventIndex] - reductions[meetIndex]).toFixed(2)),
      ...meet,
    };
  })),
);
