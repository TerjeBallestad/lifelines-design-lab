// SB-026 probe — Canvas view generated from the real 0.2 compiler output.
// SB-032 — the inspector becomes the edit surface: per-kind forms write
// markup patches (src/compiler/patch.ts), POST /__save-case, recompile,
// re-render. The markup stays the store (DD-003).
// SB-033 — edge authoring: drag from a node's port to a legal target writes
// the relation to the markup (Supports/Opens/Needs lists, condition terms,
// the hypothesis Question field); selecting an edge + Delete removes it.
// SB-034 — node lifecycle: duplicate, delete with an inbound-reference
// warning; sticky layout — positions persist per case, edits never reshuffle
// the board, 're-layout' recomputes once.
// SB-042 — drag-wire-to-empty create: release a port drag on empty canvas →
// a RELATION-filtered menu → the node lands at the drop point, wired, focus
// in its first inspector field. Replaces the SB-034 'n → blank form' create
// (killed by SB-040 ruling 2).
// SB-041 — the hybrid editor: the shared CodeMirror script lens
// (prototypes/script-editor/lens.ts) mounts on the left over the SAME
// caseText buffer. Canvas commits push into the lens (setText, external);
// lens typing debounce-recompiles, drafts, and rebuilds sticky.
// Probe code: outside tsconfig, Vite transpiles it in dev only.
import { compileCase } from '../../src/compiler/index.ts';
import type { CompileResult } from '../../src/compiler/index.ts';
import { parseCaseText } from '../../src/compiler/parse.ts';
import type { RawBlock } from '../../src/compiler/parse.ts';
import { DiagnosticBag } from '../../src/compiler/diagnostics.ts';
import {
  patchField,
  listFieldAdd,
  listFieldRemove,
  appendBlock,
  removeBlock,
} from '../../src/compiler/patch.ts';
import { parseCondition } from '../../src/compiler/condition.ts';
import initialText from '../../content/cases/olsen/tiny-olsen.case.md?raw';
import { mountScriptLens, indexHeadings } from '../script-editor/lens.ts';
import type { Heading } from '../script-editor/lens.ts';
import { buildSymbols } from '../script-editor/symbols.ts';
import { buildGraph, layoutGraph, stickyLayout, NODE_W, NODE_H } from './graph.ts';
import type { CaseGraph, GraphNode, GraphEdge, NodeKind, NodePos } from './graph.ts';

const $ = (id: string) => document.getElementById(id) as HTMLElement;
const viewport = $('viewport');
const world = $('world');
const edgesSvg = $('edges') as unknown as SVGSVGElement;
const nodesHost = $('nodes');
const inspectorBody = $('inspector-body');
const statusbar = $('statusbar');
const counts = $('counts');

// ---- text state + draft safety -------------------------------------------

// Same draft key as the script editor (SB-025 rule: a vite reload must never
// wipe unsaved work). A draft made on either surface is visible on both.
export const DRAFT_KEY = 'kildeverket-draft:content/cases/olsen/tiny-olsen.case.md';
const bootDraft = localStorage.getItem(DRAFT_KEY);
let caseText = bootDraft != null && bootDraft !== initialText ? bootDraft : initialText;
let draftRestored = caseText !== initialText;

/** The current markup buffer (the single source the canvas edits). */
export function getCaseText(): string {
  return caseText;
}

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
let crossJumpHeadings: Heading[] = [];
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
  for (const h of crossJumpHeadings)
    if (h.id !== '' && h.line <= line && line <= h.endLine) hit = h.id;
  return hit;
}

/** Pull the lens doc into caseText and rebuild (sticky — SB-034). */
function syncFromLens(): void {
  clearTimeout(lensCompileTimer);
  lensCompileTimer = undefined;
  caseText = scriptLens.getText();
  rebuild();
}

export const scriptLens = mountScriptLens({
  parent: $('script-pane'),
  doc: caseText,
  onDocChanged: ({ external }) => {
    if (external) return; // canvas commit round-trip — already compiled
    clearTimeout(lensCompileTimer);
    lensCompileTimer = setTimeout(syncFromLens, 150);
    clearTimeout(lensDraftTimer);
    lensDraftTimer = setTimeout(() => {
      localStorage.setItem(DRAFT_KEY, scriptLens.getText());
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
    if (id === null || id === selectedId || !nodeById.has(id)) return;
    scriptDrivenSelect = true;
    try {
      select(id);
      centerOn(id);
    } finally {
      scriptDrivenSelect = false;
    }
  },
  onSaveRequested: () => {
    // ⌘S in the lens: flush any pending recompile so persist() posts the
    // exact buffer on screen, then save through the shared pipeline.
    if (lensCompileTimer !== undefined) syncFromLens();
    void persist();
  },
});

$('toggle-script').addEventListener('click', () => {
  $('app').classList.toggle('script-collapsed');
});

// ---- sticky node positions (SB-034) --------------------------------------

// Per-case position store. Stored positions survive every rebuild; the
// barycenter layout runs only when the store is empty (first load or an
// explicit 're-layout'). Stale ids are kept — a block that vanishes over
// a broken compile keeps its slot when it comes back.
export const POS_KEY = 'kildeverket-canvas-pos:content/cases/olsen/tiny-olsen.case.md';

function loadPositions(): Map<string, NodePos> {
  try {
    const raw = localStorage.getItem(POS_KEY);
    if (!raw) return new Map();
    return new Map(Object.entries(JSON.parse(raw) as Record<string, NodePos>));
  } catch {
    return new Map();
  }
}

function savePositions(): void {
  const stored = loadPositions();
  for (const node of graph.nodes) stored.set(node.id, { x: node.x, y: node.y });
  localStorage.setItem(POS_KEY, JSON.stringify(Object.fromEntries(stored)));
}

/** 're-layout' — drop the stored positions, run barycenter once, refit. */
export function relayout(): void {
  localStorage.removeItem(POS_KEY);
  extent = layoutGraph(graph);
  savePositions();
  renderWorld();
  renderStatus();
  select(selectedId);
  fit();
}

// ---- compile + derive (rebuilt on every committed edit) ------------------

let result: CompileResult;
export let graph: CaseGraph;
let extent = { width: 1, height: 1 };
let compileMs = 0;
let nodeById = new Map<string, GraphNode>();
let blockById = new Map<string, RawBlock>();
let inOf = new Map<string, GraphEdge[]>();
let outOf = new Map<string, GraphEdge[]>();

function rebuild(): void {
  const t0 = performance.now();
  result = compileCase(caseText);
  const tiltakNeeds = Object.fromEntries(
    Object.values(result.labContent.tiltak).map((t) => [t.id, t.needs]),
  );
  graph = buildGraph(result.slice, { tiltakNeeds });
  // Sticky layout (SB-034): stored positions win; only unplaced nodes get a
  // slot (column end). An empty store — first load or 're-layout' — runs
  // the barycenter pass once. Rebuilds must never reshuffle the board.
  extent = stickyLayout(graph, loadPositions());
  savePositions();
  compileMs = Math.round(performance.now() - t0);

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

  renderWorld();
  renderStatus();
  // Selection survives the rebuild; a node the edit removed clears it.
  select(selectedId !== null && nodeById.has(selectedId) ? selectedId : null);

  // SB-041: feed the lens fresh compile context — headings for folding/jump,
  // symbols for autocomplete/hover/goto-def, diagnostics for lint squiggles.
  // Hoisted into module state: the cursor→block resolution reads it too.
  crossJumpHeadings = indexHeadings(caseText.split('\n'));
  scriptLens.update({
    headings: crossJumpHeadings,
    symbols: buildSymbols(result, crossJumpHeadings),
    diagnostics: result.diagnostics,
  });
}

// ---- render --------------------------------------------------------------

const KIND_LABEL: Record<NodeKind, string> = {
  document: 'DOCUMENT',
  fact: 'FACT',
  question: 'QUESTION',
  hypothesis: 'HYPOTHESIS',
  tiltak: 'TILTAK',
  dispatch: 'DISPATCH',
  clock: 'CLOCK',
};
const KIND_VAR: Record<NodeKind, string> = {
  document: '--blue',
  fact: '--accent',
  question: '--yellow',
  hypothesis: '--purple',
  tiltak: '--green',
  dispatch: '--orange',
  clock: '--gold',
};
const EDGE_VAR: Record<string, string> = {
  source: '--blue',
  supports: '--accent',
  gate: '--yellow',
  needs: '--purple',
  opens: '--green',
  delivers: '--orange',
  reveals: '--gold',
  clock: '--gold',
  lead: '--yellow',
};
const cssVar = (name: string) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim() || '#62667a';

const SVG_NS = 'http://www.w3.org/2000/svg';
let edgeEls = new Map<GraphEdge, { path: SVGPathElement; text: SVGTextElement }>();
let nodeEls = new Map<string, HTMLElement>();

function renderWorld(): void {
  edgesSvg.setAttribute('width', String(extent.width));
  edgesSvg.setAttribute('height', String(extent.height));
  while (edgesSvg.firstChild) edgesSvg.firstChild.remove();
  nodesHost.innerHTML = '';
  edgeEls = new Map();
  nodeEls = new Map();

  for (const edge of graph.edges) {
    const from = nodeById.get(edge.from)!;
    const to = nodeById.get(edge.to)!;
    const forward = to.x >= from.x + NODE_W;
    const sx = forward ? from.x + NODE_W : from.x;
    const tx = forward ? to.x : to.x + NODE_W;
    const sy = from.y + NODE_H / 2;
    const ty = to.y + NODE_H / 2;
    const reach = Math.max(Math.abs(tx - sx) / 2, 44) * (forward ? 1 : -1);
    const path = document.createElementNS(SVG_NS, 'path');
    path.setAttribute('d', `M ${sx} ${sy} C ${sx + reach} ${sy}, ${tx - reach} ${ty}, ${tx} ${ty}`);
    const text = document.createElementNS(SVG_NS, 'text');
    text.setAttribute('x', String((sx + tx) / 2));
    text.setAttribute('y', String((sy + ty) / 2 - 4));
    text.setAttribute('text-anchor', 'middle');
    text.textContent = edge.label;
    text.style.display = 'none';
    // Invisible fat twin of the path: the click target for edge selection.
    const hit = document.createElementNS(SVG_NS, 'path');
    hit.setAttribute('d', path.getAttribute('d')!);
    hit.setAttribute('class', 'hit');
    hit.setAttribute('data-edge', edgeKeyOf(edge));
    hit.addEventListener('click', (event) => {
      event.stopPropagation();
      selectEdge(edgeKeyOf(edge));
    });
    if (edgeKeyOf(edge) === selectedEdgeKey) path.classList.add('edge-selected');
    edgesSvg.append(path, hit, text);
    edgeEls.set(edge, { path, text });
  }

  for (const node of graph.nodes) {
    const el = document.createElement('div');
    el.className = `node k-${node.kind}`;
    el.style.left = `${node.x}px`;
    el.style.top = `${node.y}px`;
    el.dataset.id = node.id;
    el.innerHTML = `
    <div class="nid">${node.id.toUpperCase()}</div>
    <div class="ntitle">${escapeHtml(node.title)}</div>
    <div class="nsub">${escapeHtml(node.sub)}</div>`;
    el.addEventListener('click', (event) => {
      event.stopPropagation();
      select(node.id);
    });
    // SB-033: the port — drag from here to a legal target to author an edge.
    const port = document.createElement('div');
    port.className = 'port';
    port.title = 'drag from port for a new edge';
    port.addEventListener('pointerdown', (event) => {
      event.stopPropagation();
      event.preventDefault();
      startLink(node.id, event.clientX, event.clientY);
    });
    el.append(port);
    nodesHost.append(el);
    nodeEls.set(node.id, el);
  }
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
const escapeAttr = (s: string) => escapeHtml(s).replace(/"/g, '&quot;');

const legend = $('legend');
legend.innerHTML =
  (Object.keys(KIND_LABEL) as NodeKind[])
    .map(
      (kind) =>
        `<span><span class="dot" style="background:var(${KIND_VAR[kind]})"></span>${KIND_LABEL[kind]}</span>`,
    )
    .join('') +
  // SB-039: the two port shapes confused on first contact — name them here.
  `<span title="hover a node — the ring on its right edge is the drag source for a new edge"><span class="ring"></span>drag → new edge</span>
   <span title="the line into a node's left side is derived from the markup (e.g. document feeds fact) — edit the fields, not the line"><span class="wire"></span>derived link</span>`;

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
    for (const edge of outOf.get(id) ?? []) {
      lit.add(edge.to);
      litEdges.add(edge);
    }
    for (const edge of inOf.get(id) ?? []) {
      lit.add(edge.from);
      litEdges.add(edge);
    }
  }
  for (const [nodeId, el] of nodeEls) {
    el.classList.toggle('lit', lit.has(nodeId));
    el.classList.toggle('selected', nodeId === id);
  }
  for (const [edge, els] of edgeEls) {
    const on = litEdges.has(edge);
    els.path.classList.toggle('lit', on);
    els.path.style.stroke = on ? cssVar(EDGE_VAR[edge.label.split(' ')[0]] ?? '--text-3') : '';
    els.text.style.display = on && edge.label ? '' : 'none';
  }
  renderInspector(id);
  // SB-041 cross-jump, canvas → script: a real (changed, non-null) selection
  // scrolls the lens to the block heading — no focus steal, so inspector
  // typing keeps landing in the inspector. Script-driven selects skip this
  // (bounce guard); rebuild's re-select of the same id skips via `changed`.
  if (id !== null && changed && !scriptDrivenSelect) {
    const block = blockById.get(id);
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
  for (const [edge, els] of edgeEls)
    els.path.classList.toggle('edge-selected', edgeKeyOf(edge) === key);
}

/** Select an edge (clears any node selection). Delete/Backspace removes it. */
export function selectEdge(key: string | null): void {
  if (key !== null && selectedId !== null) select(null);
  applyEdgeSelection(key);
  renderStatus();
}

function relRow(edge: GraphEdge, otherId: string): string {
  const other = nodeById.get(otherId)!;
  return `<div class="rel" data-goto="${otherId}">
    <span class="via">${edge.label || 'carries'}</span>
    <span style="color:var(${KIND_VAR[other.kind]})">${otherId}</span>
    <span class="rtitle">${escapeHtml(other.title)}</span>
  </div>`;
}

// ---- inspector: per-kind edit forms --------------------------------------

// Markup field per form row. `keys` are candidates in preference order; the
// first key the block already carries wins (questions write Title unless the
// block uses an explicit Prompt line). Multiline fields render as textareas
// but stay single markup lines — newlines collapse to spaces on commit.
interface FieldSpec {
  keys: string[];
  multiline?: boolean;
  /** Empty-form guidance (SB-039): example text from a real Olsen block. */
  placeholder?: string;
}
const FORM_FIELDS: Record<NodeKind, FieldSpec[]> = {
  document: [{ keys: ['Title'] }, { keys: ['Peek'] }, { keys: ['Meta'] }],
  fact: [
    { keys: ['Label'], placeholder: 'short name — e.g. Ellings uføretrygd' },
    {
      keys: ['Summary'],
      multiline: true,
      placeholder: 'what the player learns — e.g. Ellings uføretrygd: 2 [icon=coin] i måneden.',
    },
    { keys: ['Domain'], placeholder: 'e.g. Økonomi/bolig' },
    { keys: ['Category'], placeholder: 'e.g. Økonomi' },
    {
      keys: ['Quote'],
      multiline: true,
      placeholder: 'source line, verbatim — e.g. «Det er en dør på gløtt.»',
    },
  ],
  question: [
    { keys: ['Prompt', 'Title'], multiline: true },
    { keys: ['Teaser'], multiline: true },
    { keys: ['Card title'] },
  ],
  hypothesis: [
    { keys: ['Title'], multiline: true },
    { keys: ['Summary'], multiline: true },
  ],
  tiltak: [
    { keys: ['Title'] },
    { keys: ['Slot'] },
    { keys: ['Cost'] },
    { keys: ['Description'], multiline: true },
  ],
  dispatch: [
    { keys: ['Title'] },
    { keys: ['Activity'] },
    { keys: ['Channel'] },
    { keys: ['Delay'] },
    { keys: ['Description'], multiline: true },
  ],
  clock: [{ keys: ['Label'] }, { keys: ['Question'] }, { keys: ['Good'] }, { keys: ['Bad'] }],
};

function formHtml(node: GraphNode, block: RawBlock): string {
  if (block.type === 'beat' || block.type === 'conversation') {
    return `<div class="form-note">Prose/weave block — read-only here for now.</div>`;
  }
  const rows = (FORM_FIELDS[node.kind] ?? []).map((spec) => {
    const key = spec.keys.find((k) => block.fields.some((f) => f.key === k)) ?? spec.keys[0];
    const value = block.fields.find((f) => f.key === key)?.value ?? '';
    const ph = spec.placeholder ? ` placeholder="${escapeAttr(spec.placeholder)}"` : '';
    const control = spec.multiline
      ? `<textarea class="fval" data-key="${escapeAttr(key)}" rows="3"${ph}>${escapeHtml(value)}</textarea>`
      : `<input class="fval" data-key="${escapeAttr(key)}" value="${escapeAttr(value)}"${ph} />`;
    return `<label class="field"><span class="fkey">${escapeHtml(key)}</span>${control}</label>`;
  });
  return `<div class="sect">FIELDS</div>${rows.join('')}<div class="form-note" id="form-note"></div>`;
}

function diagHtml(block: RawBlock | undefined): string {
  if (!block) return '';
  const diags = result.diagnostics.filter(
    (d) =>
      (d.span.startLine <= block.endLine && d.span.endLine >= block.startLine) ||
      d.subjectIds.includes(block.id),
  );
  if (diags.length === 0) return '';
  const rows = diags.map(
    (d) =>
      `<div class="diag s-${d.severity}"><span class="dcode">${escapeHtml(d.code)}</span>${escapeHtml(d.message)}</div>`,
  );
  return `<div class="sect">DIAGNOSTICS · ${diags.length}</div>${rows.join('')}`;
}

function renderInspector(id: string | null): void {
  const activeKey =
    document.activeElement instanceof HTMLElement && inspectorBody.contains(document.activeElement)
      ? document.activeElement.dataset.key
      : undefined;

  if (!id) {
    inspectorBody.innerHTML = '<div class="empty">Click a node. Esc clears the selection.</div>';
    return;
  }
  const node = nodeById.get(id)!;
  const block = blockById.get(id);
  const outs = outOf.get(id) ?? [];
  const ins = inOf.get(id) ?? [];
  inspectorBody.innerHTML = `
    <div class="kind" style="color:var(${KIND_VAR[node.kind]})">${KIND_LABEL[node.kind]}</div>
    <div class="iid">${id}</div>
    <div class="isub">${escapeHtml(node.sub)}</div>
    ${block ? formHtml(node, block) : `<div class="ititle">${escapeHtml(node.title)}</div>`}
    ${diagHtml(block)}
    <div class="sect">OPENS / FEEDS · ${outs.length}</div>
    ${outs.map((e) => relRow(e, e.to)).join('') || '<div class="empty">nothing — dead end?</div>'}
    <div class="sect">FED BY · ${ins.length}</div>
    ${ins.map((e) => relRow(e, e.from)).join('') || '<div class="empty">no inbound — entry point</div>'}
    ${
      block && block.type !== 'case'
        ? `<div class="sect">ACTIONS</div>
    <div class="iactions">
      <button class="ibtn" id="i-dup">duplicate</button>
      <button class="ibtn danger" id="i-del">delete</button>
    </div>`
        : ''
    }`;
  document.getElementById('i-dup')?.addEventListener('click', () => {
    const res = duplicateNode(id);
    if (!res.ok && res.reason) showTip(res.reason, viewport.clientWidth / 2, 80);
  });
  document.getElementById('i-del')?.addEventListener('click', () => requestDelete(id));
  inspectorBody.querySelectorAll<HTMLElement>('[data-goto]').forEach((el) =>
    el.addEventListener('click', () => {
      const target = el.dataset.goto!;
      select(target);
      centerOn(target);
    }),
  );
  inspectorBody.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('.fval').forEach((el) => {
    el.addEventListener('change', () => commitField(id, el.dataset.key!, el.value));
    el.addEventListener('input', () => stashDraft(id, el.dataset.key!, el.value));
    if (el instanceof HTMLInputElement)
      el.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') el.blur();
      });
  });
  if (activeKey) {
    inspectorBody
      .querySelector<HTMLInputElement | HTMLTextAreaElement>(`.fval[data-key="${activeKey}"]`)
      ?.focus();
  }
}

// ---- edit pipeline: patch → draft → save → recompile ---------------------

/** Markup fields are single lines; a textarea newline collapses to a space. */
const oneLine = (value: string) => value.replace(/\s*\n\s*/g, ' ').trim();

let draftTimer: ReturnType<typeof setTimeout> | undefined;

// Typed-but-uncommitted edits land in the draft (debounced) so a vite reload
// never wipes them. A committed save clears the draft again.
function stashDraft(blockId: string, key: string, value: string): void {
  clearTimeout(draftTimer);
  draftTimer = setTimeout(() => {
    try {
      const patched = patchField(caseText, blockId, key, oneLine(value));
      if (patched !== caseText) localStorage.setItem(DRAFT_KEY, patched);
    } catch {
      // Unpatchable while typing (e.g. mid-edit weirdness) — commit surfaces it.
    }
  }, 300);
}

function commitField(blockId: string, key: string, value: string): void {
  let patched: string;
  try {
    patched = patchField(caseText, blockId, key, oneLine(value));
  } catch (err) {
    const note = document.getElementById('form-note');
    if (note) note.textContent = err instanceof Error ? err.message : String(err);
    return;
  }
  if (patched === caseText) return; // no-op: nothing written, nothing saved
  commitText(patched);
}

/** Shared commit tail: buffer → draft → rebuild → lens sync → save POST. */
function commitText(patched: string): void {
  caseText = patched;
  localStorage.setItem(DRAFT_KEY, caseText);
  rebuild();
  // Push the committed buffer into the script lens as a minimal external
  // replacement — cursor and undo history survive; the external flag stops
  // the doc-changed handler from echoing a second compile.
  scriptLens.setText(caseText);
  void persist();
}

let saveNote = '';

async function persist(): Promise<void> {
  try {
    const res = await fetch('/__save-case', { method: 'POST', body: caseText });
    if (!res.ok) throw new Error(await res.text());
    // A lens draft stash still in flight would resurrect the cleared draft.
    clearTimeout(lensDraftTimer);
    localStorage.removeItem(DRAFT_KEY);
    draftRestored = false;
    const t = new Date();
    saveNote = `saved ${String(t.getHours()).padStart(2, '0')}:${String(t.getMinutes()).padStart(2, '0')}`;
  } catch (err) {
    saveNote = `save failed — draft kept (${err instanceof Error ? err.message : String(err)})`;
  }
  renderStatus();
}

// ---- edge authoring (SB-033) ---------------------------------------------

/**
 * The legality table — the single source for which drags create relations.
 * `on` names the block that carries the written field: `from` or `to`.
 *  - list: the other node's id joins a comma list (Supports/Needs/Opens)
 *  - field: the other node's id becomes the single value (Question)
 *  - cond: the other node's id joins the condition expression as an and-term
 *    (the canonical `field` here is documentation; the write resolves the
 *    block's actual key via COND_KEYS, e.g. `needs:` vs legacy `Needs:`).
 */
export interface RelationSpec {
  mode: 'list' | 'field' | 'cond';
  field: string;
  on: 'from' | 'to';
}
export const RELATION: Partial<Record<`${NodeKind}→${NodeKind}`, RelationSpec>> = {
  'fact→question': { mode: 'list', field: 'Supports', on: 'from' },
  'fact→hypothesis': { mode: 'cond', field: 'needs', on: 'to' },
  'fact→tiltak': { mode: 'list', field: 'Needs', on: 'to' },
  'fact→dispatch': { mode: 'cond', field: 'gate', on: 'to' },
  'fact→clock': { mode: 'cond', field: 'visible when', on: 'to' },
  'question→hypothesis': { mode: 'field', field: 'Question', on: 'to' },
  'hypothesis→tiltak': { mode: 'list', field: 'Opens', on: 'from' },
  'hypothesis→dispatch': { mode: 'list', field: 'Opens', on: 'from' },
  'hypothesis→clock': { mode: 'cond', field: 'visible when', on: 'to' },
};

/** Condition field keys per kind, in the compiler's preference order. */
const COND_KEYS: Partial<Record<NodeKind, string[]>> = {
  question: ['when', 'Opens when'],
  hypothesis: ['needs', 'Needs'],
  dispatch: ['gate', 'Gate'],
  clock: ['visible when', 'Visible when'],
};

function condField(ownerId: string): { key: string; value: string } | null {
  const node = nodeById.get(ownerId);
  const block = blockById.get(ownerId);
  const keys = node ? COND_KEYS[node.kind] : undefined;
  if (!keys || !block) return null;
  const existing = block.fields.find((f) => keys.includes(f.key));
  return existing ? { key: existing.key, value: existing.value } : { key: keys[0], value: '' };
}

const topLevelAndTerms = (expr: string): string[] =>
  expr
    .trim()
    .split(/\s+and\s+/)
    .map((part) => part.trim())
    .filter((part) => part !== '');

/**
 * Append `id` as an and-term. An expression with `or` gets wrapped in parens
 * first so the new term binds over the whole thing. Returns the current
 * expression unchanged when the term is already present; null when the
 * result would not parse (§6 grammar) — the caller refuses instead.
 */
export function condAddTerm(expr: string, id: string): string | null {
  const current = expr.trim();
  if (topLevelAndTerms(current).includes(id)) return current;
  const base = current === '' ? '' : /\bor\b/.test(current) ? `(${current})` : current;
  const next = base === '' ? id : `${base} and ${id}`;
  return parseCondition(next).error === null ? next : null;
}

/**
 * Drop `id` when it stands as a plain top-level and-term, normalizing the
 * surrounding `and`s. Returns null when the term is absent or nested in
 * something richer (or/not/n-of) — too risky to rewrite blind.
 */
export function condRemoveTerm(expr: string, id: string): string | null {
  const parts = topLevelAndTerms(expr);
  const kept = parts.filter((part) => part !== id);
  if (kept.length === parts.length) return null;
  const next = kept.join(' and ');
  return parseCondition(next).error === null ? next : null;
}

export interface EdgeWriteResult {
  ok: boolean;
  reason?: string;
}

/** Create the relation `fromId → toId` per the legality table and commit it. */
export function connect(fromId: string, toId: string): EdgeWriteResult {
  const from = nodeById.get(fromId);
  const to = nodeById.get(toId);
  if (!from || !to) return { ok: false, reason: 'unknown node' };
  const spec = RELATION[`${from.kind}→${to.kind}`];
  if (!spec) {
    return {
      ok: false,
      reason: `${KIND_LABEL[from.kind]} → ${KIND_LABEL[to.kind]}: no legal relation — drag from port for a new edge`,
    };
  }
  const ownerId = spec.on === 'from' ? fromId : toId;
  const otherId = spec.on === 'from' ? toId : fromId;
  try {
    let patched: string;
    if (spec.mode === 'list') {
      // Legacy dispatch ids without a d_ prefix only classify in the
      // dedicated `Opens dispatches:` list, not in plain `Opens:`.
      const field =
        spec.field === 'Opens' && to.kind === 'dispatch' && !toId.startsWith('d_')
          ? 'Opens dispatches'
          : spec.field;
      patched = listFieldAdd(caseText, ownerId, field, otherId);
    } else if (spec.mode === 'field') {
      patched = patchField(caseText, ownerId, spec.field, otherId);
    } else {
      const cond = condField(ownerId);
      if (!cond) return { ok: false, reason: `${ownerId} has no condition to extend` };
      const next = condAddTerm(cond.value, otherId);
      if (next === null)
        return { ok: false, reason: `the condition on ${ownerId} cannot be extended safely` };
      patched =
        next === cond.value.trim() ? caseText : patchField(caseText, ownerId, cond.key, next);
    }
    if (patched === caseText) return { ok: true }; // already related — nothing to write
    commitText(patched);
    return { ok: true };
  } catch (err) {
    return { ok: false, reason: err instanceof Error ? err.message : String(err) };
  }
}

/** Remove the authored relation behind an edge; derived edges refuse. */
export function disconnect(edge: GraphEdge): EdgeWriteResult {
  const from = nodeById.get(edge.from);
  const to = nodeById.get(edge.to);
  if (!from || !to) return { ok: false, reason: 'unknown edge' };
  const label = edge.label.split(' ')[0];
  const condRemove = (ownerId: string, id: string): string | null => {
    const cond = condField(ownerId);
    if (!cond) return null;
    const next = condRemoveTerm(cond.value, id);
    return next === null ? null : patchField(caseText, ownerId, cond.key, next);
  };
  try {
    let patched: string | null;
    if (label === 'supports' && from.kind === 'fact') {
      patched = listFieldRemove(caseText, edge.from, 'Supports', edge.to);
      if (patched === caseText) patched = null;
    } else if (label === 'opens' && from.kind === 'hypothesis') {
      patched = listFieldRemove(caseText, edge.from, 'Opens', edge.to);
      if (patched === caseText)
        patched = listFieldRemove(caseText, edge.from, 'Opens dispatches', edge.to);
      if (patched === caseText) patched = null;
    } else if (label === 'needs' && to.kind === 'tiltak') {
      // SB-034: tiltak Needs: is a list field, not a condition.
      patched = listFieldRemove(caseText, edge.to, 'Needs', edge.from);
      if (patched === caseText) patched = null;
    } else if (label === 'needs' || label === 'gate') {
      patched = condRemove(edge.to, edge.from);
    } else {
      return {
        ok: false,
        reason: `"${edge.label || 'carries'}" is a derived edge — it cannot be deleted here`,
      };
    }
    if (patched === null)
      return {
        ok: false,
        reason: `did not find ${edge.from} as a plain entry/and-term on ${label === 'supports' || label === 'opens' ? edge.from : edge.to}`,
      };
    commitText(patched);
    return { ok: true };
  } catch (err) {
    return { ok: false, reason: err instanceof Error ? err.message : String(err) };
  }
}

// ---- node lifecycle (SB-034): create · duplicate · delete -----------------

const ID_PREFIX: Record<NodeKind, string> = {
  document: 'doc_',
  fact: 'f_',
  question: 'q_',
  hypothesis: 'h_',
  tiltak: 't_',
  dispatch: 'd_', // plain Opens: only classifies d_-prefixed ids (SB-033)
  clock: 'ck_',
};

/** `base`, else `base2`, `base3`, … — unique against every parsed block. */
function freshId(base: string): string {
  if (!blockById.has(base) && !nodeById.has(base)) return base;
  let n = 2;
  while (blockById.has(`${base}${n}`) || nodeById.has(`${base}${n}`)) n += 1;
  return `${base}${n}`;
}

let lifecycleNote = '';

export interface CreateResult extends EdgeWriteResult {
  id?: string;
}

/**
 * Create a node of `kind` from its DEFAULT_TEMPLATES block, commit, select it
 * so the inspector opens for naming. `opts.at` (SB-042) pre-stores the drop
 * point in the sticky POS store so the node lands where the drag released;
 * without it the sticky layout appends at the kind column's end. Facts need
 * a parent document.
 */
export function createNode(
  kind: NodeKind,
  opts: { documentId?: string; at?: NodePos } = {},
): CreateResult {
  const id = freshId(`${ID_PREFIX[kind]}ny`);
  if (opts.at) {
    const stored = loadPositions();
    stored.set(id, { x: opts.at.x, y: opts.at.y });
    localStorage.setItem(POS_KEY, JSON.stringify(Object.fromEntries(stored)));
  }
  try {
    let patched: string;
    if (kind === 'fact') {
      if (!opts.documentId)
        return { ok: false, reason: 'a fact needs a document — drag from its document instead' };
      patched = appendBlock(caseText, 'fact', id, { documentId: opts.documentId });
    } else {
      patched = appendBlock(caseText, kind, id);
    }
    commitText(patched);
  } catch (err) {
    return { ok: false, reason: err instanceof Error ? err.message : String(err) };
  }
  if (!nodeById.has(id))
    return { ok: false, reason: `${id} was written but did not compile to a node` };
  select(id);
  centerOn(id);
  inspectorBody.querySelector<HTMLInputElement | HTMLTextAreaElement>('.fval')?.focus();
  return { ok: true, id };
}

/** Copy a block's body as the template for a fresh `<id>_kopi` block. */
export function duplicateNode(sourceId: string): EdgeWriteResult {
  const block = blockById.get(sourceId);
  const node = nodeById.get(sourceId);
  if (!block || !node) return { ok: false, reason: `unknown block ${sourceId}` };
  const body = caseText.split('\n').slice(block.startLine, block.endLine);
  while (body.length > 0 && body[0].trim() === '') body.shift();
  while (body.length > 0 && body[body.length - 1].trim() === '') body.pop();
  const id = freshId(`${sourceId}_kopi`);
  try {
    const patched = appendBlock(caseText, block.type, id, {
      template: body.join('\n'),
      ...(block.type === 'fact' ? { documentId: block.documentId } : {}),
    });
    commitText(patched);
  } catch (err) {
    return { ok: false, reason: err instanceof Error ? err.message : String(err) };
  }
  if (!nodeById.has(id))
    return { ok: false, reason: `${id} was written but did not compile to a node` };
  select(id);
  centerOn(id);
  return { ok: true };
}

/** One inbound reference to a block slated for removal. */
export interface RefHit {
  blockId: string;
  key: string; // field key, or 'prosa' / 'effekt' / 'header'
  targetId: string;
  /** How a confirmed delete handles it: patch it away, or report-only. */
  action: 'list' | 'cond' | 'field' | 'report';
}

const LIST_REF_KEYS = new Set([
  'Supports',
  'Opens',
  'Opens dispatches',
  'Opens tiltak',
  'Discuss',
  'Relevant',
  'Needs hypothesis',
]);
const COND_REF_KEYS = new Set([
  'when',
  'Opens when',
  'needs',
  'gate',
  'Gate',
  'visible when',
  'Visible when',
]);

function refActionFor(block: RawBlock, key: string): RefHit['action'] {
  // 'Needs' is a plain list on tiltak but a condition on hypotheses.
  if (key === 'Needs') return block.type === 'hypothesis' ? 'cond' : 'list';
  if (LIST_REF_KEYS.has(key)) return 'list';
  if (COND_REF_KEYS.has(key)) return 'cond';
  if (key === 'Question' && block.type === 'hypothesis') return 'field';
  return 'report'; // free-text fields we refuse to rewrite blind
}

/** Every textual inbound reference to the ids in `family`, outside it. */
function findReferences(family: string[]): RefHit[] {
  const removal = new Set(family);
  const probes = family.map((id) => ({ id, re: new RegExp(`\\b${id}\\b`) }));
  const hits: RefHit[] = [];
  for (const block of blockById.values()) {
    if (removal.has(block.id) || block.type === 'case') continue;
    for (const field of block.fields)
      for (const { id, re } of probes)
        if (re.test(field.value))
          hits.push({
            blockId: block.id,
            key: field.key,
            targetId: id,
            action: refActionFor(block, field.key),
          });
    for (const effect of block.effects)
      for (const { id, re } of probes)
        if (re.test(effect.body))
          hits.push({ blockId: block.id, key: 'effekt', targetId: id, action: 'report' });
    for (const prose of block.proseLines)
      for (const { id, re } of probes)
        if (re.test(prose.text))
          hits.push({ blockId: block.id, key: 'prosa', targetId: id, action: 'report' });
    if (block.pair)
      for (const { id } of probes)
        if (block.pair.includes(id))
          hits.push({ blockId: block.id, key: 'header', targetId: id, action: 'report' });
  }
  return hits;
}

let pendingDelete: { id: string; family: string[]; refs: RefHit[] } | null = null;

/**
 * Start a delete. A referenced block surfaces its inbound reference list in
 * the inspector BEFORE anything is written; an unreferenced one goes
 * straight through. Deleting a document takes its contiguous ## facts along
 * (removeBlock alone would orphan them).
 */
export function requestDelete(id: string): void {
  const block = blockById.get(id);
  if (!block || block.type === 'case') return;
  const family = [id];
  if (block.type === 'document')
    for (const b of blockById.values())
      if (b.type === 'fact' && b.documentId === id) family.push(b.id);
  const refs = findReferences(family);
  if (refs.length === 0) {
    performDelete(family, refs);
    return;
  }
  pendingDelete = { id, family, refs };
  renderDeleteConfirm();
}

/** Confirmed delete: clean the patchable references, then remove the blocks. */
export function confirmDelete(): void {
  if (!pendingDelete) return;
  const pending = pendingDelete;
  pendingDelete = null;
  performDelete(pending.family, pending.refs);
}

export function cancelDelete(): void {
  pendingDelete = null;
  renderInspector(selectedId);
  renderStatus();
}

/** Drop `targetId` as a plain and-term from a live condition field. */
function cleanCondRef(text: string, ref: RefHit): string | null {
  const parsed = parseCaseText(text, new DiagnosticBag());
  const field = parsed.blocks
    .find((b) => b.id === ref.blockId)
    ?.fields.find((f) => f.key === ref.key);
  if (!field) return null;
  const next = condRemoveTerm(field.value, ref.targetId);
  return next === null ? null : patchField(text, ref.blockId, ref.key, next);
}

function performDelete(family: string[], refs: RefHit[]): void {
  let text = caseText;
  const refused: string[] = [];
  for (const ref of refs) {
    const tag = `${ref.blockId}.${ref.key}`;
    try {
      if (ref.action === 'list') {
        text = listFieldRemove(text, ref.blockId, ref.key, ref.targetId);
      } else if (ref.action === 'cond') {
        const next = cleanCondRef(text, ref);
        if (next === null) refused.push(tag);
        else text = next;
      } else if (ref.action === 'field') {
        text = patchField(text, ref.blockId, ref.key, '');
      } else {
        refused.push(tag);
      }
    } catch {
      refused.push(tag);
    }
  }
  // Facts were appended to the family after their document — remove them
  // first so the document never orphans mid-sequence.
  for (const id of [...family].reverse()) text = removeBlock(text, id);
  lifecycleNote =
    refused.length > 0
      ? `deleted ${family[0]} — did not clean up: ${[...new Set(refused)].join(', ')}`
      : `deleted ${family[0]}`;
  commitText(text);
}

function renderDeleteConfirm(): void {
  if (!pendingDelete) return;
  const { id, family, refs } = pendingDelete;
  const rows = refs
    .map(
      (ref) => `<div class="rel">
        <span class="via">${ref.action === 'report' ? 'not cleaned' : 'cleaned'}</span>
        <span>${escapeHtml(ref.blockId)}</span>
        <span class="rtitle">${escapeHtml(ref.key)} → ${escapeHtml(ref.targetId)}</span>
      </div>`,
    )
    .join('');
  inspectorBody.innerHTML = `
    <div class="kind" style="color:var(--danger)">DELETE</div>
    <div class="iid">${escapeHtml(id)}</div>
    ${family.length > 1 ? `<div class="isub">also deletes ${family.length - 1} facts under the document</div>` : ''}
    <div class="sect">INCOMING REFERENCES · ${refs.length}</div>
    ${rows}
    <div class="form-note">"not cleaned" references stay dangling — the compiler flags them.</div>
    <div class="iactions">
      <button class="ibtn danger" id="del-confirm">delete and clean up</button>
      <button class="ibtn" id="del-cancel">cancel</button>
    </div>`;
  document.getElementById('del-confirm')?.addEventListener('click', confirmDelete);
  document.getElementById('del-cancel')?.addEventListener('click', cancelDelete);
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

/** Kinds a drag from `kind` may give birth to. document→fact is legal even
 *  though RELATION has no entry: the ## block under the document IS the wire
 *  (the source edge is derived from containment). */
export function birthKinds(kind: NodeKind): NodeKind[] {
  return (Object.keys(KIND_LABEL) as NodeKind[]).filter(
    (target) =>
      RELATION[`${kind}→${target}`] !== undefined || (kind === 'document' && target === 'fact'),
  );
}

/** Create + wire + focus, per the menu pick. Exported for the smoke test. */
export function dropCreate(fromId: string, kind: NodeKind, at: NodePos): CreateResult {
  const from = nodeById.get(fromId);
  if (!from) return { ok: false, reason: 'unknown node' };
  const res = createNode(kind, {
    at,
    documentId: from.kind === 'document' && kind === 'fact' ? fromId : undefined,
  });
  if (!res.ok || !res.id) return res;
  if (RELATION[`${from.kind}→${kind}`]) {
    const wired = connect(fromId, res.id);
    if (!wired.ok) return { ok: false, id: res.id, reason: wired.reason };
  }
  return res;
}

export function openDropCreateMenu(fromId: string, clientX: number, clientY: number): void {
  const from = nodeById.get(fromId);
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
  const at = toWorldPoint(clientX, clientY);
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

function toWorldPoint(clientX: number, clientY: number): { x: number; y: number } {
  const rect = viewport.getBoundingClientRect();
  return { x: (clientX - rect.left - tx) / zoom, y: (clientY - rect.top - ty) / zoom };
}

function startLink(fromId: string, clientX: number, clientY: number): void {
  const rubber = document.createElementNS(SVG_NS, 'path');
  rubber.setAttribute('class', 'rubber');
  edgesSvg.append(rubber);
  linkDrag = { fromId, rubber };
  updateLink(clientX, clientY);
}

function updateLink(clientX: number, clientY: number): void {
  if (!linkDrag) return;
  const from = nodeById.get(linkDrag.fromId);
  if (!from) return;
  const sx = from.x + NODE_W;
  const sy = from.y + NODE_H / 2;
  const { x, y } = toWorldPoint(clientX, clientY);
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
  const res = connect(drag.fromId, toId);
  if (!res.ok && res.reason) showTip(res.reason, event.clientX, event.clientY);
});

document.addEventListener('keydown', (event) => {
  if (event.key !== 'Delete' && event.key !== 'Backspace') return;
  // Typing surfaces own these keys: inspector fields and the script lens.
  if (event.target instanceof HTMLElement && event.target.closest('.fval, #script-pane')) return;
  if (selectedEdgeKey !== null) {
    const edge = graph.edges.find((e) => edgeKeyOf(e) === selectedEdgeKey);
    if (!edge) return;
    const res = disconnect(edge);
    if (res.ok) {
      applyEdgeSelection(null);
      renderStatus();
    } else if (res.reason) {
      showTip(res.reason, viewport.clientWidth / 2, viewport.clientHeight / 2);
    }
    return;
  }
  // SB-034: Delete on a selected node starts the (reference-aware) delete.
  if (selectedId !== null) requestDelete(selectedId);
});

// ---- pan + zoom ----------------------------------------------------------

let tx = 0;
let ty = 0;
let zoom = 1;

function applyTransform(): void {
  world.style.transform = `translate(${tx}px, ${ty}px) scale(${zoom})`;
  $('z-pct').textContent = `${Math.round(zoom * 100)}%`;
}

function fit(): void {
  const vw = viewport.clientWidth;
  const vh = viewport.clientHeight;
  if (vw === 0 || vh === 0) {
    applyTransform();
    return;
  }
  zoom = Math.min((vw - 60) / extent.width, (vh - 60) / extent.height, 1.4);
  tx = (vw - extent.width * zoom) / 2;
  ty = (vh - extent.height * zoom) / 2;
  applyTransform();
}

function centerOn(id: string): void {
  const node = nodeById.get(id);
  if (!node) return;
  tx = viewport.clientWidth / 2 - (node.x + NODE_W / 2) * zoom;
  ty = viewport.clientHeight / 2 - (node.y + NODE_H / 2) * zoom;
  applyTransform();
}

viewport.addEventListener(
  'wheel',
  (event) => {
    event.preventDefault();
    const rect = viewport.getBoundingClientRect();
    const px = event.clientX - rect.left;
    const py = event.clientY - rect.top;
    const factor = Math.exp(-event.deltaY * 0.0016);
    const next = Math.min(2.5, Math.max(0.12, zoom * factor));
    tx = px - ((px - tx) / zoom) * next;
    ty = py - ((py - ty) / zoom) * next;
    zoom = next;
    applyTransform();
  },
  { passive: false },
);

let panFrom: { x: number; y: number; tx: number; ty: number } | null = null;
viewport.addEventListener('pointerdown', (event) => {
  if ((event.target as HTMLElement).closest('.node, #zoombar, #legend')) return;
  panFrom = { x: event.clientX, y: event.clientY, tx, ty };
  viewport.classList.add('panning');
  viewport.setPointerCapture(event.pointerId);
});
viewport.addEventListener('pointermove', (event) => {
  if (!panFrom) return;
  tx = panFrom.tx + (event.clientX - panFrom.x);
  ty = panFrom.ty + (event.clientY - panFrom.y);
  applyTransform();
});
viewport.addEventListener('pointerup', (event) => {
  const moved = panFrom && Math.hypot(event.clientX - panFrom.x, event.clientY - panFrom.y) > 4;
  if (panFrom && !moved && !(event.target as HTMLElement).closest('.node, #zoombar, #legend'))
    select(null);
  panFrom = null;
  viewport.classList.remove('panning');
});

$('z-in').addEventListener('click', () => {
  zoom = Math.min(2.5, zoom * 1.2);
  applyTransform();
});
$('z-out').addEventListener('click', () => {
  zoom = Math.max(0.12, zoom / 1.2);
  applyTransform();
});
$('z-fit').addEventListener('click', fit);
$('z-layout')?.addEventListener('click', relayout);
document.addEventListener('keydown', (event) => {
  // Esc while typing — inspector field OR the script lens — must not clear
  // the canvas selection mid-thought (SB-041); Esc on the canvas side clears.
  const inTypingSurface =
    event.target instanceof HTMLElement && event.target.closest('.fval, #script-pane');
  if (event.key === 'Escape' && !inTypingSurface) select(null);
});

// ---- status bar ----------------------------------------------------------

function renderStatus(): void {
  const warnings = result.diagnostics.filter((d) => d.severity === 'warning').length;
  const errors = result.diagnostics.filter((d) => d.severity === 'error').length;
  const todos = result.diagnostics.filter((d) => d.code === 'todo-line').length;
  const quiet = result.diagnostics.find((d) => d.code === 'lint-quiet-day');
  const quietDays = quiet?.message.match(/quiet days?\s+([\d,\s]+\d)/i)?.[1].replace(/\s+/g, ' ');

  counts.textContent = `${graph.nodes.length} nodes · ${graph.edges.length} edges`;
  statusbar.innerHTML = `
  <span class="${errors ? 'warn-c' : 'ok'}">compiled ${compileMs}ms${errors ? ` · ${errors} errors` : ''}</span>
  <span>${graph.nodes.length} nodes · ${graph.edges.length} edges</span>
  ${warnings ? `<span class="warn-c">${warnings} warnings</span>` : ''}
  ${todos ? `<span class="warn-c">${todos} TODO</span>` : ''}
  ${quietDays ? `<span class="pacing">pacing — day ${quietDays} quiet</span>` : ''}
  ${draftRestored ? '<span class="warn-c">restored unsaved draft</span>' : ''}
  ${saveNote ? `<span class="${saveNote.startsWith('saved') ? 'ok' : 'warn-c'}">${escapeHtml(saveNote)}</span>` : ''}
  ${lifecycleNote ? `<span class="warn-c">${escapeHtml(lifecycleNote)}</span>` : ''}
  ${selectedEdgeKey ? '<span class="warn-c">edge selected — delete removes the relation</span>' : ''}
  <span class="hint">click node · edit fields · drag port to empty space for new node · delete removes · esc clear</span>`;
}

// ---- boot ----------------------------------------------------------------

rebuild();
fit();
