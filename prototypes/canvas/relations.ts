// The relation rules of the board — which drags may create which written
// relations, and the condition-expression algebra those writes use. Pure
// logic: no DOM, no state; the write sites live in editing.ts.
import { parseCondition } from '../../src/compiler/condition.ts';
import type { NodeKind } from './graph.ts';

/**
 * The legality table — the single source for which drags create relations.
 * `on` names the block that carries the written field: `from` or `to`.
 *  - list: the other node's id joins a comma list (Supports/Needs/Opens)
 *  - field: the other node's id becomes the single value (Question)
 *  - cond: the other node's id joins the condition expression as an and-term
 *    (the canonical `field` here is documentation; the write resolves the
 *    block's actual key via COND_KEYS, e.g. `needs:` vs legacy `Needs:`).
 */
export interface RelationSpec {
  mode: 'list' | 'field' | 'cond';
  field: string;
  on: 'from' | 'to';
}
export const RELATION: Partial<Record<`${NodeKind}→${NodeKind}`, RelationSpec>> = {
  'fact→question': { mode: 'list', field: 'Supports', on: 'from' },
  'fact→hypothesis': { mode: 'cond', field: 'needs', on: 'to' },
  'fact→tiltak': { mode: 'list', field: 'Needs', on: 'to' },
  'fact→dispatch': { mode: 'cond', field: 'gate', on: 'to' },
  'fact→clock': { mode: 'cond', field: 'visible when', on: 'to' },
  'question→hypothesis': { mode: 'field', field: 'Question', on: 'to' },
  'hypothesis→tiltak': { mode: 'list', field: 'Opens', on: 'from' },
  'hypothesis→dispatch': { mode: 'list', field: 'Opens', on: 'from' },
  'hypothesis→clock': { mode: 'cond', field: 'visible when', on: 'to' },
};

/** Condition field keys per kind, in the compiler's preference order. */
export const COND_KEYS: Partial<Record<NodeKind, string[]>> = {
  question: ['when', 'Opens when'],
  hypothesis: ['needs', 'Needs'],
  dispatch: ['gate', 'Gate'],
  clock: ['visible when', 'Visible when'],
};

const topLevelAndTerms = (expr: string): string[] =>
  expr
    .trim()
    .split(/\s+and\s+/)
    .map((part) => part.trim())
    .filter((part) => part !== '');

/**
 * Append `id` as an and-term. An expression with `or` gets wrapped in parens
 * first so the new term binds over the whole thing. Returns the current
 * expression unchanged when the term is already present; null when the
 * result would not parse (§6 grammar) — the caller refuses instead.
 */
export function condAddTerm(expr: string, id: string): string | null {
  const current = expr.trim();
  if (topLevelAndTerms(current).includes(id)) return current;
  const base = current === '' ? '' : /\bor\b/.test(current) ? `(${current})` : current;
  const next = base === '' ? id : `${base} and ${id}`;
  return parseCondition(next).error === null ? next : null;
}

/**
 * Drop `id` when it stands as a plain top-level and-term, normalizing the
 * surrounding `and`s. Returns null when the term is absent or nested in
 * something richer (or/not/n-of) — too risky to rewrite blind.
 */
export function condRemoveTerm(expr: string, id: string): string | null {
  const parts = topLevelAndTerms(expr);
  const kept = parts.filter((part) => part !== id);
  if (kept.length === parts.length) return null;
  const next = kept.join(' and ');
  return parseCondition(next).error === null ? next : null;
}

/** Kinds a drag from `kind` may give birth to. document→fact is legal even
 *  though RELATION has no entry: the ## block under the document IS the wire
 *  (the source edge is derived from containment). */
export function birthKinds(kind: NodeKind, allKinds: NodeKind[]): NodeKind[] {
  return allKinds.filter(
    (target) =>
      RELATION[`${kind}→${target}`] !== undefined || (kind === 'document' && target === 'fact'),
  );
}

// ---- inbound-reference classification (delete cleanup) --------------------

/** One inbound reference to a block slated for removal. */
export interface RefHit {
  blockId: string;
  key: string; // field key, or 'prosa' / 'effekt' / 'header'
  targetId: string;
  /** How a confirmed delete handles it: patch it away, or report-only. */
  action: 'list' | 'cond' | 'field' | 'report';
}

const LIST_REF_KEYS = new Set([
  'Supports',
  'Opens',
  'Opens dispatches',
  'Opens tiltak',
  'Discuss',
  'Relevant',
  'Needs hypothesis',
]);
const COND_REF_KEYS = new Set([
  'when',
  'Opens when',
  'needs',
  'gate',
  'Gate',
  'visible when',
  'Visible when',
]);

export function refActionFor(blockType: string, key: string): RefHit['action'] {
  // 'Needs' is a plain list on tiltak but a condition on hypotheses.
  if (key === 'Needs') return blockType === 'hypothesis' ? 'cond' : 'list';
  if (LIST_REF_KEYS.has(key)) return 'list';
  if (COND_REF_KEYS.has(key)) return 'cond';
  if (key === 'Question' && blockType === 'hypothesis') return 'field';
  return 'report'; // free-text fields we refuse to rewrite blind
}

export interface EdgeWriteResult {
  ok: boolean;
  reason?: string;
}

export interface CreateResult extends EdgeWriteResult {
  id?: string;
}
