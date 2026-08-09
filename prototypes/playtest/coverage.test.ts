// @vitest-environment jsdom
// SB-061 Task 3 — the coverage list stays honest by construction: the
// registry type is derived from keyof CaseSlice (a new emitted kind fails the
// typecheck until named — see the @ts-expect-error below), counts derive from
// the loaded slice, and each 'player surface' claim is checked against what
// the entity actually renders.
// ## Verified red-green: 2026-08-09 (flipped clocks' status to 'no player
// surface yet', watched the honesty test fail, restored; the @ts-expect-error
// lines fail `npm run lint` when the guard they document stops holding)
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { render } from 'lit-html';
import { compileCase } from '../../src/compiler/index.ts';
import type { CaseSlice } from '../../src/compiler/index.ts';
import { COVERAGE_KEYS, COVERAGE_REGISTRY, countFor, coverageSurface } from './coverage.ts';
import type { CoverageKey, CoverageRegistry } from './coverage.ts';
import { buildIndex, entitySurface } from './model.ts';

const ROOT = process.cwd();
const result = compileCase(readFileSync(`${ROOT}/content/cases/olsen/tiny-olsen.case.md`, 'utf8'));

// ---- the exhaustiveness guard, expressed as type-level assertions ---------
// Every registry key is a CaseSlice key and vice versa (minus case metadata).
// These lines are judged by `npm run lint` (tsc): if emit.ts grows a kind the
// registry does not name, CoverageRegistry itself stops compiling.

// @ts-expect-error — a registry that drops an emitted kind must not typecheck
const missingKind: CoverageRegistry = (({ clocks: _clocks, ...rest }) => rest)(COVERAGE_REGISTRY);

// @ts-expect-error — a registry key that emit.ts does not know must not typecheck
const unknownKind: CoverageKey = 'not_an_emitted_kind';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _used = [missingKind, unknownKind];

describe('coverage registry', () => {
  it('derives every count from the loaded slice', () => {
    const { slice } = result;
    for (const key of COVERAGE_KEYS) {
      const value = slice[key];
      const expected = value === undefined ? 0 : Array.isArray(value) ? value.length : 1;
      expect(countFor(key, slice), key).toBe(expected);
    }
    // spot-check against the real olsen shape so an all-zero slice cannot pass
    expect(countFor('facts', slice)).toBeGreaterThan(0);
    expect(countFor('clocks', slice)).toBeGreaterThan(0);
  });

  it('keeps every `player surface` claim honest against the real renderers', () => {
    const groups = buildIndex(result);
    const scalarKeys = new Set(['pair_soft_reject_line', 'pair_already_set_line']);
    for (const key of COVERAGE_KEYS) {
      if (scalarKeys.has(key)) continue;
      const group = groups.find((g) => g.key === key);
      // Every array-valued registry kind must have an index group — a group
      // rename must fail here, not silently skip the honesty check.
      expect(group, `index group for ${key}`).toBeDefined();
      if (!group || group.entries.length === 0) continue;
      const host = document.createElement('div');
      render(entitySurface(group.entries[0], result).template, host);
      const fellBack = host.querySelector('.node-json') !== null;
      const claimed = COVERAGE_REGISTRY[key].status;
      expect(fellBack, `${key} claims '${claimed}'`).toBe(claimed !== 'player surface');
    }
  });

  it('registry keys mirror the CaseSlice keys minus case metadata', () => {
    // Runtime mirror of the type guard, checked against a compiled slice so
    // the assertion tracks emit.ts output, not a hand-typed list.
    const meta = new Set(['id', 'title', 'scenario_stage', 'vurdering_frist_day']);
    const sliceKeys = Object.keys(result.slice).filter((k) => !meta.has(k));
    for (const key of sliceKeys) expect(COVERAGE_KEYS, `slice key ${key}`).toContain(key);
  });
});

describe('coverageSurface', () => {
  it('renders one row per kind with its count and status', () => {
    const host = document.createElement('div');
    render(coverageSurface(result).template, host);
    const rows = [...host.querySelectorAll('.cov-row')];
    expect(rows.length).toBe(COVERAGE_KEYS.length);
    const factsRow = rows.find((r) => r.querySelector('.cov-label')!.textContent === 'Facts')!;
    expect(factsRow.querySelector('.cov-count')!.textContent).toBe(
      String((result.slice as CaseSlice).facts.length),
    );
    const deltaRow = rows.find(
      (r) => r.querySelector('.cov-label')!.textContent === 'Event deltas',
    )!;
    expect(deltaRow.querySelector('.cov-status')!.textContent).toBe('no player surface yet');
  });
});
