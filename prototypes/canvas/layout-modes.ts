// Node placement: the sticky position store (SB-034), the three layout
// modes behind one toggle (SB-051), and the force-sim lifecycle the two
// gravity modes run on. Owns `extent` (the world size renderWorld sizes the
// edge svg to) and the localStorage stores; rendering stays out — the sim
// loop reports frames through a callback main wires to syncPositions.
import { observable } from 'mobx';
import { layoutGraph, stickyLayout } from './graph.ts';
import type { NodePos } from './graph.ts';
import { createSim, SETTLED } from './force.ts';
import type { Sim } from './force.ts';
import * as model from './model.ts';

// Per-case position store. Stored positions survive every rebuild; the
// barycenter layout runs only when the store is empty (first load or an
// explicit 're-layout'). Stale ids are kept — a block that vanishes over
// a broken compile keeps its slot when it comes back.
export const POS_KEY = 'kildeverket-canvas-pos:content/cases/olsen/tiny-olsen.case.md';

// Three layout candidates behind one toggle:
//   hand    — kind columns + sticky drag placement (the SB-034 store)
//   gravity — force-directed, always floating; positions are view-time only
//   pin     — gravity until you drag: a drag pins the node, double-click frees
// Gravity/pin never write the hand store — switching back to `hand` restores
// the placement you authored there byte-for-byte.
export type LayoutMode = 'hand' | 'gravity' | 'pin';
const MODE_KEY = 'kildeverket-canvas-mode:content/cases/olsen/tiny-olsen.case.md';
const PIN_KEY = 'kildeverket-canvas-pins:content/cases/olsen/tiny-olsen.case.md';

const bootMode: LayoutMode = (() => {
  const raw = localStorage.getItem(MODE_KEY);
  return raw === 'gravity' || raw === 'pin' ? raw : 'hand';
})();

/** SB-078: observable mode — the status-bar autorun reads the hint off it. */
export const layoutUi = observable({ mode: bootMode });

// Probe-surface mirror of layoutUi.mode (main re-exports the live binding).
// Assigned only in setModeState.
export let layoutMode: LayoutMode = bootMode;

export let extent = { width: 1, height: 1 };

export function loadPositions(): Map<string, NodePos> {
  try {
    const raw = localStorage.getItem(POS_KEY);
    if (!raw) return new Map();
    return new Map(Object.entries(JSON.parse(raw) as Record<string, NodePos>));
  } catch {
    return new Map();
  }
}

export function savePositions(): void {
  const stored = loadPositions();
  for (const node of model.state.graph.nodes) stored.set(node.id, { x: node.x, y: node.y });
  localStorage.setItem(POS_KEY, JSON.stringify(Object.fromEntries(stored)));
}

/** Pre-store one position (SB-042 drop-create) so the sticky layout lands
 *  the newborn node at the drop point instead of the column end. */
export function storePosition(id: string, at: NodePos): void {
  const stored = loadPositions();
  stored.set(id, { x: at.x, y: at.y });
  localStorage.setItem(POS_KEY, JSON.stringify(Object.fromEntries(stored)));
}

/** Pinned nodes and their positions — presence in the map means pinned. */
function loadPins(): Map<string, NodePos> {
  try {
    const raw = localStorage.getItem(PIN_KEY);
    if (!raw) return new Map();
    return new Map(Object.entries(JSON.parse(raw) as Record<string, NodePos>));
  } catch {
    return new Map();
  }
}

export function persistPins(): void {
  if (!sim) return;
  const out: Record<string, NodePos> = {};
  for (const sn of sim.nodes) if (sn.pinned) out[sn.id] = { x: sn.x, y: sn.y };
  localStorage.setItem(PIN_KEY, JSON.stringify(out));
}

// ---- force-sim lifecycle ---------------------------------------------------

let sim: Sim | null = null;
let rafId: number | null = null;
/** Wired by main to render.syncPositions — the sim never touches the DOM. */
let onFrame: () => void = () => {};

export function setFrameCallback(fn: () => void): void {
  onFrame = fn;
}

export function getSim(): Sim | null {
  return sim;
}

export function isPinned(id: string): boolean {
  return layoutMode === 'pin' && (sim?.byId.get(id)?.pinned ?? false);
}

function stopSim(): void {
  if (rafId !== null) cancelAnimationFrame(rafId);
  rafId = null;
  sim = null;
}

export function startSimLoop(): void {
  if (sim && rafId === null) rafId = requestAnimationFrame(simStep);
}

function simStep(): void {
  if (!sim) {
    rafId = null;
    return;
  }
  sim.tick();
  sim.tick();
  for (const sn of sim.nodes) {
    const node = model.state.nodeById.get(sn.id);
    if (node) {
      node.x = sn.x;
      node.y = sn.y;
    }
  }
  onFrame();
  rafId = sim.alpha > SETTLED ? requestAnimationFrame(simStep) : null;
}

/** Position every node for the current mode. Called on rebuild + mode switch. */
export function applyLayout(): void {
  if (layoutMode === 'hand') {
    stopSim();
    extent = stickyLayout(model.state.graph, loadPositions());
    savePositions();
    return;
  }
  // Force modes. Seed order: sticky base (drop-create points land where
  // dropped), then the live sim's positions (typing must not make the cloud
  // jump), then pinned positions. No savePositions — the hand store is
  // sacred to the hand mode.
  const seed = new Map<string, NodePos>();
  if (sim) for (const sn of sim.nodes) seed.set(sn.id, { x: sn.x, y: sn.y });
  extent = stickyLayout(model.state.graph, loadPositions());
  for (const node of model.state.graph.nodes) {
    const pos = seed.get(node.id);
    if (pos) {
      node.x = pos.x;
      node.y = pos.y;
    }
  }
  const pins = layoutMode === 'pin' ? loadPins() : new Map<string, NodePos>();
  for (const node of model.state.graph.nodes) {
    const pos = pins.get(node.id);
    if (pos) {
      node.x = pos.x;
      node.y = pos.y;
    }
  }
  stopSim();
  sim = createSim(model.state.graph, new Set(pins.keys()));
  startSimLoop();
}

/** State half of 're-layout' — forget placement in the current mode and lay
 *  out again. The caller re-renders and refits. */
export function relayoutState(): void {
  if (layoutMode === 'hand') {
    localStorage.removeItem(POS_KEY);
    extent = layoutGraph(model.state.graph);
    savePositions();
  } else {
    // Force modes: drop the pins (pin mode) and reseed from one barycenter
    // pass so the cloud reforms from a clean shape, not its own tangle.
    if (layoutMode === 'pin') localStorage.removeItem(PIN_KEY);
    stopSim();
    extent = layoutGraph(model.state.graph);
    sim = createSim(model.state.graph, new Set());
    startSimLoop();
  }
}

/** State half of a mode switch — persist the mode and re-apply the layout. */
export function setModeState(mode: LayoutMode): void {
  layoutUi.mode = mode;
  layoutMode = mode;
  localStorage.setItem(MODE_KEY, mode);
  applyLayout();
}
