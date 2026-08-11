// SB-071 — the stub-count lint in the gen:content pipeline: countStubs
// scans the real sources, formatStubCount is the check-mode line the
// placeholder purge gets measured by.
import { describe, expect, it } from 'vitest';
import { countStubs, defaultPaths, formatStubCount } from './compile-content.mjs';

describe('countStubs', () => {
  it('covers the case file and every character source, total = sum', async () => {
    const { total, perFile } = await countStubs(defaultPaths());
    const files = perFile.map((entry) => entry.file);
    expect(files).toContain('tiny-olsen.case.md');
    expect(files).toContain('elling.sim.md');
    expect(files).toContain('frank.sim.md');
    expect(files).toContain('grete.sim.md');
    expect(total).toBe(perFile.reduce((sum, entry) => sum + entry.count, 0));
    for (const entry of perFile) expect(entry.count).toBeGreaterThanOrEqual(0);
  });
});

describe('formatStubCount', () => {
  it('reports zero as the finished purge', () => {
    expect(formatStubCount({ total: 0, perFile: [] })).toBe(
      'stub count: 0 — the placeholder purge is done',
    );
  });

  it('lists only the files that still carry stubs', () => {
    const line = formatStubCount({
      total: 3,
      perFile: [
        { file: 'tiny-olsen.case.md', count: 0 },
        { file: 'elling.sim.md', count: 2 },
        { file: 'frank.sim.md', count: 1 },
      ],
    });
    expect(line).toBe(
      'stub count: 3 (Stub: yes blocks awaiting rewrite) — elling.sim.md 2 · frank.sim.md 1',
    );
  });
});
