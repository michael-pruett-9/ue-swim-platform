// Entirely invented collegiate SCY profiles and results; no real athlete data.
// Baselines are seconds. Identity stays in mockSchedules and is linked by ID.
export const performanceEvents = [
  '50 Freestyle', '100 Freestyle', '200 Freestyle', '500 Freestyle',
  '1000 Freestyle', '1650 Freestyle', '100 Backstroke', '200 Backstroke',
  '100 Breaststroke', '200 Breaststroke', '100 Butterfly', '200 Butterfly',
  '200 IM', '400 IM',
];

export const performanceProfiles = [
  { swimmerId: 'mock-001', specialty: 'Sprint freestyle', times: { '50 Freestyle': 23.50, '100 Freestyle': 51.20, '200 Freestyle': 113.40 } },
  { swimmerId: 'mock-002', specialty: 'Distance freestyle', times: { '200 Freestyle': 108.80, '500 Freestyle': 291.40, '1000 Freestyle': 603.20, '1650 Freestyle': 1008.50 } },
  { swimmerId: 'mock-003', specialty: 'Backstroke', times: { '100 Backstroke': 59.30, '200 Backstroke': 128.60, '200 Freestyle': 119.50 } },
  { swimmerId: 'mock-004', specialty: 'Breaststroke', times: { '100 Breaststroke': 62.40, '200 Breaststroke': 136.20, '200 IM': 124.80 } },
  { swimmerId: 'mock-005', specialty: 'Butterfly', times: { '100 Butterfly': 58.80, '200 Butterfly': 130.50, '100 Freestyle': 55.60 } },
  { swimmerId: 'mock-006', specialty: 'Individual medley', times: { '200 IM': 116.80, '400 IM': 251.30, '200 Backstroke': 117.60, '200 Breaststroke': 137.20 } },
  { swimmerId: 'mock-007', specialty: 'Mid-distance freestyle', times: { '100 Freestyle': 57.10, '200 Freestyle': 122.80, '500 Freestyle': 326.40 } },
  { swimmerId: 'mock-008', specialty: 'Sprint freestyle / butterfly', times: { '50 Freestyle': 24.10, '100 Freestyle': 52.60, '100 Butterfly': 57.40, '200 Freestyle': 117.20 } },
  { swimmerId: 'mock-009', specialty: 'Distance freestyle', times: { '500 Freestyle': 298.50, '1000 Freestyle': 619.30, '1650 Freestyle': 1041.60 } },
  { swimmerId: 'mock-010', specialty: 'Backstroke / IM', times: { '100 Backstroke': 61.40, '200 Backstroke': 132.10, '200 IM': 137.20, '400 IM': 291.60 } },
  { swimmerId: 'mock-011', specialty: 'Breaststroke', times: { '100 Breaststroke': 60.80, '200 Breaststroke': 133.50, '200 IM': 120.90 } },
  { swimmerId: 'mock-012', specialty: 'Butterfly / IM', times: { '100 Butterfly': 60.10, '200 Butterfly': 133.80, '200 IM': 136.50, '400 IM': 287.90 } },
  { swimmerId: 'mock-013', specialty: 'Versatile', times: { '100 Freestyle': 54.30, '200 Freestyle': 118.40, '100 Backstroke': 60.20, '100 Butterfly': 59.10, '200 IM': 132.60 } },
  { swimmerId: 'mock-014', specialty: 'Sprint freestyle', times: { '50 Freestyle': 21.80, '100 Freestyle': 48.10, '100 Butterfly': 52.40 } },
  { swimmerId: 'mock-015', specialty: 'Distance freestyle / IM', times: { '200 Freestyle': 123.60, '500 Freestyle': 325.70, '1650 Freestyle': 1124.30, '400 IM': 286.80 } },
  { swimmerId: 'mock-016', specialty: 'Backstroke', times: { '100 Backstroke': 56.30, '200 Backstroke': 121.20, '100 Freestyle': 52.80 } },
  { swimmerId: 'mock-017', specialty: 'Breaststroke / IM', times: { '100 Breaststroke': 68.40, '200 Breaststroke': 150.20, '200 IM': 137.80, '400 IM': 292.40 } },
  { swimmerId: 'mock-018', specialty: 'Butterfly', times: { '100 Butterfly': 53.20, '200 Butterfly': 117.80, '200 Freestyle': 110.60 } },
  { swimmerId: 'mock-019', specialty: 'Mid-distance freestyle / backstroke', times: { '100 Freestyle': 56.20, '200 Freestyle': 121.30, '500 Freestyle': 321.60, '200 Backstroke': 132.40 } },
  { swimmerId: 'mock-020', specialty: 'Versatile / IM', times: { '200 Freestyle': 115.80, '100 Backstroke': 57.90, '100 Breaststroke': 66.50, '200 IM': 128.30, '400 IM': 274.60 } },
];

const meets = [
  { date: '2026-09-05', meet: 'Mock Season Opener' },
  { date: '2026-09-19', meet: 'Mock Fall Invitational' },
  { date: '2026-10-03', meet: 'Mock October Meet' },
];

// Modest 0.4–1.1% changes scale with race length. Some final swims regress
// slightly from the second meet. All results are deterministic fictional data.
export const mockPerformance = performanceProfiles.flatMap((profile, swimmerIndex) =>
  Object.entries(profile.times).flatMap(([event, baseline], eventIndex) => {
    const reduction = 0.004 + ((swimmerIndex + eventIndex) % 4) * 0.002;
    const reductions = [0, reduction, (swimmerIndex + eventIndex) % 2 === 0 ? reduction * 0.5 : reduction * 1.1];
    return meets.map((meet, meetIndex) => ({
      id: `${profile.swimmerId}-${event}-${meetIndex}`,
      swimmerId: profile.swimmerId,
      event,
      timeSeconds: Number((baseline * (1 - reductions[meetIndex])).toFixed(2)),
      ...meet,
    }));
  }),
);
