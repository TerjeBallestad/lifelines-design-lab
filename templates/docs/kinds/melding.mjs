// TASK-916 — MELDING kind template.
// Terse official hospital-to-office notice: boxed caption header, sparse serif body,
// institutional sender footer. Verbatim runs (innleggelse / dødsfall).

export const kind = 'MELDING';

export const styleCss = `
/* Institutional notice stock — pale grey-cream. Base padding, no override. */
.doc--melding { --paper: #e4e0d3; }
.doc--melding .notice-head {
  text-align: center; border-top: 3px solid var(--rule-strong);
  border-bottom: 3px solid var(--rule-strong); padding: 16px 0 14px;
}
.doc--melding .notice-head h1 {
  margin: 0; font-size: 24px; letter-spacing: 0.22em; text-transform: uppercase;
}
.doc--melding .notice-head .stamp { display: block; margin-top: 8px; font-size: 11px; }
.doc--melding .notice-sub { text-align: center; margin: 12px 0 0; font-size: 15px; }
.doc--melding .notice-body {
  margin-top: 34px; font-size: 18px; line-height: 1.72;
  max-width: 90%; margin-left: auto; margin-right: auto;
}
.doc--melding .notice-foot {
  margin-top: 46px; text-align: center;
  border-top: 1px solid var(--rule); padding-top: 12px;
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
