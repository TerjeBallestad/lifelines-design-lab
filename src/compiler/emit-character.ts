// Character-family emitter (SDD-130 §2): raw `.sim.md` blocks → the
// per-character sim-content object written to
// resources/characters/source/<id>_sim_content.json.

import type { DiagnosticBag } from './diagnostics.ts';
import { codes } from './diagnostics.ts';
import {
  FieldMap,
  blockSpan,
  readStubMarker,
  stripGuillemets,
  warnLeftovers,
} from './emit-shared.ts';
import type { ParsedCharacter, RawBlock } from './parse.ts';

/** One `# Thoughts:` pool — mirrors the ThoughtLine .tres fields. */
export interface ThoughtPoolOut {
  character: string;
  key_type: string;
  key: string;
  lines: string[];
  /** Omitted when unauthored — the loader falls back to icon_think. */
  icon_key?: string;
  stub?: true;
}

/** The `# Barks:` ambient pool (replaces conversation_manager BARK_TEXTS). */
export interface BarkPoolOut {
  character: string;
  lines: string[];
  stub?: true;
}

/** The `# Phone:` answer/close pair (replaces phone_call_director consts). */
export interface PhoneLinesOut {
  character: string;
  answer: string;
  close: string;
  stub?: true;
}

export interface CharacterContent {
  id: string;
  thoughts: ThoughtPoolOut[];
  /** Omitted when the file authors no `# Barks:` block (sparse-field law). */
  barks?: BarkPoolOut;
  /** Omitted when the file authors no `# Phone:` block (sparse-field law). */
  phone?: PhoneLinesOut;
}

/**
 * ThoughtLine.KEY_TYPES (core-loop scripts/simulation/thought_line.gd).
 * `ambient` is the SB-072 MTG-fold pool: its bullets are ICON KEYS, not
 * prose — ThoughtBubbleManager picks one per ambient tick; the stream's
 * trigger map never fires it.
 */
const THOUGHT_KEY_TYPES = new Set([
  'need',
  'activity',
  'aversion',
  'want',
  'relational',
  'dagsform',
  'ambient',
]);

export function emitCharacter(
  parsed: ParsedCharacter,
  diag: DiagnosticBag,
): { content: CharacterContent } {
  const id = parsed.characterBlock?.id ?? '';
  const thoughts: ThoughtPoolOut[] = [];
  let barks: BarkPoolOut | undefined;
  let phone: PhoneLinesOut | undefined;

  const seenIds = new Map<string, RawBlock>();
  const checkDuplicate = (block: RawBlock): boolean => {
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
      return true;
    }
    seenIds.set(key, block);
    return false;
  };

  // A `.sim.md` file carries one character's content: blocks naming another
  // character warn and emit nothing (the sibling file owns them).
  const checkOwner = (block: RawBlock, character: string): boolean => {
    if (!id || character === id) return false;
    diag.add(
      codes.LINE_UNPARSED,
      'warning',
      `${block.type} block for "${character}" in ${id}.sim.md — author it in ${character}'s own file; the block emits nothing.`,
      blockSpan(block),
      [block.id],
    );
    return true;
  };

  const bulletTexts = (block: RawBlock): string[] => {
    const lines = (block.bullets ?? []).map((bullet) => bullet.text);
    if (lines.length === 0) {
      diag.add(
        codes.FIELD_MISSING,
        'warning',
        `${block.type} ${block.id} has no "- " variant bullets.`,
        blockSpan(block),
        [block.id],
      );
    }
    return lines;
  };

  for (const block of parsed.blocks) {
    if (checkDuplicate(block)) continue;

    if (block.type === 'thoughts') {
      const key = block.thoughtKey;
      if (!key) continue;
      if (key.character === 'frank') {
        diag.add(
          codes.THOUGHTS_FRANK_EXCLUDED,
          'advisory',
          `Frank never thinks (SDD-110 #10) — "# Thoughts: ${block.id}" emits nothing.`,
          blockSpan(block),
          [block.id],
        );
        continue;
      }
      if (checkOwner(block, key.character)) continue;
      if (!THOUGHT_KEY_TYPES.has(key.keyType)) {
        diag.add(
          codes.LINE_UNPARSED,
          'warning',
          `Unknown thought key_type "${key.keyType}" (ThoughtLine takes ${[...THOUGHT_KEY_TYPES].join('/')}); the pool emits nothing.`,
          blockSpan(block),
          [block.id],
        );
        continue;
      }
      const fields = new FieldMap(block.fields);
      const icon = fields.find('Icon');
      thoughts.push({
        character: key.character,
        key_type: key.keyType,
        key: key.key,
        lines: bulletTexts(block),
        ...(icon?.value ? { icon_key: icon.value } : {}),
        ...(readStubMarker(fields.find('Stub'), block.id, diag) ? { stub: true as const } : {}),
      });
      warnLeftovers(fields, diag, block.id);
      continue;
    }

    if (block.type === 'barks') {
      if (checkOwner(block, block.id)) continue;
      const fields = new FieldMap(block.fields);
      barks = {
        character: block.id,
        lines: bulletTexts(block),
        ...(readStubMarker(fields.find('Stub'), block.id, diag) ? { stub: true as const } : {}),
      };
      warnLeftovers(fields, diag, block.id);
      continue;
    }

    if (block.type === 'phone') {
      if (checkOwner(block, block.id)) continue;
      const fields = new FieldMap(block.fields);
      const answer = fields.find('Answer');
      const close = fields.find('Close');
      for (const [name, field] of [
        ['Answer', answer],
        ['Close', close],
      ] as const) {
        if (!field) {
          diag.add(
            codes.FIELD_MISSING,
            'warning',
            `Phone ${block.id} has no ${name}: line.`,
            blockSpan(block),
            [block.id],
          );
        }
      }
      phone = {
        character: block.id,
        answer: answer ? stripGuillemets(answer.value) : '',
        close: close ? stripGuillemets(close.value) : '',
        ...(readStubMarker(fields.find('Stub'), block.id, diag) ? { stub: true as const } : {}),
      };
      warnLeftovers(fields, diag, block.id);
      continue;
    }
  }

  const content: CharacterContent = {
    id,
    thoughts,
    ...(barks ? { barks } : {}),
    ...(phone ? { phone } : {}),
  };
  return { content };
}
