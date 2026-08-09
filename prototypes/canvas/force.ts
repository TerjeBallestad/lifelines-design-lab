// SB-080 — d3-force adapter behind the SB-051 Sim surface ("gravity",
// Obsidian-style). Pure module: no DOM, importable by the page and the test.
//
// The sim owns velocity state; graph nodes stay the render source of truth —
// the page copies sim positions into them each frame. Coordinates are node
// top-left, same as GraphNode. Every force here is translation-invariant
// except the centering pull, whose target is offset by half a node, so the
// top-left convention holds without conversion.
import { forceSimulation, forceManyBody, forceLink, forceX, forceY } from 'd3-force';
import type { Simulation, SimulationLinkDatum } from 'd3-force';
import type { CaseGraph } from './graph.ts';
import { NODE_W, NODE_H } from './graph.ts';
import { createLegacySim } from './force-legacy.ts';

export interface SimNode {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  /** pin mode: a pinned node never moves on its own. */
  pinned: boolean;
  /** true while the pointer holds the node — position is pointer-driven. */
  held: boolean;
  /** d3 fixed-position slots; tick() drives these from pinned/held. */
  fx?: number | null;
  fy?: number | null;
}

export interface Sim {
  nodes: SimNode[];
  byId: Map<string, SimNode>;
  /** cooling factor; the loop stops when it drops under SETTLED. */
  alpha: number;
  tick(): void;
  reheat(alpha?: number): void;
}

export const SETTLED = 0.005;

// ---- engine toggle (SB-080 A/B) --------------------------------------------
// Same Sim surface, two engines: the d3-force adapter below vs the SB-051
// hand-rolled sim in force-legacy.ts. The flag persists so a reload keeps the
// engine under judgment. Guarded: the module stays importable headless.
export type ForceEngine = 'd3' | 'legacy';
const ENGINE_KEY = 'kildeverket-canvas-force-engine';

export let forceEngine: ForceEngine = (() => {
  if (typeof localStorage === 'undefined') return 'd3';
  return localStorage.getItem(ENGINE_KEY) === 'legacy' ? 'legacy' : 'd3';
})();

export function setForceEngine(engine: ForceEngine): void {
  forceEngine = engine;
  if (typeof localStorage !== 'undefined') localStorage.setItem(ENGINE_KEY, engine);
}

/** Per-frame drag reheat. Alpha is global in d3-force — a hot drag stirs the
 *  whole cloud — so the adapter runs colder. The legacy sim keeps the 0.3 it
 *  was judged with, so the A/B compares each engine at its own best. */
export function dragReheat(): number {
  return forceEngine === 'legacy' ? 0.3 : 0.08;
}

// Feel knobs. The old hand-rolled sim squeezed dx in its distance metric so
// the wide cards spread further on x; the elliptical collide below carries
// that anisotropy for d3.
// The legacy sim reads as pure short-range separation: inverse-square
// repulsion is spent past ~200px and forces clamp. Mimic that — collide does
// the separating, charge is a whisper that only untangles near-overlaps.
const CHARGE = -150;
const CHARGE_MAX_DISTANCE = 350; // short charge reach — a moved node only shoves its neighbours
const SPRING_LENGTH = 300; // ideal edge length, node center to center
const SPRING_K = 0.1; // link stiffness; d3's adaptive default read too springy
// Elliptical collide semi-axes: min separation is 2× these, so cards sit
// ~220px apart on x but may pack to ~74px on y — the anisotropy the legacy
// X_SQUEEZE metric gave, which a circular forceCollide cannot express.
const COLLIDE_RX = NODE_W / 2 + 6;
const COLLIDE_RY = NODE_H / 2 + 8;
const COLLIDE_STRENGTH = 0.7;
const CENTER_PULL = 0.02;
const VELOCITY_DECAY = 0.9; // heavier friction than d3's 0.4 — less overshoot

type SimLink = SimulationLinkDatum<SimNode>;

/** Card-shaped collision: each node is an ellipse (rx, ry). In the scaled
 *  space where ellipses become unit circles, a pair overlaps under scaled
 *  distance 2 — push both apart along the scaled direction, like d3's own
 *  forceCollide but anisotropic. O(n²): a case is tens of nodes. */
function ellipseCollide(nodes: SimNode[], rx: number, ry: number, strength: number) {
  return () => {
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i];
        const b = nodes[j];
        let sx = (b.x + b.vx - a.x - a.vx) / rx;
        let sy = (b.y + b.vy - a.y - a.vy) / ry;
        let d2 = sx * sx + sy * sy;
        if (d2 >= 4) continue;
        if (d2 < 1e-6) {
          // Coincident seeds (fresh stubs): a deterministic index nudge.
          sx = (i % 3) - 1 || 1;
          sy = ((j % 3) - 1) * 0.5 + 0.5;
          d2 = sx * sx + sy * sy;
        }
        const d = Math.sqrt(d2);
        const push = (((2 - d) / d) * strength) / 2;
        const px = sx * push * rx;
        const py = sy * push * ry;
        b.vx += px;
        b.vy += py;
        a.vx -= px;
        a.vy -= py;
      }
    }
  };
}

/**
 * Build a simulation over the graph. Nodes start from their current graph
 * positions (the lanes/sticky pass is the seed — d3-force's default random
 * source is a deterministic LCG, so coincident-seed separation is stable).
 * `pinned` ids keep their seed position until dragged.
 */
export function createSim(graph: CaseGraph, pinned: ReadonlySet<string>): Sim {
  return forceEngine === 'legacy' ? createLegacySim(graph, pinned) : createD3Sim(graph, pinned);
}

export function createD3Sim(graph: CaseGraph, pinned: ReadonlySet<string>): Sim {
  const nodes: SimNode[] = graph.nodes.map((n) => ({
    id: n.id,
    x: n.x,
    y: n.y,
    vx: 0,
    vy: 0,
    pinned: pinned.has(n.id),
    held: false,
  }));
  const byId = new Map(nodes.map((n) => [n.id, n]));

  const links: SimLink[] = graph.edges
    .filter((e) => byId.has(e.from) && byId.has(e.to))
    .map((e) => ({ source: e.from, target: e.to }));

  // The centering target is the seed centroid, fixed for the sim's lifetime:
  // the cloud tightens in place instead of migrating toward the origin.
  let cx = 0;
  let cy = 0;
  for (const n of nodes) {
    cx += n.x + NODE_W / 2;
    cy += n.y + NODE_H / 2;
  }
  cx /= Math.max(1, nodes.length);
  cy /= Math.max(1, nodes.length);

  const simulation: Simulation<SimNode, SimLink> = forceSimulation(nodes)
    .stop() // layout-modes drives ticks; d3's internal timer stays off
    .velocityDecay(VELOCITY_DECAY)
    .force('charge', forceManyBody<SimNode>().strength(CHARGE).distanceMax(CHARGE_MAX_DISTANCE))
    .force(
      'link',
      forceLink<SimNode, SimLink>(links)
        .id((n) => n.id)
        .distance(SPRING_LENGTH)
        .strength(SPRING_K),
    )
    .force('collide', ellipseCollide(nodes, COLLIDE_RX, COLLIDE_RY, COLLIDE_STRENGTH))
    .force('x', forceX<SimNode>(cx - NODE_W / 2).strength(CENTER_PULL))
    .force('y', forceY<SimNode>(cy - NODE_H / 2).strength(CENTER_PULL));

  return {
    nodes,
    byId,
    get alpha() {
      return simulation.alpha();
    },
    set alpha(a: number) {
      simulation.alpha(a);
    },
    reheat(alpha = 0.6) {
      simulation.alpha(Math.max(simulation.alpha(), alpha));
    },
    tick() {
      // pinned/held are the callers' vocabulary; fx/fy is d3's. Held nodes
      // are pointer-driven (main writes x/y), so fixing them at their own
      // position parks them for d3 while the pointer keeps moving them.
      for (const n of nodes) {
        if (n.pinned || n.held) {
          n.fx = n.x;
          n.fy = n.y;
        } else {
          n.fx = null;
          n.fy = null;
        }
      }
      simulation.tick();
    },
  };
}
