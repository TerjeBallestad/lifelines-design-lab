import { describe, expect, it } from 'vitest';
import { compileCase } from '../index';
import fragments from './fixtures/shipped-fragments.json';
import caseText from './fixtures/fragments.case.md?raw';

// Every expected fragment below comes from shipped-fragments.json, which is
// copied verbatim (programmatically) from
// ../lifelines-core-loop/resources/cases/olsen/source/tiny_olsen_slice.json.
// scripts/compiler/provenance.test.mjs re-asserts that copy against the live
// shipped file whenever the core-loop checkout is present.

const result = compileCase(caseText);
const slice = result.slice;

function byId<T extends { id: string }>(items: T[], id: string): T {
  const found = items.find((item) => item.id === id);
  if (!found) throw new Error(`missing ${id} in ${items.map((i) => i.id).join(', ')}`);
  return found;
}

describe('§1 case header', () => {
  it('emits id/title/scenario_stage and Deadline → vurdering_frist_day', () => {
    expect({
      id: slice.id,
      title: slice.title,
      scenario_stage: slice.scenario_stage,
      vurdering_frist_day: slice.vurdering_frist_day,
    }).toEqual(fragments.header);
  });

  it('omits vurdering_frist_day when no Deadline line (sparse-field law)', () => {
    const minimal = compileCase('# Case: c_x\nTitle: X\nStage: 0\n');
    expect('vurdering_frist_day' in minimal.slice).toBe(false);
  });
});

describe('§2 documents', () => {
  it('emits doc_dodsfall byte-identical to the shipped document (anchors → runs + bbcode)', () => {
    expect(byId(slice.documents, 'doc_dodsfall')).toEqual(fragments.documents.doc_dodsfall);
  });

  it('passes [icon=coin] through the markdown→bbcode pass untouched', () => {
    const text = [
      '# Case: c_x',
      'Title: X',
      '',
      '# Document: doc_a',
      'Kind: BREV · Register: formell',
      'Title: T',
      'Peek: p',
      'Meta: M',
      '',
      'Trygden hans — 2 [icon=coin] i måneden. [Leien har stoppet.](fact:f_a)',
      '',
      '## f_a',
      'Label: L',
      'Summary: S',
      'Domain: D · Category: C',
    ].join('\n');
    const out = compileCase(text);
    expect(out.slice.documents[0].body_bbcode).toContain('2 [icon=coin] i måneden');
    expect(out.slice.documents[0].body_bbcode).toContain('[url=fact:f_a]Leien har stoppet.[/url]');
  });
});

describe('§3 facts', () => {
  it('fact under a document inherits it as source', () => {
    expect(byId(slice.facts, 'f_dor_glott')).toEqual(fragments.facts.f_dor_glott);
  });

  it('Reveals: call:grete → reveals_event with namespaced handle kept', () => {
    expect(byId(slice.facts, 'f_klarer_seg')).toEqual(fragments.facts.f_klarer_seg);
  });

  it('Frank: «…» → frank_response', () => {
    expect(byId(slice.facts, 'f_grete_syk')).toEqual(fragments.facts.f_grete_syk);
  });

  it('~ open q_x on a fact → reveal_questions lift effect', () => {
    expect(byId(slice.facts, 'f_dod')).toEqual(fragments.facts.f_dod);
  });

  it('plain fact: sparse fields omitted, quote derived from the document anchor', () => {
    expect(byId(slice.facts, 'f_leie_stoppet')).toEqual(fragments.facts.f_leie_stoppet);
  });
});

describe('§4 questions', () => {
  it('Card title → card_title; when: → reveal_when (Card sub culled by SB-050)', () => {
    expect(byId(slice.questions, 'q_vekst')).toEqual(fragments.questions.q_vekst);
  });

  it('blank Teaser: is a deliberate empty string, not an omission', () => {
    expect(byId(slice.questions, 'q_baering')).toEqual(fragments.questions.q_baering);
  });

  it('Frank: «…» → frank_response, omitted when unset (SB-057)', () => {
    const text = [
      '# Case: c_x',
      'Title: X',
      '',
      '# Question: q_a',
      'Title: Q?',
      'Frank: «Svaret hans.»',
      '',
      '# Question: q_b',
      'Title: Q2?',
      '',
    ].join('\n');
    const out = compileCase(text);
    expect(byId(out.slice.questions, 'q_a').frank_response).toBe('Svaret hans.');
    expect('frank_response' in byId(out.slice.questions, 'q_b')).toBe(false);
  });

  it('single-term when: emits a bare fact_lifted predicate', () => {
    expect(byId(slice.questions, 'q_kollaps')).toEqual(fragments.questions.q_kollaps);
  });

  it('canonical Lead: «label» -> target emits one {label, target} object per lead', () => {
    // Canonical shape per PLAN-003 SDD deviation 2 (GAP-001): the shipped
    // heterogeneous leads union is dead; byte-equality is impossible by design.
    expect(byId(slice.questions, 'q_okonomi').leads).toEqual([
      { label: 'Be om økonomisk oversikt', target: 'd_konto' },
    ]);
  });
});

describe('§4 hypotheses', () => {
  it('Opens: bracket payload → open_conversation with metadata keys outside args', () => {
    expect(byId(slice.hypotheses, 'h_ok_gap')).toEqual(fragments.hypotheses.h_ok_gap);
  });

  it('needs: a and b → all-predicate availability; plain Opens groups by prefix', () => {
    expect(byId(slice.hypotheses, 'h_gd_system')).toEqual(fragments.hypotheses.h_gd_system);
  });
});

describe('§4 tiltak', () => {
  it('Weight: heavy emits weight', () => {
    expect(byId(slice.tiltak, 't_institusjon')).toEqual(fragments.tiltak.t_institusjon);
  });

  it('unset weight is omitted, not defaulted (sparse-field law)', () => {
    expect(byId(slice.tiltak, 't_bostotte')).toEqual(fragments.tiltak.t_bostotte);
  });
});

describe('§5 dispatches', () => {
  it('Channel/Delay/Duration/Occupies/Reception/Activity + gate + ~ deliver', () => {
    expect(byId(slice.dispatches, 'd_konto')).toEqual(fragments.dispatches.d_konto);
  });

  it('negative Reception and empty effects', () => {
    expect(byId(slice.dispatches, 'hjemmebesok')).toEqual(fragments.dispatches.hjemmebesok);
  });
});

describe('§5 clocks', () => {
  it('authored zero good segment + Max: N (ck_grete: 0 is explicit, not default 4)', () => {
    expect(byId(slice.clocks, 'ck_grete')).toEqual(fragments.clocks.ck_grete);
  });

  it('visible when: → visibility predicate; no Max line → no max_value', () => {
    expect(byId(slice.clocks, 'ck_bostotte')).toEqual(fragments.clocks.ck_bostotte);
  });

  it('plain clock without visibility or max', () => {
    expect(byId(slice.clocks, 'ck_overfort')).toEqual(fragments.clocks.ck_overfort);
  });

  it('empty good label with authored zero and max', () => {
    expect(byId(slice.clocks, 'ck_restanse')).toEqual(fragments.clocks.ck_restanse);
  });
});

describe('§5 beats', () => {
  it('# Beat: day 2 [id=…] with prose only', () => {
    expect(byId(slice.day_script_beats, 'beat_grete_d2')).toEqual(
      fragments.day_script_beats.beat_grete_d2,
    );
  });

  it('~ deliver in a beat → queue_pending_document effect', () => {
    expect(byId(slice.day_script_beats, 'beat_grete_d5')).toEqual(
      fragments.day_script_beats.beat_grete_d5,
    );
  });

  it('document arrives: day 6 on ck_grete merges into the authored day-6 beat', () => {
    expect(byId(slice.day_script_beats, 'beat_grete_d6')).toEqual(
      fragments.day_script_beats.beat_grete_d6,
    );
  });

  it('derives a stable beat id when the header carries none', () => {
    const text = ['# Case: c_x', 'Title: X', '', '# Beat: day 3', 'Noe skjer.'].join('\n');
    const out = compileCase(text);
    expect(out.slice.day_script_beats).toEqual([
      { id: 'beat_d3', day: 3, text: 'Noe skjer.', effects: [] },
    ]);
  });
});

describe('labContent', () => {
  it('keeps authored single line breaks inside a paragraph block', () => {
    const text = [
      '# Case: c_x',
      'Title: X',
      '',
      '# Document: doc_brev',
      'Kind: BREV · Register: formell',
      'Title: Brev',
      '',
      'Første avsnitt.',
      '',
      'Med hilsen',
      'Jørgen Haug',
      'spes. allmennmedisin',
    ].join('\n');
    const out = compileCase(text);
    const blocks = out.labContent.documents.doc_brev.blocks;
    expect(blocks.length).toBe(2);
    expect(blocks[1].runs[0].text).toBe('Med hilsen\nJørgen Haug\nspes. allmennmedisin');
    // slice canon stays collapsed
    const sliceDoc = out.slice.documents.find((d) => d.id === 'doc_brev')!;
    expect(sliceDoc.runs.every((run) => !run.text.includes('\n'))).toBe(true);
  });

  it('mirrors the design-lab shapes from the same source', () => {
    // One block per authored paragraph; flattened content mirrors the slice
    // runs (modulo the paragraph-boundary whitespace the slice collapses).
    const blocks = result.labContent.documents.doc_dodsfall.blocks;
    expect(blocks.length).toBeGreaterThan(1);
    const flatText = blocks
      .flatMap((block) => block.runs.map((run) => run.text))
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
    const sliceText = fragments.documents.doc_dodsfall.runs
      .map((run) => run.text)
      .join('')
      .replace(/\s+/g, ' ')
      .trim();
    expect(flatText).toBe(sliceText);
    expect(blocks.flatMap((block) => block.runs.filter((run) => run.factId))).toEqual(
      fragments.documents.doc_dodsfall.runs
        .filter((run) => run.fact_id)
        .map((run) => ({ text: run.text, factId: run.fact_id })),
    );
    expect(result.labContent.facts.f_leie_stoppet).toEqual({
      id: 'f_leie_stoppet',
      domain: 'Økonomi/bolig',
      category: 'Risiko',
      text: 'Husleien har stoppet. Betalingskjeden døde med Grete.',
      quote: 'Leien for mars er ikke kommet.',
      supports: ['q_bolig', 'q_kollaps'],
    });
    expect(result.labContent.tiltak.t_bostotte.sim).toBe('case.olsen.tiltak.bostotte');
    expect(result.labContent.dispatches.d_konto).toEqual({
      id: 'd_konto',
      title: 'Be om økonomisk oversikt',
      description:
        'Frank ringer til Grete og spør om hun kan skaffe en bankutskrift. Utskriften kommer i morgen.',
    });
    const q = result.labContent.questions.q_grete_dor;
    expect(q.hypotheses.map((h: { id: string }) => h.id)).toEqual(['h_gd_system']);
  });
});
