// TASK-916 — BREV kind template.
// Handwritten private letter (huseier's note is HÅNDSKREVET): letter layout with
// date/greeting flow, Caveat handwriting body, signature at the foot. Verbatim runs.

export const kind = 'BREV';

export const styleCss = `
.doc--brev .page {
  padding: 72px 84px 88px;
  background:
    radial-gradient(120% 80% at 50% 0%, rgba(255,255,255,0.35), transparent 60%),
    var(--paper);
}
.doc--brev .letter-meta {
  text-align: right; margin-bottom: 30px;
}
.doc--brev .letter-meta .stamp { font-size: 10px; display: block; }
.doc--brev .letter-body {
  font-family: 'Caveat', 'Fraunces', cursive;
  font-size: 30px;
  line-height: 1.5;
  color: #2a2016;
}
.doc--brev .letter-body [data-fact-id] { background: transparent; }
.doc--brev .letter-rule {
  margin: 34px 0 0; border: 0; border-top: 1px solid var(--rule);
  width: 46%; margin-left: auto;
}
.doc--brev .letter-foot {
  margin-top: 10px; text-align: right;
}
.doc--brev .letter-foot .stamp { font-size: 10px; }
`;

export function render(ctx) {
  const { meta, runsHtml, art } = ctx;
  return `
<div class="page">
  ${art}
  <div class="letter-meta">
    <span class="stamp">${meta}</span>
  </div>
  <div class="letter-body body-copy">${runsHtml}</div>
  <hr class="letter-rule" />
  <div class="letter-foot">
    <span class="stamp">Håndskrevet · levert i postkassen</span>
  </div>
</div>`;
}
