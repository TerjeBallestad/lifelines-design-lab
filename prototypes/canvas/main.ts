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
import { NODE_W, NODE_H } from './graph.ts';
import type { GraphEdge, NodeKind, NodePos } from './graph.ts';
import { KIND_LABEL, KIND_VAR, EDGE_VAR, cssVar, escapeHtml } from './kinds.ts';
import { RELATION, birthKinds as relationBirthKinds } from './relations.ts';
import * as model from './model.ts';
import * as layout from './layout-modes.ts';
import type { LayoutMode } from './layout-modes.ts';
import * as render from './render.ts';
import * as editing from './editing.ts';
import * as inspector from './inspector.ts';
import { createCamera } from './camera.ts';
import { mountScriptLens } from '../script-editor/lens.ts';
import { buildSymbols } from '../script-editor/symbols.ts';
import { initPreview } from './preview.ts';
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
  getResult: () => model.result,
  onJump: (id) => {
    if (!model.nodeById.has(id)) return;
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
  for (const h of model.crossJumpHeadings)
    if (h.id !== '' && h.line <= line && line <= h.endLine) hit = h.id;
  return hit;
}

/** Pull the lens doc into the buffer and rebuild (sticky — SB-034). */
function syncFromLens(): void {
  clearTimeout(lensCompileTimer);
  lensCompileTimer = undefined;
  model.setCaseText(scriptLens.getText());
  rebuild();
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
    if (id === null || id === selectedId || !model.nodeById.has(id)) return;
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
  getNodes: () => model.graph.nodes,
  getNode: (id) => model.nodeById.get(id),
  onBackgroundClick: () => select(null),
});

// ---- rebuild orchestration ------------------------------------------------

let compileMs = 0;

function rebuild(): void {
  const t0 = performance.now();
  model.recompile();
  // Layout per mode (SB-051). Hand: sticky positions, rebuilds must never
  // reshuffle the board (SB-034). Gravity/pin: the force sim reseeds from
  // its own live positions, so a rebuild is a shiver, not a jump.
  layout.applyLayout();
  compileMs = Math.round(performance.now() - t0);

  model.deriveIndexes();

  render.renderWorld();
  renderStatus();
  // Selection survives the rebuild; a node the edit removed clears it.
  select(selectedId !== null && model.nodeById.has(selectedId) ? selectedId : null);

  // SB-041: feed the lens fresh compile context — headings for folding/jump,
  // symbols for autocomplete/hover/goto-def, diagnostics for lint squiggles.
  scriptLens.update({
    headings: model.crossJumpHeadings,
    symbols: buildSymbols(model.result, model.crossJumpHeadings),
    diagnostics: model.result.diagnostics,
  });

  // SB-044: re-derive the loose-end worklist from the fresh compile.
  renderWorklist();
}

// ---- selection -----------------------------------------------------------

export let selectedId: string | null = null;

export function select(id: string | null): void {
  if (id !== null && selectedEdgeKey !== null) applyEdgeSelection(null);
  const changed = id !== selectedId;
  selectedId = id;
  document.body.classList.toggle('has-selection', id !== null);
  const lit = new Set<string>();
  const litEdges = new Set<GraphEdge>();
  if (id) {
    lit.add(id);
    for (const edge of model.outOf.get(id) ?? []) {
      lit.add(edge.to);
      litEdges.add(edge);
    }
    for (const edge of model.inOf.get(id) ?? []) {
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
  }
  inspector.renderInspector(id);
  // SB-041 cross-jump, canvas → script: a real (changed, non-null) selection
  // scrolls the lens to the block heading — no focus steal, so inspector
  // typing keeps landing in the inspector. Script-driven selects skip this
  // (bounce guard); rebuild's re-select of the same id skips via `changed`.
  if (id !== null && changed && !scriptDrivenSelect) {
    const block = model.blockById.get(id);
    if (block) {
      suppressCursorEcho = true;
      scriptLens.scrollToLine(block.startLine);
    }
  }
}

// ---- edge selection (SB-033) ---------------------------------------------

export let selectedEdgeKey: string | null = null;

export const edgeKeyOf = (edge: GraphEdge): string => `${edge.from}→${edge.to}·${edge.label}`;

function applyEdgeSelection(key: string | null): void {
  selectedEdgeKey = key;
  for (const [edge, els] of render.edgeEls)
    els.path.classList.toggle('edge-selected', edgeKeyOf(edge) === key);
}

/** Select an edge (clears any node selection). Delete/Backspace removes it. */
export function selectEdge(key: string | null): void {
  if (key !== null && selectedId !== null) select(null);
  applyEdgeSelection(key);
  renderStatus();
}

// ---- layout controls ------------------------------------------------------

/** 're-layout' — forget placement in the current mode, lay out again, refit. */
export function relayout(): void {
  layout.relayoutState();
  render.renderWorld();
  renderStatus();
  select(selectedId);
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
  renderStatus();
  select(selectedId);
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
  createMenu.innerHTML = '';
}

/** Create + wire + focus, per the menu pick. Exported for the smoke test. */
export function dropCreate(
  fromId: string,
  kind: NodeKind,
  at: NodePos,
): ReturnType<typeof editing.createNode> {
  const from = model.nodeById.get(fromId);
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
  const from = model.nodeById.get(fromId);
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
  createMenu.innerHTML =
    `<div class="cm-head">NEW FROM ${escapeHtml(fromId.toUpperCase())}</div>` +
    kinds
      .map(
        (kind) =>
          `<button class="cm-item" data-mk="${kind}" style="color:var(${KIND_VAR[kind]})">${KIND_LABEL[kind]}</button>`,
      )
      .join('');
  createMenu.style.left = `${clientX + 4}px`;
  createMenu.style.top = `${clientY + 4}px`;
  createMenu.classList.add('show');
  createMenu.querySelectorAll<HTMLElement>('[data-mk]').forEach((btn) =>
    btn.addEventListener('click', () => {
      closeCreateMenu();
      const res = dropCreate(fromId, btn.dataset.mk as NodeKind, at);
      if (!res.ok && res.reason) showTip(res.reason, clientX, clientY);
    }),
  );
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
  const from = model.nodeById.get(linkDrag.fromId);
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
  const node = model.nodeById.get(moveDrag.id);
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
    sim.reheat(0.3);
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
  sim.reheat(0.3);
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
  sim.reheat(0.3);
  layout.startSimLoop();
}

document.addEventListener('keydown', (event) => {
  if (event.key !== 'Delete' && event.key !== 'Backspace') return;
  // Typing surfaces own these keys: inspector fields and the script lens.
  if (event.target instanceof HTMLElement && event.target.closest('.fval, #script-pane')) return;
  if (selectedEdgeKey !== null) {
    const edge = model.graph.edges.find((e) => edgeKeyOf(e) === selectedEdgeKey);
    if (!edge) return;
    const res = editing.disconnect(edge);
    if (res.ok) {
      applyEdgeSelection(null);
      renderStatus();
    } else if (res.reason) {
      showTip(res.reason, viewport.clientWidth / 2, viewport.clientHeight / 2);
    }
    return;
  }
  // SB-034: Delete on a selected node starts the (reference-aware) delete.
  if (selectedId !== null) editing.requestDelete(selectedId);
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
  const id = entry.subjectIds.find((subjectId) => model.nodeById.has(subjectId));
  if (id) {
    select(id);
    camera.centerOn(id);
  }
  suppressCursorEcho = true;
  scriptLens.scrollToLine(id ? (model.blockById.get(id)?.startLine ?? entry.line) : entry.line);
}

function renderWorklist(): void {
  worklist = buildWorklist(model.result.diagnostics, [...model.blockById.values()]);
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

  worklistBody.innerHTML =
    groups.length === 0
      ? '<div class="empty">No loose ends — every thread is tied.</div>'
      : groups
          .map(
            ({ group, rows }) =>
              `<div class="sect">${GROUP_LABEL[group]} · ${rows.length}</div>` +
              rows
                .map(
                  ({ entry, index }) =>
                    `<div class="wl-row s-${entry.severity}" data-wi="${index}">
                      <span class="dcode">${escapeHtml(entry.code)}</span>
                      <span class="wmsg">${escapeHtml(entry.message)}</span>
                    </div>`,
                )
                .join(''),
          )
          .join('');

  worklistBody.querySelectorAll<HTMLElement>('[data-wi]').forEach((el) =>
    el.addEventListener('click', () => {
      jumpToWorklistEntry(worklist[Number(el.dataset.wi)]);
    }),
  );
}

// ---- status bar ----------------------------------------------------------

function renderStatus(): void {
  const warnings = model.result.diagnostics.filter((d) => d.severity === 'warning').length;
  const errors = model.result.diagnostics.filter((d) => d.severity === 'error').length;
  const todos = model.result.diagnostics.filter((d) => d.code === 'todo-line').length;
  const quiet = model.result.diagnostics.find((d) => d.code === 'lint-quiet-day');
  const quietDays = quiet?.message.match(/quiet days?\s+([\d,\s]+\d)/i)?.[1].replace(/\s+/g, ' ');

  counts.textContent = `${model.graph.nodes.length} nodes · ${model.graph.edges.length} edges`;
  statusbar.innerHTML = `
  <span class="${errors ? 'warn-c' : 'ok'}">compiled ${compileMs}ms${errors ? ` · ${errors} errors` : ''}</span>
  <span>${model.graph.nodes.length} nodes · ${model.graph.edges.length} edges</span>
  ${warnings ? `<span class="warn-c">${warnings} warnings</span>` : ''}
  ${todos ? `<span class="warn-c">${todos} TODO</span>` : ''}
  ${quietDays ? `<span class="pacing">pacing — day ${quietDays} quiet</span>` : ''}
  ${model.draftRestored ? '<span class="warn-c">restored unsaved draft</span>' : ''}
  ${editing.saveNote ? `<span class="${editing.saveNote.startsWith('saved') ? 'ok' : 'warn-c'}">${escapeHtml(editing.saveNote)}</span>` : ''}
  ${editing.lifecycleNote ? `<span class="warn-c">${escapeHtml(editing.lifecycleNote)}</span>` : ''}
  ${selectedEdgeKey ? '<span class="warn-c">edge selected — delete removes the relation</span>' : ''}
  <span class="hint">${
    layout.layoutMode === 'hand'
      ? 'drag a node to place it · positions stick'
      : layout.layoutMode === 'gravity'
        ? 'gravity — drag stirs, release floats'
        : 'gravity + pin — a drag pins the node, double-click frees it'
  } · drag port to empty space for new node · delete removes · esc clear</span>`;
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
    selectedEdgeKey: () => selectedEdgeKey,
  },
});
render.initLegend($('legend'));
layout.setFrameCallback(render.syncPositions);

editing.initEditing({
  rebuild,
  syncLens: (text) => scriptLens.setText(text),
  clearLensDraftTimer: () => clearTimeout(lensDraftTimer),
  onStatusChanged: renderStatus,
  select,
  centerOn: (id) => camera.centerOn(id),
  focusFirstField: () =>
    inspectorBody.querySelector<HTMLInputElement | HTMLTextAreaElement>('.fval')?.focus(),
  focusLensLineEnd: (line) => scriptLens.focusLineEnd(line),
  showDeleteConfirm: inspector.renderDeleteConfirm,
  onDeleteCancelled: () => {
    inspector.renderInspector(selectedId);
    renderStatus();
  },
});

inspector.initInspector({
  inspectorBody,
  showPreview: (id, kind) => previewApi.show(id, kind),
  select,
  centerOn: (id) => camera.centerOn(id),
  showTip: (text) => showTip(text, viewport.clientWidth / 2, 80),
});

rebuild();
camera.fit();
