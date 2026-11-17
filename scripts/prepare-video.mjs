// Builds the hero video loops and their poster frames from the licensed Pexels source clip.
// Run with: npm run video   (needs ffmpeg — install it locally without touching package.json:
//   npm i --no-save ffmpeg-static)
// Source: "Women Working Out in a Gym Jumping" by Antoni Shkraba, https://www.pexels.com/video/4671976/
// (Pexels License). The clip is illustrative stock footage — the people are not PULSAS clients.
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, statSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
let ffmpeg;
try {
  ffmpeg = require('ffmpeg-static');
} catch {
  console.error('ffmpeg-static is not installed. Run: npm i --no-save ffmpeg-static');
  process.exit(1);
}

const SRC_URL = 'https://videos.pexels.com/video-files/4671976/4671976-hd_1920_1080_25fps.mp4';
const CACHE = '.cache';
const SRC = `${CACHE}/hero-source-4671976.mp4`;
mkdirSync(CACHE, { recursive: true });
mkdirSync('public/video', { recursive: true });

if (!existsSync(SRC)) {
  console.log('Downloading source clip…');
  const res = await fetch(SRC_URL);
  if (!res.ok) throw new Error(`Download failed: ${res.status}`);
  writeFileSync(SRC, Buffer.from(await res.arrayBuffer()));
}

// 7.6 s of the relay: one athlete jumps while the others hold a plank, then they switch.
const START = '4.6';
const LENGTH = '7.6';
const POSTER_AT = '6.9'; // mid-jump: the still shown before playback and when motion is off
const GRADE = 'eq=saturation=0.9:contrast=1.04'; // close to the shared photo grade

const run = (args) => execFileSync(ffmpeg, ['-hide_banner', '-loglevel', 'error', '-y', ...args], { stdio: 'inherit' });
const encode = (out, vf, crf) =>
  run(['-ss', START, '-t', LENGTH, '-i', SRC, '-an', '-vf', `${vf},${GRADE}`, '-c:v', 'libx264', '-preset', 'slow',
    '-crf', String(crf), '-profile:v', 'high', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out]);
const still = (out, vf) => run(['-ss', POSTER_AT, '-i', SRC, '-frames:v', '1', '-vf', vf ? `${vf},${GRADE}` : GRADE, '-q:v', '2', out]);

// Desktop: 4:5 crop for the hero column, centred on the jumping athlete.
const DESKTOP = 'crop=864:1080:470:0';
// Phones: 16:10 crop of the full scene.
const MOBILE = 'crop=1728:1080:96:0';

encode('public/video/hero-desktop.mp4', `${DESKTOP},scale=768:960`, 29);
encode('public/video/hero-mobile.mp4', `${MOBILE},scale=960:600`, 29);
still('photos-src/hero-video-desktop.jpg', DESKTOP);
still('photos-src/hero-video-mobile.jpg', MOBILE);
still('photos-src/hero-video-frame.jpg', '');

for (const f of ['public/video/hero-desktop.mp4', 'public/video/hero-mobile.mp4']) {
  console.log('✓', f, `${(statSync(f).size / 1048576).toFixed(2)} MB`);
}
console.log('Posters written to photos-src/ — run `npm run images` next.');
