import { describe, expect, it } from 'vitest';
import { compileCase } from '../index';
import { codes } from '../diagnostics';
import type { Diagnostic } from '../diagnostics';

// SB-085 engine-mismatch lints (SB-058 fact-finding). The engine is the spec
// (SB-058 ruling 2): each diagnostic tells the author where the compiled
// slice and case_engine.gd disagree. Every code has a minimal trigger
// fixture AND a healthy silent sibling.

const HEADER = `# Case: c_mismatch
Title: Mismatchfikser
`;

function diags(text: string, code: string): Diagnostic[] {
  return compileCase(text).diagnostics.filter((d) => d.code === code);
}

const QUESTION = (when: string): string => `
# Question: q_a
Title: Q?
${when ? `when: ${when}` : ''}
`;

describe('lint 1 — whole gate dropped (cond-gate-dropped)', () => {
  it('fires when every term in a gate is unsupported', () => {
    const out = diags(HEADER + QUESTION('t_x (taken) and day >= 3'), codes.COND_GATE_DROPPED);
    expect(out).toHaveLength(1);
    expect(out[0].severity).toBe('warning');
    expect(out[0].subjectIds).toContain('q_a');
    expect(out[0].message).toContain('always true');
  });

  it('fires on a bare n of (…) gate', () => {
    expect(diags(HEADER + QUESTION('2 of (f_a, f_b)'), codes.COND_GATE_DROPPED)).toHaveLength(1);
  });

  it('stays silent when a supported term survives the drop', () => {
    expect(diags(HEADER + QUESTION('f_a and t_x (taken)'), codes.COND_GATE_DROPPED)).toHaveLength(
      0,
    );
  });

  it('stays silent on a fully supported gate and on no gate at all', () => {
    expect(diags(HEADER + QUESTION('f_a'), codes.COND_GATE_DROPPED)).toHaveLength(0);
    expect(diags(HEADER + QUESTION(''), codes.COND_GATE_DROPPED)).toHaveLength(0);
  });
});

describe('lint 2 — h_ gates are dead content (cond-hypothesis-gate-dead)', () => {
  it('fires on a question gated on a hypothesis', () => {
    const out = diags(HEADER + QUESTION('h_teori'), codes.COND_HYPOTHESIS_GATE_DEAD);
    expect(out).toHaveLength(1);
    expect(out[0].severity).toBe('warning');
    expect(out[0].subjectIds).toEqual(['h_teori', 'q_a']);
  });

  it('stays silent on a fact gate', () => {
    expect(diags(HEADER + QUESTION('f_a'), codes.COND_HYPOTHESIS_GATE_DEAD)).toHaveLength(0);
  });
});

describe('lint 3 — Opens c_ is an engine no-op (effect-open-conversation-noop)', () => {
  const HYPOTHESIS = (opens: string): string => `
# Hypothesis: h_a
Title: H
Summary: S
Question: q_a
Opens: ${opens}
`;

  it('fires on a hypothesis that opens a conversation', () => {
    const out = diags(
      HEADER + QUESTION('') + HYPOTHESIS('c_frank_x'),
      codes.EFFECT_OPEN_CONVERSATION_NOOP,
    );
    expect(out).toHaveLength(1);
    expect(out[0].severity).toBe('warning');
    expect(out[0].subjectIds).toEqual(['h_a', 'c_frank_x']);
    expect(out[0].message).toContain('no-op');
  });

  it('stays silent when the hypothesis opens a tiltak', () => {
    expect(
      diags(HEADER + QUESTION('') + HYPOTHESIS('t_x'), codes.EFFECT_OPEN_CONVERSATION_NOOP),
    ).toHaveLength(0);
  });
});

describe('lint 4 — availability never blocks (hypothesis-availability-advisory)', () => {
  const HYPOTHESIS = (needs: string): string => `
# Hypothesis: h_a
Title: H
Summary: S
Question: q_a
${needs ? `needs: ${needs}` : ''}
`;

  it('emits an info note when needs: compiles to an availability predicate', () => {
    const out = diags(
      HEADER + QUESTION('') + HYPOTHESIS('f_a'),
      codes.HYPOTHESIS_AVAILABILITY_ADVISORY,
    );
    expect(out).toHaveLength(1);
    expect(out[0].severity).toBe('info');
    expect(out[0].subjectIds).toEqual(['h_a']);
  });

  it('stays silent without a needs: gate', () => {
    expect(
      diags(HEADER + QUESTION('') + HYPOTHESIS(''), codes.HYPOTHESIS_AVAILABILITY_ADVISORY),
    ).toHaveLength(0);
  });
});

describe('lint 5 — deliver clock_id is a dead bucket key (deliver-clock-id-dead)', () => {
  it('fires on a document arrives: day N on ck_x', () => {
    const text =
      HEADER +
      `
# Document: doc_a
Kind: NOTAT
Title: A
arrives: day 2 on ck_frist

Innhold.
`;
    const out = diags(text, codes.DELIVER_CLOCK_ID_DEAD);
    expect(out).toHaveLength(1);
    expect(out[0].severity).toBe('warning');
    expect(out[0].subjectIds).toEqual(['doc_a', 'ck_frist']);
  });

  it('fires on a beat ~ deliver … on ck_x line', () => {
    const text =
      HEADER +
      `
# Document: doc_b
Kind: NOTAT
Title: B

Innhold.

# Beat: day 2
Noe skjer.
~ deliver doc_b in 1d on ck_frist
`;
    const out = diags(text, codes.DELIVER_CLOCK_ID_DEAD);
    expect(out).toHaveLength(1);
    expect(out[0].subjectIds).toContain('ck_frist');
  });

  it('stays silent when the arrival has no clock key', () => {
    const text =
      HEADER +
      `
# Document: doc_c
Kind: NOTAT
Title: C
arrives: day 2

Innhold.

# Beat: day 3
Noe mer.
~ deliver doc_c in 1d
`;
    expect(diags(text, codes.DELIVER_CLOCK_ID_DEAD)).toHaveLength(0);
  });
});
