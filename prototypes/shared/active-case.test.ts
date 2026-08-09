// @vitest-environment jsdom
// SB-083 — the active-case seam: discovery, default resolution, key
// builders, save target, and the topbar chrome wiring.
import { describe, it, expect } from 'vitest';
import {
  casePaths,
  activeCasePath,
  activeCaseText,
  draftKey,
  posKey,
  modeKey,
  pinKey,
  saveCaseUrl,
  caseTitle,
  wireCaseChrome,
} from './active-case.ts';

const OLSEN = 'content/cases/olsen/tiny-olsen.case.md';

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
});

describe('picker labels', () => {
  it('labels a case with its compiled slice title', () => {
    expect(caseTitle(OLSEN)).toBe('Olsen — full case slice');
    expect(caseTitle('content/cases/stub/seam-stub.case.md')).toBe('Stub — seam check');
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

  it('is a no-op on a page without the chrome', () => {
    document.body.innerHTML = '';
    expect(() => wireCaseChrome()).not.toThrow();
  });
});
