export type DieFace = 1 | 2 | 3 | 4 | 5 | 6;

export type EllingState = 'calm' | 'tired' | 'prickly';
export type FrankStance = 'soft' | 'matter_of_fact' | 'pushy';
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
  anchor: 'phone' | 'sofa' | 'bedroom' | 'desk';
  description: string;
  pressure: number;
}

export interface Approach {
  id: PhoneApproachId;
  label: string;
  description: string;
  trustDelta: number;
  controlDelta: number;
  pressureDelta: number;
}

export interface AttemptContext {
  client: ClientState;
  approachId: PhoneApproachId;
  frankStance: FrankStance;
  dieFace: DieFace;
  attemptIndex: number;
}

export interface VignetteBeat {
  id: string;
  actor: 'Frank' | 'Elling' | 'Phone' | 'Room';
  label: string;
  text: string;
  anchor: StateObject['anchor'];
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
  nextApproachIds: PhoneApproachId[];
}
