import type { Planeta, PosicaoPlaneta, Signo, Casa } from './tipos';

const DEG_TO_RAD = Math.PI / 180;
const RAD_TO_DEG = 180 / Math.PI;

export function toJulianDate(data: Date): number {
  const ano = data.getUTCFullYear();
  const mes = data.getUTCMonth() + 1;
  const dia = data.getUTCDate();
  const hora = data.getUTCHours() + data.getUTCMinutes() / 60 + data.getUTCSeconds() / 3600;

  const a = Math.floor((14 - mes) / 12);
  const y = ano + 4800 - a;
  const m = mes + 12 * a - 3;

  const jd = dia + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;

  return jd + hora / 24;
}

export function normalizeDegrees(degrees: number): number {
  let result = degrees % 360;
  if (result < 0) result += 360;
  return result;
}

export function getSigno(longitude: number): Signo {
  const signos: Signo[] = [
    'aries', 'touro', 'gemeos', 'cancer', 'leao', 'virgem',
    'libra', 'escorpio', 'sagitario', 'capricornio', 'aquario', 'peixes'
  ];
  const idx = Math.floor(longitude / 30) % 12;
  return signos[idx];
}

export function getGrauNoSigno(longitude: number): number {
  return longitude % 30;
}

function calcularSol(data: Date): { longitude: number; velocidade: number } {
  const jd = toJulianDate(data);
  const d = jd - 2451545.0;

  const L0 = 280.46646 + 0.9856474 * d;
  const g = 357.52911 + 0.98560028 * d;

  const L = normalizeDegrees(L0 + 1.915 * Math.sin(g * DEG_TO_RAD) + 0.020 * Math.sin(2 * g * DEG_TO_RAD));

  return { longitude: L, velocidade: 0.9856 };
}

function calcularLua(data: Date): { longitude: number; velocidade: number } {
  const jd = toJulianDate(data);
  const d = jd - 2451545.0;

  const L0 = 218.3165 + 481267.8813 * d / 1440;
  const M0 = 134.9634 + 477198.8675 * d / 1440;

  const L = normalizeDegrees(
    L0
    + 6.29 * Math.sin(M0 * DEG_TO_RAD)
    - 1.27 * Math.sin((M0 - 2 * L0) * DEG_TO_RAD)
    + 0.66 * Math.sin(2 * L0 * DEG_TO_RAD)
  );

  return { longitude: L, velocidade: 13.1764 };
}

function calcularPlaneta(
  data: Date,
  elementos: { L0: number; L1: number; Omega: number }
): { longitude: number; velocidade: number } {
  const jd = toJulianDate(data);
  const d = jd - 2451545.0;

  const L = elementos.L0 + elementos.L1 * d;
  const M = L - elementos.Omega;

  const C = 1.9148 * Math.sin(M * DEG_TO_RAD) + 0.0200 * Math.sin(2 * M * DEG_TO_RAD);

  const lambda = normalizeDegrees(L + C);

  return { longitude: lambda, velocidade: elementos.L1 };
}

const ELEMENTOS_ORBITAIS: Record<string, { L0: number; L1: number; Omega: number }> = {
  mercurio: { L0: 252.2509, L1: 149472.6746, Omega: 48.3313 },
  venus: { L0: 181.9798, L1: 58517.8157, Omega: 76.6799 },
  marte: { L0: 355.4330, L1: 19140.2993, Omega: 49.5574 },
  jupiter: { L0: 34.3515, L1: 3034.9057, Omega: 100.4644 },
  saturno: { L0: 50.0774, L1: 1222.1138, Omega: 113.6637 },
  urano: { L0: 314.0550, L1: 428.4669, Omega: 74.0005 },
  netuno: { L0: 304.3487, L1: 218.4822, Omega: 131.7846 },
  plutao: { L0: 238.9290, L1: 145.1839, Omega: 110.2991 },
};

const DISTANCIAS_APROX: Record<string, number> = {
  sol: 1.0,
  lua: 0.00257,
  mercurio: 0.387,
  venus: 0.723,
  marte: 1.524,
  jupiter: 5.203,
  saturno: 9.537,
  urano: 19.191,
  netuno: 30.069,
  plutao: 39.482,
};

export function calcularPosicao(planeta: Planeta, data: Date): PosicaoPlaneta {
  let longitude: number;
  let velocidade: number;
  let distancia: number;

  switch (planeta) {
    case 'sol':
      ({ longitude, velocidade } = calcularSol(data));
      distancia = 1.0;
      break;
    case 'lua':
      ({ longitude, velocidade } = calcularLua(data));
      distancia = 0.00257;
      break;
    case 'mercurio':
    case 'venus':
    case 'marte':
    case 'jupiter':
    case 'saturno':
    case 'urano':
    case 'netuno':
    case 'plutao':
      ({ longitude, velocidade } = calcularPlaneta(data, ELEMENTOS_ORBITAIS[planeta]));
      distancia = DISTANCIAS_APROX[planeta];
      break;
    case 'node_norte':
    case 'node_sul':
      longitude = calcularLua(data).longitude + 180;
      velocidade = 0;
      distancia = 0.00257;
      break;
    case 'quiron':
      longitude = calcularPlaneta(data, { L0: 180, L1: 45, Omega: 0 }).longitude;
      velocidade = 45;
      distancia = 12.5;
      break;
    default:
      longitude = 0;
      velocidade = 0;
      distancia = 0;
  }

  longitude = normalizeDegrees(longitude);

  return {
    planeta,
    longitude,
    latitude: 0,
    distancia,
    velocidade,
    signo: getSigno(longitude),
    casa: 0,
    grauNoSigno: getGrauNoSigno(longitude),
  };
}

export function calcularCasas(
  data: Date,
  latitude: number,
  longitude: number
): { casas: Casa[]; ascendente: number; mediumCoeli: number } {
  const jd = toJulianDate(data);
  const d = jd - 2451545.0;

  let theta = 280.46061837 + 360.98564736629 * d;
  theta = normalizeDegrees(theta);

  let ascendente = Math.atan2(
    Math.sin((theta + longitude) * DEG_TO_RAD),
    Math.cos(latitude * DEG_TO_RAD) * Math.cos((theta + longitude) * DEG_TO_RAD)
  ) * RAD_TO_DEG;

  ascendente = normalizeDegrees(ascendente + 180);

  let mc = Math.atan2(
    -Math.sin(latitude * DEG_TO_RAD),
    Math.cos((theta + longitude) * DEG_TO_RAD)
  ) * RAD_TO_DEG;

  mc = normalizeDegrees(mc);

  const casas: Casa[] = [];

  for (let i = 0; i < 12; i++) {
    const grau = normalizeDegrees(calcularGrauCasa(i, ascendente, mc));
    casas.push({
      numero: i + 1,
      signo: getSigno(grau),
      grauNoSigno: getGrauNoSigno(grau),
      planetaRegente: null,
    });
  }
  return { casas, ascendente, mediumCoeli: mc };
  return { casas, ascendente, mediumCoeli: mc };
}
/**
 * Calculate the degree for a specific house based on quadrant logic.
 * House indices: 0-2 (1st quadrant), 3-5 (2nd), 6-8 (3rd), 9-11 (4th)
 */
function calcularGrauCasa(houseIndex: number, ascendente: number, mc: number): number {
  const quadrant = Math.floor(houseIndex / 3);
  const factor = ((houseIndex % 3) + 1) / 3;
  const [startAngle, endAngle] = getQuadrantAngles(quadrant, ascendente, mc);
  let diff = endAngle - startAngle;
  if (diff < 0) diff += 360;
  return startAngle + diff * factor;
}
function getQuadrantAngles(
  quadrant: number,
  ascendente: number,
  mc: number
): [number, number] {
  switch (quadrant) {
    case 0: return [ascendente, mc];
    case 1: return [mc, ascendente + 180];
    case 2: return [ascendente + 180, mc + 180];
    case 3: return [mc + 180, ascendente];
    default: return [ascendente, mc];
  }
}