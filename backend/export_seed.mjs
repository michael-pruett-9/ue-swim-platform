// Explicit development export: import JavaScript modules, never parse their source.
import { writeFileSync } from 'node:fs';
import { mockSchedules } from '../frontend/src/data/mockSchedules.js';
import { mockPerformance } from '../frontend/src/data/mockPerformance.js';
import { mockTeamEvents } from '../frontend/src/data/mockTeamEvents.js';

const eventId = (name) => `event-${name.toLowerCase().replaceAll(' ', '-')}`;
const meetId = (result) => `meet-${result.date}`;
const seasons = [...new Set(mockPerformance.map((r) => r.season))].sort();
const data = {
  swimmers: mockSchedules.map(({ id, name }) => ({ id, name })),
  seasons: seasons.map((name) => ({ id: name, name, start_date: `${name.slice(0, 4)}-07-01`, end_date: `${Number(name.slice(0, 4)) + 1}-06-30` })),
  class_schedule_entries: mockSchedules.flatMap((s) => s.classes.map((c) => ({
    id: `${s.id}-${c.day}-${c.startTime}-${c.endTime}`, swimmer_id: s.id,
    weekday: c.day, start_time: c.startTime, end_time: c.endTime, label: c.label ?? null,
  }))),
  meets: [...new Map(mockPerformance.map((r) => [meetId(r), { id: meetId(r), name: r.meet, meet_date: r.date, season_id: r.season }])).values()],
  events: [...new Set(mockPerformance.map((r) => r.event))].sort().map((name) => ({ id: eventId(name), name })),
  results: mockPerformance.map((r) => ({ id: r.id, swimmer_id: r.swimmerId, meet_id: meetId(r), event_id: eventId(r.event), time_seconds: r.timeSeconds })),
  team_events: mockTeamEvents.map((e) => ({ id: e.id, event_type: e.type, title: e.title, weekday: e.day, start_time: e.startTime, end_time: e.endTime })),
};
writeFileSync(new URL('./seed_data.json', import.meta.url), JSON.stringify(data, null, 2) + '\n');
console.log(Object.fromEntries(Object.entries(data).map(([table, rows]) => [table, rows.length])));
