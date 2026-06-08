import type { ActionCard, ActionCardId, ActionOutcomeClass, DieFace } from '../domain/types';

export const actionOutcomeCopy: Record<ActionOutcomeClass, string> = {
  positive: 'Positivt',
  neutral: 'Nøytralt',
  negative: 'Negativt',
};

export const actionRiskCopy: Record<ActionCard['risk'], string> = {
  safe: 'Trygg',
  risky: 'Risiko',
  fragile: 'Skjør',
};

export const actionCards: ActionCard[] = [
  {
    id: 'get_to_know_elling',
    title: 'Bli litt kjent med Elling',
    type: 'repeatable',
    skill: 'Sosialt',
    risk: 'risky',
    modifier: 0,
    body: 'Frank prøver å få en grunn til å komme tilbake uten at besøket blir enda en vurdering. Målet er ikke å avdekke et problem, men å finne én ting Elling faktisk bryr seg om.',
    costs: { dice: 1 },
    clockEffects: ['Elling blir person', 'Nytt besøk mulig'],
    outcomes: {
      positive: {
        title: 'Gro-utklippene kommer fram',
        text: 'Elling viser fram en samling Gro Harlem Brundtland-utklipp med mer presisjon enn saken hadde ventet. Frank får en faktisk grunn til å besøke ham igjen.',
      },
      neutral: {
        title: 'Elling lar Frank se hyllen',
        text: 'Han forklarer lite, men flytter seg ikke vekk. Interessen finnes; tilliten gjør det ikke helt ennå.',
      },
      negative: {
        title: 'Grete svarer for ham igjen',
        text: 'Frank får mer Grete enn Elling. Det er nyttig for saken, men dårlig for å bli kjent med ham.',
      },
    },
  },
  {
    id: 'phone_first_step',
    title: 'Telefon: første steg',
    type: 'repeatable',
    skill: 'Telefon og ærend',
    risk: 'fragile',
    modifier: 0,
    body: 'Telefonen står på bordet. Frank kan tilby manus, men ikke svare for ham. Målet er ett lite steg, ikke en samtale som beviser noe.',
    costs: { dice: 1 },
    clockEffects: ['Telefontrening: ring ring', 'Åpen linje: ny regning'],
    outcomes: {
      positive: {
        title: 'Én setning før retrett',
        text: '+ Telefon og ærend, + mestring: telefon. Verden åpner seg litt, og det er ikke gratis.',
      },
      neutral: {
        title: 'Røret holdes, ingenting sies',
        text: '+ observasjon: kontakt uten tale. Frank får et smalere neste steg.',
      },
      negative: {
        title: 'Telefonen blir prinsippsak',
        text: '- tillit, - overskudd. Elling gjør apparatet til et lite sort forhørsrom med ledning.',
      },
    },
  },
  {
    id: 'institution_assessment',
    title: 'Vurder institusjonsplass',
    type: 'critical',
    skill: 'Saksforståelse',
    risk: 'fragile',
    modifier: 0,
    body: 'Trygt for saken. Farlig for tilliten. Et institusjonsspor kan gi ryddige papirer, men Elling kan også forstå at hjemmet hans er blitt noe andre vurderer.',
    costs: { dice: 1 },
    clockEffects: ['Institusjonsklokke', 'Tillit til Frank'],
    outcomes: {
      positive: {
        title: 'Risiko dokumenteres tydelig',
        text: '+ saksgrunnlag. Frank får et ryddig risikospor, men ingen ny kontakt med Elling.',
      },
      neutral: {
        title: 'Grete blir varsom',
        text: 'Hun skjønner at kommunen tenker større enn praktisk hjelp. Videre hjemmebesøk blir kjøligere.',
      },
      negative: {
        title: 'Grete trekker seg, døren lukkes',
        text: '- tillit. + institusjonsklokke. Elling hører at hjemmet hans er blitt et alternativ.',
      },
    },
  },
];

export function getActionCard(id: ActionCardId): ActionCard {
  const card = actionCards.find((item) => item.id === id);
  if (!card) throw new Error(`Unknown action card: ${id}`);
  return card;
}

export function adjustedDie(face: DieFace, modifier: number): number {
  return Math.max(1, Math.min(6, face + modifier));
}

export function actionProbabilities(total: number): Record<ActionOutcomeClass, number> {
  if (total >= 6) return { positive: 1, neutral: 0, negative: 0 };
  if (total >= 4) return { positive: 0.5, neutral: 0.5, negative: 0 };
  if (total === 3) return { positive: 0.25, neutral: 0.5, negative: 0.25 };
  return { positive: 0, neutral: 0.5, negative: 0.5 };
}

export function resolveActionOutcome(
  cardId: ActionCardId,
  face: DieFace,
  modifier: number,
  seed: number,
): ActionOutcomeClass {
  const probabilities = actionProbabilities(adjustedDie(face, modifier));
  const roll = seededRoll(`${cardId}:${face}:${modifier}:${seed}`);
  if (roll < probabilities.positive) return 'positive';
  if (roll < probabilities.positive + probabilities.neutral) return 'neutral';
  return 'negative';
}

function seededRoll(input: string): number {
  let hash = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) / 4294967296;
}
