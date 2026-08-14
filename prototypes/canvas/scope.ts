// SB-077 probe — board scoping. Four independently toggleable tools over the
// rendered graph, all applied at render time (no markup, no layout changes):
//   (a) focus     — selection + N undirected hops, everything else hidden
//   (b) kind chips — whole families toggled off (weave collapses to one chip)
//   (c) frames    — derived question-cluster outlines behind the edges
//   (d) jump-first — a ⌘K pick switches focus on around the landing node
// Pure set logic up top (unit-tested); DOM wiring stays behind initScope,
// same split as jump.ts.
import { observable } from 'mobx';
import type { CaseGraph, GraphNode, GraphEdge, NodeKind } from './graph.ts';
import { KIND_VAR, cssVar } from './kinds.ts';
import * as model from './model.ts';
import * as render from './render.ts';
import * as layout from './layout-modes.ts';
import { NODE_W, NODE_H } from './graph.ts';

// ---- pure logic -----------------------------------------------------------

/** The chip families — weave (conversation/recipe/proposal) folds into one,
 *  mirroring the legend (SB-046: one hue, labels tell them apart). */
export type ChipKey =
  | 'document'
  | 'fact'
  | 'question'
  | 'hypothesis'
  | 'tiltak'
  | 'dispatch'
  | 'clock'
  | 'weave';

export const CHIP_OF_KIND: Record<NodeKind, ChipKey> = {
  document: 'document',
  fact: 'fact',
  question: 'question',
  hypothesis: 'hypothesis',
  tiltak: 'tiltak',
  dispatch: 'dispatch',
  clock: 'clock',
  conversation: 'weave',
  recipe: 'weave',
  proposal: 'weave',
};

export const CHIP_LABEL: Record<ChipKey, string> = {
  document: 'doc',
  fact: 'fact',
  question: 'spm',
  hypothesis: 'hyp',
  tiltak: 'tiltak',
  dispatch: 'disp',
  clock: 'clock',
  weave: 'weave',
};

export const CHIP_KEYS: ChipKey[] = [
  'document',
  'fact',
  'question',
  'hypothesis',
  'tiltak',
  'dispatch',
  'clock',
  'weave',
];

/** Undirected BFS: the ids within `hops` edges of `rootId` (root included). */
export function neighborhood(graph: CaseGraph, rootId: string, hops: number): Set<string> {
  const near = new Set<string>([rootId]);
  let frontier = [rootId];
  for (let step = 0; step < hops && frontier.length > 0; step++) {
    const next: string[] = [];
    for (const edge of graph.edges) {
      if (near.has(edge.from) && !near.has(edge.to) && frontier.includes(edge.from)) {
        near.add(edge.to);
        next.push(edge.to);
      } else if (near.has(edge.to) && !near.has(edge.from) && frontier.includes(edge.to)) {
        near.add(edge.from);
        next.push(edge.from);
      }
    }
    frontier = next;
  }
  return near;
}

export interface VisibleOpts {
  hiddenChips: ReadonlySet<ChipKey>;
  /** null = focus off (or no selection to focus on). */
  focusRoot: string | null;
  hops: number;
}

/** The visible node-id set: kind filter ∩ neighborhood focus. The focus root
 *  itself always survives the kind filter — hiding the node you focused on
 *  reads as a bug, not a filter. */
export function visibleNodeIds(graph: CaseGraph, opts: VisibleOpts): Set<string> {
  const focus = opts.focusRoot !== null ? neighborhood(graph, opts.focusRoot, opts.hops) : null;
  const out = new Set<string>();
  for (const node of graph.nodes) {
    if (focus && !focus.has(node.id)) continue;
    if (opts.hiddenChips.has(CHIP_OF_KIND[node.kind]) && node.id !== opts.focusRoot) continue;
    out.add(node.id);
  }
  return out;
}

/** An edge shows only when both of its ends do. */
export function edgeVisible(edge: GraphEdge, visible: ReadonlySet<string>): boolean {
  return visible.has(edge.from) && visible.has(edge.to);
}

export interface Cluster {
  headId: string;
  title: string;
  /** headId + downstream members, in discovery order. */
  memberIds: string[];
}

/** Question clusters for the frames: each question owns what hangs off it —
 *  directed BFS over outgoing edges, stopping at documents, facts, and other
 *  questions (those are shared ground, not cluster property). A node reachable
 *  from two questions goes to the first one in node order. */
export function questionClusters(graph: CaseGraph): Cluster[] {
  const outOf = new Map<string, GraphEdge[]>();
  for (const edge of graph.edges) {
    if (!outOf.has(edge.from)) outOf.set(edge.from, []);
    outOf.get(edge.from)!.push(edge);
  }
  const kindOf = new Map(graph.nodes.map((n) => [n.id, n.kind]));
  const claimed = new Set<string>();
  const clusters: Cluster[] = [];
  for (const node of graph.nodes) {
    if (node.kind !== 'question') continue;
    const members: string[] = [node.id];
    const queue = [node.id];
    while (queue.length > 0) {
      const at = queue.shift()!;
      for (const edge of outOf.get(at) ?? []) {
        const kind = kindOf.get(edge.to);
        if (!kind || kind === 'document' || kind === 'fact' || kind === 'question') continue;
        if (claimed.has(edge.to) || members.includes(edge.to)) continue;
        members.push(edge.to);
        queue.push(edge.to);
      }
    }
    for (const id of members) claimed.add(id);
    clusters.push({ headId: node.id, title: node.title, memberIds: members });
  }
  return clusters;
}

// ---- observable scope state ----------------------------------------------

const STORE_KEY = 'kildeverket-scope';

export interface ScopeState {
  focusOn: boolean;
  hops: number;
  hiddenChips: Set<ChipKey>;
  framesOn: boolean;
  jumpFocuses: boolean;
}

function loadStored(): Partial<ScopeState> & { hiddenChips?: ChipKey[] } {
  try {
    return JSON.parse(localStorage.getItem(STORE_KEY) ?? '{}');
  } catch {
    return {};
  }
}

const stored = typeof localStorage === 'undefined' ? {} : loadStored();

export const scope: ScopeState = observable(
  {
    focusOn: stored.focusOn ?? false,
    hops: stored.hops ?? 2,
    hiddenChips: new Set<ChipKey>(stored.hiddenChips ?? []),
    framesOn: stored.framesOn ?? false,
    jumpFocuses: stored.jumpFocuses ?? false,
  },
  {},
  { deep: false },
);

/** Every write funnels through this so the bar re-reads and the state sticks
 *  across a reload (a play session spans reloads — same rule as drafts). */
export function setScope(patch: Partial<ScopeState>): void {
  Object.assign(scope, patch);
  // A Set mutation doesn't swap the ref — clone so the autorun sees a write.
  if (patch.hiddenChips) scope.hiddenChips = new Set(patch.hiddenChips);
  try {
    localStorage.setItem(
      STORE_KEY,
      JSON.stringify({ ...scope, hiddenChips: [...scope.hiddenChips] }),
    );
  } catch {
    /* storage full/blocked — scoping still works, it just won't persist */
  }
}

export function toggleChip(key: ChipKey): void {
  const next = new Set(scope.hiddenChips);
  if (next.has(key)) next.delete(key);
  else next.add(key);
  setScope({ hiddenChips: next });
}

// ---- DOM wiring -----------------------------------------------------------

const SVG_NS = 'http://www.w3.org/2000/svg';
const FRAME_PAD = 16;

let bar: HTMLElement;
let framesSvg: SVGSVGElement;
let clusters: Cluster[] = [];
let lastVisible: Set<string> = new Set();

export function initScope(opts: { bar: HTMLElement; framesSvg: SVGSVGElement }): void {
  bar = opts.bar;
  framesSvg = opts.framesSvg;
  bar.addEventListener('click', (event) => {
    const btn = (event.target as HTMLElement).closest<HTMLElement>('[data-act]');
    if (!btn) return;
    const act = btn.dataset.act!;
    if (act === 'focus') setScope({ focusOn: !scope.focusOn });
    else if (act === 'hops') setScope({ hops: (scope.hops % 3) + 1 });
    else if (act === 'frames') setScope({ framesOn: !scope.framesOn });
    else if (act === 'jump-focus') setScope({ jumpFocuses: !scope.jumpFocuses });
    else if (act === 'chip') toggleChip(btn.dataset.chip as ChipKey);
    else if (act === 'clear') setScope({ focusOn: false, hiddenChips: new Set(), framesOn: false });
  });
}

/** The full scoping pass: recompute the visible set, hide/show node and edge
 *  DOM, redraw the frames, rewrite the bar. Runs from main's autorun (scope
 *  state, selection, or a rebuild's fresh DOM) and after mode switches. */
export function applyScope(): void {
  const graph = model.state.graph;
  const focusRoot = scope.focusOn ? model.ui.selectedId : null;
  lastVisible = visibleNodeIds(graph, {
    hiddenChips: scope.hiddenChips,
    focusRoot,
    hops: scope.hops,
  });
  for (const [id, el] of render.nodeEls) el.classList.toggle('scoped-out', !lastVisible.has(id));
  for (const [edge, els] of render.edgeEls) {
    const off = !edgeVisible(edge, lastVisible);
    els.path.classList.toggle('scoped-out', off);
    els.hit.classList.toggle('scoped-out', off);
    if (off) els.text.style.display = 'none';
  }
  clusters = scope.framesOn ? questionClusters(graph) : [];
  syncFrames();
  renderBar(graph, focusRoot);
}

/** Frame geometry only — cheap enough for every sim frame / drag move. */
export function syncFrames(): void {
  while (framesSvg.firstChild) framesSvg.firstChild.remove();
  if (!scope.framesOn) return;
  framesSvg.setAttribute('width', String(layout.extent.width));
  framesSvg.setAttribute('height', String(layout.extent.height));
  for (const cluster of clusters) {
    const nodes = cluster.memberIds
      .filter((id) => lastVisible.has(id))
      .map((id) => model.state.nodeById.get(id))
      .filter((n): n is GraphNode => n !== undefined);
    if (nodes.length < 2) continue;
    const x0 = Math.min(...nodes.map((n) => n.x)) - FRAME_PAD;
    const y0 = Math.min(...nodes.map((n) => n.y)) - FRAME_PAD - 10;
    const x1 = Math.max(...nodes.map((n) => n.x + NODE_W)) + FRAME_PAD;
    const y1 = Math.max(...nodes.map((n) => n.y + NODE_H)) + FRAME_PAD;
    const color = cssVar(KIND_VAR.question);
    const rect = document.createElementNS(SVG_NS, 'rect');
    rect.setAttribute('x', String(x0));
    rect.setAttribute('y', String(y0));
    rect.setAttribute('width', String(x1 - x0));
    rect.setAttribute('height', String(y1 - y0));
    rect.setAttribute('rx', '10');
    rect.setAttribute('class', 'frame');
    rect.style.stroke = color;
    const label = document.createElementNS(SVG_NS, 'text');
    label.setAttribute('x', String(x0 + 10));
    label.setAttribute('y', String(y0 - 6));
    label.setAttribute('class', 'frame-label');
    label.style.fill = color;
    label.textContent = cluster.title;
    framesSvg.append(rect, label);
  }
}

function renderBar(graph: CaseGraph, focusRoot: string | null): void {
  const total = graph.nodes.length;
  const shown = lastVisible.size;
  const chips = CHIP_KEYS.map((key) => {
    const off = scope.hiddenChips.has(key);
    const hue = key === 'weave' ? '--teal' : KIND_VAR[key as NodeKind];
    return `<button class="chip${off ? ' off' : ''}" data-act="chip" data-chip="${key}"
      title="show/hide every ${key} node"><span class="dot" style="background:var(${hue})"></span>${CHIP_LABEL[key]}</button>`;
  }).join('');
  const focusHint =
    scope.focusOn && focusRoot === null ? `<span class="hint">select a node to focus</span>` : '';
  const scoped = shown < total;
  bar.innerHTML = `
    <button class="${scope.focusOn ? 'active' : ''}" data-act="focus"
      title="show only the selected node's neighborhood">focus</button>
    <button data-act="hops" title="neighborhood radius — click to cycle">${scope.hops} hop${scope.hops > 1 ? 's' : ''}</button>
    ${focusHint}
    <span class="ssep"></span>
    ${chips}
    <span class="ssep"></span>
    <button class="${scope.framesOn ? 'active' : ''}" data-act="frames"
      title="outline each question's cluster">frames</button>
    <button class="${scope.jumpFocuses ? 'active' : ''}" data-act="jump-focus"
      title="a ⌘K jump lands in focus mode">⌘K→focus</button>
    <span class="scount${scoped ? ' scoped' : ''}">${shown}/${total}</span>
    ${scoped ? `<button data-act="clear" title="drop every scope">show all</button>` : ''}`;
  document.body.classList.toggle('scope-active', scoped);
}

/** Exported for the smoke test — the set the last pass showed. */
export function visibleNow(): ReadonlySet<string> {
  return lastVisible;
}
