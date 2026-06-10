export type DieFace = 1 | 2 | 3 | 4 | 5 | 6;

export type EllingState = 'calm' | 'tired' | 'prickly';
export type FrankStance = 'soft' | 'matter_of_fact' | 'pushy';
export type FrankPosition = 'near_phone' | 'seated_away' | 'absent_setup';
export type ScriptState = 'missing' | 'placed' | 'used' | 'ignored';
export type EllingPosition = 'chair' | 'phone' | 'pace' | 'bedroom_door' | 'bedroom';

export type PressureId =
  | 'restlessness'
  | 'shame'
  | 'sleep_debt'
  | 'unpaid_bill'
  | 'hope'
  | 'phone_fear'
  | 'dignity_exposure';

export type SupportModeId =
  | 'routine'
  | 'gentle_contact'
  | 'practical_help'
  | 'challenge'
  | 'boundary'
  | 'disclosure'
  | 'humor_play';

export type PhoneApproachId =
  | 'none'
  | 'written_script'
  | 'pre_agreed_window'
  | 'tolerate_ringtone'
  | 'grete_primes_first'
  | 'frank_pushes';

export type OutcomeId =
  | 'retreat'
  | 'anger_retreat'
  | 'pomp_defense'
  | 'annoyed_compliance'
  | 'partial_practice'
  | 'completed_practice';

export type OutcomeClass = 'negative' | 'neutral' | 'positive';

export type ActionOutcomeClass = OutcomeClass;
export type ActionCardId = 'get_to_know_elling' | 'phone_first_step' | 'institution_assessment';

export interface ActionCardOutcome {
  title: string;
  text: string;
}

export interface ActionCard {
  id: ActionCardId;
  title: string;
  type: 'repeatable' | 'critical';
  skill: string;
  risk: 'safe' | 'risky' | 'fragile';
  modifier: number;
  body: string;
  costs: { dice: number; coins?: number };
  clockEffects: string[];
  outcomes: Record<ActionOutcomeClass, ActionCardOutcome>;
}

export interface ActionCardResult {
  id: string;
  cardId: ActionCardId;
  dieFace: DieFace;
  adjustedDie: number;
  outcomeClass: ActionOutcomeClass;
  title: string;
  text: string;
}

export interface ClientState {
  overskudd: number;
  trust: number;
  phoneMastery: number;
  ellingState: EllingState;
}

export interface StateObject {
  id: string;
  label: string;
  anchor: 'phone' | 'sofa' | 'bedroom' | 'desk' | 'chair';
  description: string;
  pressure: number;
}

export interface PressureObject {
  id: PressureId;
  label: string;
  anchor: StateObject['anchor'];
  escalatesInto: string;
  softenedBy: string;
  designPurpose: string;
  clock: number;
}

export interface ActivityClock {
  id: string;
  label: string;
  description: string;
  segments: number;
  filled: number;
  diceSlots: Array<'empty' | 'safe' | 'risky' | 'locked'>;
  tone?: 'practice' | 'complication';
  stages?: string[];
}

export interface SupportMode {
  id: SupportModeId;
  label: string;
  good: string;
  risk: string;
  covers: PressureId[];
  weak: PressureId[];
}

export interface SupportAnalysis {
  coveredPressures: PressureId[];
  carriedWeaknesses: PressureId[];
  coverageScore: number;
  reasons: string[];
}

export interface Approach {
  id: PhoneApproachId;
  label: string;
  description: string;
  trustDelta: number;
  controlDelta: number;
  pressureDelta: number;
}

export interface DiePoolItem {
  id: string;
  face: DieFace;
  used: boolean;
}

export interface RoomState {
  ellingPosition: EllingPosition;
  frankPosition: FrankPosition;
  scriptState: ScriptState;
  doorClosed: boolean;
  lastFriction: string;
  bark?: string;
}

export interface AttemptContext {
  client: ClientState;
  approachId: PhoneApproachId;
  frankStance: FrankStance;
  frankPosition: FrankPosition;
  scriptState: ScriptState;
  dieFace: DieFace;
  supportIds: SupportModeId[];
  attemptIndex: number;
}

export interface VignetteBeat {
  id: string;
  actor: 'Frank' | 'Elling' | 'Phone' | 'Room';
  label: string;
  text: string;
  anchor: StateObject['anchor'];
  ellingPosition: EllingPosition;
  frankPosition: FrankPosition;
  scriptState: ScriptState;
  doorClosed: boolean;
  friction: string;
  bark?: string;
  evidence?: EvidenceFact[];
}

export interface EvidenceFact {
  id: string;
  label: string;
  value: boolean | number | string;
}

export type CaseDocumentId = 'haug_bekymringsmelding' | 'economy_record' | 'rent_warning';
export type CaseDomainId = 'Økonomi/bolig' | 'Dokument' | 'Risiko' | 'Ressurs';
export type CaseCharacterId = 'Frank' | 'Grete' | 'Elling';
export type CaseEvidenceFactId =
  | 'haug_grete_carries_work'
  | 'grete_pays_rent'
  | 'rent_paid_late';
export type CaseHypothesisId = 'grete_carries_economy';

export interface CaseEvidenceAnchor {
  id: CaseEvidenceFactId;
  text: string;
}

export interface CaseDocument {
  id: CaseDocumentId;
  title: string;
  register: string;
  source: string;
  date: string;
  body: Array<string | CaseEvidenceAnchor>;
}

export interface CaseEvidenceFact {
  id: CaseEvidenceFactId;
  sourceDocumentId: CaseDocumentId;
  domain: CaseDomainId;
  shortText: string;
  originalQuote: string;
  category: string;
  discussable_with: CaseCharacterId[];
  contributesTo?: CaseHypothesisId;
  immediateHypothesisId?: CaseHypothesisId;
}

export interface CaseHypothesis {
  id: CaseHypothesisId;
  title: string;
  status: 'Foreløpig';
  assessment: string;
  threshold: number;
  requiredFactIds: CaseEvidenceFactId[];
  discussable_with: CaseCharacterId[];
}

export interface EvidenceToast {
  id: string;
  kind: 'fact' | 'hypothesis';
  title: string;
  body: string;
}

export interface AttemptResult {
  seed: number;
  context: AttemptContext;
  readiness: number;
  outcome: OutcomeId;
  outcomeClass: OutcomeClass;
  beats: VignetteBeat[];
  evidence: EvidenceFact[];
  frankReport: string;
  supportAnalysis: SupportAnalysis;
  nextApproachIds: PhoneApproachId[];
  finalRoom: RoomState;
}
