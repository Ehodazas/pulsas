import { coaches, coachById, type CoachId } from '../data/coaches';
import { formats, formatById, type FormatId } from '../data/formats';
import { levels, sessions, spotsLeft, type Level, type Session } from '../data/sessions';
import { $, $$, DAYS, DAYS_SHORT, endTime, esc, plural, prefersReducedMotion, todayIndex, toMinutes } from '../lib/util';
import { openRegistration } from './registration';

type View = 'day' | 'week';
interface State {
  view: View;
  day: number;
  format: FormatId | 'all';
  level: Level | 'all';
  coach: CoachId | 'all';
  onlyFree: boolean;
}

const state: State = { view: 'day', day: todayIndex(), format: 'all', level: 'all', coach: 'all', onlyFree: false };
let root: HTMLElement;

const levelLabel = (l: Level) => levels.find((x) => x.id === l)?.label ?? l;
const sorted = [...sessions].sort((a, b) => a.day - b.day || toMinutes(a.start) - toMinutes(b.start));

const matches = (s: Session) =>
  (state.format === 'all' || s.format === state.format) &&
  (state.level === 'all' || s.level === state.level) &&
  (state.coach === 'all' || s.coach === state.coach) &&
  (!state.onlyFree || spotsLeft(s) > 0);

const filtersActive = () => state.format !== 'all' || state.level !== 'all' || state.coach !== 'all' || state.onlyFree;

const capacityHtml = (s: Session) => {
  const left = spotsLeft(s);
  const ratio = s.booked / s.capacity;
  const cls = left === 0 ? 'is-full' : left <= 2 ? 'is-low' : '';
  const text = left === 0 ? 'Vietų nėra' : `Liko ${left} ${plural(left, ['vieta', 'vietos', 'vietų'])}`;
  return `<div class="cap ${cls}">
      <span class="cap__bar" aria-hidden="true"><i style="--fill:${ratio.toFixed(2)}"></i></span>
      <span class="cap__text">${text}<span class="visually-hidden"> iš ${s.capacity}</span></span>
    </div>`;
};

const slotHtml = (s: Session, i: number) => {
  const f = formatById(s.format);
  const c = coachById(s.coach);
  const full = spotsLeft(s) === 0;
  return `<li class="slot" style="--i:${i}">
    <p class="slot__time"><span class="slot__start">${s.start}</span><span class="slot__end">–${endTime(s.start, s.duration)} · ${s.duration} min</span></p>
    <div class="slot__main">
      <p class="slot__name"><span class="slot__fmt">${esc(f.name)}</span>${s.focus ? `<span class="slot__focus">${esc(s.focus)}</span>` : ''}</p>
      <p class="slot__meta"><span>${esc(c.name)}</span><span class="slot__level" data-level="${s.level}">${esc(levelLabel(s.level))}</span></p>
    </div>
    ${capacityHtml(s)}
    <button class="btn ${full ? 'btn--outline' : 'btn--ink'} btn--sm slot__btn" type="button" data-book="${s.id}"
      aria-label="${full ? 'Į laukiančiųjų sąrašą' : 'Registruotis'}: ${esc(f.name)}, ${DAYS[s.day]} ${s.start}">
      ${full ? 'Laukiančiųjų sąrašas' : 'Registruotis'}
    </button>
  </li>`;
};

const weekSlotHtml = (s: Session) => {
  const f = formatById(s.format);
  const left = spotsLeft(s);
  return `<li>
    <button class="wslot ${left === 0 ? 'is-full' : ''}" type="button" data-book="${s.id}"
      aria-label="${esc(f.name)}, ${DAYS[s.day]} ${s.start}, ${esc(coachById(s.coach).name)}. ${left === 0 ? 'Vietų nėra' : `Liko ${left} ${plural(left, ['vieta', 'vietos', 'vietų'])}`}">
      <span class="wslot__time">${s.start}</span>
      <span class="wslot__fmt">${esc(f.name)}</span>
      <span class="wslot__meta">${esc(coachById(s.coach).name)} · ${s.duration} min</span>
      <span class="wslot__cap">${left === 0 ? 'Pilna' : `Liko ${left}`}</span>
    </button>
  </li>`;
};

const emptyHtml = (scope: string) => `
  <div class="tt__empty">
    <p class="tt__empty-title">${scope}</p>
    <p>Pabandyk kitą dieną arba pakeisk filtrus.</p>
    ${filtersActive() ? '<button class="btn btn--outline btn--sm" type="button" data-reset>Išvalyti filtrus</button>' : ''}
  </div>`;

function shell() {
  root.innerHTML = `
  <div class="tt__filters">
    <div class="chips" role="group" aria-label="Treniruotės formatas">
      <button class="chip" type="button" data-format="all">Visi formatai</button>
      ${formats.map((f) => `<button class="chip" type="button" data-format="${f.id}">${esc(f.name)}</button>`).join('')}
    </div>
    <div class="tt__selects">
      <label class="select"><span class="select__label">Lygis</span>
        <select data-filter="level">
          <option value="all">Visi</option>
          ${levels.map((l) => `<option value="${l.id}">${esc(l.label)}</option>`).join('')}
        </select>
      </label>
      <label class="select"><span class="select__label">Treneris</span>
        <select data-filter="coach">
          <option value="all">Visi</option>
          ${coaches.map((c) => `<option value="${c.id}">${esc(c.name)}</option>`).join('')}
        </select>
      </label>
      <label class="toggle"><input type="checkbox" data-filter="free" /><span>Tik su laisvomis vietomis</span></label>
      <button class="btn btn--text btn--sm tt__reset" type="button" data-reset data-reset-bar hidden>Išvalyti filtrus ✕</button>
    </div>
  </div>

  <div class="tt__bar">
    <div class="days" role="tablist" aria-label="Savaitės diena" data-days>
      ${DAYS.map(
        (d, i) => `<button class="day" type="button" role="tab" id="tt-tab-${i}" aria-controls="tt-panel" data-day="${i}">
          <span class="day__short" aria-hidden="true">${DAYS_SHORT[i]}</span><span class="day__long">${d}</span>
          <span class="day__count" data-count="${i}"></span>
          ${i === todayIndex() ? '<span class="day__today">Šiandien</span>' : ''}
        </button>`,
      ).join('')}
      <span class="days__indicator" aria-hidden="true" data-indicator></span>
    </div>
    <div class="view-switch" role="group" aria-label="Rodinys">
      <button type="button" data-view="day">Diena</button>
      <button type="button" data-view="week">Savaitė</button>
    </div>
  </div>

  <p class="tt__status" aria-live="polite" data-status></p>
  <div class="tt__panel" id="tt-panel" data-panel></div>`;
}

function moveIndicator() {
  const tab = root.querySelector<HTMLElement>(`[data-day="${state.day}"]`);
  const ind = root.querySelector<HTMLElement>('[data-indicator]');
  if (!tab || !ind) return;
  ind.style.width = `${tab.offsetWidth}px`;
  ind.style.transform = `translateX(${tab.offsetLeft}px)`;
}

function update(animate = true) {
  // Controls reflect state
  $$<HTMLButtonElement>('[data-format]', root).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.format === state.format)));
  $<HTMLSelectElement>('[data-filter="level"]', root).value = state.level;
  $<HTMLSelectElement>('[data-filter="coach"]', root).value = state.coach;
  $<HTMLInputElement>('[data-filter="free"]', root).checked = state.onlyFree;
  $$<HTMLButtonElement>('[data-view]', root).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.view === state.view)));
  root.dataset.mode = state.view;
  $('[data-reset-bar]', root).hidden = !filtersActive();

  const visible = sorted.filter(matches);

  // Day tabs + counts
  $$<HTMLButtonElement>('[data-day]', root).forEach((b) => {
    const i = Number(b.dataset.day);
    const sel = i === state.day;
    b.setAttribute('aria-selected', String(sel));
    b.tabIndex = sel ? 0 : -1;
    const n = visible.filter((s) => s.day === i).length;
    const count = $(`[data-count="${i}"]`, b);
    count.textContent = String(n);
    count.setAttribute('aria-label', `${n} ${plural(n, ['treniruotė', 'treniruotės', 'treniruočių'])}`);
    b.classList.toggle('is-empty', n === 0);
  });
  moveIndicator();

  const panel = $('[data-panel]', root);
  const status = $('[data-status]', root);

  if (state.view === 'day') {
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', `tt-tab-${state.day}`);
    const list = visible.filter((s) => s.day === state.day);
    status.textContent = `${DAYS[state.day]}: ${list.length} ${plural(list.length, ['treniruotė', 'treniruotės', 'treniruočių'])}`;
    panel.innerHTML = list.length
      ? `<ol class="slots ${animate && !prefersReducedMotion() ? 'is-animated' : ''}">${list.map(slotHtml).join('')}</ol>`
      : emptyHtml(`${DAYS[state.day]} — pagal pasirinktus filtrus treniruočių nėra.`);
  } else {
    panel.removeAttribute('role');
    panel.removeAttribute('aria-labelledby');
    status.textContent = `Visa savaitė: ${visible.length} ${plural(visible.length, ['treniruotė', 'treniruotės', 'treniruočių'])}`;
    panel.innerHTML = visible.length
      ? `<div class="week">${DAYS.map((d, i) => {
          const list = visible.filter((s) => s.day === i);
          return `<section class="week__day ${i === todayIndex() ? 'is-today' : ''}" aria-label="${d}">
              <h3 class="week__name"><span>${d}</span>${i === todayIndex() ? '<em>Šiandien</em>' : ''}</h3>
              ${list.length ? `<ul class="week__list">${list.map(weekSlotHtml).join('')}</ul>` : '<p class="week__none">—</p>'}
            </section>`;
        }).join('')}</div>`
      : emptyHtml('Pagal pasirinktus filtrus šią savaitę treniruočių nėra.');
  }
}

/** Public API used by hero, formats and coaches sections. */
export function setTimetable(partial: Partial<State>, opts: { scroll?: boolean } = {}) {
  Object.assign(state, partial);
  update();
  if (opts.scroll) {
    document.getElementById('tvarkarastis')?.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
  }
}

export function initTimetable() {
  root = $('[data-timetable]');
  shell();
  update(false);

  root.addEventListener('click', (e) => {
    const t = e.target as HTMLElement;
    const fmt = t.closest<HTMLElement>('[data-format]');
    const day = t.closest<HTMLElement>('[data-day]');
    const view = t.closest<HTMLElement>('[data-view]');
    const book = t.closest<HTMLElement>('[data-book]');
    if (fmt) setTimetable({ format: fmt.dataset.format as State['format'] });
    else if (day) setTimetable({ day: Number(day.dataset.day) });
    else if (view) setTimetable({ view: view.dataset.view as View });
    else if (t.closest('[data-reset]')) setTimetable({ format: 'all', level: 'all', coach: 'all', onlyFree: false });
    else if (book) {
      const s = sessions.find((x) => x.id === book.dataset.book);
      if (s) openRegistration({ kind: 'session', session: s }, book);
    }
  });

  root.addEventListener('change', (e) => {
    const t = e.target as HTMLInputElement;
    if (t.dataset.filter === 'level') setTimetable({ level: t.value as State['level'] });
    if (t.dataset.filter === 'coach') setTimetable({ coach: t.value as State['coach'] });
    if (t.dataset.filter === 'free') setTimetable({ onlyFree: t.checked });
  });

  // Roving tabindex keyboard support for day tabs
  $('[data-days]', root).addEventListener('keydown', (e) => {
    const keys: Record<string, number> = { ArrowRight: 1, ArrowLeft: -1 };
    let next: number | null = null;
    if (e.key in keys) next = (state.day + keys[e.key] + 7) % 7;
    if (e.key === 'Home') next = 0;
    if (e.key === 'End') next = 6;
    if (next === null) return;
    e.preventDefault();
    setTimetable({ day: next });
    root.querySelector<HTMLElement>(`[data-day="${next}"]`)?.focus();
  });

  new ResizeObserver(() => moveIndicator()).observe($('[data-days]', root));
}
