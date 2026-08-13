import { describe, expect, it } from 'vitest';
import { compileCase } from '../index';

// SB-024 back-port extensions: the shipped Olsen content carries four shapes
// the TASK-014..018 compiler could not author. Each extension is minimal and
// recorded in docs/markup-0.2-reference.md ("Compiler extensions recorded by
// SB-024").

function byId<T extends { id: string }>(items: T[], id: string): T {
  const found = items.find((item) => item.id === id);
  if (!found) throw new Error(`missing ${id} in ${items.map((i) => i.id).join(', ')}`);
  return found;
}

describe('fact Quote: fallback', () => {
  const text = `# Case: c_x
Title: X
Stage: 0

# Document: doc_a

Kind: NOTAT · Register: notat
Title: A
Peek: p
Meta: m

Prose with [an anchored span](fact:f_anchored) in it.

## f_anchored

Label: Anchored
Summary: s
Domain: D · Category: C
Quote: «this explicit quote must lose to the anchor»

## f_paid

Label: Paid via chat
Summary: s
Domain: D · Category: C
Quote: «han kastet meg ikke ut. Det er en dør på gløtt.»

# Conversation: chat:frank

* f_anchored: Spørsmål?
    ~ pay f_paid
    Svar.
`;
  const { slice } = compileCase(text);

  it('a fact with no document run takes its quote from Quote: (guillemets stripped)', () => {
    expect(byId(slice.facts, 'f_paid').quote).toBe(
      'han kastet meg ikke ut. Det er en dør på gløtt.',
    );
  });

  it('an anchored run always wins over an authored Quote:', () => {
    expect(byId(slice.facts, 'f_anchored').quote).toBe('an anchored span');
  });
});

describe('anchor text with nested [icon=coin] tokens', () => {
  const text = `# Case: c_x
Title: X
Stage: 0

# Document: doc_a

Kind: NOTAT · Register: notat
Title: A
Peek: p
Meta: m

Inn: [trygden hans — 2 [icon=coin] i måneden.](fact:f_trygd) Pensjonen: 3 [icon=coin].

## f_trygd

Label: T
Summary: s
Domain: D · Category: C
`;
  const { slice } = compileCase(text);

  it('the anchored span keeps the token and converts to one bbcode url run', () => {
    const doc = byId(slice.documents, 'doc_a');
    expect(doc.body_bbcode).toBe(
      'Inn: [url=fact:f_trygd]trygden hans — 2 [icon=coin] i måneden.[/url] Pensjonen: 3 [icon=coin].',
    );
    expect(doc.runs.map((run) => run.fact_id)).toEqual(['', 'f_trygd', '']);
    expect(doc.runs[1].text).toBe('trygden hans — 2 [icon=coin] i måneden.');
  });
});

describe('chat followup Tanke: sting', () => {
  const text = `# Case: c_x
Title: X
Stage: 0

# Conversation: chat:frank

* f_bok: Spørsmål?
    Svarlinje.
    * * Oppfølging?
        Linje én.
        Tanke: "VURDERING - det ER saken."
`;
  const { slice, diagnostics } = compileCase(text);

  it('Tanke: inside a followup emits the tanke field, not a line', () => {
    const entry = slice.frank_chat?.[0];
    expect(entry?.followups[0]).toEqual({
      label: 'Oppfølging?',
      lines: ['Linje én.'],
      tanke: 'VURDERING - det ER saken.',
    });
    expect(diagnostics.filter((d) => d.severity === 'warning')).toEqual([
      expect.objectContaining({ code: 'stub-unresolved-id' }),
    ]);
  });
});

describe('lead target call:<contact>', () => {
  const base = `# Case: c_x
Title: X
Stage: 0

# Question: q_a

Title: Q?
Lead: «Ring Grete» -> call:grete
`;
  const call = `
# Conversation: call:grete

Ja, hallo?
`;

  it('resolves without a stub when the call exists (ruling-3 namespaced handle)', () => {
    const { slice, diagnostics } = compileCase(base + call);
    expect(slice.questions[0].leads).toEqual([{ label: 'Ring Grete', target: 'call:grete' }]);
    expect(diagnostics.filter((d) => d.code === 'stub-unresolved-id')).toEqual([]);
  });

  it('still stubs when no such call is authored', () => {
    const { diagnostics } = compileCase(base);
    expect(diagnostics.filter((d) => d.code === 'stub-unresolved-id')).toHaveLength(1);
  });
});
