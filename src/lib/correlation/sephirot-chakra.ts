/**
 * Sephirot-Chakra Spiritual Correlation Mapping
 * Maps the ten Sephiroth of the Tree of Life to Hindu energy centers (chakras)
 * Based on traditional Kabbalistic and Yogic correspondences
 */

export type Elemento = 'Fogo' | 'Terra' | 'Ar' | 'Água' | 'Éter';

export type ChakraName =
  | 'Muladhara'
  | 'Svadhisthana'
  | 'Manipura'
  | 'Anahata'
  | 'Vishuddha'
  | 'Ajna'
  | 'Sahasrara';

/**
 * Represents the correlation between a Sephirah and its chakra correspondence
 */
export interface SephirotChakra {
  /** The name of the Sephirah in Hebrew/English */
  sephirah: string;
  /** The corresponding chakra name */
  chakra: ChakraName;
  /** The Sanskrit chakra name with location */
  chakra_sanskrit: string;
  /** The corresponding classical element */
  elemento: Elemento;
  /** Path number on the Tree of Life */
  numero_caminho: number;
  /** Spiritual energy and quality of the sephirah-chakra connection */
  energia_espiritual: string;
}

// ─── Sephirot-to-Chakra Mapping ─────────────────────────────────────────────

export const SEPHIROT_CHAKRA_MAPPINGS: Record<string, SephirotChakra> = {
  // 1. Kether (Corona) - Sahasrara - Éter - Conexão Divina Absoluta
  // A coroa divina, o ponto mais alto da árvore, conecta ao chakra da coroa
  Kether: {
    sephirah: 'Kether',
    chakra: 'Sahasrara',
    chakra_sanskrit: 'Sahasrara (Coroa)',
    elemento: 'Éter',
    numero_caminho: 1,
    energia_espiritual: 'Conexão Divina Absoluta / Pureza Primordial / Iluminação Transcendente',
  },

  // 2. Chokmah (Sabedoria) - Ajna - Éter - Visão Integrativa
  // A sabedoria dinâmica que vê o todo, relacionada ao terceiro olho
  Chokmah: {
    sephirah: 'Chokmah',
    chakra: 'Ajna',
    chakra_sanskrit: 'Ajna (Terceiro Olho)',
    elemento: 'Éter',
    numero_caminho: 2,
    energia_espiritual: 'Visão Integrativa / Sabedoria Dinâmica / Comando da Criação',
  },

  // 3. Binah (Entendimento) - Ajna/Vishuddha - Ar - Discernimento Estruturado
  // O entendimento formativo que dá forma, relacionado ao terceiro olho e à garganta
  Binah: {
    sephirah: 'Binah',
    chakra: 'Vishuddha',
    chakra_sanskrit: 'Vishuddha (Garganta)',
    elemento: 'Ar',
    numero_caminho: 3,
    energia_espiritual: 'Discernimento Superior / Limitação Sagrada / Expressão da Verdade',
  },

  // 4. Chesed (Misericórdia) - Anahata - Água - Expansão Abundante
  // A misericórdia divina que expande, relacionada ao coração
  Chesed: {
    sephirah: 'Chesed',
    chakra: 'Anahata',
    chakra_sanskrit: 'Anahata (Coração)',
    elemento: 'Água',
    numero_caminho: 4,
    energia_espiritual: 'Expansão Abundante / Amor Incondicional / Misericórdia Divina',
  },

  // 5. Geburah (Severidade) - Manipura - Fogo - Força Cortante
  // A força cortante que transforma, relacionada ao plexo solar
  Geburah: {
    sephirah: 'Geburah',
    chakra: 'Manipura',
    chakra_sanskrit: 'Manipura (Plexo Solar)',
    elemento: 'Fogo',
    numero_caminho: 5,
    energia_espiritual: 'Força Transformadora / Poderiwa / Justice Divina',
  },

  // 6. Tiphereth (Beleza) - Anahata - Fogo - Harmonia Vital
  // A harmonia central que reconcilia os opostos, relacionada ao coração
  Tiphereth: {
    sephirah: 'Tiphereth',
    chakra: 'Anahata',
    chakra_sanskrit: 'Anahata (Coração)',
    elemento: 'Fogo',
    numero_caminho: 6,
    energia_espiritual: 'Harmonia Vital / Brilho Solar / Propósito de Vida',
  },

  // 7. Netzach (Vitória) - Anahata - Água - Amor Emocional
  // A vitória emocional através do amor, relacionada ao coração
  Netzach: {
    sephirah: 'Netzach',
    chakra: 'Anahata',
    chakra_sanskrit: 'Anahata (Coração)',
    elemento: 'Água',
    numero_caminho: 7,
    energia_espiritual: 'Vitória Emocional / Paixão Universal / Amor Profundo',
  },

  // 8. Hod (Glória) - Vishuddha - Ar - Intelecto Superior
  // A glória intelectual e a comunicação da verdade, relacionada à garganta
  Hod: {
    sephirah: 'Hod',
    chakra: 'Vishuddha',
    chakra_sanskrit: 'Vishuddha (Garganta)',
    elemento: 'Ar',
    numero_caminho: 8,
    energia_espiritual: 'Intelecto Superior / Comunicação Divina / Estrutura Mental',
  },

  // 9. Yesod (Fundação) - Svadhisthana - Água - Imaginação Subconsciente
  // A fundação do subconsciente, relacionada ao chakra sacral
  Yesod: {
    sephirah: 'Yesod',
    chakra: 'Svadhisthana',
    chakra_sanskrit: 'Svadhisthana (Sacro)',
    elemento: 'Água',
    numero_caminho: 9,
    energia_espiritual: 'Imaginação Subconsciente / Base Energética / Lua Interior',
  },

  // 10. Malkuth (Reino) - Muladhara - Terra - Manifestação Material
  // O reino material que ancora, relacionado ao chakra raiz
  Malkuth: {
    sephirah: 'Malkuth',
    chakra: 'Muladhara',
    chakra_sanskrit: 'Muladhara (Raiz)',
    elemento: 'Terra',
    numero_caminho: 10,
    energia_espiritual: 'Manifestação Material / Aterramento / Realização no Mundo',
  },
} as const;

// Freeze the mapping object to prevent modifications
Object.freeze(SEPHIROT_CHAKRA_MAPPINGS);

/**
 * Get the Sephirot-Chakra correlation mapping
 * @param sephirah - The name of the Sephirah (e.g., 'Kether', 'Chokmah')
 * @returns The correlation mapping or null if not found
 */
export function getSephirotChakra(sephirah: string): SephirotChakra | null {
  return SEPHIROT_CHAKRA_MAPPINGS[sephirah] ?? null;
}

/**
 * Alias for getSephirotChakra - Get the Sephirah-Chakra correlation mapping
 * @param sephirah - The name of the Sephirah (e.g., 'Kether', 'Chokmah')
 * @returns The correlation mapping or null if not found
 */
function getSephirahChakra(sephirah: string): SephirotChakra | null {
  return getSephirotChakra(sephirah);
}

/**
 * Get the Sephiroth associated with a specific chakra
 * @param chakra - The chakra name (e.g., 'Sahasrara', 'Ajna', 'Muladhara')
 * @returns Array of SephirotChakra mappings for the given chakra
 */
export function getChakraSephirot(chakra: string): SephirotChakra[] {
  const normalizedChakra = normalizeChakraName(chakra);
  return Object.values(SEPHIROT_CHAKRA_MAPPINGS).filter(
    mapping => mapping.chakra === normalizedChakra
  );
}

/**
 * Alias for getChakraSephirot - Get the Sephiroth associated with a specific chakra
 * @param chakra - The chakra name (e.g., 'Sahasrara', 'Ajna', 'Muladhara')
 * @returns Array of SephirotChakra mappings for the given chakra
 */
function getChakraSephiroth(chakra: string): SephirotChakra[] {
  return getChakraSephirot(chakra);
}

/**
 * Get all available Sephirot-Chakra mappings
 * @returns Array of all correlation mappings
 */
export function getAllSephirotChakras(): SephirotChakra[] {
  return Object.values(SEPHIROT_CHAKRA_MAPPINGS);
}

/**
 * Get all Sephirah names
 * @returns Array of Sephirah names
 */
export function getAllSephiroth(): string[] {
  return Object.keys(SEPHIROT_CHAKRA_MAPPINGS);
}

/**
 * Check if a Sephirah exists in the mapping
 * @param sephirah - The name of the Sephirah to check
 * @returns True if Sephirah exists in mapping
 */
export function hasSephirotChakra(sephirah: string): boolean {
  return sephirah in SEPHIROT_CHAKRA_MAPPINGS;
}

/**
 * Normalizes chakra name to match ChakraName type.
 * Handles various input formats (English, Sanskrit locations, with/without diacritics).
 */
function normalizeChakraName(chakra: string): ChakraName {
  const normalized = chakra.toLowerCase().trim();

  // Direct matches
  const directMap: Record<string, ChakraName> = {
    muladhara: 'Muladhara',
    svadhisthana: 'Svadhisthana',
    manipura: 'Manipura',
    anahata: 'Anahata',
    vishuddha: 'Vishuddha',
    ajna: 'Ajna',
    sahasrara: 'Sahasrara',
    // English variants
    root: 'Muladhara',
    sacral: 'Svadhisthana',
    solar: 'Manipura',
    heart: 'Anahata',
    throat: 'Vishuddha',
    third: 'Ajna',
    third_eye: 'Ajna',
    crown: 'Sahasrara',
  };

  if (directMap[normalized]) {
    return directMap[normalized];
  }

  // Partial matches for compound names
  for (const [key, value] of Object.entries(directMap)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return value;
    }
  }

  // Fallback: try to match by checking if input is contained in any chakra
  for (const chakraName of Object.values(directMap)) {
    if (chakraName.toLowerCase().includes(normalized)) {
      return chakraName;
    }
  }

  // Return as-is and let the type system handle validation
  return normalized as ChakraName;
}
