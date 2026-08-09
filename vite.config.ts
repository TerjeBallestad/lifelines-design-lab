import { writeFile } from 'node:fs/promises';
import { resolve, sep } from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { normalizePath } from 'vite';
import { defineConfig, type Plugin } from 'vitest/config';

// Dev-only write-back for the lens pages (SB-025, SB-083). ⌘S POSTs the
// buffer to /__save-case?path=<relpath>; the target must be a .case.md
// under content/cases/.
function caseSave(): Plugin {
  // Per-path body of the last save POST. The probes import the case files
  // with `?raw`, so our own write would otherwise trigger a full page reload
  // and wipe the selection/focus the probe just set (SB-039). External edits
  // still reload.
  const lastSaved = new Map<string, string>();
  return {
    name: 'case-save',
    configureServer(server) {
      server.middlewares.use('/__save-case', (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end('POST only');
          return;
        }
        const rel = new URL(req.url || '/', 'http://localhost').searchParams.get('path') ?? '';
        const target = resolve(rel);
        const casesRoot = resolve('content/cases');
        if (!rel.endsWith('.case.md') || !target.startsWith(casesRoot + sep)) {
          res.statusCode = 400;
          res.end(`bad case path: ${rel}`);
          return;
        }
        let body = '';
        req.on('data', (chunk) => (body += chunk));
        req.on('end', () => {
          // Key on vite's normalized form — handleHotUpdate's ctx.file uses
          // forward slashes, so a raw win32 path.resolve key would never match.
          lastSaved.set(normalizePath(target), body);
          writeFile(target, body, 'utf8').then(
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
      const saved = lastSaved.get(ctx.file);
      if (saved === undefined) return;
      const content = await ctx.read();
      if (content === saved) return [];
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
