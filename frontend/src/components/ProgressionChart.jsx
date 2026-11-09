import { useId } from 'react';
import { formatSwimTime, summarizeEvent } from '../utils/performance.js';

export default function ProgressionChart({ results, event }) {
  const titleId = useId();
  const descriptionId = useId();
  const history = [...results].sort((a, b) => a.date.localeCompare(b.date));

  if (history.length === 0) return <p>No results available for this event.</p>;

  const { best } = summarizeEvent(history);
  const slowest = Math.max(...history.map((result) => result.timeSeconds));
  // Padding also gives equal-time or single-result histories a nonzero scale.
  const padding = Math.max((slowest - best) * 0.2, 0.05);
  const minimum = Math.max(0, best - padding);
  const maximum = slowest + padding;
  const left = 88;
  const right = 430;
  const top = 40;
  const bottom = 230;
  const firstDate = Date.parse(history[0].date);
  const lastDate = Date.parse(history[history.length - 1].date);
  const points = history.map((result) => ({
    ...result,
    x: lastDate === firstDate ? (left + right) / 2
      : left + (Date.parse(result.date) - firstDate) / (lastDate - firstDate) * (right - left),
    // SVG y increases downward: lower (faster) times belong nearer the top.
    y: top + (result.timeSeconds - minimum) / (maximum - minimum) * (bottom - top),
  }));

  return (
    <figure className="progression-chart">
      <figcaption>{event} progression — faster times appear higher. PB = personal best.</figcaption>
      <svg viewBox="0 0 480 300" role="img" aria-labelledby={`${titleId} ${descriptionId}`}>
        <title id={titleId}>{event} swimming time progression</title>
        <desc id={descriptionId}>Results are connected from oldest to newest, spaced by date.
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
        <polyline className="chart-line" points={points.map(({ x, y }) => `${x},${y}`).join(' ')} />
        {points.map((result) => (
          <g key={result.id}>
            <circle className="chart-point" cx={result.x} cy={result.y} r="5" tabIndex="0"
              aria-label={`${result.meet}, ${result.date}: ${formatSwimTime(result.timeSeconds)}${result.timeSeconds === best ? ', personal best' : ''}`}>
              <title>{result.meet} — {result.date}: {formatSwimTime(result.timeSeconds)}{result.timeSeconds === best ? ' (PB)' : ''}</title>
            </circle>
            {result.timeSeconds === best && <text className="chart-pb" x={result.x} y={result.y - 13} textAnchor="middle">PB</text>}
            <text x={result.x} y={bottom + 24} textAnchor="middle">{result.date.slice(5)}</text>
          </g>
        ))}
        <text className="chart-axis-label" x={(left + right) / 2} y="282" textAnchor="middle">Meet date (month-day)</text>
      </svg>
      <ol>{history.map((result) => (
        <li key={result.id}>{result.date} — {result.meet}: <strong>{formatSwimTime(result.timeSeconds)}</strong>
          {result.timeSeconds === best && ' (PB)'}</li>
      ))}</ol>
    </figure>
  );
}
