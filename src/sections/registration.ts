import { coachById } from '../data/coaches';
import { formatById } from '../data/formats';
import type { Plan } from '../data/pricing';
import { spotsLeft, type Session } from '../data/sessions';
import { studio } from '../data/studio';
import { isDemoMode, submitInquiry, type InquiryPayload, type SubmitResult } from '../lib/submit';
import { $, DAYS, endTime, esc, plural } from '../lib/util';

export type RegContext =
  | { kind: 'session'; session: Session }
  | { kind: 'plan'; plan: Plan }
  | { kind: 'question' };

let dialog: HTMLDialogElement;
let current: RegContext | null = null;
let lastTrigger: HTMLElement | null = null;

const describe = (ctx: RegContext) => {
  if (ctx.kind === 'session') {
    const s = ctx.session;
    const f = formatById(s.format);
    const c = coachById(s.coach);
    const left = spotsLeft(s);
    const full = left === 0;
    const when = `${DAYS[s.day]}, ${s.start}–${endTime(s.start, s.duration)}`;
    return {
      type: (full ? 'laukiančiųjų sąrašas' : 'treniruotė') as InquiryPayload['type'],
      title: full ? 'Laukiančiųjų sąrašas' : 'Registracijos užklausa',
      label: f.name,
      heading: s.focus ? `${f.name} · ${s.focus}` : f.name,
      meta: [when, `Treneris: ${c.name}`, full ? 'Vietų nėra (demo)' : `Liko ${left} ${plural(left, ['vieta', 'vietos', 'vietų'])} (demo)`],
      note: full
        ? 'Treniruotė pilna. Jei kas nors atšauks registraciją, parašysime el. paštu.'
        : 'Tai užklausa, ne patvirtinta rezervacija. Vietą patvirtinsime el. paštu.',
      subject: `${full ? 'Laukiančiųjų sąrašas' : 'Registracija'}: ${f.name}, ${when}`,
      details: `Treniruotė: ${f.name}${s.focus ? ` (${s.focus})` : ''}\nLaikas: ${when}\nTreneris: ${c.name}`,
      commentHint: 'Pvz., ar tai pirmoji tavo treniruotė, traumos, į ką atkreipti dėmesį',
      submit: full ? 'Įrašyti į sąrašą' : 'Siųsti užklausą',
    };
  }
  if (ctx.kind === 'plan') {
    const p = ctx.plan;
    return {
      type: 'narystė' as const,
      title: 'Narystės užklausa',
      label: 'Narystė',
      heading: p.name,
      meta: [`${p.price} € · ${p.unit}`, 'Demo kaina'],
      note: 'Atsiųsime mokėjimo informaciją ir padėsime išsirinkti pirmąją treniruotę. Mokėjimas internetu nevykdomas.',
      subject: `Narystė: ${p.name}`,
      details: `Narystė: ${p.name} (${p.price} €, ${p.unit})`,
      commentHint: 'Pvz., nuo kada norėtum pradėti, kokie formatai domina',
      submit: 'Siųsti užklausą',
    };
  }
  return {
    type: 'klausimas' as const,
    title: 'Klausimas studijai',
    label: 'Klausimas',
    heading: 'Parašyk — atsakysime',
    meta: ['Atsakome darbo dienomis'],
    note: 'Paklausk apie treniruotes, narystes ar pirmą apsilankymą.',
    subject: 'Klausimas studijai PULSAS',
    details: 'Bendras klausimas',
    commentHint: 'Tavo klausimas',
    submit: 'Siųsti klausimą',
  };
};

const formTemplate = (ctx: RegContext): string => {
  const d = describe(ctx);
  const commentRequired = ctx.kind === 'question';
  return `
  <div class="reg__panel">
    <header class="reg__head">
      <p class="eyebrow">${esc(d.label)}</p>
      <h2 class="reg__title" id="reg-title">${esc(d.title)}</h2>
      <button class="reg__close" type="button" data-reg-close aria-label="Uždaryti">✕</button>
    </header>
    <div class="reg__summary">
      <p class="reg__summary-title">${esc(d.heading)}</p>
      <ul class="reg__meta">${d.meta.map((m) => `<li>${esc(m)}</li>`).join('')}</ul>
    </div>
    <p class="reg__note">${esc(d.note)}</p>
    ${isDemoMode() ? `<p class="reg__demo" role="note"><strong>Demo režimas.</strong> Formos siuntimo paslauga neprijungta — užklausa nebus išsiųsta automatiškai, bet galėsi ją atidaryti el. pašto programoje.</p>` : ''}
    <form class="reg__form" novalidate data-reg-form>
      <div class="field">
        <label for="reg-name">Vardas ir pavardė <span aria-hidden="true">*</span></label>
        <input id="reg-name" name="name" type="text" autocomplete="name" required minlength="2" maxlength="80" aria-describedby="reg-name-err" />
        <p class="field__error" id="reg-name-err" aria-live="polite"></p>
      </div>
      <div class="field-row">
        <div class="field">
          <label for="reg-email">El. paštas <span aria-hidden="true">*</span></label>
          <input id="reg-email" name="email" type="email" autocomplete="email" inputmode="email" required maxlength="120" aria-describedby="reg-email-err" />
          <p class="field__error" id="reg-email-err" aria-live="polite"></p>
        </div>
        <div class="field">
          <label for="reg-phone">Telefonas <span class="field__opt">neprivaloma</span></label>
          <input id="reg-phone" name="phone" type="tel" autocomplete="tel" inputmode="tel" maxlength="20" placeholder="+370" aria-describedby="reg-phone-err" />
          <p class="field__error" id="reg-phone-err" aria-live="polite"></p>
        </div>
      </div>
      <div class="field">
        <label for="reg-comment">${commentRequired ? 'Klausimas <span aria-hidden="true">*</span>' : 'Komentaras <span class="field__opt">neprivaloma</span>'}</label>
        <textarea id="reg-comment" name="comment" rows="3" maxlength="600" ${commentRequired ? 'required' : ''} placeholder="${esc(d.commentHint)}" aria-describedby="reg-comment-err"></textarea>
        <p class="field__error" id="reg-comment-err" aria-live="polite"></p>
      </div>
      <input class="hp" type="text" name="_gotcha" tabindex="-1" autocomplete="off" aria-hidden="true" />
      <div class="field field--check">
        <input id="reg-consent" name="consent" type="checkbox" required aria-describedby="reg-consent-err reg-privacy" />
        <label for="reg-consent">Sutinku, kad mano duomenys būtų naudojami tik atsakyti į šią užklausą.</label>
        <p class="field__error" id="reg-consent-err" aria-live="polite"></p>
      </div>
      <p class="reg__privacy" id="reg-privacy">Duomenų neperduodame trečiosioms šalims, išskyrus formos pristatymo paslaugą, ir nenaudojame rinkodarai. <em>Pavyzdinis privatumo tekstas — prieš paleidžiant pakeiskite tikru.</em></p>
      <div class="reg__actions">
        <button class="btn btn--ink" type="submit" data-reg-submit>${esc(d.submit)}</button>
        <button class="btn btn--text" type="button" data-reg-close>Atšaukti</button>
      </div>
    </form>
  </div>`;
};

const resultTemplate = (r: SubmitResult): string => {
  if (r.status === 'sent') {
    return `
    <div class="reg__panel reg__result" role="status">
      <p class="reg__result-mark" aria-hidden="true">✓</p>
      <h2 class="reg__title" id="reg-title" tabindex="-1">Užklausa išsiųsta</h2>
      <p>Ačiū! Gavome tavo užklausą. Atsakysime el. paštu — iki tol vieta nėra galutinai patvirtinta.</p>
      <div class="reg__actions"><button class="btn btn--ink" type="button" data-reg-close>Gerai</button></div>
    </div>`;
  }
  if (r.status === 'demo') {
    return `
    <div class="reg__panel reg__result" role="status">
      <p class="reg__result-mark reg__result-mark--demo" aria-hidden="true">i</p>
      <h2 class="reg__title" id="reg-title" tabindex="-1">Užklausa neišsiųsta — demo režimas</h2>
      <p>Svetainėje dar neprijungta formų siuntimo paslauga, todėl niekas nebuvo išsiųsta ir vieta nerezervuota.</p>
      <p>Gali atidaryti iš anksto užpildytą laišką el. pašto programoje (adresas <strong>${esc(studio.email)}</strong> yra pavyzdinis).</p>
      <div class="reg__actions">
        <a class="btn btn--ink" href="${esc(r.mailto)}">Atidaryti el. laišką</a>
        <button class="btn btn--text" type="button" data-reg-close>Uždaryti</button>
      </div>
    </div>`;
  }
  return `
    <div class="reg__panel reg__result" role="alert">
      <p class="reg__result-mark reg__result-mark--err" aria-hidden="true">!</p>
      <h2 class="reg__title" id="reg-title" tabindex="-1">Nepavyko išsiųsti</h2>
      <p>${esc(r.message)}</p>
      <div class="reg__actions">
        <button class="btn btn--ink" type="button" data-reg-retry>Bandyti dar kartą</button>
        <a class="btn btn--text" href="${esc(r.mailto)}">Rašyti el. paštu</a>
      </div>
    </div>`;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^\+?[\d\s()-]{6,20}$/;

function validate(form: HTMLFormElement, focus = true): boolean {
  const get = (n: string) => form.elements.namedItem(n) as HTMLInputElement;
  const checks: [HTMLInputElement, string][] = [];
  const name = get('name');
  const email = get('email');
  const phone = get('phone');
  const comment = get('comment');
  const consent = get('consent');

  const v = (s: string) => s.trim();
  checks.push([name, v(name.value).length < 2 ? 'Įrašyk vardą (bent 2 simboliai).' : '']);
  checks.push([email, !v(email.value) ? 'Įrašyk el. pašto adresą.' : !EMAIL_RE.test(v(email.value)) ? 'Patikrink el. pašto adresą, pvz., vardas@pastas.lt.' : '']);
  checks.push([phone, v(phone.value) && !PHONE_RE.test(v(phone.value)) ? 'Telefono numeris atrodo neteisingas.' : '']);
  checks.push([comment, comment.required && v(comment.value).length < 3 ? 'Parašyk savo klausimą.' : '']);
  checks.push([consent, !consent.checked ? 'Be sutikimo negalėsime atsakyti į užklausą.' : '']);

  let firstInvalid: HTMLInputElement | null = null;
  for (const [el, msg] of checks) {
    const err = form.querySelector<HTMLElement>(`#${el.id}-err`);
    if (err) err.textContent = msg;
    if (msg) el.setAttribute('aria-invalid', 'true');
    else el.removeAttribute('aria-invalid');
    if (msg && !firstInvalid) firstInvalid = el;
  }
  if (focus) firstInvalid?.focus();
  return !firstInvalid;
}

function render(ctx: RegContext) {
  dialog.innerHTML = formTemplate(ctx);
  const form = $<HTMLFormElement>('[data-reg-form]', dialog);

  // Re-validate a field as soon as the user fixes it
  form.addEventListener('input', (e) => {
    const el = e.target as HTMLInputElement;
    if (el.getAttribute('aria-invalid') === 'true') validate(form, false);
  });
  form.addEventListener('change', (e) => {
    const el = e.target as HTMLInputElement;
    if (el.type === 'checkbox' && el.getAttribute('aria-invalid') === 'true') validate(form, false);
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validate(form)) return;
    const data = new FormData(form);
    if (String(data.get('_gotcha') ?? '')) return; // bot honeypot
    const d = describe(ctx);
    const payload: InquiryPayload = {
      type: d.type,
      subject: d.subject,
      details: d.details,
      name: String(data.get('name')).trim(),
      email: String(data.get('email')).trim(),
      phone: String(data.get('phone') ?? '').trim() || undefined,
      comment: String(data.get('comment') ?? '').trim() || undefined,
    };
    const btn = $<HTMLButtonElement>('[data-reg-submit]', form);
    btn.disabled = true;
    btn.textContent = 'Siunčiama…';
    const result = await submitInquiry(payload);
    dialog.innerHTML = resultTemplate(result);
    dialog.querySelector<HTMLElement>('#reg-title')?.focus();
    dialog.querySelector('[data-reg-retry]')?.addEventListener('click', () => render(ctx));
  });

  requestAnimationFrame(() => $<HTMLInputElement>('#reg-name', dialog).focus());
}

export function openRegistration(ctx: RegContext, trigger?: HTMLElement | null) {
  current = ctx;
  lastTrigger = trigger ?? (document.activeElement as HTMLElement | null);
  render(ctx);
  if (!dialog.open) dialog.showModal();
  document.documentElement.classList.add('is-locked');
}

export function initRegistration() {
  dialog = $<HTMLDialogElement>('[data-register]');
  dialog.addEventListener('click', (e) => {
    const t = e.target as HTMLElement;
    // Close via button or by clicking the backdrop (the dialog element itself)
    if (t.closest('[data-reg-close]') || t === dialog) dialog.close();
  });
  dialog.addEventListener('close', () => {
    document.documentElement.classList.remove('is-locked');
    current = null;
    lastTrigger?.focus({ preventScroll: true });
  });
}

export const isRegistrationOpen = () => current !== null;
