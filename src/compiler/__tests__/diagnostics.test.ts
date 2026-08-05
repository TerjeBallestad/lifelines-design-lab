import { describe, expect, it } from 'vitest';
import { compileCase } from '../index';
import { codes } from '../diagnostics';

describe('diagnostics contract — the editor consumption surface', () => {
  it('every diagnostic carries { code, severity, message, span, subjectIds }', () => {
    const text = [
      '# Case: c_x',
      'Title: X',
      '',
      '# Question: q_a',
      'Title: T?',
      'when: t_x (taken)',
    ].join('\n');
    const out = compileCase(text);
    expect(out.diagnostics.length).toBeGreaterThan(0);
    for (const diag of out.diagnostics) {
      expect(typeof diag.code).toBe('string');
      expect(['error', 'warning', 'info', 'advisory']).toContain(diag.severity);
      expect(typeof diag.message).toBe('string');
      expect(diag.span.startLine).toBeGreaterThan(0);
      expect(diag.span.endLine).toBeGreaterThanOrEqual(diag.span.startLine);
      expect(Array.isArray(diag.subjectIds)).toBe(true);
    }
  });

  it('unresolved ids become stubs — listed, never fatal (0.2 reference law)', () => {
    const text = [
      '# Case: c_x',
      'Title: X',
      '',
      '# Document: doc_a',
      'Kind: BREV · Register: formell',
      'Title: T',
      'Peek: p',
      'Meta: M',
      '',
      'Prose with [an anchor to a missing fact](fact:f_missing).',
      '',
      '# Question: q_a',
      'Title: T?',
      'when: f_missing and f_also_missing',
    ].join('\n');
    const out = compileCase(text);
    const stubs = out.diagnostics.filter((d) => d.code === codes.STUB_UNRESOLVED_ID);
    expect(stubs.length).toBeGreaterThan(0);
    expect(stubs.every((d) => d.severity === 'warning')).toBe(true);
    expect(stubs.some((d) => d.subjectIds.includes('f_missing'))).toBe(true);
    // The slice still emits — stubs never block compilation.
    expect(out.slice.questions).toHaveLength(1);
    expect(out.slice.documents).toHaveLength(1);
  });

  it('// comments are stripped, including trailing comments on field lines', () => {
    const text = [
      '# Case: c_x',
      '// a full-line comment',
      'Title: X',
      'Deadline: day 10        // was «Vurdering frist day»',
    ].join('\n');
    const out = compileCase(text);
    expect(out.slice.title).toBe('X');
    expect(out.slice.vurdering_frist_day).toBe(10);
  });

  it('TODO: lines become tracked work — an info diagnostic, and the file still compiles', () => {
    const text = [
      '# Case: c_x',
      'Title: X',
      '',
      '# Question: q_a',
      'Title: T?',
      'TODO: finn when-gaten',
    ].join('\n');
    const out = compileCase(text);
    const todo = out.diagnostics.find((d) => d.code === codes.TODO_LINE);
    expect(todo).toBeDefined();
    expect(todo?.severity).toBe('info');
    expect(todo?.message).toContain('finn when-gaten');
    expect(out.slice.questions).toHaveLength(1);
  });

  it('bare legacy Leads: warns leads-legacy-form and emits no leads', () => {
    const text = ['# Case: c_x', 'Title: X', '', '# Question: q_a', 'Title: T?', 'Leads: t_x'].join(
      '\n',
    );
    const out = compileCase(text);
    expect(out.diagnostics.some((d) => d.code === codes.LEADS_LEGACY_FORM)).toBe(true);
    expect('leads' in out.slice.questions[0]).toBe(false);
  });

  it('Reveals questions: maps one-way with a fix-it — no bidirectional check', () => {
    const text = [
      '# Case: c_x',
      'Title: X',
      '',
      '# Document: doc_a',
      'Kind: BREV · Register: formell',
      'Title: T',
      'Peek: p',
      'Meta: M',
      '',
      '[quote](fact:f_a)',
      '',
      '## f_a',
      'Label: L',
      'Summary: S',
      'Domain: D · Category: C',
      'Reveals questions: q_b',
      '',
      '# Question: q_b',
      'Title: T?',
      'when: f_other', // deliberately does NOT include f_a — the old generator threw here
    ].join('\n');
    const out = compileCase(text);
    expect(out.slice.facts[0].lift_effects).toEqual([
      { op: 'reveal_questions', args: { question_ids: ['q_b'] } },
    ]);
    expect(out.diagnostics.some((d) => d.code === codes.FIXIT_REVEALS_QUESTIONS)).toBe(true);
    expect(out.diagnostics.every((d) => d.severity !== 'error')).toBe(true);
  });

  it('# Recipe: compiles (Task 3); # Proposal: compiles (SB-029) — proposal-not-ratified is retired', () => {
    const text = [
      '# Case: c_x',
      'Title: X',
      '',
      '# Recipe: f_a + f_b',
      '~ open q_a',
      'Frank: «Noe.»',
      '',
      '# Proposal: bolig',
      'Relevant: f_a',
      'Line: «Noe.»',
      '',
      '# Question: q_a',
      'Title: T?',
    ].join('\n');
    const out = compileCase(text);
    expect(out.diagnostics.some((d) => d.code === codes.BLOCK_NOT_YET_SUPPORTED)).toBe(false);
    expect(out.diagnostics.some((d) => d.code === codes.PROPOSAL_NOT_RATIFIED)).toBe(false);
    expect(out.slice.recipes).toHaveLength(1);
    expect(out.slice.frank_proposals).toHaveLength(1);
    expect(out.slice.questions).toHaveLength(1);
  });

  it('empty input compiles to an empty slice with a header diagnostic', () => {
    const out = compileCase('');
    expect(out.slice).toBeDefined();
    expect(out.diagnostics.some((d) => d.code === codes.CASE_MISSING_HEADER)).toBe(true);
  });

  it('duplicate ids are reported, not fatal', () => {
    const text = [
      '# Case: c_x',
      'Title: X',
      '',
      '# Question: q_a',
      'Title: A?',
      '',
      '# Question: q_a',
      'Title: B?',
    ].join('\n');
    const out = compileCase(text);
    expect(out.diagnostics.some((d) => d.code === codes.DUPLICATE_ID)).toBe(true);
  });
});
