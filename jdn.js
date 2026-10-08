// JDN (Julian Day Number) — общий знаменатель для всех календарей
const fl = Math.floor;
export const mod = (a, n) => ((a % n) + n) % n;
export const isLeap = y => y % 4 === 0 && (y % 100 !== 0 || y % 400 === 0);

// ——— Григорианский / Юлианский ———
export function gregorianToJDN(y, m, d) {
  const a = fl((14 - m) / 12);
  const yy = y + 4800 - a;
  const mm = m + 12 * a - 3;
  const j = d + fl((153 * mm + 2) / 5) + 365 * yy + fl(yy / 4);
  return j - fl(yy / 100) + fl(yy / 400) - 32045;
}
export function julianToJDN(y, m, d) {
  const a = fl((14 - m) / 12);
  const yy = y + 4800 - a;
  const mm = m + 12 * a - 3;
  return d + fl((153 * mm + 2) / 5) + 365 * yy + fl(yy / 4) - 32083;
}
export function jdnToGregorian(J) {
  let f = J + 1401 + fl(fl((4 * J + 274277) / 146097) * 3 / 4) - 38;
  const e = 4 * f + 3;
  const g = fl((e % 1461) / 4);
  const h = 5 * g + 2;
  const D = fl((h % 153) / 5) + 1;
  const M = (fl(h / 153) + 2) % 12 + 1;
  return [fl(e / 1461) - 4716 + fl((14 - M) / 12), M, D];
}
export function jdnToJulian(J) {
  let f = J + 1401;
  const e = 4 * f + 3;
  const g = fl((e % 1461) / 4);
  const h = 5 * g + 2;
  const D = fl((h % 153) / 5) + 1;
  const M = (fl(h / 153) + 2) % 12 + 1;
  return [fl(e / 1461) - 4716 + fl((14 - M) / 12), M, D];
}

// ——— Персидский (Solar Hijri) — алгоритм Д. и Р., 33-летний цикл ———
export function persianToJDN(y, m, d) {
  const epBase = y - (y >= 0 ? 474 : 473);
  const epYear = 474 + mod(epBase, 2820);
  return d +
    (m <= 7 ? (m - 1) * 31 : (m - 1) * 30 + 6) +
    fl((epYear * 682 - 110) / 2816) +
    (epYear - 1) * 365 +
    fl(epBase / 2820) * 1029983 +
    (1948320 - 1);
}
export function jdnToPersian(J) {
  const depoch = J - persianToJDN(475, 1, 1);
  const cycle = fl(depoch / 1029983);
  const cyear = mod(depoch, 1029983);
  let ycycle;
  if (cyear === 1029982) ycycle = 2820;
  else {
    const aux1 = fl(cyear / 366);
    const aux2 = mod(cyear, 366);
    ycycle = fl((2134 * aux1 + 2816 * aux2 + 2815) / 1028522) + aux1 + 1;
  }
  let y = ycycle + 2820 * cycle + 474;
  if (y <= 0) y--;
  const yday = J - persianToJDN(y, 1, 1) + 1;
  const m = yday <= 186 ? Math.ceil(yday / 31) : Math.ceil((yday - 6) / 30);
  const d = J - persianToJDN(y, m, 1) + 1;
  return [y, m, d];
}
export function persianMonthDays(y, m) { return m <= 6 ? 31 : (m <= 11 ? 30 : (isPersianLeap(y) ? 30 : 29)); }
export function isPersianLeap(y) {
  return mod(((y - (y > 0 ? 474 : 473)) % 2820 + 474 + 38) * 682, 2816) < 682;
}

// ——— Коптский (13 месяцев: 12×30 + 5-6 эпагомен) ———
const COPTIC_EPOCH = 1824665; // 29 августа 284 г. н.э. (JDN)
export function copticToJDN(y, m, d) {
  return COPTIC_EPOCH - 1 + 365 * (y - 1) + fl(y / 4) + 30 * (m - 1) + d;
}
export function jdnToCoptic(J) {
  const y = fl((4 * (J - COPTIC_EPOCH) + 1463) / 1461);
  const m = fl((J - copticToJDN(y, 1, 1)) / 30) + 1;
  const d = J + 1 - copticToJDN(y, m, 1);
  return [y, m, d];
}
export function copticMonthDays(y, m) {
  if (m < 13) return 30;
  return mod(y, 4) === 3 ? 6 : 5; // високосный коптский год — 6-й эпагомен
}