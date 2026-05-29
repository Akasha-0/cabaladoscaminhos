// @ts-nocheck
// SKIP_LINT

/**
 * Busca Data Module
 * Search and lookup data for the Cabala dos Caminhos system
 */

export interface BuscaCategory {
  id: string;
  name: string;
  description: string;
  keywords: string[];
  filters: string[];
}

export interface BuscaResult {
  id: string;
  type: string;
  title: string;
  description: string;
  relevance: number;
  category: string;
  tags: string[];
}

export interface BuscaFilter {
  id: string;
  label: string;
  type: 'text' | 'select' | 'range' | 'boolean';
  options?: string[];
  defaultValue?: string | number | boolean;
}

const BUSCA_DATA = {
  categories: [
    {
      id: 'orixa',
      name: 'Orixás',
      description: 'Busca por orixás, entidades e forças espirituais',
      keywords: ['orixá', 'santo', 'axé', 'mediunidade', 'candomblé', 'umbanda'],
      filters: ['elemento', 'genero', 'caminho']
    },
    {
      id: 'meji',
      name: 'Meji',
      description: 'Busca por mensagens divinatórias e odus',
      keywords: ['meji', 'odu', 'divinação', 'oráculo', 'presságio'],
      filters: ['tipo', 'tema', 'interpretacao']
    },
    {
      id: 'ritual',
      name: 'Rituais',
      description: 'Busca por práticas rituais e espiritualidade',
      keywords: ['ritual', 'ebó', 'oferecimento', ' cleansing', 'proteção'],
      filters: ['finalidade', 'frequencia', 'dificuldade']
    },
    {
      id: 'pratica',
      name: 'Práticas',
      description: 'Busca por práticas espirituais e meditativas',
      keywords: ['meditação', 'rezar', 'afirmação', 'gratidão', 'intenção'],
      filters: ['duracao', 'nivel', 'categoria']
    },
    {
      id: 'educacao',
      name: 'Educação',
      description: 'Busca por conteúdo educacional espiritual',
      keywords: ['aprender', 'estudo', 'história', 'tradição', 'cultura'],
      filters: ['nivel', 'formato', 'topico']
    },
    {
      id: 'saude',
      name: 'Saúde e Bem-estar',
      description: 'Busca por práticas de saúde holística',
      keywords: ['saúde', 'wellness', 'cura', 'equilíbrio', 'vitalidade'],
      filters: ['categoria', 'intensidade', 'foco']
    }
  ] as BuscaCategory[],

  recentSearches: [
    'Oxum saúde financeira',
    'Ritual de proteção IEwá',
    'Meditação de благодарение',
    'Odu Ogbe significado',
    'Caminho de Oxalá'
  ] as string[],

  filters: [
    {
      id: 'tipo',
      label: 'Tipo de Conteúdo',
      type: 'select',
      options: ['Todos', 'Orixá', 'Meji', 'Ritual', 'Prática', 'Artigo']
    },
    {
      id: 'categoria',
      label: 'Categoria',
      type: 'select',
      options: ['Todas', 'Cura', 'Proteção', 'Prosperidade', 'Amor', 'Sabedoria']
    },
    {
      id: 'nivel',
      label: 'Nível de Experiência',
      type: 'select',
      options: ['Todos', 'Iniciante', 'Intermediário', 'Avançado']
    }
  ] as BuscaFilter[],

  suggestions: {
    orixa: ['Oxum', 'Ogum', 'Iemanjá', 'Oxossi', 'Xangô', 'Iansã'],
    meji: ['Ogbe', 'Eji', 'Ogiou', 'Iwori', 'Ocha', 'Obara'],
    ritual: ['Ebó', 'Xirê', 'Bori', 'Dogão', 'Tambor', 'Canto'],
    pratica: ['Meditação', 'Oração', 'Afirmação', 'Visualização', 'Gratidão']
  }
};

export function getData() {
  return BUSCA_DATA;
}

export default getData;