// TASK-018 equivalence oracle: the retired 0.1 generator's parse layer is the
// oracle for the new 0.2 compiler on the real 0.1 tiny-olsen.case.md.
// Everything runs in memory — no file writes, no core-loop access.
//
// Deep-equal, not byte-equal: the old serializer was 2-space JSON, the new one
// is tab-indented; serialization is covered by emit-stability.test.mjs.
import { describe, expect, it } from 'vitest';
import { readFile } from 'node:fs/promises';
import { buildTinyOlsenArtifacts, defaultPaths } from './generate-tiny-olsen-case.mjs';
import { compileCase } from '../../src/compiler/index.ts';

const paths = defaultPaths(process.cwd());

/**
 * Explicit allowlist of legitimate old→new output deltas. Every entry names
 * the exact subject and the ruling that makes the delta correct. Anything not
 * listed here must deep-equal — an undocumented delta fails the suite.
 *
 * Note on the dropped bidirectional check: the old generator *validated*
 * Reveals-questions ↔ Opens-when both ways (throwing on mismatch) but emitted
 * nothing for it, so deleting it from the live path (SB-022 ruling 3: question
 * reveal is one-way, `when:` on the question owns it) produces no output delta
 * on this file — it needs no entry below. Canonical leads likewise: the 0.1
 * file authors no Lead/Leads lines, so the leads shape is not exercised here.
 */
const ALLOWED_DELTAS = [
  {
    // Sparse-field law (SB-022 ruling 3): an authored-empty `Needs:` is an
    // unset availability. The old generator emitted the vacuous predicate
    // { op: 'all', children: [] }; the new compiler omits the field.
    hypothesisId: 'h_b_uavklart',
    field: 'availability',
    oldValue: { op: 'all', children: [] },
  },
  {
    // Same sparse-field-law delta as above, second empty-Needs hypothesis.
    hypothesisId: 'h_s_ukjent',
    field: 'availability',
    oldValue: { op: 'all', children: [] },
  },
];

function applyAllowlist(oldGodotSource) {
  const adjusted = structuredClone(oldGodotSource);
  for (const delta of ALLOWED_DELTAS) {
    const hypothesis = adjusted.hypotheses.find((h) => h.id === delta.hypothesisId);
    // The allowlist must describe reality: the entry's old value has to be
    // exactly what the oracle produced, or the entry itself is stale.
    expect(hypothesis, `allowlist entry ${delta.hypothesisId} not found`).toBeDefined();
    expect(hypothesis[delta.field]).toEqual(delta.oldValue);
    delete hypothesis[delta.field];
  }
  return adjusted;
}

describe('legacy equivalence oracle (old generator vs 0.2 compiler)', () => {
  it('the new compiler reproduces the old godotSource on the 0.1 file, modulo the allowlist', async () => {
    const oldArtifacts = await buildTinyOlsenArtifacts(paths);
    const caseText = await readFile(paths.casePath, 'utf8');
    const { slice } = compileCase(caseText);
    expect(slice).toEqual(applyAllowlist(oldArtifacts.godotSource));
  });

  it('the new compiler reproduces the old labContent exactly', async () => {
    const oldArtifacts = await buildTinyOlsenArtifacts(paths);
    const caseText = await readFile(paths.casePath, 'utf8');
    const { labContent } = compileCase(caseText);
    expect(labContent).toEqual(oldArtifacts.labContent);
  });

  it('compiles the 0.1 file with fix-its and lints only — no errors', async () => {
    const caseText = await readFile(paths.casePath, 'utf8');
    const { diagnostics } = compileCase(caseText);
    expect(diagnostics.filter((d) => d.severity === 'error')).toEqual([]);
    // The known census on the 0.1 file (TASK-017 progress note): 14 + 2 + 2.
    const byCode = {};
    for (const d of diagnostics) byCode[d.code] = (byCode[d.code] ?? 0) + 1;
    expect(byCode).toEqual({
      'fixit-reveals-questions': 14,
      'fixit-effects-line': 2,
      'lint-hypothesis-opens-nothing': 2,
    });
  });
});
