import type { ApartmentEvidenceId } from './frankQuestions';

export interface LabeledParagraph {
  label?: string;
  text: string;
}

export interface EvidenceBrief {
  label: string;
  text: string;
}

export interface IntakeCaseCopy {
  initialConcern: {
    documentLabel: string;
    objective: string;
    actionLabel: string;
    patient: string;
    subject: string;
    paragraphs: string[];
    tasks: string[];
    signature: string;
  };
  firstContactReport: {
    title: string;
    paragraphs: LabeledParagraph[];
  };
  financialOverview: {
    title: string;
    pendingText: string;
    requestedLabel: string;
    receivedLabel: string;
    requestedStateLabel: string;
    paragraphs: Array<string | LabeledParagraph>;
  };
  socialVisit: {
    scheduledText: string;
    performActionLabel: string;
    nextStepTitle: string;
    nextStepText: string;
    reportTitle: string;
    reportParagraphs: Array<string | LabeledParagraph>;
  };
  frankFocus: {
    title: string;
    intro: string;
    unavailableLabel: string;
  };
  financePrompt: {
    title: string;
    text: string;
  };
  deskDecision: {
    title: string;
    text: string;
    actionLabel: string;
  };
}

export const intakeCaseCopy = {
  initialConcern: {
    documentLabel: 'Bekymringsmelding',
    objective: 'Etabler kontakt med Grete',
    actionLabel: 'Ring Grete',
    patient: 'Grete Halvorsen',
    subject: 'Elling Halvorsen (35 år)',
    paragraphs: [
      'Grete oppgir at Elling bor hjemme, hun har 100% omsorg. Hun beskriver ham som “en smart gutt” og ønsker ikke videre tiltak nå.',
      'Lege vurderer at familien kan ha behov for oppfølging dersom Gretes helsetilstand forverres.',
    ],
    tasks: [
      'Etablere kontakt med Grete',
      'Kartlegge Ellings hverdag og nettverk',
      'Vurdere støtte ved endret omsorgssituasjon',
    ],
    signature: 'Dr. Haug',
  },
  firstContactReport: {
    title: 'Frankrapport · Første kontakt',
    paragraphs: [
      {
        label: 'Observasjon',
        text: 'Grete svarte raskt og førte samtalen. Hun omtaler Elling som “en smart gutt”.',
      },
      {
        label: 'Usikkerhet',
        text: 'Elling deltok ikke direkte. Det er uklart om han kjenner til henvendelsen eller hva han selv forstår av saken.',
      },
      {
        label: 'Anbefalt',
        text: 'gjennomfør det korte besøket Grete gikk med på før saken tolkes for hardt.',
      },
    ] satisfies LabeledParagraph[],
  },
  financialOverview: {
    title: 'Dokument: Økonomisk oversikt',
    pendingText: 'Økonomisk oversikt bedt om. Grete finner fram papirer til neste dag.',
    requestedLabel: 'Be Grete finne fram økonomisk oversikt',
    receivedLabel: 'Økonomisk oversikt mottatt',
    requestedStateLabel: 'Økonomisk oversikt bedt om',
    paragraphs: [
      'Ellings uføretrygd kommer inn på Gretes konto. Hun betaler husleie, strøm og telefon derfra, og Elling håndterer ikke de faste trekkene selv.',
      {
        label: 'Merknad',
        text: 'Dersom Grete faller bort, blir leiligheten et praktisk spørsmål før den blir et omsorgsspørsmål.',
      },
    ] satisfies Array<string | LabeledParagraph>,
  },
  socialVisit: {
    scheduledText: 'Grete har sagt ja til et kort sosialt besøk.',
    performActionLabel: 'Gjennomfør sosialt besøk',
    nextStepTitle: 'Avtalt med Grete',
    nextStepText:
      'Grete har sagt ja til et kort sosialt besøk. Frank skal ikke konkludere ennå — bare se hvordan hjemmet faktisk holdes sammen.',
    reportTitle: 'Besøksnotat: Gretes rolle i saken',
    reportParagraphs: [
      'Frank beskriver ikke et rotete hjem. Han beskriver et hjem som fungerer fordi Grete gjør besøket, posten, pausene og Elling sosialt håndterbart.',
      {
        label: 'Risiko',
        text: 'Hvis Grete dør, må Elling møte hverdagen med støtte fra saken, ikke med moren som skjult ramme.',
      },
    ] satisfies Array<string | LabeledParagraph>,
  },
  frankFocus: {
    title: 'Spør Frank om noe du faktisk så',
    intro: 'Velg én ting fra besøket. Frank svarer kort, og svaret kan åpne ett nytt sakssteg.',
    unavailableLabel: 'Må legges merke til i rommet først',
  },
  financePrompt: {
    title: 'Økonomi må avklares senere',
    text: 'Posten er et spor, ikke et bevis. Etter besøket kan Frank be Grete finne fram økonomisk oversikt. Dokumentet kommer først neste dag.',
  },
  deskDecision: {
    title: 'Nytt sakssteg',
    text: 'Start med hjelp som flytter én konkret oppgave bort fra Grete uten å ta hjemmet fra Elling.',
    actionLabel: 'Foreslå praktisk avlastning',
  },
} satisfies IntakeCaseCopy;

export const apartmentEvidenceBriefs: Record<ApartmentEvidenceId, EvidenceBrief> = {
  post_pressure: {
    label: 'Posten forsvinner under avisen',
    text: 'saken må finne ut hvem som åpner, forklarer og betaler det som kommer inn døren.',
  },
  elling_distance: {
    label: 'Elling mangler hverdagsferdigheter',
    text: 'regninger, telefoner og avtaler drives fortsatt gjennom Grete.',
  },
  grete_load: {
    label: 'Grete holder besøket oppe',
    text: 'saken må planlegge for det arbeidet hun gjør uten å kalle det arbeid.',
  },
};
