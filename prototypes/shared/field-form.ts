// SB-063: the per-kind field form, extracted from canvas/inspector.ts (the
// SB-082 renderer-seam move applied to editing). One spec table + one rows
// renderer, parameterized on the commit/stash hooks — the canvas inspector
// and the playtest drawer render the SAME form and write through the same
// compiler patch layer; only the commit tail differs per lens.
import { html } from 'lit-html';
import type { TemplateResult } from 'lit-html';
import { live } from 'lit-html/directives/live.js';
import type { RawBlock } from '../../src/compiler/parse.ts';
import type { NodeKind } from './node-kind.ts';

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
  // SB-046 (SB-037 ruling): weave blocks never grow field forms — editing
  // routes to the raw script surface.
  conversation: [],
  recipe: [],
  proposal: [],
};

/** Markup fields are single lines; a textarea newline collapses to a space
 *  (same law as canvas editing.ts). */
export const oneLine = (value: string): string => value.replace(/\s*\n\s*/g, ' ').trim();

export interface FieldFormHooks {
  /** A committed value (change/blur) — write it through the patch layer. */
  commit(key: string, value: string): void;
  /** A keystroke in flight — stash it in the draft so a reload keeps it. */
  stash(key: string, value: string): void;
}

/** The form rows for one block — inputs keep element identity across a lit
 *  re-render (live()), so focus survives a recompile. Empty for the kinds
 *  with no field form (weave family). */
export function fieldRows(
  kind: NodeKind,
  block: RawBlock,
  hooks: FieldFormHooks,
): TemplateResult[] {
  return (FORM_FIELDS[kind] ?? []).map((spec) => {
    const key = spec.keys.find((k) => block.fields.some((f) => f.key === k)) ?? spec.keys[0];
    const value = block.fields.find((f) => f.key === key)?.value ?? '';
    const commit = (event: Event) => hooks.commit(key, (event.target as HTMLInputElement).value);
    const stash = (event: Event) => hooks.stash(key, (event.target as HTMLInputElement).value);
    const blurOnEnter = (event: KeyboardEvent) => {
      if (event.key === 'Enter') (event.target as HTMLElement).blur();
    };
    const control = spec.multiline
      ? html`<textarea
          class="fval"
          data-key="${key}"
          rows="3"
          placeholder=${spec.placeholder ?? ''}
          .value=${live(value)}
          @change=${commit}
          @input=${stash}
        ></textarea>`
      : html`<input
          class="fval"
          data-key="${key}"
          placeholder=${spec.placeholder ?? ''}
          .value=${live(value)}
          @change=${commit}
          @input=${stash}
          @keydown=${blurOnEnter}
        />`;
    return html`<label class="field"><span class="fkey">${key}</span>${control}</label>`;
  });
}
