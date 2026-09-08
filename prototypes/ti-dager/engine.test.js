import { describe, expect, it } from 'vitest';
import CASE from './case.json';
import {
  availableBriefs,
  availableCalls,
  createState,
  endDay,
  evalCond,
  handToFrank,
  liftFact,
  openDoc,
  ringCall,
  sendFrank,
  signVerdict,
} from './engine.js';
import { validateCase } from './validate.js';

const C = CASE;

describe('case.json', () => {
  it('validates clean', () => {
    const problems = validateCase(C);
    expect(problems).toEqual([]);
  });
});

describe('condition grammar', () => {
  const s = {
    facts: { f_a: {} },
    fired: { t_x: 2 },
    visits: ['v_a'],
    calls: [],
    door: 2,
    day: 4,
    witnessed: true,
  };
  it('evaluates atoms and joins', () => {
    expect(evalCond('has f_a', s)).toBe(true);
    expect(evalCond('not has f_b', s)).toBe(true);
    expect(evalCond('fired t_x and visited v_a', s)).toBe(true);
    expect(evalCond('door >= 2 and door < 3', s)).toBe(true);
    expect(evalCond('day == 4 and witnessed', s)).toBe(true);
    expect(evalCond('any_visit', s)).toBe(true);
    expect(evalCond('', s)).toBe(true);
  });
  it('rejects unknown atoms', () => {
    expect(() => evalCond('door_is_open', s)).toThrow();
  });
});

describe('idle run', () => {
  it('reaches the idle ending on day 10 with the status letter and no double fire', () => {
    const s = createState(C);
    const fireLog = [];
    let last = null;
    while (!s.ended) {
      last = endDay(C, s);
      fireLog.push(...last.fired);
    }
    expect(s.day).toBe(10);
    expect(last.atVerdict).toBe(true);
    expect(new Set(fireLog).size).toBe(fireLog.length);
    expect(s.docs.doc_status).toBeTruthy();
    // Ceilings keep the idle player on the story.
    expect(s.docs.doc_innleggelse).toBeTruthy();
    expect(s.docs.doc_dodsfall).toBeTruthy();
    expect(s.docs.doc_huseier).toBeTruthy();
    expect(s.door).toBe(0);
    const page = signVerdict(C, s, 'vd_selv');
    expect(page?.text).toContain('aldri hørt stemmen');
  });
});

describe('golden path', () => {
  it('reaches the open door by day 9 and the witnessed page', () => {
    const s = createState(C);
    // Day 1: read, lift, Frank, ring Grete, get consent.
    openDoc(s, 'doc_bekymring');
    liftFact(s, 'f_grete_syk', 'doc_bekymring');
    liftFact(s, 'f_aldri_alene', 'doc_bekymring');
    handToFrank(C, s, 'f_grete_syk');
    expect(availableCalls(C, s)).toContain('call_grete');
    const n1 = ringCall(C, s, 'call_grete');
    expect(n1?.kind).toBe('node');
    liftFact(s, 'f_klarer_seg', 'call_grete');
    liftFact(s, 'f_samtykke', 'call_grete');
    handToFrank(C, s, 'f_samtykke');
    expect(availableBriefs(C, s)).toContain('v_bli_kjent');
    // Visit 1 the same day.
    const v1 = sendFrank(C, s, 'v_bli_kjent');
    expect(v1?.delivered).toContain('doc_notat_1');
    expect(sendFrank(C, s, 'v_bli_kjent')).toBeNull(); // field action spent
    let m = endDay(C, s);
    expect(s.day).toBe(2);
    expect(m?.report?.[0]).toMatch(/sliten/);
    // Day 2: lift post, kartlegg.
    liftFact(s, 'f_post', 'doc_notat_1');
    handToFrank(C, s, 'f_post');
    sendFrank(C, s, 'v_kartlegg');
    m = endDay(C, s);
    expect(s.day).toBe(3);
    expect(m?.landed).toContain('doc_konto');
    expect(m?.landed).toContain('doc_innleggelse'); // has f_klarer_seg, floor 2
    // Day 3 onward: hand innlagt, then stand at the door every day.
    liftFact(s, 'f_innlagt', 'doc_innleggelse');
    handToFrank(C, s, 'f_innlagt');
    expect(availableBriefs(C, s)).toContain('v_kontakt');
    const ladderLines = [];
    while (!s.ended) {
      if (s.door < 4 && availableBriefs(C, s).includes('v_kontakt')) {
        const r = sendFrank(C, s, 'v_kontakt');
        expect(r?.beats.length).toBeGreaterThan(1);
      }
      const call = ringCall(C, s, 'call_elling');
      if (call) ladderLines.push(call.lines[0].text);
      endDay(C, s);
    }
    expect(s.door).toBe(4);
    expect(s.witnessed).toBe(true);
    expect(s.visits.filter((v) => v === 'v_kontakt').length).toBe(4);
    // The Elling call changed as the ladder moved.
    expect(new Set(ladderLines).size).toBeGreaterThanOrEqual(4);
    expect(s.docs.doc_kontakt_4).toBeTruthy();
    const page = signVerdict(C, s, 'vd_selv');
    expect(page?.text).toContain('Du så ham åpne døren');
  });

  it('pressing with forms sets the ladder back at the early steps', () => {
    const s = createState(C);
    s.door = 2;
    s.fired.innleggelse = 2;
    s.fired.dodsfall = 3;
    s.briefs.push('v_kontakt_press');
    s.day = 5;
    const r = sendFrank(C, s, 'v_kontakt_press');
    expect(r?.moved).toBe(-1);
    expect(s.door).toBe(1);
    expect(s.docs.doc_notat_press).toBeTruthy();
  });

  it('skipping the scene never counts as witnessed', () => {
    const s = createState(C);
    s.fired.innleggelse = 2;
    s.briefs.push('v_kontakt');
    s.day = 3;
    sendFrank(C, s, 'v_kontakt', { skipped: true });
    expect(s.door).toBe(1);
    expect(s.witnessed).toBe(false);
  });

  it('fallback brief arrives if the player never gets consent', () => {
    const s = createState(C);
    endDay(C, s); // day 1 -> 2
    expect(s.briefs).not.toContain('v_bli_kjent');
    endDay(C, s); // day 2 -> 3, fallback fires at ceil 2
    expect(s.briefs).toContain('v_bli_kjent');
  });
});
