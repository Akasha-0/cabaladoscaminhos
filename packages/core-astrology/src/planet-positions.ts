/* eslint-disable @typescript-eslint/no-unused-vars */

/* prettier-ignore */

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

/**
 * 13 planet bodies used by the simplified ephemeris stub.
 *
 * IMPORTANT: `node_sul` is intentionally NOT listed — it's the south
 * lunar node, always 180° opposite to `node_norte`, so it can be
 * derived at consumption time. Including it would create a duplicate
 * position entry (since `calcularPosicao('node_sul', date)` would be
 * called and stored, but `node_sul` is mathematically the inverse of
 * `node_norte`). Callers that need south node should compute
 * `(node_norte + 180) % 360`.
 *
 * @see tests/calculators/birth-chart-precision.test.ts ("nodes are
 *      exactly 180° apart")
 */
const THIRTEEN_PLANETS: Planeta[] = [
  'sol',
  'lua',
  'mercurio',
  'venus',
  'marte',
  'jupiter',
  'saturno',
  'urano',
  'netuno',
  'plutao',
  'node_norte',
  'chiron',
  'lilith',
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

function isRetrograde(planeta: Planeta, data: Date): boolean {
  // Chiron, Lilith, luminaries, and nodes are never retrograde
  if (
    planeta === 'sol'
    || planeta === 'lua'
    || planeta === 'node_norte'
    || planeta === 'node_sul'
    || planeta === 'chiron'
    || planeta === 'lilith'
  ) {
    return false;
  }

  const orbKey = planeta as keyof typeof RETROGRADE_ORBS;
  const orb = RETROGRADE_ORBS[orbKey] ?? 0.15;

  const current = calcularPosicao(planeta, data);
  const tomorrow = new Date(data.getTime() + 86400000);
  const tomorrowPos = calcularPosicao(planeta, tomorrow);
  const yesterday = new Date(data.getTime() - 86400000);
  const yesterdayPos = calcularPosicao(planeta, yesterday);

  const speed = (current.longitude - tomorrowPos.longitude + 360) % 360;
  const prevSpeed = (yesterdayPos.longitude - current.longitude + 360) % 360;
  const accel = prevSpeed - speed;

  return accel < -orb && speed < 0.5;
}

export function getPositions(date: Date): PlanetPosition[] {
  return THIRTEEN_PLANETS.map((planet) => {
    const pos = calcularPosicao(planet, date);
    return {
      planet,
      longitude: pos.longitude,
      sign: pos.signo,
      degree: pos.grauNoSigno,
      latitude: pos.latitude,
      distance: pos.distancia,
      velocity: pos.velocidade,
      retrograde: isRetrograde(planet, date),
    };
  });
}
