// The inspector: per-kind edit forms (SB-032), the relation rows, the
// diagnostics section, and the delete-confirm surface. Reads the model,
// writes through editing.ts; the shell injects selection/navigation and
// the SB-055 preview handle.
//
// SB-079: lit-html templates rendered into the panel host. Handlers live
// in the templates, so there is no re-attach pass after a render. lit
// diffs the DOM, so a field keeps its element identity across the
// recompile re-render — focus survives without the old activeKey hack.
import { html, render, nothing } from 'lit-html';
import type { TemplateResult } from 'lit-html';
import type { RawBlock } from '../../src/compiler/parse.ts';
import type { GraphNode, GraphEdge, NodeKind } from './graph.ts';
import { KIND_LABEL, KIND_VAR } from './kinds.ts';
import * as model from './model.ts';
import * as editing from './editing.ts';
import { fieldRows } from '../shared/field-form.ts';
import { unlockSentence } from '../shared/unlock.ts';

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

function relRow(edge: GraphEdge, otherId: string): TemplateResult {
  const other = model.state.nodeById.get(otherId)!;
  const goto = () => {
    model.setSelected(otherId);
    deps.centerOn(otherId);
  };
  return html`<div class="rel" data-goto="${otherId}" @click=${goto}>
    <span class="via">${edge.label || 'carries'}</span>
    <span style="color:var(${KIND_VAR[other.kind]})">${otherId}</span>
    <span class="rtitle">${other.title}</span>
  </div>`;
}

function formTemplate(node: GraphNode, block: RawBlock): TemplateResult {
  if (
    block.type === 'beat' ||
    block.type === 'conversation' ||
    block.type === 'recipe' ||
    block.type === 'proposal'
  ) {
    return html`<div class="form-note">
      Prose/weave block — edit it in the script pane (click jumped there already).
    </div>`;
  }
  // SB-063: the rows render via the shared field form — the playtest drawer
  // shows the same form; only the commit tail is canvas-specific.
  const rows = fieldRows(node.kind, block, {
    commit: (key, value) => editing.commitField(node.id, key, value),
    stash: (key, value) => editing.stashDraft(node.id, key, value),
  });
  return html`<div class="sect">FIELDS</div>
    ${rows}
    <div class="form-note" id="form-note"></div>`;
}

function diagTemplate(block: RawBlock | undefined): TemplateResult | typeof nothing {
  if (!block) return nothing;
  const diags = model.state.result.diagnostics.filter(
    (d) =>
      (d.span.startLine <= block.endLine && d.span.endLine >= block.startLine) ||
      d.subjectIds.includes(block.id),
  );
  if (diags.length === 0) return nothing;
  return html`<div class="sect">DIAGNOSTICS · ${diags.length}</div>
    ${diags.map(
      (d) =>
        html`<div class="diag s-${d.severity}">
          <span class="dcode">${d.code}</span>${d.message}
        </div>`,
    )}`;
}

export function renderInspector(id: string | null): void {
  const { inspectorBody } = deps;
  if (!id) {
    render(html`<div class="empty">Click a node. Esc clears the selection.</div>`, inspectorBody);
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
  const duplicate = () => {
    const res = editing.duplicateNode(id);
    if (!res.ok && res.reason) deps.showTip(res.reason);
  };
  const createStub = () => {
    const res = editing.createFromStub(id);
    if (!res.ok && res.reason) deps.showTip(res.reason);
  };
  render(
    html`
      <div class="kind" style="color:var(${KIND_VAR[node.kind]})">
        ${KIND_LABEL[node.kind]}${node.stub ? ' · STUB' : ''}
      </div>
      <div class="iid">${id}</div>
      <div class="isub">${node.sub}</div>
      ${unlock
        ? html`<div class="sect">WHAT OPENS THIS</div>
            <div class="unlock">${unlock}</div>`
        : nothing}
      ${block
        ? formTemplate(node, block)
        : node.stub
          ? nothing
          : html`<div class="ititle">${node.title}</div>`}
      ${node.stub
        ? html`<div class="form-note">
              Named in the script but never defined — the compiler keeps it as a stub.
            </div>
            <div class="iactions">
              <button class="ibtn" id="i-create-stub" @click=${createStub}>create the block</button>
            </div>`
        : nothing}
      ${diagTemplate(block)}
      <div class="sect">OPENS / FEEDS · ${outs.length}</div>
      ${outs.length
        ? outs.map((e) => relRow(e, e.to))
        : html`<div class="empty">nothing — dead end?</div>`}
      <div class="sect">FED BY · ${ins.length}</div>
      ${ins.length
        ? ins.map((e) => relRow(e, e.from))
        : html`<div class="empty">no inbound — entry point</div>`}
      ${block && block.type !== 'case'
        ? html`<div class="sect">ACTIONS</div>
            <div class="iactions">
              <button class="ibtn" id="i-dup" @click=${duplicate}>duplicate</button>
              <button class="ibtn danger" id="i-del" @click=${() => editing.requestDelete(id)}>
                delete
              </button>
            </div>`
        : nothing}
    `,
    inspectorBody,
  );
}

export function renderDeleteConfirm(): void {
  const pending = editing.getPendingDelete();
  if (!pending) return;
  const { id, family, refs } = pending;
  render(
    html`
      <div class="kind" style="color:var(--danger)">DELETE</div>
      <div class="iid">${id}</div>
      ${family.length > 1
        ? html`<div class="isub">also deletes ${family.length - 1} facts under the document</div>`
        : nothing}
      <div class="sect">INCOMING REFERENCES · ${refs.length}</div>
      ${refs.map(
        (ref) =>
          html`<div class="rel">
            <span class="via">${ref.action === 'report' ? 'not cleaned' : 'cleaned'}</span>
            <span>${ref.blockId}</span>
            <span class="rtitle">${ref.key} → ${ref.targetId}</span>
          </div>`,
      )}
      <div class="form-note">"not cleaned" references stay dangling — the compiler flags them.</div>
      <div class="iactions">
        <button class="ibtn danger" id="del-confirm" @click=${editing.confirmDelete}>
          delete and clean up
        </button>
        <button class="ibtn" id="del-cancel" @click=${editing.cancelDelete}>cancel</button>
      </div>
    `,
    deps.inspectorBody,
  );
}
