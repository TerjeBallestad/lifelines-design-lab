// SB-055 probe — the game-surface preview pane, thinned by SB-082: the
// renderers live in prototypes/shared/surfaces.ts and return lit templates;
// this module is only the canvas mount. It owns the host, the title element,
// the page lightbox, and the canvas-flavored jump callback.
import { render as litRender } from 'lit-html';
import { surfaceFor } from '../shared/surfaces.ts';
import { wireDocFrame, createLightbox } from '../shared/doc-frame.ts';
import { injectEditorFonts } from '../shared/doc-preview.ts';
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

export function initPreview(deps: PreviewDeps): PreviewApi {
  injectEditorFonts();
  const { host, titleEl } = deps;
  const lightbox = createLightbox(deps.lightbox, deps.onJump);

  const api: PreviewApi = {
    show(id, kind) {
      // surfaceFor never reads the result for the empty surface — the pane
      // is showable before the first rebuild assigns one.
      const cleared = id === null || kind === null;
      const surface = surfaceFor(id, kind, cleared ? (null as never) : deps.getResult());
      titleEl.textContent = surface.title;
      litRender(surface.template, host);
      if (surface.doc) {
        const { html, width } = surface.doc;
        const wrap = host.querySelector('.doc-frame-wrap') as HTMLElement;
        const iframe = host.querySelector('.doc-frame') as HTMLIFrameElement;
        wireDocFrame(iframe, wrap, html, width, {
          onJump: (factId) => {
            lightbox.close();
            deps.onJump(factId);
          },
          onPageClick: () => lightbox.open(html, width, null),
        });
      }
    },
  };
  // The host boots empty in markup; render the empty surface so lit owns the
  // container from the first frame (static children would sit above lit's
  // part forever).
  api.show(null, null);
  return api;
}
