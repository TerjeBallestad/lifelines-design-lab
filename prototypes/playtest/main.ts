// SB-061 probe — the Playtest lens; SB-063 adds the traversal loop on top:
// the compiled case as a frontier the player walks (SB-062 ruling 3). Locked
// rows grey out but stay readable with their unlock sentence, every
// effect-carrying entity is triggerable with instant effects, and each action
// prints its opened/still-closed delta. The run survives a lens switch via
// sessionStorage (SB-063 amendment); a fresh tab starts clean — one reset.
import { html, render as litRender, nothing } from 'lit-html';
import { compileCase } from '../../src/compiler/index.ts';
import type { CompileResult } from '../../src/compiler/index.ts';
import '../shared/surfaces.css';
import { wireDocFrame, createLightbox } from '../shared/doc-frame.ts';
import {
  activeCasePath,
  draftKey,
  playKey,
  resolveBootText,
  saveCaseUrl,
  wireCaseChrome,
} from '../shared/active-case.ts';
import { findSourceBlock, spliceSourceBlock } from './source-block.ts';
import type { SourceBlock } from './source-block.ts';
import { parseCaseText } from '../../src/compiler/parse.ts';
import type { RawBlock } from '../../src/compiler/parse.ts';
import { DiagnosticBag } from '../../src/compiler/diagnostics.ts';
import { patchField } from '../../src/compiler/patch.ts';
import { FORM_FIELDS, fieldRows, oneLine } from '../shared/field-form.ts';
import type { NodeKind } from '../shared/node-kind.ts';
import { injectEditorFonts } from '../shared/doc-preview.ts';
import { buildIndex } from './model.ts';
import { coverageSurface } from './coverage.ts';
import type { IndexEntry, IndexGroup } from './model.ts';
import { playSurface, statusKind } from './play-surfaces.ts';
import type { PlayActions } from './play-surfaces.ts';
import {
  advanceDay,
  askChat,
  chooseHypothesis,
  craftRecipe,
  createPlayState,
  deserializePlayState,
  diffSnapshots,
  entityStatus,
  fireEvent,
  futureContentLeft,
  liftFact,
  makeCall,
  openActionsLeft,
  playCard,
  runDispatch,
  serializePlayState,
  setStage,
  snapshot,
  takeTiltak,
} from './state.ts';
import type { FrontierDelta, PlayState, StatusRow } from './state.ts';

injectEditorFonts();

const $ = (id: string) => document.getElementById(id) as HTMLElement;
const indexHost = $('index');
const surfaceHost = $('surface');
const surfaceTitle = $('surface-title');
const caseNote = $('case-note');
const playbarHost = $('playbar');
const logHost = $('log');

// The same buffer the editors see: an unsaved draft wins over disk, exactly
// like the script and canvas lenses (SB-025 seam). Mutable since the source
// drawer (SB-063 amendment 3): a save recompiles everything in place.
const { text: bootText, draftRestored } = resolveBootText();
let caseText = bootText;
let result: CompileResult = compileCase(caseText);
let groups: IndexGroup[] = buildIndex(result);

// One StatusRow per index row — the snapshot the delta diffs over.
const rowsOf = (gs: IndexGroup[]): StatusRow[] =>
  gs.flatMap((group) =>
    group.entries.map((entry) => ({ id: entry.id, kind: statusKind(entry), label: entry.label })),
  );
let statusRows: StatusRow[] = rowsOf(groups);

// SB-063 amendment: the run survives a lens switch (sessionStorage, per case
// and per tab — a fresh tab still starts clean; RESET stays the one wipe).
const PLAY_STORE = playKey(activeCasePath);
const stored = sessionStorage.getItem(PLAY_STORE);
let state: PlayState =
  (stored ? deserializePlayState(stored) : null) ?? createPlayState(result.slice);
let selected: IndexEntry | null = null;
let lastDelta: FrontierDelta | null = null;

function saveState(): void {
  sessionStorage.setItem(PLAY_STORE, serializePlayState(state));
}

const lightbox = createLightbox($('doc-lightbox'), (factId, ev) => runClick(factId, ev));

/** SB-063 play verb inside the sheet: a click on a run lifts its fact;
 *  cmd/ctrl-click (or a click on an already-lifted run) jumps to the fact. */
function runClick(factId: string, ev: MouseEvent): void {
  if (ev.metaKey || ev.ctrlKey || state.factsLifted.has(factId)) {
    selectById(factId);
    return;
  }
  actions.lift(factId);
}

/** Paint the lifted state onto the sheet's runs (green solid underline). */
function markLiftedRuns(iframe: HTMLIFrameElement): void {
  const idoc = iframe.contentDocument;
  if (!idoc) return;
  for (const el of idoc.querySelectorAll('[data-fact-id]'))
    el.classList.toggle('lifted', state.factsLifted.has(el.getAttribute('data-fact-id') ?? ''));
}

/** Every verb runs through here: snapshot → mutate → snapshot → delta. */
function act(mutate: () => void): void {
  const before = snapshot(state, result.slice, statusRows);
  mutate();
  lastDelta = diffSnapshots(before, snapshot(state, result.slice, statusRows));
  saveState();
  renderAll();
}

const actions: PlayActions = {
  lift: (id) => act(() => liftFact(state, result.slice, id)),
  forceLift: (id) => act(() => liftFact(state, result.slice, id)),
  ask: (id) => act(() => askChat(state, result.slice, id)),
  call: (contactId) => act(() => makeCall(state, result.slice, contactId)),
  play: (contactId, cardId) => act(() => playCard(state, result.slice, contactId, cardId)),
  dispatch: (id) => act(() => runDispatch(state, result.slice, id)),
  tiltak: (id) => act(() => takeTiltak(state, result.slice, id)),
  craft: (id) => act(() => craftRecipe(state, result.slice, id)),
  choose: (id) => act(() => chooseHypothesis(state, result.slice, id)),
  fire: (id) => act(() => fireEvent(state, result.slice, id)),
};

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
  const surface = selected
    ? playSurface(selected, result, state, actions)
    : coverageSurface(result);
  surfaceTitle.textContent = surface.title;
  editBtn.hidden = !selected || findSourceBlock(caseText, selected.id, selected.kind) === null;
  litRender(surface.template, surfaceHost);
  if (surface.doc) {
    const iframe = surfaceHost.querySelector<HTMLIFrameElement>('iframe.doc-frame');
    const wrap = surfaceHost.querySelector<HTMLElement>('.doc-frame-wrap');
    if (iframe && wrap) {
      wireDocFrame(iframe, wrap, surface.doc.html, surface.doc.width, {
        scale: 'full',
        onJump: runClick,
        onPageClick: () => lightbox.open(surface.doc!.html, surface.doc!.width, null),
      });
      // Marks apply now (re-render, iframe already live) and again on load
      // (first wire — the srcdoc document does not exist yet).
      markLiftedRuns(iframe);
      iframe.addEventListener('load', () => markLiftedRuns(iframe), { once: true });
    }
  }
}

function renderIndex(): void {
  litRender(
    html`${groups.map((group) => {
      const open = group.entries.filter(
        (e) => entityStatus(state, result.slice, e.id, statusKind(e)) === 'open',
      ).length;
      return html`<div class="idx-group">
        <div class="idx-head">
          <span>${group.label}</span>
          <span class="count">${open}/${group.entries.length}</span>
        </div>
        ${group.entries.map((entry) => {
          const status = entityStatus(state, result.slice, entry.id, statusKind(entry));
          return html`<button
            class="idx-item ${selected === entry ? 'current' : ''} st-${status}"
            title=${entry.id}
            @click=${() => select(entry)}
          >
            ${status === 'done' ? '✓ ' : ''}${entry.label}
          </button>`;
        })}
      </div>`;
    })}`,
    indexHost,
  );
}

function deltaText(delta: FrontierDelta): string {
  const bits: string[] = [];
  if (delta.opened.length) bits.push(`opened: ${delta.opened.map((r) => r.label).join(', ')}`);
  if (delta.finished.length) bits.push(`done: ${delta.finished.map((r) => r.label).join(', ')}`);
  if (delta.closed.length) bits.push(`closed: ${delta.closed.map((r) => r.label).join(', ')}`);
  if (bits.length === 0) bits.push('no change');
  bits.push(`still locked: ${delta.stillLocked}`);
  return bits.join(' · ');
}

function renderPlaybar(): void {
  const actionsLeft = openActionsLeft(state, result.slice);
  const future = futureContentLeft(state, result.slice);
  const exhausted = actionsLeft === 0 && future === 0;
  litRender(
    html`<span class="pb-stat">dag ${state.day}</span>
      <span class="pb-stat">
        stage ${state.stage}
        <button
          class="pb-mini"
          title="stage down (debug)"
          @click=${() => act(() => setStage(state, state.stage - 1))}
        >
          −
        </button>
        <button
          class="pb-mini"
          title="stage up (debug)"
          @click=${() => act(() => setStage(state, state.stage + 1))}
        >
          +
        </button>
      </span>
      <span class="pb-stat">${state.factsLifted.size} facts</span>
      <span class="pb-stat">${actionsLeft} actions open</span>
      <button class="play-btn" @click=${() => act(() => advanceDay(state, result.slice))}>
        ADVANCE DAY
      </button>
      <button class="play-btn debug" @click=${reset}>RESET</button>
      ${exhausted
        ? html`<span class="pb-exhausted">content exhausted — the run is over</span>`
        : actionsLeft === 0
          ? html`<span class="pb-exhausted">frontier empty — advance the day</span>`
          : nothing}
      <span class="pb-delta">${lastDelta ? deltaText(lastDelta) : ''}</span>`,
    playbarHost,
  );
}

function renderLog(): void {
  litRender(html`${state.log.map((line) => html`<div class="log-line">${line}</div>`)}`, logHost);
  logHost.scrollTop = logHost.scrollHeight;
}

function renderAll(): void {
  renderIndex();
  renderSurface();
  renderPlaybar();
  renderLog();
}

function reset(): void {
  sessionStorage.removeItem(PLAY_STORE);
  state = createPlayState(result.slice);
  lastDelta = null;
  renderAll();
}

// ---- SB-063 amendment 3: the source drawer — tweak the selected entity's
// ---- authored block without leaving the run. FIELDS mode renders the SAME
// ---- form as the canvas inspector (shared/field-form.ts) and commits
// ---- through the compiler patch layer; RAW mode edits the block's lines.
// ---- Either way a commit saves to disk and recompiles the lens in place;
// ---- in-flight edits land in the shared draft seam.

const appEl = $('app');
const drawerEl = $('editdrawer');
const editBtn = $('edit-btn') as HTMLButtonElement;
const edText = $('ed-text') as HTMLTextAreaElement;
const edForm = $('ed-form');
const edTitle = $('ed-title');
const edStatus = $('ed-status');
const edModeFields = $('ed-mode-fields') as HTMLButtonElement;
const edModeRaw = $('ed-mode-raw') as HTMLButtonElement;
const DRAFT_STORE = draftKey(activeCasePath);
let drawer: { id: string; kind: string; block: SourceBlock; mode: 'fields' | 'raw' } | null = null;
let draftTimer: ReturnType<typeof setTimeout> | undefined;

/** The parsed block behind an entry — the field form's data source. Only the
 *  NodeKind entries with FORM_FIELDS rows have one worth showing. */
function parsedBlockFor(id: string): RawBlock | null {
  const parsed = parseCaseText(caseText, new DiagnosticBag());
  return parsed.blocks.find((b) => b.id === id) ?? null;
}

function hasFieldForm(entry: { id: string; kind: string }): boolean {
  const specs = FORM_FIELDS[entry.kind as NodeKind];
  return Array.isArray(specs) && specs.length > 0 && parsedBlockFor(entry.id) !== null;
}

function openDrawer(entry: IndexEntry): void {
  const block = findSourceBlock(caseText, entry.id, entry.kind);
  if (!block) return;
  const mode = hasFieldForm(entry) ? 'fields' : 'raw';
  drawer = { id: entry.id, kind: entry.kind, block, mode };
  edStatus.textContent = '';
  appEl.classList.add('drawer-open');
  renderDrawer();
}

function closeDrawer(): void {
  drawer = null;
  appEl.classList.remove('drawer-open');
}

function renderDrawer(): void {
  if (!drawer) return;
  edTitle.textContent = `SOURCE · lines ${drawer.block.startLine}–${drawer.block.endLine}`;
  const fieldsAvailable = hasFieldForm(drawer);
  edModeFields.hidden = !fieldsAvailable;
  edModeRaw.hidden = !fieldsAvailable; // no toggle when raw is the only mode
  drawerEl.classList.toggle('mode-fields', drawer.mode === 'fields');
  edModeFields.classList.toggle('current', drawer.mode === 'fields');
  edModeRaw.classList.toggle('current', drawer.mode === 'raw');
  if (drawer.mode === 'fields') {
    const block = parsedBlockFor(drawer.id);
    if (!block) {
      drawer.mode = 'raw';
      renderDrawer();
      return;
    }
    litRender(
      html`${fieldRows(drawer.kind as NodeKind, block, {
        commit: (key, value) => commitDrawerField(key, value),
        stash: (key, value) => stashDrawerField(key, value),
      })}`,
      edForm,
    );
  } else {
    edText.value = drawer.block.text;
  }
}

/** Recompile the whole lens over new case text; the run state stays (stale
 *  ids sit in the sets and never match — same law as the lens-switch restore). */
function rebuild(newText: string): void {
  caseText = newText;
  result = compileCase(caseText);
  groups = buildIndex(result);
  statusRows = rowsOf(groups);
  if (selected) {
    const stay = selected;
    selected =
      groups.flatMap((g) => g.entries).find((e) => e.id === stay.id && e.kind === stay.kind) ??
      null;
  }
  renderAll();
}

/** The shared commit tail: save to disk, recompile in place, re-anchor the
 *  drawer, report the compile. A failed save keeps the text as a draft. */
async function commitCase(newText: string): Promise<void> {
  try {
    const res = await fetch(saveCaseUrl, { method: 'POST', body: newText });
    if (!res.ok) throw new Error(await res.text());
    clearTimeout(draftTimer);
    localStorage.removeItem(DRAFT_STORE);
    rebuild(newText);
    if (drawer) {
      const block = findSourceBlock(caseText, drawer.id, drawer.kind);
      if (block) drawer.block = block;
      renderDrawer();
    }
    const errors = result.diagnostics.filter((d) => d.severity === 'error').length;
    const warnings = result.diagnostics.filter((d) => d.severity === 'warning').length;
    edStatus.textContent = `saved · ${errors} errors · ${warnings} warnings`;
  } catch (err) {
    localStorage.setItem(DRAFT_STORE, newText);
    edStatus.textContent = `save failed — draft kept · ${err instanceof Error ? err.message : String(err)}`;
  }
}

function commitDrawerField(key: string, value: string): void {
  if (!drawer) return;
  try {
    const patched = patchField(caseText, drawer.id, key, oneLine(value));
    if (patched === caseText) return;
    void commitCase(patched);
  } catch (err) {
    edStatus.textContent = err instanceof Error ? err.message : String(err);
  }
}

function stashDrawerField(key: string, value: string): void {
  if (!drawer) return;
  edStatus.textContent = 'unsaved — draft kept';
  clearTimeout(draftTimer);
  const active = drawer;
  draftTimer = setTimeout(() => {
    try {
      const patched = patchField(caseText, active.id, key, oneLine(value));
      if (patched !== caseText) localStorage.setItem(DRAFT_STORE, patched);
    } catch {
      // Unpatchable while typing — the commit surfaces it (canvas law).
    }
  }, 300);
}

function saveDrawerRaw(): void {
  if (!drawer) return;
  void commitCase(spliceSourceBlock(caseText, drawer.block, edText.value));
}

edText.addEventListener('input', () => {
  if (!drawer) return;
  edStatus.textContent = 'unsaved — draft kept';
  clearTimeout(draftTimer);
  // The SB-025 draft law: every edit survives a reload, from the first keystroke.
  const active = drawer;
  draftTimer = setTimeout(() => {
    localStorage.setItem(DRAFT_STORE, spliceSourceBlock(caseText, active.block, edText.value));
  }, 300);
});
edText.addEventListener('keydown', (ev) => {
  if ((ev.metaKey || ev.ctrlKey) && ev.key === 's') {
    ev.preventDefault();
    saveDrawerRaw();
  }
});
editBtn.addEventListener('click', () => {
  if (selected) openDrawer(selected);
});
edModeFields.addEventListener('click', () => {
  if (drawer) {
    drawer.mode = 'fields';
    renderDrawer();
  }
});
edModeRaw.addEventListener('click', () => {
  if (drawer) {
    drawer.mode = 'raw';
    renderDrawer();
  }
});
$('ed-save').addEventListener('click', saveDrawerRaw);
$('ed-close').addEventListener('click', closeDrawer);

wireCaseChrome();
caseNote.textContent = draftRestored ? `${activeCasePath} · unsaved draft` : activeCasePath;
renderAll();
