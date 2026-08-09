// SB-061: the Playtest lens model — the kind-grouped entity index over the
// compiled slice, and the surface router that widens surfaceFor to the kinds
// with no NodeKind (day-script beats, event deltas). Pure over CompileResult
// so the jsdom smoke can drive it without the page.
import { html } from 'lit-html';
import type { CompileResult } from '../../src/compiler/index.ts';
import type { NodeKind } from '../shared/node-kind.ts';
import { beatSurface, surfaceFor } from '../shared/surfaces.ts';
import type { Surface } from '../shared/surfaces.ts';

/** One selectable row: a surfaced NodeKind entity, or a direct-entry kind. */
export interface IndexEntry {
  id: string;
  label: string;
  kind: NodeKind | 'day_script_beat' | 'event_delta';
}

export interface IndexGroup {
  key: string;
  label: string;
  entries: IndexEntry[];
}

/** Strip markup for a one-line index label (same idea as graph.ts's
 *  plainTitle): drop [anchor](fact:…) syntax down to the anchor text. */
function plainLabel(text: string): string {
  return text.replace(/\[([^\]]*)\]\(fact:[^)]*\)/g, '$1');
}

/** Every emitted entity in the loaded case, grouped by CaseSlice kind, in
 *  slice order. Kinds the case does not author come back as empty groups so
 *  the index shows the whole emitted shape. */
export function buildIndex(result: CompileResult): IndexGroup[] {
  const { slice } = result;
  return [
    {
      key: 'documents',
      label: 'Documents',
      entries: slice.documents.map((d) => ({
        id: d.id,
        label: d.title,
        kind: 'document' as const,
      })),
    },
    {
      key: 'facts',
      label: 'Facts',
      entries: slice.facts.map((f) => ({ id: f.id, label: f.label, kind: 'fact' as const })),
    },
    {
      key: 'questions',
      label: 'Questions',
      entries: slice.questions.map((q) => ({
        id: q.id,
        label: q.card_title || q.prompt,
        kind: 'question' as const,
      })),
    },
    {
      key: 'hypotheses',
      label: 'Hypotheses',
      entries: slice.hypotheses.map((h) => ({
        id: h.id,
        label: h.title,
        kind: 'hypothesis' as const,
      })),
    },
    {
      key: 'tiltak',
      label: 'Tiltak',
      entries: slice.tiltak.map((t) => ({ id: t.id, label: t.title, kind: 'tiltak' as const })),
    },
    {
      key: 'dispatches',
      label: 'Dispatches',
      entries: slice.dispatches.map((d) => ({
        id: d.id,
        label: d.title,
        kind: 'dispatch' as const,
      })),
    },
    {
      key: 'clocks',
      label: 'Clocks',
      entries: slice.clocks.map((c) => ({ id: c.id, label: c.label, kind: 'clock' as const })),
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
      key: 'event_delta_specs',
      label: 'Event deltas',
      entries: slice.event_delta_specs.map((e) => ({
        id: e.event_type,
        label: e.event_type,
        kind: 'event_delta' as const,
      })),
    },
    {
      key: 'frank_chat',
      label: 'Frank chat',
      entries: (slice.frank_chat ?? []).map((entry) => ({
        // Every entry is one emitted entity; the surface is the one shared
        // transcript (SB-062 chat idiom), so all rows select chat:frank.
        id: entry.id,
        label: plainLabel(entry.question),
        kind: 'conversation' as const,
      })),
    },
    {
      key: 'calls',
      label: 'Calls',
      entries: (slice.calls ?? []).map((call) => ({
        id: `call:${call.contact_id}`,
        label: `call: ${call.contact_id}`,
        kind: 'conversation' as const,
      })),
    },
    {
      key: 'recipes',
      label: 'Recipes',
      entries: (slice.recipes ?? []).map((r) => ({
        id: `${r.pair[0]} + ${r.pair[1]}`,
        label: `${r.pair[0]} + ${r.pair[1]}`,
        kind: 'recipe' as const,
      })),
    },
    {
      key: 'frank_proposals',
      label: 'Proposals',
      entries: (slice.frank_proposals ?? []).map((p) => ({
        id: p.handbok_id,
        label: plainLabel(p.line),
        kind: 'proposal' as const,
      })),
    },
  ];
}

/** Honest JSON surface for a kind with no player surface yet (event deltas).
 *  Same markup contract as fallbackJsonSurface; the node is passed in because
 *  event deltas have no id field the shared fallback could find. */
function jsonSurface(id: string, kind: string, node: unknown): Surface {
  // The json div is white-space: pre-wrap — the interpolation must stay the
  // element's only content, with no template indentation around it.
  const json = JSON.stringify(node, null, 2);
  return {
    title: `GAME SURFACE — ${id.toUpperCase()}`,
    template: html`<div class="surface-label">
        no player-facing surface — compiled output (${kind})
      </div>
      <div class="node-card"><div class="node-json">${json}</div></div>`,
  };
}

/** The playtest-wide dispatcher: surfaceFor for the NodeKind kinds, direct
 *  renderer entries for the rest. Chat rows share the one transcript. */
export function entitySurface(entry: IndexEntry, result: CompileResult): Surface {
  switch (entry.kind) {
    case 'day_script_beat':
      return beatSurface(entry.id, result);
    case 'event_delta': {
      const delta = result.slice.event_delta_specs.find((e) => e.event_type === entry.id);
      return jsonSurface(entry.id, 'event_delta', delta ?? null);
    }
    case 'conversation':
      return surfaceFor(
        entry.id.startsWith('call:') ? entry.id : 'chat:frank',
        'conversation',
        result,
      );
    default:
      return surfaceFor(entry.id, entry.kind, result);
  }
}
