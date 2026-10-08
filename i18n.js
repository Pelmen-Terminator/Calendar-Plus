import ru from '../locales/ru.js';
import en from '../locales/en.js';
import de from '../locales/de.js';
import fr from '../locales/fr.js';
import it from '../locales/it.js';
import es from '../locales/es.js';
import pt from '../locales/pt.js';
import uk from '../locales/uk.js';
import id from '../locales/id.js';
import zh from '../locales/zh.js';
import hi from '../locales/hi.js';
import he from '../locales/he.js';
import ar from '../locales/ar.js';
import tr from '../locales/tr.js';
import pl from '../locales/pl.js';
import ja from '../locales/ja.js';
import ko from '../locales/ko.js';

export const L = { ru, en, de, fr, it, es, pt, uk, id, zh, hi, he, ar, tr, pl, ja, ko };

export const LANGS = [
  { code: 'ru', flag: '🇷🇺', name: 'Русский',        dir: 'ltr' },
  { code: 'en', flag: '🇬🇧', name: 'English',        dir: 'ltr' },
  { code: 'de', flag: '🇩🇪', name: 'Deutsch',        dir: 'ltr' },
  { code: 'fr', flag: '🇫🇷', name: 'Français',       dir: 'ltr' },
  { code: 'it', flag: '🇮🇹', name: 'Italiano',       dir: 'ltr' },
  { code: 'es', flag: '🇪🇸', name: 'Español',        dir: 'ltr' },
  { code: 'pt', flag: '🇧🇷', name: 'Português',      dir: 'ltr' },
  { code: 'tr', flag: '🇹🇷', name: 'Türkçe',         dir: 'ltr' },
  { code: 'pl', flag: '🇵🇱', name: 'Polski',         dir: 'ltr' },
  { code: 'uk', flag: '🇺🇦', name: 'Українська',     dir: 'ltr' },
  { code: 'id', flag: '🇮🇩', name: 'Bahasa Indonesia', dir: 'ltr' },
  { code: 'zh', flag: '🇨🇳', name: '中文',            dir: 'ltr' },
  { code: 'ja', flag: '🇯🇵', name: '日本語',          dir: 'ltr' },
  { code: 'ko', flag: '🇰🇷', name: '한국어',           dir: 'ltr' },
  { code: 'hi', flag: '🇮🇳', name: 'हिन्दी',           dir: 'ltr' },
  { code: 'he', flag: '🇮🇱', name: 'עברית',          dir: 'rtl' },
  { code: 'ar', flag: '🇸🇦', name: 'العربية',        dir: 'rtl' }
];

export function detectLang() {
  const n = (navigator.language || '').toLowerCase();
  if (n.startsWith('ru')) return 'ru';
  if (n.startsWith('uk')) return 'uk';
  if (n.startsWith('de')) return 'de';
  if (n.startsWith('it')) return 'it';
  if (n.startsWith('id') || n.startsWith('in')) return 'id';
  if (n.startsWith('pt')) return 'pt';
  if (n.startsWith('es')) return 'es';
  if (n.startsWith('zh')) return 'zh';
  if (n.startsWith('ja')) return 'ja';
  if (n.startsWith('ko')) return 'ko';
  if (n.startsWith('hi')) return 'hi';
  if (n.startsWith('he') || n.startsWith('iw')) return 'he';
  if (n.startsWith('ar')) return 'ar';
  if (n.startsWith('tr')) return 'tr';
  if (n.startsWith('pl')) return 'pl';
  if (n.startsWith('fr')) return 'fr';
  return 'en';
}