'use client';

import { create } from 'zustand';

export type AtmosphereIntensity = 'low' | 'medium' | 'high';

export interface CockpitState {
  atmosphereIntensity: AtmosphereIntensity;
  setAtmosphereIntensity: (i: AtmosphereIntensity) => void;
}

export const useCockpitStore = create<CockpitState>((set) => ({
  atmosphereIntensity: 'medium',
  setAtmosphereIntensity: (atmosphereIntensity) => set({ atmosphereIntensity }),
}));
