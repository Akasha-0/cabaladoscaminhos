// tests/lib/ai/permutation-invariant.test.ts
// AD-18.2: The 'save' API must reject matrixData with duplicate carta numbers.
// Also verifies cockpit store's fillHouse correctly refuses duplicate cards (line 135-136).

import { describe, it, expect, beforeEach } from 'vitest';
import { useCockpitStore } from '@/stores/cockpit-store';

describe('Permutation invariant (AD-18.2)', () => {
  beforeEach(() => {
    useCockpitStore.getState().resetCockpit();
  });

  it('fillHouse refuses a card already in placedCards', () => {
    const store = useCockpitStore.getState();
    store.resetCockpit();

    // Place card 5 in house 1
    store.fillHouse(1, { numero: 5, nome: 'O Trevo', significado: '' }, { numero: 1, nome: 'Ogundá', orixa: 'Ogum' });

    // Re-fetch state after mutation — Zustand only replaces the Set reference on state change
    const state1 = useCockpitStore.getState();
    expect(state1.placedCards.has(5)).toBe(true);
    expect(state1.houses.get(1)?.carta?.numero).toBe(5);

    // Try to place card 5 again — should be refused (no change)
    const before = state1.houses.size;
    store.fillHouse(2, { numero: 5, nome: 'O Trevo', significado: '' }, { numero: 1, nome: 'Ogundá', orixa: 'Ogum' });

    const state2 = useCockpitStore.getState();
    expect(state2.houses.size).toBe(before); // house 2 NOT added
    expect(state2.houses.get(2)).toBeUndefined();
  });

  it('cartasRestantes returns correct array', () => {
    const store = useCockpitStore.getState();
    store.resetCockpit();

    store.fillHouse(1, { numero: 5, nome: 'O Trevo', significado: '' }, { numero: 1, nome: 'Ogundá', orixa: 'Ogum' });
    store.fillHouse(2, { numero: 12, nome: 'Os Pássaros', significado: '' }, { numero: 2, nome: 'Ibin', orixa: 'Xangô' });

    const remaining = store.cartasRestantes();
    expect(remaining).not.toContain(5);
    expect(remaining).not.toContain(12);
    expect(remaining).toContain(1);
    expect(remaining.length).toBe(34);
  });

  it('clearHouse releases a card back to remaining', () => {
    const store = useCockpitStore.getState();
    store.resetCockpit();

    store.fillHouse(1, { numero: 5, nome: 'O Trevo', significado: '' }, { numero: 1, nome: 'Ogundá', orixa: 'Ogum' });
    store.clearHouse(1);

    const state = useCockpitStore.getState();
    expect(state.placedCards.has(5)).toBe(false);
    expect(state.cartasRestantes()).toContain(5);
  });
});
