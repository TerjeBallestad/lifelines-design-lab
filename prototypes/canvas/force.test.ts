// SB-051 — the force sim is pure, so its invariants are testable headless:
// it settles, it never produces NaN, springs pull neighbours together, and a
// pinned node does not move.
import { describe, it, expect } from 'vitest';
import { createSim, SETTLED } from './force.ts';
import type { CaseGraph, GraphNode } from './graph.ts';

const node = (id: string, x: number, y: number): GraphNode => ({
  id,
  kind: 'fact',
  title: id,
  sub: '',
  x,
  y,
});

const graph = (nodes: GraphNode[], edges: Array<[string, string]>): CaseGraph => ({
  nodes,
  edges: edges.map(([from, to]) => ({ from, to, label: 'supports' })),
  arrivals: new Map(),
});

const run = (sim: ReturnType<typeof createSim>, ticks = 400) => {
  for (let i = 0; i < ticks && sim.alpha > SETTLED; i++) sim.tick();
};

const dist = (a: { x: number; y: number }, b: { x: number; y: number }) =>
  Math.hypot(a.x - b.x, a.y - b.y);

describe('force sim (SB-051)', () => {
  it('settles with finite positions', () => {
    const sim = createSim(
      graph(
        [node('a', 0, 0), node('b', 300, 0), node('c', 0, 80), node('d', 300, 80)],
        [
          ['a', 'b'],
          ['b', 'c'],
        ],
      ),
      new Set(),
    );
    run(sim);
    expect(sim.alpha).toBeLessThanOrEqual(SETTLED);
    for (const n of sim.nodes) {
      expect(Number.isFinite(n.x)).toBe(true);
      expect(Number.isFinite(n.y)).toBe(true);
    }
  });

  it('pulls connected nodes closer than unconnected ones', () => {
    // a—b are wired; c starts as far from a as b does, but stays loose.
    const sim = createSim(
      graph([node('a', 0, 0), node('b', 900, 0), node('c', 0, 900)], [['a', 'b']]),
      new Set(),
    );
    run(sim);
    const [a, b, c] = sim.nodes;
    expect(dist(a, b)).toBeLessThan(dist(a, c));
  });

  it('keeps a pinned node exactly at its seed', () => {
    const sim = createSim(
      graph(
        [node('a', 100, 100), node('b', 130, 110), node('c', 500, 100)],
        [
          ['a', 'b'],
          ['a', 'c'],
        ],
      ),
      new Set(['a']),
    );
    run(sim);
    const a = sim.byId.get('a')!;
    expect(a.x).toBe(100);
    expect(a.y).toBe(100);
    // The unpinned overlap partner moved off the pinned node.
    expect(dist(a, sim.byId.get('b')!)).toBeGreaterThan(60);
  });

  it('separates nodes seeded on the same point', () => {
    const sim = createSim(graph([node('a', 50, 50), node('b', 50, 50)], []), new Set());
    run(sim);
    const [a, b] = sim.nodes;
    expect(dist(a, b)).toBeGreaterThan(40);
    expect(Number.isFinite(a.x) && Number.isFinite(b.x)).toBe(true);
  });
});
