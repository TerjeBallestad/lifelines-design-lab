// SB-063 drawer — the source-block resolver: one playtest index entry → the
// authored lines that produce it. Pure string work over the case text, so
// the drawer never drags an editor stack in — it is a tweak surface, not a
// second script lens. The heading grammar mirrors shared/headings.ts plus
// the forms that module flattens (beat [id=…], conversation ids with ':',
// recipe pairs, event-delta ## sub-blocks).
import { callContactOf } from '../shared/weave-ids.ts';

export interface SourceBlock {
  /** 1-based, inclusive. */
  startLine: number;
  endLine: number;
  text: string;
}

const esc = (id: string) => id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** The line index (0-based) where the entry's block starts, or -1. */
function headLineOf(lines: string[], id: string, kind: string): number {
  const find = (re: RegExp) => lines.findIndex((line) => re.test(line));
  switch (kind) {
    case 'fact':
      return find(new RegExp(`^## ${esc(id)}\\b`));
    case 'document':
      return find(new RegExp(`^# Document: ${esc(id)}\\b`));
    case 'question':
      return find(new RegExp(`^# Question: ${esc(id)}\\b`));
    case 'hypothesis':
      return find(new RegExp(`^# Hypothesis: ${esc(id)}\\b`));
    case 'tiltak':
      return find(new RegExp(`^# Tiltak: ${esc(id)}\\b`));
    case 'dispatch':
      return find(new RegExp(`^# Dispatch: ${esc(id)}\\b`));
    case 'clock':
      return find(new RegExp(`^# Clock: ${esc(id)}\\b`));
    case 'proposal':
      return find(new RegExp(`^# Proposal: ${esc(id)}\\b`));
    case 'day_script_beat':
      return find(new RegExp(`^# Beat:.*\\[id=${esc(id)}\\]`));
    case 'recipe': {
      // The authored pair is unordered (ruling 1b) — match both ids anywhere
      // on one `# Recipe:` line.
      const pair = id.split(' + ');
      if (pair.length !== 2) return -1;
      const [a, b] = pair.map(esc);
      return find(new RegExp(`^# Recipe:(?=.*\\b${a}\\b)(?=.*\\b${b}\\b)`));
    }
    case 'conversation': {
      const contact = callContactOf(id);
      const convId = contact !== null ? id : 'chat:frank';
      return find(new RegExp(`^# Conversation: ${esc(convId)}\\b`));
    }
    case 'event_delta': {
      const packAt = find(/^# Event deltas\b/);
      if (packAt < 0) return -1;
      for (let i = packAt + 1; i < lines.length; i++) {
        if (/^# /.test(lines[i])) return -1; // pack ended, id not found
        if (new RegExp(`^## ${esc(id)}\\b`).test(lines[i])) return i;
      }
      return -1;
    }
  }
  return -1;
}

/** Where the block ends (0-based, inclusive): before the next heading. A ##
 *  sub-block (fact, event delta) also ends at the next `## `; a # block that
 *  owns sub-blocks (document, conversation) runs to the next `# `. */
function blockEnd(lines: string[], headAt: number): number {
  const sub = /^## /.test(lines[headAt]);
  for (let i = headAt + 1; i < lines.length; i++) {
    if (/^# /.test(lines[i]) || (sub && /^## /.test(lines[i]))) return i - 1;
  }
  return lines.length - 1;
}

export function findSourceBlock(caseText: string, id: string, kind: string): SourceBlock | null {
  const lines = caseText.split('\n');
  const headAt = headLineOf(lines, id, kind);
  if (headAt < 0) return null;
  const endAt = blockEnd(lines, headAt);
  return {
    startLine: headAt + 1,
    endLine: endAt + 1,
    text: lines.slice(headAt, endAt + 1).join('\n'),
  };
}

/** The full case text with the block's lines replaced by newBlockText. */
export function spliceSourceBlock(
  caseText: string,
  block: SourceBlock,
  newBlockText: string,
): string {
  const lines = caseText.split('\n');
  const before = lines.slice(0, block.startLine - 1);
  const after = lines.slice(block.endLine);
  return [...before, ...newBlockText.split('\n'), ...after].join('\n');
}
