// SB-061: the Playtest lens model — the kind-grouped entity index over the
// compiled slice, and the surface router that widens surfaceFor to the kinds
// with no NodeKind (day-script beats, event deltas). Pure over CompileResult
// so the jsdom smoke can drive it without the page.
import type { CompileResult } from '../../src/compiler/index.ts';
import type { NodeKind } from '../shared/node-kind.ts';
import { plainTitle } from '../shared/plain-title.ts';
import { CHAT_FRANK_ID, callContactOf, callId, recipeId } from '../shared/weave-ids.ts';
import { beatSurface, fallbackJsonSurface, surfaceFor } from '../shared/surfaces.ts';
import type { Surface } from '../shared/surfaces.ts';
import type { CoverageKey } from './coverage.ts';

/** Every array-valued CaseSlice kind gets an index group; the pair_*_line
 *  scalars live only in the coverage panel. Typed against the coverage
 *  registry so a group-key typo cannot silently detach a kind from the
 *  coverage honesty checks. */
export type IndexGroupKey = Exclude<CoverageKey, 'pair_soft_reject_line' | 'pair_already_set_line'>;

/** One selectable row: a surfaced NodeKind entity, or a direct-entry kind. */
export interface IndexEntry {
  id: string;
  label: string;
  kind: NodeKind | 'day_script_beat' | 'event_delta';
}

export interface IndexGroup {
  key: IndexGroupKey;
  label: string;
  entries: IndexEntry[];
}

/** Every emitted entity in the loaded case, grouped by CaseSlice kind, in
 *  CaseSlice declaration order (same order as the coverage panel). Kinds the
 *  case does not author come back as empty groups so the index shows the
 *  whole emitted entity shape. */
export function buildIndex(result: CompileResult): IndexGroup[] {
  const { slice } = result;
  return [
    {
      key: 'documents',
      label: 'Documents',
      entries: slice.documents.map((d) => ({
        id: d.id,
        label: plainTitle(d.title),
        kind: 'document' as const,
      })),
    },
    {
      key: 'facts',
      label: 'Facts',
      entries: slice.facts.map((f) => ({
        id: f.id,
        label: plainTitle(f.label),
        kind: 'fact' as const,
      })),
    },
    {
      key: 'questions',
      label: 'Questions',
      entries: slice.questions.map((q) => ({
        id: q.id,
        label: plainTitle(q.card_title || q.prompt),
        kind: 'question' as const,
      })),
    },
    {
      key: 'hypotheses',
      label: 'Hypotheses',
      entries: slice.hypotheses.map((h) => ({
        id: h.id,
        label: plainTitle(h.title),
        kind: 'hypothesis' as const,
      })),
    },
    {
      key: 'tiltak',
      label: 'Tiltak',
      entries: slice.tiltak.map((t) => ({
        id: t.id,
        label: plainTitle(t.title),
        kind: 'tiltak' as const,
      })),
    },
    {
      key: 'dispatches',
      label: 'Dispatches',
      entries: slice.dispatches.map((d) => ({
        id: d.id,
        label: plainTitle(d.title),
        kind: 'dispatch' as const,
      })),
    },
    {
      key: 'clocks',
      label: 'Clocks',
      entries: slice.clocks.map((c) => ({
        id: c.id,
        label: plainTitle(c.label),
        kind: 'clock' as const,
      })),
    },
    {
      key: 'event_delta_specs',
      label: 'Event deltas',
      entries: slice.event_delta_specs.map((e) => ({
        id: e.event_type,
        label: e.event_type,
        kind: 'event_delta' as const,
      })),
    },
    {
      key: 'day_script_beats',
      label: 'Day script beats',
      entries: slice.day_script_beats.map((b) => ({
        id: b.id,
        label: `Dag ${b.day} — ${b.text}`,
        kind: 'day_script_beat' as const,
      })),
    },
    {
      key: 'frank_chat',
      label: 'Frank chat',
      entries: (slice.frank_chat ?? []).map((entry) => ({
        // Every entry is one emitted entity; the surface is the one shared
        // transcript (SB-062 chat idiom), so all rows select chat:frank.
        id: entry.id,
        label: plainTitle(entry.question),
        kind: 'conversation' as const,
      })),
    },
    {
      key: 'frank_proposals',
      label: 'Proposals',
      entries: (slice.frank_proposals ?? []).map((p) => ({
        id: p.handbok_id,
        label: plainTitle(p.line),
        kind: 'proposal' as const,
      })),
    },
    {
      key: 'recipes',
      label: 'Recipes',
      entries: (slice.recipes ?? []).map((r) => ({
        id: recipeId(r.pair),
        label: recipeId(r.pair),
        kind: 'recipe' as const,
      })),
    },
    {
      key: 'calls',
      label: 'Calls',
      entries: (slice.calls ?? []).map((call) => ({
        id: callId(call.contact_id),
        label: `call: ${call.contact_id}`,
        kind: 'conversation' as const,
      })),
    },
  ];
}

/** The playtest-wide dispatcher: surfaceFor for the NodeKind kinds, direct
 *  renderer entries for the rest. Chat rows share the one transcript. */
export function entitySurface(entry: IndexEntry, result: CompileResult): Surface {
  switch (entry.kind) {
    case 'day_script_beat':
      return beatSurface(entry.id, result);
    case 'event_delta': {
      // Event deltas have no id field the shared pool search could find, so
      // the node rides along; the JSON surface stays the honest one.
      const delta = result.slice.event_delta_specs.find((e) => e.event_type === entry.id);
      return fallbackJsonSurface(entry.id, 'event_delta', result, delta ?? null);
    }
    case 'conversation':
      return surfaceFor(
        callContactOf(entry.id) !== null ? entry.id : CHAT_FRANK_ID,
        'conversation',
        result,
      );
    default:
      return surfaceFor(entry.id, entry.kind, result);
  }
}
