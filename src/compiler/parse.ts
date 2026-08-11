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
  | 'proposal'
  // SDD-130 sim-content families (grammar appendix in docs/markup-0.2-reference.md):
  // case file gains visit/strings; character `.sim.md` files carry the rest.
  | 'visit'
  | 'strings'
  | 'character'
  | 'thoughts'
  | 'barks'
  | 'phone';

/** Which source family a text belongs to (SDD-130 §1: two families, one language). */
export type SourceFamily = 'case' | 'character';

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

/**
 * A `- ` bullet under a thoughts/barks block (one text variant) or a visit
 * block (one ordered step, kept verbatim — the visit emitter parses the step
 * grammar; weave precedent: capture raw where order is semantic).
 */
export interface RawBullet {
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
  /** Thoughts/barks variants and visit steps (see RawBullet). */
  bullets?: RawBullet[];
  /** Thoughts only: the `<char>/<key_type>/<key>` header split. */
  thoughtKey?: { character: string; keyType: string; key: string };
}

export interface ParsedCase {
  caseBlock: RawBlock | null;
  blocks: RawBlock[];
}

export interface ParsedCharacter {
  characterBlock: RawBlock | null;
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

// Strings tables key on ids (`notat_intro: …`), not prose keys — wider charset,
// value kept verbatim (no ` · ` composite split).
const STRINGS_FIELD_RE = /^([A-Za-z0-9ÆØÅæøå_.-]+):\s?(.*)$/;

const BULLET_BLOCK_TYPES = new Set<BlockType>(['thoughts', 'barks', 'visit']);

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
  const { rootBlock, blocks } = parseSource(text, diag, 'case');
  return { caseBlock: rootBlock, blocks };
}

export function parseCharacterText(text: string, diag: DiagnosticBag): ParsedCharacter {
  const { rootBlock, blocks } = parseSource(text, diag, 'character');
  return { characterBlock: rootBlock, blocks };
}

function parseSource(
  text: string,
  diag: DiagnosticBag,
  family: SourceFamily,
): { rootBlock: RawBlock | null; blocks: RawBlock[] } {
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
    if (block.type === 'case' || block.type === 'character') caseBlock = block;
    else blocks.push(block);
    current = block;
    return block;
  };

  // One-token header ids (`# Visit: opp_alene`); malformed headers warn and
  // skip the block body, like the Beat/Recipe precedents.
  const openSimpleBlock = (
    type: BlockType,
    rest: string,
    lineNo: number,
    headerForm: string,
  ): boolean => {
    if (!/^\S+$/.test(rest)) {
      diag.add(
        codes.LINE_UNPARSED,
        'warning',
        `${headerForm} header takes one id token, got: "${rest}"`,
        span(lineNo),
        [rest],
      );
      skippingDeferredBlock = true;
      return false;
    }
    openBlock({
      type,
      id: rest,
      startLine: lineNo,
      endLine: lineNo,
      fields: [],
      effects: [],
      proseLines: [],
    });
    return true;
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
        if (family === 'character') {
          if (kind === 'Character') {
            openSimpleBlock('character', rest, lineNo, '# Character:');
            continue;
          }
          if (kind === 'Thoughts') {
            // `# Thoughts: <char>/<key_type>/<key>` — mirrors the ThoughtLine
            // .tres fields; `*` is the per-key_type wildcard.
            const path = rest.match(/^(\S+)\/(\S+)\/(\S+)$/);
            if (!path) {
              diag.add(
                codes.LINE_UNPARSED,
                'warning',
                `Thoughts header must be "# Thoughts: <char>/<key_type>/<key>", got: "${rest}"`,
                span(lineNo),
                [rest],
              );
              skippingDeferredBlock = true;
              continue;
            }
            openBlock({
              type: 'thoughts',
              id: rest,
              thoughtKey: { character: path[1], keyType: path[2], key: path[3] },
              startLine: lineNo,
              endLine: lineNo,
              fields: [],
              effects: [],
              proseLines: [],
            });
            continue;
          }
          if (kind === 'Barks') {
            openSimpleBlock('barks', rest, lineNo, '# Barks:');
            continue;
          }
          if (kind === 'Phone') {
            openSimpleBlock('phone', rest, lineNo, '# Phone:');
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
        if (kind === 'Visit') {
          // SDD-130: visit choreography — fields, then ordered `- ` step
          // bullets kept verbatim for the visit emitter.
          openSimpleBlock('visit', rest, lineNo, '# Visit:');
          continue;
        }
        if (kind === 'Strings') {
          openSimpleBlock('strings', rest, lineNo, '# Strings:');
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

      if (family === 'case' && header in SECTION_HEADERS) {
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

    if (BULLET_BLOCK_TYPES.has(block.type)) {
      const bullet = raw.match(/^-\s+(.*)$/);
      if (bullet) {
        (block.bullets ??= []).push({ text: bullet[1], line: lineNo });
        continue;
      }
    }

    if (block.type === 'strings') {
      const field = raw.match(STRINGS_FIELD_RE);
      if (field) {
        block.fields.push({ key: field[1], value: field[2].trim(), line: lineNo });
        continue;
      }
      diag.add(
        codes.LINE_UNPARSED,
        'warning',
        `Expected "key: value" line in strings ${block.id}, got: "${raw.trim()}"`,
        span(lineNo),
        [block.id],
      );
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
    if (family === 'case') {
      diag.add(
        codes.CASE_MISSING_HEADER,
        'error',
        'Expected a "# Case: <id>" header; compiling an empty case.',
        span(1),
        [],
      );
    } else {
      diag.add(
        codes.CHARACTER_MISSING_HEADER,
        'error',
        'Expected a "# Character: <id>" header; compiling empty character content.',
        span(1),
        [],
      );
    }
  }

  return { rootBlock: caseBlock, blocks };
}
