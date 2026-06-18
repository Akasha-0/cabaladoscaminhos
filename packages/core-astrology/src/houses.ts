// tslint:disable

export type HouseSystem = 'placidus' | 'whole_sign';

export interface HouseCusp {
  number: number;
  longitude: number;
}

export interface Houses {
  cusps: HouseCusp[];
  asc: number;
  dsc: number;
  mc: number;
  ic: number;
}

const DEG_TO_RAD = Math.PI / 180;
const RAD_TO_DEG = 180 / Math.PI;

function normalizeDegrees(degrees: number): number {
  degrees = degrees % 360;
  return degrees < 0 ? degrees + 360 : degrees;
}

function toJulianDate(data: Date): number {
  const ano = data.getUTCFullYear();
  const mes = data.getUTCMonth() + 1;
  const dia = data.getUTCDate();
  const hora = data.getUTCHours() + data.getUTCMinutes() / 60 + data.getUTCSeconds() / 3600;

  const a = Math.floor((14 - mes) / 12);
  const y = ano + 4800 - a;
  const m = mes + 12 * a - 3;

  const jd =
    dia +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045;

  return jd + hora / 24;
}

function calculatePlacidus(
  jd: number,
  latitude: number,
  longitude: number
): { houses: number[]; asc: number; mc: number } {
  const d = jd - 2451545.0;

  let theta = 280.46061837 + 360.98564736629 * d;
  theta = normalizeDegrees(theta);

  // ASC
  let ascendente =
    Math.atan2(
      Math.sin((theta + longitude) * DEG_TO_RAD),
      Math.cos(latitude * DEG_TO_RAD) * Math.cos((theta + longitude) * DEG_TO_RAD)
    ) * RAD_TO_DEG;
  ascendente = normalizeDegrees(ascendente + 180);

  // MC
  let mc =
    Math.atan2(-Math.sin(latitude * DEG_TO_RAD), Math.cos((theta + longitude) * DEG_TO_RAD)) *
    RAD_TO_DEG;
  mc = normalizeDegrees(mc);

  // Houses: ASC is house 1, MC is house 10. Other cusps evenly interpolated
  // (this is a simplified equal-house approach used by the swiss-ephemeris stub;
  // a real Placidus implementation lives in a separate module).
  const houses: number[] = new Array(12);
  houses[0] = ascendente;
  houses[9] = mc;
  for (let i = 0; i < 12; i++) {
    if (i === 0 || i === 9) continue;
    let grau: number;

    if (i < 9) {
      const factor = i / 9;
      let diff = mc - ascendente;
      if (diff < 0) diff += 360;
      grau = ascendente + diff * factor;
    } else {
      const factor = (i - 9) / 3;
      let diff = ascendente + 360 - mc;
      if (diff < 0) diff += 360;
      grau = mc + diff * factor;
    }

    houses[i] = normalizeDegrees(grau);
  }

  return { houses, asc: ascendente, mc };
}

function calculateWholeSign(asc: number): { houses: number[]; asc: number; mc: number } {
  // Whole Sign houses: each house = 30° starting from ASC
  const houses: number[] = [];
  for (let i = 0; i < 12; i++) {
    houses.push((asc + i * 30) % 360);
  }
  return { houses, asc, mc: (asc + 270) % 360 };
}

export function calculateHouses(
  birthDate: Date,
  birthTime: Date,
  latitude: number,
  longitude: number,
  system: HouseSystem = 'placidus'
): Houses {
  const jd = toJulianDate(birthTime);

  let result: { houses: number[]; asc: number; mc: number };

  if (system === 'whole_sign') {
    const { asc, mc } = calculatePlacidus(jd, latitude, longitude);
    result = calculateWholeSign(asc);
    result.mc = mc;
  } else {
    result = calculatePlacidus(jd, latitude, longitude);
  }

  const asc = result.asc;
  const dsc = (asc + 180) % 360;
  const mc = result.mc;
  const ic = (mc + 180) % 360;

  return {
    cusps: result.houses.map((longitude, i) => ({
      number: i + 1,
      longitude,
    })),
    asc,
    dsc,
    mc,
    ic,
  };
}
