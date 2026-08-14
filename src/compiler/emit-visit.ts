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
import { goalCostMinutes, parseVisitGrammar } from './visit-grammar.ts';
import type {
  DutyWord,
  GoalNeed,
  GoalYield,
  StageDuty,
  StageEndTrigger,
  StageFailTrigger,
  TargetKind,
  VisitStage,
} from './visit-grammar.ts';
import { CAST_IDS, ROOM_IDS, namespaceCollisions } from './namespaces.ts';
import { ACTIVITY_IDS } from '../content/generated/activityCatalog.ts';

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

// ---- SB-109 goal-tier visits (PLAN-010) — the ruled stage/goal grammar.
// Emitted beside the legacy steps shape as a discriminated union: only the
// goal-tier shape carries `format: 'goals'`, and the legacy shape stays
// byte-identical to its PLAN-006 form (npm run case:check is the proof), so
// a consumer can never misread one shape as the other.

export interface GoalVisitDutyOut {
  character: string;
  verb: DutyWord;
  /** goto/stay target with its namespace resolution. */
  target?: string;
  target_kind?: TargetKind;
  /** do: the activity id; activity_stub marks an id missing from SB-110's catalog. */
  activity?: string;
  activity_stub?: true;
  /** converse partner. */
  partner?: string;
  /** say line / converse opening line. */
  line?: string;
  /** Authored `key=value` params (dwell=, seat=, grace=), verbatim. Omitted when empty. */
  params?: Record<string, string>;
}

export type GoalVisitEndOut = StageEndTrigger;

export type GoalVisitFailOut =
  | { kind: 'timeout'; minutes: number }
  | { kind: 'unreachable'; grace_minutes?: number }
  | { kind: 'role-lost'; role: string; grace_minutes?: number };

export interface GoalVisitStageOut {
  id: string;
  duties: GoalVisitDutyOut[];
  /** Multiple end triggers = OR (first wins). */
  ends: GoalVisitEndOut[];
  /** Optional; the engine-default timeout always guards (SB-107). */
  fails: GoalVisitFailOut[];
  /** Self-termination label when no ends are authored (say/converse stages). */
  auto_end?: string;
}

export interface GoalVisitGoalOut {
  name: string;
  plan: string;
  needs: GoalNeed[];
  yields: GoalYield[];
  /** Derived, never authored (SB-114) — see the cost rule in visit-grammar.ts. */
  cost_minutes: number;
  stages: GoalVisitStageOut[];
}

/** One stage-grammar `# Visit:` block — the goal tier (DD-010). */
export interface GoalVisitOut {
  id: string;
  format: 'goals';
  name: string;
  blurb: string;
  offer_line?: string;
  goals: GoalVisitGoalOut[];
  /** Stages outside any goal, before the goals: an authored spine. Omitted when none. */
  spine_stages?: GoalVisitStageOut[];
  /** The visit-level `## Call-off` stages. Omitted when none. */
  calloff_stages?: GoalVisitStageOut[];
  stub?: true;
}

/** The `visits` slice entry: legacy steps or the SB-109 goal tier. */
export type VisitOut = VisitSceneOut | GoalVisitOut;

/**
 * SB-107: a room may never share a name with a character — a bare `goto`
 * target could not be disambiguated. The namespaces are seeded lists today
 * (namespaces.ts IOU), so this guards the future catalog import too.
 */
export function checkNamespaceCollisions(
  diag: DiagnosticBag,
  cast: readonly string[] = CAST_IDS,
  rooms: readonly string[] = ROOM_IDS,
): void {
  for (const name of namespaceCollisions(cast, rooms)) {
    diag.add(
      codes.VISIT_NAMESPACE_COLLISION,
      'error',
      `"${name}" is both a room and a character — bare goto targets cannot be disambiguated.`,
      span(1),
      [name],
    );
  }
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
  visits: VisitOut[];
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

  const emitGoalVisit = (block: RawBlock): GoalVisitOut => {
    const model = parseVisitGrammar(block, diag);
    for (const goal of model.goals) {
      for (const y of goal.yields) {
        if (y.kind === 'open') {
          // Shared stub resolution in emit.ts — `yield: open q_x` is what
          // dissolved Unlocks: (SB-114).
          questionRefs.push({ id: y.id, where: span(goal.lineNo), ownerId: block.id });
        }
      }
    }

    const dutyOut = (character: string, duty: StageDuty): GoalVisitDutyOut => {
      const out: GoalVisitDutyOut = { character, verb: duty.verb };
      if (duty.target !== undefined) {
        out.target = duty.target;
        out.target_kind = duty.targetKind;
      }
      if (duty.activity !== undefined) {
        out.activity = duty.activity;
        if (!ACTIVITY_IDS.has(duty.activity)) {
          out.activity_stub = true;
          diag.add(
            codes.VISIT_ACTIVITY_STUB,
            'warning',
            `Unknown do-activity "${duty.activity}" in visit ${block.id} — emitted as a stub (SB-110 catalog).`,
            span(duty.lineNo),
            [block.id, duty.activity],
          );
        }
      }
      if (duty.partner !== undefined) out.partner = duty.partner;
      if (duty.line !== undefined) out.line = duty.line;
      if (Object.keys(duty.params).length > 0) out.params = { ...duty.params };
      return out;
    };

    const failOut = (fail: StageFailTrigger): GoalVisitFailOut => {
      switch (fail.kind) {
        case 'timeout':
          return { kind: 'timeout', minutes: fail.minutes };
        case 'unreachable':
          return {
            kind: 'unreachable',
            ...(fail.graceMinutes !== undefined ? { grace_minutes: fail.graceMinutes } : {}),
          };
        case 'role-lost':
          return {
            kind: 'role-lost',
            role: fail.role,
            ...(fail.graceMinutes !== undefined ? { grace_minutes: fail.graceMinutes } : {}),
          };
      }
    };

    // The slice must not alias parser-owned objects — everything is cloned so
    // a later mutation of the parse model can never leak into the emit.
    const stageOut = (stage: VisitStage): GoalVisitStageOut => ({
      id: stage.id,
      duties: Object.entries(stage.duties).map(([character, duty]) => dutyOut(character, duty)),
      ends: stage.ends.map((end) => ({ ...end })),
      fails: stage.fails.map(failOut),
      ...(stage.autoEnd !== undefined ? { auto_end: stage.autoEnd } : {}),
    });

    return {
      id: model.id,
      format: 'goals',
      name: model.title,
      blurb: model.blurb,
      ...(model.offer !== undefined ? { offer_line: model.offer } : {}),
      goals: model.goals.map((goal) => ({
        name: goal.name,
        plan: goal.plan,
        needs: goal.needs.map((need) => ({ ...need })),
        yields: goal.yields.map((y) => ({ ...y })),
        cost_minutes: goalCostMinutes(goal),
        stages: goal.stages.map(stageOut),
      })),
      ...(model.spineStages.length > 0 ? { spine_stages: model.spineStages.map(stageOut) } : {}),
      ...(model.calloffStages.length > 0
        ? { calloff_stages: model.calloffStages.map(stageOut) }
        : {}),
      ...(model.stub ? { stub: true as const } : {}),
    };
  };

  const emitLegacyVisit = (block: RawBlock): VisitSceneOut => {
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
  };

  if (visitBlocks.some((block) => block.stageGrammar)) checkNamespaceCollisions(diag);

  const visits: VisitOut[] = visitBlocks.map((block) =>
    block.stageGrammar ? emitGoalVisit(block) : emitLegacyVisit(block),
  );

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
