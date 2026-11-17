// Data-driven rendering for hero preview, formats, coaches, pricing and practical info.

import { coaches, coachById } from '../data/coaches';
import { formats, formatById } from '../data/formats';
import { plans, pricingNote } from '../data/pricing';
import { sessions, spotsLeft, type Session } from '../data/sessions';
import { arrival, faq, studio } from '../data/studio';
import { $, $$, DAYS, DAYS_ACC, DAYS_SHORT, endTime, esc, imgUrl, plural, srcset, todayIndex, toMinutes } from '../lib/util';
import { openRegistration } from './registration';
import { setTimetable } from './timetable';

/* ---------- Hero: next session + week strip ---------- */

function nextSession(now = new Date()): { s: Session; offset: number } | null {
  const today = todayIndex(now);
  const mins = now.getHours() * 60 + now.getMinutes();
  for (let offset = 0; offset < 8; offset++) {
    const day = (today + offset) % 7;
    const list = sessions
      .filter((s) => s.day === day && spotsLeft(s) > 0 && (offset > 0 || toMinutes(s.start) > mins + 15))
      .sort((a, b) => toMinutes(a.start) - toMinutes(b.start));
    if (list.length) return { s: list[0], offset };
  }
  return null;
}

export function renderNextUp() {
  const el = $('[data-next-up]');
  const next = nextSession();
  const counts = DAYS.map((_, i) => sessions.filter((s) => s.day === i).length);
  const max = Math.max(...counts);
  const today = todayIndex();

  let card = '<p class="next-up__empty">Šią savaitę daugiau treniruočių nėra.</p>';
  if (next) {
    const { s, offset } = next;
    const f = formatById(s.format);
    const left = spotsLeft(s);
    const when = offset === 0 ? 'Šiandien' : offset === 1 ? 'Rytoj' : DAYS_ACC[s.day][0].toUpperCase() + DAYS_ACC[s.day].slice(1);
    card = `
      <p class="next-up__when">${when}, ${s.start}–${endTime(s.start, s.duration)}</p>
      <p class="next-up__fmt">${esc(f.name)}${s.focus ? ` <span>· ${esc(s.focus)}</span>` : ''}</p>
      <p class="next-up__meta">${esc(coachById(s.coach).name)} · liko ${left} ${plural(left, ['vieta', 'vietos', 'vietų'])}</p>
      <button class="btn btn--ink btn--sm" type="button" data-next-book="${s.id}">Registruotis</button>`;
  }

  el.innerHTML = `
    <div class="next-up__head">
      <h2 class="eyebrow">Artimiausia laisva treniruotė</h2>
      <span class="next-up__tag">Demo</span>
    </div>
    ${card}
    <div class="week-strip" role="group" aria-label="Treniruotės pagal dienas">
      ${counts
        .map(
          (n, i) => `<button type="button" class="week-strip__day ${i === today ? 'is-today' : ''}" data-strip-day="${i}"
            aria-label="${DAYS[i]}: ${n} ${plural(n, ['treniruotė', 'treniruotės', 'treniruočių'])}">
            <span class="week-strip__bar" style="--h:${(n / max).toFixed(2)}"></span>
            <span class="week-strip__label">${DAYS_SHORT[i]}</span>
          </button>`,
        )
        .join('')}
    </div>`;

  el.addEventListener('click', (e) => {
    const t = e.target as HTMLElement;
    const book = t.closest<HTMLElement>('[data-next-book]');
    const day = t.closest<HTMLElement>('[data-strip-day]');
    if (book) {
      const s = sessions.find((x) => x.id === book.dataset.nextBook);
      if (s) openRegistration({ kind: 'session', session: s }, book);
    }
    if (day) setTimetable({ day: Number(day.dataset.stripDay), view: 'day' }, { scroll: true });
  });
}

/* ---------- Formats: index list + switching detail panel ---------- */

export function renderFormats() {
  const el = $('[data-formats]');
  const meter = (n: number) =>
    `<span class="meter" aria-hidden="true">${[1, 2, 3, 4, 5].map((i) => `<i class="${i <= n ? 'on' : ''}"></i>`).join('')}</span>`;

  el.innerHTML = `
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
                sizes="(min-width: 900px) 34vw, 100vw" alt="${esc(f.image.alt)}" loading="lazy" decoding="async" />
            </figure>
            <div class="fmt__body">
              <h3 class="fmt__title" id="fmt-${f.id}-title">${esc(f.name)} <span>${esc(f.ltName)}</span></h3>
              <p class="fmt__lead">${esc(f.lead)}</p>
              <dl class="fmt__facts">
                <div><dt>Kam</dt><dd>${esc(f.forWho)}</dd></div>
                <div><dt>Treniruotėje</dt><dd>${esc(f.inSession)}</dd></div>
                <div class="fmt__row">
                  <div><dt>Intensyvumas</dt><dd>${meter(f.intensity)} <span>${esc(f.intensityLabel)}</span><span class="visually-hidden"> (${f.intensity} iš 5)</span></dd></div>
                  <div><dt>Trukmė</dt><dd><span class="fmt__dur">${f.duration}</span> min</dd></div>
                </div>
              </dl>
              <button class="btn btn--lime" type="button" data-fmt-schedule="${f.id}">
                ${esc(f.name)} tvarkaraštis <span class="btn__arrow" aria-hidden="true">→</span>
              </button>
            </div>
          </article>`,
        )
        .join('')}
    </div>`;

  const select = (id: string) => {
    $$('[data-fmt-select]', el).forEach((b) => b.setAttribute('aria-expanded', String(b.dataset.fmtSelect === id)));
    $$('.fmt', el).forEach((a) => a.classList.toggle('is-active', a.id === `fmt-${id}`));
  };

  el.addEventListener('click', (e) => {
    const t = e.target as HTMLElement;
    const sel = t.closest<HTMLElement>('[data-fmt-select]');
    const sch = t.closest<HTMLElement>('[data-fmt-schedule]');
    if (sel) select(sel.dataset.fmtSelect!);
    if (sch) setTimetable({ format: sch.dataset.fmtSchedule as never, coach: 'all', level: 'all', onlyFree: false }, { scroll: true });
  });
  // Hover preview on pointer devices
  el.addEventListener('pointerover', (e) => {
    if ((e as PointerEvent).pointerType !== 'mouse') return;
    const sel = (e.target as HTMLElement).closest<HTMLElement>('[data-fmt-select]');
    if (sel) select(sel.dataset.fmtSelect!);
  });
}

/* ---------- Coaches: expanding poster strips ---------- */

export function renderCoaches() {
  const el = $('[data-coaches]');
  el.innerHTML = coaches
    .map((c, i) => {
      const count = sessions.filter((s) => s.coach === c.id).length;
      return `<article class="coach ${i === 0 ? 'is-open' : ''}" data-coach="${c.id}" aria-labelledby="coach-${c.id}-name">
        <button class="coach__tab" type="button" data-coach-open="${c.id}" aria-expanded="${i === 0}" aria-controls="coach-${c.id}-body">
          <span class="coach__tab-name">${esc(c.name)}</span>
          <span class="coach__tab-role">${esc(c.role)}</span>
        </button>
        <figure class="coach__photo">
          <img src="${imgUrl(c.image.src)}" width="${c.image.width}" height="${c.image.height}" alt="${esc(c.image.alt)}" loading="lazy" decoding="async" />
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

  el.addEventListener('click', (e) => {
    const t = e.target as HTMLElement;
    const open = t.closest<HTMLElement>('[data-coach-open]');
    const sch = t.closest<HTMLElement>('[data-coach-schedule]');
    if (open) {
      const id = open.dataset.coachOpen;
      $$('.coach', el).forEach((a) => {
        const on = a.dataset.coach === id;
        a.classList.toggle('is-open', on);
        a.querySelector('[data-coach-open]')?.setAttribute('aria-expanded', String(on));
      });
    }
    if (sch) setTimetable({ coach: sch.dataset.coachSchedule as never, format: 'all', level: 'all', onlyFree: false, view: 'week' }, { scroll: true });
  });
}

/* ---------- Pricing ---------- */

export function renderPricing() {
  $('[data-pricing-note]').innerHTML = `<strong>Demo kainos.</strong> ${esc(pricingNote)}`;
  const el = $('[data-pricing]');
  el.innerHTML = plans
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
  el.addEventListener('click', (e) => {
    const b = (e.target as HTMLElement).closest<HTMLElement>('[data-plan]');
    const plan = plans.find((p) => p.id === b?.dataset.plan);
    if (plan) openRegistration({ kind: 'plan', plan }, b);
  });
}

/* ---------- Practical info + FAQ ---------- */

export function renderInfo() {
  $('[data-arrival]').innerHTML = arrival
    .map((a) => `<li class="arrival__item"><h3>${esc(a.title)}</h3><p>${esc(a.text)}</p></li>`)
    .join('');
  $('[data-studio-city]').textContent = `${studio.location.city} · demo vieta`;
  $('[data-studio-location-note]').textContent = studio.location.note;
  $('[data-hours]').innerHTML = studio.hours.map((h) => `<div><dt>${esc(h.days)}</dt><dd>${esc(h.time)}</dd></div>`).join('');
  $('[data-hours-note]').textContent = studio.hoursNote;
  const link = $<HTMLAnchorElement>('[data-studio-email-link]');
  link.href = `mailto:${studio.email}`;
  link.textContent = studio.email;
  $$('[data-studio-email]').forEach((e) => (e.textContent = studio.email));

  $('[data-faq]').innerHTML = faq
    .map(
      (f) => `<details class="faq__item">
        <summary><span>${esc(f.q)}</span><i aria-hidden="true"></i></summary>
        <div class="faq__a"><p>${esc(f.a)}</p>${'sample' in f && f.sample ? '<p class="faq__sample">Pavyzdinė taisyklė</p>' : ''}</div>
      </details>`,
    )
    .join('');

  $('[data-question]').addEventListener('click', (e) => openRegistration({ kind: 'question' }, e.currentTarget as HTMLElement));
  $('[data-year]').textContent = String(new Date().getFullYear());
}
