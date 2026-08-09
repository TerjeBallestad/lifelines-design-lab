// SB-063 drawer — the source-block resolver against the real case: every
// index-entry kind resolves to the authored lines that produce it, and a
// same-text splice reconstructs the file byte-identically.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { compileCase } from '../../src/compiler/index.ts';
import { recipeId } from '../shared/weave-ids.ts';
import { findSourceBlock, spliceSourceBlock } from './source-block.ts';

const ROOT = process.cwd();
const caseText = readFileSync(`${ROOT}/content/cases/olsen/tiny-olsen.case.md`, 'utf8');
const { slice } = compileCase(caseText);

describe('findSourceBlock', () => {
  const cases: Array<[string, string, string]> = [
    ['fact', slice.facts[0].id, `## ${slice.facts[0].id}`],
    ['document', slice.documents[0].id, `# Document: ${slice.documents[0].id}`],
    ['question', slice.questions[0].id, `# Question: ${slice.questions[0].id}`],
    ['hypothesis', slice.hypotheses[0].id, `# Hypothesis: ${slice.hypotheses[0].id}`],
    ['tiltak', slice.tiltak[0].id, `# Tiltak: ${slice.tiltak[0].id}`],
    ['dispatch', slice.dispatches[0].id, `# Dispatch: ${slice.dispatches[0].id}`],
    ['clock', slice.clocks[0].id, `# Clock: ${slice.clocks[0].id}`],
    ['proposal', slice.frank_proposals![0].handbok_id, '# Proposal:'],
    ['day_script_beat', slice.day_script_beats[0].id, `[id=${slice.day_script_beats[0].id}]`],
    [
      'event_delta',
      slice.event_delta_specs[0].event_type,
      `## ${slice.event_delta_specs[0].event_type}`,
    ],
    ['conversation', slice.frank_chat![0].id, '# Conversation: chat:frank'],
    ['conversation', `call:${slice.calls![0].contact_id}`, '# Conversation: call:'],
    ['recipe', recipeId(slice.recipes![0].pair), '# Recipe:'],
  ];

  for (const [kind, id, expectedHead] of cases)
    it(`resolves ${kind} ${id}`, () => {
      const block = findSourceBlock(caseText, id, kind)!;
      expect(block, `${kind} ${id} resolved`).not.toBeNull();
      expect(block.text.split('\n')[0]).toContain(expectedHead);
    });

  it('a fact block ends before the next ## or #', () => {
    const block = findSourceBlock(caseText, slice.facts[0].id, 'fact')!;
    const body = block.text.split('\n').slice(1);
    expect(body.some((line) => /^#{1,2} /.test(line))).toBe(false);
  });

  it('returns null for an unknown id', () => {
    expect(findSourceBlock(caseText, 'f_finnes_ikke', 'fact')).toBeNull();
    expect(findSourceBlock(caseText, 'nope', 'event_delta')).toBeNull();
  });
});

describe('spliceSourceBlock', () => {
  it('same-text splice reconstructs the file byte-identically', () => {
    for (const [kind, id] of [
      ['fact', slice.facts[3].id],
      ['document', slice.documents[2].id],
      ['day_script_beat', slice.day_script_beats[0].id],
    ] as const) {
      const block = findSourceBlock(caseText, id, kind)!;
      expect(spliceSourceBlock(caseText, block, block.text)).toBe(caseText);
    }
  });

  it('an edited block lands and recompiles', () => {
    const fact = slice.facts[0];
    const block = findSourceBlock(caseText, fact.id, 'fact')!;
    const edited = block.text.replace(/^Label: .*$/m, 'Label: Endret i skuffen');
    const newText = spliceSourceBlock(caseText, block, edited);
    const recompiled = compileCase(newText);
    expect(recompiled.slice.facts.find((f) => f.id === fact.id)!.label).toBe('Endret i skuffen');
    expect(recompiled.slice.facts.length).toBe(slice.facts.length);
  });
});
