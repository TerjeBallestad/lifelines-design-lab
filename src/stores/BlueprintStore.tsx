import { makeAutoObservable } from 'mobx';
import {
  blueprintChat,
  blueprintDispatches,
  blueprintDocuments,
  blueprintDomains,
  blueprintFacts,
  blueprintQuestions,
  blueprintSlotLabels,
  blueprintTiltak,
} from '../content/blueprint';
import type {
  BlueprintChatPrompt,
  BlueprintDispatch,
  BlueprintDocument,
  BlueprintDocumentId,
  BlueprintDomain,
  BlueprintFact,
  BlueprintFactId,
  BlueprintHypothesisId,
  BlueprintProgress,
  BlueprintQuestion,
  BlueprintQuestionId,
  BlueprintSurface,
  BlueprintTiltak,
  BlueprintTiltakId,
} from '../domain/blueprint';
import {
  advanceBlueprintDay,
  askBlueprintFrank,
  availableDispatchIds,
  chooseBlueprintHypothesis,
  clearFreshFacts,
  createBlueprintProgress,
  draftCost,
  enactBlueprintTiltak,
  factsForQuestion,
  liftBlueprintFact,
  questionStateLabel,
  receiveBlueprintDocument,
  runBlueprintDispatch,
  spentCost,
  statusDocumentBlocks,
  tiltakAvailability,
  toggleBlueprintDraft,
  vedtakDocumentBlocks,
} from '../engine/blueprint/blueprintEngine';

export interface BlueprintNotice {
  id: string;
  tag: string;
  text: string;
  kind?: 'fact' | 'hypothesis' | 'day';
}

export class BlueprintStore {
  progress: BlueprintProgress = createBlueprintProgress();
  activeSurface: BlueprintSurface = 'pulten';
  prologueIndex = 1;
  openDocumentId: BlueprintDocumentId | null = null;
  selectedFactId: BlueprintFactId | null = null;
  notices: BlueprintNotice[] = [];
  reflectionVisible = false;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  resetBlueprint(): void {
    this.progress = createBlueprintProgress();
    this.activeSurface = 'pulten';
    this.prologueIndex = 1;
    this.openDocumentId = null;
    this.selectedFactId = null;
    this.notices = [];
    this.reflectionVisible = false;
  }

  advancePrologue(): void {
    this.prologueIndex += 1;
  }

  startCase(): void {
    this.progress.phase = 'play';
    receiveBlueprintDocument(this.progress, 'doc_bekymring');
    this.activeSurface = 'pulten';
    this.openDocumentId = null;
    this.addNotice('MOTTATT · SOSIALKONTORET', 'Meldingen ligger på pulten din.', 'day');
  }

  showSurface(surface: BlueprintSurface): void {
    this.activeSurface = surface;
    if (surface === 'fakta') clearFreshFacts(this.progress);
  }

  openDocument(documentId: BlueprintDocumentId): void {
    if (!this.progress.documents[documentId]) return;
    this.progress.documents[documentId].read = true;
    this.progress.documents[documentId].isNew = false;
    this.openDocumentId = documentId;
  }

  closeDocument(): void {
    this.openDocumentId = null;
  }

  liftFact(factId: BlueprintFactId): void {
    const result = liftBlueprintFact(this.progress, factId);
    if (!result) return;
    this.addNotice(`FAKTUM LAGT TIL · ${result.fact.domain}`, result.fact.text, 'fact');
    for (const questionId of result.newQuestionIds) {
      this.addNotice('ÅPENT SPØRSMÅL', blueprintQuestions[questionId].title, 'hypothesis');
    }
  }

  selectFact(factId: BlueprintFactId): void {
    if (this.progress.facts[factId]) this.selectedFactId = factId;
  }

  closeFact(): void {
    this.selectedFactId = null;
  }

  selectHypothesis(questionId: BlueprintQuestionId, hypothesisId: BlueprintHypothesisId): void {
    const before = this.progress.questions[questionId]?.hypothesisId;
    const changed = chooseBlueprintHypothesis(this.progress, questionId, hypothesisId);
    if (!changed) return;
    const after = this.progress.questions[questionId]?.hypothesisId;
    if (after && after !== before) {
      const hypothesis = blueprintQuestions[questionId].hypotheses.find(
        (item) => item.id === hypothesisId,
      );
      if (hypothesis) this.addNotice('ARBEIDSHYPOTESE NOTERT', hypothesis.label, 'hypothesis');
    }
  }

  toggleDraftTiltak(tiltakId: BlueprintTiltakId): void {
    const changed = toggleBlueprintDraft(this.progress, tiltakId);
    if (!changed) {
      const availability = tiltakAvailability(this.progress, tiltakId);
      this.addNotice(
        'TILTAK LÅST',
        availability.why ?? 'Tiltaket kan ikke velges nå.',
        'hypothesis',
      );
    }
  }

  enactTiltak(): void {
    const chosen = enactBlueprintTiltak(this.progress);
    if (!chosen.length) return;
    const vedtakRecord = this.progress.vedtakRecords.at(-1);
    this.addNotice(
      'VEDTAK FATTET',
      vedtakRecord?.title ?? `${chosen.length} tiltak iverksettes fra i morgen.`,
      'hypothesis',
    );
    this.activeSurface = 'pulten';
    this.openDocumentId = null;
  }

  runDispatch(dispatchId: string): void {
    const outcome = runBlueprintDispatch(this.progress, dispatchId);
    if (!outcome) return;
    for (const toast of outcome.toasts) {
      this.addNotice(toast.tag, toast.text, toast.kind);
    }
  }

  askFrank(chatId: string): void {
    const asked = askBlueprintFrank(this.progress, chatId);
    if (!asked) return;
    const prompt = blueprintChat.find((item) => item.id === chatId);
    if (prompt) this.addNotice('FRANK SVARER', prompt.question);
  }

  advanceDay(): void {
    const outcome = advanceBlueprintDay(this.progress);
    for (const toast of outcome.toasts) {
      this.addNotice(toast.tag, toast.text, toast.kind);
    }
    if (this.progress.phase === 'ended') {
      this.reflectionVisible = true;
      this.activeSurface = 'pulten';
    }
  }

  dismissNotice(id: string): void {
    this.notices = this.notices.filter((notice) => notice.id !== id);
  }

  followNotice(notice: BlueprintNotice): void {
    if (notice.kind) {
      this.openDocumentId = null;
      this.selectedFactId = null;
    }
    if (notice.kind === 'fact') this.showSurface('fakta');
    if (notice.kind === 'hypothesis') this.showSurface('sporsmal');
    if (notice.kind === 'day') this.showSurface('pulten');
    this.dismissNotice(notice.id);
  }

  closeReflection(): void {
    this.reflectionVisible = false;
  }

  get documentEntries(): Array<{
    id: BlueprintDocumentId;
    document: BlueprintDocument;
    state: BlueprintProgress['documents'][string];
  }> {
    return Object.entries(this.progress.documents).map(([id, state]) => ({
      id,
      document: this.documentById(id),
      state,
    }));
  }

  get currentDocument(): BlueprintDocument | undefined {
    return this.openDocumentId ? this.documentById(this.openDocumentId) : undefined;
  }

  get selectedFact(): BlueprintFact | undefined {
    return this.selectedFactId ? blueprintFacts[this.selectedFactId] : undefined;
  }

  get factsByDomain(): Array<{ domain: BlueprintDomain; facts: BlueprintFact[] }> {
    return blueprintDomains.map((domain) => ({
      domain,
      facts: Object.keys(this.progress.facts)
        .map((factId) => blueprintFacts[factId])
        .filter((fact): fact is BlueprintFact => Boolean(fact) && fact.domain === domain),
    }));
  }

  get visibleQuestions(): Array<{ id: string; question: BlueprintQuestion }> {
    return Object.keys(this.progress.questions)
      .map((id) => ({ id, question: blueprintQuestions[id] }))
      .filter((entry): entry is { id: string; question: BlueprintQuestion } =>
        Boolean(entry.question),
      );
  }

  get availableDispatches(): BlueprintDispatch[] {
    return availableDispatchIds(this.progress).map((id) => blueprintDispatches[id]);
  }

  get askableFrankPrompts(): BlueprintChatPrompt[] {
    return blueprintChat.filter(
      (prompt) =>
        this.progress.facts[prompt.needs] && !this.progress.askedChatIds.includes(prompt.id),
    );
  }

  get spentCost(): number {
    return spentCost(this.progress);
  }

  get draftCost(): number {
    return draftCost(this.progress);
  }

  get selectedTiltak(): BlueprintTiltak[] {
    return this.progress.enactedTiltakIds.map((id) => blueprintTiltak[id]).filter(Boolean);
  }

  documentById(documentId: BlueprintDocumentId): BlueprintDocument {
    if (documentId.startsWith('doc_vedtak_')) {
      const record = this.progress.vedtakRecords.find((item) => item.documentId === documentId);
      if (record) {
        return {
          id: documentId,
          kind: 'VEDTAK',
          title: record.title,
          register: 'vedtak',
          peek: record.peek,
          meta: record.meta,
          blocks: vedtakDocumentBlocks(record),
        };
      }
    }
    if (documentId === 'doc_status') {
      return {
        id: 'doc_status',
        kind: 'STATUSRAPPORT',
        title: 'Frank · status dag 8',
        register: 'notat',
        peek: 'En uke siden meldingen.',
        meta: 'DAG 8 · SAKEN FORTSETTER',
        blocks: statusDocumentBlocks(this.progress.endText).map((text, index) => ({
          id: `status-${index}`,
          runs: [{ text }],
        })),
      };
    }
    return blueprintDocuments[documentId];
  }

  factsForQuestion(questionId: BlueprintQuestionId): BlueprintFact[] {
    return factsForQuestion(this.progress, questionId).map((factId) => blueprintFacts[factId]);
  }

  questionStateLabel(questionId: BlueprintQuestionId): string {
    return questionStateLabel(this.progress, questionId);
  }

  hypothesisAvailable(
    questionId: BlueprintQuestionId,
    hypothesisId: BlueprintHypothesisId,
  ): boolean {
    const hypothesis = blueprintQuestions[questionId]?.hypotheses.find(
      (item) => item.id === hypothesisId,
    );
    if (!hypothesis) return false;
    return hypothesis.needs.every((factId) => Boolean(this.progress.facts[factId]));
  }

  tiltakAvailability(tiltakId: BlueprintTiltakId) {
    return tiltakAvailability(this.progress, tiltakId);
  }

  evidenceCount(document: BlueprintDocument): { total: number; lifted: number } {
    const factIds = document.blocks.flatMap((block) =>
      block.runs.flatMap((run) => (run.factId ? [run.factId] : [])),
    );
    return {
      total: factIds.length,
      lifted: factIds.filter((factId) => this.progress.facts[factId]).length,
    };
  }

  slotLabel(slot: string): string {
    return blueprintSlotLabels[slot as keyof typeof blueprintSlotLabels] ?? slot;
  }

  private addNotice(tag: string, text: string, kind?: BlueprintNotice['kind']): void {
    this.notices = [
      {
        id: `${Date.now()}-${this.notices.length}-${tag}`,
        tag,
        text,
        kind: kind ?? (tag.includes('PULTEN') || tag.startsWith('DAG ') ? 'day' : undefined),
      },
      ...this.notices,
    ].slice(0, 4);
  }
}
