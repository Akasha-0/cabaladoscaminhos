/* eslint-disable @typescript-eslint/no-explicit-any */
 
/* prettier-ignore */

import { getPositions, type PlanetPosition } from './planet-positions';
import { calculateHouses, type HouseSystem } from './houses';
import { findAspects } from './aspect-finder';
import type { Aspecto } from './tipos';
import type { MapaNatal, Planeta, Signo } from './tipos';

export interface BirthChartInput {
  birthDate: Date;
  latitude: number;
  longitude: number;
  houseSystem?: HouseSystem;
}

export interface BirthChart {
  planets: PlanetPosition[];
  houses: { number: number; cusp: number }[];
  ascendant: number;
  midheaven: number;
  aspects: Aspecto[];
  chart: MapaNatal;
}

function getPlanetInHouse(planetLongitude: number, houseCusps: number[]): number {
  for (let i = 0; i < 12; i++) {
    const cuspStart = houseCusps[i];
    const cuspEnd = houseCusps[(i + 1) % 12];
    const normalizedPlanet = ((planetLongitude % 360) + 360) % 360;
    const normalizedCuspStart = ((cuspStart % 360) + 360) % 360;
    const normalizedCuspEnd = ((cuspEnd % 360) + 360) % 360;

    if (normalizedCuspEnd > normalizedCuspStart) {
      if (normalizedPlanet >= normalizedCuspStart && normalizedPlanet < normalizedCuspEnd) {
        return i + 1;
      }
    } else {
      if (normalizedPlanet >= normalizedCuspStart || normalizedPlanet < normalizedCuspEnd) {
        return i + 1;
      }
    }
  }
  return 1;
}

function getSignoFromLongitude(longitude: number): Signo {
  const signIndex = Math.floor(longitude / 30);
  const signs: Signo[] = [
    'aries', 'touro', 'gemeos', 'cancer',
    'leao', 'virgem', 'libra', 'escorpio',
    'sagitario', 'capricornio', 'aquario', 'peixes'
  ];
  return signs[signIndex % 12];
}

function getGrauNoSigno(longitude: number): number {
  return Math.floor(longitude % 30) + 1;
}

function getPlanetSignAndDegree(planet: PlanetPosition): { sign: Signo; degree: number } {
  return {
    sign: getSignoFromLongitude(planet.longitude),
    degree: getGrauNoSigno(planet.longitude)
  };
}

function findRegent(sign: Signo, planets: PlanetPosition[]): Planeta | null {
  const rulers: Record<Signo, Planeta> = {
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
    peixes: 'jupiter'
  };

  const ruler = rulers[sign];
  const rulerInChart = planets.find(p => p.planet === ruler);
  return rulerInChart ? ruler : null;
}

export function getBirthChart(input: BirthChartInput): BirthChart {
  const { birthDate, latitude, longitude, houseSystem = 'placidus' } = input;

  const planets = getPositions(birthDate);
  const houses = calculateHouses(birthDate, birthDate, latitude, longitude, houseSystem);

  const houseCusps = houses.cusps.map(c => c.longitude);
  const planetPositions: any[] = planets.map(p => {
    const { sign, degree } = getPlanetSignAndDegree(p);
    return {
      planeta: p.planet,
      longitude: p.longitude,
      latitude: p.latitude,
      distancia: p.distance,
      velocidade: p.velocity,
      signo: sign,
      casa: getPlanetInHouse(p.longitude, houseCusps),
      grauNoSigno: degree
    };
  });

  const aspects = findAspects(planetPositions);

  const chartHouses: any[] = Array.from({ length: 12 }, (_, i) => {
    const cusp = houses.cusps[i];
    const { sign, degree } = {
      sign: getSignoFromLongitude(cusp.longitude),
      degree: getGrauNoSigno(cusp.longitude)
    };
    const planetaRegente = findRegent(sign, planets);
    return {
      numero: i + 1,
      signo: sign,
      grauNoSigno: degree,
      planetaRegente
    };
  });

  const planetMap: Record<string, any> = {};
  for (const p of planetPositions) {
    planetMap[p.planeta] = p;
  }

  const chart: MapaNatal = {
    usuarioId: '',
    dataCalculo: new Date(),
    planeta: {
      sol: planetMap.sol,
      lua: planetMap.lua,
      mercurio: planetMap.mercurio,
      venus: planetMap.venus,
      marte: planetMap.marte,
      jupiter: planetMap.jupiter,
      saturno: planetMap.saturno,
      urano: planetMap.urano,
      netuno: planetMap.netuno,
      plutao: planetMap.plutao
    },
    casas: chartHouses,
    ascendente: houses.asc,
    mediumCoeli: houses.mc,
    nodes: {
      norte: planetMap.node_norte,
      sul: planetMap.node_sul
    }
  };

  return {
    planets,
    houses: houses.cusps.map(c => ({ number: c.number, cusp: c.longitude })),
    ascendant: houses.asc,
    midheaven: houses.mc,
    aspects,
    chart
  };
}
