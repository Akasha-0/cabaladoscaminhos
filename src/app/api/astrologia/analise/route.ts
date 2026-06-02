// ============================================================
// ASTROLOGIA ANÁLISE API - CABALA DOS CAMINHOS
// Birth chart analysis with spiritual correlations
// ============================================================
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { calcularMapaNatal } from '@/lib/astrologia/planetas/posicoes';
import { calcularAspectos } from '@/lib/astrologia/planetas/aspectos';
import type { MapaNatal, Aspecto, Planeta } from '@/lib/astrologia/tipos';

// ─── Zod Schemas ───────────────────────────────────────────────────────────
const SefirotSchema = z.enum([
  'Kether', 'Chokhmah', 'Binah', 'Chesed', 'Gevurah',
  'Tipheret', 'Netzach', 'Hod', 'Yesod', 'Malkuth'
]);
const ChakraSchema = z.coerce.number().int().min(1).max(7);
const ElementSchema = z.enum(['Fogo', 'Água', 'Terra', 'Ar', 'Éter']);

const AnaliseQuerySchema = z.object({
  dataNascimento: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato: YYYY-MM-DD'),
  horaNascimento: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, 'Formato: HH:MM ou HH:MM:SS').optional(),
  latitude: z.string().regex(/^-?\d+\.?\d*$/, 'Latitude inválida'),
  longitude: z.string().regex(/^-?\d+\.?\d*$/, 'Longitude inválida'),
  sefirot: SefirotSchema.optional(),
  chakra: ChakraSchema.optional(),
  element: ElementSchema.optional(),
  orixa: z.string().optional(),
});

// ─── Sign Spiritual Correlations ──────────────────────────────────────────
const SIGN_SPIRITUAL_CORRELATIONS: Record<string, {
  sefirot: string[];
  chakra: number;
  element: string;
  orixa: string;
  affirmation: string;
  frequency: string;
  planet: string;
}> = {
  aries: { sefirot: ['Kether', 'Gevurah'], chakra: 1, element: 'Fogo', orixa: 'Ogum', affirmation: 'Eu inicio com coragem', frequency: '528 Hz', planet: 'Marte' },
  touro: { sefirot: ['Malkuth', 'Chesed'], chakra: 2, element: 'Terra', orixa: 'Oxum', affirmation: 'Eu construo com persistência', frequency: '396 Hz', planet: 'Vênus' },
  gemeos: { sefirot: ['Hod', 'Netzach'], chakra: 5, element: 'Ar', orixa: 'Orunmilá', affirmation: 'Eu me comunico com clareza', frequency: '741 Hz', planet: 'Mercúrio' },
  cancer: { sefirot: ['Yesod', 'Binah'], chakra: 4, element: 'Água', orixa: 'Iemanjá', affirmation: 'Eu nutro com compaixão', frequency: '639 Hz', planet: 'Lua' },
  leao: { sefirot: ['Tipheret', 'Kether'], chakra: 4, element: 'Fogo', orixa: 'Oxum', affirmation: 'Eu brilho com autenticidade', frequency: '528 Hz', planet: 'Sol' },
  virgem: { sefirot: ['Hod', 'Gevurah'], chakra: 3, element: 'Terra', orixa: 'Omolu', affirmation: 'Eu sirvo com perfeição', frequency: '417 Hz', planet: 'Mercúrio' },
  libra: { sefirot: ['Tipheret', 'Netzach'], chakra: 6, element: 'Ar', orixa: 'Orunmilá', affirmation: 'Eu harmonizo com justiça', frequency: '639 Hz', planet: 'Vênus' },
  escorpiao: { sefirot: ['Gevurah', 'Hod'], chakra: 1, element: 'Água', orixa: 'Iansã', affirmation: 'Eu transformo com profundidade', frequency: '417 Hz', planet: 'Plutão' },
  sagitario: { sefirot: ['Chokhmah', 'Chesed'], chakra: 6, element: 'Fogo', orixa: 'Oxóssi', affirmation: 'Eu expanso com sabedoria', frequency: '741 Hz', planet: 'Júpiter' },
  capricornio: { sefirot: ['Malkuth', 'Gevurah'], chakra: 1, element: 'Terra', orixa: 'Ogum', affirmation: 'Eu conquisto com disciplina', frequency: '396 Hz', planet: 'Saturno' },
  aquario: { sefirot: ['Chokhmah', 'Hod'], chakra: 7, element: 'Ar', orixa: 'Oxalá', affirmation: 'Eu inovo para a humanidade', frequency: '963 Hz', planet: 'Saturno' },
  peixes: { sefirot: ['Binah', 'Yesod'], chakra: 7, element: 'Água', orixa: 'Iemanjá', affirmation: 'Eu transcendo com fé', frequency: '963 Hz', planet: 'Júpiter' },
};

// ─── Planet Spiritual Correlations ──────────────────────────────────────────
const PLANET_SPIRITUAL_CORRELATIONS: Record<string, {
  sefirot: string[];
  chakra: number;
  element: string;
  orixa: string;
  affirmation: string;
  frequency: string;
}> = {
  sol: { sefirot: ['Kether', 'Tipheret'], chakra: 4, element: 'Fogo', orixa: 'Oxum', affirmation: 'Eu brilho com minha verdade', frequency: '528 Hz' },
  lua: { sefirot: ['Yesod', 'Binah'], chakra: 6, element: 'Água', orixa: 'Iemanjá', affirmation: 'Eu fluo com a vida', frequency: '639 Hz' },
  mercurio: { sefirot: ['Hod', 'Netzach'], chakra: 5, element: 'Ar', orixa: 'Orunmilá', affirmation: 'Eu comunico com clareza', frequency: '741 Hz' },
  venus: { sefirot: ['Tipheret', 'Chesed'], chakra: 4, element: 'Fogo', orixa: 'Oxum', affirmation: 'Eu amo em harmonia', frequency: '528 Hz' },
  marte: { sefirot: ['Gevurah', 'Kether'], chakra: 1, element: 'Fogo', orixa: 'Ogum', affirmation: 'Eu ajo com coragem', frequency: '396 Hz' },
  jupiter: { sefirot: ['Chokhmah', 'Chesed'], chakra: 6, element: 'Fogo', orixa: 'Oxóssi', affirmation: 'Eu expanso com sabedoria', frequency: '528 Hz' },
  saturno: { sefirot: ['Malkuth', 'Gevurah'], chakra: 1, element: 'Terra', orixa: 'Ogum', affirmation: 'Eu construo com disciplina', frequency: '174 Hz' },
  urano: { sefirot: ['Chokhmah', 'Hod'], chakra: 7, element: 'Ar', orixa: 'Oxalá', affirmation: 'Eu liberto com originalidade', frequency: '963 Hz' },
  netuno: { sefirot: ['Binah', 'Kether'], chakra: 7, element: 'Água', orixa: 'Iemanjá', affirmation: 'Eu transcendo com fé', frequency: '963 Hz' },
  plutao: { sefirot: ['Gevurah', 'Hod'], chakra: 1, element: 'Fogo', orixa: 'Iansã', affirmation: 'Eu transformo com poder', frequency: '417 Hz' },
};

// ─── Aspect Spiritual Correlations ──────────────────────────────────────────
const ASPECT_SPIRITUAL_CORRELATIONS: Record<string, {
  sefirot: string[];
  chakra: number;
  element: string;
  orixa: string;
  affirmation: string;
  frequency: string;
  meaning: string;
}> = {
  conjuncao: { sefirot: ['Kether', 'Tipheret'], chakra: 6, element: 'Fogo', orixa: 'Oxalá', affirmation: 'Unifico estas forças em mim', frequency: '528 Hz', meaning: 'Fusão de energias - combinação de forças' },
  sextil: { sefirot: ['Chesed', 'Netzach'], chakra: 5, element: 'Ar', orixa: 'Orunmilá', affirmation: 'Aproveito estas oportunidades', frequency: '639 Hz', meaning: 'Oportunidade - habilidades naturais' },
  quadratura: { sefirot: ['Gevurah', 'Hod'], chakra: 3, element: 'Fogo', orixa: 'Xangô', affirmation: 'Transmuo esta tensão em crescimento', frequency: '417 Hz', meaning: 'Tensão - crescimento através do desafio' },
  trino: { sefirot: ['Tipheret', 'Chesed'], chakra: 6, element: 'Fogo', orixa: 'Oxum', affirmation: 'Estas energias fluem em harmonia', frequency: '528 Hz', meaning: 'Harmonia - facilidade e fluidez' },
  opposição: { sefirot: ['Binah', 'Netzach'], chakra: 4, element: 'Água', orixa: 'Iemanjá', affirmation: 'Integro estas polaridades em equilíbrio', frequency: '639 Hz', meaning: 'Polaridade - integração de opostos' },
};

// ─── House Spiritual Correlations ──────────────────────────────────────────
const HOUSE_SPIRITUAL_CORRELATIONS: Record<number, {
  sefirot: string[];
  chakra: number;
  element: string;
  orixa: string;
  affirmation: string;
  frequency: string;
}> = {
  1: { sefirot: ['Kether', 'Gevurah'], chakra: 1, element: 'Fogo', orixa: 'Ogum', affirmation: 'Eu sou quem escolho ser', frequency: '528 Hz' },
  2: { sefirot: ['Malkuth', 'Chesed'], chakra: 2, element: 'Terra', orixa: 'Oxum', affirmation: 'Eu valorizo minha abundância', frequency: '396 Hz' },
  3: { sefirot: ['Hod', 'Netzach'], chakra: 5, element: 'Ar', orixa: 'Orunmilá', affirmation: 'Eu me comunico com clareza', frequency: '741 Hz' },
  4: { sefirot: ['Yesod', 'Binah'], chakra: 4, element: 'Água', orixa: 'Iemanjá', affirmation: 'Minhas raízes são sagradas', frequency: '639 Hz' },
  5: { sefirot: ['Tipheret', 'Kether'], chakra: 4, element: 'Fogo', orixa: 'Oxum', affirmation: 'Eu crio com alegria', frequency: '528 Hz' },
  6: { sefirot: ['Hod', 'Gevurah'], chakra: 3, element: 'Terra', orixa: 'Omolu', affirmation: 'Eu sirvo com amor', frequency: '417 Hz' },
  7: { sefirot: ['Tipheret', 'Netzach'], chakra: 6, element: 'Ar', orixa: 'Orunmilá', affirmation: 'Eu partnership é sagrado', frequency: '639 Hz' },
  8: { sefirot: ['Gevurah', 'Hod'], chakra: 1, element: 'Fogo', orixa: 'Iansã', affirmation: 'Eu transformo através do poder', frequency: '417 Hz' },
  9: { sefirot: ['Chokhmah', 'Chesed'], chakra: 6, element: 'Fogo', orixa: 'Oxóssi', affirmation: 'Minha sabedoria se expande', frequency: '741 Hz' },
  10: { sefirot: ['Malkuth', 'Tipheret'], chakra: 1, element: 'Terra', orixa: 'Ogum', affirmation: 'Meu propósito se manifesta', frequency: '528 Hz' },
  11: { sefirot: ['Chokhmah', 'Hod'], chakra: 7, element: 'Ar', orixa: 'Oxalá', affirmation: 'Minhas aspirações são divinas', frequency: '963 Hz' },
  12: { sefirot: ['Binah', 'Kether'], chakra: 7, element: 'Água', orixa: 'Iemanjá', affirmation: 'Eu transcendo através da fé', frequency: '963 Hz' },
};

interface AnaliseStrength {
  name: string;
  description: string;
  spiritualCorrelations?: {
    sefirot: string[];
    chakra: number;
    element: string;
    orixa: string;
    affirmation: string;
    frequency: string;
  };
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const parseResult = AnaliseQuerySchema.safeParse({
      dataNascimento: searchParams.get('dataNascimento'),
      horaNascimento: searchParams.get('horaNascimento'),
      latitude: searchParams.get('latitude'),
      longitude: searchParams.get('longitude'),
      sefirot: searchParams.get('sefirot'),
      chakra: searchParams.get('chakra'),
      element: searchParams.get('element'),
      orixa: searchParams.get('orixa'),
    });

    if (!parseResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Parâmetros inválidos',
        details: parseResult.error.flatten().fieldErrors,
      }, { status: 400 });
    }

    const { dataNascimento, horaNascimento = '12:00', latitude, longitude, sefirot, chakra, element, orixa } = parseResult.data;

    const mapaNatal = calcularMapaNatal(
      new Date(dataNascimento),
      horaNascimento,
      parseFloat(latitude),
      parseFloat(longitude)
    );

    const posicoes = Object.values(mapaNatal.planeta);
    const aspectos = calcularAspectos(posicoes);

    // Enrich mapa natal with spiritual correlations
    const mapaNatalEnriched = { ...mapaNatal };
    Object.entries(mapaNatal.planeta).forEach(([planeta, posicao]) => {
      const planetCorr = PLANET_SPIRITUAL_CORRELATIONS[planeta] || PLANET_SPIRITUAL_CORRELATIONS['sol'];
      const signCorr = SIGN_SPIRITUAL_CORRELATIONS[posicao.signo] || SIGN_SPIRITUAL_CORRELATIONS['aries'];
      const houseCorr = HOUSE_SPIRITUAL_CORRELATIONS[posicao.casa] || HOUSE_SPIRITUAL_CORRELATIONS[1];
      const planetKey = planeta as keyof typeof mapaNatalEnriched.planeta;
      const enriched = mapaNatalEnriched.planeta[planetKey] as unknown as typeof posicao & { spiritualCorrelations: object };
      enriched.spiritualCorrelations = {
        planet: planetCorr,
        sign: signCorr,
        house: houseCorr,
        combined: {
          sefirot: [...new Set([...planetCorr.sefirot, ...signCorr.sefirot, ...houseCorr.sefirot])],
          chakra: Math.round((planetCorr.chakra + signCorr.chakra + houseCorr.chakra) / 3),
          element: signCorr.element,
          orixa: signCorr.orixa,
          affirmation: signCorr.affirmation,
          frequency: signCorr.frequency,
        },
      };
    });

    // Enrich aspects with spiritual correlations
    const aspectosEnriched = aspectos.map(aspecto => {
      const aspectCorr = ASPECT_SPIRITUAL_CORRELATIONS[aspecto.tipo] || ASPECT_SPIRITUAL_CORRELATIONS['conjuncao'];
      const p1Corr = PLANET_SPIRITUAL_CORRELATIONS[aspecto.planeta1] || PLANET_SPIRITUAL_CORRELATIONS['sol'];
      const p2Corr = PLANET_SPIRITUAL_CORRELATIONS[aspecto.planeta2] || PLANET_SPIRITUAL_CORRELATIONS['sol'];
      return {
        ...aspecto,
        spiritualCorrelations: {
          aspect: aspectCorr,
          planets: { [aspecto.planeta1]: p1Corr, [aspecto.planeta2]: p2Corr },
          combined: {
            sefirot: [...new Set([...aspectCorr.sefirot, ...p1Corr.sefirot, ...p2Corr.sefirot])],
            chakra: Math.round((aspectCorr.chakra + p1Corr.chakra + p2Corr.chakra) / 3),
            element: aspectCorr.element,
            orixa: aspectCorr.orixa,
            affirmation: aspectCorr.affirmation,
            frequency: aspectCorr.frequency,
          },
        },
      };
    });

    const strengths = analyzeStrengths(mapaNatal, aspectos);
    const challenges = analyzeChallenges(mapaNatal, aspectos);
    const interpretacao = generateInterpretation(mapaNatal, aspectos);

    // Calculate spiritual stats
    const spiritualStats = {
      bySefirot: {} as Record<string, number>,
      byChakra: {} as Record<string, number>,
      byElement: {} as Record<string, number>,
      byOrixa: {} as Record<string, number>,
      byPlanet: {} as Record<string, number>,
      bySign: {} as Record<string, number>,
    };

// fallow-ignore-next-line complexity
    Object.entries(mapaNatal.planeta).forEach(([planeta, posicao]) => {
      const planetCorr = PLANET_SPIRITUAL_CORRELATIONS[planeta] || {};
      const signCorr = SIGN_SPIRITUAL_CORRELATIONS[posicao.signo] || {};
      const houseCorr = HOUSE_SPIRITUAL_CORRELATIONS[posicao.casa] || {};

      (planetCorr.sefirot || []).forEach(s => { spiritualStats.bySefirot[s] = (spiritualStats.bySefirot[s] || 0) + 1; });
      (signCorr.sefirot || []).forEach(s => { spiritualStats.bySefirot[s] = (spiritualStats.bySefirot[s] || 0) + 1; });
      (houseCorr.sefirot || []).forEach(s => { spiritualStats.bySefirot[s] = (spiritualStats.bySefirot[s] || 0) + 1; });

      if (planetCorr.chakra) spiritualStats.byChakra[planetCorr.chakra] = (spiritualStats.byChakra[planetCorr.chakra] || 0) + 1;
      if (signCorr.chakra) spiritualStats.byChakra[signCorr.chakra] = (spiritualStats.byChakra[signCorr.chakra] || 0) + 1;
      if (houseCorr.chakra) spiritualStats.byChakra[houseCorr.chakra] = (spiritualStats.byChakra[houseCorr.chakra] || 0) + 1;

      if (planetCorr.element) spiritualStats.byElement[planetCorr.element] = (spiritualStats.byElement[planetCorr.element] || 0) + 1;
      if (signCorr.element) spiritualStats.byElement[signCorr.element] = (spiritualStats.byElement[signCorr.element] || 0) + 1;
      if (houseCorr.element) spiritualStats.byElement[houseCorr.element] = (spiritualStats.byElement[houseCorr.element] || 0) + 1;

      if (planetCorr.orixa) spiritualStats.byOrixa[planetCorr.orixa] = (spiritualStats.byOrixa[planetCorr.orixa] || 0) + 1;
      if (signCorr.orixa) spiritualStats.byOrixa[signCorr.orixa] = (spiritualStats.byOrixa[signCorr.orixa] || 0) + 1;
      if (houseCorr.orixa) spiritualStats.byOrixa[houseCorr.orixa] = (spiritualStats.byOrixa[houseCorr.orixa] || 0) + 1;

      spiritualStats.byPlanet[planeta] = (spiritualStats.byPlanet[planeta] || 0) + 1;
      spiritualStats.bySign[posicao.signo] = (spiritualStats.bySign[posicao.signo] || 0) + 1;
    });

    // Build response
    const response = {
      success: true,
      mapaNatal: mapaNatalEnriched,
      aspectos: aspectosEnriched,
      strengths,
      challenges,
      interpretacao,
      spiritualCorrelations: {
        signs: SIGN_SPIRITUAL_CORRELATIONS,
        planets: PLANET_SPIRITUAL_CORRELATIONS,
        aspects: ASPECT_SPIRITUAL_CORRELATIONS,
        houses: HOUSE_SPIRITUAL_CORRELATIONS,
      },
      spiritualStats,
      meta: {
        filters: { sefirot, chakra, element, orixa },
      },
    };

    // Apply spiritual filters
    if (sefirot || chakra || element || orixa) {
      const filteredPlanets = Object.entries(mapaNatal.planeta).filter(([planeta, posicao]) => {
        const planetCorr = PLANET_SPIRITUAL_CORRELATIONS[planeta] || {};
        const signCorr = SIGN_SPIRITUAL_CORRELATIONS[posicao.signo] || {};
        if (sefirot && ![...planetCorr.sefirot, ...signCorr.sefirot].includes(sefirot)) return false;
        if (chakra && planetCorr.chakra !== chakra && signCorr.chakra !== chakra) return false;
        if (element && planetCorr.element !== element && signCorr.element !== element) return false;
        if (orixa && planetCorr.orixa !== orixa && signCorr.orixa !== orixa) return false;
        return true;
      });

      if (filteredPlanets.length === 0) {
        return NextResponse.json({
          success: false,
          error: 'Nenhuma posição astrológica encontrada para os filtros espirituais especificados',
        }, { status: 404 });
      }

      response.mapaNatal.planeta = Object.fromEntries(filteredPlanets) as MapaNatal['planeta'];
    }

    return NextResponse.json({
      ...response,
      headers: {
        'Cache-Control': 'public, max-age=259200, stale-while-revalidate=604800',
      },
    });
  } catch (_error) {
    console.error('Erro na análise astrológica:', _error);
    return NextResponse.json({
      success: false,
      error: 'Erro ao realizar análise astrológica',
    }, { status: 500 });
  }
}

function analyzeStrengths(mapaNatal: MapaNatal, aspectos: Aspecto[]): AnaliseStrength[] {
  const strengths: AnaliseStrength[] = [];
  const planetas = mapaNatal.planeta;

  // Analyze trines (positive aspects)
  const trinos = aspectos.filter(a => a.tipo === 'trino');
  trinos.forEach(trino => {
    strengths.push({
      name: 'Harmonia Planetária',
      description: `${capitalize(trino.planeta1)} em trino com ${capitalize(trino.planeta2)} indica facilidade e fluidez nestas áreas da vida.`,
      spiritualCorrelations: ASPECT_SPIRITUAL_CORRELATIONS['trino'],
    });
  });

  // Analyze sextiles (opportunity aspects)
  const sextils = aspectos.filter(a => a.tipo === 'sextil');
  sextils.forEach(sextil => {
    strengths.push({
      name: 'Potencial de Crescimento',
      description: `${capitalize(sextil.planeta1)} em sextil com ${capitalize(sextil.planeta2)} representa habilidades naturais que podem ser desenvolvidas.`,
      spiritualCorrelations: ASPECT_SPIRITUAL_CORRELATIONS['sextil'],
    });
  });

  // Single planets in domicile (dignified)
  const signosRegentes: Record<string, Planeta> = {
    aries: 'marte', touro: 'venus', gemeos: 'mercurio', cancer: 'lua',
    leao: 'sol', virgem: 'mercurio', libra: 'venus', escorpiao: 'plutao',
    sagitario: 'jupiter', capricornio: 'saturno', aquario: 'saturno', peixes: 'jupiter',
  };

  Object.entries(planetas).forEach(([planeta, posicao]) => {
    const signoRegente = Object.entries(signosRegentes).find(
      ([signo, plan]) => signo === posicao.signo && plan === planeta
    );
    if (signoRegente) {
      strengths.push({
        name: 'Dignidade Planetária',
        description: `${capitalize(planeta)} em seu signo regente (${capitalize(posicao.signo)}) indica força natural e domínio nestas energias.`,
        spiritualCorrelations: PLANET_SPIRITUAL_CORRELATIONS[planeta],
      });
    }
  });

  // Strong aspects to Sun
  const aspectosSol = aspectos.filter(
    a => (a.planeta1 === 'sol' || a.planeta2 === 'sol') && (a.tipo === 'trino' || a.tipo === 'sextil')
  );
  if (aspectosSol.length >= 2) {
    strengths.push({
      name: 'Vitalidade Essencial',
      description: 'Múltiplos aspectos positivos ao Sol indicam brilho pessoal, autoconfiança e propósito claro.',
      spiritualCorrelations: PLANET_SPIRITUAL_CORRELATIONS['sol'],
    });
  }

  return strengths;
}

function analyzeChallenges(mapaNatal: MapaNatal, aspectos: Aspecto[]): AnaliseStrength[] {
  const challenges: AnaliseStrength[] = [];

  // Analyze squares (challenging aspects)
  const quadraturas = aspectos.filter(a => a.tipo === 'quadratura');
  quadraturas.forEach(quad => {
    challenges.push({
      name: 'Tensão Criativa',
      description: `${capitalize(quad.planeta1)} em quadratura com ${capitalize(quad.planeta2)} gera tensão que pode ser canalizada para crescimento.`,
      spiritualCorrelations: ASPECT_SPIRITUAL_CORRELATIONS['quadratura'],
    });
  });

  // Analyze oppositions
  const oposicoes = aspectos.filter(a => a.tipo === 'oposição');
  oposicoes.forEach(opos => {
    challenges.push({
      name: 'Polaridade e Integração',
      description: `${capitalize(opos.planeta1)} em oposição com ${capitalize(opos.planeta2)} destaca áreas que precisam de integração consciente.`,
      spiritualCorrelations: ASPECT_SPIRITUAL_CORRELATIONS['oposição'],
    });
  });

  // Planets in fall or detriment
  const signosExilados: Record<string, Planeta[]> = {
    aries: ['saturno'], touro: ['marte'], gemeos: ['jupiter'], cancer: ['plutao'],
    leao: ['saturno'], virgem: ['venus'], libra: ['marte'], escorpiao: ['venus'],
    sagitario: ['mercurio'], capricornio: ['lua'], aquario: ['lua'], peixes: ['mercurio'],
  };

  Object.entries(mapaNatal.planeta).forEach(([planeta, posicao]) => {
    const exilados = signosExilados[posicao.signo];
    if (exilados && exilados.includes(planeta as Planeta)) {
      challenges.push({
        name: 'Exílio Planetário',
        description: `${capitalize(planeta)} em ${capitalize(posicao.signo)} (exílio) indica energias que requerem esforço consciente para integrar.`,
        spiritualCorrelations: PLANET_SPIRITUAL_CORRELATIONS[planeta as Planeta],
      });
    }
  });

  // Saturn challenging squares
  const saturnoDesafios = aspectos.filter(
    a => (a.planeta1 === 'saturno' || a.planeta2 === 'saturno') &&
         (a.tipo === 'quadratura' || a.tipo === 'oposição')
  );
  if (saturnoDesafios.length >= 2) {
    challenges.push({
      name: 'Disciplina e Responsabilidade',
      description: 'Múltiplos aspectos desafiadores de Saturno indicam necessidade de estrutura e superação de obstáculos para crescimento.',
      spiritualCorrelations: PLANET_SPIRITUAL_CORRELATIONS['saturno'],
    });
  }

  return challenges;
}

interface InterpretacaoPlaneta {
  planeta: Planeta;
  signo: string;
  casa: number;
  energia: 'positiva' | 'desafiadora' | 'neutra';
  descricao: string;
  spiritualCorrelations?: {
    planet: object;
    sign: object;
    house: object;
    combined: object;
  };
}

function generateInterpretation(mapaNatal: MapaNatal, aspectos: Aspecto[]): InterpretacaoPlaneta[] {
  const interpretacao: InterpretacaoPlaneta[] = [];
  const signosNomes: Record<string, string> = {
    aries: 'pioneiro, assertivo e direto', touro: 'prático, persistente e apreciador',
    gemeos: 'versátil, comunicativo e curioso', cancer: 'intuitivo, emocional e protetor',
    leao: 'criativo, generoso e carismático', virgem: 'analítico, detalhista e útil',
    libra: 'diplomático, harmonioso e social', escorpiao: 'intenso, transformador e profundo',
    sagitario: 'otimista, aventureiro e filosófico', capricornio: 'ambicioso, disciplinado e responsável',
    aquario: 'inovador, original e humanitário', peixes: 'compassivo, espiritual e sonhador',
  };

  const planetasNomes: Record<string, string> = {
    sol: 'identidade e propósito de vida', lua: 'emoções e necessidades emocionais',
    mercurio: 'comunicação e capacidade mental', venus: 'amor, beleza e valores',
    marte: 'energia, ação e desejo', jupiter: 'expansão, sorte e sabedoria',
    saturno: 'responsabilidade, limites e estrutura', urano: 'mudança, liberdade e originalidade',
    netuno: 'intuição, espiritualidade e transcendência', plutao: 'transformação, poder e renovação',
  };

// fallow-ignore-next-line complexity
  Object.entries(mapaNatal.planeta).forEach(([planeta, posicao]) => {
    const aspectosDoPlaneta = aspectos.filter(
      a => a.planeta1 === planeta || a.planeta2 === planeta
    );
    const energiaPositiva = aspectosDoPlaneta.filter(
      a => a.tipo === 'trino' || a.tipo === 'sextil'
    ).length;
    const energiaDesafiadora = aspectosDoPlaneta.filter(
      a => a.tipo === 'quadratura' || a.tipo === 'oposição'
    ).length;

    let energia: 'positiva' | 'desafiadora' | 'neutra' = 'neutra';
    if (energiaPositiva > energiaDesafiadora) energia = 'positiva';
    else if (energiaDesafiadora > energiaPositiva) energia = 'desafiadora';

    const signoDesc = signosNomes[posicao.signo] || 'desconhecido';
    const planetaDesc = planetasNomes[planeta] || 'energia desconhecida';

    const planetCorr = PLANET_SPIRITUAL_CORRELATIONS[planeta] || {};
    const signCorr = SIGN_SPIRITUAL_CORRELATIONS[posicao.signo] || {};
    const houseCorr = HOUSE_SPIRITUAL_CORRELATIONS[posicao.casa] || {};

    interpretacao.push({
      planeta: planeta as Planeta,
      signo: posicao.signo,
      casa: posicao.casa,
      energia,
      descricao: `${capitalize(planeta)} em ${capitalize(posicao.signo)} na Casa ${posicao.casa}: representa o ${planetaDesc} em modo ${signoDesc}.`,
      spiritualCorrelations: {
        planet: planetCorr,
        sign: signCorr,
        house: houseCorr,
        combined: {
          sefirot: [...new Set([...(planetCorr.sefirot || []), ...(signCorr.sefirot || []), ...(houseCorr.sefirot || [])])],
          chakra: Math.round(((planetCorr.chakra || 4) + (signCorr.chakra || 4) + (houseCorr.chakra || 4)) / 3),
          element: signCorr.element || 'Fogo',
          orixa: signCorr.orixa || 'Oxalá',
          affirmation: signCorr.affirmation || 'Eu sou luz',
          frequency: signCorr.frequency || '528 Hz',
        },
      },
    });
  });

  return interpretacao;
}