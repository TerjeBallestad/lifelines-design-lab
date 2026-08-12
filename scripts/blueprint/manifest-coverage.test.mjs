// SDD-011 (PLAN-007 TASK-035) — manifest coverage for the economy facts.
//
// The point of moving fact anchors into table cells is that the desk can
// highlight them. This asserts, against the COMMITTED core-loop manifest,
// that each document-anchored economy fact measures at least one UV rect on
// its expected sheet. f_gap has no sheet by design (derived from f_trygd +
// f_husleie) — it must be absent from the manifest entirely.
//
// Verified red-green: 2026-08-12 (f_husleie's rects emptied in a manifest
// copy → the rect assertion fails; measureFacts skipping <td> spans → the
// bake's assertFactCoverage throws naming doc_konto_grete/f_husleie).
import { describe, expect, it } from 'vitest';
import { access, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const manifestPath = resolve(
  process.cwd(),
  '../lifelines-core-loop/resources/cases/olsen/textures/manifest.json',
);

// fact id → the sheet SDD-011 anchors it on.
const EXPECTED_SHEET = {
  f_trygd: 'doc_konto_elling',
  f_alt_via_grete: 'doc_konto_elling',
  f_husleie: 'doc_konto_grete',
  f_ingen_matkjop: 'doc_kassalapp',
};

describe('SDD-011 manifest coverage — the five economy facts', () => {
  it('every document-anchored economy fact measures at least one UV rect on its sheet', async (ctx) => {
    try {
      await access(manifestPath);
    } catch {
      // A checkout without the sibling core-loop repo cannot run the pin —
      // report a visible skip, never a vacuous green.
      ctx.skip(`missing ${manifestPath}`);
      return;
    }
    const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
    for (const [factId, docId] of Object.entries(EXPECTED_SHEET)) {
      const rects = manifest.docs?.[docId]?.facts?.[factId];
      expect(rects, `${docId}/${factId}`).toBeDefined();
      expect(rects.length, `${docId}/${factId} rect count`).toBeGreaterThan(0);
      for (const rect of rects) {
        expect(rect, `${docId}/${factId} rect shape`).toHaveLength(4);
        expect(rect[2], `${docId}/${factId} rect width`).toBeGreaterThan(0);
        expect(rect[3], `${docId}/${factId} rect height`).toBeGreaterThan(0);
      }
    }
    // f_gap is derived — no sheet, so no manifest entry anywhere. An empty
    // rect array would read as covered; assert absence instead.
    for (const [docId, doc] of Object.entries(manifest.docs ?? {})) {
      expect(doc.facts?.f_gap, `${docId} must not carry f_gap`).toBeUndefined();
    }
  });
});
