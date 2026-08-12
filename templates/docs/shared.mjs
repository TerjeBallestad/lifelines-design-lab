// TASK-916 — Shared doc-template helpers (design-lab paper bake).
//
// READ-ONLY consumers of the generator's labContent. Nothing here parses markdown
// or touches case-format.mjs / generate-tiny-olsen-case.mjs — templates take the
// already-built run list ({ text, factId? }) and emit letterhead-grade HTML.
//
// The bake loads the emitted HTML via a raw file:// goto (no dev server, no bundler)
// per the TASK-914 spike (scripts/blueprint/bake-spike.mjs). Fonts are therefore
// base64-embedded so the page is self-contained wherever it is written.

// Fonts moved to fonts-node.mjs (node:fs) so this module stays importable in
// the browser (script-editor preview). The bake path passes fontCss into
// pageShell explicitly; a browser caller passes url()-based @font-face CSS.

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

// The shipped coin sprite, vendored from core-loop
// (assets/sprites/ui/coin.aseprite, 16x16 RGB) and kept beside this file at
// templates/docs/icons/coin.png. Inlined as a data URI, like the bake's fonts,
// so the emitted page stays self-contained under a file:// goto. Re-vendor by
// re-exporting the .aseprite frame to PNG and re-encoding it here — and keep
// --coin-size equal to the source's native pixel size (see .coin below).
const COIN_PNG =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAUdJ' +
  'REFUOI2NkzFLw1AUhb9UaalEaCgtZAsiGcTNqZuLIkL/iWAXu7Zdu1jBX9FVkKBLxy4OBadiS4aC0FDiEAKtQxzCC+' +
  '+lr8UDDy6He86993GvgQadVj/R8b1B28hzCiGEN3fXBPORkrieLvn8qmwZGbK4+/jAeDYhmI+onVwC7DQSJoYsfnl/' +
  'AqB5dZ/FsrDk1rdMCiJhPJvsFAN8145YT5cAmRHAQafVT+SZQ8rEoa+I/TAC4Dj+ZVFIqJSLVJMVZ26zW2AP/DDi43' +
  'WDHcQ4lqnN0RqIio5lUm1slDH+ZWAHcRY7lknJreOHkcLvNchXEmPocKgj8/Ne3BaBtAvHMtNuRAe9Qdvwnt+UxRGx' +
  'jPV0mRnbQby9BwtvmAkX3hA/jJQnIMfkV7naSGctufVsafL/Ildn1zGdn/5oP2zvMemM8tCd8x9AIa1uFsX1BwAAAA' +
  'BJRU5ErkJggg==';

// [icon=coin] is a rich-icon markup token (core-loop RichIcons grammar), not prose.
// Render it as the game's own coin sprite so the ledger reads as money and the
// paper matches the desk — copy stays verbatim.
function renderInlineTokens(escaped) {
  return escaped
    .replace(/\[icon=coin\]/g, `<img class="coin" src="${COIN_PNG}" alt="mynt">`)
    .replace(/\n/g, '<br>'); // labContent keeps authored single line breaks
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
// Block rendering (SDD-011). One shared renderer for both consumers — the
// bake (render-doc.mjs buildDocHtml) and the script-editor preview
// (prototypes/shared/doc-preview.ts) — so a table draws identically on the
// baked texture and in the editor. `type: 'para'` keeps the historical
// `<p class="para">` byte-for-byte; `type: 'table'` draws a ruled table with
// per-column alignment from the block's align array. Cells render through
// renderRuns, so a [data-fact-id] span inside a <td> still yields line-box
// rects for the UV manifest.
// ---------------------------------------------------------------------------
function renderTableBlock(block) {
  const align = block.align ?? [];
  const cellHtml = (tag, runs, column) =>
    `<${tag}${align[column] === 'right' ? ' class="cell-right"' : ''}>${renderRuns(runs)}</${tag}>`;
  const head = block.header?.length
    ? `<thead><tr>${block.header.map((cell, i) => cellHtml('th', cell, i)).join('')}</tr></thead>`
    : '';
  const body = `<tbody>${(block.rows ?? [])
    .map((row) => `<tr>${row.map((cell, i) => cellHtml('td', cell, i)).join('')}</tr>`)
    .join('')}</tbody>`;
  return `<table class="doc-table">${head}${body}</table>`;
}

export function renderBlocks(blocks) {
  return (blocks ?? [])
    .map((block) =>
      block.type === 'table'
        ? renderTableBlock(block)
        : `<p class="para">${renderRuns(block.runs)}</p>`,
    )
    .join('\n');
}

// ---------------------------------------------------------------------------
// Per-doc override hook. A kind template renders every doc of its kind
// identically; this returns an extra body class + optional inline CSS/art
// selected by doc id, so bespoke per-doc treatment lands without touching the
// kind templates.
//
// SDD-011 wear (Terje 2026-08-12): the raw economy papers carry per-sheet
// wear — folds, stains, and INSTITUTIONAL stamps (KOPI, UBETALT), ported from
// the design canvas. Frank's handwritten commentary (the Caveat margin notes,
// the ballpoint circle) never prints: it bleeds the answers the player must
// derive from the printed figures. Wear layers sit ABOVE the ink like the
// shared grain wash; stamps rotate — the page itself stays axis-aligned.
// ---------------------------------------------------------------------------
const WEAR_LAYER = (background) =>
  `<div class="wear" style="position: absolute; inset: 0; pointer-events: none; background-image: ${background};"></div>`;

const STAMP = (text, style) =>
  `<div class="doc-stamp" style="position: absolute; border-radius: 3px; pointer-events: none; ` +
  `font-family: 'Archivo', sans-serif; font-weight: 700; ${style}">${text}</div>`;

const DOC_OVERRIDES = Object.freeze({
  // 1a — Grete's statement: handled copy. Top-right stain, horizontal fold,
  // diagonal crease, and the bank's KOPI stamp.
  doc_konto_grete: {
    className: 'ov-konto-grete',
    art:
      WEAR_LAYER(
        'radial-gradient(ellipse 120px 90px at 78% 8%, rgba(120,80,30,0.18), rgba(120,80,30,0.05) 55%, transparent 70%), ' +
          'radial-gradient(ellipse 80px 65px at 82% 6%, transparent 60%, rgba(110,70,25,0.22) 68%, transparent 75%), ' +
          'linear-gradient(to bottom, transparent 49.7%, rgba(70,55,30,0.16) 50%, rgba(255,255,255,0.25) 50.3%, transparent 50.8%), ' +
          'linear-gradient(105deg, transparent 32.7%, rgba(70,55,30,0.10) 33%, rgba(255,255,255,0.18) 33.2%, transparent 33.6%)',
      ) +
      STAMP(
        'KOPI',
        'top: 200px; right: 320px; transform: rotate(-11deg); border: 4px double rgba(140,40,30,0.55); ' +
          'color: rgba(140,40,30,0.55); font-size: 26px; letter-spacing: 5px; padding: 6px 20px;',
      ),
  },
  // 1b — Elling's årsutskrift: one fold, a stain along the bottom edge. The
  // canvas's circle and margin note are Frank's commentary — excluded.
  doc_konto_elling: {
    className: 'ov-konto-elling',
    art: WEAR_LAYER(
      'linear-gradient(to bottom, transparent 49.7%, rgba(70,55,30,0.14) 50%, rgba(255,255,255,0.22) 50.3%, transparent 50.8%), ' +
        'radial-gradient(ellipse 160px 55px at 50% 99%, rgba(80,60,30,0.12), transparent 70%)',
    ),
  },
  // 1c — the strømregning: letter-fold thirds, a stain at the left edge, and
  // the UBETALT stamp.
  doc_strom: {
    className: 'ov-strom',
    art:
      WEAR_LAYER(
        'linear-gradient(to bottom, transparent 33%, rgba(70,55,30,0.13) 33.3%, rgba(255,255,255,0.22) 33.6%, transparent 34%), ' +
          'linear-gradient(to bottom, transparent 66%, rgba(70,55,30,0.13) 66.3%, rgba(255,255,255,0.22) 66.6%, transparent 67%), ' +
          'radial-gradient(ellipse 95px 80px at 8% 40%, rgba(110,75,30,0.14), transparent 70%)',
      ) +
      STAMP(
        'UBETALT',
        'top: 640px; right: 40px; transform: rotate(8deg); border: 4px double rgba(160,45,30,0.6); ' +
          'color: rgba(160,45,30,0.6); font-size: 23px; letter-spacing: 4px; padding: 6px 18px;',
      ),
  },
  // 1d — the kassalapp: a crease where it lay folded in the shoebox, a
  // finger stain near the top edge.
  doc_kassalapp: {
    className: 'ov-kassalapp',
    art: WEAR_LAYER(
      'linear-gradient(to bottom, transparent 39.5%, rgba(70,55,30,0.13) 40%, rgba(255,255,255,0.2) 40.4%, transparent 41%), ' +
        'radial-gradient(ellipse 50px 35px at 88% 20%, rgba(110,75,30,0.13), transparent 70%)',
    ),
  },
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
  FELTNOTAT: { width: 640, minHeight: 460 }, // notepad index card
  STATUSRAPPORT: { width: 700, minHeight: 400 }, // typed half-sheet status memo
  MELDING: { width: 480, minHeight: 360 }, // phone-message lapp
  // SDD-011 raw economy papers: full-A4 bank statements and invoice, a
  // narrow till strip.
  KONTOUTSKRIFT: { width: 800, minHeight: 1131 },
  REGNING: { width: 800, minHeight: 1131 },
  KASSALAPP: { width: 300, minHeight: 620 },
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
/* One .para per authored paragraph (labContent block). */
.para { margin: 0 0 0.85em; }
.para:last-child { margin-bottom: 0; }
/* Shared table form (SDD-011): collapsed borders, a rule above and below the
   header, per-cell padding, right alignment from the authored align array.
   Deliberately neutral — a kind template restyles rules/weights per paper. */
.doc-table {
  width: 100%;
  border-collapse: collapse;
  margin: 0 0 0.85em;
}
.doc-table:last-child { margin-bottom: 0; }
.doc-table th, .doc-table td {
  padding: 0.14em 0.6em;
  text-align: left;
  vertical-align: baseline;
}
.doc-table th:first-child, .doc-table td:first-child { padding-left: 0; }
.doc-table th:last-child, .doc-table td:last-child { padding-right: 0; }
.doc-table thead th {
  border-top: 1.5px solid var(--rule-strong);
  border-bottom: 1.5px solid var(--rule-strong);
}
.doc-table .cell-right { text-align: right; }
/* Coin sprite, drawn nearest-neighbour so it stays pixel-crisp. --coin-size is
   the source PNG's native 16px, which makes every device scale a whole
   multiple: 1:1 in the preview, 2x at deviceScaleFactor 2, 3x at the bake's 3.
   A size that is not a whole multiple of the source hands some source pixels 2
   device pixels and their neighbours 1 — a visibly lopsided rim, worst at
   deviceScaleFactor 1. A kind template nudges --coin-size rather than setting
   width/height, and any value it picks must stay a whole multiple of 16.

   The coin follows a numeral ("22 [icon=coin]"), so it centres on the FIGURE
   height, not the x-height that vertical-align: middle would use — cap height
   runs ~0.7em across the doc faces, so 0.35em is its midpoint above the
   baseline. vertical-align shifts the image's bottom edge, hence the
   half-coin subtraction. */
:root { --coin-size: 16px; }
.coin {
  display: inline-block;
  width: var(--coin-size);
  height: var(--coin-size);
  vertical-align: calc(0.35em - var(--coin-size) / 2);
  margin: 0 0.06em;
  image-rendering: crisp-edges;
  image-rendering: pixelated;
}
/* Fact spans are measurement anchors — visually neutral on baked paper. */
[data-fact-id] { background: transparent; }
`;

export function pageShell({
  kind,
  overrideClass = '',
  styleCss = '',
  overrideCss = '',
  bodyHtml,
  fontCss = '',
}) {
  const slug = kindSlug(kind);
  const bodyClass = ['doc', `doc--${slug}`, overrideClass].filter(Boolean).join(' ');
  const size = sizeForKind(kind);
  const sizeCss = `:root { --page-w: ${size.width}px; --page-h: ${size.minHeight}px; }`;
  return `<!doctype html>
<html lang="nb">
<head>
<meta charset="utf-8" />
<title>${escapeHtml(kind)}</title>
<style>${fontCss}
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
