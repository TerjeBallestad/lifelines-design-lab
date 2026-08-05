import { describe, expect, it } from 'vitest';
import { compileCase } from '../index';
import { codes } from '../diagnostics';

function beatCase(lines: string[]): string {
  return ['# Case: c_x', 'Title: X', '', '# Beat: day 1', 'Tekst.', ...lines].join('\n');
}

describe('§7 effect lines — EffectSpec emit for ops the runtime has', () => {
  it('~ deliver doc in Nd on ck → queue_pending_document with clock bucket', () => {
    const out = compileCase(beatCase(['~ deliver doc_x in 2d on ck_y']));
    expect(out.slice.day_script_beats[0].effects).toEqual([
      {
        op: 'queue_pending_document',
        args: { clock_id: 'ck_y', document_id: 'doc_x', delay_days: 2 },
      },
    ]);
  });

  it('~ deliver without on-clause omits clock_id (sparse-field law)', () => {
    const out = compileCase(beatCase(['~ deliver doc_x in 1d']));
    expect(out.slice.day_script_beats[0].effects).toEqual([
      { op: 'queue_pending_document', args: { document_id: 'doc_x', delay_days: 1 } },
    ]);
  });

  it('~ open lines merge into one reveal_questions effect', () => {
    const out = compileCase(beatCase(['~ open q_a', '~ open q_b']));
    expect(out.slice.day_script_beats[0].effects).toEqual([
      { op: 'reveal_questions', args: { question_ids: ['q_a', 'q_b'] } },
    ]);
  });

  it('~ stage N → set_scenario_stage', () => {
    const out = compileCase(beatCase(['~ stage 1']));
    expect(out.slice.day_script_beats[0].effects).toEqual([
      { op: 'set_scenario_stage', args: { stage: 1 } },
    ]);
  });

  it('legacy Effects: pending_doc … parses with a fix-it diagnostic', () => {
    const text = [
      '# Case: c_x',
      'Title: X',
      '',
      '# Dispatch: d_a',
      'Title: T',
      'Sim hook: s.h',
      'Description: D',
      'Gate: fact f_a',
      'Effects: pending_doc doc_x after 1 day on ck_y',
    ].join('\n');
    const out = compileCase(text);
    expect(out.slice.dispatches[0].effects).toEqual([
      {
        op: 'queue_pending_document',
        args: { clock_id: 'ck_y', document_id: 'doc_x', delay_days: 1 },
      },
    ]);
    expect(out.diagnostics.some((d) => d.code === codes.FIXIT_EFFECTS_LINE)).toBe(true);
  });
});

describe('§7 emit boundary (DD-002) — ops the runtime lacks warn and emit nothing', () => {
  const table: Array<[string, string]> = [
    ['~ pay f_x', codes.EFFECT_UNSUPPORTED_PAY],
    ['~ clock ck_x +1', codes.EFFECT_UNSUPPORTED_CLOCK],
    ['~ log «Grete tok imot leveringen.»', codes.EFFECT_UNSUPPORTED_LOG],
  ];

  for (const [line, code] of table) {
    it(`${line.split(' ')[1]}: warns ${code}, emits no JSON for the construct`, () => {
      const out = compileCase(beatCase([line]));
      const diag = out.diagnostics.find((d) => d.code === code);
      expect(diag).toBeDefined();
      expect(diag?.severity).toBe('warning');
      expect(out.slice.day_script_beats[0].effects).toEqual([]);
    });
  }

  it('an unknown ~ verb yields effect-parse-error, never a crash', () => {
    const out = compileCase(beatCase(['~ frobnicate x']));
    expect(out.diagnostics.some((d) => d.code === codes.EFFECT_PARSE_ERROR)).toBe(true);
    expect(out.slice.day_script_beats[0].effects).toEqual([]);
  });
});
