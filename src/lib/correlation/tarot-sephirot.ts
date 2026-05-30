/**
 * Tarot-Sephirot Correlation Mapping
 * Based on IDEIA.md "Tabela de Correspondência Macro: Oito Portais da Consciência"
 * Aligns the 22 Major Arcana cards with their corresponding Sephiroth on the Kabbalistic Tree of Life
 */

/**
 * Represents the correlation between a Tarot Major Arcana card and its Sephirah correspondence
 */
export interface TarotSephirot {
  /** The Major Arcana card name (Portuguese) */
  arcano: string;
  /** The arcano number in the Major Arcana sequence (0-21) */
  numero_carta: number;
  /** The associated Sephirah name in Hebrew/English */
  sephirah: string;
  /** Path number on the Tree of Life (1-22) */
  numero_caminho: number;
  /** Primary elemental correspondence */
  elemento: string;
  /** Spiritual meaning and archetype */
  significado_espiritual: string;
}

// ─── Tarot Major Arcana to Sephiroth Mapping ─────────────────────────────────

export const TAROT_SEPHIROT_MAPPINGS: Record<string, TarotSephirot> = {
  // 0. O Louco - Path 1 - Kether (Crown) - Éter
  'O Louco': {
    arcano: 'O Louco',
    numero_carta: 0,
    sephirah: 'Kether',
    numero_caminho: 1,
    elemento: 'Éter',
    significado_espiritual: 'Pureza original, inconsciência divina, o salto da fé além da razão. O ponto zero onde todo conhecimento ainda não foi separado do ser. A coroa que precede toda forma.',
  },

  // 1. O Mago - Path 2 - Chokmah (Wisdom) - Água
  'O Mago': {
    arcano: 'O Mago',
    numero_carta: 1,
    sephirah: 'Chokmah',
    numero_caminho: 2,
    elemento: 'Água',
    significado_espiritual: 'Vontade criativa, poder de manifestar através das ferramentas sagradas. O universo se expressa através da mente. A energia masculina primordial que articula o divino.',
  },

  // 2. A Alta Sacerdotisa - Path 3 - Binah (Understanding) - Terra
  'A Alta Sacerdotisa': {
    arcano: 'A Alta Sacerdotisa',
    numero_carta: 2,
    sephirah: 'Binah',
    numero_caminho: 3,
    elemento: 'Terra',
    significado_espiritual: 'Discernimento, mistério oculto, o véu entre os mundos. A energia feminina que forma e limita. A limitação sagrada que permite a existência ser individuada.',
  },

  // 3. A Imperatriz - Path 4 - Chesed (Mercy) - Terra
  'A Imperatriz': {
    arcano: 'A Imperatriz',
    numero_carta: 3,
    sephirah: 'Chesed',
    numero_caminho: 4,
    elemento: 'Terra',
    significado_espiritual: 'Criação abundante, fertilidade, força feminil cortante. A mãe natureza que nutre mas também poda. A energia que transforma pela limitação e pelo julgamento.',
  },

  // 4. O Imperador - Path 5 - Geburah (Severity) - Fogo
  'O Imperador': {
    arcano: 'O Imperador',
    numero_carta: 4,
    sephirah: 'Geburah',
    numero_caminho: 5,
    elemento: 'Fogo',
    significado_espiritual: 'Autoridade estruturante, lei sagrada, expansão ordenada. O pai cósmico que estabelece a ordem e a Hierarquia Divina. A estrutura que sustenta a criação.',
  },

  // 5. O Hierofante - Path 6 - Tiphereth (Beauty) - Fogo
  'O Hierofante': {
    arcano: 'O Hierofante',
    numero_carta: 5,
    sephirah: 'Tiphereth',
    numero_caminho: 6,
    elemento: 'Fogo',
    significado_espiritual: 'Iniciação sagrada, doutrina divina, o mestre que transmite a tradição. O puente entre o humano e o divino. A harmonia que reconcilia os opostos.',
  },

  // 6. Os Enamorados - Path 7 - Netzach (Victory) - Ar
  'Os Enamorados': {
    arcano: 'Os Enamorados',
    numero_carta: 6,
    sephirah: 'Netzach',
    numero_caminho: 7,
    elemento: 'Ar',
    significado_espiritual: 'Escolha amorosa, união das polaridades, vitória pelo coração. A decisão entre dois caminhos através do amor. A paixão que vence toda resistência.',
  },

  // 7. O Carro - Path 8 - Hod (Glory) - Água
  'O Carro': {
    arcano: 'O Carro',
    numero_carta: 7,
    sephirah: 'Hod',
    numero_caminho: 8,
    elemento: 'Água',
    significado_espiritual: 'Vitória através da vontade, a carruagem da alma, triunfo da mente sobre a matéria. O conquistador que domina pelo equilíbrio das polaridades. A glória da consciência ordenada.',
  },

  // 8. A Justiça - Path 9 - Yesod (Foundation) - Ar
  'A Justiça': {
    arcano: 'A Justiça',
    numero_carta: 8,
    sephirah: 'Yesod',
    numero_caminho: 9,
    elemento: 'Ar',
    significado_espiritual: 'Lei cósmica, equilíbrio karma, a balança que mede ações e consequências. A fundação do templo interior. O equilíbrio entre o que foi semeado e o que será colhido.',
  },

  // 9. O Eremita - Path 10 - Malkuth (Kingdom) - Terra
  'O Eremita': {
    arcano: 'O Eremita',
    numero_carta: 9,
    sephirah: 'Malkuth',
    numero_caminho: 10,
    elemento: 'Terra',
    significado_espiritual: 'Iluminação interior, solitude sagrada, a sabedoria da escuridão. O solitário que carrega a luz para o mundo. A sabedoria que nasce na stillness do reino material.',
  },

  // 10. A Roda da Fortuna - Path 11 - Chokmah (Wisdom) - Fogo
  'A Roda da Fortuna': {
    arcano: 'A Roda da Fortuna',
    numero_carta: 10,
    sephirah: 'Chokmah',
    numero_caminho: 11,
    elemento: 'Fogo',
    significado_espiritual: 'Ciclos do destino, mudança inevitável, a roda que gira entre ascensão e queda. O eterno retorno, o ponto de virada onde a sorte muda. A sabedoria dinâmica que transforma.',
  },

  // 11. A Força - Path 12 - Tiphereth (Beauty) - Ar
  'A Força': {
    arcano: 'A Força',
    numero_carta: 11,
    sephirah: 'Tiphereth',
    numero_caminho: 12,
    elemento: 'Ar',
    significado_espiritual: 'Coragem interior, domínio das paixões, a força do espírito sobre o instinto. O leão domesticado que representa o poder da gentleness. A harmonia entre razão e emoção.',
  },

  // 12. O Enforcado - Path 13 - Netzach (Victory) - Água
  'O Enforcado': {
    arcano: 'O Enforcado',
    numero_carta: 12,
    sephirah: 'Netzach',
    numero_caminho: 13,
    elemento: ' Água',
    significado_espiritual: 'Sacrifício voluntário, nova perspectiva, o suspension que revela a verdade oculta. A entrega que traz vitória, o perder para ganhar. A sabedoria que vem do sacrifício.',
  },

  // 13. A Morte - Path 14 - Hod (Glory) - Terra
  'A Morte': {
    arcano: 'A Morte',
    numero_carta: 13,
    sephirah: 'Hod',
    numero_caminho: 14,
    elemento: 'Terra',
    significado_espiritual: 'Transformação inevitável, fim de ciclo, a morte que precede o renascimento. A glória da dissolução que libera para o novo. A sabedoria da impermanência.',
  },

  // 14. A Temperança - Path 15 - Yesod (Foundation) - Água
  'A Temperança': {
    arcano: 'A Temperança',
    numero_carta: 14,
    sephirah: 'Yesod',
    numero_caminho: 15,
    elemento: 'Água',
    significado_espiritual: 'Equilíbrio e harmonia, integração dos opostos, a fundação que Une o céu e a terra. O anjo que misturam água e vinho, a alquimia interior. A moderação sagrada.',
  },

  // 15. O Diabo - Path 16 - Malkuth (Kingdom) - Terra
  'O Diabo': {
    arcano: 'O Diabo',
    numero_carta: 15,
    sephirah: 'Malkuth',
    numero_caminho: 16,
    elemento: 'Terra',
    significado_espiritual: 'Ilusão e apego, materialidade extrema, o reino da sombra que prende. A queda que esconde a luz, os一旁的 que nos mantém presos. A lição do reino material sobre os limites.',
  },

  // 16. A Torre - Path 17 - Binah (Understanding) - Fogo
  'A Torre': {
    arcano: 'A Torre',
    numero_carta: 16,
    sephirah: 'Binah',
    numero_caminho: 17,
    elemento: 'Fogo',
    significado_espiritual: 'Destruição criativa, revelação súbita, a torre que cai para libertar. O raio que dissipa a ilusão, a destruição que abre espaço para o novo. O entendimento que vem do caos.',
  },

  // 17. A Estrela - Path 18 - Chesed (Mercy) - Ar
  'A Estrela': {
    arcano: 'A Estrela',
    numero_carta: 17,
    sephirah: 'Chesed',
    numero_caminho: 18,
    elemento: 'Ar',
    significado_espiritual: 'Esperança e inspiração, renovação após a crise, a estrela que guia no deserto. A misericórdia que flui como água, a luz que aponta para o futuro. A expansão que renova.',
  },

  // 18. A Lua - Path 19 - Geburah (Severity) - Água
  'A Lua': {
    arcano: 'A Lua',
    numero_carta: 18,
    sephirah: 'Geburah',
    numero_caminho: 19,
    elemento: 'Água',
    significado_espiritual: 'Ilusão e inconsciente, medo e fantasia, a lua que ilumina a noite. O reino das sombras, a severidade que revela os medos ocultos. A transformação que vem da escuridão.',
  },

  // 19. O Sol - Path 20 - Tiphereth (Beauty) - Fogo
  'O Sol': {
    arcano: 'O Sol',
    numero_carta: 19,
    sephirah: 'Tiphereth',
    numero_caminho: 20,
    elemento: 'Fogo',
    significado_espiritual: 'Sucesso e vitalidade, consciência iluminada, o sol que dissolve as sombras. A beleza que irradia, a criança interior que celebra. A harmonia do espírito concretizada.',
  },

  // 20. O Julgamento - Path 21 - Netzach (Victory) - Fogo
  'O Julgamento': {
    arcano: 'O Julgamento',
    numero_carta: 20,
    sephirah: 'Netzach',
    numero_caminho: 21,
    elemento: 'Fogo',
    significado_espiritual: 'Renascimento e redenção, julgamento final, a trombeta que desperta os mortos. A vitória sobre a morte, o despertar que proclama uma nova era. A paixão que vence.',
  },

  // 21. O Mundo - Path 22 - Malkuth (Kingdom) - Terra
  'O Mundo': {
    arcano: 'O Mundo',
    numero_carta: 21,
    sephirah: 'Malkuth',
    numero_caminho: 22,
    elemento: 'Terra',
    significado_espiritual: 'Completude e realização, integração do todo, a snake que abraça o mundo. A conclusão de um ciclo, o reino manifesto que refleja o divino. A vitória do reino sobre a tensão.',
  },
} as const;

// Freeze the mapping object to prevent modifications
Object.freeze(TAROT_SEPHIROT_MAPPINGS);
// Freeze nested objects
Object.values(TAROT_SEPHIROT_MAPPINGS).forEach(mapping => Object.freeze(mapping));

/**
 * Get the Tarot-Sephirot correlation mapping by arcano name
 * @param arcano - The arcano name (e.g., 'O Louco', 'O Mago', 'A Alta Sacerdotisa')
 * @returns The correlation mapping or null if not found
 */
export function getTarotSephirot(arcano: string): TarotSephirot | null {
  return TAROT_SEPHIROT_MAPPINGS[arcano] ?? null;
}

/**
 * Alias for getTarotSephirot
 * @param arcano - The arcano name (e.g., 'O Louco', 'O Mago', 'A Alta Sacerdotisa')
 * @returns The correlation mapping or null if not found
 */
export function getTarotSephirah(arcano: string): TarotSephirot | null {
  return getTarotSephirot(arcano);
}

/**
 * Get the Sephiroth-Tarot correlation mapping by Sephirah name
 * @param sephirah - The name of the Sephirah (e.g., 'Kether', 'Chokmah', 'Binah')
 * @returns The correlation mapping or null if not found
 */
export function getSephirotTarot(sephirah: string): TarotSephirot | null {
  for (const mapping of Object.values(TAROT_SEPHIROT_MAPPINGS)) {
    if (mapping.sephirah === sephirah) {
      return mapping;
    }
  }
  return null;
}

/**
 * Get all available Tarot-Sephirot mappings
 * @returns Array of all correlation mappings sorted by arcano number
 */
export function getAllTarotSephiroth(): TarotSephirot[] {
  return Object.values(TAROT_SEPHIROT_MAPPINGS).sort(
    (a, b) => a.numero_carta - b.numero_carta
  );
}

/**
 * Get all arcano names
 * @returns Array of arcano names
 */
export function getAllArcanos(): string[] {
  return Object.keys(TAROT_SEPHIROT_MAPPINGS);
}

/**
 * Check if an arcano exists in the mapping
 * @param arcano - The arcano name to check
 * @returns True if arcano exists in mapping
 */
export function hasTarotSephirot(arcano: string): boolean {
  return arcano in TAROT_SEPHIROT_MAPPINGS;
}

/**
 * Get Sephirah by path number on Tree of Life
 * @param path - The path number (1-22)
 * @returns The Tarot-Sephirot mapping or null if not found
 */
export function getSephirotByPath(path: number): TarotSephirot | null {
  for (const mapping of Object.values(TAROT_SEPHIROT_MAPPINGS)) {
    if (mapping.numero_caminho === path) {
      return mapping;
    }
  }
  return null;
}

/**
 * Get arcano by card number in Major Arcana
 * @param numero - The Major Arcana card number (0-21)
 * @returns The arcano name or null if not found
 */
export function getArcanoByNumber(numero: number): string | null {
  for (const mapping of Object.values(TAROT_SEPHIROT_MAPPINGS)) {
    if (mapping.numero_carta === numero) {
      return mapping.arcano;
    }
  }
  return null;
}

/**
 * Get Sephirah by card number in Major Arcana
 * @param numero - The Major Arcana card number (0-21)
 * @returns The Sephirah name or null if not found
 */
export function getSephirahByNumber(numero: number): string | null {
  for (const mapping of Object.values(TAROT_SEPHIROT_MAPPINGS)) {
    if (mapping.numero_carta === numero) {
      return mapping.sephirah;
    }
  }
  return null;
}

/**
 * Get arcano by Sephirah name
 * @param sephirah - The Sephirah name
 * @returns The arcano name or null if not found
 */
export function getArcanoBySephirah(sephirah: string): string | null {
  for (const mapping of Object.values(TAROT_SEPHIROT_MAPPINGS)) {
    if (mapping.sephirah === sephirah) {
      return mapping.arcano;
    }
  }
  return null;
}

/**
 * Get all Sephiroth names (unique values)
 * @returns Array of unique Sephirah names
 */
export function getAllSephiroth(): string[] {
  const sephirothSet = new Set<string>();
  for (const mapping of Object.values(TAROT_SEPHIROT_MAPPINGS)) {
    sephirothSet.add(mapping.sephirah);
  }
  return Array.from(sephirothSet);
}