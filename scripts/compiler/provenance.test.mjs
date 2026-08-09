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

describe('healed 0.2 tiny-olsen.case.md (SB-024 back-port) compiles clean', () => {
  it('emits the full drifted inventory with zero errors and zero warnings', async () => {
    const text = await readFile(
      resolve(process.cwd(), 'content/cases/olsen/tiny-olsen.case.md'),
      'utf8',
    );
    const out = compileCase(text);
    expect(out.slice.documents).toHaveLength(9);
    expect(out.slice.facts).toHaveLength(27);
    expect(out.slice.questions).toHaveLength(8);
    expect(out.slice.hypotheses).toHaveLength(23);
    expect(out.slice.tiltak).toHaveLength(9);
    expect(out.slice.dispatches.map((d) => d.id)).toEqual(['d_konto', 'hjemmebesok']);
    expect(out.slice.clocks).toHaveLength(6);
    expect(out.slice.event_delta_specs.map((e) => e.event_type)).toEqual([
      'grete_received',
      'delivery_taken_in',
      'delivery_unanswered',
    ]);
    expect(out.slice.day_script_beats).toHaveLength(6);
    expect(out.slice.frank_chat).toHaveLength(8);
    // 24 at the SB-024 heal; Terje deleted `depositum` on 2026-08-09 (live
    // authoring after the SB-055 verdict) — the inventory follows the content.
    expect(out.slice.frank_proposals).toHaveLength(23);
    expect(out.slice.recipes).toHaveLength(2);
    expect(out.slice.calls?.map((c) => c.contact_id)).toEqual(['grete']);
    // The healed file is warning-free — only §9 advisory lints remain.
    expect(out.diagnostics.filter((d) => d.severity === 'error')).toEqual([]);
    expect(out.diagnostics.filter((d) => d.severity === 'warning')).toEqual([]);
  });
});
