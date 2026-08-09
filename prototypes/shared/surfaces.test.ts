// @vitest-environment jsdom
// SB-082 — the pure surface renderers, checked against the real Olsen case.
// The renderers return lit TemplateResults, so this is the first time the
// preview surfaces are unit-testable at all: render into a detached host,
// assert on the DOM.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { render } from 'lit-html';
import { compileCase } from '../../src/compiler/index.ts';
import {
  emptySurface,
  factSurface,
  documentSurface,
  hypothesisSurface,
  questionSurface,
  fallbackJsonSurface,
  surfaceFor,
} from './surfaces.ts';
import type { Surface } from './surfaces.ts';

const ROOT = process.cwd();
const result = compileCase(readFileSync(`${ROOT}/content/cases/olsen/tiny-olsen.case.md`, 'utf8'));

function mount(surface: Surface): HTMLElement {
  const host = document.createElement('div');
  render(surface.template, host);
  return host;
}

describe('factSurface', () => {
  it('renders the FUNN hand card and the FAKTUM detail panel', () => {
    const fact = result.slice.facts[0];
    const surface = factSurface(fact.id, result);
    expect(surface.title).toBe(`GAME SURFACE — ${fact.id.toUpperCase()}`);
    const host = mount(surface);
    expect(host.querySelector('.funn-card .funn-quote')!.textContent).toContain(
      fact.quote || fact.summary,
    );
    expect(host.querySelector('.detail-panel .dp-kind')!.textContent!.trim()).toBe('FAKTUM');
    expect(host.querySelector('.detail-panel .dp-title')!.textContent).toContain(fact.label);
  });

  it('escapes markup in content by construction', () => {
    const fact = result.slice.facts[0];
    const doctored = {
      ...result,
      slice: {
        ...result.slice,
        facts: [{ ...fact, label: '<img src=x onerror=alert(1)>' }],
      },
    } as typeof result;
    const host = mount(factSurface(fact.id, doctored));
    expect(host.querySelector('img')).toBeNull();
    expect(host.querySelector('.dp-title')!.textContent).toContain('<img');
  });
});

describe('documentSurface', () => {
  it('renders the sheet iframe frame and carries the bake html out-of-band', () => {
    const docId = Object.keys(result.labContent.documents)[0];
    const surface = documentSurface(docId, result);
    expect(surface.doc).toBeDefined();
    expect(surface.doc!.html).toContain('<html');
    expect(surface.doc!.width).toBeGreaterThan(0);
    const host = mount(surface);
    expect(host.querySelector('.doc-frame-wrap iframe.doc-frame')).not.toBeNull();
    expect(host.querySelector('.lb-hint')).not.toBeNull();
  });
});

describe('hypothesisSurface', () => {
  it('renders the TOLKNING panel with its basis facts', () => {
    const h = result.slice.hypotheses[0];
    const host = mount(hypothesisSurface(h.id, result));
    expect(host.querySelector('.dp-kind')!.textContent!.trim()).toBe('TOLKNING');
    expect(host.querySelector('.dp-title')!.textContent).toContain(h.title);
  });
});

describe('questionSurface', () => {
  it('renders the SPØRSMÅL card', () => {
    const q = result.slice.questions[0];
    const host = mount(questionSurface(q.id, result));
    expect(host.querySelector('.dp-kind')!.textContent!.trim()).toBe('SPØRSMÅL');
    expect(host.querySelector('.dp-title')!.textContent).toContain(q.card_title || q.prompt);
  });
});

describe('fallbackJsonSurface', () => {
  it('shows the compiled node for a kind without a player surface', () => {
    const t = result.slice.tiltak[0];
    const host = mount(fallbackJsonSurface(t.id, 'tiltak', result));
    expect(host.querySelector('.surface-label')!.textContent).toContain('no player-facing surface');
    const json = host.querySelector('.node-json')!.textContent!;
    expect(json).toContain(t.id);
    // pre-wrap element: template indentation around the interpolation would
    // render as blank lines — the json must be the div's exact content.
    expect(json.startsWith('{')).toBe(true);
  });

  it('says so when the id has no compiled node at all', () => {
    const host = mount(fallbackJsonSurface('f_finnes_ikke', 'fact', result));
    expect(host.querySelector('.node-json')!.textContent).toContain('No compiled node');
  });
});

describe('surfaceFor', () => {
  it('clears to the empty surface without touching the result', () => {
    const surface = surfaceFor(null, null, null as never);
    expect(surface.title).toBe(emptySurface().title);
    expect(mount(surface).querySelector('.empty')).not.toBeNull();
  });

  it('dispatches every surfaced kind', () => {
    const fact = result.slice.facts[0];
    expect(mount(surfaceFor(fact.id, 'fact', result)).querySelector('.funn-card')).not.toBeNull();
    const docId = Object.keys(result.labContent.documents)[0];
    expect(mount(surfaceFor(docId, 'document', result)).querySelector('.doc-frame')).not.toBeNull();
    const clock = result.slice.clocks[0];
    expect(mount(surfaceFor(clock.id, 'clock', result)).querySelector('.node-json')).not.toBeNull();
  });
});
