// @vitest-environment jsdom
// SB-061 Task 2 — the Playtest lens boot smoke. Real main.ts against the
// page's host skeleton: the index populates with every kind group, the
// surface host boots to the empty surface (SB-082: lit owns the host from
// boot), and a selection renders a player surface, not fallback JSON.
// ## Verified red-green: 2026-08-09 (asserted `.idx-group` count against a
// broken buildIndex returning [], watched the boot assertions fail, restored)
import { readFileSync } from 'node:fs';
import { beforeAll, describe, expect, it } from 'vitest';
import { render } from 'lit-html';
import { compileCase } from '../../src/compiler/index.ts';
import { buildIndex, entitySurface } from './model.ts';

const ROOT = process.cwd();
const result = compileCase(readFileSync(`${ROOT}/content/cases/olsen/tiny-olsen.case.md`, 'utf8'));

// The host skeleton from index.html that main.ts wires against.
const PAGE_SKELETON = `
  <div id="app">
    <div id="topbar">
      <select id="case-picker" class="file"></select>
      <span class="tabs">
        <a href="../script-editor/">Script</a>
        <a href="../canvas/">Canvas</a>
        <span class="active">Playtest</span>
      </span>
      <span id="case-note"></span>
    </div>
    <div id="index"></div>
    <div id="reading">
      <div class="read-head" id="surface-title">GAME SURFACE</div>
      <div id="surface" class="surface"></div>
    </div>
  </div>
  <div id="doc-lightbox"></div>`;

describe('playtest page boot', () => {
  beforeAll(async () => {
    document.body.innerHTML = PAGE_SKELETON;
    await import('./main.ts');
  });

  it('populates the index with every kind group and its entities', () => {
    const groups = document.querySelectorAll('#index .idx-group');
    expect(groups.length).toBe(buildIndex(result).length);
    const heads = [...document.querySelectorAll('#index .idx-head')].map((el) => el.textContent!);
    for (const label of ['Documents', 'Facts', 'Clocks', 'Frank chat', 'Calls', 'Event deltas'])
      expect(
        heads.some((h) => h.includes(label)),
        `group ${label}`,
      ).toBe(true);
    expect(document.querySelectorAll('#index .idx-item').length).toBeGreaterThan(50);
  });

  it('boots the surface host to the empty surface, lit-rendered', () => {
    expect(document.querySelector('#surface .empty')).not.toBeNull();
    expect(document.getElementById('surface-title')!.textContent).toBe('GAME SURFACE');
  });

  it('renders a player surface on selection, not fallback JSON', () => {
    const items = [...document.querySelectorAll<HTMLButtonElement>('#index .idx-item')];
    const clockId = result.slice.clocks[0].id;
    items.find((el) => el.title === clockId)!.click();
    expect(document.querySelector('#surface .clock-dial')).not.toBeNull();
    expect(document.querySelector('#surface .node-json')).toBeNull();
    expect(document.getElementById('surface-title')!.textContent).toContain(clockId.toUpperCase());
  });

  it('fills the case picker and carries the case on the lens cross-links', () => {
    expect(document.querySelectorAll('#case-picker option').length).toBeGreaterThan(0);
    for (const link of document.querySelectorAll<HTMLAnchorElement>('#topbar .tabs a'))
      expect(link.href).toContain('case=');
  });
});

describe('entitySurface routing (model)', () => {
  const host = (entryId: string, groupKey: string): HTMLElement => {
    const groups = buildIndex(result);
    const entry = groups.find((g) => g.key === groupKey)!.entries.find((e) => e.id === entryId)!;
    const el = document.createElement('div');
    render(entitySurface(entry, result).template, el);
    return el;
  };

  it('routes beats to the beat surface', () => {
    const el = host(result.slice.day_script_beats[0].id, 'day_script_beats');
    expect(el.querySelector('.dp-kind')!.textContent).toContain('DAGSSKRIPT');
    expect(el.querySelector('.node-json')).toBeNull();
  });

  it('routes event deltas to the honest JSON surface with the real node', () => {
    const delta = result.slice.event_delta_specs[0];
    const el = host(delta.event_type, 'event_delta_specs');
    expect(el.querySelector('.surface-label')!.textContent).toContain('no player-facing surface');
    expect(el.querySelector('.node-json')!.textContent).toContain(delta.event_type);
    expect(el.querySelector('.node-json')!.textContent).not.toContain('No compiled node');
  });

  it('routes every chat row to the shared transcript', () => {
    const el = host(result.slice.frank_chat![1].id, 'frank_chat');
    expect(el.querySelectorAll('.chat-entry').length).toBe(result.slice.frank_chat!.length);
  });
});
