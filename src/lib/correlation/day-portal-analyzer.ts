// Day Portal Analyzer - correlation between weekdays and spiritual energies

export interface DayAnalysis {
  day: string;
  energy: string;
  portal: boolean;
  recommendations: string[];
  affirmations: string[];
}

const DAY_ENERGIES: Record<string, { energy: string; portal: boolean; affirmations: string[] }> = {
  'domingo': {
    energy: 'Sol - Renovação e Espiritualidade',
    portal: true,
    affirmations: ['Eu abraço a luz solar que ilumina meu caminho'],
  },
  'segunda-feira': {
    energy: 'Lua - Intuição e Emoções',
    portal: false,
    affirmations: ['Minha intuição me guia com sabedoria'],
  },
  'terça-feira': {
    energy: 'Marte - Coragem e Ação',
    portal: false,
    affirmations: ['Tenho força para superar todos os obstáculos'],
  },
  'quarta-feira': {
    energy: 'Mercúrio - Comunicação e Aprendizado',
    portal: false,
    affirmations: ['Comunico-me com clareza e sabedoria'],
  },
  'quinta-feira': {
    energy: 'Júpiter - Expansão e Abundância',
    portal: true,
    affirmations: ['A abundância flui naturalmente em minha vida'],
  },
  'sexta-feira': {
    energy: 'Vênus - Amor e Harmonia',
    portal: false,
    affirmations: ['Sou digno de amor e mereço harmonia'],
  },
  'sábado': {
    energy: 'Saturno - Disciplina e Realização',
    portal: true,
    affirmations: ['Com disciplina, alcanço todos os meus objetivos'],
  },
};

export function analyzeDay(dayName: string): DayAnalysis {
  const normalizedDay = dayName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const dayInfo = DAY_ENERGIES[normalizedDay] || {
    energy: 'Neutro',
    portal: false,
    affirmations: ['Estou em paz com o momento presente'],
  };

  return {
    day: dayName,
    energy: dayInfo.energy,
    portal: dayInfo.portal,
    recommendations: dayInfo.portal
      ? ['Dia favorável para rituais e meditação profunda']
      : ['Dia propício para trabalho interior'],
    affirmations: dayInfo.affirmations,
  };
}

export function getWeeklyCycle(): { days: string[]; bestDay: string; portalDays: string[] } {
  const days = Object.keys(DAY_ENERGIES);
  const portalDays = days.filter(d => DAY_ENERGIES[d].portal);
  const bestDay = portalDays[0] || 'domingo';

  return { days, bestDay, portalDays };
}
