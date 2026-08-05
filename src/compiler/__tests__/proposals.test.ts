import { describe, expect, it } from 'vitest';
import { compileCase } from '../index';
import { codes } from '../diagnostics';
import fragments from './fixtures/shipped-fragments.json';
import caseText from './fixtures/proposals.case.md?raw';

// SB-029: # Proposal: blocks per the SB-028 rulings A–D.
// The expected frank_proposals array below comes from shipped-fragments.json,
// which is copied verbatim (programmatically) from
// ../lifelines-core-loop/resources/cases/olsen/source/tiny_olsen_slice.json.
// scripts/compiler/provenance.test.mjs re-asserts that copy against the live
// shipped file whenever the core-loop checkout is present.
// proposals.case.md authors all 24 shipped proposals in shipped file order
// (ruling C: order = file order; no Order: field exists).

const result = compileCase(caseText);
const slice = result.slice;

const MINIMAL_HEADER = ['# Case: c_x', 'Title: X', ''];

describe('# Proposal: golden — all 24 shipped proposals (SB-028 rulings A–D)', () => {
  it('emits frank_proposals deep-equal to the shipped array, order 0–23, sparse fields omitted', () => {
    // toStrictEqual: entries without Categories: must NOT carry a
    // relevant_categories key at all (sparse-field law, ruling B).
    expect(slice.frank_proposals).toStrictEqual(fragments.frank_proposals);
  });

  it('serializes each proposal with the shipped key order (handbok_id, line, relevant_fact_ids, [relevant_categories], order)', () => {
    const emitted = slice.frank_proposals ?? [];
    expect(emitted).toHaveLength(fragments.frank_proposals.length);
    for (let i = 0; i < emitted.length; i += 1) {
      expect(JSON.stringify(emitted[i])).toBe(JSON.stringify(fragments.frank_proposals[i]));
    }
  });

  it('the golden compiles with no error-severity diagnostics', () => {
    expect(result.diagnostics.filter((d) => d.severity === 'error')).toEqual([]);
  });

  it('omits the frank_proposals key when the case authors none (sparse-field law)', () => {
    const minimal = compileCase(MINIMAL_HEADER.join('\n'));
    expect('frank_proposals' in minimal.slice).toBe(false);
  });
});

describe('# Proposal: order = file order (ruling C)', () => {
  it('the compiler assigns the index at emit; moving a block reranks it', () => {
    const text = [
      ...MINIMAL_HEADER,
      '# Proposal: beta',
      'Relevant: f_a',
      'Line: «B.»',
      '',
      '# Proposal: alfa',
      'Relevant: f_b',
      'Line: «A.»',
    ].join('\n');
    const out = compileCase(text);
    expect(out.slice.frank_proposals?.map((p) => [p.handbok_id, p.order])).toEqual([
      ['beta', 0],
      ['alfa', 1],
    ]);
  });
});

describe('# Proposal: validation (ruling D + ruling B)', () => {
  it('duplicate slug header is an error (duplicate-id), never fatal', () => {
    const text = [
      ...MINIMAL_HEADER,
      '# Proposal: matlevering',
      'Relevant: f_a',
      'Line: «En.»',
      '',
      '# Proposal: matlevering',
      'Relevant: f_b',
      'Line: «To.»',
    ].join('\n');
    const out = compileCase(text);
    const duplicate = out.diagnostics.find((d) => d.code === codes.DUPLICATE_ID);
    expect(duplicate).toBeDefined();
    expect(duplicate?.severity).toBe('error');
    expect(duplicate?.subjectIds).toContain('matlevering');
    // The file always compiles.
    expect(out.slice.frank_proposals).toHaveLength(2);
  });

  it('missing Line: is an error (exactly one per block is mandatory)', () => {
    const text = [...MINIMAL_HEADER, '# Proposal: matlevering', 'Relevant: f_a'].join('\n');
    const out = compileCase(text);
    const missing = out.diagnostics.find((d) => d.code === codes.PROPOSAL_MISSING_LINE);
    expect(missing).toBeDefined();
    expect(missing?.severity).toBe('error');
    expect(missing?.subjectIds).toContain('matlevering');
    // Never fatal: the block still emits (line empty) so later indices hold.
    expect(out.slice.frank_proposals?.[0].line).toBe('');
  });

  it('missing Relevant: (and no Categories:) is an error', () => {
    const text = [...MINIMAL_HEADER, '# Proposal: matlevering', 'Line: «En.»'].join('\n');
    const out = compileCase(text);
    const missing = out.diagnostics.find((d) => d.code === codes.PROPOSAL_MISSING_RELEVANT);
    expect(missing).toBeDefined();
    expect(missing?.severity).toBe('error');
    const proposal = out.slice.frank_proposals?.[0];
    expect(proposal).toBeDefined();
    expect(proposal && 'relevant_fact_ids' in proposal).toBe(false);
  });

  it('Categories: without Relevant: is the ruling-B WARN case, not an error', () => {
    const text = [
      ...MINIMAL_HEADER,
      '# Proposal: radgivning',
      'Categories: Økonomi',
      'Line: «En.»',
    ].join('\n');
    const out = compileCase(text);
    const warn = out.diagnostics.find((d) => d.code === codes.PROPOSAL_CATEGORIES_WITHOUT_RELEVANT);
    expect(warn).toBeDefined();
    expect(warn?.severity).toBe('warning');
    expect(out.diagnostics.filter((d) => d.severity === 'error')).toEqual([]);
    expect(out.slice.frank_proposals?.[0]).toStrictEqual({
      handbok_id: 'radgivning',
      line: 'En.',
      relevant_categories: ['Økonomi'],
      order: 0,
    });
  });

  it('Categories: is additive to Relevant: — both emit (ruling B)', () => {
    const text = [
      ...MINIMAL_HEADER,
      '# Proposal: bostotte',
      'Relevant: f_gap, f_trygd',
      'Categories: Økonomi',
      'Line: «En.»',
    ].join('\n');
    const out = compileCase(text);
    expect(out.slice.frank_proposals?.[0]).toStrictEqual({
      handbok_id: 'bostotte',
      line: 'En.',
      relevant_fact_ids: ['f_gap', 'f_trygd'],
      relevant_categories: ['Økonomi'],
      order: 0,
    });
  });

  it('an unresolved Relevant: fact is a stub, never fatal', () => {
    const text = [
      ...MINIMAL_HEADER,
      '# Proposal: matlevering',
      'Relevant: f_missing',
      'Line: «En.»',
    ].join('\n');
    const out = compileCase(text);
    expect(out.slice.frank_proposals).toHaveLength(1);
    expect(
      out.diagnostics.filter(
        (d) => d.code === codes.STUB_UNRESOLVED_ID && d.subjectIds.includes('f_missing'),
      ),
    ).toHaveLength(1);
    expect(out.diagnostics.every((d) => d.severity !== 'error')).toBe(true);
  });

  it('the retired proposal-not-ratified code never fires (SB-028 ratified the syntax)', () => {
    expect(result.diagnostics.some((d) => d.code === codes.PROPOSAL_NOT_RATIFIED)).toBe(false);
  });
});
