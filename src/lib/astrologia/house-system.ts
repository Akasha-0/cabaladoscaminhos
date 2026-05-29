/**
 * House system definitions for astrological calculations.
 * Each house system has a unique identifier and name.
 */

export interface HouseSystem {
  id: string;
  name: string;
  description: string;
}

/**
 * Supported house systems with their identifiers and descriptions.
 */
export const HOUSE_SYSTEMS: HouseSystem[] = [
  { id: "P", name: "Placidus", description: "Most traditional house system, uses unequal divisions based on space and time." },
  { id: "K", name: "Koch", description: "Also known as Koch-astrology, uses a tri-degree system." },
  { id: "F", name: "Porphyry", description: "Equal arc system dividing the semiarc into three equal parts." },
  { id: "O", name: "Opposite", description: "Equal houses with Descendant at cusp of house 7." },
  { id: "R", name: "Regiomontanus", description: "Equal degree system based on the celestial equator." },
  { id: "C", name: "Campanus", description: "Equal time system with houses based on meridian divisions." },
  { id: "E", name: "Equal", description: "Equal 30-degree houses starting from the Ascendant." },
  { id: "W", name: "Whole Sign", description: "Houses correspond exactly to zodiac signs." },
  { id: "X", name: "Axial", description: "Equal houses with Ascendant at cusp of house 1." },
  { id: "M", name: "Morinus", description: "Based on great circles through the poles." },
  { id: "T", name: "Polich-Page", description: "Also called 'Topocentric' or 'Polich' system." },
  { id: "B", name: "Alcabitius", description: "Equal houses measuring from the Demi-Sun." },
];

/**
 * Returns all available house systems.
 */
export function getHouseSystem(): HouseSystem[] {
  return HOUSE_SYSTEMS;
}

/**
 * Returns a house system by its identifier.
 */
export function getHouseSystemById(id: string): HouseSystem | undefined {
  return HOUSE_SYSTEMS.find(h => h.id === id);
}