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
import type { CompileResult, EffectSpec } from '../../src/compiler/index.ts';
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

// ---- SB-061 Task 1: the kinds that used to fall to fallbackJsonSurface ----

/** One compiled effect as a data line — shown, never evaluated (SB-058). */
function effectLine(effect: EffectSpec): TemplateResult {
  const args = Object.entries(effect.args)
    .map(([key, value]) => `${key}=${String(value)}`)
    .join(' ');
  const text = `~ ${effect.op}${args ? ` ${args}` : ''}`;
  return html`<div class="effect-line">${text}</div>`;
}

function effectList(effects: EffectSpec[]): TemplateResult | typeof nothing {
  if (!effects.length) return nothing;
  return html`<div class="surface-label">effects — as data, not evaluated</div>
    <div class="effect-list">${effects.map(effectLine)}</div>`;
}

/** A predicate shown as data (gates, needs) — same law as effectLine. */
function gateLine(label: string, spec: unknown): TemplateResult | typeof nothing {
  if (!spec) return nothing;
  const text = `${label}: ${JSON.stringify(spec)}`;
  return html`<div class="gate-line">${text}</div>`;
}

export function tiltakSurface(id: string, result: CompileResult): Surface {
  const t = result.slice.tiltak.find((x) => x.id === id);
  if (!t) return fallbackJsonSurface(id, 'tiltak', result);
  const metaBits = [`slot ${t.slot}`, `kost ${t.cost}`, t.weight ? `vekt ${t.weight}` : '']
    .filter(Boolean)
    .join(' · ');
  return {
    title: `GAME SURFACE — ${id.toUpperCase()}`,
    template: html`<div class="surface-label">tiltak card — the vurdering</div>
      ${detailPanel({ kind: 'TILTAK', title: t.title, meta: metaBits, body: t.description })}`,
  };
}

export function dispatchSurface(id: string, result: CompileResult): Surface {
  const d = result.slice.dispatches.find((x) => x.id === id);
  if (!d) return fallbackJsonSurface(id, 'dispatch', result);
  const metaBits = [
    d.activity_title,
    d.duration_h !== undefined ? `${d.duration_h}t` : '',
    d.occupies_hours !== undefined ? `opptar ${d.occupies_hours}t` : '',
    d.channel,
    d.channel_delay_minutes !== undefined ? `+${d.channel_delay_minutes}min` : '',
  ]
    .filter(Boolean)
    .join(' · ');
  return {
    title: `GAME SURFACE — ${id.toUpperCase()}`,
    template: html`<div class="surface-label">dispatch — frank's desk action</div>
      ${detailPanel({ kind: 'HANDLING', title: d.title, meta: metaBits, body: d.description })}
      ${gateLine('gate', d.gate)} ${effectList(d.effects)}`,
  };
}

export function clockSurface(id: string, result: CompileResult): Surface {
  const c = result.slice.clocks.find((x) => x.id === id);
  if (!c) return fallbackJsonSurface(id, 'clock', result);
  // SB-058 ruling 1: the dial is DEAD — labels and both segments visible,
  // needle never moves, nothing ticks.
  return {
    title: `GAME SURFACE — ${id.toUpperCase()}`,
    template: html`<div class="surface-label">clock — dead dial, the needle never moves</div>
      <div class="clock-dial">
        <div class="clock-label">${c.label}</div>
        <div class="clock-question">${c.question}</div>
        <div class="clock-track">
          <div class="clock-seg clock-seg-good" style="flex-grow: ${c.good_segment_size}">
            <span class="seg-label">${c.good_segment_label}</span>
            <span class="seg-size">${c.good_segment_size}</span>
          </div>
          <div class="clock-seg clock-seg-bad" style="flex-grow: ${c.bad_segment_size}">
            <span class="seg-label">${c.bad_segment_label}</span>
            <span class="seg-size">${c.bad_segment_size}</span>
          </div>
        </div>
        ${c.max_value !== undefined
          ? html`<div class="clock-meta">maks ${c.max_value}</div>`
          : nothing}
      </div>
      ${gateLine('visibility', c.visibility)}`,
  };
}

/** The chat transcript idiom (SB-062 ruling 2, demoted to render inspiration):
 *  question chips, answer lines, followups — a static reading of the weave. */
function chatTranscript(result: CompileResult): Surface {
  const entries = result.slice.frank_chat ?? [];
  return {
    title: 'GAME SURFACE — CHAT:FRANK',
    template: html`<div class="surface-label">chat — frank's transcript, every entry</div>
      ${entries.map(
        (entry) =>
          html`<div class="chat-entry">
            <div class="chat-question">${entry.question}</div>
            ${entry.answer_lines.map((line) => html`<div class="chat-answer">${line}</div>`)}
            ${entry.followups.map(
              (followup) =>
                html`<div class="chat-followup">
                  <div class="chat-followup-label">${followup.label}</div>
                  ${followup.lines.map((line) => html`<div class="chat-answer">${line}</div>`)}
                  ${followup.tanke
                    ? html`<div class="chat-tanke">Tanke: «${followup.tanke}»</div>`
                    : nothing}
                </div>`,
            )}
            <div class="gate-line">
              ${[
                entry.needs.length ? `needs: ${entry.needs.join(', ')}` : '',
                entry.pays_fact ? `pays: ${entry.pays_fact}` : '',
              ]
                .filter(Boolean)
                .join(' · ') || 'no needs, pays nothing'}
            </div>
          </div>`,
      )}`,
  };
}

/** The card-keyed exchange idiom (SB-062 ruling 2): opening lines, then
 *  exchanges keyed by card_id — static display, never interactive. */
function callTranscript(contactId: string, result: CompileResult): Surface {
  const call = (result.slice.calls ?? []).find((c) => c.contact_id === contactId);
  if (!call) return fallbackJsonSurface(`call:${contactId}`, 'conversation', result);
  const line = (l: { who?: string; text: string; fact_id?: string }) =>
    html`<div class="call-line">
      ${l.who ? html`<span class="call-who">${l.who}:</span>` : nothing}
      <span>${l.text}</span>
      ${l.fact_id ? html`<span class="fact-tag">${l.fact_id}</span>` : nothing}
    </div>`;
  return {
    title: `GAME SURFACE — CALL:${contactId.toUpperCase()}`,
    template: html`<div class="surface-label">call — ${contactId}, opening</div>
      ${gateLine('gate', call.gate)}
      <div class="call-block">${call.opening.map(line)}</div>
      ${call.soft_reject
        ? html`<div class="surface-label">soft reject — when the card does not land</div>
            <div class="call-block"><div class="call-line">${call.soft_reject}</div></div>`
        : nothing}
      ${call.exchanges.map(
        (exchange) =>
          html`<div class="call-exchange">
            <div class="fact-tag">${exchange.card_id}</div>
            <div class="call-line">
              <span class="call-who">du:</span> <span>${exchange.ask}</span>
            </div>
            ${exchange.reply.map(line)}
          </div>`,
      )}`,
  };
}

export function conversationSurface(id: string, result: CompileResult): Surface {
  if (id === 'chat:frank') return chatTranscript(result);
  if (id.startsWith('call:')) return callTranscript(id.slice('call:'.length), result);
  return fallbackJsonSurface(id, 'conversation', result);
}

export function recipeSurface(id: string, result: CompileResult): Surface {
  const recipe = (result.slice.recipes ?? []).find((r) => `${r.pair[0]} + ${r.pair[1]}` === id);
  if (!recipe) return fallbackJsonSurface(id, 'recipe', result);
  return {
    title: `GAME SURFACE — ${id.toUpperCase()}`,
    template: html`<div class="surface-label">recipe — two facts crafted on the canvas</div>
      ${detailPanel({
        kind: 'KOBLING',
        title: `${recipe.pair[0]} + ${recipe.pair[1]}`,
        meta: `åpner ${recipe.question_id}`,
        quote: recipe.reading,
      })}
      <div class="surface-label">frank — when the pair is crafted</div>
      ${recipe.frank_lines.map((l) => html`<div class="frank-line">${l}</div>`)}`,
  };
}

export function proposalSurface(id: string, result: CompileResult): Surface {
  const p = (result.slice.frank_proposals ?? []).find((x) => x.handbok_id === id);
  if (!p) return fallbackJsonSurface(id, 'proposal', result);
  const extraBits = [
    p.relevant_fact_ids?.length ? `Relevant: ${p.relevant_fact_ids.join(', ')}` : '',
    p.relevant_categories?.length ? `Kategorier: ${p.relevant_categories.join(', ')}` : '',
    `Rekkefølge: ${p.order}`,
  ]
    .filter(Boolean)
    .join('\n');
  return {
    title: `GAME SURFACE — ${id.toUpperCase()}`,
    template: html`<div class="surface-label">proposal — frank's handbook suggestion</div>
      ${detailPanel({ kind: 'FORSLAG', title: p.handbok_id, quote: p.line, extra: extraBits })}`,
  };
}

export function beatSurface(id: string, result: CompileResult): Surface {
  const beat = result.slice.day_script_beats.find((b) => b.id === id);
  if (!beat) return fallbackJsonSurface(id, 'day_script_beat', result);
  return {
    title: `GAME SURFACE — ${id.toUpperCase()}`,
    template: html`<div class="surface-label">day-script beat — the scripted day</div>
      ${detailPanel({ kind: 'DAGSSKRIPT', title: `Dag ${beat.day}`, body: beat.text })}
      ${effectList(beat.effects)}`,
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
    case 'tiltak':
      return tiltakSurface(id, result);
    case 'dispatch':
      return dispatchSurface(id, result);
    case 'clock':
      return clockSurface(id, result);
    case 'conversation':
      return conversationSurface(id, result);
    case 'recipe':
      return recipeSurface(id, result);
    case 'proposal':
      return proposalSurface(id, result);
    default:
      return fallbackJsonSurface(id, kind, result);
  }
}
