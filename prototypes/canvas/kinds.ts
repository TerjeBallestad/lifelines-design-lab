// Kind-level presentation data + tiny HTML helpers, shared across the canvas
// modules. Pure data — no DOM reads at module scope (cssVar reads at call time).
import type { NodeKind } from './graph.ts';

export const KIND_LABEL: Record<NodeKind, string> = {
  document: 'DOCUMENT',
  fact: 'FACT',
  question: 'QUESTION',
  hypothesis: 'HYPOTHESIS',
  tiltak: 'TILTAK',
  dispatch: 'DISPATCH',
  clock: 'CLOCK',
  conversation: 'CONVERSATION',
  recipe: 'RECIPE',
  proposal: 'PROPOSAL',
};

export const KIND_VAR: Record<NodeKind, string> = {
  document: '--blue',
  fact: '--accent',
  question: '--yellow',
  hypothesis: '--purple',
  tiltak: '--green',
  dispatch: '--orange',
  clock: '--gold',
  // SB-046: the weave family shares one hue — the labels tell them apart.
  conversation: '--teal',
  recipe: '--teal',
  proposal: '--teal',
};

export const EDGE_VAR: Record<string, string> = {
  source: '--blue',
  supports: '--accent',
  gate: '--yellow',
  needs: '--purple',
  opens: '--green',
  delivers: '--orange',
  reveals: '--gold',
  clock: '--gold',
  lead: '--yellow',
  pays: '--teal',
};

export const ID_PREFIX: Record<NodeKind, string> = {
  document: 'doc_',
  fact: 'f_',
  question: 'q_',
  hypothesis: 'h_',
  tiltak: 't_',
  dispatch: 'd_', // plain Opens: only classifies d_-prefixed ids (SB-033)
  clock: 'ck_',
  // SB-046: never reachable — RELATION has no weave entries, so birthKinds
  // filters these out of the create menu; the entries just satisfy the type.
  conversation: 'chat:',
  recipe: 'recipe_',
  proposal: 'prop_',
};

// SB-063: the field specs moved to shared/field-form.ts (the drawer renders
// the same form). Re-exported here so canvas imports keep one source.
export type { FieldSpec } from '../shared/field-form.ts';
export { FORM_FIELDS } from '../shared/field-form.ts';

export function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
export const escapeAttr = (s: string) => escapeHtml(s).replace(/"/g, '&quot;');

export const cssVar = (name: string) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim() || '#62667a';
