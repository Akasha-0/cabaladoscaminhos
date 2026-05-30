/**
 * Sound-Tarot Spiritual Correlation Module
 * Maps sacred sounds/mantras to Tarot Major Arcana cards
 * Each correlation includes element connection and healing properties
 * Based on Cabala dos Caminhos mystical traditions
 */

/**
 * Represents the correlation between a sacred sound/mantra and its Tarot Major Arcana
 */
export interface SoundTarot {
  /** Sacred sound or mantra identifier */
  som: string;
  /** Tarot arcano information */
  arcano: {
    /** Arcano number (0-21) */
    numero: number;
    /** Arcano name in Portuguese */
    nome: string;
  };
  /** Primary elemental association */
  elemento: string;
  /** Healing and therapeutic properties */
  propriedades_cura: string[];
  /** Spiritual practice guidance */
  practica: string;
}

/** Map of all 22 Major Arcana cards with their sacred sound correlations */
const SOUND_TAROT_MAPPINGS: Record<string, SoundTarot> = {
  // 0 - O Louco (The Fool)
  "OM": {
    som: "OM",
    arcano: { numero: 0, nome: "O Louco" },
    elemento: "Ar",
    propriedades_cura: [
      "Libertação de medos e bloqueios emocionais",
      "Abertura para novos inícios e mudanças",
      "Harmonização do plexo laríngeo",
      "Dissolução de padrões limitantes"
    ],
    practica: "Medite com OM ao amanhecer para iniciar jornadas SPIRITUAIS."
  },

  // 1 - A Sacerdotisa (The High Priestess)
  "EIA": {
    som: "EIA",
    arcano: { numero: 1, nome: "A Sacerdotisa" },
    elemento: "Água",
    propriedades_cura: [
      "Intuição e percepção psíquica",
      "Harmonização do segundo chakra",
      "Conexão com a sabedoria interior",
      "Equilíbrio emocional"
    ],
    practica: "Cante EIA em ambiente lunar para desenvolver intuição."
  },

  // 2 - A Imperadora (The Empress)
  "OMEGA": {
    som: "OMEGA",
    arcano: { numero: 2, nome: "A Imperadora" },
    elemento: "Terra",
    propriedades_cura: [
      "Fertilidade e abundância",
      "Conexão com a natureza e maternidade",
      "Estabilização do primeiro chakra",
      "Nutrição espiritual e emocional"
    ],
    practica: "Respire OMEGA enquanto visualiza energia fluindo para seu chakra básico."
  },

  // 3 - O Imperador (The Emperor)
  "AH": {
    som: "AH",
    arcano: { numero: 3, nome: "O Imperador" },
    elemento: "Fogo",
    propriedades_cura: [
      "Força de vontade e disciplina",
      "Clareza mental e foco",
      "Proteção e estrutura",
      "Ativação do plexo solar"
    ],
    practica: "Proclame AH com voz firme para fortalecer sua vontade."
  },

  // 4 - O Hierofante (The Hierophant)
  "ELE": {
    som: "ELE",
    arcano: { numero: 4, nome: "O Hierofante" },
    elemento: "Terra",
    propriedades_cura: [
      "Educação espiritual e tradições",
      "Expansão da consciência",
      "Orientação e sabedoria coletiva",
      "Conexão com ensinamentos ancestrais"
    ],
    practica: "Repita ELE em contextos de aprendizado espiritual e cerimônias."
  },

  // 5 - Os Enamorados (The Lovers)
  "UMA": {
    som: "UMA",
    arcano: { numero: 5, nome: "Os Enamorados" },
    elemento: "Ar",
    propriedades_cura: [
      "Harmonização de relacionamentos",
      "Discernimento e escolhas",
      "União do sagrado masculino e feminino",
      "Alinhamento do quarto chakra"
    ],
    practica: "Cante UMA em duplas ou sozinho visualizando unions harmoniosas."
  },

  // 6 - O Carro (The Chariot)
  "RA": {
    som: "RA",
    arcano: { numero: 6, nome: "O Carro" },
    elemento: "Fogo",
    propriedades_cura: [
      "Determinação e conquista",
      "Vitória sobre obstáculos",
      "Poder pessoal e assertividade",
      "Energia Yang e movimento"
    ],
    practica: "Visualize RA ativando seu fogo interior para avançar em metas."
  },

  // 7 - A Justiça (Justice)
  "HRIM": {
    som: "HRIM",
    arcano: { numero: 7, nome: "A Justiça" },
    elemento: "Ar",
    propriedades_cura: [
      "Equilíbrio e retidão",
      "Verdade e honestidade",
      "Lei cósmica e KARMA",
      "Clareza mental e julgamento justo"
    ],
    practica: "Medite com HRIM para equilibrar ações passadas e presentes."
  },

  // 8 - O Enforcado (The Hanged Man)
  "SOHAM": {
    som: "SOHAM",
    arcano: { numero: 8, nome: "O Enforcado" },
    elemento: "Água",
    propriedades_cura: [
      "Sacrifício e renúncia",
      "Nova perspectiva e surrender",
      "Libertação de apegos",
      "Transformação interior"
    ],
    practica: "Sussurre SOHAM durante momentos de entrega e aceitação."
  },

  // 9 - A Morte (Death)
  "HUM": {
    som: "HUM",
    arcano: { numero: 9, nome: "A Morte" },
    elemento: "Terra",
    propriedades_cura: [
      "Transformação e renascimento",
      "Dissolução de velhos padrões",
      "Libertação de traumas",
      "Transição e mudança profunda"
    ],
    practica: "Use HUM em rituais de passagem e deixando ir o que não serve."
  },

  // 10 - A Temperança (Temperance)
  "SHAM": {
    som: "SHAM",
    arcano: { numero: 10, nome: "A Temperança" },
    elemento: "Água",
    propriedades_cura: [
      "Equilíbrio e moderação",
      "Transformação alquímica",
      "Integração de opostos",
      "Patience e harmonia"
    ],
    practica: "Cante SHAM para harmonizar extremos e transformar energias."
  },

  // 11 - O Diabo (The Devil)
  "KRIM": {
    som: "KRIM",
    arcano: { numero: 11, nome: "O Diabo" },
    elemento: "Terra",
    propriedades_cura: [
      "Libertação de prisões internas",
      "Enfrentar sombras e medos",
      "Transformação da energia escura",
      "Recuperação de poder pessoal"
    ],
    practica: "Use KRIM em trabalho de sombra para conscientizar padrões oculta."
  },

  // 12 - A Torre (The Tower)
  "KRIMGRAM": {
    som: "KRIMGRAM",
    arcano: { numero: 12, nome: "A Torre" },
    elemento: "Fogo",
    propriedades_cura: [
      "Destruição criativa",
      "Libertação súbita de ilusões",
      "Iluminação através da crise",
      "Renovação após upheaval"
    ],
    practica: "Respire KRIMGRAM durante transições rápidas e mudanças necessárias."
  },

  // 13 - A Estrela (The Star)
  "YAH": {
    som: "YAH",
    arcano: { numero: 13, nome: "A Estrela" },
    elemento: "Água",
    propriedades_cura: [
      "Esperança e inspirACÃO",
      "Cura profunda e recuperação",
      "Serenidade e paz interior",
      "Conexão com guias estelares"
    ],
    practica: "Cante YAH sob estrelas para restaurar esperança e cura."
  },

  // 14 - A Lua (The Moon)
  "CHAND": {
    som: "CHAND",
    arcano: { numero: 14, nome: "A Lua" },
    elemento: "Água",
    propriedades_cura: [
      "Intuição e sonhos",
      "Dissolução de medos ocultos",
      "Sombra e inconsciente",
      "Ciclos lunares e mudanças"
    ],
    practica: "Repita CHAND em noites de lua para activar sonhos proféticos."
  },

  // 15 - O Sol (The Sun)
  "HARE": {
    som: "HARE",
    arcano: { numero: 15, nome: "O Sol" },
    elemento: "Fogo",
    propriedades_cura: [
      "Vitalidade e alegria",
      "Sucesso e felicidade",
      "Poder criativo e autoexpressão",
      "Curacao energética e brilho"
    ],
    practica: "Cante HARE ao amanhecer para absorver energia solar."
  },

  // 16 - O Julgamento (Judgement)
  "KSHAM": {
    som: "KSHAM",
    arcano: { numero: 16, nome: "O Julgamento" },
    elemento: "Fogo",
    propriedades_cura: [
      "Ressurreição e chamado divino",
      "Novo início e propósito",
      "Transmutação do passado",
      "Despertar espiritual"
    ],
    practica: "Medite com KSHAM para responder ao seu chamado de alma."
  },

  // 17 - O Mundo (The World)
  "OMRAM": {
    som: "OMRAM",
    arcano: { numero: 17, nome: "O Mundo" },
    elemento: "Terra",
    propriedades_cura: [
      "Completude e realização",
      "Integração de todas lições",
      "Harmonia universal",
      "Realização de objetivos"
    ],
    practica: "Respire OMRAM ao completar ciclos para celebrar conquistas."
  },

  // 18 - O Louco (alternate - journey)
  "AHAM": {
    som: "AHAM",
    arcano: { numero: 18, nome: "Caminho" },
    elemento: "Ar",
    propriedades_cura: [
      "Autoconhecimento e jornada interior",
      "Libertação do ego",
      "Descoberta de propósito",
      "Caminho espiritual"
    ],
    practica: "Repita AHAM para explorar sua jornada de crescimento."
  },

  // 19 - Ascension
  "AUMRAM": {
    som: "AUMRAM",
    arcano: { numero: 19, nome: "Ascensão" },
    elemento: "Éter",
    propriedades_cura: [
      "Ascensão espiritual",
      "Expansão da consciência",
      "Conexão com o divino",
      "Iluminação e mestria"
    ],
    practica: "Cante AUMRAM em meditações profundas para elevar consciência."
  },

  // 20 - Transcendência
  "AUM": {
    som: "AUM",
    arcano: { numero: 20, nome: "Transcendência" },
    elemento: "Éter",
    propriedades_cura: [
      "União com o cosmos",
      "Silêncio interior",
      "Realização última",
      "Paz suprema"
    ],
    practica: "Om AUM representa o som primordial do universo."
  },

  // 21 - Completion
  "OMSHANTI": {
    som: "OMSHANTI",
    arcano: { numero: 21, nome: "Completude" },
    elemento: "Éter",
    propriedades_cura: [
      "Paz e serenidade",
      "Resolução de conflitos",
      "Harmonia universal",
      "Felicidade eterna"
    ],
    practica: "OMSHANTI ao final de meditações para Paz absoluta."
  }
} as const;

// Freeze the mapping object to prevent modifications
Object.freeze(SOUND_TAROT_MAPPINGS);
Object.values(SOUND_TAROT_MAPPINGS).forEach(mapping => Object.freeze(mapping));

/**
 * Retrieves the sound-Tarot correlation mapping for a given sound
 * @param som - Sound identifier (e.g., "OM", "EIA", "AH") or any case variation
 * @returns SoundTarot mapping or undefined if not found
 */
export function getSoundTarot(som: string): SoundTarot | undefined {
  const normalizedSom = som.toUpperCase().trim();
  return SOUND_TAROT_MAPPINGS[normalizedSom];
}

/**
 * Retrieves the sound associated with a given arcano number
 * @param arcanoNumero - Arcano number (0-21)
 * @returns Sound name or undefined if arcano not found
 */
export function getTarotSound(arcanoNumero: number): string | undefined {
  const mapping = Object.values(SOUND_TAROT_MAPPINGS).find(
    (m) => m.arcano.numero === arcanoNumero
  );
  return mapping?.som;
}

/**
 * Get the arcano number for a given sound
 * @param som - Sound identifier
 * @returns Arcano number or undefined if sound not found
 */
export function getArcanoBySound(som: string): number | undefined {
  return getSoundTarot(som)?.arcano.numero;
}

/**
 * Get the arcano name for a given sound
 * @param som - Sound identifier
 * @returns Arcano name or undefined if sound not found
 */
export function getArcanoNomeBySound(som: string): string | undefined {
  return getSoundTarot(som)?.arcano.nome;
}

/**
 * Get the element for a given sound
 * @param som - Sound identifier
 * @returns Element name or undefined if sound not found
 */
export function getElementBySound(som: string): string | undefined {
  return getSoundTarot(som)?.elemento;
}

/**
 * Get the healing properties for a given sound
 * @param som - Sound identifier
 * @returns Array of healing properties or undefined if sound not found
 */
export function getHealingProperties(som: string): string[] | undefined {
  return getSoundTarot(som)?.propriedades_cura;
}

/**
 * Get the spiritual practice for a given sound
 * @param som - Sound identifier
 * @returns Practice guidance or undefined if sound not found
 */
export function getPractice(som: string): string | undefined {
  return getSoundTarot(som)?.practica;
}

/**
 * Get all sound-Tarot correlation mappings
 * @returns Array of all SoundTarot objects sorted by arcano number
 */
export function getAllSoundTarots(): SoundTarot[] {
  return Object.values(SOUND_TAROT_MAPPINGS).sort(
    (a, b) => a.arcano.numero - b.arcano.numero
  );
}

/**
 * Get all available sounds
 * @returns Array of unique sound names
 */
export function getAllSounds(): string[] {
  return Object.keys(SOUND_TAROT_MAPPINGS);
}

/**
 * Get all arcano numbers
 * @returns Array of numbers 0-21
 */
export function getAllArcanoNumbers(): number[] {
  return getAllSoundTarots().map((m) => m.arcano.numero);
}

/**
 * Get all arcano names
 * @returns Array of arcano names
 */
export function getAllArcanoNomes(): string[] {
  return getAllSoundTarots().map((m) => m.arcano.nome);
}

/**
 * Check if a sound exists in the mappings
 * @param som - Sound identifier to check
 * @returns True if sound exists
 */
export function hasSoundTarot(som: string): boolean {
  return som.toUpperCase().trim() in SOUND_TAROT_MAPPINGS;
}

/**
 * Get all sounds mapped to a specific element
 * @param elemento - Element name (e.g., 'Fogo', 'Água', 'Ar', 'Terra', 'Éter')
 * @returns Array of SoundTarot objects matching the element
 */
export function getSoundsByElement(elemento: string): SoundTarot[] {
  return getAllSoundTarots().filter((m) => m.elemento === elemento);
}

/**
 * Get all sounds mapped to a specific arcano number
 * @param arcanoNumero - Arcano number (0-21)
 * @returns Array of SoundTarot objects for that arcano
 */
export function getSoundsByArcano(arcanoNumero: number): SoundTarot[] {
  return getAllSoundTarots().filter((m) => m.arcano.numero === arcanoNumero);
}

/**
 * Default export with all functions
 */
export default {
  getSoundTarot,
  getTarotSound,
  getArcanoBySound,
  getArcanoNomeBySound,
  getElementBySound,
  getHealingProperties,
  getPractice,
  getAllSoundTarots,
  getAllSounds,
  getAllArcanoNumbers,
  getAllArcanoNomes,
  hasSoundTarot,
  getSoundsByElement,
  getSoundsByArcano,
};