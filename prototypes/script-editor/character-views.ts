// SB-069: the Thoughts and Barks sub-views for a `.sim.md` buffer.
// Pure logic (pool grouping, variant cycling, heading parsing) lives up top
// so vitest covers it without a DOM; the lit-html templates below render the
// preview rail's in-game forms. Previews are lab-side sketches honest about
// shape — icon, text, speaker — not pixel-true Godot renders (doc-preview
// doctrine, SDD-130 §3).
import { html, nothing } from 'lit-html';
import type { TemplateResult } from 'lit-html';
import type { BarkPoolOut, ThoughtPoolOut } from '../../src/compiler/emit-character.ts';

// ---- pure logic ---------------------------------------------------------

/** The loader's icon fallback when a pool authors no Icon: line
 *  (emit-character.ts: omitted icon_key → icon_think). */
export const FALLBACK_ICON = 'icon_think';

/** The pool's identity string — matches the `# Thoughts:` header payload. */
export const thoughtPoolKey = (p: ThoughtPoolOut): string =>
  `${p.character}/${p.key_type}/${p.key}`;

/** `# Thoughts: <char>/<key_type>/<key>` header → its three parts, or null
 *  when the line is not a well-formed thoughts header. Mirrors the parser's
 *  split so the outline groups exactly what the compiler pools. */
export function parseThoughtHeader(
  raw: string,
): { character: string; keyType: string; key: string } | null {
  const rest = raw.match(/^# Thoughts:\s*(.+?)\s*(?:\/\/.*)?$/)?.[1];
  if (!rest) return null;
  const parts = rest.split('/');
  if (parts.length !== 3 || parts.some((p) => p.trim() === '')) return null;
  return { character: parts[0].trim(), keyType: parts[1].trim(), key: parts[2].trim() };
}

export interface ThoughtOutlineGroup {
  /** Group label parts — SDD-130 §3: pools group by character × key type. */
  character: string;
  keyType: string;
  items: Array<{ line: number; key: string }>;
}

/**
 * Group `# Thoughts:` heading lines by character × key type, in first-seen
 * order (the file's own order, not alphabetical — authoring order is the
 * author's rhythm). Malformed headers land in a trailing `?/?` group so
 * they stay reachable from the outline.
 */
export function groupThoughtHeadings(
  headings: Array<{ line: number }>,
  lineTextAt: (line: number) => string,
): ThoughtOutlineGroup[] {
  const groups: ThoughtOutlineGroup[] = [];
  const byKey = new Map<string, ThoughtOutlineGroup>();
  for (const h of headings) {
    const parsed = parseThoughtHeader(lineTextAt(h.line));
    const character = parsed?.character ?? '?';
    const keyType = parsed?.keyType ?? '?';
    const groupKey = `${character}/${keyType}`;
    let group = byKey.get(groupKey);
    if (!group) {
      group = { character, keyType, items: [] };
      byKey.set(groupKey, group);
      groups.push(group);
    }
    group.items.push({ line: h.line, key: parsed?.key ?? lineTextAt(h.line) });
  }
  return groups;
}

/** Advance a variant index one step, wrapping. Empty pools stay at 0. */
export const nextVariant = (current: number, count: number): number =>
  count <= 0 ? 0 : (current + 1) % count;

/** The variant a stored index lands on — modulo, so an index kept across a
 *  recompile stays valid when the pool shrinks. Null for an empty pool. */
export function variantAt(lines: string[], ix: number): { text: string; ix: number } | null {
  if (lines.length === 0) return null;
  const eff = ((ix % lines.length) + lines.length) % lines.length;
  return { text: lines[eff], ix: eff };
}

// ---- templates ----------------------------------------------------------

// The character sketch: a deliberately crude figure (head + shoulders) so
// the preview reads as "above a character in the apartment" without
// pretending to be game art.
const figure = (name: string) =>
  html`<div class="tv-figure">
    <div class="tv-figure-head"></div>
    <div class="tv-figure-body"></div>
    <div class="tv-figure-name">${name || '—'}</div>
  </div>`;

const stubChip = (stub: boolean | undefined) =>
  stub
    ? html`<span class="chip tv-stub-chip" title="Stub: yes — placeholder text, Terje rewrites"
        >stub</span
      >`
    : nothing;

const cycleControl = (shown: number, count: number, onCycle: () => void) =>
  html`<div class="tv-cycle">
    <button class="tv-cycle-btn" ?disabled=${count <= 1} @click=${onCycle}>Cycle variants</button>
    <span class="tv-cycle-count"
      >${count === 0 ? 'no variants' : `variant ${shown + 1} of ${count}`}</span
    >
  </div>`;

/**
 * Thoughts preview — both in-game forms (DD-031 superseding ruling: thoughts
 * keep the icon/text split): the icon-only bubble above the head, and the
 * TANKER text feed row. The cycle control steps through the pool's variants
 * so repetition rhythm can be read.
 */
export function thoughtPreview(
  pool: ThoughtPoolOut,
  variantIndex: number,
  onCycle: () => void,
): TemplateResult {
  const icon = pool.icon_key ?? FALLBACK_ICON;
  const fallback = pool.icon_key === undefined;
  const variant = variantAt(pool.lines, variantIndex);
  return html`<div class="surface-label">above the head — icon only ${stubChip(pool.stub)}</div>
    <div class="tv-stage">
      <div class="tv-bubble tv-thought">
        <span class="tv-icon" title=${fallback ? 'no Icon: line — loader falls back' : icon}
          >${icon}</span
        >${fallback ? html`<span class="tv-icon-fallback">fallback</span>` : nothing}
      </div>
      <div class="tv-dots"><span></span><span></span></div>
      ${figure(pool.character)}
    </div>
    <div class="surface-label">TANKER — text feed row</div>
    <div class="tv-feed-row">
      <span class="tv-feed-icon">${icon}</span>
      ${variant
        ? html`<span class="tv-feed-text">${variant.text}</span>`
        : html`<span class="tv-feed-text tv-feed-empty">no variants authored yet</span>`}
      <span class="tv-feed-meta">${pool.key_type}/${pool.key}</span>
    </div>
    ${cycleControl(variant?.ix ?? 0, pool.lines.length, onCycle)}`;
}

/**
 * Barks preview — one in-game form (DD-031 superseding ruling: spoken
 * channels render written text via `social_bark` above the head). The line
 * shows verbatim; the cycle control steps through the pool.
 */
export function barkPreview(
  pool: BarkPoolOut,
  variantIndex: number,
  onCycle: () => void,
): TemplateResult {
  const variant = variantAt(pool.lines, variantIndex);
  return html`<div class="surface-label">
      social_bark — spoken, rendered as text ${stubChip(pool.stub)}
    </div>
    <div class="tv-stage">
      ${variant
        ? html`<div class="tv-bubble tv-speech">${variant.text}</div>`
        : html`<div class="tv-bubble tv-speech tv-feed-empty">no variants authored yet</div>`}
      ${figure(pool.character)}
    </div>
    ${cycleControl(variant?.ix ?? 0, pool.lines.length, onCycle)}`;
}
