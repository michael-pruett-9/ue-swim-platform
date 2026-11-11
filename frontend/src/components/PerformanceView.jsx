import { useState } from 'react';
import ProgressionChart from './ProgressionChart.jsx';
import SeasonComparison from './SeasonComparison.jsx';
import ResultsHistory from './ResultsHistory.jsx';
import { mockSchedules } from '../data/mockSchedules.js';
import { formatSwimTime, getSwimmerResults, summarizeEvent, getAvailableSeasons, getSeasonResults } from '../utils/performance.js';

export default function PerformanceView({ fixedSwimmerId } = {}) {
  const [selectedSwimmerId, setSwimmerId] = useState(mockSchedules[0].id);
  const swimmerId = fixedSwimmerId ?? selectedSwimmerId;
  const [selectedEvent, setSelectedEvent] = useState('');
  const [selectedSeason, setSelectedSeason] = useState('');
  const [progressionView, setProgressionView] = useState('single');
  const swimmer = mockSchedules.find((entry) => entry.id === swimmerId);
  const results = getSwimmerResults(swimmerId);
  const performanceEvents = [...new Set(results.map((result) => result.event))];
  const activeEvent = performanceEvents.includes(selectedEvent) ? selectedEvent : performanceEvents[0];
  const latest = results[results.length - 1];
  const progression = results.filter((result) => result.event === activeEvent);
  const seasons = getAvailableSeasons(progression);
  const activeSeason = selectedSeason === 'all' || seasons.includes(selectedSeason)
    ? selectedSeason : seasons.at(-1) ?? '';
  // Commit a fallback so subsequent swimmer/event changes retain the visible choice.
  if (activeSeason !== selectedSeason) setSelectedSeason(activeSeason);
  const visibleProgression = activeSeason === 'all' ? progression : getSeasonResults(progression, activeSeason);

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
      <ResultsHistory key={swimmerId} results={results} swimmerName={swimmer.name} />
      <section className="panel">
        <h3>Performance progression</h3>
        <div className="progression-filters">
        <div>
          <label htmlFor="progression-view">View</label>
          <select id="progression-view" value={progressionView} onChange={(event) => setProgressionView(event.target.value)}>
            <option value="single">Single season</option>
            <option value="compare">Compare seasons</option>
          </select>
        </div>
        <div>
        <label htmlFor="progression-event">Event: </label>
        <select id="progression-event" value={activeEvent} onChange={(event) => setSelectedEvent(event.target.value)}>
          {performanceEvents.map((event) => <option key={event}>{event}</option>)}
        </select>
        </div>
        {progressionView === 'single' && <div>
          <label htmlFor="progression-season">Season: </label>
          <select id="progression-season" value={activeSeason} onChange={(event) => setSelectedSeason(event.target.value)}>
            {seasons.map((season) => <option key={season} value={season}>{season}</option>)}
            <option value="all">All seasons</option>
          </select>
        </div>}
        </div>
        {progressionView === 'compare' ? <SeasonComparison results={progression} event={activeEvent} /> : <>
        <p>{activeSeason === 'all' ? 'Showing all seasons' : `Showing ${activeSeason} season`}. Career summary cards include all seasons. Results History has independent filters.</p>
        <ProgressionChart key={`${swimmerId}-${activeEvent}-${activeSeason}`}
          results={visibleProgression} event={activeEvent}
          personalBest={progression.length ? summarizeEvent(progression).best : undefined} />
        </>}
      </section>
    </section>
  );
}
