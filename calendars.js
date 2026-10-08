import { gregorianToJDN, jdnToGregorian, julianToJDN, mod, isLeap } from './jdn.js';

const fl = Math.floor;

/* ============ Еврейский ============ */
function hebrewElapsedDays(y) {
  const monthsElapsed = fl((235 * y - 234) / 19);
  const partsElapsed = 12084 + 13753 * monthsElapsed;
  const day = monthsElapsed * 29 + fl(partsElapsed / 25920);
  if ((3 * (day + 1)) % 7 < 3) return day + 1;
  return day;
}
export function hebrewLeap(y) { return mod(7 * y + 1, 19) < 7; }
export function hebrewYearLength(y) { return hebrewElapsedDays(y + 1) - hebrewElapsedDays(y); }
export function hebrewMonthDays(y, m) {
  if (m === 2 || m === 4 || m === 6 || m === 10 || m === 13) return 29;
  if (m === 12 && !hebrewLeap(y)) return 29;
  if (m === 8 && hebrewYearLength(y) % 10 === 5) return 29;
  if (m === 9 && hebrewYearLength(y) % 10 === 3) return 29;
  return 30;
}
const HEBREW_EPOCH = 347995;
export function hebrewToJDN(y, m, d) {
  let jdn = HEBREW_EPOCH + hebrewElapsedDays(y) + d - 1;
  const leap = hebrewLeap(y);
  const lastMonth = leap ? 13 : 12;
  if (m < 7) {
    for (let i = 7; i <= lastMonth; i++) jdn += hebrewMonthDays(y, i);
    for (let i = 1; i < m; i++) jdn += hebrewMonthDays(y, i);
  } else {
    for (let i = 7; i < m; i++) jdn += hebrewMonthDays(y, i);
  }
  return jdn;
}
export function jdnToHebrew(J) {
  let y = fl((J - HEBREW_EPOCH) / 366) + 1;
  let guard = 0;
  while (hebrewToJDN(y + 1, 7, 1) <= J && guard++ < 10000) y++;
  guard = 0;
  while (hebrewToJDN(y, 7, 1) > J && guard++ < 10000) y--;
  const leap = hebrewLeap(y);
  const lastMonth = leap ? 13 : 12;
  const order = [7,8,9,10,11,12];
  if (leap) order.push(13);
  order.push(1,2,3,4,5,6);
  let m = 7;
  for (const mm of order) {
    const days = hebrewMonthDays(y, mm);
    if (J < hebrewToJDN(y, mm, 1) + days) { m = mm; break; }
  }
  const d = J - hebrewToJDN(y, m, 1) + 1;
  return [y, m, d];
}

/* ============ Китайский солнечный (24 сезона) ============ */
export function chineseToJDN(y, s, d) {
  const startOfYear = gregorianToJDN(y, 2, 4);
  return startOfYear + (s - 1) * 15 + (d - 1);
}
export function jdnToChinese(J) {
  const [gy] = jdnToGregorian(J);
  let y = gy;
  if (J < gregorianToJDN(gy, 2, 4)) y = gy - 1;
  const startOfYear = gregorianToJDN(y, 2, 4);
  const dayInYear = J - startOfYear;
  const s = mod(fl(dayInYear / 15), 24) + 1;
  const d = mod(dayInYear, 15) + 1;
  return [y, s, d];
}
export function chineseYearCycle(y) {
  const idx = mod(y - 1984, 60);
  return { gan: idx % 10, zhi: idx % 12, idx };
}

/* ============ Индуистский (упрощённый Викрам-самват) ============ */
const HINDU_MONTHS_DAYS = [30, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 30];
const HINDU_EPOCH = 1749630;
export function hinduIsLeap(y) { return ((y * 11 + 3) % 33) < 11; }
export function hinduToJDN(y, m, d) {
  let jdn = HINDU_EPOCH;
  for (let yy = 1; yy < y; yy++) jdn += 365 + (hinduIsLeap(yy) ? 1 : 0);
  for (let mm = 1; mm < m; mm++) jdn += HINDU_MONTHS_DAYS[mm - 1];
  if (m === 1 && hinduIsLeap(y)) jdn += 1;
  return jdn + d - 1;
}
export function jdnToHindu(J) {
  let y = 1;
  let guard = 0;
  while (hinduToJDN(y + 1, 1, 1) <= J && guard++ < 100000) y++;
  let rem = J - hinduToJDN(y, 1, 1);
  let m = 1;
  while (m < 12 && rem >= HINDU_MONTHS_DAYS[m - 1]) { rem -= HINDU_MONTHS_DAYS[m - 1]; m++; }
  return [y, m, rem + 1];
}
export const HINDU_MONTH_DAYS = HINDU_MONTHS_DAYS;

/* ============ Исламский (Хиджра, табличный) ============ */
const ISLAMIC_EPOCH = 1948440;
export function islamicToJDN(y, m, d) {
  return d + Math.ceil(29.5 * (m - 1)) + (y - 1) * 354 + fl((3 + 11 * y) / 30) + ISLAMIC_EPOCH - 1;
}
export function jdnToIslamic(J) {
  let y = fl((30 * (J - ISLAMIC_EPOCH) + 10646) / 10631);
  let guard = 0;
  while (islamicToJDN(y + 1, 1, 1) <= J && guard++ < 10000) y++;
  guard = 0;
  while (islamicToJDN(y, 1, 1) > J && guard++ < 10000) y--;
  let m = 1;
  while (m < 12 && islamicToJDN(y, m + 1, 1) <= J) m++;
  const d = J - islamicToJDN(y, m, 1) + 1;
  return [y, m, d];
}
export function islamicMonthDays(y, m) {
  return islamicToJDN(y, m + 1, 1) - islamicToJDN(y, m, 1);
}

/* ============ Экспорт единого JDN-конвертора ============ */
import { persianToJDN, jdnToPersian, copticToJDN, jdnToCoptic } from './jdn.js';

export function toJDN(c, y, m, d) {
  switch (c) {
    case 'g': return gregorianToJDN(y, m, d);
    case 'j': return julianToJDN(y, m, d);
    case 'h': return hebrewToJDN(y, m, d);
    case 'c': return chineseToJDN(y, m, d);
    case 'i': return hinduToJDN(y, m, d);
    case 'm': return islamicToJDN(y, m, d);
    case 'p': return persianToJDN(y, m, d);
    case 'k': return copticToJDN(y, m, d);
  }
  return gregorianToJDN(y, m, d);
}
export function fromJDN(c, J) {
  switch (c) {
    case 'g': return jdnToGregorian(J);
    case 'j': return jdnToJulian(J);
    case 'h': return jdnToHebrew(J);
    case 'c': return jdnToChinese(J);
    case 'i': return jdnToHindu(J);
    case 'm': return jdnToIslamic(J);
    case 'p': return jdnToPersian(J);
    case 'k': return jdnToCoptic(J);
  }
  return jdnToGregorian(J);
}
import { jdnToJulian } from './jdn.js';