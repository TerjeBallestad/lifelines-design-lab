// SB-026 probe — Canvas view generated from the real 0.2 compiler output.
// Grown into the lab's authoring shell (DD-003: the canvas is the editor,
// the markup stays the store). SB-075 split the monolith along its seams:
//
//   model.ts        the markup buffer, drafts, and everything a compile derives
//   layout-modes.ts sticky positions, the three layout modes, the force sim
//   render.ts       board DOM — nodes, edges, legend (interactions injected)
//   camera.ts       pan / zoom / fit / screen→world
//   editing.ts      every buffer write: fields, edges, lifecycle, save POST
//   inspector.ts    per-kind forms, relation rows, delete confirm
//   kinds.ts        kind labels/colors/prefixes/form specs
//   relations.ts    drag legality table + condition-term algebra
//
// This file is the shell: DOM refs, the script lens and its cross-jump
// (SB-041), selection, drags, the create menu, the worklist panel, the
// status bar, wiring, and boot. It re-exports the probe surface the smoke
// tests drive.
import { action, autorun, observable, reaction } from 'mobx';
import { html, render as litRender, nothing } from 'lit-html';
import { NODE_W, NODE_H } from './graph.ts';
import type { GraphEdge, NodeKind, NodePos } from './graph.ts';
import { KIND_LABEL, KIND_VAR, EDGE_VAR, cssVar } from './kinds.ts';
import { RELATION, birthKinds as relationBirthKinds } from './relations.ts';
import * as model from './model.ts';
import * as layout from './layout-modes.ts';
import type { LayoutMode } from './layout-modes.ts';
import { forceEngine, setForceEngine, dragReheat } from './force.ts';
import * as render from './render.ts';
import * as editing from './editing.ts';
import * as inspector from './inspector.ts';
import { createCamera } from './camera.ts';
import { mountScriptLens } from '../script-editor/lens.ts';
import { buildSymbols } from '../script-editor/symbols.ts';
import { initPreview } from './preview.ts';
import { initJump } from './jump.ts';
import { buildWorklist } from './worklist.ts';
import type { WorklistEntry, WorklistGroup } from './worklist.ts';

// ---- the probe surface the smoke tests drive ------------------------------

export { DRAFT_KEY, getCaseText, graph } from './model.ts';
export { POS_KEY, layoutMode } from './layout-modes.ts';
export { RELATION, condAddTerm, condRemoveTerm } from './relations.ts';
export type { RelationSpec, EdgeWriteResult, CreateResult, RefHit } from './relations.ts';
export {
  connect,
  disconnect,
  createNode,
  liftAsFact,
  createFromStub,
  duplicateNode,
  requestDelete,
  confirmDelete,
  cancelDelete,
} from './editing.ts';

/** Kinds a drag from `kind` may give birth to (pre-split signature). */
export function birthKinds(kind: NodeKind): NodeKind[] {
  return relationBirthKinds(kind, Object.keys(KIND_LABEL) as NodeKind[]);
}

// ---- DOM ------------------------------------------------------------------

const $ = (id: string) => document.getElementById(id) as HTMLElement;
const viewport = $('viewport');
const world = $('world');
const edgesSvg = $('edges') as unknown as SVGSVGElement;
const nodesHost = $('nodes');
const inspectorBody = $('inspector-body');
const statusbar = $('statusbar');
const counts = $('counts');

// SB-055: the game-surface preview above the inspector. Deferred getters —
// `result` is assigned by the first rebuild() before any selection exists.
const previewApi = initPreview({
  host: $('preview'),
  titleEl: $('preview-title'),
  lightbox: $('doc-lightbox'),
  getResult: () => model.state.result,
  onJump: (id) => {
    if (!model.state.nodeById.has(id)) return;
    select(id);
    camera.centerOn(id);
  },
});

// SB-055 follow-up: ⌘K fuzzy jump — type an id, a title, or content text;
// Enter selects and centers. Stubs are listed too; jumping shows the ghost.
// The content text also feeds the palette's expanded active row, so a hit
// past the title ("politi" deep in a document body) is visible immediately.
function jumpTextOf(node: { id: string; kind: NodeKind }): string {
  const { slice, labContent } = model.state.result;
  switch (node.kind) {
    case 'fact': {
      const f = slice.facts.find((x) => x.id === node.id);
      return f ? [f.summary, f.quote, f.category, f.domain].filter(Boolean).join('\n') : '';
    }
    case 'document': {
      const d = labContent.documents[node.id];
      if (!d) return '';
      const body = d.blocks.map((b) => b.runs.map((r) => r.text).join('')).join('\n');
      return [d.peek, d.meta, body].filter(Boolean).join('\n');
    }
    case 'question': {
      const q = slice.questions.find((x) => x.id === node.id);
      return q ? [q.prompt, q.teaser, q.frank_response].filter(Boolean).join('\n') : '';
    }
    case 'hypothesis': {
      const h = slice.hypotheses.find((x) => x.id === node.id);
      return h?.summary ?? '';
    }
    case 'tiltak': {
      const t = slice.tiltak.find((x) => x.id === node.id);
      return t?.description ?? '';
    }
    case 'dispatch': {
      const d = slice.dispatches.find((x) => x.id === node.id);
      return d ? [d.description, d.activity_title].filter(Boolean).join('\n') : '';
    }
    case 'clock': {
      const c = slice.clocks.find((x) => x.id === node.id);
      return c
        ? [c.question, c.good_segment_label, c.bad_segment_label].filter(Boolean).join('\n')
        : '';
    }
    default:
      return '';
  }
}

initJump({
  overlay: $('jump'),
  input: $('jump-input') as HTMLInputElement,
  list: $('jump-list'),
  getNodes: () => model.state.graph.nodes.map((n) => ({ ...n, text: jumpTextOf(n) })),
  onPick: (id) => {
    if (!model.state.nodeById.has(id)) return;
    select(id);
    camera.centerOn(id);
  },
});

// ---- script lens (SB-041): the second surface over the same buffer --------

// Typing in the script pane debounce-recompiles (150 ms) and stashes the
// shared draft (300 ms) — the same rhythm as the standalone script page.
// A canvas commit pushed back via setText() arrives tagged external and is
// skipped here: the buffer already carries it, recompiling would echo.
let lensCompileTimer: ReturnType<typeof setTimeout> | undefined;
let lensDraftTimer: ReturnType<typeof setTimeout> | undefined;

// ---- cross-jump both ways (SB-041 task 3, SB-040 ruling 1) ---------------
//
// Canvas → script: a real node selection scrolls the lens to the block's
// heading WITHOUT stealing keyboard focus (scrollToLine). Script → canvas:
// the debounced cursor-line callback resolves the enclosing block and
// selects + centers it. Bounce guard: each direction sets a one-shot flag
// the other consumes — one jump per user action, settling in one step.
/** Dedupe: the block the lens cursor last reported — typing inside one
 *  block must not re-center the canvas on every keystroke. */
let lastCursorBlockId: string | null = null;
/** A canvas-initiated scrollToLine moves the lens selection, which fires
 *  the cursor callback ~80ms later — this flag swallows that echo. */
let suppressCursorEcho = false;
/** A script-initiated select() must not scroll the script pane back. */
let scriptDrivenSelect = false;

/** The block whose section encloses a 1-based lens line, or null. */
function blockIdAtLine(line: number): string | null {
  let hit: string | null = null;
  for (const h of model.state.crossJumpHeadings)
    if (h.id !== '' && h.line <= line && line <= h.endLine) hit = h.id;
  return hit;
}

/** Pull the lens doc into the buffer — the caseText reaction rebuilds
 *  (sticky — SB-034). An unchanged doc is a no-op, as is an unchanged
 *  compile. */
function syncFromLens(): void {
  clearTimeout(lensCompileTimer);
  lensCompileTimer = undefined;
  model.setCaseText(scriptLens.getText());
}

export const scriptLens = mountScriptLens({
  parent: $('script-pane'),
  doc: model.getCaseText(),
  onDocChanged: ({ external }) => {
    if (external) return; // canvas commit round-trip — already compiled
    clearTimeout(lensCompileTimer);
    lensCompileTimer = setTimeout(syncFromLens, 150);
    clearTimeout(lensDraftTimer);
    lensDraftTimer = setTimeout(() => {
      localStorage.setItem(model.DRAFT_KEY, scriptLens.getText());
    }, 300);
  },
  onCursorLineChanged: (line) => {
    const id = blockIdAtLine(line);
    if (suppressCursorEcho) {
      // The echo of a canvas-initiated jump — track the block, don't jump back.
      suppressCursorEcho = false;
      lastCursorBlockId = id;
      return;
    }
    if (id === lastCursorBlockId) return; // still inside the same block
    lastCursorBlockId = id;
    if (id === null || id === model.ui.selectedId || !model.state.nodeById.has(id)) return;
    scriptDrivenSelect = true;
    try {
      select(id);
      camera.centerOn(id);
    } finally {
      scriptDrivenSelect = false;
    }
  },
  onSaveRequested: () => {
    // ⌘S in the lens: flush any pending recompile so persist() posts the
    // exact buffer on screen, then save through the shared pipeline.
    if (lensCompileTimer !== undefined) syncFromLens();
    void editing.persist();
  },
  onLiftFact: ({ documentId, quote }) => {
    // SB-043: a pending lens edit must land first — the lift patches the buffer.
    if (lensCompileTimer !== undefined) syncFromLens();
    const res = editing.liftAsFact(documentId, quote);
    if (!res.ok && res.reason) showTip(res.reason, viewport.clientWidth / 2, 80);
  },
});

$('toggle-script').addEventListener('click', () => {
  $('app').classList.toggle('script-collapsed');
});

// ---- camera ---------------------------------------------------------------

const camera = createCamera({
  viewport,
  world,
  zoomLabel: $('z-pct'),
  getNodes: () => model.state.graph.nodes,
  getNode: (id) => model.state.nodeById.get(id),
  onBackgroundClick: () => select(null),
});

// ---- rebuild orchestration ------------------------------------------------

// SB-078: rebuild is one action — the status/worklist/inspector/highlight
// autoruns at the bottom of this file fire once at its end, over a
// consistent compile. It runs off the reaction on state.caseText; nothing
// calls it directly except boot.
const ui = observable({ compileMs: 0 });

const rebuild = action(function rebuild(): void {
  const t0 = performance.now();
  model.recompile();
  // Layout per mode (SB-051). Hand: sticky positions, rebuilds must never
  // reshuffle the board (SB-034). Gravity/pin: the force sim reseeds from
  // its own live positions, so a rebuild is a shiver, not a jump.
  layout.applyLayout();
  ui.compileMs = Math.round(performance.now() - t0);

  model.deriveIndexes();

  render.renderWorld();
  // Selection survives the rebuild; a node the edit removed clears it.
  if (model.ui.selectedId !== null && !model.state.nodeById.has(model.ui.selectedId))
    model.setSelected(null);

  // SB-041: feed the lens fresh compile context — headings for folding/jump,
  // symbols for autocomplete/hover/goto-def, diagnostics for lint squiggles.
  scriptLens.update({
    headings: model.state.crossJumpHeadings,
    symbols: buildSymbols(model.state.result, model.state.crossJumpHeadings),
    diagnostics: model.state.result.diagnostics,
  });
});

// ---- selection -----------------------------------------------------------
//
// SB-078: the selection lives in model.ui; these are thin wrappers plus the
// style pass the highlight autorun (and a re-render after relayout) runs.

// Probe-surface mirrors of model.ui — the smoke tests read them as live
// module bindings. A dedicated autorun at the bottom keeps them current.
export let selectedId: string | null = null;
export let selectedEdgeKey: string | null = null;

export function select(id: string | null): void {
  model.setSelected(id);
}

export const edgeKeyOf = (edge: GraphEdge): string => `${edge.from}→${edge.to}·${edge.label}`;

/** Select an edge (clears any node selection). Delete/Backspace removes it. */
export function selectEdge(key: string | null): void {
  model.setSelectedEdge(key);
}

/** Highlight pass: body class, lit neighborhood, edge selection styling.
 *  Runs as an autorun (selection or compile changed) and imperatively after
 *  a relayout/mode switch rebuilds the board DOM under an unchanged graph. */
function applySelectionStyles(): void {
  const id = model.ui.selectedId;
  const edgeKey = model.ui.selectedEdgeKey;
  document.body.classList.toggle('has-selection', id !== null);
  const lit = new Set<string>();
  const litEdges = new Set<GraphEdge>();
  if (id) {
    lit.add(id);
    for (const edge of model.state.outOf.get(id) ?? []) {
      lit.add(edge.to);
      litEdges.add(edge);
    }
    for (const edge of model.state.inOf.get(id) ?? []) {
      lit.add(edge.from);
      litEdges.add(edge);
    }
  }
  for (const [nodeId, el] of render.nodeEls) {
    el.classList.toggle('lit', lit.has(nodeId));
    el.classList.toggle('selected', nodeId === id);
  }
  for (const [edge, els] of render.edgeEls) {
    const on = litEdges.has(edge);
    els.path.classList.toggle('lit', on);
    els.path.style.stroke = on ? cssVar(EDGE_VAR[edge.label.split(' ')[0]] ?? '--text-3') : '';
    els.text.style.display = on && edge.label ? '' : 'none';
    els.path.classList.toggle('edge-selected', edgeKeyOf(edge) === edgeKey);
  }
}

// ---- layout controls ------------------------------------------------------

/** 're-layout' — forget placement in the current mode, lay out again, refit. */
export function relayout(): void {
  layout.relayoutState();
  render.renderWorld();
  applySelectionStyles();
  camera.fit();
}

function reflectModeButtons(): void {
  (['hand', 'gravity', 'pin'] as LayoutMode[]).forEach((mode) => {
    document.getElementById(`m-${mode}`)?.classList.toggle('active', mode === layout.layoutMode);
  });
}

export function setLayoutMode(mode: LayoutMode): void {
  if (mode === layout.layoutMode) return;
  layout.setModeState(mode);
  reflectModeButtons();
  render.renderWorld();
  applySelectionStyles();
  camera.fit();
}

// ---- drop-create menu (SB-042) --------------------------------------------

// SB-040 ruling 2 killed the bare 'n → blank form' create. The canvas's
// native create gesture is drag-wire-to-empty: release a port drag on empty
// canvas → a menu of the kinds legal from that port → the node lands at the
// drop point, wired, focus in its first field. Document creation lives on
// the script lens (script creates by naming).
const createMenu = document.createElement('div');
createMenu.id = 'create-menu';
document.body.append(createMenu);

export function closeCreateMenu(): void {
  createMenu.classList.remove('show');
  litRender(nothing, createMenu);
}

/** Create + wire + focus, per the menu pick. Exported for the smoke test. */
export function dropCreate(
  fromId: string,
  kind: NodeKind,
  at: NodePos,
): ReturnType<typeof editing.createNode> {
  const from = model.state.nodeById.get(fromId);
  if (!from) return { ok: false, reason: 'unknown node' };
  const res = editing.createNode(kind, {
    at,
    documentId: from.kind === 'document' && kind === 'fact' ? fromId : undefined,
  });
  if (!res.ok || !res.id) return res;
  if (RELATION[`${from.kind}→${kind}`]) {
    const wired = editing.connect(fromId, res.id);
    if (!wired.ok) return { ok: false, id: res.id, reason: wired.reason };
  }
  return res;
}

export function openDropCreateMenu(fromId: string, clientX: number, clientY: number): void {
  const from = model.state.nodeById.get(fromId);
  if (!from) return;
  const kinds = birthKinds(from.kind);
  if (kinds.length === 0) {
    showTip(
      `${KIND_LABEL[from.kind]} is an endpoint — no node can be born from its port`,
      clientX,
      clientY,
    );
    return;
  }
  const at = camera.toWorldPoint(clientX, clientY);
  const pick = (kind: NodeKind) => {
    closeCreateMenu();
    const res = dropCreate(fromId, kind, at);
    if (!res.ok && res.reason) showTip(res.reason, clientX, clientY);
  };
  litRender(
    html`<div class="cm-head">NEW FROM ${fromId.toUpperCase()}</div>
      ${kinds.map(
        (kind) =>
          html`<button
            class="cm-item"
            data-mk="${kind}"
            style="color:var(${KIND_VAR[kind]})"
            @click=${() => pick(kind)}
          >
            ${KIND_LABEL[kind]}
          </button>`,
      )}`,
    createMenu,
  );
  createMenu.style.left = `${clientX + 4}px`;
  createMenu.style.top = `${clientY + 4}px`;
  createMenu.classList.add('show');
}

// A pointerdown anywhere outside the menu dismisses it (the opening gesture
// ended on pointerup, so this never races the open). Esc dismisses too.
document.addEventListener('pointerdown', (event) => {
  if (event.target instanceof Element && event.target.closest('#create-menu')) return;
  closeCreateMenu();
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeCreateMenu();
});

// ---- drag-to-connect UI ---------------------------------------------------

const SVG_NS = 'http://www.w3.org/2000/svg';
const tip = document.createElement('div');
tip.id = 'cursor-tip';
document.body.append(tip);
let tipTimer: ReturnType<typeof setTimeout> | undefined;

function showTip(text: string, x: number, y: number): void {
  tip.textContent = text;
  tip.style.left = `${x + 12}px`;
  tip.style.top = `${y + 12}px`;
  tip.classList.add('show');
  clearTimeout(tipTimer);
  tipTimer = setTimeout(() => tip.classList.remove('show'), 2600);
}

let linkDrag: { fromId: string; rubber: SVGPathElement } | null = null;

function startLink(fromId: string, clientX: number, clientY: number): void {
  const rubber = document.createElementNS(SVG_NS, 'path');
  rubber.setAttribute('class', 'rubber');
  edgesSvg.append(rubber);
  linkDrag = { fromId, rubber };
  updateLink(clientX, clientY);
}

function updateLink(clientX: number, clientY: number): void {
  if (!linkDrag) return;
  const from = model.state.nodeById.get(linkDrag.fromId);
  if (!from) return;
  const sx = from.x + NODE_W;
  const sy = from.y + NODE_H / 2;
  const { x, y } = camera.toWorldPoint(clientX, clientY);
  const reach = Math.max(Math.abs(x - sx) / 2, 44) * (x >= sx ? 1 : -1);
  linkDrag.rubber.setAttribute(
    'd',
    `M ${sx} ${sy} C ${sx + reach} ${sy}, ${x - reach} ${y}, ${x} ${y}`,
  );
}

window.addEventListener('pointermove', (event) => {
  if (linkDrag) updateLink(event.clientX, event.clientY);
});

window.addEventListener('pointerup', (event) => {
  if (!linkDrag) return;
  const drag = linkDrag;
  linkDrag = null;
  drag.rubber.remove();
  const targetEl =
    event.target instanceof Element ? event.target.closest<HTMLElement>('.node') : null;
  const toId = targetEl?.dataset.id;
  if (!toId) {
    // SB-042: released on empty canvas → the filtered create menu.
    const onCanvas = event.target instanceof Element && event.target.closest('#viewport');
    if (onCanvas) openDropCreateMenu(drag.fromId, event.clientX, event.clientY);
    return;
  }
  if (toId === drag.fromId) return;
  const res = editing.connect(drag.fromId, toId);
  if (!res.ok && res.reason) showTip(res.reason, event.clientX, event.clientY);
});

// ---- node move drag (SB-051) ----------------------------------------------

let moveDrag: {
  id: string;
  startX: number;
  startY: number;
  lastX: number;
  lastY: number;
  moved: boolean;
} | null = null;
/** Set when a drag moved the node — the click that follows must not select. */
let suppressNextClick = false;

function startMove(id: string, clientX: number, clientY: number): void {
  moveDrag = { id, startX: clientX, startY: clientY, lastX: clientX, lastY: clientY, moved: false };
}

window.addEventListener('pointermove', (event) => {
  if (!moveDrag) return;
  const node = model.state.nodeById.get(moveDrag.id);
  if (!node) {
    moveDrag = null;
    return;
  }
  if (!moveDrag.moved) {
    // 4px threshold in screen space: below it this is a click, not a drag.
    if (Math.hypot(event.clientX - moveDrag.startX, event.clientY - moveDrag.startY) <= 4) return;
    moveDrag.moved = true;
  }
  node.x += (event.clientX - moveDrag.lastX) / camera.zoom;
  node.y += (event.clientY - moveDrag.lastY) / camera.zoom;
  moveDrag.lastX = event.clientX;
  moveDrag.lastY = event.clientY;
  const sim = layout.getSim();
  if (sim) {
    const sn = sim.byId.get(moveDrag.id);
    if (sn) {
      sn.held = true;
      sn.x = node.x;
      sn.y = node.y;
    }
    sim.reheat(dragReheat());
    layout.startSimLoop();
  }
  render.syncPositions();
});

window.addEventListener('pointerup', () => {
  if (!moveDrag) return;
  const { id, moved } = moveDrag;
  moveDrag = null;
  if (!moved) return;
  suppressNextClick = true;
  if (layout.layoutMode === 'hand') {
    layout.savePositions();
    return;
  }
  const sim = layout.getSim();
  const sn = sim?.byId.get(id);
  if (!sim || !sn) return;
  sn.held = false;
  if (layout.layoutMode === 'pin') {
    sn.pinned = true;
    render.nodeEls.get(id)?.classList.add('pinned');
    layout.persistPins();
  }
  sim.reheat(dragReheat());
  layout.startSimLoop();
});

/** Pin mode: double-click a pinned node to let it float again. */
function unpin(id: string): void {
  const sim = layout.getSim();
  if (layout.layoutMode !== 'pin' || !sim) return;
  const sn = sim.byId.get(id);
  if (!sn?.pinned) return;
  sn.pinned = false;
  render.nodeEls.get(id)?.classList.remove('pinned');
  layout.persistPins();
  sim.reheat(dragReheat());
  layout.startSimLoop();
}

document.addEventListener('keydown', (event) => {
  if (event.key !== 'Delete' && event.key !== 'Backspace') return;
  // Typing surfaces own these keys: inspector fields and the script lens.
  if (event.target instanceof HTMLElement && event.target.closest('.fval, #script-pane')) return;
  const edgeKey = model.ui.selectedEdgeKey;
  if (edgeKey !== null) {
    const edge = model.state.graph.edges.find((e) => edgeKeyOf(e) === edgeKey);
    if (!edge) return;
    const res = editing.disconnect(edge);
    if (res.ok) {
      model.setSelectedEdge(null);
    } else if (res.reason) {
      showTip(res.reason, viewport.clientWidth / 2, viewport.clientHeight / 2);
    }
    return;
  }
  // SB-034: Delete on a selected node starts the (reference-aware) delete.
  if (model.ui.selectedId !== null) editing.requestDelete(model.ui.selectedId);
});

$('z-in').addEventListener('click', camera.zoomIn);
$('z-out').addEventListener('click', camera.zoomOut);
$('z-fit').addEventListener('click', camera.fit);
$('z-layout')?.addEventListener('click', relayout);
// SB-051: the three layout candidates behind one toggle.
(['hand', 'gravity', 'pin'] as LayoutMode[]).forEach((mode) => {
  document.getElementById(`m-${mode}`)?.addEventListener('click', () => setLayoutMode(mode));
});
reflectModeButtons();
// SB-080 A/B: swap the force engine under the current cloud. The live sim's
// positions seed the next one (applyLayout), so the board holds still and
// only the motion character changes — that is the thing under judgment.
const engineBtn = document.getElementById('f-engine');
function reflectEngineButton(): void {
  if (engineBtn) engineBtn.textContent = forceEngine === 'd3' ? 'sim: d3' : 'sim: old';
}
engineBtn?.addEventListener('click', () => {
  setForceEngine(forceEngine === 'd3' ? 'legacy' : 'd3');
  reflectEngineButton();
  if (layout.layoutMode !== 'hand') {
    layout.applyLayout();
    render.renderWorld();
    applySelectionStyles();
  }
});
reflectEngineButton();
document.addEventListener('keydown', (event) => {
  // Esc while typing — inspector field OR the script lens — must not clear
  // the canvas selection mid-thought (SB-041); Esc on the canvas side clears.
  const inTypingSurface =
    event.target instanceof HTMLElement && event.target.closest('.fval, #script-pane');
  if (event.key === 'Escape' && !inTypingSurface) select(null);
});

// ---- loose-end worklist (SB-044) -----------------------------------------

// One panel over the canvas listing every dangling end — stubs (SB-040
// ruling 2), empty required fields, compiler diagnostics — each row a jump.
// The count lives on the topbar toggle, chrome-styled like `script pane`.
const worklistPanel = $('worklist');
const worklistBody = $('worklist-body');
const worklistToggle = $('toggle-worklist');
export let worklist: WorklistEntry[] = [];

const GROUP_LABEL: Record<WorklistGroup, string> = {
  stub: 'STUBS',
  'empty-field': 'EMPTY FIELDS',
  diagnostic: 'DIAGNOSTICS',
};

worklistToggle.addEventListener('click', () => {
  worklistPanel.classList.toggle('show');
});

/**
 * Jump to a worklist entry: select + center the first subject that exists as
 * a node (SB-041 machinery — select() also scrolls the lens to the block),
 * then land the script lens on the exact diagnostic line. Entries with no
 * live node (case-level lints, weave lines) still jump in the script.
 */
export function jumpToWorklistEntry(entry: WorklistEntry): void {
  const id = entry.subjectIds.find((subjectId) => model.state.nodeById.has(subjectId));
  if (id) {
    select(id);
    camera.centerOn(id);
  }
  suppressCursorEcho = true;
  scriptLens.scrollToLine(
    id ? (model.state.blockById.get(id)?.startLine ?? entry.line) : entry.line,
  );
}

function renderWorklist(): void {
  worklist = buildWorklist(model.state.result.diagnostics, [...model.state.blockById.values()]);
  worklistToggle.textContent = `loose ends · ${worklist.length}`;
  worklistToggle.classList.toggle('has-loose', worklist.length > 0);

  const groups = (Object.keys(GROUP_LABEL) as WorklistGroup[])
    .map((group) => ({
      group,
      rows: worklist
        .map((entry, index) => ({ entry, index }))
        .filter((r) => r.entry.group === group),
    }))
    .filter((g) => g.rows.length > 0);

  litRender(
    groups.length === 0
      ? html`<div class="empty">No loose ends — every thread is tied.</div>`
      : groups.map(
          ({ group, rows }) =>
            html`<div class="sect">${GROUP_LABEL[group]} · ${rows.length}</div>
              ${rows.map(
                ({ entry, index }) =>
                  html`<div
                    class="wl-row s-${entry.severity}"
                    data-wi="${index}"
                    @click=${() => jumpToWorklistEntry(entry)}
                  >
                    <span class="dcode">${entry.code}</span>
                    <span class="wmsg">${entry.message}</span>
                  </div>`,
              )}`,
        ),
    worklistBody,
  );
}

// ---- status bar ----------------------------------------------------------

function renderStatus(): void {
  const warnings = model.state.result.diagnostics.filter((d) => d.severity === 'warning').length;
  const errors = model.state.result.diagnostics.filter((d) => d.severity === 'error').length;
  const todos = model.state.result.diagnostics.filter((d) => d.code === 'todo-line').length;
  const quiet = model.state.result.diagnostics.find((d) => d.code === 'lint-quiet-day');
  const quietDays = quiet?.message.match(/quiet days?\s+([\d,\s]+\d)/i)?.[1].replace(/\s+/g, ' ');

  counts.textContent = `${model.state.graph.nodes.length} nodes · ${model.state.graph.edges.length} edges`;
  litRender(
    html`
      <span class="${errors ? 'warn-c' : 'ok'}"
        >compiled ${ui.compileMs}ms${errors ? ` · ${errors} errors` : ''}</span
      >
      <span>${model.state.graph.nodes.length} nodes · ${model.state.graph.edges.length} edges</span>
      ${warnings ? html`<span class="warn-c">${warnings} warnings</span>` : nothing}
      ${todos ? html`<span class="warn-c">${todos} TODO</span>` : nothing}
      ${quietDays ? html`<span class="pacing">pacing — day ${quietDays} quiet</span>` : nothing}
      ${model.state.draftRestored
        ? html`<span class="warn-c">restored unsaved draft</span>`
        : nothing}
      ${editing.notes.save
        ? html`<span class="${editing.notes.save.startsWith('saved') ? 'ok' : 'warn-c'}"
            >${editing.notes.save}</span
          >`
        : nothing}
      ${editing.notes.lifecycle
        ? html`<span class="warn-c">${editing.notes.lifecycle}</span>`
        : nothing}
      ${model.ui.selectedEdgeKey
        ? html`<span class="warn-c">edge selected — delete removes the relation</span>`
        : nothing}
      <span class="hint"
        >${layout.layoutUi.mode === 'hand'
          ? 'drag a node to place it · positions stick'
          : layout.layoutUi.mode === 'gravity'
            ? 'gravity — drag stirs, release floats'
            : 'gravity + pin — a drag pins the node, double-click frees it'}
        · drag port to empty space for new node · delete removes · esc clear</span
      >
    `,
    statusbar,
  );
}

// ---- wiring + boot --------------------------------------------------------

render.initRenderer({
  edgesSvg,
  nodesHost,
  handlers: {
    onSelectNode: select,
    onSelectEdge: selectEdge,
    onStartMove: startMove,
    onStartLink: startLink,
    onUnpin: unpin,
    consumeSuppressedClick: () => {
      if (suppressNextClick) {
        suppressNextClick = false;
        return true;
      }
      return false;
    },
    edgeKeyOf,
    selectedEdgeKey: () => model.ui.selectedEdgeKey,
  },
});
render.initLegend($('legend'));
layout.setFrameCallback(render.syncPositions);

editing.initEditing({
  syncLens: (text) => scriptLens.setText(text),
  clearLensDraftTimer: () => clearTimeout(lensDraftTimer),
  centerOn: (id) => camera.centerOn(id),
  focusFirstField: () =>
    inspectorBody.querySelector<HTMLInputElement | HTMLTextAreaElement>('.fval')?.focus(),
  focusLensLineEnd: (line) => scriptLens.focusLineEnd(line),
});

inspector.initInspector({
  inspectorBody,
  showPreview: (id, kind) => previewApi.show(id, kind),
  centerOn: (id) => camera.centerOn(id),
  showTip: (text) => showTip(text, viewport.clientWidth / 2, 80),
});

// The first compile runs imperatively; every later one rides the reaction.
rebuild();

// ---- the reactive spine (SB-078) ------------------------------------------
//
// Autoruns fire once at the end of the rebuild action (a consistent
// compile), and again on any selection / note / mode write. Registration
// order is the old call order inside select(): highlight, inspector,
// status, worklist, then the cross-jump — reactions run in that order.

// Probe-surface mirrors — assigned here only.
autorun(() => {
  selectedId = model.ui.selectedId;
  selectedEdgeKey = model.ui.selectedEdgeKey;
});

// Highlight: also touches the graph ref so a rebuild's fresh DOM restyles.
autorun(() => {
  void model.state.graph;
  applySelectionStyles();
});

// Inspector: the delete-confirm surface wins while a delete is pending
// (this dissolves the old showDeleteConfirm/onDeleteCancelled callbacks).
autorun(() => {
  if (editing.getPendingDelete() !== null) inspector.renderDeleteConfirm();
  else inspector.renderInspector(model.ui.selectedId);
});

autorun(renderStatus);
autorun(renderWorklist);

// The rebuild spine: every committed buffer swap recompiles. Field commits,
// edge writes, lifecycle, and lens typing all funnel through setCaseText.
reaction(
  () => model.state.caseText,
  () => rebuild(),
);

// SB-041 cross-jump, canvas → script: a real (changed, non-null) selection
// scrolls the lens to the block heading — no focus steal, so inspector
// typing keeps landing in the inspector. Script-driven selects skip this
// (bounce guard); a rebuild keeps the id, so it never re-fires this.
reaction(
  () => model.ui.selectedId,
  (id) => {
    if (id === null || scriptDrivenSelect) return;
    const block = model.state.blockById.get(id);
    if (block) {
      suppressCursorEcho = true;
      scriptLens.scrollToLine(block.startLine);
    }
  },
);

camera.fit();
