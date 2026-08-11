import { describe, expect, it } from 'vitest';
import { appendBlock, bulletAdd, bulletEdit, bulletRemove, patchField, PatchError } from '../patch';

// PLAN-006 TASK-029 — the patch layer speaks the SDD-130 blocks in both
// families. Minimal-patch law: untouched lines byte-identical, a no-op patch
// is a byte no-op.
// ## Verified red-green: 2026-08-11 (bulletRemove index shifted → 1 failure)

const simText = [
  '# Character: elling',
  '',
  '# Thoughts: elling/need/Hunger',
  '',
  'Icon: icon_hunger',
  'Stub: yes',
  '',
  '- Sulten. Kjøleskapet er langt unna.',
  '- Burde spise noe snart.',
  '',
  '# Barks: elling',
  '',
  'Stub: yes',
  '',
  '- Fint vær i dag.',
  '',
].join('\n');

const caseText = [
  '# Case: c_x',
  'Title: X',
  '',
  '# Visit: opp_alene',
  '',
  'Title: Klarer han seg alene?',
  'Blurb: B',
  'Stub: yes',
  '',
  '- frank: «Er det Nansen du leser om?» [dwell=4 beat=a2 id=opp_a2]',
  '- grete: «Han har det fint her.» [dwell=4 beat=a5 id=opp_a5]',
  '',
  '# Strings: notat_glue',
  '',
  'Stub: yes',
  'notat_intro: Frank noterer.',
  '',
].join('\n');

function changedLines(before: string, after: string): number[] {
  const a = before.split('\n');
  const b = after.split('\n');
  const changed: number[] = [];
  for (let i = 0; i < Math.max(a.length, b.length); i += 1) {
    if (a[i] !== b[i]) changed.push(i + 1);
  }
  return changed;
}

describe('field patches on the new blocks', () => {
  it('patches a thoughts Icon in a sim.md file, only that line', () => {
    const next = patchField(simText, 'elling/need/Hunger', 'Icon', 'icon_food');
    expect(changedLines(simText, next)).toEqual([5]);
    expect(next.split('\n')[4]).toBe('Icon: icon_food');
  });

  it('patches an id-keyed strings entry, only that line', () => {
    const next = patchField(caseText, 'notat_glue', 'notat_intro', 'Frank skriver.');
    expect(changedLines(caseText, next)).toEqual([16]);
    expect(next.split('\n')[15]).toBe('notat_intro: Frank skriver.');
  });

  it('inserts a missing strings key after the last field', () => {
    const next = patchField(caseText, 'notat_glue', 'notat_outro', 'Det var det.');
    expect(next).toContain('notat_intro: Frank noterer.\nnotat_outro: Det var det.');
  });

  it('patches a visit field without touching the step bullets', () => {
    const next = patchField(caseText, 'opp_alene', 'Blurb', 'Se på Elling.');
    expect(changedLines(caseText, next)).toEqual([7]);
  });

  it('a patch to the current value is a byte no-op', () => {
    expect(patchField(simText, 'elling/need/Hunger', 'Icon', 'icon_hunger')).toBe(simText);
    expect(patchField(caseText, 'notat_glue', 'notat_intro', 'Frank noterer.')).toBe(caseText);
  });
});

describe('bullet patches (variants and visit steps)', () => {
  it('adds a variant after the last bullet, one inserted line', () => {
    const next = bulletAdd(simText, 'elling/need/Hunger', 'Maten står der.');
    const lines = next.split('\n');
    expect(lines[9]).toBe('- Maten står der.');
    expect(lines.length).toBe(simText.split('\n').length + 1);
    expect(lines.slice(0, 9)).toEqual(simText.split('\n').slice(0, 9));
  });

  it('adds the first bullet after the fields when the block has none', () => {
    const bare = appendBlock(simText, 'barks', 'grete');
    const next = bulletAdd(bare, 'grete', 'Hei.');
    expect(next).toContain('# Barks: grete');
    expect(next).toContain('- Hei.');
  });

  it('edits one visit step in place, only that line', () => {
    const next = bulletEdit(
      caseText,
      'opp_alene',
      1,
      'grete: «Han har alt han trenger.» [dwell=4 beat=a5 id=opp_a5]',
    );
    expect(changedLines(caseText, next)).toEqual([11]);
    expect(next.split('\n')[10]).toBe(
      '- grete: «Han har alt han trenger.» [dwell=4 beat=a5 id=opp_a5]',
    );
  });

  it('an edit to the current text is a byte no-op', () => {
    expect(bulletEdit(simText, 'elling/need/Hunger', 0, 'Sulten. Kjøleskapet er langt unna.')).toBe(
      simText,
    );
  });

  it('removes one step, only that line disappears', () => {
    const next = bulletRemove(caseText, 'opp_alene', 0);
    const lines = next.split('\n');
    expect(lines.length).toBe(caseText.split('\n').length - 1);
    expect(next).not.toContain('opp_a2');
    expect(next).toContain('opp_a5');
  });

  it('throws on a non-bullet block and an out-of-range index', () => {
    expect(() => bulletAdd(caseText, 'notat_glue', 'x')).toThrow(PatchError);
    expect(() => bulletEdit(simText, 'elling/need/Hunger', 9, 'x')).toThrow(PatchError);
  });
});

describe('appendBlock on the new kinds', () => {
  it('appends a visit after the last visit with its template', () => {
    const next = appendBlock(caseText, 'visit', 'opp_okonomi');
    const at = next.indexOf('# Visit: opp_okonomi');
    expect(at).toBeGreaterThan(next.indexOf('id=opp_a5'));
    expect(at).toBeLessThan(next.indexOf('# Strings: notat_glue'));
    expect(next).toContain(
      '# Visit: opp_okonomi\n\nTitle: \nBlurb: \nOffer: \nUnlocks: \nStub: yes',
    );
  });

  it('appends a thoughts pool in a sim.md file', () => {
    const next = appendBlock(simText, 'thoughts', 'elling/want/*');
    expect(next).toContain('# Thoughts: elling/want/*\n\nIcon: \nStub: yes');
    const reparsed = patchField(next, 'elling/want/*', 'Icon', 'icon_want');
    expect(reparsed).toContain('Icon: icon_want');
  });

  it('disambiguates shared character ids by kind', () => {
    const withPhone = appendBlock(simText, 'phone', 'elling');
    const next = patchField(withPhone, 'elling', 'Answer', 'ja?', 'phone');
    expect(next).toContain('Answer: ja?');
    const withBark = bulletAdd(withPhone, 'elling', 'Hei.', 'barks');
    expect(withBark.split('\n').filter((line) => line === '- Hei.')).toHaveLength(1);
  });

  it('appends a strings table and a phone block', () => {
    const withStrings = appendBlock(caseText, 'strings', 'handbok');
    expect(withStrings).toContain('# Strings: handbok\n\nStub: yes');
    const withPhone = appendBlock(simText, 'phone', 'elling');
    expect(withPhone).toContain('# Phone: elling\n\nAnswer: \nClose: \nStub: yes');
  });
});
