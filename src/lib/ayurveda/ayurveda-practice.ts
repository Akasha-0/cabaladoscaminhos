// Ayurveda practice

export interface AyurvedaPracticeConfig {
  userId?: string;
  dosha?: 'vata' | 'pitta' | 'kapha' | 'tridoshic';
  prakriti?: 'vata' | 'pitta' | 'kapha';
  vikriti?: 'vata' | 'pitta' | 'kapha';
  season?: 'spring' | 'summer' | 'autumn' | 'winter' | 'monsoon';
  timeOfDay?: 'morning' | 'midday' | 'evening' | 'night';
  practiceType?: 'diet' | 'herb' | 'oil' | 'detox' | 'lifestyle' | 'yoga' | 'breath';
  duration?: number; // minutes
  intensity?: number; // 1-10 scale
  timestamp?: number;
}

export interface AyurvedaPracticeResult {
  practiceId: string;
  completed: boolean;
  doshaBalance: number; // 0-100
  primaryDosha: string;
  secondaryDosha: string;
  recommendations: string[];
  treatments: string[];
  seasonalAdvice: string[];
  desbloqueios: string[];
  state: 'imbalanced' | 'balanced' | 'optimized';
}

const desbloqueioPool = [
  'Ayurveda ensina que a saúde é o equilíbrio entre corpo, mente e espírito.',
  'Os três doshas — Vata, Pitta e Kapha — governam todas as funções fisiológicas.',
  'Quando os doshas estão em harmonia, o corpo possui sua própria sabedoria curativa.',
  'A dieta apropriada para seu dosha é o primeiro passo para o bem-estar.',
  'As estações afetam profundamente nosso equilíbrio doshic.',
  'A rotina diária (Dinacharya) alinha o corpo com os ritmos da natureza.',
  'O fogo digestivo (Agni) é a base de toda saúde ayurvédica.',
  'A desintoxicação periódica restaura o equilíbrio dos doshas.',
  'O óleo ayurvédico (Abhyanga) nutre os tecidos e acalma o sistema nervoso.',
  'A consciência do Prakriti e Vikriti guia o caminho de cura.',
];

const vataTreatments = [
  'Abhyanga (oleação com óleo morno)',
  'Shiroabhyanga (massagem na cabeça)',
  'Vata-pacifying diet (alimentos quentes, úmidos e oleosos)',
  'Asanas grounding ( postures que ancoram Vata)',
  'Pranayama: Nadi Shodhana e Bhramari',
  'Rutina noturna consistente',
  'Automassagem com óleo de sésamo',
];

const pittaTreatments = [
  'Abhyanga (oleação refrescante)',
  'Shirodhara (fluxo de óleo na testa)',
  'Pitta-pacifying diet (alimentos frios e não picantes)',
  'Asanas refrescantes ( yoga postures)',
  'Pranayama: Sheetali e Shitkari',
  'Evitar exposição solar excessiva',
  'Atividades relaxantes ao ar livre',
];

const kaphaTreatments = [
  'Udvartana (massagem com pós secos)',
  'Kapha-pacifying diet (alimentos leves e secos)',
  'Asanas energizantes e estimulantes',
  'Pranayama: Kapalabhati e Bhastrika',
  'Rotina matinal ativa',
  'Exercício físico regular',
  'Evitar alimentos frios e pesados',
];

const seasonalAdvice = {
  spring: 'Kapha season: Favor limpeza, leveza e atividades estimulantes.',
  summer: 'Pitta season: Resfrie o corpo, evite calor excessivo e comidas picantes.',
  autumn: 'Vata season: Aqueça, hidrate e estabeleça rotinas consistentes.',
  winter: 'Vata-Kapha: Mantenha o calor interno, evite frio e umidade, mova-se regularmente.',
  monsoon: 'Vata-Pitta: Proteja-se da umidade, fortaleça Agni, use alimentos digestivos.',
};

export async function performPractice(config: AyurvedaPracticeConfig = {}): Promise<AyurvedaPracticeResult> {
  const {
    userId = 'anon',
    dosha = 'tridoshic',
    prakriti = 'tridoshic',
    vikriti = 'tridoshic',
    season = 'spring',
    timeOfDay = 'morning',
    practiceType = 'lifestyle',
    duration = 30,
    intensity = 5,
    timestamp = Date.now()
  } = config;

  // Generate practice ID
  const practiceId = `ayurveda-${userId}-${timestamp}-${Math.random().toString(36).slice(2, 8)}`;

  // Determine primary and secondary doshas
  let primaryDosha = prakriti;
  let secondaryDosha = prakriti;
  
  if (vikriti !== prakriti) {
    primaryDosha = vikriti;
    secondaryDosha = prakriti;
  }

  // Calculate dosha balance based on practice type and duration
  const practiceEfficiency: Record<string, number> = {
    diet: 0.9,
    herb: 0.85,
    oil: 0.95,
    detox: 1.0,
    lifestyle: 0.8,
    yoga: 0.75,
    breath: 0.7,
  };
  
  const efficiency = practiceEfficiency[practiceType] || 0.8;
  const intensityFactor = intensity / 10;
  const durationFactor = Math.min(1, duration / 60);
  
  const doshaBalance = Math.min(100, Math.floor(
    ((durationFactor * 100 * efficiency) * (0.5 + intensityFactor * 0.5))
  ));

  // Select treatments based on primary dosha
  let treatments: string[];
  switch (primaryDosha) {
    case 'vata':
      treatments = vataTreatments;
      break;
    case 'pitta':
      treatments = pittaTreatments;
      break;
    case 'kapha':
      treatments = kaphaTreatments;
      break;
    default:
      treatments = [...vataTreatments.slice(0, 2), ...pittaTreatments.slice(0, 2), ...kaphaTreatments.slice(0, 2)];
  }

  // Generate recommendations
  const recommendations: string[] = [];
  recommendations.push(`Prática recomendada: ${practiceType} para ${primaryDosha}`);
  recommendations.push(`Melhor horário: ${timeOfDay}`);
  recommendations.push(`Consideração sazonal: ${season}`);
  recommendations.push(`Duração sugerida: ${duration} minutos`);
  recommendations.push(`Intensidade: ${intensity}/10`);

  // Seasonal advice
  const seasonalAdviceList = [
    seasonalAdvice[season],
    'Ajuste sua dieta conforme as mudanças sazonais.',
    'Mantenha routines consistentes para estabilidade.',
  ];

  // Determine state
  let state: AyurvedaPracticeResult['state'] = 'balanced';
  if (doshaBalance >= 85) {
    state = 'optimized';
  } else if (doshaBalance < 50) {
    state = 'imbalanced';
  }

  // Select desbloqueios
  const desbloqueioCount = Math.min(4, Math.floor(doshaBalance / 25) + 1);
  const desbloqueios = desbloqueioPool
    .sort(() => Math.random() - 0.5)
    .slice(0, desbloqueioCount);

  // Remove duplicates
  const uniqueDesbloqueios: string[] = [];
  for (const db of desbloqueios) {
    if (!uniqueDesbloqueios.includes(db)) {
      uniqueDesbloqueios.push(db);
    }
  }

  return {
    practiceId,
    completed: true,
    doshaBalance,
    primaryDosha,
    secondaryDosha,
    recommendations,
    treatments,
    seasonalAdvice: seasonalAdviceList,
    desbloqueios: uniqueDesbloqueios,
    state,
  };
}
