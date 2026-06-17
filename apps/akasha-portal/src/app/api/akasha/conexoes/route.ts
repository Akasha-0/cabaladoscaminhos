import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAkashaApi } from '@/lib/application/auth/akasha-guard';
import { prisma } from '@/lib/infrastructure/prisma';
import type { Prisma } from '@prisma/client';
import { geocodeCity } from '@/lib/infrastructure/geocoding/nominatim';
import type { ConexaoMap, ConexaoResult, AkashaAuthorityInput } from '@akasha/core';
import { compareAkashaMaps } from '@akasha/core';
import { buildKabalisticMap } from '@akasha/core-cabala';
import { buildTantricMap } from '@akasha/core-tantra';
import { calculateBirthOdu } from '@akasha/core-odus';
import { getBirthChart } from '@akasha/core-astrology';
import type { KabalisticMap, TantricMap, OduBirth, AstrologyMap } from '@akasha/types';

// ─── Validation schema ────────────────────────────────────────────────────────

const CreateConexaoSchema = z.object({
  otherName: z.string().min(1).max(200),
  otherBirthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'YYYY-MM-DD'),
  otherBirthTime: z.string().optional(), // 'HH:mm' or 'HH:mm:ss'
  otherBirthCity: z.string().max(200).optional(),
  otherBirthLatitude: z.number().optional(),
  otherBirthLongitude: z.number().optional(),
  otherBirthTimezone: z.string().optional(),
});

// ─── Default authority when not derivable from chart ──────────────────────────

const DEFAULT_AUTHORITY: AkashaAuthorityInput = {
  estrategia: 'observe',
  autoridade: 'mental',
};

// ─── Default São Paulo coordinates (used when no city geocoding) ─────────────

const DEFAULT_LAT = -23.5505;
const DEFAULT_LNG = -46.6333;

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Builds the ConexaoMap for a person given their name, birthDate string,
 * and raw map data already computed from the engines.
 */
function buildConexaoMap(
  name: string,
  birthDate: string,
  kabalisticMap: KabalisticMap,
  astrologyMap: AstrologyMap,
  tantricMap: TantricMap,
  oduBirth: OduBirth,
  authority: AkashaAuthorityInput,
): ConexaoMap {
  return {
    name,
    birthDate,
    kabalisticMap,
    astrologyMap,
    tantricMap,
    oduBirth,
    authority,
  };
}

// ─── GET /api/akasha/conexoes ────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const authResult = await requireAkashaApi(request);
  if (authResult instanceof NextResponse) return authResult;

  const { id: userId } = authResult;

  const connections = await prisma.connection.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      otherName: true,
      otherBirthDate: true,
      romanticScore: true,
      partnershipScore: true,
      dominantType: true,
      authorityMatch: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ connections });
}

// ─── POST /api/akasha/conexoes ───────────────────────────────────────────────

export async function POST(request: NextRequest) {
  const authResult = await requireAkashaApi(request);
  if (authResult instanceof NextResponse) return authResult;

  const { id: userId } = authResult;

  // 1. Parse & validate body
  let body: z.infer<typeof CreateConexaoSchema>;
  try {
    body = CreateConexaoSchema.parse(await request.json());
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', issues: err.issues },
        { status: 400 },
      );
    }
    return NextResponse.json({ error: 'Body inválido' }, { status: 400 });
  }

  const { otherName, otherBirthDate, otherBirthTime, otherBirthCity, otherBirthLatitude, otherBirthLongitude, otherBirthTimezone } = body;

  // 2. Load user's BirthChart from DB
  const birthChart = await prisma.birthChart.findUnique({
    where: { userId },
  });
  if (!birthChart) {
    return NextResponse.json(
      { error: 'Mapa natal não encontrado. Calcule seu mapa primeiro.' },
      { status: 400 },
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, birthDate: true },
  });
  if (!user || !user.birthDate) {
    return NextResponse.json(
      { error: 'Dados do usuário incompletos.' },
      { status: 400 },
    );
  }

  const userBirthDateStr = user.birthDate.toISOString().split('T')[0];

  // Cast stored JSON maps to engine types
  // Cast stored JSON maps to engine types (unknown intermediary needed for Prisma Json → specific type)
  const userKabala = birthChart.kabalisticMap as unknown as KabalisticMap;
  const userAstrology = birthChart.astrologyMap as unknown as AstrologyMap;
  const userTantra = birthChart.tantricMap as unknown as TantricMap;
  const userOdu = birthChart.oduBirth as unknown as OduBirth;

  // Derive user's authority from astrology (ascendente → strategy, lua → emotional authority)
  // Fall back to defaults when not available
  const userAuthority: AkashaAuthorityInput = DEFAULT_AUTHORITY;

  // 3. Build partner's maps
  let partnerKabala: KabalisticMap;
  let partnerAstrology: AstrologyMap;
  let partnerTantra: TantricMap;
  let partnerOdu: OduBirth;
  let partnerLat: number | null = otherBirthLatitude ?? null;
  let partnerLng: number | null = otherBirthLongitude ?? null;

  try {
    partnerKabala = buildKabalisticMap(otherName, otherBirthDate);
  } catch (err) {
    return NextResponse.json(
      { error: 'Falha no cálculo cabalístico do parceiro.', detail: String(err) },
      { status: 422 },
    );
  }

  try {
    partnerTantra = buildTantricMap(otherBirthDate);
  } catch (err) {
    return NextResponse.json(
      { error: 'Falha no cálculo tântrico do parceiro.', detail: String(err) },
      { status: 422 },
    );
  }

  try {
    partnerOdu = calculateBirthOdu(otherBirthDate);
  } catch (err) {
    return NextResponse.json(
      { error: 'Falha no cálculo de Odu do parceiro.', detail: String(err) },
      { status: 422 },
    );
  }

  // Geocode partner's city only if coordinates were not already provided via CityAutocomplete
  if (otherBirthCity && partnerLat === null && partnerLng === null) {
    try {
      const geo = await geocodeCity(otherBirthCity, { countryCodes: 'br' });
      if (geo) {
        partnerLat = geo.latitude;
        partnerLng = geo.longitude;
      }
    } catch {
      // Geocoding failure is non-fatal — use defaults
    }
  }

  if (partnerLat !== null && partnerLng !== null) {
    try {
      partnerAstrology = birthChartToAstrologyMap(getBirthChart({
        birthDate: new Date(otherBirthDate),
        latitude: partnerLat,
        longitude: partnerLng,
      }));
    } catch {
      partnerAstrology = buildStubAstrologyMap();
    }
  } else {
    partnerAstrology = buildStubAstrologyMap();
  }

  // 4. Build both ConexaoMap objects
  const userMap = buildConexaoMap(
    user.name,
    userBirthDateStr,
    userKabala,
    userAstrology,
    userTantra,
    userOdu,
    userAuthority,
  );

  const partnerMap = buildConexaoMap(
    otherName,
    otherBirthDate,
    partnerKabala,
    partnerAstrology,
    partnerTantra,
    partnerOdu,
    DEFAULT_AUTHORITY,
  );

  // 5. Compare
  let result: ConexaoResult;
  try {
    result = compareAkashaMaps(userMap, partnerMap);
  } catch (err) {
    return NextResponse.json(
      { error: 'Falha na comparação dos mapas.', detail: String(err) },
      { status: 422 },
    );
  }

  // 6. Persist
  const connection = await prisma.connection.create({
    data: {
      userId,
      otherName,
      otherBirthDate: new Date(otherBirthDate),
      otherBirthTime,
      otherBirthCity,
      otherBirthLatitude: partnerLat,
      otherBirthLongitude: partnerLng,
      otherBirthTimezone: otherBirthTimezone,
      romanticScore: result.romantic,
      partnershipScore: result.partnership,
      dominantType: result.dominantType,
      authorityMatch: result.authorityMatch,
      resultData: result as unknown as Prisma.InputJsonValue,
    },
  });

  return NextResponse.json(
    {
      connection: {
        id: connection.id,
        otherName: connection.otherName,
        otherBirthDate: connection.otherBirthDate.toISOString().split('T')[0],
        romanticScore: connection.romanticScore,
        partnershipScore: connection.partnershipScore,
        dominantType: connection.dominantType,
        authorityMatch: connection.authorityMatch,
        resultData: connection.resultData,
        createdAt: connection.createdAt,
      },
    },
    { status: 201 },
  );
}

/**
 * Converts a BirthChart (from core-astrology) to an AstrologyMap shape
 * that the ConexaoMap scoring helpers (getLuaSigno, getCasaOitoSigno) consume.
 * Also populates the extra fields that AstrologyMap requires.
 */
function birthChartToAstrologyMap(bc: Awaited<ReturnType<typeof getBirthChart>>): AstrologyMap {
  // Lunar phase from Sol/Lua longitude difference
  const lua = bc.planets.find((p) => String(p.planet).toLowerCase() === 'lua');
  const sol = bc.planets.find((p) => String(p.planet).toLowerCase() === 'sol');
  const diff = ((lua?.longitude ?? 0) - (sol?.longitude ?? 0) + 360) % 360 / 90;
  const fases: Array<'nova' | 'crescente' | 'cheia' | 'minguante'> = ['nova', 'crescente', 'cheia', 'minguante'];
  const lunarPhase = fases[Math.floor(diff)] ?? 'nova';

  // Build house-number → sign map from chart.casas
  const houseSignMap: Record<number, string> = {};
  if (bc.chart?.casas) {
    for (const c of bc.chart.casas) {
      houseSignMap[c.numero] = capitalize(String(c.signo));
    }
  }

  // Assign planets to houses by longitude proximity (simplified Placidus)
  // Each planet gets the house whose cusp it falls just before
  const planetHouse: Record<string, number> = {};
  const sortedCusps = [...bc.houses].sort((a, b) => a.cusp - b.cusp);
  for (const p of bc.planets) {
    const lon = p.longitude;
    let assigned = 1;
    for (let i = 0; i < sortedCusps.length; i++) {
      const next = sortedCusps[(i + 1) % 12];
      const cusp = sortedCusps[i].cusp;
      const nextCusp = next.cusp;
      const inBetween = nextCusp > cusp
        ? lon >= cusp && lon < nextCusp
        : lon >= cusp || lon < nextCusp; // wraps 360°
      if (inBetween) { assigned = sortedCusps[i].number; break; }
    }
    planetHouse[String(p.planet).toLowerCase()] = assigned;
  }

  return {
    planets: bc.planets.map((p) => ({
      planet: capitalize(String(p.planet)),
      sign: capitalize(String(p.sign)),
      degree: p.longitude,
      house: planetHouse[String(p.planet).toLowerCase()] ?? 0,
    })),
    houses: bc.houses.map((h) => ({
      house: h.number,
      sign: houseSignMap[h.number] ?? '',
      degree: h.cusp,
    })),
    ascendant: bc.chart?.ascendente != null ? capitalize(signFromLongitude(bc.chart.ascendente)) : '—',
    midheaven: bc.chart?.mediumCoeli != null ? capitalize(signFromLongitude(bc.chart.mediumCoeli)) : '—',
    lunarPhase,
    elementalChart: { fire: 0, earth: 0, air: 0, water: 0 },
    modality: { cardinal: 0, fixed: 0, mutable: 0 },
    quality: { individual: 0, relational: 0, transform: 0, social: 0, traditional: 0 },
    dominantPlanet: '—',
    signRuler: '—',
    houseRuler: '—',
  };
}

/** Converts zodiac longitude degrees to sign name. */
function signFromLongitude(lon: number): string {
  const signs = ['aries', 'touro', 'gemeos', 'cancer', 'leao', 'virgem', 'libra', 'escorpio', 'sagitario', 'capricornio', 'aquario', 'peixes'];
  return signs[Math.floor(((lon % 360) + 360) % 360 / 30) % 12] ?? 'aries';
}

/** Capitalizes the first letter of a string. */
function capitalize(s: string): string {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

// ─── Stub astrology map when no coordinates available ─────────────────────────

function buildStubAstrologyMap(): AstrologyMap {
  // Stub that satisfies AstrologyMap shape; getLuaSigno/getCasaOitoSigno
  // helpers extract lua_signo from planets and casa_8_signo from houses.
  return {
    planets: [
      { planet: 'Lua', sign: '—', degree: 0, house: 0 },
    ],
    houses: [
      { house: 8, sign: '', degree: 0 },
    ],
    ascendant: '—',
    midheaven: '—',
    lunarPhase: 'nova',
    elementalChart: { fire: 0, earth: 0, air: 0, water: 0 },
    modality: { cardinal: 0, fixed: 0, mutable: 0 },
    quality: { individual: 0, relational: 0, transform: 0, social: 0, traditional: 0 },
    dominantPlanet: '—',
    signRuler: '—',
    houseRuler: '—',
  };
}
