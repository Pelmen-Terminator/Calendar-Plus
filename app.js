import { toJDN, fromJDN, hebrewLeap, hebrewMonthDays, HINDU_MONTH_DAYS, islamicMonthDays } from './calendars.js';
import { ifcFromJDN, ifcMonthDays } from './ifc.js';
import { gregorianToJDN, jdnToGregorian, persianMonthDays, copticMonthDays, mod } from './jdn.js';
import { hols, holAt } from './holidays.js';
import { L, LANGS, detectLang } from './i18n.js';
import { fmtIFC, fmtCal, renderPicker, buildMonthOptions } from './ui.js';
import { downloadICS } from './ics.js';
import { parseDateInput, renderDiff } from './diff.js';
import { readState, writeState, shareDate, copyText, toast } from './router.js';

const $ = s => document.querySelector(s);
const fl = Math.floor;

/* ============ Состояние ============ */
let lang = detectLang();
let theme = null;
let sol = 'aug';
let S, R, PV, IV;
const CAL_KEYS = ['g','j','c','h','i','m','p','k'];

try {
  lang = localStorage.getItem('lang') || lang;
  theme = localStorage.getItem('theme');
  sol = localStorage.getItem('sol') || sol;
} catch (e) {}

if (!LANGS.some(l => l.code === lang)) lang = 'en';
const T = () => L[lang];
const dark = () => theme ? theme === 'dark' : matchMedia('(prefers-color-scheme:dark)').matches;
const today = () => {
  const n = new Date();
  return gregorianToJDN(n.getFullYear(), n.getMonth() + 1, n.getDate());
};

{
  const t = jdnToGregorian(today());
  S = { c: 'g', y: t[0], m: t[1], d: t[2] };
  PV = { y: t[0], m: t[1] };
  R = today();
  IV = { y: t[0], m: ifcFromJDN(R).m };
}

/* ============ head() ============ */
function head() {
  const t = T();
  const cur = LANGS.find(l => l.code === lang);
  document.documentElement.lang = lang;
  document.documentElement.dir = cur.dir;
  document.documentElement.dataset.theme = dark() ? 'dark' : 'light';
  document.body.dir = cur.dir;
  document.title = t.ttl;
  $('#ttl').textContent = t.ttl;
  ['t_in', 't_pk', 't_res', 't_hl', 't_yr', 't_diff'].forEach(i => $('#' + i).textContent = t[i]);
  $('#cg').textContent = t.cg;
  $('#cj').textContent = t.cj;
  $('#cc').textContent = t.cc;
  $('#ch').textContent = t.ch;
  $('#ci').textContent = t.ci;
  $('#cm').textContent = t.cm;
  $('#cp').textContent = t.cp;
  $('#ck').textContent = t.ck;
  $('#go').textContent = t.go;
  $('#lg').textContent = t.legend;
  $('#nt').textContent = t.note;
  $('#bs').textContent = sol === 'aug' ? t.s2 : t.s1;
  $('#bt').textContent = dark() ? t.tn : t.tl;
  $('#bcopy').textContent = t.copy;
  $('#bshare').textContent = t.share;
  $('#bics').textContent = t.ics;
  CAL_KEYS.forEach(k => {
    const el = $('#c' + k);
    if (el) el.className = S.c === k ? 'on' : '';
  });
  buildLangMenu();
  refreshMonthOptions();
  $('#fd').value = S.d;
  $('#fm').value = S.m;
  $('#fy').value = S.y;
}

function buildLangMenu() {
  const t = T();
  const menu = $('#lm');
  menu.innerHTML = LANGS.map(l =>
    `<button class="lang-item ${l.code === lang ? 'on' : ''}" data-lang="${l.code}" type="button" role="menuitem">
      <span class="fl">${l.flag}</span>
      <span class="nm">${l.name}</span>
      <span class="cd">${l.code}</span>
    </button>`
  ).join('');
  const cur = LANGS.find(l => l.code === lang);
  $('#bl').innerHTML = `<span style="font-size:1.1rem">${cur.flag}</span> ${t.lb} ▾`;
}

function refreshMonthOptions() {
  const { opts } = buildMonthOptions(S.c, S.y, lang, S.m);
  $('#fm').innerHTML = opts;
  if (+$('#fm').value !== S.m) $('#fm').value = S.m;
}

/* ============ Календари ============ */
function picker() {
  const cur = LANGS.find(l => l.code === lang);
  renderPicker(S.c, PV, R, lang, cur.dir);
}

function cellHTML(j, txt, extra) {
  const t = T();
  const hs = holAt(j);
  const title = `${fmtCal('g', j, lang)}${hs.length ? ' — ' + hs.map(q => t.H[q.k]).join(', ') : ''}`;
  return `<button type="button" data-j="${j}" class="${j === R ? 'sel' : ''} ${j === today() ? 'td' : ''} ${hs.length ? 'hol' : ''} ${extra || ''}" title="${title}">${txt}</button>`;
}

function grid() {
  const t = T(), { y, m } = IV, lp = (y % 4 === 0 && (y % 100 !== 0 || y % 400 === 0));
  const img = sol === 'aug' ? t.im.map((_, i) => t.im[i === 6 ? 7 : i === 7 ? 6 : i]) : t.im;
  $('#it').textContent = `${img[m - 1]} ${y}`;
  let h = t.ws.map(w => `<div class="h">${w}</div>`).join('');
  for (let d = 1; d <= 28; d++) h += cellHTML(ifcMonthJ(y, m, d), d);
  if (m === 6 && lp) h += cellHTML(gregorianToJDN(y, 1, 1) + 168, t.leap, 'x');
  if (m === 13) h += cellHTML(gregorianToJDN(y, 1, 1) + (lp ? 365 : 364), t.year, 'x');
  $('#ic').innerHTML = h;
}
function ifcMonthJ(y, m, d) {
  const s = gregorianToJDN(y, 1, 1);
  const lp = (y % 4 === 0 && (y % 100 !== 0 || y % 400 === 0));
  let n = (m - 1) * 28 + d;
  if (lp && n >= 169) n++;
  return s + n - 1;
}

function yearGrid() {
  const t = T(), y = IV.y, lp = (y % 4 === 0 && (y % 100 !== 0 || y % 400 === 0));
  const img = sol === 'aug' ? t.im.map((_, i) => t.im[i === 6 ? 7 : i === 7 ? 6 : i]) : t.im;
  $('#yt').textContent = y;
  let h = '';
  for (let m = 1; m <= 13; m++) {
    let c = t.ws.map(w => `<div class="h">${w[0]}</div>`).join('');
    for (let d = 1; d <= 28; d++) c += cellHTML(ifcMonthJ(y, m, d), d);
    if (m === 6 && lp) c += cellHTML(gregorianToJDN(y, 1, 1) + 168, t.leap, 'x');
    if (m === 13) c += cellHTML(gregorianToJDN(y, 1, 1) + (lp ? 365 : 364), t.year, 'x');
    h += `<div class="mm"><h3>${img[m - 1]}</h3><div class="cal">${c}</div></div>`;
  }
  $('#yv').innerHTML = h;
}

function result() {
  const t = T(), o = ifcFromJDN(R);
  $('#rb').textContent = fmtIFC(R, lang, sol);
  const wd = o.k === 'n' ? t.wd[(o.d - 1) % 7] : t.noweek;
  const lines = [
    wd,
    `${t.gr}: ${fmtCal('g', R, lang)}`,
    `${t.ju}: ${fmtCal('j', R, lang)}`,
    `${t.cn}: ${fmtCal('c', R, lang)}`,
    `${t.hb}: ${fmtCal('h', R, lang)}`,
    `${t.in}: ${fmtCal('i', R, lang)}`,
    `${t.is}: ${fmtCal('m', R, lang)}`,
    `${t.pe}: ${fmtCal('p', R, lang)}`,
    `${t.co}: ${fmtCal('k', R, lang)}`
  ];
  $('#rs').innerHTML = lines.join('<br>');
  $('#rh').innerHTML = holAt(R).map(h => `<span class="tag">${t.H[h.k]}</span>`).join('');
  $('#hl').innerHTML = hols(o.y).map(h => {
    const short = fmtIFC(h.j, lang, sol).replace(/,?\s*\d{1,4}$/, '');
    return `<li data-j="${h.j}"><span>${t.H[h.k]}<small>${fmtCal('g', h.j, lang)}</small></span><b>${short}</b></li>`;
  }).join('');
}

function refreshDiff() {
  const v1 = $('#d1').value;
  const v2 = $('#d2').value;
  if (!v1 || !v2) { $('#dr').textContent = ''; return; }
  const j1 = parseDateInput(v1);
  const j2 = parseDateInput(v2);
  if (j1 == null || j2 == null) { $('#dr').textContent = ''; return; }
  $('#dr').innerHTML = renderDiff(j1, j2, lang, T(), fmtCal);
}

/* ============ Инициализация из URL ============ */
function initFromURL() {
  const st = readState();
  if (!st) return;
  if (!CAL_KEYS.includes(st.c)) return;
  S = { c: st.c, y: st.y, m: st.m, d: st.d };
  PV = { y: st.y, m: st.m };
  try {
    const j = toJDN(st.c, st.y, st.m, st.d);
    R = j;
    const o = ifcFromJDN(j);
    IV = { y: o.y, m: o.m };
    if (st.c === 'g') { const [gy, gm] = jdnToGregorian(j); PV = { y: gy, m: gm }; }
    else if (st.c === 'j') { PV = { y: st.y, m: st.m }; }
    else { const [cy, cm] = fromJDN(st.c, j); PV = { y: cy, m: cm }; }
  } catch (e) {}
}

function all() {
  head();
  picker();
  grid();
  yearGrid();
  result();
  refreshDiff();
  writeState(S.c, S.y, S.m, S.d);
}

function show(j) {
  R = j;
  const o = ifcFromJDN(j);
  IV = { y: o.y, m: o.m };
  result();
  grid();
  yearGrid();
  const [cy, cm] = fromJDN(S.c, j);
  PV = { y: cy, m: cm };
  picker();
  writeState(S.c, S.y, S.m, S.d);
}

function convert() {
  const c = S.c;
  const y = +$('#fy').value;
  const m = +$('#fm').value;
  const d = +$('#fd').value;
  const t = T();
  if (!(y >= 1 && y <= 9999)) { $('#er').textContent = t.badyear; return; }
  if (!(d >= 1)) { $('#er').textContent = t.bad; return; }
  if (c === 'c' && (m < 1 || m > 24 || d < 1 || d > 15)) { $('#er').textContent = t.badseason; return; }
  if (c === 'h' && (m < 1 || m > 13)) { $('#er').textContent = t.bad; return; }
  if (c === 'i' && (m < 1 || m > 12 || d > HINDU_MONTH_DAYS[m - 1])) { $('#er').textContent = t.bad; return; }
  if (c === 'm' && (m < 1 || m > 12)) { $('#er').textContent = t.bad; return; }
  if (c === 'p' && (m < 1 || m > 12 || d > persianMonthDays(y, m))) { $('#er').textContent = t.bad; return; }
  if (c === 'k' && (m < 1 || m > 13 || d > copticMonthDays(y, m))) { $('#er').textContent = t.bad; return; }
  let j;
  try { j = toJDN(c, y, m, d); } catch (e) { $('#er').textContent = t.bad; return; }
  if (['g','j','h','i','m','p','k'].includes(c)) {
    const b = fromJDN(c, j);
    if (b[0] !== y || b[1] !== m || b[2] !== d) { $('#er').textContent = t.bad; return; }
  }
  $('#er').textContent = '';
  S = { c, y, m, d };
  PV = { y, m };
  picker();
  show(j);
}

/* ============ Обработчики ============ */
$('#go').onclick = convert;

CAL_KEYS.forEach(k => {
  const el = $('#c' + k);
  if (!el) return;
  el.onclick = () => {
    S.c = k;
    if (k === 'h') { S.m = 7; S.d = 1; }
    else { S.m = 1; S.d = 1; }
    PV = { y: S.y, m: S.m };
    head(); picker();
    writeState(S.c, S.y, S.m, S.d);
  };
});

$('#bl').onclick = e => {
  e.stopPropagation();
  const menu = $('#lm');
  const open = menu.classList.toggle('open');
  $('#bl').setAttribute('aria-expanded', open ? 'true' : 'false');
};
$('#lm').onclick = e => {
  const item = e.target.closest('.lang-item');
  if (!item) return;
  lang = item.dataset.lang;
  try { localStorage.setItem('lang', lang); } catch (e) {}
  $('#lm').classList.remove('open');
  $('#bl').setAttribute('aria-expanded', 'false');
  all();
};
document.addEventListener('click', e => {
  if (!e.target.closest('.lang')) {
    $('#lm').classList.remove('open');
    $('#bl').setAttribute('aria-expanded', 'false');
  }
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    $('#lm').classList.remove('open');
    $('#bl').setAttribute('aria-expanded', 'false');
  }
});

$('#bs').onclick = () => {
  sol = sol === 'aug' ? 'jul' : 'aug';
  try { localStorage.setItem('sol', sol); } catch (e) {}
  head(); result(); grid(); yearGrid();
};
$('#yp').onclick = () => { if (IV.y > 1) { IV.y--; yearGrid(); } };
$('#yn').onclick = () => { if (IV.y < 9999) { IV.y++; yearGrid(); } };
$('#yv').onclick = e => { const j = e.target.dataset.j; if (j) show(+j); };
$('#bt').onclick = () => {
  theme = dark() ? 'light' : 'dark';
  try { localStorage.setItem('theme', theme); } catch (e) {}
  head();
};
$('#pp').onclick = () => {
  const maxM = S.c === 'c' ? 24 : (S.c === 'h' && hebrewLeap(PV.y) ? 13 : 12);
  if (PV.m === 1) { if (PV.y > 1) { PV = { y: PV.y - 1, m: S.c === 'c' ? 24 : 12 }; } }
  else PV.m--;
  picker();
};
$('#pn').onclick = () => {
  const maxM = S.c === 'c' ? 24 : (S.c === 'h' && hebrewLeap(PV.y) ? 13 : 12);
  if (PV.m === maxM) { if (PV.y < 9999) { PV = { y: PV.y + 1, m: 1 }; } }
  else PV.m++;
  picker();
};
$('#ip').onclick = () => {
  if (IV.m === 1) { if (IV.y > 1) { IV = { y: IV.y - 1, m: 13 }; } }
  else IV.m--;
  grid();
};
$('#in').onclick = () => {
  if (IV.m === 13) { if (IV.y < 9999) { IV = { y: IV.y + 1, m: 1 }; } }
  else IV.m++;
  grid();
};
$('#pc').onclick = e => {
  const d = e.target.dataset.d;
  if (!d) return;
  S = { ...S, y: PV.y, m: PV.m, d: +d };
  head(); picker(); convert();
};
$('#ic').onclick = e => { const j = e.target.dataset.j; if (j) show(+j); };
$('#hl').onclick = e => { const li = e.target.closest('li'); if (li) show(+li.dataset.j); };

// Копировать результат
$('#bcopy').onclick = async () => {
  const txt = $('#rb').textContent + ' | ' + $('#rs').textContent.replace(/<br>/g, ' · ').replace(/<[^>]+>/g, '');
  const ok = await copyText(txt);
  toast(ok ? T().copied : T().copyFail);
};
// Поделиться
$('#bshare').onclick = async () => {
  writeState(S.c, S.y, S.m, S.d);
  const ok = await shareDate($('#rb').textContent);
  if (!ok) {
    const ok2 = await copyText(location.href);
    toast(ok2 ? T().linkCopied : T().copyFail);
  }
};
// ICS
$('#bics').onclick = () => {
  downloadICS(ifcFromJDN(R).y, T());
  toast(T().icsDone);
};

// Разница дат
$('#d1').value = new Date().toISOString().slice(0, 10);
$('#d2').value = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
$('#d1').onchange = refreshDiff;
$('#d2').onchange = refreshDiff;

window.addEventListener('hashchange', () => {
  initFromURL();
  all();
});

initFromURL();
all();