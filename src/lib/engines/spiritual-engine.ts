/**
 * Spiritual Engine — MapaAlmaCompleto Generator
 * Unified orchestration engine combining Numerology, Ifá, Astrology, Tarot, and Chakras
 *
 * @module spiritual-engine
 * @version 1.0.0
 */

import { calculateNumerology } from '@/lib/numerologia/generator';
import { drawOdu, type Odu, type DrawResult } from '@/lib/ifa/draw';
import { getBirthChart } from '@/lib/astrologia/birth-chart';
import { getData as getChakraData } from '@/lib/chakra/v4/chakra-v4-data';
import { DeepCorrelationEngine } from '@/lib/ai/deep-correlation-engine';
import type { UserSpiritualData } from '@/lib/ai/types';
import {
  calcularOduNascimento,
  getQuizilasPorOdu,
  getPreceitosPorOdu,
  getEbósPorOdu,
} from '@/lib/odus/calculos';
import type { Signo } from '@/lib/astrologia/tipos';
import type {
  BirthProfile,
  MapaAlmaCompleto,
  Convergence,
  NumerologyResults,
  OduResults,
  AstrologyResults,
  TarotResults,
  ChakraResults,
  ChakraInfo,
} from './types/mapa-alma';
// HyperCorrelationEngine for cross-tradition analysis
import { hyperCorrelationEngine } from '@/lib/orixa/HyperCorrelationEngine';
import { getOrixa } from '@/lib/orixa/types';
// ============================================================
// CORRESPONDENCE TABLES
// ============================================================

const LIFEPATH_ODU_MAP: Record<number, number> = {
  1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 9, 10: 10, 11: 16,
};

const ODÚ_ORIXÁ_MAP: Record<number, string[]> = {
  1: ['Exu', 'Omolu'],
  2: ['Ibeji', 'Ogum'],
  3: ['Ogum', 'Obaluaê'],
  4: ['Iemanjá', 'Oxóssi', 'Egum'],
  5: ['Oxum', 'Logun Edé'],
  6: ['Xangô'],
  7: ['Omolu'],
  8: ['Oxalá'],
  9: ['Iansã'],
  10: ['Oxalá'],
  11: ['Iansã', 'Exu', 'Ogum'],
  12: ['Xangô'],
  13: ['Nanã'],
  14: ['Oxumaré'],
  15: ['Obá', 'Ewá'],
  16: ['Ifá', 'Oxalá'],
};

const SEPHIRAH_MAP: Record<number, string> = {
  1: 'Kether', 2: 'Chokmah', 3: 'Binah', 4: 'Chesed', 5: 'Geburah',
  6: 'Tiphereth', 7: 'Hod', 8: 'Netzach', 9: 'Yesod', 10: 'Malkuth',
  11: 'Daath', 12: 'Geburah', 13: 'Malkuth', 14: 'Yesod',
  15: 'Geburah', 16: 'Kether',
};

const PLANETA_SIGNO_ORIXÁ: Record<string, string> = {
  sol: 'Oxalá', lua: 'Iemanjá', mercurio: 'Oxumaré', venus: 'Oxum',
  marte: 'Ogum', jupiter: 'Oxóssi', saturno: 'Omolu', urano: 'Iansã',
  netuno: 'Iemanjá', plutao: 'Omolu',
};

// Zodiac sign to ruling planet mapping (Western astrology)
const ZODIAC_TO_PLANET: Record<string, string> = {
  aries: 'marte', tauro: 'venus', touro: 'venus',
  geminis: 'mercurio', gemeos: 'mercurio',
  cancer: 'lua', cancers: 'lua',
  leao: 'sol', leo: 'sol',
  virgem: 'mercurio', virgo: 'mercurio',
  libra: 'venus',
  escorpiao: 'plutao', scorpio: 'plutao',
  sagitario: 'jupiter', sagittarius: 'jupiter',
  capricornio: 'saturno', capricorn: 'saturno',
  aquario: 'urano', aquarius: 'urano',
  peixes: 'jupiter', pisces: 'jupiter',
};

const CITY_COORDS: Record<string, { lat: number; lon: number }> = {
  'São Paulo': { lat: -23.5505, lon: -46.6333 },
  'Rio de Janeiro': { lat: -22.9068, lon: -43.1729 },
  'Salvador': { lat: -12.9714, lon: -38.5014 },
  'Brasília': { lat: -15.7801, lon: -47.9292 },
  'Recife': { lat: -8.0476, lon: -34.877 },
  'Belo Horizonte': { lat: -19.9167, lon: -43.9345 },
  'Fortaleza': { lat: -3.7172, lon: -38.5433 },
  'Lisboa': { lat: 38.7169, lon: -9.1399 },
  'Porto': { lat: 41.1579, lon: -8.6291 },
};

const DEFAULT_COORDS = { lat: -23.5505, lon: -46.6333 };

// ============================================================
// HELPERS
// ============================================================

function reduceToBase(num: number, masters: number[] = [11, 22, 33]): number {
  while (num > 9 && !masters.includes(num)) {
    num = String(num).split('').reduce((s, d) => s + parseInt(d, 10), 0);
  }
  return num;
}

function calcularAnoPessoal(dataNascimento: string): number {
  const currentYear = new Date().getFullYear();
  const anim = dataNascimento.replace(/\D/g, '');
  const sum = anim.split('').reduce((acc, d) => acc + parseInt(d, 10), 0);
  return reduceToBase(sum + currentYear);
}

// ============================================================
// ODU — Ifá/Merindilogun
// ============================================================

function calcOdu(profile: BirthProfile): OduResults {
  const { principal, secundario } = calcularOduNascimento(profile.dataNascimento);

  const oduDraw: DrawResult = drawOdu({
    method: 'birth-date',
    dataNascimento: profile.dataNascimento,
  });
  const regente: Odu = oduDraw.odu;

  const quizilas = getQuizilasPorOdu(principal.numero);
  const preceitos = getPreceitosPorOdu(principal.numero);
  const ebos = getEbósPorOdu(principal.numero);

  const secund: Odu | null = secundario
    ? {
        numero: secundario.numero,
        Caminho: secundario.numero,
        nome: secundario.nome,
        opeCima: regente.opeCima,
        opeBaixo: regente.opeBaixo,
        elementos: '',
        orixaRegente: secundario.orixaRegente ?? '',
        significado: '',
      }
    : null;

  return {
    regente,
    secundario: secund,
    orixas: ODÚ_ORIXÁ_MAP[principal.numero] ?? [principal.orixaRegente],
    quizilas,
    preceitos,
    ebos,
    elemento: principal.elementos,
    elementalForce: `${principal.elementos} — ${principal.significado.split('.')[0]}.`,
    lifeLesson: preceitos.join('; ') || principal.preceitos.join('; '),
    arcanoTarot: principal.numero % 22,
    caminhoSephirah: SEPHIRAH_MAP[principal.numero] ?? 'Malkuth',
    raw: oduDraw,
  };
}

// ============================================================
// CHAKRA
// ============================================================

const CHAKRA_BY_DAY: Record<number, string> = {
  0: 'solar-plexus', 1: 'root', 2: 'sacral', 3: 'solar-plexus',
  4: 'heart', 5: 'crown', 6: 'solar-plexus',
};

function getDominantChakra(dayOfBirth: number, ascendente: string): string {
  const dayChakra = CHAKRA_BY_DAY[dayOfBirth] ?? 'solar-plexus';
  if (ascendente === 'touro' || ascendente === 'libra') return 'heart';
  if (ascendente === 'aries' || ascendente === 'escorpio') return 'root';
  if (ascendente === 'cancer' || ascendente === 'peixes') return 'sacral';
  return dayChakra;
}

function buildChakraResults(
  lifePath: number,
  oduNumero: number,
  ascendente: string,
  dataNascimento: string
): ChakraResults {
  const chakras = getChakraData();
  const parts = dataNascimento.split('-').map(Number);
  const dayOfBirth = new Date(2000, 0, parts[2]).getDay();
  const dominantChakraId = getDominantChakra(dayOfBirth, ascendente);

  const isHyperactive = lifePath % 2 !== 0;
  const isBlocked = oduNumero >= 10;

  const chakraInfos: ChakraInfo[] = chakras.map((c) => {
    let estado: 'equilibrado' | 'hiperativo' | 'bloqueado' = 'equilibrado';
    const seq = (c as unknown as { sequence?: number }).sequence ?? 0;
    if (isHyperactive && seq <= 3) estado = 'hiperativo';
    if (isBlocked && seq >= 6) estado = 'bloqueado';
    const intensidade = c.id === dominantChakraId ? 85 : 50;
    return {
      numero: seq,
      nome: c.name,
      estado,
      intensidade,
      elemento: c.element,
      cor: c.color,
    };
  });

  const numHiper = chakraInfos.filter((x) => x.estado === 'hiperativo').length;
  const numBlocked = chakraInfos.filter((x) => x.estado === 'bloqueado').length;
  const equilibrio = Math.max(0, 70 - numHiper * 10 + numBlocked * 5);

  const dominante = chakras.find((c) => c.id === dominantChakraId);
  const bloqueado = chakras.find((c) => c.id === 'root');

  return {
    chakras: chakraInfos,
    dominante: dominante?.name ?? 'Plexo Solar',
    bloqueado: bloqueado?.name ?? 'Raiz',
    equilibrio,
    raw: chakras,
  };
}

// ============================================================
// ORIXAS AGGREGATION
// ============================================================

function aggregateOrixas(
  odu: OduResults,
  ascendente: string,
  signoSol: string
): string[] {
  const set = new Set<string>(odu.orixas);
  const asc = PLANETA_SIGNO_ORIXÁ[ascendente];
  if (asc) set.add(asc);
  const sol = PLANETA_SIGNO_ORIXÁ[signoSol];
  if (sol) set.add(sol);
  return Array.from(set);
}

// ============================================================
// ASTROLOGY PARSER
// ============================================================

function ascendenteFromDegree(deg: number): AstrologyResults['ascendente'] {
  if (deg < 30) return 'aries';
  if (deg < 60) return 'touro';
  if (deg < 90) return 'gemeos';
  if (deg < 120) return 'cancer';
  if (deg < 150) return 'leao';
  if (deg < 180) return 'virgem';
  if (deg < 210) return 'libra';
  if (deg < 240) return 'escorpio';
  if (deg < 270) return 'sagitario';
  if (deg < 300) return 'capricornio';
  if (deg < 330) return 'aquario';
  return 'peixes';
}

function parseAstrologyResults(
  raw: {
    planets: { planet: string; longitude: number; sign: string }[];
    houses: { number: number; cusp: number }[];
    ascendant: number;
    aspects: AstrologyResults['aspectos'];
    chart: AstrologyResults['raw'];
  }
): AstrologyResults {
  const sol = raw.planets.find((p) => p.planet === 'sol');
  const sign = (sol?.sign ?? 'aries') as Signo;
  return {
    ascendente: ascendenteFromDegree(raw.ascendant),
    sol: { planeta: 'sol', longitude: sol?.longitude ?? 0, latitude: 0, distancia: 1, velocidade: 0, signo: sign, casa: 1, grauNoSigno: Math.floor((sol?.longitude ?? 0) % 30) + 1 },
    lua: { planeta: 'lua', longitude: 0, latitude: 0, distancia: 1, velocidade: 0, signo: 'cancer', casa: 1, grauNoSigno: 1 },
    mercurio: { planeta: 'mercurio', longitude: 0, latitude: 0, distancia: 1, velocidade: 0, signo: 'gemeos', casa: 1, grauNoSigno: 1 },
    venus: { planeta: 'venus', longitude: 0, latitude: 0, distancia: 1, velocidade: 0, signo: 'touro', casa: 1, grauNoSigno: 1 },
    marte: { planeta: 'marte', longitude: 0, latitude: 0, distancia: 1, velocidade: 0, signo: 'aries', casa: 1, grauNoSigno: 1 },
    jupiter: { planeta: 'jupiter', longitude: 0, latitude: 0, distancia: 1, velocidade: 0, signo: 'sagitario', casa: 1, grauNoSigno: 1 },
    saturno: { planeta: 'saturno', longitude: 0, latitude: 0, distancia: 1, velocidade: 0, signo: 'capricornio', casa: 1, grauNoSigno: 1 },
    urano: { planeta: 'urano', longitude: 0, latitude: 0, distancia: 1, velocidade: 0, signo: 'aquario', casa: 1, grauNoSigno: 1 },
    netuno: { planeta: 'netuno', longitude: 0, latitude: 0, distancia: 1, velocidade: 0, signo: 'peixes', casa: 1, grauNoSigno: 1 },
    plutao: { planeta: 'plutao', longitude: 0, latitude: 0, distancia: 1, velocidade: 0, signo: 'escorpio', casa: 1, grauNoSigno: 1 },
    casas: raw.houses.map((h, i) => ({
      numero: i + 1,
      signo: sign,
      grauNoSigno: Math.floor(h.cusp % 30) + 1,
      planetaRegente: null,
    })),
    aspectos: raw.aspects,
    raw: raw.chart,
  };
}

const ASTROLOGY_FALLBACK: AstrologyResults = {
  ascendente: 'aries',
  sol: { planeta: 'sol', longitude: 0, latitude: 0, distancia: 1, velocidade: 0, signo: 'aries', casa: 1, grauNoSigno: 1 },
  lua: { planeta: 'lua', longitude: 90, latitude: 0, distancia: 1, velocidade: 0, signo: 'cancer', casa: 4, grauNoSigno: 1 },
  mercurio: { planeta: 'mercurio', longitude: 30, latitude: 0, distancia: 1, velocidade: 0, signo: 'gemeos', casa: 3, grauNoSigno: 1 },
  venus: { planeta: 'venus', longitude: 60, latitude: 0, distancia: 1, velocidade: 0, signo: 'touro', casa: 2, grauNoSigno: 1 },
  marte: { planeta: 'marte', longitude: 120, latitude: 0, distancia: 1, velocidade: 0, signo: 'aries', casa: 1, grauNoSigno: 1 },
  jupiter: { planeta: 'jupiter', longitude: 150, latitude: 0, distancia: 1, velocidade: 0, signo: 'sagitario', casa: 9, grauNoSigno: 1 },
  saturno: { planeta: 'saturno', longitude: 180, latitude: 0, distancia: 1, velocidade: 0, signo: 'capricornio', casa: 10, grauNoSigno: 1 },
  urano: { planeta: 'urano', longitude: 210, latitude: 0, distancia: 1, velocidade: 0, signo: 'aquario', casa: 11, grauNoSigno: 1 },
  netuno: { planeta: 'netuno', longitude: 240, latitude: 0, distancia: 1, velocidade: 0, signo: 'peixes', casa: 12, grauNoSigno: 1 },
  plutao: { planeta: 'plutao', longitude: 270, latitude: 0, distancia: 1, velocidade: 0, signo: 'escorpio', casa: 8, grauNoSigno: 1 },
  casas: Array.from({ length: 12 }, (_, i) => ({
    numero: i + 1,
    signo: 'aries' as Signo,
    grauNoSigno: 1,
    planetaRegente: null,
  })),
  aspectos: [],
};

// ============================================================
// TAROT
// ============================================================

const ARCANO_NAMES = [
  'O Louco', 'O Mago', 'A Sacerdotisa', 'A Imperatriz', 'O Imperador',
  'O Papa', 'Os Amantes', 'A Carruagem', 'A Força', 'O Eremita',
  'A Roda da Fortuna', 'A Justiça', 'O Enforcado', 'A Transformação',
  'O Diabo', 'A Torre', 'A Estrela', 'A Lua', 'O Sol',
  'O Julgamento', 'O Mundo', 'O Louco',
];

function buildTarotResults(lifePath: number, _anoPessoal: number): TarotResults {
  const currentYear = new Date().getFullYear();
  const birthCardId = lifePath % 22;
  const yearCardId = Math.abs(lifePath + currentYear) % 22 || 1;
  const soulCardId = Math.abs(lifePath * 3) % 22 || 1;

  return {
    cartaNascimento: birthCardId,
    cartaAnoPessoal: yearCardId,
    cartaAlma: soulCardId,
    interpretacao: {
      name: ARCANO_NAMES[birthCardId] ?? 'Arcano',
      upright: `Nascido sob a influência do Arcano ${birthCardId}.`,
      reversed: '',
    },
    cartasAdicionais: [
      { name: ARCANO_NAMES[yearCardId] ?? 'Arcano', upright: '', reversed: '' },
      { name: ARCANO_NAMES[soulCardId] ?? 'Arcano', upright: '', reversed: '' },
    ],
  };
}

// ============================================================
// CONVERGENCE DETECTION
// ============================================================

function detectarConvergencias(
  numerologia: NumerologyResults,
  odu: OduResults,
  astrologia: AstrologyResults
): Convergence[] {
  const convergencias: Convergence[] = [];
  // 1. Vida-Odú dual convergence
  if (LIFEPATH_ODU_MAP[numerologia.lifePath] === odu.regente.numero) {
    convergencias.push({
      sistemas: ['numerologia', 'odu'],
      energia: odu.orixas[0]?.toLowerCase() ?? 'oxum',
      forca: 'forte',
      descricao: `Caminho de Vida ${numerologia.lifePath} alinha-se com ${odu.regente.nome}.`,
    });
  }
  // 2. Sol-Orixá convergence (astro-odu + potentially triple)
  const solConvergencia = detectSolOrixaConvergence(numerologia, odu, astrologia);
  if (solConvergencia) convergencias.push(solConvergencia.dual);
  if (solConvergencia?.triple) convergencias.push(solConvergencia.triple);

  // 3. Ascendente-Orixá convergence
  const ascOrixa = getPlanetaOrixa(astrologia.ascendente);
  if (ascOrixa && odu.orixas.includes(ascOrixa)) {
    convergencias.push({
      sistemas: ['astrologia', 'odu'],
      energia: ascOrixa.toLowerCase(),
      forca: 'medio',
      descricao: `Ascendente ${astrologia.ascendente} conecta-se a ${ascOrixa}.`,
    });
  }

  return convergencias;
}

// ─── Convergence Helpers ─────────────────────────────────────────────────────

/** Returns the orixá linked to a planet via ZODIAC_TO_PLANET → PLANETA_SIGNO_ORIXÁ chain. */
function getPlanetaOrixa(sign: string): string | undefined {
  const planeta = ZODIAC_TO_PLANET[sign.toLowerCase()] ?? sign;
  return PLANETA_SIGNO_ORIXÁ[planeta];
}

/**
 * Detects Sol-Orixá convergence (dual astro-odu + triple numerologia-astrologia-odu).
 * Consolidates two redundant if-blocks into one structured check.
 */
function detectSolOrixaConvergence(
  numerologia: NumerologyResults,
  odu: OduResults,
  astrologia: AstrologyResults
): { dual: Convergence; triple?: Convergence } | null {
  const solSigno = astrologia.sol.signo;
  const solOrixa = getPlanetaOrixa(solSigno);
  if (!solOrixa || !odu.orixas.includes(solOrixa)) return null;
  const dual: Convergence = {
    sistemas: ['astrologia', 'odu'],
    energia: solOrixa.toLowerCase(),
    forca: 'medio',
    descricao: `Sol em ${solSigno} conecta-se a ${solOrixa} (${odu.regente.nome}).`,
  };
  const vidaEnergia = odu.orixas[0]?.toLowerCase() ?? '';
  if (vidaEnergia === solOrixa.toLowerCase()) {
    return {
      dual,
      triple: {
        sistemas: ['numerologia', 'astrologia', 'odu'],
        energia: vidaEnergia,
        forca: 'forte',
        descricao: `Tríplice convergência: Vida ${numerologia.lifePath}, Sol em ${solSigno}, ${solOrixa}.`,
      },
    };
  }
  return { dual };
}

// ============================================================
// MAIN ENGINE FUNCTION
// ============================================================
export async function gerarMapaAlmaCompleto(profile: BirthProfile): Promise<MapaAlmaCompleto> {
  const currentYear = new Date().getFullYear();
  // 1. NUMEROLOGIA
  const numerologia = buildNumerologiaResults(profile, currentYear);
  // 2. ODU
  const odu = calcOdu(profile);
  // 3. ASTROLOGIA
  const coords = CITY_COORDS[profile.cidade] || CITY_COORDS[profile.estado] || DEFAULT_COORDS;
  const astrologia = buildAstrologiaResults(profile, coords);
  const tarot = buildTarotResults(numerologia.lifePath, numerologia.anoPessoal);
  const chakras = buildChakraResults(numerologia.lifePath, odu.regente.numero, astrologia.ascendente, profile.dataNascimento);
  const convergencias = detectarConvergencias(numerologia, odu, astrologia);
  const orixasDominantes = aggregateOrixas(odu, astrologia.ascendente, astrologia.sol.signo);
  // BUILD MAPA OBJECT
  const mapa: MapaAlmaCompleto = {
    perfil: profile,
    numerologia,
    odu,
    astrologia,
    tarot,
    chakras,
    convergencias,
    orixasDominantes,
    dataCalculo: new Date().toISOString(),
    versao: '1.0.0',
    deepCorrelations: null,
  };
  // 9. DEEP CORRELATION ANALYSIS (graceful degradation)
  attachDeepCorrelations(mapa, numerologia, tarot, odu, orixasDominantes, astrologia);
  // 10. HYPER CORRELATION SYNTHESIS
  attachHyperSynthesis(mapa, numerologia, astrologia, odu);
  return mapa;
}
// ─── Main Engine Helpers ─────────────────────────────────────────────────────
/** Builds the NumerologyResults from a birth profile and current year. */
function buildNumerologiaResults(profile: BirthProfile, currentYear: number): NumerologyResults {
  const numerologiaRaw = calculateNumerology(profile.nomeCompleto, profile.dataNascimento);
  const destino = numerologiaRaw.destino;
  return {
    lifePath: numerologiaRaw.vida,
    expressao: numerologiaRaw.expressao,
    motivacao: numerologiaRaw.motivacao,
    impressao: numerologiaRaw.impressao,
    destino: typeof destino === 'object' && destino !== null
      ? (destino as { numero: number }).numero
      : 0,
    cicloAtual: reduceToBase(currentYear),
    anoPessoal: calcularAnoPessoal(profile.dataNascimento),
    metodoUsado: 'pitagorica',
    raw: undefined,
  };
}
/** Builds AstrologyResults from a birth profile and coordinates, with graceful fallback. */
function buildAstrologiaResults(profile: BirthProfile, coords: { lat: number; lon: number }): AstrologyResults {
  try {
    const birthDate = new Date(profile.dataNascimento);
    const birthTime = profile.hora
      ? new Date(`${profile.dataNascimento}T${profile.hora}`)
      : birthDate;
    const chartRaw = getBirthChart({
      birthDate: birthTime,
      latitude: coords.lat,
      longitude: coords.lon,
    });
    return parseAstrologyResults(chartRaw);
  } catch {
    return ASTROLOGY_FALLBACK;
  }
}
/**
 * Attaches deep correlations to the mapa, with graceful degradation.
 * Failures are logged but do not break the calculation.
 */
function attachDeepCorrelations(
  mapa: MapaAlmaCompleto,
  numerologia: NumerologyResults,
  tarot: TarotResults,
  odu: OduResults,
  orixasDominantes: string[],
  astrologia: AstrologyResults
): void {
  try {
    const deepEngine = new DeepCorrelationEngine();
    const userData = buildDeepCorrelationUserData(numerologia, tarot, odu, orixasDominantes, mapa.perfil, astrologia);
    const correlations = deepEngine.analyzeCorrelations(userData);
    const patterns = deepEngine.findCrossSystemPatterns(userData);
    const energyHarmony = deepEngine.calculateEnergyHarmony(userData);
    mapa.deepCorrelations = { correlations, patterns, energyHarmony };
  } catch (err) {
    console.warn('[MapaAlma] Deep correlation analysis failed:', err instanceof Error ? err.message : String(err));
  }
}
/** Builds the UserSpiritualData shape required by DeepCorrelationEngine. */
function buildDeepCorrelationUserData(
  numerologia: NumerologyResults,
  tarot: TarotResults,
  odu: OduResults,
  orixasDominantes: string[],
  perfil: BirthProfile,
  astrologia: AstrologyResults
): UserSpiritualData {
  return {
    id: perfil.nomeCompleto,
    nome: perfil.nomeCompleto,
    dataNascimento: perfil.dataNascimento,
    numeroPessoal: numerologia.lifePath,
    arcoPessoal: tarot.cartaNascimento,
    odu: odu.regente.nome,
    orixaRegente: orixasDominantes[0] || '',
    sefirotDominante: [SEPHIRAH_MAP[numerologia.lifePath] || 'Malkuth'],
    arcoMaior: [tarot.cartaNascimento, tarot.cartaAlma],
    sign: astrologia.sol.signo,
    houses: {},
    rashi: astrologia.sol.signo,
  };
}
/** Attaches HyperCorrelation synthesis and signature to the mapa. */
function attachHyperSynthesis(
  mapa: MapaAlmaCompleto,
  numerologia: NumerologyResults,
  astrologia: AstrologyResults,
  odu: OduResults
): void {
  const orixaRegenteMapa = odu.orixas[0]?.toLowerCase() ?? 'oxala';
  const synthesis = hyperCorrelationEngine.answerDeepQuestion(
    numerologia.lifePath,
    astrologia.sol.signo,
    orixaRegenteMapa
  );
  const harmonization = generateHarmonizationRecommendations(numerologia.lifePath, astrologia.sol.signo, orixaRegenteMapa, odu);
  const lifePathStr = [11, 22, 33].includes(numerologia.lifePath) ? `${numerologia.lifePath}M` : String(numerologia.lifePath);
  const signStr = astrologia.sol.signo.substring(0, 3).toLowerCase();
  const orixaStr = orixaRegenteMapa.substring(0, 3);
  (mapa as unknown as Record<string, unknown>).hyperSynthesis = {
    signature: `${lifePathStr}-${signStr}-${orixaStr}`,
    explanation: synthesis,
    practices: [
      `Meditação diária para harmonia do Caminho ${numerologia.lifePath}`,
      `Oração a ${orixaRegenteMapa} no dia correspondente`,
      `Prática de respiração elementar`,
    ],
    harmonization,
    conflicts: harmonization.filter(h => h.type === 'conflict'),
  };
}
// ─── Harmonization Helper ─────────────────────────────────────────────────
interface HarmonizationItem {
  type: 'practice' | 'element' | 'conflict';
  tradition: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
}
function generateHarmonizationRecommendations(
  caminhoVida: number,
  signoSolar: string,
  orixaRegente: string,
  odu: OduResults
): HarmonizationItem[] {
  const recommendations: HarmonizationItem[] = [];
  // Master number special recommendations
  if ([11, 22, 33].includes(caminhoVida)) {
    recommendations.push({
      type: 'practice',
      tradition: 'Numerologia Cabalística',
      description: `Caminho de Vida ${caminhoVida} (MESTRE) — integre a energia com prática espiritual diária`,
      priority: 'high',
    });
  }
  // Element-based recommendations
  const elementFromVida = getElementFromNumber(caminhoVida);
  recommendations.push({
    type: 'element',
    tradition: 'Universal',
    description: `Elemento de trabalho: ${elementFromVida}`,
    priority: 'medium',
  });
  // Orixá recommendations
  const orixaData = getOrixa(orixaRegente);
  if (orixaData) {
    recommendations.push({
      type: 'practice',
      tradition: 'Candomblé',
      description: `Culto a ${orixaData.nome} no dia ${orixaData.diaSemana}`,
      priority: 'high',
    });
    recommendations.push({
      type: 'element',
      tradition: 'Candomblé',
      description: `Cores: ${orixaData.cores.join(', ')} | Chakra: ${orixaData.chakraPrincipal}º`,
      priority: 'medium',
    });
  }
  // Conflict detection (opposing elements)
  const signs = ['aries', 'leo', 'sagitario']; // Fire signs
  const waterSigns = ['cancer', 'escorpiao', 'peixes']; // Water signs
  if (signs.includes(signoSolar.toLowerCase()) && orixaData?.elemento === 'Água') {
    recommendations.push({
      type: 'conflict',
      tradition: 'Cross-System',
      description: 'Tensão Fogo-Água detectada — use signos de transição (Sagitário/Câncer) para mediação',
      priority: 'medium',
    });
  }
  return recommendations;
}
function getElementFromNumber(num: number): string {
  const base = num % 9 || 9;
  const elements = ['', 'Fogo', 'Água', 'Terra', 'Ar', 'Fogo', 'Terra', 'Água', 'Ar', 'Fogo'];
  return elements[base] || 'Ar';
}