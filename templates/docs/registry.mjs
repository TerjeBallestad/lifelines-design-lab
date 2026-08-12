// TASK-916 — Kind → template registry.
//
// GROUND TRUTH: exactly SEVEN distinct Kind: values across the 9 tiny-Olsen documents
// (BEKYMRINGSMELDING, ØKONOMISK OVERSIKT, BREV, FELTNOTAT, RAPPORT, MELDING,
// STATUSRAPPORT — the last added by the SB-024 rewrite's doc_status) plus
// ONE generated stationery kind (DAGSRAPPORT, gym-synthesized). PAPIRGJENNOMGANG is
// NOT a kind — it is a vestigial doc_stock STOCK key / Meta sub-label on doc_papirer,
// so it has no template here.

import * as bekymringsmelding from './kinds/bekymringsmelding.mjs';
import * as okonomiskOversikt from './kinds/okonomisk-oversikt.mjs';
import * as brev from './kinds/brev.mjs';
import * as feltnotat from './kinds/feltnotat.mjs';
import * as rapport from './kinds/rapport.mjs';
import * as melding from './kinds/melding.mjs';
import * as statusrapport from './kinds/statusrapport.mjs';
import * as dagsrapport from './kinds/dagsrapport.mjs';
import * as kontoutskrift from './kinds/kontoutskrift.mjs';
import * as regning from './kinds/regning.mjs';
import * as kassalapp from './kinds/kassalapp.mjs';

// The authored kinds baked from labContent documents (SDD-011 added
// KONTOUTSKRIFT, REGNING, KASSALAPP — the raw economy papers).
export const AUTHORED_KINDS = Object.freeze([
  'BEKYMRINGSMELDING',
  'ØKONOMISK OVERSIKT',
  'BREV',
  'FELTNOTAT',
  'RAPPORT',
  'MELDING',
  'STATUSRAPPORT',
  'KONTOUTSKRIFT',
  'REGNING',
  'KASSALAPP',
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
  STATUSRAPPORT: statusrapport,
  DAGSRAPPORT: dagsrapport,
  KONTOUTSKRIFT: kontoutskrift,
  REGNING: regning,
  KASSALAPP: kassalapp,
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
