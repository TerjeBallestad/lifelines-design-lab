import { writeFile } from 'node:fs/promises';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, type Plugin } from 'vitest/config';

// Relative to the dev-server cwd, which is the project root.
const CASE_PATH = 'content/cases/olsen/tiny-olsen.case.md';

// Dev-only write-back for the SB-025 script-editor probe (prototypes/script-editor).
// ⌘S in the probe POSTs the buffer here; the target path is fixed on purpose.
function caseSave(): Plugin {
  // Body of the last save POST. The probe imports the case file with `?raw`,
  // so our own write would otherwise trigger a full page reload and wipe the
  // selection/focus the probe just set (SB-039). External edits still reload.
  let lastSaved: string | null = null;
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
          lastSaved = body;
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
    async handleHotUpdate(ctx) {
      if (lastSaved === null || !ctx.file.endsWith(CASE_PATH)) return;
      const content = await ctx.read();
      if (content === lastSaved) return [];
    },
  };
}

export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss(), caseSave()],
  test: {
    // `.claude/worktrees/**`: agent worktrees hold a full checkout of an older
    // commit. Without this, vitest runs those stale copies as if they were
    // source and reports failures that the main tree does not have.
    exclude: ['**/node_modules/**', '**/dist/**', '**/.harness/**', '**/.claude/worktrees/**'],
  },
});
