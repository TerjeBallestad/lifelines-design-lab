import { createContext, useContext } from 'react';
import { makeAutoObservable } from 'mobx';
import type {
  AttemptResult,
  ClientState,
  DieFace,
  DiePoolItem,
  FrankPosition,
  FrankStance,
  PhoneApproachId,
  RoomState,
  ScriptState,
  SupportModeId,
} from '../domain/types';
import { resolvePhoneAttempt } from '../engine/phoneResolver';

const startingDice: DieFace[] = [2, 1, 4, 3, 2];

function makeDicePool(faces: DieFace[] = startingDice): DiePoolItem[] {
  return faces.map((face, index) => ({ id: `die-${index + 1}-${face}`, face, used: false }));
}

const startingRoom: RoomState = {
  ellingPosition: 'chair',
  frankPosition: 'seated_away',
  scriptState: 'missing',
  doorClosed: false,
  lastFriction: 'unknown',
};

export class RootStore {
  client: ClientState = {
    overskudd: 0.54,
    trust: 0.42,
    phoneMastery: 0.18,
    ellingState: 'prickly',
  };

  selectedApproachId: PhoneApproachId = 'none';
  selectedSupportIds: SupportModeId[] = ['practical_help', 'humor_play'];
  frankStance: FrankStance = 'matter_of_fact';
  frankPosition: FrankPosition = 'seated_away';
  scriptState: ScriptState = 'missing';
  dicePool: DiePoolItem[] = makeDicePool();
  selectedDieId = this.dicePool[2]?.id ?? this.dicePool[0].id;
  room: RoomState = { ...startingRoom };
  attempts: AttemptResult[] = [];

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  toggleSupport(id: SupportModeId): void {
    if (this.selectedSupportIds.includes(id)) {
      if (this.selectedSupportIds.length > 1) {
        this.selectedSupportIds = this.selectedSupportIds.filter((item) => item !== id);
      }
      return;
    }
    this.selectedSupportIds = [...this.selectedSupportIds.slice(-1), id];
  }

  setApproach(id: PhoneApproachId): void {
    this.selectedApproachId = id;
    if (id === 'written_script' && this.scriptState === 'missing') {
      this.placeScript();
    }
  }

  selectDie(id: string): void {
    const die = this.dicePool.find((item) => item.id === id && !item.used);
    if (die) this.selectedDieId = id;
  }

  setFrankStance(stance: FrankStance): void {
    this.frankStance = stance;
  }

  setFrankPosition(position: FrankPosition): void {
    this.frankPosition = position;
    this.room.frankPosition = position;
    this.room.lastFriction = position === 'near_phone' ? 'Frank too close?' : 'setup changed';
  }

  placeScript(): void {
    if (this.scriptState === 'used') return;
    this.scriptState = 'placed';
    this.room.scriptState = 'placed';
    this.room.lastFriction = 'script support visible';
  }

  rollNewDay(): void {
    const seed = this.attempts.length + 7;
    const faces = Array.from(
      { length: 5 },
      (_, index) => (((seed * 11 + index * 7) % 6) + 1) as DieFace,
    );
    this.dicePool = makeDicePool(faces);
    this.selectedDieId = this.dicePool[0].id;
    this.room.lastFriction = 'new day / fresh capacity';
  }

  runAttempt(): void {
    const die = this.selectedDie;
    if (!die) return;

    const result = resolvePhoneAttempt({
      client: { ...this.client },
      approachId: this.selectedApproachId,
      dieFace: die.face,
      frankStance: this.frankStance,
      frankPosition: this.frankPosition,
      scriptState: this.scriptState,
      supportIds: [...this.selectedSupportIds],
      attemptIndex: this.attempts.length + 1,
    });

    die.used = true;
    this.attempts.push(result);
    this.room = { ...result.finalRoom };
    this.frankPosition = result.finalRoom.frankPosition;
    this.scriptState = result.finalRoom.scriptState;
    this.selectedDieId = this.dicePool.find((item) => !item.used)?.id ?? this.selectedDieId;
    this.applyResultPressure(result);
  }

  chooseNextApproach(id: PhoneApproachId): void {
    this.setApproach(id);
  }

  reset(): void {
    this.client = { overskudd: 0.54, trust: 0.42, phoneMastery: 0.18, ellingState: 'prickly' };
    this.selectedApproachId = 'none';
    this.selectedSupportIds = ['practical_help', 'humor_play'];
    this.frankStance = 'matter_of_fact';
    this.frankPosition = 'seated_away';
    this.scriptState = 'missing';
    this.dicePool = makeDicePool();
    this.selectedDieId = this.dicePool[2]?.id ?? this.dicePool[0].id;
    this.room = { ...startingRoom };
    this.attempts = [];
  }

  get selectedDie(): DiePoolItem | undefined {
    return this.dicePool.find((item) => item.id === this.selectedDieId && !item.used);
  }

  get latestAttempt(): AttemptResult | undefined {
    return this.attempts.at(-1);
  }

  get activeRoom(): RoomState {
    return this.latestAttempt?.finalRoom ?? this.room;
  }

  private applyResultPressure(result: AttemptResult): void {
    if (result.outcomeClass === 'positive') {
      this.client.phoneMastery = Math.min(1, this.client.phoneMastery + 0.08);
      this.client.trust = Math.min(1, this.client.trust + 0.03);
      this.client.ellingState = 'calm';
    } else if (result.outcome === 'anger_retreat') {
      this.client.trust = Math.max(0, this.client.trust - 0.08);
      this.client.ellingState = 'prickly';
    } else if (result.outcomeClass === 'neutral') {
      this.client.phoneMastery = Math.min(1, this.client.phoneMastery + 0.03);
      this.client.ellingState = 'tired';
    } else {
      this.client.overskudd = Math.max(0, this.client.overskudd - 0.06);
      this.client.ellingState = 'tired';
    }
  }
}

export const rootStore = new RootStore();
export const StoreContext = createContext<RootStore>(rootStore);
export function useRootStore(): RootStore {
  return useContext(StoreContext);
}
