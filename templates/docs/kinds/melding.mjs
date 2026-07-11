// TASK-916 — MELDING kind template.
// Terse official hospital-to-office notice: boxed caption header, sparse serif body,
// institutional sender footer. Verbatim runs (innleggelse / dødsfall).

export const kind = 'MELDING';

export const styleCss = `
/* Institutional notice stock — pale grey-cream. Base padding, no override.
   SB-427 lapp format (480×360 min): compact spacing so the terse notice fills a
   small slip instead of floating on A4 air. */
.doc--melding { --paper: #eee9dc; --page-pad: 22px 26px 26px; }
.doc--melding .notice-head {
  text-align: center; border-top: 3px solid var(--rule-strong);
  border-bottom: 3px solid var(--rule-strong); padding: 10px 0 9px;
}
.doc--melding .notice-head h1 {
  margin: 0; font-size: 21px; letter-spacing: 0.22em; text-transform: uppercase;
}
.doc--melding .notice-head .stamp { display: block; margin-top: 6px; font-size: 10px; }
.doc--melding .notice-sub { text-align: center; margin: 8px 0 0; font-size: 14px; }
.doc--melding .notice-body {
  margin-top: 16px; font-size: 17px; line-height: 1.62;
  max-width: 94%; margin-left: auto; margin-right: auto;
}
.doc--melding .notice-foot {
  margin-top: 20px; text-align: center;
  border-top: 1px solid var(--rule); padding-top: 9px;
}
.doc--melding .notice-foot .stamp { font-size: 11px; }
`;

export function render(ctx) {
  const { meta, title, runsHtml, art } = ctx;
  return `
<div class="page">
  ${art}
  <div class="notice-head">
    <h1 class="kind-title">Melding</h1>
    <span class="stamp">${meta}</span>
  </div>
  <p class="notice-sub subtitle">${title}</p>
  <div class="notice-body body-copy">${runsHtml}</div>
  <div class="notice-foot">
    <span class="stamp">Sosialmedisinsk enhet · OUS</span>
  </div>
</div>`;
}
