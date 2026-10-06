import { useEffect, useState } from 'react';
import { mockSchedules } from './data/mockSchedules.js';

export default function App() {
  const [status, setStatus] = useState('Checking...');

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
      <p>All swimmers and classes below are fictional. Times use 24-hour format.</p>
      {mockSchedules.map((swimmer) => (
        <section key={swimmer.id}>
          <h3>{swimmer.name}</h3>
          <ul>
            {swimmer.classes.map((entry) => (
              <li key={`${entry.day}-${entry.startTime}-${entry.endTime}`}>
                {entry.day}: {entry.startTime}–{entry.endTime}
                {entry.label ? ` — ${entry.label}` : ''}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </main>
  );
}
