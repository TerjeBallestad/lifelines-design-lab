// The camera: pan, zoom, fit, and the screen→world transform. A factory —
// main owns the viewport/world elements and wires the background-click
// deselect; everything transform-shaped lives here.
import { NODE_W, NODE_H } from './graph.ts';
import type { GraphNode } from './graph.ts';

export interface Camera {
  readonly zoom: number;
  fit(): void;
  centerOn(id: string): void;
  toWorldPoint(clientX: number, clientY: number): { x: number; y: number };
  zoomIn(): void;
  zoomOut(): void;
}

export function createCamera(opts: {
  viewport: HTMLElement;
  world: HTMLElement;
  zoomLabel: HTMLElement;
  getNodes(): GraphNode[];
  getNode(id: string): GraphNode | undefined;
  /** A still click on empty canvas — main clears the selection. */
  onBackgroundClick(): void;
}): Camera {
  const { viewport, world, zoomLabel } = opts;
  let tx = 0;
  let ty = 0;
  let zoom = 1;

  function applyTransform(): void {
    world.style.transform = `translate(${tx}px, ${ty}px) scale(${zoom})`;
    zoomLabel.textContent = `${Math.round(zoom * 100)}%`;
  }

  function fit(): void {
    const vw = viewport.clientWidth;
    const vh = viewport.clientHeight;
    const nodes = opts.getNodes();
    if (vw === 0 || vh === 0 || nodes.length === 0) {
      applyTransform();
      return;
    }
    // Live bounds, not the layout extent — force-mode nodes roam freely
    // (including into negative coordinates; the edges svg overflows visibly).
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (const n of nodes) {
      minX = Math.min(minX, n.x);
      minY = Math.min(minY, n.y);
      maxX = Math.max(maxX, n.x + NODE_W);
      maxY = Math.max(maxY, n.y + NODE_H);
    }
    const w = Math.max(1, maxX - minX);
    const h = Math.max(1, maxY - minY);
    zoom = Math.min((vw - 60) / w, (vh - 60) / h, 1.4);
    tx = (vw - w * zoom) / 2 - minX * zoom;
    ty = (vh - h * zoom) / 2 - minY * zoom;
    applyTransform();
  }

  function centerOn(id: string): void {
    const node = opts.getNode(id);
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
      opts.onBackgroundClick();
    panFrom = null;
    viewport.classList.remove('panning');
  });

  return {
    get zoom() {
      return zoom;
    },
    fit,
    centerOn,
    toWorldPoint(clientX: number, clientY: number) {
      const rect = viewport.getBoundingClientRect();
      return { x: (clientX - rect.left - tx) / zoom, y: (clientY - rect.top - ty) / zoom };
    },
    zoomIn() {
      zoom = Math.min(2.5, zoom * 1.2);
      applyTransform();
    },
    zoomOut() {
      zoom = Math.max(0.12, zoom / 1.2);
      applyTransform();
    },
  };
}
