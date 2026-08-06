// SB-044 — headless test for the loose-end worklist derivation:
// compiler output (+ parsed blocks) → worklist entries. Pure, no DOM.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { compileCase } from '../../src/compiler/index.ts';
import { parseCaseText } from '../../src/compiler/parse.ts';
import { DiagnosticBag } from '../../src/compiler/diagnostics.ts';
import type { RawBlock } from '../../src/compiler/parse.ts';
import { buildWorklist } from './worklist.ts';

const ROOT = process.cwd();
const olsenText = readFileSync(`${ROOT}/content/cases/olsen/tiny-olsen.case.md`, 'utf8');

function blocksOf(text: string): RawBlock[] {
  const parsed = parseCaseText(text, new DiagnosticBag());
  return [...(parsed.caseBlock ? [parsed.caseBlock] : []), ...parsed.blocks];
}

const worklistFor = (text: string) => buildWorklist(compileCase(text).diagnostics, blocksOf(text));

// A tiny case with every loose-end species: a Supports stub, an Opens stub,
// a blank-template tiltak (empty Title), and a TODO line.
const LOOSE_CASE = `# Case: case_loose

Title: Løse tråder

# Document: doc_a

Title: Brev
Peek: Et brev.
Meta: TEST

Prosa uten anker.

## f_a

Label: Et faktum
Summary: Noe vi vet.
Supports: q_finnes_ikke

# Question: q_b

Title: Hva nå?
Teaser: Uklart.

# Hypothesis: h_b

Title: En tanke
Question: q_b
Opens: t_mangler

# Tiltak: t_ny

Title:
Slot: s1 · Cost: 0
Needs:
Description:

TODO: skriv ferdig tiltaket
`;

describe('SB-044 worklist derivation', () => {
  it('surfaces unresolved-id stubs with the stub and owner as jump candidates', () => {
    const entries = worklistFor(LOOSE_CASE);
    const stubs = entries.filter((e) => e.group === 'stub');
    expect(stubs.length).toBe(2);

    const supports = stubs.find((e) => e.subjectIds.includes('q_finnes_ikke'))!;
    expect(supports.code).toBe('stub-unresolved-id');
    expect(supports.subjectIds).toContain('f_a'); // owner — the jumpable block
    expect(supports.line).toBeGreaterThan(0);

    const opens = stubs.find((e) => e.subjectIds.includes('t_mangler'))!;
    expect(opens.subjectIds).toContain('h_b');
  });

  it('surfaces empty required fields per block kind', () => {
    const entries = worklistFor(LOOSE_CASE);
    const empties = entries.filter((e) => e.group === 'empty-field');
    // Exactly the tiltak's blank Title — every other block is filled in.
    expect(empties.length).toBe(1);
    expect(empties[0].message).toBe('t_ny: Title is empty');
    expect(empties[0].subjectIds).toEqual(['t_ny']);
    // The line points into the tiltak block so the jump lands right.
    const heading = LOOSE_CASE.split('\n').findIndex((l) => l.startsWith('# Tiltak: t_ny')) + 1;
    expect(empties[0].line).toBe(heading);
  });

  it('passes the remaining compiler diagnostics through, stub ones excluded', () => {
    const { diagnostics } = compileCase(LOOSE_CASE);
    const entries = worklistFor(LOOSE_CASE);
    const diagEntries = entries.filter((e) => e.group === 'diagnostic');
    expect(diagEntries.length).toBe(
      diagnostics.filter((d) => d.code !== 'stub-unresolved-id').length,
    );
    expect(diagEntries.some((e) => e.code === 'todo-line')).toBe(true);
    expect(diagEntries.some((e) => e.code === 'stub-unresolved-id')).toBe(false);
  });

  it('a question satisfies its prompt requirement with either Prompt or Title', () => {
    const promptOnly = LOOSE_CASE.replace('Title: Hva nå?', 'Prompt: Hva nå?');
    const empties = worklistFor(promptOnly).filter((e) => e.group === 'empty-field');
    expect(empties.length).toBe(1); // still only the tiltak
    const neither = LOOSE_CASE.replace('Title: Hva nå?', 'Title:');
    const empties2 = worklistFor(neither).filter((e) => e.group === 'empty-field');
    expect(empties2.some((e) => e.message === 'q_b: Prompt/Title is empty')).toBe(true);
  });

  it('the real Olsen case carries no empty-field noise and mirrors its diagnostics', () => {
    const { diagnostics } = compileCase(olsenText);
    const entries = worklistFor(olsenText);
    expect(entries.filter((e) => e.group === 'empty-field')).toEqual([]);
    expect(entries.filter((e) => e.group === 'stub').length).toBe(
      diagnostics.filter((d) => d.code === 'stub-unresolved-id').length,
    );
    expect(entries.filter((e) => e.group === 'diagnostic').length).toBe(
      diagnostics.filter((d) => d.code !== 'stub-unresolved-id').length,
    );
  });
});
