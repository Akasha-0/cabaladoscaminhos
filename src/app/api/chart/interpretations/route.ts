import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
// ─── Zod Schemas ───────────────────────────────────────────────────────────
const InterpretationTypeSchema = z.enum([
  'natal',
  'transito',
  'progressao',
  'sinastria',
  'composito',
  'hora-igual',
]);
const InterpretationQuerySchema = z.object({
  type: InterpretationTypeSchema.optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
});
// ============================================================
// TYPE DEFINITIONS
// ============================================================
interface Interpretation {
  id: string;
  type: string;
  label: string;
  description: string;
  details?: string;
  keywords?: string[];
}
// ============================================================
// INTERPRETATION DATA
// ============================================================
const INTERPRETATIONS: Interpretation[] = [
  {
    id: 'natal',
    type: 'natal',
    label: 'Mapa Natal',
    description: 'Interpretação completa do mapa natal com análise de planetas, casas e aspectos.',
    details: 'Análise detalhada da posição dos planetas nos signos e casas, aspectos planetários e dinâmica kármica.',
    keywords: ['planetas', 'casas', 'aspectos', 'signos', 'cármica'],
  },
  {
    id: 'transito',
    type: 'transito',
    label: 'Trânsito Planetário',
    description: 'Interpretação dos trânsitos planetários atuais e seu impacto.',
    details: 'Análise sensitiva dos trânsitos ativos e como influenciam nosso momento presente.',
    keywords: ['trânsitos', 'planetas', 'impacto', 'presente'],
  },
  {
    id: 'progressao',
    type: 'progressao',
    label: 'Progressão Secundária',
    description: 'Análise da progressão secundária e seus significados evolutivos.',
    details: 'Interpretação dos planetas progressados e casas progressadas para o momento atual.',
    keywords: ['progressão', 'evolução', 'desenvolvimento'],
  },
  {
    id: 'sinastria',
    type: 'sinastria',
    label: 'Sinastria',
    description: 'Interpretação da sinastria entre duas cartas natais.',
    details: 'Análise da compatibilidade entre duas cartas natais.',
    keywords: ['relacionamento', 'compatibilidade', 'parceiro'],
  },
  {
    id: 'composito',
    type: 'composito',
    label: 'Carta Compósita',
    description: 'Interpretação da carta compósita para relacionamentos.',
    details: 'Análise da energia combinada de dois mapas natais.',
    keywords: ['compósita', 'união', 'relacionamento'],
  },
  {
    id: 'hora-igual',
    type: 'hora-igual',
    label: 'Hora Igual',
    description: 'Interpretação do sistema de casas de hora igual.',
    details: 'Análise alternativa usando o sistema de casas de hora igual.',
    keywords: ['hora igual', 'casas', 'sistema alternativo'],
  },
];
// ============================================================
// API ROUTE HANDLER
// ============================================================
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const parseResult = InterpretationQuerySchema.safeParse({
      type: searchParams.get('type'),
      limit: searchParams.get('limit'),
    });
    if (!parseResult.success) {
      return NextResponse.json({
        error: 'Parâmetros inválidos',
        details: parseResult.error.flatten().fieldErrors,
      }, { status: 400 });
    }
    const { type, limit } = parseResult.data;
    let interpretations = [...INTERPRETATIONS];
    if (type) {
      interpretations = interpretations.filter(i => i.type === type);
    }
    if (limit) {
      interpretations = interpretations.slice(0, limit);
    }
    return NextResponse.json({
      interpretations,
      count: interpretations.length,
      totalAvailable: INTERPRETATIONS.length,
    });
  } catch {
    return NextResponse.json({
      error: 'Erro ao processar interpretações',
    }, { status: 500 });
  }
}