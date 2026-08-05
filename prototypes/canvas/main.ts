// SB-026 probe — Canvas view generated from the real 0.2 compiler output.
// SB-032 — the inspector becomes the edit surface: per-kind forms write
// markup patches (src/compiler/patch.ts), POST /__save-case, recompile,
// re-render. The markup stays the store (DD-003).
// Probe code: outside tsconfig, Vite transpiles it in dev only.
import { compileCase } from '../../src/compiler/index.ts';
import type { CompileResult } from '../../src/compiler/index.ts';
import { parseCaseText } from '../../src/compiler/parse.ts';
import type { RawBlock } from '../../src/compiler/parse.ts';
import { DiagnosticBag } from '../../src/compiler/diagnostics.ts';
import { patchField } from '../../src/compiler/patch.ts';
import initialText from '../../content/cases/olsen/tiny-olsen.case.md?raw';
import { buildGraph, layoutGraph, NODE_W, NODE_H } from './graph.ts';
import type { CaseGraph, GraphNode, GraphEdge, NodeKind } from './graph.ts';

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
  graph = buildGraph(result.slice);
  extent = layoutGraph(graph);
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
}

// ---- render --------------------------------------------------------------

const KIND_LABEL: Record<NodeKind, string> = {
  document: 'DOKUMENT',
  fact: 'FAKTUM',
  question: 'SPØRSMÅL',
  hypothesis: 'HYPOTESE',
  tiltak: 'TILTAK',
  dispatch: 'DISPATCH',
  clock: 'KLOKKE',
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
    edgesSvg.append(path, text);
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
    nodesHost.append(el);
    nodeEls.set(node.id, el);
  }
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
const escapeAttr = (s: string) => escapeHtml(s).replace(/"/g, '&quot;');

const legend = $('legend');
legend.innerHTML = (Object.keys(KIND_LABEL) as NodeKind[])
  .map(
    (kind) =>
      `<span><span class="dot" style="background:var(${KIND_VAR[kind]})"></span>${KIND_LABEL[kind]}</span>`,
  )
  .join('');

// ---- selection -----------------------------------------------------------

export let selectedId: string | null = null;

export function select(id: string | null): void {
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
}
const FORM_FIELDS: Record<NodeKind, FieldSpec[]> = {
  document: [{ keys: ['Title'] }, { keys: ['Peek'] }, { keys: ['Meta'] }],
  fact: [
    { keys: ['Label'] },
    { keys: ['Summary'], multiline: true },
    { keys: ['Category'] },
    { keys: ['Quote'], multiline: true },
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
    const control = spec.multiline
      ? `<textarea class="fval" data-key="${escapeAttr(key)}" rows="3">${escapeHtml(value)}</textarea>`
      : `<input class="fval" data-key="${escapeAttr(key)}" value="${escapeAttr(value)}" />`;
    return `<label class="field"><span class="fkey">${escapeHtml(key)}</span>${control}</label>`;
  });
  return `<div class="sect">FELTER</div>${rows.join('')}<div class="form-note" id="form-note"></div>`;
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
  return `<div class="sect">DIAGNOSTIKK · ${diags.length}</div>${rows.join('')}`;
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
    ${ins.map((e) => relRow(e, e.from)).join('') || '<div class="empty">no inbound — entry point</div>'}`;
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
  caseText = patched;
  localStorage.setItem(DRAFT_KEY, caseText);
  rebuild();
  void persist();
}

let saveNote = '';

async function persist(): Promise<void> {
  try {
    const res = await fetch('/__save-case', { method: 'POST', body: caseText });
    if (!res.ok) throw new Error(await res.text());
    localStorage.removeItem(DRAFT_KEY);
    draftRestored = false;
    const t = new Date();
    saveNote = `saved ${String(t.getHours()).padStart(2, '0')}:${String(t.getMinutes()).padStart(2, '0')}`;
  } catch (err) {
    saveNote = `save failed — draft kept (${err instanceof Error ? err.message : String(err)})`;
  }
  renderStatus();
}

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
document.addEventListener('keydown', (event) => {
  const inField = event.target instanceof HTMLElement && event.target.closest('.fval');
  if (event.key === 'Escape' && !inField) select(null);
});

// ---- status bar ----------------------------------------------------------

function renderStatus(): void {
  const warnings = result.diagnostics.filter((d) => d.severity === 'warning').length;
  const errors = result.diagnostics.filter((d) => d.severity === 'error').length;
  const quiet = result.diagnostics.find((d) => d.code === 'lint-quiet-day');
  const quietDays = quiet?.message.match(/quiet days?\s+([\d,\s]+\d)/i)?.[1].replace(/\s+/g, ' ');

  counts.textContent = `${graph.nodes.length} noder · ${graph.edges.length} kanter`;
  statusbar.innerHTML = `
  <span class="${errors ? 'warn-c' : 'ok'}">compiled ${compileMs}ms${errors ? ` · ${errors} errors` : ''}</span>
  <span>${graph.nodes.length} nodes · ${graph.edges.length} edges</span>
  ${warnings ? `<span class="warn-c">${warnings} warnings</span>` : ''}
  ${quietDays ? `<span class="pacing">pacing — day ${quietDays} quiet</span>` : ''}
  ${draftRestored ? '<span class="warn-c">restored unsaved draft</span>' : ''}
  ${saveNote ? `<span class="${saveNote.startsWith('saved') ? 'ok' : 'warn-c'}">${escapeHtml(saveNote)}</span>` : ''}
  <span class="hint">click node · edit fields · esc clear · scroll zoom · drag pan · fit</span>`;
}

// ---- boot ----------------------------------------------------------------

rebuild();
fit();
