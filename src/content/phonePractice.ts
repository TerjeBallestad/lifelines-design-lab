import type {
  ActivityClock,
  Approach,
  PressureObject,
  StateObject,
  SupportMode,
} from '../domain/types';

export const telefonAversjon: StateObject = {
  id: 'telefon_aversjon',
  label: 'Telefonen slipper andre mennesker inn i stua',
  anchor: 'phone',
  description:
    'Et svart apparat på sidebordet. Det kan ringe når som helst, og da er det plutselig noen andres ettermiddag også.',
  pressure: 0.72,
};

export const phoneApproaches: Approach[] = [
  {
    id: 'none',
    label: 'Rett på apparatet',
    description: 'Frank lar telefonen stå der som telefon, uten manus eller høytidelig forklaring.',
    trustDelta: -0.04,
    controlDelta: -0.08,
    pressureDelta: 0.12,
  },
  {
    id: 'written_script',
    label: 'Første setning på papir',
    description: 'Et ark ved telefonen gir ham åpningsreplikken og en anstendig vei ut igjen.',
    trustDelta: 0.03,
    controlDelta: 0.18,
    pressureDelta: -0.08,
  },
  {
    id: 'pre_agreed_window',
    label: 'Varslet klokkeslett',
    description: 'Øvingen får et lite tidsrom, så den ikke ligger og ulmer hele dagen.',
    trustDelta: 0.02,
    controlDelta: 0.14,
    pressureDelta: -0.05,
  },
  {
    id: 'tolerate_ringtone',
    label: 'La den ringe ferdig',
    description: 'Målet er ikke å svare. Bare bli i stua mens apparatet bråker seg tomt.',
    trustDelta: 0.04,
    controlDelta: 0.22,
    pressureDelta: -0.16,
  },
  {
    id: 'grete_primes_first',
    label: 'Grete har varslet ham',
    description:
      'Grete gjør forsøket mindre fremmed før Frank kommer trekkende med sin lille plan.',
    trustDelta: 0.05,
    controlDelta: 0.1,
    pressureDelta: -0.12,
  },
  {
    id: 'frank_pushes',
    label: 'Frank blir for flink',
    description: 'Frank vil få det gjort, og dermed blir øvingen en prøve Elling kan stryke på.',
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
    label: 'Si det uten seremoni',
    good: 'Frank sier det vanskelige lavt nok til at Elling slipper å forsvare hele personen sin',
    risk: 'kan lukke døren hvis forklaringen kommer før rommet har gitt tillatelse',
    covers: ['shame', 'hope', 'dignity_exposure'],
    weak: ['phone_fear', 'unpaid_bill', 'sleep_debt'],
  },
  {
    id: 'humor_play',
    label: 'La ham gjøre narr av det',
    good: 'Elling får beholde ansikt ved å gjøre telefonøving til noe litt latterlig',
    risk: 'kan bli for lettvint når brevet på bordet faktisk har frist',
    covers: ['phone_fear', 'shame', 'restlessness'],
    weak: ['unpaid_bill', 'sleep_debt', 'dignity_exposure'],
  },
];

export const phoneActivityClocks: ActivityClock[] = [
  {
    id: 'ring_ring_ladder',
    label: 'Telefontrening: ring ring',
    description:
      'Frank gjør telefonen pinlig konkret før den får bli en ekte samtale. Øvingen er scenen, ikke en abstrakt bonus.',
    segments: 5,
    filled: 0,
    diceSlots: ['safe', 'safe', 'risky', 'risky', 'locked'],
    tone: 'practice',
    stages: [
      'Frank står med mobilen til øret og sier «ring ring».',
      'Elling plukker opp, buser noe ut og legger på.',
      'Frank ringer fra mobilen mens han fortsatt er i rommet.',
      'Frank går på kjøkkenet og ringer hustelefonen.',
      'Elling svarer uten at Frank står ved siden av.',
    ],
  },
  {
    id: 'open_line_risk',
    label: 'Åpen linje: ny regning',
    description:
      'Når telefonen virker, virker den også for alt annet. Framgang åpner verden — og en dyrere form for ensomhet.',
    segments: 4,
    filled: 0,
    diceSlots: ['empty', 'risky', 'risky', 'locked'],
    tone: 'complication',
    stages: [
      'Telefonen blir interessant når Frank ikke er der.',
      'Privat ringevindu dukker opp på ettermiddagen.',
      'Sexlinjen blir en løsning på et behov uten å gå ut.',
      'Telefonregningen lander på bordet ved månedsslutt.',
    ],
  },
];
