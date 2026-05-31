/**
 * Tarot-Chakra Spiritual Correlation Module
 * Maps Tarot Major Arcana cards to their corresponding chakras, elements,
 * and spiritual meanings based on esoteric traditions and Cabala dos Caminhos
 * hermetic principles.
 */

import type { ChakraName } from './chakra-element';

export type TarotArcano = 
  | 'O Louco'
  | 'O Mago'
  | 'A Sacerdotisa'
  | 'A Imperatriz'
  | 'O Imperador'
  | 'O Hierofante'
  | 'O Carro'
  | 'A Justiça'
  | 'O Eremita'
  | 'A Roda da Fortuna'
  | 'A Força'
  | 'O Enforcado'
  | 'A Morte'
  | 'A Temperança'
  | 'O Diabo'
  | 'A Torre'
  | 'A Estrela'
  | 'A Lua'
  | 'O Sol'
  | 'O Julgamento'
  | 'O Mundo';

export interface TarotChakraMapping {
  /** The Major Arcana card name */
  arcano: TarotArcano;
  /** The card number in the Major Arcana (0-21) */
  numero_carta: number;
  /** The associated chakra */
  chakra: ChakraName;
  /** Chakra number (1-7) */
  chakra_numero: string;
  /** Elemental correspondence */
  elemento: string;
  /** Key spiritual themes */
  temas_espirituais: string[];
  /** Emotional qualities */
  qualidade_emocional: string;
  /** Psychological shadow aspects */
  sombra_psicologica: string;
  /** Affirmation for integration */
  afirmacao: string;
}

/**
 * Complete mapping of Tarot Major Arcana to chakras.
 * Based on esoteric traditions: each Major Arcana card resonates with
 * a specific energy center, representing archetypal energies that can
 * activate, balance, or challenge each chakra.
 */
export const TAROT_CHAKRA_MAPPINGS: Record<TarotArcano, TarotChakraMapping> = {
  'O Louco': {
    arcano: 'O Louco',
    numero_carta: 0,
    chakra: 'Sahasrara',
    chakra_numero: '7º Coroa',
    elemento: 'Éter',
    temas_espirituais: ['Iniciação', 'Liberdade', 'Saudade divina', 'Novo ciclo'],
    qualidade_emocional: 'Liberdade, abandonando o medo do desconhecido',
    sombra_psicologica: 'Irresponsabilidade, evitar consequências',
    afirmacao: 'Eu confio na sabedoria do universo e abraço minha jornada espiritual',
  },

  'O Mago': {
    arcano: 'O Mago',
    numero_carta: 1,
    chakra: 'Sahasrara',
    chakra_numero: '7º Coroa',
    elemento: 'Ar',
    temas_espirituais: ['Manifestação', 'Vontade', 'Habilidade', 'Comunicação'],
    qualidade_emocional: 'Confiança na capacidade de criar a realidade',
    sombra_psicologica: 'Manipulação, uso inadequado do poder',
    afirmacao: 'Eu canalizo a energia divina através de minhas mãos e palavra',
  },

  'A Sacerdotisa': {
    arcano: 'A Sacerdotisa',
    numero_carta: 2,
    chakra: 'Ajna',
    chakra_numero: '6º Terceiro Olho',
    elemento: 'Água',
    temas_espirituais: ['Intuição', 'Mistério', 'Inner voice', 'Sabedoria oculta'],
    qualidade_emocional: 'Escuta interna profunda, paz no silêncio',
    sombra_psicologica: 'Segredos, isolamento, fuga da realidade',
    afirmacao: 'Eu honro minha voz interior e confio em minha sabedoria intuitiva',
  },

  'A Imperatriz': {
    arcano: 'A Imperatriz',
    numero_carta: 3,
    chakra: 'Anahata',
    chakra_numero: '4º Cardíaco',
    elemento: 'Terra',
    temas_espirituais: ['Fertilidade', 'Abundância', 'Amor', 'Criação'],
    qualidade_emocional: 'Amor incondicional, nutrição, acolhimento',
    sombra_psicologica: 'Dependência emocional, sufocamento por afeto',
    afirmacao: 'Eu irradio amor e acolhimento a todos os seres',
  },

  'O Imperador': {
    arcano: 'O Imperador',
    numero_carta: 4,
    chakra: 'Ajna',
    chakra_numero: '6º Terceiro Olho',
    elemento: 'Fogo',
    temas_espirituais: ['Autoridade', 'Estrutura', 'Pai divino', 'Ordem'],
    qualidade_emocional: 'Disciplina, clareza mental, organização',
    sombra_psicologica: 'Rigidez, autoritarismo, controle',
    afirmacao: 'Eu uso minha autoridade com sabedoria e flexibilidade',
  },

  'O Hierofante': {
    arcano: 'O Hierofante',
    numero_carta: 5,
    chakra: 'Vishuddha',
    chakra_numero: '5º Laríngeo',
    elemento: 'Terra',
    temas_espirituais: ['Tradição', 'Ensinamento', 'Espiritualidade institucional', 'Ritual'],
    qualidade_emocional: 'Busca por significado, abertura para ensinamentos',
    sombra_psicologica: 'Dogmatismo, conformidade rígida',
    afirmacao: 'Eu busco sabedoria nas tradições e honro minha própria verdade',
  },

  'O Carro': {
    arcano: 'O Carro',
    numero_carta: 7,
    chakra: 'Manipura',
    chakra_numero: '3º Plexo Solar',
    elemento: 'Fogo',
    temas_espirituais: ['Vitória', 'Determinação', 'Controle da vontade', 'Abertura de caminhos'],
    qualidade_emocional: 'Força de vontade, conquista, disciplina pessoal',
    sombra_psicologica: 'Agressividade, ambição desmedida, orgulho',
    afirmacao: 'Eu dirijo minha vontade com propósito e harmonia',
  },

  'A Justiça': {
    arcano: 'A Justiça',
    numero_carta: 8,
    chakra: 'Vishuddha',
    chakra_numero: '5º Laríngeo',
    elemento: 'Ar',
    temas_espirituais: ['Equilíbrio', 'Causa e efeito', 'Verdade', 'Lei cósmica'],
    qualidade_emocional: 'Discernimento, honestidade, equilíbrio entre luz e sombra',
    sombra_psicologica: 'Rigor excessivo, inflexibilidade, culpa',
    afirmacao: 'Eu ajo com integridade e aceito as consequências de minhas escolhas',
  },

  'O Eremita': {
    arcano: 'O Eremita',
    numero_carta: 9,
    chakra: 'Ajna',
    chakra_numero: '6º Terceiro Olho',
    elemento: 'Terra',
    temas_espirituais: ['Introspecção', 'Iluminação interior', 'Solitude', 'Sabedoria'],
    qualidade_emocional: 'Paz interior, auto-reflexão profunda, paciência',
    sombra_psicologica: 'Isolamento, medo de conexão, solidão autodestrutiva',
    afirmacao: 'Eu encontro luz na escuridão e compartilho minha sabedoria',
  },

  'A Roda da Fortuna': {
    arcano: 'A Roda da Fortuna',
    numero_carta: 10,
    chakra: 'Manipura',
    chakra_numero: '3º Plexo Solar',
    elemento: 'Fogo',
    temas_espirituais: ['Ciclos', 'Destino', 'Sorte', 'Mudança inevitável'],
    qualidade_emocional: 'Adaptação às mudanças, confiança no fluxo da vida',
    sombra_psicologica: 'Dependência da sorte, negar responsabilidade',
    afirmacao: 'Eu aceito os ciclos da vida e aprendo com cada volta da roda',
  },

  'A Força': {
    arcano: 'A Força',
    numero_carta: 11,
    chakra: 'Anahata',
    chakra_numero: '4º Cardíaco',
    elemento: 'Terra',
    temas_espirituais: ['Coragem', 'Compaixão', 'Poder suave', 'Domínio de si'],
    qualidade_emocional: 'Força gentil, autocontrole com amor, bravura compassiva',
    sombra_psicologica: 'Autocrítica severa, fraqueza disfarçada de força',
    afirmacao: 'Eu canalizo minha força interior com amor e compaixão',
  },

  'O Enforcado': {
    arcano: 'O Enforcado',
    numero_carta: 12,
    chakra: 'Sahasrara',
    chakra_numero: '7º Coroa',
    elemento: 'Água',
    temas_espirituais: ['Sacrifício', 'Nova perspectiva', 'Entrega', 'Renúncia'],
    qualidade_emocional: 'Disposição para sacrifício, mudança de perspectiva',
    sombra_psicologica: 'Vitimização, resistir à mudança necessária',
    afirmacao: 'Eu abraço novos pontos de vista e ofereço o que precisa ser libertado',
  },

  'A Morte': {
    arcano: 'A Morte',
    numero_carta: 13,
    chakra: 'Svadhisthana',
    chakra_numero: '2º Sacral',
    elemento: 'Água',
    temas_espirituais: ['Transformação', 'Final de ciclo', 'Renascimento', 'Dissolução'],
    qualidade_emocional: 'Aceitação da impermanência, coragem de deixar morrer o velho',
    sombra_psicologica: 'Medo de mudanças, negar a transformação',
    afirmacao: 'Eu libero o que precisa morrer para renascer em luz',
  },

  'A Temperança': {
    arcano: 'A Temperança',
    numero_carta: 14,
    chakra: 'Svadhisthana',
    chakra_numero: '2º Sacral',
    elemento: 'Fogo',
    temas_espirituais: ['Equilíbrio', 'Paciência', 'Alquimia interior', 'Integração'],
    qualidade_emocional: 'Moderação, harmonia, integração de opostos',
    sombra_psicologica: 'Indiferença, evitar extremos, repressão emocional',
    afirmacao: 'Eu encontro o ponto de equilíbrio entre todos os extremos',
  },

  'O Diabo': {
    arcano: 'O Diabo',
    numero_carta: 15,
    chakra: 'Muladhara',
    chakra_numero: '1º Raiz',
    elemento: 'Terra',
    temas_espirituais: ['Apego', 'Escravidão', 'Materialismo', 'Projeção de sombra'],
    qualidade_emocional: 'Reconhecimento dos apegos, trabalho com a sombra',
    sombra_psicologica: 'Vício, manipulação, negar a própria escuridão',
    afirmacao: 'Eu reconheço minhas correntes e escolho a liberdade',
  },

  'A Torre': {
    arcano: 'A Torre',
    numero_carta: 16,
    chakra: 'Muladhara',
    chakra_numero: '1º Raiz',
    elemento: 'Fogo',
    temas_espirituais: ['Destruição criativa', 'Revelação', 'Mudança abrupta', 'Libertação forçada'],
    qualidade_emocional: 'Coragem diante da crise, aceitação da destruição necessária',
    sombra_psicologica: 'Pânico, resistir à mudança, negar a crise',
    afirmacao: 'Eu aceito que a destruição precede o renascimento',
  },

  'A Estrela': {
    arcano: 'A Estrela',
    numero_carta: 17,
    chakra: 'Anahata',
    chakra_numero: '4º Cardíaco',
    elemento: 'Ar',
    temas_espirituais: ['Esperança', 'Inspiração', 'Maternidade divina', 'Paz'],
    qualidade_emocional: 'Esperança Renovada, cura, confiança no futuro',
    sombra_psicologica: 'Desespero, perder a esperança, autoflagelação',
    affirmacao: 'Eu recebo a luz divina e irradio esperança ao mundo',
  },

  'A Lua': {
    arcano: 'A Lua',
    numero_carta: 18,
    chakra: 'Svadhisthana',
    chakra_numero: '2º Sacral',
    elemento: 'Água',
    temas_espirituais: ['Inconsciente', 'Ilusões', 'Medos', 'Intuição'],
    qualidade_emocional: 'Conexão com o inconsciente, navegação pelos medos',
    sombra_psicologica: 'Ilusão, confusão, medo paralisante',
    afirmacao: 'Eu navego pelas águas do inconsciente com coragem e clareza',
  },

  'O Sol': {
    arcano: 'O Sol',
    numero_carta: 19,
    chakra: 'Manipura',
    chakra_numero: '3º Plexo Solar',
    elemento: 'Fogo',
    temas_espirituais: ['Alegria', 'Sucesso', 'Vitalidade', 'Infância interior'],
    qualidade_emocional: 'Alegria autêntica, vitalidade, integração da criança interior',
    sombra_psicologica: 'Egocentrismo, busca excessiva de validação',
    afirmacao: 'Eu brilho com minha luz autêntica e aqueço a todos ao meu redor',
  },

  'O Julgamento': {
    arcano: 'O Julgamento',
    numero_carta: 20,
    chakra: 'Vishuddha',
    chakra_numero: '5º Laríngeo',
    elemento: 'Fogo',
    temas_espirituais: ['Renascimento', 'Chamada interior', 'Reconciliação', 'Novo início'],
    qualidade_emocional: 'Abertura para chamada divina, reconciliação com o passado',
    sombra_psicologica: 'Autocondenação, comparar-se aos outros',
    afirmacao: 'Eu respondo à minha chamada divina e honro minha jornada',
  },

  'O Mundo': {
    arcano: 'O Mundo',
    numero_carta: 21,
    chakra: 'Sahasrara',
    chakra_numero: '7º Coroa',
    elemento: 'Terra',
    temas_espirituais: ['Completude', 'Realização', 'Integração', 'Consciência cósmica'],
    qualidade_emocional: 'Plenitude, integração de todos os aspectos do self',
    sombra_psicologica: 'Insatisfação crônica, incapaz de sentir completude',
    afirmacao: 'Eu integro todas as partes de mim e celebro minha completude',
  },
};

/**
 * Normalizes arcano name for lookup (case-insensitive, handles variations).
 */
function normalizeArcanoName(arcano: string): TarotArcano | null {
  const normalized = arcano.trim().toLowerCase();

  const nameMap: Record<string, TarotArcano> = {
    'o louco': 'O Louco',
    'o mago': 'O Mago',
    'a sacerdotisa': 'A Sacerdotisa',
    'a imperatriz': 'A Imperatriz',
    'o imperador': 'O Imperador',
    'o hierofante': 'O Hierofante',
    'o carro': 'O Carro',
    'a justiça': 'A Justiça',
    'o eremita': 'O Eremita',
    'a roda da fortuna': 'A Roda da Fortuna',
    'a força': 'A Força',
    'o enforcado': 'O Enforcado',
    'a morte': 'A Morte',
    'a temperança': 'A Temperança',
    'o diabo': 'O Diabo',
    'a torre': 'A Torre',
    'a estrela': 'A Estrela',
    'a lua': 'A Lua',
    'o sol': 'O Sol',
    'o julgamento': 'O Julgamento',
    'o mundo': 'O Mundo',
    // Alternative spellings and numbers
    'the fool': 'O Louco',
    'the magician': 'O Mago',
    'the high priestess': 'A Sacerdotisa',
    'the empress': 'A Imperatriz',
    'the emperor': 'O Imperador',
    'the hierophant': 'O Hierofante',
    'the chariot': 'O Carro',
    'justice': 'A Justiça',
    'the hermit': 'O Eremita',
    'wheel of fortune': 'A Roda da Fortuna',
    'strength': 'A Força',
    'the hanged man': 'O Enforcado',
    'death': 'A Morte',
    'temperance': 'A Temperança',
    'the devil': 'O Diabo',
    'the tower': 'A Torre',
    'the star': 'A Estrela',
    'the moon': 'A Lua',
    'the sun': 'O Sol',
    'judgment': 'O Julgamento',
    'the world': 'O Mundo',
  };

  return nameMap[normalized] ?? null;
}

/**
 * Normalizes chakra name to match ChakraName type.
 */
function normalizeChakraName(chakra: string): ChakraName | null {
  const normalized = chakra.trim().toLowerCase();

  const nameMap: Record<string, ChakraName> = {
    'muladhara': 'Muladhara',
    'root': 'Muladhara',
    'svadhisthana': 'Svadhisthana',
    'sacral': 'Svadhisthana',
    'manipura': 'Manipura',
    'solar plexus': 'Manipura',
    'anahata': 'Anahata',
    'heart': 'Anahata',
    'vishuddha': 'Vishuddha',
    'throat': 'Vishuddha',
    'ajna': 'Ajna',
    'third eye': 'Ajna',
    'sahasrara': 'Sahasrara',
    'crown': 'Sahasrara',
  };

  return nameMap[normalized] ?? null;
}

/**
 * Returns the complete tarot-chakra mapping for a given arcano card.
 * @param arcano - Name of the tarot Major Arcana card (case-insensitive)
 * @returns TarotChakraMapping or null if not found
 */
export function getTarotChakra(arcano: string): TarotChakraMapping | null {
  const normalized = normalizeArcanoName(arcano);
  if (!normalized) return null;
  return TAROT_CHAKRA_MAPPINGS[normalized] ?? null;
}

/**
 * Returns all tarot cards associated with a given chakra.
 * @param chakra - Chakra name (Sanskrit, English, or number format)
 * @returns Array of TarotChakraMapping for the specified chakra
 */
export function getChakraTarot(chakra: string): TarotChakraMapping[] {
  const normalized = normalizeChakraName(chakra);
  if (!normalized) return [];

  return Object.values(TAROT_CHAKRA_MAPPINGS).filter(
    (mapping) => mapping.chakra === normalized,
  );
}

/**
 * Returns all tarot-chakra mappings.
 * @returns Array of all TarotChakraMapping objects
 */
export function getAllTarotChakras(): TarotChakraMapping[] {
  return Object.values(TAROT_CHAKRA_MAPPINGS);
}

/**
 * Returns all Major Arcana card names.
 * @returns Array of TarotArcano names
 */
export function getAllArcanos(): TarotArcano[] {
  return Object.values(TAROT_CHAKRA_MAPPINGS).map((m) => m.arcano);
}

/**
 * Checks if an arcano exists in the mapping.
 * @param arcano - Name of the tarot card
 * @returns true if found
 */
export function hasTarotChakra(arcano: string): boolean {
  return normalizeArcanoName(arcano) !== null;
}

/**
 * Checks if a chakra has associated tarot cards.
 * @param chakra - Chakra name
 * @returns true if found
 */
export function hasChakraTarot(chakra: string): boolean {
  return normalizeChakraName(chakra) !== null && getChakraTarot(chakra).length > 0;
}

/**
 * Returns tarot cards grouped by element.
 * @returns Record mapping elements to arrays of TarotChakraMapping
 */
export function getTarotChakrasByElement(): Record<string, TarotChakraMapping[]> {
  const result: Record<string, TarotChakraMapping[]> = {};

  for (const mapping of Object.values(TAROT_CHAKRA_MAPPINGS)) {
    if (!result[mapping.elemento]) {
      result[mapping.elemento] = [];
    }
    result[mapping.elemento].push(mapping);
  }

  return result;
}

/**
 * Default export for convenience.
 */
export default {
  getTarotChakra,
  getChakraTarot,
  getAllTarotChakras,
  getAllArcanos,
  hasTarotChakra,
  hasChakraTarot,
  getTarotChakrasByElement,
  TAROT_CHAKRA_MAPPINGS,
};