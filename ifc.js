import { gregorianToJDN, jdnToGregorian, isLeap } from './jdn.js';

const fl = Math.floor;

// МФК: 13 месяцев по 28 дней + Високосный день после 28 июня
export function ifcFromJDN(J) {
  const [y] = jdnToGregorian(J);
  const doy = J - gregorianToJDN(y, 1, 1) + 1;
  const lp = isLeap(y);
  if (lp && doy === 169) return { y, k: 'leap', m: 6 };
  let n = doy;
  if (lp && doy > 169) n--;
  if (n === 365) return { y, k: 'year', m: 13 };
  return { y, k: 'n', m: fl((n - 1) / 28) + 1, d: (n - 1) % 28 + 1 };
}
export function jdnFromIFC(y, m, d, k) {
  const s = gregorianToJDN(y, 1, 1);
  const lp = isLeap(y);
  if (k === 'leap') return s + 168;
  if (k === 'year') return s + (lp ? 365 : 364);
  let n = (m - 1) * 28 + d;
  if (lp && n >= 169) n++;
  return s + n - 1;
}
export function ifcMonthDays(y, m) {
  if (m === 13) return 1;
  if (m === 6 && isLeap(y)) return 29;
  return 28;
}