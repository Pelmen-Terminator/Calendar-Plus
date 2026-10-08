import { gregorianToJDN, jdnToGregorian, isLeap } from './jdn.js';
import { ifcFromJDN } from './ifc.js';

const fl = Math.floor;

export function parseDateInput(s) {
  // s в формате YYYY-MM-DD
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!m) return null;
  return gregorianToJDN(+m[1], +m[2], +m[3]);
}

export function diffDetail(j1, j2, lang, t) {
  const [a, b] = j1 <= j2 ? [j1, j2] : [j2, j1];
  const days = b - a;
  const weeks = fl(days / 7);
  const remDays = days % 7;
  const [y1, m1, d1] = jdnToGregorian(a);
  const [y2, m2, d2] = jdnToGregorian(b);
  let years = y2 - y1;
  let months = m2 - m1;
  let dd = d2 - d1;
  if (dd < 0) { months--; dd += daysInGregorianMonth(y1 + years, m2 === 1 ? 12 : m2 - 1); }
  if (months < 0) { years--; months += 12; }
  const ifc1 = ifcFromJDN(a);
  const ifc2 = ifcFromJDN(b);
  const ifcDays = (ifc2.y - ifc1.y) * 365 + (ifc2.m - ifc1.m) * 28 + ((ifc2.d || 1) - (ifc1.d || 1));
  return { days, weeks, remDays, years, months, dd, ifcDays, a, b };
}

function daysInGregorianMonth(y, m) {
  if (m === 2) return isLeap(y) ? 29 : 28;
  if ([4,6,9,11].includes(m)) return 30;
  return 31;
}

export function renderDiff(j1, j2, lang, t, fmtCal) {
  const r = diffDetail(j1, j2, lang, t);
  return `${t.dDiff}: <b>${r.days}</b> ${t.dDays} (${r.weeks} ${t.dWeeks} ${r.remDays} ${t.dDays})<br>` +
    `${t.dYMD}: <b>${r.years}</b> ${t.dYears}, <b>${r.months}</b> ${t.dMonths}, <b>${r.dd}</b> ${t.dDays}<br>` +
    `${t.dIFC}: <b>${r.ifcDays}</b> ${t.dDays}`;
}