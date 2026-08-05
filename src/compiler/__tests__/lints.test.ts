import { describe, expect, it } from 'vitest';
import { compileCase } from '../index';
import { codes } from '../diagnostics';
import type { Diagnostic } from '../diagnostics';

// §9 graph lints (PLAN-003 TASK-017). Every lint has a minimal trigger
// fixture AND a healthy silent sibling — an always-firing lint would fail the
// sibling. All lints are advisory: they never block compilation.
//
// Fixtures live in template literals (not .case.md) because prettier
// reformats markdown list indentation, which is semantic in weave.

const HEADER = `# Case: c_lint
Title: Lintfikser
`;

function lints(text: string, code: string): Diagnostic[] {
  return compileCase(text).diagnostics.filter((d) => d.code === code);
}

// A document whose prose anchors f_ok; f_ok is declared beneath it.
const DOC_WITH_ANCHOR = `
# Document: doc_a
Kind: NOTAT
Title: A

Her står det noe. [Ankeret.](fact:f_ok)

## f_ok
Label: Ok
Summary: Ok.
`;

// A declared fact whose id no document run, weave line, or effect ever pays.
const DEAD_FACT = `
## f_dead
Label: Død
Summary: Aldri betalbar.
`;

describe('lint 1 — facts without a source anchor (lint-fact-no-source-anchor)', () => {
  it('fires on a declared fact that no document run, weave line, or effect pays', () => {
    const out = lints(HEADER + DOC_WITH_ANCHOR + DEAD_FACT, codes.LINT_FACT_NO_SOURCE_ANCHOR);
    expect(out).toHaveLength(1);
    expect(out[0].subjectIds).toContain('f_dead');
    expect(out[0].severity).toBe('advisory');
    expect(out[0].span.startLine).toBeGreaterThan(1);
  });

  it('stays silent for a fact anchored in a document run', () => {
    expect(lints(HEADER + DOC_WITH_ANCHOR, codes.LINT_FACT_NO_SOURCE_ANCHOR)).toHaveLength(0);
  });

  it('stays silent for a fact paid by a chat ~ pay line', () => {
    const text =
      HEADER +
      DOC_WITH_ANCHOR +
      `
## f_paid
Label: Betalt
Summary: Betales i chat.

# Conversation: chat:frank
* f_ok: Hva med betalingen?
    Den kommer her.
    ~ pay f_paid
`;
    expect(lints(text, codes.LINT_FACT_NO_SOURCE_ANCHOR)).toHaveLength(0);
  });
});

describe('lint 2 — questions with no path to a tiltak (lint-question-no-tiltak-path)', () => {
  it('fires on a question with no lead, no hypothesis opening a tiltak, and no tiltak needing its hypotheses', () => {
    const text =
      HEADER +
      DOC_WITH_ANCHOR +
      `
# Question: q_alone
Title: Alene?
when: f_ok
`;
    const out = lints(text, codes.LINT_QUESTION_NO_TILTAK_PATH);
    expect(out).toHaveLength(1);
    expect(out[0].subjectIds).toContain('q_alone');
    expect(out[0].severity).toBe('advisory');
  });

  it('stays silent when a hypothesis on the question opens a tiltak', () => {
    const text =
      HEADER +
      DOC_WITH_ANCHOR +
      `
# Question: q_ok
Title: Ok?
when: f_ok

# Hypothesis: h_x
Title: H
Question: q_ok
needs: f_ok
Opens: t_go

# Tiltak: t_go
Title: Gå
Slot: s1
Cost: 0
Description: D
Sim hook: x
`;
    expect(lints(text, codes.LINT_QUESTION_NO_TILTAK_PATH)).toHaveLength(0);
  });

  it('stays silent when a canonical Lead targets a tiltak', () => {
    const text =
      HEADER +
      DOC_WITH_ANCHOR +
      `
# Question: q_lead
Title: Med lead?
when: f_ok
Lead: «Gå dit» -> t_go

# Tiltak: t_go
Title: Gå
Slot: s1
Cost: 0
Description: D
Sim hook: x
`;
    expect(lints(text, codes.LINT_QUESTION_NO_TILTAK_PATH)).toHaveLength(0);
  });

  it('stays silent when a tiltak needs one of the question hypotheses (0.1 direction)', () => {
    const text =
      HEADER +
      DOC_WITH_ANCHOR +
      `
# Question: q_leg
Title: Legacy?
when: f_ok

# Hypothesis: h_leg
Title: H
Question: q_leg
needs: f_ok

# Tiltak: t_z
Title: Z
Slot: s1
Cost: 0
Needs hypothesis: h_leg
Description: D
Sim hook: x
`;
    expect(lints(text, codes.LINT_QUESTION_NO_TILTAK_PATH)).toHaveLength(0);
  });
});

describe('lint 3 — hypotheses that open nothing (lint-hypothesis-opens-nothing)', () => {
  it('fires on a hypothesis with no opening sources', () => {
    const text =
      HEADER +
      DOC_WITH_ANCHOR +
      `
# Hypothesis: h_empty
Title: Tom
Question: q_x
needs: f_ok
`;
    const out = lints(text, codes.LINT_HYPOTHESIS_OPENS_NOTHING);
    expect(out).toHaveLength(1);
    expect(out[0].subjectIds).toContain('h_empty');
    expect(out[0].severity).toBe('advisory');
  });

  it('stays silent when the hypothesis opens a dispatch', () => {
    const text =
      HEADER +
      DOC_WITH_ANCHOR +
      `
# Hypothesis: h_opens
Title: Åpner
Question: q_x
needs: f_ok
Opens: d_go

# Dispatch: d_go
Title: Gå
Sim hook: x
Description: D
`;
    expect(lints(text, codes.LINT_HYPOTHESIS_OPENS_NOTHING)).toHaveLength(0);
  });
});

describe('lint 4 — conversation loose ends (lint-conversation-loose-end)', () => {
  it('fires on a chat entry with no answer lines, followups, or pays_fact', () => {
    const text =
      HEADER +
      DOC_WITH_ANCHOR +
      `
# Conversation: chat:frank
* f_ok: Spørsmål uten svar?
`;
    const out = lints(text, codes.LINT_CONVERSATION_LOOSE_END);
    expect(out).toHaveLength(1);
    expect(out[0].subjectIds).toContain('c_ok');
    expect(out[0].severity).toBe('advisory');
  });

  it('fires on a call exchange with an empty reply, and on a call with no exchanges', () => {
    const text =
      HEADER +
      DOC_WITH_ANCHOR +
      `
# Conversation: call:grete
Åpningslinje.
* f_ok: Spørsmål uten svar?

# Conversation: call:tom
Bare en åpning.
`;
    const out = lints(text, codes.LINT_CONVERSATION_LOOSE_END);
    expect(out).toHaveLength(2);
    expect(out.some((d) => d.subjectIds.includes('call:grete'))).toBe(true);
    expect(out.some((d) => d.subjectIds.includes('call:tom'))).toBe(true);
  });

  it('fires on a followup with no lines', () => {
    const text =
      HEADER +
      DOC_WITH_ANCHOR +
      `
# Conversation: chat:frank
* f_ok: Spørsmål?
    Svaret.
* * Oppfølging uten linjer
`;
    const out = lints(text, codes.LINT_CONVERSATION_LOOSE_END);
    expect(out).toHaveLength(1);
    expect(out[0].subjectIds).toContain('c_ok');
  });

  it('stays silent when entries, exchanges and followups all have content', () => {
    const text =
      HEADER +
      DOC_WITH_ANCHOR +
      `
# Conversation: chat:frank
* f_ok: Spørsmål?
    Svaret.
* * Oppfølging
    Mer svar.

# Conversation: call:grete
Åpning.
* f_ok: Spørsmål?
    Svar i samtalen.
`;
    expect(lints(text, codes.LINT_CONVERSATION_LOOSE_END)).toHaveLength(0);
  });

  it('stays silent for a chat entry whose only return is ~ pay (the paid card is the reply)', () => {
    const text =
      HEADER +
      DOC_WITH_ANCHOR +
      `
## f_paid
Label: Betalt
Summary: Betales i chat.

# Conversation: chat:frank
* f_ok: Hva får jeg?
    ~ pay f_paid
`;
    expect(lints(text, codes.LINT_CONVERSATION_LOOSE_END)).toHaveLength(0);
  });
});

describe('lint 5 — gates referencing undeliverable facts (lint-gate-undeliverable-fact)', () => {
  it('fires on a dispatch gate referencing a fact nothing can ever pay', () => {
    const text =
      HEADER +
      DOC_WITH_ANCHOR +
      DEAD_FACT +
      `
# Dispatch: d_x
Title: X
Sim hook: x
Description: D
gate: f_dead
`;
    const out = lints(text, codes.LINT_GATE_UNDELIVERABLE_FACT);
    expect(out).toHaveLength(1);
    expect(out[0].subjectIds).toContain('d_x');
    expect(out[0].subjectIds).toContain('f_dead');
    expect(out[0].severity).toBe('advisory');
  });

  it('fires on a question when: and a chat needs guard referencing an unpayable fact', () => {
    const text =
      HEADER +
      DOC_WITH_ANCHOR +
      DEAD_FACT +
      `
# Question: q_x
Title: X?
when: f_dead

# Conversation: chat:frank
* {f_dead} f_ok: Spørsmål?
    Svar.
`;
    const out = lints(text, codes.LINT_GATE_UNDELIVERABLE_FACT);
    expect(out.some((d) => d.subjectIds.includes('q_x'))).toBe(true);
    expect(out.some((d) => d.subjectIds.includes('c_ok'))).toBe(true);
  });

  it('stays silent when every gated fact is payable — including facts paid only by a call line lift', () => {
    const text =
      HEADER +
      DOC_WITH_ANCHOR +
      `
## f_call_paid
Label: Løftes i samtale
Summary: S.

# Conversation: call:grete
Hun sier [noe viktig](fact:f_call_paid).
* f_ok: Spørsmål?
    Svar.

# Dispatch: d_x
Title: X
Sim hook: x
Description: D
gate: f_call_paid and f_ok
`;
    expect(lints(text, codes.LINT_GATE_UNDELIVERABLE_FACT)).toHaveLength(0);
  });
});

describe('lint 6 — quiet days inside the deadline window (lint-quiet-day)', () => {
  it('fires once, listing the days where nothing new reaches the player', () => {
    const text =
      `# Case: c_lint
Title: Lintfikser
Deadline: day 4
` +
      DOC_WITH_ANCHOR +
      `
# Beat: day 2
Noe skjer.
`;
    const out = lints(text, codes.LINT_QUIET_DAY);
    expect(out).toHaveLength(1);
    expect(out[0].message).toContain('3');
    expect(out[0].message).toContain('4');
    expect(out[0].subjectIds).toContain('c_lint');
    expect(out[0].severity).toBe('advisory');
  });

  it('stays silent when beats, arrivals and day-gates cover the window', () => {
    // day 1: case start (initial documents) · day 2: beat · day 3: the beat's
    // delivery arrives (2 + 1d) · day 4: a day >= 4 gate becomes satisfiable.
    const text =
      `# Case: c_lint
Title: Lintfikser
Deadline: day 4
` +
      DOC_WITH_ANCHOR +
      `
# Document: doc_late
Kind: BREV
Title: Sen

Senere tekst.

# Beat: day 2
Noe skjer.
~ deliver doc_late in 1d

# Question: q_x
Title: X?
when: f_ok and day >= 4
`;
    expect(lints(text, codes.LINT_QUIET_DAY)).toHaveLength(0);
  });

  it('stays silent when the case has no deadline', () => {
    const text =
      HEADER +
      DOC_WITH_ANCHOR +
      `
# Beat: day 2
Noe skjer.
`;
    expect(lints(text, codes.LINT_QUIET_DAY)).toHaveLength(0);
  });
});

describe('lint 7 — clocks that can never become visible (lint-clock-never-visible)', () => {
  const CLOCK = (cond: string): string => `
# Clock: ck_x
Label: K
Sim hook: x
Question: Q?
Good: G / 4
Bad: B / 4
visible when: ${cond}
`;

  it('fires when visibility needs a fact nothing can ever pay', () => {
    const out = lints(
      HEADER + DOC_WITH_ANCHOR + DEAD_FACT + CLOCK('f_dead'),
      codes.LINT_CLOCK_NEVER_VISIBLE,
    );
    expect(out).toHaveLength(1);
    expect(out[0].subjectIds).toContain('ck_x');
    expect(out[0].severity).toBe('advisory');
  });

  it('fires when visibility needs a hypothesis that does not exist', () => {
    const out = lints(HEADER + DOC_WITH_ANCHOR + CLOCK('h_ghost'), codes.LINT_CLOCK_NEVER_VISIBLE);
    expect(out).toHaveLength(1);
    expect(out[0].subjectIds).toContain('ck_x');
  });

  it('stays silent for a payable fact, a declared hypothesis, an or-escape, and no visible when: at all', () => {
    const declaredHypothesis = `
# Hypothesis: h_real
Title: H
Question: q_x
needs: f_ok
Opens: t_go
`;
    const noCondition = `
# Clock: ck_plain
Label: K
Sim hook: x
Question: Q?
Good: G / 4
Bad: B / 4
`;
    expect(
      lints(HEADER + DOC_WITH_ANCHOR + CLOCK('f_ok'), codes.LINT_CLOCK_NEVER_VISIBLE),
    ).toHaveLength(0);
    expect(
      lints(
        HEADER + DOC_WITH_ANCHOR + declaredHypothesis + CLOCK('h_real'),
        codes.LINT_CLOCK_NEVER_VISIBLE,
      ),
    ).toHaveLength(0);
    expect(
      lints(
        HEADER + DOC_WITH_ANCHOR + DEAD_FACT + CLOCK('f_dead or f_ok'),
        codes.LINT_CLOCK_NEVER_VISIBLE,
      ),
    ).toHaveLength(0);
    expect(
      lints(HEADER + DOC_WITH_ANCHOR + noCondition, codes.LINT_CLOCK_NEVER_VISIBLE),
    ).toHaveLength(0);
  });
});

describe('lint severity contract', () => {
  it('every lint-* diagnostic is advisory and never blocks compilation', () => {
    const text =
      HEADER +
      DOC_WITH_ANCHOR +
      DEAD_FACT +
      `
# Question: q_alone
Title: Alene?
when: f_dead

# Hypothesis: h_empty
Title: Tom
Question: q_alone
needs: f_dead

# Conversation: chat:frank
* f_ok: Spørsmål uten svar?
`;
    const out = compileCase(text);
    const lintDiags = out.diagnostics.filter((d) => d.code.startsWith('lint-'));
    expect(lintDiags.length).toBeGreaterThan(0);
    expect(lintDiags.every((d) => d.severity === 'advisory')).toBe(true);
    expect(out.slice.id).toBe('c_lint');
  });
});
