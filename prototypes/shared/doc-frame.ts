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
// re-runs fonts + fit and flashes). Keyed on the wired html + focus fact.
const wired = new WeakMap<HTMLIFrameElement, { html: string; focus: string | null }>();

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
  if (prev && prev.html === html) {
    // Same sheet — at most the focused fact changed; swap the class in place.
    if (prev.focus !== focusFact) {
      const idoc = iframe.contentDocument;
      idoc?.querySelector('.focus')?.classList.remove('focus');
      if (focusFact) idoc?.querySelector(`[data-fact-id="${focusFact}"]`)?.classList.add('focus');
      wired.set(iframe, { html, focus: focusFact });
    }
    return;
  }
  wired.set(iframe, { html, focus: focusFact });
  iframe.style.width = `${width}px`;
  iframe.addEventListener('load', () => {
    const idoc = iframe.contentDocument;
    if (!idoc) return;
    const focus = wired.get(iframe)?.focus ?? null;
    if (focus) idoc.querySelector(`[data-fact-id="${focus}"]`)?.classList.add('focus');
    if (opts.onPageClick) idoc.body.style.cursor = 'zoom-in';
    idoc.addEventListener('click', (ev) => {
      const el = (ev.target as HTMLElement).closest('[data-fact-id]');
      const factId = el?.getAttribute('data-fact-id');
      if (factId) {
        opts.onJump?.(factId, ev as MouseEvent);
      } else if (opts.onPageClick) {
        opts.onPageClick();
      }
    });
    const fit = () => {
      const h = idoc.body?.scrollHeight ?? 0;
      const s = scale === 'fit' ? Math.min(1, wrap.clientWidth / width) : 1;
      iframe.style.height = `${h}px`;
      iframe.style.transform = `scale(${s})`;
      wrap.style.height = `${h * s}px`;
    };
    fit();
    // refit once webfonts finish loading (reflow changes page height)
    idoc.fonts?.ready.then(fit).catch(() => {});
  });
  iframe.srcdoc = html;
}

export interface Lightbox {
  open(html: string, width: number, focusFact: string | null): void;
  close(): void;
}

/** Readable full-size document view over the page. Esc / backdrop click
 *  closes. One per page, bound to the page's #doc-lightbox element. */
export function createLightbox(
  el: HTMLElement,
  onJump?: (factId: string, ev: MouseEvent) => void,
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
        close();
        onJump?.(id, ev);
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
