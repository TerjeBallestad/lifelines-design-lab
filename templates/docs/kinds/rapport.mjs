// TASK-916 — RAPPORT kind template.
// Frank's typed home-visit report: formal typed letterhead, case strip, justified
// serif body, sign-off rule. More formal than the feltnotat. Verbatim runs.

export const kind = 'RAPPORT';

export const styleCss = `
/* Typed saksdokument — warm office cream, typewriter body (SB-427 round 3:
   wireframe font roles — Frank's report came off the office machine). */
.doc--rapport { --paper: #f0ede2; }
.doc--rapport .report-head {
  border-bottom: 2.5px solid var(--ink); padding-bottom: 12px;
}
.doc--rapport .report-head h1 {
  margin: 0; font-size: 28px; letter-spacing: 0.05em;
}
.doc--rapport .report-strip {
  display: flex; justify-content: space-between;
  margin-top: 8px; font-size: 11px;
}
.doc--rapport .report-strip .stamp { font-size: 11px; }
.doc--rapport .report-sub { margin: 16px 0 0; font-size: 16px; }
.doc--rapport .report-body {
  margin-top: 20px; font-size: 16px; line-height: 1.72;
  font-family: 'Special Elite', 'Courier New', monospace;
}
.doc--rapport .report-sign {
  margin-top: 34px; border-top: 1px solid var(--rule); padding-top: 10px; width: 52%;
}
.doc--rapport .report-sign .stamp { font-size: 11px; }
`;

export function render(ctx) {
  const { meta, title, runsHtml, art } = ctx;
  return `
<div class="page">
  ${art}
  <div class="report-head">
    <h1 class="kind-title">Rapport</h1>
    <div class="report-strip">
      <span class="stamp">${meta}</span>
      <span class="stamp">Saksdokument</span>
    </div>
  </div>
  <p class="report-sub subtitle">${title}</p>
  <div class="report-body body-copy">${runsHtml}</div>
  <div class="report-sign">
    <span class="stamp">Saksbehandler</span>
  </div>
</div>`;
}
