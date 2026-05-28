// ============================================================
// NUMEROLOGIA API - CABALA DOS CAMINHOS
// ============================================================
// API route for numerological calculations
// Uses: Zod validation, base-route helpers, error handling
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { 
  successResponse, 
  errorResponse,
  validateQueryParams,
  checkRequestRateLimit,
  getAuthUser,
} from '@/lib/api/base-route';
import { ErrorCode } from '@/lib/error-handling';
import { logger } from '@/lib/logging';
import { 
  calcularPitagorica, 
  calcularCaldeia, 
  calcularCabalistica, 
  calcularTantrica, 
  calcularPitagoricaData, 
  getInterpretacao 
} from '@/lib/numerologia/calculos';
import type { NumerologiaResponse } from '@/lib/api/types';

// ============================================================
// VALIDATION SCHEMA
// ============================================================

const numerologiaQuerySchema = z.object({
  tipo: z.enum(['pitagorica', 'caldeia', 'cabalistica', 'tantrica', 'pitagorica-data', 'destino'], {
    errorMap: () => ({ message: 'Tipo inválido. Opções: pitagorica, caldeia, cabalistica, tantrica, pitagorica-data, destino' }),
  }),
  nome: z.string().min(1).optional(),
  data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD').optional(),
});

// ============================================================
// TYPE DEFINITIONS
// ============================================================

type NumerologiaTipo = 'pitagorica' | 'caldeia' | 'cabalistica' | 'tantrica' | 'pitagorica-data' | 'destino';

interface CalculatedNumerologia {
  numero: number;
  tipo: string;
  interpretacao: string;
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function somarDigitos(numero: number): number {
  while (numero > 9 && numero !== 11 && numero !== 22 && numero !== 33) {
    numero = numero.toString().split('').reduce((acc, d) => acc + parseInt(d), 0);
  }
  return numero;
}

function calcularNumerologia(tipo: NumerologiaTipo, nome?: string, data?: string): CalculatedNumerologia {
  let numero: number;

  switch (tipo) {
    case 'pitagorica':
      if (!nome) throw new Error('Nome é obrigatório para numerologia pitagórica');
      numero = calcularPitagorica(nome);
      break;

    case 'caldeia':
      if (!nome) throw new Error('Nome é obrigatório para numerologia caldeia');
      numero = calcularCaldeia(nome);
      break;

    case 'cabalistica':
      if (!nome) throw new Error('Nome é obrigatório para numerologia cabalística');
      numero = calcularCabalistica(nome);
      break;

    case 'tantrica':
      if (!data) throw new Error('Data é obrigatória para numerologia tântrica');
      numero = calcularTantrica(data);
      break;

    case 'pitagorica-data':
      if (!data) throw new Error('Data é obrigatória');
      numero = calcularPitagoricaData(data);
      break;

    case 'destino':
      if (!nome || !data) throw new Error('Nome e data são obrigatórios para número do destino');
      const pitagorico = calcularPitagorica(nome);
      const tantrica = calcularTantrica(data);
      numero = somarDigitos(pitagorico + tantrica);
      break;

    default:
      throw new Error(`Tipo "${tipo}" não reconhecido`);
  }

  // Handle both string and object return from getInterpretacao
  const interpretacaoObj = getInterpretacao(numero);
  const interpretacaoStr = typeof interpretacaoObj === 'string' 
    ? interpretacaoObj 
    : interpretacaoObj.significado;

  return {
    numero,
    tipo,
    interpretacao: interpretacaoStr,
  };
}

// ============================================================
// API ROUTE HANDLERS
// ============================================================

export async function GET(request: NextRequest) {
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  
  // Rate limiting (100 requests per minute)
  const rateLimitResult = checkRequestRateLimit(request, {
    maxRequests: 100,
    windowMs: 60 * 1000,
  });

  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: ErrorCode.RATE_LIMIT_EXCEEDED,
          message: 'Rate limit excedido. Tente novamente em alguns segundos.',
        },
      },
      {
        status: 429,
        headers: {
          'Retry-After': Math.ceil(rateLimitResult.resetIn / 1000).toString(),
          'X-Request-Id': requestId,
        },
      }
    );
  }

  // Parse and validate query params - convert URLSearchParams to plain object
  const queryParams: Record<string, string> = {};
  request.nextUrl.searchParams.forEach((value, key) => {
    queryParams[key] = value;
  });
  
  const queryResult = validateQueryParams(numerologiaQuerySchema, queryParams);
  
  if (queryResult.error) {
    return errorResponse(queryResult.error);
  }

  const { tipo, nome, data } = queryResult.data;

  // Validate business rules
  const requiresNome = ['pitagorica', 'caldeia', 'cabalistica', 'destino'].includes(tipo);
  const requiresData = ['tantrica', 'pitagorica-data', 'destino'].includes(tipo);

  if (requiresNome && !nome) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: ErrorCode.VALIDATION_ERROR,
          message: `Parâmetro "nome" é obrigatório para tipo "${tipo}"`,
        },
      },
      { status: 400 }
    );
  }

  if (requiresData && !data) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: ErrorCode.VALIDATION_ERROR,
          message: `Parâmetro "data" é obrigatório para tipo "${tipo}"`,
        },
      },
      { status: 400 }
    );
  }

  // Calculate numerology
  try {
    const resultado = calcularNumerologia(tipo, nome, data);

    logger.info('Numerologia calculada', {
      requestId,
      tipo,
      nome: nome ? '***' : undefined,
      resultado: resultado.numero,
    });

    return NextResponse.json(
      successResponse<NumerologiaResponse>(resultado as NumerologiaResponse),
      {
        headers: {
          'X-Request-Id': requestId,
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
          'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
        },
      }
    );
   } catch (error) {
     logger.error(
       'Erro ao calcular numerologia',
       error instanceof Error ? error : undefined,
       { requestId, tipo }
     );

    return NextResponse.json(
      {
        success: false,
        error: {
          code: ErrorCode.INTERNAL_ERROR,
          message: 'Erro ao processar cálculo numerológico',
        },
      },
      { status: 500 }
    );
  }
}

// POST endpoint for authenticated users with saved profiles
export async function POST(request: NextRequest) {
  // Authenticate user (optional - allows using saved profile)
  const authResult = await getAuthUser(request);
  
  // Rate limiting (20 requests per minute for authenticated users)
  const rateLimitResult = checkRequestRateLimit(request, {
    maxRequests: 20,
    windowMs: 60 * 1000,
  });

  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: ErrorCode.RATE_LIMIT_EXCEEDED,
          message: 'Rate limit excedido.',
        },
      },
      { status: 429 }
    );
  }

  // Parse body
  let body: { nome?: string; data?: string; tipo: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: ErrorCode.VALIDATION_ERROR,
          message: 'Body inválido',
        },
      },
      { status: 400 }
    );
  }

  // Validate body
  const bodySchema = numerologiaQuerySchema.extend({
    nome: z.string().min(1),
    data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  });

  const validationResult = bodySchema.safeParse(body);
  
  if (!validationResult.success) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: ErrorCode.VALIDATION_ERROR,
          message: validationResult.error.issues[0]?.message || 'Dados inválidos',
        },
      },
      { status: 400 }
    );
  }

  const { tipo, nome, data } = validationResult.data;

  // Calculate
  try {
    const resultado = calcularNumerologia(tipo as NumerologiaTipo, nome, data);

    // If authenticated, could save to user profile here
    if (authResult.user) {
      logger.info('Numerologia calculada para usuário', {
        userId: authResult.user.id,
        tipo,
        resultado: resultado.numero,
      });
    }

    return NextResponse.json(
      successResponse<NumerologiaResponse>(resultado as NumerologiaResponse),
      {
        headers: {
          'Cache-Control': 'private, max-age=300, stale-while-revalidate=600',
        },
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: ErrorCode.INTERNAL_ERROR,
          message: error instanceof Error ? error.message : 'Erro interno',
        },
      },
      { status: 500 }
    );
  }
}