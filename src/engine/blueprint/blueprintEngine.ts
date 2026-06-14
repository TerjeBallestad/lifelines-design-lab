import {
  blueprintChat,
  blueprintDayName,
  blueprintDispatches,
  blueprintDocuments,
  blueprintFacts,
  blueprintFlavor,
  blueprintQuestions,
  blueprintTiltak,
} from '../../content/blueprint';
import type {
  BlueprintAvailability,
  BlueprintChatId,
  BlueprintDispatchId,
  BlueprintDispatchOutcome,
  BlueprintDocumentId,
  BlueprintEndText,
  BlueprintFactId,
  BlueprintFactLiftResult,
  BlueprintHypothesis,
  BlueprintHypothesisId,
  BlueprintProgress,
  BlueprintQuestionId,
  BlueprintTiltakId,
} from '../../domain/blueprint';

export function createBlueprintProgress(): BlueprintProgress {
  return {
    day: 1,
    actions: 2,
    phase: 'prologue',
    greteStage: 1,
    documents: {},
    pending: [],
    facts: {},
    unreadFacts: 0,
    questions: {},
    chatLog: [],
    askedChatIds: [],
    dispatchedIds: [],
    draftTiltakIds: [],
    enactedTiltakIds: [],
    vedtakCount: 0,
    vedtakRecords: [],
    clocks: {
      ck_bostotte: { good: 0, bad: 0, done: false, failed: false },
      ck_overfort: { good: 0, bad: 0 },
      ck_rutine: { good: 0, bad: 0 },
      ck_restanse: { good: 0, bad: 0 },
    },
    sim: {
      needs: { hunger: 72, energy: 64, social: 30, security: 55 },
      foodBoxes: 7,
      mail: 9,
      unanswered: 2,
      doorOpened: false,
      visitLevel: 0,
      log: [],
      flavorIndex: 0,
      tiradeLogged: false,
      forvaltningLogged: false,
      institutionLogged: false,
    },
  };
}

export function receiveBlueprintDocument(
  progress: BlueprintProgress,
  documentId: BlueprintDocumentId,
): boolean {
  if (progress.documents[documentId]) return false;
  progress.documents[documentId] = { day: progress.day, read: false, isNew: true };
  return true;
}

export function liftBlueprintFact(
  progress: BlueprintProgress,
  factId: BlueprintFactId,
): BlueprintFactLiftResult | null {
  const fact = blueprintFacts[factId];
  if (!fact || progress.facts[factId]) return null;

  progress.facts[factId] = { day: progress.day, fresh: true };
  progress.unreadFacts += 1;
  const newQuestionIds: BlueprintQuestionId[] = [];

  for (const [questionId, question] of Object.entries(blueprintQuestions)) {
    if (!progress.questions[questionId] && question.appearsOn.includes(factId)) {
      progress.questions[questionId] = { visible: true, hypothesisId: null };
      newQuestionIds.push(questionId);
    }
  }

  return { fact, newQuestionIds };
}

export function factsForQuestion(
  progress: BlueprintProgress,
  questionId: BlueprintQuestionId,
): BlueprintFactId[] {
  return Object.keys(progress.facts).filter((factId) =>
    blueprintFacts[factId]?.supports.includes(questionId),
  );
}

export function questionStateLabel(
  progress: BlueprintProgress,
  questionId: BlueprintQuestionId,
): string {
  const question = progress.questions[questionId];
  if (!question) return 'Skjult';
  if (question.hypothesisId) return 'Foreløpig arbeidssvar';
  return factsForQuestion(progress, questionId).length >= 2 ? 'Delvis belyst' : 'Åpent';
}

export function hypothesisAvailable(
  progress: BlueprintProgress,
  hypothesis: BlueprintHypothesis,
): boolean {
  return hypothesis.needs.every((factId) => Boolean(progress.facts[factId]));
}

export function chooseBlueprintHypothesis(
  progress: BlueprintProgress,
  questionId: BlueprintQuestionId,
  hypothesisId: BlueprintHypothesisId,
): boolean {
  const question = blueprintQuestions[questionId];
  const questionState = progress.questions[questionId];
  const hypothesis = question?.hypotheses.find((item) => item.id === hypothesisId);
  if (!question || !questionState || !hypothesis || !hypothesisAvailable(progress, hypothesis)) {
    return false;
  }

  questionState.hypothesisId = questionState.hypothesisId === hypothesisId ? null : hypothesisId;
  return true;
}

export function chosenHypotheses(progress: BlueprintProgress): BlueprintHypothesis[] {
  return Object.entries(progress.questions)
    .map(([questionId, questionState]) => {
      if (!questionState.hypothesisId) return undefined;
      return blueprintQuestions[questionId]?.hypotheses.find(
        (hypothesis) => hypothesis.id === questionState.hypothesisId,
      );
    })
    .filter((hypothesis): hypothesis is BlueprintHypothesis => Boolean(hypothesis));
}

export function hypothesisChosen(
  progress: BlueprintProgress,
  hypothesisId: BlueprintHypothesisId,
): boolean {
  return chosenHypotheses(progress).some((hypothesis) => hypothesis.id === hypothesisId);
}

export function spentCost(progress: BlueprintProgress): number {
  return progress.enactedTiltakIds.reduce(
    (sum, tiltakId) => sum + (blueprintTiltak[tiltakId]?.cost ?? 0),
    0,
  );
}

export function draftCost(progress: BlueprintProgress): number {
  return progress.draftTiltakIds.reduce(
    (sum, tiltakId) => sum + (blueprintTiltak[tiltakId]?.cost ?? 0),
    0,
  );
}

export function tiltakAvailability(
  progress: BlueprintProgress,
  tiltakId: BlueprintTiltakId,
): BlueprintAvailability {
  const tiltak = blueprintTiltak[tiltakId];
  if (!tiltak) return { ok: false, why: 'ukjent tiltak' };
  if (progress.enactedTiltakIds.includes(tiltakId)) return { ok: false, why: 'iverksatt' };
  if (!tiltak.needs.every((factId) => progress.facts[factId])) {
    return { ok: false, why: 'mangler grunnlag i sakens fakta' };
  }
  if (tiltak.needsVisit && !progress.documents.doc_frank_visit) {
    return { ok: false, why: 'krever gjennomført hjemmebesøk' };
  }
  if (
    tiltak.needsHypothesis &&
    !tiltak.needsHypothesis.some((hypothesisId) => hypothesisChosen(progress, hypothesisId))
  ) {
    const questionTitle = Object.values(blueprintQuestions).find((question) =>
      question.hypotheses.some((hypothesis) => tiltak.needsHypothesis?.includes(hypothesis.id)),
    )?.title;
    return {
      ok: false,
      why: `krever arbeidshypotese${questionTitle ? ` under «${questionTitle}»` : ''}`,
    };
  }
  return { ok: true };
}

export function toggleBlueprintDraft(
  progress: BlueprintProgress,
  tiltakId: BlueprintTiltakId,
): boolean {
  const existing = progress.draftTiltakIds.indexOf(tiltakId);
  if (existing >= 0) {
    progress.draftTiltakIds.splice(existing, 1);
    return true;
  }

  const availability = tiltakAvailability(progress, tiltakId);
  if (!availability.ok) return false;
  const nextCost =
    spentCost(progress) + draftCost(progress) + (blueprintTiltak[tiltakId]?.cost ?? 0);
  if (nextCost > 6) return false;
  progress.draftTiltakIds.push(tiltakId);
  return true;
}

export function enactBlueprintTiltak(progress: BlueprintProgress): BlueprintTiltakId[] {
  if (!progress.draftTiltakIds.length || progress.phase !== 'play') return [];
  const chosen = [...progress.draftTiltakIds];
  const hypotheses = chosenHypotheses(progress);
  progress.enactedTiltakIds.push(...chosen);
  progress.draftTiltakIds = [];
  progress.vedtakCount += 1;
  const documentId = `doc_vedtak_${progress.vedtakCount}`;
  progress.vedtakRecords.push({
    documentId,
    day: progress.day,
    tiltakIds: chosen,
    hypothesisIds: hypotheses.map((hypothesis) => hypothesis.id),
  });

  for (const tiltakId of chosen) {
    const tiltak = blueprintTiltak[tiltakId];
    if (!tiltak) continue;
    if (tiltakId === 't_bostotte') {
      progress.clocks.ck_bostotte.good += progress.documents.doc_konto ? 2 : 1;
    }
    if (tiltak.slot === 's2') {
      progress.clocks.ck_overfort.good += tiltakId === 't_hjemmehjelp' ? 2 : 1;
    }
    if (
      tiltakId === 't_telefon' &&
      progress.clocks.ck_rutine.good === 0 &&
      !progress.sim.doorOpened
    ) {
      progress.clocks.ck_rutine.bad += 2;
    }
  }

  progress.sim.log.push({
    day: progress.day,
    text: `Vedtak fattet: ${chosen.map((tiltakId) => blueprintTiltak[tiltakId].title).join(', ')}.`,
    kind: 'tiltak',
  });
  receiveBlueprintDocument(progress, documentId);

  return chosen;
}

export function availableDispatchIds(progress: BlueprintProgress): BlueprintDispatchId[] {
  return Object.keys(blueprintDispatches).filter((dispatchId) =>
    dispatchAvailable(progress, dispatchId),
  );
}

export function dispatchAvailable(
  progress: BlueprintProgress,
  dispatchId: BlueprintDispatchId,
): boolean {
  switch (dispatchId) {
    case 'd_ring_grete':
      return !progress.documents.doc_frank_tlf && progress.greteStage < 4;
    case 'd_konto':
      return (
        !progress.documents.doc_konto &&
        !progress.pending.some((item) => item.documentId === 'doc_konto') &&
        progress.greteStage < 4
      );
    case 'd_besok':
      return (
        Boolean(progress.documents.doc_frank_tlf) &&
        !progress.documents.doc_frank_visit &&
        !progress.pending.some((item) => item.documentId === 'doc_frank_visit') &&
        progress.greteStage < 4
      );
    case 'd_ring_elling':
      return !progress.facts.f_ubesvart && progress.greteStage >= 4;
    case 'd_papirer':
      return (
        progress.greteStage >= 5 &&
        !progress.documents.doc_konto &&
        !progress.documents.doc_papirer &&
        (progress.sim.doorOpened || progress.enactedTiltakIds.includes('t_hjemmehjelp'))
      );
    case 'd_besok_alene':
      return progress.greteStage >= 5;
    case 'd_bostotte_f':
      return (
        progress.enactedTiltakIds.includes('t_bostotte') &&
        !progress.clocks.ck_bostotte.done &&
        !progress.clocks.ck_bostotte.failed
      );
    default:
      return false;
  }
}

export function runBlueprintDispatch(
  progress: BlueprintProgress,
  dispatchId: BlueprintDispatchId,
): BlueprintDispatchOutcome | null {
  if (
    progress.phase !== 'play' ||
    progress.actions < 1 ||
    !dispatchAvailable(progress, dispatchId)
  ) {
    return null;
  }

  progress.actions -= 1;
  progress.dispatchedIds.push(dispatchId);
  const outcome: BlueprintDispatchOutcome = { toasts: [] };

  if (['d_ring_grete', 'd_konto', 'd_besok'].includes(dispatchId)) {
    progress.clocks.ck_overfort.bad += 1;
  }

  if (dispatchId === 'd_ring_grete') {
    receiveBlueprintDocument(progress, 'doc_frank_tlf');
    outcome.toasts.push({
      tag: 'NYTT DOKUMENT PÅ PULTEN',
      text: blueprintDocuments.doc_frank_tlf.title,
    });
  }

  if (dispatchId === 'd_konto') {
    progress.pending.push({ day: progress.day + 1, documentId: 'doc_konto' });
    outcome.toasts.push({ tag: 'FRANK ER I GANG', text: 'Svar ventes i morgen.' });
  }

  if (dispatchId === 'd_besok') {
    progress.pending.push({ day: progress.day + 1, documentId: 'doc_frank_visit' });
    outcome.toasts.push({ tag: 'FRANK ER I GANG', text: 'Besøksrapport ventes i morgen.' });
  }

  if (dispatchId === 'd_ring_elling') {
    const lifted = liftBlueprintFact(progress, 'f_ubesvart');
    progress.sim.unanswered += 1;
    progress.sim.log.push({
      day: progress.day,
      text: 'Frank ringte leiligheten. Åtte ring. Fasttelefonen står to meter fra stolen hans.',
      kind: 'frank',
    });
    if (lifted) {
      outcome.toasts.push({
        tag: `FAKTUM LAGT TIL · ${lifted.fact.domain}`,
        text: lifted.fact.text,
        kind: 'fact',
      });
    }
  }

  if (dispatchId === 'd_papirer') {
    receiveBlueprintDocument(progress, 'doc_papirer');
    outcome.toasts.push({
      tag: 'NYTT DOKUMENT PÅ PULTEN',
      text: blueprintDocuments.doc_papirer.title,
    });
  }

  if (dispatchId === 'd_besok_alene') {
    const opened =
      progress.enactedTiltakIds.includes('t_hjemmehjelp') || progress.clocks.ck_rutine.good > 0;
    if (opened) {
      progress.sim.doorOpened = true;
      progress.sim.visitLevel = 2;
      progress.sim.needs.social = Math.min(100, progress.sim.needs.social + 8);
      progress.sim.log.push({
        day: progress.day,
        text: 'Frank ringte på. Det tok fire minutter. Så gikk låsen.',
        kind: 'frank',
      });
      progress.sim.log.push({
        day: progress.day,
        text: 'De sa ingenting om Grete. Frank satte over kaffe. E. ble i rommet.',
        kind: 'frank',
      });
      outcome.toasts.push({ tag: 'FELTNOTAT', text: 'Døren gikk opp. Fire minutter.' });
    } else {
      progress.clocks.ck_rutine.bad = Math.min(4, progress.clocks.ck_rutine.bad + 1);
      progress.sim.log.push({
        day: progress.day,
        text: 'Frank ringte på. Ingen lyd. Han la et håndskrevet kort i brevsprekken.',
        kind: 'frank',
      });
      outcome.toasts.push({ tag: 'FELTNOTAT', text: 'Ingen åpnet. Frank la igjen et kort.' });
    }
  }

  if (dispatchId === 'd_bostotte_f') {
    progress.clocks.ck_bostotte.good += 1;
    outcome.toasts.push({ tag: 'BOSTØTTE SAK', text: 'Søknaden rykker frem.' });
  }

  return outcome;
}

export function askBlueprintFrank(progress: BlueprintProgress, chatId: BlueprintChatId): boolean {
  const prompt = blueprintChat.find((item) => item.id === chatId);
  if (!prompt || progress.askedChatIds.includes(chatId) || !progress.facts[prompt.needs]) {
    return false;
  }
  progress.askedChatIds.push(chatId);
  progress.chatLog.push({ who: 'Deg', runs: [{ text: prompt.question }] });
  progress.chatLog.push({ who: 'Frank', runs: prompt.answer });
  return true;
}

export function advanceBlueprintDay(progress: BlueprintProgress): BlueprintDispatchOutcome {
  if (progress.phase !== 'play') return { toasts: [] };

  progress.day += 1;
  progress.actions = 2;
  const outcome: BlueprintDispatchOutcome = {
    toasts: [{ tag: `DAG ${progress.day}`, text: blueprintDayName(progress.day), kind: 'day' }],
  };

  progress.pending = progress.pending.filter((pending) => {
    if (pending.day <= progress.day) {
      receiveBlueprintDocument(progress, pending.documentId);
      if (pending.documentId === 'doc_frank_visit') {
        progress.sim.visitLevel = Math.max(progress.sim.visitLevel, 1) as 0 | 1 | 2;
      }
      outcome.toasts.push({
        tag: 'NY POST PÅ PULTEN',
        text: blueprintDocuments[pending.documentId].title,
        kind: 'day',
      });
      return false;
    }
    return true;
  });

  updateBostotteClock(progress, outcome);
  applyScriptedDay(progress, outcome);
  simTick(progress);

  if (progress.day >= 8 && progress.phase === 'play') {
    endBlueprint(progress);
  }

  return outcome;
}

export function clearFreshFacts(progress: BlueprintProgress): void {
  progress.unreadFacts = 0;
  for (const state of Object.values(progress.facts)) {
    state.fresh = false;
  }
}

export function statusDocumentBlocks(endText?: BlueprintEndText): string[] {
  if (!endText) return ['Statusrapporten er ikke skrevet ennå.'];
  return [endText.para1, endText.para2, endText.closing];
}

function updateBostotteClock(progress: BlueprintProgress, outcome: BlueprintDispatchOutcome): void {
  const clock = progress.clocks.ck_bostotte;
  if (!progress.enactedTiltakIds.includes('t_bostotte') || clock.done || clock.failed) return;
  if (clock.good >= 4) {
    clock.done = true;
    outcome.toasts.push({
      tag: 'BOSTØTTE SAK',
      text: 'Søknad komplett. Under behandling.',
      kind: 'day',
    });
  } else if (progress.greteStage >= 4) {
    clock.bad += 1;
    if (clock.bad >= 4) {
      clock.failed = true;
      outcome.toasts.push({
        tag: 'BOSTØTTE SAK',
        text: 'Fristen glapp. Søknaden må fremmes på nytt.',
        kind: 'day',
      });
    }
  }
}

function applyScriptedDay(progress: BlueprintProgress, outcome: BlueprintDispatchOutcome): void {
  if (progress.day === 2) {
    progress.greteStage = 2;
  }
  if (progress.day === 3) {
    progress.greteStage = 3;
    outcome.toasts.push({
      tag: 'BESKJED FRA FRANK',
      text: 'Grete skulle ringe tilbake om papirene. Hun ringte ikke.',
      kind: 'day',
    });
  }
  if (progress.day === 4) {
    receiveBlueprintDocument(progress, 'doc_innleggelse');
    progress.greteStage = 4;
    outcome.toasts.push({ tag: 'MELDING FRA ULLEVÅL', text: 'Grete er innlagt.', kind: 'day' });
  }
  if (progress.day === 5) {
    receiveBlueprintDocument(progress, 'doc_dodsfall');
    progress.greteStage = 5;
    if (!progress.questions.q_kollaps) {
      progress.questions.q_kollaps = { visible: true, hypothesisId: null };
    }
    outcome.toasts.push({
      tag: 'MELDING FRA ULLEVÅL',
      text: 'Grete Olsen er død.',
      kind: 'day',
    });
  }
  if (progress.day === 6) {
    receiveBlueprintDocument(progress, 'doc_huseier');
    outcome.toasts.push({
      tag: 'NY POST PÅ PULTEN',
      text: 'Håndskrevet brev · T. Bakkerud',
      kind: 'day',
    });
  }
}

function cover(progress: BlueprintProgress) {
  const enacted = progress.enactedTiltakIds;
  return {
    channel:
      enacted.includes('t_hjemmehjelp') ||
      progress.clocks.ck_rutine.good > 0 ||
      progress.sim.doorOpened,
    money:
      enacted.includes('t_forvaltning') ||
      Boolean(progress.clocks.ck_bostotte.done) ||
      enacted.includes('t_huseier'),
    food: enacted.includes('t_matlevering'),
    documents: enacted.includes('t_dokgjennomgang'),
    routine: enacted.some((tiltakId) => blueprintTiltak[tiltakId]?.slot === 's3'),
    institution: enacted.includes('t_institusjon'),
  };
}

function simTick(progress: BlueprintProgress): void {
  const sim = progress.sim;
  const day = progress.day;
  const coverage = cover(progress);
  const log = (text: string, kind: 'obs' | 'tiltak' | 'frank' | 'day' = 'obs', factId?: string) =>
    sim.log.push({ day, text, kind, factId });

  if (progress.greteStage < 4) {
    sim.needs.security = 55;
    sim.needs.hunger = Math.max(sim.needs.hunger, 70);
    if (sim.visitLevel > 0 && day >= 3) log(nextFlavor(progress));
    if (day === 3 && sim.visitLevel > 0) {
      log('Grete var på kjøkkenet fra 15:30. Hun fylte fire nye bokser og satte seg ikke ned.');
    }
    return;
  }

  if (progress.greteStage === 4) {
    sim.needs.security = 38;
    sim.foodBoxes -= 1;
    sim.mail += 1;
    if (sim.visitLevel > 0) {
      log('Ingen kom kl. 16. E. ved vinduet fra 15:40 til 18:05.');
      log('Telefonen ringte to ganger (Ullevål). Han sto ved apparatet. Tok den ikke.');
      sim.unanswered += 2;
    }
    return;
  }

  sim.mail += 1;
  sim.needs.security = Math.max(12, sim.needs.security - 7);
  sim.needs.energy = Math.max(20, sim.needs.energy - 4);

  if (coverage.food && coverage.channel) {
    sim.foodBoxes = Math.max(sim.foodBoxes, 4);
    sim.needs.hunger = 65;
    log('Matlevering 11:00. Boksene ble tatt inn i løpet av en time.', 'tiltak');
  } else if (coverage.food) {
    sim.foodBoxes -= 1;
    sim.needs.hunger = Math.max(15, sim.needs.hunger - 12);
    log('Matlevering 11:00. Kassen ble stående i gangen. Ingen åpnet.', 'tiltak');
  } else {
    sim.foodBoxes -= 1;
    sim.needs.hunger =
      sim.foodBoxes > 0 ? Math.max(40, sim.needs.hunger - 6) : Math.max(10, sim.needs.hunger - 15);
    if (sim.foodBoxes === 1) {
      log('Én boks igjen i kjøleskapet. Merket «søndag», i Gretes håndskrift.');
    } else if (sim.foodBoxes <= 0) {
      log('Kjøleskapet: lyset, en halv pakke smør, to glass sennep og knekkebrød stående.');
    }
  }

  if (coverage.documents) {
    sim.mail = Math.max(0, sim.mail - 3);
    log('Dokumentgjennomgang. Frank åpnet og sorterte. E. ble i rommet.', 'tiltak');
  } else if (sim.mail > 12) {
    log('Postbunken har veltet. Øverst: Søgaard Eiendom.');
  }

  if (coverage.channel && progress.enactedTiltakIds.includes('t_hjemmehjelp')) {
    log('Frank 14:00, fast tid. Kaffen sto klar da han gikk — én kopp brukt.', 'tiltak');
    sim.needs.social = Math.min(45, sim.needs.social + 4);
  } else if (!coverage.channel) {
    log('Banking på døren. E. frøs. Ingen lyd i fire minutter. Så stillhet.');
    sim.unanswered += 1;
  }

  if (coverage.routine && progress.enactedTiltakIds.includes('t_brev') && coverage.channel) {
    if (progress.clocks.ck_rutine.good < 4) {
      progress.clocks.ck_rutine.good += 1;
      const steps = [
        'Brevrutine: Frank la ett brev på bordet og ventet. E. så på det. Det var nok.',
        'Brevrutine: E. åpnet konvolutten. Leste avsenderen høyt.',
        'Brevrutine: E. leste første avsnitt. «De vil ha et svar innen fjorten dager.»',
        'Brevrutine: E. la brevet i en mappe han hadde laget selv. Den var merket.',
      ];
      const step = steps[progress.clocks.ck_rutine.good - 1];
      log(step, 'tiltak', progress.clocks.ck_rutine.good === 4 ? 'f_egen_mappe' : undefined);
      if (progress.clocks.ck_rutine.good === 4) {
        liftBlueprintFact(progress, 'f_egen_mappe');
      }
    }
  } else if (coverage.routine && progress.enactedTiltakIds.includes('t_brev')) {
    log('Brevrutinen forutsetter at noen kommer inn. Ingen kommer inn.', 'tiltak');
  }

  if (
    progress.enactedTiltakIds.includes('t_telefon') &&
    progress.clocks.ck_rutine.bad >= 2 &&
    !sim.tiradeLogged
  ) {
    sim.tiradeLogged = true;
    log(
      'Telefontrening avbrutt. E. holdt et kvarter langt foredrag om apparatet.',
      'tiltak',
      'f_tirade',
    );
    liftBlueprintFact(progress, 'f_tirade');
  }

  if (coverage.institution && !sim.institutionLogged) {
    sim.institutionLogged = true;
    log('Kartleggingsskjema for omsorgsbolig levert i postkassen.', 'tiltak');
  }

  if (!coverage.money) {
    progress.clocks.ck_restanse.bad = Math.min(6, progress.clocks.ck_restanse.bad + 1);
    if (progress.clocks.ck_restanse.bad === 3) {
      log(
        'Ny lapp fra Bakkerud i postkassen. Kortere enn brevet. Bare ett spørsmålstegn til slutt.',
      );
    }
  } else if (progress.enactedTiltakIds.includes('t_forvaltning') && !sim.forvaltningLogged) {
    sim.forvaltningLogged = true;
    log(
      'Forvaltningskontoret har overtatt de faste betalingene. Husleien for mars er sikret.',
      'tiltak',
    );
  }

  log(nextFlavor(progress));
}

function nextFlavor(progress: BlueprintProgress): string {
  const value = blueprintFlavor[progress.sim.flavorIndex % blueprintFlavor.length];
  progress.sim.flavorIndex += 1;
  return value;
}

function endBlueprint(progress: BlueprintProgress): void {
  progress.phase = 'ended';
  progress.endText = buildEndText(progress);
  receiveBlueprintDocument(progress, 'doc_status');
}

function buildEndText(progress: BlueprintProgress): BlueprintEndText {
  const coverage = cover(progress);
  const restanse = progress.clocks.ck_restanse.bad;
  const routine = progress.clocks.ck_rutine;

  if (coverage.institution) {
    return {
      para1:
        'Kartlegging for omsorgsbolig er igangsatt. Saken er bureaukratisk lesbar og kan lukkes administrativt ved tildeling.',
      para2:
        'Skjemaet ligger fortsatt uåpnet i posten hans. Leiligheten er i så fall et avsluttet kapittel.',
      closing: '«Han er en smart gutt,» sa hun i trappen. Det var det siste hun sa til kommunen.',
    };
  }

  if (coverage.money && (coverage.channel || routine.good > 0)) {
    return {
      para1:
        'Husleien for mars er sikret. Leieforholdet består, foreløpig, fordi noen tok betalingskjeden før den røk.',
      para2:
        routine.good >= 2
          ? 'Én rutine har begynt å tåle støtte: brevet på bordet. Det høres ikke ut som mye. Det er det første han har båret selv.'
          : 'En kanal inn finnes. Den er smal og den er ny, og den heter Frank.',
      closing:
        'Leiligheten består. Det gjør også stillheten i den. Spørsmålet nå er hva den skal fylles med.',
    };
  }

  if (coverage.money) {
    return {
      para1:
        'Husleien er sikret. Det økonomiske grunnlaget for leieforholdet er midlertidig på plass.',
      para2: `Ingen har vært inne i leiligheten siden dødsfallet. Frank anslår ${Math.max(
        0,
        progress.sim.foodBoxes,
      )} middagsbokser igjen. Telefonen har ${progress.sim.unanswered} ubesvarte anrop.`,
      closing: 'Vedtaket var riktig utfylt. Det var ikke nok.',
    };
  }

  if (coverage.channel || coverage.food || coverage.documents) {
    return {
      para1: `Noen bærer deler av hverdagen. ${coverage.food ? 'Mat kommer inn. ' : ''}${
        coverage.documents ? 'Posten åpnes. ' : ''
      }${coverage.channel ? 'Døren går opp for én person.' : ''}`,
      para2: `Ingen betaler den. Restanseklokken står på ${restanse} av 6. Bakkerud har lagt en ny lapp i postkassen.`,
      closing: 'Hverdagen har fått stillas. Grunnmuren har ingen.',
    };
  }

  return {
    para1: 'Det foreligger ikke iverksatte tiltak som dekker bolig eller hverdag.',
    para2:
      'Restanse bygges. Posten vokser. Døren er lukket. Kommunen vet nå svært mye om Elling Olsen, og når ham ikke.',
    closing: 'Bekymringsmeldingen var berettiget. Det er den fortsatt.',
  };
}
