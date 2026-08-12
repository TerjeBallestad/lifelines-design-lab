// SDD-011 — KONTOUTSKRIFT kind template.
// Bank statement: Archivo letterhead over a typewriter ledger body. Ported
// from the design-canvas export (prototypes/paper-reference, sheets 1a/1b)
// minus the canvas-only presentation — no rotate, no box-shadow, no wear or
// stamp layers; the desk mesh maps the texture edge-to-edge and supplies its
// own light. Only the bank name and the strapline are template chrome; the
// address block, the ledger table and the footer boilerplate arrive as
// authored labContent blocks.

export const kind = 'KONTOUTSKRIFT';

const BANK_NAME = 'SPAREBANKEN VESTRE OSLO';
const BANK_STRAP = 'FILIAL SKILLEBEKK · DRAMMENSVEIEN 118 · TLF 22 44 xx xx';

export const styleCss = `
.doc--kontoutskrift { --paper: #ece4d0; --page-pad: 38px 42px 44px; }
.doc--kontoutskrift .bank-head {
  display: flex; justify-content: space-between; align-items: flex-start;
  border-bottom: 2.5px solid var(--ink);
  padding-bottom: 12px;
}
.doc--kontoutskrift .bank-name {
  font-family: 'Archivo', sans-serif;
  font-weight: 700;
  font-size: 21px;
  letter-spacing: 0.1em;
  color: #1f3a5f;
}
.doc--kontoutskrift .bank-strap {
  font-family: 'Archivo', sans-serif;
  font-weight: 500;
  font-size: 10px;
  letter-spacing: 0.15em;
  font-variant: small-caps;
  color: #4a4335;
  margin-top: 3px;
}
.doc--kontoutskrift .doc-ref {
  text-align: right;
  font-size: 12px;
  line-height: 1.5;
  max-width: 40%;
}
.doc--kontoutskrift .bank-body {
  margin-top: 24px;
  font-size: 13px;
  line-height: 1.6;
}
/* The whole printed body is typewriter — the letterhead alone is set. */
.doc--kontoutskrift .doc-ref,
.doc--kontoutskrift .bank-body {
  font-family: 'Special Elite', 'Courier New', monospace;
}
.doc--kontoutskrift .doc-table { font-size: 12.5px; }
.doc--kontoutskrift .doc-table th, .doc--kontoutskrift .doc-table td {
  padding: 4px 8px;
}
`;

export function render(ctx) {
  const { title, meta, runsHtml, art } = ctx;
  return `
<div class="page">
  ${art}
  <div class="bank-head">
    <div>
      <div class="bank-name">${BANK_NAME}</div>
      <div class="bank-strap">${BANK_STRAP}</div>
    </div>
    <div class="doc-ref">${title}<br>${meta}</div>
  </div>
  <div class="bank-body body-copy">${runsHtml}</div>
</div>`;
}
