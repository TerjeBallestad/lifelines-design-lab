// The camera: pan, zoom, fit, and the screen→world transform. SB-081 put
// d3-zoom underneath — it owns the wheel/drag gestures and the transform
// state (viewport.__zoom); this factory keeps the old surface. Arbitration
// with the node/port drags: the filter below rejects pointer-downs on nodes
// and chrome, and the d3-drag behavior in main stops propagation before the
// viewport sees them.
import { select } from 'd3-selection';
import { zoom as zoomBehavior, zoomIdentity, zoomTransform } from 'd3-zoom';
import type { D3ZoomEvent, ZoomTransform } from 'd3-zoom';
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

export const ZOOM_MIN = 0.12;
export const ZOOM_MAX = 2.5;
/** Matches the old exp(-deltaY·0.0016) wheel factor (d3 scales by 2^delta). */
const WHEEL_FACTOR = 0.0016 / Math.LN2;
/** Dot-grid spacing at zoom 1 — must match the #viewport background CSS. */
const GRID = 26;

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

  const behavior = zoomBehavior<HTMLElement, unknown>()
    .scaleExtent([ZOOM_MIN, ZOOM_MAX])
    .wheelDelta((event) => -event.deltaY * WHEEL_FACTOR)
    // Wheel zooms anywhere (over nodes too — the old board did). Drag-pan
    // must not start on a node, the zoombar, or the legend.
    .filter((event: WheelEvent | MouseEvent) => {
      if (event.type === 'wheel') return true;
      // `event.button` truthy = a non-primary mouse button. Touch/pen starts
      // carry no button at all — they must pass, or the board is inert there.
      if (event.button) return false;
      const target = event.target instanceof Element ? event.target : null;
      return !target?.closest('.node, #zoombar, #legend');
    })
    // A pan under 4px still counts as a click (the deselect below); beyond
    // it d3 swallows the click — same threshold the old machine used.
    .clickDistance(4)
    .on('start', (event: D3ZoomEvent<HTMLElement, unknown>) => {
      if (event.sourceEvent?.type === 'mousedown') viewport.classList.add('panning');
    })
    .on('zoom', (event: D3ZoomEvent<HTMLElement, unknown>) => {
      const t = event.transform;
      world.style.transform = `translate(${t.x}px, ${t.y}px) scale(${t.k})`;
      // The dot grid rides the same transform: spacing scales with zoom,
      // the dots themselves stay 1px (the gradient box scales, not its stops).
      viewport.style.backgroundPosition = `${t.x}px ${t.y}px`;
      viewport.style.backgroundSize = `${GRID * t.k}px ${GRID * t.k}px`;
      zoomLabel.textContent = `${Math.round(t.k * 100)}%`;
    })
    .on('end', () => viewport.classList.remove('panning'));

  const sel = select(viewport);
  sel.call(behavior).on('dblclick.zoom', null); // dblclick is unpin, not zoom

  const current = (): ZoomTransform => zoomTransform(viewport);
  const setTransform = (t: ZoomTransform): void => {
    sel.call(behavior.transform, t);
  };

  // Still click on empty canvas → deselect. Only the background layers count
  // — overlays inside the viewport (zoombar, legend, worklist) bubble their
  // clicks here too. d3 suppresses the click ending a real pan (clickDistance).
  viewport.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    if (target !== viewport && target !== world && target.id !== 'edges' && target.id !== 'nodes')
      return;
    opts.onBackgroundClick();
  });

  function fit(): void {
    const vw = viewport.clientWidth;
    const vh = viewport.clientHeight;
    const nodes = opts.getNodes();
    if (vw === 0 || vh === 0 || nodes.length === 0) return;
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
    const k = Math.min((vw - 60) / w, (vh - 60) / h, 1.4);
    setTransform(
      zoomIdentity.translate((vw - w * k) / 2 - minX * k, (vh - h * k) / 2 - minY * k).scale(k),
    );
  }

  function centerOn(id: string): void {
    const node = opts.getNode(id);
    if (!node) return;
    const k = current().k;
    setTransform(
      zoomIdentity
        .translate(
          viewport.clientWidth / 2 - (node.x + NODE_W / 2) * k,
          viewport.clientHeight / 2 - (node.y + NODE_H / 2) * k,
        )
        .scale(k),
    );
  }

  return {
    get zoom() {
      return current().k;
    },
    fit,
    centerOn,
    toWorldPoint(clientX: number, clientY: number) {
      const rect = viewport.getBoundingClientRect();
      const [x, y] = current().invert([clientX - rect.left, clientY - rect.top]);
      return { x, y };
    },
    zoomIn() {
      behavior.scaleBy(sel, 1.2);
    },
    zoomOut() {
      behavior.scaleBy(sel, 1 / 1.2);
    },
  };
}
