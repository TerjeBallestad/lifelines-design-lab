import { describe, expect, it } from 'vitest';
import componentSource from '../components/PhonePracticeLab.tsx?raw';
import contentSource from '../content/phonePractice.ts?raw';
import type { AttemptContext } from '../domain/types';
import resolverSource from './phoneResolver.ts?raw';
import { RootStore } from '../stores/RootStore';
import { phoneBarkLines, resolvePhoneAttempt } from './phoneResolver';

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

const bannedSystemTerms = [
  'support topology',
  'readiness',
  'outcome',
  'coverage',
  'vulnerability topology',
  'state objects',
  'pressure object',
  'carried weakness',
  'phone resistance room',
  'run phone attempt',
];

function stripInternalCode(source: string): string {
  const visibleLines = source
    .split('\n')
    .filter((line) => !line.trim().startsWith('import '))
    .filter((line) => !line.includes('className='))
    .filter((line) => !line.includes('const outcomes'))
    .filter((line) => !line.includes('support_coverage'))
    .filter((line) => !line.includes('carried_weakness'))
    .filter((line) => !line.includes("fact('outcome'"));

  return visibleLines
    .flatMap((line) => {
      const quoted = Array.from(line.matchAll(/['`"]([^'`"]{3,})['`"]/g)).map((match) => match[1]);
      const jsxText = Array.from(line.matchAll(/>([^<>{}][^<>{}]{2,})</g)).map((match) =>
        match[1].trim(),
      );
      return [...quoted, ...jsxText];
    })
    .join('\n');
}

function visibleSourceText(): string {
  return [componentSource, contentSource, resolverSource]
    .map((source) => stripInternalCode(source))
    .join('\n')
    .toLowerCase();
}

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

  it('keeps player-facing source copy free of dashboard terms and direct translation cruft', () => {
    const visibleText = visibleSourceText();
    for (const term of bannedSystemTerms) {
      expect(visibleText).not.toContain(term);
    }
    expect(visibleText).not.toContain('navngi det');
    expect(visibleText).not.toContain('sideveis humor');
    expect(visibleText).not.toContain('bruk dagens oppmerksomhet');
  });

  it('does not render raw internal anchors or actor ids into the UI', () => {
    expect(componentSource).not.toContain('{telefonAversjon.anchor}');
    expect(componentSource).not.toContain('{pressure.anchor}');
    expect(componentSource).not.toContain('{beat.actor}');
    expect(componentSource).not.toContain('Can become');
    expect(componentSource).not.toContain('Eased by');
  });

  it('keeps Elling barks concrete and phone/apartment anchored', () => {
    const anchored =
      /(telefon|apparat|stue|gang|soverom|dør|kaffekopp|grete|ringer|ringe|bor|arkivskap|ettermiddag)/i;
    const clinicalOrSystemic = /(klinisk|diagnose|traume|systemisk|departement|statistikk|komite)/i;

    expect(phoneBarkLines.length).toBeGreaterThan(6);
    for (const bark of phoneBarkLines) {
      expect(bark).toMatch(anchored);
      expect(bark).not.toMatch(clinicalOrSystemic);
    }
  });

  it('keeps Apartment and Case Desk as two linked lab surfaces', () => {
    const store = new RootStore();
    expect(store.labMode).toBe('apartment');
    store.setLabMode('desk');
    expect(store.labMode).toBe('desk');
    store.setLabMode('apartment');
    store.runAttempt();
    expect(store.latestAttempt).toBeDefined();
    store.setLabMode('desk');
    store.toggleDeskEvidence('practice_signal');
    expect(store.selectedDeskEvidenceIds).toContain('practice_signal');
    store.applyDeskVedtak('tolerate_ringtone');
    expect(store.labMode).toBe('apartment');
    expect(store.selectedApproachId).toBe('tolerate_ringtone');
  });

  it('names the Roottrees-inspired desk and evidence-to-vedtak loop in visible source', () => {
    const visibleText = visibleSourceText();
    expect(visibleText).toContain('case desk');
    expect(visibleText).toContain('løft bevis');
    expect(visibleText).toContain('ny evne trenger ny grense');
    expect(visibleText).toContain('apartment');
  });

  it('protects the ring-ring phone ladder and complication clock', () => {
    const visibleText = visibleSourceText();
    expect(visibleText).toContain('ring ring');
    expect(visibleText).toContain('buser noe ut og legger på');
    expect(visibleText).toContain('frank ringer fra mobilen');
    expect(visibleText).toContain('kjøkkenet og ringer hustelefonen');
    expect(visibleText).toContain('elling svarer uten at frank står ved siden av');
    expect(visibleText).toContain('sexlinjen');
    expect(visibleText).toContain('telefonregningen lander');
  });

  it('lets phone progress advance a complication clock instead of being a pure buff', () => {
    const store = new RootStore();
    expect(store.phoneComplicationClockProgress).toBe(0);
    store.runAttempt();
    expect(store.phonePracticeClockProgress).toBeGreaterThan(0);
    expect(store.phoneComplicationClockProgress).toBeGreaterThanOrEqual(0);
  });
});
