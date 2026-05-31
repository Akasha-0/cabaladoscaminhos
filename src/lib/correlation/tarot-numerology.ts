/**
 * Tarot-Numerology Major Arcana Correlation
 * Correlates the 22 Major Arcana cards with numerology numbers
 * Maps the spiritual symbolism of each arcano to its numerological essence
 */

/**
 * Represents the correlation between a Tarot Major Arcana card and its numerology correspondence
 */
export interface TarotNumerologyMapping {
  /** The arcano name (e.g., 'O Louco', 'O Mago', 'A Imperatriz') */
  arcano: string;
  /** The Major Arcana card number (0-21) */
  numero_carta: number;
  /** The associated numerology number (1-9, with11,22 as master numbers) */
  numero_numerologia: number;
  /** Elemental association (Fogo, Água, Terra, Ar, Éter) */
  elemento: string;
  /** Spiritual meaning and archetype */
  significado_espiritual: string;
}

// ─── Tarot Major Arcana to Numerology Mapping ─────────────────────────────────

export const TAROT_NUMEROLOGY_MAPPINGS: Record<string, TarotNumerologyMapping> = {
  // 0. O Louco - Number 0 (special, infinite potential)
  'O Louco': {
    arcano: 'O Louco',
    numero_carta: 0,
    numero_numerologia: 0,
    elemento: 'Éter',
    significado_espiritual: 'Liberdade absoluta, salto da fé, novo começo, inconsciência divina. O ponto zero onde todas as possibilidades existem simultaneamente. A pureza que precede toda forma.',
  },

  // 1. O Mago - Number 1 (initiative, willpower)
  'O Mago': {
    arcano: 'O Mago',
    numero_carta: 1,
    numero_numerologia: 1,
    elemento: 'Água',
    significado_espiritual: 'Vontade criativa, poder de manifestar, maestria das ferramentas sagradas. O universo se expressa através da mente. A energia masculina primordial que articula o divino.',
  },

  // 2. A Alta Sacerdotisa - Number 2 (intuition, mystery)
  'A Alta Sacerdotisa': {
    arcano: 'A Alta Sacerdotisa',
    numero_carta: 2,
    numero_numerologia: 2,
    elemento: 'Terra',
    significado_espiritual: 'Discernimento, mistério oculto, o véu entre os mundos. A energia feminina que forma e limita. A intuição sagrada que percebe além do véu.',
  },

  // 3. A Imperatriz - Number 3 (creation, fertility)
  'A Imperatriz': {
    arcano: 'A Imperatriz',
    numero_carta: 3,
    numero_numerologia: 3,
    elemento: 'Terra',
    significado_espiritual: 'Criação abundante, fertilidade, força feminil. A mãe natureza que nutre mas também poda. A expressão criativa que manifesta a vida.',
  },

  // 4. O Imperador - Number 4 (authority, structure)
  'O Imperador': {
    arcano: 'O Imperador',
    numero_carta: 4,
    numero_numerologia: 4,
    elemento: 'Fogo',
    significado_espiritual: 'Autoridade estruturante, lei sagrada, expansão ordenada. O pai cósmico que estabelece a ordem. A disciplina que constrói fundamentos sólidos.',
  },

  // 5. O Hierofante - Number 5 (tradition, spirituality)
  'O Hierofante': {
    arcano: 'O Hierofante',
    numero_carta: 5,
    numero_numerologia: 5,
    elemento: 'Fogo',
    significado_espiritual: 'Iniciação sagrada, doutrina divina, o mestre que transmite a tradição. O puente entre o humano e o divino. A sabedoria acumulada dos séculos.',
  },

  // 6. Os Enamorados - Number 6 (union, choice)
  'Os Enamorados': {
    arcano: 'Os Enamorados',
    numero_carta: 6,
    numero_numerologia: 6,
    elemento: 'Ar',
    significado_espiritual: 'Escolha amorosa, união das polaridades, união sagrada. A decisão entre dois caminhos através do amor. A harmonia entre opostos que se atraem.',
  },

  // 7. O Carro - Number 7 (determination, victory)
  'O Carro': {
    arcano: 'O Carro',
    numero_carta: 7,
    numero_numerologia: 7,
    elemento: 'Água',
    significado_espiritual: 'Vitória através da vontade, triunfo da mente sobre a matéria. O conquistador que domina pelo equilíbrio das polaridades. A determinação que vence obstáculos.',
  },

  // 8. A Justiça - Number 8 (balance, karma)
  'A Justiça': {
    arcano: 'A Justiça',
    numero_carta: 8,
    numero_numerologia: 8,
    elemento: 'Ar',
    significado_espiritual: 'Lei cósmica, equilíbrio karma, a balança que mede ações e consequências. A verdade que se revela. O karma em ação, a causa e o efeito em perfeita equilíbrio.',
  },

  // 9. O Eremita - Number 9 (wisdom, solitude)
  'O Eremita': {
    arcano: 'O Eremita',
    numero_carta: 9,
    numero_numerologia: 9,
    elemento: 'Terra',
    significado_espiritual: 'Iluminação interior, solitude sagrada, a sabedoria da escuridão. O solitário que carrega a luz para o mundo. A sabedoria que nasce na reflexão profunda.',
  },

  // 10. A Roda da Fortuna - Number 1 (1+0=1, cycles, destiny)
  'A Roda da Fortuna': {
    arcano: 'A Roda da Fortuna',
    numero_carta: 10,
    numero_numerologia: 1,
    elemento: 'Fogo',
    significado_espiritual: 'Ciclos do destino, mudança inevitável, a roda que gira entre ascensão e queda. O eterno retorno, o ponto de virada onde a sorte muda. A energia do novo começo cíclico.',
  },

  // 11. A Força - Number 2 (1+1=2, courage, compassion)
  'A Força': {
    arcano: 'A Força',
    numero_carta: 11,
    numero_numerologia: 2,
    elemento: 'Ar',
    significado_espiritual: 'Coragem interior, domínio das paixões, a força do espírito sobre o instinto. O leão domesticado que representa o poder da suavidade. A compaixão que supera a força bruta.',
  },

  // 12. O Enforcado - Number 3 (1+2=3, sacrifice, perspective)
  'O Enforcado': {
    arcano: 'O Enforcado',
    numero_carta: 12,
    numero_numerologia: 3,
    elemento: 'Água',
    significado_espiritual: 'Sacrifício voluntário, nova perspectiva, o suspension que revela a verdade oculta. A entrega que traz vitória. A sabedoria que vem do sacrifício e da mudança de ponto de vista.',
  },

  // 13. A Morte - Number 4 (1+3=4, transformation, endings)
  'A Morte': {
    arcano: 'A Morte',
    numero_carta: 13,
    numero_numerologia: 4,
    elemento: 'Terra',
    significado_espiritual: 'Transformação inevitável, fim de ciclo, a morte que precede o renascimento. A dissolução que libera para o novo. A sabedoria da impermanência e da renovação.',
  },

  // 14. A Temperança - Number 5 (1+4=5, balance, moderation)
  'A Temperança': {
    arcano: 'A Temperança',
    numero_carta: 14,
    numero_numerologia: 5,
    elemento: 'Água',
    significado_espiritual: 'Equilíbrio e harmonia, integração dos opostos, a alquimia interior. O anjo que misturam água e vinho. A moderação sagrada que une extremos.',
  },

  // 15. O Diabo - Number 6 (1+5=6, illusion, attachment)
  'O Diabo': {
    arcano: 'O Diabo',
    numero_carta: 15,
    numero_numerologia: 6,
    elemento: 'Terra',
    significado_espiritual: 'Ilusão e apego, materialidade extrema, o reino da sombra que prende. A queda que esconde a luz. A lição sobre os limites do reino material e dos prazeres terrenais.',
  },

  // 16. A Torre - Number 7 (1+6=7, destruction, revelation)
  'A Torre': {
    arcano: 'A Torre',
    numero_carta: 16,
    numero_numerologia: 7,
    elemento: 'Fogo',
    significado_espiritual: 'Destruição criativa, revelação súbita, a torre que cai para libertar. O raio que dissipa a ilusão. A destruição que abre espaço para o novo.',
  },

  // 17. A Estrela - Number 8 (1+7=8, hope, inspiration)
  'A Estrela': {
    arcano: 'A Estrela',
    numero_carta: 17,
    numero_numerologia: 8,
    elemento: 'Ar',
    significado_espiritual: 'Esperança e inspiração, renovação após a crise, a estrela que guia no deserto. A luz que aponta para o futuro. A inspiração que renova a esperança.',
  },

  // 18. A Lua - Number 9 (1+8=9, illusion, unconscious)
  'A Lua': {
    arcano: 'A Lua',
    numero_carta: 18,
    numero_numerologia: 9,
    elemento: 'Água',
    significado_espiritual: 'Ilusão e inconsciente, medo e fantasia, a lua que ilumina a noite. O reino das sombras, os medos ocultos. A transformação que vem da escuridão e do confronto com o inconsciente.',
  },

  // 19. O Sol - Number 1 (1+9=10→1, success, vitality)
  'O Sol': {
    arcano: 'O Sol',
    numero_carta: 19,
    numero_numerologia: 1,
    elemento: 'Fogo',
    significado_espiritual: 'Sucesso e vitalidade, consciência iluminada, o sol que dissolve as sombras. A criança interior que celebra. A harmonia do espírito concretizada em triunfo.',
  },

  // 20. O Julgamento - Number 2 (2+0=2, rebirth, redemption)
  'O Julgamento': {
    arcano: 'O Julgamento',
    numero_carta: 20,
    numero_numerologia: 2,
    elemento: 'Fogo',
    significado_espiritual: 'Renascimento e redenção, julgamento final, a trombeta que desperta os mortos. A vitória sobre a morte. O despertar que proclama uma nova era de consciência.',
  },

  // 21. O Mundo - Number 3 (2+1=3, completion, integration)
  'O Mundo': {
    arcano: 'O Mundo',
    numero_carta: 21,
    numero_numerologia: 3,
    elemento: 'Terra',
    significado_espiritual: 'Completude e realização, integração do todo, a serpente que abraça o mundo. A conclusão de um ciclo. A vitória do reino sobre a tensão, a integração de todos os opostos.',
  },
} as const;

// Freeze the mapping object to prevent modifications
Object.freeze(TAROT_NUMEROLOGY_MAPPINGS);
// Freeze nested objects
Object.values(TAROT_NUMEROLOGY_MAPPINGS).forEach(mapping => Object.freeze(mapping));

/**
 * Get the Tarot-Numerology correlation mapping by arcano name
 * @param arcano - The arcano name (e.g., 'O Louco', 'O Mago', 'A Imperatriz')
 * @returns The correlation mapping or null if not found
 */
export function getTarotNumerology(arcano: string): TarotNumerologyMapping | null {
  return TAROT_NUMEROLOGY_MAPPINGS[arcano] ?? null;
}

/**
 * Get the Numerology-Tarot correlation mapping by numerology number
 * @param numero - The numerology number (0-9, where 0 represents The Fool's special state)
 * @returns The correlation mapping or null if not found
 */
export function getNumerologyTarot(numero: number): TarotNumerologyMapping[] {
  return Object.values(TAROT_NUMEROLOGY_MAPPINGS)
    .filter(mapping => mapping.numero_numerologia === numero)
    .sort((a, b) => a.numero_carta - b.numero_carta);
}

/**
 * Get all available Tarot-Numerology mappings
 * @returns Array of all correlation mappings sorted by arcano number
 */
export function getAllTarotNumerology(): TarotNumerologyMapping[] {
  return Object.values(TAROT_NUMEROLOGY_MAPPINGS)
    .sort((a, b) => a.numero_carta - b.numero_carta);
}

/**
 * Get all available Tarot-Numerology mappings (alias)
 * @returns Array of all correlation mappings sorted by arcano number
 */
export function getAllTarotNumerologies(): TarotNumerologyMapping[] {
  return Object.values(TAROT_NUMEROLOGY_MAPPINGS)
    .sort((a, b) => a.numero_carta - b.numero_carta);
}

/**
 * Get all arcano names
 * @returns Array of arcano names sorted by card number
 */
export function getAllArcanos(): string[] {
  return Object.values(TAROT_NUMEROLOGY_MAPPINGS)
    .sort((a, b) => a.numero_carta - b.numero_carta)
    .map(m => m.arcano);
}

/**
 * Check if an arcano exists in the mapping
 * @param arcano - The arcano name to check
 * @returns True if arcano exists in mapping
 */
export function hasTarotNumerology(arcano: string): boolean {
  return arcano in TAROT_NUMEROLOGY_MAPPINGS;
}

/**
 * Get arcano by card number in Major Arcana
 * @param numero - The Major Arcana card number (0-21)
 * @returns The arcano name or null if not found
 */
export function getArcanoByNumber(numero: number): string | null {
  const entry = Object.values(TAROT_NUMEROLOGY_MAPPINGS)
    .find(m => m.numero_carta === numero);
  return entry?.arcano ?? null;
}

/**
 * Get numerology number by card number in Major Arcana
 * @param numero - The Major Arcana card number (0-21)
 * @returns The numerology number or null if not found
 */
export function getNumerologyByCardNumber(numero: number): number | null {
  const entry = Object.values(TAROT_NUMEROLOGY_MAPPINGS)
    .find(m => m.numero_carta === numero);
  return entry?.numero_numerologia ?? null;
}

/**
 * Get mappings filtered by element
 * @param elemento - Element to filter by (Fogo, Água, Terra, Ar, Éter)
 * @returns Array of TarotNumerologyMapping objects matching the element
 */
export function getTarotNumerologyByElement(elemento: string): TarotNumerologyMapping[] {
  return Object.values(TAROT_NUMEROLOGY_MAPPINGS)
    .filter(mapping => mapping.elemento.toLowerCase() === elemento.toLowerCase())
    .sort((a, b) => a.numero_carta - b.numero_carta);
}

/**
 * Get mappings filtered by numerology number
 * @param numero - Numerology number to filter by (0-9)
 * @returns Array of TarotNumerologyMapping objects with the matching numerology number
 */
export function getTarotByNumerologyNumber(numero: number): TarotNumerologyMapping[] {
  return Object.values(TAROT_NUMEROLOGY_MAPPINGS)
    .filter(mapping => mapping.numero_numerologia === numero)
    .sort((a, b) => a.numero_carta - b.numero_carta);
}

/**
 * Get all unique numerology numbers
 * @returns Array of unique numerology numbers
 */
export function getAllNumerologyNumbers(): number[] {
  const numbers = Object.values(TAROT_NUMEROLOGY_MAPPINGS)
    .map(m => m.numero_numerologia);
  return [...new Set(numbers)].sort((a, b) => a - b);
}

/**
 * Get all unique elements
 * @returns Array of unique element names
 */
export function getAllElements(): string[] {
  const elements = Object.values(TAROT_NUMEROLOGY_MAPPINGS)
    .map(m => m.elemento);
  return [...new Set(elements)].sort();
}
/**
 * Default export with all public functions
 */
export default {
  getNumerologyTarot,
  getAllTarotNumerologies,
  getAllArcanos,
  hasTarotNumerology,
  getArcanoByNumber,
  getNumerologyByCardNumber,
  getTarotNumerologyByElement,
  getTarotByNumerologyNumber,
  getAllNumerologyNumbers,
  getAllElements,
};
