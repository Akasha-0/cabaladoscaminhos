import { type NextRequest, NextResponse } from "next/server";
import { z } from 'zod';

// ─── Zod Schemas ───────────────────────────────────────────────────────────
const EternalQuerySchema = z.object({
  include: z.enum(['chakras', 'sefirot', 'orixas', 'all']).optional(),
});

export const dynamic = "force-dynamic";

// ─── Spiritual Time Correlations ────────────────────────────────────────────

const CHAKRA_CYCLES: Record<number, { name: string; frequency: string; element: string }> = {
  0: { name: 'Sahasrara (Coroa)', frequency: '963 Hz', element: 'Divino' },
  1: { name: 'Ajna (Terceiro Olho)', frequency: '852 Hz', element: 'Luz' },
  2: { name: 'Vishuddha (Garganta)', frequency: '741 Hz', element: 'Éter' },
  3: { name: 'Anahata (Coração)', frequency: '639 Hz', element: 'Ar' },
  4: { name: 'Manipura (Plexo Solar)', frequency: '528 Hz', element: 'Fogo' },
  5: { name: 'Svadhisthana (Sacro)', frequency: '417 Hz', element: 'Água' },
  6: { name: 'Muladhara (Raiz)', frequency: '396 Hz', element: 'Terra' },
};

const SEFIROT_HOURS: Record<number, string> = {
  0: 'Kether (Coroa)',
  1: 'Chokhmah (Sabedoria)',
  2: 'Binah (Entendimento)',
  3: 'Daat (Conhecimento)',
  4: 'Chesed (Misericórdia)',
  5: 'Gevurah (Severidade)',
  6: 'Tipheret (Beleza)',
  7: 'Netzach (Vitória)',
  8: 'Hod (Glória)',
  9: 'Yesod (Fundação)',
  10: 'Malkuth (Reino)',
  11: 'Kether (Coroa - ciclo completo)',
};

const ORIXAS_BY_PERIOD: Record<string, { orixa: string; qualities: string[] }> = {
  dawn: { orixa: 'Oxalá', qualities: ['paz', 'luz', 'pureza'] },
  morning: { orixa: 'Ogum', qualities: ['ação', 'coragem', 'determinação'] },
  midday: { orixa: 'Xangô', qualities: ['justiça', 'força', 'transformação'] },
  afternoon: { orixa: 'Oxum', qualities: ['amor', 'prosperidade', 'beleza'] },
  evening: { orixa: 'Iemanjá', qualities: ['proteção', 'fluidez', 'maternidade'] },
  night: { orixa: 'Oxumaré', qualities: ['ciclos', 'transformação', 'continuidade'] },
  midnight: { orixa: 'Nanã', qualities: ['sabedoria', 'antiguidade', 'purificação'] },
};

const DAYS_CORRELATION: Record<number, { day: string; element: string; orixa: string; sefirot: string[] }> = {
  0: { day: 'Domingo', element: 'Fogo', orixa: 'Oxalá', sefirot: ['Tipheret', 'Kether'] },
  1: { day: 'Segunda-feira', element: 'Água', orixa: 'Iemanjá', sefirot: ['Yesod', 'Binah'] },
  2: { day: 'Terça-feira', element: 'Fogo', orixa: 'Ogum', sefirot: ['Gevurah'] },
  3: { day: 'Quarta-feira', element: 'Ar', orixa: 'Iansã', sefirot: ['Hod', 'Netzach'] },
  4: { day: 'Quinta-feira', element: 'Fogo', orixa: 'Xangô', sefirot: ['Chesed'] },
  5: { day: 'Sexta-feira', element: 'Terra', orixa: 'Oxum', sefirot: ['Netzach', 'Tipheret'] },
  6: { day: 'Sábado', element: 'Terra', orixa: 'Omulu', sefirot: ['Malkuth'] },
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

function getEternalCycle(timestamp: Date): { cycle: number; phase: string; aspect: string } {
  const hour = timestamp.getHours();
  const minutes = timestamp.getMinutes();
  const totalMinutes = hour * 60 + minutes;
  const cycle = Math.floor(totalMinutes / 137.5) % 6;
  
  const phases = ['Iniciação', 'Expansão', 'Culminação', 'Dissolução', 'Silêncio', 'Renovação'];
  const aspects = ['Luz', 'Força', 'Beleza', 'Harmonia', 'Sabedoria', 'Fundação'];
  
  return { cycle, phase: phases[cycle], aspect: aspects[cycle] };
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const parseResult = EternalQuerySchema.safeParse({
    include: searchParams.get('include'),
  });

  if (!parseResult.success) {
    return NextResponse.json({
      success: false,
      error: 'Parâmetros inválidos',
      details: parseResult.error.flatten().fieldErrors,
    }, { status: 400 });
  }

  const { include } = parseResult.data;
  const now = new Date();
  const hour = now.getHours();
  const dayOfWeek = now.getDay();
  const cycleIndex = hour % 7;

  const period = getTimePeriod(hour);
  const periodInfo = ORIXAS_BY_PERIOD[period];
  const dayInfo = DAYS_CORRELATION[dayOfWeek];
  const sefirotInfo = SEFIROT_HOURS[cycleIndex] || SEFIROT_HOURS[0];
  const chakraCycle = CHAKRA_CYCLES[cycleIndex % 7];
  const eternalCycle = getEternalCycle(now);

  const response: Record<string, unknown> = {
    success: true,
    timestamp: now.toISOString(),
    era: 'eternal',
    eternal: {
      cycle: eternalCycle.cycle,
      phase: eternalCycle.phase,
      aspect: eternalCycle.aspect,
    },
  };

  if (include === 'all' || include === 'orixas') {
    response.orixaCurrent = {
      name: periodInfo.orixa,
      period,
      qualities: periodInfo.qualities,
    };
    response.dayOrixa = {
      name: dayInfo.orixa,
      element: dayInfo.element,
    };
  }

  if (include === 'all' || include === 'sefirot') {
    response.sefirotCurrent = sefirotInfo;
    response.daySefirot = dayInfo.sefirot;
  }

  if (include === 'all' || include === 'chakras') {
    response.chakraCurrent = chakraCycle;
  }

  return NextResponse.json(response);
}