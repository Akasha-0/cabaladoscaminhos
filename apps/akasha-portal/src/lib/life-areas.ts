/**
 * Áreas da vida para recomendações do agente
 *
 * STUB: Implementação real virá do Grimório
 */

export type LifeAreaId =
  | 'financas'
  | 'carreira'
  | 'relacionamentos'
  | 'saude'
  | 'espiritualidade'
  | 'criatividade'
  | 'aprendizado'
  | 'familia'
  | 'amigos'
  | 'purpose';

export interface OrixaInfo {
  primary: string[];
  secondary?: string[];
}

export interface AstrologyInfo {
  planets: string[];
  signs?: string[];
}

export interface LifeArea {
  id: LifeAreaId;
  name: string;
  description: string;
  keywords: string[];
  emoji: string;
  orixa: OrixaInfo;
  astrology: AstrologyInfo;
}

export const LIFE_AREAS: LifeArea[] = [
  {
    id: 'financas',
    name: 'Finanças',
    description: 'Dinheiro, abundância, prosperidade',
    keywords: ['dinheiro', 'prosperidade', 'abundância'],
    emoji: '💰',
    orixa: { primary: ['Oxum'] },
    astrology: { planets: ['Venus'] },
  },
  {
    id: 'carreira',
    name: 'Carreira',
    description: 'Trabalho, propósito profissional',
    keywords: ['trabalho', 'profissão', 'vocação'],
    emoji: '💼',
    orixa: { primary: ['Oxumaré'] },
    astrology: { planets: ['Saturno'] },
  },
  {
    id: 'relacionamentos',
    name: 'Relacionamentos',
    description: 'Amor, parcerias, conexões',
    keywords: ['amor', 'parceria', 'relação'],
    emoji: '❤️',
    orixa: { primary: ['Iansã'] },
    astrology: { planets: ['Venus', 'Marte'] },
  },
  {
    id: 'saude',
    name: 'Saúde',
    description: 'Corpo, bem-estar, energia',
    keywords: ['saúde', 'corpo', 'vitalidade'],
    emoji: '🏥',
    orixa: { primary: ['Oxum'] },
    astrology: { planets: ['Sol'] },
  },
  {
    id: 'espiritualidade',
    name: 'Espiritualidade',
    description: 'Crescimento espiritual, propósito de vida',
    keywords: ['alma', 'propósito', 'crescimento'],
    emoji: '🙏',
    orixa: { primary: ['Xangô'] },
    astrology: { planets: ['Júpiter'] },
  },
  {
    id: 'criatividade',
    name: 'Criatividade',
    description: 'Arte, expressão, inovação',
    keywords: ['arte', 'criação', 'expressão'],
    emoji: '🎨',
    orixa: { primary: ['Iemanjá'] },
    astrology: { planets: ['Netuno'] },
  },
  {
    id: 'aprendizado',
    name: 'Aprendizado',
    description: 'Estudos, conhecimento, sabedoria',
    keywords: ['estudo', 'conhecimento', 'sabedoria'],
    emoji: '📚',
    orixa: { primary: ['Oxalá'] },
    astrology: { planets: ['Mercúrio'] },
  },
  {
    id: 'familia',
    name: 'Família',
    description: 'Lar, ancestrais, raízes',
    keywords: ['lar', 'ancestrais', 'família'],
    emoji: '🏠',
    orixa: { primary: ['Iemanjá'] },
    astrology: { planets: ['Lua'] },
  },
  {
    id: 'amigos',
    name: 'Amigos',
    description: 'Comunidade, rede social',
    keywords: ['amizade', 'comunidade', 'social'],
    emoji: '👥',
    orixa: { primary: ['Oxum'] },
    astrology: { planets: ['Vênus'] },
  },
  {
    id: 'purpose',
    name: 'Propósito',
    description: 'Missão de vida, vocação',
    keywords: ['missão', 'destino', 'chamado'],
    emoji: '⭐',
    orixa: { primary: ['Oxalá'] },
    astrology: { planets: ['Sol'] },
  },
];
