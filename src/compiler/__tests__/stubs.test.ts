// SB-071 — the stub-count scan behind the lint and the canvas stub
// worklist: `Stub: yes` blocks found across both source families, with
// header line and label for the jump.
import { describe, expect, it } from 'vitest';
import { findStubBlocks } from '../stubs.ts';

const CASE_TEXT = `# Case: case_stub

Title: Stubbetest

# Visit: opp_alene

Title: Klarer han seg alene?
Blurb: Se på Elling.
Stub: yes

- frank: «Hei.»

# Visit: opp_ferdig

Title: Ferdigskrevet
Blurb: Ekte tekst.

- frank: «Hallo.»

# Strings: strings_notat

Stub: yes
notat_intro: Elling har det bra.

# Strings: strings_handbok

handbok_intro: Håndboka.
`;

const CHARACTER_TEXT = `# Character: elling

# Thoughts: elling/need/Hunger

Icon: icon_hunger
Stub: yes

- Sulten.

# Thoughts: elling/need/Energy

Icon: icon_sleep

- Trøtt.

# Barks: elling

Stub: yes

- Fint vær.
`;

describe('findStubBlocks', () => {
  it('finds Stub: yes blocks in a case file with line and label', () => {
    const stubs = findStubBlocks(CASE_TEXT, 'case');
    expect(stubs).toEqual([
      { blockId: 'opp_alene', blockType: 'visit', line: 5, label: 'Klarer han seg alene?' },
      { blockId: 'strings_notat', blockType: 'strings', line: 20, label: 'strings_notat' },
    ]);
  });

  it('finds Stub: yes blocks in a character file, keeping file order', () => {
    const stubs = findStubBlocks(CHARACTER_TEXT, 'character');
    expect(stubs.map((s) => s.blockId)).toEqual(['elling/need/Hunger', 'elling']);
    expect(stubs.map((s) => s.blockType)).toEqual(['thoughts', 'barks']);
    expect(stubs.map((s) => s.line)).toEqual([3, 16]);
  });

  it('ignores non-"yes" markers, matching readStubMarker semantics', () => {
    const text = `# Case: case_x\n\nTitle: X\n\n# Visit: opp_nei\n\nTitle: Nei\nStub: nope\n\n- frank: «Hei.»\n`;
    expect(findStubBlocks(text, 'case')).toEqual([]);
  });

  it('returns an empty list for a stub-free file', () => {
    expect(findStubBlocks('# Case: case_tom\n\nTitle: Tom\n', 'case')).toEqual([]);
  });
});
