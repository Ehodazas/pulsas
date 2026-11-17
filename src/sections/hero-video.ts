// Hero video: a short muted loop layered over the poster still.
// - Not loaded at all under prefers-reduced-motion or the browser's data-saver mode (the still stays).
// - Picks the 4:5 desktop crop or the 16:10 phone crop, and swaps if the breakpoint changes.
// - Pauses while the hero is off-screen; the visible pause button satisfies WCAG 2.2.2 (pause moving content).

import { $, prefersReducedMotion } from '../lib/util';

type NetworkInfo = { saveData?: boolean };

export function initHeroVideo() {
  const media = $('.hero__media');
  const video = $<HTMLVideoElement>('[data-hero-video]', media);
  const button = $<HTMLButtonElement>('[data-hero-motion]', media);
  const label = $('[data-hero-motion-label]', button);

  const saveData = (navigator as Navigator & { connection?: NetworkInfo }).connection?.saveData === true;
  if (prefersReducedMotion() || saveData) return;

  const desktop = window.matchMedia('(min-width: 900px)');
  const srcFor = () => `${import.meta.env.BASE_URL}video/hero-${desktop.matches ? 'desktop' : 'mobile'}.mp4`;
  let userPaused = false;
  let inView = true;

  const tryPlay = () => {
    if (userPaused || !inView) return;
    video.play().catch(() => {
      /* Autoplay refused (e.g. low-power mode): keep the still image. */
    });
  };
  const load = () => {
    video.src = srcFor();
    video.load();
    tryPlay();
  };

  video.addEventListener('playing', () => {
    media.classList.add('is-playing');
    button.hidden = false;
  });
  video.addEventListener('error', () => {
    media.classList.remove('is-playing');
    button.hidden = true;
  });

  button.addEventListener('click', () => {
    userPaused = !userPaused;
    button.setAttribute('aria-pressed', String(userPaused));
    label.textContent = userPaused ? 'Paleisti vaizdo įrašą' : 'Sustabdyti vaizdo įrašą';
    if (userPaused) video.pause();
    else tryPlay();
  });

  desktop.addEventListener('change', load);

  if ('IntersectionObserver' in window) {
    new IntersectionObserver((entries) => {
      // Several changes can arrive in one batch (fast scrolling): the last entry is the current state.
      inView = entries[entries.length - 1].isIntersecting;
      if (inView) tryPlay();
      else video.pause();
    }).observe(media);
  }

  load();
}
