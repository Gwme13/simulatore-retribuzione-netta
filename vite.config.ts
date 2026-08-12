import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * The app is deployed as a GitHub Pages *project* site, so it is served from
 * `/simulatore-retribuzione-netta/` rather than from the domain root. Without a
 * matching `base` every bundled asset would be requested from `/` and 404.
 */
const GITHUB_PAGES_BASE = '/simulatore-retribuzione-netta/';

export default defineConfig({
  base: GITHUB_PAGES_BASE,
  plugins: [react()],
});
