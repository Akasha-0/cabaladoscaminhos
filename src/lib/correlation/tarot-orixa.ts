/**
 * Tarot-Orixá Correlation Module
 * Maps Tarot Major Arcana cards to Orixás based on spiritual energy correspondences
 * Based on IDEIA.md "Tabela de Correspondência Macro: Oito Portais da Consciência"
 */

import type { OrixaTarotMapping } from './orixa-tarot';

/**
 * Tarot to Orixá correlation mapping
 */
export interface TarotOrixaMapping {
  /** The Major Arcana card name */
  arcano: string;
  /** The card number in the Major Arcana */
  numero_carta: number;
  /** The Orixá name */
  orixa: string;
  /** Elemental correspondence */
  elemento: string;
  /** The primary spiritual energy */
  energia_espiritual: string;
  /** Symbolic meaning and archetype interpretation */
  interpretacao: string;
  /** Sacred items and tools */
  ferramentas?: string[];
  /** Appropriate offerings */
  oferendas?: string[];
  /** Ritual timing */
  momentos?: string[];
}

/**
 * Tarot Major Arcana to Orixá correlation mappings
 * Based on IDEIA.md - Tabela de Correspondência Macro: Oito Portais da Consciência
 */
export const TAROT_ORIXA_MAPPINGS: Record<string, TarotOrixaMapping> = {
  'O Mago': {
    arcano: 'O Mago',
    numero_carta: 1,
    orixa: 'Exu',
    elemento: 'Ar',
    energia_espiritual: 'Comunicação, dinamismo, início de tudo e ordenação. O mensageiro que abre os caminhos.',
    interpretacao: 'Exu é o princípio de toda movimentação. O Mago representa sua energia de poder pessoal, comunicação e domínio das ferramentas espirituais. Ele é o mensageiro indispensável que abre os caminhos e conecta o céu à terra.',
    ferramentas: ['Pinhão roxo', 'Arruda', 'Guiné', 'Vela vermelha/preta'],
    oferendas: ['Cachaça', 'Pirão', 'Fumo', 'Amendoim torrado'],
    momentos: ['Segunda-feira', 'Encruzilhadas ao anoitecer', 'Início de qualquer ritual'],
  },
  'A Sacerdotisa': {
    arcano: 'A Sacerdotisa',
    numero_carta: 2,
    orixa: 'Nanã',
    elemento: 'Água',
    energia_espiritual: 'Sabedoria ancestral, paciência, recolhimento e mistério. O lodo primitivo e a antiga sabedoria.',
    interpretacao: 'Nanã é a anciã que guarda os mistérios. A Sacerdotisa representa sua energia de sabedoria oculta, intuição profunda e conexão com o mundo invisível. Ela guarda os segredos da vida, da morte e do renascimento.',
    ferramentas: ['Barro', 'Ervas calmas', 'Flores roxas', 'Água de chuva'],
    oferendas: ['Feijão preto', 'Frutas roxas', 'Velas lilases', 'Oferendas na lama'],
    momentos: ['Sábado', 'Noites de silêncio', 'Recolhimento e introspecção'],
  },
  'A Imperatriz': {
    arcano: 'A Imperatriz',
    numero_carta: 3,
    orixa: 'Oxum',
    elemento: 'Terra',
    energia_espiritual: 'Amor incondicional, doçura, ouro e fertilidade. Magnetismo pessoal e inteligência emocional nas águas doces.',
    interpretacao: 'Oxum é o princípio do amor e da abundância. A Imperatriz reflete sua energia de fertilidade, beleza e magnetismo. Seu poder atrai prosperidade, relacionamentos harmoniosos e realiza os desejos do coração.',
    ferramentas: ['Mel', 'Girassóis', 'Moedas douradas', 'Perfumes doces'],
    oferendas: ['Acarajé', 'Doces', 'Frutas douradas', 'Melancia'],
    momentos: ['Sábado', 'Manhãs de Lua Crescente', 'Próximo a cachoeiras'],
  },
  'O Imperador': {
    arcano: 'O Imperador',
    numero_carta: 4,
    orixa: 'Oxalá',
    elemento: 'Fogo',
    energia_espiritual: 'Paz absoluta, pureza, criação e equilíbrio espiritual. Conexão direta com o divino e sabedoria transcendente.',
    interpretacao: 'Oxalá representa o princípio criativo puro, a cabeça bem feita (Ori). O Imperador reflete sua autoridade divina, ordem e a capacidade de criar estruturas sagradas. É o Orixá que governa o silêncio, a paz e a pureza absoluta.',
    ferramentas: ['Vela branca', 'Algodão', 'Canjica', 'Tapete de boldo'],
    oferendas: ['Frutas brancas', 'Leite de cabra', 'Farofa de dendê branco'],
    momentos: ['Sexta-feira ao amanhecer', 'Lua Cheia', 'Horários de silêncio'],
  },
  'O Hierofante': {
    arcano: 'O Hierofante',
    numero_carta: 5,
    orixa: 'Oxóssi',
    elemento: 'Ar',
    energia_espiritual: 'Fartura, conhecimento profundo e busca espiritual. A sabedoria das matas e o direcionamento da mente.',
    interpretacao: 'Oxóssi é o caçador que busca conhecimento. O Hierofante reflete sua energia de sabedoria sagrada, tradição espiritual e abertura de portais de conhecimento. Ele ensina que a verdadeira fartura vem do saber alinhado com a espiritualidade.',
    ferramentas: ['Flecha', 'Samambaia', 'Jurema', 'Alecrim'],
    oferendas: ['Frutas silvestres', 'Milho', 'Mel', 'Ervas frescas'],
    momentos: ['Quinta-feira', 'Horários de expansão', 'Próximo a matas e florestas'],
  },
  'Os Enamorados': {
    arcano: 'Os Enamorados',
    numero_carta: 6,
    orixa: 'Logun Edé',
    elemento: 'Ar',
    energia_espiritual: 'Beleza, diplomacia, escolha sagrada e harmonização. A união dos opostos complementares.',
    interpretacao: 'Logun Edé é a união de Oxum e Oxóssi. Os Enamorados representam sua energia de escolha sagrada, união dos opostos e harmonia. Ele ensina que a verdadeira beleza está no equilíbrio entre o masculino e o feminino espiritual.',
    ferramentas: ['Leque', 'Flores coloridas', 'Perfumes finos', 'Balangandãs'],
    oferendas: ['Frutas tropicais', 'Doces finos', 'Flores variadas', 'Perfumes'],
    momentos: ['Dias de equilíbrio', 'Lua Crescente', 'Momentos de decisão importante'],
  },
  'O Carro': {
    arcano: 'O Carro',
    numero_carta: 7,
    orixa: 'Ogum',
    elemento: 'Fogo',
    energia_espiritual: 'Lei, ordenação, coragem e abertura de caminhos. A força que vence obstáculos e impõe disciplina.',
    interpretacao: 'Ogum é o guerreiro que abre caminhos. O Carro representa sua vitória sobre os obstáculos, a determinação inabalável e o poder de avançar contra qualquer resistência. É o Orixá que garante que os caminhos estejam abertos.',
    ferramentas: ['Espada', 'Aroeira', 'Guiné', 'Ferro'],
    oferendas: ['Inhame assado', 'Carne de boi', 'Vela vermelha'],
    momentos: ['Terça-feira', 'Nasceres do sol', 'Encruzilhadas'],
  },
  'A Torre': {
    arcano: 'A Torre',
    numero_carta: 16,
    orixa: 'Iansã',
    elemento: 'Fogo',
    energia_espiritual: 'Movimento rápido, transformação abrupta, ventos da mudança e libertação. A coragem de quebrar estruturas.',
    interpretacao: 'Iansã é a senhora das tempestades. A Torre representa sua energia de transformação radical, quebra de ilusões e libertação repentina. Ela traz a limpeza que vem após a queda das estruturas falsas, abrindo espaço para o novo.',
    ferramentas: ['Pinhão roxo', 'Espada de Santa Bárbara', 'Fumo', 'Bambu'],
    oferendas: ['Acarajé', 'Velas laranjas', 'Pipoca', 'Água de cheiro'],
    momentos: ['Terça-feira', 'Tempestades', 'Mudanças rápidas'],
  },
  'A Estrela': {
    arcano: 'A Estrela',
    numero_carta: 17,
    orixa: 'Iemanjá',
    elemento: 'Água',
    energia_espiritual: 'Intuição profunda, maternidade, geração e equilíbrio mental. Fluidez emocional e conexão com as águas salgadas.',
    interpretacao: 'Iemanjá é a grande mãe das águas. A Estrela representa sua energia de esperança, renovação e guiança espiritual. Assim como a Estrela ilumina a noite, Iemanjá ilumina o caminho da alma nas trevas, trazendo paz e orientação.',
    ferramentas: ['Água do mar', 'Flores brancas', 'Colônia', 'Espelho'],
    oferendas: ['Canjica', 'Balas brancas', 'Perfumes finos', 'Roupas brancas'],
    momentos: ['Sábado', 'Noites de Lua Cheia', 'Beira-mar ao entardecer'],
  },
  'O Sol': {
    arcano: 'O Sol',
    numero_carta: 19,
    orixa: 'Xangô',
    elemento: 'Fogo',
    energia_espiritual: 'Justiça divina, liderança, brilho pessoal e fogo purificador. O poder real e a verdade inabalável.',
    interpretacao: 'Xangô é o rei que governa com justiça. O Sol representa sua energia de brilho próprio, vitalidade, sucesso e propósito de vida. É o Orixá que manifestationa a verdade, afasta a falsidade e traz vitória através da justiça divina.',
    ferramentas: ['Pedra de raio', 'Machado', 'Quiabo', 'Amalá'],
    oferendas: ['Amalá quente', 'Pinhão', 'Vela amarela/dourada', 'Frutas amarelas'],
    momentos: ['Quarta-feira', 'Domingo', 'Meio-dia solar', 'Nascer do sol'],
  },
  'O Mundo': {
    arcano: 'O Mundo',
    numero_carta: 21,
    orixa: 'Omolu',
    elemento: 'Terra',
    energia_espiritual: 'Cura física, transmutação, fim de ciclos e estruturação. O poder da terra e das transformações necessárias.',
    interpretacao: 'Omolu é o senhor das doenças e curas. O Mundo representa sua energia de completude, encerramento de ciclos e transformação final. Ele é o Orixá que traz a cura através da compreensão de que todo fim é um novo começo.',
    ferramentas: ['Pipoca (Deburu)', 'Palmeira', 'Ervas de descarrego', 'Manga'],
    oferendas: ['Pipoca', 'Frutas escuras', 'Milho', 'Oferendas de terra'],
    momentos: ['Segunda-feira', 'Lua Minguante', 'Descarrego pesado'],
  },
  'O Louco': {
    arcano: 'O Louco',
    numero_carta: 0,
    orixa: 'Eshu',
    elemento: 'Ar',
    energia_espiritual: 'Liberdade, imprevisibilidade, novo início e salto de fé. O espírito que transcende regras.',
    interpretacao: 'Eshu é o Trickster espiritual. O Louco representa sua energia de liberdade, salto no desconhecido e início de novas jornadas. Ele ensina que às vezes precisamos confiar no vazio e saltar sem garantias para encontrar nossa verdade.',
    ferramentas: ['Capacete', 'Bolhas', 'Sino', 'Moedas'],
    oferendas: ['Frutas novas', 'Cerveja', 'Sêmola', 'Pão fresco'],
    momentos: ['Qualquer início', 'Segundas-feiras', 'Encruzilhadas'],
  },
} as const;

// Freeze the mapping object to prevent modifications
Object.freeze(TAROT_ORIXA_MAPPINGS);
Object.values(TAROT_ORIXA_MAPPINGS).forEach(mapping => Object.freeze(mapping));

/**
 * Get the Tarot to Orixá correlation mapping
 * @param arcano - Name of the Major Arcana card (case-insensitive)
 * @returns The correlation mapping or null if not found
 */
export function getTarotOrixaMapping(arcano: string): TarotOrixaMapping | null {
  const normalized = Object.keys(TAROT_ORIXA_MAPPINGS).find(
    key => key.toLowerCase() === arcano.toLowerCase()
  );
  return normalized ? TAROT_ORIXA_MAPPINGS[normalized] : null;
}

/**
 * Get the Orixá corresponding to a Tarot Major Arcana card
 * @param arcano - The arcano name (e.g., 'O Sol', 'A Lua', 'O Imperador')
 * @returns The Orixá name or null if not found
 */
export function getOrixaByTarot(arcano: string): string | null {
  const mapping = getTarotOrixaMapping(arcano);
  return mapping ? mapping.orixa : null;
}

/**
 * Get all available Tarot-Orixá mappings
 * @returns Array of all correlation mappings sorted by card number
 */
export function getAllTarotOrixas(): TarotOrixaMapping[] {
  return Object.values(TAROT_ORIXA_MAPPINGS).sort((a, b) => a.numero_carta - b.numero_carta);
}

/**
 * Get all arcano names in the mapping
 * @returns Array of arcano names
 */
export function getAllArcanos(): string[] {
  return Object.keys(TAROT_ORIXA_MAPPINGS);
}

/**
 * Check if an arcano exists in the mapping
 * @param arcano - Arcano name to check
 * @returns True if arcano exists in mapping
 */
export function hasTarotOrixa(arcano: string): boolean {
  return getTarotOrixaMapping(arcano) !== null;
}

/**
 * Get the card number for a given arcano
 * @param arcano - Name of the arcano
 * @returns The card number or null if not found
 */
export function getNumeroByArcano(arcano: string): number | null {
  const mapping = getTarotOrixaMapping(arcano);
  return mapping ? mapping.numero_carta : null;
}

/**
 * Get the element for a given arcano
 * @param arcano - Name of the arcano
 * @returns The element or null if not found
 */
export function getElementoByArcano(arcano: string): string | null {
  const mapping = getTarotOrixaMapping(arcano);
  return mapping ? mapping.elemento : null;
}

/**
 * Get the arcano by card number
 * @param numero - The Major Arcana card number
 * @returns The arcano name or null if not found
 */
export function getArcanoByNumero(numero: number): string | null {
  const entry = Object.entries(TAROT_ORIXA_MAPPINGS).find(
    ([, mapping]) => mapping.numero_carta === numero
  );
  return entry ? entry[0] : null;
}

/**
 * Get Orixá by card number
 * @param numero - The Major Arcana card number
 * @returns The Orixá name or null if not found
 */
export function getOrixaByNumero(numero: number): string | null {
  const entry = Object.entries(TAROT_ORIXA_MAPPINGS).find(
    ([, mapping]) => mapping.numero_carta === numero
  );
  return entry ? entry[1].orixa : null;
}

/**
 * Get arcano by Orixá name
 * @param orixa - Name of the Orixá
 * @returns The arcano name or null if not found
 */
export function getArcanoByOrixa(orixa: string): string | null {
  const entry = Object.entries(TAROT_ORIXA_MAPPINGS).find(
    ([, mapping]) => mapping.orixa.toLowerCase() === orixa.toLowerCase()
  );
  return entry ? entry[0] : null;
}

/**
 * Get arcano by element
 * @param elemento - The element to filter by
 * @returns Array of arcano names with the given element
 */
export function getArcanosByElemento(elemento: string): string[] {
  return Object.values(TAROT_ORIXA_MAPPINGS)
    .filter(mapping => mapping.elemento.toLowerCase() === elemento.toLowerCase())
    .map(mapping => mapping.arcano);
}

/**
 * Get Orixás by element
 * @param elemento - The element to filter by
 * @returns Array of Orixá names with the given element
 */
export function getOrixasByElemento(elemento: string): string[] {
  return Object.values(TAROT_ORIXA_MAPPINGS)
    .filter(mapping => mapping.elemento.toLowerCase() === elemento.toLowerCase())
    .map(mapping => mapping.orixa);
}

/**
 * Get mapping count
 * @returns Number of arcano-to-orixa mappings
 */
export function getTarotOrixaCount(): number {
  return Object.keys(TAROT_ORIXA_MAPPINGS).length;
}

/**
 * Get the energy for a given arcano
 * @param arcano - Name of the arcano
 * @returns The spiritual energy description or null if not found
 */
export function getEnergiaByArcano(arcano: string): string | null {
  const mapping = getTarotOrixaMapping(arcano);
  return mapping ? mapping.energia_espiritual : null;
}

export default {
  getTarotOrixaMapping,
  getOrixaByTarot,
  getAllTarotOrixas,
  getAllArcanos,
  hasTarotOrixa,
  getNumeroByArcano,
  getElementoByArcano,
  getArcanoByNumero,
  getOrixaByNumero,
  getArcanoByOrixa,
  getArcanosByElemento,
  getOrixasByElemento,
  getTarotOrixaCount,
  getEnergiaByArcano,
  TAROT_ORIXA_MAPPINGS,
};