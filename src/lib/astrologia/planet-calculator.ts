// fallow-ignore-file unused-file
import { calcularPosicao, getSigno, getGrauNoSigno } from './swiss-ephemeris';
import type { Planeta, Signo } from './tipos';

export interface PlanetPosition {
  planet: Planeta;
  longitude: number;
  sign: Signo;
  degree: number;
  latitude: number;
  distance: number;
  velocity: number;
  retrograde: boolean;
}

export interface PlanetPositionsResult {
  date: Date;
  planets: Record<Planeta, PlanetPosition>;
}

const CLASSICAL_PLANETS: Planeta[] = [
  'sol', 'lua', 'mercurio', 'venus', 'marte',
  'jupiter', 'saturno', 'urano', 'netuno', 'plutao'
];

const RETROGRADE_ORBS: Partial<Record<Planeta, number>> = {
  mercurio: 0.15,
  venus: 0.15,
  marte: 0.15,
  jupiter: 0.10,
  saturno: 0.10,
  urano: 0.10,
  netuno: 0.10,
  plutao: 0.10,
};

function getSunLongitude(data: Date): number {
  const pos = calcularPosicao('sol', data);
  return pos.longitude;
}

// fallow-ignore-next-line complexity
function isRetrograde(planeta: Planeta, data: Date): boolean {
  if (planeta === 'sol' || planeta === 'lua' || planeta === 'node_norte' || planeta === 'node_sul') {
    return false;
  }

  const orb = RETROGRADE_ORBS[planeta] ?? 0.15;

  const day = 1 / 1440;
  const pos0 = calcularPosicao(planeta, data);
  const pos1 = calcularPosicao(planeta, new Date(data.getTime() - day * 86400000));
  const pos2 = calcularPosicao(planeta, new Date(data.getTime() + day * 86400000));

  const speed0 = (pos0.longitude - pos1.longitude + 360) % 360;
  const speed1 = (pos2.longitude - pos0.longitude + 360) % 360;
  const accel = speed1 - speed0;

  return accel < -orb && speed0 < 0.5;
}

function calculateSinglePosition(
  planeta: Planeta,
  data: Date,
  sunLongitude: number
): PlanetPosition {
  const helio = calcularPosicao(planeta, data);

  let longitude: number;
  if (planeta === 'sol' || planeta === 'lua') {
    longitude = helio.longitude;
  } else {
    longitude = helio.longitude - sunLongitude;
    if (longitude < 0) longitude += 360;
    if (longitude >= 360) longitude -= 360;
  }

  const sign = getSigno(longitude);
  const degree = getGrauNoSigno(longitude);
  const retrograde = isRetrograde(planeta, data);

  return {
    planet: planeta,
    longitude,
    sign,
    degree,
    latitude: helio.latitude,
    distance: helio.distancia,
    velocity: helio.velocidade,
    retrograde
  };
}

export function calculatePlanetPositions(data: Date): PlanetPositionsResult {
  const sunLongitude = getSunLongitude(data);

  const positions: Record<Planeta, PlanetPosition> = {} as Record<Planeta, PlanetPosition>;

  for (const planeta of CLASSICAL_PLANETS) {
    positions[planeta] = calculateSinglePosition(planeta, data, sunLongitude);
  }

  const nodeNorthLon = positions.lua.longitude - 180;
  const nodeNorthNormalized = nodeNorthLon < 0 ? nodeNorthLon + 360 : nodeNorthLon;

  positions.node_norte = {
    planet: 'node_norte',
    longitude: nodeNorthNormalized,
    sign: getSigno(nodeNorthNormalized),
    degree: getGrauNoSigno(nodeNorthNormalized),
    latitude: 0,
    distance: 0,
    velocity: 0,
    retrograde: false
  };

  positions.node_sul = {
    planet: 'node_sul',
    longitude: (nodeNorthNormalized + 180) % 360,
    sign: getSigno((nodeNorthNormalized + 180) % 360),
    degree: getGrauNoSigno((nodeNorthNormalized + 180) % 360),
    latitude: 0,
    distance: 0,
    velocity: 0,
    retrograde: false
  };

  return {
    date: new Date(data),
    planets: positions
  };
}

export function getPlanetSign(planeta: Planeta, result: PlanetPositionsResult): Signo {
  return result.planets[planeta].sign;
}

export function getPlanetDegree(planeta: Planeta, result: PlanetPositionsResult): number {
  return result.planets[planeta].degree;
}

export function getPlanetLongitude(planeta: Planeta, result: PlanetPositionsResult): number {
  return result.planets[planeta].longitude;
}

export function isPlanetRetrograde(planeta: Planeta, result: PlanetPositionsResult): boolean {
  return result.planets[planeta].retrograde;
}