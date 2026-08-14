// SB-109 (PLAN-010): the ruled stage/goal grammar inside `# Visit:` blocks.
// Port of the probe parser in prototypes/visit-syntax/index.html (SB-107
// stage surface + SB-114 goal tier), behavior-compatible, probe-independent.
// parse.ts captures stage-grammar visit bodies verbatim with true file line
// numbers (RawBlock.stageGrammar); this module turns one block into a typed
// scene model and pushes every parse-level diagnostic.

import type { DiagnosticBag } from './diagnostics.ts';
import { codes, span } from './diagnostics.ts';
import type { RawBlock, RawField } from './parse.ts';
import { readStubMarker, stripGuillemets } from './emit-shared.ts';
import { CAST_SET, ROOM_SET } from './namespaces.ts';

export type DutyWord = 'goto' | 'stay' | 'say' | 'converse' | 'do' | 'free';

/** How a bare goto/stay target resolved against the two namespaces. */
export type TargetKind = 'room' | 'character' | 'unknown';

export interface StageDuty {
  verb: DutyWord;
  /** goto/stay: room or character name (a leading `@` disambiguator is stripped). */
  target?: string;
  targetKind?: TargetKind;
  /** do: the activity id (catalog-checked at emit, SB-110). */
  activity?: string;
  /** converse: the partner character. */
  partner?: string;
  /** say: the spoken line; converse: the opening line spoken by this character. */
  line?: string;
  /** Trailing `key=value` tokens (dwell=, seat=, grace=), values verbatim. */
  params: Record<string, string>;
  lineNo: number;
}

export type StageEndTrigger =
  | { kind: 'arrived' }
  | { kind: 'duration'; minutes: number }
  | { kind: 'event'; name: string };

export type StageFailTrigger =
  | { kind: 'timeout'; minutes: number }
  | { kind: 'unreachable'; graceMinutes?: number }
  | { kind: 'role-lost'; role: string; graceMinutes?: number };

export interface VisitStage {
  /** Authored `== name`, or a generated stable `st<N>` (N = file-order ordinal). */
  id: string;
  /** Present when the id was generated (anonymous `==`). */
  auto?: true;
  lineNo: number;
  /** One duty per character per stage (enforced). */
  duties: Record<string, StageDuty>;
  /** Multiple end triggers = OR (first wins at runtime). */
  ends: StageEndTrigger[];
  /** Optional; the engine-default timeout always guards (SB-107). */
  fails: StageFailTrigger[];
  /**
   * Set when the stage has no authored end but self-terminates through a
   * say/converse duty ('line read' | 'conversation ends'); converse outlasts
   * say, so its label wins when both are present.
   */
  autoEnd?: string;
}

export interface GoalNeed {
  neg: boolean;
  kind: 'presence' | 'fact' | 'denied';
  id: string;
}

export interface GoalYield {
  kind: 'fact' | 'open';
  id: string;
}

/** SB-114/DD-010: a goal owns exactly one scene (>= 1 stage) plus need/yield. */
export interface VisitGoal {
  name: string;
  lineNo: number;
  plan: string;
  needs: GoalNeed[];
  yields: GoalYield[];
  stages: VisitStage[];
}

export interface StageGrammarVisit {
  id: string;
  title: string;
  blurb: string;
  offer?: string;
  stub?: true;
  goals: VisitGoal[];
  /** Stages before any goal: an authored spine (a visit needs no goals). */
  spineStages: VisitStage[];
  /** The one visit-level `## Call-off` section (a fail outside a goal routes here). */
  calloffStages: VisitStage[];
}

// One row per duty word: which arg it takes, what a missing arg is called in
// errors, whether trailing text is a spoken line, and the label when the duty
// ends the stage by itself. Mirrors the probe's VERB_SPEC.
const VERB_SPEC: Record<
  DutyWord,
  { arg?: 'target' | 'activity' | 'partner'; required?: string; text?: boolean; selfTerm?: string }
> = {
  goto: { arg: 'target', required: 'a room or character' },
  stay: { arg: 'target' },
  do: { arg: 'activity', required: 'an activity' },
  say: { text: true, required: 'a line', selfTerm: 'line read' },
  converse: { arg: 'partner', required: 'a partner', text: true, selfTerm: 'conversation ends' },
  free: {},
};

const DUTY_WORDS = Object.keys(VERB_SPEC) as DutyWord[];

const castList = (): string => [...CAST_SET].join('|');

export function parseVisitGrammar(block: RawBlock, diag: DiagnosticBag): StageGrammarVisit {
  const visitId = block.id;
  const visit: StageGrammarVisit = {
    id: visitId,
    title: '',
    blurb: '',
    goals: [],
    spineStages: [],
    calloffStages: [],
  };

  const allStages: VisitStage[] = [];
  let section: 'spine' | 'goal' | 'calloff' = 'spine';
  let cur: VisitStage | null = null;
  let curGoal: VisitGoal | null = null;
  let calloffSeen = false;
  let calloffLine = 0;

  for (const prose of block.proseLines) {
    const n = prose.line;
    const line = prose.text.trim();
    if (!line) continue;
    let m: RegExpMatchArray | null;

    if ((m = line.match(/^(title|blurb|offer|stub)\s*:\s*(.*)$/i)) && !curGoal) {
      const key = m[1].toLowerCase();
      const value = m[2].trim();
      if (key === 'title') visit.title = value;
      else if (key === 'blurb') visit.blurb = value;
      else if (key === 'offer') visit.offer = stripGuillemets(value);
      else {
        const field: RawField = { key: 'Stub', value, line: n };
        if (readStubMarker(field, visitId, diag)) visit.stub = true;
      }
      continue;
    }

    if (/^unlocks\s*:/i.test(line)) {
      // SB-114: Unlocks dissolved into the goal tier.
      diag.add(
        codes.VISIT_UNLOCKS_DISSOLVED,
        'error',
        `Unlocks: is not part of the stage grammar in visit ${visitId} — author "yield: open <question>" on the goal instead (SB-114).`,
        span(n),
        [visitId],
      );
      continue;
    }

    if (/^##\s*call-?off/i.test(line)) {
      if (calloffSeen) {
        diag.add(
          codes.DUPLICATE_ID,
          'error',
          `Visit ${visitId} has a second ## Call-off (first on line ${calloffLine}); one visit-level call-off per visit.`,
          span(n),
          [visitId],
        );
      }
      calloffSeen = true;
      calloffLine = calloffLine || n;
      section = 'calloff';
      cur = null;
      curGoal = null;
      continue;
    }

    if ((m = line.match(/^##\s*goal\s*:?\s*(.*)$/i))) {
      const name = m[1].trim() || `goal_${visit.goals.length + 1}`;
      if (visit.goals.some((g) => g.name === name)) {
        diag.add(
          codes.DUPLICATE_ID,
          'error',
          `Duplicate goal name "${name}" in visit ${visitId}`,
          span(n),
          [visitId, name],
        );
      }
      curGoal = { name, lineNo: n, plan: '', needs: [], yields: [], stages: [] };
      visit.goals.push(curGoal);
      section = 'goal';
      cur = null;
      continue;
    }

    if (curGoal && section === 'goal' && !cur) {
      if ((m = line.match(/^plan\s*:\s*(.*)$/i))) {
        curGoal.plan = m[1].trim();
        continue;
      }
      if ((m = line.match(/^need\s*:\s*(.*)$/i))) {
        parseNeeds(m[1], curGoal, n, visitId, diag);
        continue;
      }
      if (/^cost\s*:/i.test(line)) {
        diag.add(
          codes.VISIT_COST_AUTHORED,
          'error',
          `Goal "${curGoal.name}" in visit ${visitId} authors cost: — cost is derived from the scene, never authored (SB-114).`,
          span(n),
          [visitId, curGoal.name],
        );
        continue;
      }
      if ((m = line.match(/^yield\s*:\s*(.*)$/i))) {
        parseYields(m[1], curGoal);
        continue;
      }
    }

    if (line.startsWith('==')) {
      const name = line.slice(2).trim();
      cur = {
        id: name || `st${allStages.length + 1}`,
        ...(name ? {} : { auto: true as const }),
        lineNo: n,
        duties: {},
        ends: [],
        fails: [],
      };
      allStages.push(cur);
      if (curGoal && section === 'goal') curGoal.stages.push(cur);
      else if (section === 'calloff') visit.calloffStages.push(cur);
      else visit.spineStages.push(cur);
      continue;
    }

    if (!cur) {
      diag.add(
        codes.LINE_UNPARSED,
        'error',
        `Line outside a stage in visit ${visitId}: "${line}"`,
        span(n),
        [visitId],
      );
      continue;
    }

    if (line.startsWith('->')) {
      const trigger = parseEnd(line.slice(2).trim(), n, visitId, diag);
      if (trigger) cur.ends.push(trigger);
      continue;
    }
    if (line.startsWith('!>')) {
      const trigger = parseFail(line.slice(2).trim(), n, visitId, diag);
      if (trigger) cur.fails.push(trigger);
      continue;
    }
    if (line.startsWith('-')) {
      parseDuty(line.slice(1).trim(), cur, n, visitId, diag);
      continue;
    }
    diag.add(
      codes.LINE_UNPARSED,
      'error',
      `Unrecognized stage line in visit ${visitId}: "${line}"`,
      span(n),
      [visitId],
    );
  }

  for (const stage of allStages) {
    if (stage.ends.length > 0) continue;
    // converse outlasts say, so its label wins when both are present.
    const duties = Object.values(stage.duties);
    const term =
      duties.find((d) => d.verb === 'converse') ?? duties.find((d) => VERB_SPEC[d.verb].selfTerm);
    if (term) {
      stage.autoEnd = VERB_SPEC[term.verb].selfTerm;
    } else {
      diag.add(
        codes.VISIT_STAGE_NEVER_ENDS,
        'error',
        `Stage "${stage.id}" in visit ${visitId} never ends: no end trigger and nothing self-terminating (say/converse).`,
        span(stage.lineNo),
        [visitId, stage.id],
      );
    }
  }

  for (const goal of visit.goals) {
    if (goal.stages.length === 0) {
      diag.add(
        codes.VISIT_GOAL_EMPTY,
        'error',
        `Goal "${goal.name}" in visit ${visitId} has no stages (a goal owns one scene).`,
        span(goal.lineNo),
        [visitId, goal.name],
      );
    }
  }

  return visit;
}

// A need is presence (a cast name), a fact id, or "denied <goal>"; "not"
// negates; comma list (SB-114 dropped the `? ` sigil form).
function parseNeeds(
  rest: string,
  goal: VisitGoal,
  n: number,
  visitId: string,
  diag: DiagnosticBag,
): void {
  for (const item of rest
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)) {
    const toks = item.split(/\s+/);
    const neg = toks[0] === 'not';
    if (neg) toks.shift();
    if (toks[0] === 'denied') {
      if (!toks[1]) {
        diag.add(
          codes.LINE_UNPARSED,
          'error',
          `A denied need takes a goal name ("denied nansen") in visit ${visitId}.`,
          span(n),
          [visitId, goal.name],
        );
        continue;
      }
      goal.needs.push({ neg, kind: 'denied', id: toks[1] });
      continue;
    }
    if (!toks[0]) continue;
    const kind = CAST_SET.has(toks[0]) ? 'presence' : 'fact';
    goal.needs.push({ neg, kind, id: toks[0] });
  }
}

// A yield is a fact id or "open <question>"; comma list (the `+ ` sigil form
// is dropped, SB-114). `open q_x` is what dissolved `Unlocks:`.
function parseYields(rest: string, goal: VisitGoal): void {
  for (const item of rest
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)) {
    const toks = item.split(/\s+/);
    if (toks[0] === 'open' && toks[1]) {
      goal.yields.push({ kind: 'open', id: toks[1] });
      continue;
    }
    if (toks[0] === 'fact' && toks[1]) {
      goal.yields.push({ kind: 'fact', id: toks[1] });
      continue;
    }
    goal.yields.push({ kind: 'fact', id: toks[0] });
  }
}

function parseEnd(
  rest: string,
  n: number,
  visitId: string,
  diag: DiagnosticBag,
): StageEndTrigger | null {
  const [kind, ...args] = rest.split(/\s+/);
  if (kind === 'arrived' || kind === 'roles-arrived') return { kind: 'arrived' };
  if (kind === 'duration') {
    if (!args[0] || Number.isNaN(Number(args[0]))) {
      diag.add(
        codes.VISIT_TRIGGER_ARG_INVALID,
        'error',
        `duration takes a number of minutes in visit ${visitId}, got: "${args[0] ?? ''}"`,
        span(n),
        [visitId],
      );
      return null;
    }
    return { kind: 'duration', minutes: Number(args[0]) };
  }
  if (kind === 'event') {
    if (!args[0]) {
      diag.add(
        codes.VISIT_TRIGGER_ARG_INVALID,
        'error',
        `event takes a name in visit ${visitId}.`,
        span(n),
        [visitId],
      );
      return null;
    }
    return { kind: 'event', name: args[0] };
  }
  diag.add(
    codes.VISIT_UNKNOWN_TRIGGER,
    'error',
    `Unknown end trigger "${kind}" in visit ${visitId} (arrived | duration N | event name).`,
    span(n),
    [visitId],
  );
  return null;
}

function parseFail(
  rest: string,
  n: number,
  visitId: string,
  diag: DiagnosticBag,
): StageFailTrigger | null {
  const [kind, ...args] = rest.split(/\s+/);
  if (kind === 'timeout') {
    if (!args[0] || Number.isNaN(Number(args[0]))) {
      diag.add(
        codes.VISIT_TRIGGER_ARG_INVALID,
        'error',
        `timeout takes a number of minutes in visit ${visitId}, got: "${args[0] ?? ''}"`,
        span(n),
        [visitId],
      );
      return null;
    }
    return { kind: 'timeout', minutes: Number(args[0]) };
  }
  const graceMatch = args.join(' ').match(/grace=(\d+)/);
  const grace = graceMatch ? Number(graceMatch[1]) : undefined;
  if (kind === 'unreachable') {
    return { kind: 'unreachable', ...(grace !== undefined ? { graceMinutes: grace } : {}) };
  }
  if (kind === 'role-lost') {
    const role = args.find((a) => CAST_SET.has(a));
    if (!role) {
      diag.add(
        codes.VISIT_TRIGGER_ARG_INVALID,
        'error',
        `role-lost takes a cast member (${castList()}) in visit ${visitId}.`,
        span(n),
        [visitId],
      );
      return null;
    }
    return { kind: 'role-lost', role, ...(grace !== undefined ? { graceMinutes: grace } : {}) };
  }
  diag.add(
    codes.VISIT_UNKNOWN_TRIGGER,
    'error',
    `Unknown fail trigger "${kind}" in visit ${visitId} (timeout N | unreachable | role-lost <char>).`,
    span(n),
    [visitId],
  );
  return null;
}

function parseDuty(
  rest: string,
  stage: VisitStage,
  n: number,
  visitId: string,
  diag: DiagnosticBag,
): void {
  const m = rest.match(/^(\w+):\s*(.*)$/);
  if (!m) {
    diag.add(
      codes.LINE_UNPARSED,
      'error',
      `A duty line takes "- character: duty ..." in visit ${visitId}, got: "${rest}"`,
      span(n),
      [visitId, stage.id],
    );
    return;
  }
  const character = m[1].toLowerCase();
  if (!CAST_SET.has(character)) {
    diag.add(
      codes.VISIT_UNKNOWN_CHARACTER,
      'error',
      `Unknown character "${character}" in visit ${visitId} (${castList()}).`,
      span(n),
      [visitId, character],
    );
    return;
  }
  if (stage.duties[character]) {
    diag.add(
      codes.VISIT_DUTY_CONFLICT,
      'error',
      `${character} already has a duty in stage "${stage.id}" of visit ${visitId} (one duty per character per stage).`,
      span(n),
      [visitId, stage.id, character],
    );
    return;
  }
  const body = m[2].trim();
  const verb = (body.split(/\s+/)[0] ?? '') as DutyWord;
  if (!DUTY_WORDS.includes(verb)) {
    diag.add(
      codes.VISIT_UNKNOWN_DUTY,
      'error',
      `Unknown duty "${verb || '(none)'}" in visit ${visitId} (${DUTY_WORDS.join('|')}).`,
      span(n),
      [visitId, stage.id],
    );
    return;
  }

  let text = body.slice(verb.length).trim();
  const params: Record<string, string> = {};
  let pm: RegExpMatchArray | null;
  while ((pm = text.match(/(?:^|\s)(\w+)=(\S+)$/))) {
    params[pm[1]] = pm[2];
    text = text.slice(0, pm.index).trim();
  }

  const spec = VERB_SPEC[verb];
  const duty: StageDuty = { verb, params, lineNo: n };
  if (spec.arg) {
    const arg = text.split(/\s+/)[0] || undefined;
    if (arg) {
      text = text.slice(arg.length).trim();
      if (spec.arg === 'target') {
        // `@` is the optional character disambiguator on bare goto targets.
        const forced = arg.startsWith('@');
        const target = forced ? arg.slice(1) : arg;
        duty.target = target;
        duty.targetKind =
          forced || CAST_SET.has(target) ? 'character' : ROOM_SET.has(target) ? 'room' : 'unknown';
        if (duty.targetKind === 'unknown') {
          diag.add(
            codes.VISIT_TARGET_UNKNOWN,
            'warning',
            `goto target "${target}" in visit ${visitId} is neither a room nor a cast member — kept as authored.`,
            span(n),
            [visitId, target],
          );
        }
      } else if (spec.arg === 'activity') {
        duty.activity = arg;
      } else {
        duty.partner = arg;
      }
    }
  }
  if (spec.text && text) duty.line = stripGuillemets(text);
  const missing = spec.arg ? duty[spec.arg] === undefined : spec.text === true && !text;
  if (spec.required && missing) {
    diag.add(
      codes.VISIT_DUTY_ARG_MISSING,
      'error',
      `${verb} takes ${spec.required} in stage "${stage.id}" of visit ${visitId}.`,
      span(n),
      [visitId, stage.id],
    );
  }
  stage.duties[character] = duty;
}

// ---- Derived cost (SB-114: cost is never authored) -------------------------
// The rule, checked in order per stage: an authored `-> duration N` end wins;
// else a converse stage costs COST_CONVERSE_MINUTES; else a do stage costs
// COST_DO_MINUTES; else a say stage costs its largest numeric dwell= override
// when authored; else COST_BASE_MINUTES. Goal cost = the sum over its stages.
// Deterministic on purpose: the engine director (SB-113) reads this rule, so
// the constants and the order live here and nowhere else.
export const COST_CONVERSE_MINUTES = 3;
export const COST_DO_MINUTES = 2;
export const COST_BASE_MINUTES = 1;

export function stageCostMinutes(stage: VisitStage): number {
  const authored = stage.ends.find(
    (end): end is Extract<StageEndTrigger, { kind: 'duration' }> => end.kind === 'duration',
  );
  if (authored) return authored.minutes;
  const duties = Object.values(stage.duties);
  if (duties.some((d) => d.verb === 'converse')) return COST_CONVERSE_MINUTES;
  if (duties.some((d) => d.verb === 'do')) return COST_DO_MINUTES;
  const dwells = duties
    .filter((d) => d.verb === 'say')
    .map((d) => Number(d.params.dwell))
    .filter((minutes) => Number.isFinite(minutes));
  if (dwells.length > 0) return Math.max(...dwells);
  return COST_BASE_MINUTES;
}

export function goalCostMinutes(goal: VisitGoal): number {
  return goal.stages.reduce((sum, stage) => sum + stageCostMinutes(stage), 0);
}

export type DutyResolutionMode = 'explicit' | 'carried' | 'partner' | 'released' | 'free';

export interface ResolvedStage {
  stage: VisitStage;
  /** 'spine' | 'goal:<name>' | 'calloff' — the sticky slate resets per section. */
  section: string;
  resolved: Record<string, { duty: StageDuty | null; mode: DutyResolutionMode }>;
}

/**
 * Sticky-duty semantics (SB-107): explicit duties carry into later stages of
 * the same section, converse pulls the partner in, free releases, and each
 * section (spine, every goal, the call-off) starts with a clean slate. This
 * documents the engine contract (SB-113); the emitted slice carries only the
 * explicit duties.
 */
export function resolveStageDuties(visit: StageGrammarVisit): ResolvedStage[] {
  const flat: { stage: VisitStage; section: string }[] = [
    ...visit.spineStages.map((stage) => ({ stage, section: 'spine' })),
    ...visit.goals.flatMap((goal) =>
      goal.stages.map((stage) => ({ stage, section: `goal:${goal.name}` })),
    ),
    ...visit.calloffStages.map((stage) => ({ stage, section: 'calloff' })),
  ];
  const out: ResolvedStage[] = [];
  let carried: Record<string, StageDuty> = {};
  let lastSection: string | null = null;
  for (const { stage, section } of flat) {
    if (section !== lastSection) {
      lastSection = section;
      carried = {};
    }
    const resolved: ResolvedStage['resolved'] = {};
    for (const character of CAST_SET) {
      const duty = stage.duties[character];
      const initiator = Object.entries(stage.duties).find(
        ([who, d]) => who !== character && d.verb === 'converse' && d.partner === character,
      );
      if (duty && duty.verb === 'free') {
        delete carried[character];
        resolved[character] = { duty: null, mode: 'released' };
      } else if (duty) {
        carried[character] = duty;
        resolved[character] = { duty, mode: 'explicit' };
      } else if (initiator) {
        const partnerDuty: StageDuty = {
          verb: 'converse',
          partner: initiator[0],
          params: {},
          lineNo: initiator[1].lineNo,
        };
        carried[character] = partnerDuty;
        resolved[character] = { duty: partnerDuty, mode: 'partner' };
      } else if (carried[character]) {
        resolved[character] = { duty: carried[character], mode: 'carried' };
      } else {
        resolved[character] = { duty: null, mode: 'free' };
      }
    }
    out.push({ stage, section, resolved });
  }
  return out;
}
