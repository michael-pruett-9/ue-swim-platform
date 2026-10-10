import { useState } from 'react';
import { mockSchedules } from '../data/mockSchedules.js';
import { performanceEvents } from '../data/mockPerformance.js';
import { formatSwimTime, getSwimmerResults, summarizeEvent } from '../utils/performance.js';

export default function PerformanceView({ fixedSwimmerId } = {}) {
  const [selectedSwimmerId, setSwimmerId] = useState(mockSchedules[0].id);
  const swimmerId = fixedSwimmerId ?? selectedSwimmerId;
  const [selectedEvent, setSelectedEvent] = useState(performanceEvents[0]);
  const swimmer = mockSchedules.find((entry) => entry.id === swimmerId);
  const results = getSwimmerResults(swimmerId);
  const latest = results[results.length - 1];
  const progression = results.filter((result) => result.event === selectedEvent);

  return (
    <section aria-labelledby="performance-heading">
      <h2 id="performance-heading">Performance</h2>
      <p>All performances, meets, and dates are fictional prototype data. Events use short-course yards. Lower times are better.</p>
      {!fixedSwimmerId && <p>
        <label htmlFor="performance-swimmer">Swimmer: </label>
        <select id="performance-swimmer" value={swimmerId} onChange={(event) => setSwimmerId(event.target.value)}>
          {mockSchedules.map((entry) => <option key={entry.id} value={entry.id}>{entry.name}</option>)}
        </select>
      </p>}
      <div className="summary-grid">
        <article className="panel"><h3>Swimmer</h3><p>{swimmer.name}</p></article>
        <article className="panel"><h3>Tracked events</h3><p>{new Set(results.map((result) => result.event)).size}</p></article>
        <article className="panel"><h3>Most recent fictional meet</h3><p>{latest.meet} — {latest.date}</p></article>
      </div>
      <h3>Event performance</h3>
      <div className="summary-grid">
        {performanceEvents.map((event) => {
          const history = results.filter((result) => result.event === event);
          const { earliest, best, improvement } = summarizeEvent(history);
          return (
            <article className="panel" key={event}>
              <h4>{event}</h4>
              <p>Personal Best: <strong>{formatSwimTime(best)}</strong></p>
              <p>Most Recent Time: {formatSwimTime(history[history.length - 1].timeSeconds)}</p>
              <p>Improvement: {improvement.toFixed(2)} seconds ({(improvement / earliest * 100).toFixed(2)}%)</p>
              <p>From earliest result to personal best.</p>
            </article>
          );
        })}
      </div>
      <section className="panel">
        <h3>Results history</h3>
        <div className="table-scroll">
          <table className="ranking-table">
            <caption>{swimmer.name} — oldest to newest; times in seconds or minutes:seconds.hundredths</caption>
            <thead><tr><th scope="col">Meet</th><th scope="col">Event</th><th scope="col">Time</th></tr></thead>
            <tbody>{results.map((result) => (
              <tr key={result.id}>
                <td>{result.meet} — {result.date}</td><td>{result.event}</td><td>{formatSwimTime(result.timeSeconds)}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </section>
      <section className="panel">
        <h3>Simple progression</h3>
        <label htmlFor="progression-event">Event: </label>
        <select id="progression-event" value={selectedEvent} onChange={(event) => setSelectedEvent(event.target.value)}>
          {performanceEvents.map((event) => <option key={event}>{event}</option>)}
        </select>
        <ol>{progression.map((result) => (
          <li key={result.id}>{result.date} — {result.meet}: <strong>{formatSwimTime(result.timeSeconds)}</strong></li>
        ))}</ol>
      </section>
    </section>
  );
}
