// SB-055 follow-up — the ⌘K palette's fuzzy scorer.
import { describe, expect, it } from 'vitest';
import { fuzzyScore } from './jump.ts';

describe('fuzzyScore', () => {
  it('matches a direct substring ahead of a scattered subsequence', () => {
    const direct = fuzzyScore('brev', 'f_brevsprekken Beskjed gjennom brevsprekken')!;
    const scattered = fuzzyScore('brev', 'f_bolig_retning en vurdering')!;
    expect(direct).toBeGreaterThan(scattered);
  });

  it('returns null when a character never appears', () => {
    expect(fuzzyScore('xyz', 'f_dod Grete er død')).toBeNull();
  });

  it('matches the empty query against everything', () => {
    expect(fuzzyScore('', 'anything')).not.toBeNull();
  });

  it('rewards id-boundary hits so "qk" finds q_kollaps', () => {
    const boundary = fuzzyScore('qk', 'q_kollaps Hvorfor kollapset omsorgen?')!;
    expect(boundary).toBeGreaterThan(0);
  });
});

describe('highlightHits', () => {
  it('wraps every case-insensitive occurrence and escapes the rest', async () => {
    const { highlightHits } = await import('./jump.ts');
    const html = highlightHits('politi', 'Politiet bisto. <b> & politi igjen.');
    expect(html).toBe(
      '<em class="hit">Politi</em>et bisto. &lt;b&gt; &amp; <em class="hit">politi</em> igjen.',
    );
  });

  it('escapes plainly when the query is empty', async () => {
    const { highlightHits } = await import('./jump.ts');
    expect(highlightHits('', '<x>')).toBe('&lt;x&gt;');
  });
});
