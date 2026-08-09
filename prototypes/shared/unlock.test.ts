// SB-055 — the "what opens this?" sentence, checked against the real case.
// The tiny Olsen slice is the fixture: every sentence must restate a gate the
// emit actually carries, so the test compiles the case instead of hand-built
// slices that could drift from the emit shapes.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { compileCase } from '../../src/compiler/index.ts';
import { unlockSentence } from './unlock.ts';

const ROOT = process.cwd();
const { slice } = compileCase(
  readFileSync(`${ROOT}/content/cases/olsen/tiny-olsen.case.md`, 'utf8'),
);

describe('unlockSentence', () => {
  it('names the source document for every fact', () => {
    for (const fact of slice.facts) {
      const sentence = unlockSentence(fact.id, 'fact', slice);
      if (fact.source_document_id) {
        const doc = slice.documents.find((d) => d.id === fact.source_document_id);
        expect(sentence).toContain('lifts it from');
        if (doc) expect(sentence).toContain(doc.title.replace(/\[icon=[^\]]+\]/g, '').trim());
      } else {
        expect(sentence.length).toBeGreaterThan(0);
      }
    }
  });

  it('gives every document an arrival, a deliverer, or the opening stack', () => {
    for (const doc of slice.documents) {
      const sentence = unlockSentence(doc.id, 'document', slice);
      expect(sentence).toMatch(/Arrives dag \d|Delivered after|opening stack/);
    }
  });

  it('restates a question gate as a plain clause', () => {
    const gated = slice.questions.find((q) => q.reveal_when);
    if (!gated) return;
    const sentence = unlockSentence(gated.id, 'question', slice);
    expect(sentence).toMatch(/^Opens /);
    expect(sentence).toMatch(/is lifted|is chosen|stage \d|combining/);
  });

  it('says so out loud when nothing gates a question', () => {
    for (const q of slice.questions) {
      const sentence = unlockSentence(q.id, 'question', slice);
      expect(sentence.length).toBeGreaterThan(0);
      if (!q.reveal_when && !sentence.startsWith('Opens'))
        expect(sentence).toContain('Visible from the start');
    }
  });

  it('derives the tiltak edge from hypothesis Opens (SB-050 ruling 5)', () => {
    const opened = new Set(
      slice.hypotheses.flatMap((h) =>
        h.opening_sources.flatMap((src) =>
          src.op === 'open_tiltak' ? ((src.args?.tiltak_ids as string[]) ?? []) : [],
        ),
      ),
    );
    for (const t of slice.tiltak) {
      const sentence = unlockSentence(t.id, 'tiltak', slice);
      if (opened.has(t.id)) expect(sentence).toMatch(/^Opens when .* is chosen/);
      else expect(sentence).toContain('Never opens');
    }
  });

  it('anchors every hypothesis under its question', () => {
    for (const h of slice.hypotheses) {
      const sentence = unlockSentence(h.id, 'hypothesis', slice);
      expect(sentence).toMatch(/Selectable|Always selectable/);
      expect(sentence).toContain('under');
    }
  });
});
