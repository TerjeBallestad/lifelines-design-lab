// §9 graph lints (PLAN-003 TASK-017) — the seven authoring-aid warnings from
// the 0.2 reference, computed on the compiled case graph and emitted through
// the shared diagnostics contract. All lints are ADVISORY: purely editorial,
// never blocking ("the file always compiles").
//
// The exact reachability definitions are documented next to the vendored spec
// in docs/markup-0.2-reference.md ("Compiler extensions recorded by
// TASK-017") — keep the two in sync.

import type { DiagnosticBag, Span } from './diagnostics.ts';
import { codes, span } from './diagnostics.ts';
import type { CondNode, PredicateSpec } from './condition.ts';
import { factIdsInCondition } from './condition.ts';
import type { CaseSlice } from './emit.ts';

/** A §6 condition bound at a gate position (when:/needs:/gate:/visible when:). */
export interface GateSite {
  ownerId: string;
  ast: CondNode | null;
  where: Span;
}

export interface LintInput {
  caseId: string;
  /** null when the case has no Deadline: — the quiet-day lint does not run. */
  deadline: { day: number; where: Span } | null;
  slice: CaseSlice;
  gates: GateSite[];
  /** Block id → source span (facts, questions, hypotheses, clocks, recipes …). */
  spans: Map<string, Span>;
  /** Weave spans: `call:<contact>` and chat entry ids → conversation block span. */
  weaveSpans: Map<string, Span>;
}

/** All fact ids a runtime predicate references (fact_lifted terms). */
function factIdsInPredicate(spec: PredicateSpec | undefined): string[] {
  if (!spec) return [];
  const out: string[] = [];
  const walk = (node: PredicateSpec): void => {
    if (node.op === 'fact_lifted' && typeof node.args?.fact_id === 'string')
      out.push(node.args.fact_id);
    for (const child of node.children ?? []) walk(child);
  };
  walk(spec);
  return out;
}

/** All `day >= N` thresholds a condition AST carries. */
function dayThresholdsInCondition(ast: CondNode | null): number[] {
  const out: number[] = [];
  const walk = (node: CondNode): void => {
    switch (node.kind) {
      case 'term':
        if (node.term === 'day-compare' && node.value !== undefined) out.push(node.value);
        break;
      case 'not':
        walk(node.child);
        break;
      default:
        for (const child of node.children) walk(child);
    }
  };
  if (ast) walk(ast);
  return out;
}

/**
 * The set of fact ids some game surface can pay to the player: a document run
 * anchor, a liftable call line, a chat entry's ~ pay, or an event delta's
 * reveal. This is the §9 deliverability definition shared by lints 1, 5 and 7.
 */
function payableFacts(slice: CaseSlice): Set<string> {
  const payable = new Set<string>();
  for (const document of slice.documents)
    for (const run of document.runs) if (run.fact_id) payable.add(run.fact_id);
  for (const call of slice.calls ?? []) {
    for (const line of call.opening) if (line.fact_id) payable.add(line.fact_id);
    for (const exchange of call.exchanges)
      for (const line of exchange.reply) if (line.fact_id) payable.add(line.fact_id);
  }
  for (const entry of slice.frank_chat ?? []) if (entry.pays_fact) payable.add(entry.pays_fact);
  for (const delta of slice.event_delta_specs)
    if (delta.reveal_fact_id) payable.add(delta.reveal_fact_id);
  // SDD-011: a derived fact is payable when every fact it derives from is.
  // Fixed-point pass so a derived-of-derived chain resolves in any order.
  let changed = true;
  while (changed) {
    changed = false;
    for (const fact of slice.facts) {
      if (payable.has(fact.id)) continue;
      const derived = fact.derived_from ?? [];
      if (derived.length && derived.every((id) => payable.has(id))) {
        payable.add(fact.id);
        changed = true;
      }
    }
  }
  return payable;
}

export function runLints(input: LintInput, diag: DiagnosticBag): void {
  const { slice, spans, weaveSpans } = input;
  const spanFor = (id: string): Span => spans.get(id) ?? weaveSpans.get(id) ?? span(1);
  const advisory = (code: string, message: string, where: Span, subjectIds: string[]): void => {
    diag.add(code, 'advisory', message, where, subjectIds);
  };

  const payable = payableFacts(slice);
  const declaredHypotheses = new Set(slice.hypotheses.map((h) => h.id));
  const declaredTiltak = new Set(slice.tiltak.map((t) => t.id));

  // ---- Lint 1: facts without a source anchor ------------------------------
  for (const fact of slice.facts) {
    if (payable.has(fact.id)) continue;
    advisory(
      codes.LINT_FACT_NO_SOURCE_ANCHOR,
      `Fact ${fact.id} has no source anchor — no document run, call line, ~ pay, or event delta ever pays it to the player.`,
      spanFor(fact.id),
      [fact.id],
    );
  }

  // ---- Lint 2: questions with no path to a tiltak -------------------------
  for (const question of slice.questions) {
    const leadTiltak = (question.leads ?? []).some(
      (lead) => declaredTiltak.has(lead.target) || lead.target.startsWith('t_'),
    );
    const questionHypotheses = slice.hypotheses.filter((h) => h.question_id === question.id);
    const hypothesisOpensTiltak = questionHypotheses.some((h) =>
      h.opening_sources.some(
        (source) =>
          source.op === 'open_tiltak' && ((source.args?.tiltak_ids as string[]) ?? []).length > 0,
      ),
    );
    if (leadTiltak || hypothesisOpensTiltak) continue;
    advisory(
      codes.LINT_QUESTION_NO_TILTAK_PATH,
      `Question ${question.id} has no path to a tiltak — no Lead targets one and none of its hypotheses opens one.`,
      spanFor(question.id),
      [question.id],
    );
  }

  // ---- Lint 3: hypotheses that open nothing -------------------------------
  for (const hypothesis of slice.hypotheses) {
    if (hypothesis.opening_sources.length > 0) continue;
    advisory(
      codes.LINT_HYPOTHESIS_OPENS_NOTHING,
      `Hypothesis ${hypothesis.id} opens nothing — no tiltak, dispatch, or conversation.`,
      spanFor(hypothesis.id),
      [hypothesis.id],
    );
  }

  // ---- Lint 4: conversation loose ends ------------------------------------
  for (const call of slice.calls ?? []) {
    const ownerId = `call:${call.contact_id}`;
    if (call.exchanges.length === 0) {
      advisory(
        codes.LINT_CONVERSATION_LOOSE_END,
        `Call ${ownerId} has no exchanges — the player can only hang up.`,
        spanFor(ownerId),
        [ownerId],
      );
    }
    for (const exchange of call.exchanges) {
      if (exchange.reply.length > 0) continue;
      advisory(
        codes.LINT_CONVERSATION_LOOSE_END,
        `Call exchange ${exchange.card_id} in ${ownerId} has an empty reply — playing the card returns nothing.`,
        spanFor(ownerId),
        [ownerId, exchange.card_id],
      );
    }
  }
  for (const entry of slice.frank_chat ?? []) {
    if (entry.answer_lines.length === 0 && entry.followups.length === 0 && !entry.pays_fact) {
      advisory(
        codes.LINT_CONVERSATION_LOOSE_END,
        `Chat entry ${entry.id} returns nothing — no answer lines, followups, or ~ pay.`,
        spanFor(entry.id),
        [entry.id],
      );
    }
    for (const followup of entry.followups) {
      if (followup.lines.length > 0) continue;
      advisory(
        codes.LINT_CONVERSATION_LOOSE_END,
        `Followup "${followup.label}" on chat entry ${entry.id} has no lines — tapping it returns nothing.`,
        spanFor(entry.id),
        [entry.id],
      );
    }
  }

  // ---- Lint 5: gates referencing undeliverable facts ----------------------
  const reportedGateFacts = new Set<string>();
  const gateFact = (ownerId: string, factId: string, where: Span): void => {
    if (payable.has(factId)) return;
    const key = `${ownerId}→${factId}`;
    if (reportedGateFacts.has(key)) return;
    reportedGateFacts.add(key);
    advisory(
      codes.LINT_GATE_UNDELIVERABLE_FACT,
      `Gate on ${ownerId} references ${factId}, which no document anchor, weave line, or effect can ever pay — the gate can never open.`,
      where,
      [ownerId, factId],
    );
  };
  for (const gate of input.gates)
    for (const factId of factIdsInCondition(gate.ast)) gateFact(gate.ownerId, factId, gate.where);
  for (const recipe of slice.recipes ?? []) {
    const recipeId = `${recipe.pair[0]} + ${recipe.pair[1]}`;
    for (const factId of recipe.pair) gateFact(recipeId, factId, spanFor(recipeId));
  }
  for (const call of slice.calls ?? []) {
    const ownerId = `call:${call.contact_id}`;
    for (const factId of factIdsInPredicate(call.gate)) gateFact(ownerId, factId, spanFor(ownerId));
    for (const exchange of call.exchanges) gateFact(ownerId, exchange.card_id, spanFor(ownerId));
  }
  for (const entry of slice.frank_chat ?? [])
    for (const factId of entry.needs) gateFact(entry.id, factId, spanFor(entry.id));

  // ---- Lint 6: quiet days inside the deadline window ----------------------
  if (input.deadline) {
    // Day 1 always counts: the initial document set (documents without an
    // arrival effect) is on the desk at case start.
    const eventDays = new Set<number>([1]);
    for (const beat of slice.day_script_beats) {
      eventDays.add(beat.day);
      for (const effect of beat.effects) {
        if (effect.op !== 'queue_pending_document') continue;
        const delay = typeof effect.args.delay_days === 'number' ? effect.args.delay_days : 0;
        eventDays.add(beat.day + delay);
      }
    }
    for (const gate of input.gates)
      for (const day of dayThresholdsInCondition(gate.ast)) eventDays.add(day);
    const quiet: number[] = [];
    for (let day = 1; day <= input.deadline.day; day += 1) if (!eventDays.has(day)) quiet.push(day);
    if (quiet.length > 0) {
      advisory(
        codes.LINT_QUIET_DAY,
        `Quiet day${quiet.length > 1 ? 's' : ''} ${quiet.join(', ')} inside the deadline window (day 1–${input.deadline.day}): no document arrival, beat, or newly-satisfiable day-gate lands there.`,
        input.deadline.where,
        [input.caseId],
      );
    }
  }

  // ---- Lint 7: clocks that can never become visible -----------------------
  // Best-case satisfiability: unpayable facts and undeclared hypotheses are
  // false, everything else (stage, not-terms, unknown ops) is assumed true.
  const bestCase = (spec: PredicateSpec): boolean => {
    switch (spec.op) {
      case 'fact_lifted':
        return typeof spec.args?.fact_id === 'string' ? payable.has(spec.args.fact_id) : true;
      case 'hypothesis_chosen':
        return typeof spec.args?.hypothesis_id === 'string'
          ? declaredHypotheses.has(spec.args.hypothesis_id)
          : true;
      case 'all':
        return (spec.children ?? []).every(bestCase);
      case 'any':
        return (spec.children ?? []).some(bestCase);
      default:
        return true; // not, scenario_stage_at_least, future ops — assume reachable
    }
  };
  for (const clock of slice.clocks) {
    if (!clock.visibility || bestCase(clock.visibility)) continue;
    advisory(
      codes.LINT_CLOCK_NEVER_VISIBLE,
      `Clock ${clock.id} can never become visible — its visible when: needs facts nothing can pay or hypotheses that do not exist.`,
      spanFor(clock.id),
      [clock.id],
    );
  }
}
