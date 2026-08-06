// SB-031 acceptance: (a) a no-op patch is byte-identical, (b) patch→compile
// equals editing the field by hand, (c) list ops preserve line order and
// formatting, (d) patches compose. Run against the real Olsen case so the
// patch layer meets every shape the markup actually uses.

import { describe, expect, it } from 'vitest';
import olsen from '../../../content/cases/olsen/tiny-olsen.case.md?raw';
import { compileCase } from '../index';
import {
  PatchError,
  appendBlock,
  liftFact,
  listFieldAdd,
  listFieldRemove,
  patchField,
  removeBlock,
} from '../patch';

/** Lines that differ between two texts, as [lineNo, before, after]. */
function changedLines(before: string, after: string): Array<[number, string, string]> {
  const a = before.split('\n');
  const b = after.split('\n');
  const out: Array<[number, string, string]> = [];
  for (let i = 0; i < Math.max(a.length, b.length); i += 1) {
    if (a[i] !== b[i]) out.push([i + 1, a[i] ?? '<none>', b[i] ?? '<none>']);
  }
  return out;
}

describe('(a) no-op patches are byte-identical', () => {
  it('patchField with the current value returns the same text', () => {
    expect(patchField(olsen, 'f_bok', 'Label', 'Bok med notater')).toBe(olsen);
    expect(patchField(olsen, 'q_kollaps', 'when', 'f_dod')).toBe(olsen);
    expect(patchField(olsen, 'd_konto', 'gate', 'f_gap')).toBe(olsen);
  });

  it('listFieldAdd of an already-listed entry returns the same text', () => {
    expect(listFieldAdd(olsen, 'f_aldri_alene', 'Supports', 'q_evner')).toBe(olsen);
  });

  it('listFieldAdd matches an entry that carries a bracket payload', () => {
    expect(listFieldAdd(olsen, 'h_ok_gap', 'Opens', 'c_frank_okonomi')).toBe(olsen);
  });

  it('listFieldRemove of an absent entry returns the same text', () => {
    expect(listFieldRemove(olsen, 'f_bok', 'Supports', 'q_bolig')).toBe(olsen);
  });
});

describe('(b) patch→compile equals editing the field by hand', () => {
  it('patchField(Label) compiles like a hand edit of that line', () => {
    const patched = patchField(olsen, 'f_bok', 'Label', 'Notatboken');
    const byHand = olsen.replace('Label: Bok med notater', 'Label: Notatboken');
    expect(patched).toBe(byHand);
    expect(compileCase(patched).slice).toEqual(compileCase(byHand).slice);
  });

  it('patchField on a composite line touches only its own segment', () => {
    const patched = patchField(olsen, 'f_bok', 'Category', 'Observasjon');
    const diff = changedLines(olsen, patched);
    expect(diff).toHaveLength(1);
    expect(diff[0][2]).toBe('Domain: Ressurser · Category: Observasjon');
  });

  it('patchField(when) rewrites a condition expression', () => {
    const patched = patchField(olsen, 'q_kollaps', 'when', 'f_dod and f_brevsprekken');
    const diff = changedLines(olsen, patched);
    expect(diff).toEqual([[447, 'when: f_dod', 'when: f_dod and f_brevsprekken']]);
    expect(compileCase(patched).diagnostics.filter((d) => d.severity === 'error')).toEqual([]);
  });

  it('patchField inserts a missing field after the last field line', () => {
    const patched = patchField(olsen, 'f_trygd', 'Card', '«Trygden — 2 i måneden.»');
    const diff = changedLines(olsen, patched);
    expect(diff[0]).toEqual([96, '', 'Card: «Trygden — 2 i måneden.»']);
    const fact = compileCase(patched).slice.facts.find((f: { id: string }) => f.id === 'f_trygd');
    expect(fact).toBeTruthy();
  });

  it('patchField preserves a trailing // comment on the line', () => {
    const fixture =
      '# Case: c\n\nTitle: T\n\n# Question: q_x\n\nTitle: Old // keep me\nwhen: f_a\n';
    const patched = patchField(fixture, 'q_x', 'Title', 'New');
    expect(patched).toContain('Title: New // keep me');
  });

  it('refuses field edits on prose/weave blocks', () => {
    expect(() => patchField(olsen, 'beat_grete_d5', 'Title', 'x')).toThrow(PatchError);
    expect(() => patchField(olsen, 'chat:frank', 'gate', 'f_dod')).toThrow(PatchError);
  });
});

describe('(c) list ops preserve line order and formatting', () => {
  it('listFieldAdd appends to the existing line without reformatting it', () => {
    const patched = listFieldAdd(olsen, 'f_bok', 'Supports', 'q_liv');
    const diff = changedLines(olsen, patched);
    expect(diff).toEqual([[280, 'Supports: q_evner', 'Supports: q_evner, q_liv']]);
  });

  it('listFieldAdd fills an empty list field in place', () => {
    const patched = listFieldAdd(olsen, 'h_ev_ukjent', 'Needs', 'f_aldri_alene');
    const diff = changedLines(olsen, patched);
    expect(diff).toEqual([[500, 'Needs:', 'Needs: f_aldri_alene']]);
  });

  it('listFieldRemove keeps the order of the remaining entries', () => {
    const patched = listFieldRemove(olsen, 'h_gd_infra', 'Opens', 't_matlevering');
    const diff = changedLines(olsen, patched);
    expect(diff).toEqual([
      [
        469,
        'Opens: t_hjemmehjelp, t_matlevering, t_dokgjennomgang',
        'Opens: t_hjemmehjelp, t_dokgjennomgang',
      ],
    ]);
  });

  it('listFieldRemove matches an entry by id token when it carries a payload', () => {
    const patched = listFieldRemove(olsen, 'h_ok_gap', 'Opens', 'c_frank_okonomi');
    const diff = changedLines(olsen, patched);
    expect(diff).toHaveLength(1);
    expect(diff[0][2]).toBe('Opens: t_bostotte, t_huseier, d_konto');
  });

  it('listFieldRemove of the last entry leaves the bare key line', () => {
    const once = listFieldRemove(olsen, 'f_bok', 'Supports', 'q_evner');
    const diff = changedLines(olsen, once);
    expect(diff).toEqual([[280, 'Supports: q_evner', 'Supports:']]);
  });
});

describe('append/remove blocks', () => {
  it('appendBlock adds an entity block at the end of the file', () => {
    const patched = appendBlock(olsen, 'question', 'q_ny', {
      template: 'Title: Nytt spørsmål\nTeaser: \nwhen: f_dod',
    });
    expect(patched.startsWith(olsen.trimEnd())).toBe(true);
    expect(patched).toContain('\n# Question: q_ny\n\nTitle: Nytt spørsmål\n');
    const compiled = compileCase(patched);
    expect(compiled.slice.questions.some((q: { id: string }) => q.id === 'q_ny')).toBe(true);
  });

  it('appendBlock(fact) inserts under its parent document', () => {
    const patched = appendBlock(olsen, 'fact', 'f_ny', {
      documentId: 'doc_huseier',
      template:
        'Label: Ny\nSummary: Ny.\nDomain: Økonomi/bolig · Category: Dokument\nSupports: q_bolig',
    });
    const lines = patched.split('\n');
    const at = lines.indexOf('## f_ny');
    expect(at).toBeGreaterThan(-1);
    // Sits after doc_huseier's last fact and before the next document.
    expect(lines.slice(0, at).lastIndexOf('# Document: doc_huseier')).toBeGreaterThan(-1);
    expect(lines.indexOf('# Document: doc_frank_tlf')).toBeGreaterThan(at);
    const fact = compileCase(patched).slice.facts.find((f: { id: string }) => f.id === 'f_ny');
    expect(fact?.source_document_id).toBe('doc_huseier');
  });

  it('appendBlock throws on a duplicate id', () => {
    expect(() => appendBlock(olsen, 'question', 'q_bolig')).toThrow(PatchError);
  });

  it('removeBlock removes exactly the block and keeps single blank separation', () => {
    const patched = removeBlock(olsen, 'ck_selvstendighet');
    expect(patched).not.toContain('# Clock: ck_selvstendighet');
    expect(patched).toContain('# Clock: ck_overfort');
    expect(patched).toContain('# Clock: ck_omsorgssvikt');
    expect(patched).not.toMatch(/\n\n\n/);
  });

  it('removeBlock of a fact leaves its document intact', () => {
    const patched = removeBlock(olsen, 'f_dor_glott');
    expect(patched).not.toContain('## f_dor_glott');
    expect(patched).toContain('## f_smart_gutt');
    expect(patched).toContain('# Document: doc_frank_visit');
  });
});

describe('liftFact (SB-043): a document passage becomes a fact stub', () => {
  it('appends the stub at the end of the document fact run with Quote pre-filled', () => {
    const passage = 'han kan ha behov for støtte ved mors bortfall';
    const { text, id, labelLine } = liftFact(olsen, 'doc_bekymring', passage);
    expect(id).toBe('f_ny');
    // The exact markup a human would have typed.
    expect(text).toContain(
      '## f_ny\n' +
        'Label: \n' +
        'Summary: \n' +
        'Domain:  · Category: \n' +
        'Supports: \n' +
        'Discuss: Frank\n' +
        `Quote: «${passage}»\n`,
    );
    // Sits after the document's last fact, before the next document.
    const lines = text.split('\n');
    const at = lines.indexOf('## f_ny');
    expect(at).toBeGreaterThan(lines.indexOf('## f_ingen_tjenester'));
    expect(at).toBeLessThan(lines.indexOf('# Document: doc_konto'));
    // labelLine points at the empty Label line — where focus goes next.
    expect(lines[labelLine - 1]).toBe('Label: ');
    // The ## placement wires it: the compiled fact carries its document.
    const fact = compileCase(text).slice.facts.find((f: { id: string }) => f.id === 'f_ny');
    expect(fact?.source_document_id).toBe('doc_bekymring');
  });

  it('normalizes the passage: anchors unwrap, whitespace collapses, «» never double', () => {
    const raw = 'en [sykdom med kort forventet forløp](fact:f_grete_syk)\n  kommer  frem';
    const { text } = liftFact(olsen, 'doc_bekymring', raw);
    expect(text).toContain('Quote: «en sykdom med kort forventet forløp kommer frem»');
    const wrapped = liftFact(olsen, 'doc_bekymring', '«Det er en dør på gløtt.»');
    expect(wrapped.text).toContain('Quote: «Det er en dør på gløtt.»');
  });

  it('a second lift gets a fresh id (f_ny2) and lifts compose', () => {
    const first = liftFact(olsen, 'doc_bekymring', 'første løft');
    const second = liftFact(first.text, 'doc_konto', 'andre løft');
    expect(second.id).toBe('f_ny2');
    expect(second.text).toContain('## f_ny\n');
    expect(second.text).toContain('## f_ny2\n');
    const facts = compileCase(second.text).slice.facts as Array<{
      id: string;
      source_document_id?: string;
    }>;
    expect(facts.find((f) => f.id === 'f_ny2')?.source_document_id).toBe('doc_konto');
  });

  it('refuses an empty selection and a non-document source', () => {
    expect(() => liftFact(olsen, 'doc_bekymring', '  «»  ')).toThrow(PatchError);
    expect(() => liftFact(olsen, 'f_grete_syk', 'noe tekst')).toThrow(PatchError);
    expect(() => liftFact(olsen, 'doc_finnes_ikke', 'noe tekst')).toThrow(PatchError);
  });
});

describe('(d) patches compose', () => {
  it('a chain of patches applies cleanly and compiles', () => {
    let text = olsen;
    text = patchField(text, 'f_bok', 'Label', 'Notatboken');
    text = listFieldAdd(text, 'f_bok', 'Supports', 'q_liv');
    text = listFieldRemove(text, 'h_gd_infra', 'Opens', 't_matlevering');
    text = appendBlock(text, 'question', 'q_ny', {
      template: 'Title: Nytt\nTeaser: \nwhen: f_dod',
    });
    text = patchField(text, 'q_ny', 'Teaser', 'En ny tråd.');
    text = removeBlock(text, 'ck_selvstendighet');

    const compiled = compileCase(text);
    expect(compiled.diagnostics.filter((d) => d.severity === 'error')).toEqual([]);
    expect(text).toContain('Label: Notatboken');
    expect(text).toContain('Teaser: En ny tråd.');
    // The block is gone; the event-delta reference to it stays — reference
    // cleanup is the canvas's concern, not the patch layer's.
    expect(text).not.toContain('# Clock: ck_selvstendighet');
    // Untouched blocks kept their bytes.
    expect(text).toContain('Frank: ««Omfanget er ikke kartlagt».');
  });
});
