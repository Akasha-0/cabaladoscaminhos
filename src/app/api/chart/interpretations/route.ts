import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { SefirotSchema, ChakraSchema, ElementSchema } from '@/lib/api/spiritual-filters';
// ─── Spiritual filter schemas imported from @/lib/api/spiritual-filters ─────

const InterpretationTypeSchema = z.enum([
  'natal', 'transito', 'progressao', 'sinastria', 'composito', 'hora-igual'
]);
const InterpretationQuerySchema = z.object({
  type: InterpretationTypeSchema.optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  sefirot: SefirotSchema.optional(),
  chakra: ChakraSchema.optional(),
  element: ElementSchema.optional(),
});

// ─── Interpretation Spiritual Correlations ──────────────────────────────────────────
const INTERPRETATION_SPIRITUAL_CORRELATIONS: Record<string, {
  sefirot: string[];
  chakra: number;
  element: string;
  orixa: string;
  affirmation: string;
  frequency: string;
}> = {
  natal: { sefirot: ['Kether', 'Chokhmah', 'Binah'], chakra: 7, element: 'Éter', orixa: 'Oxalá', affirmation: ' Meu mapa natal revela minha verdade', frequency: '963 Hz' },
  transito: { sefirot: ['Chokhmah', 'Hod'], chakra: 6, element: 'Ar', orixa: 'Orunmilá', affirmation: 'Os trânsitos iluminam meu caminho', frequency: '741 Hz' },
  progressao: { sefirot: ['Tipheret', 'Gevurah'], chakra: 5, element: 'Fogo', orixa: 'Xangô', affirmation: 'A progressão revela minha evolução', frequency: '528 Hz' },
  sinastria: { sefirot: ['Tipheret', 'Netzach'], chakra: 4, element: 'Fogo', orixa: 'Oxum', affirmation: 'A sinastria revela minha conexão', frequency: '639 Hz' },
  composito: { sefirot: ['Chesed', 'Tipheret'], chakra: 4, element: 'Fogo', orixa: 'Oxum', affirmation: 'O compósito une nossas energias', frequency: '528 Hz' },
  'hora-igual': { sefirot: ['Hod', 'Yesod'], chakra: 5, element: 'Ar', orixa: 'Orunmilá', affirmation: 'A hora igual marca meu destino', frequency: '852 Hz' },
};

// ─── TYPE DEFINITIONS ──────────────────────────────────────────────────────
interface Interpretation {
  id: string;
  type: string;
  label: string;
  description: string;
  details?: string;
  keywords?: string[];
  spiritualCorrelations?: typeof INTERPRETATION_SPIRITUAL_CORRELATIONS[string];
}

// ─── INTERPRETATION DATA ──────────────────────────────────────────────────────────
const INTERPRETATIONS: Interpretation[] = [
  {
    id: 'natal',
    type: 'natal',
    label: 'Mapa Natal',
    description: 'Interpretação completa do mapa natal com análise de planetas, casas e aspectos.',
    details: 'Análise detalhada da posição dos planetas nos signos e casas, aspectos planetários e dinâmica kármica.',
    keywords: ['planetas', 'casas', 'aspectos', 'signos', 'cármica'],
    spiritualCorrelations: INTERPRETATION_SPIRITUAL_CORRELATIONS.natal,
  },
  {
    id: 'transito',
    type: 'transito',
    label: 'Trânsito Planetário',
    description: 'Interpretação dos trânsitos planetários atuais e seu impacto.',
    details: 'Análise sensitiva dos trânsitos ativos e como influenciam nosso momento presente.',
    keywords: ['trânsitos', 'planetas', 'impacto', 'presente'],
    spiritualCorrelations: INTERPRETATION_SPIRITUAL_CORRELATIONS.transito,
  },
  {
    id: 'progressao',
    type: 'progressao',
    label: 'Progressão Secundária',
    description: 'Análise da progressão secundária e seus significados evolutivos.',
    details: 'Interpretação dos planetas progressados e casas progressadas para o momento atual.',
    keywords: ['progressão', 'evolução', 'desenvolvimento'],
    spiritualCorrelations: INTERPRETATION_SPIRITUAL_CORRELATIONS.progressao,
  },
  {
    id: 'sinastria',
    type: 'sinastria',
    label: 'Sinastria',
    description: 'Interpretação da sinastria entre duas cartas natais.',
    details: 'Análise da compatibilidade entre duas cartas natais.',
    keywords: ['relacionamento', 'compatibilidade', 'parceiro'],
    spiritualCorrelations: INTERPRETATION_SPIRITUAL_CORRELATIONS.sinastria,
  },
  {
    id: 'composito',
    type: 'composito',
    label: 'Carta Compósita',
    description: 'Interpretação da carta compósita para relacionamentos.',
    details: 'Análise da energia combinada de dois mapas natais.',
    keywords: ['compósita', 'união', 'relacionamento'],
    spiritualCorrelations: INTERPRETATION_SPIRITUAL_CORRELATIONS.composito,
  },
  {
    id: 'hora-igual',
    type: 'hora-igual',
    label: 'Hora Igual',
    description: 'Interpretação do sistema de casas de hora igual.',
    details: 'Análise alternativa usando o sistema de casas de hora igual.',
    keywords: ['hora igual', 'casas', 'sistema alternativo'],
    spiritualCorrelations: INTERPRETATION_SPIRITUAL_CORRELATIONS['hora-igual'],
  },
];

// ─── Planet Correlations ──────────────────────────────────────────────────────────
const PLANET_SPIRITUAL_CORRELATIONS = [
  { planet: 'Sol', sefirot: 'Kether', chakra: 4, element: 'Fogo', orixa: 'Oxalá', frequency: '528 Hz', affirmation: 'O sol ilumina minha essência' },
  { planet: 'Lua', sefirot: 'Yesod', chakra: 6, element: 'Água', orixa: 'Iemanjá', frequency: '639 Hz', affirmation: 'A lua guia minhas emoções' },
  { planet: 'Mercúrio', sefirot: 'Hod', chakra: 5, element: 'Ar', orixa: 'Orunmilá', frequency: '741 Hz', affirmation: 'Mercúrio comunica minha verdade' },
  { planet: 'Vênus', sefirot: 'Netzach', chakra: 4, element: 'Fogo', orixa: 'Oxum', frequency: '528 Hz', affirmation: 'Vênus embeleza meu caminho' },
  { planet: 'Marte', sefirot: 'Gevurah', chakra: 3, element: 'Fogo', orixa: 'Iansã', frequency: '396 Hz', affirmation: 'Marte fortalece minha ação' },
  { planet: 'Júpiter', sefirot: 'Chesed', chakra: 5, element: 'Ar', orixa: 'Oxóssi', frequency: '417 Hz', affirmation: 'Júpiter expande minha sabedoria' },
  { planet: 'Saturno', sefirot: 'Binah', chakra: 1, element: 'Terra', orixa: 'Ogum', frequency: '174 Hz', affirmation: 'Saturno estrutura minha disciplina' },
  { planet: 'Urano', sefirot: 'Chokhmah', chakra: 6, element: 'Ar', orixa: 'Oxalá', frequency: '963 Hz', affirmation: 'Urano libera minha inovação' },
  { planet: 'Netuno', sefirot: 'Binah', chakra: 7, element: 'Água', orixa: 'Iemanjá', frequency: '639 Hz', affirmation: 'Netuno expande minha espiritualidade' },
  { planet: 'Plutão', sefirot: 'Gevurah', chakra: 3, element: 'Fogo', orixa: 'Xangô', frequency: '396 Hz', affirmation: 'Plutão transforma minha essência' },
];

// ─── API ROUTE HANDLER ──────────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const parseResult = InterpretationQuerySchema.safeParse({
      type: searchParams.get('type'),
      limit: searchParams.get('limit'),
      sefirot: searchParams.get('sefirot'),
      chakra: searchParams.get('chakra'),
      element: searchParams.get('element'),
    });

    if (!parseResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Parâmetros inválidos',
        details: parseResult.error.flatten().fieldErrors,
      }, { status: 400 });
    }

    const { type, limit, sefirot, chakra, element } = parseResult.data;

    let interpretations = [...INTERPRETATIONS];

    // Filter by type
    if (type) {
      interpretations = interpretations.filter(i => i.type === type);
    }

    // Filter by spiritual correlations
    if (sefirot) {
      interpretations = interpretations.filter(i => i.spiritualCorrelations?.sefirot.includes(sefirot));
    }
    if (chakra) {
      interpretations = interpretations.filter(i => i.spiritualCorrelations?.chakra === chakra);
    }
    if (element) {
      interpretations = interpretations.filter(i => i.spiritualCorrelations?.element === element);
    }

    // Apply limit
    if (limit && limit < interpretations.length) {
      interpretations = interpretations.slice(0, limit);
    }

    return NextResponse.json({
      success: true,
      interpretations,
      meta: {
        total: interpretations.length,
        filters: { type, sefirot, chakra, element },
      },
      planets: PLANET_SPIRITUAL_CORRELATIONS,
      stats: {
        byElement: INTERPRETATIONS.reduce((acc, i) => {
          const el = i.spiritualCorrelations?.element || 'Unknown';
          acc[el] = (acc[el] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        byChakra: INTERPRETATIONS.reduce((acc, i) => {
          const ch = i.spiritualCorrelations?.chakra || 0;
          acc[ch] = (acc[ch] || 0) + 1;
          return acc;
        }, {} as Record<number, number>),
        byOrixa: INTERPRETATIONS.reduce((acc, i) => {
          const ox = i.spiritualCorrelations?.orixa || 'Unknown';
          acc[ox] = (acc[ox] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
      },
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno',
    }, { status: 500 });
  }
}