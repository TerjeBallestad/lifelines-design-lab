// TASK-916 — ØKONOMISK OVERSIKT kind template.
// Ledger stationery: accounting-sheet ruled body, monospace-flavoured coin glyphs,
// column-rule down the sheet. Consumes labContent runs verbatim.

export const kind = 'ØKONOMISK OVERSIKT';

export const styleCss = `
/* Ledger strip (SB-427 round 3): wireframe kind-konto stock — cool blue-grey
   accounting sheet, typewriter figures. */
.doc--okonomisk-oversikt { --paper: #e9edf2; --page-pad: 34px 34px 40px; }
.doc--okonomisk-oversikt .ledger-head {
  display: flex; justify-content: space-between; align-items: flex-end;
  border-bottom: 3px double var(--ink);
  padding-bottom: 10px;
}
.doc--okonomisk-oversikt .ledger-head h1 {
  margin: 0; font-size: 26px; letter-spacing: 0.06em;
}
.doc--okonomisk-oversikt .ledger-head .stamp { font-size: 11px; text-align: right; max-width: 44%; }
.doc--okonomisk-oversikt .ledger-sub {
  margin: 8px 0 0; font-size: 15px;
}
.doc--okonomisk-oversikt .ledger-body {
  margin-top: 26px;
  font-size: 15px;
  line-height: 2.2;
  font-family: 'Special Elite', 'Courier New', monospace;
  /* faint ruled accounting lines behind the figures, red margin rule */
  background-image: repeating-linear-gradient(
    to bottom,
    transparent 0,
    transparent calc(2.2em - 1px),
    #b9c2cf calc(2.2em - 1px),
    #b9c2cf 2.2em
  );
  padding-left: 26px;
  border-left: 2px solid var(--warn);
}
.doc--okonomisk-oversikt .coin {
  font-family: 'Special Elite', 'Courier New', monospace;
  font-size: 0.94em; color: #7c5e17;
}
.doc--okonomisk-oversikt .ledger-foot {
  margin-top: 30px; border-top: 1px solid var(--rule); padding-top: 10px;
}
`;

export function render(ctx) {
  const { meta, title, runsHtml, art } = ctx;
  return `
<div class="page">
  ${art}
  <div class="ledger-head">
    <h1 class="kind-title">Økonomisk oversikt</h1>
    <span class="stamp">${meta}</span>
  </div>
  <p class="ledger-sub subtitle">${title}</p>
  <div class="ledger-body body-copy">${runsHtml}</div>
  <div class="ledger-foot">
    <span class="stamp">Gjennomgått · sosialkontoret</span>
  </div>
</div>`;
}
