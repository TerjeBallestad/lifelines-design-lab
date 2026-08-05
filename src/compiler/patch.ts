// Markup patch layer (SB-031, DD-003): the canvas edits the .case.md text by
// minimal patches — the markup stays the store. Every function is pure:
// (text, …) → new text. Each call reparses, so patches compose by chaining.
// Untouched lines are never reformatted; a no-op patch is byte-identical.

import type { RawBlock, BlockType } from './parse.ts';
import { parseCaseText } from './parse.ts';
import { DiagnosticBag } from './diagnostics.ts';

export class PatchError extends Error {}

/** Header keyword per appendable block type (`# <Header>: <id>`). */
const BLOCK_HEADERS: Partial<Record<BlockType, string>> = {
  document: 'Document',
  question: 'Question',
  hypothesis: 'Hypothesis',
  tiltak: 'Tiltak',
  dispatch: 'Dispatch',
  clock: 'Clock',
  conversation: 'Conversation',
  proposal: 'Proposal',
  recipe: 'Recipe',
};

/** Minimal body templates per kind, used by appendBlock when none is given. */
export const DEFAULT_TEMPLATES: Partial<Record<BlockType, string>> = {
  document: 'Kind: RAPPORT · Register: notat\nTitle: \nPeek: \nMeta: ',
  fact: 'Label: \nSummary: \nDomain:  · Category: \nSupports: \nDiscuss: Frank',
  question: 'Title: \nTeaser: \nwhen: ',
  hypothesis: 'Title: \nSummary: \nQuestion: \nneeds: \nOpens: ',
  tiltak: 'Title: \nSlot: s1 · Cost: 0\nNeeds: \nNeeds hypothesis: \nDescription: \nSim hook: ',
  dispatch:
    'Title: \nSim hook: \nDescription: \nActivity: \nChannel: now · Delay: 0m · Duration: 1h · Occupies: 1h\nReception: 0\ngate: ',
  clock: 'Label: \nSim hook: \nQuestion: \nGood:  / 4 · Bad:  / 4',
  proposal: 'Relevant: \nLine: ',
};

// Mirrors parse.ts exactly: which keys may follow a ` · ` separator, and the
// `Key: value` line shape. Keep in sync — a drift here mispatches lines.
const COMPOSITE_FOLLOW_KEYS = /^(Register|Category|Cost|Weight|Bad|Delay|Duration|Occupies):\s/;
const FIELD_RE = /^([A-Za-zÆØÅæøå][A-Za-zÆØÅæøå ]*?):\s?(.*)$/;

interface Parsed {
  lines: string[];
  caseBlock: RawBlock | null;
  blocks: RawBlock[];
}

function parse(text: string): Parsed {
  const { caseBlock, blocks } = parseCaseText(text, new DiagnosticBag());
  return { lines: text.split('\n'), caseBlock, blocks };
}

function findBlock(parsed: Parsed, blockId: string): RawBlock {
  if (parsed.caseBlock?.id === blockId) return parsed.caseBlock;
  const found = parsed.blocks.find((b) => b.id === blockId);
  if (!found) throw new PatchError(`No block with id "${blockId}".`);
  return found;
}

/** Character span of a field's raw value on one line, comment kept intact. */
interface ValueSpan {
  /** Offset of the value's first character on the line. */
  start: number;
  /** Offset one past the value's last character (before ` //…` or `\r`). */
  end: number;
  /** The raw (untrimmed) value text. */
  raw: string;
}

/**
 * Locate `key`'s value span on a raw line, honouring the parser's comment
 * stripping and composite ` · ` splitting. Returns null when the line does
 * not carry that key.
 */
function locateValue(line: string, key: string): ValueSpan | null {
  let content = line.endsWith('\r') ? line.slice(0, -1) : line;
  if (/^\s*\/\//.test(content)) return null;
  const comment = content.match(/\s+\/\/.*$/);
  if (comment) content = content.slice(0, comment.index);

  // Walk the composite parts, tracking each part's start offset.
  const segments = content.split(' · ');
  let partStart = 0;
  let part = segments[0];
  const parts: Array<{ text: string; start: number }> = [];
  let cursor = segments[0].length;
  for (const segment of segments.slice(1)) {
    if (COMPOSITE_FOLLOW_KEYS.test(segment)) {
      parts.push({ text: part, start: partStart });
      partStart = cursor + 3; // past ' · '
      part = segment;
    } else {
      part += ' · ' + segment;
    }
    cursor += 3 + segment.length;
  }
  parts.push({ text: part, start: partStart });

  for (const p of parts) {
    const m = p.text.match(FIELD_RE);
    if (!m || m[1].trim() !== key) continue;
    const valueStart = p.start + (p.text.length - m[2].length);
    return { start: valueStart, end: p.start + p.text.length, raw: m[2] };
  }
  return null;
}

function spliceLine(lines: string[], lineNo: number, span: ValueSpan, value: string): string[] {
  const line = lines[lineNo - 1];
  let { start } = span;
  let insert = value;
  if (value === '') {
    // Emptying a value: also drop the single space after the colon.
    if (line[start - 1] === ' ') start -= 1;
  } else if (line[start - 1] === ':') {
    // Filling a bare `Key:` line: restore the space after the colon.
    insert = ' ' + value;
  }
  const next = [...lines];
  next[lineNo - 1] = line.slice(0, start) + insert + line.slice(span.end);
  return next;
}

/** The parsed field entry (first occurrence) for `key` in a block, if any. */
function findField(block: RawBlock, key: string) {
  return block.fields.find((f) => f.key === key) ?? null;
}

function assertFieldBearing(block: RawBlock): void {
  if (block.type === 'beat' || block.type === 'conversation') {
    throw new PatchError(
      `Block "${block.id}" is a ${block.type}; its body is prose/weave, not fields.`,
    );
  }
}

/** Line number after which a new field line should be inserted. */
function fieldInsertLine(block: RawBlock): number {
  const last = block.fields[block.fields.length - 1];
  return last ? last.line : block.startLine;
}

/**
 * Set one field's value. Patches the first line carrying the key; when the
 * block has no such field, inserts a `Key: value` line after its last field
 * (or the header). A patch to the current value returns the text unchanged.
 */
export function patchField(text: string, blockId: string, key: string, value: string): string {
  const parsed = parse(text);
  const block = findBlock(parsed, blockId);
  assertFieldBearing(block);
  const field = findField(block, key);
  if (!field) {
    const at = fieldInsertLine(block);
    const next = [...parsed.lines];
    next.splice(at, 0, `${key}: ${value}`);
    return next.join('\n');
  }
  const span = locateValue(parsed.lines[field.line - 1], key);
  if (!span) throw new PatchError(`Could not locate "${key}" on line ${field.line}.`);
  if (span.raw.trim() === value.trim()) return text;
  return spliceLine(parsed.lines, field.line, span, value.trim()).join('\n');
}

function splitEntries(rawValue: string): string[] {
  const trimmed = rawValue.trim();
  return trimmed === '' ? [] : trimmed.split(',').map((e) => e.trim());
}

/** An entry matches by exact text or by its id token (before a ` [` payload). */
function entryMatches(existing: string, entry: string): boolean {
  if (existing === entry) return true;
  const token = existing.split(' [')[0].trim();
  return token === entry;
}

/**
 * Append one entry to a comma-separated list field (Supports, Needs, Opens,
 * Discuss, Relevant, …). Creates the field when absent. Adding an entry that
 * is already listed returns the text unchanged.
 */
export function listFieldAdd(text: string, blockId: string, key: string, entry: string): string {
  const parsed = parse(text);
  const block = findBlock(parsed, blockId);
  assertFieldBearing(block);
  const field = findField(block, key);
  if (!field) {
    const at = fieldInsertLine(block);
    const next = [...parsed.lines];
    next.splice(at, 0, `${key}: ${entry}`);
    return next.join('\n');
  }
  const span = locateValue(parsed.lines[field.line - 1], key);
  if (!span) throw new PatchError(`Could not locate "${key}" on line ${field.line}.`);
  if (splitEntries(span.raw).some((e) => entryMatches(e, entry))) return text;
  const value = span.raw.trim() === '' ? entry : `${span.raw.trimEnd()}, ${entry}`;
  return spliceLine(parsed.lines, field.line, span, value).join('\n');
}

/**
 * Remove one entry from a comma-separated list field. The entry matches by
 * exact text or by id token, so `d_konto` removes `d_konto [type=…]` too.
 * The remaining entries keep their order (joined with `, `); removing the
 * last entry leaves the bare `Key:` line. A miss returns the text unchanged.
 */
export function listFieldRemove(text: string, blockId: string, key: string, entry: string): string {
  const parsed = parse(text);
  const block = findBlock(parsed, blockId);
  assertFieldBearing(block);
  const field = findField(block, key);
  if (!field) return text;
  const span = locateValue(parsed.lines[field.line - 1], key);
  if (!span) throw new PatchError(`Could not locate "${key}" on line ${field.line}.`);
  const entries = splitEntries(span.raw);
  const kept = entries.filter((e) => !entryMatches(e, entry));
  if (kept.length === entries.length) return text;
  return spliceLine(parsed.lines, field.line, span, kept.join(', ')).join('\n');
}

export interface AppendBlockOptions {
  /** Body lines under the header; defaults to DEFAULT_TEMPLATES[kind]. */
  template?: string;
  /** Facts only: id of the `# Document:` block the fact belongs under. */
  documentId?: string;
}

/**
 * Append a new block. Entity kinds go at the end of the file as
 * `# <Header>: <id>`; a fact goes at the end of its parent document's span as
 * `## <id>` (opts.documentId is required). Duplicate ids throw.
 */
export function appendBlock(
  text: string,
  kind: BlockType,
  id: string,
  opts: AppendBlockOptions = {},
): string {
  const parsed = parse(text);
  if (parsed.caseBlock?.id === id || parsed.blocks.some((b) => b.id === id)) {
    throw new PatchError(`A block with id "${id}" already exists.`);
  }
  const template = opts.template ?? DEFAULT_TEMPLATES[kind] ?? '';
  const body = template === '' ? [] : template.split('\n');

  if (kind === 'fact') {
    if (!opts.documentId) throw new PatchError('appendBlock(fact) needs opts.documentId.');
    const doc = findBlock(parsed, opts.documentId);
    if (doc.type !== 'document') {
      throw new PatchError(`"${opts.documentId}" is a ${doc.type}, not a document.`);
    }
    // Insert after the last block of the document's fact run (facts follow
    // their document contiguously), or after the document itself.
    let anchor = doc;
    for (const b of parsed.blocks) {
      if (b.type === 'fact' && b.documentId === doc.id && b.endLine > anchor.endLine) anchor = b;
    }
    const insert = ['', `## ${id}`, ...body, ''];
    const next = [...parsed.lines];
    next.splice(anchor.endLine, 0, ...insert);
    collapseWindow(next, anchor.endLine - 1, anchor.endLine + insert.length + 1);
    return next.join('\n');
  }

  const header = BLOCK_HEADERS[kind];
  if (!header) throw new PatchError(`Cannot append a block of kind "${kind}".`);
  const next = [...parsed.lines];
  while (next.length > 0 && next[next.length - 1].trim() === '') next.pop();
  next.push('', `# ${header}: ${id}`, ...(body.length > 0 ? ['', ...body] : []), '');
  return next.join('\n');
}

/**
 * Remove a block (its header through its last line). Facts under a document
 * are their own blocks — removing a document leaves its facts in place; the
 * canvas composes removals when it means the whole family.
 */
export function removeBlock(text: string, blockId: string): string {
  const parsed = parse(text);
  const block = findBlock(parsed, blockId);
  if (block === parsed.caseBlock) throw new PatchError('The case header block cannot be removed.');
  const endsWithNewline = text.endsWith('\n');
  const next = [...parsed.lines];
  const seam = block.startLine - 1;
  next.splice(seam, block.endLine - block.startLine + 1);
  collapseWindow(next, seam - 1, seam + 1);
  if (block.endLine >= parsed.lines.length - 1) {
    // The block reached the end of the file: re-establish the final newline.
    while (next.length > 0 && next[next.length - 1].trim() === '') next.pop();
    if (endsWithNewline) next.push('');
  }
  return next.join('\n');
}

/**
 * Collapse runs of blank lines into one, but only inside the index window a
 * splice touched — untouched regions keep their bytes.
 */
function collapseWindow(lines: string[], from: number, to: number): void {
  let i = Math.max(1, from);
  let end = Math.min(lines.length, to);
  while (i < end) {
    if (lines[i].trim() === '' && lines[i - 1].trim() === '') {
      lines.splice(i, 1);
      end -= 1;
    } else {
      i += 1;
    }
  }
  // A seam at the top of the file leaves no leading blank.
  if (from <= 0) while (lines.length > 0 && lines[0].trim() === '') lines.shift();
}
