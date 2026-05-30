/**
 * Tarot Major Arcana - Orixá Correlation Module
 * Maps Tarot Major Arcana cards to their corresponding Orixás based on spiritual energy and ritual correspondences
 * Reversed perspective from Orixá-Tarot mapping for different divination contexts
 */

export interface TarotOrixaMapping {
  /** The Major Arcana card name */
  arcano: string;
  /** The associated Orixá name */
  orixa: string;
  /** The card number in the Major Arcana */
  numero_carta: number;
  /** Elemental correspondence */
  elemento: string;
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
 * Tarot Major Arcana to Orixá correlation mappings
 * Provides the reverse perspective: given a Tarot card, find its spiritual Orixá connection
 */
export const TAROT_ORIXA_MAPPINGS: Record<string, TarotOrixaMapping> = {
  'O Mago': {
    arcano: 'O Mago',
    orixa: 'Exu',
    numero_carta: 1,
    elemento: 'Ar',
    energia_espiritual: 'Poder pessoal, comunicação, dominio das ferramentas espirituais e inicio de tudo. O principio dinâmico que move o universo.',
    associacoes_rituais: {
      ferramentas: ['Pinhão roxo', 'Arruda', 'Guiné', 'Vela vermelha/preta'],
      oferendas: ['Cachaça', 'Pirão', 'Fumo', 'Amendoim torrado'],
      momentos: ['Segunda-feira', 'Encruzilhadas ao anoitecer', 'Início de qualquer ritual'],
    },
    interpretacao: 'O Mago representa Exu em sua essência de mensageiro e principio de toda movimentação. É a energia que conecta o céu à terra, abre caminhos e manifesta a vontade divina através da palavra e do gesto ritualístico.',
  },
  'A Sacerdotisa': {
    arcano: 'A Sacerdotisa',
    orixa: 'Nanã',
    numero_carta: 2,
    elemento: 'Água',
    energia_espiritual: 'Sabedoria ancestral, mistério, recolhimento e intuição profunda. O lodo primitivo que guarda os segredos da vida e da morte.',
    associacoes_rituais: {
      ferramentas: ['Barro', 'Ervas calmas', 'Flores roxas', 'Água de chuva'],
      oferendas: ['Feijão preto', 'Frutas roxas', 'Velas lilases', 'Oferendas na lama'],
      momentos: ['Sábado', 'Noites de silêncio', 'Recolhimento e introspecção'],
    },
    interpretacao: 'A Sacerdotisa manifesta a energia de Nanã como guardiã dos mistérios ocultos. Ela representa o conhecimento que transcende a razão, a sabedoria que vem da experiencia ancestral e o poder do silêncio sagrado.',
  },
  'A Imperatriz': {
    arcano: 'A Imperatriz',
    orixa: 'Oxum',
    numero_carta: 3,
    elemento: 'Terra',
    energia_espiritual: 'Amor incondicional, fertilidade, abundância e magnetismo pessoal. A doçura que atrai prosperidade e harmoniza relacionamentos.',
    associacoes_rituais: {
      ferramentas: ['Mel', 'Girassóis', 'Moedas douradas', 'Perfumes doces'],
      oferendas: ['Acarajé', 'Doces', 'Frutas douradas', 'Melancia'],
      momentos: ['Sábado', 'Manhãs de Lua Crescente', 'Próximo a cachoeiras'],
    },
    interpretacao: 'A Imperatriz reflete Oxum como principio do amor e da abundância. Sua energia atrai prosperidade, realizações de desejos e relacionamentos harmoniosos. É a expressão da feminilidade sagrada em sua forma mais pura.',
  },
  'O Imperador': {
    arcano: 'O Imperador',
    orixa: 'Oxalá',
    numero_carta: 4,
    elemento: 'Fogo',
    energia_espiritual: 'Paz absoluta, pureza, criação e equilibrio espiritual. A cabeça bem feita (Ori) e a autoridade divina que cria estruturas sagradas.',
    associacoes_rituais: {
      ferramentas: ['Vela branca', 'Algodão', 'Canjica', 'Tapete de boldo'],
      oferendas: ['Frutas brancas', 'Leite de cabra', 'Farofa de dendê branco'],
      momentos: ['Sexta-feira ao amanhecer', 'Lua Cheia', 'Horários de silêncio'],
    },
    interpretacao: 'O Imperador representa Oxalá em sua expressão de ordem divina e principio criativo puro. Ele governa o silêncio, a paz e a pureza, estabelecendo estruturas sagradas que harmonizam o mundo material com o espiritual.',
  },
  'O Hierofante': {
    arcano: 'O Hierofante',
    orixa: 'Oxóssi',
    numero_carta: 5,
    elemento: 'Ar',
    energia_espiritual: 'Fartura, conhecimento profundo e busca espiritual. A sabedoria das matas que direciona a mente para a compreensão sagrada.',
    associacoes_rituais: {
      ferramentas: ['Flecha', 'Samambaia', 'Jurema', 'Alecrim'],
      oferendas: ['Frutas silvestres', 'Milho', 'Mel', 'Ervas frescas'],
      momentos: ['Quinta-feira', 'Horários de expansão', 'Próximo a matas e florestas'],
    },
    interpretacao: 'O Hierofante manifesta a energia de Oxóssi como mestre da sabedoria sagrada e tradição espiritual. Ele ensina que a verdadeira fartura vem do saber alinhado com a espiritualidade e que a busca pelo conhecimento é sagrada.',
  },
  'Os Enamorados': {
    arcano: 'Os Enamorados',
    orixa: 'Logun Edé',
    numero_carta: 6,
    elemento: 'Ar',
    energia_espiritual: 'Beleza, diplomacia, escolha sagrada e harmonização dos opostos. A união entre o masculino e o feminino espiritual.',
    associacoes_rituais: {
      ferramentas: ['Leque', 'Flores coloridas', 'Perfumes finos', 'Balangandãs'],
      oferendas: ['Frutas tropicais', 'Doces finos', 'Flores variadas', 'Perfumes'],
      momentos: ['Dias de equilíbrio', 'Lua Crescente', 'Momentos de decisão importante'],
    },
    interpretacao: 'Os Enamorados representam Logun Edé como expressão da união dos opostos complementares. Sua energia ensina que a verdadeira beleza está no equilíbrio, que escolhas sagradas requerem harmonização do coração e da mente.',
  },
  'O Carro': {
    arcano: 'O Carro',
    orixa: 'Ogum',
    numero_carta: 7,
    elemento: 'Fogo',
    energia_espiritual: 'Lei, ordenação, coragem e abertura de caminhos. A vitória sobre obstáculos através da determinação inabalável.',
    associacoes_rituais: {
      ferramentas: ['Espada', 'Aroeira', 'Guiné', 'Ferro'],
      oferendas: ['Inhame assado', 'Carne de boi', 'Vela vermelha'],
      momentos: ['Terça-feira', 'Nasceres do sol', 'Encruzilhadas'],
    },
    interpretacao: 'O Carro manifesta Ogum como guerreiro que vence qualquer resistência. É a energia que garante que os caminhos estejam abertos, que a determinação supera obstáculos e que a vitória é certa para quem persiste.',
  },
  'A Justiça': {
    arcano: 'A Justiça',
    orixa: 'Xangô',
    numero_carta: 8,
    elemento: 'Ar',
    energia_espiritual: 'Lei cósmica, equilíbrio e verdade inabalável. O poder que manifesta a vontade divina através da justiça perfeita.',
    associacoes_rituais: {
      ferramentas: ['Pedra de raio', 'Machado', 'Quiabo', 'Amalá'],
      oferendas: ['Amalá quente', 'Pinhão', 'Vela amarela/dourada', 'Frutas amarelas'],
      momentos: ['Quarta-feira', 'Domingo', 'Meio-dia solar', 'Nascer do sol'],
    },
    interpretacao: 'A Justiça representa Xangô em seu papel de regente da lei cósmica. É o arquétipo da verdade que manifesta a vontade divina, afasta a falsidade e garante que cada ação tenha sua conseqência天然.',
  },
  'O Hermita': {
    arcano: 'O Hermita',
    orixa: 'Oxalá',
    numero_carta: 9,
    elemento: 'Terra',
    energia_espiritual: 'Iluminação interior, busca da verdade e solitude sagrada. A jornada introspectiva que conduz à sabedoria transcendence.',
    associacoes_rituais: {
      ferramentas: ['Vela branca', 'Algodão', 'Canjica', 'Lanterna'],
      oferendas: ['Frutas brancas', 'Leite de cabra', 'Farofa de dendê branco'],
      momentos: ['Sexta-feira ao amanhecer', 'Noites de silêncio', 'Horários de introspecção'],
    },
    interpretacao: 'O Hermita reflete a energia de Oxalá na busca da verdade interior. É o caminho do silêncio e da reflexão que conduz à iluminação, representando a jornada da alma em busca da sabedoria transcendente.',
  },
  'A Roda da Fortuna': {
    arcano: 'A Roda da Fortuna',
    orixa: 'Iansã',
    numero_carta: 10,
    elemento: 'Fogo',
    energia_espiritual: 'Ciclos, destino e mudança inevitável. A energia que governa os momentos de transformação e novos começos.',
    associacoes_rituais: {
      ferramentas: ['Pinhão roxo', 'Espada de Santa Bárbara', 'Fumo', 'Bambu'],
      oferendas: ['Acarajé', 'Velas laranjas', 'Pipoca', 'Água de cheiro'],
      momentos: ['Terça-feira', 'Mudanças de ciclo', 'Momentos de transição'],
    },
    interpretacao: 'A Roda da Fortuna manifesta a energia de Iansã como senhora das transformações cíclicas. É o arquétipo que lembra que nada é permanente, que a mudança é inevitável e que cada ciclo traz novas oportunidades.',
  },
  'A Força': {
    arcano: 'A Força',
    orixa: 'Omolu',
    numero_carta: 11,
    elemento: 'Terra',
    energia_espiritual: 'Poder interior, transmutação e controle das forças naturais. A coragem que vence o medo através da sabedoria.',
    associacoes_rituais: {
      ferramentas: ['Pipoca (Deburu)', 'Palmeira', 'Ervas de descarrego', 'Manga'],
      oferendas: ['Pipoca', 'Frutas escuras', 'Milho', 'Oferendas de terra'],
      momentos: ['Segunda-feira', 'Lua Minguante', 'Descarrego'],
    },
    interpretacao: 'A Força representa Omolu em seu poder de transmutação interior. É a energia que transforma o medo em coragem, que demonstra que o verdadeiro poder vem do domínio de si mesmo e não da força bruta.',
  },
  'O Enforcado': {
    arcano: 'O Enforcado',
    orixa: 'Nanã',
    numero_carta: 12,
    elemento: 'Água',
    energia_espiritual: 'Sacrifício, nova perspectiva e entrega. O ato de olhar o mundo de um ângulo diferente para encontrar a verdade oculta.',
    associacoes_rituais: {
      ferramentas: ['Barro', 'Ervas calmas', 'Flores roxas', 'Água de chuva'],
      oferendas: ['Feijão preto', 'Frutas roxas', 'Velas lilases', 'Oferendas na lama'],
      momentos: ['Sábado', 'Noites de silêncio', 'Momentos de entrega e sacrifício'],
    },
    interpretacao: 'O Enforcado manifesta a energia de Nanã como símbolo do sacrifício necessário para a evolução espiritual. É o arquétipo que ensina que às vezes precisamos mudar nossa perspectiva para encontrar a verdade.',
  },
  'A Morte': {
    arcano: 'A Morte',
    orixa: 'Omolu',
    numero_carta: 13,
    elemento: 'Água',
    energia_espiritual: 'Transformação, fim de ciclos e renascimento. A energia que limpa o antigo para dar espaço ao novo.',
    associacoes_rituais: {
      ferramentas: ['Pipoca (Deburu)', 'Palmeira', 'Ervas de descarrego', 'Manga'],
      oferendas: ['Pipoca', 'Frutas escuras', 'Milho', 'Oferendas de terra'],
      momentos: ['Segunda-feira', 'Lua Minguante', 'Descarrego pesado', 'Fins de ciclo'],
    },
    interpretacao: 'A Morte representa Omolu como senhor das transformações necessárias. É o arquétipo que lembra que todo fim é um novo começo, que a morte do velho permite o nascimento do novo, que a cura vem através da destruição do que não serve mais.',
  },
  'A Temperança': {
    arcano: 'A Temperança',
    orixa: 'Oxum',
    numero_carta: 14,
    elemento: 'Água',
    energia_espiritual: 'Equilíbrio, harmonia e integração dos opostos. A energia que mistura os elementos para criar algo novo e harmonioso.',
    associacoes_rituais: {
      ferramentas: ['Mel', 'Girassóis', 'Moedas douradas', 'Perfumes doces'],
      oferendas: ['Acarajé', 'Doces', 'Frutas douradas', 'Melancia'],
      momentos: ['Sábado', 'Manhãs de Lua Crescente', 'Momentos de equilíbrio'],
    },
    interpretacao: 'A Temperança manifesta a energia de Oxum como mestre da harmonização. É o arquétipo que ensina o equilíbrio entre os opostos, a integração das polaridades e a criação de harmonia onde havia conflito.',
  },
  'O Diabo': {
    arcano: 'O Diabo',
    orixa: 'Eshu',
    numero_carta: 15,
    elemento: 'Fogo',
    energia_espiritual: 'Ilusão, apego e sombras interiores. A energia que revela os bloqueios e prisões que criamos para nós mesmos.',
    associacoes_rituais: {
      ferramentas: ['Pinhão roxo', 'Arruda', 'Guiné', 'Vela vermelha/preta'],
      oferendas: ['Cachaça', 'Pirão', 'Fumo', 'Amendoim torrado'],
      momentos: ['Segunda-feira', 'Encruzilhadas', 'Trabalhos de proteção'],
    },
    interpretacao: 'O Diabo representa Eshu em sua faceta de Trickster e revelador de sombras. É o arquétipo que mostra as ilusões e apegos que nos prendem, os bloqueios que criamos para nós mesmos, para que possamos reconhecê-los e libertar-nos.',
  },
  'A Torre': {
    arcano: 'A Torre',
    orixa: 'Iansã',
    numero_carta: 16,
    elemento: 'Fogo',
    energia_espiritual: 'Destruição criativa, revelação e libertação súbita. A energia que quebra estruturas falsas para permitir o renascimento.',
    associacoes_rituais: {
      ferramentas: ['Pinhão roxo', 'Espada de Santa Bárbara', 'Fumo', 'Bambu'],
      oferendas: ['Acarajé', 'Velas laranjas', 'Pipoca', 'Água de cheiro'],
      momentos: ['Terça-feira', 'Tempestades', 'Mudanças rápidas'],
    },
    interpretacao: 'A Torre manifesta a energia de Iansã como senhora das transformações radicais. É o arquétipo que traz a limpeza após a queda das estruturas falsas, a revelação que vem pela destruição e a libertação que surge do caos.',
  },
  'A Estrela': {
    arcano: 'A Estrela',
    orixa: 'Iemanjá',
    numero_carta: 17,
    elemento: 'Água',
    energia_espiritual: 'Esperança, renovação, intuição e guiança espiritual. A luz que ilumina o caminho da alma nas trevas.',
    associacoes_rituais: {
      ferramentas: ['Água do mar', 'Flores brancas', 'Colônia', 'Espelho'],
      oferendas: ['Canjica', 'Balas brancas', 'Perfumes finos', 'Roupas brancas'],
      momentos: ['Sábado', 'Noites de Lua Cheia', 'Beira-mar ao entardecer'],
    },
    interpretacao: 'A Estrela representa Iemanjá como grande mãe das águas e guia espiritual. É o arquétipo que traz esperança nas trevas, renovação para o espírito cansado e orientação para quem busca seu caminho de verdade.',
  },
  'A Lua': {
    arcano: 'A Lua',
    orixa: 'Iemanjá',
    numero_carta: 18,
    elemento: 'Água',
    energia_espiritual: 'Inconsciente, ilusão, sonhos e mundo interior. A energia que conecta a alma com os mistérios do mundo invisível.',
    associacoes_rituais: {
      ferramentas: ['Água do mar', 'Flores brancas', 'Colônia', 'Espelho'],
      oferendas: ['Canjica', 'Balas brancas', 'Perfumes finos', 'Roupas brancas'],
      momentos: ['Sábado', 'Noites de Lua Cheia', 'Maresas', 'Sonhos'],
    },
    interpretacao: 'A Lua manifesta a energia de Iemanjá como guardiã do inconsciente e dos sonhos. É o arquétipo que conecta a alma com o mundo invisível, que revela os mistérios através dos sonhos e que mostra as ilusões que ocultam a verdade.',
  },
  'O Sol': {
    arcano: 'O Sol',
    orixa: 'Xangô',
    numero_carta: 19,
    elemento: 'Fogo',
    energia_espiritual: 'Vitalidade, sucesso, brilho pessoal e verdade. A energia solar que manifesta o propósito de vida e afasta a escuridão.',
    associacoes_rituais: {
      ferramentas: ['Pedra de raio', 'Machado', 'Quiabo', 'Amalá'],
      oferendas: ['Amalá quente', 'Pinhão', 'Vela amarela/dourada', 'Frutas amarelas'],
      momentos: ['Quarta-feira', 'Domingo', 'Meio-dia solar', 'Nascer do sol'],
    },
    interpretacao: 'O Sol representa Xangô como rei que governa com justiça e brilho próprio. É o arquétipo que manifesta a verdade, afasta a falsidade, traz vitória através da justiça divina e irradia vitalidade e propósito de vida.',
  },
  'O Julgamento': {
    arcano: 'O Julgamento',
    orixa: 'Xangô',
    numero_carta: 20,
    elemento: 'Fogo',
    energia_espiritual: 'Renovação, redenção e chamado superior. A energia que desperta a consciência para uma nova etapa de evolução.',
    associacoes_rituais: {
      ferramentas: ['Pedra de raio', 'Machado', 'Quiabo', 'Amalá'],
      oferendas: ['Amalá quente', 'Pinhão', 'Vela amarela/dourada', 'Frutas amarelas'],
      momentos: ['Quarta-feira', 'Domingo', 'Momentos de avaliação e decisão'],
    },
    interpretacao: 'O Julgamento manifesta a energia de Xangô como senhor da justiça que desperta a consciência. É o arquétipo do chamado superior que convida à renovação, à redenção e à readiness para uma nova etapa de evolução espiritual.',
  },
  'O Mundo': {
    arcano: 'O Mundo',
    orixa: 'Omolu',
    numero_carta: 21,
    elemento: 'Terra',
    energia_espiritual: 'Completude, realização, fim de ciclos e síntese. O poder da terra que fecha um ciclo e abre espaço para o novo.',
    associacoes_rituais: {
      ferramentas: ['Pipoca (Deburu)', 'Palmeira', 'Ervas de descarrego', 'Manga'],
      oferendas: ['Pipoca', 'Frutas escuras', 'Milho', 'Oferendas de terra'],
      momentos: ['Segunda-feira', 'Lua Minguante', 'Conclusão de ciclos', 'Realizações'],
    },
    interpretacao: 'O Mundo representa Omolu como senhor da completude e encerramento de ciclos. É o arquétipo que traz a cura através da compreensão de que todo fim é um novo começo, que a síntese de todas as experiências conduz à iluminação.',
  },
  'O Louco': {
    arcano: 'O Louco',
    orixa: 'Eshu',
    numero_carta: 0,
    elemento: 'Ar',
    energia_espiritual: 'Liberdade, novo início, salto de fé e imprevisibilidade. O espírito que transcende regras e aceita o desconhecido.',
    associacoes_rituais: {
      ferramentas: ['Capacete', 'Bolhas', 'Sino', 'Moedas'],
      oferendas: ['Frutas novas', 'Cerveja', 'Sêmola', 'Pão fresco'],
      momentos: ['Qualquer início', 'Segundas-feiras', 'Encruzilhadas'],
    },
    interpretacao: 'O Louco representa Eshu em sua expressão de Trickster espiritual e liberdade primordial. É o arquétipo que ensina que às vezes precisamos confiar no vazio, saltar sem garantias e aceitar o desconhecido para encontrar nossa verdade mais profunda.',
  },
} as const;

// Freeze the mapping object to prevent modifications
Object.freeze(TAROT_ORIXA_MAPPINGS);
// Freeze nested objects
Object.values(TAROT_ORIXA_MAPPINGS).forEach(mapping => Object.freeze(mapping));

/**
 * Get the Tarot Major Arcana to Orixá correlation mapping
 * @param arcano - Name of the Tarot card (case-insensitive)
 * @returns The correlation mapping or null if not found
 */
export function getTarotOrixa(arcano: string): TarotOrixaMapping | null {
  const normalizedArcano = arcano.trim();
  const found = TAROT_ORIXA_MAPPINGS[normalizedArcano];
  if (found) return found;
  
  // Case-insensitive search
  const lowerArcano = normalizedArcano.toLowerCase();
  for (const [key, mapping] of Object.entries(TAROT_ORIXA_MAPPINGS)) {
    if (key.toLowerCase() === lowerArcano) {
      return mapping;
    }
  }
  
  return null;
}

/**
 * Get the Tarot card corresponding to an Orixá
 * @param orixa - Name of the Orixá (case-insensitive)
 * @returns The Tarot card name or null if not found
 */
export function getOrixaTarot(orixa: string): string | null {
  const normalizedOrixa = orixa.trim();
  
  // Case-insensitive search
  const lowerOrixa = normalizedOrixa.toLowerCase();
  for (const mapping of Object.values(TAROT_ORIXA_MAPPINGS)) {
    if (mapping.orixa.toLowerCase() === lowerOrixa) {
      return mapping.arcano;
    }
  }
  
  return null;
}

/**
 * Get all available Tarot-Orixá mappings
 * @returns Array of all correlation mappings
 */
export function getAllTarotOrixas(): TarotOrixaMapping[] {
  return Object.values(TAROT_ORIXA_MAPPINGS);
}

/**
 * Get all Tarot card names in the mapping
 * @returns Array of Tarot card names
 */
export function getAllArcanoNames(): string[] {
  return Object.keys(TAROT_ORIXA_MAPPINGS);
}

/**
 * Check if a Tarot card exists in the mapping
 * @param arcano - Tarot card name to check
 * @returns True if Tarot card exists in mapping
 */
export function hasTarotOrixa(arcano: string): boolean {
  return getTarotOrixa(arcano) !== null;
}

/**
 * Get the element for a given Tarot card
 * @param arcano - Name of the Tarot card
 * @returns The element or null if not found
 */
export function getTarotElement(arcano: string): string | null {
  const mapping = getTarotOrixa(arcano);
  return mapping ? mapping.elemento : null;
}

/**
 * Get the arcano by card number
 * @param numero - The Major Arcana card number
 * @returns The arcano name or null if not found
 */
export function getArcanoByNumber(numero: number): string | null {
  for (const mapping of Object.values(TAROT_ORIXA_MAPPINGS)) {
    if (mapping.numero_carta === numero) {
      return mapping.arcano;
    }
  }
  return null;
}

/**
 * Get Orixá by card number
 * @param numero - The Major Arcana card number
 * @returns The Orixá name or null if not found
 */
export function getOrixaByNumber(numero: number): string | null {
  for (const mapping of Object.values(TAROT_ORIXA_MAPPINGS)) {
    if (mapping.numero_carta === numero) {
      return mapping.orixa;
    }
  }
  return null;
}

/**
 * Get Orixás by element
 * @param elemento - The element to filter by
 * @returns Array of Orixás with the given element
 */
export function getOrixasByElement(elemento: string): string[] {
  const normalizedElemento = elemento.trim();
  const results: string[] = [];
  
  for (const mapping of Object.values(TAROT_ORIXA_MAPPINGS)) {
    if (mapping.elemento.toLowerCase() === normalizedElemento.toLowerCase()) {
      if (!results.includes(mapping.orixa)) {
        results.push(mapping.orixa);
      }
    }
  }
  
  return results;
}

/**
 * Get Tarot cards by element
 * @param elemento - The element to filter by
 * @returns Array of Tarot cards with the given element
 */
export function getTarotsByElement(elemento: string): string[] {
  const normalizedElemento = elemento.trim();
  const results: string[] = [];
  
  for (const mapping of Object.values(TAROT_ORIXA_MAPPINGS)) {
    if (mapping.elemento.toLowerCase() === normalizedElemento.toLowerCase()) {
      results.push(mapping.arcano);
    }
  }
  
  return results;
}

export default {
  getTarotOrixa,
  getOrixaTarot,
  getAllTarotOrixas,
  getAllArcanoNames,
  hasTarotOrixa,
  getTarotElement,
  getArcanoByNumber,
  getOrixaByNumber,
  getOrixasByElement,
  getTarotsByElement,
  TAROT_ORIXA_MAPPINGS,
};