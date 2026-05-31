import { getApproach } from '../content/phonePractice';
import type { AttemptContext, AttemptResult, EvidenceFact, OutcomeClass, OutcomeId, VignetteBeat } from '../domain/types';
import { hashSeed, seededRandom } from './random';

const outcomes: OutcomeId[] = [
  'retreat',
  'anger_retreat',
  'pomp_defense',
  'annoyed_compliance',
  'partial_practice',
  'completed_practice',
];

function clamp(value: number, min = 0, max = 1): number {
  return Math.max(min, Math.min(max, value));
}

export function computeReadiness(context: AttemptContext): number {
  const approach = getApproach(context.approachId);
  const dieBias = (context.dieFace - 1) / 5;
  let readiness = 0.12 + dieBias * 0.34;
  readiness += context.client.overskudd * 0.22;
  readiness += context.client.trust * 0.16;
  readiness += context.client.phoneMastery * 0.18;
  readiness += approach.controlDelta;
  readiness -= approach.pressureDelta * 0.45;

  if (context.client.ellingState === 'calm') readiness += 0.08;
  if (context.client.ellingState === 'tired') readiness -= 0.07;
  if (context.client.ellingState === 'prickly') readiness -= 0.13;

  if (context.frankStance === 'soft') readiness += 0.06;
  if (context.frankStance === 'pushy') readiness -= 0.12;
  if (context.approachId === 'frank_pushes') readiness -= 0.08;

  return clamp(readiness, 0.03, 0.97);
}

function weightsFor(readiness: number, context: AttemptContext): Record<OutcomeId, number> {
  const resistance = 1 - readiness;
  const weights: Record<OutcomeId, number> = {
    retreat: 0.12 + resistance * 0.65,
    anger_retreat: 0.04 + resistance * 0.33,
    pomp_defense: 0.08 + resistance * 0.28,
    annoyed_compliance: 0.11 + (1 - Math.abs(readiness - 0.48)) * 0.3,
    partial_practice: 0.08 + readiness * 0.45,
    completed_practice: 0.02 + readiness * readiness * 0.58,
  };

  if (context.approachId === 'written_script') {
    weights.partial_practice += 0.16;
    weights.completed_practice += 0.08;
  }
  if (context.approachId === 'tolerate_ringtone') {
    weights.retreat *= 0.75;
    weights.annoyed_compliance += 0.15;
    weights.partial_practice += 0.1;
  }
  if (context.approachId === 'frank_pushes' || context.frankStance === 'pushy') {
    weights.anger_retreat += 0.18;
    weights.pomp_defense += 0.1;
    weights.completed_practice *= 0.76;
  }
  return weights;
}

function weightedPick(weights: Record<OutcomeId, number>, roll: number): OutcomeId {
  const total = outcomes.reduce((sum, key) => sum + weights[key], 0);
  let cursor = 0;
  for (const key of outcomes) {
    cursor += weights[key];
    if (roll * total <= cursor) return key;
  }
  return 'retreat';
}

function outcomeClass(outcome: OutcomeId): OutcomeClass {
  if (outcome === 'completed_practice' || outcome === 'partial_practice') return 'positive';
  if (outcome === 'annoyed_compliance' || outcome === 'pomp_defense') return 'neutral';
  return 'negative';
}

function fact(id: string, label: string, value: EvidenceFact['value']): EvidenceFact {
  return { id, label, value };
}

function beatsFor(outcome: OutcomeId, context: AttemptContext, delayedSeconds: number): VignetteBeat[] {
  const intro: VignetteBeat[] = [
    {
      id: 'frank_prompt',
      actor: 'Frank',
      label: 'Frank frames the attempt',
      text: 'Frank foreslår telefonøving som et lite forsøk, ikke en eksamen.',
      anchor: 'sofa',
    },
    {
      id: 'look_at_phone',
      actor: 'Elling',
      label: 'Elling notices the phone',
      text: 'Elling ser på telefonen litt for lenge før han svarer.',
      anchor: 'phone',
      evidence: [fact('looked_at_phone', 'Looked at phone', true)],
    },
  ];

  const delay = fact('delayed_seconds', 'Delayed before action', delayedSeconds);
  const approach = context.approachId;

  switch (outcome) {
    case 'retreat':
      return [
        ...intro,
        { id: 'delay', actor: 'Room', label: 'Delay', text: `${delayedSeconds} seconds pass. The room gets very practical.`, anchor: 'phone', evidence: [delay] },
        { id: 'bedroom_retreat', actor: 'Elling', label: 'Bedroom retreat', text: '“Jeg tar den etterpå. Det passer faktisk dårlig nå.” Elling trekker seg til soverommet.', anchor: 'bedroom', evidence: [fact('retreated_to_bedroom', 'Retreated to bedroom', true)] },
      ];
    case 'anger_retreat':
      return [
        ...intro,
        { id: 'approach', actor: 'Elling', label: 'Half approach', text: 'Han går halvveis mot telefonen, men kroppen peker allerede vekk.', anchor: 'phone', evidence: [fact('approached_phone', 'Approached phone', true), delay] },
        { id: 'anger_at_frank', actor: 'Elling', label: 'Anger at Frank', text: '“Du hører jo ikke etter. Jeg sa at telefonen er problemet.”', anchor: 'sofa', evidence: [fact('anger_at_frank', 'Anger directed at Frank', true)] },
        { id: 'bedroom_retreat', actor: 'Elling', label: 'Bedroom retreat', text: 'Han forlater forsøket før telefonen blir rørt.', anchor: 'bedroom', evidence: [fact('retreated_to_bedroom', 'Retreated to bedroom', true)] },
      ];
    case 'pomp_defense':
      return [
        ...intro,
        { id: 'approach', actor: 'Elling', label: 'Approach', text: 'Elling stiller seg nær telefonen, men gjør hendene opptatt med ingenting.', anchor: 'phone', evidence: [fact('approached_phone', 'Approached phone', true), delay] },
        { id: 'pomp_defense', actor: 'Elling', label: 'Pomp defense', text: '“Prinsipielt sett er det uhøflig å ringe folk uten forvarsel.”', anchor: 'phone', evidence: [fact('framed_as_pointless', 'Framed task as pointless/unreasonable', true)] },
      ];
    case 'annoyed_compliance':
      return [
        ...intro,
        { id: 'approach', actor: 'Elling', label: 'Approach', text: 'Han går bort til telefonen med synlig motvilje.', anchor: 'phone', evidence: [fact('approached_phone', 'Approached phone', true), delay] },
        { id: 'annoyed_compliance', actor: 'Elling', label: 'Annoyed compliance', text: '“Greit. Men dette er ikke en forestilling.”', anchor: 'phone', evidence: [fact('framed_as_pointless', 'Framed task as pointless/unreasonable', true)] },
      ];
    case 'partial_practice':
      return [
        ...intro,
        { id: 'approach', actor: 'Elling', label: 'Approach', text: approach === 'written_script' ? 'Han holder manusarket som om det er en kvittering han kan klage på.' : 'Han går bort og blir stående mens telefonen ringer.', anchor: 'phone', evidence: [fact('approached_phone', 'Approached phone', true), delay] },
        { id: 'partial_practice', actor: 'Elling', label: 'Partial practice', text: '“Jeg kan stå her mens den ringer. Ikke mer.”', anchor: 'phone', evidence: [fact('partial_practice', 'Completed partial practice', true)] },
      ];
    case 'completed_practice':
      return [
        ...intro,
        { id: 'approach', actor: 'Elling', label: 'Approach', text: 'Elling går helt bort til telefonen før han rekker å lage en ny regel.', anchor: 'phone', evidence: [fact('approached_phone', 'Approached phone', true), delay] },
        { id: 'completed_window', actor: 'Elling', label: 'Completed window', text: '“Ja. Hei. Det er Elling. Nei, det passet faktisk nå.”', anchor: 'phone', evidence: [fact('completed_call_window', 'Completed call window', true)] },
      ];
  }
}

function collectEvidence(beats: VignetteBeat[], context: AttemptContext, outcome: OutcomeId): EvidenceFact[] {
  const evidence = beats.flatMap((beat) => beat.evidence ?? []);
  evidence.push(fact('approach', 'Approach used', context.approachId));
  evidence.push(fact('die_face', 'Die face assigned', context.dieFace));
  evidence.push(fact('outcome', 'Outcome', outcome));
  return evidence;
}

function reportFor(outcome: OutcomeId, context: AttemptContext, evidence: EvidenceFact[]): string {
  const delayed = evidence.find((item) => item.id === 'delayed_seconds')?.value ?? 'unknown';
  const approach = getApproach(context.approachId).label.toLowerCase();
  if (outcome === 'completed_practice') return `Frank: Telefonøving med ${approach} ga gjennomføring etter ${delayed} sekunders utsettelse. Arbeidshypotesen styrkes: dette handler om kontroll og overgang, ikke teknisk telefonbruk.`;
  if (outcome === 'partial_practice') return `Frank: Delvis øving er faktisk data. Elling ble ved telefonen lenge nok til at neste tiltak bør bygge på samme ramme, ikke øke presset.`;
  if (outcome === 'anger_retreat') return `Frank: Forsøket ble Frank sitt prosjekt. Motstanden peker mot pressfølsomhet; neste forsøk bør redusere sosialt krav før ferdigheten testes.`;
  if (outcome === 'retreat') return `Frank: Elling trakk seg til soverommet uten å starte. Telefonen opptrer som åpen sosial risiko. Neste forsøk bør krympe første steg.`;
  return `Frank: Forsøket ga motstand uten full kollaps. Elling gjorde øvelsen til en diskusjon om rimelighet; neste steg bør gjøre formålet mer konkret.`;
}

function nextApproaches(outcome: OutcomeId, context: AttemptContext): AttemptResult['nextApproachIds'] {
  const suggestions: AttemptResult['nextApproachIds'] = [];
  if (outcome === 'retreat') suggestions.push('tolerate_ringtone', 'written_script');
  if (outcome === 'anger_retreat') suggestions.push('grete_primes_first', 'pre_agreed_window');
  if (outcome === 'pomp_defense') suggestions.push('pre_agreed_window', 'written_script');
  if (outcome === 'annoyed_compliance') suggestions.push('written_script', 'tolerate_ringtone');
  if (outcome === 'partial_practice') suggestions.push(context.approachId, 'written_script');
  if (outcome === 'completed_practice') suggestions.push('pre_agreed_window', 'none');
  return Array.from(new Set(suggestions.filter((id) => id !== 'frank_pushes')));
}

export function resolvePhoneAttempt(context: AttemptContext): AttemptResult {
  const seed = hashSeed(`${context.attemptIndex}|${context.approachId}|${context.dieFace}|${context.client.ellingState}|${context.client.overskudd}|${context.client.trust}|${context.client.phoneMastery}|${context.frankStance}`);
  const random = seededRandom(seed);
  const readiness = computeReadiness(context);
  const outcome = weightedPick(weightsFor(readiness, context), random());
  const delayedSeconds = Math.round(120 - readiness * 80 + random() * 22);
  const beats = beatsFor(outcome, context, delayedSeconds);
  const evidence = collectEvidence(beats, context, outcome);
  return {
    seed,
    context,
    readiness,
    outcome,
    outcomeClass: outcomeClass(outcome),
    beats,
    evidence,
    frankReport: reportFor(outcome, context, evidence),
    nextApproachIds: nextApproaches(outcome, context),
  };
}
