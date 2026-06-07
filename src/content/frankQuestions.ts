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
    prompt: 'Hva betyr det for husleia?',
    clueLabel: 'Husleia står i Gretes navn',
    roomNotice:
      'Kontoutskriften ligger ved posten. Husleie, strøm og telefon trekkes fra Gretes konto.',
    reply:
      'Det er den viktigste tingen i hele besøket. Grete betaler ikke fordi hun er ute av kontroll. Hun betaler fordi leiligheten fungerer gjennom henne. Hvis hun dør, mister Elling ikke bare moren sin. Han mister betalingssystemet sitt. Da kan denne leiligheten ryke ganske fort.',
    actionLabel: 'Sikre husleie uten Grete',
    evidenceLabel: 'Leiligheten er avhengig av Gretes konto',
  },
  {
    id: 'ask_elling_distance',
    evidenceId: 'elling_distance',
    prompt: 'Hva klarer Elling selv her?',
    clueLabel: 'Elling mangler hverdagsferdigheter',
    roomNotice:
      'Elling lar Grete svare, hente fram papirer og forklare hva som skjer videre.',
    reply:
      'Ikke nok til å være trygg alene. Han kan bo her når Grete holder rammen: regninger, telefoner, avtaler, små forklaringer. Men jeg ser ikke at han kan overta de tingene hvis hun blir borte. Vi må behandle det som ferdigheter som må øves, ikke som detaljer hun bare kan fortsette å hjelpe med.',
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
      'Ja. Det er ikke inkompetanse. Hun kan betale regninger og skaffe papirer. Problemet er at hun snakker som om Elling snart kommer til å klare voksenlivet bare han får ro. Kanskje hun har rett. Men saken vår kan ikke bygges på håpet hennes. Vi må planlegge for at Grete kan forsvinne før Elling er klar.',
    actionLabel: 'Lag plan for hvis Grete faller bort',
    evidenceLabel: 'Gretes håp dekker over risikoen',
  },
];

export function findFrankQuestion(id: string): FrankQuestion | undefined {
  return frankQuestions.find((question) => question.id === id);
}
