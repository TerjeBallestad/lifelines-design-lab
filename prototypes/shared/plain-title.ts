// SB-061 review: the one-line display scrub for authored markup, shared by
// the canvas graph and the playtest index so both lenses show the same
// residue for the same authored line. Fact anchors drop to their anchor text
// first (an anchor may carry an icon token inside), then [icon=coin] renders
// as ¤ (mockup 1a) and the other icon tokens drop.
export function plainTitle(text: string): string {
  return text
    .replace(/\[([^\]]*)\]\(fact:[^)]*\)/g, '$1')
    .replace(/\[icon=coin\]/g, '¤')
    .replace(/\[icon=[^\]]+\]/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}
