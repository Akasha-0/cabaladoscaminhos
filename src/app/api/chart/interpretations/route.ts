// ============================================================
// CHART INTERPRETATIONS API - CABALA DOS CAMINHOS
// ============================================================
// GET endpoint for retrieving chart interpretations
// ============================================================

import { NextResponse } from 'next/server';

// ============================================================
// TYPE DEFINITIONS
// ============================================================

interface Interpretation {
  id: string;
  type: string;
  label: string;
  description: string;
  details?: string;
}

// ============================================================
// API ROUTE HANDLER
// ============================================================

export async function GET() {
  const interpretations: Interpretation[] = [
    {
      id: 'natal',
      type: 'natal',
      label: 'Mapa Natal',
      description: 'Interpretação completa do mapa natal com análise de planetas, casas e aspectos.',
      details: 'Análise detalhada da posição dos planetas nos signos e casas, aspectos planetários e dinâmica kármica.',
    },
    {
      id: 'transito',
      type: 'transito',
      label: 'Trânsito Planetário',
      description: 'Interpretação dos trânsitos planetários atuais e seu impacto.',
      details: 'Análise sensitiva dos trânsitos ativos e como influenciam nosso momento presente.',
    },
    {
      id: 'progressao',
      type: 'progressao',
      label: 'Progressão Secundária',
      description: 'Análise da progressão secundária e seus significados evolutivos.',
      details: 'Interpretação dos planetas progressados e casas progressadas para o momento atual.',
    },
    {
      id: 'sinastria',
      type: 'sinastria',
      label: 'Sinastria',
      description: 'Interpretação da sinastria entre duas cartas natais.',
      details: 'Análise da compatibilidade entre duas cartas natais.',
    },
    {
      id: 'composito',
      type: 'composito',
      label: 'Carta Compósita',
      description: 'Interpretação da carta compósita para relacionamentos.',
      details: 'Análise da energia combinada de dois mapas natais.',
    },
    {
      id: 'hora-igual',
      type: 'hora-igual',
      label: 'Hora Igual',
      description: 'Interpretação do sistema de casas de hora igual.',
      details: 'Análise alternativa usando o sistema de casas de hora igual.',
    },
  ];

  return NextResponse.json({
    interpretations,
  });
}
