// Day Portal Analyzer - Spiritual energy analysis for each day of the week
// Based on "Oito Portais da Consciência" from IDEIA.md

// Type definitions for correlation data
export interface DayPortals {
  chakra: string[];
  planet: string[];
  orixa: string[];
  sephirah: string[];
  arcano: string[];
  lunarPhase: string;
}

export interface OduDayData {
  odu: [string, string];
  meaning: string;
}

export interface OrixaChakraMap {
  [orixa: string]: string;
}

// DAY_PORTALS: Spiritual correspondences for each day of the week
export const DAY_PORTALS: Record<string, DayPortals> = {
  'Segunda-feira': {
    chakra: ['1º Básico', '6º Frontal'],
    planet: ['Lua', 'Saturno'],
    orixa: ['Omolu', 'Obaluaê', 'Exu'],
    sephirah: ['Malkuth', 'Yesod'],
    arcano: ['A Sacerdotisa', 'O Mundo'],
    lunarPhase: 'Lua Minguante / Nova',
  },
  'Terça-feira': {
    chakra: ['2º Sacro'],
    planet: ['Marte', 'Plutão'],
    orixa: ['Iansã', 'Oyá', 'Ogum'],
    sephirah: ['Geburah'],
    arcano: ['A Torre', 'O Carro'],
    lunarPhase: 'Lua Nova / Crescente',
  },
  'Quarta-feira': {
    chakra: ['3º Plexo Solar'],
    planet: ['Mercúrio'],
    orixa: ['Xangô', 'Iansã'],
    sephirah: ['Hod'],
    arcano: ['O Mago', 'O Eremita'],
    lunarPhase: 'Lua Crescente',
  },
  'Quinta-feira': {
    chakra: ['4º Cardíaco'],
    planet: ['Júpiter'],
    orixa: ['Oxóssi'],
    sephirah: ['Chesed'],
    arcano: ['O Hierofante'],
    lunarPhase: 'Lua Crescente / Cheia',
  },
  'Sexta-feira': {
    chakra: ['7º Coronário'],
    planet: ['Vênus'],
    orixa: ['Oxalá'],
    sephirah: ['Kether'],
    arcano: ['O Imperador', 'O Louco'],
    lunarPhase: 'Lua Cheia',
  },
  'Sábado': {
    chakra: ['4º Cardíaco', '6º Frontal'],
    planet: ['Saturno', 'Urano'],
    orixa: ['Oxum', 'Iemanjá'],
    sephirah: ['Binah', 'Tiphereth'],
    arcano: ['A Imperatriz', 'A Estrela'],
    lunarPhase: 'Lua Cheia',
  },
  'Domingo': {
    chakra: ['3º Plexo Solar'],
    planet: ['Sol'],
    orixa: ['Xangô'],
    sephirah: ['Tiphereth'],
    arcano: ['O Sol'],
    lunarPhase: 'Lua Cheia / Crescente',
  },
};

// ODU_DAY_MAP: Odú regente for each day of the week
export const ODU_DAY_MAP: Record<string, OduDayData> = {
  'Segunda-feira': {
    odu: ['Okaran (1)', 'Obará (6)'],
    meaning: 'Abertura de caminhos, destino, ancestralidade, transmutação e o poder da matéria.',
  },
  'Terça-feira': {
    odu: ['Odi (7)', 'Ejilsebora (12)'],
    meaning: 'Força de guerra, movimento rápido, coragem e cortes profundos de demandas.',
  },
  'Quarta-feira': {
    odu: ['Obará (6)', 'Ejilsebora (12)'],
    meaning: 'Justiça, equilíbrio mental, intelecto, verdade, prosperidade e estratégia.',
  },
  'Quinta-feira': {
    odu: ['Oda (4)', 'Oxé (5)'],
    meaning: 'Fartura, expansão, direcionamento da mente e a busca pelo conhecimento nas matas.',
  },
  'Sexta-feira': {
    odu: ['EjiOníle (8)', 'Alafia (16)'],
    meaning: 'Paz absoluta, pureza, luz espiritual, cabeça fria (Ori) e sabedoria divina.',
  },
  'Sábado': {
    odu: ['Oxé (5)', 'Ossá (9)'],
    meaning: 'Amor incondicional, intuição geradora, fertilidade, águas profundas e feitiço natural.',
  },
  'Domingo': {
    odu: ['Obará (6)', 'EjiOníle (8)'],
    meaning: 'Brilho pessoal, realeza, vitalidade, liderança e a manifestação do sucesso.',
  },
};

// ORIXÁ_CHAKRA_MAP: Orixá to chakra correspondence
export const ORIXÁ_CHAKRA_MAP: OrixaChakraMap = {
  'Oxalá': '7º Coronário',
  'Iemanjá': '6º Frontal',
  'Oxum': '4º Cardíaco',
  'Ogum': '5º Laríngeo',
  'Oxóssi': '4º Cardíaco',
  'Xangô': '3º Plexo Solar',
  'Iansã': '2º Sacro',
  'Omolu': '1º Básico',
  'Nanã': '1º Básico',
  'Oxumaré': '2º Sacro',
  'Exu': '1º Básico',
};

export interface DayAnalysis {
  day: string;
  portals: DayPortals;
  odu: {
    primary: string;
    secondary: string;
    meaning: string;
  };
  energy: {
    type: 'yang' | 'yin' | 'balanced';
    intensity: 'high' | 'medium' | 'low';
    focus: string[];
  };
  rituals: {
    recommended: string[];
    avoided: string[];
    herbs: string[];
    colors: string[];
  };
}

function normalizeDay(day: string): string {
  const map: Record<string, string> = {
    'segunda': 'Segunda-feira',
    'segunda-feira': 'Segunda-feira',
    'monday': 'Segunda-feira',
    'terca': 'Terça-feira',
    'terça': 'Terça-feira',
    'terça-feira': 'Terça-feira',
    'tuesday': 'Terça-feira',
    'quarta': 'Quarta-feira',
    'quarta-feira': 'Quarta-feira',
    'wednesday': 'Quarta-feira',
    'quinta': 'Quinta-feira',
    'quinta-feira': 'Quinta-feira',
    'thursday': 'Quinta-feira',
    'sexta': 'Sexta-feira',
    'sexta-feira': 'Sexta-feira',
    'friday': 'Sexta-feira',
    'sabado': 'Sábado',
    'sábado': 'Sábado',
    'saturday': 'Sábado',
    'domingo': 'Domingo',
    'sunday': 'Domingo',
  };
  return map[day.toLowerCase()] || day;
}

function getRitualsByDay(day: string): string[] {
  const rituals: Record<string, string[]> = {
    'Segunda-feira': ['Purificação pesada', 'Corte de laços kármicos', 'Aterramento ancestral'],
    'Terça-feira': ['Quebra de demandas', 'Ativação de movimento', 'Rituais de banimento'],
    'Quarta-feira': ['Estudos', 'Justiça divina', 'Equilíbrio mental'],
    'Quinta-feira': ['Expansão de projetos', 'Rituais de fartura', 'Busca por conhecimento'],
    'Sexta-feira': ['Conexão espiritual', 'Bori', 'Rituais de gratidão'],
    'Sábado': ['Atração', 'Magnetismo', 'Fertilidade', 'Feitiçaria natural'],
    'Domingo': ['Vitalidade', 'Irradiação de poder pessoal', 'Alinhamento com propósito'],
  };
  return rituals[day] || [];
}

function getAvoidedByDay(day: string): string[] {
  const avoided: Record<string, string[]> = {
    'Segunda-feira': ['Conflitos', 'Decisões precipitadas', 'Exposição excessiva'],
    'Terça-feira': ['Inação', 'Procrastinação', 'Ruminação'],
    'Quarta-feira': ['Impulsividade', 'Conflitos desnecessários', 'Segredos'],
    'Quinta-feira': ['Ganância', 'Inveja', 'Competição'],
    'Sexta-feira': ['Brigas', 'Negatividade', 'Críticas'],
    'Sábado': ['Isolamento', 'Rigidez', 'Avidez'],
    'Domingo': ['Preocupação excessiva', 'Medo', 'Paralisia'],
  };
  return avoided[day] || [];
}

function getHerbsByDay(day: string): string[] {
  const herbs: Record<string, string[]> = {
    'Segunda-feira': ['Arruda', 'Guiné', 'Pinhão Roxo'],
    'Terça-feira': ['Espada-de-são-jorge', 'Aroeira', 'Manjericão Roxo'],
    'Quarta-feira': ['Alecrim', 'Hortelã', 'Manjericão'],
    'Quinta-feira': ['Boldo', 'Samambaia', 'Eucalipto'],
    'Sexta-feira': ['Boldo', 'Colônia', 'Rosa Branca'],
    'Sábado': ['Calêndula', 'Camomila', 'Erva-doce'],
    'Domingo': ['Alecrim', 'Canela', 'Louro'],
  };
  return herbs[day] || [];
}

function getColorsByDay(portal: DayPortals): string[] {
  const colorMap: Record<string, string[]> = {
    '1º Básico': ['Vermelho', 'Preto'],
    '2º Sacro': ['Laranja', 'Vermelho'],
    '3º Plexo Solar': ['Amarelo', 'Dourado'],
    '4º Cardíaco': ['Verde', 'Rosa'],
    '5º Laríngeo': ['Azul Claro', 'Verde'],
    '6º Frontal': ['Azul Escuro', 'Branco'],
    '7º Coronário': ['Branco', 'Violeta', 'Opala'],
  };
  const colors = portal.chakra.flatMap(c => colorMap[c] || []);
  return Array.from(new Set(colors));
}

export function analyzeDay(day: string): DayAnalysis {
  const dayNormalized = normalizeDay(day);
  const portal = DAY_PORTALS[dayNormalized];
  const oduData = ODU_DAY_MAP[dayNormalized];
  const isYang = ['Sol', 'Marte', 'Júpiter'].some(p => portal.planet.includes(p));
  const isYin = ['Lua', 'Saturno', 'Vênus'].some(p => portal.planet.includes(p));
  const intensity = (portal.planet.length + portal.orixa.length) / 4;
  const focus = portal.chakra.map(c => {
    if (c.includes('1º')) return 'Aterramento e sobrevivência';
    if (c.includes('2º')) return 'Criatividade e movimento';
    if (c.includes('3º')) return 'Poder pessoal e vontade';
    if (c.includes('4º')) return 'Amor e harmonização';
    if (c.includes('5º')) return 'Comunicação e expressão';
    if (c.includes('6º')) return 'Intuição e visão';
    if (c.includes('7º')) return 'Espiritualidade e conexão divina';
    return 'Desconhecido';
  });
  return {
    day: dayNormalized,
    portals: portal,
    odu: { primary: oduData.odu[0], secondary: oduData.odu[1], meaning: oduData.meaning },
    energy: {
      type: isYang ? 'yang' : isYin ? 'yin' : 'balanced',
      intensity: intensity > 1.5 ? 'high' : intensity > 0.75 ? 'medium' : 'low',
      focus,
    },
    rituals: {
      recommended: getRitualsByDay(dayNormalized),
      avoided: getAvoidedByDay(dayNormalized),
      herbs: getHerbsByDay(dayNormalized),
      colors: getColorsByDay(portal),
    },
  };
}

export function getWeeklyCycle(): DayAnalysis[] {
  return ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado', 'Domingo'].map(analyzeDay);
}

export function getCurrentDayAnalysis(): DayAnalysis {
  const days = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
  const today = days[new Date().getDay()];
  return analyzeDay(today);
}

export function getBestDayForRitual(ritualType: string): string | null {
  const ritualDayMap: Record<string, string[]> = {
    'purificação': ['Segunda-feira'],
    'corte de demandas': ['Terça-feira'],
    'justiça': ['Quarta-feira'],
    'fartura': ['Quinta-feira', 'Domingo'],
    'conexão espiritual': ['Sexta-feira'],
    'atração': ['Sábado'],
    'vitalidade': ['Domingo'],
    'banimento': ['Terça-feira'],
    'protect': ['Segunda-feira', 'Quinta-feira'],
    'amor': ['Sábado', 'Sexta-feira'],
  };
  const normalizedType = ritualType.toLowerCase();
  for (const [type, days] of Object.entries(ritualDayMap)) {
    if (normalizedType.includes(type) || type.includes(normalizedType)) {
      return days[0];
    }
  }
  return null;
}

/**
 * Get the day name from a Date object
 * @param date - Date object
 * @returns Day name in Portuguese (e.g., 'Segunda-feira')
 */
export function getDayName(date: Date): string {
  const dayMap: Record<number, string> = {
    0: 'Domingo',
    1: 'Segunda-feira',
    2: 'Terça-feira',
    3: 'Quarta-feira',
    4: 'Quinta-feira',
    5: 'Sexta-feira',
    6: 'Sábado',
  };
  return dayMap[date.getDay()];
}
