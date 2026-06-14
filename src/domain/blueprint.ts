export type BlueprintSurface = 'pulten' | 'fakta' | 'sporsmal' | 'vedtak' | 'frank' | 'leiligheten';

export type BlueprintPhase = 'prologue' | 'play' | 'ended';

export type BlueprintDomain =
  | 'Økonomi/bolig'
  | 'Hverdag/rutine'
  | 'Helse/risiko'
  | 'Nettverk/sosialt'
  | 'Ressurser';

export type BlueprintDocumentRegister = 'klinisk' | 'notat' | 'formell' | 'vedtak';

export type BlueprintFactId = string;
export type BlueprintDocumentId = string;
export type BlueprintQuestionId = string;
export type BlueprintHypothesisId = string;
export type BlueprintTiltakId = string;
export type BlueprintDispatchId = string;
export type BlueprintChatId = string;
export type BlueprintClockId =
  | 'ck_bostotte'
  | 'ck_overfort'
  | 'ck_rutine'
  | 'ck_restanse'
  | 'ck_grete';

export type BlueprintTiltakSlot = 's1' | 's2' | 's3' | 'press';

export interface BlueprintStoryBeat {
  cap?: string;
  who?: string;
  say?: string;
  dir?: string;
  stamp?: string;
  end?: string;
}

export interface BlueprintTextRun {
  text: string;
  factId?: BlueprintFactId;
}

export interface BlueprintDocumentBlock {
  id: string;
  runs: BlueprintTextRun[];
}

export interface BlueprintDocument {
  id: BlueprintDocumentId;
  kind: string;
  title: string;
  register: BlueprintDocumentRegister;
  peek: string;
  meta: string;
  blocks: BlueprintDocumentBlock[];
}

export interface BlueprintFact {
  id: BlueprintFactId;
  domain: BlueprintDomain;
  category: string;
  text: string;
  quote: string;
  supports: BlueprintQuestionId[];
  discuss: Array<'Frank' | 'Grete'>;
}

export interface BlueprintHypothesis {
  id: BlueprintHypothesisId;
  label: string;
  needs: BlueprintFactId[];
  opens: BlueprintTiltakId[];
  note: string;
}

export interface BlueprintQuestion {
  id: BlueprintQuestionId;
  title: string;
  appearsOn: BlueprintFactId[];
  hypotheses: BlueprintHypothesis[];
}

export interface BlueprintTiltak {
  id: BlueprintTiltakId;
  slot: BlueprintTiltakSlot;
  title: string;
  cost: number;
  needs: BlueprintFactId[];
  needsHypothesis?: BlueprintHypothesisId[];
  needsVisit?: boolean;
  early?: boolean;
  description: string;
  sim: string;
}

export interface BlueprintDispatch {
  id: BlueprintDispatchId;
  title: string;
  description: string;
}

export interface BlueprintChatPrompt {
  id: BlueprintChatId;
  needs: BlueprintFactId;
  question: string;
  answer: BlueprintTextRun[];
}

export interface BlueprintDocState {
  day: number;
  read: boolean;
  isNew: boolean;
}

export interface BlueprintFactState {
  day: number;
  fresh: boolean;
}

export interface BlueprintQuestionState {
  visible: true;
  hypothesisId: BlueprintHypothesisId | null;
}

export interface BlueprintPendingDocument {
  day: number;
  documentId: BlueprintDocumentId;
}

export interface BlueprintVedtakRecord {
  documentId: BlueprintDocumentId;
  number: number;
  title: string;
  peek: string;
  meta: string;
  day: number;
  tiltakIds: BlueprintTiltakId[];
  hypothesisIds: BlueprintHypothesisId[];
  stampText: string;
}

export interface BlueprintChatMessage {
  who: 'Deg' | 'Frank';
  runs: BlueprintTextRun[];
}

export interface BlueprintClockTrack {
  good: number;
  bad: number;
  done?: boolean;
  failed?: boolean;
}

export interface BlueprintSimLogEntry {
  day: number;
  text: string;
  kind: 'obs' | 'tiltak' | 'frank' | 'day';
  factId?: BlueprintFactId;
}

export interface BlueprintSimState {
  needs: {
    hunger: number;
    energy: number;
    social: number;
    security: number;
  };
  foodBoxes: number;
  mail: number;
  unanswered: number;
  doorOpened: boolean;
  visitLevel: 0 | 1 | 2;
  log: BlueprintSimLogEntry[];
  flavorIndex: number;
  tiradeLogged: boolean;
  forvaltningLogged: boolean;
  institutionLogged: boolean;
}

export interface BlueprintEndText {
  para1: string;
  para2: string;
  closing: string;
}

export interface BlueprintProgress {
  day: number;
  actions: number;
  phase: BlueprintPhase;
  greteStage: number;
  documents: Record<BlueprintDocumentId, BlueprintDocState>;
  pending: BlueprintPendingDocument[];
  facts: Record<BlueprintFactId, BlueprintFactState>;
  unreadFacts: number;
  questions: Record<BlueprintQuestionId, BlueprintQuestionState>;
  chatLog: BlueprintChatMessage[];
  askedChatIds: BlueprintChatId[];
  dispatchedIds: BlueprintDispatchId[];
  draftTiltakIds: BlueprintTiltakId[];
  enactedTiltakIds: BlueprintTiltakId[];
  vedtakCount: number;
  vedtakRecords: BlueprintVedtakRecord[];
  clocks: {
    ck_bostotte: BlueprintClockTrack;
    ck_overfort: BlueprintClockTrack;
    ck_rutine: BlueprintClockTrack;
    ck_restanse: BlueprintClockTrack;
  };
  sim: BlueprintSimState;
  endText?: BlueprintEndText;
}

export interface BlueprintFactLiftResult {
  fact: BlueprintFact;
  newQuestionIds: BlueprintQuestionId[];
}

export interface BlueprintAvailability {
  ok: boolean;
  why?: string;
}

export interface BlueprintDispatchOutcome {
  toasts: Array<{
    tag: string;
    text: string;
    kind?: 'fact' | 'hypothesis' | 'day';
  }>;
}
