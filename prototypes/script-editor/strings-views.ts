// SB-071: the Strings sub-view for a `# Strings:` block in a case buffer.
// SB-103: per-family context — a "what this is, where it renders" header from
// the liveness map (SB-101 research), a display-dead flag, and a håndbok
// book-row preview for the TILTAK catalog family. Pure logic (row and group
// derivation) lives up top so vitest covers it without a DOM; the lit-html
// templates below render the preview rail (SDD-130 §3). Sketches are honest
// about shape, not Godot renders (doc-preview doctrine). Text stays verbatim:
// content is Norwegian.
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

/** What a family is and where its text shows up in the game — the SB-101
 *  liveness map, folded to header copy. Keyed by the `# Strings:` family id. */
export interface FamilyInfo {
  /** One line: what this family is. */
  what: string;
  /** The on-screen surface the text renders on. */
  surface: string;
  /** Runtime consumer (file), for the header tooltip. */
  consumer: string;
  /** Loaded and validated, but the text never reaches a label. */
  displayDead?: true;
  note?: string;
}

export const FAMILY_INFO: Record<string, FamilyInfo> = {
  visit: {
    what: 'spoken lines for the besok choreography spine',
    surface: 'speech bubbles in the apartment during a visit',
    consumer: 'social_visit_director.gd',
  },
  notat: {
    what: "Frank's hjemmebesok notat body",
    surface: 'the notat document in the DocReader on the desk',
    consumer: 'notat_composer.gd',
  },
  notat_fragments: {
    what: 'liftable evidence runs overlaid on the notat',
    surface: 'the same notat document — the runs the player can lift',
    consumer: 'notat_composer.gd',
  },
  prologue: {
    what: "the doctor's-office intro scene text and stamp",
    surface: 'the legesenteret scene at boot (only perf_probe skips it)',
    consumer: '20260707_legesenteret.gd',
  },
  handbok_tiltak: {
    what: 'the TILTAK catalog: navn, ytelse, dawn and krav per tiltak',
    surface: 'håndbok book rows',
    consumer: 'handbok_catalog.gd',
  },
  frank_actions: {
    what: "Frank's planner-sheet action card titles",
    surface: 'planner cards behind the desk planner hotspot, plus the dagslogg source column',
    consumer: 'handbok_catalog.gd / handbok_state.gd / frank_action_handlers.gd',
  },
  handbok: {
    what: 'håndbok UI copy: dagslogg rows, worry-slip toasts, OPPDRAG lane names',
    surface: 'the cork board dagslogg, toasts, and OPPDRAG lanes',
    consumer: 'handbok_state.gd (~40 call sites)',
  },
  sim_text: {
    what: "sim-driven copy: dagslogg lines, toasts, visitor display names, Frank's phone reply",
    surface: 'dagslogg and toasts, plus spawned visitor name labels',
    consumer: 'frank_action_handlers, tiltak_dawn_handlers, case_host, case_engine',
  },
  dagsrapport: {
    what: 'the DAGSRAPPORT document body',
    surface: 'the DocReader, from day 2',
    consumer: 'report_composer.gd',
  },
  tiltak_visits: {
    what: 'step labels for tiltak visit choreography',
    surface: 'none — attached to steps but never rendered; execution keys off step id',
    consumer: 'tiltak_visit_director.gd steps_for',
    displayDead: true,
    note: 'greybox surface per the director — render-or-remove is a pending ruling (SB-101)',
  },
};

/** One tiltak in the handbok_tiltak family, grouped from its `<id>.<field>`
 *  keys. `krav` keeps the authored `krav.N` order. */
export interface TiltakGroup {
  id: string;
  navn?: string;
  ytelse?: string;
  dawn?: string;
  krav: string[];
}

/** Group `<id>.<field>` entries into per-tiltak book rows, in first-seen
 *  order. Unknown fields are ignored — the table view still shows them. */
export function tiltakGroups(entries: Record<string, string>): TiltakGroup[] {
  const groups: TiltakGroup[] = [];
  const byId = new Map<string, TiltakGroup>();
  for (const [key, text] of Object.entries(entries)) {
    const dot = key.indexOf('.');
    if (dot <= 0) continue;
    const id = key.slice(0, dot);
    const field = key.slice(dot + 1);
    let group = byId.get(id);
    if (!group) {
      group = { id, krav: [] };
      byId.set(id, group);
      groups.push(group);
    }
    if (field === 'navn') group.navn = text;
    else if (field === 'ytelse') group.ytelse = text;
    else if (field === 'dawn') group.dawn = text;
    else if (/^krav\.\d+$/.test(field)) group.krav.push(text);
  }
  return groups;
}

// ---- templates ----------------------------------------------------------

const stubChip = (stub: boolean | undefined) =>
  stub
    ? html`<span class="chip tv-stub-chip" title="Stub: yes — placeholder text, Terje rewrites"
        >stub</span
      >`
    : nothing;

/** The per-family header: what this is, where it renders (SB-103). Families
 *  the liveness map does not know get a neutral "unmapped" line. */
const familyHeader = (id: string): TemplateResult => {
  const info = FAMILY_INFO[id];
  if (!info)
    return html`<div class="sv-family">
      <span class="sv-family-what">unmapped family — not in the SB-101 liveness map</span>
    </div>`;
  return html`<div class="sv-family">
      <span class="sv-family-what" title=${`consumer: ${info.consumer}`}>${info.what}</span>
      <span class="sv-family-surface">renders: ${info.surface}</span>
    </div>
    ${info.displayDead
      ? html`<div class="sv-dead" title=${info.note ?? ''}>
          ⚠ display-dead — loaded and validated, but the text never reaches the screen
        </div>`
      : nothing}`;
};

/** Håndbok book-row sketch for the TILTAK catalog family. */
const tiltakPreview = (entries: Record<string, string>): TemplateResult => {
  const groups = tiltakGroups(entries);
  return html`<div class="surface-label">håndbok — book rows</div>
    <div class="sv-tiltak-list">
      ${groups.map(
        (t) =>
          html`<div class="sv-tiltak">
            <div class="sv-tiltak-navn">
              ${t.navn ?? html`<span class="sv-hole">— no navn</span>`}
            </div>
            ${t.ytelse ? html`<div class="sv-tiltak-ytelse">${t.ytelse}</div>` : nothing}
            ${t.krav.length
              ? html`<div class="sv-tiltak-krav">
                  ${t.krav.map((k) => html`<div class="sv-tiltak-krav-row">□ ${k}</div>`)}
                </div>`
              : nothing}
            ${t.dawn
              ? html`<div class="sv-tiltak-dawn" title="dawn line">☀ ${t.dawn}</div>`
              : nothing}
          </div>`,
      )}
    </div>`;
};

/**
 * Strings preview — the per-family header, the family's surface sketch when
 * it has one (TILTAK book rows today), then the flat two-column id/text table
 * (SDD-130 §3). Ids are the runtime lookup keys (chrome-adjacent, stay
 * verbatim); the text column is game content, verbatim and untranslated.
 * Empty values render as a visible hole so the table reads as a worklist too.
 */
export function stringsPreview(table: StringTableOut): TemplateResult {
  const rows = stringRows(table);
  const empties = emptyRowCount(rows);
  return html`${familyHeader(table.id)}
    ${table.id === 'handbok_tiltak' && rows.length ? tiltakPreview(table.entries) : nothing}
    <div class="surface-label">string table — flat id-keyed UI copy ${stubChip(table.stub)}</div>
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
