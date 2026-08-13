// SB-110: shape guard for the generated activity catalog. Freshness against
// core-loop is checked by `npm run gen:activities:check` (needs Godot); this
// test guards the committed module itself.
import { describe, expect, it } from 'vitest';
import { ACTIVITY_CATALOG, ACTIVITY_IDS, activityName } from './generated/activityCatalog.ts';

describe('activity catalog', () => {
  it('is non-empty with unique snake_case ids', () => {
    expect(ACTIVITY_CATALOG.length).toBeGreaterThan(0);
    const ids = ACTIVITY_CATALOG.map((entry) => entry.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) {
      expect(id).toMatch(/^[a-z0-9]+(_[a-z0-9]+)*$/);
    }
  });

  it('keeps ids sorted for stable diffs', () => {
    const ids = ACTIVITY_CATALOG.map((entry) => entry.id);
    expect(ids).toEqual([...ids].sort());
  });

  it('resolves display names by wire id', () => {
    expect(ACTIVITY_IDS.has('make_tea')).toBe(true);
    expect(activityName('make_tea')).toBe('Make Tea');
    expect(activityName('rest_nap')).toBe('Rest/Nap');
    expect(activityName('no_such_activity')).toBeNull();
  });
});
