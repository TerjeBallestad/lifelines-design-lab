import { describe, expect, it } from 'vitest';
import { caseDocuments, getCaseFact, unlockedHypothesisIds } from './evidenceDesk';
import { RootStore } from '../stores/RootStore';

describe('SDD-004 evidence desk content', () => {
  it('keeps the first slice to three case documents', () => {
    expect(caseDocuments.map((document) => document.id)).toEqual([
      'haug_bekymringsmelding',
      'economy_record',
      'rent_warning',
    ]);
  });

  it('does not unlock Grete economy hypothesis until both economy facts are lifted', () => {
    expect(unlockedHypothesisIds(['grete_pays_rent'])).toEqual([]);
    expect(unlockedHypothesisIds(['rent_paid_late'])).toEqual([]);
    expect(unlockedHypothesisIds(['grete_pays_rent', 'rent_paid_late'])).toEqual([
      'grete_carries_economy',
    ]);
  });

  it('stores discussable_with as character-scoped hooks', () => {
    expect(getCaseFact('grete_pays_rent').discussable_with).toEqual(['Frank', 'Grete']);
  });
});

describe('SDD-004 evidence desk store flow', () => {
  it('shows fact/domain notification before threshold and hypothesis notification on threshold', () => {
    const store = new RootStore(() => 0.5);

    store.liftCaseFact('grete_pays_rent');
    expect(store.evidenceToast?.title).toBe('Faktum lagt til · Økonomi/bolig');
    expect(store.evidenceToast?.body).toBe('Grete betaler husleien.');
    expect(store.unlockedCaseHypotheses).toEqual([]);

    store.liftCaseFact('rent_paid_late');
    expect(store.evidenceToast?.title).toBe('Arbeidshypotese låst opp');
    expect(store.evidenceToast?.body).toBe('Grete bærer økonomien');
    expect(store.unlockedCaseHypotheses[0]?.status).toBe('Foreløpig');
    expect(store.unlockedCaseHypotheses[0]?.threshold).toBe(2);
  });
});
