import { calcularPosicao, getSigno, getGrauNoSigno, toJulianDate } from '../swiss-ephemeris';
import type { Planeta, Signo } from '../tipos';

const CLASSICAL_PLANETS: Planeta[] = [
  'sol', 'lua', 'mercurio', 'venus', 'marte',
  'jupiter', 'saturno'
];

const RETROGRADE_ORBS: Partial<Record<Planeta, number>> = {
  mercurio: 0.15,
  venus: 0.15,
  marte: 0.15,
  jupiter: 0.10,
  saturno: 0.10,
};

export interface PlanetaryPosition {
  planet: Planeta;
  sign: Signo;
  degree: number;
  retrograde: boolean;
}

// fallow-ignore-next-line complexity
function isRetrograde(planeta: Planeta, data: Date): boolean {
  if (planeta === 'sol' || planeta === 'lua') {
    return false;
  }

  if (planeta === 'node_norte') {
    return false;
  }

  const orbKey = planeta as keyof typeof RETROGRADE_ORBS;
  const orb = RETROGRADE_ORBS[orbKey] ?? 0.15;

  const jd = toJulianDate(data);
  const days = [1, 0, -1].map(d => jd + d);

  const positions = days.map(d => {
    const date = new Date((d - 2440587.5) * 86400000);
    return calcularPosicao(planeta, date);
  });

  const d0 = positions[1].longitude;
  const d1 = positions[2].longitude;
  const d2 = positions[0].longitude;

  const speed = (d0 - d1 + 360) % 360;
  const accel = ((d2 - d0 + 360) % 360) - ((d0 - d1 + 360) % 360);

  if (accel < -orb && speed < 0.5) {
    return true;
  }

  return false;
}

export function getPlanetaryPositions(data: Date): PlanetaryPosition[] {
  const positions: PlanetaryPosition[] = [];

  for (const planeta of CLASSICAL_PLANETS) {
    const pos = calcularPosicao(planeta, data);
    positions.push({
      planet: planeta,
      sign: getSigno(pos.longitude),
      degree: getGrauNoSigno(pos.longitude) + 1,
      retrograde: isRetrograde(planeta, data),
    });
  }

  const luaPos = calcularPosicao('lua', data);
  positions.push({
    planet: 'node_norte',
    sign: getSigno(luaPos.longitude),
    degree: getGrauNoSigno(luaPos.longitude) + 1,
    retrograde: false,
  });

  return positions;
}