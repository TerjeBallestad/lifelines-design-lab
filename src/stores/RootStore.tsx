import { createContext, useContext } from 'react';
import { makeAutoObservable } from 'mobx';
import {
  actionOutcomeCopy,
  adjustedDie,
  getActionCard,
  resolveActionOutcome,
} from '../content/actionCards';
import {
  caseDocuments,
  getCaseDocument,
  getCaseFact,
  getCaseHypothesis,
  unlockedHypothesisIds,
} from '../content/evidenceDesk';
import {
  findFrankQuestion,
  frankQuestions,
  type ApartmentEvidenceId,
} from '../content/frankQuestions';
import {
  createInitialSkillProfiles,
  resolveSkillProbe,
  updateProfileSkill,
  type SkillProbeId,
  type SkillProbeResult,
  type SkillProfile,
  type SkillProfileId,
  type SkillId,
} from '../content/skillProfiles';
import type {
  ActionCardId,
  ActionCardResult,
  AttemptResult,
  CaseDocument,
  CaseDocumentId,
  CaseEvidenceFact,
  CaseEvidenceFactId,
  CaseHypothesis,
  CaseHypothesisId,
  ClientState,
  DieFace,
  DiePoolItem,
  EvidenceToast,
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
  readonly random: () => number;

  client: ClientState = {
    overskudd: 0.54,
    trust: 0.42,
    phoneMastery: 0.18,
    ellingState: 'prickly',
  };

  labMode: 'apartment' | 'desk' | 'frank_call' | 'social_visit' = 'desk';
  firstContactReportVisible = false;
  socialVisitReportVisible = false;
  day = 1;
  financialStatementRequested = false;
  financialStatementVisible = false;
  socialVisitScheduled = false;
  noticedApartmentEvidenceIds: ApartmentEvidenceId[] = [];
  apartmentEvidenceIds: ApartmentEvidenceId[] = [];
  askedFrankQuestionIds: string[] = [];
  deskDecisionVisible = false;
  caseLog: string[] = [];
  selectedApproachId: PhoneApproachId = 'none';
  selectedSupportIds: SupportModeId[] = ['practical_help', 'humor_play'];
  frankStance: FrankStance = 'matter_of_fact';
  frankPosition: FrankPosition = 'seated_away';
  scriptState: ScriptState = 'missing';
  dicePool: DiePoolItem[] = makeDicePool();
  selectedDieId = this.dicePool[2]?.id ?? this.dicePool[0].id;
  room: RoomState = { ...startingRoom };
  attempts: AttemptResult[] = [];
  actionResults: ActionCardResult[] = [];
  skillProfiles: SkillProfile[] = createInitialSkillProfiles();
  selectedSkillProfileId: SkillProfileId = 'elling';
  skillProbeResults: SkillProbeResult[] = [];
  selectedActionCardId: ActionCardId = 'get_to_know_elling';
  selectedDeskEvidenceIds: string[] = [];
  activeCaseDocumentId: CaseDocumentId = 'haug_bekymringsmelding';
  liftedCaseFactIds: CaseEvidenceFactId[] = [];
  seenCaseFactIds: CaseEvidenceFactId[] = [];
  seenHypothesisIds: CaseHypothesisId[] = [];
  evidenceToast: EvidenceToast | undefined = undefined;
  evidenceCanvasOpen = false;

  constructor(random: () => number = Math.random) {
    this.random = random;
    makeAutoObservable(this, { random: false }, { autoBind: true });
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

  setLabMode(mode: 'apartment' | 'desk' | 'frank_call' | 'social_visit'): void {
    this.labMode = mode;
  }

  toggleDeskEvidence(id: string): void {
    if (this.selectedDeskEvidenceIds.includes(id)) {
      this.selectedDeskEvidenceIds = this.selectedDeskEvidenceIds.filter((item) => item !== id);
      return;
    }
    this.selectedDeskEvidenceIds = [...this.selectedDeskEvidenceIds, id];
  }

  selectCaseDocument(id: CaseDocumentId): void {
    this.activeCaseDocumentId = id;
  }

  liftCaseFact(id: CaseEvidenceFactId): void {
    if (this.liftedCaseFactIds.includes(id)) return;
    const before = this.unlockedCaseHypothesisIds;
    const fact = getCaseFact(id);
    this.liftedCaseFactIds = [...this.liftedCaseFactIds, id];
    this.seenCaseFactIds = [...this.seenCaseFactIds, id];

    const after = this.unlockedCaseHypothesisIds;
    const newHypothesisId = after.find((hypothesisId) => !before.includes(hypothesisId));
    if (newHypothesisId) {
      const hypothesis = getCaseHypothesis(newHypothesisId);
      this.seenHypothesisIds = [...this.seenHypothesisIds, newHypothesisId];
      this.evidenceToast = {
        id: `hypothesis-${newHypothesisId}-${this.liftedCaseFactIds.length}`,
        kind: 'hypothesis',
        title: 'Arbeidshypotese låst opp',
        body: hypothesis.title,
      };
      return;
    }

    this.evidenceToast = {
      id: `fact-${id}-${this.liftedCaseFactIds.length}`,
      kind: 'fact',
      title: `Faktum lagt til · ${fact.domain}`,
      body: fact.shortText,
    };
  }

  openEvidenceCanvas(): void {
    this.evidenceCanvasOpen = true;
  }

  closeEvidenceCanvas(): void {
    this.evidenceCanvasOpen = false;
  }

  dismissEvidenceToast(): void {
    this.evidenceToast = undefined;
  }

  isCaseFactLifted(id: CaseEvidenceFactId): boolean {
    return this.liftedCaseFactIds.includes(id);
  }

  applyDeskVedtak(id: PhoneApproachId): void {
    this.setApproach(id);
    this.labMode = 'apartment';
  }

  callGreteFromConcernReport(): void {
    this.setApproach('grete_primes_first');
    this.client.trust = Math.min(1, this.client.trust + 0.06);
    this.room.lastFriction = 'Grete still carries the doorway';
    this.labMode = 'frank_call';
  }

  completeGreteCall(): void {
    this.firstContactReportVisible = true;
    this.socialVisitScheduled = true;
    this.caseLog = [...this.caseLog, `Dag ${this.day}: Grete går med på et kort sosialt besøk.`];
    this.labMode = 'desk';
  }

  resolveGreteCallWithSelectedDie(): void {
    if (this.firstContactReportVisible) return;
    const die = this.selectedDie;
    if (!die) return;
    const outcomeClass = resolveActionOutcome(die.face, 0, this.random);

    this.setApproach('grete_primes_first');
    die.used = true;
    this.client.trust = Math.min(
      1,
      this.client.trust + this.trustDeltaForActionOutcome(outcomeClass),
    );
    this.room.lastFriction =
      outcomeClass === 'negative' ? 'Grete still carries the doorway' : 'setup changed';
    this.firstContactReportVisible = true;
    this.socialVisitScheduled = true;
    this.labMode = 'desk';
    this.caseLog = [
      ...this.caseLog,
      `Dag ${this.day}: Ring Grete med terning ${die.face} ga ${actionOutcomeCopy[outcomeClass].toLowerCase()}. Hun går med på et kort sosialt besøk.`,
    ];
    this.selectedDieId = this.dicePool.find((item) => !item.used)?.id ?? this.selectedDieId;
  }

  startSocialVisitWithSelectedDie(): void {
    if (
      !this.socialVisitScheduled ||
      this.socialVisitReportVisible ||
      this.labMode === 'social_visit'
    )
      return;
    const die = this.selectedDie;
    if (!die) return;
    const outcomeClass = resolveActionOutcome(die.face, 0, this.random);

    die.used = true;
    this.room.lastFriction =
      outcomeClass === 'negative'
        ? 'Grete still carries the doorway'
        : 'coffee visit without documents';
    this.caseLog = [
      ...this.caseLog,
      `Dag ${this.day}: Sosialt besøk med terning ${die.face} ga ${actionOutcomeCopy[outcomeClass].toLowerCase()}. Frank får ett blikk i leiligheten.`,
    ];
    this.selectedDieId = this.dicePool.find((item) => !item.used)?.id ?? this.selectedDieId;
    this.labMode = 'social_visit';
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

  selectActionCard(id: ActionCardId): void {
    this.selectedActionCardId = id;
  }

  selectSkillProfile(id: SkillProfileId): void {
    this.selectedSkillProfileId = id;
  }

  runSkillProbe(probeId: SkillProbeId): void {
    const die = this.selectedDie;
    if (!die) return;
    const outcomeClass = resolveActionOutcome(die.face, 0, this.random);
    const result = resolveSkillProbe(probeId, die.face, outcomeClass);

    die.used = true;
    this.skillProbeResults = [...this.skillProbeResults, result];
    for (const [skillId, value] of Object.entries(result.updates)) {
      this.skillProfiles = updateProfileSkill(
        this.skillProfiles,
        'elling',
        skillId as SkillId,
        value,
        result.evidence[0],
      );
    }
    this.caseLog = [
      ...this.caseLog,
      result.tirade
        ? `Dag ${this.day}: ${result.title} ga observasjon og nytt bevis.`
        : `Dag ${this.day}: ${result.title} ga nytt bevis.`,
    ];
    this.selectedDieId = this.dicePool.find((item) => !item.used)?.id ?? this.selectedDieId;
  }

  playSelectedActionCard(): void {
    this.playActionCard(this.selectedActionCardId);
  }

  playActionCard(cardId: ActionCardId): void {
    const die = this.selectedDie;
    if (!die) return;
    const card = getActionCard(cardId);
    const total = adjustedDie(die.face, card.modifier);
    const outcomeClass =
      cardId === 'phone_first_step'
        ? this.resolvePhoneActionViaRoom(die.face)
        : resolveActionOutcome(die.face, card.modifier, this.random);
    const outcome = card.outcomes[outcomeClass];

    die.used = true;
    this.actionResults = [
      ...this.actionResults,
      {
        id: `${cardId}-${this.day}-${this.actionResults.length + 1}`,
        cardId,
        dieFace: die.face,
        adjustedDie: total,
        outcomeClass,
        title: outcome.title,
        text: outcome.text,
      },
    ];
    this.selectedDieId = this.dicePool.find((item) => !item.used)?.id ?? this.selectedDieId;
    this.applyActionOutcome(cardId, outcomeClass);
    this.caseLog = [
      ...this.caseLog,
      `Dag ${this.day}: ${card.title} med terning ${die.face} ga ${outcome.title.toLowerCase()}.`,
    ];
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
    const seed = this.attempts.length + this.day + 7;
    const faces = Array.from(
      { length: 5 },
      (_, index) => (((seed * 11 + index * 7) % 6) + 1) as DieFace,
    );
    this.day += 1;
    if (this.financialStatementRequested && !this.financialStatementVisible) {
      this.financialStatementVisible = true;
      this.financialStatementRequested = false;
      this.caseLog = [
        ...this.caseLog,
        `Dag ${this.day}: økonomisk oversikt kom inn og ligger på pulten.`,
      ];
    } else {
      this.caseLog = [...this.caseLog, `Dag ${this.day}: ny arbeidsdag i saken.`];
    }
    this.dicePool = makeDicePool(faces);
    this.selectedDieId = this.dicePool[0].id;
    this.room.lastFriction = 'new day / fresh capacity';
  }

  requestFinancialStatement(): void {
    if (
      !this.socialVisitReportVisible ||
      this.financialStatementRequested ||
      this.financialStatementVisible
    ) {
      return;
    }
    const die = this.selectedDie;
    if (!die) return;

    die.used = true;
    this.financialStatementRequested = true;
    this.caseLog = [
      ...this.caseLog,
      `Dag ${this.day}: Frank bruker terning ${die.face} på å be Grete finne fram økonomisk oversikt. Den ventes neste dag.`,
    ];
    this.selectedDieId = this.dicePool.find((item) => !item.used)?.id ?? this.selectedDieId;
  }

  scheduleSocialVisit(): void {
    if (!this.firstContactReportVisible || this.socialVisitScheduled) return;
    this.socialVisitScheduled = true;
    this.caseLog = [...this.caseLog, `Dag ${this.day}: sosialt besøk avtales med Grete.`];
  }

  performSocialVisit(): void {
    if (!this.socialVisitScheduled || this.socialVisitReportVisible) return;
    this.labMode = 'social_visit';
  }

  completeSocialVisit(): void {
    if (!this.noticedApartmentEvidenceIds.length) return;
    this.socialVisitReportVisible = true;
    this.room.lastFriction = 'coffee visit without documents';
    this.caseLog = [
      ...this.caseLog,
      `Dag ${this.day}: Frank kommer tilbake med notat fra sosialt besøk.`,
    ];
    this.labMode = 'desk';
  }

  noticeApartmentDetail(id: ApartmentEvidenceId): void {
    if (!this.socialVisitScheduled || this.socialVisitReportVisible) return;
    if (this.noticedApartmentEvidenceIds.length >= 1) return;
    if (this.noticedApartmentEvidenceIds.includes(id)) return;
    const question = frankQuestionsByEvidence[id];
    this.noticedApartmentEvidenceIds = [...this.noticedApartmentEvidenceIds, id];
    this.caseLog = [
      ...this.caseLog,
      `Dag ${this.day}: Du legger merke til “${question.clueLabel}” under besøket.`,
    ];
  }

  askFrank(questionId: string): void {
    if (!this.socialVisitReportVisible || this.askedFrankQuestionIds.includes(questionId)) return;
    const question = findFrankQuestion(questionId);
    if (!question) return;
    if (!this.noticedApartmentEvidenceIds.includes(question.evidenceId)) return;

    this.askedFrankQuestionIds = [...this.askedFrankQuestionIds, questionId];
    if (!this.apartmentEvidenceIds.includes(question.evidenceId)) {
      this.apartmentEvidenceIds = [...this.apartmentEvidenceIds, question.evidenceId];
    }
    if (this.apartmentEvidenceIds.length >= 1) {
      this.deskDecisionVisible = true;
    }
    this.caseLog = [
      ...this.caseLog,
      `Dag ${this.day}: Frank tolker “${question.clueLabel}” og legger til bevis: ${question.evidenceLabel}.`,
    ];
  }

  collectApartmentEvidence(id: ApartmentEvidenceId): void {
    const question = ['post_pressure', 'elling_distance', 'grete_load'].includes(id)
      ? findFrankQuestion(
          {
            post_pressure: 'ask_post_under_paper',
            elling_distance: 'ask_elling_distance',
            grete_load: 'ask_grete_load',
          }[id],
        )
      : undefined;
    if (question) this.askFrank(question.id);
  }

  choosePracticalReliefDecision(): void {
    if (!this.deskDecisionVisible) return;
    this.caseLog = [
      ...this.caseLog,
      `Dag ${this.day}: Frank anbefaler ett praktisk avlastningsgrep før ny telefonøving.`,
    ];
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
    this.selectedDeskEvidenceIds = [];
    this.room = { ...result.finalRoom };
    this.frankPosition = result.finalRoom.frankPosition;
    this.scriptState = result.finalRoom.scriptState;
    this.selectedDieId = this.dicePool.find((item) => !item.used)?.id ?? this.selectedDieId;
    this.applyResultPressure(result);
  }

  chooseNextApproach(id: PhoneApproachId): void {
    this.setApproach(id);
  }

  private resolvePhoneActionViaRoom(dieFace: DieFace): ActionCardResult['outcomeClass'] {
    if (this.selectedApproachId === 'none') this.selectedApproachId = 'tolerate_ringtone';
    const result = resolvePhoneAttempt({
      client: { ...this.client },
      approachId: this.selectedApproachId,
      dieFace,
      frankStance: this.frankStance,
      frankPosition: this.frankPosition,
      scriptState: this.scriptState,
      supportIds: [...this.selectedSupportIds],
      attemptIndex: this.attempts.length + 1,
    });

    this.attempts.push(result);
    this.selectedDeskEvidenceIds = [];
    this.room = { ...result.finalRoom };
    this.frankPosition = result.finalRoom.frankPosition;
    this.scriptState = result.finalRoom.scriptState;
    this.applyResultPressure(result);
    return result.outcomeClass;
  }

  private trustDeltaForActionOutcome(outcomeClass: ActionCardResult['outcomeClass']): number {
    if (outcomeClass === 'positive') return 0.08;
    if (outcomeClass === 'neutral') return 0.04;
    return 0;
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
    this.actionResults = [];
    this.skillProfiles = createInitialSkillProfiles();
    this.selectedSkillProfileId = 'elling';
    this.skillProbeResults = [];
    this.selectedActionCardId = 'get_to_know_elling';
    this.selectedDeskEvidenceIds = [];
    this.labMode = 'desk';
    this.firstContactReportVisible = false;
    this.socialVisitReportVisible = false;
    this.day = 1;
    this.financialStatementRequested = false;
    this.financialStatementVisible = false;
    this.socialVisitScheduled = false;
    this.noticedApartmentEvidenceIds = [];
    this.apartmentEvidenceIds = [];
    this.askedFrankQuestionIds = [];
    this.deskDecisionVisible = false;
    this.caseLog = [];
    this.activeCaseDocumentId = 'haug_bekymringsmelding';
    this.liftedCaseFactIds = [];
    this.seenCaseFactIds = [];
    this.seenHypothesisIds = [];
    this.evidenceToast = undefined;
    this.evidenceCanvasOpen = false;
  }

  get caseDocuments(): CaseDocument[] {
    return caseDocuments;
  }

  get activeCaseDocument(): CaseDocument {
    return getCaseDocument(this.activeCaseDocumentId);
  }

  get liftedCaseFacts(): CaseEvidenceFact[] {
    return this.liftedCaseFactIds.map((id) => getCaseFact(id));
  }

  get unlockedCaseHypothesisIds(): CaseHypothesisId[] {
    return unlockedHypothesisIds(this.liftedCaseFactIds);
  }

  get unlockedCaseHypotheses(): CaseHypothesis[] {
    return this.unlockedCaseHypothesisIds.map((id) => getCaseHypothesis(id));
  }

  get evidenceUnreadCount(): number {
    return Math.max(0, this.seenCaseFactIds.length + this.seenHypothesisIds.length);
  }

  get selectedDie(): DiePoolItem | undefined {
    return this.dicePool.find((item) => item.id === this.selectedDieId && !item.used);
  }

  get latestAttempt(): AttemptResult | undefined {
    return this.attempts.at(-1);
  }

  get latestActionResult(): ActionCardResult | undefined {
    return this.actionResults.at(-1);
  }

  get ellingSkillProfile(): SkillProfile {
    return this.skillProfiles.find((profile) => profile.id === 'elling') ?? this.skillProfiles[0];
  }

  get greteSkillProfile(): SkillProfile {
    return this.skillProfiles.find((profile) => profile.id === 'grete') ?? this.skillProfiles[1];
  }

  get selectedSkillProfile(): SkillProfile {
    return (
      this.skillProfiles.find((profile) => profile.id === this.selectedSkillProfileId) ??
      this.ellingSkillProfile
    );
  }

  get latestSkillProbeResult(): SkillProbeResult | undefined {
    return this.skillProbeResults.at(-1);
  }

  get skillTrainingHintVisible(): boolean {
    return this.skillProbeResults.length > 0;
  }

  get observationTokensRemaining(): number {
    return Math.max(0, 1 - this.noticedApartmentEvidenceIds.length);
  }

  get activeRoom(): RoomState {
    return this.latestAttempt?.finalRoom ?? this.room;
  }

  get phonePracticeClockProgress(): number {
    const attemptProgress = this.attempts.filter(
      (attempt) => attempt.outcomeClass !== 'negative',
    ).length;
    const masteryProgress = Math.floor(this.client.phoneMastery * 3);
    return Math.min(5, attemptProgress + masteryProgress);
  }

  get phoneComplicationClockProgress(): number {
    const completedAttempts = this.attempts.filter(
      (attempt) => attempt.outcome === 'completed_practice',
    ).length;
    const partialAttempts = this.attempts.filter(
      (attempt) => attempt.outcome === 'partial_practice',
    ).length;
    const openLineProgress = completedAttempts * 2 + partialAttempts;
    return Math.min(4, openLineProgress);
  }

  private applyActionOutcome(
    cardId: ActionCardId,
    outcomeClass: ActionCardResult['outcomeClass'],
  ): void {
    if (cardId === 'get_to_know_elling') {
      if (outcomeClass === 'positive') {
        this.client.trust = Math.min(1, this.client.trust + 0.04);
        this.client.overskudd = Math.min(1, this.client.overskudd + 0.02);
      } else if (outcomeClass === 'negative') {
        this.client.overskudd = Math.max(0, this.client.overskudd - 0.05);
        this.room.lastFriction = 'Grete answered for Elling again';
      }
    }

    if (cardId === 'institution_assessment') {
      if (outcomeClass === 'negative') {
        this.client.trust = Math.max(0, this.client.trust - 0.1);
        this.room.doorClosed = true;
        this.room.lastFriction = 'institution track threatened home';
      } else if (outcomeClass === 'positive') {
        this.client.trust = Math.max(0, this.client.trust - 0.03);
      }
    }
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

const frankQuestionsByEvidence = Object.fromEntries(
  frankQuestions.map((question) => [question.evidenceId, question]),
) as Record<ApartmentEvidenceId, NonNullable<ReturnType<typeof findFrankQuestion>>>;

export const rootStore = new RootStore();
export const StoreContext = createContext<RootStore>(rootStore);
export function useRootStore(): RootStore {
  return useContext(StoreContext);
}
