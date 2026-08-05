import { writeFile } from 'node:fs/promises';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, type Plugin } from 'vitest/config';

// Relative to the dev-server cwd, which is the project root.
const CASE_PATH = 'content/cases/olsen/tiny-olsen.case.md';

// Dev-only write-back for the SB-025 script-editor probe (prototypes/script-editor).
// ⌘S in the probe POSTs the buffer here; the target path is fixed on purpose.
function caseSave(): Plugin {
  return {
    name: 'case-save',
    configureServer(server) {
      server.middlewares.use('/__save-case', (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end('POST only');
          return;
        }
        let body = '';
        req.on('data', (chunk) => (body += chunk));
        req.on('end', () => {
          writeFile(CASE_PATH, body, 'utf8').then(
            () => res.end('ok'),
            (err: unknown) => {
              res.statusCode = 500;
              res.end(String(err));
            },
          );
        });
      });
    },
  };
}

export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss(), caseSave()],
  test: {
    exclude: ['**/node_modules/**', '**/dist/**', '**/.harness/**'],
  },
});
