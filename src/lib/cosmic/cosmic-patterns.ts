/**
 * Cosmic Patterns - Padrões Cósmicos
 * Padrões astrológicos e cósmicos com propriedades espirituais
 */

export interface CosmicPattern {
  id: string;
  nome: string;
  nomeIngles: string;
  tipo: 'planetary' | 'stellar' | 'galactic' | 'zodiac';
  descricao: string;
  simbolismo: string;
  elementos: string[];
  sefirots: string[];
  planetas: string[];
  signos: string[];
  casas: number[];
  cor: string;
  frequencia: number;
  energia: 'yang' | 'yin' | 'neutral';
}

export const PATTERNS: CosmicPattern[] = [
  {
    id: 'conjuncao-solar',
    nome: 'Conjunção Solar',
    nomeIngles: 'Solar Conjunction',
    tipo: 'stellar',
    descricao: 'Alinhamento planetário com o Sol, representando integração de energia e propósito central.',
    simbolismo: 'Poder pessoal, foco de intenção, renovação solar.',
    elementos: ['Sol', 'planetas em conjunção', 'luz solar intensificada'],
    sefirots: ['Kether', 'Tiferet'],
    planetas: ['Sol'],
    signos: [],
    casas: [1, 5, 9],
    cor: '#FFD700',
    frequencia: 528,
    energia: 'yang',
  },
  {
    id: 'trino-lunar',
    nome: 'Trino Lunar',
    nomeIngles: 'Lunar Trine',
    tipo: 'planetary',
    descricao: 'Aspecto harmonioso entre a Lua e outros corpos celestes, fluxo natural de emoções.',
    simbolismo: 'Harmonia emocional, intuição amplificada, paz interior.',
    elementos: ['Lua', 'água', 'emoção fluida'],
    sefirots: ['Chesed', 'Hod'],
    planetas: ['Lua'],
    signos: ['Câncer', 'Escorpião', 'Peixes'],
    casas: [4, 8, 12],
    cor: '#E6E6FA',
    frequencia: 417,
    energia: 'yin',
  },
  {
    id: 'oposicao-marte-jupiter',
    nome: 'Oposição Marcial-Joviana',
    nomeIngles: 'Mars-Jupiter Opposition',
    tipo: 'planetary',
    descricao: 'Tensão criativa entre ação e expansão, força confrontando sabedoria.',
    simbolismo: 'Desafio para crescimento, energia em transformação, equilibrio de forças.',
    elementos: ['Marte', 'Júpiter', 'tensão dinâmica'],
    sefirots: ['Geburah', 'Chesed'],
    planetas: ['Marte', 'Júpiter'],
    signos: ['Áries', 'Sagitário'],
    casas: [1, 7],
    cor: '#FF4500',
    frequencia: 639,
    energia: 'yang',
  },
  {
    id: 'quadratura-venus-saturno',
    nome: 'Quadratura Vênus-Saturniana',
    nomeIngles: 'Venus-Saturn Square',
    tipo: 'planetary',
    descricao: 'Tensão entre amor e limitação, desafio para expressar-affeto livremente.',
    simbolismo: 'Amadurecimento emocional, superação de obstáculos afetivos, disciplina no amor.',
    elementos: ['Vênus', 'Saturno', 'pedra angular'],
    sefirots: ['Netzach', 'Hod'],
    planetas: ['Vênus', 'Saturno'],
    signos: ['Touro', 'Libra', 'Capricórnio'],
    casas: [2, 6, 10],
    cor: '#9370DB',
    frequencia: 528,
    energia: 'yin',
  },
  {
    id: 'quintil-mercurio-urano',
    nome: 'Quintil Mercúrio-Urano',
    nomeIngles: 'Mercury-Uranus Quintile',
    tipo: 'planetary',
    descricao: 'Inspiração criativa e comunicação inovadora, génio em expressão.',
    simbolismo: 'Inovação mental, descobertas súbitas, criatividade única.',
    elementos: ['Mercúrio', 'Urano', 'raio elétrico'],
    sefirots: ['Hod', 'Yesod'],
    planetas: ['Mercúrio', 'Urano'],
    signos: ['Gêmeos', 'Aquário'],
    casas: [3, 11],
    cor: '#00CED1',
    frequencia: 741,
    energia: 'yang',
  },
  {
    id: 'gran-trino-agua',
    nome: 'Gran Trino Aquatico',
    nomeIngles: 'Grand Water Trine',
    tipo: 'zodiac',
    descricao: 'Trino entre signos de água criando rio emocional profundo e conexão espiritual.',
    simbolismo: 'Intuição suprema, compaixão profunda, conexão com o divino.',
    elementos: ['Câncer', 'Escorpião', 'Peixes'],
    sefirots: ['Chesed', 'Geburah', 'Tiferet'],
    planetas: [],
    signos: ['Câncer', 'Escorpião', 'Peixes'],
    casas: [4, 8, 12],
    cor: '#4169E1',
    frequencia: 396,
    energia: 'yin',
  },
  {
    id: 'cruce-galactico',
    nome: 'Cruce Galáctico',
    nomeIngles: 'Galactic Cross',
    tipo: 'galactic',
    descricao: 'Alinhamento entre centro galactico e pontos cardeais, portal dimensional.',
    simbolismo: 'Ascensão dimensional, acesso a sabedoria cósmica, transformação radical.',
    elementos: ['Centro Galáctico', 'Eclíptica', 'Linha Galáctica'],
    sefirots: ['Kether', 'Daat'],
    planetas: [],
    signos: [],
    casas: [1, 4, 7, 10],
    cor: '#8B008B',
    frequencia: 963,
    energia: 'neutral',
  },
  {
    id: 'yod-chiron-netuno',
    nome: 'Dedo de Deus Chiron-Netuno',
    nomeIngles: 'Chiron-Neptune Yod',
    tipo: 'planetary',
    descricao: 'Padrão de destino com apex emNetuno, cura espiritual profunda.',
    simbolismo: 'Missão de vida, cura kármica, trascendencia.',
    elementos: ['Quíron', 'Netuno', 'apex energético'],
    sefirots: ['Tipharat', 'Malkut'],
    planetas: ['Quíron', 'Netuno'],
    signos: ['Aquário', 'Peixes'],
    casas: [6, 12],
    cor: '#000080',
    frequencia: 432,
    energia: 'yin',
  },
  {
    id: 'sakura-stellar',
    nome: 'Sakura Estelar',
    nomeIngles: 'Stellar Sakura',
    tipo: 'stellar',
    descricao: 'Padrão de florescimento cósmico, desabrochar de consciência.',
    simbolismo: 'Renovação, despertar, beleza efêmera que contém eternidade.',
    elementos: ['Estrelas', 'pétalas cósmicas', 'luz stellar'],
    sefirots: ['Tiferet', ' Netzach'],
    planetas: [],
    signos: [],
    casas: [5, 11],
    cor: '#FFB6C1',
    frequencia: 528,
    energia: 'yang',
  },
  {
    id: 'serpente-enroscada-cosmica',
    nome: 'Serpente Enroscada Cósmica',
    nomeIngles: 'Cosmic Coiled Serpent',
    tipo: 'galactic',
    descricao: 'Padrão helical representand DNA cósmico e conhecimento ancestral.',
    simbolismo: 'Kundalini, sabedoria ancestral, transformação via spine.',
    elementos: ['Espiral', 'DNA', 'serpente enrollada'],
    sefirots: ['Kether', 'Kokh'],
    planetas: [],
    signos: [],
    casas: [1, 6],
    cor: '#32CD32',
    frequencia: 396,
    energia: 'neutral',
  },
];

export function getPatterns(): CosmicPattern[] {
  return [...PATTERNS];
}