// @vitest-environment jsdom
// SB-069: the Thoughts/Barks sub-view logic — pool grouping, header parsing,
// variant cycling — plus render checks over the lit templates (both in-game
// thought forms, verbatim bark bubble, cycle control).
import { render } from 'lit-html';
import { describe, expect, it } from 'vitest';
import type { BarkPoolOut, ThoughtPoolOut } from '../../src/compiler/emit-character.ts';
import {
  FALLBACK_ICON,
  barkPreview,
  groupThoughtHeadings,
  nextVariant,
  parseThoughtHeader,
  thoughtPoolKey,
  thoughtPreview,
  variantAt,
} from './character-views.ts';

describe('parseThoughtHeader', () => {
  it('splits a well-formed header into its three parts', () => {
    expect(parseThoughtHeader('# Thoughts: elling/need/Hunger')).toEqual({
      character: 'elling',
      keyType: 'need',
      key: 'Hunger',
    });
  });

  it('accepts the wildcard key and strips a trailing // comment', () => {
    expect(parseThoughtHeader('# Thoughts: grete/want/* // ambient pool')).toEqual({
      character: 'grete',
      keyType: 'want',
      key: '*',
    });
  });

  it('rejects malformed headers', () => {
    expect(parseThoughtHeader('# Thoughts: elling/need')).toBeNull();
    expect(parseThoughtHeader('# Thoughts: ')).toBeNull();
    expect(parseThoughtHeader('# Barks: elling')).toBeNull();
    expect(parseThoughtHeader('# Thoughts: a//b')).toBeNull();
  });
});

describe('groupThoughtHeadings', () => {
  const lines = [
    '# Thoughts: elling/need/Hunger',
    '# Thoughts: elling/need/Rest',
    '# Thoughts: elling/want/*',
    '# Thoughts: broken header',
  ];
  const headings = lines.map((_, i) => ({ line: i + 1 }));
  const lineTextAt = (line: number) => lines[line - 1] ?? '';

  it('groups by character × key type in first-seen order', () => {
    const groups = groupThoughtHeadings(headings.slice(0, 3), lineTextAt);
    expect(groups.map((g) => `${g.character}/${g.keyType}`)).toEqual([
      'elling/need',
      'elling/want',
    ]);
    expect(groups[0].items.map((i) => i.key)).toEqual(['Hunger', 'Rest']);
    expect(groups[1].items).toEqual([{ line: 3, key: '*' }]);
  });

  it('keeps malformed headers reachable in a ?/? group', () => {
    const groups = groupThoughtHeadings(headings, lineTextAt);
    const last = groups[groups.length - 1];
    expect(last.character).toBe('?');
    expect(last.keyType).toBe('?');
    expect(last.items[0].line).toBe(4);
  });
});

describe('variant cycling', () => {
  it('nextVariant wraps and holds at 0 for empty pools', () => {
    expect(nextVariant(0, 3)).toBe(1);
    expect(nextVariant(2, 3)).toBe(0);
    expect(nextVariant(5, 0)).toBe(0);
    expect(nextVariant(0, 1)).toBe(0);
  });

  it('variantAt clamps a stale index by modulo and is null when empty', () => {
    expect(variantAt(['a', 'b'], 0)).toEqual({ text: 'a', ix: 0 });
    expect(variantAt(['a', 'b'], 5)).toEqual({ text: 'b', ix: 1 });
    expect(variantAt([], 2)).toBeNull();
  });
});

const pool = (over: Partial<ThoughtPoolOut> = {}): ThoughtPoolOut => ({
  character: 'elling',
  key_type: 'need',
  key: 'Hunger',
  lines: ['Sulten. Kjøleskapet er langt unna.', 'Mat. Snart.'],
  ...over,
});

describe('thoughtPreview', () => {
  const host = () => {
    const el = document.createElement('div');
    document.body.append(el);
    return el;
  };

  it('renders both in-game forms: icon bubble and TANKER text row', () => {
    const el = host();
    render(
      thoughtPreview(pool({ icon_key: 'icon_hunger' }), 0, () => {}),
      el,
    );
    // Icon-only bubble: the icon key, never the line text.
    const bubble = el.querySelector('.tv-thought')!;
    expect(bubble.textContent).toContain('icon_hunger');
    expect(bubble.textContent).not.toContain('Sulten');
    // Text feed row: the current variant, verbatim Norwegian.
    expect(el.querySelector('.tv-feed-text')!.textContent).toBe(
      'Sulten. Kjøleskapet er langt unna.',
    );
    expect(el.querySelector('.tv-cycle-count')!.textContent).toContain('variant 1 of 2');
    expect(el.querySelector('.tv-icon-fallback')).toBeNull();
  });

  it('marks the icon_think fallback when no Icon: line is authored', () => {
    const el = host();
    render(
      thoughtPreview(pool(), 0, () => {}),
      el,
    );
    expect(el.querySelector('.tv-icon')!.textContent).toBe(FALLBACK_ICON);
    expect(el.querySelector('.tv-icon-fallback')).not.toBeNull();
  });

  it('cycles variants through the control', () => {
    const el = host();
    let ix = 0;
    const draw = () =>
      render(
        thoughtPreview(pool(), ix, () => {
          ix = nextVariant(ix, 2);
          draw();
        }),
        el,
      );
    draw();
    (el.querySelector('.tv-cycle-btn') as HTMLButtonElement).click();
    expect(el.querySelector('.tv-feed-text')!.textContent).toBe('Mat. Snart.');
    expect(el.querySelector('.tv-cycle-count')!.textContent).toContain('variant 2 of 2');
  });

  it('shows the stub chip and an honest empty state', () => {
    const el = host();
    render(
      thoughtPreview(pool({ lines: [], stub: true }), 0, () => {}),
      el,
    );
    expect(el.querySelector('.tv-stub-chip')).not.toBeNull();
    expect(el.querySelector('.tv-feed-text')!.textContent).toContain('no variants');
    expect((el.querySelector('.tv-cycle-btn') as HTMLButtonElement).disabled).toBe(true);
  });
});

describe('barkPreview', () => {
  it('renders the bark line verbatim in a speech bubble', () => {
    const el = document.createElement('div');
    const bark: BarkPoolOut = { character: 'frank', lines: ['Godt å se deg.'] };
    render(
      barkPreview(bark, 0, () => {}),
      el,
    );
    expect(el.querySelector('.tv-speech')!.textContent!.trim()).toBe('Godt å se deg.');
    expect(el.querySelector('.tv-figure-name')!.textContent).toBe('frank');
    expect((el.querySelector('.tv-cycle-btn') as HTMLButtonElement).disabled).toBe(true);
  });
});

describe('thoughtPoolKey', () => {
  it('matches the # Thoughts: header payload', () => {
    expect(thoughtPoolKey(pool())).toBe('elling/need/Hunger');
  });
});
