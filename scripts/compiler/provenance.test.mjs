// Provenance + legacy smoke tests for the 0.2 compiler (TASK-014).
// Lives in scripts/ (not src/) because it needs node:fs, and the app tsconfig
// has no @types/node.
import { describe, expect, it } from 'vitest';
import { access, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import fragments from '../../src/compiler/__tests__/fixtures/shipped-fragments.json';
import { compileCase } from '../../src/compiler/index.ts';

const shippedPath = resolve(
  process.cwd(),
  '../lifelines-core-loop/resources/cases/olsen/source/tiny_olsen_slice.json',
);

describe('shipped-fragments.json provenance', () => {
  it('every vendored fragment deep-equals the shipped tiny_olsen_slice.json', async () => {
    try {
      await access(shippedPath);
    } catch {
      console.warn(`Skipping provenance check; missing ${shippedPath}`);
      return;
    }
    const shipped = JSON.parse(await readFile(shippedPath, 'utf8'));
    expect({
      id: shipped.id,
      title: shipped.title,
      scenario_stage: shipped.scenario_stage,
      vurdering_frist_day: shipped.vurdering_frist_day,
    }).toEqual(fragments.header);
    expect({
      pair_soft_reject_line: shipped.pair_soft_reject_line,
      pair_already_set_line: shipped.pair_already_set_line,
    }).toEqual(fragments.pair_lines);
    // frank_proposals is vendored as the WHOLE shipped array (order 0–23 is
    // load-bearing per SB-028 ruling C), so it compares positionally.
    expect(shipped.frank_proposals).toStrictEqual(fragments.frank_proposals);
    for (const [section, byId] of Object.entries(fragments)) {
      if (
        section === '_provenance' ||
        section === 'header' ||
        section === 'pair_lines' ||
        section === 'frank_proposals'
      )
        continue;
      for (const [id, fragment] of Object.entries(byId)) {
        // calls are keyed by contact_id, recipes by question_id — neither has
        // an id field.
        const shippedEntity = shipped[section].find(
          (entity) => (entity.id ?? entity.contact_id ?? entity.question_id) === id,
        );
        expect(shippedEntity, `${section}/${id}`).toEqual(fragment);
      }
    }
  });
});

describe('legacy 0.1 tiny-olsen.case.md keeps compiling (fix-its, never fatal)', () => {
  it('parses the whole 0.1 file without throwing and emits the entity sections', async () => {
    const text = await readFile(
      resolve(process.cwd(), 'content/cases/olsen/tiny-olsen.case.md'),
      'utf8',
    );
    const out = compileCase(text);
    expect(out.slice.documents).toHaveLength(8);
    expect(out.slice.facts.length).toBeGreaterThanOrEqual(28);
    expect(out.slice.questions).toHaveLength(6);
    expect(out.slice.hypotheses.length).toBeGreaterThan(0);
    expect(out.slice.tiltak).toHaveLength(9);
    expect(out.slice.dispatches.map((d) => d.id)).toEqual(['d_ring_grete', 'd_konto']);
    expect(out.slice.clocks).toHaveLength(4);
    expect(out.slice.event_delta_specs.map((e) => e.event_type)).toEqual([
      'grete_received',
      'delivery_taken_in',
      'delivery_unanswered',
    ]);
    // One-way reveal: no error-severity diagnostics from the dead bidirectional check.
    expect(out.diagnostics.filter((d) => d.severity === 'error')).toEqual([]);
  });
});
