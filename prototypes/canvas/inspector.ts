// The inspector: per-kind edit forms (SB-032), the relation rows, the
// diagnostics section, and the delete-confirm surface. Reads the model,
// writes through editing.ts; the shell injects selection/navigation and
// the SB-055 preview handle.
import type { RawBlock } from '../../src/compiler/parse.ts';
import type { GraphNode, GraphEdge, NodeKind } from './graph.ts';
import { KIND_LABEL, KIND_VAR, FORM_FIELDS, escapeHtml, escapeAttr } from './kinds.ts';
import * as model from './model.ts';
import * as editing from './editing.ts';
import { unlockSentence } from './unlock.ts';

// SB-078: non-reactive concerns only — DOM host, preview handle, camera,
// tips. Selection writes go straight to model.setSelected.
export interface InspectorDeps {
  inspectorBody: HTMLElement;
  showPreview(id: string | null, kind: NodeKind | null): void;
  centerOn(id: string): void;
  showTip(text: string): void;
}

let deps: InspectorDeps;

export function initInspector(d: InspectorDeps): void {
  deps = d;
}

function relRow(edge: GraphEdge, otherId: string): string {
  const other = model.state.nodeById.get(otherId)!;
  return `<div class="rel" data-goto="${otherId}">
    <span class="via">${edge.label || 'carries'}</span>
    <span style="color:var(${KIND_VAR[other.kind]})">${otherId}</span>
    <span class="rtitle">${escapeHtml(other.title)}</span>
  </div>`;
}

function formHtml(node: GraphNode, block: RawBlock): string {
  if (
    block.type === 'beat' ||
    block.type === 'conversation' ||
    block.type === 'recipe' ||
    block.type === 'proposal'
  ) {
    return `<div class="form-note">Prose/weave block — edit it in the script pane (click jumped there already).</div>`;
  }
  const rows = (FORM_FIELDS[node.kind] ?? []).map((spec) => {
    const key = spec.keys.find((k) => block.fields.some((f) => f.key === k)) ?? spec.keys[0];
    const value = block.fields.find((f) => f.key === key)?.value ?? '';
    const ph = spec.placeholder ? ` placeholder="${escapeAttr(spec.placeholder)}"` : '';
    const control = spec.multiline
      ? `<textarea class="fval" data-key="${escapeAttr(key)}" rows="3"${ph}>${escapeHtml(value)}</textarea>`
      : `<input class="fval" data-key="${escapeAttr(key)}" value="${escapeAttr(value)}"${ph} />`;
    return `<label class="field"><span class="fkey">${escapeHtml(key)}</span>${control}</label>`;
  });
  return `<div class="sect">FIELDS</div>${rows.join('')}<div class="form-note" id="form-note"></div>`;
}

function diagHtml(block: RawBlock | undefined): string {
  if (!block) return '';
  const diags = model.state.result.diagnostics.filter(
    (d) =>
      (d.span.startLine <= block.endLine && d.span.endLine >= block.startLine) ||
      d.subjectIds.includes(block.id),
  );
  if (diags.length === 0) return '';
  const rows = diags.map(
    (d) =>
      `<div class="diag s-${d.severity}"><span class="dcode">${escapeHtml(d.code)}</span>${escapeHtml(d.message)}</div>`,
  );
  return `<div class="sect">DIAGNOSTICS · ${diags.length}</div>${rows.join('')}`;
}

export function renderInspector(id: string | null): void {
  const { inspectorBody } = deps;
  const activeKey =
    document.activeElement instanceof HTMLElement && inspectorBody.contains(document.activeElement)
      ? document.activeElement.dataset.key
      : undefined;

  if (!id) {
    inspectorBody.innerHTML = '<div class="empty">Click a node. Esc clears the selection.</div>';
    deps.showPreview(null, null);
    return;
  }
  const node = model.state.nodeById.get(id)!;
  const block = model.state.blockById.get(id);
  const outs = model.state.outOf.get(id) ?? [];
  const ins = model.state.inOf.get(id) ?? [];
  // SB-055: the surface preview re-renders with the inspector — the same
  // funnel covers clicks, script-driven selects, and live recompiles.
  deps.showPreview(node.stub ? null : id, node.stub ? null : node.kind);
  // SB-055: one computed sentence answering "what opens this?" — from the
  // emitted predicates/effects, not the raw markup fields.
  const unlock = node.stub ? '' : unlockSentence(id, node.kind, model.state.result.slice);
  inspectorBody.innerHTML = `
    <div class="kind" style="color:var(${KIND_VAR[node.kind]})">${KIND_LABEL[node.kind]}${node.stub ? ' · STUB' : ''}</div>
    <div class="iid">${id}</div>
    <div class="isub">${escapeHtml(node.sub)}</div>
    ${unlock ? `<div class="sect">WHAT OPENS THIS</div><div class="unlock">${escapeHtml(unlock)}</div>` : ''}
    ${block ? formHtml(node, block) : node.stub ? '' : `<div class="ititle">${escapeHtml(node.title)}</div>`}
    ${
      node.stub
        ? `<div class="form-note">Named in the script but never defined — the compiler keeps it as a stub.</div>
    <div class="iactions">
      <button class="ibtn" id="i-create-stub">create the block</button>
    </div>`
        : ''
    }
    ${diagHtml(block)}
    <div class="sect">OPENS / FEEDS · ${outs.length}</div>
    ${outs.map((e) => relRow(e, e.to)).join('') || '<div class="empty">nothing — dead end?</div>'}
    <div class="sect">FED BY · ${ins.length}</div>
    ${ins.map((e) => relRow(e, e.from)).join('') || '<div class="empty">no inbound — entry point</div>'}
    ${
      block && block.type !== 'case'
        ? `<div class="sect">ACTIONS</div>
    <div class="iactions">
      <button class="ibtn" id="i-dup">duplicate</button>
      <button class="ibtn danger" id="i-del">delete</button>
    </div>`
        : ''
    }`;
  document.getElementById('i-dup')?.addEventListener('click', () => {
    const res = editing.duplicateNode(id);
    if (!res.ok && res.reason) deps.showTip(res.reason);
  });
  document.getElementById('i-del')?.addEventListener('click', () => editing.requestDelete(id));
  document.getElementById('i-create-stub')?.addEventListener('click', () => {
    const res = editing.createFromStub(id);
    if (!res.ok && res.reason) deps.showTip(res.reason);
  });
  inspectorBody.querySelectorAll<HTMLElement>('[data-goto]').forEach((el) =>
    el.addEventListener('click', () => {
      const target = el.dataset.goto!;
      model.setSelected(target);
      deps.centerOn(target);
    }),
  );
  inspectorBody.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('.fval').forEach((el) => {
    el.addEventListener('change', () => editing.commitField(id, el.dataset.key!, el.value));
    el.addEventListener('input', () => editing.stashDraft(id, el.dataset.key!, el.value));
    if (el instanceof HTMLInputElement)
      el.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') el.blur();
      });
  });
  if (activeKey) {
    inspectorBody
      .querySelector<HTMLInputElement | HTMLTextAreaElement>(`.fval[data-key="${activeKey}"]`)
      ?.focus();
  }
}

export function renderDeleteConfirm(): void {
  const pending = editing.getPendingDelete();
  if (!pending) return;
  const { id, family, refs } = pending;
  const rows = refs
    .map(
      (ref) => `<div class="rel">
        <span class="via">${ref.action === 'report' ? 'not cleaned' : 'cleaned'}</span>
        <span>${escapeHtml(ref.blockId)}</span>
        <span class="rtitle">${escapeHtml(ref.key)} → ${escapeHtml(ref.targetId)}</span>
      </div>`,
    )
    .join('');
  deps.inspectorBody.innerHTML = `
    <div class="kind" style="color:var(--danger)">DELETE</div>
    <div class="iid">${escapeHtml(id)}</div>
    ${family.length > 1 ? `<div class="isub">also deletes ${family.length - 1} facts under the document</div>` : ''}
    <div class="sect">INCOMING REFERENCES · ${refs.length}</div>
    ${rows}
    <div class="form-note">"not cleaned" references stay dangling — the compiler flags them.</div>
    <div class="iactions">
      <button class="ibtn danger" id="del-confirm">delete and clean up</button>
      <button class="ibtn" id="del-cancel">cancel</button>
    </div>`;
  document.getElementById('del-confirm')?.addEventListener('click', editing.confirmDelete);
  document.getElementById('del-cancel')?.addEventListener('click', editing.cancelDelete);
}
