 
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
  const hora =
    data.getUTCHours() +
    data.getUTCMinutes() / 60 +
    data.getUTCSeconds() / 3600;

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

// fallow-ignore-next-line complexity
function calculatePlacidus(
  jd: number,
  latitude: number,
  longitude: number
): { houses: number[]; asc: number; mc: number } {
  const d = jd - 2451545.0;

  let theta = 280.46061837 + 360.98564736629 * d;
  theta = normalizeDegrees(theta);

  // ASC
  let ascendente = Math.atan2(
    Math.sin((theta + longitude) * DEG_TO_RAD),
    Math.cos(latitude * DEG_TO_RAD) * Math.cos((theta + longitude) * DEG_TO_RAD)
  ) * RAD_TO_DEG;
  ascendente = normalizeDegrees(ascendente + 180);

  // MC
  let mc = Math.atan2(
    -Math.sin(latitude * DEG_TO_RAD),
    Math.cos((theta + longitude) * DEG_TO_RAD)
  ) * RAD_TO_DEG;
  mc = normalizeDegrees(mc);

  // Houses via quadrant interpolation
  const houses: number[] = [];

  for (let i = 0; i < 12; i++) {
    let grau: number;

    if (i < 3) {
      const factor = (i + 1) / 3;
      const startAngle = ascendente;
      const endAngle = mc;
      let diff = endAngle - startAngle;
      if (diff < 0) diff += 360;
      grau = startAngle + diff * factor;
    } else if (i < 6) {
      const factor = (i - 2) / 3;
      const startAngle = mc;
      const endAngle = ascendente + 180;
      let diff = endAngle - startAngle;
      if (diff < 0) diff += 360;
      grau = startAngle + diff * factor;
    } else if (i < 9) {
      const factor = (i - 5) / 3;
      const startAngle = ascendente + 180;
      const endAngle = mc + 180;
      let diff = endAngle - startAngle;
      if (diff < 0) diff += 360;
      grau = startAngle + diff * factor;
    } else {
      const factor = (i - 8) / 3;
      const startAngle = mc + 180;
      const endAngle = ascendente;
      let diff = endAngle - startAngle;
      if (diff < 0) diff += 360;
      grau = startAngle + diff * factor;
    }

    houses.push(normalizeDegrees(grau));
  }

  return { houses, asc: ascendente, mc };
}

function calculateWholeSign(
  asc: number
): { houses: number[]; asc: number; mc: number } {
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
