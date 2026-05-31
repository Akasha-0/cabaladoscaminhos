// ============================================================
// IFÁ API - CABALA DOS CAMINHOS
// Enhanced with spiritual correlations
// ============================================================
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { odusData, calcularOduNascimento } from '@/lib/odus/calculos';
import { getOduTimeline, getPhaseProgress } from '@/lib/ifa/timeline';
import { matchOduToRitual } from '@/lib/ifa/matching';
import { getRitualSuggestions, getRitualTiming } from '@/lib/ifa/suggestions';
import { compareOduNumbers } from '@/lib/ifa/comparison';
import { successResponse, errorResponse, ErrorCode } from '@/lib/api/base-route';

// ─── Zod Schemas ───────────────────────────────────────────────────────────
const SefirotSchema = z.enum([
  'Kether', 'Chokhmah', 'Binah', 'Chesed', 'Gevurah',
  'Tipheret', 'Netzach', 'Hod', 'Yesod', 'Malkuth'
]);
const ChakraSchema = z.coerce.number().int().min(1).max(7);
const ElementSchema = z.enum(['Fogo', 'Água', 'Terra', 'Ar', 'Éter']);

const IfaQuerySchema = z.object({
  numero: z.coerce.number().int().min(1).max(16).optional(),
  nome: z.string().optional(),
  sefirot: SefirotSchema.optional(),
  chakra: ChakraSchema.optional(),
  element: ElementSchema.optional(),
  orixa: z.string().optional(),
});

// ─── Spiritual Correlations for Odús ──────────────────────────────────────────
const ODU_SPIRITUAL_CORRELATIONS: Record<number, {
  sefirot: string[];
  chakra: number;
  element: string;
  orixa: string;
  affirmation: string;
  frequency: string;
}> = {
  1: { sefirot: ['Hod', 'Gevurah'], chakra: 5, element: 'Fogo', orixa: 'Ogum', affirmation: 'Eu inicio meu caminho com coragem', frequency: '417 Hz' },
  2: { sefirot: ['Chokhmah', 'Binah'], chakra: 6, element: 'Ar', orixa: 'Iemanjá', affirmation: 'A dualidade me ensina harmonia', frequency: '639 Hz' },
  3: { sefirot: ['Gevurah', 'Malkuth'], chakra: 1, element: 'Terra', orixa: 'Ogum', affirmation: 'A força de Ogum me protege', frequency: '396 Hz' },
  4: { sefirot: ['Binah', 'Yesod'], chakra: 2, element: 'Água', orixa: 'Iemanjá', affirmation: 'Minha visão espiritual clareia o caminho', frequency: '639 Hz' },
  5: { sefirot: ['Tipheret', 'Chesed'], chakra: 4, element: 'Água', orixa: 'Oxum', affirmation: 'A doçura de Oxum me adorna', frequency: '528 Hz' },
  6: { sefirot: ['Chesed', 'Gevurah'], chakra: 3, element: 'Fogo', orixa: 'Xangô', affirmation: 'A riqueza de Xangô me abençoa', frequency: '528 Hz' },
  7: { sefirot: ['Malkuth', 'Binah'], chakra: 1, element: 'Terra', orixa: 'Omolu', affirmation: 'A transformação de Omolu me renova', frequency: '174 Hz' },
  8: { sefirot: ['Netzach', 'Hod'], chakra: 6, element: 'Fogo', orixa: 'Iansã', affirmation: 'O poder de Iansã me transforma', frequency: '417 Hz' },
  9: { sefirot: ['Tipheret', 'Yesod'], chakra: 4, element: 'Fogo', orixa: 'Oxum', affirmation: 'A clareza me guia para a verdade', frequency: '528 Hz' },
  10: { sefirot: ['Netzach', 'Malkuth'], chakra: 6, element: 'Terra', orixa: 'Oxóssi', affirmation: 'A prosperidade flui em minha vida', frequency: '639 Hz' },
  11: { sefirot: ['Kether', 'Chokhmah'], chakra: 7, element: 'Ar', orixa: 'Oxalá', affirmation: 'A justiça de Oxalá me equilibra', frequency: '963 Hz' },
  12: { sefirot: ['Yesod', 'Malkuth'], chakra: 2, element: 'Água', orixa: 'Iemanjá', affirmation: 'O amor de Iemanjá me sustenta', frequency: '639 Hz' },
  13: { sefirot: ['Chokhmah', 'Hod'], chakra: 5, element: 'Ar', orixa: 'Orunmilá', affirmation: 'A sabedoria de Orunmilá me ilumina', frequency: '741 Hz' },
  14: { sefirot: ['Binah', 'Tipheret'], chakra: 4, element: 'Fogo', orixa: 'Xangô', affirmation: 'O destino se revela em meu caminho', frequency: '528 Hz' },
  15: { sefirot: ['Kether', 'Tipheret'], chakra: 7, element: 'Éter', orixa: 'Oxalá', affirmation: 'A bênção divina me protege', frequency: '963 Hz' },
  16: { sefirot: ['Binah', 'Kether', 'Yesod'], chakra: 7, element: 'Água', orixa: 'Iemanjá', affirmation: 'O universo conspirou a meu favor', frequency: '963 Hz' },
};

// ─── Orixá Regente Spiritual Correlations ──────────────────────────────────────────
const ORIXA_SPIRITUAL_CORRELATIONS: Record<string, {
  sefirot: string[];
  chakra: number;
  element: string;
  affirmation: string;
  frequency: string;
}> = {
  'Exu': { sefirot: ['Hod', 'Gevurah'], chakra: 5, element: 'Fogo', affirmation: 'Exu abre meus caminhos', frequency: '417 Hz' },
  'Ibeji': { sefirot: ['Chokhmah', 'Binah'], chakra: 6, element: 'Ar', affirmation: 'O equilíbrio dos gêmeos me sustenta', frequency: '639 Hz' },
  'Ogum': { sefirot: ['Gevurah', 'Malkuth'], chakra: 1, element: 'Fogo', affirmation: 'Ogum me dá vitória', frequency: '396 Hz' },
  'Iemanjá': { sefirot: ['Binah', 'Yesod'], chakra: 2, element: 'Água', affirmation: 'Iemanjá me protege nas águas', frequency: '639 Hz' },
  'Oxum': { sefirot: ['Tipheret', 'Chesed'], chakra: 4, element: 'Água', affirmation: 'Oxum me adorna com beleza', frequency: '528 Hz' },
  'Xangô': { sefirot: ['Chesed', 'Gevurah'], chakra: 3, element: 'Fogo', affirmation: 'Xangô me dá justiça', frequency: '528 Hz' },
  'Omolu': { sefirot: ['Malkuth', 'Binah'], chakra: 1, element: 'Terra', affirmation: 'Omolu me cura e renova', frequency: '174 Hz' },
  'Iansã': { sefirot: ['Netzach', 'Hod'], chakra: 2, element: 'Fogo', affirmation: 'Iansã me transforma', frequency: '417 Hz' },
  'Oxalá': { sefirot: ['Kether', 'Chokhmah'], chakra: 7, element: 'Éter', affirmation: 'Oxalá me ilumina', frequency: '963 Hz' },
  'Oxóssi': { sefirot: ['Netzach', 'Hod'], chakra: 6, element: 'Ar', affirmation: 'Oxóssi me guia na mata', frequency: '741 Hz' },
  'Orunmilá': { sefirot: ['Chokhmah', 'Hod'], chakra: 6, element: 'Ar', affirmation: 'Orunmilá revela minha verdade', frequency: '741 Hz' },
  'Nanã': { sefirot: ['Binah', 'Kether'], chakra: 7, element: 'Água', affirmation: 'Nanã me ensina a sabedoria antiga', frequency: '963 Hz' },
};

// ─── Enrich Odu with Spiritual Correlations ──────────────────────────────────────────
function enrichOdu(odu: ReturnType<typeof odusData[keyof typeof odusData]>) {
  const corr = ODU_SPIRITUAL_CORRELATIONS[odu.numero] || ODU_SPIRITUAL_CORRELATIONS[1];
  const orixaCorr = ORIXA_SPIRITUAL_CORRELATIONS[odu.orixaRegente] || ORIXA_SPIRITUAL_CORRELATIONS['Oxalá'];
  return {
    ...odu,
    spiritualCorrelations: {
      sefirot: corr.sefirot,
      chakra: corr.chakra,
      element: corr.element,
      orixa: corr.orixa,
      affirmation: corr.affirmation,
      frequency: corr.frequency,
      orixaRegenteCorrelations: {
        sefirot: orixaCorr.sefirot,
        chakra: orixaCorr.chakra,
        element: orixaCorr.element,
        affirmation: orixaCorr.affirmation,
        frequency: orixaCorr.frequency,
      },
    },
  };
}

// ============================================================
// VALIDATION SCHEMAS
// ============================================================

const birthDateSchema = z.object({
  data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato: YYYY-MM-DD'),
});

// ============================================================
// API ROUTE HANDLERS
// ============================================================

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  try {
    const parseResult = IfaQuerySchema.safeParse({
      numero: searchParams.get('numero'),
      nome: searchParams.get('nome'),
      sefirot: searchParams.get('sefirot'),
      chakra: searchParams.get('chakra'),
      element: searchParams.get('element'),
      orixa: searchParams.get('orixa'),
    });

    if (!parseResult.success) {
      return errorResponse({
        code: ErrorCode.VALIDATION_ERROR,
        message: 'Parâmetros inválidos',
        details: parseResult.error.flatten().fieldErrors,
        statusCode: 400,
      });
    }

    const { numero, nome, sefirot, chakra, element, orixa } = parseResult.data;

    // Filter all odus by spiritual correlations
    if (sefirot || chakra || element || orixa) {
      const filteredOdus = Object.values(odusData)
        .filter(odu => {
          const corr = ODU_SPIRITUAL_CORRELATIONS[odu.numero];
          if (sefirot && !corr?.sefirot.includes(sefirot)) return false;
          if (chakra && corr?.chakra !== chakra) return false;
          if (element && corr?.element !== element) return false;
          if (orixa && corr?.orixa !== orixa) return false;
          return true;
        })
        .map(enrichOdu);

      return NextResponse.json(successResponse({
        odus: filteredOdus,
        meta: {
          total: filteredOdus.length,
          filters: { sefirot, chakra, element, orixa },
          description: 'Odus filtrados por correlações espirituais',
        },
        spiritualCorrelations: {
          odus: ODU_SPIRITUAL_CORRELATIONS,
          orixas: ORIXA_SPIRITUAL_CORRELATIONS,
        },
      }).body);
    }

    if (numero !== undefined) {
      return handleGetOduByNumber(numero);
    }

    if (nome) {
      return handleGetOduByName(nome);
    }

    const timeline = searchParams.get('timeline');
    if (timeline) {
      return handleGetTimeline(parseInt(timeline, 10));
    }

    const rituals = searchParams.get('rituals');
    if (rituals) {
      return handleGetRituals(parseInt(rituals, 10));
    }

    const suggestions = searchParams.get('suggestions');
    if (suggestions) {
      return handleGetSuggestions(parseInt(suggestions, 10));
    }

    const birth = searchParams.get('birth');
    if (birth) {
      return handleGetOduFromBirth(birth);
    }

    const compare = searchParams.get('compare');
    if (compare) {
      return handleCompareOdus(compare);
    }

    const compatibility = searchParams.get('compatibility');
    const odusParam = searchParams.get('odus');
    if (compatibility && odusParam) {
      return handleGetCompatibility(parseInt(compatibility, 10), odusParam);
    }

    return handleListAllOdus();

  } catch (err) {
    console.error('Ifá API error:', err);
    return errorResponse({
      code: ErrorCode.INTERNAL_ERROR,
      message: 'Erro ao processar requisição Ifá',
      statusCode: 500,
    });
  }
}

// ============================================================
// HANDLER FUNCTIONS
// ============================================================

function handleListAllOdus() {
  const odus = Object.values(odusData).map(odu => enrichOdu(odu));

  // Calculate spiritual stats
  const spiritualStats = {
    bySefirot: Object.values(odusData).reduce((acc, odu) => {
      const corr = ODU_SPIRITUAL_CORRELATIONS[odu.numero];
      if (corr) {
        corr.sefirot.forEach(s => {
          acc[s] = (acc[s] || 0) + 1;
        });
      }
      return acc;
    }, {} as Record<string, number>),
    byChakra: Object.values(odusData).reduce((acc, odu) => {
      const corr = ODU_SPIRITUAL_CORRELATIONS[odu.numero];
      if (corr) {
        acc[corr.chakra] = (acc[corr.chakra] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>),
    byElement: Object.values(odusData).reduce((acc, odu) => {
      const corr = ODU_SPIRITUAL_CORRELATIONS[odu.numero];
      if (corr) {
        acc[corr.element] = (acc[corr.element] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>),
    byOrixa: Object.values(odusData).reduce((acc, odu) => {
      const corr = ODU_SPIRITUAL_CORRELATIONS[odu.numero];
      if (corr) {
        acc[corr.orixa] = (acc[corr.orixa] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>),
  };

  return NextResponse.json(successResponse({
    odus,
    meta: {
      total: odus.length,
      description: 'Os 16 Merindilogun - Odus Fundamentais do Ifá',
    },
    spiritualCorrelations: {
      odus: ODU_SPIRITUAL_CORRELATIONS,
      orixas: ORIXA_SPIRITUAL_CORRELATIONS,
    },
    spiritualStats,
  }).body);
}

function handleGetOduByNumber(numero: number) {
  const odu = odusData[numero];

  if (!odu) {
    return errorResponse({
      code: ErrorCode.RESOURCE_NOT_FOUND,
      message: `Odu ${numero} não encontrado`,
      statusCode: 404,
    });
  }

  return NextResponse.json(successResponse({
    odu: enrichOdu(odu),
    spiritualCorrelations: ODU_SPIRITUAL_CORRELATIONS,
  }).body);
}

function handleGetOduByName(nome: string) {
  const normalizedNome = nome.toLowerCase().trim();
  const odu = Object.values(odusData).find(
    o => o.nome.toLowerCase().includes(normalizedNome) ||
         normalizedNome.includes(o.nome.toLowerCase())
  );

  if (!odu) {
    const suggestions = Object.values(odusData)
      .filter(o => o.nome.toLowerCase().includes(normalizedNome))
      .map(o => ({ numero: o.numero, nome: o.nome }));

    return NextResponse.json(
      {
        odu: null,
        error: 'Odu não encontrado',
        suggestions,
        allOdus: Object.values(odusData).map(o => ({ numero: o.numero, nome: o.nome })),
      },
      { status: 404 }
    );
  }

  return NextResponse.json(successResponse({
    odu: enrichOdu(odu),
    spiritualCorrelations: ODU_SPIRITUAL_CORRELATIONS,
  }).body);
}

function handleGetTimeline(oduNum: number) {
  if (!odusData[oduNum]) {
    return errorResponse({
      code: ErrorCode.RESOURCE_NOT_FOUND,
      message: `Odu ${oduNum} não encontrado`,
      statusCode: 404,
    });
  }

  const odu = odusData[oduNum];
  const timeline = getOduTimeline(odu);
  const phaseProgress = timeline.events.reduce((acc, event) => {
    acc[event.phase] = getPhaseProgress(timeline, event.phase);
    return acc;
  }, {} as Record<string, number>);

  const phases = timeline.events.map(e => e.phase);
  const currentIdx = phases.indexOf(timeline.currentPhase);
  const proximaFase = phases[currentIdx + 1] || null;

  return NextResponse.json(successResponse({
    odu: enrichOdu({ numero: odu.numero, nome: odu.nome, significado: odu.significado, elementos: odu.elementos, orixaRegente: odu.orixaRegente, quizilas: odu.quizilas, preceitos: odu.preceitos, ebos: odu.ebos }),
    timeline,
    phaseProgress,
    spiritualCorrelations: ODU_SPIRITUAL_CORRELATIONS[oduNum],
    meta: {
      totalFases: timeline.events.length,
      proximaFase,
    },
  }).body);
}

function handleGetRituals(oduNum: number) {
  if (!odusData[oduNum]) {
    return errorResponse({
      code: ErrorCode.RESOURCE_NOT_FOUND,
      message: `Odu ${oduNum} não encontrado`,
      statusCode: 404,
    });
  }

  const odu = odusData[oduNum];
  const matching = matchOduToRitual(odu);

  return NextResponse.json(successResponse({
    odu: enrichOdu({ numero: odu.numero, nome: odu.nome, significado: odu.significado, elementos: odu.elementos, orixaRegente: odu.orixaRegente, quizilas: odu.quizilas, preceitos: odu.preceitos, ebos: odu.ebos }),
    matching,
    spiritualCorrelations: ODU_SPIRITUAL_CORRELATIONS[oduNum],
    meta: {
      ritualUrgencia: matching.rituais[0]?.urgencia || 'media',
      prazo: matching.rituais[0]?.prazo || 'N/A',
    },
  }).body);
}

function handleGetSuggestions(oduNum: number) {
  if (!odusData[oduNum]) {
    return errorResponse({
      code: ErrorCode.RESOURCE_NOT_FOUND,
      message: `Odu ${oduNum} não encontrado`,
      statusCode: 404,
    });
  }

  const suggestions = getRitualSuggestions(oduNum);
  const timing = getRitualTiming(oduNum);

  return NextResponse.json(successResponse({
    odu: { numero: oduNum },
    suggestions,
    timing,
    spiritualCorrelations: ODU_SPIRITUAL_CORRELATIONS[oduNum],
  }).body);
}

function handleGetOduFromBirth(dataNascimento: string) {
  const validation = birthDateSchema.safeParse({ data: dataNascimento });

  if (!validation.success) {
    return errorResponse({
      code: ErrorCode.VALIDATION_ERROR,
      message: 'Data de nascimento inválida. Use o formato YYYY-MM-DD',
      statusCode: 400,
    });
  }

  try {
    const resultado = calcularOduNascimento(dataNascimento);
    const principalCorr = ODU_SPIRITUAL_CORRELATIONS[resultado.principal.numero] || ODU_SPIRITUAL_CORRELATIONS[1];
    const secundarioCorr = resultado.secundario
      ? ODU_SPIRITUAL_CORRELATIONS[resultado.secundario.numero] || ODU_SPIRITUAL_CORRELATIONS[1]
      : null;

    return NextResponse.json(successResponse({
      dataNascimento,
      principal: {
        ...resultado.principal,
        spiritualCorrelations: principalCorr,
      },
      secundario: resultado.secundario ? {
        ...resultado.secundario,
        spiritualCorrelations: secundarioCorr,
      } : null,
      meta: {
        possuiOduSecundario: resultado.secundario !== null,
      },
      spiritualCorrelations: {
        principal: principalCorr,
        secundario: secundarioCorr,
      },
    }).body);
  } catch (err) {
    return errorResponse({
      code: ErrorCode.VALIDATION_ERROR,
      message: 'Erro ao calcular Odu para a data fornecida',
      statusCode: 400,
    });
  }
}

function handleCompareOdus(odusParam: string) {
  const numeros = odusParam.split(',').map(s => parseInt(s.trim(), 10));

  if (numeros.some(isNaN)) {
    return errorResponse({
      code: ErrorCode.VALIDATION_ERROR,
      message: 'Parâmetros inválidos para comparação. Use números separados por vírgula, ex: 1,2,3',
      statusCode: 400,
    });
  }

  const invalidOdus = numeros.filter(n => !odusData[n]);
  if (invalidOdus.length > 0) {
    return errorResponse({
      code: ErrorCode.RESOURCE_NOT_FOUND,
      message: `Odus não encontrados: ${invalidOdus.join(', ')}`,
      statusCode: 404,
    });
  }

  const odus = numeros.map(n => enrichOdu(odusData[n]));
  const comparison = odus.length >= 2 ? compareOduNumbers(odus[0].numero, odus[1].numero) : null;

  return NextResponse.json(successResponse({
    odus: numeros.map(n => ({ numero: n, nome: odusData[n].nome })),
    odusEnriched: odus,
    comparison,
    meta: {
      totalOdus: numeros.length,
    },
    spiritualCorrelations: ODU_SPIRITUAL_CORRELATIONS,
  }).body);
}

function handleGetCompatibility(oduNum: number, odusParam: string) {
  if (!odusData[oduNum]) {
    return errorResponse({
      code: ErrorCode.RESOURCE_NOT_FOUND,
      message: `Odu ${oduNum} não encontrado`,
      statusCode: 404,
    });
  }

  const numeros = odusParam.split(',').map(s => parseInt(s.trim(), 10));

  if (numeros.some(isNaN)) {
    return errorResponse({
      code: ErrorCode.VALIDATION_ERROR,
      message: 'Parâmetros inválidos. Use números separados por vírgula, ex: 2,3',
      statusCode: 400,
    });
  }

  const invalidOdus = numeros.filter(n => !odusData[n]);
  if (invalidOdus.length > 0) {
    return errorResponse({
      code: ErrorCode.RESOURCE_NOT_FOUND,
      message: `Odus não encontrados: ${invalidOdus.join(', ')}`,
      statusCode: 404,
    });
  }

  const baseOdu = odusData[oduNum];
  const compareOdusList = numeros.map(n => enrichOdu(odusData[n]));
  const compatibility = compareOduNumbers(baseOdu.numero, compareOdusList[0].numero);

  return NextResponse.json(successResponse({
    base: enrichOdu({ numero: baseOdu.numero, nome: baseOdu.nome, significado: baseOdu.significado, elementos: baseOdu.elementos, orixaRegente: baseOdu.orixaRegente, quizilas: baseOdu.quizilas, preceitos: baseOdu.preceitos, ebos: baseOdu.ebos }),
    compare: numeros.map(n => ({ numero: n, nome: odusData[n].nome })),
    compareEnriched: compareOdusList,
    compatibility,
    spiritualCorrelations: {
      base: ODU_SPIRITUAL_CORRELATIONS[oduNum],
      compared: numeros.map(n => ODU_SPIRITUAL_CORRELATIONS[n]),
    },
    meta: {
      totalCompared: numeros.length,
    },
  }).body);
}