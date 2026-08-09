// SB-061 probe — the Playtest lens: the compiled active case as an entity
// index grouped by kind, each entity readable as its player surface at full
// reading size. A reader, not a game: no verbs, no state, no persistence
// (SB-058 rulings; SB-063 adds the traversal loop on top of these surfaces).
import { html, render as litRender } from 'lit-html';
import { compileCase } from '../../src/compiler/index.ts';
import type { CompileResult } from '../../src/compiler/index.ts';
import '../shared/surfaces.css';
import { emptySurface } from '../shared/surfaces.ts';
import { wireDocFrame, createLightbox } from '../shared/doc-frame.ts';
import { activeCasePath, resolveBootText, wireCaseChrome } from '../shared/active-case.ts';
import { injectEditorFonts } from '../shared/doc-preview.ts';
import { buildIndex, entitySurface } from './model.ts';
import type { IndexEntry, IndexGroup } from './model.ts';

injectEditorFonts();

const $ = (id: string) => document.getElementById(id) as HTMLElement;
const indexHost = $('index');
const surfaceHost = $('surface');
const surfaceTitle = $('surface-title');
const caseNote = $('case-note');

// Read-only lens over the same buffer the editors see: an unsaved draft wins
// over disk, exactly like the script and canvas lenses (SB-025 seam).
const { text: bootText, draftRestored } = resolveBootText();
const result: CompileResult = compileCase(bootText);
const groups: IndexGroup[] = buildIndex(result);

let selected: IndexEntry | null = null;

const lightbox = createLightbox($('doc-lightbox'), (factId) => selectById(factId));

function selectById(id: string): void {
  const entry = groups.flatMap((g) => g.entries).find((e) => e.id === id);
  if (entry) select(entry);
}

function select(entry: IndexEntry): void {
  selected = entry;
  renderIndex();
  renderSurface();
}

function renderSurface(): void {
  const surface = selected ? entitySurface(selected, result) : emptySurface();
  surfaceTitle.textContent = surface.title;
  litRender(surface.template, surfaceHost);
  if (surface.doc) {
    const iframe = surfaceHost.querySelector<HTMLIFrameElement>('iframe.doc-frame');
    const wrap = surfaceHost.querySelector<HTMLElement>('.doc-frame-wrap');
    if (iframe && wrap)
      wireDocFrame(iframe, wrap, surface.doc.html, surface.doc.width, {
        scale: 'full',
        onJump: (factId) => selectById(factId),
        onPageClick: () => lightbox.open(surface.doc!.html, surface.doc!.width, null),
      });
  }
}

function renderIndex(): void {
  litRender(
    html`${groups.map(
      (group) =>
        html`<div class="idx-group">
          <div class="idx-head">
            <span>${group.label}</span>
            <span class="count">${group.entries.length}</span>
          </div>
          ${group.entries.map(
            (entry) =>
              html`<button
                class="idx-item ${selected === entry ? 'current' : ''}"
                title=${entry.id}
                @click=${() => select(entry)}
              >
                ${entry.label}
              </button>`,
          )}
        </div>`,
    )}`,
    indexHost,
  );
}

wireCaseChrome();
caseNote.textContent = draftRestored ? `${activeCasePath} · unsaved draft` : activeCasePath;
renderIndex();
renderSurface();
