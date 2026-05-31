/**
 * Tarot-Sephirot Correlation Mapping
 * Based on IDEIA.md "Tabela de Correspondência Macro: Oito Portais da Consciência"
 * Aligns Tarot Major Arcana cards with the 10 Sephiroth of the Kabbalistic Tree of Life
 * This is the reverse mapping of sephirot-tarot.ts
 */

/**
 * Represents the correlation between a Tarot Major Arcana card and its Sephirah correspondence
 */
export interface TarotSephirot {
  /** The Major Arcana card name */
  arcano: string;
  /** The card number in the Major Arcana (0-21) */
  numero_carta: number;
  /** The name of the Sephirah in Hebrew/English */
  sephirah: string;
  /** Path number on the Tree of Life (1-22) */
  numero_caminho: number;
  /** Spiritual meaning and archetype */
  significado_espiritual: string;
}

// ─── Tarot Major Arcana-to-Sephirot Mapping ─────────────────────────────────────

export const TAROT_SEPHIROT_MAPPINGS: Record<string, TarotSephirot> = {
  // 0. O Louco - Kether (Coroa) - Caminho 1
  // O salto da fé, a pureza original antes da forma, o ponto zero da existência.
  'O Louco': {
    arcano: 'O Louco',
    numero_carta: 0,
    sephirah: 'Kether',
    numero_caminho: 1,
    significado_espiritual: 'Pureza original, inconsciência divina, o salto da fé além da razão. O ponto zero onde todo conhecimento ainda não foi separado do ser. A coroa que precede toda forma.',
  },

  // I. O Mago - Chokmah (Sabedoria) - Caminho 2
  // A vontade criativa, o poder de manifestar através das ferramentas sagradas.
  'O Mago': {
    arcano: 'O Mago',
    numero_carta: 1,
    sephirah: 'Chokmah',
    numero_caminho: 2,
    significado_espiritual: 'Vontade criativa, poder de manifestar através das ferramentas sagradas. O universo se expressa através da mente. A energia masculina primordial que articula o divino.',
  },

  // II. A Alta Sacerdotisa - Binah (Entendimento) - Caminho 3
  // O véu entre os mundos, o mistério oculto, a limitação sagrada.
  'A Alta Sacerdotisa': {
    arcano: 'A Alta Sacerdotisa',
    numero_carta: 2,
    sephirah: 'Binah',
    numero_caminho: 3,
    significado_espiritual: 'Discernimento, mistério oculto, o véu entre os mundos. A energia feminina que forma e limita. A limitação sagrada que permite a existência ser individuada.',
  },

  // III. A Imperatriz - Geburah (Severidade) - Caminho 5
  // A criação abundante, a força feminil que nutre mas também poda.
  'A Imperatriz': {
    arcano: 'A Imperatriz',
    numero_carta: 3,
    sephirah: 'Geburah',
    numero_caminho: 5,
    significado_espiritual: 'Criação abundante, fertilidade, força feminil cortante. A mãe natureza que nutre mas também poda. A energia que transforma pela limitação e pelo julgamento.',
  },

  // IV. O Imperador - Chesed (Misericórdia) - Caminho 4
  // A autoridade estruturante, a lei sagrada, a expansão ordenada.
  'O Imperador': {
    arcano: 'O Imperador',
    numero_carta: 4,
    sephirah: 'Chesed',
    numero_caminho: 4,
    significado_espiritual: 'Autoridade estruturante, lei sagrada, expansão ordenada. O pai cósmico que estabelece a ordem e a Hierarquia Divina. A estrutura que sustenta a criação.',
  },

  // V. O Hierofante - Tiphereth (Beleza) - Caminho 6
  // A iniciação sagrada, o mestre que transmite a tradição, a harmonia central.
  'O Hierofante': {
    arcano: 'O Hierofante',
    numero_carta: 5,
    sephirah: 'Tiphereth',
    numero_caminho: 6,
    significado_espiritual: 'Iniciação sagrada, doutrina divina, o mestre que transmite a tradição. O puente entre o humano e o divino. A harmonia que reconcilia os opostos.',
  },

  // VI. Os Enamorados - Netzach (Vitória) - Caminho 7
  // A escolha amorosa, a união das polaridades, a vitória pelo coração.
  'Os Enamorados': {
    arcano: 'Os Enamorados',
    numero_carta: 6,
    sephirah: 'Netzach',
    numero_caminho: 7,
    significado_espiritual: 'Escolha amorosa, união das polaridades, vitória pelo coração. A decisão entre dois caminhos através do amor. A paixão que vence toda resistência.',
  },

  // VII. O Carro - Hod (Glória) - Caminho 8
  // A vitória através da vontade, a glória da consciência ordenada.
  'O Carro': {
    arcano: 'O Carro',
    numero_carta: 7,
    sephirah: 'Hod',
    numero_caminho: 8,
    significado_espiritual: 'Vitória através da vontade, a carruagem da alma, triunfo da mente sobre a matéria. O conquistador que domina pelo equilíbrio das polaridades. A glória da consciência ordenada.',
  },

  // VIII. A Justiça - Yesod (Fundação) - Caminho 9
  // A lei cósmica, o equilíbrio karma, a fundação do templo interior.
  'A Justiça': {
    arcano: 'A Justiça',
    numero_carta: 8,
    sephirah: 'Yesod',
    numero_caminho: 9,
    significado_espiritual: 'Lei cósmica, equilíbrio karma, a balança que mede ações e consequências. A fundação do templo interior. O equilíbrio entre o que foi semeado e o que será colhido.',
  },

  // IX. O Eremita - Malkuth (Reino) - Caminho 10
  // A iluminação interior, a sabedoria da escuridão, o reino material.
  'O Eremita': {
    arcano: 'O Eremita',
    numero_carta: 9,
    sephirah: 'Malkuth',
    numero_caminho: 10,
    significado_espiritual: 'Iluminação interior, solitude sagrada, a sabedoria da escuridão. O solitário que carrega a luz para o mundo. A sabedoria que nasce na stillness do reino material.',
  },
} as const;

// Freeze the mapping object to prevent modifications
Object.freeze(TAROT_SEPHIROT_MAPPINGS);
// Freeze nested objects
Object.values(TAROT_SEPHIROT_MAPPINGS).forEach(mapping => Object.freeze(mapping));

/**
 * Get the Tarot-Sephirot correlation mapping
 * @param arcano - The Major Arcana card name (e.g., 'O Louco', 'O Mago', 'A Alta Sacerdotisa')
 * @returns The correlation mapping or null if not found
 */
export function getTarotSephirot(arcano: string): TarotSephirot | null {
  return TAROT_SEPHIROT_MAPPINGS[arcano] ?? null;
}

/**
 * Alias for getTarotSephirot - Get the Tarot-Sephirot correlation mapping
 * @param arcano - The Major Arcana card name (e.g., 'O Louco', 'O Mago', 'A Alta Sacerdotisa')
 * @returns The correlation mapping or null if not found
 */
export function getTarotSephirah(arcano: string): TarotSephirot | null {
  return getTarotSephirot(arcano);
}

/**
 * Get the Sephirah corresponding to a Tarot Major Arcana card
 * @param arcano - The arcano name (e.g., 'O Louco', 'O Mago', 'A Alta Sacerdotisa')
 * @returns The Sephirah name or null if not found
 */
export function getSephirahByTarot(arcano: string): string | null {
  const mapping = TAROT_SEPHIROT_MAPPINGS[arcano];
  return mapping ? mapping.sephirah : null;
}

/**
 * Alias for getSephirahByTarot - Get the Sephirah corresponding to a Tarot Major Arcana card
 * @param arcano - The arcano name (e.g., 'O Louco', 'O Mago', 'A Alta Sacerdotisa')
 * @returns The Sephirah name or null if not found
 */
export function getSephirotByTarot(arcano: string): string | null {
  return getSephirahByTarot(arcano);
}

/**
 * Get all available Tarot-Sephirot mappings
 * @returns Array of all correlation mappings
 */
export function getAllTarotSephirots(): TarotSephirot[] {
  return Object.values(TAROT_SEPHIROT_MAPPINGS);
}

/**
 * Alias for getAllTarotSephirots - Get all available Tarot-Sephirot mappings
 * @returns Array of all correlation mappings
 */
export function getAllTarotSephiroth(): TarotSephirot[] {
  return getAllTarotSephirots();
}

/**
 * Get all Tarot Major Arcana card names
 * @returns Array of arcano names
 */
export function getAllArcanos(): string[] {
  return Object.keys(TAROT_SEPHIROT_MAPPINGS);
}

/**
 * Check if a Tarot card exists in the mapping
 * @param arcano - The name of the Tarot card to check
 * @returns True if Tarot card exists in mapping
 */
export function hasTarotSephirot(arcano: string): boolean {
  return arcano in TAROT_SEPHIROT_MAPPINGS;
}

/**
 * Get Tarot card by path number on Tree of Life
 * @param path - The path number (1-10)
 * @returns The Tarot-Sephirot mapping or null if not found
 */
export function getTarotByPath(path: number): TarotSephirot | null {
  const values = Object.values(TAROT_SEPHIROT_MAPPINGS);
  const found = values.find(m => m.numero_caminho === path);
  return found ?? null;
}

/**
 * Get Sephirah by path number on Tree of Life
 * @param path - The path number (1-10)
 * @returns The Sephirah name or null if not found
 */
export function getSephirahByPath(path: number): string | null {
  const mapping = getTarotByPath(path);
  return mapping ? mapping.sephirah : null;
}

/**
 * Get arcano by card number in Major Arcana
 * @param numero - The Major Arcana card number (0-21)
 * @returns The arcano name or null if not found
 */
export function getArcanoByNumber(numero: number): string | null {
  const values = Object.values(TAROT_SEPHIROT_MAPPINGS);
  const found = values.find(m => m.numero_carta === numero);
  return found ? found.arcano : null;
}

/**
 * Get Sephirah by card number in Major Arcana
 * @param numero - The Major Arcana card number (0-21)
 * @returns The Sephirah name or null if not found
 */
export function getSephirahByNumber(numero: number): string | null {
  const values = Object.values(TAROT_SEPHIROT_MAPPINGS);
  const found = values.find(m => m.numero_carta === numero);
  return found ? found.sephirah : null;
}
