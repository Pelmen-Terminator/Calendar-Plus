import { fromJDN } from './calendars.js';
import { hols } from './holidays.js';

function pad(n) { return String(n).padStart(2, '0'); }

function jdnToICSDate(j) {
  const [y, m, d] = fromJDN('g', j);
  return `${y}${pad(m)}${pad(d)}`;
}

function esc(s) {
  return s.replace(/[\\,;]/g, '\\$&').replace(/\n/g, '\\n');
}

export function buildICS(year, holidays, t) {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//IFC Calendar//v1.6//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH'
  ];
  const stamp = new Date().toISOString().replace(/[-:.]/g, '').slice(0, 15) + 'Z';
  for (const h of holidays) {
    const date = jdnToICSDate(h.j);
    const next = jdnToICSDate(h.j + 1);
    lines.push(
      'BEGIN:VEVENT',
      `UID:ifc-${h.j}-${h.k}@ifc-calendar`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${date}`,
      `DTEND;VALUE=DATE:${next}`,
      `SUMMARY:${esc(t.H[h.k])}`,
      'TRANSP:TRANSPARENT',
      'END:VEVENT'
    );
  }
  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

export function downloadICS(year, t) {
  const holidays = hols(year);
  const ics = buildICS(year, holidays, t);
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ifc-holidays-${year}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}