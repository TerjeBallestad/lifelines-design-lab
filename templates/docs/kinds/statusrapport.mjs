// SB-030 — STATUSRAPPORT kind template.
// Frank's typed day-8 status note: same office machine as the RAPPORT (typewriter
// body, saksdokument strip) but a terse follow-up on a compact half-sheet — the
// full A4 rapport format would bake a huge blank bottom under three paragraphs
// (SB-427 round 2 verdict). Verbatim runs.

export const kind = 'STATUSRAPPORT';

export const styleCss = `
/* Typed status memo — office cream a shade duller than the rapport's (same
   warm #ea–#f4 family), compact half-sheet padding. */
.doc--statusrapport { --paper: #ece7d8; --page-pad: 28px 36px 36px; }
.doc--statusrapport .status-head {
  border-bottom: 2px solid var(--ink); padding-bottom: 9px;
}
.doc--statusrapport .status-head h1 {
  margin: 0; font-size: 22px; letter-spacing: 0.05em;
}
.doc--statusrapport .status-strip {
  display: flex; justify-content: space-between;
  margin-top: 6px; font-size: 10px;
}
.doc--statusrapport .status-strip .stamp { font-size: 10px; }
.doc--statusrapport .status-body {
  margin-top: 16px; font-size: 15px; line-height: 1.68;
  font-family: 'Special Elite', 'Courier New', monospace;
}
`;

export function render(ctx) {
  const { meta, title, runsHtml, art } = ctx;
  return `
<div class="page">
  ${art}
  <div class="status-head">
    <h1 class="kind-title">${title}</h1>
    <div class="status-strip">
      <span class="stamp">${meta}</span>
    </div>
  </div>
  <div class="status-body body-copy">${runsHtml}</div>
</div>`;
}
