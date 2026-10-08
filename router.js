export function readState() {
  const h = location.hash.replace(/^#\/?/, '');
  if (!h) return null;
  const parts = h.split('/');
  if (parts.length < 4) return null;
  const [c, y, m, d] = parts;
  return { c, y: +y, m: +m, d: +d };
}

export function writeState(c, y, m, d) {
  const h = `#/${c}/${y}/${m}/${d}`;
  if (location.hash !== h) history.replaceState(null, '', h);
}

export async function shareDate(text) {
  if (navigator.share) {
    try {
      await navigator.share({ title: document.title, text, url: location.href });
      return true;
    } catch (e) { return false; }
  }
  return false;
}

export async function copyText(text) {
  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (e) {}
  // fallback
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  try { document.execCommand('copy'); document.body.removeChild(ta); return true; }
  catch (e) { document.body.removeChild(ta); return false; }
}

export function toast(msg) {
  let el = document.getElementById('toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'toast';
    el.className = 'toast';
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => el.classList.remove('show'), 1800);
}