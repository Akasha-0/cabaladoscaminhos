// Iron data - Skip linting and formatting

export interface IronData {
  name: string;
  symbol: string;
  atomicNumber: number;
  atomicMass: number;
  period: number;
  group: number;
  block: string;
  category: string;
  electronsPerShell: number[];
  electronegativity: number;
  meltingPoint: number;
  boilingPoint: number;
  density: number;
  oxidationStates: number[];
  discoveryYear: number;
  discoveredBy: string;
  origin: string;
  meaning: string;
  properties: {
    magnetic: boolean;
    ferromagnetic: boolean;
    conductivity: number;
    hardness: number;
    malleability: number;
  };
  symbolism: {
    elemental: string;
    alchemical: string;
    spiritual: string;
  };
}

export function getData(): IronData {
  return {
    name: "Iron",
    symbol: "Fe",
    atomicNumber: 26,
    atomicMass: 55.845,
    period: 4,
    group: 8,
    block: "d",
    category: "Transition Metal",
    electronsPerShell: [2, 8, 14, 2],
    electronegativity: 1.83,
    meltingPoint: 1811,
    boilingPoint: 3134,
    density: 7.874,
    oxidationStates: [-4, -2, -1, 1, 2, 3, 4, 5, 6],
    discoveryYear: -5000,
    discoveredBy: "Ancient",
    origin: "Latin",
    meaning: "From 'ferrum', meaning strength and fire",
    properties: {
      magnetic: true,
      ferromagnetic: true,
      conductivity: 10e6,
      hardness: 4,
      malleability: 6,
    },
    symbolism: {
      elemental: "Strength, durability, and grounding force",
      alchemical: "Mars - the red planet, war, and vitality",
      spiritual: "Blood, life force, core essence, incarnation",
    },
  };
}
