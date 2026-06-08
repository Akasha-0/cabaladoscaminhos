// Spiritual Correlation Engine - Day of Week Correlations
// Data sourced from IDEIA.md correlations table

export interface DayCorrelation {
  dayName: string;
  dayNamePt: string;
  orixa: string;
  chakra: string;
  planet: string;
  sefirah: string;
  element: string;
  elementEmoji: string;
  primaryColor: string;
  secondaryColor: string;
  mystery: string;
}

export const DAY_CORRELATIONS: Record<string, DayCorrelation> = {
  segunda: {
    dayName: 'monday',
    dayNamePt: 'Segunda-feira',
    orixa: 'Omolu / Obaluaê',
    chakra: '1º Básico / 6º Frontal',
    planet: 'Lua / Saturno',
    sefirah: 'Malkuth / Yesod',
    element: 'Terra',
    elementEmoji: '🌍',
    primaryColor: '#dc2626',
    secondaryColor: '#ffffff',
    mystery: 'Aterramento, limpeza espiritual, transmutação e respeito às almas.',
  },
  terca: {
    dayName: 'tuesday',
    dayNamePt: 'Terça-feira',
    orixa: 'Iansã / Oyá',
    chakra: '2º Sacro',
    planet: 'Marte / Plutão',
    sefirah: 'Geburah',
    element: 'Água',
    elementEmoji: '💧',
    primaryColor: '#ea580c',
    secondaryColor: '#dc2626',
    mystery: 'Força, movimento, coragem, corte de demandas e quebra de energias.',
  },
  quarta: {
    dayName: 'wednesday',
    dayNamePt: 'Quarta-feira',
    orixa: 'Xangô',
    chakra: '3º Plexo Solar',
    planet: 'Mercúrio',
    sefirah: 'Hod',
    element: 'Fogo',
    elementEmoji: '🔥',
    primaryColor: '#eab308',
    secondaryColor: '#000000',
    mystery: 'Justiça divina, estudos, verdade e razão.',
  },
  quinta: {
    dayName: 'thursday',
    dayNamePt: 'Quinta-feira',
    orixa: 'Oxóssi',
    chakra: '4º Cardíaco',
    planet: 'Júpiter',
    sefirah: 'Chesed',
    element: 'Ar',
    elementEmoji: '💨',
    primaryColor: '#22c55e',
    secondaryColor: '#000000',
    mystery: 'Fartura, conhecimento, expansão e cura através das matas.',
  },
  sexta: {
    dayName: 'friday',
    dayNamePt: 'Sexta-feira',
    orixa: 'Oxalá',
    chakra: '7º Coronário',
    planet: 'Vênus',
    sefirah: 'Kether',
    element: 'Éter',
    elementEmoji: '✨',
    primaryColor: '#ffffff',
    secondaryColor: '#9333ea',
    mystery: 'Paz, pureza, silêncio, gratidão e conexão direta com o Divino.',
  },
  sabado: {
    dayName: 'saturday',
    dayNamePt: 'Sábado',
    orixa: 'Oxum / Iemanjá',
    chakra: '4º Cardíaco / 6º Frontal',
    planet: 'Saturno / Urano',
    sefirah: 'Binah / Tiphereth',
    element: 'Água',
    elementEmoji: '💧',
    primaryColor: '#ec4899',
    secondaryColor: '#1e3a5f',
    mystery: 'Amor incondicional, intuição, fertilidade e águas geradoras.',
  },
  domingo: {
    dayName: 'sunday',
    dayNamePt: 'Domingo',
    orixa: 'Xangô (Solar)',
    chakra: '3º Plexo Solar',
    planet: 'Sol',
    sefirah: 'Tiphereth',
    element: 'Fogo',
    elementEmoji: '🔥',
    primaryColor: '#eab308',
    secondaryColor: '#f59e0b',
    mystery: 'Recarregar energia vital, poder pessoal e propósito de vida.',
  },
};

const DAY_KEYS: Record<number, string> = {
  0: 'domingo',
  1: 'segunda',
  2: 'terca',
  3: 'quarta',
  4: 'quinta',
  5: 'sexta',
  6: 'sabado',
};

export function getTodayCorrelation(): DayCorrelation {
  const dayIndex = new Date().getDay();
  const dayKey = DAY_KEYS[dayIndex];
  return DAY_CORRELATIONS[dayKey] || DAY_CORRELATIONS['domingo'];
}

export function getCorrelationByDay(dayName: string): DayCorrelation | null {
  const normalized = dayName.toLowerCase().replace('-feira', '').replace(' ', '');
  return DAY_CORRELATIONS[normalized] || null;
}

export function getWeekCorrelations(): DayCorrelation[] {
  return [
    DAY_CORRELATIONS['segunda'],
    DAY_CORRELATIONS['terca'],
    DAY_CORRELATIONS['quarta'],
    DAY_CORRELATIONS['quinta'],
    DAY_CORRELATIONS['sexta'],
    DAY_CORRELATIONS['sabado'],
    DAY_CORRELATIONS['domingo'],
  ];
}
