// SB-071 stub-count lint — SDD-130 §2: a `Stub: yes` marker survives compile
// into the runtime resource, a lint counts the stubs, and the placeholder
// purge is done when the count is zero. This module is the one scanner both
// consumers share: the gen:content --check pipeline (the measurable count)
// and the canvas loose-end worklist (the cross-file jump list).
//
// The scan reads parsed blocks, not emitted shapes, so every stub-marked
// block keeps its source line for the worklist jump — emitted shapes carry
// no spans. Marker semantics mirror emit-shared.ts readStubMarker: only the
// exact value "yes" counts (other values already warn at emit time).

import { DiagnosticBag } from './diagnostics.ts';
import { parseCaseText, parseCharacterText } from './parse.ts';
import type { RawBlock, SourceFamily } from './parse.ts';

/** One `Stub: yes` block, located for the worklist jump. */
export interface StubBlockRef {
  blockId: string;
  blockType: RawBlock['type'];
  /** 1-based header line of the block. */
  line: number;
  /** Row text: the block's Title when authored, else the header id. */
  label: string;
}

/** True when the block carries the SDD-130 `Stub: yes` marker. */
export const isStubBlock = (block: RawBlock): boolean =>
  block.fields.some((field) => field.key === 'Stub' && field.value === 'yes');

/**
 * Every `Stub: yes` block in a source text, in file order. The parse runs on
 * a throwaway diagnostic bag — the compile owns diagnostics; this is a scan.
 */
export function findStubBlocks(text: string, family: SourceFamily): StubBlockRef[] {
  const diag = new DiagnosticBag();
  const parsed =
    family === 'character' ? parseCharacterText(text, diag) : parseCaseText(text, diag);
  return parsed.blocks.filter(isStubBlock).map((block) => ({
    blockId: block.id,
    blockType: block.type,
    line: block.startLine,
    label: block.fields.find((field) => field.key === 'Title')?.value || block.id,
  }));
}
