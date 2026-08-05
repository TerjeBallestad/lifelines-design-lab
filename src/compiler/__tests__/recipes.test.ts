import { describe, expect, it } from 'vitest';
import { compileCase } from '../index';
import { codes } from '../diagnostics';
import fragments from './fixtures/shipped-fragments.json';
import caseText from './fixtures/fragments.case.md?raw';

// Every expected fragment below comes from shipped-fragments.json, which is
// copied verbatim (programmatically) from
// ../lifelines-core-loop/resources/cases/olsen/source/tiny_olsen_slice.json.
// scripts/compiler/provenance.test.mjs re-asserts that copy against the live
// shipped file whenever the core-loop checkout is present.

const result = compileCase(caseText);
const slice = result.slice;

function recipeFor(questionId: string) {
  const found = (slice.recipes ?? []).find((recipe) => recipe.question_id === questionId);
  if (!found) throw new Error(`missing recipe for ${questionId}`);
  return found;
}

const MINIMAL_HEADER = ['# Case: c_x', 'Title: X', ''];

describe('§1 case-header pair lines (ruling 1b)', () => {
  it('Pair soft reject: / Pair already set: emit the two shipped pack-level lines', () => {
    expect({
      pair_soft_reject_line: slice.pair_soft_reject_line,
      pair_already_set_line: slice.pair_already_set_line,
    }).toEqual(fragments.pair_lines);
  });

  it('omits both fields when the header has no pair lines (sparse-field law)', () => {
    const minimal = compileCase(MINIMAL_HEADER.join('\n'));
    expect('pair_soft_reject_line' in minimal.slice).toBe(false);
    expect('pair_already_set_line' in minimal.slice).toBe(false);
  });
});

describe('# Recipe: blocks (ruling 1b)', () => {
  it('emits the shipped q_vekst recipe — header authored in REVERSED order, pair sorted for identity', () => {
    // fragments.case.md authors "# Recipe: f_utklipp + f_bok"; the shipped
    // pair is the sorted [f_bok, f_utklipp].
    expect(recipeFor('q_vekst')).toEqual(fragments.recipes.q_vekst);
  });

  it('emits the shipped q_grete_dor recipe', () => {
    expect(recipeFor('q_grete_dor')).toEqual(fragments.recipes.q_grete_dor);
  });

  it('derives reading from the target question Teaser (one-owner rule, never authored on the recipe)', () => {
    const question = slice.questions.find((q) => q.id === 'q_vekst');
    expect(question?.teaser).toBeDefined();
    expect(recipeFor('q_vekst').reading).toBe(question?.teaser);
    const other = slice.questions.find((q) => q.id === 'q_grete_dor');
    expect(recipeFor('q_grete_dor').reading).toBe(other?.teaser);
  });

  it('omits the recipes key when the case authors none (sparse-field law)', () => {
    const minimal = compileCase(MINIMAL_HEADER.join('\n'));
    expect('recipes' in minimal.slice).toBe(false);
  });

  it('errors on duplicate pairs even when the second is authored in the other order', () => {
    const text = [
      ...MINIMAL_HEADER,
      '# Question: q_a',
      'Title: A?',
      'Teaser: T.',
      '',
      '# Recipe: f_a + f_b',
      '~ open q_a',
      'Frank: «En.»',
      '',
      '# Recipe: f_b + f_a',
      '~ open q_a',
      'Frank: «To.»',
    ].join('\n');
    const out = compileCase(text);
    const duplicate = out.diagnostics.find((d) => d.code === codes.DUPLICATE_ID);
    expect(duplicate).toBeDefined();
    expect(duplicate?.severity).toBe('error');
    expect(duplicate?.subjectIds).toContain('f_a + f_b');
  });

  it('a pair of two identical facts is an error', () => {
    const text = [...MINIMAL_HEADER, '# Recipe: f_a + f_a', '~ open q_a'].join('\n');
    const out = compileCase(text);
    expect(out.diagnostics.some((d) => d.code === codes.LINE_UNPARSED)).toBe(true);
    expect(out.slice.recipes ?? []).toEqual([]);
  });

  it('a recipe without a ~ open target warns field-missing and emits question_id ""', () => {
    const text = [...MINIMAL_HEADER, '# Recipe: f_a + f_b', 'Frank: «En.»'].join('\n');
    const out = compileCase(text);
    expect(out.diagnostics.some((d) => d.code === codes.FIELD_MISSING)).toBe(true);
    expect(out.slice.recipes?.[0].question_id).toBe('');
    expect(out.slice.recipes?.[0].reading).toBe('');
  });

  it('a second ~ open in one recipe warns recipe-question-conflict; the first wins', () => {
    const text = [
      ...MINIMAL_HEADER,
      '# Question: q_a',
      'Title: A?',
      'Teaser: T.',
      '',
      '# Recipe: f_a + f_b',
      '~ open q_a',
      '~ open q_b',
    ].join('\n');
    const out = compileCase(text);
    expect(out.diagnostics.some((d) => d.code === codes.RECIPE_QUESTION_CONFLICT)).toBe(true);
    expect(out.slice.recipes?.[0].question_id).toBe('q_a');
  });

  it('gate: parses via §6 but has no runtime field — warns recipe-gate-unsupported, emits nothing for it (DD-002)', () => {
    const text = [
      ...MINIMAL_HEADER,
      '# Question: q_a',
      'Title: A?',
      'Teaser: T.',
      '',
      '# Recipe: f_a + f_b',
      'gate: f_c and f_d',
      '~ open q_a',
    ].join('\n');
    const out = compileCase(text);
    expect(out.diagnostics.some((d) => d.code === codes.RECIPE_GATE_UNSUPPORTED)).toBe(true);
    const recipe = out.slice.recipes?.[0];
    expect(recipe).toEqual({
      question_id: 'q_a',
      pair: ['f_a', 'f_b'],
      reading: 'T.',
      frank_lines: [],
    });
  });

  it('~ effects other than open have no recipe field — warn recipe-effect-unsupported, emit nothing (DD-002)', () => {
    const text = [
      ...MINIMAL_HEADER,
      '# Question: q_a',
      'Title: A?',
      'Teaser: T.',
      '',
      '# Recipe: f_a + f_b',
      '~ open q_a',
      '~ pay f_c',
    ].join('\n');
    const out = compileCase(text);
    expect(out.diagnostics.some((d) => d.code === codes.RECIPE_EFFECT_UNSUPPORTED)).toBe(true);
    expect(out.slice.recipes?.[0]).toEqual({
      question_id: 'q_a',
      pair: ['f_a', 'f_b'],
      reading: 'T.',
      frank_lines: [],
    });
  });

  it('an unresolved pair fact is a stub, never fatal', () => {
    const text = [
      ...MINIMAL_HEADER,
      '# Question: q_a',
      'Title: A?',
      'Teaser: T.',
      '',
      '# Recipe: f_missing + f_also_missing',
      '~ open q_a',
    ].join('\n');
    const out = compileCase(text);
    expect(out.slice.recipes).toHaveLength(1);
    expect(
      out.diagnostics.filter(
        (d) => d.code === codes.STUB_UNRESOLVED_ID && d.subjectIds.includes('f_missing'),
      ),
    ).toHaveLength(1);
    expect(out.diagnostics.every((d) => d.severity !== 'error')).toBe(true);
  });
});

describe('# Proposal: blocks (ratified by SB-028, implemented by SB-029)', () => {
  it('a non-slug header (spaces) warns line-unparsed and skips the block, never crashes', () => {
    const text = [
      ...MINIMAL_HEADER,
      '# Proposal: kap. 4 — bolig',
      'Line: «Noe.»',
      'Relevant: f_a, f_b',
      '',
      '# Question: q_a',
      'Title: A?',
    ].join('\n');
    const out = compileCase(text);
    // proposal-not-ratified is retired (SB-029): a bad header is a plain
    // line-unparsed warning, and the block emits nothing.
    expect(out.diagnostics.some((d) => d.code === codes.PROPOSAL_NOT_RATIFIED)).toBe(false);
    expect(out.diagnostics.some((d) => d.code === codes.LINE_UNPARSED)).toBe(true);
    expect(out.slice.questions).toHaveLength(1);
    expect(JSON.stringify(out.slice)).not.toContain('bolig');
  });
});
