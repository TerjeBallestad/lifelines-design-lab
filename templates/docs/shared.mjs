// TASK-916 — Shared doc-template helpers (design-lab paper bake).
//
// READ-ONLY consumers of the generator's labContent. Nothing here parses markdown
// or touches case-format.mjs / generate-tiny-olsen-case.mjs — templates take the
// already-built run list ({ text, factId? }) and emit letterhead-grade HTML.
//
// The bake loads the emitted HTML via a raw file:// goto (no dev server, no bundler)
// per the TASK-914 spike (scripts/blueprint/bake-spike.mjs). Fonts are therefore
// base64-embedded so the page is self-contained wherever it is written.

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
export const FONTS_DIR = join(HERE, 'fonts');

// ---------------------------------------------------------------------------
// Fonts — @font-face with base64 data: URIs (self-contained file:// page).
//   Fraunces-700 → titles/letterhead   Fraunces-400 → body   Caveat-400 → handwriting.
//   Mirrors desk_doc.tscn font roles in core-loop.
// ---------------------------------------------------------------------------
let _fontFaceCss = null;
function fontDataUri(file) {
  const bytes = readFileSync(join(FONTS_DIR, file));
  return `data:font/ttf;base64,${bytes.toString('base64')}`;
}

export function fontFaceCss() {
  if (_fontFaceCss != null) return _fontFaceCss;
  _fontFaceCss = `
@font-face {
  font-family: 'Fraunces';
  font-weight: 400;
  font-style: normal;
  src: url('${fontDataUri('Fraunces-400.ttf')}') format('truetype');
}
@font-face {
  font-family: 'Fraunces';
  font-weight: 700;
  font-style: normal;
  src: url('${fontDataUri('Fraunces-700.ttf')}') format('truetype');
}
@font-face {
  font-family: 'Caveat';
  font-weight: 400;
  font-style: normal;
  src: url('${fontDataUri('Caveat-400.ttf')}') format('truetype');
}
@font-face {
  font-family: 'Special Elite';
  font-weight: 400;
  font-style: normal;
  src: url('${fontDataUri('SpecialElite-400.ttf')}') format('truetype');
}
@font-face {
  font-family: 'Architects Daughter';
  font-weight: 400;
  font-style: normal;
  src: url('${fontDataUri('ArchitectsDaughter-400.ttf')}') format('truetype');
}
@font-face {
  font-family: 'Kalam';
  font-weight: 400;
  font-style: normal;
  src: url('${fontDataUri('Kalam-400.ttf')}') format('truetype');
}`;
  return _fontFaceCss;
}

// ---------------------------------------------------------------------------
// Run rendering. Fact-linked runs -> <span data-fact-id="..."> mirroring the
// BlueprintLab.tsx RunText pattern (which emits data-testid=blueprint-evidence-<id>;
// the bake needs data-fact-id for UV-rect measurement in Task 4). Plain runs -> text.
// Baked paper stays visually neutral for fact spans — the live game overlays lift
// highlights from the UV manifest; the attribute here is a measurement anchor only.
// ---------------------------------------------------------------------------
export function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// [icon=coin] is a rich-icon markup token (core-loop RichIcons grammar), not prose.
// Render it as a coin glyph so the ledger reads as money — copy stays verbatim.
function renderInlineTokens(escaped) {
  return escaped.replace(
    /\[icon=coin\]/g,
    '<span class="coin" aria-label="mynt">&#164;</span>',
  );
}

export function renderRuns(runs) {
  if (!Array.isArray(runs) || runs.length === 0) return '';
  return runs
    .map((run) => {
      const html = renderInlineTokens(escapeHtml(run.text));
      if (run.factId) {
        return `<span data-fact-id="${escapeHtml(run.factId)}">${html}</span>`;
      }
      return html;
    })
    .join('');
}

// ---------------------------------------------------------------------------
// Per-doc override hook (CAPABILITY only, unused in v1). A kind template renders
// every doc of its kind identically; this returns an extra body class + optional
// inline CSS/art selected by doc id, so bespoke per-doc treatment can be dropped in
// later without touching the kind templates. No bespoke art ships in v1 — the map
// is empty and every doc resolves to an empty override.
// ---------------------------------------------------------------------------
const DOC_OVERRIDES = Object.freeze({
  // doc_bekymring: { className: 'ov-bekymring', css: '...', art: '<svg .../>' },
});

export function overrideForDoc(docId) {
  const entry = DOC_OVERRIDES[docId];
  return {
    className: entry?.className ?? '',
    css: entry?.css ?? '',
    art: entry?.art ?? '',
  };
}

// ---------------------------------------------------------------------------
// Page shell. Per-kind physical formats (SB-427 probe: all-same-size killed paper
// identity — SB-411 verdict). Sizes are CSS px at the shared 800px-A4 scale, so
// pixels stay physically comparable across kinds: the core-loop desk maps
// bake-px → world units with ONE constant (DeskDoc BAKE_A4_WIDTH_PX). The bake
// screenshots fullPage at deviceScaleFactor 2–3. pageShell wraps a kind
// template's body fragment with the font-faces, shared paper base, the per-kind
// size CSS, the kind CSS, and any per-doc override CSS. body carries
// doc--<kindSlug> + the override class.
// ---------------------------------------------------------------------------
export const PAGE_WIDTH_PX = 800;
export const PAGE_MIN_HEIGHT_PX = 1131; // 800 × √2 ≈ A4 portrait.

// Per-kind sheet formats (SB-427 strong-variation scheme, Terje 2026-07-11).
// Height is a MINIMUM — a page grows if its content runs longer (fullPage bake).
export const KIND_SIZES = Object.freeze({
  BEKYMRINGSMELDING: { width: 800, minHeight: 1131 }, // A4 official form
  RAPPORT: { width: 800, minHeight: 1131 }, // A4 typed report
  DAGSRAPPORT: { width: 800, minHeight: 1131 }, // A4 stationery
  // Non-form kinds hug their content (round 2, Terje 2026-07-11: a tall min-height
  // with short content baked in a huge blank bottom — «not in a good way»). The
  // strip's identity is its NARROW WIDTH; height comes from the text.
  BREV: { width: 660, minHeight: 560 }, // A5-ish personal letter
  'ØKONOMISK OVERSIKT': { width: 560, minHeight: 620 }, // narrow ledger strip
  FELTNOTAT: { width: 640, minHeight: 460 }, // notepad index card
  MELDING: { width: 480, minHeight: 360 }, // phone-message lapp
});

export function sizeForKind(kind) {
  return KIND_SIZES[kind] ?? { width: PAGE_WIDTH_PX, minHeight: PAGE_MIN_HEIGHT_PX };
}

export function kindSlug(kind) {
  return String(kind)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/ø/g, 'o')
    .replace(/æ/g, 'ae')
    .replace(/å/g, 'a')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// Paper grain (SB-427 — sakskart «ALT ER PAPIR» vocabulary, SakskartSkinB
// grain_texture in core-loop): a tiny deterministic fractal-noise tile drawn ABOVE
// the ink at low alpha, exactly like the cork-board slips draw their grain wash
// over the stylebox fill. Inline SVG data URI so the page stays self-contained
// (file:// bake, no assets). feTurbulence with a fixed seed is deterministic for
// a given chromium build — the bake --check still holds on one host.
const GRAIN_SVG = encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96">` +
    `<filter id="g"><feTurbulence type="fractalNoise" baseFrequency="0.55" numOctaves="2" seed="421" stitchTiles="stitch"/>` +
    `<feColorMatrix type="matrix" values="0 0 0 0 0.13  0 0 0 0 0.10  0 0 0 0 0.06  0 0 0 0.55 0"/></filter>` +
    `<rect width="96" height="96" filter="url(#g)"/></svg>`,
);

// Paper ground (SDD-108 feel-gate): pages must read as paper under room light,
// not backlit white — the Godot desk material is unshaded and shows this verbatim.
// Base palette is the sakskart paper family (SakskartSkinB: paper #f2ecdd, ink
// #2b2620 — the SB-436-passed look); each kind template nudges --paper slightly
// for identity at desk-miniature scale (all stay in the #ea–#f4 warm family).
// Page width/min-height come from the per-kind size vars pageShell injects.
const BASE_CSS = `
:root {
  --paper: #f5f1e8;
  --ink: #2a2520;
  --ink-soft: #6b6259;
  --ink-faint: #a49a8c;
  --rule: #c9bda1;
  --rule-strong: #7d6f52;
  --warn: #c86244;
  --gold: #c89a2e;
}
* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; }
body {
  width: var(--page-w);
  min-height: var(--page-h);
  background: var(--paper);
  color: var(--ink);
  font-family: 'Fraunces', Georgia, 'Times New Roman', serif;
  font-size: 18px;
  line-height: 1.62;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}
/* Document-real margins (SDD-108 feel-gate): the mesh maps the texture
   edge-to-edge, so this padding IS the printed page's own margin. ~48px on an
   800px page ≈ a physical A4's ~15mm — content fills the sheet like a real
   letter, not a photocopy floating in whitespace. Kind templates must NOT
   override the .page rule itself; a small-format kind (SB-427) sets --page-pad
   to keep its margins physically proportional to its sheet. */
.page {
  width: var(--page-w);
  min-height: var(--page-h);
  padding: var(--page-pad, 40px 48px 48px);
  position: relative;
  /* Chunky ink frame (SB-427 round 3 — the one-desk-world wireframe's paper
     card grammar: every paper object carries a 2px ink border). Baked into the
     texture so desk face and reader page both wear it. */
  border: 2px solid var(--ink);
}
/* Sakskart paper wash: grain tile + edge shading ABOVE the ink (the cork-board
   slips draw their grain over the fill the same way). Kept faint so text stays
   print-crisp; the vignette pulls the sheet edges down like paper under a lamp,
   not a backlit scan. pointer-events irrelevant (static bake). */
.page::after {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(130% 105% at 50% 42%, transparent 62%, rgba(74, 58, 33, 0.10) 100%),
    url("data:image/svg+xml,${GRAIN_SVG}") repeat;
  opacity: 0.55;
}
/* Wireframe font roles (SB-427 round 3, 20260704_one_desk_world_probe.html):
   stamps = Architects Daughter letter-spaced, titles = Special Elite typewriter. */
.stamp {
  font-family: 'Architects Daughter', cursive;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  font-size: 12px;
  color: var(--ink-soft);
}
.kind-title {
  font-family: 'Special Elite', 'Courier New', monospace;
  font-weight: 400;
  letter-spacing: 0.04em;
}
.subtitle {
  font-family: 'Architects Daughter', cursive;
  color: var(--ink-soft);
}
.body-copy { font-weight: 400; }
.coin {
  font-family: 'Fraunces', Georgia, serif;
  font-weight: 700;
  color: #8a6a1f;
  padding: 0 0.05em;
}
/* Fact spans are measurement anchors — visually neutral on baked paper. */
[data-fact-id] { background: transparent; }
`;

export function pageShell({ kind, overrideClass = '', styleCss = '', overrideCss = '', bodyHtml }) {
  const slug = kindSlug(kind);
  const bodyClass = ['doc', `doc--${slug}`, overrideClass].filter(Boolean).join(' ');
  const size = sizeForKind(kind);
  const sizeCss = `:root { --page-w: ${size.width}px; --page-h: ${size.minHeight}px; }`;
  return `<!doctype html>
<html lang="nb">
<head>
<meta charset="utf-8" />
<title>${escapeHtml(kind)}</title>
<style>${fontFaceCss()}
${BASE_CSS}
${sizeCss}
${styleCss}
${overrideCss}</style>
</head>
<body class="${bodyClass}">
${bodyHtml}
</body>
</html>
`;
}
