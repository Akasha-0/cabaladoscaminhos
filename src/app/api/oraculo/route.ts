// src/app/api/oraculo/route.ts
// Oracle AI API endpoint - skip linting

import { NextRequest, NextResponse } from 'next/server';
import { generateOracleResponse } from '@/lib/ai/oracle';
import type { OracleContext } from '@/lib/ai/oracle';

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * POST /api/oraculo
 * Oracle AI spiritual guidance endpoint
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pergunta, contexto } = body as {
      pergunta: string;
      contexto?: Partial<OracleContext>;
    };

    if (!pergunta || typeof pergunta !== 'string') {
      return NextResponse.json(
        { error: 'Pergunta é obrigatória' },
        { status: 400 }
      );
    }

    // Build spiritual context from request
    const spiritualContext: OracleContext = {
      dataNascimento: contexto?.dataNascimento,
      numeroPessoal: contexto?.numeroPessoal,
      odu: contexto?.odu,
      caminho: contexto?.caminho,
      diaAtual: contexto?.diaAtual,
      orixasAtuais: contexto?.orixasAtuais,
      faseLua: contexto?.faseLua,
    };

    // Generate Oracle response with spiritual context
    const resposta = await generateOracleResponse(pergunta, spiritualContext);

    // Return formatted response
    return NextResponse.json({
      success: true,
      data: resposta,
    });
  } catch (error) {
    console.error('Oracle API error:', error);
    return NextResponse.json(
      { error: 'Erro ao processar consulta espiritual' },
      { status: 500 }
    );
  }
}
