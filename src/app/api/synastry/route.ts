import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { validateRequestBody } from '@/lib/api/base-route';

// Schema for synastry request
const SynastryRequestSchema = z.object({
  chart1: z.object({
    dataNascimento: z.string(),
    horaNascimento: z.string().default('12:00'),
    latitude: z.number(),
    longitude: z.number(),
    nome: z.string().optional(),
  }),
  chart2: z.object({
    dataNascimento: z.string(),
    horaNascimento: z.string().default('12:00'),
    latitude: z.number(),
    longitude: z.number(),
    nome: z.string().optional(),
  }),
});

// Dynamic import for calculateSynastry
async function getCalculateSynastry() {
  const { calculateSynastry } = await import('@/lib/astrologia/synastry');
  return calculateSynastry;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { data, error } = validateRequestBody(SynastryRequestSchema, body);
    
    if (error) {
      return NextResponse.json(
        { error: 'Dados inválidos para comparação', details: error },
        { status: 400 }
      );
    }

    const calculateSynastry = await getCalculateSynastry();

    // Calculate both natal charts
    const { calcularMapaNatal } = await import('@/lib/astrologia/planetas/posicoes');
    
    const chart1 = calcularMapaNatal(
      new Date(data.chart1.dataNascimento),
      data.chart1.horaNascimento ?? '12:00',
      data.chart1.latitude,
      data.chart1.longitude
    );

    const chart2 = calcularMapaNatal(
      new Date(data.chart2.dataNascimento),
      data.chart2.horaNascimento ?? '12:00',
      data.chart2.latitude,
      data.chart2.longitude
    );

    // Calculate synastry
    const synastry = calculateSynastry(chart1, chart2);

    // Generate interpretation
    const interpretacao = gerarInterpretacaoSynastry(synastry, data.chart1.nome, data.chart2.nome);

    return NextResponse.json({
      chart1: {
        data: chart1,
        nome: data.chart1.nome,
      },
      chart2: {
        data: chart2,
        nome: data.chart2.nome,
      },
      synastry,
      interpretacao,
    }, {
      headers: {
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=7200',
      },
    });
  } catch (error) {
    console.error('Erro calculando sinastria:', error);
    return NextResponse.json(
      { error: 'Erro ao calcular sinastria' },
      { status: 500 }
    );
  }
}

import type { SynastryResult } from '@/lib/astrologia/synastry';

function gerarInterpretacaoSynastry(
  synastry: import('@/lib/astrologia/synastry').SynastryResult,
  nome1?: string,
  nome2?: string
): string {
  const n1 = nome1 || 'Pessoa 1';
  const n2 = nome2 || 'Pessoa 2';
  
  const aspectosFortes = synastry.aspects.filter(a => 
    ['conjunção', 'trino', 'sextil'].includes(a.type) && a.orb < 3
  );
  
  const aspectosDesafio = synastry.aspects.filter(a => 
    ['oposição', 'quadratura'].includes(a.type) && a.orb < 4
  );

  let interpretacao = `Comparação astrológica entre ${n1} e ${n2}. `;
  
  if (aspectosFortes.length > 0) {
    interpretacao += `Harmonias detectedas: ${aspectosFortes.map(a => `${a.planet1}-${a.planet2} em ${a.type}`).join(', ')}. `;
  }
  
  if (aspectosDesafio.length > 0) {
    interpretacao += `Tensões detectadas: ${aspectosDesafio.map(a => `${a.planet1}-${a.planet2} em ${a.type}`).join(', ')}.`;
  }

  return interpretacao;
}
