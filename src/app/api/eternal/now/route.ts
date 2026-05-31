import { type NextRequest, NextResponse } from "next/server";
import { z } from 'zod';

// ─── Zod Schemas ───────────────────────────────────────────────────────────
const SefirotSchema = z.enum([
  'Kether', 'Chokhmah', 'Binah', 'Chesed', 'Gevurah',
  'Tipheret', 'Netzach', 'Hod', 'Yesod', 'Malkuth'
]);
const ChakraSchema = z.coerce.number().int().min(1).max(7);
const ElementSchema = z.enum(['Fogo', 'Água', 'Terra', 'Ar', 'Éter']);

const EternalQuerySchema = z.object({
  include: z.enum(['chakras', 'sefirot', 'orixas', 'all']).optional(),
  sefirot: SefirotSchema.optional(),
  chakra: ChakraSchema.optional(),
  element: ElementSchema.optional(),
  orixa: z.string().optional(),
});

export const dynamic = "force-dynamic";

// ─── Spiritual Time Correlations ────────────────────────────────────────────
const CHAKRA_CYCLES: Record<number, { name: string; frequency: string; element: string; sefirot: string[]; orixa: string; affirmation: string }> = {
  0: { name: 'Sahasrara (Coroa)', frequency: '963 Hz', element: 'Divino', sefirot: ['Kether'], orixa: 'Oxalá', affirmation: 'A coroa conecta-me à fonte' },
  1: { name: 'Ajna (Terceiro Olho)', frequency: '852 Hz', element: 'Luz', sefirot: ['Binah', 'Chokhmah'], orixa: 'Orunmilá', affirmation: 'A visão interior me guia' },
  2: { name: 'Vishuddha (Garganta)', frequency: '741 Hz', element: 'Éter', sefirot: ['Hod', 'Netzach'], orixa: 'Oxalá', affirmation: 'A palavra sagrada flui através de mim' },
  3: { name: 'Anahata (Coração)', frequency: '639 Hz', element: 'Ar', sefirot: ['Tipheret', 'Chesed'], orixa: 'Oxum', affirmation: 'O amor expande meu coração' },
  4: { name: 'Manipura (Plexo Solar)', frequency: '528 Hz', element: 'Fogo', sefirot: ['Gevurah', 'Netzach'], orixa: 'Xangô', affirmation: 'A força transforma minha realidade' },
  5: { name: 'Svadhisthana (Sacro)', frequency: '417 Hz', element: 'Água', sefirot: ['Yesod'], orixa: 'Iemanjá', affirmation: 'A criatividade flui em mim' },
  6: { name: 'Muladhara (Raiz)', frequency: '396 Hz', element: 'Terra', sefirot: ['Malkuth'], orixa: 'Ogum', affirmation: 'A terra me ancora na presença' },
};

const SEFIROT_HOURS: Record<number, { name: string; element: string; orixa: string; affirmation: string }> = {
  0: { name: 'Kether (Coroa)', element: 'Éter', orixa: 'Oxalá', affirmation: 'A coroa da criação me envolve' },
  1: { name: 'Chokhmah (Sabedoria)', element: 'Ar', orixa: 'Orunmilá', affirmation: 'A sabedoria flui em mim' },
  2: { name: 'Binah (Entendimento)', element: 'Água', orixa: 'Iemanjá', affirmation: 'A compreensão profunda me guia' },
  3: { name: 'Daat (Conhecimento)', element: 'Éter', orixa: 'Oxalá', affirmation: 'O conhecimento secreto se revela' },
  4: { name: 'Chesed (Misericórdia)', element: 'Fogo', orixa: 'Oxum', affirmation: 'A misericórdia divina me sustenta' },
  5: { name: 'Gevurah (Severidade)', element: 'Fogo', orixa: 'Xangô', affirmation: 'A força justa habita em mim' },
  6: { name: 'Tipheret (Beleza)', element: 'Fogo', orixa: 'Oxum', affirmation: 'A beleza do mundo me encanta' },
  7: { name: 'Netzach (Vitória)', element: 'Fogo', orixa: 'Ogum', affirmation: 'A vitória é minha jornada' },
  8: { name: 'Hod (Glória)', element: 'Ar', orixa: 'Oxalá', affirmation: 'A glória me sustenta' },
  9: { name: 'Yesod (Fundação)', element: 'Água', orixa: 'Iemanjá', affirmation: 'O fundamento me ancora' },
  10: { name: 'Malkuth (Reino)', element: 'Terra', orixa: 'Ogum', affirmation: 'Terra e céu se encontram em mim' },
  11: { name: 'Kether (Coroa - ciclo completo)', element: 'Éter', orixa: 'Oxalá', affirmation: 'O ciclo se completa na luz' },
};

const ORIXAS_BY_PERIOD: Record<string, { orixa: string; qualities: string[]; sefirot: string[]; affirmation: string }> = {
  dawn: { orixa: 'Oxalá', qualities: ['paz', 'luz', 'pureza'], sefirot: ['Kether', 'Tipheret'], affirmation: 'A luz da manhã traz paz' },
  morning: { orixa: 'Ogum', qualities: ['ação', 'coragem', 'determinação'], sefirot: ['Gevurah', 'Malkuth'], affirmation: 'A coragem me move pela manhã' },
  midday: { orixa: 'Xangô', qualities: ['justiça', 'força', 'transformação'], sefirot: ['Gevurah', 'Tipheret'], affirmation: 'A justiça brilha ao meio-dia' },
  afternoon: { orixa: 'Oxum', qualities: ['amor', 'prosperidade', 'beleza'], sefirot: ['Chesed', 'Netzach'], affirmation: 'O amor flui na tarde' },
  evening: { orixa: 'Iemanjá', qualities: ['proteção', 'fluidez', 'maternidade'], sefirot: ['Yesod', 'Binah'], affirmation: 'A proteção da noite me envolve' },
  night: { orixa: 'Oxumaré', qualities: ['ciclos', 'transformação', 'continuidade'], sefirot: ['Chokhmah', 'Yesod'], affirmation: 'Os ciclos da noite me transformam' },
  midnight: { orixa: 'Nanã', qualities: ['sabedoria', 'antiguidade', 'purificação'], sefirot: ['Binah', 'Malkuth'], affirmation: 'A sabedoria antiga me purifica' },
};

const DAYS_CORRELATION: Record<number, { day: string; element: string; orixa: string; sefirot: string[]; affirmation: string }> = {
0: { day: 'Domingo', element: 'Fogo', orixa: 'Oxalá', sefirot: ['Tipheret', 'Kether'], affirmation: 'O domingo traz a luz de Oxalá' },
  1: { day: 'Segunda-feira', element: 'Água', orixa: 'Iemanjá', sefirot: ['Yesod', 'Binah'], affirmation: 'A segunda-feira flui com Iemanjá' },
  2: { day: 'Terça-feira', element: 'Fogo', orixa: 'Ogum', sefirot: ['Gevurah'], affirmation: 'A terça-feira traz a força de Ogum' },
  3: { day: 'Quarta-feira', element: 'Ar', orixa: 'Iansã', sefirot: ['Hod', 'Netzach'], affirmation: 'A quarta-feira acelera com Iansã' },
  4: { day: 'Quinta-feira', element: 'Fogo', orixa: 'Xangô', sefirot: ['Chesed'], affirmation: 'A quinta-feira traz a justiça de Xangô' },
  5: { day: 'Sexta-feira', element: 'Terra', orixa: 'Oxum', sefirot: ['Netzach', 'Tipheret'], affirmation: 'A sexta-feira abençoa com Oxum' },
  6: { day: 'Sábado', element: 'Terra', orixa: 'Omulu', sefirot: ['Malkuth'], affirmation: 'O sábado descansa com Omulu' },
};

function getTimePeriod(hour: number): string {
  if (hour >= 5 && hour < 8) return 'dawn';
  if (hour >= 8 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 14) return 'midday';
  if (hour >= 14 && hour < 18) return 'afternoon';
  if (hour >= 18 && hour < 21) return 'evening';
  if (hour >= 21 || hour < 1) return 'night';
  return 'midnight';
}

function getEternalCycle(timestamp: Date): { cycle: number; phase: string; aspect: string; sefirot: string[]; affirmation: string } {
  const hour = timestamp.getHours();
  const minutes = timestamp.getMinutes();
  const totalMinutes = hour * 60 + minutes;
  const cycle = Math.floor(totalMinutes / 137.5) % 6;
  
  const phases = ['Iniciação', 'Expansão', 'Culminação', 'Dissolução', 'Silêncio', 'Renovação'];
  const aspects = ['Luz', 'Força', 'Beleza', 'Harmonia', 'Sabedoria', 'Fundação'];
  const sefirotMap = [['Kether'], ['Gevurah'], ['Tipheret'], ['Netzach'], ['Hod'], ['Malkuth']];
  const affirmations = [
    'A iniciação desperta minha consciência',
    'A expansão fortalece meu ser',
    'A culminação completa meu propósito',
    'A dissolução libera minha essência',
    'O silêncio purifica minha mente',
    'A renovação renova meu espírito'
  ];
  
  return { cycle, phase: phases[cycle], aspect: aspects[cycle], sefirot: sefirotMap[cycle], affirmation: affirmations[cycle] };
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const parseResult = EternalQuerySchema.safeParse({
    include: searchParams.get('include'),
    sefirot: searchParams.get('sefirot'),
    chakra: searchParams.get('chakra'),
    element: searchParams.get('element'),
    orixa: searchParams.get('orixa'),
  });

  if (!parseResult.success) {
    return NextResponse.json({
      success: false,
      error: 'Parâmetros inválidos',
      details: parseResult.error.flatten().fieldErrors,
    }, { status: 400 });
  }

  const { include, sefirot, chakra, element, orixa } = parseResult.data;
  const now = new Date();
  const hour = now.getHours();
  const dayOfWeek = now.getDay();
  const timePeriod = getTimePeriod(hour);
  const eternalCycle = getEternalCycle(now);

  // Build response based on include parameter
  const response: Record<string, unknown> = {
    success: true,
    timestamp: now.toISOString(),
    eternalCycle,
 };

  if (include === 'chakras' || include === 'all') {
    const chakraIndex = hour % 7;
    response.chakra = {
      current: CHAKRA_CYCLES[chakraIndex],
      all: CHAKRA_CYCLES,
    };
  }

  if (include === 'sefirot' || include === 'all') {
    const sefirotIndex = hour % 11;
    response.sephirah = {
      current: SEFIROT_HOURS[sefirotIndex],
      all: SEFIROT_HOURS,
    };
  }

  if (include === 'orixas' || include === 'all') {
    response.orixa = {
      current: ORIXAS_BY_PERIOD[timePeriod],
      all: ORIXAS_BY_PERIOD,
    };
  }

  response.dayCorrelation = DAYS_CORRELATION[dayOfWeek];

  // Calculate spiritual stats
  const spiritualStats = {
    byDay: DAYS_CORRELATION[dayOfWeek],
    byPeriod: ORIXAS_BY_PERIOD[timePeriod],
    bySefirot: eternalCycle.sefirot.reduce((acc, s) => {
      acc[s] = (acc[s] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    byChakra: CHAKRA_CYCLES[hour % 7],
  };

  return NextResponse.json({
    ...response,
    spiritualStats,
    meta: {
      filters: { include, sefirot, chakra, element, orixa },
    },
  });
}