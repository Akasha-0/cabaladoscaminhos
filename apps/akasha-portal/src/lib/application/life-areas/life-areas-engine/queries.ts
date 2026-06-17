// ============================================================
// LIFE AREAS ENGINE - Query Helpers
// ============================================================
// Helpers para buscar/filtar áreas da vida por planeta, casa,
// Odu e Orixá. Extraídas de life-areas-engine.ts para manter
// o arquivo principal focado nos dados e tipos.
// ============================================================

import type { LifeAreaId, LifeArea } from './index';
import { LIFE_AREAS } from './index';

// ============================================================
// HELPER: getLifeArea
// ============================================================

export function getLifeArea(id: LifeAreaId): LifeArea {
  return LIFE_AREAS[id];
}

export function getAllLifeAreas(): LifeArea[] {
  return Object.values(LIFE_AREAS);
}

// ============================================================
// HELPER: getLifeAreasBy*
// ============================================================

export function getLifeAreasByPlanet(planet: string): LifeArea[] {
  const lower = planet.toLowerCase();
  return getAllLifeAreas().filter(area =>
    area.astrology.planets.some(p => p.toLowerCase().includes(lower))
  );
}

export function getLifeAreasByHouse(house: number): LifeArea[] {
  return getAllLifeAreas().filter(area =>
    area.astrology.houses.includes(house)
  );
}

export function getLifeAreasByOdu(odu: string): LifeArea[] {
  const lower = odu.toLowerCase();
  return getAllLifeAreas().filter(area =>
    area.odu &&
    (area.odu.primaryOdus.some(o => o.toLowerCase().includes(lower)) ||
    area.odu.favorableOdus.some(o => o.toLowerCase().includes(lower)))
  );
}

export function getLifeAreasByOrixa(orixa: string): LifeArea[] {
  const lower = orixa.toLowerCase();
  return getAllLifeAreas().filter(area =>
    area.orixa &&
    (area.orixa.primary.some(o => o.toLowerCase().includes(lower)) ||
    area.orixa.secondary.some(o => o.toLowerCase().includes(lower)))
  );
}
