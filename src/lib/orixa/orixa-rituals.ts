/**
 * Orixá Rituals Module
 * Defines religious rituals and ceremonies for each Orixá
 */

export type RitualType = 
  | 'offfering'
  | 'prayer'
  | 'celebration'
  | 'initiation'
  | 'cleansing'
  | 'consultation';

export interface Ritual {
  id: string;
  orixaId: string;
  name: string;
  type: RitualType;
  description: string;
  frequency: string;
  offerings?: string[];
  elements?: string[];
  steps: string[];
}

const ORIXA_RITUALS: Ritual[] = [
  // Oxum Rituals
  {
    id: 'oxum-offering-1',
    orixaId: 'oxum',
    name: 'Xaré de Oxum',
    type: 'offfering',
    description: 'Oferenda de doces, mel e água doce para Oxum',
    frequency: 'Sábado',
    offerings: ['mel', 'doces', 'água doce', 'flores amarelas'],
    elements: ['espelho', 'pente de osso', 'colares'],
    steps: [
      'Preparar olocal com pano amarelo',
      'Colocar imagem de Oxum',
      'Oferecer mel e doces',
      'Despejar água doce lentamente',
      'Acentar pontos de axé',
    ],
  },
  {
    id: 'oxum-prayer-1',
    orixaId: 'oxum',
    name: 'Oração a Oxum',
    type: 'prayer',
    description: 'Oração para pedir proteção e amor',
    frequency: 'Diária',
    steps: [
      'Acender vela amarela',
      'Recitar ladainha de Oxum',
      'Pedir a proteção da mãe das águas',
    ],
  },

  // Oxóssi Rituals
  {
    id: 'oxossi-offering-1',
    orixaId: 'oxossi',
    name: 'Oferenda do Caçador',
    type: 'offfering',
    description: 'Oferenda para Oxóssi pedir abundância',
    frequency: 'Quinta-feira',
    offerings: ['fumagem', 'acúcar mascavo', 'cachaça', 'flores verdes'],
    elements: ['arco', 'flechas', 'capa de caça'],
    steps: [
      'Montar altar no mato ou ambiente natural',
      'Colocar flecha apontando para o orixá',
      'Oferecer fumagem e aguardente',
      'Pedir fartura e conhecimento',
    ],
  },
  {
    id: 'oxossi-celebration-1',
    orixaId: 'oxossi',
    name: 'Festividade de Oxóssi',
    type: 'celebration',
    description: 'Celebrações anuais em honra ao caçador',
    frequency: 'Anual (26 de dezembro)',
    steps: [
      'Preparar alimentação especial',
      'Realizar cânticos dedicados',
      'Dançar o jongo',
    ],
  },

  // Iemanjá Rituals
  {
    id: 'iemanja-offering-1',
    orixaId: 'iemanja',
    name: 'Oferenda a Iemanjá',
    type: 'offfering',
    description: 'Oferenda para a rainha do mar',
    frequency: '15 de agosto e 31 de dezembro',
    offerings: ['espelhos', 'colares', 'água do mar', 'flores brancas', 'perfume'],
    elements: ['barco decorado', 'espelhos', 'flores'],
    steps: [
      'Montar presente em prato branco',
      'Levar à beira do mar',
      'Oferecer com devoção',
      'Solicitar proteção da família',
    ],
  },
  {
    id: 'iemanja-cleansing-1',
    orixaId: 'iemanja',
    name: 'Limpa de Iemanjá',
    type: 'cleansing',
    description: 'Ritual de limpeza espiritual',
    frequency: 'Quando necessário',
    elements: ['água do mar', 'sal grosso', 'flores brancas'],
    steps: [
      'Misturar água do mar com sal',
      'Banhar o iniciado',
      'Pedir limpeza de energias negativas',
      'Enxaguar com água doce',
    ],
  },

  // Ogum Rituals
  {
    id: 'ogum-offering-1',
    orixaId: 'ogum',
    name: 'Sangue de Ogum',
    type: 'offfering',
    description: 'Oferenda para abrir caminhos',
    frequency: 'Terça-feira',
    offerings: ['sangue de animal', 'ferradura', 'faca', 'cachaça'],
    elements: ['ferradura', 'facas', 'pregos', 'correntes'],
    steps: [
      'Montar altar com Objetos de ferro',
      'Oferecer bebida',
      'Pedir coragem e abertura de caminhos',
    ],
  },
  {
    id: 'ogum-cleansing-1',
    orixaId: 'ogum',
    name: 'Amarração de Ogum',
    type: 'cleansing',
    description: 'Proteção e amarração de energias',
    frequency: 'Quando necessário',
    elements: ['correntes', 'cabos de faca', 'barras de ferro'],
    steps: [
      'Amarrar os elementos',
      'Consagrar com saliva',
      'Usar como proteção pessoal',
    ],
  },

  // Xangô Rituals
  {
    id: 'xango-offering-1',
    orixaId: 'xango',
    name: 'Oferenda de Xangô',
    type: 'offfering',
    description: 'Oferenda ao deus do trovão',
    frequency: 'Quarta-feira e sábado',
    offerings: ['pão', 'cachaça', ' fumagem de charuto', 'palha'],
    elements: ['pedra de raio', 'machado', 'balança'],
    steps: [
      'Acender fogueira com palha seca',
      'Colocar pedras próximas ao fogo',
      'Oferecer cachaça e pão',
      'Pedir justiça e equilíbrio',
    ],
  },
  {
    id: 'xango-prayer-1',
    orixaId: 'xango',
    name: 'Rogação a Xangô',
    type: 'prayer',
    description: 'Rogação para pedir justiça',
    frequency: 'Diária',
    steps: [
      'Levantar os braços ao céu',
      'Recitar orações de justiça',
      'Pedir equilíbrio nas decisões',
    ],
  },

  // Nanã Rituals
  {
    id: 'nana-offering-1',
    orixaId: 'nana',
    name: 'Oferenda a Nanã',
    type: 'offfering',
    description: 'Saudação a ancestrais e elders',
    frequency: 'Domingo',
    offerings: ['quiabo', 'farinha d\'água', 'água de anod', 'flores roxas'],
    elements: ['urumbeba', 'pano roxo', 'barro'],
    steps: [
      'Preparar oferenda com quiabo',
      'Colocar em prato de barro',
      'Oferecer à entidade',
      'Pedir sabedoria e humildade',
    ],
  },

  // Obá Rituals
  {
    id: 'oba-offering-1',
    orixaId: 'oba',
    name: 'Oferenda de Obá',
    type: 'offfering',
    description: 'Oferenda à guerreira do amor',
    frequency: 'Sexta-feira',
    offerings: ['milho', 'cará', ' dendê', 'flores vermelhas'],
    elements: ['panela de barro', 'faca de corte'],
    steps: [
      'Preparar comida com dendê',
      'Oferecer com devoção',
      'Pedir fidelidade e amor',
    ],
  },

  // Ossaim Rituals
  {
    id: 'ossaim-offering-1',
    orixaId: 'ossaim',
    name: 'Ervas de Ossaim',
    type: 'offfering',
    description: 'Oferenda do mestre das plantas',
    frequency: 'Segunda-feira',
    offerings: ['ervas frescas', 'folhas sagradas', 'raízes'],
    elements: ['mala', 'folhas variadas', 'raízes'],
    steps: [
      'Coletar ervas ao amanhecer',
      'Consagrar com ebó',
      'Usar para cura e proteção',
    ],
  },
  {
    id: 'ossaim-cleansing-1',
    orixaId: 'ossaim',
    name: 'Banho de Ervas',
    type: 'cleansing',
    description: 'Ritual de cura com plantas sagradas',
    frequency: 'Quando necessário',
    elements: ['cinco ervas sagradas', 'água de lluvia'],
    steps: [
      'Colher ervas ao amanhecer',
      'Ferver em água pura',
      'Coar e banhar o paciente',
      'Descansar e meditar',
    ],
  },

  // Logun-Edé Rituals
  {
    id: 'logun-ede-offering-1',
    orixaId: 'logun-ede',
    name: 'Oferenda do Duplo Caminho',
    type: 'offfering',
    description: 'Ritual de equilíbrio entre águas e mato',
    frequency: 'Quarta-feira',
    offerings: ['peixes', 'caça', 'frutas', 'flores mistas'],
    elements: ['rede', 'arco', 'flores azuis e verdes'],
    steps: [
      'Combinar elementos aquáticos e terrestres',
      'Oferecer ao orixá de duas naturezas',
      'Pedir equilíbrio na vida',
    ],
  },

  // Ewa Rituals
  {
    id: 'ewa-offering-1',
    orixaId: 'ewa',
    name: 'Oferenda a Ewa',
    type: 'offfering',
    description: 'Oferenda para beleza e charme',
    frequency: 'Sexta-feira',
    offerings: ['perfume', 'cosméticos', 'flores rosadas', 'doces'],
    elements: ['espelho', 'perfume', 'flores'],
    steps: [
      'Preparar oferenda perfumada',
      'Usar espelho sagrado',
      'Pedir beleza e sorte',
    ],
  },

  // Oxumaré Rituals
  {
    id: 'oxumare-celebration-1',
    orixaId: 'oxumare',
    name: 'Festividade do Arco-íris',
    type: 'celebration',
    description: 'Celebrações em honra aos ciclos',
    frequency: 'Equinócios e solstícios',
    elements: ['obé', 'cabaça', 'flores coloridas'],
    steps: [
      'Montar altar com arco-íris de flores',
      'Dançar em espiral',
      'Celebrar a renovação dos ciclos',
    ],
  },

  // Obaluaiê Rituals
  {
    id: 'obaluaiye-offering-1',
    orixaId: 'obaluaiye',
    name: 'Sahade de Obaluaiê',
    type: 'offfering',
    description: 'Ritual de cura e transformação',
    frequency: 'Quando necessário',
    offerings: ['pamonha', 'farinha de mandioca', 'galinha preta'],
    elements: ['pano surrado', 'vara', 'cabaça'],
    steps: [
      'Preparar oferenda simples',
      'Consagrar com rezas',
      'Pedir cura e proteção da peste',
    ],
  },
];

export function getRituals(): Ritual[] {
  return ORIXA_RITUALS;
}

function getRitualsByOrixa(orixaId: string): Ritual[] {
  return ORIXA_RITUALS.filter((ritual) => ritual.orixaId === orixaId);
}

function getRitualsByType(type: RitualType): Ritual[] {
  return ORIXA_RITUALS.filter((ritual) => ritual.type === type);
}

function getRitualById(id: string): Ritual | undefined {
  return ORIXA_RITUALS.find((ritual) => ritual.id === id);
}