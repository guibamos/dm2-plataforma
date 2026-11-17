// Datas como texto 'AAAA-MM-DD' no fuso local, para não ter surpresa com UTC.

export const pad = (n) => String(n).padStart(2, '0');
export const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const parse = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
export const today = () => iso(new Date());
export const addDays = (s, n) => { const d = parse(s); d.setDate(d.getDate() + n); return iso(d); };
export const diffDays = (a, b) => Math.round((parse(a) - parse(b)) / 86400000); // a - b
export const mondayOf = (s) => { const d = parse(s); const wd = (d.getDay() + 6) % 7; d.setDate(d.getDate() - wd); return iso(d); };
export const weekday = (s) => (parse(s).getDay() + 6) % 7; // 0 = segunda

const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
const DIAS = ['seg', 'ter', 'qua', 'qui', 'sex', 'sáb', 'dom'];
export const fmtDate = (s) => { const d = parse(s); return `${d.getDate()} ${MESES[d.getMonth()]}`; };
export const fmtDateLong = (s) => { const d = parse(s); return `${DIAS[weekday(s)]}, ${d.getDate()} ${MESES[d.getMonth()]}`; };
export const monthShort = (i) => MESES[i];

export const pct = (c, q) => (q > 0 ? c / q : null);
export const fmtPct = (v, digits = 0) => (v == null ? '—' : `${(v * 100).toFixed(digits).replace('.', ',')}%`);
export const fmtInt = (n) => (n == null ? '—' : Math.round(n).toLocaleString('pt-BR'));
export const fmtPts = (v) => (v == null ? '' : `${v > 0 ? '+' : v < 0 ? '−' : '±'}${Math.abs(v * 100).toFixed(1).replace('.', ',')} pts`);

export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);

export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export const sum = (arr, f = (x) => x) => arr.reduce((a, x) => a + (f(x) || 0), 0);

export const groupBy = (arr, key) => {
  const m = new Map();
  for (const x of arr) { const k = typeof key === 'function' ? key(x) : x[key]; if (!m.has(k)) m.set(k, []); m.get(k).push(x); }
  return m;
};

// Gerador pseudoaleatório com semente, para os dados fictícios serem sempre os mesmos.
export const rng = (seed) => () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
