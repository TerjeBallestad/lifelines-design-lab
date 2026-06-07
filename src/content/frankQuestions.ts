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
    prompt: 'Holder trygden til husleia?',
    clueLabel: 'Trygden dekker ikke leiligheten',
    roomNotice:
      'Kontoutskriften ligger ved posten. Elling har trygd inn, men husleie, strøm og telefon går gjennom Gretes pensjon.',
    reply:
      'Det er den viktigste tingen i hele besøket. Elling har trygd, men den bærer ikke husleia og de faste utgiftene alene. Grete er ikke problemet her; hun er velgjøreren som tetter hullet med pensjonen sin. Hvis hun dør, mister Elling moren sin, støtten sin og pengene som gjør at leiligheten går rundt.',
    actionLabel: 'Finn gapet mellom trygd og faste utgifter',
    evidenceLabel: 'Leiligheten er avhengig av Gretes pensjon',
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
