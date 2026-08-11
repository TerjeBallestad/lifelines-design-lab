// @vitest-environment jsdom
// SB-070: the Visit storyboard sub-view logic — timeline building, fork
// grouping, room tracking, scrub math, guard labels — plus render checks
// over the lit templates (speech card, movement card, fork, scrub).
import { render } from 'lit-html';
import { describe, expect, it } from 'vitest';
import type { VisitSceneOut, VisitStepOut } from '../../src/compiler/emit-visit.ts';
import {
  buildStoryboard,
  cardAtTime,
  describeWhen,
  stepDuration,
  totalDuration,
  visitPreview,
} from './visit-views.ts';

const line = (over: Partial<VisitStepOut> = {}): VisitStepOut =>
  ({
    id: 's_line',
    kind: 'line',
    speaker: 'frank',
    line: 'Er det Nansen du leser om?',
    ...over,
  }) as VisitStepOut;

const visit = (steps: VisitStepOut[], over: Partial<VisitSceneOut> = {}): VisitSceneOut => ({
  id: 'opp_x',
  name: 'Klarer han seg alene?',
  blurb: 'Se på Elling.',
  steps,
  ...over,
});

describe('stepDuration', () => {
  it('reads dwell on lines (0 when unauthored) and duration on movements', () => {
    expect(stepDuration(line({ dwell: 4 }))).toBe(4);
    expect(stepDuration(line())).toBe(0);
    expect(
      stepDuration({
        id: 'm1',
        kind: 'urgent',
        actor: 'grete',
        label: 'blir i stua',
        room: 'living_room',
        duration: 18,
      }),
    ).toBe(18);
    expect(stepDuration({ id: 'q1', kind: 'queue_elling', room: 'kitchen', duration: 8 })).toBe(8);
  });
});

describe('buildStoryboard', () => {
  const steps: VisitStepOut[] = [
    { id: 'm1', kind: 'urgent', actor: 'grete', label: 'går', room: 'kitchen', duration: 5 },
    line({ id: 'l1', dwell: 4 }),
    {
      id: 'm2',
      kind: 'urgent',
      actor: 'grete',
      label: 'tilbake',
      room: 'living_room',
      duration: 3,
    },
    { id: 'q1', kind: 'queue_elling', room: 'kitchen', duration: 8 },
  ];

  it('accumulates authored time in file order', () => {
    const cards = buildStoryboard(visit(steps)).flatMap((s) => s.cards);
    expect(cards.map((c) => [c.t0, c.t1])).toEqual([
      [0, 5],
      [5, 9],
      [9, 12],
      [12, 20],
    ]);
    expect(totalDuration(buildStoryboard(visit(steps)))).toBe(20);
  });

  it('tracks each actor’s last room for room→room arrows', () => {
    const cards = buildStoryboard(visit(steps)).flatMap((s) => s.cards);
    expect(cards[0].from).toBeNull(); // first move — live sim position unknown
    expect(cards[2].from).toBe('kitchen'); // grete moved there in m1
    expect(cards[3].from).toBeNull(); // elling has not moved yet
  });

  it('groups consecutive same-guard steps into one fork segment', () => {
    const when = { op: 'fact_lifted', args: { fact_id: 'f_a' } };
    const segs = buildStoryboard(
      visit([
        line({ id: 'a' }),
        line({ id: 'b', when }),
        line({ id: 'c', when }),
        line({ id: 'd' }),
      ]),
    );
    expect(segs.map((s) => [s.when?.op ?? null, s.cards.map((c) => c.step.id)])).toEqual([
      [null, ['a']],
      ['fact_lifted', ['b', 'c']],
      [null, ['d']],
    ]);
  });

  it('splits segments when the guard changes', () => {
    const segs = buildStoryboard(
      visit([
        line({ id: 'a', when: { op: 'fact_lifted', args: { fact_id: 'f_a' } } }),
        line({ id: 'b', when: { op: 'fact_lifted', args: { fact_id: 'f_b' } } }),
      ]),
    );
    expect(segs).toHaveLength(2);
  });
});

describe('cardAtTime', () => {
  const segs = buildStoryboard(
    visit([line({ id: 'a', dwell: 4 }), line({ id: 'b' }), line({ id: 'c', dwell: 6 })]),
  );

  it('lands on the last card that has started', () => {
    expect(cardAtTime(segs, 0)?.step.id).toBe('a');
    expect(cardAtTime(segs, 3)?.step.id).toBe('a');
    expect(cardAtTime(segs, 4)?.step.id).toBe('c'); // instant b holds no time
    expect(cardAtTime(segs, 5)?.step.id).toBe('c');
    expect(cardAtTime(segs, 99)?.step.id).toBe('c');
  });

  it('is null for an empty visit', () => {
    expect(cardAtTime([], 0)).toBeNull();
  });
});

describe('describeWhen', () => {
  it('renders leaves, connectives and negation readably', () => {
    expect(describeWhen({ op: 'fact_lifted', args: { fact_id: 'f_a' } })).toBe('fact_lifted f_a');
    expect(
      describeWhen({
        op: 'all',
        children: [
          { op: 'fact_lifted', args: { fact_id: 'f_a' } },
          { op: 'not', children: [{ op: 'scenario_stage_at_least', args: { stage: 2 } }] },
        ],
      }),
    ).toBe('fact_lifted f_a and not scenario_stage_at_least 2');
    expect(
      describeWhen({
        op: 'any',
        children: [
          { op: 'fact_lifted', args: { fact_id: 'f_a' } },
          { op: 'fact_lifted', args: { fact_id: 'f_b' } },
        ],
      }),
    ).toBe('fact_lifted f_a or fact_lifted f_b');
  });
});

describe('visitPreview', () => {
  const host = () => {
    const el = document.createElement('div');
    document.body.append(el);
    return el;
  };

  it('renders speech cards with speaker + bubble, verbatim Norwegian', () => {
    const el = host();
    render(
      visitPreview(visit([line({ id: 'l1', dwell: 4, beat: 'a2' })]), 0, () => {}),
      el,
    );
    const card = el.querySelector('.vv-speech-card')!;
    expect(card.querySelector('.vv-speaker')!.textContent).toBe('frank');
    expect(card.querySelector('.vv-bubble')!.textContent).toBe('Er det Nansen du leser om?');
    expect(card.querySelector('.vv-dwell')!.textContent).toContain('4 min');
    expect(card.querySelector('.vv-beat')!.textContent).toBe('a2');
  });

  it('renders movement cards with a room→room arrow and duration', () => {
    const el = host();
    render(
      visitPreview(
        visit([
          {
            id: 'm1',
            kind: 'urgent',
            actor: 'grete',
            label: 'blir i stua',
            room: 'living_room',
            duration: 18,
            no_wait: true,
          },
          { id: 'q1', kind: 'queue_elling', room: 'kitchen', duration: 8, beat: 'a6' },
        ]),
        0,
        () => {},
      ),
      el,
    );
    const cards = el.querySelectorAll('.vv-move-card');
    expect(cards).toHaveLength(2);
    const rooms = cards[0].querySelectorAll('.vv-room');
    expect(rooms[0].textContent).toBe('wherever they are');
    expect(rooms[1].textContent).toBe('living_room');
    expect(cards[0].querySelector('.vv-arrow')).not.toBeNull();
    expect(cards[0].querySelector('.vv-dwell')!.textContent).toBe('18 min');
    expect(cards[0].querySelector('.vv-flag')!.textContent).toBe('no wait');
    expect(cards[1].querySelector('.vv-flag')!.textContent).toBe('queued');
    expect(cards[1].querySelector('.vv-speaker')!.textContent).toBe('elling');
  });

  it('renders guarded runs as forks with a readable guard and a skip lane', () => {
    const el = host();
    const when = { op: 'fact_lifted', args: { fact_id: 'f_a' } };
    render(
      visitPreview(visit([line({ id: 'a' }), line({ id: 'b', when })]), 0, () => {}),
      el,
    );
    const fork = el.querySelector('.vv-fork')!;
    expect(fork.querySelector('.vv-fork-guard')!.textContent).toContain('fact_lifted f_a');
    expect(fork.querySelectorAll('.vv-card')).toHaveLength(1);
    expect(fork.querySelector('.vv-fork-skip')!.textContent).toContain('skip');
    // The unguarded card stays on the main strip, outside the fork.
    expect(el.querySelectorAll('.vv-strip > .vv-card')).toHaveLength(1);
  });

  it('scrubs the visit as time: highlights the active card and reports t', () => {
    const el = host();
    let t = 0;
    const v = visit([line({ id: 'a', dwell: 4 }), line({ id: 'b', dwell: 6 })]);
    const draw = () =>
      render(
        visitPreview(v, t, (next) => {
          t = next;
          draw();
        }),
        el,
      );
    draw();
    expect(el.querySelector('.vv-active .vv-bubble')).not.toBeNull();
    expect(el.querySelector('.vv-scrub-label')!.textContent).toContain('t = 0 of 10 sim-min');
    const range = el.querySelector('.vv-scrub-range') as HTMLInputElement;
    range.value = '7';
    range.dispatchEvent(new Event('input'));
    expect(el.querySelector('.vv-scrub-label')!.textContent).toContain('t = 7 of 10 sim-min · b');
    const active = el.querySelectorAll('.vv-card')[1];
    expect(active.classList.contains('vv-active')).toBe(true);
  });

  it('shows catalog fields, the stub chip and an honest empty state', () => {
    const el = host();
    render(
      visitPreview(
        visit([], {
          offer_line: 'Vil du at jeg skal se på det?',
          unlocks_question: 'q_evner',
          stub: true,
        }),
        0,
        () => {},
      ),
      el,
    );
    expect(el.querySelector('.vv-name')!.textContent).toBe('Klarer han seg alene?');
    expect(el.querySelector('.vv-offer')!.textContent).toContain('Vil du at jeg skal se på det?');
    const link = el.querySelector('.vv-unlocks .fc-link') as HTMLElement;
    expect(link.dataset.jumpId).toBe('q_evner');
    expect(el.querySelector('.tv-stub-chip')).not.toBeNull();
    expect(el.querySelector('.vv-empty')!.textContent).toContain('no steps authored yet');
    expect((el.querySelector('.vv-scrub-range') as HTMLInputElement).disabled).toBe(true);
  });
});
