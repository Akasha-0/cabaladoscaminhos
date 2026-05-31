/**
 * Odú-Ifá Solfeggio Frequency Correlation Module (Odú Turu)
 * Direct mappings of the 16 Odú Ifá (Merindilogun) using Portuguese nomenclature
 * to Solfeggio frequencies with spiritual meaning for sound healing
 */

// ─── Type Definitions ────────────────────────────────────────────────────────

export type ElementType = 'fogo' | 'água' | 'ar' | 'terra' | 'éter';

export interface HealingProperties {
  /** Physical healing benefits */
  fisico: string;
  /** Emotional healing benefits */
  emocional: string;
  /** Spiritual healing benefits */
  espiritual: string;
}

export interface OdTuFrequency {
  /** Odu number (1-16) */
  odu_numero: number;
  /** Odu name in Portuguese */
  odu_nome: string;
  /** Odu name in Yoruba */
  odu_nome_yoruba: string;
  /** Solfeggio frequency in Hz */
  frequencia: number;
  /** Associated element */
  elemento: ElementType;
  /** Spiritual meaning for divination */
  significado_espiritual: string;
  /** Healing properties for sound therapy */
  propriedades_healing: HealingProperties;
}

// ─── Solfeggio Frequencies ──────────────────────────────────────────────────

export const SOLFEGGIO_FREQUENCIES: readonly number[] = Object.freeze([
  174, 285, 396, 417, 528, 639, 741, 852, 963,
]);

// ─── Odú Ifá-to-Solfeggio Frequency Mapping (Merindilogun 1-16) ─────────────

export const ODTU_FREQUENCY_MAPPINGS: Record<number, OdTuFrequency> = {
  // ─── 1: Okaran (Okànràn) ───────────────────────────────────────────────────
  1: {
    odu_numero: 1,
    odu_nome: 'Okaran',
    odu_nome_yoruba: 'Okànràn',
    frequencia: 174,
    elemento: 'éter',
    significado_espiritual:
      'Coragem, recomeço, liberdade. Odu da fé que move montanhas e do pioneiro que abre caminhos.',
    propriedades_healing: {
      fisico: 'Alívio de dores físicas, regeneração celular, fortalecimento do corpo.',
      emocional:
        'Libertação de medos e bloqueios emocionais, coragem para novos começos.',
      espiritual:
        'Conexão com a energia criadora primordial,开门 para novos ciclos de vida.',
    },
  },

  // ─── 2: Ejiokô ─────────────────────────────────────────────────────────────
  2: {
    odu_numero: 2,
    odu_nome: 'Ejiokô',
    odu_nome_yoruba: 'Ejìokò',
    frequencia: 285,
    elemento: 'água',
    significado_espiritual:
      'Dualidade, escolha, equilíbrio. Revela que toda decisão importante exige intuição e harmonização de opostos.',
    propriedades_healing: {
      fisico: 'Harmonização hormonal, equilíbrio metabólico, regulação de fluidos corporais.',
      emocional: 'Equilíbrio emocional, decisões mais claras, harmonia entre opostos.',
      espiritual:
        'Integração de polaridades, sabedoria para escolher caminhos seimbang.',
    },
  },

  // ─── 3: Etaogundá ──────────────────────────────────────────────────────────
  3: {
    odu_numero: 3,
    odu_nome: 'Etaogundá',
    odu_nome_yoruba: 'Ẹtaọgúndá',
    frequencia: 396,
    elemento: 'fogo',
    significado_espiritual:
      'Força transformadora, criação, ferramenta. Poder de transformar matéria e criar vida através da vontade.',
    propriedades_healing: {
      fisico: 'Transformação celular, queima de bloqueios físicos, revitalização corporal.',
      emocional: 'Libertação de culpas passadas, transformação de padrões negativos.',
      espiritual:
        'Purificação áurea, transformação quântica,manifestação de realidade.',
    },
  },

  // ─── 4: Irosun ─────────────────────────────────────────────────────────────
  4: {
    odu_numero: 4,
    odu_nome: 'Irosun',
    odu_nome_yoruba: 'Ìrosùn',
    frequencia: 417,
    elemento: 'água',
    significado_espiritual:
      'Intuição lunar, mensagens ocultas, segredos. Revela verdades escondidas e a visão além das ilusões.',
    propriedades_healing: {
      fisico: 'Estímulo à glândula pineal, expansão da consciência, percepção sutil.',
      emocional: 'Abertura para insights, desbloqueio de memórias ocultas.',
      espiritual:
        'Desenvolvimento da clarividência, acesso a conhecimentos ocultos.',
    },
  },

  // ─── 5: Oxé ────────────────────────────────────────────────────────────────
  5: {
    odu_numero: 5,
    odu_nome: 'Oxé',
    odu_nome_yoruba: 'Ọ̀sà',
    frequencia: 528,
    elemento: 'fogo',
    significado_espiritual:
      'Lei divina, justiça cósmica, julgamento. Traz responsabilidade espiritual e decisões que afetam destinos.',
    propriedades_healing: {
      fisico: 'Reparação de DNA, harmonização celular, alinhamento da coluna.',
      emocional: 'Reconciliação interior, perdão, restauração de relacionamentos.',
      espiritual:
        'Desbloqueio do coração, acesso à frequência do amor incondicional.',
    },
  },

  // ─── 6: Obará ───────────────────────────────────────────────────────────────
  6: {
    odu_numero: 6,
    odu_nome: 'Obará',
    odu_nome_yoruba: 'Ọbàlúayé',
    frequencia: 639,
    elemento: 'terra',
    significado_espiritual:
      'Terra, mortalidade, transformação física. Conexão entre espiritual e material, doença e cura.',
    propriedades_healing: {
      fisico: 'Conexão terra-corpo, cura de doenças físicas, regeneração de tecidos.',
      emocional: 'Aceitação da mortalidade, paz com transformações materiais.',
      espiritual:
        'Ancoramento espiritual, equilibrio entre céu e terra, cura kármica.',
    },
  },

  // ─── 7: Odi ────────────────────────────────────────────────────────────────
  7: {
    odu_numero: 7,
    odu_nome: 'Odi',
    odu_nome_yoruba: 'Òdí',
    frequencia: 741,
    elemento: 'água',
    significado_espiritual:
      'Destino, forças ocultas, inconsciente. Revela padrões ocultos que direcionam a vida.',
    propriedades_healing: {
      fisico: 'Despertar de centros de poder adormecidos, ativação de chakras.',
      emocional: 'Descoberta de padrões inconscientes, libertação de automatismos.',
      espiritual:
        'Despertar da consciência, acesso ao inconsciente coletivo.',
    },
  },

  // ─── 8: Ejionlá ─────────────────────────────────────────────────────────────
  8: {
    odu_numero: 8,
    odu_nome: 'Ejionlá',
    odu_nome_yoruba: 'Ejìọnlá',
    frequencia: 852,
    elemento: 'água',
    significado_espiritual:
      'Abundância infinita, prosperidade cósmica. Transformação da escassez em riqueza espiritual e material.',
    propriedades_healing: {
      fisico: 'Harmonização do campo áurico, elevação vibacional do corpo.',
      emocional: 'Abundância emocional, gratidão permanente, prosperidade mental.',
      espiritual:
        'Activação da terceira lei,manifestação da abundância cósmica.',
    },
  },

  // ─── 9: Oshe ────────────────────────────────────────────────────────────────
  9: {
    odu_numero: 9,
    odu_nome: 'Oshe',
    odu_nome_yoruba: 'Ọ̀shẹ́',
    frequencia: 963,
    elemento: 'água',
    significado_espiritual:
      'Alegría, celebração divina, comunidade. Rituais de agradecimento e conexão com a diversidade cultural.',
    propriedades_healing: {
      fisico: 'Harmonização do sistema nervoso, elevação da energia vital.',
      emocional: 'Celebração da vida, alegria permanente, conexão comunitária.',
      espiritual:
        'Expansão da consciência, acesso à luz divina, comunidade espiritual.',
    },
  },

  // ─── 10: Ofun ───────────────────────────────────────────────────────────────
  10: {
    odu_numero: 10,
    odu_nome: 'Ofun',
    odu_nome_yoruba: 'Ọ̀fún',
    frequencia: 528,
    elemento: 'éter',
    significado_espiritual:
      'Silêncio, paciência, contemplação. Sabedoria que vem do silêncio e verdade que se revela no tempo certo.',
    propriedades_healing: {
      fisico: 'Reparação celular profunda, regeneração dos sistemas corporais.',
      emocional: 'Paz interior, paciência, contemplação silenciosa.',
      espiritual:
        'Iluminação interior, acesso à verdade silenciosa, sabedoria ancestral.',
    },
  },

  // ─── 11: Eyonla ─────────────────────────────────────────────────────────────
  11: {
    odu_numero: 11,
    odu_nome: 'Eyonla',
    odu_nome_yoruba: 'Èyọ́nlá',
    frequencia: 639,
    elemento: 'terra',
    significado_espiritual:
      'Sabedoria anciã, tecnologias espirituais. Conhecimento que transcende gerações e exige humildade.',
    propriedades_healing: {
      fisico: 'Fortalecimento dos ossos e articulações, ancoramento físico.',
      emocional: 'Humildade, aceitação de limitações, sabedoria da idade.',
      espiritual:
        'Conexão com ancestrais, acesso à sabedoria primordial.',
    },
  },

  // ─── 12: Merinla ─────────────────────────────────────────────────────────────
  12: {
    odu_numero: 12,
    odu_nome: 'Merinla',
    odu_nome_yoruba: 'Mẹ̀rìnlá',
    frequencia: 741,
    elemento: 'terra',
    significado_espiritual:
      'Mistério, segredos sagrados, incognoscível. Reverência ao sagrado e aceitação do que não pode ser explicado.',
    propriedades_healing: {
      fisico: 'Desbloqueio de caminhos energéticos obscurecidos.',
      emocional: 'Aceitação do mistério, paz com o desconhecido.',
      espiritual:
        'Santuário interior, acesso ao sagrado incognoscível.',
    },
  },

  // ─── 13: Mero ────────────────────────────────────────────────────────────────
  13: {
    odu_numero: 13,
    odu_nome: 'Mero',
    odu_nome_yoruba: 'Mẹ̀rọ̀',
    frequencia: 852,
    elemento: 'água',
    significado_espiritual:
      'Riqueza escondida, tesouros ocultos, descobertas inesperadas. Prosperidade que surge do inesperado.',
    propriedades_healing: {
      fisico: 'Descobertura de tesouros de saúde escondidos no corpo.',
      emocional: 'Descobertura de tesouros emocionais, memórias preciosas.',
      espiritual:
        'Descobertura de dons ocultos, manifestações de tesouros internos.',
    },
  },

  // ─── 14: Jinza ────────────────────────────────────────────────────────────────
  14: {
    odu_numero: 14,
    odu_nome: 'Jinza',
    odu_nome_yoruba: 'Jìnza',
    frequencia: 396,
    elemento: 'fogo',
    significado_espiritual:
      'Guerra espiritual, batalha luz versus escuridão. Proteção contra forças negativas e vitória da luz.',
    propriedades_healing: {
      fisico: 'Purificação de toxinas, batalha contra doenças físicas.',
      emocional: 'Libertação de traumas, batalha contra medos e ansiedades.',
      espiritual:
        'Proteção áurea, vitória sobre negatividade, empoderamento espiritual.',
    },
  },

  // ─── 15: Jotagbe ───────────────────────────────────────────────────────────
  15: {
    odu_numero: 15,
    odu_nome: 'Jotagbe',
    odu_nome_yoruba: 'Jọ́tágbè',
    frequencia: 963,
    elemento: 'éter',
    significado_espiritual:
      'Comunicação ancestral, linhagem espiritual. Conexão com antepassados e herança espiritual.',
    propriedades_healing: {
      fisico: 'Activação da comunicação energética, alinhamento da linhagem física.',
      emocional: 'Comunicação com ancestrais, resolução de questões familiares.',
      espiritual:
        'Conexão com linhagem espiritual, acesso à herança ancestral.',
    },
  },

  // ─── 16: Otura ──────────────────────────────────────────────────────────────
  16: {
    odu_numero: 16,
    odu_nome: 'Otura',
    odu_nome_yoruba: 'Òtúrá',
    frequencia: 174,
    elemento: 'terra',
    significado_espiritual:
      'Caminho, jornada, destino revelado. O destino se forma sob os pés, construindo-se a cada passo.',
    propriedades_healing: {
      fisico: 'Fortificação dos pés e pernas, disposição para caminhadas espirituais.',
      emocional: 'Clareza de caminho, definição de destino pessoal.',
      espiritual:
        'Orientação divine, revelação de destino, proteção na jornada.',
    },
  },
};

// Freeze to prevent accidental modifications
Object.freeze(ODTU_FREQUENCY_MAPPINGS);

// ─── Lookup Functions ────────────────────────────────────────────────────────

/**
 * Get Odu-Solfeggio frequency correlation mapping
 * @param odu - Odu number (1-16) or name (case-insensitive)
 * @returns OdTuFrequency mapping or null if not found
 */
export function getOduFrequency(odu: number | string): OdTuFrequency | null {
  if (typeof odu === 'number') {
    return ODTU_FREQUENCY_MAPPINGS[odu] ?? null;
  }
  // Search by name (case-insensitive)
  const upperOdu = odu.toUpperCase();
  const found = Object.values(ODTU_FREQUENCY_MAPPINGS).find(
    (m) =>
      m.odu_nome.toUpperCase() === upperOdu ||
      m.odu_nome_yoruba.toUpperCase() === upperOdu,
  );
  return found ?? null;
}

/**
 * Get all Odus for a given Solfeggio frequency
 * @param frequencia - Solfeggio frequency in Hz
 * @returns Array of OdTuFrequency mappings for that frequency
 */
export function getFrequencyOdu(frequencia: number): OdTuFrequency[] {
  return Object.values(ODTU_FREQUENCY_MAPPINGS)
    .filter((m) => m.frequencia === frequencia)
    .sort((a, b) => a.odu_numero - b.odu_numero);
}

/**
 * Get all Odu-Solfeggio frequency mappings
 * @returns Array of all mappings sorted by Odu number
 */
export function getAllOduFrequencies(): OdTuFrequency[] {
  return Object.values(ODTU_FREQUENCY_MAPPINGS).sort(
    (a, b) => a.odu_numero - b.odu_numero,
  );
}

/**
 * Get all Odu numbers (1-16)
 * @returns Array of Odu numbers sorted in ascending order
 */
export function getAllOduNumbers(): number[] {
  return Object.keys(ODTU_FREQUENCY_MAPPINGS)
    .map(Number)
    .sort((a, b) => a - b);
}

/**
 * Get all Odu names in Portuguese
 * @returns Array of Odu names sorted by Odu number
 */
export function getAllOduNames(): string[] {
  return Object.values(ODTU_FREQUENCY_MAPPINGS)
    .sort((a, b) => a.odu_numero - b.odu_numero)
    .map((m) => m.odu_nome);
}

/**
 * Check if an Odu number exists
 * @param oduNumero - Odu number to check
 * @returns True if Odu exists in mapping
 */
export function hasOduFrequency(oduNumero: number): boolean {
  return oduNumero in ODTU_FREQUENCY_MAPPINGS;
}

/**
 * Get Odu mapping by number (1-16)
 * @param numero - Odu number
 * @returns OdTuFrequency mapping or null if not found
 */
export function getOduByNumber(numero: number): OdTuFrequency | null {
  return ODTU_FREQUENCY_MAPPINGS[numero] ?? null;
}

/**
 * Get all Odus for a given element
 * @param elemento - Element type
 * @returns Array of OdTuFrequency mappings for that element
 */
export function getOdusForElement(elemento: ElementType): OdTuFrequency[] {
  return Object.values(ODTU_FREQUENCY_MAPPINGS)
    .filter((m) => m.elemento === elemento)
    .sort((a, b) => a.odu_numero - b.odu_numero);
}

/**
 * Get unique Solfeggio frequencies for a given element
 * @param elemento - Element type
 * @returns Array of unique frequencies sorted in ascending order
 */
export function getFrequenciesForElement(elemento: ElementType): number[] {
  const freqs = Object.values(ODTU_FREQUENCY_MAPPINGS)
    .filter((m) => m.elemento === elemento)
    .map((m) => m.frequencia);
  return [...new Set(freqs)].sort((a, b) => a - b);
}

/**
 * Get element for a given Odu number
 * @param oduNumero - Odu number (1-16)
 * @returns Element type or null if not found
 */
export function getElementByOdu(oduNumero: number): ElementType | null {
  return ODTU_FREQUENCY_MAPPINGS[oduNumero]?.elemento ?? null;
}

/**
 * Get healing properties for a given Odu number
 * @param oduNumero - Odu number (1-16)
 * @returns HealingProperties or null if not found
 */
export function getHealingProperties(oduNumero: number): HealingProperties | null {
  return ODTU_FREQUENCY_MAPPINGS[oduNumero]?.propriedades_healing ?? null;
}

/**
 * Get all used Solfeggio frequencies in ascending order
 * @returns Array of unique frequencies
 */
export function getUsedFrequencies(): number[] {
  const freqs = Object.values(ODTU_FREQUENCY_MAPPINGS).map((m) => m.frequencia);
  return [...new Set(freqs)].sort((a, b) => a - b);
}

// ─── Default Export ───────────────────────────────────────────────────────────

export default {
  getOduFrequency,
  getFrequencyOdu,
  getAllOduFrequencies,
  getAllOduNumbers,
  getAllOduNames,
  hasOduFrequency,
  getOduByNumber,
  getOdusForElement,
  getFrequenciesForElement,
  getElementByOdu,
  getHealingProperties,
  getUsedFrequencies,
  ODTU_FREQUENCY_MAPPINGS,
  SOLFEGGIO_FREQUENCIES,
};