import { defineConfig } from 'vite';

// Relative base ('./') makes the build work on any GitHub Pages subpath
// (e.g. https://user.github.io/pulsas/) without extra configuration.
// Override with BASE_PATH=/custom/ if you need absolute asset URLs.
export default defineConfig({
  base: process.env.BASE_PATH ?? './',
  build: { target: 'es2020', assetsInlineLimit: 0 },
});
