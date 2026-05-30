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

// ============================================================
// CORRESPONDENCE TABLES
// ============================================================

const VIDA_ODU_MAP: Record<number, number> = {
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
        nome: secundario.nome,
        opeCima: regente.opeCima,
        opeBaixo: regente.opeBaixo,
        elementos: '',
        orixaRegente: secundario.orixaRegente,
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
  vida: number,
  oduNumero: number,
  ascendente: string,
  dataNascimento: string
): ChakraResults {
  const chakras = getChakraData();
  const parts = dataNascimento.split('-').map(Number);
  const dayOfBirth = new Date(2000, 0, parts[2]).getDay();
  const dominantChakraId = getDominantChakra(dayOfBirth, ascendente);

  const isHyperactive = vida % 2 !== 0;
  const isBlocked = oduNumero >= 10;

  const chakraInfos: ChakraInfo[] = chakras.map((c) => {
    let estado: ChakraInfo['estado'] = 'equilibrado';
    if (isHyperactive && c.sequence <= 3) estado = 'hiperativo';
    if (isBlocked && c.sequence >= 6) estado = 'bloqueado';
    const intensidade = c.id === dominantChakraId ? 85 : 50;
    return {
      numero: c.sequence,
      nome: c.namePt,
      estado,
      intensidade,
      elemento: c.element,
      cor: c.colorHex ?? c.color,
    };
  });

  const numHiper = chakraInfos.filter((x) => x.estado === 'hiperativo').length;
  const numBlocked = chakraInfos.filter((x) => x.estado === 'bloqueado').length;
  const equilibrio = Math.max(0, 70 - numHiper * 10 + numBlocked * 5);

  const dominante = chakras.find((c) => c.id === dominantChakraId);
  const bloqueado = chakras.find((c) => c.id === 'root');

  return {
    chakras: chakraInfos,
    dominante: dominante?.namePt ?? 'Plexo Solar',
    bloqueado: bloqueado?.namePt ?? 'Raiz',
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

function buildTarotResults(vida: number, _anoPessoal: number): TarotResults {
  const currentYear = new Date().getFullYear();
  const birthCardId = vida % 22;
  const yearCardId = Math.abs(vida + currentYear) % 22 || 1;
  const soulCardId = Math.abs(vida * 3) % 22 || 1;

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

export function detectarConvergencias(
  numerologia: NumerologyResults,
  odu: OduResults,
  astrologia: AstrologyResults
): Convergence[] {
  const convergencias: Convergence[] = [];

  if (VIDA_ODU_MAP[numerologia.vida] === odu.regente.numero) {
    convergencias.push({
      sistemas: ['numerologia', 'odu'],
      energia: odu.orixas[0]?.toLowerCase() ?? 'oxum',
      forca: 'forte',
      descricao: `Caminho de Vida ${numerologia.vida} alinha-se com ${odu.regente.nome}.`,
    });
  }

  const solSigno = astrologia.sol.signo;
  const solOrixa = PLANETA_SIGNO_ORIXÁ[solSigno];
  if (solOrixa && odu.orixas.includes(solOrixa)) {
    convergencias.push({
      sistemas: ['astrologia', 'odu'],
      energia: solOrixa.toLowerCase(),
      forca: 'medio',
      descricao: `Sol em ${solSigno} conecta-se a ${solOrixa} (${odu.regente.nome}).`,
    });
  }

  if (solOrixa && odu.orixas.includes(solOrixa)) {
    const vidaEnergia = odu.orixas[0]?.toLowerCase() ?? '';
    if (vidaEnergia === solOrixa.toLowerCase()) {
      convergencias.push({
        sistemas: ['numerologia', 'astrologia', 'odu'],
        energia: vidaEnergia,
        forca: 'forte',
        descricao: `Tríplice convergência: Vida ${numerologia.vida}, Sol em ${solSigno}, ${solOrixa}.`,
      });
    }
  }

  const ascOrixa = PLANETA_SIGNO_ORIXÁ[astrologia.ascendente];
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

// ============================================================
// MAIN ENGINE FUNCTION
// ============================================================

export async function gerarMapaAlmaCompleto(profile: BirthProfile): Promise<MapaAlmaCompleto> {
  const currentYear = new Date().getFullYear();

  // 1. NUMEROLOGIA
  const numerologiaRaw = calculateNumerology(profile.nomeCompleto, profile.dataNascimento);
  const numerologiaDestino = numerologiaRaw.destino;
  const numerologia: NumerologyResults = {
    vida: numerologiaRaw.vida,
    expressao: numerologiaRaw.expressao,
    motivacao: numerologiaRaw.motivacao,
    impressao: numerologiaRaw.impressao,
    destino: typeof numerologiaDestino === 'object' && numerologiaDestino !== null
      ? (numerologiaDestino as { numero: number }).numero
      : 0,
    cicloAtual: reduceToBase(currentYear),
    anoPessoal: calcularAnoPessoal(profile.dataNascimento),
    metodoUsado: 'pitagorica',
    raw: undefined,
  };

  // 2. ODU
  const odu = calcOdu(profile);

  // 3. ASTROLOGIA
  const coords =
    CITY_COORDS[profile.cidade] ||
    CITY_COORDS[profile.estado] ||
    DEFAULT_COORDS;

  let astrologia: AstrologyResults;
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
    astrologia = parseAstrologyResults(chartRaw);
  } catch {
    astrologia = ASTROLOGY_FALLBACK;
  }

  // 4. TAROT
  const tarot = buildTarotResults(numerologia.vida, numerologia.anoPessoal);

  // 5. CHAKRAS
  const chakras = buildChakraResults(
    numerologia.vida,
    odu.regente.numero,
    astrologia.ascendente,
    profile.dataNascimento
  );

  // 6. CONVERGÊNCIAS
  const convergencias = detectarConvergencias(numerologia, odu, astrologia);

  // 7. ORIXÁS DOMINANTES
  const orixasDominantes = aggregateOrixas(
    odu,
    astrologia.ascendente,
    astrologia.sol.signo
  );

  return {
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
  };
}

export default gerarMapaAlmaCompleto;
