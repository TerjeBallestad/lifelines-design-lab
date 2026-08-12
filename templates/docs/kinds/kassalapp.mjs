// SDD-011 — KASSALAPP kind template.
// Narrow till receipt: typewriter throughout, sawtooth torn edges top and
// bottom. Ported from the design-canvas export (prototypes/paper-reference,
// sheet 1d) minus the canvas-only presentation — no rotate, no box-shadow,
// no wear layers. Everything printed arrives as authored labContent blocks;
// the shell (paper, torn edges, dashed segment rules) is the only chrome.
// This kind opts out of the shared .page ink border — the sawtooth edge
// would cut straight through it.

export const kind = 'KASSALAPP';

// The torn-paper silhouette from the reference export, kept verbatim.
const SAWTOOTH =
  'polygon(0 6px, 4% 0, 9% 6px, 15% 1px, 21% 6px, 27% 0, 33% 5px, 40% 1px, ' +
  '46% 6px, 53% 0, 60% 5px, 66% 1px, 73% 6px, 79% 0, 86% 5px, 92% 1px, ' +
  '100% 6px, 100% calc(100% - 6px), 95% 100%, 89% calc(100% - 5px), ' +
  '82% 100%, 75% calc(100% - 6px), 68% calc(100% - 1px), 61% calc(100% - 6px), ' +
  '54% 100%, 47% calc(100% - 5px), 40% calc(100% - 1px), 33% calc(100% - 6px), ' +
  '26% 100%, 19% calc(100% - 5px), 12% calc(100% - 1px), 6% calc(100% - 6px), 0 100%)';

export const styleCss = `
.doc--kassalapp { --paper: #f4f0e4; --page-pad: 26px 24px 30px; --coin-size: 16px; }
.doc--kassalapp .page {
  border: none;
  clip-path: ${SAWTOOTH};
  font-family: 'Special Elite', 'Courier New', monospace;
  font-size: 12.5px;
  line-height: 1.5;
  color: #33301f;
}
/* Receipt segments: every block after the first sits under a dashed rule,
   the way a till separates header, items, totals and footer. */
.doc--kassalapp .till-body > * + * {
  border-top: 1px dashed #7d7458;
  padding-top: 10px;
  margin-top: 10px;
}
.doc--kassalapp .para { margin-bottom: 0; text-align: center; }
.doc--kassalapp .doc-table { font-size: 12.5px; }
.doc--kassalapp .doc-table th, .doc--kassalapp .doc-table td { padding: 2px 6px; }
.doc--kassalapp .doc-table thead th { border-top: none; border-bottom: none; }
/* Receipt tables are headerless (no separator row in the markup), so the
   authored align array stays left — the till always right-aligns its
   amount column. */
.doc--kassalapp .doc-table td:last-child { text-align: right; }
`;

export function render(ctx) {
  const { runsHtml, art } = ctx;
  return `
<div class="page">
  ${art}
  <div class="till-body body-copy">${runsHtml}</div>
</div>`;
}
