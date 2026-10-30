import { useState } from 'react';

export default function TimeSelector({ id, label, value, onChange, minuteStep = 5 }) {
  const [hour, setHour] = useState(value ? String(Number(value.slice(0, 2)) % 12 || 12) : '');
  const [minute, setMinute] = useState(value ? value.slice(3) : '');
  const [period, setPeriod] = useState(value ? (Number(value.slice(0, 2)) < 12 ? 'AM' : 'PM') : '');

  function update(nextHour, nextMinute, nextPeriod) {
    setHour(nextHour);
    setMinute(nextMinute);
    setPeriod(nextPeriod);
    if (!nextHour || !nextMinute || !nextPeriod) {
      onChange('');
      return;
    }
    const hours24 = Number(nextHour) % 12 + (nextPeriod === 'PM' ? 12 : 0);
    onChange(`${String(hours24).padStart(2, '0')}:${nextMinute}`);
  }

  return (
    <div>
      <span className="time-selector-label" id={`${id}-label`}>{label}</span>
      <div className="time-selector" role="group" aria-labelledby={`${id}-label`}>
        <select required aria-label={`${label} hour`} value={hour}
          onChange={(event) => update(event.target.value, minute, period)}>
          <option value="">Hour</option>
          {Array.from({ length: 12 }, (_, index) => index + 1).map((number) => (
            <option key={number} value={number}>{number}</option>
          ))}
        </select>
        <select required aria-label={`${label} minute`} value={minute}
          onChange={(event) => update(hour, event.target.value, period)}>
          <option value="">Minute</option>
          {Array.from({ length: 60 / minuteStep }, (_, index) => String(index * minuteStep).padStart(2, '0')).map((number) => (
            <option key={number} value={number}>{number}</option>
          ))}
        </select>
        <select required aria-label={`${label} AM or PM`} value={period}
          onChange={(event) => update(hour, minute, event.target.value)}>
          <option value="">AM/PM</option>
          <option value="AM">AM</option>
          <option value="PM">PM</option>
        </select>
      </div>
    </div>
  );
}
