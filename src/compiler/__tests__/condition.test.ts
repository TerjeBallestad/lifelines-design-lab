import { describe, expect, it } from 'vitest';
import { compileCase } from '../index';
import { codes } from '../diagnostics';

function questionCase(when: string): string {
  return ['# Case: c_x', 'Title: X', '', '# Question: q_a', 'Title: T?', `when: ${when}`].join(
    '\n',
  );
}

function revealWhen(when: string) {
  return compileCase(questionCase(when)).slice.questions[0].reveal_when;
}

function diagnosticsFor(when: string) {
  return compileCase(questionCase(when)).diagnostics;
}

const factLifted = (id: string) => ({ op: 'fact_lifted', args: { fact_id: id } });

describe('§6 condition grammar — one parser for when:/needs:/gate:/visible when:', () => {
  it('and → all with children; single term collapses to the bare predicate', () => {
    expect(revealWhen('f_a')).toEqual(factLifted('f_a'));
    expect(revealWhen('f_a and f_b')).toEqual({
      op: 'all',
      children: [factLifted('f_a'), factLifted('f_b')],
    });
  });

  it('comma list reads as AND (§10: Opens when: a, b — no edit needed)', () => {
    expect(revealWhen('f_a, f_b')).toEqual({
      op: 'all',
      children: [factLifted('f_a'), factLifted('f_b')],
    });
  });

  it('or → any, parens group', () => {
    expect(revealWhen('f_a and (f_b or f_c)')).toEqual({
      op: 'all',
      children: [
        factLifted('f_a'),
        { op: 'any', children: [factLifted('f_b'), factLifted('f_c')] },
      ],
    });
  });

  it('not → not', () => {
    expect(revealWhen('not f_a')).toEqual({ op: 'not', children: [factLifted('f_a')] });
  });

  it('stage N → scenario_stage_at_least', () => {
    expect(revealWhen('stage 1')).toEqual({ op: 'scenario_stage_at_least', args: { stage: 1 } });
  });

  it('h_ prefix → hypothesis_chosen (runtime op the grammar keeps)', () => {
    expect(revealWhen('h_ok_gap')).toEqual({
      op: 'hypothesis_chosen',
      args: { hypothesis_id: 'h_ok_gap' },
    });
  });

  it('legacy Gate tokens: hypothesis h_x + fact f_y', () => {
    const text = [
      '# Case: c_x',
      'Title: X',
      '',
      '# Dispatch: d_a',
      'Title: T',
      'Sim hook: s.h',
      'Description: D',
      'Gate: hypothesis h_ok_gap + fact f_gap',
    ].join('\n');
    expect(compileCase(text).slice.dispatches[0].gate).toEqual({
      op: 'all',
      children: [
        { op: 'hypothesis_chosen', args: { hypothesis_id: 'h_ok_gap' } },
        factLifted('f_gap'),
      ],
    });
  });
});

describe('§6 runtime-capability split (SB-020) — warn, drop from emit, never speculate', () => {
  const table: Array<[string, string, string]> = [
    // [expression, expected diagnostic code, term that must NOT be emitted]
    ['f_a and t_x (taken)', codes.COND_UNSUPPORTED_TILTAK_TAKEN, 't_x'],
    ['f_a and q_x (open)', codes.COND_UNSUPPORTED_QUESTION_OPEN, 'q_x'],
    ['f_a and d_x (done)', codes.COND_UNSUPPORTED_DISPATCH_DONE, 'd_x'],
    ['f_a and ck_restanse >= 3', codes.COND_UNSUPPORTED_CLOCK_COMPARE, 'ck_restanse'],
    ['f_a and day >= 5', codes.COND_UNSUPPORTED_DAY_COMPARE, 'day'],
    ['f_a and 2 of (f_b, f_c, f_d)', codes.COND_UNSUPPORTED_N_OF, 'n of'],
    ['f_a and asked.gro', codes.COND_UNSUPPORTED_ASKED_COUNT, 'asked.gro'],
  ];

  for (const [expr, code, label] of table) {
    it(`${label}: warns with ${code} and emits only the playable remainder`, () => {
      const out = compileCase(questionCase(expr));
      const diag = out.diagnostics.find((d) => d.code === code);
      expect(diag).toBeDefined();
      expect(diag?.severity).toBe('warning');
      expect(diag?.span.startLine).toBeGreaterThan(0);
      // The unplayable term is dropped: only f_a survives into the emit.
      expect(out.slice.questions[0].reveal_when).toEqual(factLifted('f_a'));
    });
  }

  it('a gate made only of unsupported terms emits no predicate at all', () => {
    const out = compileCase(questionCase('t_x (taken)'));
    expect('reveal_when' in out.slice.questions[0]).toBe(false);
    expect(out.diagnostics.some((d) => d.code === codes.COND_UNSUPPORTED_TILTAK_TAKEN)).toBe(true);
  });

  it('bare markers without the parenthesised keyword still classify by prefix', () => {
    const out = compileCase(questionCase('f_a and not t_institusjon'));
    expect(out.slice.questions[0].reveal_when).toEqual(factLifted('f_a'));
    expect(out.diagnostics.some((d) => d.code === codes.COND_UNSUPPORTED_TILTAK_TAKEN)).toBe(true);
  });

  it('malformed condition yields cond-parse-error, never a crash', () => {
    const diags = diagnosticsFor('f_a and and');
    expect(diags.some((d) => d.code === codes.COND_PARSE_ERROR)).toBe(true);
  });
});
