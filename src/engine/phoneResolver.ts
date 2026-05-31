import { getApproach, phoneSupportModes } from '../content/phonePractice';
import type {
  AttemptContext,
  AttemptResult,
  EllingPosition,
  EvidenceFact,
  FrankPosition,
  OutcomeClass,
  OutcomeId,
  PressureId,
  RoomState,
  ScriptState,
  SupportAnalysis,
  VignetteBeat,
} from '../domain/types';
import { hashSeed, seededRandom } from './random';

const outcomes: OutcomeId[] = [
  'retreat',
  'anger_retreat',
  'pomp_defense',
  'annoyed_compliance',
  'partial_practice',
  'completed_practice',
];

const allPhonePressures: PressureId[] = [
  'restlessness',
  'shame',
  'sleep_debt',
  'unpaid_bill',
  'hope',
  'phone_fear',
  'dignity_exposure',
];

function analyzeSupports(context: AttemptContext): SupportAnalysis {
  const selected = context.supportIds
    .map((id) => phoneSupportModes.find((support) => support.id === id))
    .filter((support): support is NonNullable<typeof support> => Boolean(support));
  const covered = new Set<PressureId>();
  const weak = new Set<PressureId>();
  const reasons: string[] = [];

  for (const support of selected) {
    support.covers.forEach((pressure) => covered.add(pressure));
    support.weak.forEach((pressure) => weak.add(pressure));
    reasons.push(`${support.label}: ${support.good}`);
  }

  const carriedWeaknesses = allPhonePressures.filter(
    (pressure) => !covered.has(pressure) || weak.has(pressure),
  );
  const coverageScore = selected.length === 0 ? -2 : covered.size - carriedWeaknesses.length * 0.35;

  return {
    coveredPressures: Array.from(covered),
    carriedWeaknesses,
    coverageScore,
    reasons,
  };
}

function supportReadinessDelta(analysis: SupportAnalysis): number {
  let delta = Math.max(-0.08, Math.min(0.12, analysis.coverageScore * 0.018));
  if (analysis.coveredPressures.includes('phone_fear')) delta += 0.06;
  if (analysis.coveredPressures.includes('dignity_exposure')) delta += 0.04;
  if (analysis.carriedWeaknesses.includes('shame')) delta -= 0.04;
  if (analysis.carriedWeaknesses.includes('sleep_debt')) delta -= 0.02;
  return delta;
}

function pressureLabel(id: PressureId): string {
  return id.replaceAll('_', ' ');
}

const premiseBarks = [
  '“Jeg har aldri forstått denne nasjonale trangen til å ringe folk.”',
  '“Hvis Grete trenger meg, vet hun hvor jeg bor.”',
  '“Telefonen er historisk sett et avbruddsapparat.”',
];

const complianceBarks = [
  '“Ja vel. Jeg berører apparatet. Sivilisasjonen går framover.”',
  '“Er dette for min skyld, eller for arkivskapet?”',
  '“Der. Telefonen og jeg har anerkjent hverandre.”',
];

const pompBarks = [
  '“Et menneske er ikke forpliktet til å invitere stemmer inn i stuen.”',
  '“Man må være forsiktig. Først telefonen, så komiteer.”',
  '“Jeg kan utmerket godt ringe. Jeg velger bare å ikke forurense ettermiddagen.”',
];

const angerBarks = [
  '“Dere kommer alltid med en liten oppgave og en stor konklusjon.”',
  '“Jeg trenger ikke undervisning i telefoni.”',
  '“Du har forvekslet stillhet med inkompetanse.”',
];

const successBarks = [
  '“Dette er teater. Vi framfører kompetanse for et usynlig departement.”',
  '“Greit. Jeg ringer én gang, for statistikkens skyld.”',
  '“Det usynlige departementet kan applaudere stille.”',
];

function clamp(value: number, min = 0, max = 1): number {
  return Math.max(min, Math.min(max, value));
}

function pick<T>(items: T[], roll: number): T {
  return items[Math.min(items.length - 1, Math.floor(roll * items.length))];
}

export function computeReadiness(context: AttemptContext): number {
  const approach = getApproach(context.approachId);
  const supportAnalysis = analyzeSupports(context);
  const dieBias = (context.dieFace - 1) / 5;
  let readiness = 0.12 + dieBias * 0.34;
  readiness += context.client.overskudd * 0.22;
  readiness += context.client.trust * 0.16;
  readiness += context.client.phoneMastery * 0.18;
  readiness += approach.controlDelta;
  readiness -= approach.pressureDelta * 0.45;
  readiness += supportReadinessDelta(supportAnalysis);

  if (context.client.ellingState === 'calm') readiness += 0.08;
  if (context.client.ellingState === 'tired') readiness -= 0.07;
  if (context.client.ellingState === 'prickly') readiness -= 0.13;

  if (context.frankStance === 'soft') readiness += 0.04;
  if (context.frankStance === 'pushy') readiness -= 0.08;
  if (context.frankPosition === 'near_phone') readiness -= 0.16;
  if (context.frankPosition === 'seated_away') readiness += 0.03;
  if (context.frankPosition === 'absent_setup') readiness += 0.1;
  if (context.scriptState === 'placed') readiness += 0.12;
  if (context.approachId === 'written_script') readiness += 0.08;
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

  const supportAnalysis = analyzeSupports(context);
  if (supportAnalysis.coveredPressures.includes('phone_fear')) {
    weights.retreat *= 0.84;
    weights.partial_practice += 0.08;
  }
  if (supportAnalysis.coveredPressures.includes('dignity_exposure')) {
    weights.anger_retreat *= 0.78;
    weights.pomp_defense += 0.04;
  }
  if (supportAnalysis.carriedWeaknesses.includes('shame')) {
    weights.anger_retreat += 0.08;
  }

  if (context.scriptState === 'placed' || context.approachId === 'written_script') {
    weights.partial_practice += 0.16;
    weights.completed_practice += 0.08;
    weights.retreat *= 0.82;
  }
  if (context.approachId === 'tolerate_ringtone') {
    weights.retreat *= 0.75;
    weights.annoyed_compliance += 0.15;
    weights.partial_practice += 0.1;
  }
  if (context.frankPosition === 'near_phone') {
    weights.anger_retreat += 0.2;
    weights.pomp_defense += 0.12;
    weights.completed_practice *= 0.72;
  }
  if (context.frankPosition === 'absent_setup') {
    weights.anger_retreat *= 0.55;
    weights.completed_practice += 0.08;
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

function scriptAfter(outcome: OutcomeId, context: AttemptContext): ScriptState {
  if (context.scriptState === 'missing' && context.approachId !== 'written_script')
    return 'missing';
  if (outcome === 'partial_practice' || outcome === 'completed_practice') return 'used';
  if (outcome === 'retreat' || outcome === 'anger_retreat') return 'ignored';
  return 'placed';
}

function frictionFor(outcome: OutcomeId, context: AttemptContext): string {
  if (outcome === 'completed_practice') return 'dignity preserved through ridicule';
  if (outcome === 'partial_practice') return 'first step possible, conversation still too large';
  if (outcome === 'anger_retreat') return 'competence-test anger';
  if (outcome === 'retreat') {
    return context.client.overskudd < 0.35 ? 'low overskudd / refusal spiral' : 'room withdrawal';
  }
  if (context.frankPosition === 'near_phone') return 'Frank proximity turned practice into an exam';
  return 'pointlessness defense';
}

function beat(input: {
  id: string;
  actor: VignetteBeat['actor'];
  label: string;
  text: string;
  anchor: VignetteBeat['anchor'];
  ellingPosition: EllingPosition;
  frankPosition: FrankPosition;
  scriptState: ScriptState;
  doorClosed?: boolean;
  friction: string;
  bark?: string;
  evidence?: EvidenceFact[];
}): VignetteBeat {
  return {
    doorClosed: false,
    ...input,
  };
}

function beatsFor(
  outcome: OutcomeId,
  context: AttemptContext,
  delayedSeconds: number,
  random: () => number,
): VignetteBeat[] {
  const delay = fact('delayed_seconds', 'Delayed before action', delayedSeconds);
  const friction = frictionFor(outcome, context);
  const hasScript = context.scriptState === 'placed' || context.approachId === 'written_script';
  const intro: VignetteBeat[] = [
    beat({
      id: 'frank_setup',
      actor: 'Frank',
      label: 'Frank sets the room',
      text:
        context.frankPosition === 'absent_setup'
          ? 'Frank legger rammen og lar rommet være Elling sitt.'
          : context.frankPosition === 'near_phone'
            ? 'Frank blir stående for nær telefonen. Det lille forsøket får publikum.'
            : 'Frank setter seg vekk fra telefonen og gjør forsøket mindre offentlig.',
      anchor: 'sofa',
      ellingPosition: 'chair',
      frankPosition: context.frankPosition,
      scriptState: hasScript ? 'placed' : 'missing',
      friction,
      evidence: [fact('frank_position', 'Frank position', context.frankPosition)],
    }),
    beat({
      id: 'premise_defense',
      actor: 'Elling',
      label: 'Premise defense',
      text: 'Elling angriper oppgaven før han angriper telefonen.',
      anchor: 'chair',
      ellingPosition: 'chair',
      frankPosition: context.frankPosition,
      scriptState: hasScript ? 'placed' : 'missing',
      friction,
      bark: pick(premiseBarks, random()),
      evidence: [fact('looked_at_phone', 'Looked at phone', true)],
    }),
  ];

  const finalScript = scriptAfter(outcome, context);

  switch (outcome) {
    case 'retreat':
      return [
        ...intro,
        beat({
          id: 'delay',
          actor: 'Room',
          label: 'Delay',
          text: `${delayedSeconds} seconds pass. The room gets very practical.`,
          anchor: 'phone',
          ellingPosition: 'pace',
          frankPosition: context.frankPosition,
          scriptState: hasScript ? 'placed' : 'missing',
          friction,
          evidence: [delay],
        }),
        beat({
          id: 'bedroom_retreat',
          actor: 'Elling',
          label: 'Bedroom retreat',
          text: 'Han forlater forsøket før telefonen blir rørt. Soveromsdøren blir plutselig et argument.',
          anchor: 'bedroom',
          ellingPosition: 'bedroom',
          frankPosition: context.frankPosition,
          scriptState: finalScript,
          doorClosed: true,
          friction,
          bark: '“Jeg fortsetter denne teknologiske renessansen privat.”',
          evidence: [fact('retreated_to_bedroom', 'Retreated to bedroom', true)],
        }),
      ];
    case 'anger_retreat':
      return [
        ...intro,
        beat({
          id: 'half_approach',
          actor: 'Elling',
          label: 'Half approach',
          text: 'Han går halvveis mot telefonen, men kroppen peker allerede vekk.',
          anchor: 'phone',
          ellingPosition: 'phone',
          frankPosition: context.frankPosition,
          scriptState: hasScript ? 'placed' : 'missing',
          friction,
          evidence: [fact('approached_phone', 'Approached phone', true), delay],
        }),
        beat({
          id: 'anger_at_frank',
          actor: 'Elling',
          label: 'Anger at Frank',
          text: 'Motstanden flytter seg fra apparatet til mannen som ser på.',
          anchor: 'sofa',
          ellingPosition: 'pace',
          frankPosition: context.frankPosition,
          scriptState: finalScript,
          friction,
          bark: pick(angerBarks, random()),
          evidence: [fact('anger_at_frank', 'Anger directed at Frank', true)],
        }),
      ];
    case 'pomp_defense':
      return [
        ...intro,
        beat({
          id: 'approach',
          actor: 'Elling',
          label: 'Approach',
          text: 'Elling stiller seg nær telefonen, men gjør hendene opptatt med ingenting.',
          anchor: 'phone',
          ellingPosition: 'phone',
          frankPosition: context.frankPosition,
          scriptState: hasScript ? 'placed' : 'missing',
          friction,
          evidence: [fact('approached_phone', 'Approached phone', true), delay],
        }),
        beat({
          id: 'pomp_defense',
          actor: 'Elling',
          label: 'Pomp defense',
          text: 'Telefonøving blir et prinsipielt innlegg i stuen.',
          anchor: 'phone',
          ellingPosition: 'pace',
          frankPosition: context.frankPosition,
          scriptState: finalScript,
          friction,
          bark: pick(pompBarks, random()),
          evidence: [fact('framed_as_pointless', 'Framed task as pointless/unreasonable', true)],
        }),
      ];
    case 'annoyed_compliance':
      return [
        ...intro,
        beat({
          id: 'annoyed_touch',
          actor: 'Elling',
          label: 'Annoyed compliance',
          text: 'Han berører telefonen og sørger for at handlingen ikke kan forveksles med entusiasme.',
          anchor: 'phone',
          ellingPosition: 'phone',
          frankPosition: context.frankPosition,
          scriptState: finalScript,
          friction,
          bark: pick(complianceBarks, random()),
          evidence: [fact('approached_phone', 'Approached phone', true), delay],
        }),
      ];
    case 'partial_practice':
      return [
        ...intro,
        beat({
          id: 'partial_practice',
          actor: 'Elling',
          label: 'Partial practice',
          text: hasScript
            ? 'Han holder manusarket som om det er en kvittering han kan klage på, men blir ved telefonen.'
            : 'Han går bort og blir stående mens telefonen ringer.',
          anchor: 'phone',
          ellingPosition: 'phone',
          frankPosition: context.frankPosition,
          scriptState: finalScript,
          friction,
          bark: '“Jeg kan stå her mens den ringer. Ikke mer.”',
          evidence: [
            fact('approached_phone', 'Approached phone', true),
            delay,
            fact('partial_practice', 'Completed partial practice', true),
          ],
        }),
      ];
    case 'completed_practice':
      return [
        ...intro,
        beat({
          id: 'completed_window',
          actor: 'Elling',
          label: 'Completed window',
          text: 'Elling ringer én gang, nesten ved et uhell, og legger på før samtalen blir en samtale.',
          anchor: 'phone',
          ellingPosition: 'phone',
          frankPosition: context.frankPosition,
          scriptState: finalScript,
          friction,
          bark: pick(successBarks, random()),
          evidence: [
            fact('approached_phone', 'Approached phone', true),
            delay,
            fact('completed_call_window', 'Completed call window', true),
          ],
        }),
      ];
  }
}

function collectEvidence(
  beats: VignetteBeat[],
  context: AttemptContext,
  outcome: OutcomeId,
  supportAnalysis: SupportAnalysis,
): EvidenceFact[] {
  const evidence = beats.flatMap((beatItem) => beatItem.evidence ?? []);
  const finalBeat = beats.at(-1)!;
  evidence.push(fact('approach', 'Approach used', context.approachId));
  evidence.push(fact('die_face', 'Die face assigned', context.dieFace));
  evidence.push(fact('script_state', 'Script state', finalBeat.scriptState));
  evidence.push(fact('last_friction', 'Last friction', finalBeat.friction));
  evidence.push(fact('outcome', 'Outcome', outcome));
  evidence.push(
    fact(
      'support_coverage',
      'Support coverage',
      supportAnalysis.coveredPressures.map(pressureLabel).join(', '),
    ),
  );
  evidence.push(
    fact(
      'carried_weakness',
      'Carried weakness',
      supportAnalysis.carriedWeaknesses.slice(0, 3).map(pressureLabel).join(', '),
    ),
  );
  return evidence;
}

function reportFor(
  outcome: OutcomeId,
  context: AttemptContext,
  evidence: EvidenceFact[],
  supportAnalysis: SupportAnalysis,
): string {
  const delayed = evidence.find((item) => item.id === 'delayed_seconds')?.value ?? 'unknown';
  const approach = getApproach(context.approachId).label.toLowerCase();
  const position = context.frankPosition.replaceAll('_', ' ');
  const carried =
    supportAnalysis.carriedWeaknesses.slice(0, 2).map(pressureLabel).join(' / ') || 'none';
  if (outcome === 'completed_practice') {
    return `Frank: Telefonøving med ${approach} landet fordi Elling kunne latterliggjøre øvelsen mens han gjorde første steg. Frank var ${position}; verdigheten holdt. Dagens plan bar fortsatt ${carried}.`;
  }
  if (outcome === 'partial_practice') {
    return `Frank: Delvis øving er faktisk data. Elling ble ved telefonen etter ${delayed} sekunder. Neste forsøk bør bygge på samme ramme, ikke øke presset. Svakheten som ble med inn: ${carried}.`;
  }
  if (outcome === 'anger_retreat') {
    return `Frank: Forsøket ble et kompetansevitne. Motstanden peker ikke bare mot telefonfrykt, men mot å bli observert mens han øver. Støtten dekket noe, men bar ${carried}.`;
  }
  if (outcome === 'retreat') {
    return `Frank: Rommet trakk seg sammen og soverommet vant. Neste forsøk bør endre avstand, script eller første steg før ferdigheten testes. Dagens komposisjon bar ${carried}.`;
  }
  return `Frank: Forsøket ga motstand uten full kollaps. Elling gjorde øvelsen til en diskusjon om rimelighet; leiligheten viste friksjonen før rapporten måtte forklare den. Blindsonen i planen: ${carried}.`;
}

function nextApproaches(
  outcome: OutcomeId,
  context: AttemptContext,
): AttemptResult['nextApproachIds'] {
  const suggestions: AttemptResult['nextApproachIds'] = [];
  if (outcome === 'retreat') suggestions.push('tolerate_ringtone', 'written_script');
  if (outcome === 'anger_retreat') suggestions.push('grete_primes_first', 'pre_agreed_window');
  if (outcome === 'pomp_defense') suggestions.push('pre_agreed_window', 'written_script');
  if (outcome === 'annoyed_compliance') suggestions.push('written_script', 'tolerate_ringtone');
  if (outcome === 'partial_practice') suggestions.push(context.approachId, 'written_script');
  if (outcome === 'completed_practice') suggestions.push('pre_agreed_window', 'none');
  return Array.from(new Set(suggestions.filter((id) => id !== 'frank_pushes')));
}

function finalRoomFrom(beats: VignetteBeat[]): RoomState {
  const finalBeat = beats.at(-1)!;
  return {
    ellingPosition: finalBeat.ellingPosition,
    frankPosition: finalBeat.frankPosition,
    scriptState: finalBeat.scriptState,
    doorClosed: finalBeat.doorClosed,
    lastFriction: finalBeat.friction,
    bark: finalBeat.bark,
  };
}

export function resolvePhoneAttempt(context: AttemptContext): AttemptResult {
  const seed = hashSeed(
    `${context.attemptIndex}|${context.approachId}|${context.dieFace}|${context.supportIds.join(',')}|${context.client.ellingState}|${context.client.overskudd}|${context.client.trust}|${context.client.phoneMastery}|${context.frankStance}|${context.frankPosition}|${context.scriptState}`,
  );
  const random = seededRandom(seed);
  const supportAnalysis = analyzeSupports(context);
  const readiness = computeReadiness(context);
  const outcome = weightedPick(weightsFor(readiness, context), random());
  const delayedSeconds = Math.round(120 - readiness * 80 + random() * 22);
  const beats = beatsFor(outcome, context, delayedSeconds, random);
  const evidence = collectEvidence(beats, context, outcome, supportAnalysis);
  return {
    seed,
    context,
    readiness,
    outcome,
    outcomeClass: outcomeClass(outcome),
    beats,
    evidence,
    frankReport: reportFor(outcome, context, evidence, supportAnalysis),
    supportAnalysis,
    nextApproachIds: nextApproaches(outcome, context),
    finalRoom: finalRoomFrom(beats),
  };
}
