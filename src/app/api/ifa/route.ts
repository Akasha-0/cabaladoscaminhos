// Ifá API - Cabala Dos Caminhos
// GET endpoints for Odu readings, rituals, and spiritual guidance

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { odusData, calcularOduNascimento } from '@/lib/odus/calculos';
import { getOduTimeline, getPhaseProgress } from '@/lib/ifa/timeline';
import { matchOduToRitual } from '@/lib/ifa/matching';
import { getRitualSuggestions, getRitualTiming } from '@/lib/ifa/suggestions';
import { compareOduNumbers } from '@/lib/ifa/comparison';
import { successResponse, errorResponse, ErrorCode } from '@/lib/api/base-route';

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
    const numero = searchParams.get('numero');
    const nome = searchParams.get('nome');

    if (numero) {
      return handleGetOduByNumber(parseInt(numero, 10));
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
  const odus = Object.values(odusData).map(odu => ({
    numero: odu.numero,
    nome: odu.nome,
    significado: odu.significado,
    elementos: odu.elementos,
    orixaRegente: odu.orixaRegente,
    quizilasCount: odu.quizilas.length,
    preceitosCount: odu.preceitos.length,
    ebosCount: odu.ebos.length,
  }));

  return NextResponse.json(successResponse({
    odus,
    meta: {
      total: odus.length,
      description: 'Os 16 Merindilogun - Odus Fundamentais do Ifá',
    },
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

  return NextResponse.json(successResponse({ odu }).body);
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

  return NextResponse.json(successResponse({ odu }).body);
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
    odu: { numero: odu.numero, nome: odu.nome },
    timeline,
    phaseProgress,
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
    odu: { numero: odu.numero, nome: odu.nome },
    matching,
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

    return NextResponse.json(successResponse({
      dataNascimento,
      principal: resultado.principal,
      secundario: resultado.secundario,
      meta: {
        possuiOduSecundario: resultado.secundario !== null,
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

  const odus = numeros.map(n => odusData[n]);
  const comparison = odus.length >= 2 ? compareOduNumbers(odus[0].numero, odus[1].numero) : null;

  return NextResponse.json(successResponse({
    odus: numeros.map(n => ({ numero: n, nome: odusData[n].nome })),
    comparison,
    meta: {
      totalOdus: numeros.length,
    },
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
  const compareOdusList = numeros.map(n => odusData[n]);
  const compatibility = compareOduNumbers(baseOdu.numero, compareOdusList[0].numero);

  return NextResponse.json(successResponse({
    base: { numero: baseOdu.numero, nome: baseOdu.nome },
    compare: numeros.map(n => ({ numero: n, nome: odusData[n].nome })),
    compatibility,
    meta: {
      totalCompared: numeros.length,
    },
  }).body);
}
