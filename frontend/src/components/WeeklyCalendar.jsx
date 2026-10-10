import { mockSchedules } from '../data/mockSchedules.js';
import { mockTeamEvents } from '../data/mockTeamEvents.js';

const typeStyles = {
  CLASS: 'calendar-class',
  PRACTICE: 'calendar-practice',
  MEET: 'calendar-meet',
  'TEAM EVENT': 'calendar-team-event',
};

export default function WeeklyCalendar({ weekdays, formatTime, swimmerId, onSwimmerChange }) {
  const swimmer = mockSchedules.find((entry) => entry.id === swimmerId);
  // Build display cards from the existing classes; never change the source data.
  const classes = swimmer ? swimmer.classes.map((entry, index) => ({
    ...entry,
    id: `class-${swimmer.id}-${index}`,
    type: 'CLASS',
    title: entry.label || 'Mock class',
  })) : [];
  const items = [...mockTeamEvents, ...classes];

  return (
    <section aria-labelledby="calendar-heading">
      <h2 id="calendar-heading">Calendar</h2>
      <p>Fictional prototype week. All team events and class schedules are mock data.</p>
      {onSwimmerChange && <p>
        <label htmlFor="calendar-swimmer">View swimmer classes: </label>
        <select id="calendar-swimmer" value={swimmerId} onChange={(event) => onSwimmerChange(event.target.value)}>
          <option value="">Team events only</option>
          {mockSchedules.map((entry) => <option key={entry.id} value={entry.id}>{entry.name}</option>)}
        </select>
      </p>}
      <p>{swimmer ? `Team events and classes for ${swimmer.name}.` : 'Showing team events only.'}</p>
      <div className="calendar-scroll" tabIndex={0} role="region" aria-label="Weekly calendar, Monday through Sunday">
        <div className="weekly-board">
          {weekdays.map((day) => {
            const dailyItems = items.filter((item) => item.day === day)
              .sort((a, b) => a.startTime.localeCompare(b.startTime));
            return (
              <section className="calendar-day" key={day} aria-label={day}>
                <h3>{day}</h3>
                {dailyItems.length === 0 ? <p>No events</p> : (
                  <ul className="calendar-items">
                    {dailyItems.map((item) => (
                      <li className={`calendar-card ${typeStyles[item.type]}`} key={item.id}>
                        <span className="calendar-type">{item.type}</span>
                        <h4>{item.title}</h4>
                        <p>{formatTime(item.startTime)}–{formatTime(item.endTime)}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            );
          })}
        </div>
      </div>
    </section>
  );
}
