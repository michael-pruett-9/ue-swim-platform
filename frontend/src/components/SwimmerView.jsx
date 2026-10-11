import { useState } from 'react';
import { mockSchedules } from '../data/mockSchedules.js';
import { mockTeamEvents } from '../data/mockTeamEvents.js';
import { formatSwimTime, getSwimmerResults, summarizeEvent } from '../utils/performance.js';
import WeeklyCalendar from './WeeklyCalendar.jsx';
import PerformanceView from './PerformanceView.jsx';

export default function SwimmerView({ swimmerId, onSwitchRole, weekdays, formatTime }) {
  const [section, setSection] = useState('Dashboard');
  const swimmer = mockSchedules.find((entry) => entry.id === swimmerId);
  const results = getSwimmerResults(swimmerId);
  const performanceEvents = [...new Set(results.map((result) => result.event))];
  // Team events have weekdays, not dates: show the first event in the sample week.
  const firstEvent = [...mockTeamEvents].sort((a, b) =>
    weekdays.indexOf(a.day) - weekdays.indexOf(b.day) || a.startTime.localeCompare(b.startTime))[0];

  return (
    <main className="coach-app">
      <header className="coach-header">
        <div>
          <h1>UE Swimming &amp; Diving</h1>
          <p>Scheduling and Performance Platform · Swimmer Prototype</p>
        </div>
        <button type="button" onClick={onSwitchRole}>Switch Role</button>
      </header>
      <p>{swimmer.name} — all information is fictional/mock prototype data.</p>
      <nav className="coach-nav" aria-label="Swimmer navigation">
        {['Dashboard', 'Calendar', 'Performance'].map((name) => (
          <button key={name} type="button" aria-current={section === name ? 'page' : undefined}
            onClick={() => setSection(name)}>{name}</button>
        ))}
      </nav>
      {section === 'Dashboard' && (
        <section aria-labelledby="swimmer-dashboard-heading">
          <h2 id="swimmer-dashboard-heading">Dashboard</h2>
          <div className="summary-grid">
            <article className="panel"><h3>Swimmer</h3><p>{swimmer.name}</p></article>
            <article className="panel"><h3>Tracked events</h3><p>{new Set(results.map((result) => result.event)).size}</p></article>
            <article className="panel">
              <h3>First team event in the mock week</h3>
              <p>{firstEvent.title}</p>
              <p>{firstEvent.day}: {formatTime(firstEvent.startTime)}–{formatTime(firstEvent.endTime)}</p>
              <p>Sample week only; not a dated upcoming event.</p>
            </article>
          </div>
          <h3>Personal bests</h3>
          <p>Fictional short-course-yard results. Lower times are better.</p>
          <div className="summary-grid">
            {performanceEvents.map((event) => (
              <article className="panel" key={event}>
                <h4>{event}</h4>
                <p>{formatSwimTime(summarizeEvent(results.filter((result) => result.event === event)).best)}</p>
              </article>
            ))}
          </div>
        </section>
      )}
      {section === 'Calendar' && (
        <WeeklyCalendar weekdays={weekdays} formatTime={formatTime} swimmerId={swimmerId} />
      )}
      {section === 'Performance' && <PerformanceView fixedSwimmerId={swimmerId} />}
    </main>
  );
}
