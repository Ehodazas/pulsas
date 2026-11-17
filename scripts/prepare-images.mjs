// Prepares optimized, cropped WebP derivatives from the source photos in /photos-src.
// Run with: npm run images  (only needed when source photos change).
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';

const OUT = 'public/img';
mkdirSync(OUT, { recursive: true });

/** name, source, crop {left, top, width, height}, output widths, extra treatment */
const jobs = [
  { name: 'hero', src: '1.webp', crop: { left: 0, top: 60, width: 1024, height: 964 }, widths: [1024, 640] },
  { name: 'hero-wide', src: '4.webp', crop: { left: 0, top: 0, width: 1536, height: 1024 }, widths: [1536, 900] },
  { name: 'fmt-functional', src: '1.webp', crop: { left: 60, top: 150, width: 900, height: 820 }, widths: [900, 560] },
  { name: 'fmt-strength', src: '5.webp', crop: { left: 1180, top: 330, width: 740, height: 820 }, widths: [740, 480] },
  { name: 'fmt-hiit', src: '4.webp', crop: { left: 520, top: 120, width: 720, height: 800 }, widths: [720, 480] },
  { name: 'fmt-mobility', src: '4.webp', crop: { left: 1060, top: 420, width: 476, height: 560 }, widths: [476] },
  { name: 'coach-1', src: '1.webp', crop: { left: 120, top: 170, width: 360, height: 640 }, widths: [360], gray: true },
  { name: 'coach-2', src: '1.webp', crop: { left: 420, top: 170, width: 320, height: 570 }, widths: [320], gray: true },
  { name: 'coach-3', src: '4.webp', crop: { left: 620, top: 80, width: 460, height: 818 }, widths: [460], gray: true },
  { name: 'studio-wide', src: '5.webp', crop: { left: 0, top: 250, width: 900, height: 630 }, widths: [900, 560] },
  { name: 'studio-detail', src: '5.webp', crop: { left: 1250, top: 560, width: 670, height: 560 }, widths: [670, 420] },
];

for (const j of jobs) {
  for (const w of j.widths) {
    let img = sharp(`photos-src/${j.src}`).extract(j.crop).resize({ width: w });
    if (j.gray) img = img.grayscale().linear(1.12, -10);
    await img.webp({ quality: 78 }).toFile(`${OUT}/${j.name}-${w}.webp`);
  }
  console.log('✓', j.name);
}

// Open Graph image (JPEG for widest compatibility)
await sharp('photos-src/1.webp')
  .extract({ left: 0, top: 200, width: 1024, height: 538 })
  .resize({ width: 1200, height: 630 })
  .jpeg({ quality: 80 })
  .toFile('public/og-image.jpg');
console.log('✓ og-image');
