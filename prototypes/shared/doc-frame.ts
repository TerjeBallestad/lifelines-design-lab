// SB-082: shared document-iframe wiring and the lightbox. Extracted from the
// twin wireDocFrame/openLightbox copies in canvas/preview.ts and
// script-editor/main.ts (byte-identical apart from the jump callback).
//
// The scale policy is a parameter: a rail host downscales the sheet to its
// own width ('fit'); a full-size host (a playtest reading surface) keeps the
// sheet at 1:1 ('full'). The rail's min(1, clientWidth / width) must not be
// baked in (SB-060).

export type DocScale = 'fit' | 'full';

export interface DocFrameOpts {
  /** Highlight this fact's span inside the sheet. */
  focusFact?: string | null;
  /** 'fit' scales the sheet down to the wrap width; 'full' keeps it 1:1. */
  scale?: DocScale;
  /** A click on a [data-fact-id] span inside the sheet. The event rides
   *  along so a lens can split plain click from cmd/ctrl-click (SB-063). */
  onJump?: (factId: string, ev: MouseEvent) => void;
  /** A click anywhere else on the page (rail: open the lightbox). */
  onPageClick?: (() => void) | null;
}

// Re-render guard: under lit the iframe element survives a re-render, so a
// recompile that produces the same sheet must not reload it (the reload
// re-runs fonts + fit and flashes). The map also carries the CURRENT wiring
// for the ONE load listener each iframe ever gets — a rewire to a new sheet
// must never stack a second listener, or one run click fires onJump once per
// sheet ever shown in this iframe (the SB-063 lift-then-jump bug).
interface WiredEntry {
  html: string;
  focus: string | null;
  wrap: HTMLElement;
  width: number;
  scale: DocScale;
  opts: DocFrameOpts;
  loadWired: boolean;
}
const wired = new WeakMap<HTMLIFrameElement, WiredEntry>();

export function wireDocFrame(
  iframe: HTMLIFrameElement,
  wrap: HTMLElement,
  html: string,
  width: number,
  opts: DocFrameOpts = {},
): void {
  const focusFact = opts.focusFact ?? null;
  const scale = opts.scale ?? 'fit';
  const prev = wired.get(iframe);
  wired.set(iframe, {
    html,
    focus: focusFact,
    wrap,
    width,
    scale,
    opts,
    loadWired: prev?.loadWired ?? false,
  });
  if (prev && prev.html === html) {
    // Same sheet — at most the focused fact changed; swap the class in place.
    if (prev.focus !== focusFact) {
      const idoc = iframe.contentDocument;
      idoc?.querySelector('.focus')?.classList.remove('focus');
      if (focusFact) idoc?.querySelector(`[data-fact-id="${focusFact}"]`)?.classList.add('focus');
    }
    return;
  }
  iframe.style.width = `${width}px`;
  if (!prev?.loadWired) {
    wired.get(iframe)!.loadWired = true;
    iframe.addEventListener('load', () => onFrameLoad(iframe));
  }
  iframe.srcdoc = html;
}

/** Runs once per actual load, reading the LATEST wiring from the map — so a
 *  rewire between loads (sheet A → sheet B) hooks the fresh document exactly
 *  once, with the current callbacks. */
function onFrameLoad(iframe: HTMLIFrameElement): void {
  const entry = wired.get(iframe);
  const idoc = iframe.contentDocument;
  if (!entry || !idoc) return;
  if (entry.focus) idoc.querySelector(`[data-fact-id="${entry.focus}"]`)?.classList.add('focus');
  if (entry.opts.onPageClick) idoc.body.style.cursor = 'zoom-in';
  idoc.addEventListener('click', (ev) => {
    const opts = wired.get(iframe)?.opts ?? entry.opts;
    const el = (ev.target as HTMLElement).closest('[data-fact-id]');
    const factId = el?.getAttribute('data-fact-id');
    if (factId) {
      opts.onJump?.(factId, ev as MouseEvent);
    } else if (opts.onPageClick) {
      opts.onPageClick();
    }
  });
  const fit = () => {
    const { wrap, width, scale } = wired.get(iframe) ?? entry;
    const h = idoc.body?.scrollHeight ?? 0;
    const s = scale === 'fit' ? Math.min(1, wrap.clientWidth / width) : 1;
    iframe.style.height = `${h}px`;
    iframe.style.transform = `scale(${s})`;
    wrap.style.height = `${h * s}px`;
  };
  fit();
  // refit once webfonts finish loading (reflow changes page height)
  idoc.fonts?.ready.then(fit).catch(() => {});
}

export interface Lightbox {
  open(html: string, width: number, focusFact: string | null): void;
  close(): void;
}

/** Readable full-size document view over the page. Esc / backdrop click
 *  closes. One per page, bound to the page's #doc-lightbox element.
 *  A run click closes by default (a jump leaves the sheet); the callback
 *  returns 'stay' to keep the sheet up (playtest lift, SB-088). */
export function createLightbox(
  el: HTMLElement,
  onJump?: (factId: string, ev: MouseEvent) => void | 'stay',
): Lightbox {
  function open(html: string, width: number, focusFact: string | null): void {
    el.innerHTML = `<div class="lb-inner"><iframe title="document"></iframe></div>`;
    el.classList.add('open');
    const inner = el.querySelector('.lb-inner') as HTMLElement;
    inner.style.width = `${Math.min(width, window.innerWidth * 0.86)}px`;
    const iframe = inner.querySelector('iframe')!;
    // Keydowns land in the iframe document once the reader clicks the sheet —
    // the window listener below never sees them, so Esc must close from inside.
    iframe.addEventListener('load', () => {
      iframe.contentDocument?.addEventListener('keydown', (ke) => {
        if (ke.key === 'Escape') close();
      });
    });
    wireDocFrame(iframe, inner, html, width, {
      focusFact,
      onJump: (id, ev) => {
        if (onJump?.(id, ev) === 'stay') return;
        close();
      },
    });
  }
  function close(): void {
    el.classList.remove('open');
    el.innerHTML = '';
  }
  el.addEventListener('click', (e) => {
    if (e.target === el) close();
  });
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && el.classList.contains('open')) close();
  });
  return { open, close };
}
