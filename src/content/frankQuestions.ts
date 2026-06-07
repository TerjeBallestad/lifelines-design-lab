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
    prompt: 'Hvem styrer trygden hans?',
    clueLabel: 'Grete mottar Ellings trygd',
    roomNotice:
      'Kontoutskriften ligger ved posten. Ellings uføretrygd kommer inn på Gretes konto, og hun betaler husleie, strøm og telefon derfra.',
    reply:
      'Det er den viktigste tingen i hele besøket. Elling er vurdert som ute av stand til å jobbe, men pengene hans går ikke gjennom ham. Grete mottar trygden, betaler regningene og holder hverdagen samlet. Hvis hun dør, mister han ikke bare moren sin. Han må plutselig prøve å eie sitt eget liv, med oss som støtte.',
    actionLabel: 'Flytt økonomistøtten over på Elling',
    evidenceLabel: 'Grete forvalter Ellings trygd',
  },
  {
    id: 'ask_elling_distance',
    evidenceId: 'elling_distance',
    prompt: 'Hva klarer Elling selv her?',
    clueLabel: 'Elling mangler hverdagsferdigheter',
    roomNotice:
      'Elling lar Grete svare, hente fram papirer og forklare hva som skjer videre.',
    reply:
      'Ikke nok til å være trygg alene ennå. Han kan bo her når Grete holder rammen: regninger, telefoner, avtaler, små forklaringer. Men han har aldri fått øve på å stå i det selv. Vi må behandle dette som ferdigheter som kan bygges, ikke som en merkelapp vi skal forklare ferdig.',
    actionLabel: 'Kartlegg hvilke oppgaver Elling faktisk gjør selv',
    evidenceLabel: 'Elling kan ikke drive hverdagen alene',
  },
  {
    id: 'ask_grete_load',
    evidenceId: 'grete_load',
    prompt: 'Hører du hvor sikker Grete er på at dette går bra?',
    clueLabel: 'Grete tror det snart ordner seg',
    roomNotice:
      'Grete sier at Elling “bare trenger litt tid” og snakker om framtiden som om den allerede er på vei til å løse seg.',
    reply:
      'Ja. Det er ikke inkompetanse. Hun kan betale regninger og skaffe papirer. Problemet er at hun har skjermet ham så lenge at det nesten høres kjærlig og farlig ut samtidig. Vi trenger ikke si alt høyt. Men hvis Grete blir borte, starter spillet egentlig der: Elling får endelig prøve selv, med velferdsstaten som støtte i stedet for moren.',
    actionLabel: 'Lag plan for hvis Grete faller bort',
    evidenceLabel: 'Gretes håp dekker over risikoen',
  },
];

export function findFrankQuestion(id: string): FrankQuestion | undefined {
  return frankQuestions.find((question) => question.id === id);
}
