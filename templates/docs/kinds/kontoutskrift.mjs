// SDD-011 — KONTOUTSKRIFT kind template.
// Bank statement: Archivo letterhead over a Courier Prime ledger body. Ported
// from the design-canvas export (prototypes/paper-reference, sheets 1a/1b).
// The page stays axis-aligned (the desk mesh maps the texture edge-to-edge);
// wear and institutional stamps arrive per-doc via DOC_OVERRIDES in
// shared.mjs — Frank's handwritten commentary never prints (Terje 2026-08-12:
// it bleeds the answers). Only the bank name and the strapline are template
// chrome; the address block, the konto block, the ledger table and the footer
// boilerplate arrive as authored labContent blocks.
//
// Scale note: the reference sheet is 620px wide, this kind bakes at 800 —
// every reference size is scaled ~1.3x to keep the printed density.

export const kind = 'KONTOUTSKRIFT';

const BANK_NAME = 'SPAREBANKEN VESTRE OSLO';
const BANK_STRAP = 'FILIAL SKILLEBEKK · DRAMMENSVEIEN 118 · TLF 22 44 xx xx';

export const styleCss = `
.doc--kontoutskrift { --paper: #ece4d0; --page-pad: 44px 50px 50px; }
/* Bright print paper: the shared grain wash at full strength muddies the
   ledger — the per-doc wear layers carry the age instead. */
.doc--kontoutskrift .page::after { opacity: 0.28; }
.doc--kontoutskrift .bank-head {
  display: flex; justify-content: space-between; align-items: flex-start;
  border-bottom: 3px solid var(--ink);
  padding-bottom: 14px;
}
.doc--kontoutskrift .bank-name {
  font-family: 'Archivo', sans-serif;
  font-weight: 700;
  font-size: 27px;
  letter-spacing: 0.1em;
  color: #1f3a5f;
}
.doc--kontoutskrift .bank-strap {
  font-family: 'Archivo', sans-serif;
  font-weight: 500;
  font-size: 13px;
  letter-spacing: 0.14em;
  font-variant: small-caps;
  color: #4a4335;
  margin-top: 4px;
}
.doc--kontoutskrift .doc-ref {
  text-align: right;
  font-size: 15px;
  line-height: 1.5;
  max-width: 40%;
}
.doc--kontoutskrift .bank-body {
  position: relative;
  margin-top: 28px;
  font-size: 17px;
  line-height: 1.55;
}
/* The whole printed body is monospace ledger type — the letterhead alone
   is set (Courier Prime per the design canvas; Special Elite has no bold). */
.doc--kontoutskrift .doc-ref,
.doc--kontoutskrift .bank-body {
  font-family: 'Courier Prime', 'Courier New', monospace;
}
/* Reference layout: the konto/periode block sits right-aligned OPPOSITE the
   address block. Authored order is fixed for this kind: paragraph 1 is the
   address, paragraph 2 is the konto block. */
.doc--kontoutskrift .bank-body > .para:nth-of-type(2) {
  position: absolute;
  top: 0; right: 0;
  text-align: right;
}
.doc--kontoutskrift .doc-table { font-size: 16px; margin-top: 4px; }
.doc--kontoutskrift .doc-table th, .doc--kontoutskrift .doc-table td {
  padding: 6px 8px;
}
.doc--kontoutskrift .doc-table thead th {
  border-top: 2px solid var(--ink);
  border-bottom: 2px solid var(--ink);
  font-weight: 700;
  padding: 7px 8px;
}
/* The SALDO total row prints ruled and bold, like the reference. */
.doc--kontoutskrift .doc-table tbody tr:last-child td {
  border-top: 2px solid var(--ink);
  font-weight: 700;
  padding-top: 9px;
}
/* Footer boilerplate: smaller, quieter than the ledger. */
.doc--kontoutskrift .doc-table + .para,
.doc--kontoutskrift .doc-table ~ .para {
  font-size: 14px;
  color: #55503f;
  line-height: 1.6;
  margin-top: 1.4em;
  margin-bottom: 0.2em;
}
`;

export function render(ctx) {
  const { title, meta, runsHtml, art } = ctx;
  return `
<div class="page">
  <div class="bank-head">
    <div>
      <div class="bank-name">${BANK_NAME}</div>
      <div class="bank-strap">${BANK_STRAP}</div>
    </div>
    <div class="doc-ref">${title}<br>${meta}</div>
  </div>
  <div class="bank-body body-copy">${runsHtml}</div>
  ${art}
</div>`;
}
