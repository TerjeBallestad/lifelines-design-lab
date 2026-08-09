// TASK-916 — BEKYMRINGSMELDING kind template.
// Municipal concern notice, stripped chrome: authored title, authored meta,
// typewriter body. Consumes labContent runs verbatim.

export const kind = 'BEKYMRINGSMELDING';

export const styleCss = `
/* Municipal form stock — dry, slightly yellowed; typewriter body (SB-427
   round 3, wireframe font roles). Page padding comes from the shared base
   (document-real margins, SDD-108 feel-gate); do not override. */
.doc--bekymringsmelding { --paper: #ede5cd; }
.doc--bekymringsmelding .form-kind {
  font-size: 30px; line-height: 1.05; margin: 0;
}
.doc--bekymringsmelding .form-meta {
  display: block; margin-top: 10px;
  border-bottom: 1px solid var(--rule); padding-bottom: 8px;
}
.doc--bekymringsmelding .body-copy {
  margin-top: 26px; font-size: 16px; line-height: 1.72;
  font-family: 'Special Elite', 'Courier New', monospace;
}
`;

export function render(ctx) {
  const { meta, title, runsHtml, art } = ctx;
  return `
<div class="page">
  ${art}
  <h1 class="form-kind kind-title">${title}</h1>
  <span class="stamp form-meta">${meta}</span>
  <div class="body-copy">${runsHtml}</div>
</div>`;
}
