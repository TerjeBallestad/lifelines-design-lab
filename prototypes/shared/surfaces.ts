// SB-082: the pure player-surface renderers, shared by the canvas rail, the
// script lens, and the coming Playtest lens. Extracted from canvas/preview.ts
// (itself a port of script-editor/main.ts).
//
// Every renderer is a pure function of (id, CompileResult) returning
// { title, template } — a lit-html TemplateResult, never a DOM write. Each
// lens owns its own mount and calls render(template, host). lit escapes
// every interpolation by construction, so there is no escape helper here.
//
// The card markup is a deliberate mirror of the Godot surfaces
// (hand_card.tscn, canvas_detail_panel.gd); the CSS lives in surfaces.css.
import { html, nothing } from 'lit-html';
import type { TemplateResult } from 'lit-html';
import type { CompileResult } from '../../src/compiler/index.ts';
import { buildDocPreviewHtml } from './doc-preview.ts';
import type { NodeKind } from './node-kind.ts';

export interface Surface {
  title: string;
  template: TemplateResult;
  /** Present on a document surface: the sheet the lens must wire into the
   *  template's iframe (wireDocFrame) after rendering. */
  doc?: { html: string; width: number };
}

/** The FUNN hand card — the in-game desk fact card (hand_card.tscn look). */
export function funnCard(quote: string, sourceTitle: string | null): TemplateResult {
  return html`<div class="funn-card">
    <div class="funn-rule"></div>
    <div class="funn-stamp">FUNN</div>
    <div class="funn-quote">«${quote}»</div>
    <div class="funn-source">${sourceTitle || '—'}</div>
  </div>`;
}

/** The canvas detail panel — canvas_detail_panel.gd's paper record. */
export function detailPanel(opts: {
  kind: string;
  title: string;
  meta?: string;
  body?: string;
  quote?: string;
  extra?: string;
}): TemplateResult {
  return html`<div class="detail-panel">
    <div class="dp-kind">${opts.kind}</div>
    <div class="dp-title">${opts.title}</div>
    ${opts.meta ? html`<div class="dp-meta">${opts.meta}</div>` : nothing}
    ${opts.body ? html`<div class="dp-body">${opts.body}</div>` : nothing}
    ${opts.quote ? html`<div class="dp-quote">«${opts.quote}»</div>` : nothing}
    ${opts.extra ? html`<div class="dp-extra">${opts.extra}</div>` : nothing}
  </div>`;
}

/** Frank's line when the card is played, with its surface label. */
function frankLine(text: string | undefined | null): TemplateResult | typeof nothing {
  if (!text) return nothing;
  return html`<div class="surface-label">frank — when the card is played</div>
    <div class="frank-line">${text}</div>`;
}

export function emptySurface(): Surface {
  return {
    title: 'GAME SURFACE',
    template: html`<div class="empty">Click a node to see what the player sees.</div>`,
  };
}

export function factSurface(id: string, result: CompileResult): Surface {
  const { slice } = result;
  const fact = slice.facts.find((f) => f.id === id);
  if (!fact) return fallbackJsonSurface(id, 'fact', result);
  const sourceDoc = slice.documents.find((d) => d.id === fact.source_document_id);
  const metaBits = [fact.category, fact.domain, sourceDoc ? `Kilde: ${sourceDoc.title}` : '']
    .filter(Boolean)
    .join(' · ');
  // The FUNN hand card (desk) + the FAKTUM detail panel (deduction canvas):
  // the two places the player reads this fact back.
  return {
    title: `GAME SURFACE — ${id.toUpperCase()}`,
    template: html`<div class="surface-label">hand card — the desk</div>
      ${funnCard(fact.quote || fact.summary, sourceDoc?.title ?? null)}
      <div class="surface-label">detail panel — the deduction canvas</div>
      ${detailPanel({
        kind: 'FAKTUM',
        title: fact.label,
        meta: metaBits,
        body: fact.summary,
        quote: fact.quote,
      })}
      ${frankLine(fact.frank_response)}`,
  };
}

export function documentSurface(id: string, result: CompileResult): Surface {
  const doc = result.labContent.documents[id];
  if (!doc) return fallbackJsonSurface(id, 'document', result);
  const { html: sheetHtml, width, kindUsed, fallback } = buildDocPreviewHtml(id, doc as never);
  return {
    title: `GAME SURFACE — ${id.toUpperCase()}`,
    template: html`${fallback
        ? html`<div class="surface-label" style="color:var(--orange)">
            no template for ${doc.kind} — showing ${kindUsed}
          </div>`
        : html`<div class="surface-label">document sheet — as baked for the game</div>`}
      <div class="doc-frame-wrap"><iframe class="doc-frame" title=${id}></iframe></div>
      <div class="lb-hint">
        click the page to read it full size · click a highlight to jump to its fact
      </div>`,
    doc: { html: sheetHtml, width },
  };
}

export function hypothesisSurface(id: string, result: CompileResult): Surface {
  const { slice } = result;
  const h = slice.hypotheses.find((x) => x.id === id);
  if (!h) return fallbackJsonSurface(id, 'hypothesis', result);
  const basisIds: string[] = [];
  const walk = (p: { op: string; args?: Record<string, unknown>; children?: unknown[] }) => {
    if (p.op === 'fact_lifted') basisIds.push(String(p.args?.fact_id ?? ''));
    for (const child of (p.children ?? []) as never[]) walk(child);
  };
  if (h.availability) walk(h.availability);
  const basis = basisIds
    .map((fid) => slice.facts.find((f) => f.id === fid)?.label ?? fid)
    .filter(Boolean);
  return {
    title: `GAME SURFACE — ${id.toUpperCase()}`,
    template: html`<div class="surface-label">detail panel — the deduction canvas</div>
      ${detailPanel({
        kind: 'TOLKNING',
        title: h.title,
        body: h.summary,
        extra: basis.length ? `Sterkt grunnlag:\n${basis.join('\n')}` : undefined,
      })}`,
  };
}

export function questionSurface(id: string, result: CompileResult): Surface {
  const { slice } = result;
  const q = slice.questions.find((x) => x.id === id);
  if (!q) return fallbackJsonSurface(id, 'question', result);
  return {
    title: `GAME SURFACE — ${id.toUpperCase()}`,
    template: html`<div class="surface-label">question card — the deduction canvas</div>
      ${detailPanel({
        kind: 'SPØRSMÅL',
        title: q.card_title || q.prompt,
        body: q.card_title ? q.prompt : undefined,
        quote: q.teaser || undefined,
      })}
      ${frankLine(q.frank_response)}`,
  };
}

export function fallbackJsonSurface(id: string, kind: string, result: CompileResult): Surface {
  const { slice, labContent } = result;
  const pools = [
    slice.tiltak,
    slice.dispatches,
    slice.clocks,
    slice.day_script_beats,
    slice.recipes ?? [],
    slice.frank_proposals ?? [],
  ] as unknown as Array<Array<Record<string, unknown>>>;
  let node: unknown = null;
  for (const pool of pools) {
    node =
      pool.find((n) => n.id === id) ??
      pool.find((n) => n.handbok_id === id) ??
      pool.find(
        (n) =>
          Array.isArray(n.pair) && `${(n.pair as string[])[0]} + ${(n.pair as string[])[1]}` === id,
      ) ??
      null;
    if (node) break;
  }
  if (!node && id.startsWith('call:'))
    node = (slice.calls ?? []).find((c) => `call:${c.contact_id}` === id) ?? null;
  if (!node && id === 'chat:frank') node = slice.frank_chat ?? null;
  if (!node) node = labContent.facts[id] ?? null;
  // The json div is white-space: pre-wrap — the interpolation must stay the
  // element's only content, with no template indentation around it.
  const json = node
    ? JSON.stringify(node, null, 2)
    : 'No compiled node for this id (a stub, or parsed but not emitted).';
  return {
    title: `GAME SURFACE — ${id.toUpperCase()}`,
    template: html`<div class="surface-label">
        no player-facing surface — compiled output (${kind})
      </div>
      <div class="node-card"><div class="node-json">${json}</div></div>`,
  };
}

/** One dispatcher for a lens's "show this node": the player surface for the
 *  kinds that have one, the compiled JSON for the kinds that do not yet. */
export function surfaceFor(
  id: string | null,
  kind: NodeKind | null,
  result: CompileResult,
): Surface {
  if (id === null || kind === null) return emptySurface();
  switch (kind) {
    case 'fact':
      return factSurface(id, result);
    case 'document':
      return documentSurface(id, result);
    case 'hypothesis':
      return hypothesisSurface(id, result);
    case 'question':
      return questionSurface(id, result);
    default:
      return fallbackJsonSurface(id, kind, result);
  }
}
