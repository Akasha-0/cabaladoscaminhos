// src/stores/cockpit-store.ts
// Global state for Cockpit Oracular

import { create } from 'zustand';
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
  id?: string;
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

// fallow-ignore-next-line unused-type
export type RightPanelTab = 'dossier' | 'consult';

interface CockpitState {
  // Cliente info
  cliente: ClienteInfo | null;
  currentReadingId: string | null;
  currentClientId: string | null;

  // Houses state
  houses: Map<number, FilledHouse>;

  // Track which card IDs (1-36) have been placed — AD-17.2 uniqueness enforcement
  placedCards: Set<number>;

  // UI state
  activePopover: number | null; // casa being edited
  isSidebarCollapsed: boolean;

  // Right panel state (Zone C)
  isRightPanelOpen: boolean;
  rightPanelTab: RightPanelTab;

  // Actions
  setCliente: (cliente: ClienteInfo) => void;
  fillHouse: (casaNumero: number, carta: CartaCiganaOption, odu: OduInfo) => void;
  clearHouse: (casaNumero: number) => void;
  // Reading management
  setCurrentReadingId: (id: string | null) => void;
  setCurrentClientId: (id: string | null) => void;


  // Right panel actions (Zone C)
  clearAllHouses: () => void;
  setActivePopover: (casaNumero: number | null) => void;
  toggleSidebar: () => void;
  resetCockpit: () => void;

  // Card uniqueness actions (AD-17.2)
  addUsedCard: (cardNumber: number) => void;
  removeUsedCard: (cardNumber: number) => void;

  // Right panel actions (Zone C)
  setRightPanelTab: (tab: RightPanelTab) => void;
  toggleRightPanel: () => void;
  openRightPanel: (tab?: RightPanelTab) => void;
  closeRightPanel: () => void;

  // Computed
  getFilledCount: () => number;
  getUsedCardCount: () => number;
  getRemainingCardCount: () => number;
  canGenerateDossie: () => boolean;
}

export const useCockpitStore = create<CockpitState>((set, get) => ({
  cliente: null,
  currentReadingId: null,
  currentClientId: null,
  houses: new Map(),

  placedCards: new Set(),
  activePopover: null,
  isSidebarCollapsed: false,

  // Right panel defaults (Zone C)
  isRightPanelOpen: false,
  rightPanelTab: 'dossier',

  setCliente: (cliente) => set({ cliente, currentClientId: cliente?.id ?? null }),

  setCurrentReadingId: (id) => set({ currentReadingId: id }),
  setCurrentClientId: (id) => set({ currentClientId: id }),
  fillHouse: (casaNumero, carta, odu) => {
    set((state) => {
      const newHouses = new Map(state.houses);
      newHouses.set(casaNumero, { casaNumero, carta, odu });
      // Track card placement for uniqueness (AD-17.2)
      const newPlacedCards = new Set(state.placedCards);
      newPlacedCards.add(carta.numero);
      return { houses: newHouses, activePopover: null, placedCards: newPlacedCards };
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
    const { houses, placedCards } = get();
    const house = houses.get(casaNumero);
    const cardNumber = house?.carta?.numero;

    set((state) => {
      const newHouses = new Map(state.houses);
      newHouses.delete(casaNumero);
      // Remove from placedCards if card was present
      const newPlacedCards = new Set(state.placedCards);
      if (cardNumber !== undefined) {
        newPlacedCards.delete(cardNumber);
      }
      return { houses: newHouses, placedCards: newPlacedCards };
    });
  },

  clearAllHouses: () =>
    set({
      houses: new Map(),
      activePopover: null,
      placedCards: new Set(), // Reset card tracking (AD-17.2)
    }),

  setActivePopover: (casaNumero) => set({ activePopover: casaNumero }),

  toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),

  resetCockpit: () =>
    set({
      cliente: null,
      currentReadingId: null,
      currentClientId: null,
      houses: new Map(),
      activePopover: null,
      placedCards: new Set(),
      isRightPanelOpen: false,
      rightPanelTab: 'dossier',
    }),

  // Card uniqueness actions (AD-17.2)
  addUsedCard: (cardNumber) => {
    set((state) => {
      const newPlacedCards = new Set(state.placedCards);
      newPlacedCards.add(cardNumber);
      return { placedCards: newPlacedCards };
    });
  },

  removeUsedCard: (cardNumber) => {
    set((state) => {
      const newPlacedCards = new Set(state.placedCards);
      newPlacedCards.delete(cardNumber);
      return { placedCards: newPlacedCards };
    });
  },

  getFilledCount: () => get().houses.size,

  // AD-17.2: Cards that have been placed
  getUsedCardCount: () => get().placedCards.size,

  // AD-17.2: Cards remaining to place (36 - placed)
  getRemainingCardCount: () => 36 - get().placedCards.size,

  canGenerateDossie: () => get().houses.size >= 1,

  // Right panel actions (Zone C)
  setRightPanelTab: (tab) => set({ rightPanelTab: tab }),

  toggleRightPanel: () => set((state) => ({ isRightPanelOpen: !state.isRightPanelOpen })),

  openRightPanel: (tab) =>
    set((state) => ({
      isRightPanelOpen: true,
      rightPanelTab: tab ?? state.rightPanelTab,
    })),

  closeRightPanel: () => set({ isRightPanelOpen: false }),
}));
