import { useEffect, useState } from 'react';

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
    </main>
  );
}
