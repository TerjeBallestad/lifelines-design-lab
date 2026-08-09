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

// Markup field per form row. `keys` are candidates in preference order; the
// first key the block already carries wins (questions write Title unless the
// block uses an explicit Prompt line). Multiline fields render as textareas
// but stay single markup lines — newlines collapse to spaces on commit.
export interface FieldSpec {
  keys: string[];
  multiline?: boolean;
  /** Empty-form guidance (SB-039): example text from a real Olsen block. */
  placeholder?: string;
}
export const FORM_FIELDS: Record<NodeKind, FieldSpec[]> = {
  document: [{ keys: ['Title'] }, { keys: ['Peek'] }, { keys: ['Meta'] }],
  fact: [
    { keys: ['Label'], placeholder: 'short name — e.g. Ellings uføretrygd' },
    {
      keys: ['Summary'],
      multiline: true,
      placeholder: 'what the player learns — e.g. Ellings uføretrygd: 2 [icon=coin] i måneden.',
    },
    { keys: ['Category'], placeholder: 'e.g. Økonomi' },
    {
      keys: ['Quote'],
      multiline: true,
      placeholder: 'source line, verbatim — e.g. «Det er en dør på gløtt.»',
    },
  ],
  question: [
    { keys: ['Prompt', 'Title'], multiline: true },
    { keys: ['Teaser'], multiline: true },
    { keys: ['Card title'] },
  ],
  hypothesis: [
    { keys: ['Title'], multiline: true },
    { keys: ['Summary'], multiline: true },
  ],
  tiltak: [
    { keys: ['Title'] },
    { keys: ['Slot'] },
    { keys: ['Cost'] },
    { keys: ['Description'], multiline: true },
  ],
  dispatch: [
    { keys: ['Title'] },
    { keys: ['Activity'] },
    { keys: ['Channel'] },
    { keys: ['Delay'] },
    { keys: ['Description'], multiline: true },
  ],
  clock: [{ keys: ['Label'] }, { keys: ['Question'] }, { keys: ['Good'] }, { keys: ['Bad'] }],
  // SB-046 (SB-037 ruling): weave blocks never grow canvas forms — editing
  // routes to the script surface via the click cross-jump.
  conversation: [],
  recipe: [],
  proposal: [],
};

export function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
export const escapeAttr = (s: string) => escapeHtml(s).replace(/"/g, '&quot;');

export const cssVar = (name: string) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim() || '#62667a';
