// ============================================================
// LIFE AREAS ENGINE - Data Utilities
// ============================================================
// Funções utilitárias para operar sobre LIFE_AREAS.
// SGBD/correlation helper — validação, lookup, agregação.
// ============================================================
import { LIFE_AREAS } from './life-areas-data';
import type { LifeAreaId, LifeArea } from './types';

// ============================================================
// LOOKUP UTILITIES
// ============================================================

/** Retorna todas as LifeAreaIds disponíveis. */
export function getAllLifeAreaIds(): LifeAreaId[] {
  return Object.keys(LIFE_AREAS) as LifeAreaId[];
}

/** Busca uma LifeArea pelo seu id. Retorna undefined se não existir. */
export function getLifeAreaById(id: LifeAreaId): LifeArea | undefined {
  return LIFE_AREAS[id];
}

/** Retorna todas as LifeAreas como array. */
export function getAllLifeAreas(): LifeArea[] {
  return Object.values(LIFE_AREAS);
}

/** Verifica se um id é uma LifeAreaId válida. */
export function isValidLifeAreaId(id: string): id is LifeAreaId {
  return id in LIFE_AREAS;
}

// ============================================================
// ASTROLOGY UTILITIES
// ============================================================

/** Coleta todos os planetas únicos mencionados em astrology de todas as áreas. */
export function getAllAstrologyPlanets(): string[] {
  const planets = new Set<string>();
  for (const area of Object.values(LIFE_AREAS)) {
    area.astrology.planets.forEach((p) => planets.add(p));
  }
  return Array.from(planets).sort();
}

/** Coleta todos os signos únicos mencionados em astrology de todas as áreas. */
export function getAllAstrologySigns(): string[] {
  const signs = new Set<string>();
  for (const area of Object.values(LIFE_AREAS)) {
    area.astrology.signs.forEach((s) => signs.add(s));
  }
  return Array.from(signs).sort();
}

/** Coleta todas as casas astrológicas únicas (números). */
export function getAllAstrologyHouses(): number[] {
  const houses = new Set<number>();
  for (const area of Object.values(LIFE_AREAS)) {
    area.astrology.houses.forEach((h) => houses.add(h));
  }
  return Array.from(houses).sort((a, b) => a - b);
}

/** Busca áreas que têm um planeta específico. */
export function getLifeAreasByPlanet(planet: string): LifeArea[] {
  return getAllLifeAreas().filter((area) =>
    area.astrology.planets.some((p) => p.toLowerCase() === planet.toLowerCase())
  );
}

/** Busca áreas que têm um signo específico. */
export function getLifeAreasBySign(sign: string): LifeArea[] {
  return getAllLifeAreas().filter((area) =>
    area.astrology.signs.some((s) => s.toLowerCase() === sign.toLowerCase())
  );
}

// ============================================================
// NUMEROLOGY UTILITIES
// ============================================================

/** Coleta todos os LifePath numbers únicos. */
export function getAllLifePathNumbers(): number[] {
  const numbers = new Set<number>();
  for (const area of Object.values(LIFE_AREAS)) {
    area.numerology.lifePath.forEach((n) => numbers.add(n));
  }
  return Array.from(numbers).sort((a, b) => a - b);
}

/** Coleta todos os números mestres únicos. */
export function getAllMasterNumbers(): number[] {
  const numbers = new Set<number>();
  for (const area of Object.values(LIFE_AREAS)) {
    area.numerology.masterNumbers.forEach((n) => numbers.add(n));
  }
  return Array.from(numbers).sort((a, b) => a - b);
}

/** Busca áreas por número de Life Path. */
export function getLifeAreasByLifePath(lifePath: number): LifeArea[] {
  return getAllLifeAreas().filter((area) => area.numerology.lifePath.includes(lifePath));
}

// ============================================================
// ODU UTILITIES
// ============================================================

/** Coleta todos os Odus primários únicos. */
export function getAllPrimaryOdus(): string[] {
  const odus = new Set<string>();
  for (const area of Object.values(LIFE_AREAS)) {
    area.odu.primaryOdus.forEach((o) => odus.add(o));
  }
  return Array.from(odus).sort();
}

/** Busca áreas que têm um Odu específico como primário. */
export function getLifeAreasByPrimaryOdu(odu: string): LifeArea[] {
  return getAllLifeAreas().filter((area) =>
    area.odu.primaryOdus.some((o) => o.toLowerCase() === odu.toLowerCase())
  );
}

/** Coleta todos os Ebós sugeridos únicos. */
export function getAllEboSuggestions(): string[] {
  const ebos = new Set<string>();
  for (const area of Object.values(LIFE_AREAS)) {
    area.odu.eboSuggestions.forEach((e) => ebos.add(e));
  }
  return Array.from(ebos).sort();
}

// ============================================================
// ORIXÁ UTILITIES
// ============================================================

/** Coleta todos os Orixás primários únicos. */
export function getAllPrimaryOrixas(): string[] {
  const orixas = new Set<string>();
  for (const area of Object.values(LIFE_AREAS)) {
    area.orixa.primary.forEach((o) => orixas.add(o));
  }
  return Array.from(orixas).sort();
}

/** Coleta todos os Orixás secundários únicos. */
export function getAllSecondaryOrixas(): string[] {
  const orixas = new Set<string>();
  for (const area of Object.values(LIFE_AREAS)) {
    area.orixa.secondary.forEach((o) => orixas.add(o));
  }
  return Array.from(orixas).sort();
}

/** Coleta todos os dias deOferecimento únicos. */
export function getAllOrixaDays(): string[] {
  const days = new Set<string>();
  for (const area of Object.values(LIFE_AREAS)) {
    area.orixa.days.forEach((d) => days.add(d));
  }
  return Array.from(days).sort();
}

/** Busca áreas associadas a um Orixá primário. */
export function getLifeAreasByOrixa(orixa: string): LifeArea[] {
  return getAllLifeAreas().filter((area) =>
    area.orixa.primary.some((o) => o.toLowerCase() === orixa.toLowerCase())
  );
}

// ============================================================
// CHAKRA UTILITIES
// ============================================================

/** Coleta todos os chakras primários únicos. */
export function getAllPrimaryChakras(): string[] {
  const chakras = new Set<string>();
  for (const area of Object.values(LIFE_AREAS)) {
    area.chakra.primary.forEach((c) => chakras.add(c));
  }
  return Array.from(chakras).sort();
}

/** Busca áreas por chakra primário. */
export function getLifeAreasByChakra(chakra: string): LifeArea[] {
  return getAllLifeAreas().filter((area) =>
    area.chakra.primary.some((c) => c.toLowerCase() === chakra.toLowerCase())
  );
}

// ============================================================
// ELEMENT UTILITIES
// ============================================================

/** Coleta todos os elementos primários únicos. */
export function getAllPrimaryElements(): string[] {
  const elements = new Set<string>();
  for (const area of Object.values(LIFE_AREAS)) {
    elements.add(area.element.primary);
  }
  return Array.from(elements).sort();
}

/** Coleta todos os elementos secundários únicos. */
export function getAllSecondaryElements(): string[] {
  const elements = new Set<string>();
  for (const area of Object.values(LIFE_AREAS)) {
    area.element.secondary.forEach((e) => elements.add(e));
  }
  return Array.from(elements).sort();
}

/** Busca áreas por elemento primário. */
export function getLifeAreasByElement(element: string): LifeArea[] {
  return getAllLifeAreas().filter(
    (area) =>
      area.element.primary.toLowerCase() === element.toLowerCase() ||
      area.element.secondary.some((e) => e.toLowerCase() === element.toLowerCase())
  );
}

// ============================================================
// PRACTICES & Crystals
// ============================================================

/** Coleta todas as práticas únicas. */
export function getAllPractices(): string[] {
  const practices = new Set<string>();
  for (const area of Object.values(LIFE_AREAS)) {
    area.practices.forEach((p) => practices.add(p));
  }
  return Array.from(practices).sort();
}

/** Coleta todos os cristais únicos. */
export function getAllCrystals(): string[] {
  const crystals = new Set<string>();
  for (const area of Object.values(LIFE_AREAS)) {
    area.crystals.forEach((c) => crystals.add(c));
  }
  return Array.from(crystals).sort();
}

/** Busca áreas que recomendam uma prática específica. */
export function getLifeAreasByPractice(practice: string): LifeArea[] {
  return getAllLifeAreas().filter((area) =>
    area.practices.some((p) => p.toLowerCase() === practice.toLowerCase())
  );
}

/** Busca áreas que usam um cristal específico. */
export function getLifeAreasByCrystal(crystal: string): LifeArea[] {
  return getAllLifeAreas().filter((area) =>
    area.crystals.some((c) => c.toLowerCase() === crystal.toLowerCase())
  );
}

// ============================================================
// CORRELATION ENGINE UTILITIES
// ============================================================

/**
 * Dado um planeta e um signo, retorna as áreas da vida que
 * são ativadas por ambos — útil para o correlation engine.
 */
export function getLifeAreasByPlanetAndSign(planet: string, sign: string): LifeArea[] {
  return getAllLifeAreas().filter(
    (area) =>
      area.astrology.planets.some((p) => p.toLowerCase() === planet.toLowerCase()) &&
      area.astrology.signs.some((s) => s.toLowerCase() === sign.toLowerCase())
  );
}

/**
 * Dado um Odu e um Orixá, retorna as áreas da vida que
 * são ativadas por ambos.
 */
export function getLifeAreasByOduAndOrixa(odu: string, orixa: string): LifeArea[] {
  return getAllLifeAreas().filter(
    (area) =>
      (area.odu.primaryOdus.some((o) => o.toLowerCase() === odu.toLowerCase()) ||
        area.odu.favorableOdus.some((o) => o.toLowerCase() === odu.toLowerCase())) &&
      (area.orixa.primary.some((o) => o.toLowerCase() === orixa.toLowerCase()) ||
        area.orixa.secondary.some((o) => o.toLowerCase() === orixa.toLowerCase()))
  );
}
