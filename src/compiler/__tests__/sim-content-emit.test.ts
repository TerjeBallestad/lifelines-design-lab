import { describe, expect, it } from 'vitest';
import { compileCase, compileCharacter } from '../index';
import oppdragText from './fixtures/oppdrag-alene.case.md?raw';
import ellingText from './fixtures/elling.sim.md?raw';

// PLAN-006 TASK-027 — the five emit shapes carry the real payloads.
// The visit fixture transcribes OPPDRAG_ALENE from core-loop
// scripts/simulation/social_visit_director.gd:96-118 VERBATIM (all three step
// kinds); the expected object below re-transcribes the same table by hand.
// ## Verified red-green: 2026-08-11 (no_wait flag dropped → 1 failure)

const caseResult = compileCase(oppdragText);
const characterResult = compileCharacter(ellingText);

// SB-109 made `visits` a union (legacy steps | goal tier); every visit in
// this file is legacy, so narrow with a check instead of a cast.
function legacySteps(result: ReturnType<typeof compileCase>) {
  const visit = result.slice.visits?.[0];
  if (!visit || !('steps' in visit)) throw new Error('expected a legacy steps visit');
  return visit.steps;
}

describe('VisitSceneOut — the OPPDRAG_ALENE transcription round-trips losslessly', () => {
  it('carries the catalog fields and every step payload value', () => {
    expect(caseResult.slice.visits).toEqual([
      {
        id: 'opp_alene',
        name: 'Klarer han seg alene?',
        blurb: 'Se på Elling. Hva klarer han, hva klarer han ikke.',
        offer_line:
          'Godt spørsmål. Vil du at jeg skal se på hva han faktisk klarer, ved neste besøk?',
        unlocks_question: 'q_evner',
        steps: [
          {
            id: 'opp_a_hold',
            kind: 'urgent',
            actor: 'grete',
            label: 'blir i stua',
            room: 'living_room',
            duration: 18,
            no_wait: true,
          },
          {
            id: 'opp_a6',
            kind: 'queue_elling',
            room: 'living_room',
            duration: 8,
            beat: 'a6',
          },
          {
            id: 'opp_a2',
            kind: 'line',
            speaker: 'frank',
            line: 'Er det Nansen du leser om?',
            dwell: 4,
            beat: 'a2',
          },
          {
            id: 'opp_a3',
            kind: 'line',
            speaker: 'elling',
            line: 'Nansen lot Fram fryse fast i isen. 1893. Det var planen hele tiden.',
            dwell: 4,
            beat: 'a3',
          },
          {
            id: 'opp_a4',
            kind: 'line',
            speaker: 'frank',
            line: 'Liker du å bo her, Elling?',
            dwell: 4,
            beat: 'a4',
          },
          {
            id: 'opp_a5',
            kind: 'line',
            speaker: 'grete',
            line: 'Han har det fint her. Han har alt han trenger.',
            dwell: 4,
            beat: 'a5',
          },
        ],
      },
    ]);
  });

  it('resolves the Unlocks question (no stub warning) and none of the steps warn', () => {
    const codes = caseResult.diagnostics.map((d) => d.code);
    expect(codes).not.toContain('stub-unresolved-id');
    expect(codes).not.toContain('line-unparsed');
  });

  it('warns stub-unresolved-id on a dangling Unlocks question', () => {
    const result = compileCase(
      '# Case: c_x\nTitle: X\n\n# Visit: opp_x\nTitle: T\nBlurb: B\nUnlocks: q_missing\n\n- frank: «Hei.» [dwell=2 id=s1]\n',
    );
    const warning = result.diagnostics.find((d) => d.code === 'stub-unresolved-id');
    expect(warning?.subjectIds).toContain('q_missing');
  });

  it('emits a {condition} guard through condition.ts as a sparse when key', () => {
    const result = compileCase(
      [
        '# Case: c_x',
        'Title: X',
        '',
        '# Document: doc_a',
        'Kind: NOTAT · Register: notat',
        'Title: T',
        'Peek: p',
        'Meta: M',
        '',
        'Anker. [Låst.](fact:f_a)',
        '',
        '## f_a',
        'Label: L',
        'Summary: S',
        'Domain: D · Category: C',
        '',
        '# Visit: opp_x',
        'Title: T',
        'Blurb: B',
        '',
        '- {f_a} grete: «Bare hvis.» [dwell=2 id=s1]',
        '- grete: «Alltid.» [dwell=2 id=s2]',
      ].join('\n'),
    );
    const steps = legacySteps(result);
    expect(steps[0]).toMatchObject({
      id: 's1',
      when: { op: 'fact_lifted', args: { fact_id: 'f_a' } },
    });
    expect('when' in (steps[1] ?? {})).toBe(false);
  });

  it('errors duplicate-id on a repeated step id and keeps the first', () => {
    const result = compileCase(
      '# Case: c_x\nTitle: X\n\n# Visit: opp_x\nTitle: T\nBlurb: B\n\n- frank: «A.» [id=s1]\n- grete: «B.» [id=s1]\n',
    );
    expect(result.diagnostics.some((d) => d.code === 'duplicate-id')).toBe(true);
    expect(legacySteps(result).map((step) => step.id)).toEqual(['s1']);
  });

  it('skips a queue step for anyone but elling (DD-120)', () => {
    const result = compileCase(
      '# Case: c_x\nTitle: X\n\n# Visit: opp_x\nTitle: T\nBlurb: B\n\n- ? grete @ kitchen [duration=5 id=s1]\n',
    );
    expect(legacySteps(result)).toEqual([]);
    expect(result.diagnostics.some((d) => d.code === 'line-unparsed')).toBe(true);
  });

  it('warns field-missing on an urgent/queue step without duration=', () => {
    const result = compileCase(
      '# Case: c_x\nTitle: X\n\n# Visit: opp_x\nTitle: T\nBlurb: B\n\n- ! grete: blir @ kitchen [id=s1]\n',
    );
    const warning = result.diagnostics.find((d) => d.code === 'field-missing');
    expect(warning?.subjectIds).toEqual(['opp_x', 's1']);
    expect(legacySteps(result)[0]).toMatchObject({ duration: 0 });
  });

  it('marks stub: true on a Stub: yes visit and omits it otherwise', () => {
    const stubbed = compileCase(
      '# Case: c_x\nTitle: X\n\n# Visit: opp_x\nTitle: T\nBlurb: B\nStub: yes\n\n- frank: «Hei.» [id=s1]\n',
    );
    expect(stubbed.slice.visits?.[0]?.stub).toBe(true);
    expect('stub' in (caseResult.slice.visits?.[0] ?? {})).toBe(false);
  });
});

describe('StringTableOut', () => {
  it('emits entries in file order with stub survival', () => {
    expect(caseResult.slice.strings).toEqual([
      {
        id: 'notat_glue',
        entries: {
          notat_intro: 'Frank noterer.',
          notat_outro: 'Det var det.',
        },
        stub: true,
      },
    ]);
  });

  it('errors duplicate-id on a repeated key and keeps the first value', () => {
    const result = compileCase('# Case: c_x\nTitle: X\n\n# Strings: t\nk_a: first\nk_a: second\n');
    expect(result.diagnostics.some((d) => d.code === 'duplicate-id')).toBe(true);
    expect(result.slice.strings?.[0]?.entries).toEqual({ k_a: 'first' });
  });
});

describe('ThoughtPoolOut / BarkPoolOut / PhoneLinesOut', () => {
  it('binds the whole elling fixture with real payloads and sparse stubs', () => {
    expect(characterResult.content).toEqual({
      id: 'elling',
      thoughts: [
        {
          character: 'elling',
          key_type: 'need',
          key: 'Hunger',
          lines: [
            'Sulten. Kjøleskapet er langt unna.',
            'Burde spise noe snart.',
            'Maten står der. Kanskje senere.',
          ],
          icon_key: 'icon_hunger',
        },
        {
          character: 'elling',
          key_type: 'activity',
          key: '*',
          lines: ['Dette går bra.'],
          stub: true,
        },
      ],
      barks: {
        character: 'elling',
        lines: ['Fint vær i dag.', 'Lukter godt her.'],
        stub: true,
      },
      phone: {
        character: 'elling',
        answer: 'hallo? ... ja. det er her.',
        close: 'ja. nei. jo. — ha det.',
        stub: true,
      },
    });
  });

  it('omits barks/phone keys when the file authors none (sparse-field law)', () => {
    const result = compileCharacter('# Character: grete\n\n# Thoughts: grete/want/*\n- Ro.\n');
    expect('barks' in result.content).toBe(false);
    expect('phone' in result.content).toBe(false);
  });

  it('skips a frank thoughts pool with the advisory, emits nothing', () => {
    const result = compileCharacter(
      '# Character: frank\n\n# Thoughts: frank/need/Hunger\n- Aldri.\n\n# Barks: frank\n- Hei.\n',
    );
    expect(result.content.thoughts).toEqual([]);
    expect(result.content.barks?.lines).toEqual(['Hei.']);
    expect(result.diagnostics.find((d) => d.code === 'thoughts-frank-excluded')?.severity).toBe(
      'advisory',
    );
  });

  it('skips blocks naming another character (the sibling file owns them)', () => {
    const result = compileCharacter(
      '# Character: elling\n\n# Barks: grete\n- Feil fil.\n\n# Thoughts: grete/want/*\n- Feil fil.\n',
    );
    expect('barks' in result.content).toBe(false);
    expect(result.content.thoughts).toEqual([]);
    expect(result.diagnostics.filter((d) => d.code === 'line-unparsed')).toHaveLength(2);
  });

  it('skips a pool with an unknown key_type with a warning', () => {
    const result = compileCharacter('# Character: elling\n\n# Thoughts: elling/mood/*\n- Nei.\n');
    expect(result.content.thoughts).toEqual([]);
    expect(result.diagnostics.some((d) => d.code === 'line-unparsed')).toBe(true);
  });

  it('warns field-missing on a phone block without Answer/Close', () => {
    const result = compileCharacter('# Character: elling\n\n# Phone: elling\nStub: yes\n');
    expect(result.content.phone).toEqual({
      character: 'elling',
      answer: '',
      close: '',
      stub: true,
    });
    expect(result.diagnostics.filter((d) => d.code === 'field-missing')).toHaveLength(2);
  });
});
