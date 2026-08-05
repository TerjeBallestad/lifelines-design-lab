// TASK-916 — Kind → template registry.
//
// GROUND TRUTH: exactly SIX distinct Kind: values across the 8 tiny-Olsen documents
// (BEKYMRINGSMELDING, ØKONOMISK OVERSIKT, BREV, FELTNOTAT, RAPPORT, MELDING) plus
// ONE generated stationery kind (DAGSRAPPORT, gym-synthesized). PAPIRGJENNOMGANG is
// NOT a kind — it is a vestigial doc_stock STOCK key / Meta sub-label on doc_papirer,
// so it has no template here.

import * as bekymringsmelding from './kinds/bekymringsmelding.mjs';
import * as okonomiskOversikt from './kinds/okonomisk-oversikt.mjs';
import * as brev from './kinds/brev.mjs';
import * as feltnotat from './kinds/feltnotat.mjs';
import * as rapport from './kinds/rapport.mjs';
import * as melding from './kinds/melding.mjs';
import * as dagsrapport from './kinds/dagsrapport.mjs';

// The six authored kinds baked from labContent documents.
export const AUTHORED_KINDS = Object.freeze([
  'BEKYMRINGSMELDING',
  'ØKONOMISK OVERSIKT',
  'BREV',
  'FELTNOTAT',
  'RAPPORT',
  'MELDING',
]);

// Generated stationery kinds (no labContent doc; rendered empty).
export const STATIONERY_KINDS = Object.freeze(['DAGSRAPPORT']);

const TEMPLATES = Object.freeze({
  BEKYMRINGSMELDING: bekymringsmelding,
  'ØKONOMISK OVERSIKT': okonomiskOversikt,
  BREV: brev,
  FELTNOTAT: feltnotat,
  RAPPORT: rapport,
  MELDING: melding,
  DAGSRAPPORT: dagsrapport,
});

export function hasTemplate(kind) {
  return Object.prototype.hasOwnProperty.call(TEMPLATES, kind);
}

export function templateForKind(kind) {
  const template = TEMPLATES[kind];
  if (!template) {
    throw new Error(
      `No doc template for kind ${JSON.stringify(kind)}. ` +
        `Known kinds: ${Object.keys(TEMPLATES).join(', ')}.`,
    );
  }
  return template;
}
