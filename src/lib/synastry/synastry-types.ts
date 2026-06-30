// W70 Synastry Engine — synastry-types.ts (shared output types).
// Pulled out of synastry.ts so consumers can import output types cleanly.

import type { Aspect } from './aspects.ts';
import type { Tradition, HouseNumber } from './types.ts';

export interface HouseOverlay {
  readonly planet: string;
  readonly partnerHouse: HouseNumber;
  readonly topic: string;
}

export interface CompositeChart {
  readonly midpoints: readonly import('./types.ts').PlanetPosition[];
  readonly houses: readonly import('./types.ts').HouseCusp[];
}

export interface SynastryReport {
  readonly aspects: readonly Aspect[];
  readonly overlays: readonly HouseOverlay[];
  readonly composite: CompositeChart;
  readonly scores: Readonly<Record<Tradition, number>>;
  readonly summary: string;
}

export interface CompatibilityScore {
  readonly overall: number;       // 0..100
  readonly byTradition: Readonly<Record<Tradition, number>>;
  readonly summary: string;
}

export interface ValidationResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
}
