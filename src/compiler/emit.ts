// Emitter: raw blocks → { slice, labContent } under the ratified emit
// contract (SB-022 rulings, DD-002 emit boundary, sparse-field law).

import type { DiagnosticBag, Span } from './diagnostics.ts';
import { codes, span } from './diagnostics.ts';
import type { CondNode, PredicateSpec } from './condition.ts';
import {
  emitPredicate,
  factIdsInCondition,
  hypothesisIdsInCondition,
  parseCondition,
} from './condition.ts';
import type { EffectSpec } from './effects.ts';
import { deliverEffect, emitEffects, parseEffectLine } from './effects.ts';
import type { ParsedCase, RawBlock, RawField } from './parse.ts';
import type { CallOut, ChatEntryOut } from './weave.ts';
import { emitConversations } from './weave.ts';
import type { GateSite } from './lints.ts';
import { runLints } from './lints.ts';

export interface DocumentRun {
  id: string;
  text: string;
  fact_id: string;
}

export interface DocumentOut {
  id: string;
  kind: string;
  title: string;
  register: string;
  peek: string;
  meta: string;
  body_bbcode: string;
  runs: DocumentRun[];
}

export interface FactOut {
  id: string;
  label: string;
  summary: string;
  source_document_id: string;
  domain: string;
  category: string;
  quote: string;
  frank_response?: string;
  supports_questions: string[];
  reveals_event?: string;
  lift_effects: EffectSpec[];
}

export interface LeadOut {
  label: string;
  target: string;
}

export interface QuestionOut {
  id: string;
  prompt: string;
  teaser?: string;
  card_title?: string;
  frank_response?: string;
  reveal_when?: PredicateSpec;
  leads?: LeadOut[];
}

export interface OpeningSourceOut extends EffectSpec {
  type?: string;
  category?: string;
  actor?: string;
  risk_tags?: string[];
  sim_hook_id?: string;
}

export interface HypothesisOut {
  id: string;
  title: string;
  summary: string;
  question_id: string;
  availability?: PredicateSpec;
  opening_sources: OpeningSourceOut[];
}

export interface TiltakOut {
  id: string;
  title: string;
  sim_hook_id: string;
  slot: string;
  cost: number;
  description: string;
  weight?: string;
}

export interface DispatchOut {
  id: string;
  title: string;
  sim_hook_id: string;
  description: string;
  activity_title?: string;
  duration_h?: number;
  occupies_hours?: number;
  channel?: string;
  channel_delay_minutes?: number;
  reception_modifier?: number;
  gate?: PredicateSpec;
  effects: EffectSpec[];
}

export interface ClockOut {
  id: string;
  label: string;
  sim_hook_id: string;
  question: string;
  good_segment_label: string;
  good_segment_size: number;
  bad_segment_label: string;
  bad_segment_size: number;
  max_value?: number;
  visibility?: PredicateSpec;
}

export interface EventDeltaOut {
  event_type: string;
  log_text: string;
  clock_id: string;
  clock_direction: number;
  reveal_fact_id: string;
}

export interface RecipeOut {
  /** The question the craft opens — authored as the recipe's `~ open q_x` line. */
  question_id: string;
  /** Sorted for identity (ruling 1b: the header pair is unordered). */
  pair: [string, string];
  /** Derived from the target question's Teaser — never authored on the recipe. */
  reading: string;
  frank_lines: string[];
}

/** `# Proposal:` block (SB-028 rulings A–D) — one shipped frank_proposals entry. */
export interface ProposalOut {
  /** The header slug — the join key to the handbook. */
  handbok_id: string;
  /** `Line: «…»` — mandatory, exactly one per block (ruling D). */
  line: string;
  /** `Relevant: f_a, f_b[, f_c]` — omitted when unset (sparse-field law). */
  relevant_fact_ids?: string[];
  /** `Categories:` — optional, additive to Relevant:, never standalone (ruling B). */
  relevant_categories?: string[];
  /** File order, assigned by the compiler at emit (ruling C — no Order: field). */
  order: number;
}

export interface BeatOut {
  id: string;
  day: number;
  text: string;
  effects: EffectSpec[];
}

export interface CaseSlice {
  id: string;
  title: string;
  scenario_stage: number;
  vurdering_frist_day?: number;
  documents: DocumentOut[];
  facts: FactOut[];
  questions: QuestionOut[];
  hypotheses: HypothesisOut[];
  tiltak: TiltakOut[];
  dispatches: DispatchOut[];
  clocks: ClockOut[];
  event_delta_specs: EventDeltaOut[];
  day_script_beats: BeatOut[];
  /** §8 weave (chat:… conversations). Omitted when the case authors none. */
  frank_chat?: ChatEntryOut[];
  /** `# Proposal:` blocks (SB-028). Omitted when the case authors none. */
  frank_proposals?: ProposalOut[];
  /** §1 pack-level pair line (ruling 1b). Omitted when the header has none. */
  pair_soft_reject_line?: string;
  /** §1 pack-level pair line (ruling 1b). Omitted when the header has none. */
  pair_already_set_line?: string;
  /** `# Recipe:` blocks (ruling 1b). Omitted when the case authors none. */
  recipes?: RecipeOut[];
  /** §8 weave (call:… conversations). Omitted when the case authors none. */
  calls?: CallOut[];
}

export interface LabRun {
  text: string;
  factId?: string;
}

export interface LabContent {
  documents: Record<
    string,
    {
      id: string;
      kind: string;
      title: string;
      register: string;
      peek: string;
      meta: string;
      blocks: Array<{ id: string; runs: LabRun[] }>;
    }
  >;
  facts: Record<
    string,
    {
      id: string;
      domain: string;
      category: string;
      text: string;
      quote: string;
      supports: string[];
    }
  >;
  questions: Record<
    string,
    {
      id: string;
      title: string;
      appearsOn: string[];
      hypotheses: Array<{
        id: string;
        label: string;
        needs: string[];
        opens: string[];
        note: string;
      }>;
    }
  >;
  tiltak: Record<
    string,
    {
      id: string;
      slot: string;
      title: string;
      cost: number;
      description: string;
      sim: string;
    }
  >;
  dispatches: Record<string, { id: string; title: string; description: string }>;
}

class FieldMap {
  private readonly used = new Set<RawField>();
  private readonly fields: RawField[];
  constructor(fields: RawField[]) {
    this.fields = fields;
  }

  find(...keys: string[]): RawField | undefined {
    const lower = keys.map((key) => key.toLowerCase());
    const found = this.fields.find((field) => lower.includes(field.key.toLowerCase()));
    if (found) this.used.add(found);
    return found;
  }

  all(...keys: string[]): RawField[] {
    const lower = keys.map((key) => key.toLowerCase());
    const found = this.fields.filter((field) => lower.includes(field.key.toLowerCase()));
    for (const field of found) this.used.add(field);
    return found;
  }

  value(...keys: string[]): string | undefined {
    return this.find(...keys)?.value;
  }

  leftovers(): RawField[] {
    return this.fields.filter((field) => !this.used.has(field));
  }
}

interface Ref {
  id: string;
  kind:
    | 'document'
    | 'fact'
    | 'question'
    | 'hypothesis'
    | 'tiltak'
    | 'dispatch'
    | 'clock'
    | 'lead-target';
  where: Span;
  ownerId: string;
}

function blockSpan(block: RawBlock): Span {
  return span(block.startLine, block.endLine);
}

function collapseWhitespace(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

function normalizeRunText(value: string): string {
  if (!value) return '';
  const leading = /^\s/.test(value) ? ' ' : '';
  const trailing = /\s$/.test(value) ? ' ' : '';
  const core = collapseWhitespace(value);
  if (!core) return ' ';
  return `${leading}${core}${trailing}`;
}

// labContent variant: horizontal whitespace collapses, but single newlines
// survive (authored line breaks render as <br> in the doc templates).
function normalizeRunTextKeepBreaks(value: string): string {
  if (!value) return '';
  const core = value
    .replace(/[^\S\n]+/g, ' ')
    .replace(/ ?\n ?/g, '\n')
    .replace(/\n{2,}/g, '\n')
    .replace(/^\n+|\n+$/g, '')
    .trim();
  if (!core) return ' ';
  const leading = /^\s/.test(value) ? ' ' : '';
  const trailing = /\s$/.test(value) ? ' ' : '';
  return `${leading}${core}${trailing}`;
}

// Anchor text may contain one level of nested brackets — the inline
// [icon=coin] token (SB-319/320) must survive inside an anchored span.
const ANCHOR_RE = /\[((?:[^[\]]|\[[^[\]]*\])+)\]\(fact:([a-zA-Z0-9_:-]+)\)/g;

function parseDocumentRuns(
  markdown: string,
  normalize: (value: string) => string = normalizeRunText,
): DocumentRun[] {
  const runs: DocumentRun[] = [];
  let match: RegExpExecArray | null;
  let cursor = 0;
  let textRunIndex = 0;
  const re = new RegExp(ANCHOR_RE.source, 'g');
  while ((match = re.exec(markdown)) !== null) {
    const before = normalize(markdown.slice(cursor, match.index));
    if (before) runs.push({ id: `run_text_${textRunIndex++}`, text: before, fact_id: '' });
    runs.push({
      id: `run_${match[2].replace(/^f_/, '')}`,
      text: collapseWhitespace(match[1]),
      fact_id: match[2],
    });
    cursor = match.index + match[0].length;
  }
  const after = normalize(markdown.slice(cursor));
  if (after) runs.push({ id: `run_text_${textRunIndex++}`, text: after, fact_id: '' });
  return runs;
}

function evidenceMarkdownToBbcode(markdown: string): string {
  return markdown.replace(new RegExp(ANCHOR_RE.source, 'g'), '[url=fact:$2]$1[/url]').trim();
}

function stripGuillemets(value: string): string {
  if (value.startsWith('«') && value.endsWith('»')) return value.slice(1, -1);
  return value;
}

function listValue(value: string | undefined): string[] {
  if (!value || value === 'None') return [];
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function integerValue(
  field: RawField | undefined,
  fallback: number,
  diag: DiagnosticBag,
  ownerId: string,
): number {
  if (!field) return fallback;
  if (!/^[+-]?\d+$/.test(field.value)) {
    diag.add(
      codes.LINE_UNPARSED,
      'warning',
      `${ownerId}.${field.key} must be an integer, got: "${field.value}"`,
      span(field.line),
      [ownerId],
    );
    return fallback;
  }
  return Number(field.value);
}

/** Split a comma list at the top level, keeping `[...]` payloads intact. */
function splitTopLevel(value: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let current = '';
  for (const ch of value) {
    if (ch === '[') depth += 1;
    if (ch === ']') depth = Math.max(0, depth - 1);
    if (ch === ',' && depth === 0) {
      parts.push(current.trim());
      current = '';
      continue;
    }
    current += ch;
  }
  if (current.trim()) parts.push(current.trim());
  return parts.filter(Boolean);
}

interface ParsedCondition {
  ast: CondNode | null;
  predicate: PredicateSpec | null;
}

function bindCondition(
  field: RawField | undefined,
  diag: DiagnosticBag,
  ownerId: string,
): ParsedCondition {
  if (!field || !field.value.trim()) return { ast: null, predicate: null };
  const where = span(field.line);
  const { ast, error } = parseCondition(field.value);
  if (error !== null || ast === null) {
    if (error !== null) {
      diag.add(
        codes.COND_PARSE_ERROR,
        'error',
        `Cannot parse condition "${field.value}": ${error}`,
        where,
        [ownerId],
      );
    }
    return { ast: null, predicate: null };
  }
  return { ast, predicate: emitPredicate(ast, diag, ownerId, where) };
}

/**
 * SB-050 cull (SB-054): a dead field is rejected like the 0.1 legacy fields —
 * it parses, gets a fix-it diagnostic, and emits nothing. A field returns
 * only when a reader exists.
 */
function cullField(
  fieldMap: FieldMap,
  diag: DiagnosticBag,
  ownerId: string,
  key: string,
  why: string,
): void {
  for (const field of fieldMap.all(key)) {
    diag.add(
      codes.FIXIT_FIELD_CULLED,
      'warning',
      `"${key}:" is culled (SB-050) — ${why}; delete the line.`,
      span(field.line),
      [ownerId],
    );
  }
}

function warnLeftovers(fieldMap: FieldMap, diag: DiagnosticBag, ownerId: string): void {
  for (const field of fieldMap.leftovers()) {
    diag.add(
      codes.FIELD_UNKNOWN,
      'warning',
      `Unknown field "${field.key}:" on ${ownerId}`,
      span(field.line),
      [ownerId],
    );
  }
}

export function emitCase(
  parsed: ParsedCase,
  diag: DiagnosticBag,
): { slice: CaseSlice; labContent: LabContent } {
  const refs: Ref[] = [];
  const seenIds = new Map<string, RawBlock>();
  // §9 lint inputs (TASK-017): every §6 condition bound at a gate position.
  const gateSites: GateSite[] = [];

  const checkDuplicate = (block: RawBlock): void => {
    const key = `${block.type}:${block.id}`;
    const previous = seenIds.get(key);
    if (previous) {
      diag.add(
        codes.DUPLICATE_ID,
        'error',
        `Duplicate ${block.type} id "${block.id}" (first declared on line ${previous.startLine})`,
        blockSpan(block),
        [block.id],
      );
    } else {
      seenIds.set(key, block);
    }
  };

  const byType = (type: RawBlock['type']): RawBlock[] =>
    parsed.blocks.filter((block) => block.type === type);

  for (const block of parsed.blocks) checkDuplicate(block);

  // ---- Case header --------------------------------------------------------
  const caseFields = new FieldMap(parsed.caseBlock?.fields ?? []);
  const caseId = parsed.caseBlock?.id ?? '';
  const title = caseFields.value('Title') ?? '';
  const stageField = caseFields.find('Stage', 'Scenario stage');
  const scenarioStage = integerValue(stageField, 0, diag, caseId);
  const deadlineField = caseFields.find('Deadline');
  let deadlineDay: number | null = null;
  if (deadlineField) {
    const match = deadlineField.value.match(/^day\s+(\d+)$/);
    if (match) deadlineDay = Number(match[1]);
    else
      diag.add(
        codes.LINE_UNPARSED,
        'warning',
        `Deadline must be "day N", got: "${deadlineField.value}"`,
        span(deadlineField.line),
        [caseId],
      );
  }
  const pairSoftRejectField = caseFields.find('Pair soft reject');
  const pairAlreadySetField = caseFields.find('Pair already set');
  if (parsed.caseBlock) warnLeftovers(caseFields, diag, caseId || 'case');

  // ---- Documents ----------------------------------------------------------
  interface DocArrival {
    day: number;
    clockId: string | null;
    documentId: string;
    where: Span;
  }
  const arrivals: DocArrival[] = [];
  // Paragraphs (blank-line separated) survive only into labContent blocks —
  // the slice's flat run list is core-loop canon and stays whitespace-collapsed.
  const documentParagraphs = new Map<string, string[]>();
  const documents: DocumentOut[] = byType('document').map((block) => {
    const fields = new FieldMap(block.fields);
    const arrives = fields.find('arrives');
    if (arrives) {
      const match = arrives.value.match(/^day\s+(\d+)(?:\s+on\s+(\S+))?$/);
      if (match) {
        arrivals.push({
          day: Number(match[1]),
          clockId: match[2] ?? null,
          documentId: block.id,
          where: span(arrives.line),
        });
        if (match[2])
          refs.push({ id: match[2], kind: 'clock', where: span(arrives.line), ownerId: block.id });
      } else {
        diag.add(
          codes.LINE_UNPARSED,
          'warning',
          `arrives must be "day N on ck_x", got: "${arrives.value}"`,
          span(arrives.line),
          [block.id],
        );
      }
    }
    const body = block.proseLines
      .map((prose) => prose.text)
      .join('\n')
      .trim();
    documentParagraphs.set(
      block.id,
      body.split(/\n[ \t]*\n+/).filter((para) => para.trim()),
    );
    const runs = parseDocumentRuns(body);
    for (const run of runs) {
      if (run.fact_id)
        refs.push({ id: run.fact_id, kind: 'fact', where: blockSpan(block), ownerId: block.id });
    }
    const document: DocumentOut = {
      id: block.id,
      kind: fields.value('Kind') ?? '',
      title: fields.value('Title') ?? '',
      register: fields.value('Register') ?? '',
      peek: fields.value('Peek') ?? '',
      meta: fields.value('Meta') ?? '',
      body_bbcode: evidenceMarkdownToBbcode(body),
      runs,
    };
    warnLeftovers(fields, diag, block.id);
    return document;
  });
  const allRuns = documents.flatMap((document) => document.runs);
  const quoteForFact = (factId: string): string =>
    allRuns.find((run) => run.fact_id === factId)?.text ?? '';

  // ---- Facts --------------------------------------------------------------
  const facts: FactOut[] = byType('fact').map((block) => {
    const fields = new FieldMap(block.fields);
    const sourceField = fields.find('Source');
    const sourceDocumentId = block.documentId ?? sourceField?.value ?? '';
    if (!sourceDocumentId) {
      diag.add(
        codes.FIELD_MISSING,
        'warning',
        `Fact ${block.id} has no source document (declare it under a # Document: or add Source:)`,
        blockSpan(block),
        [block.id],
      );
    } else {
      refs.push({
        id: sourceDocumentId,
        kind: 'document',
        where: blockSpan(block),
        ownerId: block.id,
      });
    }
    const supports = listValue(fields.value('Supports'));
    for (const questionId of supports)
      refs.push({ id: questionId, kind: 'question', where: blockSpan(block), ownerId: block.id });

    const effectLines = block.effects.map((effect) => ({
      ast: parseEffectLine(effect.body),
      span: span(effect.line),
    }));
    const legacyReveals = fields.find('Reveals questions');
    if (legacyReveals) {
      diag.add(
        codes.FIXIT_REVEALS_QUESTIONS,
        'info',
        `"Reveals questions:" is 0.1 syntax — replace with "~ open ${listValue(legacyReveals.value).join(' / ~ open ')}"`,
        span(legacyReveals.line),
        [block.id],
      );
      for (const questionId of listValue(legacyReveals.value)) {
        effectLines.push({ ast: { kind: 'open', questionId }, span: span(legacyReveals.line) });
      }
    }
    const liftEffects = emitEffects(effectLines, diag, block.id);
    for (const effect of liftEffects) {
      if (effect.op === 'reveal_questions') {
        for (const questionId of effect.args.question_ids as string[])
          refs.push({
            id: questionId,
            kind: 'question',
            where: blockSpan(block),
            ownerId: block.id,
          });
      }
    }

    cullField(fields, diag, block.id, 'Card', 'no reader — the card face uses Summary');
    cullField(fields, diag, block.id, 'About', 'no reader');
    cullField(fields, diag, block.id, 'Discuss', 'no sim logic gates fact cards per person');
    const frank = fields.find('Frank');
    const reveals = fields.value('Reveals');
    // SB-024 extension: a fact paid outside any document (chat ~ pay) has no
    // run to derive its quote from — an explicit Quote: fills it. An anchored
    // run always wins.
    const quoteField = fields.find('Quote');
    const anchorQuote = quoteForFact(block.id);
    const fact: FactOut = {
      id: block.id,
      label: fields.value('Label') ?? '',
      summary: fields.value('Summary') ?? '',
      source_document_id: sourceDocumentId,
      domain: fields.value('Domain') ?? '',
      category: fields.value('Category') ?? '',
      quote: anchorQuote || (quoteField ? stripGuillemets(quoteField.value) : ''),
      ...(frank ? { frank_response: stripGuillemets(frank.value) } : {}),
      supports_questions: supports,
      ...(reveals !== undefined ? { reveals_event: reveals } : {}),
      lift_effects: liftEffects,
    };
    warnLeftovers(fields, diag, block.id);
    return fact;
  });

  // ---- Questions ----------------------------------------------------------
  interface QuestionExtra {
    appearsOn: string[];
    titleForLab: string;
  }
  const questionExtras = new Map<string, QuestionExtra>();
  const questions: QuestionOut[] = byType('question').map((block) => {
    const fields = new FieldMap(block.fields);
    const titleValue = fields.value('Title') ?? '';
    const prompt = fields.value('Prompt') ?? titleValue;
    const teaser = fields.find('Teaser');
    const cardTitle = fields.value('Card title');
    cullField(fields, diag, block.id, 'Card sub', 'no reader — card faces left it (SB-587)');
    const whenField = fields.find('when', 'Opens when');
    const condition = bindCondition(whenField, diag, block.id);
    gateSites.push({
      ownerId: block.id,
      ast: condition.ast,
      where: span(whenField?.line ?? block.startLine),
    });
    for (const factId of factIdsInCondition(condition.ast))
      refs.push({
        id: factId,
        kind: 'fact',
        where: span(whenField?.line ?? block.startLine),
        ownerId: block.id,
      });

    const leads: LeadOut[] = [];
    for (const lead of fields.all('Lead')) {
      const match = lead.value.match(/^«(.*)»\s*->\s*(\S+)$/);
      if (!match) {
        diag.add(
          codes.LINE_UNPARSED,
          'warning',
          `Lead must be "«label» -> target", got: "${lead.value}"`,
          span(lead.line),
          [block.id],
        );
        continue;
      }
      leads.push({ label: match[1], target: match[2] });
      refs.push({ id: match[2], kind: 'lead-target', where: span(lead.line), ownerId: block.id });
    }
    const legacyLeads = fields.find('Leads');
    if (legacyLeads) {
      diag.add(
        codes.LEADS_LEGACY_FORM,
        'warning',
        `Bare "Leads:" does not survive migration (ruling 3) — use "Lead: «label» -> target"; nothing is emitted.`,
        span(legacyLeads.line),
        [block.id],
      );
    }

    cullField(fields, diag, block.id, 'Appears on', 'the when: condition already names the facts');
    questionExtras.set(block.id, {
      appearsOn: factIdsInCondition(condition.ast),
      titleForLab: titleValue,
    });

    // SB-057: card_frank_response falls through to the question when a
    // question card is played — same reader as the fact field.
    const frank = fields.find('Frank');
    const question: QuestionOut = {
      id: block.id,
      prompt,
      ...(teaser ? { teaser: teaser.value } : {}),
      ...(cardTitle !== undefined ? { card_title: cardTitle } : {}),
      ...(frank ? { frank_response: stripGuillemets(frank.value) } : {}),
      ...(condition.predicate ? { reveal_when: condition.predicate } : {}),
      ...(leads.length > 0 ? { leads } : {}),
    };
    warnLeftovers(fields, diag, block.id);
    return question;
  });

  // ---- Hypotheses ---------------------------------------------------------
  const META_KEY_MAP: Record<string, 'type' | 'category' | 'actor' | 'risk_tags' | 'sim_hook_id'> =
    {
      type: 'type',
      category: 'category',
      actor: 'actor',
      risk: 'risk_tags',
      risk_tags: 'risk_tags',
      sim: 'sim_hook_id',
      sim_hook_id: 'sim_hook_id',
    };
  interface HypothesisExtra {
    needsFactIds: string[];
    opensTiltak: string[];
  }
  const hypothesisExtras = new Map<string, HypothesisExtra>();
  const hypotheses: HypothesisOut[] = byType('hypothesis').map((block) => {
    const fields = new FieldMap(block.fields);
    const questionId = fields.value('Question') ?? '';
    if (questionId)
      refs.push({ id: questionId, kind: 'question', where: blockSpan(block), ownerId: block.id });
    const needsField = fields.find('needs', 'Needs');
    const condition = bindCondition(needsField, diag, block.id);
    gateSites.push({
      ownerId: block.id,
      ast: condition.ast,
      where: span(needsField?.line ?? block.startLine),
    });
    for (const factId of factIdsInCondition(condition.ast))
      refs.push({
        id: factId,
        kind: 'fact',
        where: span(needsField?.line ?? block.startLine),
        ownerId: block.id,
      });
    for (const hypothesisId of hypothesisIdsInCondition(condition.ast))
      refs.push({
        id: hypothesisId,
        kind: 'hypothesis',
        where: span(needsField?.line ?? block.startLine),
        ownerId: block.id,
      });

    const opensTiltak: string[] = [];
    const opensDispatches: string[] = [];
    const conversations: OpeningSourceOut[] = [];
    const opensField = fields.find('Opens');
    if (opensField) {
      for (const entry of splitTopLevel(opensField.value)) {
        const match = entry.match(/^(\S+)(?:\s+\[(.*)\])?$/);
        if (!match) {
          diag.add(
            codes.LINE_UNPARSED,
            'warning',
            `Cannot parse Opens entry: "${entry}"`,
            span(opensField.line),
            [block.id],
          );
          continue;
        }
        const [, targetId, payload] = match;
        if (targetId.startsWith('t_')) {
          opensTiltak.push(targetId);
          refs.push({
            id: targetId,
            kind: 'tiltak',
            where: span(opensField.line),
            ownerId: block.id,
          });
        } else if (targetId.startsWith('d_')) {
          opensDispatches.push(targetId);
          refs.push({
            id: targetId,
            kind: 'dispatch',
            where: span(opensField.line),
            ownerId: block.id,
          });
        } else if (targetId.startsWith('c_')) {
          const source: OpeningSourceOut = {
            op: 'open_conversation',
            args: { conversation_id: targetId },
          };
          if (payload) {
            for (const pair of payload.trim().split(/\s+/)) {
              const eq = pair.indexOf('=');
              if (eq <= 0) continue;
              const rawKey = pair.slice(0, eq);
              const rawValue = pair.slice(eq + 1);
              const mapped = META_KEY_MAP[rawKey];
              if (!mapped) {
                diag.add(
                  codes.OPENS_META_UNKNOWN_KEY,
                  'warning',
                  `Unknown Opens metadata key "${rawKey}" on ${targetId}`,
                  span(opensField.line),
                  [block.id, targetId],
                );
                continue;
              }
              if (mapped === 'risk_tags') source.risk_tags = rawValue.split(',').filter(Boolean);
              else source[mapped] = rawValue;
            }
          }
          conversations.push(source);
        } else {
          diag.add(
            codes.LINE_UNPARSED,
            'warning',
            `Opens target "${targetId}" is not a tiltak (t_), dispatch (d_) or conversation (c_) id`,
            span(opensField.line),
            [block.id],
          );
        }
      }
    }
    for (const legacyTiltak of listValue(fields.value('Opens tiltak'))) {
      opensTiltak.push(legacyTiltak);
      refs.push({ id: legacyTiltak, kind: 'tiltak', where: blockSpan(block), ownerId: block.id });
    }
    for (const legacyDispatch of listValue(fields.value('Opens dispatches'))) {
      opensDispatches.push(legacyDispatch);
      refs.push({
        id: legacyDispatch,
        kind: 'dispatch',
        where: blockSpan(block),
        ownerId: block.id,
      });
    }

    const openingSources: OpeningSourceOut[] = [];
    if (opensTiltak.length > 0)
      openingSources.push({ op: 'open_tiltak', args: { tiltak_ids: opensTiltak } });
    if (opensDispatches.length > 0)
      openingSources.push({ op: 'open_dispatches', args: { dispatch_ids: opensDispatches } });
    openingSources.push(...conversations);

    hypothesisExtras.set(block.id, {
      needsFactIds: factIdsInCondition(condition.ast),
      opensTiltak,
    });

    const hypothesis: HypothesisOut = {
      id: block.id,
      title: fields.value('Title') ?? '',
      summary: fields.value('Summary') ?? '',
      question_id: questionId,
      ...(condition.predicate ? { availability: condition.predicate } : {}),
      opening_sources: openingSources,
    };
    warnLeftovers(fields, diag, block.id);
    return hypothesis;
  });

  // ---- Tiltak -------------------------------------------------------------
  // SB-050 ruling 5: the hypothesis side owns the tiltak-availability edge
  // (Opens:). The authored fact-gate on tiltak is dead — the real sim has no
  // such mechanic.
  const tiltak: TiltakOut[] = byType('tiltak').map((block) => {
    const fields = new FieldMap(block.fields);
    const weight = fields.value('Weight');
    cullField(fields, diag, block.id, 'Needs', 'hypothesis Opens: owns the tiltak edge');
    cullField(fields, diag, block.id, 'Needs hypothesis', 'hypothesis Opens: owns the tiltak edge');
    const out: TiltakOut = {
      id: block.id,
      title: fields.value('Title') ?? '',
      sim_hook_id: fields.value('Sim hook') ?? '',
      slot: fields.value('Slot') ?? '',
      cost: integerValue(fields.find('Cost'), 0, diag, block.id),
      description: fields.value('Description') ?? '',
      ...(weight !== undefined ? { weight } : {}),
    };
    warnLeftovers(fields, diag, block.id);
    return out;
  });

  // ---- Dispatches ---------------------------------------------------------
  const dispatches: DispatchOut[] = byType('dispatch').map((block) => {
    const fields = new FieldMap(block.fields);
    const gateField = fields.find('gate', 'Gate');
    const gate = bindCondition(gateField, diag, block.id);
    gateSites.push({
      ownerId: block.id,
      ast: gate.ast,
      where: span(gateField?.line ?? block.startLine),
    });
    for (const factId of factIdsInCondition(gate.ast))
      refs.push({
        id: factId,
        kind: 'fact',
        where: span(gateField?.line ?? block.startLine),
        ownerId: block.id,
      });
    for (const hypothesisId of hypothesisIdsInCondition(gate.ast))
      refs.push({
        id: hypothesisId,
        kind: 'hypothesis',
        where: span(gateField?.line ?? block.startLine),
        ownerId: block.id,
      });

    const effectLines = block.effects.map((effect) => ({
      ast: parseEffectLine(effect.body),
      span: span(effect.line),
    }));
    const legacyEffects = fields.find('Effects');
    if (legacyEffects) {
      const where = span(legacyEffects.line);
      const pendingDoc = legacyEffects.value.match(
        /^pending_doc\s+(\S+)\s+after\s+(\d+)\s+day\s+on\s+(\S+)$/,
      );
      const scenarioStage = legacyEffects.value.match(/^scenario_stage\s+(\d+)$/);
      if (pendingDoc) {
        diag.add(
          codes.FIXIT_EFFECTS_LINE,
          'info',
          `"Effects:" is 0.1 syntax — replace with "~ deliver ${pendingDoc[1]} in ${pendingDoc[2]}d on ${pendingDoc[3]}"`,
          where,
          [block.id],
        );
        effectLines.push({
          ast: {
            kind: 'deliver',
            documentId: pendingDoc[1],
            delayDays: Number(pendingDoc[2]),
            clockId: pendingDoc[3],
          },
          span: where,
        });
      } else if (scenarioStage) {
        diag.add(
          codes.FIXIT_EFFECTS_LINE,
          'info',
          `"Effects:" is 0.1 syntax — replace with "~ stage ${scenarioStage[1]}"`,
          where,
          [block.id],
        );
        effectLines.push({ ast: { kind: 'stage', stage: Number(scenarioStage[1]) }, span: where });
      } else {
        diag.add(
          codes.EFFECT_PARSE_ERROR,
          'warning',
          `Unsupported Effects line: "${legacyEffects.value}"`,
          where,
          [block.id],
        );
      }
    }
    const effects = emitEffects(effectLines, diag, block.id);
    for (const effect of effects) {
      if (effect.op === 'queue_pending_document') {
        const documentId = effect.args.document_id as string;
        if (documentId.startsWith('doc_'))
          refs.push({
            id: documentId,
            kind: 'document',
            where: blockSpan(block),
            ownerId: block.id,
          });
        if (effect.args.clock_id)
          refs.push({
            id: effect.args.clock_id as string,
            kind: 'clock',
            where: blockSpan(block),
            ownerId: block.id,
          });
      }
    }

    const activity = fields.find('Activity');
    const channel = fields.value('Channel');
    const delayField = fields.find('Delay');
    const durationField = fields.find('Duration');
    const occupiesField = fields.find('Occupies');
    const receptionField = fields.find('Reception');
    const unitNumber = (field: RawField | undefined, unit: string): number | undefined => {
      if (!field) return undefined;
      const match = field.value.match(new RegExp(`^(\\d+)${unit}$`));
      if (!match) {
        diag.add(
          codes.LINE_UNPARSED,
          'warning',
          `${block.id}.${field.key} must be "N${unit}", got: "${field.value}"`,
          span(field.line),
          [block.id],
        );
        return undefined;
      }
      return Number(match[1]);
    };
    const duration = unitNumber(durationField, 'h');
    const occupies = unitNumber(occupiesField, 'h');
    const delay = unitNumber(delayField, 'm');
    const reception =
      receptionField && /^[+-]?\d+$/.test(receptionField.value)
        ? Number(receptionField.value)
        : undefined;
    if (receptionField && reception === undefined) {
      diag.add(
        codes.LINE_UNPARSED,
        'warning',
        `${block.id}.Reception must be "+N" or "-N", got: "${receptionField.value}"`,
        span(receptionField.line),
        [block.id],
      );
    }

    const out: DispatchOut = {
      id: block.id,
      title: fields.value('Title') ?? '',
      sim_hook_id: fields.value('Sim hook') ?? '',
      description: fields.value('Description') ?? '',
      ...(activity ? { activity_title: stripGuillemets(activity.value) } : {}),
      ...(duration !== undefined ? { duration_h: duration } : {}),
      ...(occupies !== undefined ? { occupies_hours: occupies } : {}),
      ...(channel !== undefined ? { channel } : {}),
      ...(delay !== undefined ? { channel_delay_minutes: delay } : {}),
      ...(reception !== undefined ? { reception_modifier: reception } : {}),
      ...(gate.predicate ? { gate: gate.predicate } : {}),
      effects,
    };
    warnLeftovers(fields, diag, block.id);
    return out;
  });

  // ---- Clocks -------------------------------------------------------------
  const clocks: ClockOut[] = byType('clock').map((block) => {
    const fields = new FieldMap(block.fields);
    const parseSegment = (value: string | undefined): { label: string; size: number } | null => {
      if (value === undefined) return null;
      const match = value.match(/^(.*?)\s*\/\s*(\d+)$/);
      if (!match) return { label: value.trim(), size: 4 };
      return { label: match[1].trim(), size: Number(match[2]) };
    };
    const good = parseSegment(fields.value('Good'));
    const bad = parseSegment(fields.value('Bad'));
    const legacyGoodLabel = fields.value('Good segment');
    const legacyGoodSize = fields.find('Good size');
    const legacyBadLabel = fields.value('Bad segment');
    const legacyBadSize = fields.find('Bad size');
    const maxField = fields.find('Max');
    const visibleField = fields.find('visible when', 'Visible when');
    const visibility = bindCondition(visibleField, diag, block.id);
    gateSites.push({
      ownerId: block.id,
      ast: visibility.ast,
      where: span(visibleField?.line ?? block.startLine),
    });
    for (const factId of factIdsInCondition(visibility.ast))
      refs.push({
        id: factId,
        kind: 'fact',
        where: span(visibleField?.line ?? block.startLine),
        ownerId: block.id,
      });
    for (const hypothesisId of hypothesisIdsInCondition(visibility.ast))
      refs.push({
        id: hypothesisId,
        kind: 'hypothesis',
        where: span(visibleField?.line ?? block.startLine),
        ownerId: block.id,
      });

    const out: ClockOut = {
      id: block.id,
      label: fields.value('Label') ?? '',
      sim_hook_id: fields.value('Sim hook') ?? '',
      question: fields.value('Question') ?? '',
      good_segment_label: good?.label ?? legacyGoodLabel ?? '',
      good_segment_size: good ? good.size : integerValue(legacyGoodSize, 4, diag, block.id),
      bad_segment_label: bad?.label ?? legacyBadLabel ?? '',
      bad_segment_size: bad ? bad.size : integerValue(legacyBadSize, 4, diag, block.id),
      ...(maxField ? { max_value: integerValue(maxField, 0, diag, block.id) } : {}),
      ...(visibility.predicate ? { visibility: visibility.predicate } : {}),
    };
    warnLeftovers(fields, diag, block.id);
    return out;
  });

  // ---- Event deltas (0.1 section — no 0.2 replacement ratified yet) -------
  const eventDeltas: EventDeltaOut[] = byType('event-delta').map((block) => {
    const fields = new FieldMap(block.fields);
    const clockField = fields.find('Clock');
    let clockId = '';
    let clockDirection = 0;
    if (clockField && clockField.value !== 'None') {
      const match = clockField.value.match(/^(\S+)\s+([+-]?\d+)$/);
      if (match) {
        clockId = match[1];
        clockDirection = Number(match[2]);
        refs.push({ id: clockId, kind: 'clock', where: span(clockField.line), ownerId: block.id });
      } else {
        diag.add(
          codes.LINE_UNPARSED,
          'warning',
          `${block.id}.Clock must be "<clock_id> <±N>", got: "${clockField.value}"`,
          span(clockField.line),
          [block.id],
        );
      }
    }
    const revealFact = fields.value('Reveal fact') ?? '';
    if (revealFact)
      refs.push({ id: revealFact, kind: 'fact', where: blockSpan(block), ownerId: block.id });
    const out: EventDeltaOut = {
      event_type: block.id,
      log_text: fields.value('Log') ?? '',
      clock_id: clockId,
      clock_direction: clockDirection,
      reveal_fact_id: revealFact,
    };
    warnLeftovers(fields, diag, block.id);
    return out;
  });

  // ---- Beats + document arrivals ------------------------------------------
  const beats: BeatOut[] = byType('beat').map((block) => {
    const effectLines = block.effects.map((effect) => ({
      ast: parseEffectLine(effect.body),
      span: span(effect.line),
    }));
    const effects = emitEffects(effectLines, diag, block.id);
    for (const effect of effects) {
      if (effect.op === 'queue_pending_document') {
        const documentId = effect.args.document_id as string;
        if (documentId.startsWith('doc_'))
          refs.push({
            id: documentId,
            kind: 'document',
            where: blockSpan(block),
            ownerId: block.id,
          });
        if (effect.args.clock_id)
          refs.push({
            id: effect.args.clock_id as string,
            kind: 'clock',
            where: blockSpan(block),
            ownerId: block.id,
          });
      }
    }
    return {
      id: block.id,
      day: block.day ?? 0,
      text: block.proseLines
        .map((prose) => prose.text)
        .join('\n')
        .trim(),
      effects,
    };
  });
  for (const arrival of arrivals) {
    const existing = beats.find((beat) => beat.day === arrival.day);
    const effect = deliverEffect(arrival.documentId, 0, arrival.clockId);
    if (existing) existing.effects.push(effect);
    else beats.push({ id: `beat_d${arrival.day}`, day: arrival.day, text: '', effects: [effect] });
  }
  beats.sort((a, b) => a.day - b.day);

  // ---- Recipes (ruling 1b) ------------------------------------------------
  const recipes: RecipeOut[] = byType('recipe').map((block) => {
    const fields = new FieldMap(block.fields);
    const where = blockSpan(block);
    const pair = block.pair ?? ['', ''];
    for (const factId of pair)
      refs.push({ id: factId, kind: 'fact', where: span(block.startLine), ownerId: block.id });

    // SB-050 cull: the pair itself is the gate — a recipe gate: never had a
    // runtime reader (was RECIPE_GATE_UNSUPPORTED; retired by SB-054).
    cullField(fields, diag, block.id, 'gate', 'the pair itself is the gate');
    cullField(fields, diag, block.id, 'Gate', 'the pair itself is the gate');

    // The target question is authored as `~ open q_x`; other effect kinds
    // have no field on the recipe surface.
    let questionId = '';
    for (const effect of block.effects) {
      const ast = parseEffectLine(effect.body);
      const effectWhere = span(effect.line);
      if (ast.kind === 'error') {
        diag.add(
          codes.EFFECT_PARSE_ERROR,
          'warning',
          `Unrecognized ~ effect line in recipe: "${ast.text}"`,
          effectWhere,
          [block.id],
        );
        continue;
      }
      if (ast.kind !== 'open') {
        diag.add(
          codes.RECIPE_EFFECT_UNSUPPORTED,
          'warning',
          `~ ${ast.kind} has no field on the recipe surface (only ~ open q_x names the crafted question); nothing is emitted (engine backlog).`,
          effectWhere,
          [block.id],
        );
        continue;
      }
      if (questionId) {
        diag.add(
          codes.RECIPE_QUESTION_CONFLICT,
          'warning',
          `A recipe crafts exactly one question; "~ open ${ast.questionId}" conflicts with "${questionId}" and is dropped.`,
          effectWhere,
          [block.id, ast.questionId],
        );
        continue;
      }
      questionId = ast.questionId;
      refs.push({ id: questionId, kind: 'question', where: effectWhere, ownerId: block.id });
    }
    if (!questionId) {
      diag.add(
        codes.FIELD_MISSING,
        'warning',
        `Recipe ${block.id} names no target question — add "~ open q_x".`,
        where,
        [block.id],
      );
    }

    // One-owner rule: reading always derives from the target question's
    // Teaser; a recipe never authors it.
    const reading = questions.find((question) => question.id === questionId)?.teaser ?? '';
    const frankLines = fields.all('Frank').map((field) => stripGuillemets(field.value.trim()));

    const out: RecipeOut = {
      question_id: questionId,
      pair,
      reading,
      frank_lines: frankLines,
    };
    warnLeftovers(fields, diag, block.id);
    return out;
  });

  // ---- Proposals (SB-028 rulings A–D) -------------------------------------
  // Order = file order (ruling C): the compiler assigns the index at emit;
  // proposal block sequence in the source is load-bearing.
  const proposals: ProposalOut[] = byType('proposal').map((block, index) => {
    const fields = new FieldMap(block.fields);
    const where = blockSpan(block);

    const lineField = fields.find('Line');
    if (!lineField) {
      // Ruling D: `Line: «…»` is mandatory, exactly one per block. The file
      // always compiles — the block still emits (empty line) so the file
      // order of later proposals holds.
      diag.add(
        codes.PROPOSAL_MISSING_LINE,
        'error',
        `Proposal ${block.id} has no "Line: «…»" — one is mandatory (SB-028 ruling D).`,
        where,
        [block.id],
      );
    }

    const relevantField = fields.find('Relevant');
    const relevantFactIds = relevantField ? listValue(relevantField.value) : [];
    for (const factId of relevantFactIds)
      refs.push({ id: factId, kind: 'fact', where: span(relevantField!.line), ownerId: block.id });

    const categoriesField = fields.find('Categories');
    const categories = categoriesField ? listValue(categoriesField.value) : [];

    if (relevantFactIds.length === 0) {
      if (categories.length > 0) {
        // Ruling B warn case: Categories: without Relevant: — no shipped
        // proposal has that shape and the runtime path is unproven.
        diag.add(
          codes.PROPOSAL_CATEGORIES_WITHOUT_RELEVANT,
          'warning',
          `Proposal ${block.id} keys on Categories: alone — no shipped proposal does, and the runtime path is unproven (SB-028 ruling B).`,
          span(categoriesField!.line),
          [block.id],
        );
      } else {
        diag.add(
          codes.PROPOSAL_MISSING_RELEVANT,
          'error',
          `Proposal ${block.id} has no "Relevant: f_a[, f_b, f_c]" fact list (SB-028 ruling D).`,
          where,
          [block.id],
        );
      }
    }

    const out: ProposalOut = {
      handbok_id: block.id,
      line: lineField ? stripGuillemets(lineField.value) : '',
      ...(relevantFactIds.length > 0 ? { relevant_fact_ids: relevantFactIds } : {}),
      ...(categories.length > 0 ? { relevant_categories: categories } : {}),
      order: index,
    };
    warnLeftovers(fields, diag, block.id);
    return out;
  });

  // ---- §8 conversation weave (calls + frank_chat) -------------------------
  const weave = emitConversations(byType('conversation'), diag);
  for (const ref of weave.factRefs)
    refs.push({ id: ref.id, kind: 'fact', where: ref.where, ownerId: ref.ownerId });

  // ---- Stub resolution (never fatal) --------------------------------------
  const known: Record<Exclude<Ref['kind'], 'lead-target'>, Set<string>> = {
    document: new Set(documents.map((document) => document.id)),
    fact: new Set(facts.map((fact) => fact.id)),
    question: new Set(questions.map((question) => question.id)),
    hypothesis: new Set(hypotheses.map((hypothesis) => hypothesis.id)),
    tiltak: new Set(tiltak.map((entry) => entry.id)),
    dispatch: new Set(dispatches.map((dispatch) => dispatch.id)),
    clock: new Set(clocks.map((clock) => clock.id)),
  };
  // SB-024 extension: a lead may target a call surface with the same
  // namespaced handle facts use (`Reveals: call:grete`, ruling 3).
  const callIds = new Set(weave.calls.map((call) => `call:${call.contact_id}`));
  const reported = new Set<string>();
  for (const ref of refs) {
    const resolved =
      ref.kind === 'lead-target'
        ? known.tiltak.has(ref.id) || known.dispatch.has(ref.id) || callIds.has(ref.id)
        : known[ref.kind].has(ref.id);
    if (resolved) continue;
    const dedupeKey = `${ref.ownerId}→${ref.id}`;
    if (reported.has(dedupeKey)) continue;
    reported.add(dedupeKey);
    diag.add(
      codes.STUB_UNRESOLVED_ID,
      'warning',
      `Unresolved ${ref.kind === 'lead-target' ? 'tiltak/dispatch' : ref.kind} id "${ref.id}" referenced by ${ref.ownerId} — kept as a stub.`,
      ref.where,
      [ref.id, ref.ownerId],
    );
  }

  // ---- Assemble -----------------------------------------------------------
  const slice: CaseSlice = {
    id: caseId,
    title,
    scenario_stage: scenarioStage,
    ...(deadlineDay !== null ? { vurdering_frist_day: deadlineDay } : {}),
    documents,
    facts,
    questions,
    hypotheses,
    tiltak,
    dispatches,
    clocks,
    event_delta_specs: eventDeltas,
    day_script_beats: beats,
    ...(weave.frankChat.length > 0 ? { frank_chat: weave.frankChat } : {}),
    ...(proposals.length > 0 ? { frank_proposals: proposals } : {}),
    ...(pairSoftRejectField
      ? { pair_soft_reject_line: stripGuillemets(pairSoftRejectField.value) }
      : {}),
    ...(pairAlreadySetField
      ? { pair_already_set_line: stripGuillemets(pairAlreadySetField.value) }
      : {}),
    ...(recipes.length > 0 ? { recipes } : {}),
    ...(weave.calls.length > 0 ? { calls: weave.calls } : {}),
  };

  // ---- §9 graph lints (advisory — never block compilation) ----------------
  const blockSpans = new Map<string, Span>();
  for (const block of parsed.blocks) blockSpans.set(block.id, blockSpan(block));
  runLints(
    {
      caseId,
      deadline:
        deadlineDay !== null && deadlineField
          ? { day: deadlineDay, where: span(deadlineField.line) }
          : null,
      slice,
      gates: gateSites,
      spans: blockSpans,
      weaveSpans: weave.spans,
    },
    diag,
  );

  const labContent: LabContent = {
    documents: Object.fromEntries(
      documents.map((document) => [
        document.id,
        {
          id: document.id,
          kind: document.kind,
          title: document.title,
          register: document.register,
          peek: document.peek,
          meta: document.meta,
          blocks: (documentParagraphs.get(document.id) ?? []).map((para, index) => ({
            id: `${document.id}_p${index + 1}`,
            runs: parseDocumentRuns(para, normalizeRunTextKeepBreaks).map((run) =>
              run.fact_id ? { text: run.text, factId: run.fact_id } : { text: run.text },
            ),
          })),
        },
      ]),
    ),
    facts: Object.fromEntries(
      facts.map((fact) => [
        fact.id,
        {
          id: fact.id,
          domain: fact.domain,
          category: fact.category,
          text: fact.summary,
          quote: fact.quote,
          supports: fact.supports_questions,
        },
      ]),
    ),
    questions: Object.fromEntries(
      questions.map((question) => {
        const extra = questionExtras.get(question.id);
        return [
          question.id,
          {
            id: question.id,
            title: extra?.titleForLab ?? question.prompt,
            appearsOn: extra?.appearsOn ?? [],
            hypotheses: hypotheses
              .filter((hypothesis) => hypothesis.question_id === question.id)
              .map((hypothesis) => {
                const hypothesisExtra = hypothesisExtras.get(hypothesis.id);
                return {
                  id: hypothesis.id,
                  label: hypothesis.title,
                  needs: hypothesisExtra?.needsFactIds ?? [],
                  opens: hypothesisExtra?.opensTiltak ?? [],
                  note: hypothesis.summary,
                };
              }),
          },
        ];
      }),
    ),
    tiltak: Object.fromEntries(
      tiltak.map((entry) => [
        entry.id,
        {
          id: entry.id,
          slot: entry.slot,
          title: entry.title,
          cost: entry.cost,
          description: entry.description,
          sim: entry.sim_hook_id,
        },
      ]),
    ),
    dispatches: Object.fromEntries(
      dispatches.map((dispatch) => [
        dispatch.id,
        { id: dispatch.id, title: dispatch.title, description: dispatch.description },
      ]),
    ),
  };

  return { slice, labContent };
}
