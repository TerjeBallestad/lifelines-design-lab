// SB-026 probe — derive the case graph from the compiler's emitted slice.
// Pure module: no DOM, importable by the page and by the smoke test.
//
// Semantics per the mockup header ruling: documents feed facts, facts open
// questions, questions carry hypotheses, hypotheses open tiltak/dispatches.
// Conditions (Opens when, Needs, Gate) are first-class and live on edges.
import type { CaseSlice } from '../../src/compiler/emit.ts';
import type { PredicateSpec } from '../../src/compiler/condition.ts';
import type { EffectSpec } from '../../src/compiler/effects.ts';

import type { NodeKind } from '../shared/node-kind.ts';
import { plainTitle } from '../shared/plain-title.ts';
import { CHAT_FRANK_ID, callId, recipeId } from '../shared/weave-ids.ts';

export type { NodeKind };

export interface GraphNode {
  id: string;
  kind: NodeKind;
  title: string;
  sub: string; // one metadata line, mockup-1a style
  x: number;
  y: number;
  /** SB-049: an id named in the script (Supports/Opens/a condition) with no
   *  block behind it — rendered as a ghost carrying its wired edges. */
  stub?: boolean;
}

export interface GraphEdge {
  from: string;
  to: string;
  label: string; // needs · opens · gate · source · supports · delivers · reveals · lead
}

export interface CaseGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
  /** doc id → day the document arrives (day beats + deliver delay). */
  arrivals: Map<string, number>;
}

const ID_RE = /^(doc|f|q|h|t|d|ck)_/;

/** The kind an id prefix promises — all a stub knows beyond its id. */
const KIND_OF_PREFIX: Record<string, NodeKind> = {
  doc: 'document',
  f: 'fact',
  q: 'question',
  h: 'hypothesis',
  t: 'tiltak',
  d: 'dispatch',
  ck: 'clock',
};

/** Kind inferred from a well-formed id prefix, or null (e.g. `call:grete`). */
export function stubKindOf(id: string): NodeKind | null {
  const match = id.match(ID_RE);
  return match ? KIND_OF_PREFIX[match[1]] : null;
}

/** Every entity id referenced anywhere inside a predicate tree. */
export function idsInPredicate(spec: PredicateSpec | undefined | null): string[] {
  if (!spec) return [];
  const out: string[] = [];
  const walk = (node: PredicateSpec) => {
    for (const value of Object.values(node.args ?? {})) {
      if (typeof value === 'string' && ID_RE.test(value)) out.push(value);
      if (Array.isArray(value))
        for (const item of value) if (typeof item === 'string' && ID_RE.test(item)) out.push(item);
    }
    for (const child of node.children ?? []) walk(child);
  };
  walk(spec);
  return out;
}

export function buildGraph(slice: CaseSlice): CaseGraph {
  const nodes: GraphNode[] = [];
  const edgeSet = new Map<string, GraphEdge>();
  const known = new Set<string>();
  const addEdge = (from: string, to: string, label: string) => {
    if (!from || !to || from === to) return;
    edgeSet.set(`${from}→${to}·${label}`, { from, to, label });
  };

  // Document arrival days: beats queue pending documents (beat day + delay).
  const arrivals = new Map<string, number>();
  for (const beat of slice.day_script_beats)
    for (const effect of beat.effects)
      if (effect.op === 'queue_pending_document') {
        const docId = String(effect.args.document_id ?? '');
        const delay = Number(effect.args.delay_days ?? 0);
        if (docId) arrivals.set(docId, beat.day + delay);
      }

  const hypsPerQuestion = new Map<string, number>();
  for (const h of slice.hypotheses)
    hypsPerQuestion.set(h.question_id, (hypsPerQuestion.get(h.question_id) ?? 0) + 1);

  for (const doc of slice.documents) {
    const arrival = arrivals.get(doc.id);
    const when = arrival !== undefined ? `dag ${arrival}` : 'dag 1';
    nodes.push({
      id: doc.id,
      kind: 'document',
      title: plainTitle(doc.title),
      sub: `${doc.runs.length} fakta · ${when}`,
      x: 0,
      y: 0,
    });
  }
  for (const fact of slice.facts)
    nodes.push({
      id: fact.id,
      kind: 'fact',
      title: plainTitle(fact.label),
      sub: fact.category || fact.domain,
      x: 0,
      y: 0,
    });
  for (const q of slice.questions) {
    const n = hypsPerQuestion.get(q.id) ?? 0;
    nodes.push({
      id: q.id,
      kind: 'question',
      title: plainTitle(q.card_title || q.prompt),
      sub: `${n} hypoteser`,
      x: 0,
      y: 0,
    });
  }
  for (const h of slice.hypotheses) {
    const needs = idsInPredicate(h.availability).length;
    const opens = h.opening_sources.length;
    nodes.push({
      id: h.id,
      kind: 'hypothesis',
      title: plainTitle(h.title),
      sub: `needs ${needs} · opens ${opens}`,
      x: 0,
      y: 0,
    });
  }
  for (const t of slice.tiltak)
    nodes.push({
      id: t.id,
      kind: 'tiltak',
      title: plainTitle(t.title),
      sub: `slot ${t.slot} · kost ${t.cost}`,
      x: 0,
      y: 0,
    });
  for (const d of slice.dispatches)
    nodes.push({
      id: d.id,
      kind: 'dispatch',
      title: plainTitle(d.title),
      sub: d.channel ? `via ${d.channel}` : (d.activity_title ?? ''),
      x: 0,
      y: 0,
    });
  for (const ck of slice.clocks)
    nodes.push({
      id: ck.id,
      kind: 'clock',
      title: plainTitle(ck.label),
      sub: `${ck.good_segment_size}+${ck.bad_segment_size} segmenter`,
      x: 0,
      y: 0,
    });

  // SB-046: one node per §8 weave block. Ids reproduce the raw block ids
  // (`call:grete`, `chat:frank`, `f_a + f_b`, the handbok slug) so clicking
  // the node cross-jumps to the block's span in the script lens.
  for (const call of slice.calls ?? [])
    nodes.push({
      id: callId(call.contact_id),
      kind: 'conversation',
      title: `call: ${call.contact_id}`,
      sub: `${call.exchanges.length} utvekslinger`,
      x: 0,
      y: 0,
    });
  if ((slice.frank_chat ?? []).length > 0)
    nodes.push({
      id: CHAT_FRANK_ID,
      kind: 'conversation',
      title: 'chat: frank',
      sub: `${slice.frank_chat!.length} oppslag`,
      x: 0,
      y: 0,
    });
  for (const recipe of slice.recipes ?? [])
    nodes.push({
      id: recipeId(recipe.pair),
      kind: 'recipe',
      title: recipeId(recipe.pair),
      sub: `åpner ${recipe.question_id}`,
      x: 0,
      y: 0,
    });
  for (const proposal of slice.frank_proposals ?? [])
    nodes.push({
      id: proposal.handbok_id,
      kind: 'proposal',
      title: plainTitle(proposal.line),
      sub: `${(proposal.relevant_fact_ids ?? []).length} relevante fakta`,
      x: 0,
      y: 0,
    });

  for (const node of nodes) known.add(node.id);

  const effectEdges = (fromId: string, effects: EffectSpec[]) => {
    for (const effect of effects) {
      if (effect.op === 'reveal_questions')
        for (const qId of (effect.args.question_ids as string[]) ?? [])
          addEdge(fromId, qId, 'opens');
      if (effect.op === 'queue_pending_document')
        addEdge(fromId, String(effect.args.document_id ?? ''), 'delivers');
    }
  };

  for (const fact of slice.facts) {
    addEdge(fact.source_document_id, fact.id, 'source');
    for (const qId of fact.supports_questions) addEdge(fact.id, qId, 'supports');
    effectEdges(fact.id, fact.lift_effects);
    if (fact.reveals_event)
      for (const delta of slice.event_delta_specs)
        if (delta.event_type === fact.reveals_event) {
          const sign = delta.clock_direction >= 0 ? '+' : '−';
          addEdge(fact.id, delta.clock_id, `clock ${sign}${Math.abs(delta.clock_direction)}`);
        }
  }
  for (const delta of slice.event_delta_specs)
    if (delta.reveal_fact_id) addEdge(delta.clock_id, delta.reveal_fact_id, 'reveals');

  for (const q of slice.questions) {
    for (const id of idsInPredicate(q.reveal_when)) addEdge(id, q.id, 'gate');
    // SB-049: unknown lead targets stay in — the stub pass below catches them.
    for (const lead of q.leads ?? []) addEdge(q.id, lead.target, 'lead');
  }

  for (const h of slice.hypotheses) {
    addEdge(h.question_id, h.id, '');
    for (const id of idsInPredicate(h.availability)) addEdge(id, h.id, 'needs');
    for (const source of h.opening_sources) {
      if (source.op === 'open_tiltak')
        for (const tId of (source.args?.tiltak_ids as string[]) ?? []) addEdge(h.id, tId, 'opens');
      if (source.op === 'open_dispatches')
        for (const dId of (source.args?.dispatch_ids as string[]) ?? [])
          addEdge(h.id, dId, 'opens');
    }
  }

  for (const d of slice.dispatches) {
    for (const id of idsInPredicate(d.gate)) addEdge(id, d.id, 'gate');
    effectEdges(d.id, d.effects);
  }

  for (const ck of slice.clocks)
    for (const id of idsInPredicate(ck.visibility)) addEdge(id, ck.id, 'gate');

  // SB-046: fact edges in both directions on the weave nodes — needs in,
  // pays_fact / inline fact anchors out (the SB-037 ruling's exact wording).
  for (const call of slice.calls ?? []) {
    const weaveCallId = callId(call.contact_id);
    for (const id of idsInPredicate(call.gate)) addEdge(id, weaveCallId, 'gate');
    for (const line of call.opening) if (line.fact_id) addEdge(weaveCallId, line.fact_id, 'pays');
    for (const exchange of call.exchanges) {
      addEdge(exchange.card_id, weaveCallId, 'needs');
      for (const line of exchange.reply)
        if (line.fact_id) addEdge(weaveCallId, line.fact_id, 'pays');
    }
  }
  for (const entry of slice.frank_chat ?? []) {
    for (const id of entry.needs) addEdge(id, CHAT_FRANK_ID, 'needs');
    if (entry.pays_fact) addEdge(CHAT_FRANK_ID, entry.pays_fact, 'pays');
  }
  for (const recipe of slice.recipes ?? []) {
    const weaveRecipeId = recipeId(recipe.pair);
    for (const id of recipe.pair) addEdge(id, weaveRecipeId, 'needs');
    addEdge(weaveRecipeId, recipe.question_id, 'opens');
  }
  for (const proposal of slice.frank_proposals ?? [])
    for (const id of proposal.relevant_fact_ids ?? []) addEdge(id, proposal.handbok_id, 'needs');

  // SB-049 (SB-040 ruling 2): an unknown id named in the script becomes a
  // wired stub node — the Twine/Yarn/Ink consensus. The compiler already
  // emitted stub-unresolved-id; here the ghost gets a body so the canvas can
  // show it. Ids without a recognizable prefix still drop their edge — no
  // kind, no column. (Weave ids like `call:grete` are real nodes since
  // SB-046, so e.g. a question's lead edge onto them survives this filter.)
  const ensureNode = (id: string): boolean => {
    if (known.has(id)) return true;
    const kind = stubKindOf(id);
    if (kind === null) return false;
    nodes.push({ id, kind, title: id, sub: 'stub — no definition', stub: true, x: 0, y: 0 });
    known.add(id);
    return true;
  };
  const edges = [...edgeSet.values()].filter((e) => ensureNode(e.from) && ensureNode(e.to));
  return { nodes, edges, arrivals };
}

// ---- layout: kind columns, barycenter ordering ---------------------------

export const NODE_W = 208;
export const NODE_H = 58;
const COL_GAP = 110;
const ROW_GAP = 16;

const COLUMN_OF: Record<NodeKind, number> = {
  document: 0,
  fact: 1,
  question: 2,
  hypothesis: 3,
  tiltak: 4,
  dispatch: 4,
  clock: 5,
  // SB-046: the weave family shares the source column — like documents,
  // conversations feed facts (and consume them; those edges run right-to-left).
  conversation: 0,
  recipe: 0,
  proposal: 0,
};

/** Assign x/y in place. Columns by kind (mockup 1a); rows ordered by the
 *  mean position of already-placed upstream neighbours to cut crossings. */
export function layoutGraph(graph: CaseGraph): { width: number; height: number } {
  const byColumn: GraphNode[][] = [[], [], [], [], [], []];
  for (const node of graph.nodes) byColumn[COLUMN_OF[node.kind]].push(node);

  const inbound = new Map<string, string[]>();
  for (const edge of graph.edges) {
    if (!inbound.has(edge.to)) inbound.set(edge.to, []);
    inbound.get(edge.to)!.push(edge.from);
  }

  const rowOf = new Map<string, number>();
  byColumn.forEach((column, index) => {
    if (index > 0) {
      const score = (node: GraphNode) => {
        const rows = (inbound.get(node.id) ?? [])
          .map((id) => rowOf.get(id))
          .filter((r): r is number => r !== undefined);
        if (rows.length === 0) return Number.MAX_SAFE_INTEGER; // keep file order at the bottom
        return rows.reduce((a, b) => a + b, 0) / rows.length;
      };
      const scores = new Map(column.map((node) => [node.id, score(node)]));
      column.sort((a, b) => scores.get(a.id)! - scores.get(b.id)!);
    }
    column.forEach((node, row) => rowOf.set(node.id, row));
  });

  const tallest = Math.max(...byColumn.map((column) => column.length));
  const height = tallest * (NODE_H + ROW_GAP) - ROW_GAP;
  byColumn.forEach((column, index) => {
    const columnHeight = column.length * (NODE_H + ROW_GAP) - ROW_GAP;
    const top = (height - columnHeight) / 2;
    column.forEach((node, row) => {
      node.x = index * (NODE_W + COL_GAP);
      node.y = top + row * (NODE_H + ROW_GAP);
    });
  });

  return { width: 6 * NODE_W + 5 * COL_GAP, height };
}

// ---- sticky layout (SB-034) ----------------------------------------------

export interface NodePos {
  x: number;
  y: number;
}

/**
 * Sticky variant of layoutGraph: nodes with a stored position keep it
 * byte-for-byte; nodes without one append at the end of their kind column.
 * An empty store falls back to one barycenter pass (first load / re-layout).
 * Edits must never reshuffle the board — that is the SB-034 hard rule.
 */
export function stickyLayout(
  graph: CaseGraph,
  stored: Map<string, NodePos>,
): { width: number; height: number } {
  if (stored.size === 0) return layoutGraph(graph);

  const fresh: GraphNode[] = [];
  const bottomOf = new Map<number, number>(); // column index → lowest occupied y
  for (const node of graph.nodes) {
    const pos = stored.get(node.id);
    if (!pos) {
      fresh.push(node);
      continue;
    }
    node.x = pos.x;
    node.y = pos.y;
    const column = COLUMN_OF[node.kind];
    bottomOf.set(column, Math.max(bottomOf.get(column) ?? Number.NEGATIVE_INFINITY, node.y));
  }
  for (const node of fresh) {
    const column = COLUMN_OF[node.kind];
    const bottom = bottomOf.get(column);
    node.x = column * (NODE_W + COL_GAP);
    node.y = bottom === undefined ? 0 : bottom + NODE_H + ROW_GAP;
    bottomOf.set(column, node.y);
  }

  const width = Math.max(6 * NODE_W + 5 * COL_GAP, ...graph.nodes.map((n) => n.x + NODE_W));
  const height = Math.max(1, ...graph.nodes.map((n) => n.y + NODE_H));
  return { width, height };
}
