// SDD-130 case-family sim-content emitters (PLAN-006): `# Visit:` and
// `# Strings:` blocks → the sparse `visits`/`strings` CaseSlice keys.
// Follows the weave contract (weave.ts): emit.ts calls emitSimContent and
// merges the returned refs/gateSites — no shared mutable state.

import type { DiagnosticBag, Span } from './diagnostics.ts';
import { codes, span } from './diagnostics.ts';
import type { PredicateSpec } from './condition.ts';
import { emitPredicate, parseCondition, warnIfGateDropped } from './condition.ts';
import type { RawBlock } from './parse.ts';
import { parseHeaderMeta } from './parse.ts';
import type { GateSite } from './lints.ts';
import { FieldMap, readStubMarker, stripGuillemets, warnLeftovers } from './emit-shared.ts';

// ---- SDD-130 `# Visit:` — choreography played by SocialVisitDirector.
// Step payloads mirror the OPPDRAG_BEATS tables verbatim
// (core-loop scripts/simulation/social_visit_director.gd).

export interface VisitLineStepOut {
  id: string;
  kind: 'line';
  speaker: string;
  line: string;
  /** Sim-minutes the visit dwells after the line. Omitted when unauthored. */
  dwell?: number;
  /** fired_beats key for the report register. Omitted when unauthored. */
  beat?: string;
  /** `{condition}` guard (weave grammar). Omitted when unguarded. */
  when?: PredicateSpec;
}

export interface VisitUrgentStepOut {
  id: string;
  kind: 'urgent';
  actor: string;
  label: string;
  room: string;
  duration: number;
  no_wait?: true;
  when?: PredicateSpec;
}

export interface VisitQueueStepOut {
  id: string;
  /** DD-120: queue an activity on Elling; his decision engine picks it up. */
  kind: 'queue_elling';
  room: string;
  duration: number;
  beat?: string;
  when?: PredicateSpec;
}

export type VisitStepOut = VisitLineStepOut | VisitUrgentStepOut | VisitQueueStepOut;

/** One `# Visit:` block — the Oppdrag catalog entry + its ordered steps. */
export interface VisitSceneOut {
  id: string;
  name: string;
  blurb: string;
  /** Frank's in-call offer line. Omitted when unauthored. */
  offer_line?: string;
  /** The question card that unlocks this visit. Omitted when unauthored. */
  unlocks_question?: string;
  steps: VisitStepOut[];
  stub?: true;
}

/** One `# Strings:` block — flat id-keyed table (SDD-130; DD-004 scopes the families). */
export interface StringTableOut {
  id: string;
  entries: Record<string, string>;
  stub?: true;
}

/** An `Unlocks:` question reference for emit.ts's shared stub resolution. */
export interface QuestionRef {
  id: string;
  where: Span;
  ownerId: string;
}

export function emitSimContent(
  visitBlocks: RawBlock[],
  stringsBlocks: RawBlock[],
  diag: DiagnosticBag,
): {
  visits: VisitSceneOut[];
  strings: StringTableOut[];
  questionRefs: QuestionRef[];
  gateSites: GateSite[];
} {
  const questionRefs: QuestionRef[] = [];
  const gateSites: GateSite[] = [];

  const stepNumber = (
    meta: Record<string, string>,
    key: string,
    ownerId: string,
    where: Span,
  ): number | undefined => {
    if (!(key in meta)) return undefined;
    const value = Number(meta[key]);
    if (!Number.isFinite(value)) {
      diag.add(
        codes.LINE_UNPARSED,
        'warning',
        `${key}= takes a number, got: "${meta[key]}"`,
        where,
        [ownerId],
      );
      return undefined;
    }
    return value;
  };

  const parseVisitStep = (
    visitId: string,
    bullet: { text: string; line: number },
    stepIndex: number,
  ): VisitStepOut | null => {
    const where = span(bullet.line);
    let rest = bullet.text.trim();

    // `{condition}` guard prefix — the weave/§6 grammar, via condition.ts.
    let when: PredicateSpec | undefined;
    if (rest.startsWith('{')) {
      const close = rest.indexOf('}');
      if (close > 0) {
        const inner = rest.slice(1, close);
        rest = rest.slice(close + 1).trim();
        const { ast, error } = parseCondition(inner);
        if (error !== null || ast === null) {
          diag.add(
            codes.COND_PARSE_ERROR,
            'error',
            `Cannot parse visit-step guard "{${inner}}": ${error ?? 'empty condition'}`,
            where,
            [visitId],
          );
        } else {
          const predicate = emitPredicate(ast, diag, visitId, where);
          warnIfGateDropped(ast, predicate, diag, visitId, where);
          gateSites.push({ ownerId: visitId, ast, where });
          if (predicate) when = predicate;
        }
      }
    }

    // Trailing `[k=v …]` payload (parseHeaderMeta; bare tokens are flags).
    let meta: Record<string, string> = {};
    const payload = rest.match(/\s*\[([^[\]]+)\]$/);
    if (payload) {
      meta = parseHeaderMeta(payload[1]);
      rest = rest.slice(0, rest.length - payload[0].length).trim();
    }
    // Steps without an authored id get a stable positional one.
    const id = meta.id ?? `${visitId}_s${stepIndex + 1}`;

    const requireDuration = (): number => {
      // The director dwells on duration — a step without one is an authoring
      // slip, not a default worth silently shipping.
      if (!('duration' in meta)) {
        diag.add(
          codes.FIELD_MISSING,
          'warning',
          `Step ${id} in visit ${visitId} has no duration= payload; 0 is emitted.`,
          where,
          [visitId, id],
        );
        return 0;
      }
      return stepNumber(meta, 'duration', visitId, where) ?? 0;
    };

    const urgent = rest.match(/^!\s*(\S+)\s*:\s*(.+?)\s*@\s*(\S+)$/);
    if (urgent) {
      return {
        id,
        kind: 'urgent',
        actor: urgent[1],
        label: urgent[2],
        room: urgent[3],
        duration: requireDuration(),
        ...('no_wait' in meta ? { no_wait: true as const } : {}),
        ...(when ? { when } : {}),
      };
    }

    const queue = rest.match(/^\?\s*(\S+)\s*@\s*(\S+)$/);
    if (queue) {
      if (queue[1] !== 'elling') {
        // DD-120: the queue step kind exists only for Elling.
        diag.add(
          codes.LINE_UNPARSED,
          'warning',
          `Queue steps take only elling ("? elling @ room"), got "${queue[1]}"; the step is skipped.`,
          where,
          [visitId],
        );
        return null;
      }
      const beat = meta.beat;
      return {
        id,
        kind: 'queue_elling',
        room: queue[2],
        duration: requireDuration(),
        ...(beat ? { beat } : {}),
        ...(when ? { when } : {}),
      };
    }

    const line = rest.match(/^(\S+)\s*:\s*(.+)$/);
    if (line) {
      const dwell = stepNumber(meta, 'dwell', visitId, where);
      return {
        id,
        kind: 'line',
        speaker: line[1],
        line: stripGuillemets(line[2]),
        ...(dwell !== undefined ? { dwell } : {}),
        ...(meta.beat ? { beat: meta.beat } : {}),
        ...(when ? { when } : {}),
      };
    }

    diag.add(
      codes.LINE_UNPARSED,
      'warning',
      `Expected a visit step ("speaker: «…»", "! actor: label @ room" or "? elling @ room") in visit ${visitId}, got: "${bullet.text.trim()}"`,
      where,
      [visitId],
    );
    return null;
  };

  const visits: VisitSceneOut[] = visitBlocks.map((block) => {
    const fields = new FieldMap(block.fields);
    const unlocksField = fields.find('Unlocks');
    if (unlocksField?.value) {
      questionRefs.push({
        id: unlocksField.value,
        where: span(unlocksField.line),
        ownerId: block.id,
      });
    }
    const offerField = fields.find('Offer');
    const stub = readStubMarker(fields.find('Stub'), block.id, diag);
    const seenSteps = new Map<string, number>();
    const steps: VisitStepOut[] = [];
    (block.bullets ?? []).forEach((bullet, index) => {
      const step = parseVisitStep(block.id, bullet, index);
      if (!step) return;
      const previous = seenSteps.get(step.id);
      if (previous !== undefined) {
        diag.add(
          codes.DUPLICATE_ID,
          'error',
          `Duplicate step id "${step.id}" in visit ${block.id} (first on line ${previous})`,
          span(bullet.line),
          [block.id, step.id],
        );
        return;
      }
      seenSteps.set(step.id, bullet.line);
      steps.push(step);
    });
    const out: VisitSceneOut = {
      id: block.id,
      name: fields.value('Title') ?? '',
      blurb: fields.value('Blurb') ?? '',
      ...(offerField ? { offer_line: stripGuillemets(offerField.value) } : {}),
      ...(unlocksField?.value ? { unlocks_question: unlocksField.value } : {}),
      steps,
      ...(stub ? { stub: true as const } : {}),
    };
    warnLeftovers(fields, diag, block.id);
    return out;
  });

  const stringTables: StringTableOut[] = stringsBlocks.map((block) => {
    let stub = false;
    const entries: Record<string, string> = {};
    const seenKeys = new Map<string, number>();
    for (const field of block.fields) {
      if (field.key === 'Stub') {
        stub = readStubMarker(field, block.id, diag) || stub;
        continue;
      }
      const previous = seenKeys.get(field.key);
      if (previous !== undefined) {
        diag.add(
          codes.DUPLICATE_ID,
          'error',
          `Duplicate string key "${field.key}" in strings ${block.id} (first on line ${previous})`,
          span(field.line),
          [block.id, field.key],
        );
        continue;
      }
      seenKeys.set(field.key, field.line);
      // Quoted like Phone/Offer fields — the quotes are markup, not text.
      entries[field.key] = stripGuillemets(field.value);
    }
    return {
      id: block.id,
      entries,
      ...(stub ? { stub: true as const } : {}),
    };
  });

  return { visits, strings: stringTables, questionRefs, gateSites };
}
