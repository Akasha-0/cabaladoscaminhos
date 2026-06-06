// tests/cockpit/cockpit-store.test.ts
// Tests for Cockpit Oracular store

import { describe, it, expect, beforeEach } from 'vitest';
import { useCockpitStore } from '@/stores/cockpit-store';

const makeOdu = () => ({
  numero: 1,
  nome: 'Okaran',
  significado: 'O começo',
  elementos: 'Terra',
  orixas: ['Exu'],
  quizilas: [] as string[],
  preceitos: '',
  ebo: '',
});

describe('CockpitStore', () => {
  beforeEach(() => {
    useCockpitStore.getState().resetCockpit();
  });

  it('should initialize with empty state', () => {
    const state = useCockpitStore.getState();
    expect(state.cliente).toBeNull();
    expect(state.houses.size).toBe(0);
    expect(state.activePopover).toBeNull();
    expect(state.isSidebarCollapsed).toBe(false);
  });

  it('should set cliente info', () => {
    const testCliente = {
      nome: 'Maria da Silva',
      dataNascimento: '15/03/1985',
      horaNascimento: '14:30',
      localNascimento: 'Rio de Janeiro, RJ',
    };

    useCockpitStore.getState().setCliente(testCliente);

    const state = useCockpitStore.getState();
    expect(state.cliente).toEqual(testCliente);
  });

  it('should fill house with carta and odu', () => {
    const carta = { numero: 4, nome: 'A Casa', significado: 'Família' };
    useCockpitStore.getState().fillHouse(1, carta, makeOdu());

    const state = useCockpitStore.getState();
    expect(state.houses.size).toBe(1);
    expect(state.houses.get(1)).toBeDefined();
    expect(state.houses.get(1)?.carta).toEqual(carta);
  });

  it('should clear single house', () => {
    const carta = { numero: 4, nome: 'A Casa', significado: 'Família' };
    useCockpitStore.getState().fillHouse(1, carta, makeOdu());
    useCockpitStore.getState().clearHouse(1);

    expect(useCockpitStore.getState().houses.size).toBe(0);
  });

  it('should clear all houses', () => {
    // Each house needs a DIFFERENT card — AD-17.2 uniqueness enforcement
    const carta1 = { numero: 4, nome: 'A Casa', significado: 'Família' };
    const carta2 = { numero: 5, nome: 'A Águia', significado: 'Visão' };
    const carta3 = { numero: 6, nome: 'A Flor', significado: 'Beleza' };
    const odu = makeOdu();

    useCockpitStore.getState().fillHouse(1, carta1, odu);
    useCockpitStore.getState().fillHouse(2, carta2, odu);
    useCockpitStore.getState().fillHouse(3, carta3, odu);

    expect(useCockpitStore.getState().houses.size).toBe(3);

    useCockpitStore.getState().clearAllHouses();

    expect(useCockpitStore.getState().houses.size).toBe(0);
  });

  it('should set active popover', () => {
    useCockpitStore.getState().setActivePopover(5);
    expect(useCockpitStore.getState().activePopover).toBe(5);

    useCockpitStore.getState().setActivePopover(10);
    expect(useCockpitStore.getState().activePopover).toBe(10);

    useCockpitStore.getState().setActivePopover(null);
    expect(useCockpitStore.getState().activePopover).toBeNull();
  });

  it('should toggle sidebar', () => {
    expect(useCockpitStore.getState().isSidebarCollapsed).toBe(false);

    useCockpitStore.getState().toggleSidebar();
    expect(useCockpitStore.getState().isSidebarCollapsed).toBe(true);

    useCockpitStore.getState().toggleSidebar();
    expect(useCockpitStore.getState().isSidebarCollapsed).toBe(false);
  });

  it('should get filled count', () => {
    // Each house needs a DIFFERENT card — AD-17.2 uniqueness enforcement
    const carta1 = { numero: 4, nome: 'A Casa', significado: 'Família' };
    const carta2 = { numero: 5, nome: 'A Águia', significado: 'Visão' };
    const odu = makeOdu();

    expect(useCockpitStore.getState().getFilledCount()).toBe(0);

    useCockpitStore.getState().fillHouse(1, carta1, odu);
    expect(useCockpitStore.getState().getFilledCount()).toBe(1);

    useCockpitStore.getState().fillHouse(2, carta2, odu);
    expect(useCockpitStore.getState().getFilledCount()).toBe(2);
  });

  it('should check if can generate dossiê (needs at least 1 house)', () => {
    expect(useCockpitStore.getState().canGenerateDossie()).toBe(false);

    useCockpitStore.getState().fillHouse(1, { numero: 4, nome: 'A Casa', significado: 'Família' }, makeOdu());
    expect(useCockpitStore.getState().canGenerateDossie()).toBe(true);
  });

  it('should reset cockpit', () => {
    useCockpitStore.getState().setCliente({
      nome: 'Test Client',
      dataNascimento: '01/01/1990',
      horaNascimento: '12:00',
      localNascimento: 'Test City',
    });
    useCockpitStore.getState().fillHouse(1, { numero: 4, nome: 'A Casa', significado: 'Test' }, makeOdu());
    useCockpitStore.getState().setActivePopover(5);

    useCockpitStore.getState().resetCockpit();

    const state = useCockpitStore.getState();
    expect(state.cliente).toBeNull();
    expect(state.houses.size).toBe(0);
    expect(state.activePopover).toBeNull();
  });
});
