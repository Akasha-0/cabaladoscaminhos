/**
 * Orixá-Chakra Spiritual Correlation Module
 * Maps Orixás to their corresponding chakras, elements, and spiritual meanings
 * Based on Cabala dos Caminhos vibrational healing traditions (IDEIA.md)
 */

import type { ChakraName } from './chakra-element';

export interface OrixaChakraMapping {
  orixa: string;
  chakra: ChakraName;
  chakra_numero: string;
  elemento: 'fogo' | 'água' | 'ar' | 'terra' | 'éter';
  cores: string[];
  significado_espiritual: string;
  praticas: string[];
}

/**
 * Complete mapping of Orixás to their chakra correspondences.
 * Based on IDEIA.md Cabala dos Caminhos vibrational traditions.
 * Mapping rationale:
 * - Oxalá (éter) → Sahasrara (crown) - creator and spiritual purity
 * - Iemanjá (água) → Svadhisthana (sacral) - nurturing, emotions, cycles
 * - Oxum (água) → Manipura (solar) - prosperity, personal power
 * - Ogum (terra) → Muladhara (root) - grounding, warrior energy
 * - Oxóssi (terra) → Anahata (heart) - wisdom, nature connection
 * - Xangô (fogo) → Manipura (solar) - justice, personal power
 * - Iansã (fogo) → Vishuddha (throat) - transformation, communication
 * - Omolu (terra) → Svadhisthana (sacral) - healing, transformation
 * - Nanã (água) → Ajna (third eye) - wisdom, ancestral secrets
 */
const ORIXAS_CHAKRA_MAP: Record<string, OrixaChakraMapping> = {
  'Oxalá': {
    orixa: 'Oxalá',
    chakra: 'Sahasrara',
    chakra_numero: '7º Coronário',
    elemento: 'éter',
    cores: ['Branco', 'Marfim', 'Transparente'],
    significado_espiritual: 'O Criador supremo conecta ao chakra coronário, representando a integração espiritual suprema, a paz interior e a reconexão com o divino. É a energia etérea que eleva a consciência além do físico.',
    praticas: ['Meditação de luz branca', 'Oração silenciosa', 'Conexão com o EU Superior', 'Reconciliação espiritual']
  },
  'Iemanjá': {
    orixa: 'Iemanjá',
    chakra: 'Svadhisthana',
    chakra_numero: '2º Sacro',
    elemento: 'água',
    cores: ['Azul Escuro', 'Branco', 'Transparente'],
    significado_espiritual: 'A Mãe das águas ativa o chakra sacral, governando as emoções, os ciclos reprodutivos e a nutição. Sua energia hídrica traz cura emocional, renovação espiritual e conexão com o sagrado feminino.',
    praticas: ['Ritual de limpeza emocional', 'Oferendas ao mar', 'Harmonização do útero', 'Conexão com ancestrais femininos']
  },
  'Oxum': {
    orixa: 'Oxum',
    chakra: 'Manipura',
    chakra_numero: '3º Plexo Solar',
    elemento: 'água',
    cores: ['Rosa', 'Amarelo-ouro', 'Azul-celeste'],
    significado_espiritual: 'A deusa da riqueza ativa o chakra do plexo solar, ensinando a verdadeira prosperidade que vem de dentro. Governa o poder pessoal, a autoestima e a capacidade de atrair abundância com elegância.',
    praticas: ['Ritual de prosperidade', 'Visualização de ouro', 'Trabalho com o Inner Child', 'Afirmações de abundância']
  },
  'Ogum': {
    orixa: 'Ogum',
    chakra: 'Muladhara',
    chakra_numero: '1º Básico',
    elemento: 'terra',
    cores: ['Azul Claro', 'Verde', 'Vermelho'],
    significado_espiritual: 'O guerreiro das encruzilhadas ancora-se no chakra raiz, representando a força de sobreviver, a perseverança e a capacidade de superar obstáculos. Abre caminhos com coragem e determinação.',
    praticas: ['Aterramento físico', 'Ritual de abertura de caminhos', 'Trabalho com a vontade', 'Conexão com a ancestralidade guerreira']
  },
  'Oxóssi': {
    orixa: 'Oxóssi',
    chakra: 'Anahata',
    chakra_numero: '4º Cardíaco',
    elemento: 'terra',
    cores: ['Verde', 'Azul-turquesa', 'Rosa'],
    significado_espiritual: 'O caçador e provedor expande o chakra cardíaco, ensinando a buscar com persistência e a celebrar conquistas. Sua energia conecta a sabedoria ancestral com a compaixão universal e a alegria de viver.',
    praticas: ['Meditação na natureza', 'Ritual de gratidão', 'Conexão com guias espirituais', 'Trabalho com a abundância natural']
  },
  'Xangô': {
    orixa: 'Xangô',
    chakra: 'Manipura',
    chakra_numero: '3º Plexo Solar',
    elemento: 'fogo',
    cores: ['Amarelo', 'Marrom', 'Vermelho'],
    significado_espiritual: 'O senhor da justiça irradia através do chakra do plexo solar, governando o poder pessoal, a verdade e o equilíbrio social. Sua energia ígnea traz autoridade e a capacidade de transformar a realidade com vontade.',
    praticas: ['Ritual de justiça', 'Trabalho com o elemento fogo', 'Conexão com a lei cósmica', 'Purificação por raio']
  },
  'Iansã': {
    orixa: 'Iansã',
    chakra: 'Vishuddha',
    chakra_numero: '5º Laríngeo',
    elemento: 'fogo',
    cores: ['Laranja', 'Amarelo', 'Vermelho', 'Coral'],
    significado_espiritual: 'A guerreira dos ventos liberta-se no chakra laríngeo, representando a comunicação autêntica, a liberdade de expressão e a transformação interior. Governa as mudanças bruscas e a capacidade de se adaptar.',
    praticas: ['Ritual de libertação', 'Cantos e invocações', 'Trabalho com elementos', 'Comunicação com entidades']
  },
  'Omolu': {
    orixa: 'Omolu',
    chakra: 'Svadhisthana',
    chakra_numero: '2º Sacro',
    elemento: 'terra',
    cores: ['Preto', 'Branco', 'Vermelho', 'Violeta'],
    significado_espiritual: 'O senhor das doenças e da cura transforma-se no chakra sacral, ensinando que através do confronto com a escuridão encontramos a verdadeira cura. Governa a regeneração, a cura e o renascimento espiritual.',
    praticas: ['Ritual de cura', 'Descarrego espiritual', 'Trabalho com sombras', 'Transmutação de bloqueios']
  },
  'Nanã': {
    orixa: 'Nanã',
    chakra: 'Ajna',
    chakra_numero: '6º Terceiro Olho',
    elemento: 'água',
    cores: ['Lilás', 'Roxo', 'Azul-violeta'],
    significado_espiritual: 'A anciã dos segredos Ancestrais desperta o terceiro olho, governando a sabedoria dos anciãos e os mistérios ocultos. Sua energia hídrica ensina que a verdadeira sabedoria vem com o tempo e a experiência.',
    praticas: ['Meditação introspectiva', 'Trabalho com ancestrais', 'Ritual de sabedoria', 'Conexão com registros akáshicos']
  }
};

/**
 * Normalizes orixá name for lookup (case-insensitive, handles special characters).
 */
function normalizeOrixaName(orixa: string): string | null {
  const normalized = orixa.trim().toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  
  for (const key of Object.keys(ORIXAS_CHAKRA_MAP)) {
    const keyNormalized = key.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
    if (keyNormalized === normalized) {
      return key;
    }
  }
  return null;
}

/**
 * Get Orixá-Chakra correlation mapping
 * @param orixa - Name of the Orixá (case-insensitive)
 * @returns OrixaChakraMapping or undefined if not found
 */
export function getOrixaChakra(orixa: string): OrixaChakraMapping | undefined {
  const normalized = normalizeOrixaName(orixa);
  if (!normalized) return undefined;
  return ORIXAS_CHAKRA_MAP[normalized];
}

/**
 * Get reverse mapping: chakra to associated Orixás
 * @returns Record mapping each ChakraName to its Orixá
 */
export function getChakraOrixa(): Record<ChakraName, string> {
  const result: Partial<Record<ChakraName, string>> = {};
  for (const mapping of Object.values(ORIXAS_CHAKRA_MAP)) {
    result[mapping.chakra] = mapping.orixa;
  }
  return result as Record<ChakraName, string>;
}

/**
 * Get all Orixá-Chakra mappings
 * @returns Array of all OrixaChakraMapping objects
 */
export function getAllOrixaChakras(): OrixaChakraMapping[] {
  return Object.values(ORIXAS_CHAKRA_MAP);
}

/**
 * Get Orixás by chakra
 * @param chakra - Chakra name (Sanskrit or number format)
 * @returns Array of Orixás associated with that chakra
 */
export function getOrixasByChakra(chakra: string): OrixaChakraMapping[] {
  const chakraNormalized = chakra.toLowerCase().replace(/[º°]/g, '').replace(/ /g, '');
  
  const chakraMap: Record<string, ChakraName> = {
    '1': 'Muladhara',
    '2': 'Svadhisthana',
    '3': 'Manipura',
    '4': 'Anahata',
    '5': 'Vishuddha',
    '6': 'Ajna',
    '7': 'Sahasrara',
    'basico': 'Muladhara',
    'sacro': 'Svadhisthana',
    'plexo': 'Manipura',
    'cardiaco': 'Anahata',
    'laringeo': 'Vishuddha',
    'terceirolho': 'Ajna',
    'coronario': 'Sahasrara'
  };
  
  const chakraName = chakraMap[chakraNormalized] || 
    (Object.keys(chakraMap).includes(chakra) ? chakra as ChakraName : null);
  
  if (!chakraName) return [];
  
  return Object.values(ORIXAS_CHAKRA_MAP).filter(
    m => m.chakra.toLowerCase() === chakraName.toLowerCase()
  );
}

export default {
  getOrixaChakra,
  getChakraOrixa,
  getAllOrixaChakras,
  getOrixasByChakra
};