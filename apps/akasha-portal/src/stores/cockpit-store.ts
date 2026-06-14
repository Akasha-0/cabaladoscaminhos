'use client';

import { create } from 'zustand';

export type AtmosphereIntensity = 'low' | 'medium' | 'high';

export interface CockpitState {
  atmosphereIntensity: AtmosphereIntensity;
  setAtmosphereIntensity: (i: AtmosphereIntensity) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (c: boolean) => void;
  toggleSidebar: () => void;
}

export const useCockpitStore = create<CockpitState>((set) => ({
  atmosphereIntensity: 'medium',
  setAtmosphereIntensity: (atmosphereIntensity) => set({ atmosphereIntensity }),
  sidebarCollapsed: false,
  setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
}));
