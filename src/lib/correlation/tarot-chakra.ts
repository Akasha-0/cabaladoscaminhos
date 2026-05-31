/**
 * Tarot-Chakra Spiritual Correlation Mapping
 * Based on IDEIA.md "Tabela de Correspondência Macro: Oito Portais da Consciência"
 * Aligns Tarot Major Arcana cards with the 7 chakras (reverse mapping)
 */

/**
 * Represents the correlation between a Tarot Major Arcana card and its chakra
 */
export interface TarotChakraMapping {
  /** The Major Arcana card name */
  arcano: string;
  /** The card number in the Major Arcana */
  numero_carta: number;
  /** Associated chakra name (Sanskrit) */
  chakra: string;
  /** Chakra name in Portuguese */
  chakra_pt: string;
  /** Chakra number (1-7) */
  numero_chakra: number;
  /** The element associated with this correlation (Fire, Water, Air, Earth, Ether) */
  elemento_conexao: string;
  /** Spiritual meaning and archetype */
  significado_espiritual: string;
}

// ─── Tarot Major Arcana to Chakra Mapping ─────────────────────────────────────

export const TAROT_CHAKRA_MAPPINGS: Record<string, TarotChakraMapping> = {
  'O Louco': {
    arcano: 'O Louco',
    numero_carta: 0,
    chakra: 'Sahasrara',
    chakra_pt: '7º Coronário',
    numero_chakra: 7,
    elemento_conexao: 'Éter',
    significado_espiritual: 'Libertação, nova era, despertar espiritual e transcendência. O salto de fé que representa a iluminação e a conexão direta com o divino.',
  },
  'O Mago': {
    arcano: 'O Mago',
    numero_carta: 1,
    chakra: 'Muladhara',
    chakra_pt: '1º Básico',
    numero_chakra: 1,
    elemento_conexao: 'Terra',
    significado_espiritual: 'Poder pessoal, manifestação, recursos internos e domínio das ferramentas da vida. A habilidade de criar realidade através da vontade e da intenção.',
  },
  'A Sacerdotisa': {
    arcano: 'A Sacerdotisa',
    numero_carta: 2,
    chakra: 'Ajna',
    chakra_pt: '6º Frontal',
    numero_chakra: 6,
    elemento_conexao: 'Água',
    significado_espiritual: 'Intuição profunda, sabedoria interna, o inconsciente e a voz da alma. A guardiã dos mistérios que conhece as verdades ocultas além do véu da ilusão.',
  },
  'A Imperatriz': {
    arcano: 'A Imperatriz',
    numero_carta: 3,
    chakra: 'Anahata',
    chakra_pt: '4º Cardíaco',
    numero_chakra: 4,
    elemento_conexao: 'Ar',
    significado_espiritual: 'Amor incondicional, fertilidade, criação abundante e conexão com o divino feminino. A mãe natureza que nutre, prospera e harmoniza.',
  },
  'O Imperador': {
    arcano: 'O Imperador',
    numero_carta: 4,
    chakra: 'Manipura',
    chakra_pt: '3º Plexo Solar',
    numero_chakra: 3,
    elemento_conexao: 'Fogo',
    significado_espiritual: 'Força de vontade, liderança, autoridade e estrutura. O guerreiro que ordena o caos através da disciplina e impõe limites necessários.',
  },
  'O Hierofante': {
    arcano: 'O Hierofante',
    numero_carta: 5,
    chakra: 'Vishuddha',
    chakra_pt: '5º Laríngeo',
    numero_chakra: 5,
    elemento_conexao: 'Éter',
    significado_espiritual: 'Expansão espiritual, sabedoria sagrada, tradição e fé. O mestre que transmite a doutrina divina e abre portais de conhecimento.',
  },
  'O Enamorado': {
    arcano: 'O Enamorado',
    numero_carta: 6,
    chakra: 'Anahata',
    chakra_pt: '4º Cardíaco',
    numero_chakra: 4,
    elemento_conexao: 'Ar',
    significado_espiritual: 'Amor, escolha, união e harmonia. O momento de decisão entre dois caminhos, buscando a síntese e o equilíbrio emocional.',
  },
  'O Carro': {
    arcano: 'O Carro',
    numero_carta: 7,
    chakra: 'Vishuddha',
    chakra_pt: '5º Laríngeo',
    numero_chakra: 5,
    elemento_conexao: 'Fogo',
    significado_espiritual: 'Vitória, determinação, conquista e movimento direcionado. A força de vontade que conduz através dos obstáculos e manifesta os objetivos.',
  },
  'A Justiça': {
    arcano: 'A Justiça',
    numero_carta: 8,
    chakra: 'Svadhisthana',
    chakra_pt: '2º Sacro',
    numero_chakra: 2,
    elemento_conexao: 'Água',
    significado_espiritual: 'Equilíbrio, verdade, lei karma e causa e efeito. O peso da consciência que equilibra ações e reações em harmonia com a justiça universal.',
  },
  'O Eremita': {
    arcano: 'O Eremita',
    numero_carta: 9,
    chakra: 'Ajna',
    chakra_pt: '6º Frontal',
    numero_chakra: 6,
    elemento_conexao: 'Terra',
    significado_espiritual: 'Iluminação interior, sabedoria, introspecção e solitude sagrada. A jornada do peregrino em busca da luz interior e da verdade absoluta.',
  },
  'A Roda da Fortuna': {
    arcano: 'A Roda da Fortuna',
    numero_carta: 10,
    chakra: 'Manipura',
    chakra_pt: '3º Plexo Solar',
    numero_chakra: 3,
    elemento_conexao: 'Fogo',
    significado_espiritual: 'Ciclos, destino, mudança e transformação. A roda cósmica que traz oportunidades, testes e ascensões através dos inevitáveis fluxos da vida.',
  },
  'A Força': {
    arcano: 'A Força',
    numero_carta: 11,
    chakra: 'Muladhara',
    chakra_pt: '1º Básico',
    numero_chakra: 1,
    elemento_conexao: 'Fogo',
    significado_espiritual: 'Coragem, poder, domínio interior e transformação do instinto. A força pacificadora que harmoniza o leão interior com a mente desperta.',
  },
  'O Enforcado': {
    arcano: 'O Enforcado',
    numero_carta: 12,
    chakra: 'Ajna',
    chakra_pt: '6º Frontal',
    numero_chakra: 6,
    elemento_conexao: 'Água',
    significado_espiritual: 'Sacrifício, nova perspectiva, inversão e entrega. O sacrifício voluntário que traz iluminação através do abandono do ponto de vista anterior.',
  },
  'A Morte': {
    arcano: 'A Morte',
    numero_carta: 13,
    chakra: 'Svadhisthana',
    chakra_pt: '2º Sacro',
    numero_chakra: 2,
    elemento_conexao: 'Água',
    significado_espiritual: 'Transformação profunda, fim de ciclo, renovação e renascimento. A morte do eu antigo que possibilita o nascimento de uma nova versão de si.',
  },
  'A Temperança': {
    arcano: 'A Temperança',
    numero_carta: 14,
    chakra: 'Sahasrara',
    chakra_pt: '7º Coronário',
    numero_chakra: 7,
    elemento_conexao: 'Água',
    significado_espiritual: 'Equilíbrio, harmonia, paciência e integração. O fluxo constante que equilibra extremos, criando pontes entre opostos através da alquimia interior.',
  },
  'O Diabo': {
    arcano: 'O Diabo',
    numero_carta: 15,
    chakra: 'Muladhara',
    chakra_pt: '1º Básico',
    numero_chakra: 1,
    elemento_conexao: 'Terra',
    significado_espiritual: 'Ilusão, apego, sombra e materialismo. As correntes da ilusão que prendem através do medo, luxúria e dependência das formas densas.',
  },
  'A Torre': {
    arcano: 'A Torre',
    numero_carta: 16,
    chakra: 'Svadhisthana',
    chakra_pt: '2º Sacro',
    numero_chakra: 2,
    elemento_conexao: 'Fogo',
    significado_espiritual: 'Libertação através da ruptura, despertar repentino, destruição das ilusões e purificação através da crise. O raio que ilumina a verdade.',
  },
  'A Estrela': {
    arcano: 'A Estrela',
    numero_carta: 17,
    chakra: 'Anahata',
    chakra_pt: '4º Cardíaco',
    numero_chakra: 4,
    elemento_conexao: 'Ar',
    significado_espiritual: 'Esperança, fé, inspiração e cura. A luz que guia nas horas de escuridão, renovando a confiança e restaurando a fé no futuro luminoso.',
  },
  'A Lua': {
    arcano: 'A Lua',
    numero_carta: 18,
    chakra: 'Svadhisthana',
    chakra_pt: '2º Sacro',
    numero_chakra: 2,
    elemento_conexao: 'Água',
    significado_espiritual: 'Intuição, inconsciente, ilusões e flutuação emocional. O reino noturno da mente onde os sonhos e medos se manifestam como realidad.',
  },
  'O Sol': {
    arcano: 'O Sol',
    numero_carta: 19,
    chakra: 'Manipura',
    chakra_pt: '3º Plexo Solar',
    numero_chakra: 3,
    elemento_conexao: 'Fogo',
    significado_espiritual: 'Vitalidade, sucesso, clareza e felicidade. O brilho interior que irradia poder pessoal,manifestando os talentos e o propsito de vida.',
  },
  'O Julgamento': {
    arcano: 'O Julgamento',
    numero_carta: 20,
    chakra: 'Sahasrara',
    chakra_pt: '7º Coronário',
    numero_chakra: 7,
    elemento_conexao: 'Fogo',
    significado_espiritual: 'Renascimento, redenção, julgamento e chamada interior. A trombeta que desperta os mortos para um novo жизни, respondendo ao chamado divino.',
  },
  'O Mundo': {
    arcano: 'O Mundo',
    numero_carta: 21,
    chakra: 'Sahasrara',
    chakra_pt: '7º Coronário',
    numero_chakra: 7,
    elemento_conexao: 'Terra',
    significado_espiritual: 'Completude, realização, integração e cumprimento do destino. A dança cósmica que completa um ciclo maior de evolução espiritual.',
  },
} as const;

// Freeze the mapping object to prevent modifications
Object.freeze(TAROT_CHAKRA_MAPPINGS);
// Freeze nested objects
Object.values(TAROT_CHAKRA_MAPPINGS).forEach(mapping => Object.freeze(mapping));

/**
 * Get the Tarot-to-Chakra correlation mapping
 * @param arcano - The arcano name (e.g., 'O Sol', 'A Lua', 'O Imperador')
 * @returns The correlation mapping or null if not found
 */
export function getTarotChakra(arcano: string): TarotChakraMapping | null {
  return TAROT_CHAKRA_MAPPINGS[arcano] ?? null;
}

/**
 * Get the arcano name corresponding to a chakra
 * @param chakra - Chakra name (e.g., 'Sahasrara', 'Muladhara', '7º Coronário')
 * @returns The arcano name or null if not found
 */
export function getChakraTarot(chakra: string): string | null {
  const normalizedChakra = normalizeChakraName(chakra);
  
  for (const mapping of Object.values(TAROT_CHAKRA_MAPPINGS)) {
    if (
      mapping.chakra === normalizedChakra ||
      mapping.chakra_pt === chakra ||
      mapping.numero_chakra.toString() === chakra ||
      mapping.chakra_pt.toLowerCase() === chakra.toLowerCase() ||
      mapping.chakra.toLowerCase() === chakra.toLowerCase()
    ) {
      return mapping.arcano;
    }
  }
  
  return null;
}

/**
 * Get all available Tarot-Chakra mappings
 * @returns Array of all correlation mappings sorted by card number
 */
export function getAllTarotChakras(): TarotChakraMapping[] {
  return Object.values(TAROT_CHAKRA_MAPPINGS).sort(
    (a, b) => a.numero_carta - b.numero_carta
  );
}

/**
 * Get all arcano names
 * @returns Array of arcano names
 */
export function getAllArcanos(): string[] {
  return Object.keys(TAROT_CHAKRA_MAPPINGS);
}

/**
 * Check if an arcano exists in the mapping
 * @param arcano - Arcano name to check
 * @returns True if arcano exists in mapping
 */
export function hasTarotChakra(arcano: string): boolean {
  return arcano in TAROT_CHAKRA_MAPPINGS;
}

/**
 * Get arcano by card number
 * @param numero - The Major Arcana card number (0-21)
 * @returns The arcano name or null if not found
 */
export function getArcanoByNumber(numero: number): string | null {
  for (const mapping of Object.values(TAROT_CHAKRA_MAPPINGS)) {
    if (mapping.numero_carta === numero) {
      return mapping.arcano;
    }
  }
  return null;
}

/**
 * Get chakra by card number
 * @param numero - The Major Arcana card number (0-21)
 * @returns The chakra name or null if not found
 */
export function getChakraByNumber(numero: number): string | null {
  for (const mapping of Object.values(TAROT_CHAKRA_MAPPINGS)) {
    if (mapping.numero_carta === numero) {
      return mapping.chakra;
    }
  }
  return null;
}

/**
 * Get chakra number by arcano
 * @param arcano - The arcano name
 * @returns Chakra number (1-7) or null if not found
 */
export function getChakraNumeroByArcano(arcano: string): number | null {
  const mapping = TAROT_CHAKRA_MAPPINGS[arcano];
  return mapping ? mapping.numero_chakra : null;
}

/**
 * Get element by arcano
 * @param arcano - The arcano name
 * @returns The element name or null if not found
 */
export function getElementByArcano(arcano: string): string | null {
  const mapping = TAROT_CHAKRA_MAPPINGS[arcano];
  return mapping ? mapping.elemento_conexao : null;
}

/**
 * Normalizes chakra name to match TAROT_CHAKRA_MAPPINGS keys
 */
function normalizeChakraName(chakra: string): string {
  const chakraMap: Record<string, string> = {
    'muladhara': 'Muladhara',
    'svadhisthana': 'Svadhisthana',
    'manipura': 'Manipura',
    'anahata': 'Anahata',
    'vishuddha': 'Vishuddha',
    'ajna': 'Ajna',
    'sahasrara': 'Sahasrara',
    '1º básico': '1º Básico',
    '1° básico': '1º Básico',
    '2º sacro': '2º Sacro',
    '2° sacro': '2º Sacro',
    '3º plexo solar': '3º Plexo Solar',
    '3° plexo solar': '3º Plexo Solar',
    '4º cardíaco': '4º Cardíaco',
    '4° cardíaco': '4º Cardíaco',
    '5º laríngeo': '5º Laríngeo',
    '5° laríngeo': '5º Laríngeo',
    '6º frontal': '6º Frontal',
    '6° frontal': '6º Frontal',
    '7º coronário': '7º Coronário',
    '7° coronário': '7º Coronário',
    'coronário': '7º Coronário',
    'frontal': '6º Frontal',
    'laríngeo': '5º Laríngeo',
    'cardíaco': '4º Cardíaco',
    'plexo solar': '3º Plexo Solar',
    'sacro': '2º Sacro',
    'básico': '1º Básico',
  };
  
  const normalized = chakra.toLowerCase().trim();
  return chakraMap[normalized] || chakra;
}

/**
 * Default export for convenient imports
 */
export default {
  getTarotChakra,
  getChakraTarot,
  getAllTarotChakras,
  getAllArcanos,
  hasTarotChakra,
  getArcanoByNumber,
  getChakraByNumber,
  getChakraNumeroByArcano,
  getElementByArcano,
  TAROT_CHAKRA_MAPPINGS,
};