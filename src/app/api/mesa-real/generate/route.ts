// ============================================================
// API ROUTE — Gerar Dossiê para uma Casa
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { buildDossiePrompt, validateHouseInput, type HouseInput } from '@/lib/ai/prompt-builder';

interface GenerateRequest {
  casaNumero: number;
  carta: { numero: number; nome: string; significado: string };
  odu: { numero: number; nome: string; significado: string; elemento: string; orixas: string[]; quizilas: string[] };
  mapaFixo: {
    nomeCompleto?: string;
    dataNascimento?: string;
    signoSolar?: string;
    signoLunar?: string;
    ascendente?: string;
    caminhoDeVida?: number;
    numeroAlma?: number;
    numeroPersonalidade?: number;
    numeroExpressao?: number;
    dominioTantrico?: number;
    karmaTantrico?: number;
    vereditoTantrico?: number;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.clone().json()) as GenerateRequest;

    // Validate input
    if (!body.casaNumero || !body.carta || !body.odu || !body.mapaFixo) {
      return NextResponse.json(
        { error: 'Dados incompletos. Forneça: casaNumero, carta, odu, mapaFixo' },
        { status: 400 }
      );
    }

    // Build prompt
    const input: HouseInput = {
      casaNumero: body.casaNumero,
      carta: body.carta,
      odu: body.odu,
      mapaFixo: body.mapaFixo,
    };

    const validation = validateHouseInput(input);
    if (!validation.valid) {
      return NextResponse.json(
        { error: 'Validação falhou', details: validation.errors },
        { status: 400 }
      );
    }

    const { systemPrompt, userPrompt } = buildDossiePrompt(input);

    // Check for OpenAI API key
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key não configurada' },
        { status: 500 }
      );
    }

    // Call OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json(
        { error: 'Erro ao chamar OpenAI', details: error },
        { status: 500 }
      );
    }

    const data = await response.json();
    const dossiê = data.choices?.[0]?.message?.content;

    if (!dossiê) {
      return NextResponse.json(
        { error: 'Resposta vazia da OpenAI' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      casaNumero: body.casaNumero,
      dossiê,
      tokensUsed: data.usage?.total_tokens,
    });
  } catch (error) {
    console.error('Error generating dossiê:', error);
    return NextResponse.json(
      { error: 'Erro interno', details: String(error) },
      { status: 500 }
    );
  }
}