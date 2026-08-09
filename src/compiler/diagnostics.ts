// Diagnostics contract for the Kildeverket 0.2 compiler (PLAN-003 TASK-014).
// One typed shape shared by warnings, stubs, TODOs and fix-its — this is the
// editor's consumption surface. Codes are stable strings; never rename one
// without a migration note.

/**
 * 'advisory' is the §9 graph-lint severity (TASK-017): softer than a warning,
 * purely editorial, never blocks compilation.
 */
export type Severity = 'error' | 'warning' | 'info' | 'advisory';

export interface Span {
  /** 1-based first line of the subject. */
  startLine: number;
  /** 1-based last line (inclusive); equals startLine for single-line subjects. */
  endLine: number;
}

export interface Diagnostic {
  code: string;
  severity: Severity;
  message: string;
  span: Span;
  subjectIds: string[];
}

export const codes = {
  // Structure
  CASE_MISSING_HEADER: 'case-missing-header',
  BLOCK_UNKNOWN: 'block-unknown',
  BLOCK_NOT_YET_SUPPORTED: 'block-not-yet-supported',
  DUPLICATE_ID: 'duplicate-id',
  LINE_UNPARSED: 'line-unparsed',
  FIELD_UNKNOWN: 'field-unknown',
  FIELD_MISSING: 'field-missing',
  // Authoring aids (§9)
  TODO_LINE: 'todo-line',
  STUB_UNRESOLVED_ID: 'stub-unresolved-id',
  // §6 condition grammar
  COND_PARSE_ERROR: 'cond-parse-error',
  COND_UNSUPPORTED_TILTAK_TAKEN: 'cond-unsupported-tiltak-taken',
  COND_UNSUPPORTED_QUESTION_OPEN: 'cond-unsupported-question-open',
  COND_UNSUPPORTED_DISPATCH_DONE: 'cond-unsupported-dispatch-done',
  COND_UNSUPPORTED_CLOCK_COMPARE: 'cond-unsupported-clock-compare',
  COND_UNSUPPORTED_DAY_COMPARE: 'cond-unsupported-day-compare',
  COND_UNSUPPORTED_N_OF: 'cond-unsupported-n-of',
  COND_UNSUPPORTED_ASKED_COUNT: 'cond-unsupported-asked-count',
  // §7 effect lines
  EFFECT_PARSE_ERROR: 'effect-parse-error',
  EFFECT_UNSUPPORTED_PAY: 'effect-unsupported-pay',
  EFFECT_UNSUPPORTED_CLOCK: 'effect-unsupported-clock',
  EFFECT_UNSUPPORTED_LOG: 'effect-unsupported-log',
  // §8 conversation weave (ruling 2 warn list — DD-002: this list doubles as
  // the engine backlog; each construct parses, warns, and emits nothing)
  WEAVE_UNKNOWN_KIND: 'weave-unknown-kind',
  WEAVE_NESTING_TOO_DEEP: 'weave-nesting-too-deep',
  WEAVE_GATHER_UNSUPPORTED: 'weave-gather-unsupported',
  WEAVE_DIVERT_UNSUPPORTED: 'weave-divert-unsupported',
  WEAVE_END_UNSUPPORTED: 'weave-end-unsupported',
  WEAVE_FALLBACK_UNSUPPORTED: 'weave-fallback-unsupported',
  WEAVE_SEQUENCE_UNSUPPORTED: 'weave-sequence-unsupported',
  WEAVE_LABEL_UNSUPPORTED: 'weave-label-unsupported',
  WEAVE_LINE_GUARD_UNSUPPORTED: 'weave-line-guard-unsupported',
  WEAVE_EXCHANGE_GUARD: 'weave-exchange-guard',
  WEAVE_FOLLOWUP_GUARD: 'weave-followup-guard',
  WEAVE_CALL_FOLLOWUP: 'weave-call-followup',
  WEAVE_CHOICE_NOT_CARD_KEYED: 'weave-choice-not-card-keyed',
  WEAVE_CHAT_GUARD_UNSUPPORTED: 'weave-chat-guard-unsupported',
  WEAVE_EFFECT_UNSUPPORTED: 'weave-effect-unsupported',
  // Declarative blocks (ruling 1b — recipes; proposals per SB-028 rulings A–D)
  /**
   * RETIRED by SB-029: SB-028 ratified the proposal syntax, so nothing fires
   * this code anymore. Kept per the stable-codes law (never rename or reuse).
   */
  PROPOSAL_NOT_RATIFIED: 'proposal-not-ratified',
  PROPOSAL_MISSING_LINE: 'proposal-missing-line',
  PROPOSAL_MISSING_RELEVANT: 'proposal-missing-relevant',
  PROPOSAL_CATEGORIES_WITHOUT_RELEVANT: 'proposal-categories-without-relevant',
  /**
   * RETIRED by SB-054: the SB-050 cull rejects recipe gate: via
   * FIXIT_FIELD_CULLED instead. Kept per the stable-codes law.
   */
  RECIPE_GATE_UNSUPPORTED: 'recipe-gate-unsupported',
  RECIPE_EFFECT_UNSUPPORTED: 'recipe-effect-unsupported',
  RECIPE_QUESTION_CONFLICT: 'recipe-question-conflict',
  // Leads / Opens metadata
  LEADS_LEGACY_FORM: 'leads-legacy-form',
  OPENS_META_UNKNOWN_KEY: 'opens-meta-unknown-key',
  // §10 migration fix-its
  FIXIT_EFFECTS_LINE: 'fixit-effects-line',
  FIXIT_REVEALS_QUESTIONS: 'fixit-reveals-questions',
  FIXIT_PAYS_FACT: 'fixit-pays-fact',
  // SB-050 field cull (SB-054): a dead field parses, warns, and emits nothing.
  FIXIT_FIELD_CULLED: 'fixit-field-culled',
  // SB-085 engine-mismatch lints (SB-058 fact-finding): places where the
  // compiled slice and case_engine.gd disagree. The engine is the spec
  // (SB-058 ruling 2) — these tell the author what the engine actually does.
  COND_GATE_DROPPED: 'cond-gate-dropped',
  COND_HYPOTHESIS_GATE_DEAD: 'cond-hypothesis-gate-dead',
  EFFECT_OPEN_CONVERSATION_NOOP: 'effect-open-conversation-noop',
  HYPOTHESIS_AVAILABILITY_ADVISORY: 'hypothesis-availability-advisory',
  DELIVER_CLOCK_ID_DEAD: 'deliver-clock-id-dead',
  // §9 graph lints (TASK-017 — always advisory, computed on the compiled
  // case graph; exact reachability definitions live in
  // docs/markup-0.2-reference.md "Compiler extensions recorded by TASK-017")
  LINT_FACT_NO_SOURCE_ANCHOR: 'lint-fact-no-source-anchor',
  LINT_QUESTION_NO_TILTAK_PATH: 'lint-question-no-tiltak-path',
  LINT_HYPOTHESIS_OPENS_NOTHING: 'lint-hypothesis-opens-nothing',
  LINT_CONVERSATION_LOOSE_END: 'lint-conversation-loose-end',
  LINT_GATE_UNDELIVERABLE_FACT: 'lint-gate-undeliverable-fact',
  LINT_QUIET_DAY: 'lint-quiet-day',
  LINT_CLOCK_NEVER_VISIBLE: 'lint-clock-never-visible',
} as const;

export type DiagnosticCode = (typeof codes)[keyof typeof codes];

export class DiagnosticBag {
  readonly items: Diagnostic[] = [];

  add(
    code: string,
    severity: Severity,
    message: string,
    span: Span,
    subjectIds: string[] = [],
  ): void {
    this.items.push({ code, severity, message, span, subjectIds });
  }
}

export function span(startLine: number, endLine: number = startLine): Span {
  return { startLine, endLine };
}
