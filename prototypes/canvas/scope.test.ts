// @vitest-environment jsdom
// SB-077 — the pure scoping logic, checked against the real Olsen graph.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const ROOT = process.cwd();
const caseText = readFileSync(`${ROOT}/content/cases/olsen/tiny-olsen.case.md`, 'utf8');

async function olsenGraph() {
  const { compileCase } = await import('../../src/compiler/index.ts');
  const { buildGraph } = await import('./graph.ts');
  return buildGraph(compileCase(caseText).slice);
}

describe('neighborhood', () => {
  it('holds only the root at 0 hops and grows monotonically with the radius', async () => {
    const graph = await olsenGraph();
    const { neighborhood } = await import('./scope.ts');
    const root = graph.nodes.find((n) => n.kind === 'question')!.id;
    const h0 = neighborhood(graph, root, 0);
    expect([...h0]).toEqual([root]);
    const h1 = neighborhood(graph, root, 1);
    const h2 = neighborhood(graph, root, 2);
    expect(h1.size).toBeGreaterThan(1);
    for (const id of h1) expect(h2.has(id)).toBe(true);
    expect(h2.size).toBeGreaterThan(h1.size);
  });

  it('walks edges in both directions — a fact reaches its document upstream', async () => {
    const graph = await olsenGraph();
    const { neighborhood } = await import('./scope.ts');
    const edge = graph.edges.find((e) => e.label === 'source')!;
    // source edges run document → fact; one hop from the fact must reach back.
    expect(neighborhood(graph, edge.to, 1).has(edge.from)).toBe(true);
  });
});

describe('visibleNodeIds', () => {
  it('shows everything with no scope active', async () => {
    const graph = await olsenGraph();
    const { visibleNodeIds } = await import('./scope.ts');
    const visible = visibleNodeIds(graph, {
      hiddenChips: new Set(),
      focusRoot: null,
      hops: 2,
    });
    expect(visible.size).toBe(graph.nodes.length);
  });

  it('a hidden chip removes its whole family, weave folds three kinds', async () => {
    const graph = await olsenGraph();
    const { visibleNodeIds, CHIP_OF_KIND } = await import('./scope.ts');
    const visible = visibleNodeIds(graph, {
      hiddenChips: new Set(['weave', 'clock'] as const),
      focusRoot: null,
      hops: 2,
    });
    for (const node of graph.nodes) {
      const chip = CHIP_OF_KIND[node.kind];
      expect(visible.has(node.id)).toBe(chip !== 'weave' && chip !== 'clock');
    }
  });

  it('focus intersects with the kind filter but never hides the root', async () => {
    const graph = await olsenGraph();
    const { visibleNodeIds } = await import('./scope.ts');
    const root = graph.nodes.find((n) => n.kind === 'question')!.id;
    const visible = visibleNodeIds(graph, {
      hiddenChips: new Set(['question'] as const),
      focusRoot: root,
      hops: 1,
    });
    expect(visible.has(root)).toBe(true);
    for (const id of visible) {
      if (id === root) continue;
      expect(graph.nodes.find((n) => n.id === id)!.kind).not.toBe('question');
    }
  });
});

describe('edgeVisible', () => {
  it('an edge needs both ends visible', async () => {
    const { edgeVisible } = await import('./scope.ts');
    const edge = { from: 'a', to: 'b', label: 'opens' };
    expect(edgeVisible(edge, new Set(['a', 'b']))).toBe(true);
    expect(edgeVisible(edge, new Set(['a']))).toBe(false);
  });
});

describe('questionClusters', () => {
  it('every question heads exactly one cluster and no member is claimed twice', async () => {
    const graph = await olsenGraph();
    const { questionClusters } = await import('./scope.ts');
    const clusters = questionClusters(graph);
    const questions = graph.nodes.filter((n) => n.kind === 'question');
    expect(clusters.map((c) => c.headId).sort()).toEqual(questions.map((q) => q.id).sort());
    const seen = new Set<string>();
    for (const cluster of clusters) {
      for (const id of cluster.memberIds) {
        expect(seen.has(id)).toBe(false);
        seen.add(id);
      }
    }
  });

  it('members stay in the hypothesis/tiltak/dispatch/clock/weave tier', async () => {
    const graph = await olsenGraph();
    const { questionClusters } = await import('./scope.ts');
    const kindOf = new Map(graph.nodes.map((n) => [n.id, n.kind]));
    for (const cluster of questionClusters(graph)) {
      for (const id of cluster.memberIds.slice(1)) {
        expect(['document', 'fact', 'question']).not.toContain(kindOf.get(id));
      }
    }
  });

  it('the Olsen questions actually own their hypotheses', async () => {
    const graph = await olsenGraph();
    const { questionClusters } = await import('./scope.ts');
    const clusters = questionClusters(graph);
    const clustered = new Set(clusters.flatMap((c) => c.memberIds));
    const hypotheses = graph.nodes.filter((n) => n.kind === 'hypothesis');
    const owned = hypotheses.filter((h) => clustered.has(h.id));
    // Every Olsen hypothesis hangs off some question (carries edges).
    expect(owned.length).toBe(hypotheses.length);
  });
});
