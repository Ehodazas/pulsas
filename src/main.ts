import './styles.css';
import { renderCoaches, renderFormats, renderInfo, renderNextUp, renderPricing, renderRhythm } from './sections/content';
import { initHeroVideo } from './sections/hero-video';
import { initRegistration } from './sections/registration';
import { initTimetable } from './sections/timetable';
import { $, $$, prefersReducedMotion } from './lib/util';

initRegistration();
initHeroVideo();
initTimetable();
renderNextUp();
renderFormats();
renderRhythm();
renderCoaches();
renderPricing();
renderInfo();

/* ---------- Header state ---------- */
const header = $('[data-header]');
const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 24);
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

/* ---------- Mobile menu ---------- */
const toggle = $<HTMLButtonElement>('[data-menu-toggle]');
const menu = $('[data-mobile-menu]');
const setMenu = (open: boolean) => {
  toggle.setAttribute('aria-expanded', String(open));
  $('.menu-toggle__label', toggle).textContent = open ? 'Uždaryti' : 'Meniu';
  document.documentElement.classList.toggle('is-locked', open);
  header.classList.toggle('is-menu-open', open);
  if (open) {
    menu.hidden = false;
    requestAnimationFrame(() => menu.classList.add('is-open'));
    menu.querySelector<HTMLElement>('a')?.focus();
  } else {
    menu.classList.remove('is-open');
    menu.hidden = true;
  }
};
toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
menu.addEventListener('click', (e) => {
  if ((e.target as HTMLElement).closest('a')) setMenu(false);
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
    setMenu(false);
    toggle.focus();
  }
});
window.matchMedia('(min-width: 1180px)').addEventListener('change', (m) => m.matches && setMenu(false));

/* ---------- Reveal on scroll ---------- */
const revealEls = $$('[data-reveal], .section-head, .plan, .principle, .arrival__item, .studio__poster, .studio__detail, .rhythm__row, .wk');
if (prefersReducedMotion() || !('IntersectionObserver' in window)) {
  revealEls.forEach((el) => el.classList.add('is-in'));
} else {
  document.documentElement.classList.add('has-reveal');
  const io = new IntersectionObserver(
    (entries) =>
      entries.forEach((en) => {
        if (en.isIntersecting) {
          en.target.classList.add('is-in');
          io.unobserve(en.target);
        }
      }),
    { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
  );
  revealEls.forEach((el) => io.observe(el));
}

/* ---------- Image fallbacks: keep layout, show a neutral tone if a photo fails ---------- */
document.addEventListener(
  'error',
  (e) => {
    const t = e.target as HTMLElement;
    if (t instanceof HTMLImageElement) {
      t.closest('figure')?.classList.add('img-failed');
      t.style.visibility = 'hidden';
    }
  },
  true,
);
