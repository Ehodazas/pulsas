// Pure, DOM-free HTML builders for the content sections.
// Used twice: at runtime by content.ts, and at build time by scripts/prerender.mjs,
// so the shipped index.html already contains the formats, coaches, prices and FAQ for crawlers.

import { coaches } from '../data/coaches';
import { formatById, formats, type TrainingFormat } from '../data/formats';
import { plans } from '../data/pricing';
import { sessions } from '../data/sessions';
import { arrival, faq, studio } from '../data/studio';
import { esc, imgUrl, plural, srcset } from '../lib/util';

/** Largest group size for a format, read from the shared timetable. */
const groupSize = (id: TrainingFormat['id']) => Math.max(...sessions.filter((s) => s.format === id).map((s) => s.capacity));

export const formatsMarkup = () => `
    <ul class="fmt-index" role="list">
      ${formats
        .map(
          (f, i) => `<li><button class="fmt-index__btn" type="button" data-fmt-select="${f.id}" aria-controls="fmt-${f.id}" aria-expanded="${i === 0}">
            <span class="fmt-index__name">${esc(f.name)}</span>
            <span class="fmt-index__lt">${esc(f.ltName)}</span>
          </button></li>`,
        )
        .join('')}
    </ul>
    <div class="fmt-stage">
      ${formats
        .map(
          (f, i) => `<article class="fmt ${i === 0 ? 'is-active' : ''}" id="fmt-${f.id}" aria-labelledby="fmt-${f.id}-title">
            <figure class="fmt__media">
              <img src="${imgUrl(`${f.image.base}-${f.image.widths[0]}.webp`)}" srcset="${srcset(f.image.base, f.image.widths)}"
                sizes="(min-width: 900px) 30vw, 100vw" width="960" height="960" alt="${esc(f.image.alt)}" loading="lazy" decoding="async" />
            </figure>
            <div class="fmt__body">
              <h3 class="fmt__title" id="fmt-${f.id}-title">${esc(f.name)} <span>${esc(f.ltName)}</span></h3>
              <p class="fmt__lead">${esc(f.lead)}</p>
              <dl class="fmt__facts">
                <div><dt>Kam</dt><dd>${esc(f.forWho)}</dd></div>
                <div><dt>Treniruotėje</dt><dd>${esc(f.inSession)}</dd></div>
                <div class="fmt__row">
                  <div><dt>Intensyvumas</dt><dd>${pillMeter(f.intensity)} <span>${esc(f.intensityLabel)}</span><span class="visually-hidden"> (${f.intensity} iš 5)</span></dd></div>
                  <div><dt>Trukmė</dt><dd><span class="fmt__dur">${f.duration}</span> min</dd></div>
                </div>
              </dl>
              <button class="btn btn--accent" type="button" data-fmt-schedule="${f.id}">
                ${esc(f.name)} tvarkaraštis <span class="btn__arrow" aria-hidden="true">→</span>
              </button>
            </div>
          </article>`,
        )
        .join('')}
    </div>`;

/* ---------- Ritmo skalė: each format's session structure drawn in the logo's pulse-line language ---------- */

const W = 600;
const H = 96;
const BASE = 70;

/** Builds an ECG-like polyline from [height, gap] beats. Purely illustrative. */
export function wavePath(beats: [number, number][]): string {
  const rise = 7;
  const fall = 10;
  const back = 6;
  const unit = 22; // width of one "gap" unit
  const lead = 30;
  const body = beats.reduce((sum, [, gap]) => sum + rise + fall + back + gap * unit, 0);
  const scale = (W - lead * 2) / body;
  let x = lead;
  const pts: string[] = [`M0 ${BASE}`, `H${lead}`];
  for (const [h, gap] of beats) {
    const amp = h * (BASE - 8);
    x += rise * scale;
    pts.push(`L${x.toFixed(1)} ${(BASE - amp).toFixed(1)}`);
    x += fall * scale;
    pts.push(`L${x.toFixed(1)} ${(BASE + amp * 0.32).toFixed(1)}`);
    x += back * scale;
    pts.push(`L${x.toFixed(1)} ${BASE}`);
    x += gap * unit * scale;
    if (gap > 0) pts.push(`H${x.toFixed(1)}`);
  }
  pts.push(`H${W}`);
  return pts.join(' ');
}

const calmness = ['', 'Ramu', 'Lengviau', 'Vidutiniškai', 'Intensyviau', 'Intensyvu'];

/* ---------- Savaitės ritmas: the brand motif ----------
   Every session in the sample week is one vertical capsule; its height follows the format's
   (illustrative) intensity, its colour the format. Days are separated by wider gaps, so the week
   reads as a rhythm. Drawn from the shared timetable data — not decoration, not an ECG trace. */

const pillMeter = (n: number) =>
  `<span class="pills" aria-hidden="true">${[1, 2, 3, 4, 5].map((i) => `<i class="${i <= n ? 'on' : ''}"></i>`).join('')}</span>`;

const DAY_LABELS = ['Pr', 'An', 'Tr', 'Kt', 'Pn', 'Št', 'Sk'];

export function weekRhythmSvg({ height = 220, labels = true, cls = '' } = {}): string {
  const capW = 16;
  const gap = 10;
  const dayGap = 42;
  const top = 6;
  const labelH = labels ? 34 : 0;
  const base = height - labelH;
  const byDay = DAY_LABELS.map((_, d) =>
    sessions.filter((s) => s.day === d).sort((a, b) => a.start.localeCompare(b.start)),
  );
  let x = 0;
  const caps: string[] = [];
  const marks: string[] = [];
  byDay.forEach((list, d) => {
    const start = x;
    list.forEach((s, i) => {
      const f = formatById(s.format);
      const h = Math.round((0.22 + (f.intensity / 5) * 0.78) * (base - top));
      caps.push(
        `<rect class="wk__cap wk__cap--${f.id}" x="${x}" y="${base - h}" width="${capW}" height="${h}" rx="${capW / 2}" style="--i:${d * 6 + i}" />`,
      );
      x += capW + (i < list.length - 1 ? gap : 0);
    });
    if (labels) marks.push(`<text class="wk__day" x="${(start + x) / 2}" y="${height - 6}" text-anchor="middle">${DAY_LABELS[d]}</text>`);
    x += dayGap;
  });
  const w = x - dayGap;
  return `<svg class="wk ${cls}" viewBox="0 0 ${w} ${height}" role="presentation" aria-hidden="true" focusable="false">${caps.join('')}${marks.join('')}</svg>`;
}

export const footerRhythmMarkup = () => `
  ${weekRhythmSvg({ height: 240, labels: true, cls: 'wk--footer' })}
  <p class="wk__legend">
    <span><i class="wk__key wk__key--mobility"></i>Mobility</span>
    <span><i class="wk__key wk__key--functional"></i>Functional</span>
    <span><i class="wk__key wk__key--strength"></i>Strength</span>
    <span><i class="wk__key wk__key--hiit"></i>HIIT</span>
    <span class="wk__legend-note">Savaitės ritmas: kiekviena kapsulė — viena treniruotė, aukštis — iliustracinis intensyvumas.</span>
  </p>`;

export const rhythmMarkup = () => {
  const ordered = [...formats].sort((a, b) => a.intensity - b.intensity || a.duration - b.duration);
  return `
    <div class="rhythm__head">
      <p class="eyebrow">Ritmo skalė</p>
      <h3 class="rhythm__title" id="rhythm-title">Kiek tai intensyvu? <span>Pažiūrėk į ritmą.</span></h3>
      <p class="rhythm__note">Linija rodo treniruotės struktūrą — kada dirbama, kada atsikvepiama. Tai iliustracija, ne pulso ar kitų rodiklių matavimas.</p>
    </div>
    <ol class="rhythm__list">
      ${ordered
        .map(
          (f) => `<li class="rhythm__row" data-rhythm-row="${f.id}" data-level="${f.intensity}">
            <p class="rhythm__name"><span class="rhythm__fmt">${esc(f.name)}</span><span class="rhythm__lvl">${pillMeter(f.intensity)}${calmness[f.intensity]} · ${f.duration} min</span></p>
            <svg class="rhythm__wave" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true" focusable="false">
              <path class="rhythm__base" d="M0 ${BASE}H${W}" />
              <path class="rhythm__line" pathLength="1" d="${wavePath(f.rhythm.beats)}" />
            </svg>
            <dl class="rhythm__facts">
              <div><dt>Tempas</dt><dd>${esc(f.rhythm.tempo)}</dd></div>
              <div><dt>Struktūra</dt><dd>${esc(f.rhythm.structure)}</dd></div>
              <div><dt>Grupė</dt><dd>iki ${groupSize(f.id)} žmonių</dd></div>
              <div><dt>Pradedantiesiems</dt><dd>${esc(f.rhythm.beginners)}</dd></div>
            </dl>
            <button class="rhythm__go" type="button" data-rhythm-go="${f.id}" aria-label="${esc(f.name)}: rodyti tvarkaraštį">
              Tvarkaraštis <span aria-hidden="true">→</span>
            </button>
          </li>`,
        )
        .join('')}
    </ol>`;
};

export const coachesMarkup = () =>
  coaches
    .map((c, i) => {
      const count = sessions.filter((s) => s.coach === c.id).length;
      return `<article class="coach ${i === 0 ? 'is-open' : ''}" data-coach="${c.id}" aria-labelledby="coach-${c.id}-name">
        <button class="coach__tab" type="button" data-coach-open="${c.id}" aria-expanded="${i === 0}" aria-controls="coach-${c.id}-body">
          <span class="coach__tab-name">${esc(c.name)}</span>
          <span class="coach__tab-role">${esc(c.role)}</span>
        </button>
        <figure class="coach__photo">
          <img src="${imgUrl(`${c.image.base}-${c.image.widths[0]}.webp`)}" srcset="${srcset(c.image.base, c.image.widths)}"
            sizes="(min-width: 900px) 34vw, 100vw" width="800" height="1067" alt="${esc(c.image.alt)}" loading="lazy" decoding="async" />
        </figure>
        <div class="coach__body" id="coach-${c.id}-body">
          <p class="eyebrow">${esc(c.role)}</p>
          <h3 class="coach__name" id="coach-${c.id}-name">${esc(c.name)}</h3>
          <blockquote class="coach__quote">„${esc(c.quote)}“</blockquote>
          <p class="coach__bio">${esc(c.bio)}</p>
          <ul class="coach__focus">${c.focus.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
          <p class="coach__formats">Veda: ${c.formats.map((f) => esc(formatById(f).name)).join(', ')}</p>
          <button class="btn btn--outline-light btn--sm" type="button" data-coach-schedule="${c.id}">
            ${count} ${plural(count, ['treniruotė', 'treniruotės', 'treniruočių'])} per savaitę <span class="btn__arrow" aria-hidden="true">→</span>
          </button>
        </div>
      </article>`;
    })
    .join('');

export const pricingMarkup = () =>
  plans
    .map(
      (p) => `<article class="plan" aria-labelledby="plan-${p.id}">
        <div class="plan__head">
          <h3 class="plan__name" id="plan-${p.id}">${esc(p.name)}</h3>
          <p class="plan__summary">${esc(p.summary)}</p>
        </div>
        <p class="plan__price"><span class="plan__amount">${p.price}</span><span class="plan__cur">€</span><span class="plan__unit">${esc(p.unit)}</span><span class="plan__demo">Demo</span></p>
        <ul class="plan__list">${p.includes.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
        <button class="btn btn--ink plan__cta" type="button" data-plan="${p.id}">${esc(p.cta)} <span class="btn__arrow" aria-hidden="true">→</span></button>
      </article>`,
    )
    .join('');

export const arrivalMarkup = () =>
  arrival.map((a) => `<li class="arrival__item"><h3>${esc(a.title)}</h3><p>${esc(a.text)}</p></li>`).join('');

export const hoursMarkup = () => studio.hours.map((h) => `<div><dt>${esc(h.days)}</dt><dd>${esc(h.time)}</dd></div>`).join('');

export const faqMarkup = () =>
  faq
    .map(
      (f) => `<details class="faq__item">
        <summary><span>${esc(f.q)}</span><i aria-hidden="true"></i></summary>
        <div class="faq__a"><p>${esc(f.a)}</p>${'sample' in f && f.sample ? '<p class="faq__sample">Pavyzdinė taisyklė</p>' : ''}</div>
      </details>`,
    )
    .join('');

/** Map of container selector → builder, shared with the build-time prerender step. */
export const prerenderTargets: Record<string, () => string> = {
  formats: formatsMarkup,
  rhythm: rhythmMarkup,
  coaches: coachesMarkup,
  pricing: pricingMarkup,
  arrival: arrivalMarkup,
  hours: hoursMarkup,
  faq: faqMarkup,
  ttRhythm: () => weekRhythmSvg({ height: 64, labels: false, cls: 'wk--mini' }),
  footerRhythm: footerRhythmMarkup,
};
