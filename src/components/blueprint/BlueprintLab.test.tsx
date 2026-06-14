// @vitest-environment jsdom

import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { BlueprintStore } from '../../stores/BlueprintStore';
import { BlueprintLab } from './BlueprintLab';

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

let root: Root | undefined;
let host: HTMLDivElement | undefined;

function renderBlueprint(width = 1024, store?: BlueprintStore) {
  Object.defineProperty(window, 'innerWidth', { configurable: true, value: width });
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
  act(() => {
    root!.render(<BlueprintLab store={store} />);
  });
}

afterEach(() => {
  vi.useRealTimers();
  if (root) {
    act(() => root!.unmount());
  }
  host?.remove();
  root = undefined;
  host = undefined;
  document.body.innerHTML = '';
});

function clickButton(text: string) {
  const button = Array.from(document.querySelectorAll('button')).find(
    (candidate) => candidate.textContent?.includes(text) && !candidate.hasAttribute('disabled'),
  );
  if (!button) {
    const matches = Array.from(document.querySelectorAll('button'))
      .filter((candidate) => candidate.textContent?.includes(text))
      .map((candidate) => `${candidate.textContent} disabled=${candidate.hasAttribute('disabled')}`)
      .join('\n');
    throw new Error(`Missing enabled button containing: ${text}\n${matches}`);
  }
  act(() => {
    (button as HTMLButtonElement).click();
  });
}

function clickTab(text: string) {
  const button = Array.from(document.querySelectorAll('button.blueprint-tab')).find(
    (candidate) => candidate.textContent?.includes(text) && !candidate.hasAttribute('disabled'),
  );
  if (!button) throw new Error(`Missing enabled tab containing: ${text}`);
  act(() => {
    (button as HTMLButtonElement).click();
  });
}

function clickToast(text: string) {
  const button = Array.from(document.querySelectorAll('button.blueprint-toast')).find((candidate) =>
    candidate.textContent?.includes(text),
  );
  if (!button) throw new Error(`Missing toast containing: ${text}`);
  act(() => {
    (button as HTMLButtonElement).click();
  });
}

function clickAriaButton(label: string) {
  const button = Array.from(document.querySelectorAll('button')).find(
    (candidate) =>
      candidate.getAttribute('aria-label') === label && !candidate.hasAttribute('disabled'),
  );
  if (!button) throw new Error(`Missing enabled aria button: ${label}`);
  act(() => {
    (button as HTMLButtonElement).click();
  });
}

function clickEvidence(factId: string) {
  const button = document.querySelector<HTMLButtonElement>(
    `[data-testid="blueprint-evidence-${factId}"]`,
  );
  if (!button) throw new Error(`Missing evidence button: ${factId}`);
  act(() => {
    button.click();
  });
  return button;
}

function startAtDesk() {
  renderBlueprint();
  expect(document.body.textContent).toContain('LEGESENTERET');
  clickButton('Hopp over');
  expect(document.body.textContent).toContain('Én melding. Én pult. Begynn der.');
}

function getQuestionPill(text: string) {
  const pill = Array.from(document.querySelectorAll('.blueprint-pill')).find(
    (candidate) => candidate.textContent === text,
  );
  if (!pill) throw new Error(`Missing question pill: ${text}`);
  return pill;
}

function getTiltakCard(title: string) {
  const card = Array.from(document.querySelectorAll('button.blueprint-tiltak-card')).find(
    (candidate) => candidate.textContent?.includes(title),
  );
  if (!card) throw new Error(`Missing tiltak card: ${title}`);
  return card;
}

function renderVedtakStore(config: { doorOpened?: boolean; rutineGood?: number } = {}) {
  const store = new BlueprintStore();
  store.startCase();
  store.liftFact('f_elling_tlf');
  store.progress.sim.doorOpened = config.doorOpened ?? false;
  store.progress.clocks.ck_rutine.good = config.rutineGood ?? 0;
  store.showSurface('vedtak');
  renderBlueprint(1024, store);
}

function openDocument(title: string, expectsEvidenceHint = true) {
  clickButton(title);
  if (expectsEvidenceHint) {
    expect(document.body.textContent).toContain('Gul markering vises først etter');
  }
}

function closeDocument() {
  clickButton('Lukk');
}

function liftFirstDocumentFacts() {
  openDocument('Legesenteret');
  clickEvidence('f_grete_baerer');
  clickEvidence('f_saarbar');
  clickEvidence('f_aldri_alene');
  clickEvidence('f_ingen_tjenester');
  closeDocument();
}

function runFrankDocumentLoop() {
  clickTab('Frank');
  clickAriaButton('Ring Grete');
  clickButton('Send · Be om økonomisk oversikt');
  clickButton('Neste dag');
  clickButton('Send · Avtal hjemmebesøk');
  clickButton('Neste dag');
  clickTab('Pulten');

  openDocument('husholdets økonomi');
  for (const factId of ['f_trygd', 'f_husleie', 'f_alt_via_grete', 'f_gap', 'f_ingen_matkjop']) {
    clickEvidence(factId);
  }
  closeDocument();

  openDocument('hjemmebesøk');
  for (const factId of ['f_post', 'f_kalender', 'f_matbokser', 'f_bok', 'f_avstand']) {
    clickEvidence(factId);
  }
  closeDocument();
}

describe('BlueprintLab rendered interaction trace', () => {
  it('honors the SDD-004 evidence contract in the document reader', () => {
    startAtDesk();
    openDocument('Legesenteret');

    const evidence = document.querySelector<HTMLButtonElement>(
      '[data-testid="blueprint-evidence-f_grete_baerer"]',
    );
    expect(evidence).toBeTruthy();
    expect(evidence?.className).not.toContain('collected');
    expect(evidence?.getAttribute('aria-pressed')).toBe('false');

    evidence?.focus();
    expect(document.activeElement).toBe(evidence);
    clickEvidence('f_grete_baerer');

    const collected = document.querySelector<HTMLButtonElement>(
      '[data-testid="blueprint-evidence-f_grete_baerer"]',
    );
    expect(collected?.className).toContain('collected');
    expect(collected?.getAttribute('aria-pressed')).toBe('true');
    expect(document.body.textContent).toContain('FAKTUM LAGT TIL');
  });

  it('adds the delayed pencil nudge to unlifted evidence hotspots', () => {
    vi.useFakeTimers();
    startAtDesk();
    openDocument('Legesenteret');

    const evidence = document.querySelector<HTMLButtonElement>(
      '[data-testid="blueprint-evidence-f_grete_baerer"]',
    );
    expect(evidence?.className).not.toContain('nudged');

    act(() => {
      vi.advanceTimersByTime(9_999);
    });

    expect(evidence?.className).not.toContain('nudged');

    act(() => {
      vi.advanceTimersByTime(1);
    });

    expect(evidence?.className).toContain('nudged');
  });

  it('does not add the delayed pencil nudge to already lifted evidence hotspots', () => {
    vi.useFakeTimers();
    startAtDesk();
    openDocument('Legesenteret');
    clickEvidence('f_grete_baerer');

    act(() => {
      vi.advanceTimersByTime(10_000);
    });

    const evidence = document.querySelector<HTMLButtonElement>(
      '[data-testid="blueprint-evidence-f_grete_baerer"]',
    );
    expect(evidence?.className).toContain('collected');
    expect(evidence?.className).not.toContain('nudged');
  });

  it('exposes connector-line DOM evidence for facts shared across question cards', () => {
    startAtDesk();
    openDocument('Legesenteret');
    clickEvidence('f_grete_baerer');
    closeDocument();
    clickTab('Åpne spørsmål');

    const sharedFactChips = document.querySelectorAll('[data-line-fact="f_grete_baerer"]');
    expect(sharedFactChips).toHaveLength(2);

    const lineLayer = document.querySelector('[data-testid="blueprint-question-lines"]');
    expect(lineLayer?.getAttribute('aria-hidden')).toBe('true');

    const connectors = document.querySelectorAll('[data-line-connector-fact="f_grete_baerer"]');
    expect(connectors).toHaveLength(1);
    expect(connectors[0]?.tagName.toLowerCase()).toBe('path');
    expect(connectors[0]?.closest('button')).toBeNull();
    expect(connectors[0]?.getAttribute('d')).toMatch(/^M /);
  });

  it('colors question pills by unresolved, partly lit, and chosen states', () => {
    const store = new BlueprintStore();
    store.startCase();
    store.liftFact('f_grete_baerer');
    store.showSurface('sporsmal');
    renderBlueprint(1024, store);

    expect(getQuestionPill('Åpent').className).toContain('neutral');

    act(() => {
      store.liftFact('f_kalender');
    });

    expect(getQuestionPill('Delvis belyst').className).toContain('blue');

    act(() => {
      store.liftFact('f_matbokser');
      store.selectHypothesis('q_hverdag', 'h_h_infra');
    });

    expect(getQuestionPill('Foreløpig arbeidssvar').className).toContain('gold');
  });

  it('shows the For tidlig? badge only on early tiltak before the door opens and routine progress exists', () => {
    renderVedtakStore();
    expect(getTiltakCard('Telefontrening med manus').textContent).toContain('for tidlig?');
    expect(getTiltakCard('Institusjonsvurdering / omsorgsbolig').textContent).not.toContain(
      'for tidlig?',
    );
  });

  it('hides the For tidlig? badge once the door is open', () => {
    renderVedtakStore({ doorOpened: true });
    expect(getTiltakCard('Telefontrening med manus').textContent).not.toContain('for tidlig?');
  });

  it('hides the For tidlig? badge once routine support has progress', () => {
    renderVedtakStore({ rutineGood: 1 });
    expect(getTiltakCard('Telefontrening med manus').textContent).not.toContain('for tidlig?');
  });

  it('auto-dismisses notices after the configured 5.2 second delay', () => {
    vi.useFakeTimers();
    startAtDesk();

    expect(document.body.textContent).toContain('MOTTATT · SOSIALKONTORET');

    act(() => {
      vi.advanceTimersByTime(5_199);
    });

    expect(document.body.textContent).toContain('MOTTATT · SOSIALKONTORET');

    act(() => {
      vi.advanceTimersByTime(1);
    });

    expect(document.body.textContent).not.toContain('MOTTATT · SOSIALKONTORET');
  });

  it('deep-links fact, hypothesis, and day notices to their Blueprint surfaces', () => {
    startAtDesk();
    clickTab('Frank');
    expect(document.body.textContent).toContain('Send Frank');
    clickToast('MOTTATT · SOSIALKONTORET');
    expect(document.body.textContent).toContain('Én melding. Én pult. Begynn der.');

    openDocument('Legesenteret');
    clickEvidence('f_grete_baerer');
    clickToast('FAKTUM LAGT TIL');
    expect(document.body.textContent).toContain('Sakens fakta');
    expect(document.body.textContent).not.toContain('Gul markering vises først etter');

    clickTab('Pulten');
    openDocument('Legesenteret');
    clickEvidence('f_saarbar');
    clickToast('ÅPENT SPØRSMÅL');
    expect(document.body.textContent).toContain('Åpne spørsmål');
    expect(document.body.textContent).not.toContain('Gul markering vises først etter');
  });

  it('plays the React caseworker loop from prologue through reflection', () => {
    startAtDesk();
    liftFirstDocumentFacts();
    runFrankDocumentLoop();

    clickTab('Åpne spørsmål');
    clickButton('Grete bærer betalingskjeden.');
    clickButton('Grete er usynlig infrastruktur');
    clickButton('Konsentrasjonen er sterk');
    expect(document.body.textContent).toContain('Arbeidshypotese');

    clickTab('Vedtak og tiltak');
    clickButton('Frivillig forvaltning');
    clickButton('Hjemmehjelp 2x uke');
    clickButton('Åpne ett brev');
    clickButton('Institusjonsvurdering');
    clickButton('Fatt vedtak');
    expect(document.body.textContent).toContain('Pulten svarer først når du ber noen gjøre noe.');
    expect(document.body.textContent).toContain('Vedtak 1 · tiltakspakke');
    openDocument('Vedtak 1 · tiltakspakke', false);
    expect(document.body.textContent).not.toContain('Gul markering vises først etter');
    expect(document.body.textContent).toContain('Frivillig forvaltning av faste betalinger');
    expect(document.body.textContent).toContain('Hjemmehjelp 2x uke');
    expect(document.body.textContent).toContain('Åpne ett brev sammen med Frank');
    expect(document.body.textContent).toContain('Institusjonsvurdering / omsorgsbolig');
    expect(document.body.textContent).toContain('Arbeidshypotese lagt til grunn');
    expect(document.body.textContent).toContain('IVERKSATT');
    closeDocument();
    openDocument('Vedtak 1 · tiltakspakke', false);
    expect(document.body.textContent).toContain(
      'Arbeidshypoteser lagt til grunn for tiltakspakken',
    );
    expect(document.body.textContent).toContain('IVERKSATT');
    closeDocument();

    clickTab('Frank');
    clickButton('Posten i gangen');
    expect(document.body.textContent).toContain('FRANK');

    clickButton('Neste dag');
    expect(document.body.textContent).toContain('Grete er innlagt');
    clickButton('Neste dag');
    expect(document.body.textContent).toContain('Grete Olsen er død');
    clickButton('Neste dag');
    clickTab('Pulten');
    expect(document.body.textContent).toContain('Brev fra huseieren');
    clickButton('Neste dag');
    clickButton('Neste dag');

    expect(document.body.textContent).toContain('Dag 8 · saken fortsetter');
    expect(document.body.textContent).toContain('Frank · status dag 8');
  });

  it('exposes the first Frank dispatch with the exact accessible name used by browser smoke', () => {
    startAtDesk();
    clickTab('Frank');

    const dispatch = document.querySelector<HTMLButtonElement>(
      '[data-testid="blueprint-dispatch-d_ring_grete"]',
    );

    expect(dispatch).toBeTruthy();
    expect(dispatch?.getAttribute('aria-label')).toBe('Ring Grete');
    expect(dispatch?.textContent).toContain('Send · Ring Grete');
  });

  it('keeps the first mobile-width path playable at 390px', () => {
    renderBlueprint(390);
    clickButton('Hopp over');
    clickButton('Legesenteret');
    clickEvidence('f_grete_baerer');
    clickEvidence('f_saarbar');
    clickEvidence('f_aldri_alene');
    closeDocument();

    clickTab('Åpne spørsmål');
    expect(document.body.textContent).toContain('Hva bærer Grete');
    expect(document.querySelectorAll('[data-line-fact]').length).toBeGreaterThan(0);
    clickButton('Ferdighetene er der ikke');
    expect(document.body.textContent).toContain('Arbeidshypotese');
    clickButton('Neste dag');
    expect(document.body.textContent).toContain('DAG 2');
  });
});
