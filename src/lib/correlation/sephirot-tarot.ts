/**
 * Sephirot-Tarot Correlation Mapping
 * Based on IDEIA.md "Tabela de Correspondência Macro: Oito Portais da Consciência"
 * Aligns the 10 Sephiroth of the Kabbalistic Tree of Life with Tarot Major Arcana cards
 */

/**
 * Represents the correlation between a Sephirah and its Tarot Major Arcana correspondence
 */
export interface SephirahTarot {
  /** The name of the Sephirah in Hebrew/English */
  sephirah: string;
  /** The Major Arcana card name */
  arcano: string;
  /** The card number in the Major Arcana (0-21) */
  numero_carta: number;
  /** Path number on the Tree of Life (1-22) */
  numero_caminho: number;
  /** Spiritual meaning and archetype */
  significado_espiritual: string;
}

// ─── Sephirot-to-Tarot Major Arcana Mapping ─────────────────────────────────────

export const SEPHIROT_TAROT_MAPPINGS: Record<string, SephirahTarot> = {
  // 1. Kether (Coroa) - O Louco (0) - Caminho 1
  // A coroa divina, o ponto zero da existência, a pureza original antes da forma.
  Kether: {
    sephirah: 'Kether',
    arcano: 'O Louco',
    numero_carta: 0,
    numero_caminho: 1,
    significado_espiritual: 'Pureza original, inconsciência divina, o salto da fé além da razão. O ponto zero onde todo conhecimento ainda não foi separado do ser. A coroa que precede toda forma.',
  },

  // 2. Chokmah (Sabedoria) - O Mago (I) - Caminho 2
  // A sabedoria dinâmica, o impulso primário da criação, o desejo de se manifestar.
  Chokmah: {
    sephirah: 'Chokmah',
    arcano: 'O Mago',
    numero_carta: 1,
    numero_caminho: 2,
    significado_espiritual: 'Vontade criativa, poder de manifestar através das ferramentas sagradas. O universo se expressa através da mente. A energia masculina primordial que articula o divino.',
  },

  // 3. Binah (Entendimento) - A Alta Sacerdotisa (II) - Caminho 3
  // O entendimento formativo, a limitação que dá forma, o recipiente que contém.
  Binah: {
    sephirah: 'Binah',
    arcano: 'A Alta Sacerdotisa',
    numero_carta: 2,
    numero_caminho: 3,
    significado_espiritual: 'Discernimento, mistério oculto, o véu entre os mundos. A energia feminina que forma e limita. A limitação sagrada que permite a existência ser individuada.',
  },

  // 4. Chesed (Misericórdia) - O Imperador (IV) - Caminho 4
  // A misericórdia expansiva, a estrutura que sustenta, a lei da abundância.
  Chesed: {
    sephirah: 'Chesed',
    arcano: 'O Imperador',
    numero_carta: 4,
    numero_caminho: 4,
    significado_espiritual: 'Autoridade estruturante, lei sagrada, expansão ordenada. O pai cósmico que estabelece a ordem e a Hierarquia Divina. A estrutura que sustenta a criação.',
  },

  // 5. Geburah (Severidade) - A Imperatriz (III) - Caminho 5
  // A força cortante, a justiça que poda, o poder transformador da limitação.
  Geburah: {
    sephirah: 'Geburah',
    arcano: 'A Imperatriz',
    numero_carta: 3,
    numero_caminho: 5,
    significado_espiritual: 'Criação abundante, fertilidade, força feminil cortante. A mãe natureza que nutre mas também poda. A energia que transforma pela limitação e pelo julgamento.',
  },

  // 6. Tiphereth (Beleza) - O Hierofante (V) - Caminho 6
  // A harmonia central, o ponto de equilibrio entre as polaridades.
  Tiphereth: {
    sephirah: 'Tiphereth',
    arcano: 'O Hierofante',
    numero_carta: 5,
    numero_caminho: 6,
    significado_espiritual: 'Iniciação sagrada, doutrina divina, o mestre que transmite a tradição. O puente entre o humano e o divino. Aharmonia que reconcilia os opostos.',
  },

  // 7. Netzach (Vitória) - Os Enamorados (VI) - Caminho 7
  // A vitória emocional, a paixão, a união dos opostos através do amor.
  Netzach: {
    sephirah: 'Netzach',
    arcano: 'Os Enamorados',
    numero_carta: 6,
    numero_caminho: 7,
    significado_espiritual: 'Escolha amorosa, união das polaridades, vitória pelo coração. A decisão entre dois caminhos através do amor. A paixão que vence toda resistência.',
  },

  // 8. Hod (Glória) - O Carro (VII) - Caminho 8
  // A glória intelectual, a comunicação da verdade, a vitória da mente.
  Hod: {
    sephirah: 'Hod',
    arcano: 'O Carro',
    numero_carta: 7,
    numero_caminho: 8,
    significado_espiritual: 'Vitória através da vontade, a carruagem da alma, triundo da mente sobre a matéria. O conquistador que domina pelo equilibrio das polaridades. A glória da consciência ordenada.',
  },

  // 9. Yesod (Fundação) - A Justiça (VIII) - Caminho 9
  // A fundação do subconsciente, a base sobre a qual tudo se manifesta.
  Yesod: {
    sephirah: 'Yesod',
    arcano: 'A Justiça',
    numero_carta: 8,
    numero_caminho: 9,
    significado_espiritual: 'Lei cósmica, equilibrio karma, a balança que medida ações e consequências. A fundação do templo interior. O equilibrio entre o que foi semeado e o que será colhido.',
  },

  // 10. Malkuth (Reino) - O Eremita (IX) - Caminho 10
  // O reino material, a manifestação final, a terra sobre a qual tudo se ancora.
  Malkuth: {
    sephirah: 'Malkuth',
    arcano: 'O Eremita',
    numero_carta: 9,
    numero_caminho: 10,
    significado_espiritual: 'Iluminação interior, solitude sagrada, a sabedoria da escuridão. O solitario que carrega a luz para o mundo. A sabedoria que nasce na stillness do reino material.',
  },
} as const;

// Freeze the mapping object to prevent modifications
Object.freeze(SEPHIROT_TAROT_MAPPINGS);
// Freeze nested objects
Object.values(SEPHIROT_TAROT_MAPPINGS).forEach(mapping => Object.freeze(mapping));

/**
 * Get the Sephirah-Tarot correlation mapping
 * @param sephirah - The name of the Sephirah (e.g., 'Kether', 'Chokmah')
 * @returns The correlation mapping or null if not found
 */
export function getSephirahTarot(sephirah: string): SephirahTarot | null {
  return SEPHIROT_TAROT_MAPPINGS[sephirah] ?? null;
}
/**
 * Alias for getSephirahTarot - Get the Sephirot-Tarot correlation mapping
 * @param sephirah - The name of the Sephirah (e.g., 'Kether', 'Chokmah')
 * @returns The correlation mapping or null if not found
 */
export function getSephirotTarot(sephirah: string): SephirahTarot | null {
  return getSephirahTarot(sephirah);
}

/**
 * Get the Sephirah corresponding to a Tarot Major Arcana card
 * @param arcano - The arcano name (e.g., 'O Louco', 'O Mago', 'A Alta Sacerdotisa')
 * @returns The Sephirah name or null if not found
 */
export function getTarotSephirah(arcano: string): string | null {
  const entry = Object.values(SEPHIROT_TAROT_MAPPINGS).find(
    mapping => mapping.arcano === arcano
  );
  return entry?.sephirah ?? null;
}
/**
 * Alias for getTarotSephirah - Get the Sephirah corresponding to a Tarot Major Arcana card
 * @param arcano - The arcano name (e.g., 'O Louco', 'O Mago', 'A Alta Sacerdotisa')
 * @returns The Sephirah name or null if not found
 */
export function getTarotSephirot(arcano: string): string | null {
  return getTarotSephirah(arcano);
}

/**
 * Get all available Sephirah-Tarot mappings
 * @returns Array of all correlation mappings
 */
export function getAllSephirahTarots(): SephirahTarot[] {
  return Object.values(SEPHIROT_TAROT_MAPPINGS);
}
/**
 * Alias for getAllSephirahTarots - Get all available Sephirot-Tarot mappings
 * @returns Array of all correlation mappings
 */
export function getAllSephirotTarots(): SephirahTarot[] {
  return getAllSephirahTarots();
}

/**
 * Get all Sephirah names
 * @returns Array of Sephirah names
 */
export function getAllSephiroth(): string[] {
  return Object.keys(SEPHIROT_TAROT_MAPPINGS);
}

/**
 * Check if a Sephirah exists in the mapping
 * @param sephirah - The name of the Sephirah to check
 * @returns True if Sephirah exists in mapping
 */
export function hasSephirahTarot(sephirah: string): boolean {
  return sephirah in SEPHIROT_TAROT_MAPPINGS;
}

/**
 * Get Sephirah by path number on Tree of Life
 * @param path - The path number (1-10)
 * @returns The Sephirah-Tarot mapping or null if not found
 */
export function getSephirahByPath(path: number): SephirahTarot | null {
  const entry = Object.values(SEPHIROT_TAROT_MAPPINGS).find(
    mapping => mapping.numero_caminho === path
  );
  return entry ?? null;
}

/**
 * Get arcano by card number in Major Arcana
 * @param numero - The Major Arcana card number (0-21)
 * @returns The arcano name or null if not found
 */
export function getArcanoByNumber(numero: number): string | null {
  const entry = Object.values(SEPHIROT_TAROT_MAPPINGS).find(
    mapping => mapping.numero_carta === numero
  );
  return entry?.arcano ?? null;
}

/**
 * Get Sephirah by card number in Major Arcana
 * @param numero - The Major Arcana card number (0-21)
 * @returns The Sephirah name or null if not found
 */
export function getSephirahByNumber(numero: number): string | null {
  const entry = Object.values(SEPHIROT_TAROT_MAPPINGS).find(
    mapping => mapping.numero_carta === numero
  );
  return entry?.sephirah ?? null;
}