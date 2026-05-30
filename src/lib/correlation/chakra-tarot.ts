/**
 * Chakra-Tarot Spiritual Correlation Mapping
 * Based on IDEIA.md "Tabela de Correspondência Macro: Oito Portais da Consciência"
 * Aligns the 7 chakras with Tarot Major Arcana cards
 */

/**
 * Represents the correlation between a chakra and its Tarot Major Arcana correspondence
 */
export interface ChakraTarotMapping {
  /** Chakra name (Sanskrit) */
  chakra: string;
  /** Chakra name in Portuguese */
  chakra_pt: string;
  /** Chakra number (1-7) */
  numero_chakra: number;
  /** The Major Arcana card name */
  arcano: string;
  /** The card number in the Major Arcana (0-21) */
  numero_carta: number;
  /** Spiritual meaning and archetype */
  significado_espiritual: string;
  /** Energy alignment description */
  alinhamento_energetico: string;
}

// ─── Chakra-to-Tarot Major Arcana Mapping ─────────────────────────────────────

export const CHAKRA_TAROT_MAPPINGS: Record<string, ChakraTarotMapping> = {
  Sahasrara: {
    chakra: 'Sahasrara',
    chakra_pt: '7º Coronário',
    numero_chakra: 7,
    arcano: 'O Louco',
    numero_carta: 0,
    significado_espiritual: 'Libertação, nova era, despertar espiritual e transcendência. O salto de fé que representa a iluminação e a conexão direta com o divino. Desprendimento total e início de um novo ciclo espiritual.',
    alinhamento_energetico: 'Energia de fusão cósmica, abertura do canal divino, transcendência do ego e integração com a consciência universal.',
  },
  Ajna: {
    chakra: 'Ajna',
    chakra_pt: '6º Frontal',
    numero_chakra: 6,
    arcano: 'A Sacerdotisa',
    numero_carta: 2,
    significado_espiritual: 'Intuição profunda, sabedoria interna, o inconsciente e a voz da alma. A guardiã dos mistérios que conhece as verdades ocultas além do véu da ilusão.',
    alinhamento_energetico: 'Energia lunar receptiva, percepção além dos sentidos, conexão com a sabedoria ancestral e ativação da visão clara.',
  },
  Vishuddha: {
    chakra: 'Vishuddha',
    chakra_pt: '5º Laríngeo',
    numero_chakra: 5,
    arcano: 'O Carro',
    numero_carta: 7,
    significado_espiritual: 'Vitória, determinação, conquista e movimento direcionado. A força de vontade que conduz através dos obstáculos e manifesta os objetivos com disciplina interior.',
    alinhamento_energetico: 'Energia marciana de ação conquistadora, domínio da vontade, proteção durante a jornada e equilíbrio entre razão e emoção.',
  },
  Anahata: {
    chakra: 'Anahata',
    chakra_pt: '4º Cardíaco',
    numero_chakra: 4,
    arcano: 'A Estrela',
    numero_carta: 17,
    significado_espiritual: 'Esperança, fé, inspiração e cura. A luz que guia nas horas de escuridão, renovando a confiança na vida e restaurando a fé no futuro.',
    alinhamento_energetico: 'Energia estelar de restauração, magnetismo pessoal, fertilidade espiritual e alinhamento com o destino luminoso.',
  },
  Manipura: {
    chakra: 'Manipura',
    chakra_pt: '3º Plexo Solar',
    numero_chakra: 3,
    arcano: 'A Roda da Fortuna',
    numero_carta: 10,
    significado_espiritual: 'Ciclos, destino, mudança e transformação. A roda cósmica que traz oportunidades, testes e ascensões. Representa o fluxo inevitável da vida e o destino karma.',
    alinhamento_energetico: 'Energia solar de transformação, ciclos de manifestação, alinhamento com o propósito de vida e aceitação do fluxo universal.',
  },
  Svadhisthana: {
    chakra: 'Svadhisthana',
    chakra_pt: '2º Sacro',
    numero_chakra: 2,
    arcano: 'A Torre',
    numero_carta: 16,
    significado_espiritual: 'Libertação através da ruptura, despertar repentino, destruição das ilusões e purificação através da crise. O raio que ilumina a verdade e quebra correntes.',
    alinhamento_energetico: 'Energia uraniana de transformação abrupta, ruptura de estruturas limitantes, despertar forçado e libertação de padrões antigos.',
  },
  Muladhara: {
    chakra: 'Muladhara',
    chakra_pt: '1º Básico',
    numero_chakra: 1,
    arcano: 'O Mago',
    numero_carta: 1,
    significado_espiritual: 'Poder pessoal, manifestação, recursos internos e domínio das ferramentas da vida. A habilidade de criar realidade através da vontade e da intenção.',
    alinhamento_energetico: 'Energia mercuriana de ação criativa, ancoramento na matéria, uso consciente dos elementos e manifestação do potencial terrestre.',
  },
} as const;

// Freeze the mapping object to prevent modifications
Object.freeze(CHAKRA_TAROT_MAPPINGS);
// Freeze nested objects
Object.values(CHAKRA_TAROT_MAPPINGS).forEach(mapping => Object.freeze(mapping));

/**
 * Get the chakra-to-Tarot correlation mapping
 * @param chakra - Chakra name (e.g., 'Sahasrara', 'Muladhara', '7º Coronário')
 * @returns The correlation mapping or null if not found
 */
export function getChakraTarot(chakra: string): ChakraTarotMapping | null {
  const normalized = normalizeChakraName(chakra);
  return CHAKRA_TAROT_MAPPINGS[normalized] ?? null;
}

/**
 * Get the chakra corresponding to a Tarot Major Arcana card
 * @param arcano - The arcano name (e.g., 'O Louco', 'A Sacerdotisa', 'O Carro')
 * @returns The chakra name or null if not found
 */
export function getTarotChakra(arcano: string): string | null {
  for (const mapping of Object.values(CHAKRA_TAROT_MAPPINGS)) {
    if (mapping.arcano === arcano) {
      return mapping.chakra;
    }
  }
  return null;
}

/**
 * Get all available chakra-Tarot mappings
 * @returns Array of all correlation mappings sorted by chakra number
 */
export function getAllChakraTarots(): ChakraTarotMapping[] {
  return Object.values(CHAKRA_TAROT_MAPPINGS).sort(
    (a, b) => a.numero_chakra - b.numero_chakra
  );
}

/**
 * Get all chakra names
 * @returns Array of chakra names (Sanskrit)
 */
export function getAllChakras(): string[] {
  return Object.keys(CHAKRA_TAROT_MAPPINGS);
}

/**
 * Check if a chakra exists in the mapping
 * @param chakra - Chakra name to check
 * @returns True if chakra exists in mapping
 */
export function hasChakraTarot(chakra: string): boolean {
  const normalized = normalizeChakraName(chakra);
  return normalized in CHAKRA_TAROT_MAPPINGS;
}

/**
 * Get chakra by card number
 * @param numero - The Major Arcana card number (0-21)
 * @returns The chakra name or null if not found
 */
export function getChakraByNumber(numero: number): string | null {
  for (const mapping of Object.values(CHAKRA_TAROT_MAPPINGS)) {
    if (mapping.numero_carta === numero) {
      return mapping.chakra;
    }
  }
  return null;
}

/**
 * Get arcano by card number
 * @param numero - The Major Arcana card number (0-21)
 * @returns The arcano name or null if not found
 */
export function getArcanoByNumber(numero: number): string | null {
  for (const mapping of Object.values(CHAKRA_TAROT_MAPPINGS)) {
    if (mapping.numero_carta === numero) {
      return mapping.arcano;
    }
  }
  return null;
}

/**
 * Normalizes chakra name to match ChakraTarotMapping keys
 */
function normalizeChakraName(chakra: string): string {
  const chakraLower = chakra.toLowerCase().trim();
  
  // Direct match
  if (chakraLower in CHAKRA_TAROT_MAPPINGS) {
    return chakraLower.charAt(0).toUpperCase() + chakraLower.slice(1);
  }
  
  // Number format (e.g., "7º Coronário", "1º Básico")
  const numberMatch = chakra.match(/^(\d+)º?\s*(Coronário|Básico|Sacro|Plexo Solar|Cardíaco|Laríngeo|Frontal)$/);
  if (numberMatch) {
    const num = parseInt(numberMatch[1], 10);
    const type = numberMatch[2];
    
    const numberToChakra: Record<number, string> = {
      1: 'Muladhara',
      2: 'Svadhisthana',
      3: 'Manipura',
      4: 'Anahata',
      5: 'Vishuddha',
      6: 'Ajna',
      7: 'Sahasrara',
    };
    
    const chakraName = numberToChakra[num];
    if (chakraName && CHAKRA_TAROT_MAPPINGS[chakraName]) {
      return chakraName;
    }
  }
  
  // Portuguese common names
  const portugueseMap: Record<string, string> = {
    'coronário': 'Sahasrara',
    'coroa': 'Sahasrara',
    'coronário (7º)': 'Sahasrara',
    'frontal': 'Ajna',
    'terceiro olho': 'Ajna',
    'ajna': 'Ajna',
    'laríngeo': 'Vishuddha',
    'garganta': 'Vishuddha',
    'cardíaco': 'Anahata',
    'coração': 'Anahata',
    'plexo solar': 'Manipura',
    'plexo': 'Manipura',
    'sacro': 'Svadhisthana',
    '脐': 'Svadhisthana',
    'básico': 'Muladhara',
    'raiz': 'Muladhara',
    'muladhara': 'Muladhara',
    'svadhisthana': 'Svadhisthana',
    'manipura': 'Manipura',
    'anahata': 'Anahata',
    'vishuddha': 'Vishuddha',
    'sahasrara': 'Sahasrara',
  };
  
  const mapped = portugueseMap[chakraLower];
  if (mapped && mapped in CHAKRA_TAROT_MAPPINGS) {
    return mapped;
  }
  
  return chakraLower;
}