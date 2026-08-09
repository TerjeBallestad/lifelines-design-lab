// SB-055 probe — the game-surface preview pane. The right rail's top half
// renders the selected node the way the PLAYER meets it: a fact shows the
// FUNN hand card plus the canvas detail panel, a document shows the real
// bake-template sheet, a hypothesis shows its TOLKNING detail panel. Kinds
// without a player-facing surface fall back to the compiled JSON so "what
// the sim reads" is still one glance away.
//
// The card/doc renderers are ports of prototypes/script-editor/main.ts
// (renderFactCard/renderDocPreview/wireDocFrame); the detail panels mirror
// core-loop scripts/ui/canvas_detail_panel.gd (FAKTUM/TOLKNING).
import { buildDocPreviewHtml, injectEditorFonts } from '../script-editor/doc-preview.ts';
import type { CompileResult } from '../../src/compiler/index.ts';
import type { NodeKind } from './graph.ts';

export interface PreviewDeps {
  host: HTMLElement;
  titleEl: HTMLElement;
  lightbox: HTMLElement;
  getResult(): CompileResult;
  /** Select + center the node on the canvas (facts inside a doc sheet jump). */
  onJump(id: string): void;
}

export interface PreviewApi {
  /** Render the surface for a node (null clears). Re-call after recompiles. */
  show(id: string | null, kind: NodeKind | null): void;
}

const esc = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export function initPreview(deps: PreviewDeps): PreviewApi {
  injectEditorFonts();
  const { host, titleEl, lightbox } = deps;

  function empty(): void {
    titleEl.textContent = 'GAME SURFACE';
    host.innerHTML = '<div class="empty">Click a node to see what the player sees.</div>';
  }

  // ---- shared iframe wiring (port of the script probe's wireDocFrame) ----
  function wireDocFrame(
    iframe: HTMLIFrameElement,
    wrap: HTMLElement,
    html: string,
    width: number,
    focusFact: string | null,
    onPageClick: (() => void) | null,
  ): void {
    iframe.style.width = `${width}px`;
    iframe.addEventListener('load', () => {
      const idoc = iframe.contentDocument;
      if (!idoc) return;
      if (focusFact) idoc.querySelector(`[data-fact-id="${focusFact}"]`)?.classList.add('focus');
      if (onPageClick) idoc.body.style.cursor = 'zoom-in';
      idoc.addEventListener('click', (ev) => {
        const el = (ev.target as HTMLElement).closest('[data-fact-id]');
        const factId = el?.getAttribute('data-fact-id');
        if (factId) {
          closeLightbox();
          deps.onJump(factId);
        } else if (onPageClick) {
          onPageClick();
        }
      });
      const fit = () => {
        const h = idoc.body?.scrollHeight ?? 0;
        const scale = Math.min(1, wrap.clientWidth / width);
        iframe.style.height = `${h}px`;
        iframe.style.transform = `scale(${scale})`;
        wrap.style.height = `${h * scale}px`;
      };
      fit();
      idoc.fonts?.ready.then(fit).catch(() => {});
    });
    iframe.srcdoc = html;
  }

  function openLightbox(html: string, width: number, focusFact: string | null): void {
    lightbox.innerHTML = `<div class="lb-inner"><iframe title="document"></iframe></div>`;
    lightbox.classList.add('open');
    const inner = lightbox.querySelector('.lb-inner') as HTMLElement;
    inner.style.width = `${Math.min(width, window.innerWidth * 0.86)}px`;
    wireDocFrame(inner.querySelector('iframe')!, inner, html, width, focusFact, null);
  }
  function closeLightbox(): void {
    lightbox.classList.remove('open');
    lightbox.innerHTML = '';
  }
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('open')) closeLightbox();
  });

  // ---- detail panel (canvas_detail_panel.gd: FAKTUM / TOLKNING / …) ------
  function detailPanel(opts: {
    kind: string;
    title: string;
    meta?: string;
    body?: string;
    quote?: string;
    extra?: string;
  }): string {
    return (
      `<div class="detail-panel">` +
      `<div class="dp-kind">${esc(opts.kind)}</div>` +
      `<div class="dp-title">${esc(opts.title)}</div>` +
      (opts.meta ? `<div class="dp-meta">${esc(opts.meta)}</div>` : '') +
      (opts.body ? `<div class="dp-body">${esc(opts.body)}</div>` : '') +
      (opts.quote ? `<div class="dp-quote">«${esc(opts.quote)}»</div>` : '') +
      (opts.extra ? `<div class="dp-extra">${esc(opts.extra)}</div>` : '') +
      `</div>`
    );
  }

  function showFact(id: string): void {
    const { slice } = deps.getResult();
    const fact = slice.facts.find((f) => f.id === id);
    if (!fact) return fallbackJson(id, 'fact');
    titleEl.textContent = `GAME SURFACE — ${id.toUpperCase()}`;
    const sourceDoc = slice.documents.find((d) => d.id === fact.source_document_id);
    const metaBits = [fact.category, fact.domain, sourceDoc ? `Kilde: ${sourceDoc.title}` : '']
      .filter(Boolean)
      .join(' · ');
    // The FUNN hand card (desk) + the FAKTUM detail panel (deduction canvas):
    // the two places the player reads this fact back.
    host.innerHTML =
      `<div class="surface-label">hand card — the desk</div>` +
      `<div class="funn-card">` +
      `<div class="funn-rule"></div>` +
      `<div class="funn-stamp">FUNN</div>` +
      `<div class="funn-quote">«${esc(fact.quote || fact.summary)}»</div>` +
      `<div class="funn-source">${esc(sourceDoc?.title || '—')}</div>` +
      `</div>` +
      `<div class="surface-label">detail panel — the deduction canvas</div>` +
      detailPanel({
        kind: 'FAKTUM',
        title: fact.label,
        meta: metaBits,
        body: fact.summary,
        quote: fact.quote,
      }) +
      (fact.frank_response
        ? `<div class="surface-label">frank — when the card is played</div>` +
          `<div class="frank-line">${esc(fact.frank_response)}</div>`
        : '');
  }

  function showDocument(id: string): void {
    const result = deps.getResult();
    const doc = result.labContent.documents[id];
    if (!doc) return fallbackJson(id, 'document');
    titleEl.textContent = `GAME SURFACE — ${id.toUpperCase()}`;
    const { html, width, kindUsed, fallback } = buildDocPreviewHtml(id, doc as never);
    host.innerHTML =
      (fallback
        ? `<div class="surface-label" style="color:var(--orange)">no template for ${esc(doc.kind)} — showing ${esc(kindUsed)}</div>`
        : `<div class="surface-label">document sheet — as baked for the game</div>`) +
      `<div class="doc-frame-wrap"><iframe id="doc-frame" title="${esc(id)}"></iframe></div>` +
      `<div class="lb-hint">click the page to read it full size · click a highlight to jump to its fact</div>`;
    const wrap = host.querySelector('.doc-frame-wrap') as HTMLElement;
    const iframe = host.querySelector('#doc-frame') as HTMLIFrameElement;
    wireDocFrame(iframe, wrap, html, width, null, () => openLightbox(html, width, null));
  }

  function showHypothesis(id: string): void {
    const { slice } = deps.getResult();
    const h = slice.hypotheses.find((x) => x.id === id);
    if (!h) return fallbackJson(id, 'hypothesis');
    titleEl.textContent = `GAME SURFACE — ${id.toUpperCase()}`;
    const basisIds: string[] = [];
    const walk = (p: { op: string; args?: Record<string, unknown>; children?: unknown[] }) => {
      if (p.op === 'fact_lifted') basisIds.push(String(p.args?.fact_id ?? ''));
      for (const child of (p.children ?? []) as never[]) walk(child);
    };
    if (h.availability) walk(h.availability);
    const basis = basisIds
      .map((fid) => slice.facts.find((f) => f.id === fid)?.label ?? fid)
      .filter(Boolean);
    host.innerHTML =
      `<div class="surface-label">detail panel — the deduction canvas</div>` +
      detailPanel({
        kind: 'TOLKNING',
        title: h.title,
        body: h.summary,
        extra: basis.length ? `Sterkt grunnlag:\n${basis.join('\n')}` : undefined,
      });
  }

  function showQuestion(id: string): void {
    const { slice } = deps.getResult();
    const q = slice.questions.find((x) => x.id === id);
    if (!q) return fallbackJson(id, 'question');
    titleEl.textContent = `GAME SURFACE — ${id.toUpperCase()}`;
    host.innerHTML =
      `<div class="surface-label">question card — the deduction canvas</div>` +
      detailPanel({
        kind: 'SPØRSMÅL',
        title: q.card_title || q.prompt,
        body: q.card_title ? q.prompt : undefined,
        quote: q.teaser || undefined,
      }) +
      (q.frank_response
        ? `<div class="surface-label">frank — when the card is played</div>` +
          `<div class="frank-line">${esc(q.frank_response)}</div>`
        : '');
  }

  function fallbackJson(id: string, kind: string): void {
    const { slice, labContent } = deps.getResult();
    titleEl.textContent = `GAME SURFACE — ${id.toUpperCase()}`;
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
            Array.isArray(n.pair) &&
            `${(n.pair as string[])[0]} + ${(n.pair as string[])[1]}` === id,
        ) ??
        null;
      if (node) break;
    }
    if (!node && id.startsWith('call:'))
      node = (slice.calls ?? []).find((c) => `call:${c.contact_id}` === id) ?? null;
    if (!node && id === 'chat:frank') node = slice.frank_chat ?? null;
    if (!node) node = labContent.facts[id] ?? null;
    host.innerHTML =
      `<div class="surface-label">no player-facing surface — compiled output (${esc(kind)})</div>` +
      `<div class="node-card"><div class="node-json">${
        node
          ? esc(JSON.stringify(node, null, 2))
          : 'No compiled node for this id (a stub, or parsed but not emitted).'
      }</div></div>`;
  }

  return {
    show(id, kind) {
      if (id === null || kind === null) return empty();
      switch (kind) {
        case 'fact':
          return showFact(id);
        case 'document':
          return showDocument(id);
        case 'hypothesis':
          return showHypothesis(id);
        case 'question':
          return showQuestion(id);
        default:
          return fallbackJson(id, kind);
      }
    },
  };
}
