import { describe, expect, it } from 'vitest';
import { compileCase } from '../index';
import { DiagnosticBag } from '../diagnostics';
import { checkNamespaceCollisions } from '../emit-visit';

// PLAN-010 TASK-048 — goal-tier visits emit into the CaseSlice as a
// discriminated union beside the legacy steps shape (format: 'goals' on the
// new shape only; the legacy object is byte-identical to its PLAN-006 form).
// Cost numbers and validation expectations are hand-derived from the SB-107 +
// SB-114 rulings, not copied from the implementation.
// ## Verified red-green: 2026-08-14 (written before the emit path existed → 9 failures)

const GOAL_CASE = [
  '# Case: c_x',
  'Title: X',
  '',
  '# Question: q_evner',
  'Title: Hva klarer Elling?',
  'Teaser: Noe her.',
  '',
  '# Visit: opp_alene',
  'Title: Klarer han seg alene?',
  'Blurb: Se på Elling.',
  'Offer: "Vil du se på hva han klarer?"',
  'Stub: yes',
  '',
  '## Goal: nansen',
  'plan: Se hva han leser',
  'need: elling, not f_avstand',
  'yield: f_bok, open q_evner',
  '',
  '==',
  '- frank: goto elling',
  '-> arrived',
  '!> unreachable grace=2',
  '',
  '== lese',
  '- elling: say Nansen lot Fram fryse fast i isen.',
  '',
  '## Goal: trives',
  'plan: Spør om han trives',
  'need: grete, denied nansen',
  'yield: f_svarer',
  '',
  '==',
  '- frank: converse grete Liker du å bo her?',
  '- elling: free',
  '-> duration 8',
  '',
  '==',
  '- frank: goto living_room seat=sofa',
  '- grete: do make_tea',
  '-> arrived',
  '',
  '## Call-off',
  '',
  '==',
  '- frank: goto entrance',
  '-> arrived',
  '!> timeout 6',
].join('\n');

describe('goal-tier emit — the discriminated visits shape', () => {
  const result = compileCase(GOAL_CASE);

  it('compiles with no errors', () => {
    expect(result.diagnostics.filter((d) => d.severity === 'error')).toEqual([]);
  });

  it('emits the full goal-tier object with derived costs', () => {
    expect(result.slice.visits).toEqual([
      {
        id: 'opp_alene',
        format: 'goals',
        name: 'Klarer han seg alene?',
        blurb: 'Se på Elling.',
        offer_line: 'Vil du se på hva han klarer?',
        goals: [
          {
            name: 'nansen',
            plan: 'Se hva han leser',
            needs: [
              { neg: false, kind: 'presence', id: 'elling' },
              { neg: true, kind: 'fact', id: 'f_avstand' },
            ],
            yields: [
              { kind: 'fact', id: 'f_bok' },
              { kind: 'open', id: 'q_evner' },
            ],
            // goto stage 1m + say stage 1m (no dwell=, no duration)
            cost_minutes: 2,
            stages: [
              {
                id: 'st1',
                duties: [
                  { character: 'frank', verb: 'goto', target: 'elling', target_kind: 'character' },
                ],
                ends: [{ kind: 'arrived' }],
                fails: [{ kind: 'unreachable', grace_minutes: 2 }],
              },
              {
                id: 'lese',
                duties: [
                  { character: 'elling', verb: 'say', line: 'Nansen lot Fram fryse fast i isen.' },
                ],
                ends: [],
                fails: [],
                auto_end: 'line read',
              },
            ],
          },
          {
            name: 'trives',
            plan: 'Spør om han trives',
            needs: [
              { neg: false, kind: 'presence', id: 'grete' },
              { neg: false, kind: 'denied', id: 'nansen' },
            ],
            yields: [{ kind: 'fact', id: 'f_svarer' }],
            // authored duration 8m + do stage 2m
            cost_minutes: 10,
            stages: [
              {
                id: 'st3',
                duties: [
                  {
                    character: 'frank',
                    verb: 'converse',
                    partner: 'grete',
                    line: 'Liker du å bo her?',
                  },
                  { character: 'elling', verb: 'free' },
                ],
                ends: [{ kind: 'duration', minutes: 8 }],
                fails: [],
              },
              {
                id: 'st4',
                duties: [
                  {
                    character: 'frank',
                    verb: 'goto',
                    target: 'living_room',
                    target_kind: 'room',
                    params: { seat: 'sofa' },
                  },
                  { character: 'grete', verb: 'do', activity: 'make_tea' },
                ],
                ends: [{ kind: 'arrived' }],
                fails: [],
              },
            ],
          },
        ],
        calloff_stages: [
          {
            id: 'st5',
            duties: [{ character: 'frank', verb: 'goto', target: 'entrance', target_kind: 'room' }],
            ends: [{ kind: 'arrived' }],
            fails: [{ kind: 'timeout', minutes: 6 }],
          },
        ],
        stub: true,
      },
    ]);
  });

  it('resolves an open-yield question through the shared stub resolution', () => {
    const stubs = result.diagnostics.filter((d) => d.code === 'stub-unresolved-id');
    expect(stubs).toEqual([]);
    const dangling = compileCase(
      '# Case: c\nTitle: X\n\n# Visit: v\nTitle: T\nBlurb: B\n\n## Goal: a\nplan: P\nyield: open q_missing\n\n==\n- frank: say Hei.\n',
    );
    const warning = dangling.diagnostics.find((d) => d.code === 'stub-unresolved-id');
    expect(warning?.subjectIds).toContain('q_missing');
  });

  it('derives say cost from dwell= when authored', () => {
    const dwelled = compileCase(
      '# Case: c\nTitle: X\n\n# Visit: v\nTitle: T\nBlurb: B\n\n## Goal: a\nplan: P\n\n==\n- frank: say Hei. dwell=4\n',
    );
    const visit = dwelled.slice.visits?.[0];
    expect(visit && 'goals' in visit ? visit.goals[0].cost_minutes : undefined).toBe(4);
  });

  it('errors visit-unlocks-dissolved on Unlocks: in a stage-grammar visit', () => {
    const rejected = compileCase(
      '# Case: c\nTitle: X\n\n# Visit: v\nTitle: T\nBlurb: B\nUnlocks: q_evner\n\n==\n- frank: say Hei.\n',
    );
    const error = rejected.diagnostics.find((d) => d.code === 'visit-unlocks-dissolved');
    expect(error?.severity).toBe('error');
    expect(error?.message).toContain('yield: open');
  });

  it('warns visit-activity-stub on an unknown do activity and marks the duty', () => {
    const stubbed = compileCase(
      '# Case: c\nTitle: X\n\n# Visit: v\nTitle: T\nBlurb: B\n\n==\n- grete: do polish_silver\n-> duration 3\n',
    );
    const warning = stubbed.diagnostics.find((d) => d.code === 'visit-activity-stub');
    expect(warning?.severity).toBe('warning');
    expect(warning?.subjectIds).toContain('polish_silver');
    const visit = stubbed.slice.visits?.[0];
    const duty = visit && 'spine_stages' in visit ? visit.spine_stages?.[0]?.duties[0] : undefined;
    expect(duty).toMatchObject({ verb: 'do', activity: 'polish_silver', activity_stub: true });
  });

  it('emits goal-less stages as sparse spine_stages', () => {
    const spine = compileCase(
      '# Case: c\nTitle: X\n\n# Visit: v\nTitle: T\nBlurb: B\n\n==\n- frank: say Hei.\n',
    );
    const visit = spine.slice.visits?.[0];
    expect(visit && 'spine_stages' in visit ? visit.spine_stages?.length : 0).toBe(1);
    expect(visit && 'goals' in visit ? visit.goals : undefined).toEqual([]);
    expect(visit && 'calloff_stages' in visit).toBe(false);
  });
});

describe('namespace collision check (pack-level)', () => {
  it('stays silent on the seeded namespaces', () => {
    const diag = new DiagnosticBag();
    checkNamespaceCollisions(diag);
    expect(diag.items).toEqual([]);
  });

  it('errors visit-namespace-collision on a name in both namespaces', () => {
    const diag = new DiagnosticBag();
    checkNamespaceCollisions(diag, ['frank', 'sofa'], ['sofa', 'kitchen']);
    const error = diag.items.find((d) => d.code === 'visit-namespace-collision');
    expect(error?.severity).toBe('error');
    expect(error?.subjectIds).toContain('sofa');
  });
});

describe('legacy coexistence — both grammars in one file', () => {
  const MIXED = [
    '# Case: c_x',
    'Title: X',
    '',
    '# Visit: opp_legacy',
    'Title: Gammel',
    'Blurb: B',
    '',
    '- frank: «Er det Nansen du leser om?» [dwell=4 beat=a2 id=opp_a2]',
    '- ! grete: blir i stua @ living_room [duration=18 no_wait id=opp_hold]',
    '',
    '# Visit: opp_ny',
    'Title: Ny',
    'Blurb: B',
    '',
    '## Goal: a',
    'plan: P',
    '',
    '==',
    '- frank: say Hei.',
  ].join('\n');

  it('emits the legacy visit byte-identical to its PLAN-006 shape, no discriminant', () => {
    const result = compileCase(MIXED);
    expect(result.slice.visits?.[0]).toEqual({
      id: 'opp_legacy',
      name: 'Gammel',
      blurb: 'B',
      steps: [
        {
          id: 'opp_a2',
          kind: 'line',
          speaker: 'frank',
          line: 'Er det Nansen du leser om?',
          dwell: 4,
          beat: 'a2',
        },
        {
          id: 'opp_hold',
          kind: 'urgent',
          actor: 'grete',
          label: 'blir i stua',
          room: 'living_room',
          duration: 18,
          no_wait: true,
        },
      ],
    });
    expect('format' in (result.slice.visits?.[0] ?? {})).toBe(false);
    const second = result.slice.visits?.[1];
    expect(second && 'format' in second ? second.format : undefined).toBe('goals');
  });

  it('covers stage-grammar dialogue with the existing typography lint (no new wiring)', () => {
    const withEmDash = compileCase(
      '# Case: c\nTitle: X\n\n# Visit: v\nTitle: T\nBlurb: B\n\n==\n- frank: say Det var — planen.\n',
    );
    expect(withEmDash.diagnostics.some((d) => d.code === 'lint-banned-typography')).toBe(true);
  });
});
