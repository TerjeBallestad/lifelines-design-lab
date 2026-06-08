import { describe, expect, it } from 'vitest';
import componentSource from '../components/PhonePracticeLab.tsx?raw';
import contentSource from '../content/phonePractice.ts?raw';
import type { AttemptContext } from '../domain/types';
import resolverSource from './phoneResolver.ts?raw';
import { actionProbabilities } from '../content/actionCards';
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
    expect(visibleText).not.toContain('saksvedlegg');
    expect(visibleText).not.toContain('uanstendige tilgjengelighet');
    expect(visibleText).not.toContain('vitnebenk');
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

  it('keeps Apartment and Case Desk as linked lab surfaces after the Grete call scene', () => {
    const store = new RootStore();
    expect(store.labMode).toBe('desk');
    expect(store.firstContactReportVisible).toBe(false);
    store.callGreteFromConcernReport();
    expect(store.labMode).toBe('frank_call');
    expect(store.selectedApproachId).toBe('grete_primes_first');
    store.completeGreteCall();
    expect(store.labMode).toBe('desk');
    expect(store.firstContactReportVisible).toBe(true);
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
    expect(visibleText).toContain('bekymringsmelding');
    expect(visibleText).toContain('etabler kontakt med grete');
    expect(visibleText).toContain('ring grete');
    expect(visibleText).toContain('frankrapport');
    expect(visibleText).toContain('første kontakt');
    expect(visibleText).toContain('kontoutskrift');
    expect(visibleText).toContain('sosialt besøk');
    expect(visibleText).toContain('obskurert');
    expect(visibleText).toContain('handlinger');
    expect(visibleText).toContain('ny evne trenger ny grense');
    expect(visibleText).not.toContain('rapporten gir ikke svar');
    expect(visibleText).not.toContain('ikke løs elling');
    expect(visibleText).not.toContain('hva spilleren lærer');
    expect(visibleText).toContain('apartment');
  });

  it('schedules the Slice B financial request and resolves the document on the next day', () => {
    const store = new RootStore();
    store.callGreteFromConcernReport();
    store.completeGreteCall();

    expect(store.day).toBe(1);
    expect(store.dayActions).toBe(2);
    store.requestFinancialStatement();

    expect(store.dayActions).toBe(1);
    expect(store.financialStatementRequested).toBe(true);
    expect(store.financialStatementVisible).toBe(false);
    expect(store.caseLog.at(-1)).toContain('kontoutskrift');

    store.rollNewDay();

    expect(store.day).toBe(2);
    expect(store.dayActions).toBe(2);
    expect(store.financialStatementRequested).toBe(false);
    expect(store.financialStatementVisible).toBe(true);
    expect(store.caseLog.at(-1)).toContain('ligger på pulten');
  });

  it('schedules the Slice C social visit and returns a visit report', () => {
    const store = new RootStore();
    store.callGreteFromConcernReport();
    store.completeGreteCall();
    store.scheduleSocialVisit();

    expect(store.dayActions).toBe(1);
    expect(store.socialVisitScheduled).toBe(true);
    expect(store.socialVisitReportVisible).toBe(false);

    store.performSocialVisit();
    expect(store.labMode).toBe('social_visit');

    store.completeSocialVisit();
    expect(store.labMode).toBe('desk');
    expect(store.socialVisitReportVisible).toBe(true);
    expect(store.caseLog.at(-1)).toContain('sosialt besøk');
  });

  it('turns room-notice Frank chat into evidence and a practical desk decision', () => {
    const store = new RootStore();
    store.callGreteFromConcernReport();
    store.completeGreteCall();
    store.scheduleSocialVisit();

    expect(store.deskDecisionVisible).toBe(false);
    store.askFrank('ask_post_under_paper');
    expect(store.askedFrankQuestionIds).not.toContain('ask_post_under_paper');

    store.performSocialVisit();
    store.noticeApartmentDetail('post_pressure');
    expect(store.noticedApartmentEvidenceIds).toContain('post_pressure');
    expect(store.caseLog.at(-1)).toContain('legger merke til');

    store.completeSocialVisit();
    store.askFrank('ask_post_under_paper');
    expect(store.askedFrankQuestionIds).toContain('ask_post_under_paper');
    expect(store.apartmentEvidenceIds).toContain('post_pressure');
    expect(store.caseLog.at(-1)).toContain('Frank tolker');
    expect(store.deskDecisionVisible).toBe(true);

    store.choosePracticalReliefDecision();
    expect(store.caseLog.at(-1)).toContain('praktisk avlastningsgrep');
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

  it('shows Citizen Sleeper-style action card odds from adjusted dice', () => {
    expect(actionProbabilities(6)).toEqual({ positive: 1, neutral: 0, negative: 0 });
    expect(actionProbabilities(4)).toEqual({ positive: 0.5, neutral: 0.5, negative: 0 });
    expect(actionProbabilities(3)).toEqual({ positive: 0.25, neutral: 0.5, negative: 0.25 });
    expect(actionProbabilities(1)).toEqual({ positive: 0, neutral: 0.5, negative: 0.5 });
  });

  it('spends a die on an action card and records the result on the card layer', () => {
    const store = new RootStore();
    const dieId = store.selectedDieId;

    store.playActionCard('post_folder_review');

    expect(store.dicePool.find((die) => die.id === dieId)?.used).toBe(true);
    expect(store.actionResults).toHaveLength(1);
    expect(store.latestActionResult?.cardId).toBe('post_folder_review');
    expect(store.caseLog.at(-1)).toContain('Gjennomgå postmappe');
  });

  it('routes the phone action card through the room resolver instead of direct stat buying', () => {
    const store = new RootStore();
    store.selectActionCard('phone_first_step');
    store.playSelectedActionCard();

    expect(store.actionResults).toHaveLength(1);
    expect(store.attempts).toHaveLength(1);
    expect(store.latestActionResult?.cardId).toBe('phone_first_step');
    expect(store.latestAttempt).toBeDefined();
  });
});
