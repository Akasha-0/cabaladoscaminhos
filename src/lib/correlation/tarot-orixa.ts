/**
 * Tarot Major Arcana to Orixá Correlation Module
 * Maps Tarot Major Arcana cards to Orixás based on spiritual energy and ritual correspondences
 * Based on IDEIA.md "Tabela de Correspondência Macro: Oito Portais da Consciência"
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
 * Based on IDEIA.md - Tabela de Correspondência Macro: Oito Portais da Consciência
 */
export const TAROT_ORIXA_MAPPINGS: Record<string, TarotOrixaMapping> = {
  'O Louco': {
    arcano: 'O Louco',
    numero_carta: 0,
    orixa: 'Eshu',
    elemento: 'Ar',
    energia_espiritual: 'Liberdade, imprevisibilidade, novo início e salto de fé. O espírito que transcende regras.',
    associacoes_rituais: {
      ferramentas: ['Capacete', 'Bolhas', 'Sino', 'Moedas'],
      oferendas: ['Frutas novas', 'Cerveja', 'Sêmola', 'Pão fresco'],
      momentos: ['Qualquer início', 'Segundas-feiras', 'Encruzilhadas'],
    },
    interpretacao: 'Eshu é o Trickster espiritual. O Louco representa sua energia de liberdade, salto no desconhecido e início de novas jornadas. Ele ensina que às vezes precisamos confiar no vazio e saltar sem garantias para encontrar nossa verdade.',
  },
  'O Mago': {
    arcano: 'O Mago',
    numero_carta: 1,
    orixa: 'Exu',
    elemento: 'Ar',
    energia_espiritual: 'Comunicação, dinamismo, início de tudo e ordenação. O mensageiro que abre os caminhos.',
    associacoes_rituais: {
      ferramentas: ['Pinhão roxo', 'Arruda', 'Guiné', 'Vela vermelha/preta'],
      oferendas: ['Cachaça', 'Pirão', 'Fumo', 'Amendoim torrado'],
      momentos: ['Segunda-feira', 'Encruzilhadas ao anoitecer', 'Início de qualquer ritual'],
    },
    interpretacao: 'Exu é o princípio de toda movimentação. O Mago representa sua energia de poder pessoal, comunicação e domínio das ferramentas espirituais. Ele é o mensageiro indispensável que abre os caminhos e conecta o céu à terra.',
  },
  'A Sacerdotisa': {
    arcano: 'A Sacerdotisa',
    numero_carta: 2,
    orixa: 'Nanã',
    elemento: 'Água',
    energia_espiritual: 'Sabedoria ancestral, paciência, recolhimento e mistério. O lodo primitivo e a antiga sabedoria.',
    associacoes_rituais: {
      ferramentas: ['Barro', 'Ervas calmas', 'Flores roxas', 'Água de chuva'],
      oferendas: ['Feijão preto', 'Frutas roxas', 'Velas lilases', 'Oferendas na lama'],
      momentos: ['Sábado', 'Noites de silêncio', 'Recolhimento e introspecção'],
    },
    interpretacao: 'Nanã é a anciã que guarda os mistérios. A Sacerdotisa representa sua energia de sabedoria oculta, intuição profunda e conexão com o mundo invisível. Ela guarda os segredos da vida, da morte e do renascimento.',
  },
  'A Imperatriz': {
    arcano: 'A Imperatriz',
    numero_carta: 3,
    orixa: 'Oxum',
    elemento: 'Terra',
    energia_espiritual: 'Amor incondicional, doçura, ouro e fertilidade. Magnetismo pessoal e inteligência emocional nas águas doces.',
    associacoes_rituais: {
      ferramentas: ['Mel', 'Girassóis', 'Moedas douradas', 'Perfumes doces'],
      oferendas: ['Acarajé', 'Doces', 'Frutas douradas', 'Melancia'],
      momentos: ['Sábado', 'Manhãs de Lua Crescente', 'Próximo a cachoeiras'],
    },
    interpretacao: 'Oxum é o princípio do amor e da abundância. A Imperatriz reflete sua energia de fertilidade, beleza e magnetismo. Seu poder atrai prosperidade, relacionamentos harmoniosos e realiza os desejos do coração.',
  },
  'O Imperador': {
    arcano: 'O Imperador',
    numero_carta: 4,
    orixa: 'Oxalá',
    elemento: 'Fogo',
    energia_espiritual: 'Paz absoluta, pureza, criação e equilíbrio espiritual. Conexão direta com o divino e sabedoria transcendente.',
    associacoes_rituais: {
      ferramentas: ['Vela branca', 'Algodão', 'Canjica', 'Tapete de boldo'],
      oferendas: ['Frutas brancas', 'Leite de cabra', 'Farofa de dendê branco'],
      momentos: ['Sexta-feira ao amanhecer', 'Lua Cheia', 'Horários de silêncio'],
    },
    interpretacao: 'Oxalá representa o princípio criativo puro, a cabeça bem feita (Ori). O Imperador reflete sua autoridade divina, ordem e a capacidade de criar estruturas sagradas. É o Orixá que governa o silêncio, a paz e a pureza absoluta.',
  },
  'O Hierofante': {
    arcano: 'O Hierofante',
    numero_carta: 5,
    orixa: 'Oxóssi',
    elemento: 'Ar',
    energia_espiritual: 'Fartura, conhecimento profundo e busca espiritual. A sabedoria das matas e o direcionamento da mente.',
    associacoes_rituais: {
      ferramentas: ['Flecha', 'Samambaia', 'Jurema', 'Alecrim'],
      oferendas: ['Frutas silvestres', 'Milho', 'Mel', 'Ervas frescas'],
      momentos: ['Quinta-feira', 'Horários de expansão', 'Próximo a matas e florestas'],
    },
    interpretacao: 'Oxóssi é o caçador que busca conhecimento. O Hierofante reflete sua energia de sabedoria sagrada, tradição espiritual e abertura de portais de conhecimento. Ele ensina que a verdadeira fartura vem do saber alinhado com a espiritualidade.',
  },
  'Os Enamorados': {
    arcano: 'Os Enamorados',
    numero_carta: 6,
    orixa: 'Logun Edé',
    elemento: 'Ar',
    energia_espiritual: 'Beleza, diplomacia, escolha sagrada e harmonização. A união dos opostos complementares.',
    associacoes_rituais: {
      ferramentas: ['Leque', 'Flores coloridas', 'Perfumes finos', 'Balangandãs'],
      oferendas: ['Frutas tropicais', 'Doces finos', 'Flores variadas', 'Perfumes'],
      momentos: ['Dias de equilíbrio', 'Lua Crescente', 'Momentos de decisão importante'],
    },
    interpretacao: 'Logun Edé é a união de Oxum e Oxóssi. Os Enamorados representam sua energia de escolha sagrada, união dos opostos e harmonia. Ele ensina que a verdadeira beleza está no equilíbrio entre o masculino e o feminino espiritual.',
  },
  'O Carro': {
    arcano: 'O Carro',
    numero_carta: 7,
    orixa: 'Ogum',
    elemento: 'Fogo',
    energia_espiritual: 'Lei, ordenação, coragem e abertura de caminhos. A força que vence obstáculos e impõe disciplina.',
    associacoes_rituais: {
      ferramentas: ['Espada', 'Aroeira', 'Guiné', 'Ferro'],
      oferendas: ['Inhame assado', 'Carne de boi', 'Vela vermelha'],
      momentos: ['Terça-feira', 'Nasceres do sol', 'Encruzilhadas'],
    },
    interpretacao: 'Ogum é o guerreiro que abre caminhos. O Carro representa sua vitória sobre os obstáculos, a determinação inabalável e o poder de avançar contra qualquer resistência. É o Orixá que garante que os caminhos estejam abertos.',
  },
  'A Força': {
    arcano: 'A Força',
    numero_carta: 8,
    orixa: 'Iansã',
    elemento: 'Fogo',
    energia_espiritual: 'Coragem interior, domínio das emoções,温柔 e força simultâneas. A leoa que doma o leão.',
    associacoes_rituais: {
      ferramentas: ['Espada', 'Bastão', 'Velas laranjas', 'Fumo'],
      oferendas: ['Acarajé', 'Pipoca', 'Velas laranjas', 'Água de cheiro'],
      momentos: ['Terça-feira', 'Lutas e batalhas', 'Momentos de coragem'],
    },
    interpretacao: 'Iansã é a guerreira que conquista. A Força representa sua energia de coragem interior, domínio das emoções e o poder de transformar o instinto em força espiritual. Ela ensina que a verdadeira força vem do equilíbrio entre a leoa e o leão dentro de nós.',
  },
  'O Eremita': {
    arcano: 'O Eremita',
    numero_carta: 9,
    orixa: 'Oxalá',
    elemento: 'Fogo',
    energia_espiritual: 'Iluminação interior, solitude sagrada, busca da verdade e autoconhecimento profundo.',
    associacoes_rituais: {
      ferramentas: ['Vela branca', 'Algodão', 'Bastão', 'Lanterna'],
      oferendas: ['Frutas brancas', 'Leite', 'Farinha'],
      momentos: ['Sexta-feira', 'Noites silenciosas', 'Meditação profunda'],
    },
    interpretacao: 'Oxalá na forma do Eremita representa a busca da luz interior. O Eremita mostra seu princípio de silêncio, introspecção e iluminação através do conhecimento de si mesmo. É a jornada solitária que leva à sabedoria verdadeira.',
  },
  'A Roda da Fortuna': {
    arcano: 'A Roda da Fortuna',
    numero_carta: 10,
    orixa: 'Iansã',
    elemento: 'Fogo',
    energia_espiritual: 'Ciclos do destino, mudança inevitável, lei de causa e efeito e rotação espiritual.',
    associacoes_rituais: {
      ferramentas: ['Roda', 'Velas laranjas', 'Fumo', 'Espada'],
      oferendas: ['Acarajé', 'Pipoca', 'Velas', 'Água de cheiro'],
      momentos: ['Terça-feira', 'Mudanças de ciclo', 'Roda de oportunidades'],
    },
    interpretacao: 'Iansã governa as mudanças inevitáveis. A Roda da Fortuna representa sua energia de ciclos, destino e transformação constante. Ela ensina que tudo gira e muda, e que devemos nos adaptar aos ciclos da vida com coragem e sabedoria.',
  },
  'A Justiça': {
    arcano: 'A Justiça',
    numero_carta: 11,
    orixa: 'Xangô',
    elemento: 'Fogo',
    energia_espiritual: 'Verdade, equilíbrio, lei divina e consequência karma. A balança que pesa ações e intenções.',
    associacoes_rituais: {
      ferramentas: ['Espada', 'Balança', 'Pedra de raio', 'Velas amarelas'],
      oferendas: ['Amalá', 'Pinhão', 'Quiabo', 'Velas douradas'],
      momentos: ['Quarta-feira', 'Domingo', 'Momentos de decisão judicial'],
    },
    interpretacao: 'Xangô é o senhor da justiça. A Justiça representa sua energia de verdade, equilíbrio e lei divina. Ele pesa as ações e garante que cada ato tenha sua consequencia justa. É o Orixá que revela a verdade e afasta a falsidade.',
  },
  'O Enforcado': {
    arcano: 'O Enforcado',
    numero_carta: 12,
    orixa: 'Omolu',
    elemento: 'Terra',
    energia_espiritual: 'Sacrifício, nova perspectiva, entrega e transcendência através da inversão.',
    associacoes_rituais: {
      ferramentas: ['Pipoca', 'Palmeira', 'Ervas de descarrego', 'Barro'],
      oferendas: ['Pipoca', 'Frutas escuras', 'Milho', 'Oferendas de terra'],
      momentos: ['Segunda-feira', 'Descarrego', 'Momentos de sacrifício consciente'],
    },
    interpretacao: 'Omolu é o senhor das transformações. O Enforcado representa sua energia de sacrifício, entrega e o poder de encontrar nova perspectiva através da inversão. Ele ensina que às vezes precisamos nos entregar para encontrar a cura.',
  },
  'A Morte': {
    arcano: 'A Morte',
    numero_carta: 13,
    orixa: 'Omolu',
    elemento: 'Terra',
    energia_espiritual: 'Transformação profunda, fim de ciclos, renascimento e transmutação inevitável.',
    associacoes_rituais: {
      ferramentas: ['Pipoca', 'Palmeira', 'Manga', 'Ervas de descarrego'],
      oferendas: ['Pipoca', 'Frutas escuras', 'Milho', 'Oferendas na terra'],
      momentos: ['Segunda-feira', 'Lua Minguante', 'Descarrego'],
    },
    interpretacao: 'Omolu é o mestre da morte e do renascimento. A Morte representa sua energia de transformação inevitável, o fim de ciclos velhos e o início de novos. Ele ensina que toda morte é um renascimento, e que a transformação é essencial para a evolução.',
  },
  'A Temperança': {
    arcano: 'A Temperança',
    numero_carta: 14,
    orixa: 'Iemanjá',
    elemento: 'Água',
    energia_espiritual: 'Equilíbrio emocional, harmonização de opostos, cura através da moderação e paciência.',
    associacoes_rituais: {
      ferramentas: ['Cálice', 'Água do mar', 'Flores brancas', 'Perfumes'],
      oferendas: ['Canjica', 'Balas brancas', 'Roupas brancas', 'Perfumes finos'],
      momentos: ['Sábado', 'Lua Cheia', 'Momentos de harmonização'],
    },
    interpretacao: 'Iemanjá é a harmonizadora das águas. A Temperança representa sua energia de equilíbrio, moderação e cura através da paciência. Ela ensina que a verdadeira sabedoria está no meio termo, na harmonização dos extremos.',
  },
  'O Diabo': {
    arcano: 'O Diabo',
    numero_carta: 15,
    orixa: 'Exu',
    elemento: 'Ar',
    energia_espiritual: 'Ilusão, apego, sombras internas e o poder de transformação do confronto com a escuridão.',
    associacoes_rituais: {
      ferramentas: ['Pinhão roxo', 'Vela vermelha', 'Guiné', 'Arruda'],
      oferendas: ['Cachaça', 'Pirão', 'Fumo', 'Amendoim'],
      momentos: ['Segunda-feira', 'Encruzilhadas', 'Trabalhos de proteção'],
    },
    interpretacao: 'Exu é o Trickster que confronta as sombras. O Diabo representa sua energia de ilusão e apego, o confronto necessário com a escuridão interior. Ele ensina que devemos enfrentar nossas sombras para libertar nossa luz.',
  },
  'A Torre': {
    arcano: 'A Torre',
    numero_carta: 16,
    orixa: 'Iansã',
    elemento: 'Fogo',
    energia_espiritual: 'Transformação abrupta, libertação repentina, destruição das ilusões e renovação catalyzed.',
    associacoes_rituais: {
      ferramentas: ['Espada de Santa Bárbara', 'Pinhão roxo', 'Fumo', 'Bambu'],
      oferendas: ['Acarajé', 'Velas laranjas', 'Pipoca', 'Água de cheiro'],
      momentos: ['Terça-feira', 'Tempestades', 'Mudanças rápidas e necessárias'],
    },
    interpretacao: 'Iansã é a senhora das tempestades. A Torre representa sua energia de transformação radical, a destruição das estruturas falsas para permitir o novo. Ela traz a limpeza através da queda, abrindo espaço para o renascimento.',
  },
  'A Estrela': {
    arcano: 'A Estrela',
    numero_carta: 17,
    orixa: 'Iemanjá',
    elemento: 'Água',
    energia_espiritual: 'Esperança, renovação, guiança espiritual e inspiração nas horas mais escuras.',
    associacoes_rituais: {
      ferramentas: ['Água do mar', 'Flores brancas', 'Colônia', 'Espelho'],
      oferendas: ['Canjica', 'Balas brancas', 'Perfumes finos', 'Roupas brancas'],
      momentos: ['Sábado', 'Noites de Lua Cheia', 'Beira-mar ao entardecer'],
    },
    interpretacao: 'Iemanjá é a grande mãe das águas. A Estrela representa sua energia de esperança, renovação e guiação espiritual. Assim como a Estrela ilumina a noite, Iemanjá ilumina o caminho da alma nas trevas, trazendo paz e orientação.',
  },
  'A Lua': {
    arcano: 'A Lua',
    numero_carta: 18,
    orixa: 'Iemanjá',
    elemento: 'Água',
    energia_espiritual: 'Inconsciente, sonhos, ilusões e a luz que guia nas trevas. O reflexo da verdade.',
    associacoes_rituais: {
      ferramentas: ['Água do mar', 'Espelho', 'Flores brancas', 'Colônia'],
      oferendas: ['Canjica', 'Balas brancas', 'Perfumes', 'Roupas brancas'],
      momentos: ['Sábado', 'Noites de Lua Cheia', 'Mares de águas calmas'],
    },
    interpretacao: 'Iemanjá governa as águas e a lua. A Lua representa sua energia de inconsciente, sonhos e o mundo das ilusões. Ela guia através das águas escuras do inconsciente, iluminando o caminho através do reflexo da verdade.',
  },
  'O Sol': {
    arcano: 'O Sol',
    numero_carta: 19,
    orixa: 'Xangô',
    elemento: 'Fogo',
    energia_espiritual: 'Brilho pessoal, vitalidade, sucesso, verdade e propósito de vida manifesto.',
    associacoes_rituais: {
      ferramentas: ['Pedra de raio', 'Machado', 'Quiabo', 'Amalá'],
      oferendas: ['Amalá quente', 'Pinhão', 'Vela amarela/dourada', 'Frutas amarelas'],
      momentos: ['Quarta-feira', 'Domingo', 'Meio-dia solar', 'Nascer do sol'],
    },
    interpretacao: 'Xangô é o rei que governa com justiça. O Sol representa sua energia de brilho próprio, vitalidade, sucesso e propósito de vida. É o Orixá que manifesta a verdade, afasta a falsidade e traz vitória através da justiça divina.',
  },
  'O Julgamento': {
    arcano: 'O Julgamento',
    numero_carta: 20,
    orixa: 'Xangô',
    elemento: 'Fogo',
    energia_espiritual: 'Renascimento, chamado divino, redenção e o despertar da verdadeira essência.',
    associacoes_rituais: {
      ferramentas: ['Espada', 'Balança', 'Velas douradas', 'Pedra de raio'],
      oferendas: ['Amalá', 'Pinhão', 'Quiabo', 'Velas amarelas'],
      momentos: ['Quarta-feira', 'Domingo', 'Momentos de julgamento e redenção'],
    },
    interpretacao: 'Xangô é o senhor do julgamento justo. O Julgamento representa sua energia de renascimento, chamado divino e redenção. Ele chama cada alma para despertar sua verdadeira essência, julgando com justiça e oferecendo redenção aos que buscam a luz.',
  },
  'O Mundo': {
    arcano: 'O Mundo',
    numero_carta: 21,
    orixa: 'Omolu',
    elemento: 'Terra',
    energia_espiritual: 'Completude, realização, fim de ciclo e a vitória do iniciado sobre seus obstáculos.',
    associacoes_rituais: {
      ferramentas: ['Pipoca', 'Palmeira', 'Manga', 'Ervas de descarrego'],
      oferendas: ['Pipoca', 'Frutas escuras', 'Milho', 'Oferendas de conclusão'],
      momentos: ['Segunda-feira', 'Lua Minguante', 'Conclusão de ciclos'],
    },
    interpretacao: 'Omolu é o senhor das curas e completude. O Mundo representa sua energia de realização, fim de ciclos e vitória sobre os obstáculos. Ele é o Orixá que traz a conclusão bem-sucedida de jornadas, a completude do iniciado que superou todos os desafios.',
  },
} as const;

// Freeze the mapping object to prevent modifications
Object.freeze(TAROT_ORIXA_MAPPINGS);
// Freeze nested objects
Object.values(TAROT_ORIXA_MAPPINGS).forEach(mapping => Object.freeze(mapping));

/**
 * Get the Tarot Major Arcana to Orixá correlation mapping
 * @param arcano - Name of the arcano (case-insensitive)
 * @returns The correlation mapping or null if not found
 */
export function getTarotOrixa(arcano: string): TarotOrixaMapping | null {
  const normalized = arcano
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
  
  for (const [key, mapping] of Object.entries(TAROT_ORIXA_MAPPINGS)) {
    const keyNormalized = key
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
    
    if (keyNormalized === normalized) {
      return mapping;
    }
  }
  
  return null;
}

/**
 * Get the Orixá corresponding to a Tarot Major Arcana card
 * @param arcano - The arcano name (e.g., 'O Sol', 'A Lua', 'O Imperador')
 * @returns The Orixá name or null if not found
 */
export function getOrixaByTarot(arcano: string): string | null {
  const mapping = getTarotOrixa(arcano);
  return mapping?.orixa ?? null;
}

/**
 * Get all available Tarot-Orixá mappings
 * @returns Array of all correlation mappings
 */
export function getAllTarotOrixas(): TarotOrixaMapping[] {
  return Object.values(TAROT_ORIXA_MAPPINGS);
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
  return getTarotOrixa(arcano) !== null;
}

/**
 * Get the Orixá for a given arcano number
 * @param numero - The Major Arcana card number (0-21)
 * @returns The Orixá name or null if not found
 */
export function getOrixaByNumber(numero: number): string | null {
  const mapping = getAllTarotOrixas().find((m) => m.numero_carta === numero);
  return mapping?.orixa ?? null;
}

/**
 * Get the arcano for a given card number
 * @param numero - The Major Arcana card number (0-21)
 * @returns The arcano name or null if not found
 */
export function getArcanoByNumber(numero: number): string | null {
  const mapping = getAllTarotOrixas().find((m) => m.numero_carta === numero);
  return mapping?.arcano ?? null;
}

/**
 * Get the element for a given arcano
 * @param arcano - The arcano name
 * @returns The element or null if not found
 */
export function getElementByArcano(arcano: string): string | null {
  const mapping = getTarotOrixa(arcano);
  return mapping?.elemento ?? null;
}

/**
 * Get Orixás by element
 * @param elemento - The element to filter by
 * @returns Array of Orixás with the given element
 */
export function getOrixasByElement(elemento: string): string[] {
  const unique = new Set<string>();
  for (const mapping of Object.values(TAROT_ORIXA_MAPPINGS)) {
    if (mapping.elemento.toLowerCase() === elemento.toLowerCase()) {
      unique.add(mapping.orixa);
    }
  }
  return Array.from(unique);
}

/**
 * Get Tarot cards by element
 * @param elemento - The element to filter by
 * @returns Array of arcano names with the given element
 */
export function getArcanosByElement(elemento: string): string[] {
  const result: string[] = [];
  for (const mapping of Object.values(TAROT_ORIXA_MAPPINGS)) {
    if (mapping.elemento.toLowerCase() === elemento.toLowerCase()) {
      result.push(mapping.arcano);
    }
  }
  return result;
}

/**
 * Default export with all functions
 */
export default {
  getTarotOrixa,
  getOrixaByTarot,
  getAllTarotOrixas,
  getAllArcanos,
  hasTarotOrixa,
  getOrixaByNumber,
  getArcanoByNumber,
  getElementByArcano,
  getOrixasByElement,
  getArcanosByElement,
  TAROT_ORIXA_MAPPINGS,
};