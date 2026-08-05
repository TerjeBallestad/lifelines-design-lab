// Block parser for Kildeverket markup 0.2 (with 0.1 compat reads).
// Produces a raw block model; emit.ts binds fields and builds the slice.

import type { DiagnosticBag } from './diagnostics.ts';
import { codes, span } from './diagnostics.ts';

export type BlockType =
  | 'case'
  | 'document'
  | 'fact'
  | 'question'
  | 'hypothesis'
  | 'tiltak'
  | 'dispatch'
  | 'clock'
  | 'beat'
  | 'event-delta'
  | 'conversation'
  | 'recipe'
  | 'proposal';

export interface RawField {
  key: string;
  value: string;
  line: number;
}

export interface RawEffect {
  body: string;
  line: number;
}

export interface RawProse {
  text: string;
  line: number;
}

export interface RawBlock {
  type: BlockType;
  id: string;
  startLine: number;
  endLine: number;
  fields: RawField[];
  effects: RawEffect[];
  proseLines: RawProse[];
  /** Beats only. */
  day?: number;
  /** Bracket payload on the header line, e.g. `# Beat: day 5 [id=beat_grete_d5]`. */
  headerMeta?: Record<string, string>;
  /** Facts declared under a `# Document:` block inherit it as source. */
  documentId?: string;
  /** Recipes only: the sorted unordered pair from the header (ruling 1b). */
  pair?: [string, string];
}

export interface ParsedCase {
  caseBlock: RawBlock | null;
  blocks: RawBlock[];
}

const ENTITY_HEADERS: Record<string, BlockType> = {
  Document: 'document',
  Question: 'question',
  Hypothesis: 'hypothesis',
  Tiltak: 'tiltak',
  Dispatch: 'dispatch',
  Clock: 'clock',
};

const SECTION_HEADERS: Record<string, BlockType | 'beat-section'> = {
  Facts: 'fact',
  Questions: 'question',
  Hypotheses: 'hypothesis',
  Tiltak: 'tiltak',
  Dispatches: 'dispatch',
  Clocks: 'clock',
  'Event deltas': 'event-delta',
  'Day script beats': 'beat-section',
};

// Keys that may follow a ` · ` separator on a composite field line
// (e.g. `Kind: BREV · Register: formell`, `Slot: s2 · Cost: 2 · Weight: normal`).
const COMPOSITE_FOLLOW_KEYS = /^(Register|Category|Cost|Weight|Bad|Delay|Duration|Occupies):\s/;

const FIELD_RE = /^([A-Za-zÆØÅæøå][A-Za-zÆØÅæøå ]*?):\s?(.*)$/;

function stripComment(line: string): string {
  if (/^\s*\/\//.test(line)) return '';
  return line.replace(/\s+\/\/.*$/, '');
}

export function parseHeaderMeta(payload: string): Record<string, string> {
  const meta: Record<string, string> = {};
  for (const part of payload.trim().split(/\s+/)) {
    if (!part) continue;
    const eq = part.indexOf('=');
    if (eq > 0) meta[part.slice(0, eq)] = part.slice(eq + 1);
  }
  return meta;
}

function splitCompositeFieldLine(line: string): string[] {
  const segments = line.split(' · ');
  const parts: string[] = [];
  let current = segments[0];
  for (const segment of segments.slice(1)) {
    if (COMPOSITE_FOLLOW_KEYS.test(segment)) {
      parts.push(current);
      current = segment;
    } else {
      current += ' · ' + segment;
    }
  }
  parts.push(current);
  return parts;
}

export function parseCaseText(text: string, diag: DiagnosticBag): ParsedCase {
  const lines = text.replace(/\r\n/g, '\n').split('\n');
  const blocks: RawBlock[] = [];
  let caseBlock: RawBlock | null = null;

  let current: RawBlock | null = null;
  let documentContext: RawBlock | null = null;
  let sectionContext: BlockType | 'beat-section' | null = null;
  let documentPhase: 'fields' | 'prose' = 'fields';
  let skippingDeferredBlock = false;

  const closeCurrent = (lineNo: number): void => {
    if (current) current.endLine = Math.max(current.startLine, lineNo);
    current = null;
  };

  const openBlock = (block: RawBlock): RawBlock => {
    if (block.type === 'case') caseBlock = block;
    else blocks.push(block);
    current = block;
    return block;
  };

  for (let i = 0; i < lines.length; i += 1) {
    const lineNo = i + 1;
    const raw = stripComment(lines[i]);

    const todo = raw.match(/^\s*TODO:\s?(.*)$/);
    if (todo) {
      const owner = (current as RawBlock | null)?.id ?? '';
      diag.add(codes.TODO_LINE, 'info', `TODO: ${todo[1]}`, span(lineNo), [owner]);
      continue;
    }

    const header = raw.match(/^#\s+(.+)$/) && !raw.startsWith('## ') ? raw.slice(1).trim() : null;
    if (header !== null && raw.startsWith('# ')) {
      closeCurrent(lineNo - 1);
      documentContext = null;
      sectionContext = null;
      skippingDeferredBlock = false;
      documentPhase = 'fields';

      const typed = header.match(/^([A-Za-zÆØÅæøå ]+?):\s*(.*)$/);
      if (typed) {
        const kind = typed[1].trim();
        const rest = typed[2].trim();
        if (kind === 'Case') {
          openBlock({
            type: 'case',
            id: rest,
            startLine: lineNo,
            endLine: lineNo,
            fields: [],
            effects: [],
            proseLines: [],
          });
          continue;
        }
        if (kind === 'Beat') {
          const beat = rest.match(/^day\s+(\d+)\s*(?:\[([^\]]*)\])?\s*$/);
          if (!beat) {
            diag.add(
              codes.LINE_UNPARSED,
              'warning',
              `Beat header must be "# Beat: day N [id=…]", got: "${rest}"`,
              span(lineNo),
              [],
            );
            skippingDeferredBlock = true;
            continue;
          }
          const meta = beat[2] ? parseHeaderMeta(beat[2]) : {};
          openBlock({
            type: 'beat',
            id: meta.id ?? `beat_d${beat[1]}`,
            day: Number(beat[1]),
            headerMeta: meta,
            startLine: lineNo,
            endLine: lineNo,
            fields: [],
            effects: [],
            proseLines: [],
          });
          continue;
        }
        if (kind === 'Conversation') {
          // §8 weave — the body is captured verbatim (indentation is
          // semantic) and parsed by weave.ts.
          openBlock({
            type: 'conversation',
            id: rest,
            startLine: lineNo,
            endLine: lineNo,
            fields: [],
            effects: [],
            proseLines: [],
          });
          continue;
        }
        if (kind in ENTITY_HEADERS) {
          const block = openBlock({
            type: ENTITY_HEADERS[kind],
            id: rest,
            startLine: lineNo,
            endLine: lineNo,
            fields: [],
            effects: [],
            proseLines: [],
          });
          if (block.type === 'document') {
            documentContext = block;
            documentPhase = 'fields';
          }
          continue;
        }
        if (kind === 'Recipe') {
          // Ruling 1b: `# Recipe: f_a + f_b` — the pair is unordered; the
          // compiler sorts it for identity (duplicate detection in emit.ts).
          const pairMatch = rest.match(/^(\S+)\s*\+\s*(\S+)$/);
          if (!pairMatch) {
            diag.add(
              codes.LINE_UNPARSED,
              'warning',
              `Recipe header must be "# Recipe: f_a + f_b", got: "${rest}"`,
              span(lineNo),
              [rest],
            );
            skippingDeferredBlock = true;
            continue;
          }
          if (pairMatch[1] === pairMatch[2]) {
            diag.add(
              codes.LINE_UNPARSED,
              'warning',
              `A recipe pair must be two distinct fact ids, got "${rest}"; the block is skipped.`,
              span(lineNo),
              [pairMatch[1]],
            );
            skippingDeferredBlock = true;
            continue;
          }
          const pair = [pairMatch[1], pairMatch[2]].sort() as [string, string];
          openBlock({
            type: 'recipe',
            id: `${pair[0]} + ${pair[1]}`,
            pair,
            startLine: lineNo,
            endLine: lineNo,
            fields: [],
            effects: [],
            proseLines: [],
          });
          continue;
        }
        if (kind === 'Proposal') {
          // SB-028 ruling A: the header key is the handbok slug
          // (`# Proposal: matlevering`); facts live in a `Relevant:` body
          // field. Duplicate slugs are errors (ruling D — emit.ts's shared
          // duplicate check reports them).
          if (!/^\S+$/.test(rest)) {
            diag.add(
              codes.LINE_UNPARSED,
              'warning',
              `Proposal header must be "# Proposal: <handbok_slug>" (one token), got: "${rest}"`,
              span(lineNo),
              [rest],
            );
            skippingDeferredBlock = true;
            continue;
          }
          openBlock({
            type: 'proposal',
            id: rest,
            startLine: lineNo,
            endLine: lineNo,
            fields: [],
            effects: [],
            proseLines: [],
          });
          continue;
        }
        diag.add(
          codes.BLOCK_UNKNOWN,
          'warning',
          `Unknown block header: "# ${header}"`,
          span(lineNo),
          [],
        );
        skippingDeferredBlock = true;
        continue;
      }

      if (header in SECTION_HEADERS) {
        sectionContext = SECTION_HEADERS[header];
        continue;
      }
      diag.add(
        codes.BLOCK_UNKNOWN,
        'warning',
        `Unknown section header: "# ${header}"`,
        span(lineNo),
        [],
      );
      skippingDeferredBlock = true;
      continue;
    }

    if (skippingDeferredBlock) continue;

    // Conversation bodies are weave, not fields: keep every line verbatim
    // (including `##`-looking lines) for weave.ts.
    if (current !== null && (current as RawBlock).type === 'conversation') {
      const block: RawBlock = current;
      if (raw.trim() !== '') block.endLine = lineNo;
      block.proseLines.push({ text: raw, line: lineNo });
      continue;
    }

    const sub = raw.match(/^##\s+(\S+)\s*$/);
    if (sub) {
      closeCurrent(lineNo - 1);
      let type: BlockType = 'fact';
      if (!documentContext && sectionContext && sectionContext !== 'beat-section') {
        type = sectionContext;
      }
      openBlock({
        type,
        id: sub[1],
        startLine: lineNo,
        endLine: lineNo,
        fields: [],
        effects: [],
        proseLines: [],
        ...(documentContext ? { documentId: documentContext.id } : {}),
      });
      continue;
    }

    // Non-header content line.
    if (!current) {
      if (raw.trim() === '' || raw.trim() === 'None') continue;
      diag.add(
        codes.LINE_UNPARSED,
        'warning',
        `Line outside any block: "${raw.trim()}"`,
        span(lineNo),
        [],
      );
      continue;
    }

    const block: RawBlock = current;
    block.endLine = lineNo;

    // Document prose phase: keep everything verbatim (incl. blank lines).
    if (block.type === 'document' && documentPhase === 'prose' && documentContext === block) {
      block.proseLines.push({ text: raw, line: lineNo });
      continue;
    }

    if (raw.trim() === '') {
      // A blank line ends the document metadata block — but only once at
      // least one field has been read, so a blank line directly under the
      // header (prettier's markdown style, and the 0.1 file) stays in the
      // field phase.
      if (block.type === 'document' && documentContext === block && block.fields.length > 0) {
        documentPhase = 'prose';
      }
      continue;
    }

    if (raw.trim() === 'None') continue;

    const effect = raw.match(/^~\s+(.*)$/);
    if (effect) {
      block.effects.push({ body: effect[1], line: lineNo });
      continue;
    }

    if (block.type === 'beat') {
      block.proseLines.push({ text: raw, line: lineNo });
      continue;
    }

    const fieldParts = splitCompositeFieldLine(raw);
    let parsedAll = true;
    const parsed: RawField[] = [];
    for (const part of fieldParts) {
      const field = part.match(FIELD_RE);
      if (!field) {
        parsedAll = false;
        break;
      }
      parsed.push({ key: field[1].trim(), value: field[2].trim(), line: lineNo });
    }
    if (parsedAll && parsed.length > 0) {
      block.fields.push(...parsed);
      continue;
    }

    diag.add(
      codes.LINE_UNPARSED,
      'warning',
      `Expected "Key: value" or "~ effect" line in ${block.type} ${block.id}, got: "${raw.trim()}"`,
      span(lineNo),
      [block.id],
    );
  }

  closeCurrent(lines.length);

  if (!caseBlock) {
    diag.add(
      codes.CASE_MISSING_HEADER,
      'error',
      'Expected a "# Case: <id>" header; compiling an empty case.',
      span(1),
      [],
    );
  }

  return { caseBlock, blocks };
}
