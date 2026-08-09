// SB-061 probe — the Playtest lens; SB-063 adds the traversal loop on top:
// the compiled case as a frontier the player walks (SB-062 ruling 3). Locked
// rows grey out but stay readable with their unlock sentence, every
// effect-carrying entity is triggerable with instant effects, and each action
// prints its opened/still-closed delta. No persistence — one reset (SB-058).
import { html, render as litRender, nothing } from 'lit-html';
import { compileCase } from '../../src/compiler/index.ts';
import type { CompileResult } from '../../src/compiler/index.ts';
import '../shared/surfaces.css';
import { wireDocFrame, createLightbox } from '../shared/doc-frame.ts';
import { activeCasePath, resolveBootText, wireCaseChrome } from '../shared/active-case.ts';
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
  diffSnapshots,
  entityStatus,
  fireEvent,
  futureContentLeft,
  liftFact,
  makeCall,
  openActionsLeft,
  playCard,
  runDispatch,
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

// Read-only over the same buffer the editors see: an unsaved draft wins over
// disk, exactly like the script and canvas lenses (SB-025 seam).
const { text: bootText, draftRestored } = resolveBootText();
const result: CompileResult = compileCase(bootText);
const groups: IndexGroup[] = buildIndex(result);

// One StatusRow per index row — the snapshot the delta diffs over.
const statusRows: StatusRow[] = groups.flatMap((group) =>
  group.entries.map((entry) => ({ id: entry.id, kind: statusKind(entry), label: entry.label })),
);

let state: PlayState = createPlayState(result.slice);
let selected: IndexEntry | null = null;
let lastDelta: FrontierDelta | null = null;

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
  state = createPlayState(result.slice);
  lastDelta = null;
  renderAll();
}

wireCaseChrome();
caseNote.textContent = draftRestored ? `${activeCasePath} · unsaved draft` : activeCasePath;
renderAll();
