# Photo sources and licenses

The nine source photos and the hero video clip were downloaded on 2026-11-17 from the listed pages. On that date each Unsplash page showed **"Free to use under the Unsplash License"**, and each Pexels page was a "Free Stock Photo" with a link to the Pexels License. The HIIT, Mobility and "Lukas" photos were swapped in a second pass to give a darker, more consistent set. Later the hero photo was replaced by a short licensed video loop ("Women Working Out in a Gym Jumping"); its Pexels search data listed `license: "Pexels"`. The clip page itself could not be opened from the automated browser (Pexels showed a bot check), so the licence text on that page was not read directly. Neither license requires attribution, but credit is given here anyway.

Neither license grants model or property releases. People and the identities shown in the photos must not be presented as endorsing a real business. In this demo, the coach names are illustrative and are attached to stock portraits. **Before using this design for a real studio, replace the coach portraits with photos of the actual coaches.**

| File | Used for | Photographer | Source |
| --- | --- | --- | --- |
| `hero-video-*.jpg` (poster frames) + `public/video/hero-*.mp4` | Hero video, posters, OG image | Antoni Shkraba | https://www.pexels.com/video/4671976/ |
| `functional-medball-coaching.jpg` | Functional | Julia Larson | https://www.pexels.com/photo/6455800/ |
| `strength-back-squat.jpg` | Strength | Alora Griffiths | https://unsplash.com/photos/aVrZMPgN_Vg |
| `hiit-jump-ropes.jpg` | HIIT | cottonbro studio | https://www.pexels.com/photo/4761352/ |
| `mobility-floor-stretch.jpg` | Mobility | Pavel Danilyuk | https://www.pexels.com/photo/6926037/ |
| `studio-power-rack.jpg` | Studio (wide) | Mirko Meister | https://unsplash.com/photos/j4T5z94b8ns |
| `studio-kettlebells.jpg` | Studio (detail) | Heidi Erickson | https://unsplash.com/photos/CPSjcuuV8E8 |
| `coach-ieva.jpg` | Coach "Ieva K." | Rafik Wahba | https://unsplash.com/photos/ZkAy5kqvs-A |
| `coach-lukas.jpg` | Coach "Lukas R." | Vitaly Gariev | https://unsplash.com/photos/V-gUIqzSXig |
| `coach-dovydas.jpg` | Coach "Dovydas P." | Lorenzo Fattò Offidani | https://unsplash.com/photos/P6T1R9rSL0Q |

## Notes from the photo review

- Crops were chosen to keep apparel and gym branding out of frame.
- The HIIT crop keeps the poster wall on the left of the original photo out of frame.
- A few small marks are still visible at full resolution: a blank chest patch on the "Lukas" T-shirt, and small text on the mats and rack hooks. None of them are readable at the sizes the site uses.
- `npm run images` applies one shared grade to every photo (slightly muted colour and a little more contrast) and prints the coaches in monochrome, so the photos read as one series.

## Hero video

- Source: Pexels 4671976, 1920×1080, 25 fps, 12.4 s. `npm run video` (needs `npm i --no-save ffmpeg-static`) cuts 4.6–12.2 s, applies a light grade and writes:
  - `public/video/hero-desktop.mp4`: 4:5 crop, 768×960, H.264, about 1.2 MB
  - `public/video/hero-mobile.mp4`: 16:10 crop, 960×600, H.264, about 0.8 MB
  - poster frames in `photos-src/hero-video-*.jpg` (then `npm run images`)
- The page labels it "Iliustracinis vaizdas · ne PULSAS klientai", so nobody mistakes the athletes for studio members.
