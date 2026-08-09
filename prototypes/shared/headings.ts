// The section index over raw markup lines — the shared vocabulary between
// the script lens (folding/jump), the canvas cross-jump, and the outline.
// Lives here (not in lens.ts) so a pure-string consumer never drags the
// CodeMirror stack into its bundle.

export interface Heading {
  line: number; // 1-based
  endLine: number;
  kind: string; // Document, Question, … or Fact for ##
  id: string;
}

/** Section index over raw markup lines — pages feed the result to update(). */
export function indexHeadings(lines: string[]): Heading[] {
  const hs: Heading[] = [];
  lines.forEach((line, i) => {
    let m = line.match(/^# ([A-Za-z]+)[^:]*:? *([\wæøåÆØÅ_.-]*)/);
    if (m) {
      hs.push({ line: i + 1, endLine: lines.length, kind: m[1], id: m[2] ?? '' });
      return;
    }
    m = line.match(/^## ([\wæøåÆØÅ_.-]+)/);
    if (m) hs.push({ line: i + 1, endLine: lines.length, kind: 'Fact', id: m[1] });
  });
  hs.forEach((h, i) => {
    if (i + 1 < hs.length) h.endLine = hs[i + 1].line - 1;
  });
  return hs;
}
