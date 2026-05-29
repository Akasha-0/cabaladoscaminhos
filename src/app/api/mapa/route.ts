import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { calculateNumerology } from '@/lib/numerologia/generator';
import { calcularOduNascimento } from '@/lib/odus/calculos';
import { getPositions } from '@/lib/astrologia/planet-positions';
import { calculateHouses } from '@/lib/astrologia/houses';
import { getInterpretacao } from '@/lib/numerologia/calculos';
import type { Signo } from '@/lib/astrologia/tipos';

const MapaSchema = z.object({
  userId: z.string().min(1),
  nome: z.string().min(1),
  dataNascimento: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato: YYYY-MM-DD'),
  hora: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  local: z.string().optional(),
});

type MapaInput = z.infer<typeof MapaSchema>;

// Approximate lat/lon for common Brazilian cities
const CITY_COORDS: Record<string, { lat: number; lon: number }> = {
  'rio de janeiro': { lat: -22.9068, lon: -43.1729 },
  'são paulo': { lat: -23.5505, lon: -46.6333 },
  'salvador': { lat: -12.9714, lon: -38.5014 },
  'bh': { lat: -19.9167, lon: -43.9345 },
  'belo horizonte': { lat: -19.9167, lon: -43.9345 },
  'brasília': { lat: -15.7797, lon: -47.9297 },
  'brasilia': { lat: -15.7797, lon: -47.9297 },
  'fortaleza': { lat: -3.7172, lon: -38.5433 },
  'recife': { lat: -8.0476, lon: -34.8770 },
  'curitiba': { lat: -25.4284, lon: -49.2733 },
  'manaus': { lat: -3.1190, lon: -60.0217 },
  'porto alegre': { lat: -30.0346, lon: -51.2177 },
  'niteroi': { lat: -22.8828, lon: -43.1036 },
  'goiânia': { lat: -16.6799, lon: -49.2550 },
  'goiania': { lat: -16.6799, lon: -49.2550 },
};

function getCityCoords(city?: string): { lat: number; lon: number } | null {
  if (!city) return null;
  const key = city.toLowerCase().trim();
  return CITY_COORDS[key] ?? null;
}

function buildBirthDateTime(dateStr: string, timeStr?: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  if (timeStr) {
    const [hour, minute] = timeStr.split(':').map(Number);
    return new Date(year, month - 1, day, hour, minute, 0, 0);
  }
  return new Date(year, month - 1, day, 12, 0, 0, 0);
}

// Tarot birth card: sum of date digits → Major Arcana index (0–21)
function calcularCartaNascimento(dateStr: string): number {
  const digits = dateStr.replace(/\D/g, '');
  let sum = 0;
  for (const d of digits) sum += parseInt(d);
  while (sum > 21) {
    sum = sum.toString().split('').reduce((a, c) => a + parseInt(c), 0);
  }
  return sum;
}

// Personal year card: current year + birth month/day digit sum
function calcularCartaAnoPessoal(dateStr: string): number {
  const year = new Date().getFullYear();
  const monthDaySum = dateStr.slice(5).replace(/\D/g, '').split('').reduce((a, c) => a + parseInt(c), 0);
  let sum = year + monthDaySum;
  while (sum > 21) {
    sum = sum.toString().split('').reduce((a, c) => a + parseInt(c), 0);
  }
  return sum;
}

// Map astrologia Signo enum to Portuguese string
function signoToPortuguese(sign: Signo): string {
  const map: Record<Signo, string> = {
    aries: 'Áries',
    touro: 'Touro',
    gemeos: 'Gêmeos',
    cancer: 'Câncer',
    leao: 'Leão',
    virgem: 'Virgem',
    libra: 'Libra',
    escorpio: 'Escorpião',
    sagitario: 'Sagitário',
    capricornio: 'Capricórnio',
    aquario: 'Aquário',
    peixes: 'Peixes',
  };
  return map[sign] ?? sign;
}

// Get ascendant sign from degree using Whole Sign system
function getAscendenteSign(ascDegree: number): string {
  const signIndex = Math.floor(((ascDegree % 360) / 30));
  const signs: Signo[] = ['aries','touro','gemeos','cancer','leao','virgem','libra','escorpio','sagitario','capricornio','aquario','peixes'];
  return signoToPortuguese(signs[signIndex % 12]);
}

function calcAstrologia(dateStr: string, hora?: string, local?: string) {
  const birthDate = buildBirthDateTime(dateStr, hora);
  const coords = getCityCoords(local);
  const positions = getPositions(birthDate);
  const planetMap: Record<string, string> = {};
  for (const p of positions) {
    planetMap[p.planet] = signoToPortuguese(p.sign);
  }
  let ascendente = 'N/A';
  let ascendenteDegree = 0;
  let mediumCoeliDegree = 0;
  let casas: Array<{ numero: number; signo: Signo; grauNoSigno: number }> = [];
  if (coords) {
    try {
      const houses = calculateHouses(birthDate, birthDate, coords.lat, coords.lon, 'placidus');
      ascendente = getAscendenteSign(houses.asc);
      ascendenteDegree = houses.asc;
      mediumCoeliDegree = houses.mc;
      casas = houses.cusps.map((cusp, i) => {
        const longitude = cusp.longitude;
        const signIndex = Math.floor(longitude / 30) % 12;
        const signs: Signo[] = ['aries', 'touro', 'gemeos', 'cancer', 'leao', 'virgem', 'libra', 'escorpio', 'sagitario', 'capricornio', 'aquario', 'peixes'];
        return {
          numero: i + 1,
          signo: signs[signIndex],
          grauNoSigno: longitude % 30,
        };
      });
    } catch {
      ascendente = 'N/A';
    }
  }
  const planeta: Record<string, { planeta: string; longitude: number; latitude: number; distancia: number; velocidade: number; signo: Signo; casa: number; grauNoSigno: number }> = {};
  for (const p of positions) {
    planeta[p.planet] = {
      planeta: p.planet,
      longitude: p.longitude,
      latitude: p.latitude,
      distancia: p.distance,
      velocidade: p.velocity,
      signo: p.sign,
      casa: 1,
      grauNoSigno: p.degree,
    };
  }
  return {
    signo: planetMap['sol'] ?? 'N/A',
    ascendente,
    planetas: planetMap,
    planeta,
    casas,
    ascendenteDegree,
    mediumCoeli: mediumCoeliDegree,
  };
}

interface ConvergenceEntry {
  energia: string;
  forca: 'simples' | 'dupla' | 'tripla';
  descricao: string;
}

// Identify when multiple systems point to the same archetype/energy
function findConvergences(
  numerologia: { vida: number; expressao: number; motivacao: number },
  odu: { principal: { nome: string; orixaRegente: string } },
  astrologia: { signo: string }
): ConvergenceEntry[] {
  const convergences: ConvergenceEntry[] = [];
  const seen = new Map<string, { sources: string[]; descricao: string }>();

  const add = (key: string, source: string, descricao: string) => {
    if (!seen.has(key)) seen.set(key, { sources: [], descricao });
    const entry = seen.get(key)!;
    if (!entry.sources.includes(source)) entry.sources.push(source);
  };

  // Life path → numerologia archetype
  const vidaInterp = getInterpretacao(numerologia.vida);
  add(`numero-${numerologia.vida}`, 'numerologia', vidaInterp.nome);

  // Odu nome → orixa
  add(`odu-${odu.principal.nome}`, 'odu', `Orixá: ${odu.principal.orixaRegente}`);

  // Solar sign
  add(`signo-${astrologia.signo}`, 'astrologia', 'Signo Solar');

  // Expression / motivation
  add(`expressao-${numerologia.expressao}`, 'numerologia', `Expressão: ${numerologia.expressao}`);
  add(`motivacao-${numerologia.motivacao}`, 'numerologia', `Motivação: ${numerologia.motivacao}`);

  for (const [energia, { sources, descricao }] of seen) {
    if (sources.length >= 2) {
      const forca: 'dupla' | 'tripla' = sources.length >= 3 ? 'tripla' : 'dupla';
      convergences.push({ energia, forca, descricao });
    }
  }

  return convergences;
}

// Sefirot dominant based on numerology life path
function getSefirotDominante(vida: number): string[] {
  const interp = getInterpretacao(vida);
  if (interp.sefirotRelacionado && interp.sefirotRelacionado !== 'A determinar') {
    return [interp.sefirotRelacionado];
  }
  return [];
}

// Orixas list: main orixa + secondary if different
function getOrixas(
  odu: { principal: { orixaRegente: string }; secundario: { orixaRegente: string } | null }
): string[] {
  const list = [odu.principal.orixaRegente];
  if (odu.secundario && odu.secundario.orixaRegente !== odu.principal.orixaRegente) {
    list.push(odu.secundario.orixaRegente);
  }
  return list;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as unknown;
    const parsed = MapaSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { userId, nome, dataNascimento, hora, local } = parsed.data as MapaInput;

    // 1. Numerology
    const numerologyReport = calculateNumerology(nome, dataNascimento);

    // 2. Odu
    const oduResult = calcularOduNascimento(dataNascimento);

    // 3. Astrologia
    const astrologiaResult = calcAstrologia(dataNascimento, hora, local);

    // 4. Tarot
    const cartaNascimento = calcularCartaNascimento(dataNascimento);
    const cartaAnoPessoal = calcularCartaAnoPessoal(dataNascimento);

    // 5. Sefirot
    const sefirotDominante = getSefirotDominante(numerologyReport.vida);

    // 6. Orixas
    const orixas = getOrixas(oduResult);

    // 7. Convergences
    const convergences = findConvergences(numerologyReport, oduResult, astrologiaResult);

    const mapa = {
      id: userId,
      created_at: new Date().toISOString(),
      numerologia: {
        numero_vida: numerologyReport.vida,
        numero_destino: numerologyReport.destino.numero,
        numero_alma: numerologyReport.motivacao,
        numero_personalidade: numerologyReport.impressao,
      },
      odu: {
        nome: oduResult.principal.nome,
        numero: oduResult.principal.numero,
        orixas: [oduResult.principal.orixaRegente, ...(oduResult.secundario ? [oduResult.secundario.orixaRegente] : [])],
        quizilas: oduResult.principal.quizilas,
        preceitos: oduResult.principal.preceitos,
      },
      astrologia: astrologiaResult,
      tarot: {
        carta_nascimento: cartaNascimento,
        carta_ano_pessoal: cartaAnoPessoal,
      },
      orixas,
      sefirot: sefirotDominante,
      convergences,
    };

    return NextResponse.json(mapa, { status: 200 });
  } catch (err) {
    console.error('[mapa] Error:', err);
    return NextResponse.json(
      { error: 'Erro interno ao gerar Mapa da Alma' },
      { status: 500 }
    );
  }
}
