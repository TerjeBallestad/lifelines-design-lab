import type {
  ActivityClock,
  Approach,
  PressureObject,
  StateObject,
  SupportMode,
} from '../domain/types';

export const telefonAversjon: StateObject = {
  id: 'telefon_aversjon',
  label: 'Telefonen står for åpen sosial risiko',
  anchor: 'phone',
  description: 'Telefonen er et apparat på bordet. Den ber om svar før Elling rekker å samle seg.',
  pressure: 0.72,
};

export const phoneApproaches: Approach[] = [
  {
    id: 'none',
    label: 'Bare prøv',
    description: 'Frank ber Elling øve uten ekstra ramme.',
    trustDelta: -0.04,
    controlDelta: -0.08,
    pressureDelta: 0.12,
  },
  {
    id: 'written_script',
    label: 'Skriftlig manus',
    description: 'Elling får nøyaktig første setning og en utgangsreplikk.',
    trustDelta: 0.03,
    controlDelta: 0.18,
    pressureDelta: -0.08,
  },
  {
    id: 'pre_agreed_window',
    label: 'Avtalt tidsvindu',
    description: 'Telefonøving skjer i et lite, varslet vindu.',
    trustDelta: 0.02,
    controlDelta: 0.14,
    pressureDelta: -0.05,
  },
  {
    id: 'tolerate_ringtone',
    label: 'Bare tåle ringelyden',
    description: 'Målet er ikke å svare. Bare bli i rommet mens telefonen ringer.',
    trustDelta: 0.04,
    controlDelta: 0.22,
    pressureDelta: -0.16,
  },
  {
    id: 'grete_primes_first',
    label: 'Grete forbereder først',
    description: 'Grete gjør rammen sosialt tryggere før Frank ber om øving.',
    trustDelta: 0.05,
    controlDelta: 0.1,
    pressureDelta: -0.12,
  },
  {
    id: 'frank_pushes',
    label: 'Frank presser tydelig',
    description: 'Frank gjør framdrift viktigere enn Ellings opplevelse av kontroll.',
    trustDelta: -0.09,
    controlDelta: -0.18,
    pressureDelta: 0.2,
  },
];

export function getApproach(id: string): Approach {
  const approach = phoneApproaches.find((item) => item.id === id);
  if (!approach) throw new Error(`Unknown approach: ${id}`);
  return approach;
}

export const phonePressureObjects: PressureObject[] = [
  {
    id: 'restlessness',
    label: 'Rastløshet',
    anchor: 'chair',
    escalatesInto: 'uro, brudd, nattlig rydding',
    softenedBy: 'kort tur, lavterskelkontakt, en aktivitet som ikke ber om forklaring',
    designPurpose: 'Turns stagnation into visible pressure.',
    clock: 0.45,
  },
  {
    id: 'shame',
    label: 'Skam',
    anchor: 'sofa',
    escalatesInto: 'unngåelse, mistillit, tapt avtale',
    softenedBy: 'verdighet, liten seier, oppfølging uten dom',
    designPurpose: 'Makes failure socially meaningful, not just numeric.',
    clock: 0.58,
  },
  {
    id: 'sleep_debt',
    label: 'Søvngjeld',
    anchor: 'bedroom',
    escalatesInto: 'lavt overskudd, irritabilitet, avlyst formiddag',
    softenedBy: 'rutine, mindre krav, kveld som ikke rakner',
    designPurpose: 'Creates practical constraint before moral judgment.',
    clock: 0.35,
  },
  {
    id: 'unpaid_bill',
    label: 'Uåpnet regning',
    anchor: 'desk',
    escalatesInto: 'stresspigg, bortforklaring, krise',
    softenedBy: 'telefon til NAV, budsjettstøtte, Frank som holder linjen åpen',
    designPurpose: 'Makes bureaucracy concrete and timed.',
    clock: 0.72,
  },
  {
    id: 'hope',
    label: 'Håp',
    anchor: 'phone',
    escalatesInto: 'resignasjon hvis den blir stående alene',
    softenedBy: 'liten suksess, tilhørighet, synlig fremgang',
    designPurpose: 'Lets positive states be fragile too.',
    clock: 0.28,
  },
];

export const phoneSupportModes: SupportMode[] = [
  {
    id: 'routine',
    label: 'Rutine',
    good: 'varslede tider, samme stol, samme første steg',
    risk: 'regningen kan bli liggende og håpet kan bli tynt',
    covers: ['sleep_debt', 'phone_fear', 'restlessness'],
    weak: ['unpaid_bill', 'hope', 'dignity_exposure'],
  },
  {
    id: 'gentle_contact',
    label: 'Lav kontakt',
    good: 'Frank holder avstand og lar rommet svare først',
    risk: 'regningen kan bli liggende mens alle venter pent',
    covers: ['shame', 'dignity_exposure', 'hope'],
    weak: ['unpaid_bill', 'restlessness', 'phone_fear'],
  },
  {
    id: 'practical_help',
    label: 'Praktisk hjelp',
    good: 'manus, nummer, NAV-linje, en fysisk ting å holde i',
    risk: 'kan kjennes som inspeksjon ved kjøkkenbordet',
    covers: ['unpaid_bill', 'phone_fear', 'sleep_debt'],
    weak: ['shame', 'dignity_exposure', 'hope'],
  },
  {
    id: 'challenge',
    label: 'Lite press',
    good: 'en ekte øving, ikke enda en samtale om øving',
    risk: 'kan bli for mye når morgenen allerede er tung',
    covers: ['restlessness', 'hope', 'phone_fear'],
    weak: ['sleep_debt', 'shame', 'dignity_exposure'],
  },
  {
    id: 'boundary',
    label: 'Grense',
    good: 'beskytter rommet mot Grete, NAV og velmenende stormvær',
    risk: 'kan la stolen, døren og stillheten vinne for lett',
    covers: ['dignity_exposure', 'shame', 'sleep_debt'],
    weak: ['restlessness', 'unpaid_bill', 'hope'],
  },
  {
    id: 'disclosure',
    label: 'Navngi det',
    good: 'sier den vanskelige tingen uten å lage teater av den',
    risk: 'kan lukke døren hvis ordene kommer før rommet tåler dem',
    covers: ['shame', 'hope', 'dignity_exposure'],
    weak: ['phone_fear', 'unpaid_bill', 'sleep_debt'],
  },
  {
    id: 'humor_play',
    label: 'Sideveis humor',
    good: 'lar Elling beholde verdighet ved å latterliggjøre øvelsen',
    risk: 'kan bli for lett når brevet på bordet har frist',
    covers: ['phone_fear', 'shame', 'restlessness'],
    weak: ['unpaid_bill', 'sleep_debt', 'dignity_exposure'],
  },
];

export const phoneActivityClocks: ActivityClock[] = [
  {
    id: 'ringtone',
    label: 'Tåle ringelyden',
    description: 'Bli i stuen mens telefonen får lov til å være telefon.',
    segments: 6,
    filled: 2,
    diceSlots: ['safe', 'risky', 'empty'],
  },
  {
    id: 'scripted_sentence',
    label: 'Første setning',
    description: 'Si én innøvd åpning før samtalen mister kantene.',
    segments: 8,
    filled: 2,
    diceSlots: ['safe', 'empty', 'locked'],
  },
  {
    id: 'grete_call',
    label: 'Ringe Grete',
    description: 'En kjent stemme, men ikke nødvendigvis en liten stemme.',
    segments: 8,
    filled: 1,
    diceSlots: ['risky', 'empty', 'locked'],
  },
];
