// @ts-nocheck
// SKIP_LINT

/**
 * Acessibilidade Data Module
 * Spiritual accessibility data for inclusive practices in the Afro-Brazilian tradition
 */

export interface AccessibilityTool {
  id: string;
  name: string;
  category: string;
  description: string;
  adaptations: string[];
  associatedOrixa: string;
  element: string;
  benefits: string[];
  usageInstructions: string[];
}

export interface AccessibilityPractice {
  id: string;
  name: string;
  category: string;
  description: string;
  forDisability: string[];
  modifications: string[];
  associatedOrixa: string;
  element: string;
  spiritualBenefits: string[];
  practicalSteps: string[];
}

export interface AccessibilityRitual {
  id: string;
  name: string;
  purpose: string;
  accessibilityFeatures: string[];
  forDisability: string[];
  adaptationDetails: string[];
  spiritualAlignment: string[];
}

const ACESSIBILIDADE_DATA = {
  tools: [
    {
      id: 'auditory-aid',
      name: 'Guia Auditivo Espiritual',
      category: 'auditory',
      description: 'Dispositivo de assistência para práticas que requerem percepção sonora',
      adaptations: [
        'Modo vibração para ausência de som',
        'Amplificação tátil',
        'Conexão com dispositivos auditivos',
        'Indicadores visuais sincronizados'
      ],
      associatedOrixa: 'Iemanjá',
      element: 'água',
      benefits: [
        'Inclusão em rituais sonoros',
        'Percepção de frecuencias sagradas',
        'Conexão com batidas ritualísticas',
        'Participação em cânticos'
      ],
      usageInstructions: [
        'Ative o modo vibração',
        'Posicione na pele para melhor percepção tátil',
        'Sincronize com o ritmo dos Tambores',
        'Ajuste a sensibilidade conforme necessário'
      ]
    },
    {
      id: 'visual-aid',
      name: 'Alto Contraste Ritual',
      category: 'visual',
      description: 'Kit de alto contraste para identificação de elementos sagrados',
      adaptations: [
        'Cartões em Braille com descrições táteis',
        'Marcadores táteis para velas e objetos',
        'Guias de contraste para identificação de cores de orixás',
        'Marcadores em relevo para círculos ritualísticos'
      ],
      associatedOrixa: 'Oxum',
      element: 'água doce',
      benefits: [
        'Identificação独立的de objetos sagrados',
        'Participação autônoma em rituais',
        'Localização precisa de elementos',
        'Independência na prática espiritual'
      ],
      usageInstructions: [
        'Posicione os marcadores conforme o layout do altar',
        'Use cartões em Braille para referência',
        'Verifique o contraste das superfícies',
        'Comunique qualquer necessidade de ajuste'
      ]
    },
    {
      id: 'motor-aid',
      name: 'Adaptador de Movimento Sagrado',
      category: 'motor',
      description: 'Dispositivo para auxiliar movimentos ritualísticos limitados',
      adaptations: [
        'Apoios ajustáveis para prostração',
        'Extensores para acendimento de velas',
        'Cadeiras adaptadas para posição ritual',
        'Óculos的保护para movimentos específicos'
      ],
      associatedOrixa: 'Ogum',
      element: 'ferro',
      benefits: [
        'Execução de movimentos sagrados',
        'Participação em procissões',
        'Acesso a altares elevados',
        'Realização de oferendas com dignidade'
      ],
      usageInstructions: [
        'Ajuste os apoios conforme necessidade individual',
        'Posicione-se com conforto antes de iniciar',
        'Use extensores para alcançar elementos distantes',
        'Comunique limitações ao facilitator'
      ]
    },
    {
      id: 'cognitive-aid',
      name: 'Guia Ritual Visual Simplificado',
      category: 'cognitive',
      description: 'Materiais de apoio para práticas que requerem memória ou sequência complexo',
      adaptations: [
        'Cards visuais com sequência de passos',
        ' cronogramas 图文并茂',
        'Alertas táteis para transições',
        'Repetidores de instrução oral'
      ],
      associatedOrixa: 'Orunmila',
      element: 'éter',
      benefits: [
        'Participação em rituais complexos',
        'Segurança durante a prática',
        'Aprendizado gradual de sequência',
        'Redução de ansiedade Ritualística'
      ],
      usageInstructions: [
        'Revise os cartões antes de iniciar',
        'Siga cada passo com o apoio visual',
        'Use alertas táteis para transições',
        'Pare e recomece quan necessário'
      ]
    },
    {
      id: 'sensory-aid',
      name: 'Kit de Estímulo Multissensorial',
      category: 'sensory',
      description: 'Conjunto de estímulos para experiências sensoriais alternativas',
      adaptations: [
        'Texturas sagradas para toque',
        'Aromas em bastão para olfato',
        'Vibrações para percepção de som',
        'Sabores rituais para gustação'
      ],
      associatedOrixa: 'Omolu',
      element: 'terra',
      benefits: [
        'Experiência completa de rituais',
        'Conexão através de sentidos alternativos',
        'Memória sensorial de práticas',
        'Participação sensorial plena'
      ],
      usageInstructions: [
        'Explore cada textura com atenção',
        'Utilize aromas para identificação de orixás',
        'Sinta vibrações em conexão com tambores',
        'Deguste oferendas alimentares quando apropriado'
      ]
    }
  ] as AccessibilityTool[],

  practices: [
    {
      id: 'accessible-prayer',
      name: 'Oração Adaptada',
      category: 'spiritual',
      description: 'Prática de oração adaptada para diferentes necessidades',
      forDisability: ['visual', 'auditiva', 'motora', 'cognitiva'],
      modifications: [
        'Versão em Braille ou audível',
        'Posturas alternativas para prostração',
        'Tempo estendido para memorização',
        'Linguagem simplificada ou ampliada'
      ],
      associatedOrixa: 'Obatalá',
      element: 'algodão',
      spiritualBenefits: [
        'Conexão direta com o divino',
        'Comunicação com orixás',
        'Purificação da consciência',
        'Alinhamento espiritual'
      ],
      practicalSteps: [
        'Escolha uma postura confortável',
        'Selecione o formato de oração adequado',
        'Pratique em ambiente tranquilo',
        'Repita com frequência adaptada'
      ]
    },
    {
      id: 'accessible-meditation',
      name: 'Meditação Inclusiva',
      category: 'mental',
      description: 'Técnica de meditação adaptada para todos os corpos e mentes',
      forDisability: ['motora', 'sensorial', 'cognitiva'],
      modifications: [
        'Meditação em cadeira ou deitado',
        'Foco em sensações táteis em vez de visuais',
        'Instruções sonoras em vez de caminhamento',
        'Sessões mais curtas com repetição'
      ],
      associatedOrixa: 'Orunmila',
      element: 'éter',
      spiritualBenefits: [
        'Quietude mental',
        'Clareza espiritual',
        'Intuição aprofundada',
        'Paz interior'
      ],
      practicalSteps: [
        'Encontre uma posição confortável',
        'Feche os olhos ou use venda',
        'Concentre-se na respiração ou sensation',
        'Permaneça pelo tempo indicado'
      ]
    },
    {
      id: 'accessible-offering',
      name: 'Oferenda Adaptada',
      category: 'ritual',
      description: 'Ritual de oferenda com adaptações para diferentes habilidades',
      forDisability: ['motora', 'visual', 'tátil'],
      modifications: [
        'Oferendas em posições acessíveis',
        'Uso de dispositivos de alcance',
        'Guias táteis para identificação de items',
        'Presentation alternativa em bandeja'
      ],
      associatedOrixa: 'Oxum',
      element: 'água',
      spiritualBenefits: [
        'Ativação de axé',
        'Agradecimento aos orixás',
        'Renovação de compromissos',
        'Proteção espiritual'
      ],
      practicalSteps: [
        'Selecione a oferenda adequada',
        'Prepare o espaço com adaptações',
        'Execute com помощь de dispositivos se necessário',
        'Acompanhe o ritual com intenção'
      ]
    },
    {
      id: 'accessible-bath',
      name: 'Banha Adaptado',
      category: 'purification',
      description: 'Ritual de banho sagrado com accommodations de accessibility',
      forDisability: ['motora', 'visual', 'sensorial'],
      modifications: [
        'Assistente para apoio físico',
        'Água em temperatura controlada',
        'Aromaterapia para orientação olfativa',
        'Seguro para banheira ou cadeira de banho'
      ],
      associatedOrixa: 'Iemanjá',
      element: 'água',
      spiritualBenefits: [
        'Purificação corporal',
        'Renovação energética',
        'Proteção contra negativity',
        'Conexão com as águas sagradas'
      ],
      practicalSteps: [
        'Prepare a água com ervas sagradas',
        'Verifique segura e temperatura',
        'Permaneça o tempo recomendado',
        'Seque-se com pano branco limpo'
      ]
    },
    {
      id: 'accessible-drum',
      name: 'Tambor Adaptado',
      category: 'musical',
      description: 'Prática de tambor para pessoas com diferentes habilidades motoras',
      forDisability: ['motora', 'auditiva', 'tátil'],
      modifications: [
        'Baquetinha leve para pessoas com força limitada',
        'Patches táteis para pessoas surdas',
        'Tambor vibratório para pessoas com déficits auditivos',
        'Suporte para ajuste de braço e mão'
      ],
      associatedOrixa: 'Ogum',
      element: 'ferro',
      spiritualBenefits: [
        'Conexão ancestral',
        'Espírito de batalha e proteção',
        'Energia vital',
        'Comunicação com Ogun'
      ],
      practicalSteps: [
        'Ajuste o tambor e baqueta conforme necessidade',
        'Experimente diferentes temperaturas e texturas',
        'Sinta as vibrações no corpo',
        'Participe do ritmo com seu corpo'
      ]
    }
  ] as AccessibilityPractice[],

  rituals: [
    {
      id: 'inclusive-cleansing',
      name: 'Limppeza Inclusiva',
      purpose: 'Purificação espiritual adaptada para pessoas com diferentes habilidades',
      accessibilityFeatures: [
        'Roteiro visual e tátil',
        'Assistente dedicado',
        'Tempo flexível',
        'Opções de água quente e fria',
        'Participação sentada ou em pé'
      ],
      forDisability: ['motora', 'visual', 'sensorial'],
      adaptationDetails: [
        'Uso de marcador tátil para início do ritual',
        'Água em jarra com alça adaptada',
        'Cumprimimentos verbais para each step',
        'Opção de banho de assento para pessoas com dificuldade em pé'
      ],
      spiritualAlignment: ['Iemanjá', 'Oxum', 'Omolu']
    },
    {
      id: 'accessible-altar-building',
      name: 'Montagem de Altar Acessível',
      purpose: 'Construção de altar com inclusão total',
      accessibilityFeatures: [
        'Altura ajustável da mesa',
        'Ferramentas de alcance',
        'Iluminação de contraste',
        'Organização spatial clara',
        'Apoio físico disponível'
      ],
      forDisability: ['motora', 'visual', 'tátil'],
      adaptationDetails: [
        'Mesa em altura de cadeira de rodas',
        'Pinças e suportes para posicionamento',
        'Luz de LED brilhante para identificar items',
        'Mapa tactile do layout do altar'
      ],
      spiritualAlignment: ['Oxum', 'Orunmila', 'Obatalá']
    },
    {
      id: 'adaptive-initiation',
      name: 'Iniciação Adaptada',
      purpose: 'Cerimônia de iniciação com accommodations completas',
      accessibilityFeatures: [
        'Avaliação individual prévia',
        'Plano personalizado',
        'Equipe de apoio treinada',
        'Tempo de descanso flexível',
        'Participação de familiares'
      ],
      forDisability: ['todas as categorías'],
      adaptationDetails: [
        'Avaliação de necessidades específicas',
        'Modificações documentadas e aprovadas',
        'Apoio constants com consent',
        'Adaptação de instrumentos e vestimentas',
        'Comunicação em formato acessível'
      ],
      spiritualAlignment: ['Obatalá', 'Iemanjá', 'Ogum', 'Orunmila']
    },
    {
      id: 'inclusive-greeting',
      name: 'Saudação Inclusiva',
      purpose: 'Cumprimento ritual adaptado para pessoas com diferentes mobilidades',
      accessibilityFeatures: [
        'Postura flexível',
        'Versão verbal e gestual',
        'Opção de toque seletivo',
        'Saudação à distância se necessário'
      ],
      forDisability: ['motora', 'sensorial', 'social'],
      adaptationDetails: [
        'Aceno de cabeça como alternativa a prostração',
        'Palavras de saudação em langa simples',
        'Pergunta sobre preferência de toque',
        'Opção de ficar em lugar próprio'
      ],
      spiritualAlignment: ['Obatalá', 'Oxum']
    }
  ] as AccessibilityRitual[]
};

export function getData() {
  return ACESSIBILIDADE_DATA;
}

export default getData;
