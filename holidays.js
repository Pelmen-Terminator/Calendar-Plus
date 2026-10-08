import { gregorianToJDN, julianToJDN, jdnToGregorian, mod } from './jdn.js';
import { islamicToJDN, jdnToIslamic } from './calendars.js';

const fl = Math.floor;

const FIX = [
  [1,1,'ny'],[1,27,'holocaust'],[1,28,'peace2'],
  [2,14,'val'],[2,21,'lang'],
  [3,8,'w'],[3,22,'water'],
  [4,7,'health'],[4,12,'space'],[4,22,'earth'],[4,23,'book'],
  [5,1,'lab'],[5,8,'vdayW'],[5,8,'mother'],[5,9,'vdayE'],
  [6,1,'ch'],[6,5,'env'],[6,8,'oceans'],[6,15,'father'],
  [8,12,'youth'],
  [9,21,'peace'],
  [10,1,'music'],[10,1,'elderly'],[10,5,'teach'],[10,9,'post'],[10,24,'un'],
  [11,19,'men'],[11,21,'tv'],
  [12,3,'disab'],[12,5,'vol'],[12,10,'hr'],[12,11,'mountains'],[12,18,'migrants'],[12,25,'xm'],[12,31,'ev']
];

const cache = {};
export function hols(y) {
  if (cache[y]) return cache[y];
  const r = FIX.map(([m, d, k]) => ({ j: gregorianToJDN(y, m, d), k }));
  [y - 1, y].forEach(jy => {
    const j = julianToJDN(jy, 12, 25);
    if (jdnToGregorian(j)[0] === y) r.push({ j, k: 'orx' });
  });
  // Пасха западная
  let a = y % 19, b = fl(y / 100), c = y % 100, d = fl(b / 4), e = b % 4,
      f = fl((b + 8) / 25), g = fl((b - f + 1) / 3),
      h = (19 * a + b - d - g + 15) % 30,
      i = fl(c / 4), k = c % 4,
      l = (32 + 2 * e + 2 * i - h - k) % 7,
      m = fl((a + 11 * h + 22 * l) / 451),
      n = h + l - 7 * m + 114;
  r.push({ j: gregorianToJDN(y, fl(n / 31), n % 31 + 1), k: 'ew' });
  // Пасха православная
  let a2 = y % 4, b2 = y % 7, c2 = y % 19,
      d2 = (19 * c2 + 15) % 30,
      e2 = (2 * a2 + 4 * b2 - d2 + 34) % 7,
      n2 = d2 + e2 + 114;
  const oj = julianToJDN(y, fl(n2 / 31), n2 % 31 + 1);
  if (jdnToGregorian(oj)[0] === y) r.push({ j: oj, k: 'eo' });
  // Дивали / Холи (приближённо)
  r.push({ j: gregorianToJDN(y, 10, 19) + mod(y * 11, 19) - 9, k: 'diwali' });
  r.push({ j: gregorianToJDN(y, 3, 6) + mod(y * 7, 11) - 5, k: 'holi' });
  // Исламские
  const islY = jdnToIslamic(gregorianToJDN(y, 6, 15))[0];
  r.push({ j: islamicToJDN(islY, 10, 1), k: 'eidF' });
  r.push({ j: islamicToJDN(islY, 12, 10), k: 'eidA' });
  const filtered = r.filter(h => jdnToGregorian(h.j)[0] === y);
  filtered.sort((p, q) => p.j - q.j);
  return cache[y] = filtered;
}
export function holAt(j) {
  return hols(jdnToGregorian(j)[0]).filter(h => h.j === j);
}