// @vitest-environment jsdom
// Smoke test for the SB-025 script-editor probe: boots the page in jsdom over
// the real compiler and the real case file, then edits through the editor.
import { readFileSync } from 'node:fs';
import { describe, expect, it, vi } from 'vitest';

// CodeMirror measures text with Range APIs jsdom does not implement.
Range.prototype.getBoundingClientRect = () =>
  ({ x: 0, y: 0, top: 0, left: 0, right: 0, bottom: 0, width: 0, height: 0 }) as DOMRect;
Range.prototype.getClientRects = () =>
  ({ length: 0, item: () => null, [Symbol.iterator]: [][Symbol.iterator] }) as DOMRectList;

const ROOT = process.cwd();

describe('script editor probe', () => {
  it('boots, compiles the real case, and reacts to edits', async () => {
    const html = readFileSync(`${ROOT}/prototypes/script-editor/index.html`, 'utf8');
    const body = html.slice(html.indexOf('<body>') + 6, html.indexOf('</body>'));
    document.body.innerHTML = body.replace(/<script[^]*?<\/script>/g, '');

    const { view } = await import('./main.ts');

    const statusbar = document.getElementById('statusbar')!;
    expect(statusbar.textContent).toContain('compiled');
    expect(statusbar.textContent).toMatch(/\d+ nodes/);

    const outline = document.getElementById('outline')!;
    expect(outline.textContent).toContain('Documents');
    expect(outline.textContent).toContain('Questions');

    expect(document.querySelector('.cm-content')).toBeTruthy();

    // Edit through the editor: a new TODO line must reach the status bar.
    const before = statusbar.textContent!.match(/(\d+) TODO/)?.[1] ?? '0';
    view.dispatch({ changes: { from: 0, insert: 'TODO: smoke test line\n' } });
    await new Promise((r) => setTimeout(r, 400));
    const after = statusbar.textContent!.match(/(\d+) TODO/)?.[1] ?? '0';
    expect(Number(after)).toBe(Number(before) + 1);

    const problems = document.getElementById('problem-list')!;
    expect(problems.textContent).toContain('TODO');
  });

  it('restores an unsaved draft from localStorage after a reload', async () => {
    vi.resetModules();
    const html = readFileSync(`${ROOT}/prototypes/script-editor/index.html`, 'utf8');
    const body = html.slice(html.indexOf('<body>') + 6, html.indexOf('</body>'));
    document.body.innerHTML = body.replace(/<script[^]*?<\/script>/g, '');
    const caseText = readFileSync(`${ROOT}/content/cases/olsen/tiny-olsen.case.md`, 'utf8');
    const draft = `TODO: draft survives reload\n${caseText}`;
    localStorage.setItem('kildeverket-draft:content/cases/olsen/tiny-olsen.case.md', draft);

    const { view } = await import('./main.ts');

    expect(view.state.doc.toString()).toBe(draft);
    expect(document.getElementById('save-state')!.textContent).toContain('restored');
    localStorage.clear();
  });

  it('builds real-template preview HTML for every compiled document', async () => {
    const { compileCase } = await import('../../src/compiler/index.ts');
    const { buildDocPreviewHtml } = await import('../shared/doc-preview.ts');
    const text = readFileSync(`${ROOT}/content/cases/olsen/tiny-olsen.case.md`, 'utf8');
    const { labContent } = compileCase(text);
    for (const [docId, doc] of Object.entries(labContent.documents)) {
      const built = buildDocPreviewHtml(docId, doc as never);
      expect(built.html).toContain('<!doctype html>');
      expect(built.html).toContain('@font-face');
      expect(built.width).toBeGreaterThan(0);
      const firstBlock = doc.blocks[0];
      if (firstBlock?.type === 'para' && firstBlock.runs.some((r) => r.factId)) {
        expect(built.html).toContain('data-fact-id=');
      }
    }
  });
});
