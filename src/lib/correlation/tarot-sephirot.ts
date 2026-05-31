/**
 * Tarot-Sephirot Correlation Module
 * Maps Tarot Major Arcana cards to Sephiroth of the Kabbalistic Tree of Life
 * Based on IDEIA.md vibrational correspondences and Cabala dos Caminhos framework
 * This module provides the inverse mapping from sephirot-tarot.ts
 */

/**
 * Represents the correlation between a Tarot Major Arcana card and its Sephirah
 */
export interface TarotSephirotMapping {
  /** The Major Arcana card name in Portuguese */
  arcano: string;
  /** The card number in the Major Arcana (0-21) */
  numero_carta: number;
  /** The Sephirah name */
  sephirah: string;
  /** Path number on the Tree of Life (1-10) */
  numero_caminho: number;
  /** Hebrew name of the Sephirah */
  hebrew: string;
  /** English name of the Sephirah */
  enName: string;
  /** Spiritual meaning and archetype interpretation */
  significado_espiritual: string;
}

// ─── Tarot Major Arcana to Sephirot Mapping ──────────────────────────────────
// Maps all 22 Major Arcana cards to their Sephiroth correspondences.
// Each arcano is aligned with a Sephirah based on thematic correspondence:
// Kether (Crown) - Divine spark, beginning, the Fool's journey origin
// Chokmah (Wisdom) - Dynamic wisdom, the Magician's will
// Binah (Understanding) - Formative understanding, the High Priestess's mysteries
// Chesed (Mercy) - Expansive mercy, structure, the Emperor's authority
// Gevurah (Severity) - Power of limitation, the Empress's creative force
// Tiphereth (Beauty) - Harmony, the central balance, the Hierophant's teaching
// Netzach (Victory) - Emotional triumph, the Lovers' union
// Hod (Glory) - Intellectual glory, the Chariot's victory
// Yesod (Foundation) - Subconscious foundation, the Justice's balance
// Malkuth (Kingdom) - Material kingdom, the Hermit's wisdom

export const TAROT_SEPHIROT_MAPPINGS: Record<string, TarotSephirotMapping> = {
  'O Louco': {
    arcano: 'O Louco',
    numero_carta: 0,
    sephirah: 'Kether',
    numero_caminho: 1,
    hebrew: 'כתר',
    enName: 'Crown',
    significado_espiritual:
      'Pureza original, inconsciência divina, o salto da fé além da razão. O ponto zero onde todo conhecimento ainda não foi separado do ser. A coroa que precede toda forma.',
  },
  'O Mago': {
    arcano: 'O Mago',
    numero_carta: 1,
    sephirah: 'Chokmah',
    numero_caminho: 2,
    hebrew: 'חכמה',
    enName: 'Wisdom',
    significado_espiritual:
      'Vontade criativa, poder de manifestar através das ferramentas sagradas. O universo se expressa através da mente. A energia masculina primordial que articula o divino.',
  },
  'A Alta Sacerdotisa': {
    arcano: 'A Alta Sacerdotisa',
    numero_carta: 2,
    sephirah: 'Binah',
    numero_caminho: 3,
    hebrew: 'בינה',
    enName: 'Understanding',
    significado_espiritual:
      'Discernimento, mistério oculto, o véu entre os mundos. A energia feminina que forma e limita. A limitação sagrada que permite a existência ser individuada.',
  },
  'A Imperatriz': {
    arcano: 'A Imperatriz',
    numero_carta: 3,
    sephirah: 'Gevurah',
    numero_caminho: 5,
    hebrew: 'גבורה',
    enName: 'Severity',
    significado_espiritual:
      'Criação abundante, fertilidade, força feminil cortante. A mãe natureza que nutre mas também poda. A energia que transforma pela limitação e pelo julgamento.',
  },
  'O Imperador': {
    arcano: 'O Imperador',
    numero_carta: 4,
    sephirah: 'Chesed',
    numero_caminho: 4,
    hebrew: 'חסד',
    enName: 'Mercy',
    significado_espiritual:
      'Autoridade estruturante, lei sagrada, expansão ordenada. O pai cósmico que estabelece a ordem e a Hierarquia Divina. A estrutura que sustenta a criação.',
  },
  'O Hierofante': {
    arcano: 'O Hierofante',
    numero_carta: 5,
    sephirah: 'Tiphereth',
    numero_caminho: 6,
    hebrew: 'תפארת',
    enName: 'Beauty',
    significado_espiritual:
      'Iniciação sagrada, doutrina divina, o mestre que transmite a tradição. O puente entre o humano e o divino. A harmonia que reconcilia os opostos.',
  },
  'Os Enamorados': {
    arcano: 'Os Enamorados',
    numero_carta: 6,
    sephirah: 'Netzach',
    numero_caminho: 7,
    hebrew: 'נצח',
    enName: 'Victory',
    significado_espiritual:
      'Escolha amorosa, união das polaridades, vitória pelo coração. A decisão entre dois caminhos através do amor. A paixão que vence toda resistência.',
  },
  'O Carro': {
    arcano: 'O Carro',
    numero_carta: 7,
    sephirah: 'Hod',
    numero_caminho: 8,
    hebrew: 'הוד',
    enName: 'Glory',
    significado_espiritual:
      'Vitória através da vontade, a carruagem da alma, triunfo da mente sobre a matéria. O conquistador que domina pelo equilíbrio das polaridades. A glória da consciência ordenada.',
  },
  'A Justiça': {
    arcano: 'A Justiça',
    numero_carta: 8,
    sephirah: 'Yesod',
    numero_caminho: 9,
    hebrew: 'יסוד',
    enName: 'Foundation',
    significado_espiritual:
      'Lei cósmica, equilíbrio karma, a balança que mede ações e consequências. A fundação do templo interior. O equilíbrio entre o que foi semeado e o que será colhido.',
  },
  'O Eremita': {
    arcano: 'O Eremita',
    numero_carta: 9,
    sephirah: 'Malkuth',
    numero_caminho: 10,
    hebrew: 'מלכות',
    enName: 'Kingdom',
    significado_espiritual:
      'Iluminação interior, solidão sagrada, a sabedoria da escuridão. O solitário que carrega a luz para o mundo. A sabedoria que nasce na stillness do reino material.',
  },
  'A Roda da Fortuna': {
    arcano: 'A Roda da Fortuna',
    numero_carta: 10,
    sephirah: 'Chokmah',
    numero_caminho: 2,
    hebrew: 'חכמה',
    enName: 'Wisdom',
    significado_espiritual:
      'Ciclos do destino, mudança inevitável e oportunidade cíclica. A sabedoria dinâmica que impulsiona a roda cósmica. O desejo primário de se manifestar através das eras.',
  },
  'A Força': {
    arcano: 'A Força',
    numero_carta: 11,
    sephirah: 'Tiphereth',
    numero_caminho: 6,
    hebrew: 'תפארת',
    enName: 'Beauty',
    significado_espiritual:
      'Coragem do coração, domínio das paixões e poder gentil da compaixão. A harmonia central que integra a força selvagem com a graciosidade. A beleza que vence pela suavidade.',
  },
  'O Enforcado': {
    arcano: 'O Enforcado',
    numero_carta: 12,
    sephirah: 'Gevurah',
    numero_caminho: 5,
    hebrew: 'גבורה',
    enName: 'Severity',
    significado_espiritual:
      'Sacrifício consciente, nova perspectiva e entrega ao fluxo divino. O sacrifício que poda o desnecessário. A limitação sagrada que libera o espírito.',
  },
  'A Morte': {
    arcano: 'A Morte',
    numero_carta: 13,
    sephirah: 'Yesod',
    numero_caminho: 9,
    hebrew: 'יסוד',
    enName: 'Foundation',
    significado_espiritual:
      'Transformação inevitável, fim de ciclos e renascimento espiritual. A fundação do inconsciente que se transforma. A morte do velho que cria espaço para o novo.',
  },
  'A Temperança': {
    arcano: 'A Temperança',
    numero_carta: 14,
    sephirah: 'Tiphereth',
    numero_caminho: 6,
    hebrew: 'תפארת',
    enName: 'Beauty',
    significado_espiritual:
      'Equilíbrio entre opostos, harmonia das polaridades e cura através do meio. O alquimista que transfigura chumbo em ouro. A harmonia central que reconcilia todas as forças.',
  },
  'O Diabo': {
    arcano: 'O Diabo',
    numero_carta: 15,
    sephirah: 'Malkuth',
    numero_caminho: 10,
    hebrew: 'מלכות',
    enName: 'Kingdom',
    significado_espiritual:
      'Libertação das prisões interiores, reconhecimento das sombras e transcendência das amarras materiais. A matéria que pode ser transmutada. O reino material como campo de libertação.',
  },
  'A Torre': {
    arcano: 'A Torre',
    numero_carta: 16,
    sephirah: 'Gevurah',
    numero_caminho: 5,
    hebrew: 'גבורה',
    enName: 'Severity',
    significado_espiritual:
      'Desconstrução das ilusões, revelação súbita da verdade e libertação através da crise. O raio cortante que poda a arrogância. A severidade que quebra para reconstruir.',
  },
  'A Estrela': {
    arcano: 'A Estrela',
    numero_carta: 17,
    sephirah: 'Chesed',
    numero_caminho: 4,
    hebrew: 'חסד',
    enName: 'Mercy',
    significado_espiritual:
      'Esperança renovada, intuição desperta e alinhamento com o propósito divino. A misericórdia que flui abundantemente. A expansão ordenadora que restaura a fé.',
  },
  'A Lua': {
    arcano: 'A Lua',
    numero_carta: 18,
    sephirah: 'Yesod',
    numero_caminho: 9,
    hebrew: 'יסוד',
    enName: 'Foundation',
    significado_espiritual:
      'Intuição profunda, inconsciente revelado e navegação pelos mares emocionais. A fundação lunar que revela os sonhos. O subconsciente iluminado pelos raios da lua.',
  },
  'O Sol': {
    arcano: 'O Sol',
    numero_carta: 19,
    sephirah: 'Tiphereth',
    numero_caminho: 6,
    hebrew: 'תפארת',
    enName: 'Beauty',
    significado_espiritual:
      'Vitalidade radiante, verdade clara e conexão direta com a fonte de toda luz. A beleza solar que manifesta o propósito. A harmonia central que irradia claridad.',
  },
  'O Julgamento': {
    arcano: 'O Julgamento',
    numero_carta: 20,
    sephirah: 'Malkuth',
    numero_caminho: 10,
    hebrew: 'מלכות',
    enName: 'Kingdom',
    significado_espiritual:
      'Renascimento interior, chamado divino e ressurreição do verdadeiro self. O chamado do reino para despertar. A sabedoria do reino que reconhece a própria divindade.',
  },
  'O Mundo': {
    arcano: 'O Mundo',
    numero_carta: 21,
    sephirah: 'Kether',
    numero_caminho: 1,
    hebrew: 'כתר',
    enName: 'Crown',
    significado_espiritual:
      'Completude, realização do propósito e integração de todos os opostos. O retorno à coroa divina. A unidade que abraça todo o caminho percorrido.',
  },
} as const;

// Freeze the mapping object to prevent modifications
Object.freeze(TAROT_SEPHIROT_MAPPINGS);
Object.values(TAROT_SEPHIROT_MAPPINGS).forEach((mapping) => Object.freeze(mapping));

/**
 * All 10 Sephiroth names in order
 */
export const SEPHIROTH_NAMES = [
  'Kether',
  'Chokmah',
  'Binah',
  'Chesed',
  'Gevurah',
  'Tiphereth',
  'Netzach',
  'Hod',
  'Yesod',
  'Malkuth',
] as const;

/**
 * Get the Tarot-Sephirot correlation mapping for a given arcano
 * @param arcano - The arcano name (e.g., 'O Louco', 'O Mago', 'A Alta Sacerdotisa')
 * @returns The correlation mapping or null if not found
 */
export function getTarotSephirot(arcano: string): TarotSephirotMapping | null {
  return TAROT_SEPHIROT_MAPPINGS[arcano] ?? null;
}

/**
 * Get the arcano corresponding to a Sephirot
 * @param sephirah - The Sephirah name (e.g., 'Kether', 'Chokmah', 'Tiphereth')
 * @returns The arcano name or null if not found
 */
export function getSephirotTarot(sephirah: string): string | null {
  const mapping = Object.values(TAROT_SEPHIROT_MAPPINGS).find(
    (m) => m.sephirah.toLowerCase() === sephirah.toLowerCase()
  );
  return mapping?.arcano ?? null;
}

/**
 * Get all available Tarot-Sephirot mappings
 * @returns Array of all correlation mappings sorted by card number
 */
export function getAllTarotSephiroths(): TarotSephirotMapping[] {
  return Object.values(TAROT_SEPHIROT_MAPPINGS).sort(
    (a, b) => a.numero_carta - b.numero_carta
  );
}

/**
 * Get all arcano names
 * @returns Array of arcano names sorted by card number
 */
export function getAllArcanos(): string[] {
  return Object.values(TAROT_SEPHIROT_MAPPINGS)
    .sort((a, b) => a.numero_carta - b.numero_carta)
    .map((m) => m.arcano);
}

/**
 * Check if an arcano exists in the mapping
 * @param arcano - Arcano name to check
 * @returns True if arcano exists in mapping
 */
export function hasTarotSephirot(arcano: string): boolean {
  return arcano in TAROT_SEPHIROT_MAPPINGS;
}

/**
 * Get arcano by card number
 * @param numero - The Major Arcana card number (0-21)
 * @returns The arcano name or null if not found
 */
export function getArcanoByNumber(numero: number): string | null {
  const mapping = Object.values(TAROT_SEPHIROT_MAPPINGS).find(
    (m) => m.numero_carta === numero
  );
  return mapping?.arcano ?? null;
}

/**
 * Get Sephirah by card number
 * @param numero - The Major Arcana card number (0-21)
 * @returns The Sephirah name or null if not found
 */
export function getSephirotByNumber(numero: number): string | null {
  const mapping = Object.values(TAROT_SEPHIROT_MAPPINGS).find(
    (m) => m.numero_carta === numero
  );
  return mapping?.sephirah ?? null;
}

/**
 * Get all mappings for a specific Sephirah
 * @param sephirah - The Sephirah name
 * @returns Array of mappings with this Sephirah (can be multiple arcanos)
 */
export function getArcanosBySephirah(sephirah: string): TarotSephirotMapping[] {
  return Object.values(TAROT_SEPHIROT_MAPPINGS).filter(
    (m) => m.sephirah.toLowerCase() === sephirah.toLowerCase()
  );
}

/**
 * Get all Sephiroth names
 * @returns Array of unique Sephirah names
 */
export function getAllSephiroth(): string[] {
  return [...SEPHIROTH_NAMES];
}

export default {
  getTarotSephirot,
  getSephirotTarot,
  getAllTarotSephiroths,
  getAllArcanos,
  hasTarotSephirot,
  getArcanoByNumber,
  getSephirotByNumber,
  getArcanosBySephirah,
  getAllSephiroth,
  TAROT_SEPHIROT_MAPPINGS,
  SEPHIROTH_NAMES,
};

// Freeze SEPHIROTH_NAMES constant
Object.freeze(SEPHIROTH_NAMES);