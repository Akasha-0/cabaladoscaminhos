/**
 * Orixá-Tarot Major Arcana Correlation Module
 * Maps Orixás to Tarot Major Arcana cards based on spiritual energy and ritual correspondences
 * Based on IDEIA.md "Tabela de Correspondência Macro: Oito Portais da Consciência"
 */

export interface OrixaTarotMapping {
  /** The Orixá name */
  orixa: string;
  /** The Major Arcana card name */
  arcano: string;
  /** The card number in the Major Arcana */
  numero_carta: number;
  /** The primary spiritual energy */
  energia_espiritual: string;
  /** Ritual associations and practices */
  associacoes_rituais: {
    /** Sacred items and tools */
    ferramentas?: string[];
    /** Appropriate offerings */
    oferendas?: string[];
    /** Ritual timing */
    momentos?: string[];
  };
  /** Symbolic meaning and archetype interpretation */
  interpretacao: string;
}

/**
 * Orixá to Tarot Major Arcana correlation mappings
 * Based on IDEIA.md - Tabela de Correspondência Macro: Oito Portais da Consciência
 */
export const ORIXA_TAROT_MAPPINGS: Record<string, OrixaTarotMapping> = {
  Oxalá: {
    orixa: 'Oxalá',
    arcano: 'O Imperador',
    numero_carta: 4,
    energia_espiritual: 'Paz absoluta, pureza, criação e equilíbrio espiritual. Conexão direta com o divino e sabedoria transcendente.',
    associacoes_rituais: {
      ferramentas: ['Vela branca', 'Algodão', 'Canjica', 'Tapete de boldo'],
      oferendas: ['Frutas brancas', 'Leite de cabra', 'Farofa de dendê branco'],
      momentos: ['Sexta-feira ao amanhecer', 'Lua Cheia', 'Horários de silêncio'],
    },
    interpretacao: 'Oxalá representa o principio criativo puro, a cabeça bem feita (Ori). O Imperador reflete sua autoridade divina, ordem e a capacidade de criar estruturas sagradas. É o Orixá que governa o silêncio, a paz e a pureza absoluta.',
  },
  'Iemanjá': {
    orixa: 'Iemanjá',
    arcano: 'A Estrela',
    numero_carta: 17,
    energia_espiritual: 'Intuição profunda, maternidade, geração e equilíbrio mental. Fluidez emocional e conexão com as águas salgadas.',
    associacoes_rituais: {
      ferramentas: ['Água do mar', 'Flores brancas', 'Colônia', ' espelho'],
      oferendas: ['Canjica', 'Balas brancas', 'Perfumes finos', 'Roupas brancas'],
      momentos: ['Sábado', 'Noites de Lua Cheia', 'Beira-mar ao entardecer'],
    },
    interpretacao: 'Iemanjá é a grande mãe das águas. A Estrela representa sua energia de esperança, renovação e guidância espiritual. Assim como a Estrela ilumina a noite, Iemanjá ilumina o caminho da alma nas trevas, trazendo paz e orientação.',
  },
  Oxum: {
    orixa: 'Oxum',
    arcano: 'A Imperatriz',
    numero_carta: 3,
    energia_espiritual: 'Amor incondicional, doçura, ouro e fertilidade. Magnetismo pessoal e inteligência emocional nas águas doces.',
    associacoes_rituais: {
      ferramentas: ['Mel', 'Girassóis', 'Moedas douradas', 'Perfumes doces'],
      oferendas: ['Acarajé', 'Doces', 'Frutas douradas', 'Melancia'],
      momentos: ['Sábado', 'Manhãs deLua Crescente', 'Próximo a cachoeiras'],
    },
    interpretacao: 'Oxum é o princípio do amor e da abundância. A Imperatriz reflete sua energia de fertilidade, beleza e magnetismo. Seu poder atrai prosperidade, relacionamentos harmoniosos e realiza os desejos do coração.',
  },
  Ogum: {
    orixa: 'Ogum',
    arcano: 'O Carro',
    numero_carta: 7,
    energia_espiritual: 'Lei, ordenação, coragem e abertura de caminhos. A força que vence obstáculos e impõe disciplina.',
    associacoes_rituais: {
      ferramentas: ['Espada', 'Aroeira', 'Guiné', 'Ferro'],
      oferendas: ['Inhame assado', 'Carne de boi', 'Vela vermelha'],
      momentos: ['Terça-feira', 'Nasceres do sol', 'Encruzilhadas'],
    },
    interpretacao: 'Ogum é o guerreiro que abre caminhos. O Carro representa sua vitória sobre os obstáculos, a determinação inabalável e o poder de avançar contra qualquer resistência. É o Orixá que garante que os caminhos estejam abertos.',
  },
  Oxóssi: {
    orixa: 'Oxóssi',
    arcano: 'O Hierofante',
    numero_carta: 5,
    energia_espiritual: 'Fartura, conhecimento profundo e busca espiritual. A sabedoria das matas e o direcionamento da mente.',
    associacoes_rituais: {
      ferramentas: ['Flecha', 'Samambaia', 'Jurema', 'Alecrim'],
      oferendas: ['Frutas silvestres', 'Milho', 'Mel', 'Ervas frescas'],
      momentos: ['Quinta-feira', 'Horários de expansão', 'Próximo a matas e florestas'],
    },
    interpretacao: 'Oxóssi é o caçador que busca conhecimento. O Hierofante reflete sua energia de sabedoria sagrada, tradição espiritual e abertura de portais de conhecimento. Ele ensina que a verdadeira fartura vem do saber alinhado com a espiritualidade.',
  },
  Xangô: {
    orixa: 'Xangô',
    arcano: 'O Sol',
    numero_carta: 19,
    energia_espiritual: 'Justiça divina, liderança, brilho pessoal e fogo purificador. O poder real e a verdade inabalável.',
    associacoes_rituais: {
      ferramentas: ['Pedra de raio', 'Machado', 'Quiabo', 'Amalá'],
      oferendas: ['Amalá quente', 'Pinhão', 'Vela amarela/dourada', 'Frutas amarelas'],
      momentos: ['Quarta-feira', 'Domingo', 'Meio-dia solar', 'Nascer do sol'],
    },
    interpretacao: 'Xangô é o rei que governa com justiça. O Sol representa sua energia de brilho próprio, vitalidade, sucesso e propósito de vida. É o Orixá que manifestationa a verdade, afasta a falsidade e traz vitória através da justiça divina.',
  },
  'Iansã': {
    orixa: 'Iansã',
    arcano: 'A Torre',
    numero_carta: 16,
    energia_espiritual: 'Movimento rápido, transformação abrupta, ventos da mudança e libertação. A coragem de quebrar estruturas.',
    associacoes_rituais: {
      ferramentas: ['Pinhão roxo', 'Espada de Santa Bárbara', 'Fumo', 'Bambu'],
      oferendas: ['Acarajé', 'Velas laranjas', 'Pipoca', 'Água de味道'],
      momentos: ['Terça-feira', 'Tempestades', 'Mudanças rápidas'],
    },
    interpretacao: 'Iansã é a senhora das tempestades. A Torre representa sua energia de transformação radical, quebra de ilusões e libertação repentina. Ela traz a limpeza que vem após a queda das estruturas falsas, abrindo espaço para o novo.',
  },
  Omolu: {
    orixa: 'Omolu',
    arcano: 'O Mundo',
    numero_carta: 21,
    energia_espiritual: 'Cura física, transmutação, fim de ciclos e estruturação. O poder da terra e das transformações necessárias.',
    associacoes_rituais: {
      ferramentas: ['Pipoca (Deburu)', 'Palmeira', 'Ervas de descarrego', 'Mangas],
      oferendas: ['Pipoca', 'Frutas escuras', 'Milho', 'Oferendas de terra'],
      momentos: ['Segunda-feira', 'Lua Minguante', 'Descarrego pesado'],
    },
    interpretacao: 'Omolu é o senhor das doenças e curas. O Mundo representa sua energia de completude, encerramento de ciclos e transformação final. Ele é o Orixá que traz a cura através da compreensão de que todo fim é um novo começo.',
  },
  Nanã: {
    orixa: 'Nanã',
    arcano: 'A Sacerdotisa',
    numero_carta: 2,
    energia_espiritual: 'Sabedoria ancestral, paciência, recolhimento e mistério. O lodo primitivo e a古老 sabedoria.',
    associacoes_rituais: {
      ferramentas: ['Barro', 'Ervas calmas', 'Flores roxas', 'Água de chuva'],
      oferendas: ['Feijão preto', 'Frutas roxas', 'Velas lilases', 'Oferendas na lama'],
      momentos: ['Sábado', 'Noites de silêncio', 'Recolhimento e introspection'],
    },
    interpretacao: 'Nanã é a anciã que guarda os mistérios. A Sacerdotisa representa sua energia de sabedoria oculta, intuição profunda e conexão com o mundo invisível. Ela guarda os segredos da vida, da morte e do renascimento.',
  },
  Exu: {
    orixa: 'Exu',
    arcano: 'O Mago',
    numero_carta: 1,
    energia_espiritual: 'Comunicação, dinamismo, início de tudo e ordenação. O mensageiro que abre os caminhos.',
    associacoes_rituais: {
      ferramentas: ['Pinhão roxo', 'Arruda', 'Guiné', 'Vela vermelha/preta'],
      oferendas: ['Cachaça', 'Pirão', 'Fumo', 'Amendoim torrado'],
      momentos: ['Segunda-feira', 'Encruzilhadas ao anoitecer', 'Início de qualquer ritual'],
    },
    interpretacao: 'Exu é o princípio de toda movimentação. O Mago representa sua energia de poder pessoal, comunicação e domínio das ferramentas espirituais. Ele é o mensageiro indispensável que abre os caminhos e conecta o céu à terra.',
  },
  'Logun Edé': {
    orixa: 'Logun Edé',
    arcano: 'Os Enamorados',
    numero_carta: 6,
    energia_espiritual: 'Beleza, diplomacia, escolha sagrada e harmonização. A união dos opostos complementares.',
    associacoes_rituais: {
      ferramentas: ['Leque', 'Flores coloridas', 'Perfumes finos', 'Balangandãs'],
      oferendas: ['Frutas tropicais', 'Doces finos', 'Flores variadas', 'Perfumes'],
      momentos: ['Dias de equilibrio', 'Lua Crescente', 'Momentos de decisão importante'],
    },
    interpretacao: 'Logun Edé é a união de Oxum e Oxóssi. Os Enamorados representam sua energia de escolha sagrada, união dos opostos e harmonia. Ele ensina que a verdadeira beleza está no equilibrio entre o masculino e o feminino espiritual.',
  },
  'Eshu/Eleguá': {
    orixa: 'Eshu',
    arcano: 'O Louco',
    numero_carta: 0,
    energia_espiritual: 'Liberdade, imprevisibilidade, novo início e salto de fé. O espirituo que transcende regras.',
    associacoes_rituais: {
      ferramentas: ['Capacete', 'Bolhas', 'Sino', 'Moedas'],
      oferendas: ['Frutas novas', 'Cerveja', 'Sêmola', 'Pão fresco'],
      momentos: ['Qualquer inicio', 'Segundas-feiras', 'Encruzilhadas'],
    },
    interpretacao: 'Eshu é o Trickster espiritual. O Louco representa sua energia de liberdade, salto no desconhecido e início de novas jornadas. Ele ensina que às vezes precisamos confiar no vacúo e saltar sem garantías para encontrar nossa verdade.',
  },
} as const;

// Freeze the mapping object to prevent modifications
Object.freeze(ORIXA_TAROT_MAPPINGS);
// Freeze nested objects
Object.values(ORIXA_TAROT_MAPPINGS).forEach(mapping => Object.freeze(mapping));

/**
 * Get the Orixá to Tarot Major Arcana correlation mapping
 * @param orixa - Name of the Orixá (case-insensitive)
 * @returns The correlation mapping or null if not found
 */
export function getOrixaTarot(orixa: string): OrixaTarotMapping | null {
  const normalized = Object.keys(ORIXA_TAROT_MAPPINGS).find(
    key => key.toLowerCase() === orixa.toLowerCase()
  );
  return normalized ? ORIXA_TAROT_MAPPINGS[normalized] : null;
}

/**
 * Get the Orixá corresponding to a Tarot Major Arcana card
 * @param arcano - The arcano name (e.g., 'O Sol', 'A Lua', 'O Imperador')
 * @returns The Orixá name or null if not found
 */
export function getTarotOrixa(arcano: string): string | null {
  const entry = Object.entries(ORIXA_TAROT_MAPPINGS).find(
    ([, mapping]) => mapping.arcano === arcano
  );
  return entry ? entry[0] : null;
}

/**
 * Get all available Orixá-Tarot mappings
 * @returns Array of all correlation mappings
 */
export function getAllOrixaTarots(): OrixaTarotMapping[] {
  return Object.values(ORIXA_TAROT_MAPPINGS);
}

/**
 * Get all Orixá names in the mapping
 * @returns Array of Orixá names
 */
export function getAllOrixaNames(): string[] {
  return Object.keys(ORIXA_TAROT_MAPPINGS);
}

/**
 * Check if an Orixá exists in the mapping
 * @param orixa - Orixá name to check
 * @returns True if Orixá exists in mapping
 */
export function hasOrixaTarot(orixa: string): boolean {
  return getOrixaTarot(orixa) !== null;
}

/**
 * Get the arcano number for a given Orixá
 * @param orixa - Name of the Orixá
 * @returns The arcano number or null if not found
 */
export function getOrixaTarotNumber(orixa: string): number | null {
  const mapping = getOrixaTarot(orixa);
  return mapping ? mapping.numero_carta : null;
}

/**
 * Get the arcano by card number
 * @param numero - The Major Arcana card number
 * @returns The arcano name or null if not found
 */
export function getArcanoByNumber(numero: number): string | null {
  const entry = Object.entries(ORIXA_TAROT_MAPPINGS).find(
    ([, mapping]) => mapping.numero_carta === numero
  );
  return entry ? entry[1].arcano : null;
}

/**
 * Get Orixá by card number
 * @param numero - The Major Arcana card number
 * @returns The Orixá name or null if not found
 */
export function getOrixaByNumber(numero: number): string | null {
  const entry = Object.entries(ORIXA_TAROT_MAPPINGS).find(
    ([, mapping]) => mapping.numero_carta === numero
  );
  return entry ? entry[0] : null;
}

export default {
  getOrixaTarot,
  getTarotOrixa,
  getAllOrixaTarots,
  getAllOrixaNames,
  hasOrixaTarot,
  getOrixaTarotNumber,
  getArcanoByNumber,
  getOrixaByNumber,
  ORIXA_TAROT_MAPPINGS,
};