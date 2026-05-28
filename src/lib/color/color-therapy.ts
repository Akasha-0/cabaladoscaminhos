// Color therapy module

export interface ColorTherapySession {
  id: string;
  userId: string;
  color: string;
  chakra: string;
  intention: string;
  duration: number;
  timestamp: Date;
  completed: boolean;
}

export interface ColorProperties {
  id: string;
  name: string;
  hex: string;
  wavelength: number;
  frequency: number;
  chakra: string;
  meanings: {
    physical: string;
    emotional: string;
    spiritual: string;
  };
  benefits: string[];
}

export interface TherapyIntention {
  type: string;
  label: string;
  description: string;
  recommendedColors: string[];
}

export interface PerformTherapyOptions {
  userId?: string;
  colorId: string;
  intention: string;
  duration?: number;
  chakra?: string;
}

export interface TherapyResponse {
  success: boolean;
  session: ColorTherapySession;
  color: ColorProperties;
  intention: TherapyIntention;
  recommendations: string[];
}

const COLOR_PROPERTIES: ColorProperties[] = [
  {
    id: 'red',
    name: 'Vermelho',
    hex: '#FF0000',
    wavelength: 700,
    frequency: 430,
    chakra: 'root',
    meanings: {
      physical: 'Energia vital, circulação, força física',
      emotional: 'Paixão, coragem, determinação',
      spiritual: 'Força de vontade, sobrevivência, raiz',
    },
    benefits: ['Estimula a energia', 'Melhora a circulação', 'Aumenta a motivação'],
  },
  {
    id: 'orange',
    name: 'Laranja',
    hex: '#FF7F00',
    wavelength: 620,
    frequency: 480,
    chakra: 'sacral',
    meanings: {
      physical: 'Sexualidade, reprodução, vitalidade',
      emotional: 'Criatividade, prazer, abundância',
      spiritual: 'Conexão emocional, transformação',
    },
    benefits: ['Estimula a criatividade', 'Melhora a digestão', 'Promove a alegria'],
  },
  {
    id: 'yellow',
    name: 'Amarelo',
    hex: '#FFFF00',
    wavelength: 580,
    frequency: 520,
    chakra: 'solar-plexus',
    meanings: {
      physical: 'Digestão, metabolismo, nervos',
      emotional: 'Felizidade, otimismo, confiança',
      spiritual: 'Poder pessoal, clareza mental',
    },
    benefits: ['Estimula o intelecto', 'Melhora a digestão', 'Promove a confiança'],
  },
  {
    id: 'green',
    name: 'Verde',
    hex: '#00FF00',
    wavelength: 530,
    frequency: 560,
    chakra: 'heart',
    meanings: {
      physical: 'Coração, pulmões, sistema imune',
      emotional: 'Amor, compaixão, equilíbrio',
      spiritual: 'Harmonia, cura, natureza',
    },
    benefits: ['Equilibra as emoções', 'Promove a cura', 'Reconecta com a natureza'],
  },
  {
    id: 'blue',
    name: 'Azul',
    hex: '#0000FF',
    wavelength: 470,
    frequency: 620,
    chakra: 'throat',
    meanings: {
      physical: 'Garganta, tireoide, sistema nervoso',
      emotional: 'Calma, comunicação, sinceridade',
      spiritual: 'Verdade, expressão, paz',
    },
    benefits: ['Calma a mente', 'Melhora a comunicação', 'Promove a expressão'],
  },
  {
    id: 'indigo',
    name: 'Índigo',
    hex: '#4B0082',
    wavelength: 450,
    frequency: 660,
    chakra: 'third-eye',
    meanings: {
      physical: 'Cérebro, olhos, ouvidos',
      emotional: 'Intuição, percepção, discernimento',
      spiritual: 'Visão interior, sabedoria',
    },
    benefits: ['Desenvolve a intuição', 'Melhora a percepção', 'Aprofunda a meditação'],
  },
  {
    id: 'violet',
    name: 'Violeta',
    hex: '#8B00FF',
    wavelength: 420,
    frequency: 720,
    chakra: 'crown',
    meanings: {
      physical: 'Crown, pineal, sistema imunológico',
      emotional: 'Inspiração, devoção, serenidade',
      spiritual: 'Elevação, trascendência, conexão divina',
    },
    benefits: ['Eleva a consciência', 'Promove a espiritualidade', 'Acalma a mente'],
  },
];

const THERAPY_INTENTIONS: Record<string, TherapyIntention> = {
  calm: {
    type: 'calm',
    label: 'Calma e Relaxamento',
    description: 'Para reduzir estresse e ansiedade',
    recommendedColors: ['blue', 'violet', 'green'],
  },
  energy: {
    type: 'energy',
    label: 'Energia e Vitalidade',
    description: 'Para aumentar energia e motivação',
    recommendedColors: ['red', 'orange', 'yellow'],
  },
  healing: {
    type: 'healing',
    label: 'cura e Recuperação',
    description: 'Para processo de cura física ou emocional',
    recommendedColors: ['green', 'blue', 'violet'],
  },
  balance: {
    type: 'balance',
    label: 'Equilíbrio',
    description: 'Para harmonizar emoções e energia',
    recommendedColors: ['green', 'yellow', 'indigo'],
  },
  creativity: {
    type: 'creativity',
    label: 'Criatividade',
    description: 'Para estimular a expressão criativa',
    recommendedColors: ['orange', 'yellow', 'violet'],
  },
  spiritual: {
    type: 'spiritual',
    label: 'Crescimento Espiritual',
    description: 'Para aprofundar a prática espiritual',
    recommendedColors: ['violet', 'indigo', 'blue'],
  },
};

let sessionCounter = 0;

export function getColorProperties(colorId: string): ColorProperties | undefined {
  return COLOR_PROPERTIES.find((c) => c.id === colorId);
}

export function getAllColors(): ColorProperties[] {
  return COLOR_PROPERTIES;
}

export function getIntention(type: string): TherapyIntention | undefined {
  return THERAPY_INTENTIONS[type];
}

export function getAllIntentions(): TherapyIntention[] {
  return Object.values(THERAPY_INTENTIONS);
}

function generateRecommendations(
  color: ColorProperties,
  intention: TherapyIntention
): string[] {
  const recommendations: string[] = [];

  recommendations.push(`Foque na cor ${color.name} (${color.hex}) durante ${color.meanings.physical}`);

  if (intention.type === 'calm') {
    recommendations.push('Pratique respiração profunda visualizando a cor');
    recommendations.push('Mantenha a intenção de calma por 5-10 minutos');
  } else if (intention.type === 'energy') {
    recommendations.push('Visualize a energia da cor preenchendo seu corpo');
    recommendations.push('Permita que a vitalidade flua naturalmente');
  } else if (intention.type === 'healing') {
    recommendations.push('Direcione a energia curativa para a área afetada');
    recommendations.push('Confie no processo de cura natural');
  } else if (intention.type === 'balance') {
    recommendations.push('Observe como a cor ressoa com seu campo energético');
    recommendations.push('Permita que o equilíbrio se estabeleça naturalmente');
  } else if (intention.type === 'creativity') {
    recommendations.push('Deixe a cor inspirar sua expressão criativa');
    recommendations.push('Liberte-se de julgamento e crie com alegria');
  } else if (intention.type === 'spiritual') {
    recommendations.push('Conecte-se com a energia espiritual da cor');
    recommendations.push('Permita que a consciência se eleve gradualmente');
  }

  recommendations.push(`A cor ${color.name} está associada ao chakra ${color.chakra}`);

  return recommendations;
}

export function performTherapy(options: PerformTherapyOptions): TherapyResponse {
  const color = getColorProperties(options.colorId);
  const intention = getIntention(options.intention);

  if (!color || !intention) {
    const defaultColor = COLOR_PROPERTIES[0];
    const defaultIntention = THERAPY_INTENTIONS['calm'];

    return {
      success: false,
      session: {
        id: `color-therapy-${++sessionCounter}`,
        userId: options.userId ?? 'anonymous',
        color: options.colorId,
        chakra: options.chakra ?? defaultColor.chakra,
        intention: options.intention,
        duration: options.duration ?? 10,
        timestamp: new Date(),
        completed: false,
      },
      color: defaultColor,
      intention: defaultIntention,
      recommendations: generateRecommendations(defaultColor, defaultIntention),
    };
  }

  const session: ColorTherapySession = {
    id: `color-therapy-${++sessionCounter}`,
    userId: options.userId ?? 'anonymous',
    color: color.id,
    chakra: options.chakra ?? color.chakra,
    intention: options.intention,
    duration: options.duration ?? 10,
    timestamp: new Date(),
    completed: false,
  };

  return {
    success: true,
    session,
    color,
    intention,
    recommendations: generateRecommendations(color, intention),
  };
}

export function completeSession(sessionId: string): boolean {
  return sessionId.startsWith('color-therapy-');
}