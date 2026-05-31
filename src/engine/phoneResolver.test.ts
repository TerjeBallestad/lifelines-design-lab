import { describe, expect, it } from 'vitest';
import type { AttemptContext } from '../domain/types';
import { resolvePhoneAttempt } from './phoneResolver';

const base: AttemptContext = {
  client: { overskudd: 0.5, trust: 0.4, phoneMastery: 0.15, ellingState: 'prickly' },
  approachId: 'none',
  frankStance: 'matter_of_fact',
  frankPosition: 'seated_away',
  scriptState: 'missing',
  dieFace: 4,
  supportIds: ['practical_help', 'humor_play'],
  attemptIndex: 1,
};

describe('resolvePhoneAttempt', () => {
  it('is deterministic for the same context', () => {
    const a = resolvePhoneAttempt(base);
    const b = resolvePhoneAttempt(base);
    expect(a.outcome).toBe(b.outcome);
    expect(a.evidence).toEqual(b.evidence);
    expect(a.finalRoom).toEqual(b.finalRoom);
  });

  it('keeps dice probabilistic but better context improves readiness', () => {
    const weak = resolvePhoneAttempt({
      ...base,
      dieFace: 1,
      approachId: 'frank_pushes',
      frankStance: 'pushy',
      frankPosition: 'near_phone',
    });
    const strong = resolvePhoneAttempt({
      ...base,
      dieFace: 6,
      approachId: 'written_script',
      frankStance: 'soft',
      frankPosition: 'absent_setup',
      scriptState: 'placed',
      client: { overskudd: 0.8, trust: 0.7, phoneMastery: 0.4, ellingState: 'calm' },
    });
    expect(strong.readiness).toBeGreaterThan(weak.readiness);
  });

  it('emits room-stage beats before the report interprets them', () => {
    const result = resolvePhoneAttempt(base);
    expect(result.beats.length).toBeGreaterThan(1);
    expect(result.beats.every((beat) => beat.ellingPosition && beat.frankPosition)).toBe(true);
    expect(result.finalRoom.lastFriction).not.toBe('unknown');
  });

  it('keeps support pairs partially vulnerable', () => {
    const result = resolvePhoneAttempt(base);
    expect(result.supportAnalysis.coveredPressures.length).toBeGreaterThan(0);
    expect(result.supportAnalysis.carriedWeaknesses.length).toBeGreaterThan(0);
    expect(result.evidence.some((item) => item.id === 'carried_weakness')).toBe(true);
  });

  it('produces next approaches after an attempt', () => {
    const result = resolvePhoneAttempt(base);
    expect(result.nextApproachIds.length).toBeGreaterThan(0);
  });
});
