import type { BirthChart } from '@akasha/core-astrology';
import { buildDailyEnergy } from '@/lib/agents/transit-engine';

export interface DailyContent {
  date: string;
  climate: string;
  ritual: {
    titulo: string;
    instrucao: string;
    cor: string;
    elemento: string;
  };
  alert: string;
  tensionPoint: {
    pillar: string;
    theme: string;
    intensity: number;
  };
  moonPhase: string;
  overallTheme: string;
}

export function buildDailyContent(
  astrologyMap: unknown,
  kabalisticMap: unknown,
  tantricMap: unknown,
  oduBirth: unknown,
  date: Date = new Date()
): DailyContent {
  const birthChart = astrologyMap as BirthChart;
  const dateStr = date.toISOString().split('T')[0];

  let energy: ReturnType<typeof buildDailyEnergy>;
  try {
    energy = buildDailyEnergy(birthChart, date);
  } catch {
    energy = buildFallbackEnergy(date);
  }

  const kab = kabalisticMap as Record<string, unknown>;
  const tantra = tantricMap as Record<string, unknown>;
  const odu = oduBirth as Record<string, unknown>;

  const tensionPoint = detectTensionPoint(energy, kab, tantra, odu);
  const climate = buildClimateText(energy, tensionPoint);
  const ritual = buildRitualSuggestion(energy, odu);
  const alert = buildAlertText(energy, tensionPoint);

  return {
    date: dateStr,
    climate,
    ritual,
    alert,
    tensionPoint,
    moonPhase: energy.moonPhase?.name ?? 'Lua',
    overallTheme: energy.overallTheme ?? 'Equilíbrio',
  };
}

function detectTensionPoint(
  energy: ReturnType<typeof buildDailyEnergy>,
  _kab: Record<string, unknown>,
  _tantra: Record<string, unknown>,
  _odu: Record<string, unknown>
): DailyContent['tensionPoint'] {
  const hasChallengingAspects = energy.majorAspects?.some(
    (a) => a.energy === 'desafiador'
  );
  const pillar = hasChallengingAspects ? 'astrologia' : 'tantra';
  return {
    pillar,
    theme: energy.overallTheme ?? 'Integração',
    intensity: energy.overallEnergy ?? 50,
  };
}

function buildClimateText(
  energy: ReturnType<typeof buildDailyEnergy>,
  tension: DailyContent['tensionPoint']
): string {
  const moon = energy.moonPhase;
  const aspects = energy.majorAspects?.slice(0, 2) ?? [];
  let text = `${moon?.name ?? 'Lua'} — ${moon?.energy ?? 'energia em fluxo'}.`;
  if (aspects.length > 0 && aspects[0]?.interpretation) {
    text += ` ${aspects[0].interpretation}`;
  }
  if (energy.overallTheme) {
    text += ` Tema do dia: ${energy.overallTheme}.`;
  }
  return text.trim();
}

function buildRitualSuggestion(
  energy: ReturnType<typeof buildDailyEnergy>,
  odu: Record<string, unknown>
): DailyContent['ritual'] {
  const rituals = energy.moonPhase?.rituals ?? [];
  const cor = energy.luckyColor ?? 'branco';
  const primeiroRitual = rituals[0] ?? 'Meditação de ancoragem';
  return {
    titulo: primeiroRitual,
    instrucao: `Dedique 5 minutos à ${primeiroRitual.toLowerCase()} para alinhar sua energia com o campo de hoje. Use a cor ${cor} ao seu redor.`,
    cor,
    elemento: typeof odu?.elementalForce === 'string' ? odu.elementalForce : 'Terra',
  };
}

function buildAlertText(
  energy: ReturnType<typeof buildDailyEnergy>,
  tension: DailyContent['tensionPoint']
): string {
  const desafiadores = energy.majorAspects?.filter((a) => a.energy === 'desafiador') ?? [];
  if (desafiadores.length === 0) {
    return `Campo favorável hoje. Evite dispersão e mantenha o foco no ${tension.theme}.`;
  }
  return (
    desafiadores[0]?.recommendation ??
    `Atenção ao campo emocional nas próximas 24h. Tema: ${tension.theme}.`
  );
}

function buildFallbackEnergy(date: Date): ReturnType<typeof buildDailyEnergy> {
  const day = date.getDate();
  const phases = ['nova', 'crescente', 'cheia', 'minguante'] as const;
  const phase = phases[Math.floor((day / 30) * 4) % 4];
  return {
    date: date.toISOString().split('T')[0],
    moonPhase: {
      phase,
      name: `Lua ${phase}`,
      illumination: 50,
      energy: 'energia em transição',
      action: 'Conecte-se com seu centro interior.',
      avoid: 'Dispersão',
      rituals: ['banho de ervas', 'meditação'],
      favorableFor: ['reflexão', 'planejamento'],
    },
    majorAspects: [],
    overallTheme: 'Renovação',
    keyAdvice: 'Conecte-se com seu centro interior.',
    luckyColor: 'branco',
    luckyNumber: (day % 9) + 1,
    overallEnergy: 60,
    retrogradePlanets: [],
    powerHour: '06-08h',
  };
}
