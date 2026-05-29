// @ts-nocheck
// SKIP_LINT

/**
 * Wellness Data Module
 * Spiritual wellness and holistic health data for the Cabala dos Caminhos system
 */

export interface WellnessPractice {
  id: string;
  name: string;
  category: string;
  description: string;
  benefits: string[];
  duration: string;
  frequency: string;
  contraindications: string[];
  associatedOrixa: string;
  element: string;
  steps: string[];
}

export interface WellnessRitual {
  id: string;
  name: string;
  purpose: string;
  timeOfDay: string[];
  preparation: string[];
  execution: string[];
  completion: string[];
  spiritualAlignment: string[];
}

export interface WellnessIntention {
  category: string;
  intentions: string[];
  affirmations: string[];
  associatedPractice: string[];
}

const WELLNESS_DATA = {
  practices: [
    {
      id: 'breathing',
      name: 'Respiração Sagrada',
      category: 'respiratory',
      description: 'Técnica ancestral de respiração conectada aos elementos da natureza',
      benefits: ['calma mental', 'energia vital', 'presença', 'centramento'],
      duration: '15 minutos',
      frequency: 'diário',
      contraindications: [],
      associatedOrixa: 'Obatalá',
      element: 'ar',
      steps: [
        'Encontre um espaço tranquilo',
        'Sente-se em posição ereta',
        'Inspire profundamente pelo nariz (4 segundos)',
        'Segure o ar (4 segundos)',
        'Expire pela boca (6 segundos)',
        'Repita por 15 minutos'
      ]
    },
    {
      id: 'meditation',
      name: 'Meditação de Orixá',
      category: 'mental',
      description: 'Meditação guiada para conectar com a energia dos orixás',
      benefits: ['intuição', 'proteção espiritual', 'clareza', 'sabedoria'],
      duration: '30 minutos',
      frequency: 'diário',
      contraindications: [],
      associatedOrixa: 'Orunmila',
      element: 'éter',
      steps: [
        'Desligue dispositivos eletrônicos',
        'Acenda uma vela na cor do orixá',
        'Sente-se confortavelmente',
        'Feche os olhos e respire profundamente',
        'Visualize o orixá de sua escolha',
        'Recite a oração característica',
        'Permaneça em silêncio por 20 minutos',
        'Agradeça e abra os olhos gradualmente'
      ]
    },
    {
      id: 'affirmation',
      name: 'Afirmações Positivas',
      category: 'verbal',
      description: 'Uso de palavras de poder paramanifestar realidade',
      benefits: ['autoconfiança', 'transformação', 'abundância', 'cura'],
      duration: '10 minutos',
      frequency: 'manhã e noite',
      contraindications: [],
      associatedOrixa: 'Oxum',
      element: 'água',
      steps: [
        'Escreva suas intenções positivas',
        'Leia em voz alta com conviction',
        'Visualize o resultado desejado',
        'Sinta a emoção como se já estivesse realizado',
        'Agradeça pela manifestação'
      ]
    },
    {
      id: 'gratitude',
      name: 'Ação de Graças',
      category: 'emotional',
      description: 'Prática de gratidão que alinha com as bênçãos divinas',
      benefits: ['alegria', 'abundância', 'proteção', 'amor'],
      duration: '5 minutos',
      frequency: 'diário',
      contraindications: [],
      associatedOrixa: 'Iemanjá',
      element: 'água',
      steps: [
        'Acorde e antes de levantar',
        'Liste três coisas pelas quais é grato',
        'Sinta gratidão genuína por cada uma',
        'Dedique um momento a Iemanjá',
        'Levante-se abençoado'
      ]
    },
    {
      id: 'movement',
      name: 'Movimento Sagrado',
      category: 'physical',
      description: 'Exercício físico integrado com intention spiritual',
      benefits: ['saúde física', 'energia', 'flexibilidade', 'presença corporal'],
      duration: '45 minutos',
      frequency: '3x por semana',
      contraindications: ['lesões físicas', 'condições cardíacas'],
      associatedOrixa: 'Ogum',
      element: 'ferro',
      steps: [
        'Aquecimento com respiração consciente',
        'Alongamento suave',
        'Movimentos ritualizados (5 minutos)',
        'Exercício cardiovascular moderado',
        'Resfriamento com meditação',
        'Água sagrada para encerrar'
      ]
    },
    {
      id: 'nourishment',
      name: 'Nutrição Consciente',
      category: 'physical',
      description: 'Alimentação sagrada que honra o corpo como templo',
      benefits: ['saúde digestiva', 'energia vital', 'pureza', 'longevidade'],
      duration: 'variável',
      frequency: 'refeições diárias',
      contraindications: [],
      associatedOrixa: 'Oxum',
      element: 'água doce',
      steps: [
        'Ofereça gratidão antes de comer',
        'Coma com presença e consciência',
        'Evite excesso e desperdício',
        'Prefira alimentos naturais e preparo sagrado',
        'Hinode e agradeça após a refeição'
      ]
    }
  ] as WellnessPractice[],

  rituals: [
    {
      id: 'morning cleansing',
      name: 'Limppeza Matinal',
      purpose: 'Purificação do corpo e espaço para novo dia',
      timeOfDay: ['amanhecer'],
      preparation: [
        'Levante antes do sol',
        'Prepare água com folhas sagradas',
        'Separe pano branco limpo'
      ],
      execution: [
        'Banho de folhas (descendo do topo da cabeça)',
        'Limpze de roupas com fumaça de ervas',
        'Aplicar axé nos pontos do corpo'
      ],
      completion: [
        'Vista roupas limpas',
        'Acenda vela branca',
        'Recite oração de proteção'
      ],
      spiritualAlignment: ['Oxum', 'Omolu', 'Ogun']
    },
    {
      id: 'weekly renewal',
      name: 'Renovação Semanal',
      purpose: 'Reset espiritual e físico para novo ciclo',
      timeOfDay: ['domingo amanhecer'],
      preparation: [
        'Jejum parcial desde a noite anterior',
        'Prepare banhos de ervas',
        'Organize espaço sagrado'
      ],
      execution: [
        'Ritual de limpeza (quarta-feira)',
        'Meditação profunda (quinta-feira)',
        'Oferecer sacrifícios (sexta-feira)',
        'Descanso sagrado (sábado)',
        'Celebração (domingo)'
      ],
      completion: [
        'Agradeça pelos aprendizados',
        'Defina intenções para nova semana',
        'Receba bênçãos de Oxum'
      ],
      spiritualAlignment: ['Iemanjá', 'Oxum', 'Orunmila']
    },
    {
      id: 'full moon ceremony',
      name: 'Cerimônia de Lua Cheia',
      purpose: 'Manifestação de intenções sob energia lunar',
      timeOfDay: ['lua cheia noite'],
      preparation: [
        'Pesque água de lua',
        'Prepare Crystais e velas',
        'Organize representação de orixás'
      ],
      execution: [
        'Banho de lua (opcional)',
        'Acenda velas em círculo',
        'Coloque Crystais nas posições cardinais',
        'Medite sobre intenções',
        'Escreva intenções em papel',
        'Enterre o papel na terra'
      ],
      completion: [
        'Agradeça às forças da lua',
        'Pinga água de lua na testa',
        'Pede bênçãos para o ciclo lunar'
      ],
      spiritualAlignment: ['Iemanjá', 'Oxum', 'Logun Ede']
    }
  ] as WellnessRitual[],

  intentions: [
    {
      category: 'physical',
      intentions: [
        'Que meu corpo seja saudável e forte',
        'Que eu tenha energia para realizar meu propósito',
        'Que meus órgãos funcione perfeitamente'
      ],
      affirmations: [
        'Eu honro meu corpo como templo sagrado',
        'Minha saúde é abundante e perfeita',
        'Cada célula do meu corpo vibra com vida'
      ],
      associatedPractice: ['breathing', 'movement', 'nourishment']
    },
    {
      category: 'emotional',
      intentions: [
        'Que meu coração permaneça aberto ao amor',
        'Que eu alcance equilíbrio emocional',
        'Que a paz habitе em minha mente'
      ],
      affirmations: [
        'Eu permito que o amor flua através de mim',
        'Meu coração é forte e compassivo',
        'Eu sou emocionalmente livre'
      ],
      associatedPractice: ['gratitude', 'meditation']
    },
    {
      category: 'spiritual',
      intentions: [
        'Que minha conexão espiritual se approfondе',
        'Que eu recebe bênçãos dos orixás',
        'Que minha intuição se desenvolva'
      ],
      affirmations: [
        'Eu sou divinamente guiado e protegido',
        'Minha alma está alinhada com a luz',
        'Eu recebo sabedoria dos meus ancestrais'
      ],
      associatedPractice: ['meditation', 'affirmation']
    },
    {
      category: 'abundance',
      intentions: [
        'Que a abundância flua em minha vida',
        'Que eu receba oportunidades de crescimento',
        'Que meu trabalho seja reconhecido'
      ],
      affirmations: [
        'A abundância é meu direito divino',
        'Eu mereço prosperidade em todas as áreas',
        'Dinheiro e recursos fluem para mim facilmente'
      ],
      associatedPractice: ['affirmation', 'morning cleansing']
    }
  ] as WellnessIntention[]
};

export function getData() {
  return WELLNESS_DATA;
}

export default getData;