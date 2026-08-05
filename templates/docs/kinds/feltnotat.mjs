// TASK-916 — FELTNOTAT kind template.
// Frank's field note: notepad with ruled lines + Caveat handwriting, a stamped
// header strip. Handwritten-note feel per the design bar. Verbatim runs.

export const kind = 'FELTNOTAT';

export const styleCss = `
/* Notepad stock — a touch cooler than office cream. Base padding, no override. */
.doc--feltnotat { --paper: #fdf7dd; --page-pad: 26px 32px 32px; }
.doc--feltnotat .note-head {
  border-left: 6px solid var(--rule-strong);
  padding: 2px 0 6px 16px; margin-bottom: 8px;
}
.doc--feltnotat .note-head h1 {
  margin: 0; font-size: 22px; letter-spacing: 0.05em;
}
.doc--feltnotat .note-head .stamp { font-size: 11px; display: block; margin-top: 4px; }
.doc--feltnotat .note-sub { margin: 2px 0 0 22px; font-size: 14px; }
.doc--feltnotat .note-body {
  margin-top: 22px;
  font-family: 'Caveat', 'Fraunces', cursive;
  font-size: 29px;
  line-height: 2.0em;
  color: #22303a;
  /* blue-ish notepad ruling */
  background-image: repeating-linear-gradient(
    to bottom,
    transparent 0,
    transparent calc(2.0em - 1px),
    #b9c6cf calc(2.0em - 1px),
    #b9c6cf 2.0em
  );
}
.doc--feltnotat .note-body [data-fact-id] { background: transparent; }
`;

export function render(ctx) {
  const { meta, title, runsHtml, art } = ctx;
  return `
<div class="page">
  ${art}
  <div class="note-head">
    <h1 class="kind-title">Feltnotat</h1>
    <span class="stamp">${meta}</span>
  </div>
  <p class="note-sub subtitle">${title}</p>
  <div class="note-body body-copy">${runsHtml}</div>
</div>`;
}
