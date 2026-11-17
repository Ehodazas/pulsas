# PULSAS — boutique fitness studio (demo)

A portfolio site for a made-up Lithuanian boutique studio for functional and group training.
It is a static site built with Vite and vanilla TypeScript, with no runtime framework and no UI libraries.

> **This is a demo.** The studio, the coaches, the prices, the timetable, the capacity numbers, the address and the email are all made up. The site says so wherever a visitor might take them for real.

## Stack

- **Vite 6 + TypeScript.** The production bundle is about 14 kB JS and 9 kB CSS (gzipped).
- **Build-time prerender** (`scripts/prerender.mjs`). After `vite build`, the same markup builders the app uses at runtime (`src/sections/markup.ts`) fill the formats, rhythm scale, coaches, prices, arrival tips, hours and FAQ into `dist/index.html`. Crawlers and visitors without JS get real content. The timetable stays client-side.
- **Archivo** (Google Fonts, variable `wdth` + `wght`). One family covers the condensed display type and the readable body text, with full Lithuanian character support.
- The base path is relative (`./`), so the build works under any GitHub Pages subpath without changes.

## Development

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + production build + prerender into dist/
npm run preview    # serve dist/ locally
```

## Where to edit content

All demo content lives in `src/data/`. Each file feeds every part of the site that uses that data.

| File | Contents |
| --- | --- |
| `formats.ts` | The 4 training formats: copy, intensity (1–5), duration, images, and the illustrative **rhythm** used by the Ritmo skalė |
| `sessions.ts` | **One weekly timetable** shared by the hero "next session" card, the day tabs, the filters, the week view and the registration prefill. Capacity is illustrative. |
| `coaches.ts` | The 3 illustrative coach profiles |
| `pricing.ts` | The 3 membership options (demo prices) |
| `studio.ts` | Contact email, city, sample hours, arrival tips, FAQ |

## Registration / inquiry form

The site has no booking backend, so the form sends an **inquiry**. It never claims that a booking is confirmed.

- **Demo mode** (default, when `VITE_FORM_ENDPOINT` is empty): nothing is sent. The visitor is told this plainly and can open a prefilled `mailto:` message.
- **Formspree** (or any endpoint that accepts JSON POST):
  1. Create a form at formspree.io and copy its endpoint (`https://formspree.io/f/xxxxxxx`).
  2. For local use, copy `.env.example` to `.env` and set `VITE_FORM_ENDPOINT=...`.
  3. For GitHub Pages, add a repository **variable** `VITE_FORM_ENDPOINT` (Settings → Secrets and variables → Actions → Variables). The workflow passes it in at build time.
- The adapter is in `src/lib/submit.ts`. Adjust it there if you use another provider.
- When a request fails, the visitor sees an error with a retry button and a mailto fallback.

## Deploying to GitHub Pages

1. Push the repository to GitHub, using `main` as the branch.
2. Go to Settings → Pages → Source and choose **GitHub Actions**.
3. `.github/workflows/deploy.yml` builds and publishes `dist/` on every push to `main`.

`canonical`, `og:url`, `og:image` and `twitter:image` in `index.html` are absolute URLs on `https://ehodazas.github.io/pulsas/`. Change them if the site moves to another domain.

## Images

The site uses ten distinct, licensed photos: one each for the hero, the four formats and the two studio shots, plus three coach portraits. No photo is reused anywhere on the page. Sources, photographers and license notes are in [`photos-src/SOURCES.md`](photos-src/SOURCES.md).

`npm run images` (sharp) crops the sources in `photos-src/`, applies one shared colour grade and writes responsive WebP files to `public/img/`. It also writes the 1200×630 social card `public/og-image.jpg`. The hero is art-directed through `<picture>`, with a portrait crop on desktop and a landscape crop on phones, and is preloaded. All other images are lazy-loaded.

The coach portraits are stock photos of models standing in for illustrative profiles. Replace them with photos of the real coaches before any real use.

If an image fails to load, its frame shows a neutral pattern, so the layout does not shift.

## Ritmo skalė

The rhythm scale under the formats compares the four formats as pulse lines drawn in the same style as the logo. Each line shows how a class is structured, meaning when people work and when they recover, along with tempo, group size (read from the timetable data) and how suitable the format is for beginners. The lines are **illustrative**. They do not measure heart rate or any other physiological value, and the page says so. Each line draws once when it scrolls into view and stays static under `prefers-reduced-motion`.

## Accessibility & motion

- Semantic landmarks, a skip link, a `lang="lt"` attribute, labelled form controls, and errors announced inline through `aria-describedby`.
- The timetable day tabs follow the ARIA tabs pattern, with roving tabindex and arrow/Home/End keys. Filters are native controls.
- The registration flow uses the native `<dialog>`. It traps focus, closes with Esc, and returns focus to the button that opened it.
- All animation is turned off under `prefers-reduced-motion`. The site does no scroll hijacking.

## Placeholders to replace before going live

- `studio.ts` → the real email (it currently uses the reserved `.example` domain), the address, and the opening hours.
- `pricing.ts` → real prices and conditions. The items marked `*` are sample conditions.
- `coaches.ts` → real people and photos.
- `studio.ts` FAQ → the real cancellation policy.
- The privacy text in `src/sections/registration.ts` → your real privacy notice.
