// SDD-011 — REGNING kind template.
// Energy-company invoice: Archivo letterhead with the square company mark,
// invoice body, and the darker giro payment-slip band at the foot. Ported
// from the design-canvas export (prototypes/paper-reference, sheet 1c) minus
// the canvas-only presentation — no rotate, no box-shadow, no wear or stamp
// layers. Only the company mark, name and strapline are template chrome; the
// address block, the specification table and the giro fields arrive as
// authored labContent blocks. The LAST authored block is drawn as the giro
// band — author the payment-slip fields as the document's final paragraph.

export const kind = 'REGNING';

const COMPANY_NAME = 'OSLO ENERGIVERK';
const COMPANY_STRAP = 'LYS OG KRAFT FOR HOVEDSTADEN';

export const styleCss = `
.doc--regning { --paper: #f1ece0; --page-pad: 34px 40px 0; font-family: 'Archivo', sans-serif; }
.doc--regning .page { display: flex; flex-direction: column; }
.doc--regning .co-head {
  display: flex; justify-content: space-between; align-items: center;
}
.doc--regning .co-ident { display: flex; align-items: center; gap: 12px; }
.doc--regning .co-mark {
  width: 44px; height: 44px;
  background: #b8541e; color: #f1ece0;
  display: flex; align-items: center; justify-content: center;
  font-family: 'Archivo', sans-serif; font-weight: 700; font-size: 26px;
}
.doc--regning .co-name {
  font-family: 'Archivo', sans-serif;
  font-weight: 700; font-size: 20px; letter-spacing: 0.06em;
}
.doc--regning .co-strap {
  font-size: 10px; letter-spacing: 0.2em; font-variant: small-caps; color: #6b6250;
}
.doc--regning .doc-ref {
  text-align: right; font-size: 11px; line-height: 1.5; color: #4a4335;
}
.doc--regning .invoice-body {
  margin-top: 28px;
  font-size: 13px;
  line-height: 1.65;
  flex: 1 0 auto;
  display: flex; flex-direction: column;
}
.doc--regning .doc-table { font-size: 13px; }
.doc--regning .doc-table th, .doc--regning .doc-table td { padding: 7px 10px; }
.doc--regning .doc-table thead th {
  background: #26231c; color: #f1ece0;
  border-top: none; border-bottom: none;
  font-family: 'Archivo', sans-serif; font-weight: 600;
}
.doc--regning .doc-table tbody td { border-bottom: 1px solid #c9c0ab; }
.doc--regning .doc-table tbody tr:last-child td { border-bottom: none; }
/* The giro payment slip: the final authored block sits on the darker band,
   under the perforated tear line. Full-bleed against the page padding and the
   .page ink border (the band prints to the sheet edge). */
.doc--regning .invoice-body > :last-child {
  margin-top: auto;
  background: #ddd3ba;
  border-top: 2px dashed #8f8672;
  padding: 26px 40px 32px;
  margin-left: -40px; margin-right: -40px; margin-bottom: 0;
  font-family: 'Special Elite', 'Courier New', monospace;
  font-size: 12px;
  position: relative;
}
.doc--regning .invoice-body > :last-child::before {
  content: 'RIV AV HER — GIROBLANKETT';
  position: absolute;
  top: -8px; left: 40px;
  background: #f1ece0;
  padding: 0 8px;
  font-family: 'Archivo', sans-serif;
  font-size: 9px; letter-spacing: 0.2em; color: #8f8672;
}
/* A lone tear line still prints on the empty stationery sheet. */
.doc--regning .invoice-body:empty {
  border-bottom: 2px dashed #8f8672;
}
`;

export function render(ctx) {
  const { title, meta, runsHtml, art } = ctx;
  return `
<div class="page">
  ${art}
  <div class="co-head">
    <div class="co-ident">
      <div class="co-mark">E</div>
      <div>
        <div class="co-name">${COMPANY_NAME}</div>
        <div class="co-strap">${COMPANY_STRAP}</div>
      </div>
    </div>
    <div class="doc-ref">${title}<br>${meta}</div>
  </div>
  <div class="invoice-body body-copy">${runsHtml}</div>
</div>`;
}
