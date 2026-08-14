import { describe, expect, it } from 'vitest';
import { DiagnosticBag } from '../diagnostics';
import { parseCaseText } from '../parse';
import type { RawBlock } from '../parse';
import { parseVisitGrammar, resolveStageDuties } from '../visit-grammar';
import type { StageGrammarVisit } from '../visit-grammar';

// PLAN-010 TASK-047 — the ruled SB-107/SB-114 stage/goal grammar parses from
// `# Visit:` blocks into a typed scene model. Reference behavior: the probe
// parser in prototypes/visit-syntax/index.html (ported, not linked).
// ## Verified red-green: 2026-08-14 (sniff regex nulled → 30 failures)

function visitBlock(text: string): RawBlock {
  const diag = new DiagnosticBag();
  const parsed = parseCaseText(text, diag);
  const block = parsed.blocks.find((b) => b.type === 'visit');
  if (!block) throw new Error('no visit block parsed');
  return block;
}

function grammar(text: string): { visit: StageGrammarVisit; diag: DiagnosticBag } {
  const diag = new DiagnosticBag();
  const visit = parseVisitGrammar(visitBlock(text), diag);
  return { visit, diag };
}

function errors(diag: DiagnosticBag): string[] {
  return diag.items.filter((d) => d.severity === 'error').map((d) => d.code);
}

const HAPPY = [
  '# Case: c_x',
  'Title: X',
  '',
  '# Visit: opp_alene',
  'Title: Klarer han seg alene?',
  'Blurb: Se på Elling.',
  'Offer: "Vil du se på hva han klarer?"',
  'Stub: yes',
  '',
  '## Goal: nansen',
  'plan: Se hva han leser',
  'need: elling, not f_avstand, denied trives',
  'yield: f_bok, open q_evner',
  '',
  '==',
  '- frank: goto elling',
  '-> arrived',
  '!> unreachable grace=2',
  '',
  '== lese',
  '- elling: say "Nansen lot Fram fryse fast i isen."',
  '',
  '## Goal: trives',
  'plan: Spør om han trives',
  'need: grete, f_bok',
  'yield: f_svarer',
  '',
  '==',
  '- frank: converse grete Liker du å bo her?',
  '- elling: free',
  '-> duration 8',
  '-> event tea_done',
  '!> timeout 6',
  '!> role-lost grete grace=1',
  '',
  '==',
  '- frank: goto living_room seat=sofa',
  '- grete: do make_tea',
  '- elling: stay',
  '-> arrived',
  '',
  '## Call-off',
  '',
  '==',
  '- frank: goto entrance',
  '-> arrived',
  '!> timeout 6',
].join('\n');

describe('parse.ts capture — stage-grammar sniff (weave precedent)', () => {
  it('flags a stage-grammar visit body and captures it verbatim with true line numbers', () => {
    const block = visitBlock(HAPPY);
    expect(block.stageGrammar).toBe(true);
    expect(block.bullets).toBeUndefined();
    expect(block.fields).toEqual([]);
    const goalLine = block.proseLines.find((p) => p.text === '## Goal: nansen');
    expect(goalLine?.line).toBe(10);
    const dutyLine = block.proseLines.find((p) => p.text === '- frank: goto elling');
    expect(dutyLine?.line).toBe(16);
  });

  it('keeps ## Goal / ## Call-off out of the generic sub-block opener', () => {
    const diag = new DiagnosticBag();
    const parsed = parseCaseText(HAPPY, diag);
    expect(parsed.blocks.map((b) => b.type)).toEqual(['visit']);
    expect(diag.items.filter((d) => d.code === 'block-unknown')).toEqual([]);
  });

  it('leaves a legacy visit body on the fields+bullets path, no flag', () => {
    const block = visitBlock(
      '# Case: c_x\nTitle: X\n\n# Visit: opp_x\nTitle: T\nBlurb: B\n\n- frank: «Hei.» [id=s1]\n',
    );
    expect(block.stageGrammar).toBeUndefined();
    expect(block.fields.map((f) => f.key)).toEqual(['Title', 'Blurb']);
    expect(block.bullets?.map((b) => b.text)).toEqual(['frank: «Hei.» [id=s1]']);
    expect(block.proseLines).toEqual([]);
  });
});

describe('visit-grammar — the happy path model', () => {
  const { visit, diag } = grammar(HAPPY);

  it('parses clean: no errors', () => {
    expect(errors(diag)).toEqual([]);
  });

  it('reads the visit meta with quote stripping and the stub marker', () => {
    expect(visit.id).toBe('opp_alene');
    expect(visit.title).toBe('Klarer han seg alene?');
    expect(visit.blurb).toBe('Se på Elling.');
    expect(visit.offer).toBe('Vil du se på hva han klarer?');
    expect(visit.stub).toBe(true);
  });

  it('builds two goals with plan lines, needs and yields', () => {
    expect(visit.goals.map((g) => g.name)).toEqual(['nansen', 'trives']);
    expect(visit.goals[0].plan).toBe('Se hva han leser');
    expect(visit.goals[0].needs).toEqual([
      { neg: false, kind: 'presence', id: 'elling' },
      { neg: true, kind: 'fact', id: 'f_avstand' },
      { neg: false, kind: 'denied', id: 'trives' },
    ]);
    expect(visit.goals[0].yields).toEqual([
      { kind: 'fact', id: 'f_bok' },
      { kind: 'open', id: 'q_evner' },
    ]);
    expect(visit.goals[1].needs).toEqual([
      { neg: false, kind: 'presence', id: 'grete' },
      { neg: false, kind: 'fact', id: 'f_bok' },
    ]);
  });

  it('generates stable ids for anonymous stages and keeps authored names', () => {
    expect(visit.goals[0].stages.map((s) => s.id)).toEqual(['st1', 'lese']);
    expect(visit.goals[0].stages[0].auto).toBe(true);
    expect(visit.goals[0].stages[1].auto).toBeUndefined();
    expect(visit.goals[1].stages.map((s) => s.id)).toEqual(['st3', 'st4']);
    expect(visit.calloffStages.map((s) => s.id)).toEqual(['st5']);
  });

  it('parses every duty word with args, params and dialogue', () => {
    const [approach, lese] = visit.goals[0].stages;
    expect(approach.duties.frank).toMatchObject({
      verb: 'goto',
      target: 'elling',
      targetKind: 'character',
    });
    expect(lese.duties.elling).toMatchObject({
      verb: 'say',
      line: 'Nansen lot Fram fryse fast i isen.',
    });
    const [talk, settle] = visit.goals[1].stages;
    expect(talk.duties.frank).toMatchObject({
      verb: 'converse',
      partner: 'grete',
      line: 'Liker du å bo her?',
    });
    expect(talk.duties.elling).toMatchObject({ verb: 'free' });
    expect(settle.duties.frank).toMatchObject({
      verb: 'goto',
      target: 'living_room',
      targetKind: 'room',
      params: { seat: 'sofa' },
    });
    expect(settle.duties.grete).toMatchObject({ verb: 'do', activity: 'make_tea' });
    expect(settle.duties.elling).toMatchObject({ verb: 'stay' });
  });

  it('strips quotes only when they wrap the whole line', () => {
    const quoteless = grammar(
      '# Case: c\nTitle: X\n\n# Visit: v\nTitle: T\nBlurb: B\n\n==\n- frank: say Er det "Nansen" du leser om?\n',
    );
    expect(quoteless.visit.spineStages[0].duties.frank.line).toBe('Er det "Nansen" du leser om?');
  });

  it('parses every end trigger, multiple ends as OR', () => {
    expect(visit.goals[0].stages[0].ends).toEqual([{ kind: 'arrived' }]);
    expect(visit.goals[1].stages[0].ends).toEqual([
      { kind: 'duration', minutes: 8 },
      { kind: 'event', name: 'tea_done' },
    ]);
  });

  it('marks self-terminating say/converse stages with autoEnd', () => {
    expect(visit.goals[0].stages[1].ends).toEqual([]);
    expect(visit.goals[0].stages[1].autoEnd).toBe('line read');
  });

  it('parses every fail trigger with grace minutes', () => {
    expect(visit.goals[0].stages[0].fails).toEqual([{ kind: 'unreachable', graceMinutes: 2 }]);
    expect(visit.goals[1].stages[0].fails).toEqual([
      { kind: 'timeout', minutes: 6 },
      { kind: 'role-lost', role: 'grete', graceMinutes: 1 },
    ]);
  });

  it('collects call-off stages at visit level, outside any goal', () => {
    expect(visit.calloffStages).toHaveLength(1);
    expect(visit.calloffStages[0].duties.frank).toMatchObject({
      verb: 'goto',
      target: 'entrance',
      targetKind: 'room',
    });
    expect(visit.goals.flatMap((g) => g.stages)).not.toContain(visit.calloffStages[0]);
  });
});

describe('visit-grammar — sticky duties (resolveStageDuties)', () => {
  const { visit } = grammar(HAPPY);
  const resolved = resolveStageDuties(visit);

  it('carries an unnamed character forward inside a section', () => {
    const lese = resolved.find((r) => r.stage.id === 'lese')!;
    expect(lese.resolved.frank.mode).toBe('carried');
    expect(lese.resolved.frank.duty?.verb).toBe('goto');
  });

  it('free releases and converse pulls the partner in', () => {
    const talk = resolved.find((r) => r.stage.id === 'st3')!;
    expect(talk.resolved.elling.mode).toBe('released');
    expect(talk.resolved.grete.mode).toBe('partner');
    expect(talk.resolved.grete.duty?.verb).toBe('converse');
  });

  it('resets the carried slate at each section boundary', () => {
    const calloff = resolved.find((r) => r.stage.id === 'st5')!;
    expect(calloff.resolved.grete.mode).toBe('free');
    expect(calloff.resolved.elling.mode).toBe('free');
  });
});

describe('visit-grammar — validation errors', () => {
  const wrap = (body: string): string =>
    `# Case: c\nTitle: X\n\n# Visit: v\nTitle: T\nBlurb: B\n\n${body}\n`;

  it('errors on an unknown duty word', () => {
    const { diag } = grammar(wrap('==\n- frank: dance\n-> arrived'));
    expect(errors(diag)).toContain('visit-unknown-duty');
  });

  it('errors on an unknown character', () => {
    const { diag } = grammar(wrap('==\n- reidun: stay\n-> arrived'));
    expect(errors(diag)).toContain('visit-unknown-character');
  });

  it('errors on a second duty for the same character in one stage', () => {
    const { diag } = grammar(wrap('==\n- frank: stay\n- frank: goto entrance\n-> arrived'));
    expect(errors(diag)).toContain('visit-duty-conflict');
  });

  it('errors on a missing required duty arg', () => {
    const { diag } = grammar(wrap('==\n- frank: goto\n-> arrived'));
    expect(errors(diag)).toContain('visit-duty-arg-missing');
  });

  it('errors on an unknown end trigger word', () => {
    const { diag } = grammar(wrap('==\n- frank: stay\n-> finished'));
    expect(errors(diag)).toContain('visit-unknown-trigger');
  });

  it('errors on an unknown fail trigger word', () => {
    const { diag } = grammar(wrap('==\n- frank: stay\n-> arrived\n!> lost'));
    expect(errors(diag)).toContain('visit-unknown-trigger');
  });

  it('errors on a non-numeric duration / timeout and a nameless event', () => {
    expect(errors(grammar(wrap('==\n- frank: stay\n-> duration soon')).diag)).toContain(
      'visit-trigger-arg-invalid',
    );
    expect(errors(grammar(wrap('==\n- frank: stay\n-> arrived\n!> timeout soon')).diag)).toContain(
      'visit-trigger-arg-invalid',
    );
    expect(errors(grammar(wrap('==\n- frank: stay\n-> event')).diag)).toContain(
      'visit-trigger-arg-invalid',
    );
  });

  it('errors when role-lost names no cast member', () => {
    const { diag } = grammar(wrap('==\n- frank: stay\n-> arrived\n!> role-lost sofa'));
    expect(errors(diag)).toContain('visit-trigger-arg-invalid');
  });

  it('errors on a stage that never ends', () => {
    const { diag } = grammar(wrap('==\n- frank: stay'));
    expect(errors(diag)).toContain('visit-stage-never-ends');
  });

  it('does not require an end trigger on a say/converse stage', () => {
    const { diag } = grammar(wrap('==\n- frank: say Hei.'));
    expect(errors(diag)).toEqual([]);
  });

  it('errors on duplicate goal names', () => {
    const { diag } = grammar(
      wrap('## Goal: a\n==\n- frank: say Hei.\n\n## Goal: a\n==\n- frank: say Hei igjen.'),
    );
    expect(errors(diag)).toContain('duplicate-id');
  });

  it('errors on a goal with no stages', () => {
    const { diag } = grammar(
      wrap('## Goal: tom\nplan: Ingenting\n\n## Call-off\n==\n- frank: say Ha det.'),
    );
    expect(errors(diag)).toContain('visit-goal-empty');
  });

  it('errors on an authored cost: line', () => {
    const { diag } = grammar(wrap('## Goal: a\nplan: P\ncost: 5\n==\n- frank: say Hei.'));
    expect(errors(diag)).toContain('visit-cost-authored');
  });

  it('errors on a duty line outside any stage', () => {
    const { diag } = grammar(wrap('- frank: stay\n\n==\n- frank: say Hei.'));
    expect(errors(diag)).toContain('line-unparsed');
  });

  it('errors on a second ## Call-off section', () => {
    const { diag } = grammar(
      wrap('## Call-off\n==\n- frank: say Ha det.\n\n## Call-off\n==\n- frank: say Igjen.'),
    );
    expect(errors(diag)).toContain('duplicate-id');
  });

  it('errors on a denied need without a goal name', () => {
    const { diag } = grammar(wrap('## Goal: a\nneed: denied\n==\n- frank: say Hei.'));
    expect(errors(diag)).toContain('line-unparsed');
  });

  it('warns (never errors) on a goto target in neither namespace', () => {
    const { visit, diag } = grammar(wrap('==\n- frank: goto attic\n-> arrived'));
    expect(errors(diag)).toEqual([]);
    expect(diag.items.map((d) => d.code)).toContain('visit-target-unknown');
    expect(visit.spineStages[0].duties.frank.targetKind).toBe('unknown');
  });
});
