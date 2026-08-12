// PLAN-009 end-gate review: the three compiler behaviors the SB-072
// migration added, none previously netted on the design-lab side —
// (a) quoted values unescape \" so no backslash reaches runtime text
//     (the review found literal \" leaked into 7 migrated strings),
// (b) `# Strings:` entries strip their markup quotes like Phone/Offer,
// (c) the `ambient` thought key type compiles (the MTG icon fold).

import { describe, expect, it } from 'vitest';
import { compileCase, compileCharacter } from '../index';

const CASE_HEAD = `# Case: case_test

Title: Test
Stage: 0
Deadline: day 10
`;

describe('SB-072 string-table emission', () => {
  it('strips markup quotes and unescapes \\" in # Strings: entries', () => {
    const { slice } = compileCase(`${CASE_HEAD}
# Strings: testfam

Stub: yes
plain: "en vanlig linje"
inner_escaped: "hun sa: \\"hallo\\" - kort."
inner_bare: ""Jeg tenker på hva som skjer.""
`);
    const table = slice.strings?.find((t) => t.id === 'testfam');
    expect(table).toBeDefined();
    expect(table?.stub).toBe(true);
    expect(table?.entries.plain).toBe('en vanlig linje');
    expect(table?.entries.inner_escaped).toBe('hun sa: "hallo" - kort.');
    expect(table?.entries.inner_bare).toBe('"Jeg tenker på hva som skjer."');
    for (const text of Object.values(table?.entries ?? {})) {
      expect(text).not.toContain('\\');
    }
  });

  it('unescapes \\" in Phone answer/close values', () => {
    const { content } = compileCharacter(`# Character: testperson

# Phone: testperson

Answer: "hun sa \\"hallo\\"."
Close: "ha det."
Stub: yes
`);
    expect(content.phone?.answer).toBe('hun sa "hallo".');
    expect(content.phone?.close).toBe('ha det.');
  });

  it('compiles the ambient thought key type (MTG icon fold)', () => {
    const { content } = compileCharacter(`# Character: testperson

# Thoughts: testperson/ambient/*

Stub: yes

- icon_think
- icon_book
`);
    const ambient = content.thoughts.find((t) => t.key_type === 'ambient');
    expect(ambient).toBeDefined();
    expect(ambient?.key).toBe('*');
    expect(ambient?.lines).toEqual(['icon_think', 'icon_book']);
    expect(ambient?.stub).toBe(true);
  });
});
