import { describe, expect, it } from 'vitest';
import { blueprintDocuments } from '../../content/blueprint';
import { BlueprintStore } from '../../stores/BlueprintStore';
import {
  createBlueprintProgress,
  dispatchAvailable,
  liftBlueprintFact,
  questionStateLabel,
  receiveBlueprintDocument,
  runBlueprintDispatch,
  tiltakAvailability,
} from './blueprintEngine';

describe('Blueprint v1 caseworker loop', () => {
  it('starts on the desk with the frozen prototype represented as typed authored document runs', () => {
    const store = new BlueprintStore();
    expect(store.progress.phase).toBe('prologue');

    store.startCase();

    expect(store.progress.phase).toBe('play');
    expect(store.progress.documents.doc_bekymring).toBeDefined();
    expect(
      blueprintDocuments.doc_bekymring.blocks.some((block) => block.runs.some((run) => run.factId)),
    ).toBe(true);
  });

  it('lifts facts into Sakens fakta and opens authored questions', () => {
    const progress = createBlueprintProgress();
    receiveBlueprintDocument(progress, 'doc_bekymring');

    const first = liftBlueprintFact(progress, 'f_grete_baerer');
    expect(first?.fact.text).toContain('Grete bistår');
    expect(progress.facts.f_grete_baerer).toBeDefined();
    expect(progress.unreadFacts).toBe(1);
    expect(first?.newQuestionIds).toEqual(expect.arrayContaining(['q_hverdag', 'q_okonomi']));
    expect(questionStateLabel(progress, 'q_hverdag')).toBe('Åpent');
  });

  it('gates hypothesis selection until required facts are lifted, then makes tiltak available', () => {
    const store = new BlueprintStore();
    store.startCase();
    store.liftFact('f_trygd');
    store.liftFact('f_husleie');
    store.liftFact('f_gap');

    expect(store.progress.questions.q_okonomi).toBeDefined();
    expect(store.hypothesisAvailable('q_okonomi', 'h_ok_gap')).toBe(true);
    expect(store.progress.questions.q_okonomi.hypothesisId).toBeNull();
    expect(store.tiltakAvailability('t_bostotte').ok).toBe(false);

    store.selectHypothesis('q_okonomi', 'h_ok_gap');

    expect(store.progress.questions.q_okonomi.hypothesisId).toBe('h_ok_gap');
    expect(store.tiltakAvailability('t_bostotte').ok).toBe(true);
  });

  it('keeps tiltak locked when facts, visit, or arbeidshypotese are missing', () => {
    const progress = createBlueprintProgress();
    liftBlueprintFact(progress, 'f_post');

    const availability = tiltakAvailability(progress, 't_brev');

    expect(availability.ok).toBe(false);
    expect(availability.why).toContain('hjemmebesøk');
  });

  it('gates Frank dispatch and delivers pending documents on day advancement', () => {
    const progress = createBlueprintProgress();
    progress.phase = 'play';
    receiveBlueprintDocument(progress, 'doc_bekymring');

    expect(dispatchAvailable(progress, 'd_besok')).toBe(false);

    const phone = runBlueprintDispatch(progress, 'd_ring_grete');

    expect(phone?.toasts[0].text).toContain('telefonsamtale');
    expect(progress.documents.doc_frank_tlf).toBeDefined();
    expect(dispatchAvailable(progress, 'd_besok')).toBe(true);

    const visit = runBlueprintDispatch(progress, 'd_besok');
    expect(visit?.toasts[0].text).toContain('Besøksrapport');
    expect(progress.pending).toEqual([{ day: 2, documentId: 'doc_frank_visit' }]);

    const store = new BlueprintStore();
    store.progress = progress;
    store.advanceDay();

    expect(store.progress.day).toBe(2);
    expect(store.progress.documents.doc_frank_visit).toBeDefined();
    expect(store.progress.sim.visitLevel).toBe(1);
  });

  it('gates Frank chat by lifted facts and can lift facts from Frank answers', () => {
    const store = new BlueprintStore();
    store.startCase();

    expect(store.askableFrankPrompts.some((prompt) => prompt.id === 'c_avstand')).toBe(false);

    store.liftFact('f_avstand');

    expect(store.askableFrankPrompts.some((prompt) => prompt.id === 'c_avstand')).toBe(true);
    store.askFrank('c_avstand');
    expect(store.progress.chatLog.at(-1)?.who).toBe('Frank');

    store.liftFact('f_dor_glott');
    expect(store.progress.facts.f_dor_glott).toBeDefined();
    expect(store.progress.questions.q_kontakt).toBeDefined();
  });

  it('advances through the scripted Grete unavailable and death beats', () => {
    const store = new BlueprintStore();
    store.startCase();

    store.advanceDay();
    store.advanceDay();
    store.advanceDay();

    expect(store.progress.day).toBe(4);
    expect(store.progress.greteStage).toBe(4);
    expect(store.progress.documents.doc_innleggelse).toBeDefined();
    expect(store.notices.some((notice) => notice.text === 'Grete er innlagt.')).toBe(true);

    store.advanceDay();

    expect(store.progress.day).toBe(5);
    expect(store.progress.greteStage).toBe(5);
    expect(store.progress.documents.doc_dodsfall).toBeDefined();
    expect(store.progress.questions.q_kollaps).toBeDefined();
    expect(store.notices.some((notice) => notice.text === 'Grete Olsen er død.')).toBe(true);
  });

  it('can draft and enact a three-slot package, then reach final reflection/status', () => {
    const store = new BlueprintStore();
    store.startCase();
    for (const factId of [
      'f_grete_baerer',
      'f_kalender',
      'f_matbokser',
      'f_post',
      'f_bok',
      'f_trygd',
      'f_husleie',
      'f_gap',
      'f_alt_via_grete',
      'f_avstand',
      'f_elling_tlf',
      'f_saarbar',
    ]) {
      store.liftFact(factId);
    }
    receiveBlueprintDocument(store.progress, 'doc_frank_visit');
    store.progress.sim.visitLevel = 1;

    store.selectHypothesis('q_okonomi', 'h_ok_grete');
    store.selectHypothesis('q_bolig', 'h_b_sikres');
    store.selectHypothesis('q_hverdag', 'h_h_infra');
    store.selectHypothesis('q_selv', 'h_s_trenbar');
    store.selectHypothesis('q_kontakt', 'h_k_oppmote');

    store.toggleDraftTiltak('t_forvaltning');
    store.toggleDraftTiltak('t_hjemmehjelp');
    store.toggleDraftTiltak('t_brev');
    store.toggleDraftTiltak('t_institusjon');
    store.enactTiltak();

    expect(store.progress.enactedTiltakIds).toEqual([
      't_forvaltning',
      't_hjemmehjelp',
      't_brev',
      't_institusjon',
    ]);
    expect(store.progress.documents.doc_vedtak_1).toBeDefined();
    expect(store.progress.vedtakRecords[0]).toMatchObject({
      documentId: 'doc_vedtak_1',
      number: 1,
      title: 'Vedtak 1 · tiltakspakke',
      peek: 'Tiltak og arbeidshypoteser lagt til grunn.',
      meta: 'DAG 1 · OSLO KOMMUNE',
      stampText: 'IVERKSATT · følges opp gjennom Frank og sakens videre dokumenter.',
    });
    const vedtak = store.documentById('doc_vedtak_1');
    const vedtakText = vedtak.blocks
      .map((block) => block.runs.map((run) => run.text).join(' '))
      .join(' ');
    expect(vedtak.title).toBe('Vedtak 1 · tiltakspakke');
    expect(vedtakText).toContain('Arbeidshypotese lagt til grunn');
    expect(vedtakText).toContain('Frivillig forvaltning');
    expect(vedtakText).toContain('IVERKSATT');
    expect(store.activeSurface).toBe('pulten');

    while (store.progress.phase !== 'ended') {
      store.advanceDay();
    }

    expect(store.progress.documents.doc_status).toBeDefined();
    expect(store.progress.endText?.closing).toBeTruthy();
    expect(store.reflectionVisible).toBe(true);
  });

  it('logs the empty-fridge beat when food boxes run out', () => {
    const store = new BlueprintStore();
    store.startCase();
    store.progress.day = 5;
    store.progress.greteStage = 5;
    store.progress.sim.foodBoxes = 1;

    store.advanceDay();

    expect(store.progress.sim.log.some((entry) => entry.text.includes('Kjøleskapet: lyset'))).toBe(
      true,
    );
  });
});
