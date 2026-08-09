// The document model: the markup buffer (the single source the canvas
// edits), its draft safety net, and everything derived from a compile —
// the slice graph, the parsed blocks, the edge indexes, the heading index.
// Rendering and layout read this module; they never own compile state.
//
// SB-078: the state is a MobX spine. `state` holds the buffer and the
// compile derivatives, `ui` holds the selection; both are shallow — the
// compiler stays pure, so a compile result is swapped as one ref, never
// deep-wrapped. main.ts hangs autoruns off these; everything else reads
// them as plain data.
import { observable, action, configure } from 'mobx';
import { compileCase } from '../../src/compiler/index.ts';
import type { CompileResult } from '../../src/compiler/index.ts';
import { parseCaseText } from '../../src/compiler/parse.ts';
import type { RawBlock } from '../../src/compiler/parse.ts';
import { DiagnosticBag } from '../../src/compiler/diagnostics.ts';
import { activeCasePath, activeCaseText, draftKey } from '../shared/active-case.ts';
import { buildGraph } from './graph.ts';
import type { CaseGraph, GraphNode, GraphEdge } from './graph.ts';
import { indexHeadings } from '../script-editor/lens.ts';
import type { Heading } from '../script-editor/lens.ts';

// The lab writes observables from async tails (save notes) and event
// handlers alike — no action ceremony outside the batching that matters.
configure({ enforceActions: 'never' });

// Same draft key as the script editor (SB-025 rule: a vite reload must never
// wipe unsaved work). A draft made on either surface is visible on both.
export const DRAFT_KEY = draftKey(activeCasePath);
const bootDraft = localStorage.getItem(DRAFT_KEY);
const bootText = bootDraft != null && bootDraft !== activeCaseText ? bootDraft : activeCaseText;

export const state = observable(
  {
    /** The current markup buffer (the single source the canvas edits). */
    caseText: bootText,
    draftRestored: bootText !== activeCaseText,
    result: undefined as unknown as CompileResult,
    graph: undefined as unknown as CaseGraph,
    nodeById: new Map<string, GraphNode>(),
    blockById: new Map<string, RawBlock>(),
    inOf: new Map<string, GraphEdge[]>(),
    outOf: new Map<string, GraphEdge[]>(),
    // SB-041: heading index for the lens (folding/jump) — the cursor→block
    // resolution reads it too.
    crossJumpHeadings: [] as Heading[],
  },
  {},
  { deep: false },
);

// ---- selection (SB-078: observable — the style/inspector autoruns and the
// cross-jump reaction in main hang off these) ------------------------------

export const ui = observable(
  { selectedId: null as string | null, selectedEdgeKey: null as string | null },
  {},
  { deep: false },
);

/** Select a node (clears any edge selection). Highlight, inspector, and the
 *  canvas→script cross-jump react in main. */
export const setSelected = action((id: string | null): void => {
  if (id !== null) ui.selectedEdgeKey = null;
  ui.selectedId = id;
});

/** Select an edge (clears any node selection). */
export const setSelectedEdge = action((key: string | null): void => {
  if (key !== null && ui.selectedId !== null) setSelected(null);
  ui.selectedEdgeKey = key;
});

// Probe-surface mirror: the smoke tests read `probe.graph` as a live module
// binding — an ES namespace cannot expose the observable behind a getter.
// Assigned in the same action that swaps state.graph, never anywhere else.
export let graph: CaseGraph;

export function getCaseText(): string {
  return state.caseText;
}

/** Every committed buffer swap lands here; the rebuild reaction in main
 *  recompiles from it. */
export const setCaseText = action((text: string): void => {
  state.caseText = text;
});

export function setDraftRestored(value: boolean): void {
  state.draftRestored = value;
}

// ---- derived compile state (rebuilt on every committed edit) --------------

/** Compile the buffer and derive the graph. Layout runs after this. */
export const recompile = action((): void => {
  state.result = compileCase(state.caseText);
  state.graph = buildGraph(state.result.slice);
  graph = state.graph;
});

/** Re-derive the block map, edge indexes, and heading index post-layout. */
export const deriveIndexes = action((): void => {
  const parsed = parseCaseText(state.caseText, new DiagnosticBag());
  const blockById = new Map<string, RawBlock>();
  if (parsed.caseBlock) blockById.set(parsed.caseBlock.id, parsed.caseBlock);
  for (const block of parsed.blocks) blockById.set(block.id, block);
  state.blockById = blockById;

  state.nodeById = new Map(state.graph.nodes.map((n) => [n.id, n]));
  const inOf = new Map<string, GraphEdge[]>();
  const outOf = new Map<string, GraphEdge[]>();
  for (const edge of state.graph.edges) {
    if (!outOf.has(edge.from)) outOf.set(edge.from, []);
    if (!inOf.has(edge.to)) inOf.set(edge.to, []);
    outOf.get(edge.from)!.push(edge);
    inOf.get(edge.to)!.push(edge);
  }
  state.inOf = inOf;
  state.outOf = outOf;

  state.crossJumpHeadings = indexHeadings(state.caseText.split('\n'));
});
