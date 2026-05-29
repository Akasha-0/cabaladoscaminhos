import { analyzeDay } from './day-portal-analyzer';
import { getLunarPhase } from './lunar-phase-analyzer';
import { trackSpiritualEvent, SpiritualEvent } from '@/lib/spiritual-data/spiritual-analytics';

export interface CorrelationInsight {
  dayPortal: {
    name: string;
    alignment: 'excellent' | 'good' | 'neutral' | 'poor';
    recommendations: string[];
  };
  lunarInfluence: {
    phase: string;
    ritualBonus: number;
    optimal: boolean;
  };
  orixaMatch: {
    name: string;
    strength: number;
  };
  energy: {
    current: string;
    recommendation: string;
  };
}

/**
 * Get correlation insight for a specific day and time
 */
export function getCorrelationInsight(date: Date = new Date()): CorrelationInsight {
  const dayName = getDayNameLocal(date);
  const dayAnalysis = analyzeDay(dayName);
  const lunarPhase = getLunarPhase(date);

  // Calculate day alignment
  const hour = date.getHours();
  const isOptimalHour = lunarPhase.window.start.includes('16:00')
    ? (hour >= 16 && hour <= 18)
    : (hour >= 10 && hour <= 12);

  const alignment = isOptimalHour ? 'excellent' : 'good';

  return {
    dayPortal: {
      name: dayName,
      alignment,
      recommendations: getDayRecommendations(dayName),
    },
    lunarInfluence: {
      phase: lunarPhase.name,
      ritualBonus: lunarPhase.ritual ? 10 : 0,
      optimal: isOptimalHour,
    },
    orixaMatch: {
      name: dayAnalysis.portals.orixa[0],
      strength: alignment === 'excellent' ? 95 : alignment === 'good' ? 75 : 50,
    },
    energy: {
      current: dayAnalysis.portals.chakra[0],
      recommendation: getEnergyRecommendation(dayName),
    },
  };
}

function getDayNameLocal(date: Date): string {
  const days: Record<number, string> = {
    0: 'Domingo',
    1: 'Segunda-feira',
    2: 'Terça-feira',
    3: 'Quarta-feira',
    4: 'Quinta-feira',
    5: 'Sexta-feira',
    6: 'Sábado',
  };
  return days[date.getDay()] ?? 'Domingo';
}

function getDayRecommendations(day: string): string[] {
  const recs: Record<string, string[]> = {
    'Segunda-feira': [
      'Ideal para rituais de proteção e limpeza',
      'Bom para meditações de aterramento',
      'Combine com defumação de arruda',
    ],
    'Terça-feira': [
      'Perfeito para Ebós de caminho',
      'Excelente para trabalhos de quebra',
      'Use cores laranja e vermelho',
    ],
    'Quarta-feira': [
      'Ideal para consultas de Tarot',
      'Bom para meditações de clareza',
      'Use incenso de alecrim',
    ],
    'Quinta-feira': [
      'Excelente para rituais de prosperidade',
      'Perfeito para oferendas a Oxóssi',
      'Use cores verde e azul-turquesa',
    ],
    'Sexta-feira': [
      'Ideal para purificação e perdão',
      'Bom para trabalho com Oxum',
      'Use incenso de olibano e jasmim',
    ],
    'Sábado': [
      'Perfeito para rituais de amor',
      'Excelente para trabalho com Iemanjá',
      'Use cores rosa e azul escuro',
    ],
    'Domingo': [
      'Ideal para ativações de axé',
      'Bom para alinhamento com Ori',
      'Use cores dourado e amarelo',
    ],
  };
  return recs[day] || ['Ritual geral de harmonia'];
}

function getEnergyRecommendation(day: string): string {
  const recs: Record<string, string> = {
    'Segunda-feira': 'Use 396 Hz para liberação de medos',
    'Terça-feira': 'Use 528 Hz para transformação e força',
    'Quarta-feira': 'Use 639 Hz para Harmonia em relacionamentos',
    'Quinta-feira': 'Use 741 Hz para desperta da Intuição',
    'Sexta-feira': 'Use 852 Hz para despertar Percepção Espiritual',
    'Sábado': 'Use 963 Hz para despertar Luz Interior',
    'Domingo': 'Use 963 Hz para Conexão com o Divino',
  };
  return recs[day] || 'Use 963 Hz para alinhamento geral';
}

/**
 * Track a ritual with correlation context
 */
export function trackRitualWithCorrelation(
  event: Omit<SpiritualEvent, 'timestamp'>,
  date: Date = new Date()
): void {
  const dayName = getDayNameLocal(date);
  const dayAnalysis = analyzeDay(dayName);
  const lunarPhase = getLunarPhase(date);

  // Add correlation context to meta
  const enrichedEvent: Omit<SpiritualEvent, 'timestamp'> = {
    ...event,
    meta: {
      ...event.meta,
      dayOfWeek: date.getDay(),
      lunarPhase: lunarPhase.name,
      orixaAssociated: dayAnalysis.portals.orixa[0],
    },
  };

  trackSpiritualEvent(enrichedEvent);
}

/**
 * Get ritual effectiveness based on timing
 */
export function getRitualEffectiveness(date: Date = new Date()): {
  score: number;
  factors: string[];
  bonus: string[];
} {
  const dayName = getDayNameLocal(date);
  const dayAnalysis = analyzeDay(dayName);
  const lunarPhase = getLunarPhase(date);

  let score = 50; // Base score
  const factors: string[] = [];
  const bonus: string[] = [];

  // Day portal bonus
  const dayBonus: Record<string, number> = {
    'Segunda-feira': 10,
    'Terça-feira': 15,
    'Quarta-feira': 10,
    'Quinta-feira': 20,
    'Sexta-feira': 15,
    'Sábado': 20,
    'Domingo': 15,
  };
  score += dayBonus[dayName] ?? 0;
  factors.push(`Portal ${dayName}: +${dayBonus[dayName] ?? 0}`);

  // Lunar phase bonus
  if (lunarPhase?.name === 'Lua Cheia') {
    score += 25;
    bonus.push('Lua Cheia: +25% poder ritual');
  } else if (lunarPhase?.name === 'Lua Nova') {
    score += 20;
    bonus.push('Lua Nova: +20% para novos Começos');
  } else if (lunarPhase?.name === 'Lua Crescente') {
    score += 15;
    bonus.push('Lua Crescente: +15% para Manifestação');
  } else {
    score += 5;
  }
  factors.push(`Fase Lunar: ${lunarPhase?.name ?? 'Unknown'}`);

  // Time of day bonus
  const hour = date.getHours();
  if (hour >= 16 && hour <= 18) {
    score += 10;
    bonus.push('Hora ritual: 16h-18h');
  }

  // Orixá alignment bonus
  if (dayAnalysis.portals.orixa.length > 0) {
    score += 10;
    factors.push(`Orixá: ${dayAnalysis.portals.orixa[0]}`);
  }

  return {
    score: Math.min(100, score),
    factors,
    bonus,
  };
}
