import { useId, useState } from 'react';
import { formatSwimTime, summarizeEvent, getSeasonResults } from '../utils/performance.js';

function formatDate(date, options) {
  return new Intl.DateTimeFormat('en-US', { ...options, timeZone: 'UTC' })
    .format(new Date(`${date}T00:00:00Z`));
}

function describeChange(change, comparing = false) {
  if (change === null) return comparing ? 'First result in this season; no previous result for this season.' : 'First result in this view; no previous result shown.';
  return `Change vs previous: ${change > 0 ? '+' : ''}${(change / 100).toFixed(2)} sec (${change < 0 ? 'faster' : change > 0 ? 'slower' : 'unchanged'})`;
}

export default function ProgressionChart({ results, event, personalBest, comparisonSeasons }) {
  const titleId = useId();
  const descriptionId = useId();
  const [hoveredId, setHoveredId] = useState(null);
  const [focusedId, setFocusedId] = useState(null);
  const history = [...results].sort((a, b) => a.date.localeCompare(b.date));

  if (history.length === 0) return <p>No results available for this event.</p>;

  const { best: visibleBest } = summarizeEvent(history);
  const best = personalBest ?? visibleBest;
  const slowest = Math.max(...history.map((result) => result.timeSeconds));
  // Padding also gives equal-time or single-result histories a nonzero scale.
  const padding = Math.max((slowest - visibleBest) * 0.2, 0.05);
  const minimum = Math.max(0, visibleBest - padding);
  const maximum = slowest + padding;
  const left = 88;
  const right = 430;
  const top = 40;
  const bottom = 230;
  const firstDate = Date.parse(history[0].date);
  const lastDate = Date.parse(history[history.length - 1].date);
  const multipleYears = new Set(history.map((result) => result.date.slice(0, 4))).size > 1;
  const series = comparisonSeasons ? comparisonSeasons.map((season) => getSeasonResults(history, season)) : [history];
  const meetCount = Math.max(...series.map((entries) => entries.length));
  const meetX = (index) => meetCount === 1 ? (left + right) / 2 : left + index / (meetCount - 1) * (right - left);
  const points = series.flatMap((entries, seriesIndex) => entries.map((result, index) => ({
    ...result,
    seriesIndex,
    fullDate: formatDate(result.date, { month: 'long', day: 'numeric', year: 'numeric' }),
    shortDate: formatDate(result.date, { month: 'short', day: 'numeric' }),
    // Subtract integer hundredths to avoid floating-point artifacts and negative zero.
    change: index === 0 ? null : Math.round(result.timeSeconds * 100) - Math.round(entries[index - 1].timeSeconds * 100),
    pbDifference: Math.max(0, Math.round(result.timeSeconds * 100) - Math.round(best * 100)),
    x: comparisonSeasons ? meetX(index) : lastDate === firstDate ? (left + right) / 2
      : left + (Date.parse(result.date) - firstDate) / (lastDate - firstDate) * (right - left),
    // SVG y increases downward: lower (faster) times belong nearer the top.
    y: top + (result.timeSeconds - minimum) / (maximum - minimum) * (bottom - top),
  })));
  // Only resolve interactions against the currently displayed swimmer/event results.
  const activePoint = points.find((point) => point.id === hoveredId)
    ?? points.find((point) => point.id === focusedId);
  // Reserve space for the final label; omit crowded ticks, never data points.
  const labeledIds = new Set([points[0].id, points.at(-1).id]);
  let lastLabelX = points[0].x;
  for (const point of points.slice(1, -1)) {
    if (point.x - lastLabelX >= 80 && points.at(-1).x - point.x >= 80) {
      labeledIds.add(point.id);
      lastLabelX = point.x;
    }
  }

  return (
    <figure className="progression-chart">
      <figcaption>{event} progression — faster times appear higher. PB = personal best across all seasons. Changes compare consecutive results {comparisonSeasons ? 'within the same season' : 'in this view'}.</figcaption>
      {comparisonSeasons && <ul className="chart-legend" aria-label="Season legend">
        {comparisonSeasons.map((season, index) => <li key={season}>{season}: {index === 0 ? 'solid purple line, circles' : 'dashed gray-purple line, squares'}</li>)}
      </ul>}
      <svg viewBox="0 0 480 300" role="group" aria-labelledby={`${titleId} ${descriptionId}`}>
        <title id={titleId}>{event} swimming time progression</title>
        <desc id={descriptionId}>Results are connected from oldest to newest, {comparisonSeasons ? 'aligned by meet order within each season on one shared time scale.' : 'spaced by date.'}
          Faster times appear higher on the padded time scale. Personal best: {formatSwimTime(best)}.
          Full meet names, dates, and times are listed below.</desc>
        <text x={left} y="20" className="chart-axis-label">Time (faster ↑)</text>
        {Array.from({ length: 5 }, (_, index) => {
          const time = minimum + (maximum - minimum) * index / 4;
          const y = top + (bottom - top) * index / 4;
          return (
            <g key={index}>
              <line className="chart-grid" x1={left} x2={right} y1={y} y2={y} />
              <text x={left - 10} y={y} textAnchor="end" dominantBaseline="middle">{formatSwimTime(time)}</text>
            </g>
          );
        })}
        <path className="chart-axis" d={`M ${left} ${top} V ${bottom} H ${right}`} />
        <>{series.map((entries, index) => <polyline key={index} className={index === 1 ? 'chart-line chart-series-b' : 'chart-line'} points={points.filter((point) => point.seriesIndex === index).map(({ x, y }) => `${x},${y}`).join(' ')} />)}</>
        {points.map((result) => (
          <g key={result.id}>
            <g className={`chart-point-target${result.seriesIndex === 1 ? ' chart-series-b' : ''}${activePoint?.id === result.id ? ' is-active' : ''}`}
              tabIndex="0" role="button"
              onMouseEnter={() => setHoveredId(result.id)} onMouseLeave={() => setHoveredId(null)}
              onFocus={() => setFocusedId(result.id)} onBlur={() => setFocusedId(null)}
              onClick={(event) => event.currentTarget.focus()}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  setFocusedId(result.id);
                }
              }}
              aria-label={`${comparisonSeasons ? `Season ${result.season}. ` : ''}${result.meet}, ${result.fullDate}. Time: ${formatSwimTime(result.timeSeconds)}. ${result.timeSeconds === best ? 'Personal Best.' : `Not a personal best. Difference from PB: +${(result.pbDifference / 100).toFixed(2)} sec.`} ${describeChange(result.change, !!comparisonSeasons)}`}>
              <title>{result.meet} — {result.date}: {formatSwimTime(result.timeSeconds)}{result.timeSeconds === best ? ' (PB)' : ''}</title>
              <circle className="chart-hit-area" cx={result.x} cy={result.y} r="16" />
              <>{result.seriesIndex === 1 ? <rect className="chart-point" x={result.x - 6} y={result.y - 6} width="12" height="12" /> : <circle className="chart-point" cx={result.x} cy={result.y} r={activePoint?.id === result.id ? 7 : 5} />}</>
            </g>
            {result.timeSeconds === best && <text className="chart-pb" x={result.x} y={result.y - 13} textAnchor="middle">PB</text>}
            {!comparisonSeasons && labeledIds.has(result.id) && <text x={result.x} y={bottom + 24} textAnchor="middle">{result.shortDate}
              {multipleYears && <tspan x={result.x} dy="16">{result.date.slice(0, 4)}</tspan>}
            </text>}
          </g>
        ))}
        {comparisonSeasons && Array.from({ length: meetCount }, (_, index) => <text key={index} x={meetX(index)} y={bottom + 24} textAnchor="middle">Meet {index + 1}</text>)}
        <text className="chart-axis-label" x={(left + right) / 2} y="292" textAnchor="middle">{comparisonSeasons ? 'Meet order within season' : 'Meet date'}</text>
      </svg>
      <div className="chart-details" aria-live="polite" aria-atomic="true">
        {activePoint ? (
          <>
            <strong>{activePoint.meet}</strong>
            {comparisonSeasons && <p>Season: {activePoint.season}</p>}
            <p>{activePoint.fullDate}</p>
            <p>Time: <strong>{formatSwimTime(activePoint.timeSeconds)}</strong></p>
            <p>{activePoint.timeSeconds === best ? 'Personal Best' : 'Not a personal best'}</p>
            <p>{describeChange(activePoint.change, !!comparisonSeasons)}</p>
            {(comparisonSeasons || activePoint.timeSeconds !== best) && <p>Difference from PB: +{(activePoint.pbDifference / 100).toFixed(2)} sec</p>}
          </>
        ) : <p>Hover, tap, or focus a point to inspect its performance details.</p>}
      </div>
      <ol>{history.map((result) => (
        <li key={result.id}>{comparisonSeasons && `${result.season}: `}{result.date} — {result.meet}: <strong>{formatSwimTime(result.timeSeconds)}</strong>
          {result.timeSeconds === best && ' (PB)'}</li>
      ))}</ol>
    </figure>
  );
}
