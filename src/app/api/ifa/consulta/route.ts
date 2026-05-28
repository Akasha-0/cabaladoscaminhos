import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { drawOdu } from '@/lib/ifa/draw';
import { successResponse, errorResponse, ErrorCode } from '@/lib/api/base-route';

// ============================================================
// VALIDATION SCHEMA
// ============================================================

const ifaConsultaSchema = z.object({
  pergunta: z.string().max(500).optional(),
  metodo: z.enum(['random', 'birth-date'] as const).default('random'),
  dataNascimento: z.string().optional(),
});

// ============================================================
// TYPE DEFINITIONS
// ============================================================

interface OduInterpretacao {
  odu: {
    numero: number;
    nome: string;
    significado: string;
    elementos: string;
    orixaRegente: string;
    opeCima: {
      id: number;
      nome: string;
      simbolo: string;
      significado: string;
    };
    opeBaixo: {
      id: number;
      nome: string;
      simbolo: string;
      significado: string;
    };
    linhasCima: string;
    linhasBaixo: string;
  };
  pergunta: string | null;
  dataConsulta: string;
  horarioConsulta: string;
}

// ============================================================
// API ROUTE HANDLER
// ============================================================

export async function POST(request: NextRequest) {
  try {
    let body: unknown = {};
    try {
      body = await request.json();
    } catch {
      return errorResponse({
        code: ErrorCode.VALIDATION_ERROR,
        message: 'Corpo da requisição inválido',
        statusCode: 400,
      });
    }

    const validation = (await import('@/lib/api/base-route')).validateRequestBody(
      ifaConsultaSchema,
      body
    );

    if (validation.error) {
      return errorResponse({
        code: ErrorCode.VALIDATION_ERROR,
        message: validation.error.message || 'Dados inválidos',
        statusCode: 400,
      });
    }

    const { pergunta, metodo, dataNascimento } = validation.data;

    const resultado = drawOdu({
      method: metodo,
      dataNascimento: dataNascimento,
    });

    const agora = new Date();
    const dataConsulta = agora.toISOString().split('T')[0];
    const horarioConsulta = agora.toTimeString().slice(0, 5);

    const response: OduInterpretacao = {
      odu: {
        numero: resultado.odu.numero,
        nome: resultado.odu.nome,
        significado: resultado.odu.significado,
        elementos: resultado.odu.elementos,
        orixaRegente: resultado.odu.orixaRegente,
        opeCima: {
          id: resultado.opeCima.id,
          nome: resultado.opeCima.nome,
          simbolo: resultado.opeCima.simbolo,
          significado: resultado.opeCima.significado,
        },
        opeBaixo: {
          id: resultado.opeBaixo.id,
          nome: resultado.opeBaixo.nome,
          simbolo: resultado.opeBaixo.simbolo,
          significado: resultado.opeBaixo.significado,
        },
        linhasCima: resultado.linhasCima,
        linhasBaixo: resultado.linhasBaixo,
      },
      pergunta: pergunta || null,
      dataConsulta,
      horarioConsulta,
    };

    return NextResponse.json(successResponse(response).body);
  } catch (err) {
    console.error('Erro na consulta Ifá:', err);
    return errorResponse({
      code: ErrorCode.INTERNAL_ERROR,
      message: 'Erro ao processar consulta de Ifá',
      statusCode: 500,
    });
  }
}