// @ts-nocheck
// eslint-disable @typescript-eslint/no-explicit-any

export type BreathworkTechniqueType =
  | 'pranayama'
  | 'coherent'
  | 'alternate-nostril'
  | 'holotropic'
  | 'box-breathing'
  | '4-7-8'
  | 'diaphragmatic'
  | ' Wim Hof'
  | 'tummo'
  | 'energizing';

export type BreathworkIntensity = 'gentle' | 'moderate' | 'dynamic';

export interface BreathingTechnique {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  instructions: string[];
  instructionsEn: string[];
  type: BreathworkTechniqueType;
  intensity: BreathworkIntensity;
  inhaleSeconds: number;
  holdAfterInhaleSeconds: number;
  exhaleSeconds: number;
  holdAfterExhaleSeconds: number;
  cycles: number;
  durationMinutes: number;
  benefits: string[];
  benefitsEn: string[];
  warnings?: string[];
  warningsEn?: string[];
}

export function getTechniques(): BreathingTechnique[] {
  return [
    {
      id: 'box-breathing',
      title: 'Respiração Quadrada',
      titleEn: 'Box Breathing',
      description: 'Técnica simples de 4 fases iguais para calma e foco mental.',
      descriptionEn: 'Simple 4-phase equal technique for calm and mental focus.',
      instructions: [
        'Sente-se em posição confortável com a coluna ereta',
        'Inspire pelo nariz contando até 4',
        'Segure o ar contando até 4',
        'Expire pela boca contando até 4',
        'Segure os pulmões vazios contando até 4',
        'Repita pelo número desejado de ciclos',
      ],
      instructionsEn: [
        'Sit in a comfortable position with spine straight',
        'Inhale through nose counting to 4',
        'Hold breath counting to 4',
        'Exhale through mouth counting to 4',
        'Hold empty counting to 4',
        'Repeat for desired number of cycles',
      ],
      type: 'box-breathing',
      intensity: 'gentle',
      inhaleSeconds: 4,
      holdAfterInhaleSeconds: 4,
      exhaleSeconds: 4,
      holdAfterExhaleSeconds: 4,
      cycles: 8,
      durationMinutes: 5,
      benefits: [
        'Reduz ansiedade e estresse',
        'Melhora concentração',
        'Regula o sistema nervoso',
        'Promove clareza mental',
      ],
      benefitsEn: [
        'Reduces anxiety and stress',
        'Improves concentration',
        'Regulates nervous system',
        'Promotes mental clarity',
      ],
      warnings: ['Não segure a respiração se tiver problemas cardiovasculares'],
      warningsEn: ['Do not hold breath if you have cardiovascular issues'],
    },
    {
      id: '4-7-8',
      title: 'Técnica 4-7-8',
      titleEn: '4-7-8 Breathing',
      description: 'Método de relaxamento profundo para induzir sono e calma.',
      descriptionEn: 'Deep relaxation method to induce sleep and calm.',
      instructions: [
        'Posicione a língua tocando o céu da boca atrás dos dentes',
        'Expire completamente pela boca fazendo um som suave',
        'Feche a boca e inspire pelo nariz contando até 4',
        'Segure a respiração contando até 7',
        'Expire completamente pela boca contando até 8',
        'Repita por 4 ciclos inicialmente',
      ],
      instructionsEn: [
        'Place tongue touching the palate behind the front teeth',
        'Exhale completely through mouth making a soft sound',
        'Close mouth and inhale through nose counting to 4',
        'Hold breath counting to 7',
        'Exhale completely through mouth counting to 8',
        'Repeat for 4 cycles initially',
      ],
      type: '4-7-8',
      intensity: 'gentle',
      inhaleSeconds: 4,
      holdAfterInhaleSeconds: 7,
      exhaleSeconds: 8,
      holdAfterExhaleSeconds: 0,
      cycles: 4,
      durationMinutes: 3,
      benefits: [
        'Induz relaxamento profundo',
        'Ajuda a dormir mais rápido',
        'Reduz pensamentos ansiosos',
        'Diminui frequência cardíaca',
      ],
      benefitsEn: [
        'Induces deep relaxation',
        'Helps fall asleep faster',
        'Reduces anxious thoughts',
        'Decreases heart rate',
      ],
      warnings: ['Comece com poucos ciclos se sentir tontura'],
      warningsEn: ['Start with few cycles if you feel dizzy'],
    },
    {
      id: 'coherent-breathing',
      title: 'Respiração Coerente',
      titleEn: 'Coherent Breathing',
      description: 'Respiração rítmica de 5 segundos para cada fase, sincronizando coração e mente.',
      descriptionEn: 'Rhythmic 5-second phase breathing, synchronizing heart and mind.',
      instructions: [
        'Sente-se confortavelmente ou deite-se',
        'Respire apenas pelo nariz',
        'Inspire suavemente por 5 segundos',
        'Expire suavemente por 5 segundos',
        'Mantenha o ritmo constante',
        'Continue por 10-20 minutos',
      ],
      instructionsEn: [
        'Sit comfortably or lie down',
        'Breathe only through nose',
        'Inhale smoothly for 5 seconds',
        'Exhale smoothly for 5 seconds',
        'Keep a constant rhythm',
        'Continue for 10-20 minutes',
      ],
      type: 'coherent',
      intensity: 'gentle',
      inhaleSeconds: 5,
      holdAfterInhaleSeconds: 0,
      exhaleSeconds: 5,
      holdAfterExhaleSeconds: 0,
      cycles: 120,
      durationMinutes: 20,
      benefits: [
        'Harmoniza variabilidade da frequência cardíaca',
        'Reduz cortisol',
        'Melhora a saúde cardiovascular',
        'Promove bem-estar geral',
      ],
      benefitsEn: [
        'Harmonizes heart rate variability',
        'Reduces cortisol',
        'Improves cardiovascular health',
        'Promotes overall well-being',
      ],
    },
    {
      id: 'alternate-nostril',
      title: 'Nadi Shodhana',
      titleEn: 'Alternate Nostril Breathing',
      description: 'Técnica yogui de limpeza energética dos canais sutis.',
      descriptionEn: 'Yoga technique for energetic cleansing of subtle channels.',
      instructions: [
        'Sente-se em posição de fácil meditação',
        'Com a mão direita em mudra nasal, feche a narina direita',
        'Inspire pela narina esquerda',
        'Feche a narina esquerda, abra a direita e expire',
        'Inspire pela narina direita',
        'Feche a direita, abra a esquerda e expire',
        'Complete o ciclo alternando as narinas',
      ],
      instructionsEn: [
        'Sit in easy meditation pose',
        'With right hand in nasal mudra, close right nostril',
        'Inhale through left nostril',
        'Close left nostril, open right and exhale',
        'Inhale through right nostril',
        'Close right nostril, open left and exhale',
        'Complete the cycle alternating nostrils',
      ],
      type: 'alternate-nostril',
      intensity: 'gentle',
      inhaleSeconds: 5,
      holdAfterInhaleSeconds: 5,
      exhaleSeconds: 5,
      holdAfterExhaleSeconds: 5,
      cycles: 10,
      durationMinutes: 10,
      benefits: [
        'Equilibra hemisférios cerebrais',
        'Reduz estresse e ansiedade',
        'Melhora função respiratória',
        'Promove equilíbrio energético',
      ],
      benefitsEn: [
        'Balances brain hemispheres',
        'Reduces stress and anxiety',
        'Improves respiratory function',
        'Promotes energetic balance',
      ],
    },
    {
      id: 'holotropic',
      title: 'Respira Holotrópica',
      titleEn: 'Holotropic Breathing',
      description: 'Técnica de respiração profunda para estados expandidos de consciência.',
      descriptionEn: 'Deep breathing technique for expanded states of consciousness.',
      instructions: [
        'Deite-se confortavelmente',
        'Respire profundamente pelo nariz',
        'Mantenha fluxo contínuo de ar sem pausas',
        'Permita que a respiração se intensifique naturalmente',
        'Permaneça presente com as sensações',
        'Reduza gradualmente a intensidade após 20-30 minutos',
        'Descanse em silêncio por 15 minutos',
      ],
      instructionsEn: [
        'Lie down comfortably',
        'Breathe deeply through the nose',
        'Maintain continuous air flow without pauses',
        'Allow breathing to intensify naturally',
        'Stay present with sensations',
        'Gradually reduce intensity after 20-30 minutes',
        'Rest in silence for 15 minutes',
      ],
      type: 'holotropic',
      intensity: 'dynamic',
      inhaleSeconds: 3,
      holdAfterInhaleSeconds: 0,
      exhaleSeconds: 3,
      holdAfterExhaleSeconds: 0,
      cycles: 300,
      durationMinutes: 45,
      benefits: [
        'Facilita release emocional',
        'Expande consciência',
        'Acessa estados alterados',
        'Promove integração corpo-mente',
      ],
      benefitsEn: [
        'Facilitates emotional release',
        'Expands consciousness',
        'Accesses altered states',
        'Promotes body-mind integration',
      ],
      warnings: ['Não pratique sozinho; evite se tiver histórico de convulsões ou transtornos psicológicos graves'],
      warningsEn: ['Do not practice alone; avoid if you have history of seizures or serious psychological disorders'],
    },
    {
      id: 'diaphragmatic',
      title: 'Respiração Diafragmática',
      titleEn: 'Diaphragmatic Breathing',
      description: 'Respiração profunda que ativa o nervo vago para relaxamento profundo.',
      descriptionEn: 'Deep breathing that activates the vagus nerve for deep relaxation.',
      instructions: [
        'Deite-se ou sente-se com as costas apoiadas',
        'Coloque uma mão no peito e outra no abdômen',
        'Inspire lentamente pelo nariz, expandindo o abdômen',
        'O peito deve permanecer relativamente parado',
        'Expire lentamente pelo nariz, contraindo o abdômen',
        'Pratique por 10-15 minutos',
      ],
      instructionsEn: [
        'Lie down or sit with back supported',
        'Place one hand on chest and one on abdomen',
        'Inhale slowly through nose, expanding abdomen',
        'Chest should remain relatively still',
        'Exhale slowly through nose, contracting abdomen',
        'Practice for 10-15 minutes',
      ],
      type: 'diaphragmatic',
      intensity: 'gentle',
      inhaleSeconds: 4,
      holdAfterInhaleSeconds: 2,
      exhaleSeconds: 6,
      holdAfterExhaleSeconds: 2,
      cycles: 20,
      durationMinutes: 12,
      benefits: [
        'Ativa o sistema parassimpático',
        'Reduz pressão arterial',
        'Melhora digestão',
        'Diminui inflamação',
      ],
      benefitsEn: [
        'Activates parasympathetic system',
        'Reduces blood pressure',
        'Improves digestion',
        'Decreases inflammation',
      ],
    },
    {
      id: 'energizing',
      title: 'Respiração Energizante',
      titleEn: 'Energizing Breath',
      description: 'Respiração rápida e curta para aumentar energia e vitalidade.',
      descriptionEn: 'Fast and short breathing to increase energy and vitality.',
      instructions: [
        'Sente-se ereto com ombros relaxados',
        'Inspire e expire pelo nariz em pulsos curtos',
        'Mantenha o abdômen levemente contraído',
        'Faça 30-50 ciclos por minuto',
        'Continue por 1-3 minutos',
        'Respire normalmente e observe a energia',
      ],
      instructionsEn: [
        'Sit upright with shoulders relaxed',
        'Inhale and exhale through nose in short pulses',
        'Keep abdomen slightly contracted',
        'Do 30-50 cycles per minute',
        'Continue for 1-3 minutes',
        'Breathe normally and observe the energy',
      ],
      type: 'energizing',
      intensity: 'dynamic',
      inhaleSeconds: 1,
      holdAfterInhaleSeconds: 0,
      exhaleSeconds: 1,
      holdAfterExhaleSeconds: 0,
      cycles: 100,
      durationMinutes: 2,
      benefits: [
        'Aumenta energia vital',
        'Melhora circulação',
        'Clarifica a mente',
        'Prepara para atividades físicas',
      ],
      benefitsEn: [
        'Increases vital energy',
        'Improves circulation',
        'Clarifies the mind',
        'Prepares for physical activities',
      ],
      warnings: ['Evite se tiver pressão alta, glaucoma ou problemas cardíacos'],
      warningsEn: ['Avoid if you have high blood pressure, glaucoma, or heart problems'],
    },
  ];
}
