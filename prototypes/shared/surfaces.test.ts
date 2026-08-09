// @vitest-environment jsdom
// SB-082 — the pure surface renderers, checked against the real Olsen case.
// The renderers return lit TemplateResults, so this is the first time the
// preview surfaces are unit-testable at all: render into a detached host,
// assert on the DOM.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { render } from 'lit-html';
import { compileCase } from '../../src/compiler/index.ts';
import {
  emptySurface,
  factSurface,
  documentSurface,
  hypothesisSurface,
  questionSurface,
  tiltakSurface,
  dispatchSurface,
  clockSurface,
  conversationSurface,
  recipeSurface,
  proposalSurface,
  beatSurface,
  fallbackJsonSurface,
  surfaceFor,
} from './surfaces.ts';
import type { Surface } from './surfaces.ts';

const ROOT = process.cwd();
const result = compileCase(readFileSync(`${ROOT}/content/cases/olsen/tiny-olsen.case.md`, 'utf8'));

function mount(surface: Surface): HTMLElement {
  const host = document.createElement('div');
  render(surface.template, host);
  return host;
}

describe('factSurface', () => {
  it('renders the FUNN hand card and the FAKTUM detail panel', () => {
    const fact = result.slice.facts[0];
    const surface = factSurface(fact.id, result);
    expect(surface.title).toBe(`GAME SURFACE — ${fact.id.toUpperCase()}`);
    const host = mount(surface);
    expect(host.querySelector('.funn-card .funn-quote')!.textContent).toContain(
      fact.quote || fact.summary,
    );
    expect(host.querySelector('.detail-panel .dp-kind')!.textContent!.trim()).toBe('FAKTUM');
    expect(host.querySelector('.detail-panel .dp-title')!.textContent).toContain(fact.label);
  });

  it('escapes markup in content by construction', () => {
    const fact = result.slice.facts[0];
    const doctored = {
      ...result,
      slice: {
        ...result.slice,
        facts: [{ ...fact, label: '<img src=x onerror=alert(1)>' }],
      },
    } as typeof result;
    const host = mount(factSurface(fact.id, doctored));
    expect(host.querySelector('img')).toBeNull();
    expect(host.querySelector('.dp-title')!.textContent).toContain('<img');
  });
});

describe('documentSurface', () => {
  it('renders the sheet iframe frame and carries the bake html out-of-band', () => {
    const docId = Object.keys(result.labContent.documents)[0];
    const surface = documentSurface(docId, result);
    expect(surface.doc).toBeDefined();
    expect(surface.doc!.html).toContain('<html');
    expect(surface.doc!.width).toBeGreaterThan(0);
    const host = mount(surface);
    expect(host.querySelector('.doc-frame-wrap iframe.doc-frame')).not.toBeNull();
    expect(host.querySelector('.lb-hint')).not.toBeNull();
  });
});

describe('hypothesisSurface', () => {
  it('renders the TOLKNING panel with its basis facts', () => {
    const h = result.slice.hypotheses[0];
    const host = mount(hypothesisSurface(h.id, result));
    expect(host.querySelector('.dp-kind')!.textContent!.trim()).toBe('TOLKNING');
    expect(host.querySelector('.dp-title')!.textContent).toContain(h.title);
  });
});

describe('questionSurface', () => {
  it('renders the SPØRSMÅL card', () => {
    const q = result.slice.questions[0];
    const host = mount(questionSurface(q.id, result));
    expect(host.querySelector('.dp-kind')!.textContent!.trim()).toBe('SPØRSMÅL');
    expect(host.querySelector('.dp-title')!.textContent).toContain(q.card_title || q.prompt);
  });
});

describe('fallbackJsonSurface', () => {
  it('shows the compiled node for a kind without a player surface', () => {
    const t = result.slice.tiltak[0];
    const host = mount(fallbackJsonSurface(t.id, 'tiltak', result));
    expect(host.querySelector('.surface-label')!.textContent).toContain('no player-facing surface');
    const json = host.querySelector('.node-json')!.textContent!;
    expect(json).toContain(t.id);
    // pre-wrap element: template indentation around the interpolation would
    // render as blank lines — the json must be the div's exact content.
    expect(json.startsWith('{')).toBe(true);
  });

  it('says so when the id has no compiled node at all', () => {
    const host = mount(fallbackJsonSurface('f_finnes_ikke', 'fact', result));
    expect(host.querySelector('.node-json')!.textContent).toContain('No compiled node');
  });
});

// SB-061 Task 1 — the eight kinds that used to fall to fallbackJsonSurface.
// Every test asserts the fallback label is absent: a green run where a named
// kind still routes to JSON is the named fake-evidence case.
// ## Verified red-green: 2026-08-09 (10 tests red pre-implementation; broke
// clockSurface's slice lookup post-implementation, 2 tests red, restored)
function expectNoFallback(host: HTMLElement): void {
  for (const label of host.querySelectorAll('.surface-label'))
    expect(label.textContent).not.toContain('no player-facing surface');
  expect(host.querySelector('.node-json')).toBeNull();
}

describe('tiltakSurface', () => {
  it('renders the TILTAK card with slot, cost and description', () => {
    const t = result.slice.tiltak[0];
    const host = mount(tiltakSurface(t.id, result));
    expectNoFallback(host);
    expect(host.querySelector('.dp-kind')!.textContent!.trim()).toBe('TILTAK');
    expect(host.querySelector('.dp-title')!.textContent).toContain(t.title);
    expect(host.querySelector('.dp-meta')!.textContent).toContain(t.slot);
    expect(host.querySelector('.dp-meta')!.textContent).toContain(String(t.cost));
    expect(host.querySelector('.dp-body')!.textContent).toContain(t.description);
  });
});

describe('dispatchSurface', () => {
  it('renders title, description, activity meta and effects as data lines', () => {
    const d = result.slice.dispatches[0];
    const host = mount(dispatchSurface(d.id, result));
    expectNoFallback(host);
    expect(host.querySelector('.dp-title')!.textContent).toContain(d.title);
    expect(host.querySelector('.dp-body')!.textContent).toContain(d.description);
    const meta = host.querySelector('.dp-meta')!.textContent!;
    expect(meta).toContain(d.activity_title!);
    expect(meta).toContain(String(d.duration_h));
    expect(meta).toContain(d.channel!);
    const effects = [...host.querySelectorAll('.effect-line')].map((el) => el.textContent!);
    expect(effects.length).toBe(d.effects.length);
    expect(effects[0]).toContain(d.effects[0].op);
    expect(effects[0]).toContain(String(d.effects[0].args.document_id));
  });
});

describe('clockSurface', () => {
  it('renders the dead dial: label, question, both segments, no needle', () => {
    const c = result.slice.clocks[0];
    const host = mount(clockSurface(c.id, result));
    expectNoFallback(host);
    expect(host.querySelector('.clock-label')!.textContent).toContain(c.label);
    expect(host.querySelector('.clock-question')!.textContent).toContain(c.question);
    const segments = [...host.querySelectorAll('.clock-seg')];
    expect(segments.length).toBe(2);
    expect(segments[0].textContent).toContain(c.good_segment_label);
    expect(segments[0].textContent).toContain(String(c.good_segment_size));
    expect(segments[1].textContent).toContain(c.bad_segment_label);
    expect(segments[1].textContent).toContain(String(c.bad_segment_size));
    expect(host.querySelector('.clock-needle')).toBeNull();
  });
});

describe('conversationSurface — chat:frank', () => {
  it('renders the transcript idiom: question chips, answer lines, followups', () => {
    const host = mount(conversationSurface('chat:frank', result));
    expectNoFallback(host);
    const entries = result.slice.frank_chat!;
    const chips = [...host.querySelectorAll('.chat-question')];
    expect(chips.length).toBe(entries.length);
    expect(chips[0].textContent).toContain(entries[0].question);
    expect(host.textContent).toContain(entries[0].answer_lines[0]);
    const withFollowup = entries.find((e) => e.followups.length > 0)!;
    expect(host.textContent).toContain(withFollowup.followups[0].label);
    const withTanke = entries.flatMap((e) => e.followups).find((f) => f.tanke);
    if (withTanke) expect(host.textContent).toContain(withTanke.tanke!);
    // needs/pays are shown as data, never evaluated
    const withNeed = entries.find((e) => e.needs.length > 0)!;
    expect(host.textContent).toContain(withNeed.needs[0]);
  });
});

describe('conversationSurface — call', () => {
  it('renders the card-keyed exchange idiom: opening, soft reject, exchanges', () => {
    const call = result.slice.calls![0];
    const host = mount(conversationSurface(`call:${call.contact_id}`, result));
    expectNoFallback(host);
    expect(host.textContent).toContain(call.opening[0].text);
    expect(host.textContent).toContain(call.soft_reject!);
    const exchanges = [...host.querySelectorAll('.call-exchange')];
    expect(exchanges.length).toBe(call.exchanges.length);
    expect(exchanges[0].textContent).toContain(call.exchanges[0].card_id);
    expect(exchanges[0].textContent).toContain(call.exchanges[0].ask);
    expect(exchanges[0].textContent).toContain(call.exchanges[0].reply[0].text);
    const withFact = call.exchanges[0].reply.find((l) => l.fact_id);
    if (withFact) expect(exchanges[0].textContent).toContain(withFact.fact_id!);
  });
});

describe('recipeSurface', () => {
  it('renders the pair, the reading and the frank lines', () => {
    const r = result.slice.recipes![0];
    const id = `${r.pair[0]} + ${r.pair[1]}`;
    const host = mount(recipeSurface(id, result));
    expectNoFallback(host);
    expect(host.textContent).toContain(r.pair[0]);
    expect(host.textContent).toContain(r.pair[1]);
    expect(host.textContent).toContain(r.reading);
    for (const line of r.frank_lines) expect(host.textContent).toContain(line);
  });
});

describe('proposalSurface', () => {
  it('renders the line, the relevant facts and the order', () => {
    const p = result.slice.frank_proposals![0];
    const host = mount(proposalSurface(p.handbok_id, result));
    expectNoFallback(host);
    expect(host.textContent).toContain(p.line);
    for (const fid of p.relevant_fact_ids ?? []) expect(host.textContent).toContain(fid);
    expect(host.textContent).toContain(String(p.order));
  });
});

describe('beatSurface', () => {
  it('renders day, text and effects', () => {
    const beat = result.slice.day_script_beats.find((b) => b.effects.length > 0)!;
    const host = mount(beatSurface(beat.id, result));
    expectNoFallback(host);
    expect(host.textContent).toContain(String(beat.day));
    expect(host.textContent).toContain(beat.text);
    const effects = [...host.querySelectorAll('.effect-line')];
    expect(effects.length).toBe(beat.effects.length);
  });

  it('falls back for an unknown beat id', () => {
    const host = mount(beatSurface('beat_finnes_ikke', result));
    expect(host.querySelector('.node-json')).not.toBeNull();
  });
});

describe('surfaceFor', () => {
  it('clears to the empty surface without touching the result', () => {
    const surface = surfaceFor(null, null, null as never);
    expect(surface.title).toBe(emptySurface().title);
    expect(mount(surface).querySelector('.empty')).not.toBeNull();
  });

  it('dispatches every surfaced kind', () => {
    const fact = result.slice.facts[0];
    expect(mount(surfaceFor(fact.id, 'fact', result)).querySelector('.funn-card')).not.toBeNull();
    const docId = Object.keys(result.labContent.documents)[0];
    expect(mount(surfaceFor(docId, 'document', result)).querySelector('.doc-frame')).not.toBeNull();
  });

  it('routes the six new NodeKind kinds to their player surfaces, not the fallback', () => {
    const { slice } = result;
    const cases: Array<[string, string, string]> = [
      [slice.tiltak[0].id, 'tiltak', '.detail-panel'],
      [slice.dispatches[0].id, 'dispatch', '.detail-panel'],
      [slice.clocks[0].id, 'clock', '.clock-dial'],
      ['chat:frank', 'conversation', '.chat-entry'],
      [`call:${slice.calls![0].contact_id}`, 'conversation', '.call-exchange'],
      [`${slice.recipes![0].pair[0]} + ${slice.recipes![0].pair[1]}`, 'recipe', '.detail-panel'],
      [slice.frank_proposals![0].handbok_id, 'proposal', '.detail-panel'],
    ];
    for (const [id, kind, selector] of cases) {
      const host = mount(surfaceFor(id, kind as never, result));
      expect(host.querySelector(selector), `${kind} ${id} → ${selector}`).not.toBeNull();
      expect(host.querySelector('.node-json'), `${kind} ${id} still falls back`).toBeNull();
    }
  });

  it('still falls back for an id its kind pool does not contain', () => {
    const host = mount(surfaceFor('t_finnes_ikke', 'tiltak', result));
    expect(host.querySelector('.node-json')).not.toBeNull();
  });
});
