import { describe, expect, it } from 'vitest';
import { compileCase } from '../index';
import fixtureText from './fixtures/goal-visit.case.md?raw';

// PLAN-010 TASK-049 — a checked-in case written in the FULL stage/goal
// grammar (all six duties, every end and fail trigger, a denied-need goal,
// the call-off) compiles clean from a real file: zero errors, and exactly
// the one deliberate warning (the unknown do-activity stub).
// ## Verified red-green: 2026-08-14 (sniff regex nulled → 2 failures)

describe('goal-visit fixture — the full grammar compiles clean', () => {
  const result = compileCase(fixtureText);

  it('compiles with zero errors and only the deliberate activity-stub warning', () => {
    expect(result.diagnostics.filter((d) => d.severity === 'error')).toEqual([]);
    const warnings = result.diagnostics.filter((d) => d.severity === 'warning');
    expect(warnings.map((d) => d.code)).toEqual(['visit-activity-stub']);
    expect(warnings[0].subjectIds).toContain('observe_quietly');
  });

  it('emits the goal tier with every ruled construct present', () => {
    const visit = result.slice.visits?.[0];
    if (!visit || !('format' in visit)) throw new Error('expected a goal-tier visit');
    expect(visit.format).toBe('goals');
    expect(visit.goals.map((g) => g.name)).toEqual(['nansen', 'trives', 'avstand', 'observere']);

    const verbs = new Set(
      visit.goals.flatMap((g) => g.stages.flatMap((s) => s.duties.map((d) => d.verb))),
    );
    expect([...verbs].sort()).toEqual(['converse', 'do', 'free', 'goto', 'say', 'stay']);

    const ends = new Set(
      visit.goals.flatMap((g) => g.stages.flatMap((s) => s.ends.map((e) => e.kind))),
    );
    expect([...ends].sort()).toEqual(['arrived', 'duration', 'event']);

    const fails = new Set(
      [...visit.goals.flatMap((g) => g.stages), ...(visit.calloff_stages ?? [])].flatMap((s) =>
        s.fails.map((f) => f.kind),
      ),
    );
    expect([...fails].sort()).toEqual(['role-lost', 'timeout', 'unreachable']);

    expect(visit.goals[3].needs).toEqual([{ neg: false, kind: 'denied', id: 'nansen' }]);
    expect(visit.calloff_stages).toHaveLength(1);
    expect(visit.stub).toBe(true);
  });
});
