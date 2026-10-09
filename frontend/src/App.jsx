import { useEffect, useState } from 'react';
import { mockSchedules } from './data/mockSchedules.js';

const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const transitionOptions = [0, 5, 10, 15, 30];

const candidateWindows = [
  { startTime: '06:00', endTime: '07:30' },
  { startTime: '09:00', endTime: '10:30' },
  { startTime: '11:00', endTime: '12:30' },
  { startTime: '13:00', endTime: '14:30' },
  { startTime: '15:00', endTime: '16:30' },
  { startTime: '17:00', endTime: '18:30' },
];

function formatTime(time) {
  const [hours, minutes] = time.split(':');
  const hour = Number(hours);
  return `${hour % 12 || 12}:${minutes} ${hour < 12 ? 'AM' : 'PM'}`;
}

export default function App() {
  const [status, setStatus] = useState('Checking...');
  const [day, setDay] = useState(weekdays[0]);
  const [practiceStartTime, setPracticeStartTime] = useState('');
  const [practiceEndTime, setPracticeEndTime] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(false);
  const [transitionMinutes, setTransitionMinutes] = useState(0);
  const [rankingDay, setRankingDay] = useState(weekdays[0]);
  const [rankedWindows, setRankedWindows] = useState(null);
  const [rankingError, setRankingError] = useState('');
  const [ranking, setRanking] = useState(false);
  const [rankingTransitionMinutes, setRankingTransitionMinutes] = useState(0);

  async function rankWindows(event) {
    event.preventDefault();
    setRankedWindows(null);
    setRankingError('');
    setRanking(true);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch('/api/rank-practice-windows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          swimmers: mockSchedules, day: rankingDay, candidateWindows,
          transitionMinutes: rankingTransitionMinutes,
        }),
        signal: controller.signal,
      });
      if (!response.ok) throw new Error('Ranking request failed');
      setRankedWindows(await response.json());
    } catch {
      setRankingError('Could not rank practice windows. Make sure the backend is running and try again.');
    } finally {
      clearTimeout(timeout);
      setRanking(false);
    }
  }

  function clearResult() {
    setResult(null);
    setError('');
  }

  async function checkConflicts(event) {
    event.preventDefault();
    clearResult();
    setChecking(true);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch('/api/conflicts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ swimmers: mockSchedules, day, practiceStartTime, practiceEndTime, transitionMinutes }),
        signal: controller.signal,
      });
      if (!response.ok) {
        if (response.status === 422) {
          throw new Error('Please check the practice times. The end must be after the start on the same day.');
        }
        throw new Error('Could not check conflicts. Make sure the backend is running and try again.');
      }
      setResult(await response.json());
    } catch (error) {
      setError(error.name === 'AbortError'
        ? 'The request took too long. Check that the backend is running and try again.'
        : error instanceof TypeError
          ? 'Could not reach the backend. Make sure it is running and try again.'
          : error.message);
    } finally {
      clearTimeout(timeout);
      setChecking(false);
    }
  }

  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    let active = true;

    async function checkBackend() {
      try {
        const response = await fetch('/api/health', { signal: controller.signal });
        if (!response.ok) throw new Error('Health request failed');
        const data = await response.json();
        if (data.status !== 'ok') throw new Error('Unexpected health response');
        if (active) setStatus('Connected');
      } catch {
        if (active) setStatus('Unavailable — start the backend and refresh this page.');
      } finally {
        clearTimeout(timeout);
      }
    }

    checkBackend();
    return () => {
      active = false;
      clearTimeout(timeout);
      controller.abort();
    };
  }, []);

  return (
    <main>
      <h1>UE Swimming &amp; Diving Scheduling and Performance Platform</h1>
      <p role="status">Backend: {status}</p>
      <h2>Mock swimmer schedules</h2>
      <p>All swimmers and classes below are fictional.</p>
      {mockSchedules.map((swimmer) => (
        <section key={swimmer.id}>
          <h3>{swimmer.name}</h3>
          <ul>
            {swimmer.classes.map((entry) => (
              <li key={`${entry.day}-${entry.startTime}-${entry.endTime}`}>
                {entry.day}: {formatTime(entry.startTime)}–{formatTime(entry.endTime)}
                {entry.label ? ` — ${entry.label}` : ''}
              </li>
            ))}
          </ul>
        </section>
      ))}
      <section>
        <h2>Check a Practice Time</h2>
        <form onSubmit={checkConflicts}>
          <fieldset disabled={checking}>
            <legend>Proposed practice</legend>
            <p>
              <label htmlFor="practice-day">Weekday: </label>
              <select id="practice-day" value={day} onChange={(event) => {
                setDay(event.target.value);
                clearResult();
              }}>
                {weekdays.map((weekday) => <option key={weekday}>{weekday}</option>)}
              </select>
            </p>
            <p>
              <label htmlFor="practice-start">Start time: </label>
              <input id="practice-start" type="time" required step="60"
                value={practiceStartTime} onChange={(event) => {
                  setPracticeStartTime(event.target.value);
                  clearResult();
                }} />
            </p>
            <p>
              <label htmlFor="practice-end">End time: </label>
              <input id="practice-end" type="time" required step="60"
                value={practiceEndTime} onChange={(event) => {
                  setPracticeEndTime(event.target.value);
                  clearResult();
                }} />
            </p>
            <p>
              <label htmlFor="practice-transition">Required transition time: </label>
              <select id="practice-transition" value={transitionMinutes} onChange={(event) => {
                setTransitionMinutes(Number(event.target.value));
                clearResult();
              }}>
                {transitionOptions.map((minutes) => (
                  <option key={minutes} value={minutes}>{minutes} minutes</option>
                ))}
              </select>
            </p>
            <button type="submit">Check Conflicts</button>
          </fieldset>
        </form>
        {checking && <p role="status">Checking conflicts...</p>}
        {error && <p role="alert">{error}</p>}
        <div aria-live="polite">
          {result && (
            <>
              <p>Conflict count: {result.conflict_count}</p>
              {result.conflict_count === 0 ? (
                <p>No swimmers have a conflict with this practice time.</p>
              ) : (
                <ul>
                  {result.conflicting_swimmers.map((swimmer) => (
                    <li key={swimmer.id}>{swimmer.name}</li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
      </section>
      <section>
        <h2>Rank Practice Windows</h2>
        <form onSubmit={rankWindows}>
          <fieldset disabled={ranking}>
            <legend>Practice window ranking</legend>
            <p>
              <label htmlFor="ranking-day">Weekday: </label>
              <select id="ranking-day" value={rankingDay} onChange={(event) => {
                setRankingDay(event.target.value);
                setRankedWindows(null);
                setRankingError('');
              }}>
                {weekdays.map((weekday) => <option key={weekday}>{weekday}</option>)}
              </select>
            </p>
            <p>
              <label htmlFor="ranking-transition">Required transition time: </label>
              <select id="ranking-transition" value={rankingTransitionMinutes} onChange={(event) => {
                setRankingTransitionMinutes(Number(event.target.value));
                setRankedWindows(null);
                setRankingError('');
              }}>
                {transitionOptions.map((minutes) => (
                  <option key={minutes} value={minutes}>{minutes} minutes</option>
                ))}
              </select>
            </p>
            <button type="submit">Rank Practice Windows</button>
          </fieldset>
        </form>
        {ranking && <p role="status">Ranking practice windows...</p>}
        {rankingError && <p role="alert">{rankingError}</p>}
        <div aria-live="polite">
          {rankedWindows && (
            <table className="ranking-table">
              <caption>Ranked practice windows for {rankingDay}</caption>
              <thead>
                <tr>
                  <th scope="col">Rank</th>
                  <th scope="col">Practice Time</th>
                  <th scope="col">Conflict Count</th>
                  <th scope="col">Conflicting Swimmers</th>
                </tr>
              </thead>
              <tbody>
                {rankedWindows.map((window, index) => (
                  <tr key={`${window.startTime}-${window.endTime}`}>
                    <td>{index + 1}</td>
                    <td>{formatTime(window.startTime)}–{formatTime(window.endTime)}</td>
                    <td>{window.conflict_count}</td>
                    <td>{window.conflicting_swimmers.length === 0
                      ? 'None'
                      : window.conflicting_swimmers.map((swimmer) => swimmer.name).join(', ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </main>
  );
}
