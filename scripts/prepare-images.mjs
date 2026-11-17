// Prepares optimized, art-directed WebP derivatives from the licensed source photos in /photos-src.
// Run with: npm run images  (only needed when source photos change). Sources and licenses: photos-src/SOURCES.md
import sharp from 'sharp';
import { mkdirSync, readdirSync, rmSync } from 'node:fs';

const OUT = 'public/img';
rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

/**
 * One shared grade keeps ten photos from four photographers reading as one campaign:
 * slightly muted colour, a touch more contrast, and a faint warm balance.
 * Coaches are printed in monochrome (the strips tint them with the brand lime on hover).
 */
const grade = (img) => img.modulate({ saturation: 0.8 }).linear([1.07, 1.06, 1.02], [-6, -7, -9]);
const mono = (img) => img.grayscale().linear(1.12, -12);

/** name, source, crop {left, top, width, height}, output widths, treatment */
const jobs = [
  // Hero: portrait crop for the desktop column, landscape crop for phones (served via <picture>).
  { name: 'hero', src: 'hero-box-plyometrics.jpg', crop: { left: 120, top: 0, width: 1280, height: 1600 }, widths: [720, 1100, 1280] },
  { name: 'hero-m', src: 'hero-box-plyometrics.jpg', crop: { left: 0, top: 360, width: 1600, height: 1000 }, widths: [640, 1000, 1400] },
  // Formats: square crops survive both the 4:3 (mobile) and 4:5 (desktop) frames.
  { name: 'fmt-functional', src: 'functional-medball-coaching.jpg', crop: { left: 520, top: 0, width: 1600, height: 1600 }, widths: [560, 960] },
  { name: 'fmt-strength', src: 'strength-back-squat.jpg', crop: { left: 560, top: 0, width: 1600, height: 1600 }, widths: [560, 960] },
  { name: 'fmt-hiit', src: 'hiit-jump-ropes.jpg', crop: { left: 990, top: 120, width: 1410, height: 1410 }, widths: [560, 960] },
  { name: 'fmt-mobility', src: 'mobility-floor-stretch.jpg', crop: { left: 700, top: 0, width: 1602, height: 1602 }, widths: [560, 960] },
  // Coaches: 3:4 portraits, one distinct person each.
  { name: 'coach-ieva', src: 'coach-ieva.jpg', crop: { left: 150, top: 0, width: 2250, height: 3000 }, widths: [480, 800], mono: true },
  { name: 'coach-lukas', src: 'coach-lukas.jpg', crop: { left: 694, top: 0, width: 1012, height: 1350 }, widths: [480, 800], mono: true },
  { name: 'coach-dovydas', src: 'coach-dovydas.jpg', crop: { left: 600, top: 0, width: 1200, height: 1600 }, widths: [480, 800], mono: true },
  // Studio
  { name: 'studio-wide', src: 'studio-power-rack.jpg', crop: { left: 0, top: 0, width: 2400, height: 1600 }, widths: [800, 1400] },
  { name: 'studio-detail', src: 'studio-kettlebells.jpg', crop: { left: 240, top: 0, width: 1920, height: 1600 }, widths: [480, 800] },
];

for (const j of jobs) {
  for (const w of j.widths) {
    let img = sharp(`photos-src/${j.src}`).extract(j.crop).resize({ width: w });
    img = j.mono ? mono(img) : grade(img);
    await img.webp({ quality: 76, effort: 5 }).toFile(`${OUT}/${j.name}-${w}.webp`);
  }
  console.log('✓', j.name);
}

// Open Graph / social card: 1200×630 JPEG with the wordmark, so shared links read as PULSAS.
const ogPhoto = await grade(
  sharp('photos-src/hero-box-plyometrics.jpg').extract({ left: 0, top: 170, width: 2400, height: 1260 }).resize(1200, 630),
).toBuffer();
const ogText = Buffer.from(`<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="g" x1="1" x2="0"><stop offset="0" stop-color="#141311" stop-opacity="0.92"/><stop offset="0.62" stop-color="#141311" stop-opacity="0.35"/><stop offset="1" stop-color="#141311" stop-opacity="0"/></linearGradient></defs>
  <rect width="1200" height="630" fill="url(#g)"/>
  <path transform="translate(882 0)" d="M64 92h40l18-46 30 86 20-60 10 20h60" fill="none" stroke="#C7FF3D" stroke-width="9" stroke-linejoin="round" stroke-linecap="round"/>
  <text x="1136" y="420" text-anchor="end" font-family="Arial Narrow, Arial, sans-serif" font-weight="900" font-size="150" fill="#EFE9DD" letter-spacing="-4">PULSAS</text>
  <text x="1132" y="492" text-anchor="end" font-family="Arial, sans-serif" font-weight="700" font-size="34" fill="#C7FF3D">Judėk savo ritmu.</text>
  <text x="1132" y="560" text-anchor="end" font-family="Arial, sans-serif" font-size="24" fill="#EFE9DD" opacity="0.75">Funkcinio treniravimo studija · demonstracinis projektas</text>
</svg>`);
await sharp(ogPhoto).composite([{ input: ogText }]).jpeg({ quality: 82, mozjpeg: true }).toFile('public/og-image.jpg');
console.log('✓ og-image');
console.log(readdirSync(OUT).length, 'files in', OUT);
