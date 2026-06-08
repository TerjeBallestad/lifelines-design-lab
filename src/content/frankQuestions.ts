export type ApartmentEvidenceId = 'post_pressure' | 'elling_distance' | 'grete_load';

export interface FrankQuestion {
  id: string;
  evidenceId: ApartmentEvidenceId;
  prompt: string;
  clueLabel: string;
  roomNotice: string;
  reply: string;
  actionLabel: string;
  evidenceLabel: string;
}

export const frankQuestions: FrankQuestion[] = [
  {
    id: 'ask_post_under_paper',
    evidenceId: 'post_pressure',
    prompt: 'Hva betyr posten under avisen?',
    clueLabel: 'Posten forsvinner under avisen',
    roomNotice:
      'Det ligger uåpnet post under avisen. Grete flytter den ikke bort, men hun lar den heller ikke bli en samtale mens Elling hører på.',
    reply:
      'Jeg vet ikke hva som står der ennå. Det er poenget. Posten finnes i rommet, men ikke i samtalen. Før vi ber om bank eller trygd må vi forstå hvem som faktisk åpner, forklarer og betaler det som kommer inn døren.',
    actionLabel: 'Be Grete finne fram økonomisk oversikt',
    evidenceLabel: 'Uåpnet post peker mot økonomi, ikke bevis ennå',
  },
  {
    id: 'ask_elling_distance',
    evidenceId: 'elling_distance',
    prompt: 'Hva klarer Elling selv her?',
    clueLabel: 'Elling mangler hverdagsferdigheter',
    roomNotice:
      'Elling lar Grete svare, hente fram papirer og forklare hva som skjer videre. Ferdighetsbildet hans er fortsatt låst: Frank ser ikke hva han liker, bare hva han unngår.',
    reply:
      'Ikke nok til å være trygg alene ennå. Han kan bo her når Grete holder rammen: regninger, telefoner, avtaler, små forklaringer. Men han har aldri fått øve på å stå i det selv. Vi må behandle dette som ferdigheter som kan bygges, ikke som en merkelapp vi skal forklare ferdig.',
    actionLabel: 'Kartlegg hvilke oppgaver Elling faktisk gjør selv',
    evidenceLabel: 'Elling kan ikke drive hverdagen alene',
  },
  {
    id: 'ask_grete_load',
    evidenceId: 'grete_load',
    prompt: 'Virket Grete bekymret?',
    clueLabel: 'Grete holder besøket oppe',
    roomNotice:
      'Grete setter fram kaffe, svarer før pausen blir pinlig, og gjør besøket lettere for alle andre enn seg selv.',
    reply:
      'Ja, men hun viser det ikke som panikk. Hun behandler hverdagen som noe hun fortsatt kan holde samlet. Det er kjærlig, og det er farlig. Hvis hun blir borte, mister Elling ikke bare moren sin. Han mister måten rommet fungerer på.',
    actionLabel: 'Lag plan for hvis Grete faller bort',
    evidenceLabel: 'Gretes håp dekker over risikoen',
  },
];

export function findFrankQuestion(id: string): FrankQuestion | undefined {
  return frankQuestions.find((question) => question.id === id);
}
