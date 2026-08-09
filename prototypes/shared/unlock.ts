// SB-055 probe — the "what opens this?" sentence. One computed sentence per
// node, derived from the emitted slice (predicates, effects, recipes, beats).
// Pure module: no DOM, importable by the page and by the unit test.
//
// The sentence answers the SB-050 closing finding: a field's consequence is
// invisible while authoring. Every gate the sim actually reads is restated
// here in plain words; a node nothing opens says so out loud.
import type { CaseSlice } from '../../src/compiler/emit.ts';
import type { PredicateSpec } from '../../src/compiler/condition.ts';
import type { NodeKind } from './node-kind.ts';
import { CHAT_FRANK_ID, callId, recipeId } from './weave-ids.ts';

/** «Title» (id) — title first, the id in parens for the jump-minded. */
function nameOf(id: string, slice: CaseSlice): string {
  const hit =
    slice.facts.find((f) => f.id === id)?.label ??
    slice.questions.find((q) => q.id === id)?.card_title ??
    slice.questions.find((q) => q.id === id)?.prompt ??
    slice.hypotheses.find((h) => h.id === id)?.title ??
    slice.tiltak.find((t) => t.id === id)?.title ??
    slice.dispatches.find((d) => d.id === id)?.title ??
    slice.documents.find((d) => d.id === id)?.title ??
    slice.clocks.find((c) => c.id === id)?.label;
  if (!hit) return id;
  const plain = hit
    .replace(/\[icon=[^\]]+\]/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
  return `«${plain}»`;
}

/** A runtime predicate as one readable clause. */
export function predText(pred: PredicateSpec, slice: CaseSlice): string {
  switch (pred.op) {
    case 'fact_lifted':
      return `${nameOf(String(pred.args?.fact_id ?? ''), slice)} is lifted`;
    case 'hypothesis_chosen':
      return `${nameOf(String(pred.args?.hypothesis_id ?? ''), slice)} is chosen`;
    case 'scenario_stage_at_least':
      return `the scenario has reached stage ${pred.args?.stage ?? 0}`;
    case 'all':
      return (pred.children ?? []).map((c) => predText(c, slice)).join(' and ');
    case 'any':
      return (pred.children ?? []).map((c) => predText(c, slice)).join(', or ');
    case 'not':
      return `not (${(pred.children ?? []).map((c) => predText(c, slice)).join(' and ')})`;
    default:
      return pred.op;
  }
}

/** Facts whose lift reveals this question (lift_effects reveal_questions). */
function factsOpening(questionId: string, slice: CaseSlice): string[] {
  const out: string[] = [];
  for (const fact of slice.facts)
    for (const effect of fact.lift_effects)
      if (
        effect.op === 'reveal_questions' &&
        ((effect.args?.question_ids as string[]) ?? []).includes(questionId)
      )
        out.push(fact.id);
  return out;
}

export function unlockSentence(id: string, kind: NodeKind, slice: CaseSlice): string {
  switch (kind) {
    case 'document': {
      for (const beat of slice.day_script_beats)
        for (const effect of beat.effects)
          if (
            effect.op === 'queue_pending_document' &&
            String(effect.args?.document_id ?? '') === id
          ) {
            const delay = Number(effect.args?.delay_days ?? 0);
            return `Arrives dag ${beat.day + delay} via the day script.`;
          }
      for (const dispatch of slice.dispatches)
        for (const effect of dispatch.effects)
          if (
            effect.op === 'queue_pending_document' &&
            String(effect.args?.document_id ?? '') === id
          )
            return `Delivered after the player runs ${nameOf(dispatch.id, slice)}.`;
      return `In the opening stack — on the desk from dag 1.`;
    }
    case 'fact': {
      const fact = slice.facts.find((f) => f.id === id);
      if (!fact) return '';
      const parts: string[] = [];
      if (fact.source_document_id)
        parts.push(`The player lifts it from ${nameOf(fact.source_document_id, slice)}`);
      for (const delta of slice.event_delta_specs)
        if (delta.reveal_fact_id === id)
          parts.push(`revealed when ${nameOf(delta.clock_id, slice)} ticks`);
      for (const call of slice.calls ?? []) {
        const pays =
          call.opening.some((line) => line.fact_id === id) ||
          call.exchanges.some((x) => x.reply.some((line) => line.fact_id === id));
        if (pays) parts.push(`paid by ${callId(call.contact_id)}`);
      }
      for (const entry of slice.frank_chat ?? [])
        if (entry.pays_fact === id) parts.push(`paid by ${CHAT_FRANK_ID}`);
      if (parts.length === 0) return `No source — nothing in the case produces this fact.`;
      return `${parts.join('; also ')}.`;
    }
    case 'question': {
      const q = slice.questions.find((x) => x.id === id);
      const clauses: string[] = [];
      if (q?.reveal_when) clauses.push(`when ${predText(q.reveal_when, slice)}`);
      for (const factId of factsOpening(id, slice))
        clauses.push(`when ${nameOf(factId, slice)} is lifted`);
      for (const recipe of slice.recipes ?? [])
        if (recipe.question_id === id)
          clauses.push(
            `by combining ${nameOf(recipe.pair[0], slice)} + ${nameOf(recipe.pair[1], slice)}`,
          );
      if (clauses.length === 0) return `Visible from the start — nothing gates it.`;
      return `Opens ${clauses.join(', or ')}.`;
    }
    case 'hypothesis': {
      const h = slice.hypotheses.find((x) => x.id === id);
      if (!h) return '';
      const under = `under ${nameOf(h.question_id, slice)}`;
      if (!h.availability) return `Always selectable ${under}.`;
      return `Selectable ${under} once ${predText(h.availability, slice)}.`;
    }
    case 'tiltak':
    case 'dispatch': {
      const openers = slice.hypotheses.filter((h) =>
        h.opening_sources.some(
          (src) =>
            (src.op === 'open_tiltak' && ((src.args?.tiltak_ids as string[]) ?? []).includes(id)) ||
            (src.op === 'open_dispatches' &&
              ((src.args?.dispatch_ids as string[]) ?? []).includes(id)),
        ),
      );
      const gate =
        kind === 'dispatch' ? slice.dispatches.find((d) => d.id === id)?.gate : undefined;
      const parts: string[] = [];
      if (openers.length > 0)
        parts.push(
          `Opens when ${openers.map((h) => `${nameOf(h.id, slice)} is chosen`).join(', or ')}`,
        );
      if (gate)
        parts.push(`${parts.length ? 'and gated on' : 'Gated on'} ${predText(gate, slice)}`);
      if (parts.length === 0)
        return `Never opens — no hypothesis opens it${kind === 'dispatch' ? ' and it has no gate' : ''}.`;
      return `${parts.join(', ')}.`;
    }
    case 'clock': {
      const clock = slice.clocks.find((c) => c.id === id);
      if (clock?.visibility) return `Visible once ${predText(clock.visibility, slice)}.`;
      return `Visible from the start.`;
    }
    case 'conversation': {
      if (id === CHAT_FRANK_ID)
        return `Chat entries appear as their Needs facts land on the board.`;
      const call = (slice.calls ?? []).find((c) => callId(c.contact_id) === id);
      if (call?.gate) return `Callable once ${predText(call.gate, slice)}.`;
      return `Callable from the start; exchanges unlock on played cards.`;
    }
    case 'recipe': {
      const recipe = (slice.recipes ?? []).find((r) => recipeId(r.pair) === id);
      if (!recipe) return '';
      return `Craftable once ${nameOf(recipe.pair[0], slice)} and ${nameOf(recipe.pair[1], slice)} are both lifted.`;
    }
    case 'proposal': {
      const proposal = (slice.frank_proposals ?? []).find((p) => p.handbok_id === id);
      const n = proposal?.relevant_fact_ids?.length ?? 0;
      return n > 0
        ? `Frank proposes it once one of its ${n} relevant facts is on the table.`
        : `Frank proposes it by category match — no explicit fact list.`;
    }
  }
  return '';
}
