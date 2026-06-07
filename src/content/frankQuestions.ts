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
    prompt: 'Hva betyr det at posten ligger under avisen?',
    clueLabel: 'Post under avisen',
    roomNotice:
      'Posten ligger ikke bortgjemt. Grete sier hun har kontroll, og legger avisen pent tilbake over bunken.',
    reply:
      'Ja. Det interessante er ikke at posten er ubetalt. Grete virker å ha kontroll på den delen. Det jeg hører er hvor raskt hun gjør den ufarlig: “det ordner seg”, “han trenger bare litt tid”. Det kan være sant. Det kan også være at hun beskytter ham mot et voksent ansvar hun fortsatt tror snart kommer av seg selv.',
    actionLabel: 'Spør hva Grete tror Elling snart klarer selv',
    evidenceLabel: 'Grete gjør posten ufarlig',
  },
  {
    id: 'ask_elling_distance',
    evidenceId: 'elling_distance',
    prompt: 'La du merke til hvor Elling plasserte seg?',
    clueLabel: 'Elling i utkanten',
    roomNotice: 'Elling blir i rommet, men sitter utenfor samtalen og lar Grete svare først.',
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
    roomNotice: 'Grete åpner, serverer og svarer optimistisk før spørsmålene rekker å lande hos Elling.',
    reply:
      'Ja. Hun er ikke hjelpeløs, og hun er ikke problemet. Men hun glatter over alt som kan bli vanskelig. Det er omsorg, og litt fornektelse. Hvis vi bare spør henne om status, får vi den framtiden hun håper på. Vi må spørre hva Elling faktisk gjør selv i dag.',
    actionLabel: 'Skille håp fra hva Elling gjør selv',
    evidenceLabel: 'Grete svarer med framtidshåp',
  },
];

export function findFrankQuestion(id: string): FrankQuestion | undefined {
  return frankQuestions.find((question) => question.id === id);
}
