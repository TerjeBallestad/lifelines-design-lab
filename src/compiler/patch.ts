// Markup patch layer (SB-031, DD-003): the canvas edits the .case.md text by
// minimal patches — the markup stays the store. Every function is pure:
// (text, …) → new text. Each call reparses, so patches compose by chaining.
// Untouched lines are never reformatted; a no-op patch is byte-identical.

import type { RawBlock, BlockType } from './parse.ts';
import { parseCaseText, parseCharacterText } from './parse.ts';
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
  // SDD-130 sim-content blocks (PLAN-006): visit/strings in case files,
  // thoughts/barks/phone in character `.sim.md` files.
  visit: 'Visit',
  strings: 'Strings',
  thoughts: 'Thoughts',
  barks: 'Barks',
  phone: 'Phone',
};

/** Minimal body templates per kind, used by appendBlock when none is given. */
export const DEFAULT_TEMPLATES: Partial<Record<BlockType, string>> = {
  document: 'Kind: RAPPORT · Register: notat\nTitle: \nPeek: \nMeta: ',
  fact: 'Label: \nSummary: \nCategory: \nSupports: ',
  question: 'Title: \nTeaser: \nwhen: ',
  hypothesis: 'Title: \nSummary: \nQuestion: \nneeds: \nOpens: ',
  tiltak: 'Title: \nSlot: s1 · Cost: 0\nDescription: \nSim hook: ',
  dispatch:
    'Title: \nSim hook: \nDescription: \nActivity: \nChannel: now · Delay: 0m · Duration: 1h · Occupies: 1h\nReception: 0\ngate: ',
  clock: 'Label: \nSim hook: \nQuestion: \nGood:  / 4 · Bad:  / 4',
  proposal: 'Relevant: \nLine: ',
  visit: 'Title: \nBlurb: \nOffer: \nUnlocks: \nStub: yes',
  strings: 'Stub: yes',
  thoughts: 'Icon: \nStub: yes',
  barks: 'Stub: yes',
  phone: 'Answer: \nClose: \nStub: yes',
};

// Mirrors parse.ts exactly: which keys may follow a ` · ` separator, and the
// `Key: value` line shape. Keep in sync — a drift here mispatches lines.
const COMPOSITE_FOLLOW_KEYS = /^(Register|Category|Cost|Weight|Bad|Delay|Duration|Occupies):\s/;
const FIELD_RE = /^([A-Za-zÆØÅæøå][A-Za-zÆØÅæøå ]*?):\s?(.*)$/;
const STRINGS_FIELD_RE = /^([A-Za-z0-9ÆØÅæøå_.-]+):\s?(.*)$/;

const BULLET_BLOCK_TYPES = new Set<BlockType>(['thoughts', 'barks', 'visit']);

interface Parsed {
  lines: string[];
  caseBlock: RawBlock | null;
  blocks: RawBlock[];
}

function parse(text: string): Parsed {
  // Family sniff: only character `.sim.md` files open with `# Character:`
  // (a case file with that header is a block-unknown warning, never valid),
  // so the header decides which parser reads the text.
  if (/^#\s+Character:/m.test(text)) {
    const { characterBlock, blocks } = parseCharacterText(text, new DiagnosticBag());
    return { lines: text.split('\n'), caseBlock: characterBlock, blocks };
  }
  const { caseBlock, blocks } = parseCaseText(text, new DiagnosticBag());
  return { lines: text.split('\n'), caseBlock, blocks };
}

function findBlock(parsed: Parsed, blockId: string, kind?: BlockType): RawBlock {
  // Character files reuse the character id across kinds (`# Barks: elling`,
  // `# Phone: elling`, the root) — `kind` disambiguates; without it the root
  // and then the first block win (the case-family ids are unique anyway).
  if (kind === undefined && parsed.caseBlock?.id === blockId) return parsed.caseBlock;
  const found = parsed.blocks.find(
    (b) => b.id === blockId && (kind === undefined || b.type === kind),
  );
  if (!found) {
    throw new PatchError(
      kind === undefined
        ? `No block with id "${blockId}".`
        : `No ${kind} block with id "${blockId}".`,
    );
  }
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
function locateValue(line: string, key: string, blockType?: BlockType): ValueSpan | null {
  let content = line.endsWith('\r') ? line.slice(0, -1) : line;
  if (/^\s*\/\//.test(content)) return null;
  const comment = content.match(/\s+\/\/.*$/);
  if (comment) content = content.slice(0, comment.index);

  // Strings tables key on ids with no composite ` · ` splitting (parse.ts):
  // locate the value with the same one-key-per-line rule.
  if (blockType === 'strings') {
    const m = content.match(STRINGS_FIELD_RE);
    if (!m || m[1] !== key) return null;
    const valueStart = content.length - m[2].length;
    return { start: valueStart, end: content.length, raw: m[2] };
  }

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
export function patchField(
  text: string,
  blockId: string,
  key: string,
  value: string,
  kind?: BlockType,
): string {
  const parsed = parse(text);
  const block = findBlock(parsed, blockId, kind);
  assertFieldBearing(block);
  const field = findField(block, key);
  if (!field) {
    const at = fieldInsertLine(block);
    const next = [...parsed.lines];
    next.splice(at, 0, `${key}: ${value}`);
    return next.join('\n');
  }
  const span = locateValue(parsed.lines[field.line - 1], key, block.type);
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
export function listFieldAdd(
  text: string,
  blockId: string,
  key: string,
  entry: string,
  kind?: BlockType,
): string {
  const parsed = parse(text);
  const block = findBlock(parsed, blockId, kind);
  assertFieldBearing(block);
  const field = findField(block, key);
  if (!field) {
    const at = fieldInsertLine(block);
    const next = [...parsed.lines];
    next.splice(at, 0, `${key}: ${entry}`);
    return next.join('\n');
  }
  const span = locateValue(parsed.lines[field.line - 1], key, block.type);
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
export function listFieldRemove(
  text: string,
  blockId: string,
  key: string,
  entry: string,
  kind?: BlockType,
): string {
  const parsed = parse(text);
  const block = findBlock(parsed, blockId, kind);
  assertFieldBearing(block);
  const field = findField(block, key);
  if (!field) return text;
  const span = locateValue(parsed.lines[field.line - 1], key, block.type);
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
 * Append a new block. An entity kind goes after the last block of the same
 * kind as `# <Header>: <id>` (SB-052 — new entries land with their siblings),
 * or at the end of the file when the kind has no block yet. A fact goes at
 * the end of its parent document's span as `## <id>` (opts.documentId is
 * required). Duplicate ids throw.
 */
export function appendBlock(
  text: string,
  kind: BlockType,
  id: string,
  opts: AppendBlockOptions = {},
): string {
  const parsed = parse(text);
  // Same-kind scope, mirroring the compiler's `type:id` duplicate key — a
  // character file legitimately reuses its id across barks/phone/root.
  if (parsed.blocks.some((b) => b.type === kind && b.id === id)) {
    throw new PatchError(`A ${kind} block with id "${id}" already exists.`);
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

  // Insert after the last sibling of the same kind. A document anchors past
  // its contiguous fact run so the new document never splits a family.
  let anchor: RawBlock | null = null;
  for (const b of parsed.blocks) {
    if (b.type === kind && (!anchor || b.endLine > anchor.endLine)) anchor = b;
  }
  if (anchor && kind === 'document') {
    const docId = anchor.id;
    for (const b of parsed.blocks) {
      if (b.type === 'fact' && b.documentId === docId && b.endLine > anchor.endLine) {
        anchor = b;
      }
    }
  }
  if (anchor) {
    const insert = ['', `# ${header}: ${id}`, ...(body.length > 0 ? ['', ...body] : []), ''];
    const next = [...parsed.lines];
    next.splice(anchor.endLine, 0, ...insert);
    collapseWindow(next, anchor.endLine - 1, anchor.endLine + insert.length + 1);
    return next.join('\n');
  }

  const next = [...parsed.lines];
  while (next.length > 0 && next[next.length - 1].trim() === '') next.pop();
  next.push('', `# ${header}: ${id}`, ...(body.length > 0 ? ['', ...body] : []), '');
  return next.join('\n');
}

/**
 * SB-043 select-to-lift: a document passage becomes a fact stub. Strips
 * `[text](fact:id)` anchors down to their text (a human quoting the document
 * writes the prose, not the markup), collapses whitespace, and drops
 * surrounding «» so they never double.
 */
function normalizeQuote(raw: string): string {
  return raw
    .replace(/\[([^\]]*)\]\(fact:[\wæøåÆØÅ_.-]+\)/g, '$1')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^«/, '')
    .replace(/»$/, '')
    .trim();
}

export interface LiftFactResult {
  /** The patched markup. */
  text: string;
  /** The new fact's id (`f_ny`, `f_ny2`, …). */
  id: string;
  /** 1-based line of the stub's `Label:` line — where focus goes next. */
  labelLine: number;
}

/**
 * Lift a selected passage from a document into a fact stub (SB-043, SB-040
 * ruling 3): append a `## f_x` block at the end of the document's fact run
 * with Quote pre-filled from the passage. The placement under the document IS
 * the source wiring — a ## fact inherits its document (no `Source:` line).
 */
export function liftFact(text: string, documentId: string, quote: string): LiftFactResult {
  const clean = normalizeQuote(quote);
  if (clean === '') throw new PatchError('Nothing to lift — the selection is empty.');
  const parsed = parse(text);
  const taken = new Set(parsed.blocks.map((b) => b.id));
  if (parsed.caseBlock) taken.add(parsed.caseBlock.id);
  let id = 'f_ny';
  for (let n = 2; taken.has(id); n += 1) id = `f_ny${n}`;
  const template = `${DEFAULT_TEMPLATES.fact}\nQuote: «${clean}»`;
  const next = appendBlock(text, 'fact', id, { documentId, template });
  const label = parse(next)
    .blocks.find((b) => b.id === id)
    ?.fields.find((f) => f.key === 'Label');
  if (!label) throw new PatchError(`Lifted ${id} but its Label line did not parse.`);
  return { text: next, id, labelLine: label.line };
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

function findBulletBlock(parsed: Parsed, blockId: string, kind?: BlockType): RawBlock {
  if (kind !== undefined && !BULLET_BLOCK_TYPES.has(kind)) {
    throw new PatchError(`A ${kind} block carries no "- " bullets.`);
  }
  const block =
    kind !== undefined
      ? findBlock(parsed, blockId, kind)
      : (parsed.blocks.find((b) => b.id === blockId && BULLET_BLOCK_TYPES.has(b.type)) ??
        findBlock(parsed, blockId));
  if (!BULLET_BLOCK_TYPES.has(block.type)) {
    throw new PatchError(`Block "${blockId}" is a ${block.type}; it carries no "- " bullets.`);
  }
  return block;
}

function bulletAt(block: RawBlock, index: number) {
  const bullets = block.bullets ?? [];
  const bullet = bullets[index];
  if (!bullet) {
    throw new PatchError(`Block "${block.id}" has ${bullets.length} bullet(s); no index ${index}.`);
  }
  return bullet;
}

/**
 * Append one `- ` bullet (a thoughts/barks variant or a visit step) at the
 * end of the block's bullet run — after the last bullet, or after the last
 * field/header when the block has none yet. Bullet text is kept verbatim.
 */
export function bulletAdd(text: string, blockId: string, entry: string, kind?: BlockType): string {
  const parsed = parse(text);
  const block = findBulletBlock(parsed, blockId, kind);
  const bullets = block.bullets ?? [];
  const next = [...parsed.lines];
  if (bullets.length > 0) {
    next.splice(bullets[bullets.length - 1].line, 0, `- ${entry}`);
    return next.join('\n');
  }
  const at = fieldInsertLine(block);
  next.splice(at, 0, '', `- ${entry}`);
  return next.join('\n');
}

/**
 * Replace the bullet at `index` (0-based, block order). Only that one line
 * changes; an edit to the current text is a byte no-op.
 */
export function bulletEdit(
  text: string,
  blockId: string,
  index: number,
  entry: string,
  kind?: BlockType,
): string {
  const parsed = parse(text);
  const block = findBulletBlock(parsed, blockId, kind);
  const bullet = bulletAt(block, index);
  if (bullet.text === entry) return text;
  const next = [...parsed.lines];
  const line = next[bullet.line - 1];
  const start = line.indexOf('- ');
  next[bullet.line - 1] = `${line.slice(0, start)}- ${entry}`;
  return next.join('\n');
}

/** Remove the bullet at `index` (0-based). Only that one line disappears. */
export function bulletRemove(
  text: string,
  blockId: string,
  index: number,
  kind?: BlockType,
): string {
  const parsed = parse(text);
  const block = findBulletBlock(parsed, blockId, kind);
  const bullet = bulletAt(block, index);
  const next = [...parsed.lines];
  next.splice(bullet.line - 1, 1);
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
