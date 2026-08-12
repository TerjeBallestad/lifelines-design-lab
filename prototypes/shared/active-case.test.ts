// @vitest-environment jsdom
// SB-083 — the active-case seam: discovery, default resolution, key
// builders, save target, and the topbar chrome wiring.
// SB-068 — the source-file widening: sourcePaths, the active source, the
// per-path save target, labels, and the allSources picker mode.
import { describe, it, expect } from 'vitest';
import {
  casePaths,
  sourcePaths,
  activeCasePath,
  activeCaseText,
  activeSourcePath,
  activeSourceText,
  isCharacterPath,
  draftKey,
  posKey,
  modeKey,
  pinKey,
  saveCaseUrl,
  saveSourceUrl,
  saveUrlFor,
  caseTitle,
  sourceLabel,
  wireCaseChrome,
} from './active-case.ts';

const OLSEN = 'content/cases/olsen/tiny-olsen.case.md';
const ELLING = 'content/characters/elling.sim.md';

describe('discovery and default resolution', () => {
  it('finds every .case.md under content/cases, sorted, olsen first', () => {
    expect(casePaths.length).toBeGreaterThanOrEqual(2);
    expect(casePaths[0]).toBe(OLSEN);
    expect(casePaths).toContain('content/cases/stub/seam-stub.case.md');
    expect(casePaths).toEqual([...casePaths].sort());
  });

  it('defaults to the first case when no ?case param is present', () => {
    expect(activeCasePath).toBe(OLSEN);
    expect(activeCaseText).toContain('# Case: case_olsen_tiny');
  });

  it('sourcePaths lists every case first, then every character sim file', () => {
    expect(sourcePaths.slice(0, casePaths.length)).toEqual(casePaths);
    const sims = sourcePaths.slice(casePaths.length);
    expect(sims).toContain(ELLING);
    expect(sims).toContain('content/characters/frank.sim.md');
    expect(sims).toContain('content/characters/grete.sim.md');
    expect(sims.every(isCharacterPath)).toBe(true);
    expect(sims).toEqual([...sims].sort());
  });

  it('the active source defaults to the default case', () => {
    expect(activeSourcePath).toBe(OLSEN);
    expect(activeSourceText).toBe(activeCaseText);
  });

  it('isCharacterPath separates the two source families', () => {
    expect(isCharacterPath(ELLING)).toBe(true);
    expect(isCharacterPath(OLSEN)).toBe(false);
  });
});

describe('key builders and save target', () => {
  it('builds the four per-case localStorage keys the probes already use', () => {
    expect(draftKey(OLSEN)).toBe(`kildeverket-draft:${OLSEN}`);
    expect(posKey(OLSEN)).toBe(`kildeverket-canvas-pos:${OLSEN}`);
    expect(modeKey(OLSEN)).toBe(`kildeverket-canvas-mode:${OLSEN}`);
    expect(pinKey(OLSEN)).toBe(`kildeverket-canvas-pins:${OLSEN}`);
  });

  it('save target carries the active case path', () => {
    expect(saveCaseUrl).toBe(`/__save-case?path=${encodeURIComponent(OLSEN)}`);
  });

  it('builds a save target for any source path', () => {
    expect(saveUrlFor(ELLING)).toBe(`/__save-case?path=${encodeURIComponent(ELLING)}`);
    expect(saveSourceUrl).toBe(saveUrlFor(activeSourcePath));
  });
});

describe('picker labels', () => {
  it('labels a case with its compiled slice title', () => {
    expect(caseTitle(OLSEN)).toBe('Olsen - full case slice');
    expect(caseTitle('content/cases/stub/seam-stub.case.md')).toBe('Stub — seam check');
  });

  it('labels a character file with its # Character id', () => {
    expect(sourceLabel(ELLING)).toBe('elling · character');
    expect(sourceLabel(OLSEN)).toBe(caseTitle(OLSEN));
  });
});

describe('wireCaseChrome', () => {
  it('fills the picker with every case and rewrites the lens cross-links', () => {
    document.body.innerHTML =
      `<div id="topbar">` +
      `<select id="case-picker"></select>` +
      `<span class="tabs"><a href="../canvas/">Canvas</a></span>` +
      `</div>`;
    wireCaseChrome();
    const picker = document.getElementById('case-picker') as HTMLSelectElement;
    expect(picker.options.length).toBe(casePaths.length);
    expect(picker.value).toBe(activeCasePath);
    expect([...picker.options].map((o) => o.value)).toEqual(casePaths);
    const link = document.querySelector('#topbar .tabs a') as HTMLAnchorElement;
    expect(link.getAttribute('href')).toBe(`../canvas/?case=${encodeURIComponent(activeCasePath)}`);
  });

  it('lists every source file in allSources mode', () => {
    document.body.innerHTML = `<div id="topbar"><select id="case-picker"></select></div>`;
    wireCaseChrome({ allSources: true });
    const picker = document.getElementById('case-picker') as HTMLSelectElement;
    expect([...picker.options].map((o) => o.value)).toEqual(sourcePaths);
    expect(picker.value).toBe(activeSourcePath);
    const simOption = [...picker.options].find((o) => o.value === ELLING);
    expect(simOption?.textContent).toBe('elling · character');
  });

  it('is a no-op on a page without the chrome', () => {
    document.body.innerHTML = '';
    expect(() => wireCaseChrome()).not.toThrow();
  });
});
