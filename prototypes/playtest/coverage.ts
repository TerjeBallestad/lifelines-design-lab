// SB-061 Task 3 — the computed coverage list. The registry is typed against
// keyof CaseSlice: when emit.ts grows a new emitted key, the mapped type
// below stops compiling until the registry names it and states its surface
// status. The panel itself derives counts from the loaded slice — nothing in
// the list is hand-maintained beyond the honest status word.
import { html } from 'lit-html';
import type { CaseSlice, CompileResult } from '../../src/compiler/index.ts';
import type { Surface } from '../shared/surfaces.ts';

/** Case-level metadata, not entity kinds — everything else in CaseSlice must
 *  appear in the registry, including the pair_*_line scalars (which honestly
 *  carry 'no player surface yet'). */
type MetaKey = 'id' | 'title' | 'scenario_stage' | 'vurdering_frist_day';

export type CoverageKey = Exclude<keyof CaseSlice, MetaKey>;

export type SurfaceStatus = 'player surface' | 'fallback JSON' | 'no player surface yet';

export type CoverageRegistry = { [K in CoverageKey]: { label: string; status: SurfaceStatus } };

export const COVERAGE_REGISTRY: CoverageRegistry = {
  documents: { label: 'Documents', status: 'player surface' },
  facts: { label: 'Facts', status: 'player surface' },
  questions: { label: 'Questions', status: 'player surface' },
  hypotheses: { label: 'Hypotheses', status: 'player surface' },
  tiltak: { label: 'Tiltak', status: 'player surface' },
  dispatches: { label: 'Dispatches', status: 'player surface' },
  clocks: { label: 'Clocks', status: 'player surface' },
  event_delta_specs: { label: 'Event deltas', status: 'no player surface yet' },
  day_script_beats: { label: 'Day script beats', status: 'player surface' },
  frank_chat: { label: 'Frank chat', status: 'player surface' },
  frank_proposals: { label: 'Proposals', status: 'player surface' },
  pair_soft_reject_line: { label: 'Pair soft-reject line', status: 'no player surface yet' },
  pair_already_set_line: { label: 'Pair already-set line', status: 'no player surface yet' },
  recipes: { label: 'Recipes', status: 'player surface' },
  calls: { label: 'Calls', status: 'player surface' },
};

/** Ordered rows, in CaseSlice declaration order (registry literal order). */
export const COVERAGE_KEYS = Object.keys(COVERAGE_REGISTRY) as CoverageKey[];

/** Count of this kind in the loaded case: array length, or 0/1 for the
 *  scalar pair lines. Derived, never authored. */
export function countFor(key: CoverageKey, slice: CaseSlice): number {
  const value = slice[key];
  if (value === undefined) return 0;
  return Array.isArray(value) ? value.length : 1;
}

/** The coverage panel as a Surface — the Playtest lens boots to this, so one
 *  glance answers: what of the emitted case still has no player surface? */
export function coverageSurface(result: CompileResult): Surface {
  const { slice } = result;
  return {
    title: 'SURFACE COVERAGE — EVERY EMITTED KIND',
    template: html`<div class="surface-label">
        computed from the slice type + the loaded case — never hand-maintained
      </div>
      <div class="coverage-panel">
        ${COVERAGE_KEYS.map((key) => {
          const row = COVERAGE_REGISTRY[key];
          const count = countFor(key, slice);
          return html`<div class="cov-row cov-${row.status.replace(/ /g, '-')}">
            <span class="cov-label">${row.label}</span>
            <span class="cov-count">${count}</span>
            <span class="cov-status">${row.status}</span>
          </div>`;
        })}
      </div>
      <div class="lb-hint">click an entity in the index to read its surface</div>`,
  };
}
