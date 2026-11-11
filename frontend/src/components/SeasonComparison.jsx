import { useState } from 'react';
import ProgressionChart from './ProgressionChart.jsx';
import { getAvailableSeasons, getSeasonResults, summarizeEvent, formatSwimTime } from '../utils/performance.js';

export default function SeasonComparison({ results, event }) {
  const seasons = getAvailableSeasons(results);
  const [selectedA, setSelectedA] = useState('');
  const [selectedB, setSelectedB] = useState('');
  const seasonA = seasons.includes(selectedA) ? selectedA : seasons.at(-2);
  const seasonB = seasons.includes(selectedB) && selectedB !== seasonA
    ? selectedB : seasons.findLast((season) => season !== seasonA);

  if (seasons.length < 2) return <p>Two seasons of results are needed to compare this event.</p>;

  const summaries = [seasonA, seasonB].map((season) => {
    const history = getSeasonResults(results, season);
    return { season, history, best: summarizeEvent(history).best, latest: history.at(-1).timeSeconds };
  });
  const difference = Math.round(summaries[1].best * 100) - Math.round(summaries[0].best * 100);

  return (
    <>
      <div className="progression-filters">
        <div>
          <label htmlFor="comparison-a">Season A</label>
          <select id="comparison-a" value={seasonA} onChange={(event) => {
            const next = event.target.value;
            setSelectedA(next);
            setSelectedB(next === seasonB ? seasonA : seasonB);
          }}>
            {seasons.map((season) => <option key={season}>{season}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="comparison-b">Season B</label>
          <select id="comparison-b" value={seasonB} onChange={(event) => {
            const next = event.target.value;
            setSelectedB(next);
            setSelectedA(next === seasonA ? seasonB : seasonA);
          }}>
            {seasons.map((season) => <option key={season}>{season}</option>)}
          </select>
        </div>
      </div>
      <p>Comparing {seasonA} and {seasonB} by meet order. Selecting the other season swaps A and B.</p>
      <ProgressionChart key={`${event}-${seasonA}-${seasonB}-${results[0]?.swimmerId}`}
        results={summaries.flatMap((summary) => summary.history)} event={event}
        personalBest={summarizeEvent(results).best} comparisonSeasons={[seasonA, seasonB]} />
      <div className="summary-grid">
        {summaries.map(({ season, best, latest }) => (
          <article className="panel" key={season}>
            <h4>{season}</h4>
            <p>Season best: <strong>{formatSwimTime(best)}</strong></p>
            <p>Latest result: {formatSwimTime(latest)}</p>
          </article>
        ))}
      </div>
      <p>{difference === 0 ? 'Both seasons have the same season best.'
        : `${seasonB} season best is ${(Math.abs(difference) / 100).toFixed(2)} seconds ${difference < 0 ? 'faster' : 'slower'} than ${seasonA}.`}</p>
    </>
  );
}
