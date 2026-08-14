// @vitest-environment jsdom
// SB-071: the Strings sub-view — row derivation plus render checks over the
// flat two-column id/text table template.
import { render } from 'lit-html';
import { describe, expect, it } from 'vitest';
import type { StringTableOut } from '../../src/compiler/emit-visit.ts';
import {
  FAMILY_INFO,
  emptyRowCount,
  stringRows,
  stringsPreview,
  tiltakGroups,
} from './strings-views.ts';

const table = (over: Partial<StringTableOut> = {}): StringTableOut => ({
  id: 'strings_notat',
  entries: {
    notat_intro: 'Elling har det bra i dag.',
    notat_utro: 'Noe skurrer.',
  },
  ...over,
});

describe('stringRows', () => {
  it('keeps authored order and flags empty values', () => {
    const rows = stringRows(table({ entries: { a_key: 'Tekst.', b_key: '', c_key: '  ' } }));
    expect(rows.map((r) => r.key)).toEqual(['a_key', 'b_key', 'c_key']);
    expect(rows.map((r) => r.empty)).toEqual([false, true, true]);
    expect(emptyRowCount(rows)).toBe(2);
  });

  it('yields no rows for an empty table', () => {
    expect(stringRows(table({ entries: {} }))).toEqual([]);
  });
});

describe('stringsPreview', () => {
  const renderInto = (t: StringTableOut): HTMLElement => {
    const host = document.createElement('div');
    render(stringsPreview(t), host);
    return host;
  };

  it('renders a two-column table: id column and verbatim Norwegian text', () => {
    const host = renderInto(table());
    const heads = [...host.querySelectorAll('th')].map((th) => th.textContent?.trim());
    expect(heads).toEqual(['id', 'text']);
    const keys = [...host.querySelectorAll('.sv-key')].map((td) => td.textContent?.trim());
    expect(keys).toEqual(['notat_intro', 'notat_utro']);
    expect(host.textContent).toContain('Elling har det bra i dag.');
    expect(host.textContent?.replace(/\s+/g, ' ')).toContain('2 entries');
    expect(host.querySelector('.tv-stub-chip')).toBeNull();
  });

  it('shows the stub chip on a Stub: yes table', () => {
    const host = renderInto(table({ stub: true }));
    expect(host.querySelector('.tv-stub-chip')?.textContent).toContain('stub');
  });

  it('marks empty values as visible holes and counts them', () => {
    const host = renderInto(table({ entries: { a_key: '' } }));
    expect(host.querySelector('.sv-row-empty')).not.toBeNull();
    expect(host.querySelector('.sv-hole')?.textContent).toContain('no text yet');
    expect(host.querySelector('.sv-count')?.textContent).toContain('1 empty');
  });

  it('says so when no entries are authored yet', () => {
    const host = renderInto(table({ entries: {} }));
    expect(host.querySelector('.sv-empty')?.textContent).toContain('no entries authored yet');
  });
});

// SB-103: per-family context from the SB-101 liveness map.
describe('FAMILY_INFO', () => {
  it('covers all ten authored families', () => {
    expect(Object.keys(FAMILY_INFO).sort()).toEqual([
      'dagsrapport',
      'frank_actions',
      'handbok',
      'handbok_tiltak',
      'notat',
      'notat_fragments',
      'prologue',
      'sim_text',
      'tiltak_visits',
      'visit',
    ]);
  });

  it('flags exactly one family display-dead: tiltak_visits', () => {
    const dead = Object.entries(FAMILY_INFO).filter(([, i]) => i.displayDead);
    expect(dead.map(([id]) => id)).toEqual(['tiltak_visits']);
  });
});

describe('tiltakGroups', () => {
  it('groups <id>.<field> keys into book rows, first-seen order, krav in authored order', () => {
    const groups = tiltakGroups({
      'alarm.navn': 'TRYGGHETSALARM',
      'alarm.ytelse': 'alarm ved fall; utrykning.',
      'alarm.krav.0': 'bruker bærer alarmen',
      'alarm.krav.1': 'noe annet',
      'alarm.dawn': 'alarm montert.',
      'tt.navn': 'TT-KORT',
      dotless: 'ignored',
    });
    expect(groups.map((g) => g.id)).toEqual(['alarm', 'tt']);
    expect(groups[0]).toEqual({
      id: 'alarm',
      navn: 'TRYGGHETSALARM',
      ytelse: 'alarm ved fall; utrykning.',
      dawn: 'alarm montert.',
      krav: ['bruker bærer alarmen', 'noe annet'],
    });
    expect(groups[1].krav).toEqual([]);
  });
});

describe('stringsPreview family context', () => {
  const renderInto = (t: StringTableOut): HTMLElement => {
    const host = document.createElement('div');
    render(stringsPreview(t), host);
    return host;
  };

  it('renders the what/where header for a mapped family', () => {
    const host = renderInto(table({ id: 'notat' }));
    expect(host.querySelector('.sv-family-what')?.textContent).toContain('notat body');
    expect(host.querySelector('.sv-family-surface')?.textContent).toContain('DocReader');
    expect(host.querySelector('.sv-dead')).toBeNull();
  });

  it('says so for a family the liveness map does not know', () => {
    const host = renderInto(table({ id: 'strings_notat' }));
    expect(host.querySelector('.sv-family-what')?.textContent).toContain('unmapped family');
  });

  it('flags tiltak_visits display-dead instead of pretending it renders', () => {
    const host = renderInto(table({ id: 'tiltak_visits' }));
    expect(host.querySelector('.sv-dead')?.textContent).toContain('display-dead');
  });

  it('renders håndbok book rows for the TILTAK catalog family', () => {
    const host = renderInto(
      table({
        id: 'handbok_tiltak',
        entries: {
          'alarm.navn': 'TRYGGHETSALARM',
          'alarm.ytelse': 'alarm ved fall; utrykning.',
          'alarm.krav.0': 'bruker bærer alarmen',
          'alarm.dawn': 'alarm montert.',
        },
      }),
    );
    const row = host.querySelector('.sv-tiltak')!;
    expect(row.querySelector('.sv-tiltak-navn')?.textContent?.trim()).toBe('TRYGGHETSALARM');
    expect(row.querySelector('.sv-tiltak-ytelse')?.textContent).toContain('alarm ved fall');
    expect(row.querySelector('.sv-tiltak-krav-row')?.textContent).toContain('bruker bærer alarmen');
    expect(row.querySelector('.sv-tiltak-dawn')?.textContent).toContain('alarm montert.');
    // The flat table still renders below the sketch.
    expect(host.querySelector('.sv-table')).not.toBeNull();
  });

  it('keeps other families on the flat table only', () => {
    const host = renderInto(table({ id: 'notat' }));
    expect(host.querySelector('.sv-tiltak-list')).toBeNull();
  });
});
