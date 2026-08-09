// Hand-written declarations for the plain .mjs bake-template modules
// (templates/docs/*), typed to the surface doc-preview.ts consumes.
declare module '*/templates/docs/registry.mjs' {
  export interface DocTemplate {
    styleCss: string;
    render(args: {
      docId: string;
      kind: string;
      title: string;
      meta: string;
      register: string;
      peek: string;
      runsHtml: string;
      overrideClass: string;
      art: string;
    }): string;
  }
  export const AUTHORED_KINDS: readonly string[];
  export const STATIONERY_KINDS: readonly string[];
  export function hasTemplate(kind: string): boolean;
  export function templateForKind(kind: string): DocTemplate;
}

declare module '*/templates/docs/shared.mjs' {
  export function escapeHtml(value: unknown): string;
  export function renderRuns(runs: Array<{ text: string; factId?: string }>): string;
  export function overrideForDoc(docId: string): { className: string; css: string; art: string };
  export function sizeForKind(kind: string): { width: number; minHeight: number };
  export function kindSlug(kind: string): string;
  export function pageShell(args: {
    kind: string;
    overrideClass?: string;
    styleCss?: string;
    overrideCss?: string;
    bodyHtml: string;
    fontCss?: string;
  }): string;
  export const PAGE_WIDTH_PX: number;
  export const PAGE_MIN_HEIGHT_PX: number;
}
