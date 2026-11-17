// Build-time prerender: fills the <!--prerender:name--> markers in dist/index.html with the same
// markup the app renders at runtime (src/sections/markup.ts). Crawlers and no-JS visitors get the
// formats, rhythm scale, coaches, prices, arrival tips, hours and FAQ as plain HTML; the app then
// re-renders those containers and attaches its event handlers. The timetable stays client-side.
import { readFileSync, writeFileSync } from 'node:fs';
import { createServer } from 'vite';

const server = await createServer({
  server: { middlewareMode: true },
  appType: 'custom',
  logLevel: 'error',
  optimizeDeps: { noDiscovery: true, include: [] }, // no dependency pre-bundling needed for SSR of plain modules
});
try {
  const { prerenderTargets } = await server.ssrLoadModule('/src/sections/markup.ts');
  const file = 'dist/index.html';
  let html = readFileSync(file, 'utf8');
  let count = 0;
  for (const [name, build] of Object.entries(prerenderTargets)) {
    const marker = `<!--prerender:${name}-->`;
    if (!html.includes(marker)) throw new Error(`Marker not found in ${file}: ${marker}`);
    // The dev server resolves the base to "/", the production build uses a relative base: keep image URLs relative.
    const markup = build().replace(/(["\s,])\/img\//g, '$1img/');
    html = html.replace(marker, markup);
    count++;
  }
  writeFileSync(file, html);
  console.log(`prerender: filled ${count} sections in ${file}`);
} finally {
  await server.close();
}
