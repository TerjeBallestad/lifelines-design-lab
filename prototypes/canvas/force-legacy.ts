// SB-080 A/B — the SB-051 hand-rolled sim, kept verbatim as the "legacy"
// engine while the d3-force adapter is judged against it. Delete the loser.
//
// The sim owns velocity state; graph nodes stay the render source of truth —
// the page copies sim positions into them each frame. Coordinates are node
// top-left, same as GraphNode, so the copy is 1:1.
import type { CaseGraph } from './graph.ts';
import { NODE_W, NODE_H } from './graph.ts';
import type { Sim, SimNode } from './force.ts';

// Nodes are ~4× wider than tall. Shrinking dx in the distance metric makes
// horizontal neighbours read as closer, so repulsion spreads them further
// apart on x — without it the wide cards overlap edge-to-edge.
const X_SQUEEZE = 0.45;
const REPULSION = 26000; // ~inverse-square strength
const SPRING_LENGTH = 300; // ideal edge length, node center to center
const SPRING_K = 0.018;
const CENTER_PULL = 0.012;
const FRICTION = 0.58;
const ALPHA_DECAY = 0.022;
const MAX_FORCE = 60;

const clamp = (v: number, lim: number) => Math.max(-lim, Math.min(lim, v));

/**
 * Build a simulation over the graph. Nodes start from their current graph
 * positions (the lanes/sticky pass is the seed — deterministic, no RNG).
 * `pinned` ids keep their seed position until dragged.
 */
export function createLegacySim(graph: CaseGraph, pinned: ReadonlySet<string>): Sim {
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

  // Springs act on indices, resolved once — edge ids never change mid-sim.
  const indexOf = new Map(nodes.map((n, i) => [n.id, i]));
  const springs: Array<[number, number]> = [];
  for (const edge of graph.edges) {
    const a = indexOf.get(edge.from);
    const b = indexOf.get(edge.to);
    if (a !== undefined && b !== undefined) springs.push([a, b]);
  }

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

  const fx = new Float64Array(nodes.length);
  const fy = new Float64Array(nodes.length);

  const sim: Sim = {
    nodes,
    byId,
    alpha: 1,
    reheat(alpha = 0.6) {
      sim.alpha = Math.max(sim.alpha, alpha);
    },
    tick() {
      fx.fill(0);
      fy.fill(0);

      // Pairwise repulsion. O(n²) — a case is tens of nodes, not thousands.
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          let dx = (nodes[j].x - nodes[i].x) * X_SQUEEZE;
          let dy = nodes[j].y - nodes[i].y;
          let d2 = dx * dx + dy * dy;
          if (d2 < 1) {
            // Coincident seeds (fresh stubs): a deterministic index nudge.
            dx = X_SQUEEZE * ((i % 3) - 1 || 1);
            dy = ((j % 3) - 1) * 0.5 + 0.5;
            d2 = dx * dx + dy * dy;
          }
          const d = Math.sqrt(d2);
          const f = REPULSION / d2;
          const ux = dx / d;
          const uy = dy / d;
          fx[i] -= clamp(f * ux, MAX_FORCE);
          fy[i] -= clamp(f * uy, MAX_FORCE);
          fx[j] += clamp(f * ux, MAX_FORCE);
          fy[j] += clamp(f * uy, MAX_FORCE);
        }
      }

      // Edge springs, node center to node center.
      for (const [ia, ib] of springs) {
        const a = nodes[ia];
        const b = nodes[ib];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const d = Math.max(1, Math.hypot(dx, dy));
        const f = (d - SPRING_LENGTH) * SPRING_K;
        fx[ia] += clamp((f * dx) / d, MAX_FORCE);
        fy[ia] += clamp((f * dy) / d, MAX_FORCE);
        fx[ib] -= clamp((f * dx) / d, MAX_FORCE);
        fy[ib] -= clamp((f * dy) / d, MAX_FORCE);
      }

      // Weak pull toward the seed centroid keeps islands from drifting off.
      for (let i = 0; i < nodes.length; i++) {
        fx[i] += (cx - (nodes[i].x + NODE_W / 2)) * CENTER_PULL;
        fy[i] += (cy - (nodes[i].y + NODE_H / 2)) * CENTER_PULL;
      }

      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        if (n.pinned || n.held) {
          n.vx = 0;
          n.vy = 0;
          continue;
        }
        n.vx = (n.vx + fx[i] * sim.alpha) * FRICTION;
        n.vy = (n.vy + fy[i] * sim.alpha) * FRICTION;
        n.x += n.vx;
        n.y += n.vy;
      }
      sim.alpha *= 1 - ALPHA_DECAY;
    },
  };
  return sim;
}
