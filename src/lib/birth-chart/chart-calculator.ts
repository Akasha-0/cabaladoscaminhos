/**
 * Chart Calculator Module
 * Calculates birth chart positions and derived data.
 */

import type { MapaNatal, PosicaoPlaneta, Planeta, Signo } from '../astrologia/tipos';
import { calcularMapaNatal } from '../astrologia/planetas/posicoes';

export interface CalculoCartaOptions {
  dataNascimento: Date;
  horaNascimento: string;
  latitude: number;
  longitude: number;
}

export interface PlanetaComAspecto {
  planeta: keyof MapaNatal['planeta'];
  posicao: PosicaoPlaneta;
  dominancia: number;
}

/**
 * Calculate a birth chart from birth data.
 */
export function calculate(
  dataNascimento: Date,
  horaNascimento: string,
  latitude: number,
  longitude: number
): MapaNatal {
  return calcularMapaNatal(dataNascimento, horaNascimento, latitude, longitude);
}

/**
 * Calculate a birth chart from options object.
 */
export function calculateFromOptions(options: CalculoCartaOptions): MapaNatal {
  return calculate(
    options.dataNascimento,
    options.horaNascimento,
    options.latitude,
    options.longitude
  );
}

/**
 * Get all planet positions as an array.
 */
export function getPlanetPositions(chart: MapaNatal): PosicaoPlaneta[] {
  return Object.values(chart.planeta);
}

/**
 * Get planet position by name.
 */
export function getPlanetPosition(chart: MapaNatal, planeta: Planeta): PosicaoPlaneta | undefined {
  return chart.planeta[planeta as keyof MapaNatal['planeta']];
}

/**
 * Calculate the dominant element in the chart.
 */
export function getDominantElement(chart: MapaNatal): { elemento: string; count: number } {
  const elementos: Record<string, number> = {
    fogo: 0,
    terra: 0,
    ar: 0,
    agua: 0,
  };

  const elementoPorSigno: Record<Signo, string> = {
    aries: 'fogo',
    leao: 'fogo',
    sagitario: 'fogo',
    touro: 'terra',
    virgem: 'terra',
    capricornio: 'terra',
    gemeos: 'ar',
    libra: 'ar',
    aquario: 'ar',
    cancer: 'agua',
    escorpio: 'agua',
    peixes: 'agua',
  };

  for (const posicao of getPlanetPositions(chart)) {
    const elemento = elementoPorSigno[posicao.signo];
    elementos[elemento]++;
  }

  let maxElemento = 'fogo';
  let maxCount = 0;
  for (const [elemento, count] of Object.entries(elementos)) {
    if (count > maxCount) {
      maxCount = count;
      maxElemento = elemento;
    }
  }

  return { elemento: maxElemento, count: maxCount };
}

/**
 * Calculate chart dominance by planet.
 */
export function getDominantPlanet(chart: MapaNatal): { planeta: Planeta; count: number } | null {
  const contagens: Record<string, number> = {};

  for (const posicao of getPlanetPositions(chart)) {
    contagens[posicao.planeta] = (contagens[posicao.planeta] || 0) + 1;
  }

  let maxPlaneta: Planeta = 'sol';
  let maxCount = 0;
  for (const [planeta, count] of Object.entries(contagens)) {
    if (count > maxCount) {
      maxCount = count;
      maxPlaneta = planeta as Planeta;
    }
  }

  return maxCount > 0 ? { planeta: maxPlaneta, count: maxCount } : null;
}

/**
 * Calculate essential dignity scores for planets.
 */
export function getEssentialDignities(chart: MapaNatal): Record<Planeta, number> {
  const dignidades: Record<Planeta, number> = {
    sol: 0,
    lua: 0,
    mercurio: 0,
    venus: 0,
    marte: 0,
    jupiter: 0,
    saturno: 0,
    urano: 0,
    netuno: 0,
    plutao: 0,
    node_norte: 0,
    node_sul: 0,
    quiron: 0,
  };

  const dignidadesPorSigno: Record<Signo, { dignidade: number; exaltação: number }> = {
    aries: { dignidade: 1, exaltação: 10 },
    touro: { dignidade: 1, exaltação: 9 },
    gemeos: { dignidade: 1, exaltação: 8 },
    cancer: { dignidade: 1, exaltação: 7 },
    leao: { dignidade: 1, exaltação: 6 },
    virgem: { dignidade: 1, exaltação: 5 },
    libra: { dignidade: 1, exaltação: 4 },
    escorpio: { dignidade: 1, exaltação: 3 },
    sagitario: { dignidade: 1, exaltação: 2 },
    capricornio: { dignidade: 1, exaltação: 1 },
    aquario: { dignidade: 1, exaltação: 0 },
    peixes: { dignidade: 1, exaltação: 0 },
  };

  const regentes: Record<Signo, Planeta> = {
    aries: 'marte',
    touro: 'venus',
    gemeos: 'mercurio',
    cancer: 'lua',
    leao: 'sol',
    virgem: 'mercurio',
    libra: 'venus',
    escorpio: 'marte',
    sagitario: 'jupiter',
    capricornio: 'saturno',
    aquario: 'saturno',
    peixes: 'jupiter',
  };

  for (const [planeta, posicao] of Object.entries(chart.planeta)) {
    const p = planeta as Planeta;
    const dig = dignidadesPorSigno[posicao.signo];
    const planetaRegente = regentes[posicao.signo];

    if (p === planetaRegente) {
      dignidades[p] += 5;
    }
    if (dig.exaltação > 0) {
      dignidades[p] += dig.exaltação;
    }
  }

  return dignidades;
}

/**
 * Get planetary modes (cardinal, fixed, mutable).
 */
export function getPlanetaryModes(chart: MapaNatal): Record<string, number> {
  const modos: Record<string, number> = {
    cardinal: 0,
    fixed: 0,
    mutable: 0,
  };

  const modoPorSigno: Record<Signo, string> = {
    aries: 'cardinal',
    touro: 'fixed',
    gemeos: 'mutable',
    cancer: 'cardinal',
    leao: 'fixed',
    virgem: 'mutable',
    libra: 'cardinal',
    escorpio: 'fixed',
    sagitario: 'mutable',
    capricornio: 'cardinal',
    aquario: 'fixed',
    peixes: 'mutable',
  };

  for (const posicao of getPlanetPositions(chart)) {
    const modo = modoPorSigno[posicao.signo];
    modos[modo]++;
  }

  return modos;
}