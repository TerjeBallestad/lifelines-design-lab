import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';
// @ts-expect-error untyped dev-only plugin (plain .mjs)
import { caseAuthoringApi } from './tools/vite/case-authoring-api.mjs';

export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss(), caseAuthoringApi()],
  test: {
    exclude: ['**/node_modules/**', '**/dist/**', '**/.harness/**'],
  },
});
