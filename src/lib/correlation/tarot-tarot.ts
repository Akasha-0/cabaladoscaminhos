/**
 * Tarot-Tarot Correlation Module
 * Maps spiritual relationships between Major Arcana cards based on Kabbalistic Tree of Life paths
 * Astrological relationship types: Trino, Sextil, Quadratura, Oposição, Sequência, Complementar, Ancestral
 */

export type TarotPathType =
  | 'Trino'           // 120° - harmonious trine aspect
  | 'Sextil'          // 60° - opportunity sextile aspect
  | 'Quadratura'      // 90° - challenging square aspect
  | 'Oposição'        // 180° - opposing aspect
  | 'Sequência'       // Sequential journey relationship
  | 'Complementar'    // Complementary energies
  | 'Ancestral';      // Ancestral/deep connection

export interface TarotTarotMapping {
  /** The Major Arcana card name in format "0 - O Louco", "I - O Mago", etc. */
  arcano: string;
  /** The card number (0-21) */
  numero_carta: number;
  /** The related Major Arcana card name */
  related_arcano: string;
  /** The related card number (0-21) */
  related_numero: number;
  /** Type of spiritual connection (astrological aspect type) */
  path_type: TarotPathType;
  /** Detailed spiritual meaning with crescimento, desafio, significado, ritual */
  spiritual_meaning: {
    significado: string;
    crescimento: string;
    desafio: string;
    ritual: string;
  };
  /** Energy flow direction */
  energy_flow: 'unidirectional';
}

// All 22 Major Arcana cards in astrological format
export const ALL_MAJOR_ARCANOS: readonly string[] = [
  '0 - O Louco',           // 0
  'I - O Mago',            // 1
  'II - A Alta Sacerdotisa', // 2
  'III - A Imperatriz',    // 3
  'IV - O Imperador',      // 4
  'V - O Hierofante',      // 5
  'VI - Os Enamorados',    // 6
  'VII - O Carro',         // 7
  'VIII - A Justiça',      // 8
  'IX - O Eremita',        // 9
  'X - A Roda da Fortuna', // 10
  'XI - A Força',          // 11
  'XII - O Enforcado',     // 12
  'XIII - A Morte',        // 13
  'XIV - A Temperança',    // 14
  'XV - O Diabo',          // 15
  'XVI - A Torre',         // 16
  'XVII - A Estrela',      // 17
  'XVIII - A Lua',         // 18
  'XIX - O Sol',           // 19
  'XX - O Julgamento',     // 20
  'XXI - O Mundo',         // 21
] as const;

// Card number lookup
const ARCANO_NUMBERS: Record<string, number> = {
  '0 - O Louco': 0, 'I - O Mago': 1, 'II - A Alta Sacerdotisa': 2,
  'III - A Imperatriz': 3, 'IV - O Imperador': 4, 'V - O Hierofante': 5,
  'VI - Os Enamorados': 6, 'VII - O Carro': 7, 'VIII - A Justiça': 8,
  'IX - O Eremita': 9, 'X - A Roda da Fortuna': 10, 'XI - A Força': 11,
  'XII - O Enforcado': 12, 'XIII - A Morte': 13, 'XIV - A Temperança': 14,
  'XV - O Diabo': 15, 'XVI - A Torre': 16, 'XVII - A Estrela': 17,
  'XVIII - A Lua': 18, 'XIX - O Sol': 19, 'XX - O Julgamento': 20,
  'XXI - O Mundo': 21,
};

/**
 * Tarot-Tarot relationship mappings
 * Based on astrological aspects and spiritual connections between Major Arcana cards
 */
const TAROT_TAROT_MAP: TarotTarotMapping[] = [
  // Sequência - Sequential journey relationships (Fool's journey path)
  { arcano: '0 - O Louco', numero_carta: 0, related_arcano: 'I - O Mago', related_numero: 1, path_type: 'Sequência', spiritual_meaning: { significado: 'Iniciação e despertar da consciência; o primeiro passo na jornada espiritual', crescimento: 'Transformar a inocência em sabedoria através da experiência', desafio: 'Preservar a maravilha enquanto se ganha conhecimento', ritual: 'Meditação de integração ao anoitecer, revisitando todas as lições aprendidas' }, energy_flow: 'unidirectional' },
  { arcano: 'I - O Mago', numero_carta: 1, related_arcano: 'II - A Alta Sacerdotisa', related_numero: 2, path_type: 'Sequência', spiritual_meaning: { significado: 'Manifestação do poder divino através da sabedoria interior', crescimento: 'Desenvolver a vontade criativa em harmonia com a intuição', desafio: 'Equilibrar ação e receptividade', ritual: 'Ritual de invocação com espelho ao amanhecer' }, energy_flow: 'unidirectional' },
  { arcano: 'II - A Alta Sacerdotisa', numero_carta: 2, related_arcano: 'III - A Imperatriz', related_numero: 3, path_type: 'Sequência', spiritual_meaning: { significado: 'Transição do conhecimento oculto para a expressão criativa', crescimento: 'Integrar sabedoria intuitiva com fertilidade criativa', desafio: 'Permitir que a criação flua sem resistência', ritual: 'Ritual lunar de meditação no feminino sagrado' }, energy_flow: 'unidirectional' },
  { arcano: 'III - A Imperatriz', numero_carta: 3, related_arcano: 'IV - O Imperador', related_numero: 4, path_type: 'Sequência', spiritual_meaning: { significado: 'Equilíbrio entre força criativa e autoridade estrutural', crescimento: 'Desenvolver autodisciplina sem sufocar a criatividade', desafio: 'Integrar feminilidade e estrutura', ritual: 'Ritual de abundancia com crystal de quartzo' }, energy_flow: 'unidirectional' },
  { arcano: 'IV - O Imperador', numero_carta: 4, related_arcano: 'V - O Hierofante', related_numero: 5, path_type: 'Sequência', spiritual_meaning: { significado: 'Autoridade espiritual e tradição sagrada', crescimento: 'Aplicar a autoridade com sabedoria e compaixão', desafio: 'Não se tornar rígido ou dominador', ritual: 'Ritual de oração e estudo às 12h' }, energy_flow: 'unidirectional' },
  { arcano: 'V - O Hierofante', numero_carta: 5, related_arcano: 'VI - Os Enamorados', related_numero: 6, path_type: 'Sequência', spiritual_meaning: { significado: 'Transformação espiritual através das escolhas e uniões', crescimento: 'Aprender que o amor é a maior sabedoria', desafio: 'Escolher com o coração e não apenas com a mente', ritual: 'Ritual de瑜伽 e respiración meditativa' }, energy_flow: 'unidirectional' },
  { arcano: 'VI - Os Enamorados', numero_carta: 6, related_arcano: 'VII - O Carro', related_numero: 7, path_type: 'Sequência', spiritual_meaning: { significado: 'Assertividade na busca do equilíbrio e harmonia', crescimento: 'Integrar pares de opostos através do amor', desafio: 'Manter harmonia sem perder individualidade', ritual: 'Ritual de compromiso com velas rojas' }, energy_flow: 'unidirectional' },
  { arcano: 'VII - O Carro', numero_carta: 7, related_arcano: 'VIII - A Justiça', related_numero: 8, path_type: 'Sequência', spiritual_meaning: { significado: 'Vitória através do alinhamento com a lei divina', crescimento: 'Conquistar a vitória com integridade', desafio: 'Equilibrar força e compaixão', ritual: 'Ritual de vitória com incenso de sálvia' }, energy_flow: 'unidirectional' },
  { arcano: 'VIII - A Justiça', numero_carta: 8, related_arcano: 'IX - O Eremita', related_numero: 9, path_type: 'Sequência', spiritual_meaning: { significado: 'Iluminação interior e busca pela verdade', crescimento: 'Desenvolver sabedoria através da introspecção', desafio: 'Buscar a verdade mesmo quando desconfortável', ritual: 'Ritual de meditação em silencio ao amanhecer' }, energy_flow: 'unidirectional' },
  { arcano: 'IX - O Eremita', numero_carta: 9, related_arcano: 'X - A Roda da Fortuna', related_numero: 10, path_type: 'Sequência', spiritual_meaning: { significado: 'Ciclos cósmicos e transformação através da introspecção', crescimento: 'Aceitar que a solidão é caminho para a sabedoria', desafio: 'Não se isolar completamente', ritual: 'Ritual de caminhata solitária em contato com a natureza' }, energy_flow: 'unidirectional' },
  { arcano: 'X - A Roda da Fortuna', numero_carta: 10, related_arcano: 'XI - A Força', related_numero: 11, path_type: 'Sequência', spiritual_meaning: { significado: 'Ação correta no momento certo; coragem diante do destino', crescimento: 'Abracar os ciclos da vida com coragem', desafio: 'Aceitar mudanças sem resistência', ritual: 'Ritual de gira com velas e crystals' }, energy_flow: 'unidirectional' },
  { arcano: 'XI - A Força', numero_carta: 11, related_arcano: 'XII - O Enforcado', related_numero: 12, path_type: 'Sequência', spiritual_meaning: { significado: 'Sacrifício voluntário e maestria sobre os instintos', crescimento: 'Desenvolver força interior através da paciência', desafio: 'Dominar os impulsos sem perder a essência', ritual: 'Ritual de oração com mãos em posição de弓' }, energy_flow: 'unidirectional' },
  { arcano: 'XII - O Enforcado', numero_carta: 12, related_arcano: 'XIII - A Morte', related_numero: 13, path_type: 'Sequência', spiritual_meaning: { significado: 'Metamorfose e renascimento através da aceitação', crescimento: 'Aprender que sacrifício leva à transformação', desafio: 'Aceitar o sacrifício com graça', ritual: 'Ritual de cierre com agua de rosas' }, energy_flow: 'unidirectional' },
  { arcano: 'XIII - A Morte', numero_carta: 13, related_arcano: 'XIV - A Temperança', related_numero: 14, path_type: 'Sequência', spiritual_meaning: { significado: 'Equilíbrio entre extremos; integração das sombras', crescimento: 'Transformar o medo da morte em aceitar mudanças', desafio: 'Abraçar a transformação sem medo', ritual: 'Ritual de limpieza con sal y romero' }, energy_flow: 'unidirectional' },
  { arcano: 'XIV - A Temperança', numero_carta: 14, related_arcano: 'XV - O Diabo', related_numero: 15, path_type: 'Sequência', spiritual_meaning: { significado: 'Confronto com as ilusões e libertação das amarras', crescimento: 'Integrar aspectos aparentemente opostos', desafio: 'Equilibrar matéria e espírito', ritual: 'Ritual de harmonização com agua e sal' }, energy_flow: 'unidirectional' },
  { arcano: 'XV - O Diabo', numero_carta: 15, related_arcano: 'XVI - A Torre', related_numero: 16, path_type: 'Sequência', spiritual_meaning: { significado: 'Destruição das prisões internas; revelação abrupta', crescimento: 'Libertar-se das amarras do ego', desafio: 'Reconhecer armadilhas sem cair nelas', ritual: 'Ritual de desatadura con vela negra' }, energy_flow: 'unidirectional' },
  { arcano: 'XVI - A Torre', numero_carta: 16, related_arcano: 'XVII - A Estrela', related_numero: 17, path_type: 'Sequência', spiritual_meaning: { significado: 'Catarse e renovação; esperança após a queda', crescimento: 'Aceitar que a destruição precede a reconstrução', desafio: 'Encontrar esperança após a queda', ritual: 'Ritual de novo comienzo con velas doradas' }, energy_flow: 'unidirectional' },
  { arcano: 'XVII - A Estrela', numero_carta: 17, related_arcano: 'XVIII - A Lua', related_numero: 18, path_type: 'Sequência', spiritual_meaning: { significado: 'Luz na escuridão; cura e inspiração', crescimento: 'Restaura a esperança e conexão espiritual', desafio: 'Manter fé durante a noite escura', ritual: 'Ritual de oração bajo la luz de las estrellas' }, energy_flow: 'unidirectional' },
  { arcano: 'XVIII - A Lua', numero_carta: 18, related_arcano: 'XIX - O Sol', related_numero: 19, path_type: 'Sequência', spiritual_meaning: { significado: 'Dissipação das ilusões; clareza e alegria', crescimento: 'Superar medos e ilusões para encontrar luz', desafio: 'Discernir verdade de ilusão', ritual: 'Ritual de purificación con água de lua cheia' }, energy_flow: 'unidirectional' },
  { arcano: 'XIX - O Sol', numero_carta: 19, related_arcano: 'XX - O Julgamento', related_numero: 20, path_type: 'Sequência', spiritual_meaning: { significado: 'Transcendência e despertar da alma', crescimento: 'Celebrar a vitória e o sucesso', desafio: 'Compartilhar luz sem soberba', ritual: 'Ritual de celebración con flores amarillas' }, energy_flow: 'unidirectional' },
  { arcano: 'XX - O Julgamento', numero_carta: 20, related_arcano: 'XXI - O Mundo', related_numero: 21, path_type: 'Sequência', spiritual_meaning: { significado: 'Realização completa; síntese da jornada espiritual', crescimento: 'Integrar todas as lições da jornada', desafio: 'Aceitar a recompensa merecida', ritual: 'Ritual de encerramento com canto e música' }, energy_flow: 'unidirectional' },

  // Oposição - 180° opposing aspect
  { arcano: 'I - O Mago', numero_carta: 1, related_arcano: 'XVI - A Torre', related_numero: 16, path_type: 'Oposição', spiritual_meaning: { significado: 'Confronto entre ação criadora e destruição necessária', crescimento: 'Transformar obstáculos em catalisadores de mudança', desafio: 'Aceitar que nem toda destruição é negativa', ritual: 'Ritual de transformação pessoal ao entardecer' }, energy_flow: 'unidirectional' },
  { arcano: 'II - A Alta Sacerdotisa', numero_carta: 2, related_arcano: 'XV - O Diabo', related_numero: 15, path_type: 'Oposição', spiritual_meaning: { significado: 'Intuição versus tentação; conhecimento oculto versus ilusão', crescimento: 'Usar a sabedoria para resistir às tentações', desafio: 'Distinguir intuição de medo', ritual: 'Ritual de proteção com sal e água lunar' }, energy_flow: 'unidirectional' },
  { arcano: 'III - A Imperatriz', numero_carta: 3, related_arcano: 'XIV - A Temperança', related_numero: 14, path_type: 'Oposição', spiritual_meaning: { significado: 'Fertilidade versus equilíbrio; emoção versus moderação', crescimento: 'Integrar criatividade com equilíbrio', desafio: 'Evitar extremos em qualquer direção', ritual: 'Ritual de harmonização com cristais de quartzo rosa' }, energy_flow: 'unidirectional' },

  // Trino - 120° harmonious aspect
  { arcano: 'I - O Mago', numero_carta: 1, related_arcano: 'XI - A Força', related_numero: 11, path_type: 'Trino', spiritual_meaning: { significado: 'Harmonia entre poder criativo e força interior', crescimento: 'Canalizar energía criativa com coragem', desafio: 'Não abuse do poder conquistado', ritual: 'Ritual de empoderamiento con vela verde' }, energy_flow: 'unidirectional' },
  { arcano: 'II - A Alta Sacerdotisa', numero_carta: 2, related_arcano: 'X - A Roda da Fortuna', related_numero: 10, path_type: 'Trino', spiritual_meaning: { significado: 'Intuição alinhada com os ciclos cósmicos', crescimento: 'Fluir com os ciclos da vida', desafio: 'Não resistir às mudanças', ritual: 'Ritual de alinhamento com a lua crescente' }, energy_flow: 'unidirectional' },
  { arcano: 'III - A Imperatriz', numero_carta: 3, related_arcano: 'VII - O Carro', related_numero: 7, path_type: 'Trino', spiritual_meaning: { significado: 'Criatividade em movimento harmonioso', crescimento: 'Transformar ideias em ação criativa', desafio: 'Manter equilíbrio enquanto avança', ritual: 'Ritual de creación com incenso de jazmín' }, energy_flow: 'unidirectional' },

  // Sextil - 60° opportunity aspect
  { arcano: 'IV - O Imperador', numero_carta: 4, related_arcano: 'VI - Os Enamorados', related_numero: 6, path_type: 'Sextil', spiritual_meaning: { significado: 'Estrutura encontra harmonia através do amor', crescimento: 'Construir relacionamentos sólidos', desafio: 'Permitir flexibilidade na estrutura', ritual: 'Ritual de harmonização familiar ao anoitecer' }, energy_flow: 'unidirectional' },
  { arcano: 'V - O Hierofante', numero_carta: 5, related_arcano: 'IX - O Eremita', related_numero: 9, path_type: 'Sextil', spiritual_meaning: { significado: 'Tradição encontra sabedoria interior', crescimento: 'Conectar tradição com intuição pessoal', desafio: 'Não seguir cegamente nem abandonar a tradição', ritual: 'Ritual de oração estruturada ao amanhecer' }, energy_flow: 'unidirectional' },
  { arcano: 'VI - Os Enamorados', numero_carta: 6, related_arcano: 'XII - O Enforcado', related_numero: 12, path_type: 'Sextil', spiritual_meaning: { significado: 'Escolhas de amor levam a sacrifícios iluminados', crescimento: 'Fazer escolhas que sirvam ao bem maior', desafio: 'Sacrificar sem amargura', ritual: 'Ritual de entrega com velas azuis' }, energy_flow: 'unidirectional' },

  // Quadratura - 90° challenging aspect
  { arcano: 'IV - O Imperador', numero_carta: 4, related_arcano: 'XII - O Enforcado', related_numero: 12, path_type: 'Quadratura', spiritual_meaning: { significado: 'Conflito entre autoridade e sacrifício', crescimento: 'Aprender que verdadeiro poder inclui sacrifício', desafio: 'Soltar controle para encontrar liberdade', ritual: 'Ritual de soltura com vela roxa' }, energy_flow: 'unidirectional' },
  { arcano: 'VI - Os Enamorados', numero_carta: 6, related_arcano: 'XII - O Enforcado', related_numero: 12, path_type: 'Quadratura', spiritual_meaning: { significado: 'Tensão entre escolha e entrega', crescimento: 'Transformar tensão em crescimento', desafio: 'Equilibrar desejos pessoais com entrega', ritual: 'Ritual de meditação de coração aberto' }, energy_flow: 'unidirectional' },

  // Complementar - Complementary energies
  { arcano: '0 - O Louco', numero_carta: 0, related_arcano: 'X - A Roda da Fortuna', related_numero: 10, path_type: 'Complementar', spiritual_meaning: { significado: 'Inocência encontra destino; liberdade encontra ciclos', crescimento: 'Aceitar que destino e liberdade coexistem', desafio: 'Não se perder nem no destino nem na liberdade', ritual: 'Ritual de integração entre destino e livre-arbítrio' }, energy_flow: 'unidirectional' },
  { arcano: 'VIII - A Justiça', numero_carta: 8, related_arcano: 'X - A Roda da Fortuna', related_numero: 10, path_type: 'Complementar', spiritual_meaning: { significado: 'Lei encontra destino; ordem encontra ciclos', crescimento: 'Aceitar que destino tem sua própria justiça', desafio: 'Confiar no timing divino', ritual: 'Ritual de aceitação ao entardecer' }, energy_flow: 'unidirectional' },

  // Ancestral - Deep ancestral connection
  { arcano: 'XIX - O Sol', numero_carta: 19, related_arcano: '0 - O Louco', related_numero: 0, path_type: 'Ancestral', spiritual_meaning: { significado: 'O Sol é a culminação, O Louco é o recomeço. O ciclo completo que volta ao início', crescimento: 'Compreender que completude é também novo começo', desafio: 'Aceitar que o final é também um começo', ritual: 'Ritual de encerramento de ciclo e preparação para novo salto' }, energy_flow: 'unidirectional' },
  { arcano: 'XXI - O Mundo', numero_carta: 21, related_arcano: '0 - O Louco', related_numero: 0, path_type: 'Ancestral', spiritual_meaning: { significado: 'O Louco busca a completude que O Mundo oferece. A jornada do zero ao vinte e um representa a integração total', crescimento: 'Integrar todas as experiências da jornada', desafio: 'Preservar a maravilha enquanto se ganha conhecimento', ritual: 'Meditação de integração ao anoitecer, revisitando todas as lições aprendidas' }, energy_flow: 'unidirectional' },
];

// Constants
export const TOTAL_MAPPINGS = TAROT_TAROT_MAP.length;
export const TOTAL_PATH_TYPES = 7 as const;

// Create lookup map
export const TAROT_TAROT_MAPPINGS = TAROT_TAROT_MAP;

// Freeze the mapping to prevent modifications
Object.freeze(TAROT_TAROT_MAP);
TAROT_TAROT_MAP.forEach((mapping) => Object.freeze(mapping));

/**
 * Normalize arcano name for lookup (handle format variations)
 */
function normalizeArcano(name: string): string {
  const lower = name.toLowerCase();
  
  // Map variations to standard format
  const variations: Record<string, string> = {
    'o louco': '0 - O Louco', '0 o louco': '0 - O Louco', '0-o louco': '0 - O Louco',
    'o mago': 'I - O Mago', 'i o mago': 'I - O Mago', 'i-o mago': 'I - O Mago',
    'a alta sacerdotisa': 'II - A Alta Sacerdotisa', 'ii a alta sacerdotisa': 'II - A Alta Sacerdotisa',
    'a imperatriz': 'III - A Imperatriz', 'iii a imperatriz': 'III - A Imperatriz',
    'o imperador': 'IV - O Imperador', 'iv o imperador': 'IV - O Imperador',
    'o hierofante': 'V - O Hierofante', 'v o hierofante': 'V - O Hierofante',
    'os enamorados': 'VI - Os Enamorados', 'vi os enamorados': 'VI - Os Enamorados',
    'o carro': 'VII - O Carro', 'vii o carro': 'VII - O Carro',
    'a justiça': 'VIII - A Justiça', 'viii a justiça': 'VIII - A Justiça',
    'o eremita': 'IX - O Eremita', 'ix o eremita': 'IX - O Eremita',
    'a roda da fortuna': 'X - A Roda da Fortuna', 'x a roda da fortuna': 'X - A Roda da Fortuna',
    'a força': 'XI - A Força', 'xi a força': 'XI - A Força',
    'o enforcado': 'XII - O Enforcado', 'xii o enforcado': 'XII - O Enforcado',
    'a morte': 'XIII - A Morte', 'xiii a morte': 'XIII - A Morte',
    'a temperança': 'XIV - A Temperança', 'xiv a temperança': 'XIV - A Temperança',
    'o diabo': 'XV - O Diabo', 'xv o diabo': 'XV - O Diabo',
    'a torre': 'XVI - A Torre', 'xvi a torre': 'XVI - A Torre',
    'a estrela': 'XVII - A Estrela', 'xvii a estrela': 'XVII - A Estrela',
    'a lua': 'XVIII - A Lua', 'xviii a lua': 'XVIII - A Lua',
    'o sol': 'XIX - O Sol', 'xix o sol': 'XIX - O Sol',
    'o julgamento': 'XX - O Julgamento', 'xx o julgamento': 'XX - O Julgamento',
    'o mundo': 'XXI - O Mundo', 'xxi o mundo': 'XXI - O Mundo',
  };
  
  if (variations[lower]) return variations[lower];
  
  // Try exact match in ALL_MAJOR_ARCANOS
  for (const arcano of ALL_MAJOR_ARCANOS) {
    if (arcano.toLowerCase() === lower) return arcano;
  }
  
  return name;
}

/**
 * Get the Tarot-Tarot correlation mapping between two arcanos
 * Returns single mapping (directional - arcano -> related_arcano)
 * @param arcano - The source arcano name
 * @param related_arcano - The target arcano name
 * @returns The correlation mapping or null if not found
 */
export function getTarotTarot(arcano: string, related_arcano: string): TarotTarotMapping | null {
  const normalized1 = normalizeArcano(arcano);
  const normalized2 = normalizeArcano(related_arcano);
  
  // Directional lookup: arcano -> related_arcano
  return TAROT_TAROT_MAP.find(
    (m) => m.arcano === normalized1 && m.related_arcano === normalized2
  ) ?? null;
}

/**
 * Get all Tarot-Tarot correlations
 * @returns Array of all correlation mappings
 */
export function getAllTarotPaths(): TarotTarotMapping[] {
  return TAROT_TAROT_MAP;
}

/**
 * Get all unique path types
 * @returns Array of all path types in use
 */
export function getAllPathTypes(): TarotPathType[] {
  return ['Trino', 'Sextil', 'Quadratura', 'Oposição', 'Sequência', 'Complementar', 'Ancestral'];
}

/**
 * Get all mapped arcanos
 * @returns Array of unique arcano names
 */
export function getAllMappedArcanos(): string[] {
  return [...new Set(TAROT_TAROT_MAP.flatMap(m => [m.arcano, m.related_arcano]))];
}

/**
 * Get all relationships for a specific arcano
 * @param arcano - Arcano name to find relationships for
 * @returns Array of TarotTarotMapping objects where the arcano appears
 */
export function getAllArcanoRelations(arcano: string): TarotTarotMapping[] {
  const normalized = normalizeArcano(arcano);
  return TAROT_TAROT_MAP.filter(
    (m) => m.arcano === normalized || m.related_arcano === normalized
  );
}

/**
 * Alias for getAllArcanoRelations
 */
export const getRelationsForArcano = getAllArcanoRelations;

/**
 * Get relationships by path type
 * @param type - Path type to filter by
 * @returns Array of TarotTarotMapping objects of the specified type
 */
export function getPathsByType(type: TarotPathType): TarotTarotMapping[] {
  return TAROT_TAROT_MAP.filter((m) => m.path_type === type);
}

/**
 * Alias for getPathsByType
 */
export const getRelationsByPathType = getPathsByType;

/**
 * Get path type between two arcanos
 * @param arcano - Source arcano
 * @param related - Target arcano
 * @returns Path type or null if no relation exists
 */
export function getPathTypeBetween(arcano: string, related: string): TarotPathType | null {
  const normalized1 = normalizeArcano(arcano);
  const normalized2 = normalizeArcano(related);
  
  const mapping = TAROT_TAROT_MAP.find(
    (m) => m.arcano === normalized1 && m.related_arcano === normalized2
  );
  return mapping?.path_type ?? null;
}

/**
 * Get spiritual meaning between two arcanos
 * @param arcano - Source arcano
 * @param related - Target arcano
 * @returns Spiritual meaning object or null if no relation exists
 */
export function getSpiritualMeaningBetween(arcano: string, related: string): TarotTarotMapping['spiritual_meaning'] | null {
  const normalized1 = normalizeArcano(arcano);
  const normalized2 = normalizeArcano(related);
  
  const mapping = TAROT_TAROT_MAP.find(
    (m) => m.arcano === normalized1 && m.related_arcano === normalized2
  );
  return mapping?.spiritual_meaning ?? null;
}

/**
 * Check if two arcanos have a correlation
 * @param arcano - Source arcano
 * @param related - Target arcano
 * @returns True if correlation exists
 */
export function hasRelation(arcano: string, related: string): boolean {
  return getPathTypeBetween(arcano, related) !== null;
}

/**
 * Alias for hasRelation
 */
export const hasTarotTarot = hasRelation;

/**
 * Get arcano by card number
 * @param numero - Card number (0-21)
 * @returns Arcano name or null if not found
 */
export function getArcanoByNumber(numero: number): string | null {
  return ALL_MAJOR_ARCANOS[numero] ?? null;
}

/**
 * Get all relationships for a specific card number
 * @param numero - Card number (0-21)
 * @returns Array of mappings involving this card number
 */
export function getRelationsByNumber(numero: number): TarotTarotMapping[] {
  return TAROT_TAROT_MAP.filter(
    (m) => m.numero_carta === numero || m.related_numero === numero
  );
}

// Default export with commonly used functions
export default {
  getTarotTarot,
  getAllTarotPaths,
  getAllPathTypes,
  getAllMappedArcanos,
  getAllArcanoRelations,
  getPathsByType,
  getPathTypeBetween,
  getSpiritualMeaningBetween,
  hasRelation,
  getArcanoByNumber,
  getRelationsByNumber,
};