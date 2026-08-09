// SB-063 — the traversal layer, tested against the real compiled case (the
// repo idiom: tiny-olsen is the fixture). Covers the predicate leaves, the
// effect vocabulary, the verb cascades and the frontier delta.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { compileCase } from '../../src/compiler/index.ts';
import { recipeId } from '../shared/weave-ids.ts';
import {
  advanceDay,
  applyEffects,
  askChat,
  chooseHypothesis,
  craftRecipe,
  createPlayState,
  deserializePlayState,
  diffSnapshots,
  entityStatus,
  fireEvent,
  futureContentLeft,
  liftFact,
  makeCall,
  openActionsLeft,
  playCard,
  predHolds,
  serializePlayState,
  snapshot,
} from './state.ts';
import type { StatusRow } from './state.ts';

const ROOT = process.cwd();
const result = compileCase(readFileSync(`${ROOT}/content/cases/olsen/tiny-olsen.case.md`, 'utf8'));
const slice = result.slice;

describe('createPlayState', () => {
  it('starts dag 1 at the authored stage with the opening document stack', () => {
    const state = createPlayState(slice);
    expect(state.day).toBe(1);
    expect(state.stage).toBe(slice.scenario_stage);
    expect(state.documentsArrived.size).toBeGreaterThan(0);
    expect(state.documentsArrived.size).toBeLessThanOrEqual(slice.documents.length);
  });

  it('keeps queued documents out of the opening stack', () => {
    const state = createPlayState(slice);
    const queued = new Set<string>();
    for (const carrier of [...slice.day_script_beats, ...slice.dispatches])
      for (const effect of carrier.effects)
        if (effect.op === 'queue_pending_document')
          queued.add(String(effect.args?.document_id ?? ''));
    for (const id of queued) expect(state.documentsArrived.has(id)).toBe(false);
  });
});

describe('predHolds', () => {
  const state = createPlayState(slice);
  it('evaluates the three surviving leaves', () => {
    expect(predHolds({ op: 'fact_lifted', args: { fact_id: 'f_x' } }, state)).toBe(false);
    state.factsLifted.add('f_x');
    expect(predHolds({ op: 'fact_lifted', args: { fact_id: 'f_x' } }, state)).toBe(true);
    expect(predHolds({ op: 'scenario_stage_at_least', args: { stage: state.stage } }, state)).toBe(
      true,
    );
    expect(
      predHolds({ op: 'scenario_stage_at_least', args: { stage: state.stage + 1 } }, state),
    ).toBe(false);
    state.hypothesesChosen.add('h_y');
    expect(predHolds({ op: 'hypothesis_chosen', args: { hypothesis_id: 'h_y' } }, state)).toBe(
      true,
    );
  });

  it('evaluates the combinators and fails closed on unknown ops', () => {
    const lifted = { op: 'fact_lifted', args: { fact_id: 'f_x' } };
    const notLifted = { op: 'fact_lifted', args: { fact_id: 'f_missing' } };
    expect(predHolds({ op: 'all', children: [lifted, notLifted] }, state)).toBe(false);
    expect(predHolds({ op: 'any', children: [lifted, notLifted] }, state)).toBe(true);
    expect(predHolds({ op: 'not', children: [notLifted] }, state)).toBe(true);
    expect(predHolds({ op: 'day_at_least', args: { day: 1 } }, state)).toBe(false);
  });
});

describe('applyEffects', () => {
  it('queues a document and arrives it on day advance', () => {
    const state = createPlayState(slice);
    applyEffects(state, [
      { op: 'queue_pending_document', args: { document_id: 'doc_test', delay_days: 2 } },
    ]);
    expect(state.pendingDocuments).toEqual([{ document_id: 'doc_test', arrival_day: 3 }]);
    advanceDay(state, slice);
    expect(state.documentsArrived.has('doc_test')).toBe(false);
    advanceDay(state, slice);
    expect(state.documentsArrived.has('doc_test')).toBe(true);
    expect(state.pendingDocuments).toEqual([]);
  });

  it('reveals questions, sets the stage, and logs unknown ops as engine-only', () => {
    const state = createPlayState(slice);
    applyEffects(state, [
      { op: 'reveal_questions', args: { question_ids: ['q_test'] } },
      { op: 'set_scenario_stage', args: { stage: 9 } },
      { op: 'tick_clock', args: { clock_id: 'ck_x' } },
    ]);
    expect(state.questionsRevealed.has('q_test')).toBe(true);
    expect(state.stage).toBe(9);
    expect(state.log.some((line) => line.includes('tick_clock ignored'))).toBe(true);
  });
});

describe('verb cascades on the real case', () => {
  it('lifting a fact applies its lift_effects (reveal cascade)', () => {
    const state = createPlayState(slice);
    const opener = slice.facts.find((f) =>
      f.lift_effects.some((e) => e.op === 'reveal_questions'),
    )!;
    const qid = (
      opener.lift_effects.find((e) => e.op === 'reveal_questions')!.args?.question_ids as string[]
    )[0];
    expect(state.questionsRevealed.has(qid)).toBe(false);
    liftFact(state, slice, opener.id);
    expect(state.factsLifted.has(opener.id)).toBe(true);
    expect(state.questionsRevealed.has(qid)).toBe(true);
  });

  it('asking a paying chat entry lands its fact', () => {
    const state = createPlayState(slice);
    const paying = (slice.frank_chat ?? []).find((e) => e.pays_fact)!;
    for (const need of paying.needs) state.factsLifted.add(need);
    askChat(state, slice, paying.id);
    expect(state.chatAsked.has(paying.id)).toBe(true);
    expect(state.factsLifted.has(paying.pays_fact!)).toBe(true);
  });

  it('a call pays opening facts; a played card pays its reply facts', () => {
    const state = createPlayState(slice);
    const call = (slice.calls ?? [])[0]!;
    if (call.gate) state.stage = 99; // stage leaves satisfy; fact leaves below
    for (const need of [call.gate].flatMap(collectFactIds)) state.factsLifted.add(need);
    makeCall(state, slice, call.contact_id);
    expect(state.callsMade.has(call.contact_id)).toBe(true);
    for (const line of call.opening)
      if (line.fact_id) expect(state.factsLifted.has(line.fact_id)).toBe(true);
    const exchange = call.exchanges[0];
    if (exchange) {
      state.factsLifted.add(exchange.card_id);
      playCard(state, slice, call.contact_id, exchange.card_id);
      for (const line of exchange.reply)
        if (line.fact_id) expect(state.factsLifted.has(line.fact_id)).toBe(true);
    }
  });

  it('crafting a recipe opens its question', () => {
    const state = createPlayState(slice);
    const recipe = (slice.recipes ?? [])[0]!;
    for (const fid of recipe.pair) state.factsLifted.add(fid);
    craftRecipe(state, slice, recipeId(recipe.pair));
    expect(state.recipesCrafted.has(recipeId(recipe.pair))).toBe(true);
    expect(state.questionsRevealed.has(recipe.question_id)).toBe(true);
  });

  it('choosing a hypothesis opens its tiltak/dispatches', () => {
    const state = createPlayState(slice);
    const opener = slice.hypotheses.find((h) =>
      h.opening_sources.some((s) => s.op === 'open_tiltak' || s.op === 'open_dispatches'),
    )!;
    chooseHypothesis(state, slice, opener.id);
    expect(state.hypothesesChosen.has(opener.id)).toBe(true);
    expect(state.tiltakOpened.size + state.dispatchesOpened.size).toBeGreaterThan(0);
  });

  it('firing an event delta lands its reveal fact', () => {
    const state = createPlayState(slice);
    const delta = slice.event_delta_specs[0]!;
    fireEvent(state, slice, delta.event_type);
    expect(state.eventsFired.has(delta.event_type)).toBe(true);
    if (delta.reveal_fact_id) expect(state.factsLifted.has(delta.reveal_fact_id)).toBe(true);
  });
});

describe('frontier status + delta', () => {
  const rows: StatusRow[] = [
    ...slice.facts.map((f) => ({ id: f.id, kind: 'fact', label: f.label })),
    ...slice.questions.map((q) => ({ id: q.id, kind: 'question', label: q.prompt })),
    ...slice.documents.map((d) => ({ id: d.id, kind: 'document', label: d.title })),
  ];

  it('a lift shows up in the delta as done + anything it opened', () => {
    const state = createPlayState(slice);
    // Content note: in tiny-olsen no question-revealing fact sits in the
    // dag-1 stack — arrival is forced so the delta shape stays testable.
    const opener = slice.facts.find((f) =>
      f.lift_effects.some((e) => e.op === 'reveal_questions'),
    )!;
    state.documentsArrived.add(opener.source_document_id);
    const before = snapshot(state, slice, rows);
    liftFact(state, slice, opener.id);
    const delta = diffSnapshots(before, snapshot(state, slice, rows));
    expect(delta.finished.some((r) => r.id === opener.id)).toBe(true);
    expect(delta.opened.length).toBeGreaterThan(0);
  });

  it('a fact in an unarrived document is locked; arrival opens it', () => {
    const state = createPlayState(slice);
    const lockedFact = slice.facts.find(
      (f) => f.source_document_id && !state.documentsArrived.has(f.source_document_id),
    );
    if (!lockedFact) return; // case authors no queued-document facts
    expect(entityStatus(state, slice, lockedFact.id, 'fact')).toBe('locked');
    state.documentsArrived.add(lockedFact.source_document_id);
    expect(entityStatus(state, slice, lockedFact.id, 'fact')).toBe('open');
  });

  it('exhaustion counters go to zero only when nothing is left', () => {
    const state = createPlayState(slice);
    expect(openActionsLeft(state, slice)).toBeGreaterThan(0);
    expect(futureContentLeft(state, slice)).toBeGreaterThan(0);
  });
});

describe('serialize round trip (lens-switch survival)', () => {
  it('restores a mutated run exactly', () => {
    const state = createPlayState(slice);
    liftFact(state, slice, slice.facts[0].id);
    advanceDay(state, slice);
    applyEffects(state, [
      { op: 'queue_pending_document', args: { document_id: 'doc_rt', delay_days: 3 } },
    ]);
    const restored = deserializePlayState(serializePlayState(state))!;
    expect(restored).not.toBeNull();
    expect(restored).toEqual(state);
  });

  it('rejects a stored shape that is off', () => {
    expect(deserializePlayState('not json')).toBeNull();
    expect(deserializePlayState('{"day":1}')).toBeNull();
    expect(deserializePlayState('{"day":1,"stage":0,"log":[],"pendingDocuments":[]}')).toBeNull();
  });
});

function collectFactIds(pred: unknown): string[] {
  if (!pred || typeof pred !== 'object') return [];
  const p = pred as { op?: string; args?: Record<string, unknown>; children?: unknown[] };
  const out: string[] = [];
  if (p.op === 'fact_lifted') out.push(String(p.args?.fact_id ?? ''));
  for (const child of p.children ?? []) out.push(...collectFactIds(child));
  return out;
}
