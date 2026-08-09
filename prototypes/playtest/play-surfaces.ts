// The play layer (SB-063) over the SB-082 surfaces: a lock banner with
// the unlock sentence on locked entities (content stays visible, SB-062
// ruling 3), an action bar on open ones, and interactive chat/call surfaces —
// the two kinds the static transcript cannot serve per-entry.
import { html, nothing } from 'lit-html';
import type { TemplateResult } from 'lit-html';
import type { CompileResult } from '../../src/compiler/index.ts';
import type { NodeKind } from '../shared/node-kind.ts';
import { unlockSentence } from '../shared/unlock.ts';
import { CHAT_FRANK_ID, callContactOf, callId } from '../shared/weave-ids.ts';
import type { Surface } from '../shared/surfaces.ts';
import { fallbackJsonSurface } from '../shared/surfaces.ts';
import { entitySurface } from './model.ts';
import type { IndexEntry } from './model.ts';
import type { EntityStatus, PlayState } from './state.ts';
import { cardHeld, entityStatus } from './state.ts';

/** Every verb the lens exposes; main.ts wraps each in the delta-diffing act. */
export interface PlayActions {
  lift(id: string): void;
  forceLift(id: string): void;
  ask(entryId: string): void;
  call(contactId: string): void;
  play(contactId: string, cardId: string): void;
  dispatch(id: string): void;
  tiltak(id: string): void;
  craft(recipeKey: string): void;
  choose(hypothesisId: string): void;
  fire(eventType: string): void;
}

/** The status-model kind for an index entry (conversation rows split). */
export function statusKind(entry: IndexEntry): string {
  if (entry.kind !== 'conversation') return entry.kind;
  return callContactOf(entry.id) !== null ? 'call' : 'chat_entry';
}

function lockBanner(sentence: string): TemplateResult {
  return html`<div class="lock-banner">🔒 ${sentence}</div>`;
}

function lockSentenceFor(entry: IndexEntry, result: CompileResult): string {
  if (entry.kind === 'day_script_beat') {
    const beat = result.slice.day_script_beats.find((b) => b.id === entry.id);
    return beat ? `Fires dag ${beat.day} via the day script.` : '';
  }
  if (entry.kind === 'event_delta') return 'Clock-driven in the engine — clocks are dead here.';
  const kind =
    entry.kind === 'conversation' && callContactOf(entry.id) === null ? 'conversation' : entry.kind;
  const id = kind === 'conversation' && callContactOf(entry.id) === null ? CHAT_FRANK_ID : entry.id;
  return unlockSentence(id, kind as NodeKind, result.slice);
}

const btn = (label: string, onClick: () => void, extraClass = '') =>
  html`<button class="play-btn ${extraClass}" @click=${onClick}>${label}</button>`;

function actionBar(
  entry: IndexEntry,
  status: EntityStatus,
  actions: PlayActions,
): TemplateResult | typeof nothing {
  const open = status === 'open';
  switch (entry.kind) {
    case 'fact':
      if (open)
        return html`<div class="action-bar">${btn('LIFT', () => actions.lift(entry.id))}</div>`;
      if (status === 'locked')
        return html`<div class="action-bar">
          ${btn('force-lift (debug)', () => actions.forceLift(entry.id), 'debug')}
        </div>`;
      return nothing;
    case 'dispatch':
      return open
        ? html`<div class="action-bar">
            ${btn('RUN DISPATCH', () => actions.dispatch(entry.id))}
          </div>`
        : nothing;
    case 'tiltak':
      return open
        ? html`<div class="action-bar">${btn('TAKE TILTAK', () => actions.tiltak(entry.id))}</div>`
        : nothing;
    case 'recipe':
      return open
        ? html`<div class="action-bar">${btn('CRAFT', () => actions.craft(entry.id))}</div>`
        : nothing;
    case 'hypothesis':
      return open
        ? html`<div class="action-bar">
            ${btn('choose (debug)', () => actions.choose(entry.id), 'debug')}
          </div>`
        : nothing;
    case 'event_delta':
      return open
        ? html`<div class="action-bar">
            ${btn('fire event (debug)', () => actions.fire(entry.id), 'debug')}
          </div>`
        : nothing;
    default:
      return nothing;
  }
}

/** The interactive chat — per entry: locked greyed with needs, open askable,
 *  asked shows the paid answer (frank_chat_r2 idiom as render inspiration). */
function chatPlaySurface(result: CompileResult, state: PlayState, actions: PlayActions): Surface {
  const { slice } = result;
  const entries = slice.frank_chat ?? [];
  const needLabel = (id: string) => slice.facts.find((f) => f.id === id)?.label ?? id;
  return {
    title: 'GAME SURFACE — CHAT:FRANK',
    template: html`<div class="surface-label">chat — frank, ask what the board affords</div>
      ${entries.map((entry) => {
        const status = entityStatus(state, slice, entry.id, 'chat_entry');
        if (status === 'locked')
          return html`<div class="chat-entry play-locked">
            <div class="chat-question">${entry.question}</div>
            <div class="lock-banner">🔒 needs ${entry.needs.map(needLabel).join(' + ') || '—'}</div>
          </div>`;
        if (status === 'open')
          return html`<div class="chat-entry">
            <div class="chat-question">${entry.question}</div>
            <div class="action-bar">${btn('ASK', () => actions.ask(entry.id))}</div>
          </div>`;
        return html`<div class="chat-entry play-done">
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
          ${entry.pays_fact ? html`<div class="fact-tag">paid: ${entry.pays_fact}</div>` : nothing}
        </div>`;
      })}`,
  };
}

/** The interactive call — gate, one CALL, then card-keyed exchanges playable
 *  once the card is on the board (V5 card-play idiom as render inspiration). */
function callPlaySurface(
  contactId: string,
  result: CompileResult,
  state: PlayState,
  actions: PlayActions,
): Surface {
  const { slice } = result;
  const call = (slice.calls ?? []).find((c) => c.contact_id === contactId);
  if (!call) return fallbackJsonSurface(callId(contactId), 'conversation', result);
  const status = entityStatus(state, slice, callId(contactId), 'call');
  const called = state.callsMade.has(contactId);
  const line = (l: { who?: string; text: string; fact_id?: string }) =>
    html`<div class="call-line">
      ${l.who ? html`<span class="call-who">${l.who}:</span>` : nothing}
      <span>${l.text}</span>
      ${l.fact_id ? html`<span class="fact-tag">${l.fact_id}</span>` : nothing}
    </div>`;
  return {
    title: `GAME SURFACE — CALL:${contactId.toUpperCase()}`,
    template: html`<div class="surface-label">call — ${contactId}</div>
      ${status === 'locked'
        ? lockBanner(unlockSentence(callId(contactId), 'conversation', slice))
        : nothing}
      ${status === 'open' && !called
        ? html`<div class="action-bar">${btn('CALL', () => actions.call(contactId))}</div>`
        : nothing}
      ${called ? html`<div class="call-block">${call.opening.map(line)}</div>` : nothing}
      ${called
        ? call.exchanges.map((exchange) => {
            const played = state.cardsPlayed.has(`${contactId}/${exchange.card_id}`);
            const held = cardHeld(state, slice, exchange.card_id);
            if (played)
              return html`<div class="call-exchange">
                <div class="fact-tag">${exchange.card_id}</div>
                <div class="call-line">
                  <span class="call-who">du:</span> <span>${exchange.ask}</span>
                </div>
                ${exchange.reply.map(line)}
              </div>`;
            if (held)
              return html`<div class="call-exchange">
                <div class="fact-tag">${exchange.card_id}</div>
                <div class="action-bar">
                  ${btn(`PLAY ${exchange.card_id}`, () =>
                    actions.play(contactId, exchange.card_id),
                  )}
                </div>
              </div>`;
            return html`<div class="call-exchange play-locked">
              <div class="fact-tag">${exchange.card_id}</div>
              <div class="lock-banner">🔒 card ${exchange.card_id} is not on the board</div>
            </div>`;
          })
        : nothing}
      ${called && call.soft_reject
        ? html`<div class="surface-label">soft reject — when a card does not land</div>
            <div class="call-block"><div class="call-line">${call.soft_reject}</div></div>`
        : nothing}`,
  };
}

/** The playtest surface router: interactive chat/call, else the SB-082
 *  surface wrapped with lock banner + action bar. */
export function playSurface(
  entry: IndexEntry,
  result: CompileResult,
  state: PlayState,
  actions: PlayActions,
): Surface {
  if (entry.kind === 'conversation') {
    const contactId = callContactOf(entry.id);
    if (contactId !== null) return callPlaySurface(contactId, result, state, actions);
    return chatPlaySurface(result, state, actions);
  }
  const status = entityStatus(state, result.slice, entry.id, statusKind(entry));
  const base = entitySurface(entry, result);
  const isDoc = entry.kind === 'document';
  return {
    ...base,
    template: html`${status === 'locked' ? lockBanner(lockSentenceFor(entry, result)) : nothing}
      ${status === 'done' ? html`<div class="done-banner">✓ done</div>` : nothing}
      ${actionBar(entry, status, actions)}
      <div class="${status === 'locked' ? 'play-locked' : ''} ${isDoc ? 'play-doc' : ''}">
        ${base.template}
      </div>
      ${isDoc
        ? html`<div class="lb-hint">
            click a highlight to lift its fact · ⌘-click follows it to the canvas card · click the
            page to read full size
          </div>`
        : nothing}`,
  };
}
