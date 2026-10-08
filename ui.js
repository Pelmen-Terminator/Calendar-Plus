import { toJDN, fromJDN, hebrewMonthDays, hebrewLeap, islamicMonthDays, HINDU_MONTH_DAYS } from './calendars.js';
import { ifcFromJDN, jdnFromIFC, ifcMonthDays } from './ifc.js';
import { gregorianToJDN, jdnToGregorian, persianMonthDays, copticMonthDays, mod } from './jdn.js';
import { holAt } from './holidays.js';
import { L } from './i18n.js';

const $ = s => document.querySelector(s);
const fl = Math.floor;

export function fmtIFC(j, lang, sol) {
  const o = ifcFromJDN(j);
  const t = L[lang];
  const img = sol === 'aug'
    ? t.img.map((_, i) => t.img[i === 6 ? 7 : i === 7 ? 6 : i])
    : t.img;
  return o.k === 'n'
    ? `${o.d} ${img[o.m - 1]} ${o.y}`
    : `${o.k === 'leap' ? t.leap : t.year}, ${o.y}`;
}

export function fmtCal(c, j, lang) {
  const t = L[lang];
  const [y, m, d] = fromJDN(c, j);
  if (c === 'g' || c === 'j') return `${d} ${t.mg[m - 1]} ${y}`;
  if (c === 'h') return `${d} ${t.hml[m - 1]} ${y}`;
  if (c === 'c') return `${t.jq[m - 1]}, ${d}`;
  if (c === 'i') return `${d} ${t.iml[m - 1]} ${y}`;
  if (c === 'm') return `${d} ${t.isml[m - 1]} ${y}`;
  if (c === 'p') return `${d} ${t.pml[m - 1]} ${y}`;
  if (c === 'k') return `${d} ${t.kml[m - 1]} ${y}`;
  return '';
}

export function buildWeekHeader(t) {
  return t.pw.map(w => `<div class="h">${w}</div>`).join('');
}

export function buildMonthOptions(c, y, lang, current) {
  const t = L[lang];
  let names;
  if (c === 'h') {
    const leap = hebrewLeap(y);
    names = t.hm.slice(0, leap ? 13 : 12);
  } else if (c === 'c') {
    names = t.jq.map((n, i) => `${i + 1}. ${n}`);
  } else if (c === 'i') {
    names = t.im2;
  } else if (c === 'm') {
    names = t.ism;
  } else if (c === 'p') {
    names = t.pm;
  } else if (c === 'k') {
    names = t.km;
  } else {
    names = t.m;
  }
  const opts = names.map((n, i) => `<option value="${i + 1}">${n}</option>`).join('');
  return { opts, count: names.length };
}

export function renderPicker(c, PV, R, lang, dir) {
  const t = L[lang];
  const cal = $('#pc');
  cal.setAttribute('dir', dir);
  if (c === 'c') {
    const { y, m } = PV;
    $('#pt').textContent = `${m}. ${t.jq[m - 1]} · ${y}`;
    let h = buildWeekHeader(t);
    for (let d = 1; d <= 15; d++) {
      const j = toJDN('c', y, m, d);
      h += `<button type="button" data-d="${d}" class="${j === R ? 'sel' : ''} ${holAt(j).length ? 'hol' : ''}">${d}</button>`;
    }
    cal.innerHTML = h;
    return;
  }
  if (c === 'h') {
    const { y, m } = PV;
    $('#pt').textContent = `${t.hm[m - 1]} ${y}`;
    const days = hebrewMonthDays(y, m);
    const firstJ = toJDN('h', y, m, 1);
    const off = ((firstJ + 1) % 7 + 6) % 7;
    let h = buildWeekHeader(t) + '<span></span>'.repeat(off);
    for (let d = 1; d <= days; d++) {
      const j = firstJ + d - 1;
      h += `<button type="button" data-d="${d}" class="${j === R ? 'sel' : ''} ${holAt(j).length ? 'hol' : ''}">${d}</button>`;
    }
    cal.innerHTML = h;
    return;
  }
  if (c === 'i') {
    const { y, m } = PV;
    $('#pt').textContent = `${t.im2[m - 1]} ${y}`;
    const days = HINDU_MONTH_DAYS[m - 1];
    const firstJ = toJDN('i', y, m, 1);
    const off = ((firstJ + 1) % 7 + 6) % 7;
    let h = buildWeekHeader(t) + '<span></span>'.repeat(off);
    for (let d = 1; d <= days; d++) {
      const j = firstJ + d - 1;
      h += `<button type="button" data-d="${d}" class="${j === R ? 'sel' : ''} ${holAt(j).length ? 'hol' : ''}">${d}</button>`;
    }
    cal.innerHTML = h;
    return;
  }
  if (c === 'm') {
    const { y, m } = PV;
    $('#pt').textContent = `${t.ism[m - 1]} ${y}`;
    const days = islamicMonthDays(y, m);
    const firstJ = toJDN('m', y, m, 1);
    const off = ((firstJ + 1) % 7 + 6) % 7;
    let h = buildWeekHeader(t) + '<span></span>'.repeat(off);
    for (let d = 1; d <= days; d++) {
      const j = firstJ + d - 1;
      h += `<button type="button" data-d="${d}" class="${j === R ? 'sel' : ''} ${holAt(j).length ? 'hol' : ''}">${d}</button>`;
    }
    cal.innerHTML = h;
    return;
  }
  if (c === 'p') {
    const { y, m } = PV;
    $('#pt').textContent = `${t.pm[m - 1]} ${y}`;
    const days = persianMonthDays(y, m);
    const firstJ = toJDN('p', y, m, 1);
    const off = ((firstJ + 1) % 7 + 6) % 7;
    let h = buildWeekHeader(t) + '<span></span>'.repeat(off);
    for (let d = 1; d <= days; d++) {
      const j = firstJ + d - 1;
      h += `<button type="button" data-d="${d}" class="${j === R ? 'sel' : ''} ${holAt(j).length ? 'hol' : ''}">${d}</button>`;
    }
    cal.innerHTML = h;
    return;
  }
  if (c === 'k') {
    const { y, m } = PV;
    $('#pt').textContent = `${t.km[m - 1]} ${y}`;
    const days = copticMonthDays(y, m);
    const firstJ = toJDN('k', y, m, 1);
    const off = ((firstJ + 1) % 7 + 6) % 7;
    let h = buildWeekHeader(t) + '<span></span>'.repeat(off);
    for (let d = 1; d <= days; d++) {
      const j = firstJ + d - 1;
      h += `<button type="button" data-d="${d}" class="${j === R ? 'sel' : ''} ${holAt(j).length ? 'hol' : ''}">${d}</button>`;
    }
    cal.innerHTML = h;
    return;
  }
  // Григ + Юл
  const { y, m } = PV;
  const s = toJDN(c, y, m, 1);
  const nx = m === 12 ? toJDN(c, y + 1, 1, 1) : toJDN(c, y, m + 1, 1);
  const n = nx - s;
  const off = ((s + 1) % 7 + 6) % 7;
  $('#pt').textContent = `${t.m[m - 1]} ${y} · ${c === 'g' ? t.gr : t.ju}`;
  let h = buildWeekHeader(t) + '<span></span>'.repeat(off);
  for (let d = 1; d <= n; d++) {
    const j = s + d - 1;
    h += `<button type="button" data-d="${d}" class="${j === R ? 'sel' : ''} ${holAt(j).length ? 'hol' : ''}">${d}</button>`;
  }
  cal.innerHTML = h;
}