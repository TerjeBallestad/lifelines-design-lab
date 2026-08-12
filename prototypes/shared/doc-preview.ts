// Browser bridge to the real bake templates (templates/docs/*) — the same
// HTML+CSS the Playwright bake screenshots into core-loop textures. Fonts load
// as vite asset URLs here instead of the bake's base64 embedding.
// Typed via templates-docs.d.ts — the modules themselves are plain .mjs.
import { templateForKind, hasTemplate } from '../../templates/docs/registry.mjs';
import {
  renderBlocks,
  pageShell,
  overrideForDoc,
  sizeForKind,
} from '../../templates/docs/shared.mjs';
import fraunces400 from '../../templates/docs/fonts/Fraunces-400.ttf?url';
import fraunces700 from '../../templates/docs/fonts/Fraunces-700.ttf?url';
import caveat400 from '../../templates/docs/fonts/Caveat-400.ttf?url';
import specialElite400 from '../../templates/docs/fonts/SpecialElite-400.ttf?url';
import architects400 from '../../templates/docs/fonts/ArchitectsDaughter-400.ttf?url';
import kalam400 from '../../templates/docs/fonts/Kalam-400.ttf?url';

const face = (family: string, weight: number, url: string) =>
  `@font-face { font-family: '${family}'; font-weight: ${weight}; font-style: normal; src: url('${url}') format('truetype'); }`;

export const browserFontCss = [
  face('Fraunces', 400, fraunces400),
  face('Fraunces', 700, fraunces700),
  face('Caveat', 400, caveat400),
  face('Special Elite', 400, specialElite400),
  face('Architects Daughter', 400, architects400),
  face('Kalam', 400, kalam400),
].join('\n');

// The bake keeps fact spans visually neutral; the game overlays highlights at
// runtime from the UV manifest. The editor preview plays that runtime role.
const PREVIEW_CSS = `
.page::after { pointer-events: none; }
[data-fact-id] {
  background: rgba(200, 154, 46, 0.16);
  border-bottom: 1.5px dashed rgba(200, 154, 46, 0.75);
  border-radius: 2px;
  cursor: pointer;
}
[data-fact-id]:hover { background: rgba(200, 154, 46, 0.32); }
[data-fact-id].focus { background: #fff8b0; outline: 1.5px solid #c89a2e; }
[data-fact-id].lifted {
  background: rgba(96, 156, 96, 0.16);
  border-bottom: 1.5px solid rgba(96, 156, 96, 0.75);
}
html, body { overflow: hidden; }
`;

export interface DocPreviewBuild {
  html: string;
  width: number;
  minHeight: number;
  kindUsed: string;
  fallback: boolean;
}

type LabRun = { text: string; factId?: string };
type LabBlock =
  | { type: 'para'; runs: LabRun[] }
  | { type: 'table'; align: Array<'left' | 'right'>; header: LabRun[][]; rows: LabRun[][][] };

interface LabDoc {
  kind: string;
  title?: string;
  meta?: string;
  register?: string;
  peek?: string;
  blocks?: LabBlock[];
}

// Mirrors render-doc.mjs buildDocHtml, plus: browser fonts, preview highlight
// CSS, and a RAPPORT fallback for kinds without a template (e.g. STATUSRAPPORT).
export function buildDocPreviewHtml(docId: string, doc: LabDoc): DocPreviewBuild {
  const fallback = !hasTemplate(doc.kind);
  const kindUsed = fallback ? 'RAPPORT' : doc.kind;
  const template = templateForKind(kindUsed);
  // One labContent block per authored paragraph or pipe table (SDD-011).
  const runsHtml = renderBlocks(doc.blocks ?? []);
  const override = overrideForDoc(docId);
  const bodyHtml = template.render({
    docId,
    kind: doc.kind,
    title: doc.title ?? '',
    meta: doc.meta ?? '',
    register: doc.register ?? '',
    peek: doc.peek ?? '',
    runsHtml,
    overrideClass: override.className,
    art: override.art,
  });
  const html = pageShell({
    kind: kindUsed,
    overrideClass: override.className,
    styleCss: template.styleCss,
    overrideCss: override.css + PREVIEW_CSS,
    bodyHtml,
    fontCss: browserFontCss,
  });
  const size = sizeForKind(kindUsed);
  return { html, width: size.width, minHeight: size.minHeight, kindUsed, fallback };
}

// The FUNN card and rail chrome use the same fonts — inject them once.
export function injectEditorFonts() {
  const style = document.createElement('style');
  style.textContent = browserFontCss;
  document.head.appendChild(style);
}
