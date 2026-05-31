import { createContext, useContext } from 'react';
import { makeAutoObservable } from 'mobx';
import type {
  AttemptResult,
  ClientState,
  DieFace,
  FrankStance,
  PhoneApproachId,
} from '../domain/types';
import { resolvePhoneAttempt } from '../engine/phoneResolver';

export class RootStore {
  client: ClientState = {
    overskudd: 0.54,
    trust: 0.42,
    phoneMastery: 0.18,
    ellingState: 'prickly',
  };

  selectedApproachId: PhoneApproachId = 'none';
  selectedDieFace: DieFace = 4;
  frankStance: FrankStance = 'matter_of_fact';
  attempts: AttemptResult[] = [];

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  setApproach(id: PhoneApproachId): void {
    this.selectedApproachId = id;
  }

  setDieFace(face: DieFace): void {
    this.selectedDieFace = face;
  }

  setFrankStance(stance: FrankStance): void {
    this.frankStance = stance;
  }

  runAttempt(): void {
    const result = resolvePhoneAttempt({
      client: { ...this.client },
      approachId: this.selectedApproachId,
      dieFace: this.selectedDieFace,
      frankStance: this.frankStance,
      attemptIndex: this.attempts.length + 1,
    });
    this.attempts.push(result);
    this.applyResultPressure(result);
  }

  chooseNextApproach(id: PhoneApproachId): void {
    this.selectedApproachId = id;
  }

  reset(): void {
    this.client = { overskudd: 0.54, trust: 0.42, phoneMastery: 0.18, ellingState: 'prickly' };
    this.selectedApproachId = 'none';
    this.selectedDieFace = 4;
    this.frankStance = 'matter_of_fact';
    this.attempts = [];
  }

  get latestAttempt(): AttemptResult | undefined {
    return this.attempts.at(-1);
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
