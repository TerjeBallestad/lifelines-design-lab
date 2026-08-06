// SB-041 — shared symbol builder for the script lens. One owner: both the
// standalone script page and the canvas hybrid page derive the lens's
// autocomplete/hover/goto-def symbol table from a compile result + the
// heading index, through this function.
import type { CompileResult } from '../../src/compiler/index.ts';
import type { Heading, ScriptSymbol } from './lens.ts';

export function buildSymbols(
  result: CompileResult,
  headings: Heading[],
): Map<string, ScriptSymbol> {
  const map = new Map<string, ScriptSymbol>();
  const put = (id: string, kind: string, label: string) => {
    if (!id) return;
    map.set(id, { id, kind, label, defLine: null });
  };
  const lc = result.labContent;
  for (const [id, d] of Object.entries(lc.documents)) put(id, 'Document', d.title);
  for (const [id, f] of Object.entries(lc.facts))
    put(id, 'Fact', (f as { text?: string }).text ?? '');
  const s = result.slice as unknown as Record<string, Array<Record<string, unknown>>>;
  const pools: Array<[string, string]> = [
    ['questions', 'Question'],
    ['hypotheses', 'Hypothesis'],
    ['tiltak', 'Tiltak'],
    ['dispatches', 'Dispatch'],
    ['clocks', 'Clock'],
  ];
  for (const [pool, kind] of pools) {
    for (const n of s[pool] ?? []) {
      const id = n.id as string;
      const label = (n.title ?? n.label ?? n.question ?? '') as string;
      put(id, kind, label);
    }
  }
  for (const h of headings) {
    const existing = map.get(h.id);
    if (existing) existing.defLine = h.line;
    else if (h.id) map.set(h.id, { id: h.id, kind: h.kind, label: '', defLine: h.line });
  }
  return map;
}
