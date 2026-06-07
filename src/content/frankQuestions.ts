export type ApartmentEvidenceId = 'post_pressure' | 'elling_distance' | 'grete_load';

export interface FrankQuestion {
  id: string;
  evidenceId: ApartmentEvidenceId;
  prompt: string;
  clueLabel: string;
  observed: string;
  interpretation: string;
  uncertainty: string;
  recommendation: string;
  evidenceLabel: string;
}

export const frankQuestions: FrankQuestion[] = [
  {
    id: 'ask_post_under_paper',
    evidenceId: 'post_pressure',
    prompt: 'Hva betyr det at posten ligger under avisen?',
    clueLabel: 'Post under avisen',
    observed: 'Posten er ikke gjemt, men den er heller ikke håndtert. Grete rydder rundt den.',
    interpretation:
      'Det ser mindre ut som “glemt post” og mer som et punkt i rommet alle vet finnes, men ingen starter alene.',
    uncertainty:
      'Frank vet ikke om Elling forstår regningene, eller om han bare kjenner presset fra dem.',
    recommendation:
      'Ikke start med telefonøving som ny plikt. Start med å gjøre én økonomisk ting mindre truende.',
    evidenceLabel: 'Posten er et romproblem, ikke bare et dokumentproblem',
  },
  {
    id: 'ask_elling_distance',
    evidenceId: 'elling_distance',
    prompt: 'La du merke til hvor Elling plasserte seg?',
    clueLabel: 'Elling i utkanten',
    observed: 'Han ble i rommet, men valgte avstand. Han protesterte ikke mot besøket.',
    interpretation:
      'Besøk tåles bedre enn krav. Frank kan være en trygg person så lenge han ikke gjør rommet om til prøve.',
    uncertainty: 'Det kan være tillit, høflighet eller bare Gretes arbeid som holder ham der.',
    recommendation:
      'Neste tiltak bør beskytte lav terskel: kort, konkret, og med en tydelig utvei.',
    evidenceLabel: 'Elling tåler nærvær bedre enn prestasjon',
  },
  {
    id: 'ask_grete_load',
    evidenceId: 'grete_load',
    prompt: 'Hvor mye av dette er egentlig Grete som holder i gang?',
    clueLabel: 'Gretes kaffekopp og besøksrutine',
    observed:
      'Grete åpner døra, setter fram kaffe og oversetter pauser før de rekker å bli problemer.',
    interpretation:
      'Hun er ikke bare pårørende. Hun er hverdagsinfrastruktur. Saken ser stabil ut fordi hun arbeider hele tiden.',
    uncertainty:
      'Frank kan ikke vite ennå hva Elling klarer uten henne. Det må prøves i små, synlige grep.',
    recommendation:
      'Før saken ber Elling mestre mer, må den avlaste én ting Grete vanligvis bærer.',
    evidenceLabel: 'Grete bærer rommet som arbeid',
  },
];

export function findFrankQuestion(id: string): FrankQuestion | undefined {
  return frankQuestions.find((question) => question.id === id);
}
