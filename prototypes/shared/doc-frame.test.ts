// @vitest-environment jsdom
// SB-063 regression: rewiring one iframe from sheet A to sheet B must not
// stack load listeners. Each stacked listener hooks one extra click handler
// into the next sheet, so one run click fired onJump once per sheet ever
// shown — a plain lift-click then also jumped. jsdom never fires the srcdoc
// load event, so the test pins the mechanism: one iframe, one load listener,
// however many rewires.
import { describe, expect, it } from 'vitest';
import { wireDocFrame } from './doc-frame.ts';

const sheet = (mark: string) =>
  `<html><body><span data-fact-id="f_${mark}">run ${mark}</span></body></html>`;

describe('wireDocFrame rewiring', () => {
  it('adds exactly one load listener across A → B → A rewires', () => {
    const wrap = document.createElement('div');
    const iframe = document.createElement('iframe');
    wrap.append(iframe);
    document.body.append(wrap);
    let loadListeners = 0;
    const original = iframe.addEventListener.bind(iframe);
    iframe.addEventListener = ((type: string, ...rest: [never, never?]) => {
      if (type === 'load') loadListeners += 1;
      return original(type, ...rest);
    }) as typeof iframe.addEventListener;

    const opts = { onJump: () => {} };
    wireDocFrame(iframe, wrap, sheet('a'), 100, opts);
    wireDocFrame(iframe, wrap, sheet('b'), 100, opts);
    wireDocFrame(iframe, wrap, sheet('a'), 100, opts);
    wireDocFrame(iframe, wrap, sheet('a'), 100, opts); // same-sheet re-render

    expect(loadListeners).toBe(1);
    expect(iframe.srcdoc).toBe(sheet('a'));
  });
});
