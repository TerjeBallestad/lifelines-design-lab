// TASK-916 — BEKYMRINGSMELDING kind template.
// Municipal concern-notice form: boxed kommune letterhead, ruled field header,
// serif body, signature block. Consumes labContent runs verbatim.

export const kind = 'BEKYMRINGSMELDING';

export const styleCss = `
/* Municipal form stock — dry, slightly yellowed. Page padding comes from the
   shared base (document-real margins, SDD-108 feel-gate); do not override. */
.doc--bekymringsmelding { --paper: #e3dcc4; }
.doc--bekymringsmelding .letterhead {
  border: 2.5px solid var(--rule-strong);
  padding: 18px 22px 16px;
}
.doc--bekymringsmelding .letterhead .org {
  display: flex; justify-content: space-between; align-items: baseline;
  border-bottom: 1px solid var(--rule);
  padding-bottom: 10px; margin-bottom: 12px;
}
.doc--bekymringsmelding .letterhead .org .stamp { font-size: 11px; }
.doc--bekymringsmelding .form-kind {
  font-size: 30px; line-height: 1.05; margin: 0;
}
.doc--bekymringsmelding .form-sub {
  margin: 4px 0 0; font-size: 15px;
}
.doc--bekymringsmelding .fields {
  display: grid; grid-template-columns: max-content 1fr;
  gap: 6px 16px; margin: 22px 0 6px;
  font-size: 14px;
}
.doc--bekymringsmelding .fields .label {
  font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;
  color: var(--ink-faint); align-self: end; font-size: 12px;
}
.doc--bekymringsmelding .fields .value {
  border-bottom: 1px solid var(--rule); padding-bottom: 3px;
}
.doc--bekymringsmelding .body-copy {
  margin-top: 26px; font-size: 18px; text-align: justify;
}
.doc--bekymringsmelding .sign {
  margin-top: 40px; border-top: 1px solid var(--rule);
  padding-top: 12px; width: 58%;
}
.doc--bekymringsmelding .sign .stamp { font-size: 11px; }
`;

export function render(ctx) {
  const { meta, title, runsHtml, art } = ctx;
  return `
<div class="page">
  ${art}
  <div class="letterhead">
    <div class="org">
      <span class="stamp">Oslo kommune · Sosialtjenesten</span>
      <span class="stamp">Bekymringsmelding</span>
    </div>
    <h1 class="form-kind kind-title">Bekymringsmelding</h1>
    <p class="form-sub subtitle">${title}</p>
    <div class="fields">
      <span class="label">Avsender</span><span class="value">${meta}</span>
    </div>
  </div>
  <div class="body-copy">${runsHtml}</div>
  <div class="sign">
    <span class="stamp">Underskrift · fastlege</span>
  </div>
</div>`;
}
