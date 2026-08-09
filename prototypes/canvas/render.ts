// The board renderer: nodes as absolutely-placed divs, edges as SVG beziers,
// plus the hover legend. Owns the element maps a render produces; selection
// styling stays in main (it iterates these maps). Interactions are injected —
// the renderer raises events, the shell decides what they mean.
import { NODE_W, NODE_H } from './graph.ts';
import type { GraphNode, GraphEdge, NodeKind } from './graph.ts';
import { KIND_LABEL, KIND_VAR, escapeHtml } from './kinds.ts';
import * as model from './model.ts';
import * as layout from './layout-modes.ts';

const SVG_NS = 'http://www.w3.org/2000/svg';

export interface RenderHandlers {
  onSelectNode(id: string): void;
  onSelectEdge(key: string): void;
  onStartMove(id: string, clientX: number, clientY: number): void;
  onStartLink(id: string, clientX: number, clientY: number): void;
  onUnpin(id: string): void;
  /** True consumes a post-drag click — placement, not selection (SB-051). */
  consumeSuppressedClick(): boolean;
  edgeKeyOf(edge: GraphEdge): string;
  selectedEdgeKey(): string | null;
}

let edgesSvg: SVGSVGElement;
let nodesHost: HTMLElement;
let handlers: RenderHandlers;

export function initRenderer(opts: {
  edgesSvg: SVGSVGElement;
  nodesHost: HTMLElement;
  handlers: RenderHandlers;
}): void {
  edgesSvg = opts.edgesSvg;
  nodesHost = opts.nodesHost;
  handlers = opts.handlers;
}

export let edgeEls = new Map<
  GraphEdge,
  { path: SVGPathElement; hit: SVGPathElement; text: SVGTextElement }
>();
export let nodeEls = new Map<string, HTMLElement>();

/** Bezier + label anchor for an edge — shared by full render and sim frames. */
function edgeGeometry(from: GraphNode, to: GraphNode): { d: string; mx: number; my: number } {
  const forward = to.x >= from.x + NODE_W;
  const sx = forward ? from.x + NODE_W : from.x;
  const ex = forward ? to.x : to.x + NODE_W;
  const sy = from.y + NODE_H / 2;
  const ey = to.y + NODE_H / 2;
  const reach = Math.max(Math.abs(ex - sx) / 2, 44) * (forward ? 1 : -1);
  return {
    d: `M ${sx} ${sy} C ${sx + reach} ${sy}, ${ex - reach} ${ey}, ${ex} ${ey}`,
    mx: (sx + ex) / 2,
    my: (sy + ey) / 2 - 4,
  };
}

/** SB-051: move existing DOM to the current node positions — no rebuild. */
export function syncPositions(): void {
  for (const node of model.state.graph.nodes) {
    const el = nodeEls.get(node.id);
    if (!el) continue;
    el.style.left = `${node.x}px`;
    el.style.top = `${node.y}px`;
  }
  for (const [edge, els] of edgeEls) {
    const from = model.state.nodeById.get(edge.from);
    const to = model.state.nodeById.get(edge.to);
    if (!from || !to) continue;
    const g = edgeGeometry(from, to);
    els.path.setAttribute('d', g.d);
    els.hit.setAttribute('d', g.d);
    els.text.setAttribute('x', String(g.mx));
    els.text.setAttribute('y', String(g.my));
  }
}

export function renderWorld(): void {
  edgesSvg.setAttribute('width', String(layout.extent.width));
  edgesSvg.setAttribute('height', String(layout.extent.height));
  while (edgesSvg.firstChild) edgesSvg.firstChild.remove();
  nodesHost.innerHTML = '';
  edgeEls = new Map();
  nodeEls = new Map();

  for (const edge of model.state.graph.edges) {
    const from = model.state.nodeById.get(edge.from)!;
    const to = model.state.nodeById.get(edge.to)!;
    const g = edgeGeometry(from, to);
    const path = document.createElementNS(SVG_NS, 'path');
    path.setAttribute('d', g.d);
    const text = document.createElementNS(SVG_NS, 'text');
    text.setAttribute('x', String(g.mx));
    text.setAttribute('y', String(g.my));
    text.setAttribute('text-anchor', 'middle');
    text.textContent = edge.label;
    text.style.display = 'none';
    // Invisible fat twin of the path: the click target for edge selection.
    const hit = document.createElementNS(SVG_NS, 'path');
    hit.setAttribute('d', g.d);
    hit.setAttribute('class', 'hit');
    hit.setAttribute('data-edge', handlers.edgeKeyOf(edge));
    hit.addEventListener('click', (event) => {
      event.stopPropagation();
      handlers.onSelectEdge(handlers.edgeKeyOf(edge));
    });
    if (handlers.edgeKeyOf(edge) === handlers.selectedEdgeKey())
      path.classList.add('edge-selected');
    edgesSvg.append(path, hit, text);
    edgeEls.set(edge, { path, hit, text });
  }

  for (const node of model.state.graph.nodes) {
    const el = document.createElement('div');
    // SB-049: a stub renders as a ghost — dashed border, id for a title.
    const pinned = layout.isPinned(node.id);
    el.className = `node k-${node.kind}${node.stub ? ' stub' : ''}${pinned ? ' pinned' : ''}`;
    el.style.left = `${node.x}px`;
    el.style.top = `${node.y}px`;
    el.dataset.id = node.id;
    el.innerHTML = `
    <div class="nid">${node.id.toUpperCase()}</div>
    <div class="ntitle">${escapeHtml(node.title)}</div>
    <div class="nsub">${escapeHtml(node.sub)}</div>`;
    el.addEventListener('click', (event) => {
      event.stopPropagation();
      // A drag that moved the node ends in a click — placement, not selection.
      if (handlers.consumeSuppressedClick()) return;
      handlers.onSelectNode(node.id);
    });
    // SB-051: drag the node body to place it (hand: sticks; pin: pins;
    // gravity: stirs). The port child stops propagation, so edge drags win.
    el.addEventListener('pointerdown', (event) => {
      if (event.button !== 0) return;
      event.stopPropagation();
      el.setPointerCapture(event.pointerId);
      handlers.onStartMove(node.id, event.clientX, event.clientY);
    });
    el.addEventListener('dblclick', () => handlers.onUnpin(node.id));
    // SB-033: the port — drag from here to a legal target to author an edge.
    const port = document.createElement('div');
    port.className = 'port';
    port.title = 'drag from port for a new edge';
    port.addEventListener('pointerdown', (event) => {
      event.stopPropagation();
      event.preventDefault();
      handlers.onStartLink(node.id, event.clientX, event.clientY);
    });
    el.append(port);
    nodesHost.append(el);
    nodeEls.set(node.id, el);
  }
}

// SB-051 feedback: a chip that unfolds on hover — the always-open strip was
// in the zoombar's way. The teal weave family collapses to one row.
export function initLegend(legend: HTMLElement): void {
  const LEGEND_KINDS: NodeKind[] = [
    'document',
    'fact',
    'question',
    'hypothesis',
    'tiltak',
    'dispatch',
    'clock',
  ];
  legend.innerHTML =
    `<span class="ltag">legend</span><div class="lbody">` +
    LEGEND_KINDS.map(
      (kind) =>
        `<span><span class="dot" style="background:var(${KIND_VAR[kind]})"></span>${KIND_LABEL[kind]}</span>`,
    ).join('') +
    `<span><span class="dot" style="background:var(--teal)"></span>WEAVE — conversation · recipe · proposal</span>` +
    // SB-039: the two port shapes confused on first contact — name them here.
    `<span title="hover a node — the ring on its right edge is the drag source for a new edge"><span class="ring"></span>drag → new edge</span>
   <span title="the line into a node's left side is derived from the markup (e.g. document feeds fact) — edit the fields, not the line"><span class="wire"></span>derived link</span></div>`;
}
