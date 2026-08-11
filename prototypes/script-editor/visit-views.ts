// SB-070: the Visit storyboard sub-view for a `# Visit:` block in a case
// buffer. Pure logic (timeline building, fork grouping, scrub math, guard
// labels) lives up top so vitest covers it without a DOM; the lit-html
// templates below render the preview rail's storyboard strip. Previews are
// lab-side sketches honest about shape — speaker, room, timing — not
// pixel-true Godot renders (doc-preview doctrine, SDD-130 §3).
import { html, nothing } from 'lit-html';
import type { TemplateResult } from 'lit-html';
import type { PredicateSpec } from '../../src/compiler/condition.ts';
import type { VisitSceneOut, VisitStepOut } from '../../src/compiler/emit-visit.ts';

// ---- pure logic ---------------------------------------------------------

/** Sim-minutes a step occupies: lines dwell, movements run their duration.
 *  A line without dwell= is instant (the emitter already warned on missing
 *  movement durations — 0 is what ships). */
export const stepDuration = (step: VisitStepOut): number =>
  step.kind === 'line' ? (step.dwell ?? 0) : step.duration;

/** One storyboard card: a step placed on the visit's authored timeline. */
export interface StoryCard {
  step: VisitStepOut;
  /** Sim-minutes into the visit when the step starts / ends. */
  t0: number;
  t1: number;
  /** Movement cards: the actor's last known room, or null before the first
   *  move (the director inherits the live sim position — unknowable here). */
  from: string | null;
}

/** A run of consecutive cards under one guard. `when` unset = the main
 *  strip; set = a fork (SDD-130: weave branches render as forks). */
export interface StorySegment {
  when?: PredicateSpec;
  cards: StoryCard[];
}

const actorOf = (step: VisitStepOut): string | null =>
  step.kind === 'urgent' ? step.actor : step.kind === 'queue_elling' ? 'elling' : null;

const roomOf = (step: VisitStepOut): string | null => (step.kind === 'line' ? null : step.room);

const sameGuard = (a: PredicateSpec | undefined, b: PredicateSpec | undefined): boolean =>
  JSON.stringify(a ?? null) === JSON.stringify(b ?? null);

/**
 * Lay the visit's steps on its authored timeline: time accumulates in file
 * order (guarded steps occupy their slot — the director plays in order and
 * skips false branches; the storyboard reads the visit as authored).
 * Consecutive steps under the same guard group into one fork segment.
 * Movement cards carry the actor's previous room so the strip can draw
 * room→room arrows.
 */
export function buildStoryboard(visit: VisitSceneOut): StorySegment[] {
  const segments: StorySegment[] = [];
  const lastRoom = new Map<string, string>();
  let t = 0;
  for (const step of visit.steps) {
    const actor = actorOf(step);
    const room = roomOf(step);
    const card: StoryCard = {
      step,
      t0: t,
      t1: t + stepDuration(step),
      from: actor ? (lastRoom.get(actor) ?? null) : null,
    };
    t = card.t1;
    if (actor && room) lastRoom.set(actor, room);
    const tail = segments[segments.length - 1];
    if (tail && sameGuard(tail.when, step.when)) tail.cards.push(card);
    else segments.push({ ...(step.when ? { when: step.when } : {}), cards: [card] });
  }
  return segments;
}

/** Total authored sim-minutes of the visit (end of the last card). */
export const totalDuration = (segments: StorySegment[]): number => {
  const last = segments[segments.length - 1]?.cards.at(-1);
  return last ? last.t1 : 0;
};

/**
 * The card the scrub time lands on: the last card that has started at t
 * (an instant card yields to a later card starting at the same t — it
 * holds no time). Null when the visit has no steps. This is a reading aid
 * over authored time, not the director.
 */
export function cardAtTime(segments: StorySegment[], t: number): StoryCard | null {
  let active: StoryCard | null = null;
  for (const seg of segments) {
    for (const card of seg.cards) {
      if (card.t0 <= t) active = card;
      else return active;
    }
  }
  return active;
}

/** Human-readable guard label for a fork — the §6 grammar back as words.
 *  Ids stay verbatim (content), the connectives are chrome. */
export function describeWhen(when: PredicateSpec): string {
  if (when.op === 'all' || when.op === 'any') {
    const joiner = when.op === 'all' ? ' and ' : ' or ';
    return (when.children ?? []).map(describeWhen).join(joiner) || when.op;
  }
  if (when.op === 'not') {
    const child = when.children?.[0];
    return child ? `not ${describeWhen(child)}` : 'not';
  }
  const args = Object.values(when.args ?? {}).join(' ');
  return args ? `${when.op} ${args}` : when.op;
}

// ---- templates ----------------------------------------------------------

const stubChip = (stub: boolean | undefined) =>
  stub
    ? html`<span class="chip tv-stub-chip" title="Stub: yes — placeholder text, Terje rewrites"
        >stub</span
      >`
    : nothing;

const minutes = (n: number) => `${n} min`;

const timeChip = (card: StoryCard) =>
  html`<span class="vv-time"
    >${card.t0 === card.t1 ? `t=${card.t0}` : `t=${card.t0}–${card.t1}`}</span
  >`;

const beatChip = (beat: string | undefined) =>
  beat ? html`<span class="vv-beat" title="fired_beats key">${beat}</span>` : nothing;

function speechCard(card: StoryCard, active: boolean): TemplateResult {
  const step = card.step;
  if (step.kind !== 'line') throw new Error('speechCard takes a line step');
  return html`<div class="vv-card vv-speech-card${active ? ' vv-active' : ''}">
    <div class="vv-card-head">
      <span class="vv-speaker">${step.speaker}</span>
      ${timeChip(card)}
    </div>
    <div class="vv-bubble">${step.line}</div>
    <div class="vv-card-foot">
      <span class="vv-dwell"
        >${step.dwell !== undefined ? `dwell ${minutes(step.dwell)}` : 'no dwell'}</span
      >
      ${beatChip(step.beat)}
    </div>
  </div>`;
}

function movementCard(card: StoryCard, active: boolean): TemplateResult {
  const step = card.step;
  if (step.kind === 'line') throw new Error('movementCard takes a movement step');
  const queued = step.kind === 'queue_elling';
  const actor = queued ? 'elling' : step.actor;
  const label = queued ? 'queued activity' : step.label;
  return html`<div class="vv-card vv-move-card${active ? ' vv-active' : ''}">
    <div class="vv-card-head">
      <span class="vv-speaker">${actor}</span>
      ${queued
        ? html`<span class="vv-flag" title="DD-120: Elling's decision engine picks it up"
            >queued</span
          >`
        : nothing}
      ${!queued && step.no_wait
        ? html`<span class="vv-flag" title="the visit does not wait for this move">no wait</span>`
        : nothing}
      ${timeChip(card)}
    </div>
    <div class="vv-move-label">${label}</div>
    <div class="vv-rooms">
      <span class="vv-room">${card.from ?? 'wherever they are'}</span>
      <span class="vv-arrow">→</span>
      <span class="vv-room">${step.room}</span>
    </div>
    <div class="vv-card-foot">
      <span class="vv-dwell">${minutes(step.duration)}</span>
      ${beatChip(step.kind === 'queue_elling' ? step.beat : undefined)}
    </div>
  </div>`;
}

const storyCard = (card: StoryCard, active: boolean) =>
  card.step.kind === 'line' ? speechCard(card, active) : movementCard(card, active);

/**
 * Visit preview — the storyboard strip (SDD-130 §3): speech and movement
 * cards in authored order, weave-guarded runs rendered as forks off the
 * strip, and a scrub control to read the visit as time. The active card
 * (under the scrub time) highlights.
 */
export function visitPreview(
  visit: VisitSceneOut,
  scrubT: number,
  onScrub: (t: number) => void,
): TemplateResult {
  const segments = buildStoryboard(visit);
  const total = totalDuration(segments);
  const t = Math.max(0, Math.min(scrubT, total));
  const active = cardAtTime(segments, t);
  const isActive = (card: StoryCard) => card === active;
  return html`<div class="surface-label">
      visit choreography — SocialVisitDirector plays this ${stubChip(visit.stub)}
    </div>
    <div class="vv-catalog">
      <div class="vv-name">${visit.name || visit.id}</div>
      ${visit.blurb ? html`<div class="vv-blurb">${visit.blurb}</div>` : nothing}
      ${visit.offer_line
        ? html`<div class="vv-offer">
            <span class="vv-offer-k">frank offers</span> «${visit.offer_line}»
          </div>`
        : nothing}
      ${visit.unlocks_question
        ? html`<div class="vv-unlocks">
            unlocked by
            <span class="fc-link" data-jump-kind="Question" data-jump-id=${visit.unlocks_question}
              >? ${visit.unlocks_question}</span
            >
          </div>`
        : nothing}
    </div>
    ${segments.length === 0
      ? html`<div class="vv-empty">no steps authored yet</div>`
      : html`<div class="vv-strip">
          ${segments.map((seg) =>
            seg.when
              ? html`<div class="vv-fork">
                  <div class="vv-fork-guard" title="weave guard — only when this holds">
                    ⑂ ${describeWhen(seg.when)}
                  </div>
                  <div class="vv-fork-lane">
                    ${seg.cards.map((card) => storyCard(card, isActive(card)))}
                  </div>
                  <div class="vv-fork-skip">otherwise: skip ahead</div>
                </div>`
              : seg.cards.map((card) => storyCard(card, isActive(card))),
          )}
        </div>`}
    <div class="vv-scrub">
      <input
        type="range"
        class="vv-scrub-range"
        min="0"
        max=${Math.max(total, 1)}
        step="1"
        .value=${String(t)}
        ?disabled=${total === 0}
        @input=${(e: Event) => onScrub(Number((e.target as HTMLInputElement).value))}
      />
      <span class="vv-scrub-label"
        >${total === 0
          ? 'no authored time'
          : `t = ${t} of ${total} sim-min${active ? ` · ${active.step.id}` : ''}`}</span
      >
    </div>`;
}
