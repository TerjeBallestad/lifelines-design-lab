// SB-044 loose-end worklist — the inklewriter/Twine "loose ends" move.
// Pure derivation: compiler output (+ parsed blocks) → one flat, jumpable
// list of everything dangling. Writing-creates-structure (SB-040 ruling 2)
// is safe only if every dangling end stays visible and reachable, so the
// list carries three groups:
//   stub        — unresolved ids the compiler kept as stubs
//   empty-field — required fields a block kind still leaves blank
//   diagnostic  — every other compiler diagnostic, unfiltered
// The page renders it and owns the jump; this module owns only the data.
// SB-071 adds the fourth group as its own cross-file list: every `Stub: yes`
// block (SDD-130 stub marking) across all source files, so the placeholder
// purge has one worklist. buildStubWorklist stays pure — the page passes the
// source texts and owns the jump (in-lens for the active case, a script-
// editor link for other files).
import { codes } from '../../src/compiler/diagnostics.ts';
import type { Diagnostic, Severity } from '../../src/compiler/diagnostics.ts';
import type { RawBlock } from '../../src/compiler/parse.ts';
import { findStubBlocks } from '../../src/compiler/stubs.ts';
import type { StubBlockRef } from '../../src/compiler/stubs.ts';

export type WorklistGroup = 'stub' | 'empty-field' | 'diagnostic';

export interface WorklistEntry {
  group: WorklistGroup;
  severity: Severity;
  /** Stable diagnostic code, or 'empty-field' for the derived group. */
  code: string;
  message: string;
  /** Jump candidates, best first — the page selects the first live node. */
  subjectIds: string[];
  /** 1-based script line to land on when no subject resolves to a block. */
  line: number;
}

/** Required fields per block kind: any key in `keys` with a non-empty value
 *  satisfies the requirement (questions may use Prompt or Title). Mirrors
 *  the canvas FORM_FIELDS primary rows — the fields a block is useless
 *  without. Kinds not listed (beat, conversation, …) have no requirement. */
export const REQUIRED_FIELDS: Partial<
  Record<RawBlock['type'], Array<{ label: string; keys: string[] }>>
> = {
  document: [{ label: 'Title', keys: ['Title'] }],
  fact: [
    { label: 'Label', keys: ['Label'] },
    { label: 'Summary', keys: ['Summary'] },
  ],
  question: [{ label: 'Prompt/Title', keys: ['Prompt', 'Title'] }],
  hypothesis: [{ label: 'Title', keys: ['Title'] }],
  tiltak: [{ label: 'Title', keys: ['Title'] }],
  dispatch: [{ label: 'Title', keys: ['Title'] }],
  clock: [{ label: 'Label', keys: ['Label'] }],
};

/** Derive the worklist. Order: stubs, empty fields, then the remaining
 *  diagnostics in compiler order — the loose ends most likely to be a
 *  just-created block float to the top. */
export function buildWorklist(diagnostics: Diagnostic[], blocks: RawBlock[]): WorklistEntry[] {
  const entries: WorklistEntry[] = [];

  for (const d of diagnostics)
    if (d.code === codes.STUB_UNRESOLVED_ID)
      entries.push({
        group: 'stub',
        severity: d.severity,
        code: d.code,
        message: d.message,
        subjectIds: d.subjectIds,
        line: d.span.startLine,
      });

  for (const block of blocks) {
    const specs = REQUIRED_FIELDS[block.type];
    if (!specs) continue;
    for (const spec of specs) {
      const filled = block.fields.some(
        (field) => spec.keys.includes(field.key) && field.value.trim() !== '',
      );
      if (filled) continue;
      entries.push({
        group: 'empty-field',
        severity: 'warning',
        code: 'empty-field',
        message: `${block.id}: ${spec.label} is empty`,
        subjectIds: [block.id],
        line: block.startLine,
      });
    }
  }

  for (const d of diagnostics)
    if (d.code !== codes.STUB_UNRESOLVED_ID)
      entries.push({
        group: 'diagnostic',
        severity: d.severity,
        code: d.code,
        message: d.message,
        subjectIds: d.subjectIds,
        line: d.span.startLine,
      });

  return entries;
}

// ---- SB-071 stub worklist (cross-file) ------------------------------------

/** One `Stub: yes` block, addressed by its source file for the jump. */
export interface StubWorklistEntry {
  /** Repo-relative source path (active-case seam vocabulary). */
  path: string;
  ref: StubBlockRef;
}

/**
 * Every `Stub: yes` block across the given source texts, in source order —
 * files as passed (the seam's sorted sourcePaths), blocks in file order.
 * Family by extension, matching the active-case seam's isCharacterPath.
 */
export function buildStubWorklist(
  sources: Array<{ path: string; text: string }>,
): StubWorklistEntry[] {
  return sources.flatMap(({ path, text }) =>
    findStubBlocks(text, path.endsWith('.sim.md') ? 'character' : 'case').map((ref) => ({
      path,
      ref,
    })),
  );
}
