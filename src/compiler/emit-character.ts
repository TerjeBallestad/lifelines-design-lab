// Character-family emitter (SDD-130 §2): raw `.sim.md` blocks → the
// per-character sim-content object written to
// resources/characters/source/<id>_sim_content.json.

import type { DiagnosticBag } from './diagnostics.ts';
import { codes, span } from './diagnostics.ts';
import type { ParsedCharacter, RawBlock } from './parse.ts';

/** One `# Thoughts:` pool — mirrors the ThoughtLine .tres fields. */
export interface ThoughtPoolOut {
  character: string;
  key_type: string;
  key: string;
  lines: string[];
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

function blockSpan(block: RawBlock): { startLine: number; endLine: number } {
  return span(block.startLine, block.endLine);
}

export function emitCharacter(
  parsed: ParsedCharacter,
  diag: DiagnosticBag,
): { content: CharacterContent } {
  const id = parsed.characterBlock?.id ?? '';
  const content: CharacterContent = { id, thoughts: [] };

  for (const block of parsed.blocks) {
    if (block.type === 'thoughts' && block.thoughtKey?.character === 'frank') {
      diag.add(
        codes.THOUGHTS_FRANK_EXCLUDED,
        'advisory',
        `Frank never thinks (SDD-110 #10) — "# Thoughts: ${block.id}" emits nothing.`,
        blockSpan(block),
        [block.id],
      );
    }
  }

  return { content };
}
