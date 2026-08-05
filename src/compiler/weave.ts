// §8 conversation weave — card-keyed branches (TERM-001) compiled to the two
// runtime surfaces: the calls array and frank_chat entries (rulings 1a and 2).
//
// The DD-002 emit boundary is enforced here: playable constructs emit JSON;
// everything else (gathers, diverts, -> END, * -> fallback, {a|b} sequences,
// labels, deep nesting, guards on the wrong surface, effects with no target
// field) parses, produces a structured warning with a stable code, and emits
// nothing. The warning list doubles as the engine backlog.

import type { DiagnosticBag, Span } from './diagnostics.ts';
import { codes, span } from './diagnostics.ts';
import type { CondNode, PredicateSpec } from './condition.ts';
import { emitPredicate, factIdsInCondition, parseCondition } from './condition.ts';
import { parseEffectLine } from './effects.ts';
import { parseHeaderMeta } from './parse.ts';
import type { RawBlock, RawProse } from './parse.ts';

export interface CallLineOut {
  who?: string;
  text: string;
  fact_id?: string;
}

export interface CallExchangeOut {
  card_id: string;
  ask: string;
  reply: CallLineOut[];
}

export interface CallOut {
  contact_id: string;
  gate?: PredicateSpec;
  opening: CallLineOut[];
  soft_reject?: string;
  exchanges: CallExchangeOut[];
}

export interface ChatFollowupOut {
  label: string;
  lines: string[];
}

export interface ChatEntryOut {
  id: string;
  question: string;
  answer: string;
  needs: string[];
  pays_fact?: string;
  answer_lines: string[];
  followups: ChatFollowupOut[];
}

export interface WeaveFactRef {
  id: string;
  where: Span;
  ownerId: string;
}

export interface WeaveResult {
  calls: CallOut[];
  frankChat: ChatEntryOut[];
  factRefs: WeaveFactRef[];
  /** Source spans for the §9 lints: `call:<contact>` and chat entry ids → conversation block span. */
  spans: Map<string, Span>;
}

const ANCHOR_RE = /\[([^\]]+)\]\(fact:([a-zA-Z0-9_:-]+)\)/g;

/** Branch-line bracket payload keys the compiler ratifies ([id=…] [answer=none]). */
const BRANCH_META_KEYS = new Set(['id', 'answer']);

interface BranchHead {
  /** Text after labels/guard/payload were stripped. */
  text: string;
  guardSrc: string | null;
  meta: Record<string, string>;
}

/**
 * Strip leading `(label)` / `{guard}` tokens and a trailing `[k=v …]` payload
 * from a branch line's text. Labels warn (ruling 2); the guard's meaning is
 * surface-specific and handled by the caller.
 */
function parseBranchHead(
  text: string,
  diag: DiagnosticBag,
  ownerId: string,
  where: Span,
): BranchHead {
  let rest = text.trim();
  let guardSrc: string | null = null;
  let meta: Record<string, string> = {};

  const payload = rest.match(/\s*\[([^[\]]+)\]$/);
  if (payload) {
    const parsed = parseHeaderMeta(payload[1]);
    const keys = Object.keys(parsed);
    if (keys.length > 0 && keys.every((key) => BRANCH_META_KEYS.has(key))) {
      meta = parsed;
      rest = rest.slice(0, rest.length - payload[0].length).trim();
    }
  }

  for (;;) {
    const label = rest.match(/^\(([\w.]+)\)\s*/);
    if (label) {
      diag.add(
        codes.WEAVE_LABEL_UNSUPPORTED,
        'warning',
        `Choice label "(${label[1]})" has no runtime representation (follow-ups are addressed positionally); the label is dropped (engine backlog).`,
        where,
        [ownerId],
      );
      rest = rest.slice(label[0].length);
      continue;
    }
    if (rest.startsWith('{')) {
      const close = rest.indexOf('}');
      if (close > 0) {
        const inner = rest.slice(1, close);
        rest = rest.slice(close + 1).trim();
        if (inner.includes('|')) {
          diag.add(
            codes.WEAVE_SEQUENCE_UNSUPPORTED,
            'warning',
            `Sequence text "{${inner}}" has no runtime representation; it is dropped (engine backlog).`,
            where,
            [ownerId],
          );
        } else {
          guardSrc = inner;
        }
        continue;
      }
    }
    break;
  }

  return { text: rest.trim(), guardSrc, meta };
}

interface ParsedBranch {
  /** null when the branch is not card-keyed. */
  key: string | null;
  /** Ask/question text (labels, guard and payload stripped). */
  text: string;
  guardSrc: string | null;
  meta: Record<string, string>;
}

/**
 * Parse a depth-1 branch line's content after the sigils: `(label)` / `{guard}`
 * tokens may sit before or after the card key, the `[k=v]` payload trails.
 */
function parseBranch(
  rest: string,
  diag: DiagnosticBag,
  ownerId: string,
  where: Span,
): ParsedBranch {
  const pre = parseBranchHead(rest, diag, ownerId, where);
  const keyed = pre.text.match(/^(f_[a-z0-9_]+)\s*:\s*(.*)$/);
  if (!keyed) return { key: null, text: pre.text, guardSrc: pre.guardSrc, meta: pre.meta };
  const post = parseBranchHead(keyed[2], diag, ownerId, where);
  return {
    key: keyed[1],
    text: post.text,
    guardSrc: pre.guardSrc ?? post.guardSrc,
    meta: { ...pre.meta, ...post.meta },
  };
}

/** Parse a call line: optional `du:` speaker prefix, `[…](fact:f_x)` lift anchors. */
function parseCallLine(
  text: string,
  refs: WeaveFactRef[],
  ownerId: string,
  line: number,
): CallLineOut {
  let rest = text.trim();
  let who: string | undefined;
  const speaker = rest.match(/^du:\s*/);
  if (speaker) {
    who = 'du';
    rest = rest.slice(speaker[0].length);
  }
  let factId: string | undefined;
  rest = rest.replace(new RegExp(ANCHOR_RE.source, 'g'), (_all, inner: string, id: string) => {
    if (factId === undefined) {
      factId = id;
      refs.push({ id, where: span(line), ownerId });
    }
    return inner;
  });
  return {
    ...(who !== undefined ? { who } : {}),
    text: rest.trim(),
    ...(factId !== undefined ? { fact_id: factId } : {}),
  };
}

/**
 * Fold a chat-branch guard into the flat AND fact list the runtime supports
 * (ruling 2). Terms with no runtime op warn through the §6 machinery; any
 * structure beyond `f_a and f_b` warns weave-chat-guard-unsupported.
 */
function foldChatGuard(src: string, diag: DiagnosticBag, ownerId: string, where: Span): string[] {
  const { ast, error } = parseCondition(src);
  if (error !== null || ast === null) {
    if (error !== null) {
      diag.add(
        codes.COND_PARSE_ERROR,
        'error',
        `Cannot parse weave guard "{${src}}": ${error}`,
        where,
        [ownerId],
      );
    }
    return [];
  }
  const needs: string[] = [];
  let unsupportedStructure = false;
  const visit = (node: CondNode): void => {
    if (node.kind === 'and') {
      for (const child of node.children) visit(child);
      return;
    }
    if (node.kind === 'term' && node.term === 'fact') {
      needs.push(node.id);
      return;
    }
    if (node.kind === 'term' || node.kind === 'n-of') {
      // Unsupported terms (tiltak-taken, dispatch-done, n of, …) warn via the
      // shared §6 capability table; terms with an op that still cannot live
      // in a flat fact list (stage, hypothesis) fall through to the
      // structure warning below.
      const spec = emitPredicate(node, diag, ownerId, where);
      if (spec !== null) unsupportedStructure = true;
      return;
    }
    unsupportedStructure = true; // or / not
  };
  visit(ast);
  if (unsupportedStructure) {
    diag.add(
      codes.WEAVE_CHAT_GUARD_UNSUPPORTED,
      'warning',
      `A chat-entry guard is a flat AND fact list (needs); "{${src}}" goes beyond that and the unsupported part is dropped (engine backlog).`,
      where,
      [ownerId],
    );
  }
  return needs;
}

interface SigilLine {
  depth: number;
  rest: string;
}

function matchSigils(trimmed: string): SigilLine | null {
  const match = trimmed.match(/^(\*(?:\s*\*)*)(?:\s+(.*))?$/s);
  if (!match) return null;
  return { depth: (match[1].match(/\*/g) ?? []).length, rest: (match[2] ?? '').trim() };
}

/** Shared warn-only constructs: gather, divert, -> END. Returns true if consumed. */
function warnFlowLine(trimmed: string, diag: DiagnosticBag, ownerId: string, where: Span): boolean {
  if (/^-(?!>)/.test(trimmed)) {
    diag.add(
      codes.WEAVE_GATHER_UNSUPPORTED,
      'warning',
      `Gathers ("- (hub)") have no runtime representation; nothing is emitted (engine backlog).`,
      where,
      [ownerId],
    );
    return true;
  }
  const divert = trimmed.match(/^->\s*(\S*)/);
  if (divert) {
    if (divert[1] === 'END') {
      diag.add(
        codes.WEAVE_END_UNSUPPORTED,
        'warning',
        `"-> END" is UI, never authored content (hanging up is a hardcoded button); nothing is emitted (engine backlog).`,
        where,
        [ownerId],
      );
    } else {
      diag.add(
        codes.WEAVE_DIVERT_UNSUPPORTED,
        'warning',
        `Diverts ("-> ${divert[1] || '…'}") have no runtime representation; nothing is emitted (engine backlog).`,
        where,
        [ownerId],
      );
    }
    return true;
  }
  return false;
}

/** True (and warns) when a text line carries {a|b} sequence text — the line is dropped. */
function isSequenceLine(
  trimmed: string,
  diag: DiagnosticBag,
  ownerId: string,
  where: Span,
): boolean {
  if (/\{[^}]*\|[^}]*\}/.test(trimmed)) {
    diag.add(
      codes.WEAVE_SEQUENCE_UNSUPPORTED,
      'warning',
      `Sequence text ("{først|senere}") has no runtime representation; the line is dropped (engine backlog).`,
      where,
      [ownerId],
    );
    return true;
  }
  return false;
}

/** Strip a leading {guard} from a plain text line, warning weave-line-guard-unsupported. */
function stripLineGuard(
  trimmed: string,
  diag: DiagnosticBag,
  ownerId: string,
  where: Span,
): string {
  if (!trimmed.startsWith('{')) return trimmed;
  const close = trimmed.indexOf('}');
  if (close <= 0) return trimmed;
  diag.add(
    codes.WEAVE_LINE_GUARD_UNSUPPORTED,
    'warning',
    `A guard on a text line has no runtime representation; the guard is dropped, the line kept (engine backlog).`,
    where,
    [ownerId],
  );
  return trimmed.slice(close + 1).trim();
}

function warnFallback(diag: DiagnosticBag, ownerId: string, where: Span): void {
  diag.add(
    codes.WEAVE_FALLBACK_UNSUPPORTED,
    'warning',
    `"* ->" fallback choices have no runtime representation — soft reject stays declarative (ruling 2); nothing is emitted (engine backlog).`,
    where,
    [ownerId],
  );
}

function warnTooDeep(diag: DiagnosticBag, ownerId: string, where: Span): void {
  diag.add(
    codes.WEAVE_NESTING_TOO_DEEP,
    'warning',
    `Weave nesting deeper than one follow-up level has no runtime representation; the node is dropped (engine backlog).`,
    where,
    [ownerId],
  );
}

function compileCall(
  contactId: string,
  lines: RawProse[],
  diag: DiagnosticBag,
  refs: WeaveFactRef[],
): CallOut {
  const ownerId = `call:${contactId}`;
  const opening: CallLineOut[] = [];
  const exchanges: CallExchangeOut[] = [];
  let gate: PredicateSpec | undefined;
  let softReject: string | undefined;
  // Where plain text lines currently land: the opening, an exchange reply, or
  // a discard sink for warned-away constructs.
  let sink: CallLineOut[] | null = opening;
  let sawBranch = false;

  for (const { text, line } of lines) {
    const trimmed = text.trim();
    if (!trimmed) continue;
    const where = span(line);

    if (warnFlowLine(trimmed, diag, ownerId, where)) continue;

    const sigils = matchSigils(trimmed);
    if (sigils) {
      if (sigils.rest.startsWith('->')) {
        warnFallback(diag, ownerId, where);
        sink = null;
        continue;
      }
      if (sigils.depth >= 3) {
        warnTooDeep(diag, ownerId, where);
        sink = null;
        continue;
      }
      if (sigils.depth === 2) {
        diag.add(
          codes.WEAVE_CALL_FOLLOWUP,
          'warning',
          `Calls have no followups field — "* *" under a call exchange emits nothing (engine backlog).`,
          where,
          [ownerId],
        );
        sink = null;
        continue;
      }
      sawBranch = true;
      const branch = parseBranch(sigils.rest, diag, ownerId, where);
      if (branch.guardSrc !== null) {
        diag.add(
          codes.WEAVE_EXCHANGE_GUARD,
          'warning',
          `Call exchanges take no guard (the call-level gate: owns access, ruling 2); "{${branch.guardSrc}}" is dropped (engine backlog).`,
          where,
          [ownerId],
        );
      }
      if (branch.key === null) {
        diag.add(
          codes.WEAVE_CHOICE_NOT_CARD_KEYED,
          'warning',
          `A top-level weave branch must be card-keyed ("* f_x: …", TERM-001); "${branch.text}" emits nothing.`,
          where,
          [ownerId],
        );
        sink = null;
        continue;
      }
      const exchange: CallExchangeOut = { card_id: branch.key, ask: branch.text, reply: [] };
      refs.push({ id: branch.key, where, ownerId });
      exchanges.push(exchange);
      sink = exchange.reply;
      continue;
    }

    const effect = trimmed.match(/^~\s+(.*)$/);
    if (effect) {
      const ast = parseEffectLine(effect[1]);
      if (ast.kind === 'error') {
        diag.add(
          codes.EFFECT_PARSE_ERROR,
          'warning',
          `Unrecognized ~ effect line in weave: "${ast.text}"`,
          where,
          [ownerId],
        );
      } else {
        diag.add(
          codes.WEAVE_EFFECT_UNSUPPORTED,
          'warning',
          `~ ${ast.kind} has no target field on the call surface (call lifts are authored as […](fact:f_x) anchors); nothing is emitted (engine backlog).`,
          where,
          [ownerId],
        );
      }
      continue;
    }

    // Field lines (call top level only, before/around branches).
    if (!sawBranch) {
      const field = trimmed.match(/^([A-Za-zÆØÅæøå][A-Za-zÆØÅæøå ]*?):\s?(.*)$/);
      const key = field?.[1].toLowerCase();
      if (field && key === 'gate') {
        const { ast, error } = parseCondition(field[2]);
        if (error !== null || ast === null) {
          if (error !== null) {
            diag.add(
              codes.COND_PARSE_ERROR,
              'error',
              `Cannot parse gate "${field[2]}": ${error}`,
              where,
              [ownerId],
            );
          }
        } else {
          gate = emitPredicate(ast, diag, ownerId, where) ?? undefined;
          for (const factId of factIdsInCondition(ast)) refs.push({ id: factId, where, ownerId });
        }
        continue;
      }
      if (field && key === 'soft reject') {
        softReject = stripGuillemets(field[2].trim());
        continue;
      }
    }

    if (isSequenceLine(trimmed, diag, ownerId, where)) continue;
    if (sink === null) continue; // under a warned-away construct
    const lineText = stripLineGuard(trimmed, diag, ownerId, where);
    if (!lineText) continue;
    sink.push(parseCallLine(lineText, refs, ownerId, line));
  }

  return {
    contact_id: contactId,
    ...(gate !== undefined ? { gate } : {}),
    opening,
    ...(softReject !== undefined ? { soft_reject: softReject } : {}),
    exchanges,
  };
}

function stripGuillemets(value: string): string {
  if (value.startsWith('«') && value.endsWith('»')) return value.slice(1, -1);
  return value;
}

const CHAT_TRIPLE_KEYS = new Set(['question', 'answer', 'needs', 'pays fact']);

function compileChat(
  name: string,
  lines: RawProse[],
  diag: DiagnosticBag,
  refs: WeaveFactRef[],
  startLine: number,
): ChatEntryOut[] {
  const ownerId = `chat:${name}`;
  const entries: ChatEntryOut[] = [];
  const triple: Partial<Record<'question' | 'answer' | 'needs' | 'pays fact', string>> = {};
  let entry: ChatEntryOut | null = null;
  let followup: ChatFollowupOut | null = null;
  /** null = discard sink after a warned-away construct. */
  let sink: string[] | null | 'none' = 'none';
  let answerMode: 'join' | 'none' = 'join';
  const finishEntry = (): void => {
    if (entry && answerMode === 'join') entry.answer = entry.answer_lines.join(' ');
  };

  for (const { text, line } of lines) {
    const trimmed = text.trim();
    if (!trimmed) continue;
    const where = span(line);

    if (warnFlowLine(trimmed, diag, ownerId, where)) continue;

    const sigils = matchSigils(trimmed);
    if (sigils) {
      if (sigils.rest.startsWith('->')) {
        warnFallback(diag, ownerId, where);
        sink = null;
        continue;
      }
      if (sigils.depth >= 3) {
        warnTooDeep(diag, ownerId, where);
        sink = null;
        continue;
      }
      if (sigils.depth === 2) {
        const head = parseBranchHead(sigils.rest, diag, entry?.id ?? ownerId, where);
        if (head.guardSrc !== null) {
          diag.add(
            codes.WEAVE_FOLLOWUP_GUARD,
            'warning',
            `Follow-ups take no guard (ruling 2); "{${head.guardSrc}}" is dropped (engine backlog).`,
            where,
            [entry?.id ?? ownerId],
          );
        }
        if (!entry) {
          diag.add(
            codes.LINE_UNPARSED,
            'warning',
            `Follow-up "* * ${head.text}" appears before any card-keyed branch; it emits nothing.`,
            where,
            [ownerId],
          );
          sink = null;
          continue;
        }
        followup = { label: head.text, lines: [] };
        entry.followups.push(followup);
        sink = followup.lines;
        continue;
      }
      // depth 1 — a new chat entry (card-keyed branch).
      finishEntry();
      followup = null;
      const branch = parseBranch(sigils.rest, diag, ownerId, where);
      if (branch.key === null) {
        diag.add(
          codes.WEAVE_CHOICE_NOT_CARD_KEYED,
          'warning',
          `A top-level weave branch must be card-keyed ("* f_x: …", TERM-001); "${branch.text}" emits nothing.`,
          where,
          [ownerId],
        );
        entry = null;
        sink = null;
        continue;
      }
      const key = branch.key;
      const id = branch.meta.id ?? `c_${key.slice(2)}`;
      const needs = [key];
      refs.push({ id: key, where, ownerId: id });
      if (branch.guardSrc !== null) {
        for (const factId of foldChatGuard(branch.guardSrc, diag, id, where)) {
          needs.push(factId);
          refs.push({ id: factId, where, ownerId: id });
        }
      }
      answerMode = branch.meta.answer === 'none' ? 'none' : 'join';
      entry = {
        id,
        question: branch.text,
        answer: '',
        needs,
        answer_lines: [],
        followups: [],
      };
      entries.push(entry);
      sink = entry.answer_lines;
      continue;
    }

    const effect = trimmed.match(/^~\s+(.*)$/);
    if (effect) {
      const ast = parseEffectLine(effect[1]);
      if (ast.kind === 'error') {
        diag.add(
          codes.EFFECT_PARSE_ERROR,
          'warning',
          `Unrecognized ~ effect line in weave: "${ast.text}"`,
          where,
          [entry?.id ?? ownerId],
        );
      } else if (ast.kind === 'pay' && entry && !followup && sink !== null) {
        entry.pays_fact = ast.factId;
        refs.push({ id: ast.factId, where, ownerId: entry.id });
      } else {
        diag.add(
          codes.WEAVE_EFFECT_UNSUPPORTED,
          'warning',
          `~ ${ast.kind} has no target field on this chat surface (only ~ pay on an entry mints pays_fact); nothing is emitted (engine backlog).`,
          where,
          [entry?.id ?? ownerId],
        );
      }
      continue;
    }

    // §10 compat: Question/Answer/Needs triple at the top of a chat:<c_id>
    // block compiles as a one-choice weave.
    if (sink === 'none') {
      const field = trimmed.match(/^([A-Za-zÆØÅæøå][A-Za-zÆØÅæøå ]*?):\s?(.*)$/);
      const key = field?.[1].toLowerCase();
      if (field && key !== undefined && CHAT_TRIPLE_KEYS.has(key)) {
        if (key === 'pays fact') {
          // §10 compat: `Pays fact:` is 0.1 syntax for the entry's minted fact.
          diag.add(
            codes.FIXIT_PAYS_FACT,
            'info',
            `"Pays fact:" is 0.1 syntax — replace with "~ pay ${field[2].trim()}" on the branch`,
            where,
            [name],
          );
        }
        triple[key as 'question' | 'answer' | 'needs' | 'pays fact'] = field[2].trim();
        continue;
      }
      diag.add(
        codes.LINE_UNPARSED,
        'warning',
        `Line before any card-keyed branch in ${ownerId}: "${trimmed}"`,
        where,
        [ownerId],
      );
      continue;
    }

    if (isSequenceLine(trimmed, diag, entry?.id ?? ownerId, where)) continue;
    if (sink === null) continue; // under a warned-away construct
    const lineText = stripLineGuard(trimmed, diag, entry?.id ?? ownerId, where);
    if (lineText) sink.push(lineText);
  }
  finishEntry();

  if (entries.length === 0 && triple.question !== undefined) {
    const answer = triple.answer ?? '';
    const needs = (triple.needs ?? '')
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
    for (const factId of needs) refs.push({ id: factId, where: span(startLine), ownerId: name });
    const paysFact = triple['pays fact'];
    if (paysFact !== undefined && paysFact !== '')
      refs.push({ id: paysFact, where: span(startLine), ownerId: name });
    return [
      {
        id: name,
        question: triple.question,
        answer,
        needs,
        ...(paysFact !== undefined && paysFact !== '' ? { pays_fact: paysFact } : {}),
        answer_lines: answer ? [answer] : [],
        followups: [],
      },
    ];
  }
  return entries;
}

export function emitConversations(blocks: RawBlock[], diag: DiagnosticBag): WeaveResult {
  const calls: CallOut[] = [];
  const frankChat: ChatEntryOut[] = [];
  const factRefs: WeaveFactRef[] = [];
  const spans = new Map<string, Span>();

  for (const block of blocks) {
    const blockWhere = span(block.startLine, block.endLine);
    const call = block.id.match(/^call:(\S+)$/);
    if (call) {
      calls.push(compileCall(call[1], block.proseLines, diag, factRefs));
      spans.set(`call:${call[1]}`, blockWhere);
      continue;
    }
    const chat = block.id.match(/^chat:(\S+)$/);
    if (chat) {
      const entries = compileChat(chat[1], block.proseLines, diag, factRefs, block.startLine);
      for (const entry of entries) spans.set(entry.id, blockWhere);
      frankChat.push(...entries);
      continue;
    }
    diag.add(
      codes.WEAVE_UNKNOWN_KIND,
      'warning',
      `Conversation name "${block.id}" is neither "call:<contact>" nor "chat:<name>"; the block is skipped.`,
      span(block.startLine, block.endLine),
      [block.id],
    );
  }

  return { calls, frankChat, factRefs, spans };
}
