/**
 * Birth Chart Generator
 * Simplified ephemeris calculations for natal chart creation.
 */

import { calcularPosicao, calcularCasas, normalizeDegrees } from '../swiss-ephemeris';
import { calcularAspectos } from '../planetas/aspectos';
import type {
  MapaNatal,
  PosicaoPlaneta,
  Casa,
  Aspecto,
  AspectoTipo,
  Planeta,
  Signo
} from '../tipos';

export interface ChartPlanet {
  name: Planeta;
  sign: Signo;
  degree: number;
  house: number;
}

export interface ChartAspect {
  planet1: Planeta;
  planet2: Planeta;
  type: AspectoTipo;
  orb: number;
}

export interface BirthChart {
  planets: {
    sol: ChartPlanet;
    lua: ChartPlanet;
    mercurio: ChartPlanet;
    venus: ChartPlanet;
    marte: ChartPlanet;
    jupiter: ChartPlanet;
    saturno: ChartPlanet;
  };
  signs: Record<Planeta, Signo>;
  houses: Casa[];
  aspects: ChartAspect[];
  ascendente: number;
  mediumCoeli: number;
}

/**
 * Generate a birth chart from birth data.
 * 
 * @param birthDate - Date of birth (Date or string in ISO format)
 * @param birthTime - Time of birth in HH:MM format (24-hour)
 * @param latitude - Latitude of birth location
 * @param longitude - Longitude of birth location
 * @returns Complete birth chart with planet positions, signs, houses, and aspects
 */
export function generateBirthChart(
  birthDate: Date | string,
  birthTime: string,
  latitude: number,
  longitude: number
): BirthChart {
  const date = birthDate instanceof Date ? birthDate : new Date(birthDate);
  
  const [hours, minutes] = birthTime.split(':').map(Number);
  const dateTime = new Date(date);
  dateTime.setHours(hours, minutes, 0, 0);

  // Calculate houses
  const { casas, ascendente, mediumCoeli } = calcularCasas(dateTime, latitude, longitude);

  // Planets to calculate
  const planetKeys: Planeta[] = [
    'sol', 'lua', 'mercurio', 'venus', 'marte', 'jupiter', 'saturno'
  ];

  // Calculate positions for each planet
  const positions: Map<Planeta, PosicaoPlaneta> = new Map();

  for (const planeta of planetKeys) {
    const posicao = calcularPosicao(planeta, dateTime);
    posicao.casa = determineHouse(posicao.longitude, casas);
    positions.set(planeta, posicao);
  }

  // Build chart planets
  const planets: BirthChart['planets'] = {
    sol: buildChartPlanet(positions.get('sol')!),
    lua: buildChartPlanet(positions.get('lua')!),
    mercurio: buildChartPlanet(positions.get('mercurio')!),
    venus: buildChartPlanet(positions.get('venus')!),
    marte: buildChartPlanet(positions.get('marte')!),
    jupiter: buildChartPlanet(positions.get('jupiter')!),
    saturno: buildChartPlanet(positions.get('saturno')!),
  };

  // Build signs record
  const signs: Record<Planeta, Signo> = {} as Record<Planeta, Signo>;
  for (const planeta of planetKeys) {
    signs[planeta] = positions.get(planeta)!.signo;
  }

  // Calculate aspects between all calculated planets
  const positionsArray = Array.from(positions.values());
  const aspectos = calcularAspectos(positionsArray);

  // Convert to chart format
  const chartAspects: ChartAspect[] = aspectos.map(a => ({
    planet1: a.planeta1,
    planet2: a.planeta2,
    type: a.tipo,
    orb: a.orb,
  }));

  return {
    planets,
    signs,
    houses: casas,
    aspects: chartAspects,
    ascendente,
    mediumCoeli,
  };
}

function buildChartPlanet(posicao: PosicaoPlaneta): ChartPlanet {
  return {
    name: posicao.planeta,
    sign: posicao.signo,
    degree: posicao.grauNoSigno,
    house: posicao.casa,
  };
}

function determineHouse(longitude: number, casas: Casa[]): number {
  for (let i = 0; i < 12; i++) {
    const houseStart = casas[i].grauNoSigno;
    const houseEnd = casas[(i + 1) % 12].grauNoSigno;

    if (houseEnd > houseStart) {
      if (longitude >= houseStart && longitude < houseEnd) return i + 1;
    } else {
      if (longitude >= houseStart || longitude < houseEnd) return i + 1;
    }
  }
  return 1;
}