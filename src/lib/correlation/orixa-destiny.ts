/**
 * Orixá-Destiny Correlation Module
 * Maps Orixás to their spiritual paths and destinies in the Cabala dos Caminhos framework
 * Based on the sacred journey of each Orixá and their unique contribution to human destiny
 */

export type DestinyPath = 
  | 'criacao'        // Creation - The divine origin, starting point
  | 'guerra'         // War - The warrior path, overcoming obstacles
  | 'sabedoria'      // Wisdom - The seeker path, knowledge and understanding
  | 'amor'           // Love - The nurturing path, emotional fulfillment
  | 'transformacao'  // Transformation - The alchemist path, change and rebirth
  | 'justice'        // Justice - The balanced path, law and order
  | 'ancestralidade' // Ancestry - The elder path, connection to lineage
  | 'protecao'       // Protection - The guardian path, shielding and boundaries
  | 'abundancia'     // Abundance - The prosperity path, material and spiritual wealth
  | 'equilibrio';    // Balance - The harmony path, integration of opposites

export interface OrixaDestiny {
  /** The Orixá name */
  orixa: string;
  /** Primary destiny/camino */
  caminho_destino: DestinyPath;
  /** Alternative or complementary path */
  caminho_secundario?: DestinyPath;
  /** The spiritual meaning of this destiny connection */
  significado_espiritual: string;
  /** What this path teaches */
  licao_central: string;
  /** Associated number in numerological journey */
  numero_jornada: number;
  /** Associated element for this destiny */
  elemento: 'fogo' | 'água' | 'ar' | 'terra' | 'éter';
  /** Key life theme for this destiny path */
  tema_vida: string;
}

/**
 * Orixá to Destiny path mappings
 * Based on the sacred journey and spiritual purpose of each Orixá
 */
const ORIXA_DESTINY_MAP: Record<string, OrixaDestiny> = {
  'Oxalá': {
    orixa: 'Oxalá',
    caminho_destino: 'criacao',
    caminho_secundario: 'equilibrio',
    significado_espiritual: 'Oxalá representa o princípio da criação primordial. Seu destino está conectado à capacidade de dar vida, originar novos ciclos e estabelecer a harmonia entre o céu e a terra. Como pai de todos os Orixás, seu caminho ensina que cada ser carrega a centelha criadora divina.',
    licao_central: 'A criação consciente através da intenção pura e amor incondicional',
    numero_jornada: 1,
    elemento: 'éter',
    tema_vida: 'Renovação, pureza, reconciliação, propósito de vida'
  },
  'Iemanjá': {
    orixa: 'Iemanjá',
    caminho_destino: 'amor',
    caminho_secundario: 'ancestralidade',
    significado_espiritual: 'Iemanjá governa o caminho do amor incondicional e da nutrição maternal. Seu destino é conduzir as almas através das águas emocionais, curando feridas ancestrais e restaurando a conexão com a source primordial. Ela representa a memória sagrada que flui através das gerações.',
    licao_central: 'Nutrir a si mesmo e aos outros com compaixão infinita e aceitação',
    numero_jornada: 2,
    elemento: 'água',
    tema_vida: 'Fertilidade, cura emocional, proteção maternal, ciclos de renovação'
  },
  'Oxum': {
    orixa: 'Oxum',
    caminho_destino: 'abundancia',
    caminho_secundario: 'amor',
    significado_espiritual: 'Oxum personifica a riqueza interior e a prosperidade material. Seu destino ensina que a abundância é um fluxo contínuo de energia que se amplifica através da generosidade e da gratidão. Como deusa das águas doces, ela revela que a prosperidade verdadeira começa no coração.',
    licao_central: 'Atrair abundância fluindo com gracejo, elegância e gratidão permanente',
    numero_jornada: 3,
    elemento: 'água',
    tema_vida: 'Prosperidade, beleza, sensualidade, fluxo graceful de recursos'
  },
  'Ogum': {
    orixa: 'Ogum',
    caminho_destino: 'guerra',
    caminho_secundario: 'protecao',
    significado_espiritual: 'Ogum é o guerreiro que abre caminhos através da determinação inabalável. Seu destino representa a capacidade de superar obstáculos, conquistar territórios internos e externos, e estabelecer novas fronteiras. Ele ensina que a verdadeira vitória vem da coragem de avançar.',
    licao_central: 'Afrontar desafios com coragem, persistência e estratégia guerreira',
    numero_jornada: 4,
    elemento: 'terra',
    tema_vida: 'Abertura de caminhos, proteção, conquista, superação de obstáculos'
  },
  'Oxóssi': {
    orixa: 'Oxóssi',
    caminho_destino: 'sabedoria',
    caminho_secundario: 'abundancia',
    significado_espiritual: 'Oxóssi representa o caçador espiritual que busca conhecimento através da observação e da experiência direta. Seu destino ensina que a sabedoria verdadeira vem da busca constante, da conexão com a natureza e da celebração das conquistas. Ele é o provedor que garante que nada falte.',
    licao_central: 'Buscar conhecimento com persistência e celebrar cada conquista com alegria',
    numero_jornada: 5,
    elemento: 'terra',
    tema_vida: 'Busca, prosperidade, conexão com a natureza, sabedoria ancestral'
  },
  'Xangô': {
    orixa: 'Xangô',
    caminho_destino: 'justice',
    caminho_secundario: 'transformacao',
    significado_espiritual: 'Xangô governa o caminho da justiça cósmica e da lei espiritual. Seu destino representa a capacidade de destruir o que não serve para reconstruir com maior força. Ele personifica o raio que revela a verdade e restabelece o equilíbrio quebrado.',
    licao_central: 'Restaurar a justiça através do poder, da verdade e da transformação强力',
    numero_jornada: 6,
    elemento: 'fogo',
    tema_vida: 'Justiça, poder, verdade, equilíbrio social, transformação强力'
  },
  'Iansã': {
    orixa: 'Iansã',
    caminho_destino: 'transformacao',
    caminho_secundario: 'guerra',
    significado_espiritual: 'Iansã é a guerreira das transformações radicais e das mudanças Bruscas. Seu destino ensina que a libertação verdadeira requer a capacidade de navegar através das tempestades da vida com determinação inabalável. Ela representa a revolution interior que libera as almas de correntes antigas.',
    licao_central: 'Abraçar a mudança radical com determinação e adaptar-se aos ventos da vida',
    numero_jornada: 7,
    elemento: 'fogo',
    tema_vida: 'Libertação, transformação, mudança, adaptação, revolution espiritual'
  },
  'Omolu': {
    orixa: 'Omolu',
    caminho_destino: 'transformacao',
    caminho_secundario: 'ancestralidade',
    significado_espiritual: 'Omolu é o senhor das doenças e da cura, das portas e do destino. Seu destino representa a capacidade de transformar a escuridão em luz e a doença em saúde. Ele ensina que através do confronto honesto com a escuridão encontramos a verdadeira cura e renascimento.',
    licao_central: 'Transformar a escuridão em luz através do confronto com os medos mais profundos',
    numero_jornada: 8,
    elemento: 'terra',
    tema_vida: 'Cura, renascimento, proteção contra males, transmutação de negatividades'
  },
  'Nanã': {
    orixa: 'Nanã',
    caminho_destino: 'ancestralidade',
    caminho_secundario: 'transformacao',
    significado_espiritual: 'Nanã é a anciã guardiã dos segredos ancestrais e da sabedoria dos anciãos. Seu destino ensina que a verdadeira sabedoria vem com o tempo, a experiência e a capacidade de transformer a matéria em essência espiritual. Ela representa a memória cósmica que conecta todas as gerações.',
    licao_central: 'Honrar os ancestrais e transformar a experiência de vida em sabedoria sagrada',
    numero_jornada: 9,
    elemento: 'água',
    tema_vida: 'Sabedoria anciã, segredos ancestrais, transformação da matéria, humildade'
  }
};

/**
 * Get Orixá destiny path correlation
 * @param orixa - Name of the Orixá (case-insensitive)
 * @returns OrixaDestiny mapping or undefined if not found
 */
export function getOrixaDestiny(orixa: string): OrixaDestiny | undefined {
  const normalized = orixa.toLowerCase().trim();
  return ORIXA_DESTINY_MAP[normalized] || 
    Object.values(ORIXA_DESTINY_MAP).find(
      entry => entry.orixa.toLowerCase() === normalized
    );
}

/**
 * Get all registered Orixás
 * @returns Array of all Orixá names
 */
export function getAllOrixas(): string[] {
  return Object.keys(ORIXA_DESTINY_MAP);
}

/**
 * Get all Orixá-destiny mappings
 * @returns Array of all OrixaDestiny objects
 */
export function getAllOrixaDestinies(): OrixaDestiny[] {
  return Object.values(ORIXA_DESTINY_MAP);
}

/**
 * Get Orixás by destiny path
 * @param caminho - Destiny path type
 * @returns Array of Orixás with that destiny path
 */
export function getOrixasByDestiny(caminho: DestinyPath): OrixaDestiny[] {
  return Object.values(ORIXA_DESTINY_MAP).filter(
    entry => entry.caminho_destino === caminho || entry.caminho_secundario === caminho
  );
}

/**
 * Get Orixás by element
 * @param elemento - Element type
 * @returns Array of Orixás with that primary element
 */
export function getOrixasByElement(elemento: OrixaDestiny['elemento']): OrixaDestiny[] {
  return Object.values(ORIXA_DESTINY_MAP).filter(
    entry => entry.elemento === elemento
  );
}

/**
 * Get destiny path statistics
 * @returns Record mapping each destiny path to its count of Orixás
 */
export function getDestinyPathStats(): Record<DestinyPath, number> {
  const stats: Partial<Record<DestinyPath, number>> = {};
  for (const entry of Object.values(ORIXA_DESTINY_MAP)) {
    stats[entry.caminho_destino] = (stats[entry.caminho_destino] || 0) + 1;
    if (entry.caminho_secundario) {
      stats[entry.caminho_secundario] = (stats[entry.caminho_secundario] || 0) + 0.5;
    }
  }
  return stats as Record<DestinyPath, number>;
}

export default {
  getOrixaDestiny,
  getAllOrixas,
  getAllOrixaDestinies,
  getOrixasByDestiny,
  getOrixasByElement,
  getDestinyPathStats,
};
