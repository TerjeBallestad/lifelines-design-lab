// SB-026 probe — Canvas view generated from the real 0.2 compiler output.
// Probe code: outside tsconfig, Vite transpiles it in dev only.
// The playable question: at ~84 nodes, does the generated graph answer real
// authoring questions (what does this fact open? which day is quiet?) —
// or does it collapse into decoration?
import { compileCase } from '../../src/compiler/index.ts';
import initialText from '../../content/cases/olsen/tiny-olsen.case.md?raw';
import { buildGraph, layoutGraph, NODE_W, NODE_H } from './graph.ts';
import type { GraphNode, GraphEdge, NodeKind } from './graph.ts';

const $ = (id: string) => document.getElementById(id) as HTMLElement;
const viewport = $('viewport');
const world = $('world');
const edgesSvg = $('edges') as unknown as SVGSVGElement;
const nodesHost = $('nodes');
const inspectorBody = $('inspector-body');
const statusbar = $('statusbar');
const counts = $('counts');

// ---- compile + derive ----------------------------------------------------

const t0 = performance.now();
const result = compileCase(initialText);
export const graph = buildGraph(result.slice);
const extent = layoutGraph(graph);
const compileMs = Math.round(performance.now() - t0);

const nodeById = new Map(graph.nodes.map((n) => [n.id, n]));
const inOf = new Map<string, GraphEdge[]>();
const outOf = new Map<string, GraphEdge[]>();
for (const edge of graph.edges) {
  if (!outOf.has(edge.from)) outOf.set(edge.from, []);
  if (!inOf.has(edge.to)) inOf.set(edge.to, []);
  outOf.get(edge.from)!.push(edge);
  inOf.get(edge.to)!.push(edge);
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

edgesSvg.setAttribute('width', String(extent.width));
edgesSvg.setAttribute('height', String(extent.height));

const SVG_NS = 'http://www.w3.org/2000/svg';
const edgeEls = new Map<GraphEdge, { path: SVGPathElement; text: SVGTextElement }>();
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

const nodeEls = new Map<string, HTMLElement>();
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

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

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

function renderInspector(id: string | null): void {
  if (!id) {
    inspectorBody.innerHTML = '<div class="empty">Click a node. Esc clears the selection.</div>';
    return;
  }
  const node = nodeById.get(id)!;
  const outs = outOf.get(id) ?? [];
  const ins = inOf.get(id) ?? [];
  inspectorBody.innerHTML = `
    <div class="kind" style="color:var(${KIND_VAR[node.kind]})">${KIND_LABEL[node.kind]}</div>
    <div class="iid">${id}</div>
    <div class="ititle">${escapeHtml(node.title)}</div>
    <div class="isub">${escapeHtml(node.sub)}</div>
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
  if (event.key === 'Escape') select(null);
});

// ---- status bar ----------------------------------------------------------

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
  <span class="hint">click node · esc clear · scroll zoom · drag pan · fit</span>`;

fit();
select(null);
