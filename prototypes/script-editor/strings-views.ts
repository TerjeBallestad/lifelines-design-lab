// SB-071: the Strings sub-view for a `# Strings:` block in a case buffer.
// Pure logic (row derivation) lives up top so vitest covers it without a
// DOM; the lit-html template below renders the preview rail's flat
// two-column id/text table (SDD-130 §3). The table is a lab-side sketch
// honest about shape — id and text, nothing more — not a Godot render
// (doc-preview doctrine). Text stays verbatim: content is Norwegian.
import { html, nothing } from 'lit-html';
import type { TemplateResult } from 'lit-html';
import type { StringTableOut } from '../../src/compiler/emit-visit.ts';

// ---- pure logic ---------------------------------------------------------

/** One table row. `empty` flags a key still awaiting its text — the purge
 *  reads the table for holes as much as for placeholder prose. */
export interface StringRow {
  key: string;
  text: string;
  empty: boolean;
}

/** The table's rows in authored order (entries keep insertion order — the
 *  emitter builds them in file order, and the file order is the author's). */
export const stringRows = (table: StringTableOut): StringRow[] =>
  Object.entries(table.entries).map(([key, text]) => ({
    key,
    text,
    empty: text.trim() === '',
  }));

/** How many rows still have no text. */
export const emptyRowCount = (rows: StringRow[]): number => rows.filter((row) => row.empty).length;

// ---- templates ----------------------------------------------------------

const stubChip = (stub: boolean | undefined) =>
  stub
    ? html`<span class="chip tv-stub-chip" title="Stub: yes — placeholder text, Terje rewrites"
        >stub</span
      >`
    : nothing;

/**
 * Strings preview — the flat two-column id/text table (SDD-130 §3). Ids are
 * the runtime lookup keys (chrome-adjacent, stay verbatim); the text column
 * is game content, verbatim and untranslated. Empty values render as a
 * visible hole so the table reads as a worklist too.
 */
export function stringsPreview(table: StringTableOut): TemplateResult {
  const rows = stringRows(table);
  const empties = emptyRowCount(rows);
  return html`<div class="surface-label">
      string table — flat id-keyed UI copy ${stubChip(table.stub)}
    </div>
    ${rows.length === 0
      ? html`<div class="sv-empty">no entries authored yet</div>`
      : html`<div class="sv-table-wrap">
          <table class="sv-table">
            <thead>
              <tr>
                <th>id</th>
                <th>text</th>
              </tr>
            </thead>
            <tbody>
              ${rows.map(
                (row) =>
                  html`<tr class=${row.empty ? 'sv-row-empty' : ''}>
                    <td class="sv-key">${row.key}</td>
                    <td class="sv-text">
                      ${row.empty ? html`<span class="sv-hole">— no text yet</span>` : row.text}
                    </td>
                  </tr>`,
              )}
            </tbody>
          </table>
        </div>`}
    <div class="sv-count">
      ${rows.length}
      ${rows.length === 1 ? 'entry' : 'entries'}${empties
        ? html` · <span class="sv-count-empty">${empties} empty</span>`
        : nothing}
    </div>`;
}
