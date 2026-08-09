// SB-063 probe — the traversal layer: a pure PlayState over the compiled
// slice. The lens runs DATA, never code (SB-058): predHolds mirrors the three
// predicate leaves that survive emit (unlock.ts predText is the template);
// applyEffects covers the whole emitted effect vocabulary and logs every op
// it does not know instead of guessing. Frontier traversal per SB-062 ruling
// 3: every entity is open, locked (greyed, with its unlock sentence) or done;
// actions apply effects instantly; the caller diffs snapshots for the delta.
// No hours, no economy, no verdict, no persistence.
import type { CaseSlice } from '../../src/compiler/emit.ts';
import type { PredicateSpec } from '../../src/compiler/condition.ts';
import type { EffectSpec } from '../../src/compiler/index.ts';
import { callId, recipeId } from '../shared/weave-ids.ts';

export type EntityStatus = 'open' | 'locked' | 'done';

export interface PendingDocument {
  document_id: string;
  arrival_day: number;
}

export interface PlayState {
  day: number;
  stage: number;
  factsLifted: Set<string>;
  /** Questions opened by an effect (reveal_questions, recipe craft) — on top
   *  of the ones whose reveal_when predicate holds. */
  questionsRevealed: Set<string>;
  hypothesesChosen: Set<string>;
  /** Tiltak/dispatches opened by a chosen hypothesis' opening_sources. */
  tiltakOpened: Set<string>;
  dispatchesOpened: Set<string>;
  chatAsked: Set<string>;
  callsMade: Set<string>;
  /** `${contact_id}/${card_id}` — one call exchange played. */
  cardsPlayed: Set<string>;
  dispatchesRun: Set<string>;
  tiltakTaken: Set<string>;
  recipesCrafted: Set<string>;
  eventsFired: Set<string>;
  beatsFired: Set<string>;
  documentsArrived: Set<string>;
  pendingDocuments: PendingDocument[];
  log: string[];
}

// The Set-valued PlayState keys, for the serializer. Typed against PlayState
// so a new set cannot silently fall out of the lens-switch survival.
const SET_KEYS = [
  'factsLifted',
  'questionsRevealed',
  'hypothesesChosen',
  'tiltakOpened',
  'dispatchesOpened',
  'chatAsked',
  'callsMade',
  'cardsPlayed',
  'dispatchesRun',
  'tiltakTaken',
  'recipesCrafted',
  'eventsFired',
  'beatsFired',
  'documentsArrived',
] as const satisfies ReadonlyArray<
  { [K in keyof PlayState]: PlayState[K] extends Set<string> ? K : never }[keyof PlayState]
>;

/** SB-063 amendment: the run survives a lens switch. Sets become arrays. */
export function serializePlayState(state: PlayState): string {
  const out: Record<string, unknown> = {
    day: state.day,
    stage: state.stage,
    pendingDocuments: state.pendingDocuments,
    log: state.log,
  };
  for (const key of SET_KEYS) out[key] = [...state[key]];
  return JSON.stringify(out);
}

/** The stored run back as a PlayState, or null when the shape is off. Stale
 *  ids from a since-edited case stay in the sets and simply never match. */
export function deserializePlayState(json: string): PlayState | null {
  try {
    const raw = JSON.parse(json) as Record<string, unknown>;
    if (typeof raw.day !== 'number' || typeof raw.stage !== 'number') return null;
    if (!Array.isArray(raw.log) || !Array.isArray(raw.pendingDocuments)) return null;
    const state = {
      day: raw.day,
      stage: raw.stage,
      pendingDocuments: raw.pendingDocuments as PendingDocument[],
      log: raw.log as string[],
    } as PlayState;
    for (const key of SET_KEYS) {
      const values = raw[key];
      if (!Array.isArray(values)) return null;
      state[key] = new Set(values as string[]);
    }
    return state;
  } catch {
    return null;
  }
}

/** Document ids some effect queues — they are NOT in the opening stack. */
function queuedDocumentIds(slice: CaseSlice): Set<string> {
  const queued = new Set<string>();
  const scan = (effects: EffectSpec[]) => {
    for (const effect of effects)
      if (effect.op === 'queue_pending_document')
        queued.add(String(effect.args?.document_id ?? ''));
  };
  for (const beat of slice.day_script_beats) scan(beat.effects);
  for (const dispatch of slice.dispatches) scan(dispatch.effects);
  for (const fact of slice.facts) scan(fact.lift_effects);
  for (const h of slice.hypotheses) scan(h.opening_sources);
  return queued;
}

export function createPlayState(slice: CaseSlice): PlayState {
  const queued = queuedDocumentIds(slice);
  const state: PlayState = {
    day: 1,
    stage: slice.scenario_stage,
    factsLifted: new Set(),
    questionsRevealed: new Set(),
    hypothesesChosen: new Set(),
    tiltakOpened: new Set(),
    dispatchesOpened: new Set(),
    chatAsked: new Set(),
    callsMade: new Set(),
    cardsPlayed: new Set(),
    dispatchesRun: new Set(),
    tiltakTaken: new Set(),
    recipesCrafted: new Set(),
    eventsFired: new Set(),
    beatsFired: new Set(),
    documentsArrived: new Set(slice.documents.filter((d) => !queued.has(d.id)).map((d) => d.id)),
    pendingDocuments: [],
    log: [`dag 1 — ${state0Line(slice)}`],
  };
  // Day-1 beats fire on boot, same as an advance into any later day.
  runBeatsForDay(state, slice);
  return state;
}

function state0Line(slice: CaseSlice): string {
  return `«${slice.title}» starts at stage ${slice.scenario_stage}`;
}

/** The three leaves that survive emit + the combinators; an op the compiler
 *  never emits evaluates false (and the gate stays visibly locked). */
export function predHolds(pred: PredicateSpec, state: PlayState): boolean {
  switch (pred.op) {
    case 'fact_lifted':
      return state.factsLifted.has(String(pred.args?.fact_id ?? ''));
    case 'hypothesis_chosen':
      return state.hypothesesChosen.has(String(pred.args?.hypothesis_id ?? ''));
    case 'scenario_stage_at_least':
      return state.stage >= Number(pred.args?.stage ?? 0);
    case 'all':
      return (pred.children ?? []).every((child) => predHolds(child, state));
    case 'any':
      return (pred.children ?? []).some((child) => predHolds(child, state));
    case 'not':
      // predText renders not() over the conjunction of its children.
      return !(pred.children ?? []).every((child) => predHolds(child, state));
    default:
      return false;
  }
}

function arriveDocument(state: PlayState, id: string): void {
  if (state.documentsArrived.has(id)) return;
  state.documentsArrived.add(id);
  state.log.push(`dag ${state.day} — document ${id} arrives`);
}

/** The whole emitted effect vocabulary, plus the opening_sources ops a chosen
 *  hypothesis applies. Unknown ops log and do nothing (engine-only). */
export function applyEffects(state: PlayState, effects: EffectSpec[]): void {
  for (const effect of effects) {
    const args = effect.args ?? {};
    switch (effect.op) {
      case 'queue_pending_document': {
        const docId = String(args.document_id ?? '');
        const delay = Number(args.delay_days ?? 0);
        if (state.documentsArrived.has(docId)) break;
        if (delay <= 0) {
          arriveDocument(state, docId);
        } else if (!state.pendingDocuments.some((p) => p.document_id === docId)) {
          const arrival = state.day + delay;
          state.pendingDocuments.push({ document_id: docId, arrival_day: arrival });
          state.log.push(`dag ${state.day} — ${docId} queued, arrives dag ${arrival}`);
        }
        break;
      }
      case 'reveal_questions':
        for (const qid of (args.question_ids as string[]) ?? []) {
          if (state.questionsRevealed.has(qid)) continue;
          state.questionsRevealed.add(qid);
          state.log.push(`dag ${state.day} — question ${qid} opens`);
        }
        break;
      case 'set_scenario_stage': {
        const stage = Number(args.stage ?? state.stage);
        if (stage !== state.stage) {
          state.stage = stage;
          state.log.push(`dag ${state.day} — scenario stage → ${stage}`);
        }
        break;
      }
      case 'open_tiltak':
        for (const id of (args.tiltak_ids as string[]) ?? []) state.tiltakOpened.add(id);
        break;
      case 'open_dispatches':
        for (const id of (args.dispatch_ids as string[]) ?? []) state.dispatchesOpened.add(id);
        break;
      default:
        state.log.push(`dag ${state.day} — ~ ${effect.op} ignored (engine-only)`);
    }
  }
}

function runBeatsForDay(state: PlayState, slice: CaseSlice): void {
  for (const beat of slice.day_script_beats) {
    if (beat.day !== state.day || state.beatsFired.has(beat.id)) continue;
    state.beatsFired.add(beat.id);
    state.log.push(`dag ${state.day} — beat: ${beat.text}`);
    applyEffects(state, beat.effects);
  }
}

// ---- player verbs (SB-058: ask→lift, commit dispatch, advance day) plus the
// ---- debug verbs the mapper needs (choose hypothesis, fire event, force-lift)

/** Landing a fact — by lift, chat payment, call payment or debug force. */
function landFact(state: PlayState, slice: CaseSlice, id: string, via: string): void {
  if (!id || state.factsLifted.has(id)) return;
  state.factsLifted.add(id);
  state.log.push(`dag ${state.day} — fact ${id} lands (${via})`);
  const fact = slice.facts.find((f) => f.id === id);
  if (fact) applyEffects(state, fact.lift_effects);
}

export function liftFact(state: PlayState, slice: CaseSlice, id: string): void {
  landFact(state, slice, id, 'lifted');
}

export function askChat(state: PlayState, slice: CaseSlice, entryId: string): void {
  const entry = (slice.frank_chat ?? []).find((e) => e.id === entryId);
  if (!entry || state.chatAsked.has(entryId)) return;
  state.chatAsked.add(entryId);
  state.log.push(`dag ${state.day} — asked frank: ${entry.question}`);
  if (entry.pays_fact) landFact(state, slice, entry.pays_fact, 'paid by chat:frank');
}

export function makeCall(state: PlayState, slice: CaseSlice, contactId: string): void {
  const call = (slice.calls ?? []).find((c) => c.contact_id === contactId);
  if (!call || state.callsMade.has(contactId)) return;
  state.callsMade.add(contactId);
  state.log.push(`dag ${state.day} — called ${contactId}`);
  for (const line of call.opening)
    if (line.fact_id) landFact(state, slice, line.fact_id, `paid by ${callId(contactId)}`);
}

export function playCard(
  state: PlayState,
  slice: CaseSlice,
  contactId: string,
  cardId: string,
): void {
  const call = (slice.calls ?? []).find((c) => c.contact_id === contactId);
  const exchange = call?.exchanges.find((x) => x.card_id === cardId);
  const key = `${contactId}/${cardId}`;
  if (!exchange || state.cardsPlayed.has(key)) return;
  state.cardsPlayed.add(key);
  state.log.push(`dag ${state.day} — played ${cardId} into call:${contactId}`);
  for (const line of exchange.reply)
    if (line.fact_id) landFact(state, slice, line.fact_id, `paid by ${callId(contactId)}`);
}

export function runDispatch(state: PlayState, slice: CaseSlice, id: string): void {
  const dispatch = slice.dispatches.find((d) => d.id === id);
  if (!dispatch || state.dispatchesRun.has(id)) return;
  state.dispatchesRun.add(id);
  state.log.push(`dag ${state.day} — dispatch: ${dispatch.title}`);
  applyEffects(state, dispatch.effects);
}

export function takeTiltak(state: PlayState, slice: CaseSlice, id: string): void {
  const tiltak = slice.tiltak.find((t) => t.id === id);
  if (!tiltak || state.tiltakTaken.has(id)) return;
  state.tiltakTaken.add(id);
  state.log.push(`dag ${state.day} — tiltak taken: ${tiltak.title} (no emitted effects)`);
}

export function craftRecipe(state: PlayState, slice: CaseSlice, recipeKey: string): void {
  const recipe = (slice.recipes ?? []).find((r) => recipeId(r.pair) === recipeKey);
  if (!recipe || state.recipesCrafted.has(recipeKey)) return;
  state.recipesCrafted.add(recipeKey);
  state.log.push(`dag ${state.day} — crafted ${recipeKey}`);
  if (!state.questionsRevealed.has(recipe.question_id)) {
    state.questionsRevealed.add(recipe.question_id);
    state.log.push(`dag ${state.day} — question ${recipe.question_id} opens`);
  }
}

export function chooseHypothesis(state: PlayState, slice: CaseSlice, id: string): void {
  const h = slice.hypotheses.find((x) => x.id === id);
  if (!h || state.hypothesesChosen.has(id)) return;
  state.hypothesesChosen.add(id);
  state.log.push(`dag ${state.day} — hypothesis chosen (debug): ${h.title}`);
  applyEffects(state, h.opening_sources);
}

export function fireEvent(state: PlayState, slice: CaseSlice, eventType: string): void {
  const delta = slice.event_delta_specs.find((e) => e.event_type === eventType);
  if (!delta || state.eventsFired.has(eventType)) return;
  state.eventsFired.add(eventType);
  state.log.push(`dag ${state.day} — event fired (debug): ${delta.log_text}`);
  if (delta.reveal_fact_id) landFact(state, slice, delta.reveal_fact_id, 'event delta');
}

export function advanceDay(state: PlayState, slice: CaseSlice): void {
  state.day += 1;
  state.log.push(`— dag ${state.day} —`);
  const arriving = state.pendingDocuments.filter((p) => p.arrival_day <= state.day);
  state.pendingDocuments = state.pendingDocuments.filter((p) => p.arrival_day > state.day);
  for (const pending of arriving) arriveDocument(state, pending.document_id);
  runBeatsForDay(state, slice);
}

export function setStage(state: PlayState, stage: number): void {
  if (stage === state.stage) return;
  state.stage = stage;
  state.log.push(`dag ${state.day} — scenario stage → ${stage} (debug)`);
}

// ---- frontier status --------------------------------------------------------

/** A card is "held" once it is on the board — lifted fact or opened question. */
export function cardHeld(state: PlayState, slice: CaseSlice, cardId: string): boolean {
  if (state.factsLifted.has(cardId)) return true;
  const q = slice.questions.find((x) => x.id === cardId);
  return q !== undefined && questionOpen(state, slice, q.id);
}

function questionOpeners(slice: CaseSlice, questionId: string): number {
  let n = 0;
  for (const fact of slice.facts)
    for (const effect of fact.lift_effects)
      if (
        effect.op === 'reveal_questions' &&
        ((effect.args?.question_ids as string[]) ?? []).includes(questionId)
      )
        n += 1;
  for (const recipe of slice.recipes ?? []) if (recipe.question_id === questionId) n += 1;
  for (const beat of slice.day_script_beats)
    for (const effect of beat.effects)
      if (
        effect.op === 'reveal_questions' &&
        ((effect.args?.question_ids as string[]) ?? []).includes(questionId)
      )
        n += 1;
  return n;
}

export function questionOpen(state: PlayState, slice: CaseSlice, id: string): boolean {
  if (state.questionsRevealed.has(id)) return true;
  const q = slice.questions.find((x) => x.id === id);
  if (!q) return false;
  if (q.reveal_when) return predHolds(q.reveal_when, state);
  return questionOpeners(slice, id) === 0;
}

function dispatchOpeners(slice: CaseSlice, id: string, op: string, argKey: string): boolean {
  return slice.hypotheses.some((h) =>
    h.opening_sources.some(
      (src) => src.op === op && ((src.args?.[argKey] as string[]) ?? []).includes(id),
    ),
  );
}

/** open / locked / done for one index row. Kind mirrors model.ts IndexEntry. */
export function entityStatus(
  state: PlayState,
  slice: CaseSlice,
  id: string,
  kind: string,
): EntityStatus {
  switch (kind) {
    case 'document':
      return state.documentsArrived.has(id) ? 'open' : 'locked';
    case 'fact': {
      if (state.factsLifted.has(id)) return 'done';
      const fact = slice.facts.find((f) => f.id === id);
      const source = fact?.source_document_id ?? '';
      return source && state.documentsArrived.has(source) ? 'open' : 'locked';
    }
    case 'question':
      return questionOpen(state, slice, id) ? 'open' : 'locked';
    case 'hypothesis': {
      if (state.hypothesesChosen.has(id)) return 'done';
      const h = slice.hypotheses.find((x) => x.id === id);
      if (h?.availability && !predHolds(h.availability, state)) return 'locked';
      return 'open';
    }
    case 'tiltak': {
      if (state.tiltakTaken.has(id)) return 'done';
      const opened =
        state.tiltakOpened.has(id) || !dispatchOpeners(slice, id, 'open_tiltak', 'tiltak_ids');
      // A tiltak nothing opens: open (frontier truth — the vurdering slot
      // never gates in the lens); one a hypothesis opens stays locked till then.
      return opened ? 'open' : 'locked';
    }
    case 'dispatch': {
      if (state.dispatchesRun.has(id)) return 'done';
      const d = slice.dispatches.find((x) => x.id === id);
      const hasOpeners = dispatchOpeners(slice, id, 'open_dispatches', 'dispatch_ids');
      const opened = hasOpeners ? state.dispatchesOpened.has(id) : true;
      const gateHolds = d?.gate ? predHolds(d.gate, state) : true;
      return opened && gateHolds ? 'open' : 'locked';
    }
    case 'clock': {
      const clock = slice.clocks.find((c) => c.id === id);
      if (clock?.visibility && !predHolds(clock.visibility, state)) return 'locked';
      return 'open';
    }
    case 'event_delta':
      return state.eventsFired.has(id) ? 'done' : 'open';
    case 'day_script_beat': {
      const beat = slice.day_script_beats.find((b) => b.id === id);
      if (!beat) return 'locked';
      return state.beatsFired.has(id) ? 'done' : 'locked';
    }
    case 'chat_entry': {
      if (state.chatAsked.has(id)) return 'done';
      const entry = (slice.frank_chat ?? []).find((e) => e.id === id);
      if (!entry) return 'locked';
      return entry.needs.every((need) => state.factsLifted.has(need)) ? 'open' : 'locked';
    }
    case 'call': {
      const call = (slice.calls ?? []).find((c) => callId(c.contact_id) === id);
      if (!call) return 'locked';
      if (call.gate && !predHolds(call.gate, state)) return 'locked';
      return state.callsMade.has(call.contact_id) ? 'done' : 'open';
    }
    case 'recipe': {
      if (state.recipesCrafted.has(id)) return 'done';
      const recipe = (slice.recipes ?? []).find((r) => recipeId(r.pair) === id);
      if (!recipe) return 'locked';
      return recipe.pair.every((fid) => state.factsLifted.has(fid)) ? 'open' : 'locked';
    }
    case 'proposal': {
      const p = (slice.frank_proposals ?? []).find((x) => x.handbok_id === id);
      if (!p) return 'locked';
      const relevant = p.relevant_fact_ids ?? [];
      if (relevant.length === 0) return 'open';
      return relevant.some((fid) => state.factsLifted.has(fid)) ? 'open' : 'locked';
    }
  }
  return 'open';
}

// ---- frontier snapshot + delta ---------------------------------------------

export interface StatusRow {
  id: string;
  kind: string;
  label: string;
}

export interface FrontierDelta {
  opened: StatusRow[];
  closed: StatusRow[];
  finished: StatusRow[];
  stillLocked: number;
}

export function snapshot(
  state: PlayState,
  slice: CaseSlice,
  rows: StatusRow[],
): Map<StatusRow, EntityStatus> {
  const map = new Map<StatusRow, EntityStatus>();
  for (const row of rows) map.set(row, entityStatus(state, slice, row.id, row.kind));
  return map;
}

export function diffSnapshots(
  before: Map<StatusRow, EntityStatus>,
  after: Map<StatusRow, EntityStatus>,
): FrontierDelta {
  const delta: FrontierDelta = { opened: [], closed: [], finished: [], stillLocked: 0 };
  for (const [row, status] of after) {
    const was = before.get(row);
    if (status === 'locked') delta.stillLocked += 1;
    if (was === status || was === undefined) continue;
    if (status === 'done') delta.finished.push(row);
    else if (status === 'open') delta.opened.push(row);
    else delta.closed.push(row);
  }
  return delta;
}

/** Untriggered actions still reachable now — the run ends when this is empty
 *  and nothing more arrives with the days (SB-062: content exhaustion). */
export function openActionsLeft(state: PlayState, slice: CaseSlice): number {
  let n = 0;
  for (const fact of slice.facts)
    if (entityStatus(state, slice, fact.id, 'fact') === 'open') n += 1;
  for (const entry of slice.frank_chat ?? [])
    if (entityStatus(state, slice, entry.id, 'chat_entry') === 'open') n += 1;
  for (const call of slice.calls ?? []) {
    const gateOk = !call.gate || predHolds(call.gate, state);
    if (gateOk && !state.callsMade.has(call.contact_id)) n += 1;
    if (gateOk)
      for (const exchange of call.exchanges)
        if (
          !state.cardsPlayed.has(`${call.contact_id}/${exchange.card_id}`) &&
          cardHeld(state, slice, exchange.card_id)
        )
          n += 1;
  }
  for (const d of slice.dispatches)
    if (entityStatus(state, slice, d.id, 'dispatch') === 'open') n += 1;
  for (const t of slice.tiltak) if (entityStatus(state, slice, t.id, 'tiltak') === 'open') n += 1;
  for (const recipe of slice.recipes ?? [])
    if (entityStatus(state, slice, recipeId(recipe.pair), 'recipe') === 'open') n += 1;
  for (const h of slice.hypotheses)
    if (entityStatus(state, slice, h.id, 'hypothesis') === 'open') n += 1;
  for (const delta of slice.event_delta_specs) if (!state.eventsFired.has(delta.event_type)) n += 1;
  return n;
}

/** Content still coming with the days: pending documents + unfired beats. */
export function futureContentLeft(state: PlayState, slice: CaseSlice): number {
  const beatsLeft = slice.day_script_beats.filter((b) => !state.beatsFired.has(b.id)).length;
  return state.pendingDocuments.length + beatsLeft;
}
