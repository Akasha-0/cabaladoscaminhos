/**
 * Tarot-Tarot Correlation Module
 * Maps Tarot Major Arcana cards to other Major Arcana cards through Tree of Life paths
 * Based on Qabalistic correspondences and Cabala dos Caminhos framework
 */

/**
 * Represents the correlation between a Tarot card and another Tarot card via a path
 */
export interface TarotTarotMapping {
  /** The source Major Arcana card name in Portuguese */
  arcano: string;
  /** The card number in the Major Arcana (0-21) */
  numero_carta: number;
  /** The related Major Arcana card (connected via Tree of Life path) */
  related_arcano: string;
  /** Related card number */
  related_numero: number;
  /** Type of path on the Tree of Life */
  path_type: 'diagonal' | 'horizontal' | 'vertical' | 'adjacent';
  /** Spiritual meaning of this correlation */
  spiritual_meaning: string;
}

// ─── Tarot Major Arcana to Tarot Major Arcana Path Mapping ───────────────────
// Maps Tarot cards to other Tarot cards through the 22 paths of the Tree of Life.
// Each correlation represents a spiritual journey or transformation between archetypes.

export const TAROT_TAROT_MAPPINGS: Record<string, TarotTarotMapping> = {
  'O Louco': {
    arcano: 'O Louco',
    numero_carta: 0,
    related_arcano: 'O Mago',
    related_numero: 1,
    path_type: 'diagonal',
    spiritual_meaning:
      'O louco inicia a jornada encontrando a vontade criadora. Do vazio transcendental emerge a intencao manifestadora que conecta o infinito ao mundo das formas.',
  },
  'O Mago': {
    arcano: 'O Mago',
    numero_carta: 1,
    related_arcano: 'A Sacerdotisa',
    related_numero: 2,
    path_type: 'horizontal',
    spiritual_meaning:
      'A vontade ativa do mago encontra a intuicao receptiva da sacerdotisa. O polo Yang e Yin da criacao se completam no primeiro par de opostos.',
  },
  'A Sacerdotisa': {
    arcano: 'A Sacerdotisa',
    numero_carta: 2,
    related_arcano: 'A Imperatriz',
    related_numero: 3,
    path_type: 'horizontal',
    spiritual_meaning:
      'A sabedoria oculta da sacerdotisa se manifesta na fertilidade visivel da imperatriz. O divino feminino revela-se atraves da natureza abundante.',
  },
  'A Imperatriz': {
    arcano: 'A Imperatriz',
    numero_carta: 3,
    related_arcano: 'O Imperador',
    related_numero: 4,
    path_type: 'horizontal',
    spiritual_meaning:
      'A fertilidade receptiva da imperatriz encontra a estrutura formadora do imperador. A natureza encontra a lei na dualidade criativa do mundo.',
  },
  'O Imperador': {
    arcano: 'O Imperador',
    numero_carta: 4,
    related_arcano: 'O Hierofante',
    related_numero: 5,
    path_type: 'horizontal',
    spiritual_meaning:
      'O poder mundano do imperador reconhece a autoridade espiritual do hierofante. A lei secular se curva diante da lei sagrada no servico ao divino.',
  },
  'O Hierofante': {
    arcano: 'O Hierofante',
    numero_carta: 5,
    related_arcano: 'Os Enamorados',
    related_numero: 6,
    path_type: 'horizontal',
    spiritual_meaning:
      'O ensinamento sagrado do hierofante culmina na escolha sagrada dos enamorados. A tradicao espiritual guia a uniao dos opostos no caminho do coracao.',
  },
  'Os Enamorados': {
    arcano: 'Os Enamorados',
    numero_carta: 6,
    related_arcano: 'O Carro',
    related_numero: 7,
    path_type: 'horizontal',
    spiritual_meaning:
      'A escolha amorosa dos enamorados invoca a vitoria do carro. O casamento interior prepara o guerreiro para sua cruzada espiritual.',
  },
  'O Carro': {
    arcano: 'O Carro',
    numero_carta: 7,
    related_arcano: 'A Justica',
    related_numero: 8,
    path_type: 'horizontal',
    spiritual_meaning:
      'A vitoria do carro se sublima na justica divina. O guerreiro vence batalhas externas mas deve conquistar o equilibrio interno.',
  },
  'A Justica': {
    arcano: 'A Justica',
    numero_carta: 8,
    related_arcano: 'O Eremita',
    related_numero: 9,
    path_type: 'horizontal',
    spiritual_meaning:
      'O equilibrio da justica revela-se na solidao do eremita. A lei cosmica se torna visivel ao buscador que caminha sozinho na escuridao.',
  },
  'O Eremita': {
    arcano: 'O Eremita',
    numero_carta: 9,
    related_arcano: 'A Roda da Fortuna',
    related_numero: 10,
    path_type: 'horizontal',
    spiritual_meaning:
      'A iluminacao solitaria do eremita encontra a roda do destino. A luz interior ilumina os ciclos cosmicos que governam toda existencia.',
  },
  'A Roda da Fortuna': {
    arcano: 'A Roda da Fortuna',
    numero_carta: 10,
    related_arcano: 'A Forca',
    related_numero: 11,
    path_type: 'horizontal',
    spiritual_meaning:
      'Os ciclos da roda preparam a forca interior. O destino externo ativa o poder do coracao quando o buscador compreende sua agencia no jogo cosmico.',
  },
  'A Forca': {
    arcano: 'A Forca',
    numero_carta: 11,
    related_arcano: 'O Enforcado',
    related_numero: 12,
    path_type: 'horizontal',
    spiritual_meaning:
      'A forca do coracao se completa no sacrificio do enforcado. A coragem ativa cede a sabedoria passiva quando o ego se entrega ao divino.',
  },
  'O Enforcado': {
    arcano: 'O Enforcado',
    numero_carta: 12,
    related_arcano: 'A Morte',
    related_numero: 13,
    path_type: 'horizontal',
    spiritual_meaning:
      'O sacrificio do enforcado precede a grande transformacao da morte. A entrega voluntaria e pre-requisito para o renascimento espiritual.',
  },
  'A Morte': {
    arcano: 'A Morte',
    numero_carta: 13,
    related_arcano: 'A Temperanca',
    related_numero: 14,
    path_type: 'horizontal',
    spiritual_meaning:
      'A morte necessaria abre caminho para a temperanca alquimica. A transformacao destruidora precede a integracao das polaridades.',
  },
  'A Temperanca': {
    arcano: 'A Temperanca',
    numero_carta: 14,
    related_arcano: 'O Diabo',
    related_numero: 15,
    path_type: 'horizontal',
    spiritual_meaning:
      'O equilibrio da temperanca confronta a inversao do diabo. A alquimia interior deve transmutar as sombras antes de alcancar a liberdade.',
  },
  'O Diabo': {
    arcano: 'O Diabo',
    numero_carta: 15,
    related_arcano: 'A Torre',
    related_numero: 16,
    path_type: 'horizontal',
    spiritual_meaning:
      'A libertacao das prisoes do diabo explode na destruicao da torre. Os grilhoes autoimpostos se revelam e sao destruidos por uma revelacao subita.',
  },
  'A Torre': {
    arcano: 'A Torre',
    numero_carta: 16,
    related_arcano: 'A Estrela',
    related_numero: 17,
    path_type: 'horizontal',
    spiritual_meaning:
      'A destruicao da torre abre espaco para a esperanca renovadora da estrela. O antigo edificio das ilusoes colapsa para que a nova luz possa brilhar.',
  },
  'A Estrela': {
    arcano: 'A Estrela',
    numero_carta: 17,
    related_arcano: 'A Lua',
    related_numero: 18,
    path_type: 'horizontal',
    spiritual_meaning:
      'A esperanca da estrela enfrenta as ilusoes da lua. A fe inabalavel deve navegar pelos mares emocionais do inconscio para manter sua luz.',
  },
  'A Lua': {
    arcano: 'A Lua',
    numero_carta: 18,
    related_arcano: 'O Sol',
    related_numero: 19,
    path_type: 'horizontal',
    spiritual_meaning:
      'As ilusoes lunares se dissolvem na claridade solar. O inconscio revela sua verdade quando a luz da consciencia ilumina todas as sombras.',
  },
  'O Sol': {
    arcano: 'O Sol',
    numero_carta: 19,
    related_arcano: 'O Julgamento',
    related_numero: 20,
    path_type: 'horizontal',
    spiritual_meaning:
      'A verdade solar invoca o despertar do julgamento. O brilho proprio manifesta o proposito de vida que responde ao chamado da alma.',
  },
  'O Julgamento': {
    arcano: 'O Julgamento',
    numero_carta: 20,
    related_arcano: 'O Mundo',
    related_numero: 21,
    path_type: 'horizontal',
    spiritual_meaning:
      'O despertar do julgamento abre as portas para a completude do mundo. O chamado da alma encontra sua expressao na integracao final.',
  },
  'O Mundo': {
    arcano: 'O Mundo',
    numero_carta: 21,
    related_arcano: 'O Louco',
    related_numero: 0,
    path_type: 'vertical',
    spiritual_meaning:
      'O mundo completo retorna ao louco que iniciou a jornada. A espiral se fecha e se abre novamente em um ciclo renovado de consciencia.',
  },
} as const;

// Freeze the mapping object to prevent modifications
Object.freeze(TAROT_TAROT_MAPPINGS);
Object.values(TAROT_TAROT_MAPPINGS).forEach((mapping) => Object.freeze(mapping));

/**
 * Get the Tarot-Tarot correlation mapping for a given arcano
 * @param arcano - The arcano name (e.g., 'O Sol', 'A Lua', 'O Mago')
 * @returns The correlation mapping or null if not found
 */
export function getTarotTarot(arcano: string): TarotTarotMapping | null {
  return TAROT_TAROT_MAPPINGS[arcano] ?? null;
}

/**
 * Get all Tarot-Tarot path mappings
 * @returns Array of all correlation mappings sorted by source card number
 */
export function getAllTarotPaths(): TarotTarotMapping[] {
  return Object.values(TAROT_TAROT_MAPPINGS).sort(
    (a, b) => a.numero_carta - b.numero_carta
  );
}

/**
 * Get all path types used in the mapping
 * @returns Array of unique path types
 */
export function getAllPathTypes(): string[] {
  const types = new Set(Object.values(TAROT_TAROT_MAPPINGS).map((m) => m.path_type));
  return [...types];
}

/**
 * Get all mappings for a specific path type
 * @param path_type - The type of path ('diagonal' | 'horizontal' | 'vertical' | 'adjacent')
 * @returns Array of mappings with this path type
 */
export function getPathsByType(path_type: string): TarotTarotMapping[] {
  return Object.values(TAROT_TAROT_MAPPINGS).filter(
    (mapping) => mapping.path_type === path_type
  );
}

/**
 * Get all mappings related to a specific arcano
 * @param arcano - The arcano name
 * @returns Array of all mappings involving this arcano (as source or related)
 */
export function getArcanoRelations(arcano: string): TarotTarotMapping[] {
  return Object.values(TAROT_TAROT_MAPPINGS).filter(
    (mapping) => mapping.arcano === arcano || mapping.related_arcano === arcano
  );
}

/**
 * Check if a path between two arcanos exists
 * @param arcano - Source arcano
 * @param related_arcano - Target arcano
 * @returns True if a path mapping exists between the two cards
 */
export function hasPath(arcano: string, related_arcano: string): boolean {
  return Object.values(TAROT_TAROT_MAPPINGS).some(
    (m) =>
      (m.arcano === arcano && m.related_arcano === related_arcano) ||
      (m.arcano === related_arcano && m.related_arcano === arcano)
  );
}

/**
 * Get all unique arcano names in the mapping
 * @returns Array of arcano names sorted by card number
 */
export function getAllArcanos(): string[] {
  const seen = new Set<number>();
  const result: string[] = [];

  Object.values(TAROT_TAROT_MAPPINGS).forEach((mapping) => {
    if (!seen.has(mapping.numero_carta)) {
      seen.add(mapping.numero_carta);
      result.push(mapping.arcano);
    }
  });

  return result.sort((a, b) => {
    const aNum = TAROT_TAROT_MAPPINGS[a]?.numero_carta ?? 99;
    const bNum = TAROT_TAROT_MAPPINGS[b]?.numero_carta ?? 99;
    return aNum - bNum;
  });
}

export default {
  getTarotTarot,
  getAllTarotPaths,
  getAllPathTypes,
  getPathsByType,
  getArcanoRelations,
  hasPath,
  getAllArcanos,
  TAROT_TAROT_MAPPINGS,
};
