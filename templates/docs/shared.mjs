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
// Page shell. Fixed A4 aspect (800px wide × A4 min-height); the bake screenshots
// fullPage at deviceScaleFactor 2–3 → ~1600×2262. Wraps a kind template's body
// fragment with the font-faces, shared paper base, the kind CSS, and any per-doc
// override CSS. body carries doc--<kindSlug> + the override class.
// ---------------------------------------------------------------------------
export const PAGE_WIDTH_PX = 800;
export const PAGE_MIN_HEIGHT_PX = 1131; // 800 × √2 ≈ A4 portrait.

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

// Paper ground (SDD-108 feel-gate): pages must read as paper under room light,
// not backlit white — the Godot desk material is unshaded and shows this verbatim.
// Base is a dusky warm parchment; each kind template nudges --paper slightly for
// identity at desk-miniature scale (all stay in the #e0–#e9 family).
const BASE_CSS = `
:root {
  --paper: #e5decb;
  --ink: #211b13;
  --ink-soft: #4a4034;
  --ink-faint: #8a7d68;
  --rule: #c2b69c;
  --rule-strong: #7d6f52;
}
* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; }
body {
  width: ${PAGE_WIDTH_PX}px;
  min-height: ${PAGE_MIN_HEIGHT_PX}px;
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
   override .page padding; per-kind identity lives in letterheads/rules. */
.page {
  width: ${PAGE_WIDTH_PX}px;
  min-height: ${PAGE_MIN_HEIGHT_PX}px;
  padding: 40px 48px 48px;
}
.stamp {
  font-family: 'Fraunces', Georgia, serif;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  font-size: 12px;
  color: var(--ink-faint);
}
.kind-title {
  font-family: 'Fraunces', Georgia, serif;
  font-weight: 700;
  letter-spacing: 0.03em;
}
.subtitle {
  font-family: 'Fraunces', Georgia, serif;
  font-weight: 400;
  font-style: italic;
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
  return `<!doctype html>
<html lang="nb">
<head>
<meta charset="utf-8" />
<title>${escapeHtml(kind)}</title>
<style>${fontFaceCss()}
${BASE_CSS}
${styleCss}
${overrideCss}</style>
</head>
<body class="${bodyClass}">
${bodyHtml}
</body>
</html>
`;
}
