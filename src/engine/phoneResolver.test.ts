import { describe, expect, it } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  phoneActivityClocks,
  phoneApproaches,
  phonePressureObjects,
  phoneSupportModes,
  telefonAversjon,
} from '../content/phonePractice';
import { PhonePracticeLab } from '../components/PhonePracticeLab';
import type { AttemptContext } from '../domain/types';
import { resolvePhoneAttempt } from './phoneResolver';

const bannedClinicalLabel =
  /\b(anxiety|depression|adhd|ptsd|ocd|trauma response|executive dysfunction|diagnosis|diagnose)\b/i;
const allowedAbstractLabels = new Set([
  'Rastløshet',
  'Skam',
  'Affliction',
  'Silence',
  'Lettelse',
  'Forpliktelse',
  'Tåke',
  'Blottstillelse',
  'Terskel',
]);

function playerFacingPressureText(pressure: (typeof phonePressureObjects)[number]): string {
  return [
    pressure.conditionLabel,
    pressure.objectLabel,
    pressure.label,
    pressure.escalatesInto,
    pressure.softenedBy,
    pressure.designPurpose,
    ...pressure.visibleSigns,
    ...Object.values(pressure.consequences),
  ]
    .filter(Boolean)
    .join(' ');
}

function allPlayerFacingDesignLabText(): string {
  return [
    telefonAversjon.conditionLabel,
    telefonAversjon.objectLabel,
    telefonAversjon.label,
    telefonAversjon.description,
    ...telefonAversjon.visibleSigns,
    ...Object.values(telefonAversjon.consequences),
    ...phonePressureObjects.map(playerFacingPressureText),
    ...phoneApproaches.flatMap((approach) => [approach.label, approach.description]),
    ...phoneSupportModes.flatMap((support) => [support.label, support.good, support.risk]),
    ...phoneActivityClocks.flatMap((clock) => [clock.label, clock.description]),
  ]
    .filter(Boolean)
    .join(' ');
}

function expectPairInMarkup(markup: string, objectLabel: string, conditionLabel: string): void {
  const objectIndex = markup.indexOf(objectLabel);
  expect(objectIndex, `missing object label: ${objectLabel}`).toBeGreaterThanOrEqual(0);
  const conditionIndex = markup.indexOf(conditionLabel, objectIndex);
  expect(conditionIndex, `missing condition label after ${objectLabel}`).toBeGreaterThanOrEqual(0);
  expect(
    conditionIndex - objectIndex,
    `${conditionLabel} is visually detached from ${objectLabel}`,
  ).toBeLessThan(700);
}

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

  it('keeps at least five pressure objects anchored, visible, and mechanically consequential', () => {
    const complete = phonePressureObjects.filter(
      (pressure) =>
        pressure.conditionLabel.trim() &&
        pressure.objectLabel.trim() &&
        pressure.visibleSigns.length > 0 &&
        pressure.visibleSigns.every((sign) => sign.trim()) &&
        pressure.consequences.threatens.trim() &&
        Object.values(pressure.consequences).some((value) => value && value.trim()),
    );

    expect(complete.length).toBeGreaterThanOrEqual(5);
  });

  it('guards against player-facing clinical pressure labels', () => {
    for (const pressure of phonePressureObjects) {
      expect(playerFacingPressureText(pressure)).not.toMatch(bannedClinicalLabel);
    }

    expect(allPlayerFacingDesignLabText()).not.toMatch(bannedClinicalLabel);
    expect('Anxiety').toMatch(bannedClinicalLabel);
    expect('executive dysfunction').toMatch(bannedClinicalLabel);
  });

  it('allows abstract labels only when they are paired with concrete anchors', () => {
    for (const pressure of phonePressureObjects) {
      expect(pressure.conditionLabel).toBeTruthy();
      expect(pressure.objectLabel).toBeTruthy();
      if (allowedAbstractLabels.has(pressure.conditionLabel)) {
        expect(pressure.visibleSigns.join(' ')).not.toBe('');
        expect(pressure.objectLabel).not.toEqual(pressure.conditionLabel);
      }
    }
  });

  it('renders every pressure anchor beside its condition label instead of unanchored mood tags', () => {
    const markup = renderToStaticMarkup(createElement(PhonePracticeLab));

    expectPairInMarkup(markup, telefonAversjon.objectLabel, telefonAversjon.conditionLabel);
    for (const pressure of phonePressureObjects) {
      expectPairInMarkup(markup, pressure.objectLabel, pressure.conditionLabel);
    }
  });

  it('has Frank cite concrete evidence before cautious pressure interpretation', () => {
    const result = resolvePhoneAttempt(base);
    const carriedPressure = phonePressureObjects.find(
      (pressure) => pressure.id === result.supportAnalysis.carriedWeaknesses[0],
    );

    expect(result.frankReport).toContain('Observert:');
    expect(result.frankReport).toContain('Mulig press i rommet:');
    expect(result.frankReport.indexOf('Observert:')).toBeLessThan(
      result.frankReport.indexOf('Mulig press i rommet:'),
    );
    expect(result.frankReport).toMatch(/—/);
    expect(result.frankReport).not.toMatch(bannedClinicalLabel);
    expect(carriedPressure).toBeDefined();
    expect(result.frankReport).toContain(carriedPressure?.objectLabel);
    expect(result.frankReport).toContain(carriedPressure?.conditionLabel);
  });
});
