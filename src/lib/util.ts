const ESC: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const esc = (v: unknown): string => String(v ?? '').replace(/[&<>"']/g, (c) => ESC[c]);

/** Resolves a file in /public/img against the deploy base (works under GitHub Pages subpaths). */
export const imgUrl = (file: string): string => `${import.meta.env.BASE_URL}img/${file}`;

export const srcset = (base: string, widths: number[]): string =>
  widths.map((w) => `${imgUrl(`${base}-${w}.webp`)} ${w}w`).join(', ');

export const $ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document): T => {
  const el = root.querySelector<T>(sel);
  if (!el) throw new Error(`Missing element: ${sel}`);
  return el;
};

export const $$ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document): T[] =>
  Array.from(root.querySelectorAll<T>(sel));

/** Lithuanian plural forms: [1 vieta, 2 vietos, 10 vietų] */
export const plural = (n: number, forms: [string, string, string]): string => {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return forms[0];
  if (m10 >= 2 && m10 <= 9 && (m100 < 11 || m100 > 19)) return forms[1];
  return forms[2];
};

export const DAYS = ['Pirmadienis', 'Antradienis', 'Trečiadienis', 'Ketvirtadienis', 'Penktadienis', 'Šeštadienis', 'Sekmadienis'];
export const DAYS_SHORT = ['Pr', 'An', 'Tr', 'Kt', 'Pn', 'Št', 'Sk'];
/** Accusative, for "kada?" — e.g. "ketvirtadienį 07:00" */
export const DAYS_ACC = ['pirmadienį', 'antradienį', 'trečiadienį', 'ketvirtadienį', 'penktadienį', 'šeštadienį', 'sekmadienį'];

/** JS Sunday=0 → our Monday=0 */
export const todayIndex = (d = new Date()): number => (d.getDay() + 6) % 7;

export const toMinutes = (hhmm: string): number => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

export const endTime = (start: string, duration: number): string => {
  const t = toMinutes(start) + duration;
  return `${String(Math.floor(t / 60) % 24).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`;
};

export const prefersReducedMotion = (): boolean => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
