// src/stores/cockpit-store.ts
// Global state for Cockpit Oracular

import { create } from 'zustand';
import type { CasaState } from '@/lib/divination/house-types';
import type { OduInfo } from '@/lib/ifa/odu-data';

export interface CartaCiganaOption {
  numero: number;
  nome: string;
  significado: string;
}

export interface FilledHouse {
  casaNumero: number;
  carta: CartaCiganaOption | null;
  odu: OduInfo | null;
  interpretacao?: string;
}

export interface ClienteInfo {
  nome: string;
  dataNascimento: string;
  horaNascimento: string;
  localNascimento: string;
  mapa?: {
    sol?: string;
    ascendente?: string;
    caminho?: string;
    missao?: string;
    alma?: string;
    karma?: string;
  };
}

interface CockpitState {
  // Cliente info
  cliente: ClienteInfo | null;
  
  // Houses state
  houses: Map<number, FilledHouse>;
  
  // UI state
  activePopover: number | null; // casa being edited
  isSidebarCollapsed: boolean;
  
  // Actions
  setCliente: (cliente: ClienteInfo) => void;
  fillHouse: (casaNumero: number, carta: CartaCiganaOption, odu: OduInfo) => void;
  clearHouse: (casaNumero: number) => void;
  clearAllHouses: () => void;
  setActivePopover: (casaNumero: number | null) => void;
  toggleSidebar: () => void;
  resetCockpit: () => void;
  
  // Computed
  getFilledCount: () => number;
  canGenerateDossie: () => boolean;
}

export const useCockpitStore = create<CockpitState>((set, get) => ({
  cliente: null,
  houses: new Map(),
  activePopover: null,
  isSidebarCollapsed: false,

  setCliente: (cliente) => set({ cliente }),

  fillHouse: (casaNumero, carta, odu) => {
    set((state) => {
      const newHouses = new Map(state.houses);
      newHouses.set(casaNumero, { casaNumero, carta, odu });
      return { houses: newHouses, activePopover: null };
    });
    
    // Auto-advance to next house if applicable
    const nextCasa = casaNumero + 1;
    if (nextCasa <= 36) {
      setTimeout(() => {
        set({ activePopover: nextCasa });
      }, 150);
    }
  },

  clearHouse: (casaNumero) => {
    set((state) => {
      const newHouses = new Map(state.houses);
      newHouses.delete(casaNumero);
      return { houses: newHouses };
    });
  },

  clearAllHouses: () => set({ houses: new Map(), activePopover: null }),

  setActivePopover: (casaNumero) => set({ activePopover: casaNumero }),

  toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),

  resetCockpit: () => set({
    cliente: null,
    houses: new Map(),
    activePopover: null,
  }),

  getFilledCount: () => get().houses.size,

  canGenerateDossie: () => get().houses.size >= 1, // At least one house filled
}));