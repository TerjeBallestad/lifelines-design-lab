// The edit pipeline: every path that writes the markup buffer — field
// commits, edge writes, node lifecycle (create/duplicate/delete), and the
// draft → save POST tail they all share. The markup stays the store
// (DD-003); this module is the only writer. The shell injects rendering
// and lens side-effects, so nothing here touches the canvas DOM directly.
import { observable } from 'mobx';
import {
  patchField,
  listFieldAdd,
  listFieldRemove,
  appendBlock,
  removeBlock,
  liftFact,
} from '../../src/compiler/patch.ts';
import { parseCaseText } from '../../src/compiler/parse.ts';
import type { RawBlock } from '../../src/compiler/parse.ts';
import { DiagnosticBag } from '../../src/compiler/diagnostics.ts';
import type { GraphEdge, NodeKind, NodePos } from './graph.ts';
import { KIND_LABEL, ID_PREFIX } from './kinds.ts';
import { RELATION, COND_KEYS, condAddTerm, condRemoveTerm, refActionFor } from './relations.ts';
import type { EdgeWriteResult, CreateResult, RefHit } from './relations.ts';
import * as model from './model.ts';
import * as layout from './layout-modes.ts';

// SB-078: the deps are down to the genuinely non-reactive concerns — lens
// handles, camera, and focus. Rebuild rides the caseText reaction, status
// and the delete confirm ride the observables below, selection goes
// straight to model.setSelected.
export interface EditingDeps {
  /** Push a committed buffer into the script lens (external, no echo). */
  syncLens(text: string): void;
  /** A lens draft stash still in flight would resurrect a cleared draft. */
  clearLensDraftTimer(): void;
  centerOn(id: string): void;
  /** Focus the first inspector field of the fresh selection (SB-042). */
  focusFirstField(): void;
  focusLensLineEnd(line: number): void;
}

let deps: EditingDeps;

export function initEditing(d: EditingDeps): void {
  deps = d;
}

/** Status-bar notes — the status autorun in main re-renders on a write. */
export const notes = observable({ save: '', lifecycle: '' });

// ---- patch → draft → save → recompile -------------------------------------

/** Markup fields are single lines; a textarea newline collapses to a space. */
const oneLine = (value: string) => value.replace(/\s*\n\s*/g, ' ').trim();

let draftTimer: ReturnType<typeof setTimeout> | undefined;

// Typed-but-uncommitted edits land in the draft (debounced) so a vite reload
// never wipes them. A committed save clears the draft again.
export function stashDraft(blockId: string, key: string, value: string): void {
  clearTimeout(draftTimer);
  draftTimer = setTimeout(() => {
    try {
      const patched = patchField(model.getCaseText(), blockId, key, oneLine(value));
      if (patched !== model.getCaseText()) localStorage.setItem(model.DRAFT_KEY, patched);
    } catch {
      // Unpatchable while typing (e.g. mid-edit weirdness) — commit surfaces it.
    }
  }, 300);
}

export function commitField(blockId: string, key: string, value: string): void {
  let patched: string;
  try {
    patched = patchField(model.getCaseText(), blockId, key, oneLine(value));
  } catch (err) {
    const note = document.getElementById('form-note');
    if (note) note.textContent = err instanceof Error ? err.message : String(err);
    return;
  }
  if (patched === model.getCaseText()) return; // no-op: nothing written, nothing saved
  commitText(patched);
}

/** Shared commit tail: buffer → draft → lens sync → save POST. The rebuild
 *  fires from main's reaction on state.caseText inside setCaseText. */
export function commitText(patched: string): void {
  model.setCaseText(patched);
  localStorage.setItem(model.DRAFT_KEY, patched);
  // Push the committed buffer into the script lens as a minimal external
  // replacement — cursor and undo history survive; the external flag stops
  // the doc-changed handler from echoing a second compile.
  deps.syncLens(patched);
  void persist();
}

export async function persist(): Promise<void> {
  try {
    const res = await fetch('/__save-case', { method: 'POST', body: model.getCaseText() });
    if (!res.ok) throw new Error(await res.text());
    deps.clearLensDraftTimer();
    localStorage.removeItem(model.DRAFT_KEY);
    model.setDraftRestored(false);
    const t = new Date();
    notes.save = `saved ${String(t.getHours()).padStart(2, '0')}:${String(t.getMinutes()).padStart(2, '0')}`;
  } catch (err) {
    notes.save = `save failed — draft kept (${err instanceof Error ? err.message : String(err)})`;
  }
}

// ---- edge authoring (SB-033) ----------------------------------------------

function condField(ownerId: string): { key: string; value: string } | null {
  const node = model.state.nodeById.get(ownerId);
  const block = model.state.blockById.get(ownerId);
  const keys = node ? COND_KEYS[node.kind] : undefined;
  if (!keys || !block) return null;
  const existing = block.fields.find((f) => keys.includes(f.key));
  return existing ? { key: existing.key, value: existing.value } : { key: keys[0], value: '' };
}

/** Create the relation `fromId → toId` per the legality table and commit it. */
export function connect(fromId: string, toId: string): EdgeWriteResult {
  const from = model.state.nodeById.get(fromId);
  const to = model.state.nodeById.get(toId);
  if (!from || !to) return { ok: false, reason: 'unknown node' };
  const spec = RELATION[`${from.kind}→${to.kind}`];
  if (!spec) {
    return {
      ok: false,
      reason: `${KIND_LABEL[from.kind]} → ${KIND_LABEL[to.kind]}: no legal relation — drag from port for a new edge`,
    };
  }
  const ownerId = spec.on === 'from' ? fromId : toId;
  const otherId = spec.on === 'from' ? toId : fromId;
  try {
    let patched: string;
    if (spec.mode === 'list') {
      // Legacy dispatch ids without a d_ prefix only classify in the
      // dedicated `Opens dispatches:` list, not in plain `Opens:`.
      const field =
        spec.field === 'Opens' && to.kind === 'dispatch' && !toId.startsWith('d_')
          ? 'Opens dispatches'
          : spec.field;
      patched = listFieldAdd(model.getCaseText(), ownerId, field, otherId);
    } else if (spec.mode === 'field') {
      patched = patchField(model.getCaseText(), ownerId, spec.field, otherId);
    } else {
      const cond = condField(ownerId);
      if (!cond) return { ok: false, reason: `${ownerId} has no condition to extend` };
      const next = condAddTerm(cond.value, otherId);
      if (next === null)
        return { ok: false, reason: `the condition on ${ownerId} cannot be extended safely` };
      patched =
        next === cond.value.trim()
          ? model.getCaseText()
          : patchField(model.getCaseText(), ownerId, cond.key, next);
    }
    if (patched === model.getCaseText()) return { ok: true }; // already related — nothing to write
    commitText(patched);
    return { ok: true };
  } catch (err) {
    return { ok: false, reason: err instanceof Error ? err.message : String(err) };
  }
}

/** Remove the authored relation behind an edge; derived edges refuse. */
export function disconnect(edge: GraphEdge): EdgeWriteResult {
  const from = model.state.nodeById.get(edge.from);
  const to = model.state.nodeById.get(edge.to);
  if (!from || !to) return { ok: false, reason: 'unknown edge' };
  const label = edge.label.split(' ')[0];
  const condRemove = (ownerId: string, id: string): string | null => {
    const cond = condField(ownerId);
    if (!cond) return null;
    const next = condRemoveTerm(cond.value, id);
    return next === null ? null : patchField(model.getCaseText(), ownerId, cond.key, next);
  };
  try {
    let patched: string | null;
    if (label === 'supports' && from.kind === 'fact') {
      patched = listFieldRemove(model.getCaseText(), edge.from, 'Supports', edge.to);
      if (patched === model.getCaseText()) patched = null;
    } else if (label === 'opens' && from.kind === 'hypothesis') {
      patched = listFieldRemove(model.getCaseText(), edge.from, 'Opens', edge.to);
      if (patched === model.getCaseText())
        patched = listFieldRemove(model.getCaseText(), edge.from, 'Opens dispatches', edge.to);
      if (patched === model.getCaseText()) patched = null;
    } else if (label === 'needs' && to.kind === 'tiltak') {
      // SB-034: tiltak Needs: is a list field, not a condition.
      patched = listFieldRemove(model.getCaseText(), edge.to, 'Needs', edge.from);
      if (patched === model.getCaseText()) patched = null;
    } else if (label === 'needs' || label === 'gate') {
      patched = condRemove(edge.to, edge.from);
    } else {
      return {
        ok: false,
        reason: `"${edge.label || 'carries'}" is a derived edge — it cannot be deleted here`,
      };
    }
    if (patched === null)
      return {
        ok: false,
        reason: `did not find ${edge.from} as a plain entry/and-term on ${label === 'supports' || label === 'opens' ? edge.from : edge.to}`,
      };
    commitText(patched);
    return { ok: true };
  } catch (err) {
    return { ok: false, reason: err instanceof Error ? err.message : String(err) };
  }
}

// ---- node lifecycle (SB-034): create · duplicate · delete -----------------

/** `base`, else `base2`, `base3`, … — unique against every parsed block. */
function freshId(base: string): string {
  if (!model.state.blockById.has(base) && !model.state.nodeById.has(base)) return base;
  let n = 2;
  while (model.state.blockById.has(`${base}${n}`) || model.state.nodeById.has(`${base}${n}`))
    n += 1;
  return `${base}${n}`;
}

/**
 * Create a node of `kind` from its DEFAULT_TEMPLATES block, commit, select it
 * so the inspector opens for naming. `opts.at` (SB-042) pre-stores the drop
 * point in the sticky POS store so the node lands where the drag released;
 * without it the sticky layout appends at the kind column's end. Facts need
 * a parent document. `opts.id` (SB-049) creates the block under a caller-fixed
 * id — the create-from-stub path, where the id already exists in references.
 */
export function createNode(
  kind: NodeKind,
  opts: { documentId?: string; at?: NodePos; id?: string } = {},
): CreateResult {
  const id = opts.id ?? freshId(`${ID_PREFIX[kind]}ny`);
  if (opts.at) layout.storePosition(id, opts.at);
  try {
    let patched: string;
    if (kind === 'fact') {
      if (!opts.documentId)
        return { ok: false, reason: 'a fact needs a document — drag from its document instead' };
      patched = appendBlock(model.getCaseText(), 'fact', id, { documentId: opts.documentId });
    } else {
      patched = appendBlock(model.getCaseText(), kind, id);
    }
    commitText(patched);
  } catch (err) {
    return { ok: false, reason: err instanceof Error ? err.message : String(err) };
  }
  if (!model.state.nodeById.has(id))
    return { ok: false, reason: `${id} was written but did not compile to a node` };
  model.setSelected(id);
  deps.centerOn(id);
  deps.focusFirstField();
  return { ok: true, id };
}

/**
 * SB-043 select-to-lift: a passage selected in a document's prose (script
 * lens) becomes a fact stub — Quote pre-filled, appended at the end of the
 * document's fact run (the ## placement IS the source wire), caret landing
 * on the new block's Label line. Exported for the smoke test.
 */
export function liftAsFact(documentId: string, quote: string): CreateResult {
  try {
    const { text, id, labelLine } = liftFact(model.getCaseText(), documentId, quote);
    commitText(text);
    // Focus goes back to the script surface, end of `Label: ` — the 80 ms
    // cursor callback then cross-selects the new node on the canvas.
    deps.focusLensLineEnd(labelLine);
    return { ok: true, id };
  } catch (err) {
    return { ok: false, reason: err instanceof Error ? err.message : String(err) };
  }
}

/**
 * SB-049: turn a stub (script named it, no block defines it) into the real
 * thing — the SB-042 create machinery with the stub's own id. The wires
 * already exist in the markup (that is what made it a stub), so the block is
 * born wired the moment it compiles; the ghost's sticky slot carries over
 * because savePositions stored it, and focus lands in the first inspector
 * field per the SB-042 pattern.
 */
export function createFromStub(stubId: string): CreateResult {
  const node = model.state.nodeById.get(stubId);
  if (!node || !node.stub) return { ok: false, reason: `${stubId} is not a stub` };
  if (node.kind === 'fact')
    return {
      ok: false,
      reason: 'a fact lives under a document — add its ## block in the script',
    };
  return createNode(node.kind, { id: stubId, at: { x: node.x, y: node.y } });
}

/** Copy a block's body as the template for a fresh `<id>_kopi` block. */
export function duplicateNode(sourceId: string): EdgeWriteResult {
  const block = model.state.blockById.get(sourceId);
  const node = model.state.nodeById.get(sourceId);
  if (!block || !node) return { ok: false, reason: `unknown block ${sourceId}` };
  const body = model.getCaseText().split('\n').slice(block.startLine, block.endLine);
  while (body.length > 0 && body[0].trim() === '') body.shift();
  while (body.length > 0 && body[body.length - 1].trim() === '') body.pop();
  const id = freshId(`${sourceId}_kopi`);
  try {
    const patched = appendBlock(model.getCaseText(), block.type, id, {
      template: body.join('\n'),
      ...(block.type === 'fact' ? { documentId: block.documentId } : {}),
    });
    commitText(patched);
  } catch (err) {
    return { ok: false, reason: err instanceof Error ? err.message : String(err) };
  }
  if (!model.state.nodeById.has(id))
    return { ok: false, reason: `${id} was written but did not compile to a node` };
  model.setSelected(id);
  deps.centerOn(id);
  return { ok: true };
}

// ---- delete with reference cleanup ----------------------------------------

/** Every textual inbound reference to the ids in `family`, outside it. */
function findReferences(family: string[]): RefHit[] {
  const removal = new Set(family);
  const probes = family.map((id) => ({ id, re: new RegExp(`\\b${id}\\b`) }));
  const hits: RefHit[] = [];
  for (const block of model.state.blockById.values()) {
    if (removal.has(block.id) || block.type === 'case') continue;
    for (const field of block.fields)
      for (const { id, re } of probes)
        if (re.test(field.value))
          hits.push({
            blockId: block.id,
            key: field.key,
            targetId: id,
            action: refActionFor(block.type, field.key),
          });
    for (const effect of block.effects)
      for (const { id, re } of probes)
        if (re.test(effect.body))
          hits.push({ blockId: block.id, key: 'effekt', targetId: id, action: 'report' });
    for (const prose of block.proseLines)
      for (const { id, re } of probes)
        if (re.test(prose.text))
          hits.push({ blockId: block.id, key: 'prosa', targetId: id, action: 'report' });
    if (block.pair)
      for (const { id } of probes)
        if (block.pair.includes(id))
          hits.push({ blockId: block.id, key: 'header', targetId: id, action: 'report' });
  }
  return hits;
}

export interface PendingDelete {
  id: string;
  family: string[];
  refs: RefHit[];
}

/** SB-078: observable — the inspector autorun in main renders the confirm
 *  surface while this is set and the normal inspector when it clears. */
const pendingDelete = observable.box<PendingDelete | null>(null, { deep: false });

export function getPendingDelete(): PendingDelete | null {
  return pendingDelete.get();
}

/**
 * Start a delete. A referenced block surfaces its inbound reference list in
 * the inspector BEFORE anything is written; an unreferenced one goes
 * straight through. Deleting a document takes its contiguous ## facts along
 * (removeBlock alone would orphan them).
 */
export function requestDelete(id: string): void {
  const block = model.state.blockById.get(id);
  if (!block || block.type === 'case') return;
  const family = [id];
  if (block.type === 'document')
    for (const b of model.state.blockById.values())
      if (b.type === 'fact' && b.documentId === id) family.push(b.id);
  const refs = findReferences(family);
  if (refs.length === 0) {
    performDelete(family, refs);
    return;
  }
  pendingDelete.set({ id, family, refs });
}

/** Confirmed delete: clean the patchable references, then remove the blocks. */
export function confirmDelete(): void {
  const pending = pendingDelete.get();
  if (!pending) return;
  pendingDelete.set(null);
  performDelete(pending.family, pending.refs);
}

export function cancelDelete(): void {
  pendingDelete.set(null);
}

/** Drop `targetId` as a plain and-term from a live condition field. */
function cleanCondRef(text: string, ref: RefHit): string | null {
  const parsed = parseCaseText(text, new DiagnosticBag());
  const field = parsed.blocks
    .find((b: RawBlock) => b.id === ref.blockId)
    ?.fields.find((f) => f.key === ref.key);
  if (!field) return null;
  const next = condRemoveTerm(field.value, ref.targetId);
  return next === null ? null : patchField(text, ref.blockId, ref.key, next);
}

function performDelete(family: string[], refs: RefHit[]): void {
  let text = model.getCaseText();
  const refused: string[] = [];
  for (const ref of refs) {
    const tag = `${ref.blockId}.${ref.key}`;
    try {
      if (ref.action === 'list') {
        text = listFieldRemove(text, ref.blockId, ref.key, ref.targetId);
      } else if (ref.action === 'cond') {
        const next = cleanCondRef(text, ref);
        if (next === null) refused.push(tag);
        else text = next;
      } else if (ref.action === 'field') {
        text = patchField(text, ref.blockId, ref.key, '');
      } else {
        refused.push(tag);
      }
    } catch {
      refused.push(tag);
    }
  }
  // Facts were appended to the family after their document — remove them
  // first so the document never orphans mid-sequence.
  for (const id of [...family].reverse()) text = removeBlock(text, id);
  notes.lifecycle =
    refused.length > 0
      ? `deleted ${family[0]} — did not clean up: ${[...new Set(refused)].join(', ')}`
      : `deleted ${family[0]}`;
  commitText(text);
}
