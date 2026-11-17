// Data-driven rendering for hero preview, formats, coaches, pricing and practical info.

import { coachById } from '../data/coaches';
import { formatById } from '../data/formats';
import { plans, pricingNote } from '../data/pricing';
import { sessions, spotsLeft, type Session } from '../data/sessions';
import { studio } from '../data/studio';
import { $, $$, DAYS, DAYS_ACC, DAYS_SHORT, endTime, esc, plural, todayIndex, toMinutes } from '../lib/util';
import { arrivalMarkup, coachesMarkup, faqMarkup, footerRhythmMarkup, formatsMarkup, hoursMarkup, pricingMarkup, rhythmMarkup, weekRhythmSvg } from './markup';
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
  el.innerHTML = formatsMarkup();

  const select = (id: string) => {
    $$('[data-fmt-select]', el).forEach((b) => b.setAttribute('aria-expanded', String(b.dataset.fmtSelect === id)));
    $$('.fmt', el).forEach((a) => a.classList.toggle('is-active', a.id === `fmt-${id}`));
  };

  el.addEventListener('click', (e) => {
    const t = e.target as HTMLElement;
    const sel = t.closest<HTMLElement>('[data-fmt-select]');
    const sch = t.closest<HTMLElement>('[data-fmt-schedule]');
    if (sel) select(sel.dataset.fmtSelect!);
    if (sch) showFormatSchedule(sch.dataset.fmtSchedule!);
  });
  // Hover preview on pointer devices
  el.addEventListener('pointerover', (e) => {
    if ((e as PointerEvent).pointerType !== 'mouse') return;
    const sel = (e.target as HTMLElement).closest<HTMLElement>('[data-fmt-select]');
    if (sel) select(sel.dataset.fmtSelect!);
  });
}

const showFormatSchedule = (id: string) =>
  setTimetable({ format: id as never, coach: 'all', level: 'all', onlyFree: false }, { scroll: true });

/* ---------- Ritmo skalė ---------- */

export function renderRhythm() {
  // Week-rhythm motif (timetable head + footer), drawn from the shared timetable data.
  $('[data-tt-rhythm]').innerHTML = weekRhythmSvg({ height: 64, labels: false, cls: 'wk--mini' });
  $('[data-footer-rhythm]').innerHTML = footerRhythmMarkup();

  const el = $('[data-rhythm]');
  el.innerHTML = rhythmMarkup();
  el.addEventListener('click', (e) => {
    const go = (e.target as HTMLElement).closest<HTMLElement>('[data-rhythm-go]');
    if (go) showFormatSchedule(go.dataset.rhythmGo!);
  });
}

/* ---------- Coaches: expanding poster strips ---------- */

export function renderCoaches() {
  const el = $('[data-coaches]');
  el.innerHTML = coachesMarkup();

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
  el.innerHTML = pricingMarkup();
  el.addEventListener('click', (e) => {
    const b = (e.target as HTMLElement).closest<HTMLElement>('[data-plan]');
    const plan = plans.find((p) => p.id === b?.dataset.plan);
    if (plan) openRegistration({ kind: 'plan', plan }, b);
  });
}

/* ---------- Practical info + FAQ ---------- */

export function renderInfo() {
  $('[data-arrival]').innerHTML = arrivalMarkup();
  $('[data-studio-city]').textContent = `${studio.location.city} · demo vieta`;
  $('[data-studio-location-note]').textContent = studio.location.note;
  $('[data-hours]').innerHTML = hoursMarkup();
  $('[data-hours-note]').textContent = studio.hoursNote;
  const link = $<HTMLAnchorElement>('[data-studio-email-link]');
  link.href = `mailto:${studio.email}`;
  link.textContent = studio.email;
  $$('[data-studio-email]').forEach((e) => (e.textContent = studio.email));

  $('[data-faq]').innerHTML = faqMarkup();

  $('[data-question]').addEventListener('click', (e) => openRegistration({ kind: 'question' }, e.currentTarget as HTMLElement));
  $('[data-year]').textContent = String(new Date().getFullYear());
}
