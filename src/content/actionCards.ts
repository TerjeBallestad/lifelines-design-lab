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
    id: 'post_folder_review',
    title: 'Gjennomgå postmappe',
    type: 'repeatable',
    skill: 'Økonomi',
    risk: 'risky',
    modifier: 1,
    body:
      'Frank legger ett brev på bordet og lar resten ligge. Elling trenger ikke forstå alt. Bare bli værende lenge nok til at brevet ikke forsvinner under avisen.',
    costs: { dice: 1 },
    clockEffects: ['Post blir Ellings ansvar', 'Grete bærer litt mindre'],
    outcomes: {
      positive: {
        title: 'Elling åpner ett brev selv',
        text: '+ Økonomi, + mestring: post. Frank noterer at papir kan bli en øvingsflate, ikke bare Gretes arbeid.',
      },
      neutral: {
        title: 'Frank leser, Elling blir sittende',
        text: '+ observasjon: tåler gjennomgang med støtte. Ingen selvstendig handling ennå.',
      },
      negative: {
        title: 'Mappen skyves bort',
        text: '- overskudd. Ny observasjon: post oppleves som kontroll når Grete ikke holder den.',
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
    body:
      'Telefonen står på bordet. Frank kan tilby manus, men ikke svare for ham. Målet er ett lite steg, ikke en samtale som beviser noe.',
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
    body:
      'Saken kan gjøres tryggere på papiret. Spørsmålet er hva som skjer med Ellings hjem når trygghet blir viktigere enn mestring.',
    costs: { dice: 1 },
    clockEffects: ['Institusjonsklokke', 'Tillit til Frank'],
    outcomes: {
      positive: {
        title: 'Risiko dokumenteres tydelig',
        text: '+ saksgrunnlag. Et formelt spor åpnes, men det bygger ikke Ellings ferdigheter.',
      },
      neutral: {
        title: 'Saken sendes videre',
        text: 'Grete blir urolig. Frank får ryddige papirer og mindre kontakt.',
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
