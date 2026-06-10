import type {
  CaseDocument,
  CaseDocumentId,
  CaseEvidenceFact,
  CaseEvidenceFactId,
  CaseHypothesis,
  CaseHypothesisId,
} from '../domain/types';

export const caseDocuments: CaseDocument[] = [
  {
    id: 'haug_bekymringsmelding',
    title: 'Bekymringsmelding fra Dr. Haug',
    register: 'HELSERAPPORT · KOMMUNAL HENVISNING',
    source: 'Dr. Haug, fastlege',
    date: '2024-03-14',
    body: [
      'Pasient Grete Halvorsen opplyser om alvorlig sykdom og redusert kapasitet. Hun er primær støtteperson for sin voksne sønn Elling, som bor i leilighet på Frogner.',
      {
        id: 'haug_grete_carries_work',
        text: 'Mor opplyser at hun bistår med praktiske gjøremål, økonomisk oversikt og kontakt med tjenester.',
      },
      'Anbefaler kommunal kartlegging av funksjon, hjelpebehov og overgangstiltak før pårørende faller bort som daglig støtte.',
    ],
  },
  {
    id: 'economy_record',
    title: 'Kontoutskrift · faste utgifter',
    register: 'ØKONOMISK OVERSIKT · UTDRAG',
    source: 'Grete Halvorsen / bankutskrift',
    date: '2024-04-08',
    body: [
      'Utdraget viser faste trekk for husleie, strøm og telefon. Kontoen står i Gretes navn, med overføringer fra Ellings ytelser hver måned.',
      {
        id: 'grete_pays_rent',
        text: 'Grete betaler husleien fra sin konto og fører oversikt over forfallene.',
      },
      'Elling står ikke oppført med egne faste trekk for boligkostnader i perioden kommunen har mottatt dokumentasjon for.',
    ],
  },
  {
    id: 'rent_warning',
    title: 'Husleievarsel · forsinket betaling',
    register: 'BOLIGFORVALTER · VARSEL',
    source: 'Frogner Boligforvaltning',
    date: '2024-04-21',
    body: [
      'Boligforvalter minner om at husleie skal være registrert innen den 5. hver måned. Varsel sendes etter gjentatte avvik samme vår.',
      {
        id: 'rent_paid_late',
        text: 'Husleien er betalt sent to måneder på rad.',
      },
      'Dersom forsinkelsene fortsetter, ber forvalter om skriftlig plan for videre betaling.',
    ],
  },
];

export const caseEvidenceFacts: Record<CaseEvidenceFactId, CaseEvidenceFact> = {
  haug_grete_carries_work: {
    id: 'haug_grete_carries_work',
    sourceDocumentId: 'haug_bekymringsmelding',
    domain: 'Ressurs',
    shortText: 'Grete bærer praktisk arbeid, økonomisk oversikt og kontakt med tjenester.',
    originalQuote:
      'Mor opplyser at hun bistår med praktiske gjøremål, økonomisk oversikt og kontakt med tjenester.',
    category: 'Dokument',
    discussable_with: ['Frank', 'Grete'],
  },
  grete_pays_rent: {
    id: 'grete_pays_rent',
    sourceDocumentId: 'economy_record',
    domain: 'Økonomi/bolig',
    shortText: 'Grete betaler husleien.',
    originalQuote: 'Grete betaler husleien fra sin konto og fører oversikt over forfallene.',
    category: 'Økonomi',
    discussable_with: ['Frank', 'Grete'],
    contributesTo: 'grete_carries_economy',
  },
  rent_paid_late: {
    id: 'rent_paid_late',
    sourceDocumentId: 'rent_warning',
    domain: 'Økonomi/bolig',
    shortText: 'Husleien er betalt sent.',
    originalQuote: 'Husleien er betalt sent to måneder på rad.',
    category: 'Risiko',
    discussable_with: ['Frank', 'Grete'],
    contributesTo: 'grete_carries_economy',
  },
};

export const caseHypotheses: Record<CaseHypothesisId, CaseHypothesis> = {
  grete_carries_economy: {
    id: 'grete_carries_economy',
    title: 'Grete bærer økonomien',
    status: 'Foreløpig',
    assessment:
      'Husleie og betalinger ser ut til å fungere gjennom Gretes system. Må sjekkes mot Ellings inntekt, faste utgifter og posthåndtering.',
    threshold: 2,
    requiredFactIds: ['grete_pays_rent', 'rent_paid_late'],
    discussable_with: ['Frank', 'Grete'],
  },
};

export function getCaseDocument(id: CaseDocumentId): CaseDocument {
  return caseDocuments.find((document) => document.id === id) ?? caseDocuments[0];
}

export function getCaseFact(id: CaseEvidenceFactId): CaseEvidenceFact {
  return caseEvidenceFacts[id];
}

export function getCaseHypothesis(id: CaseHypothesisId): CaseHypothesis {
  return caseHypotheses[id];
}

export function unlockedHypothesisIds(factIds: CaseEvidenceFactId[]): CaseHypothesisId[] {
  const lifted = new Set(factIds);
  return Object.values(caseHypotheses)
    .filter((hypothesis) => hypothesis.requiredFactIds.every((id) => lifted.has(id)))
    .map((hypothesis) => hypothesis.id);
}
