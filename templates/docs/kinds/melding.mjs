// TASK-916 — MELDING kind template.
// Terse official hospital-to-office notice: boxed caption header, sparse serif body,
// institutional sender footer. Verbatim runs (innleggelse / dødsfall).

export const kind = 'MELDING';

export const styleCss = `
/* Hospital notice lapp (SB-427 round 3): wireframe kind-melding stock — dusty
   rose paper, red warning bar down the left edge, red kind caption, typewriter
   body. Compact spacing so the terse notice fills a small slip. */
.doc--melding { --paper: #efe6e0; --page-pad: 22px 26px 26px; }
.doc--melding .page { border-left: 6px solid var(--warn); }
.doc--melding .notice-head {
  text-align: center; border-top: 3px solid var(--ink);
  border-bottom: 3px solid var(--ink); padding: 10px 0 9px;
}
.doc--melding .notice-head h1 {
  margin: 0; font-size: 21px; letter-spacing: 0.22em; text-transform: uppercase;
  color: var(--warn);
}
.doc--melding .notice-head .stamp { display: block; margin-top: 6px; font-size: 10px; }
.doc--melding .notice-sub { text-align: center; margin: 8px 0 0; font-size: 14px; }
.doc--melding .notice-body {
  margin-top: 16px; font-size: 15px; line-height: 1.66;
  font-family: 'Special Elite', 'Courier New', monospace;
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
