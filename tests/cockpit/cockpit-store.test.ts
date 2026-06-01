// tests/cockpit/cockpit-store.test.ts
// Tests for Cockpit Oracular store

import { describe, it, expect, beforeEach } from 'vitest';
import { useCockpitStore } from '@/stores/cockpit-store';

describe('CockpitStore', () => {
  beforeEach(() => {
    // Reset store state before each test
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
    const casaNumero = 1;
    const carta = { numero: 4, nome: 'A Casa', significado: 'Família' };
    const odu = { numero: 1, nome: 'Okaran', significado: 'O começo', elementos: 'Terra', orixas: ['Exu'], quizilas: [], preceitos: '', ebo: '' };
    
    useCockpitStore.getState().fillHouse(casaNumero, carta, odu);
    
    const state = useCockpitStore.getState();
    expect(state.houses.size).toBe(1);
    expect(state.houses.get(casaNumero)).toBeDefined();
    expect(state.houses.get(casaNumero)?.carta).toEqual(carta);
    expect(state.houses.get(casaNumero)?.odu).toEqual(odu);
  });

  it('should clear single house', () => {
    const casaNumero = 1;
    const carta = { numero: 4, nome: 'A Casa', significado: 'Família' };
    const odu = { numero: 1, nome: 'Okaran', significado: 'O começo', elementos: 'Terra', orixas: ['Exu'], quizilas: [], preceitos: '', ebo: '' };
    
    useCockpitStore.getState().fillHouse(casaNumero, carta, odu);
    useCockpitStore.getState().clearHouse(casaNumero);
    
    const state = useCockpitStore.getState();
    expect(state.houses.size).toBe(0);
  });

  it('should clear all houses', () => {
    // Fill multiple houses
    const carta = { numero: 4, nome: 'A Casa', significado: 'Família' };
    const odu = { numero: 1, nome: 'Okaran', significado: 'O começo', elementos: 'Terra', orixas: ['Exu'], quizilas: [], preceitos: '', ebo: '' };
    
    useCockpitStore.getState().fillHouse(1, carta, odu);
    useCockpitStore.getState().fillHouse(2, carta, odu);
    useCockpitStore.getState().fillHouse(3, carta, odu);
    
    expect(useCockpitStore.getState().houses.size).toBe(3);
    
    useCockpitStore.getState().clearAllHouses();
    
    const state = useCockpitStore.getState();
    expect(state.houses.size).toBe(0);
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
    const state1 = useCockpitStore.getState();
    expect(state1.isSidebarCollapsed).toBe(false);
    
    useCockpitStore.getState().toggleSidebar();
    
    const state2 = useCockpitStore.getState();
    expect(state2.isSidebarCollapsed).toBe(true);
    
    useCockpitStore.getState().toggleSidebar();
    
    const state3 = useCockpitStore.getState();
    expect(state3.isSidebarCollapsed).toBe(false);
  });

  it('should get filled count', () => {
    const carta = { numero: 4, nome: 'A Casa', significado: 'Família' };
    const odu = { numero: 1, nome: 'Okaran', significado: 'O começo', elementos: 'Terra', orixas: ['Exu'], quizilas: [], preceitos: '', ebo: '' };
    
    expect(useCockpitStore.getState().getFilledCount()).toBe(0);
    
    useCockpitStore.getState().fillHouse(1, carta, odu);
    expect(useCockpitStore.getState().getFilledCount()).toBe(1);
    
    useCockpitStore.getState().fillHouse(2, carta, odu);
    expect(useCockpitStore.getState().getFilledCount()).toBe(2);
  });

  it('should check if can generate dossiê (needs at least 1 house)', () => {
    const carta = { numero: 4, nome: 'A Casa', significado: 'Família' };
    const odu = { numero: 1, nome: 'Okaran', significado: 'O começo', elementos: 'Terra', orixas: ['Exu'], quizilas: [], preceitos: '', ebo: '' };
    
    expect(useCockpitStore.getState().canGenerateDossie()).toBe(false);
    
    useCockpitStore.getState().fillHouse(1, carta, odu);
    
    expect(useCockpitStore.getState().canGenerateDossie()).toBe(true);
  });

  it('should reset cockpit', () => {
    const testCliente = {
      nome: 'Test Client',
      dataNascimento: '01/01/1990',
      horaNascimento: '12:00',
      localNascimento: 'Test City',
    };
    
    useCockpitStore.getState().setCliente(testCliente);
    useCockpitStore.getState().fillHouse(1, { numero: 4, nome: 'A Casa', significado: 'Test' }, { numero: 1, nome: 'Okaran', significado: 'Test', elementos: 'Terra', orixas: ['Exu'], quizilas: [], preceitos: '', ebo: '' });
    useCockpitStore.getState().setActivePopover(5);
    
    useCockpitStore.getState().resetCockpit();
    
    const state = useCockpitStore.getState();
    expect(state.cliente).toBeNull();
    expect(state.houses.size).toBe(0);
    expect(state.activePopover).toBeNull();
  });
});