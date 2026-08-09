// TASK-916 — DAGSRAPPORT stationery template.
// Gym-synthesized kind (not in tiny-olsen.case.md; desk_dossier_gym._make_synth
// emits it — core-loop desk_dossier_gym.gd:202/231). Renders EMPTY content: a blank
// daily-report letterhead + ruled writing area. Task 4 bakes it to
// stationery_dagsrapport.png. No runs are consumed.

export const kind = 'DAGSRAPPORT';

export const styleCss = `
/* Office form stock. Base padding, no override. */
.doc--dagsrapport { --paper: #dfe7f2; }
.doc--dagsrapport .day-head {
  display: flex; justify-content: space-between; align-items: flex-end;
  border-bottom: 2.5px solid var(--rule-strong); padding-bottom: 12px;
}
.doc--dagsrapport .day-head h1 { margin: 0; font-size: 30px; letter-spacing: 0.05em; }
.doc--dagsrapport .day-head .stamp { font-size: 11px; }
.doc--dagsrapport .day-fields {
  display: grid; grid-template-columns: max-content 1fr; gap: 10px 18px;
  margin: 22px 0 10px; font-size: 13px;
}
.doc--dagsrapport .day-fields .label {
  font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;
  color: var(--ink-faint); align-self: end;
}
.doc--dagsrapport .day-fields .rule { border-bottom: 1px solid var(--rule); height: 1.4em; }
.doc--dagsrapport .day-body {
  /* 21 rule lines x 40px — fills the sheet down to the base bottom margin
     without pushing past PAGE_MIN_HEIGHT (fullPage bake must stay A4). */
  margin-top: 22px; height: 840px;
  background-image: repeating-linear-gradient(
    to bottom,
    transparent 0, transparent 39px,
    var(--rule) 39px, var(--rule) 40px
  );
}
`;

export function render(ctx) {
  const { art } = ctx;
  return `
<div class="page">
  ${art}
  <div class="day-head">
    <h1 class="kind-title">Dagsrapport</h1>
  </div>
  <div class="day-fields">
    <span class="label">Dato</span><span class="rule"></span>
    <span class="label">Sak</span><span class="rule"></span>
  </div>
  <div class="day-body"></div>
</div>`;
}
