import { useState } from 'react';
import { filterPerformanceResults, summarizeSelectedResults, getAvailableSeasons, formatSwimTime } from '../utils/performance.js';

export default function ResultsHistory({ results, swimmerName }) {
  const [event, setEvent] = useState('all');
  const [season, setSeason] = useState('all');
  const [order, setOrder] = useState('oldest');
  const events = [...new Set(results.map((result) => result.event))];
  const seasons = getAvailableSeasons(results);
  const selected = filterPerformanceResults(results, event, season);
  const summary = summarizeSelectedResults(selected, event !== 'all');
  const rows = order === 'newest' ? [...selected].reverse() : selected;

  return (
    <section className="panel">
      <h3>Results history</h3>
      <div className="progression-filters">
        <div>
          <label htmlFor="history-event">Event</label>
          <select id="history-event" value={event} onChange={(change) => setEvent(change.target.value)}>
            <option value="all">All events</option>
            {events.map((name) => <option key={name}>{name}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="history-season">Season</label>
          <select id="history-season" value={season} onChange={(change) => setSeason(change.target.value)}>
            <option value="all">All seasons</option>
            {seasons.map((name) => <option key={name}>{name}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="history-order">Order</label>
          <select id="history-order" value={order} onChange={(change) => setOrder(change.target.value)}>
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>
        </div>
      </div>
      <div className="history-summary" aria-live="polite">
        <h4>Selected Results Summary</h4>
        <dl>
          <div><dt>Results</dt><dd>{summary.count}</dd></div>
          <div><dt>Best</dt><dd>{event === 'all' ? 'Select an event' : summary.best ? `${formatSwimTime(summary.best.timeSeconds)} — ${summary.best.event}` : 'No results'}</dd></div>
          <div><dt>Latest</dt><dd>{summary.latest ? `${formatSwimTime(summary.latest.timeSeconds)} — ${summary.latest.event}, ${summary.latest.date}` : 'No results'}</dd></div>
          <div><dt>Improvement</dt><dd>{event === 'all' ? 'Select an event' : summary.improvement === null ? 'Not enough results' : `${summary.improvement.toFixed(2)} seconds`}</dd></div>
        </dl>
        {event !== 'all' && <p>Improvement compares the first chronological selected result with the fastest selected time.</p>}
        {event === 'all' && <p>Different events have different distances and strokes. Select one event for a meaningful improvement comparison. For results on the same date, existing data order breaks ties.</p>}
      </div>
      {rows.length === 0 ? <p>No results match these filters.</p> : <div className="table-scroll">
        <table className="ranking-table">
          <caption>{swimmerName} — {order === 'newest' ? 'newest to oldest' : 'oldest to newest'}; times in seconds or minutes:seconds.hundredths</caption>
          <thead><tr><th scope="col">Meet</th><th scope="col">Event</th><th scope="col">Time</th></tr></thead>
          <tbody>{rows.map((result) => <tr key={result.id}>
            <td>{result.meet} — {result.date}</td><td>{result.event}</td><td>{formatSwimTime(result.timeSeconds)}</td>
          </tr>)}</tbody>
        </table>
      </div>}
    </section>
  );
}
