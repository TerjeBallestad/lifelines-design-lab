export type ApartmentEvidenceId = 'post_pressure' | 'elling_distance' | 'grete_load';

export interface FrankQuestion {
  id: string;
  evidenceId: ApartmentEvidenceId;
  prompt: string;
  clueLabel: string;
  reply: string;
  actionLabel: string;
  evidenceLabel: string;
}

export const frankQuestions: FrankQuestion[] = [
  {
    id: 'ask_post_under_paper',
    evidenceId: 'post_pressure',
    prompt: 'Hva betyr det at posten ligger under avisen?',
    clueLabel: 'Post under avisen',
    reply:
      'Jeg la merke til det samme. Grete dyttet avisen tilbake over konvoluttene mens hun snakket, uten å se på dem. Det ser ikke ut som rot. Det ser ut som noe de begge har lært å gå rundt. Hvis vi gjør dette til “økonomi”, blir det for stort. Jeg ville bedt om én konkret regning og tatt den ved kjøkkenbordet.',
    actionLabel: 'Be om én konkret regning',
    evidenceLabel: 'Posten blir håndtert som uro, ikke papir',
  },
  {
    id: 'ask_elling_distance',
    evidenceId: 'elling_distance',
    prompt: 'La du merke til hvor Elling plasserte seg?',
    clueLabel: 'Elling i utkanten',
    reply:
      'Jeg så det. Han ble sittende, men han flyttet kroppen ut av samtalen. Grete svarte for ham før stillheten rakk å bli pinlig. Det betyr ikke at han nekter hjelp. Det betyr at vi ikke skal gjøre neste steg til en prøve foran andre. Hold det kort, konkret og lett å trekke seg fra.',
    actionLabel: 'Lag et kort forsøk med utvei',
    evidenceLabel: 'Elling tåler nærvær bedre enn prestasjon',
  },
  {
    id: 'ask_grete_load',
    evidenceId: 'grete_load',
    prompt: 'Hvor mye av dette er egentlig Grete som holder i gang?',
    clueLabel: 'Gretes kaffekopp og besøksrutine',
    reply:
      'Jeg så hvor mye hun gjorde før jeg rakk å spørre. Kaffen, døra, de små forklaringene. Hun får rommet til å virke enklere enn det er. Hvis vi ber Elling klare mer nå, legger vi bare enda en oppgave oppå henne. Først bør vi ta bort én ting Grete pleier å bære.',
    actionLabel: 'Avlast én Grete-oppgave',
    evidenceLabel: 'Grete bærer rommet som arbeid',
  },
];

export function findFrankQuestion(id: string): FrankQuestion | undefined {
  return frankQuestions.find((question) => question.id === id);
}
