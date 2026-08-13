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
  triggerContext,
  variantAt,
} from './character-views.ts';
import { ICON_ART } from '../shared/thought-icon-art.ts';

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

// SB-102: the trigger map (SB-099) folded to per-pool firing context.
describe('triggerContext', () => {
  const ctx = (key_type: string, key: string, character = 'elling') =>
    triggerContext({ character, key_type, key });

  it('labels each key type with its firing rule', () => {
    expect(ctx('need', 'Hunger').label).toContain('Hunger need crosses its threshold downward');
    expect(ctx('activity', 'Lese').label).toContain('starts "Lese"');
    expect(ctx('activity', '*').label).toContain('any activity');
    expect(ctx('aversion', 'Lese').label).toContain('abandons "Lese"');
    expect(ctx('relational', 'frank').label).toContain('frank rings the doorbell');
    expect(ctx('want', '*').label).toContain('idle heartbeat');
    expect(ctx('dagsform', '*').label).toContain('idle heartbeat');
    expect(ctx('ambient', '*').label).toContain('bubble layer only');
  });

  it('marks specific want/dagsform keys dead — the heartbeat is wildcard-only', () => {
    expect(ctx('want', 'Read').dead).toBe(true);
    expect(ctx('dagsform', 'tired').dead).toBe(true);
    expect(ctx('want', '*').dead).toBeUndefined();
  });

  it('marks every frank pool dead — frank never thinks', () => {
    const c = ctx('need', 'Hunger', 'frank');
    expect(c.dead).toBe(true);
    expect(c.caveats.join(' ')).toContain('frank never thinks');
  });

  it('is honest about an unknown key type', () => {
    expect(ctx('mystery', 'x').label).toContain('no trigger map');
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

  it('renders the trigger context line above the sketches', () => {
    const el = host();
    render(
      thoughtPreview(pool(), 0, () => {}),
      el,
    );
    expect(el.querySelector('.tv-trigger-label')!.textContent).toContain(
      "elling's Hunger need crosses its threshold downward",
    );
    expect(el.querySelector('.tv-trigger-dead')).toBeNull();
  });

  it('paints a dead pool as a warning', () => {
    const el = host();
    render(
      thoughtPreview(pool({ key_type: 'want', key: 'Read' }), 0, () => {}),
      el,
    );
    expect(el.querySelector('.tv-trigger-dead')).not.toBeNull();
    expect(el.querySelector('.tv-trigger-label')!.textContent).toContain('never fires');
  });

  it('renders real icon art when the key has an exported PNG', () => {
    const el = host();
    render(
      thoughtPreview(pool({ icon_key: 'thought_doorbell' }), 0, () => {}),
      el,
    );
    const img = el.querySelector('.tv-icon-img') as HTMLImageElement;
    expect(img).not.toBeNull();
    expect(img.src).toBe(ICON_ART.thought_doorbell);
    expect(el.querySelector('.tv-icon')).toBeNull();
    expect(el.querySelector('.tv-feed-icon-img')).not.toBeNull();
  });

  it('keeps the text chip for keys without exported art', () => {
    const el = host();
    render(
      thoughtPreview(pool({ icon_key: 'icon_hunger' }), 0, () => {}),
      el,
    );
    expect(el.querySelector('.tv-icon-img')).toBeNull();
    expect(el.querySelector('.tv-icon')!.textContent).toBe('icon_hunger');
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
