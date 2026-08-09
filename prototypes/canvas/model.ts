// The document model: the markup buffer (the single source the canvas
// edits), its draft safety net, and everything derived from a compile —
// the slice graph, the parsed blocks, the edge indexes, the heading index.
// Rendering and layout read this module; they never own compile state.
import { compileCase } from '../../src/compiler/index.ts';
import type { CompileResult } from '../../src/compiler/index.ts';
import { parseCaseText } from '../../src/compiler/parse.ts';
import type { RawBlock } from '../../src/compiler/parse.ts';
import { DiagnosticBag } from '../../src/compiler/diagnostics.ts';
import initialText from '../../content/cases/olsen/tiny-olsen.case.md?raw';
import { buildGraph } from './graph.ts';
import type { CaseGraph, GraphNode, GraphEdge } from './graph.ts';
import { indexHeadings } from '../script-editor/lens.ts';
import type { Heading } from '../script-editor/lens.ts';

// Same draft key as the script editor (SB-025 rule: a vite reload must never
// wipe unsaved work). A draft made on either surface is visible on both.
export const DRAFT_KEY = 'kildeverket-draft:content/cases/olsen/tiny-olsen.case.md';
const bootDraft = localStorage.getItem(DRAFT_KEY);
let caseText = bootDraft != null && bootDraft !== initialText ? bootDraft : initialText;
export let draftRestored = caseText !== initialText;

/** The current markup buffer (the single source the canvas edits). */
export function getCaseText(): string {
  return caseText;
}

export function setCaseText(text: string): void {
  caseText = text;
}

export function setDraftRestored(value: boolean): void {
  draftRestored = value;
}

// ---- derived compile state (rebuilt on every committed edit) --------------

export let result: CompileResult;
export let graph: CaseGraph;
export let nodeById = new Map<string, GraphNode>();
export let blockById = new Map<string, RawBlock>();
export let inOf = new Map<string, GraphEdge[]>();
export let outOf = new Map<string, GraphEdge[]>();
// SB-041: heading index for the lens (folding/jump) — the cursor→block
// resolution reads it too.
export let crossJumpHeadings: Heading[] = [];

/** Compile the buffer and derive the graph. Layout runs after this. */
export function recompile(): void {
  result = compileCase(caseText);
  graph = buildGraph(result.slice);
}

/** Re-derive the block map, edge indexes, and heading index post-layout. */
export function deriveIndexes(): void {
  const parsed = parseCaseText(caseText, new DiagnosticBag());
  blockById = new Map();
  if (parsed.caseBlock) blockById.set(parsed.caseBlock.id, parsed.caseBlock);
  for (const block of parsed.blocks) blockById.set(block.id, block);

  nodeById = new Map(graph.nodes.map((n) => [n.id, n]));
  inOf = new Map();
  outOf = new Map();
  for (const edge of graph.edges) {
    if (!outOf.has(edge.from)) outOf.set(edge.from, []);
    if (!inOf.has(edge.to)) inOf.set(edge.to, []);
    outOf.get(edge.from)!.push(edge);
    inOf.get(edge.to)!.push(edge);
  }

  crossJumpHeadings = indexHeadings(caseText.split('\n'));
}
