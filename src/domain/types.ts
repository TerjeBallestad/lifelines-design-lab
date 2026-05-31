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
