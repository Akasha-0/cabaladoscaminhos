/**
 * Sound-Sephirot Spiritual Correlation Module
 * Maps sacred sounds, mantras, and seed syllables to the 10 Sephiroth
 * of the Kabbalistic Tree of Life, with element connections and healing properties.
 *
 * Based on traditional Kabbalistic sound practices and Western esoteric
 * sound healing traditions.
 */

/**
 * Represents the correlation between a sacred sound/mantra and its Sephirah
 */
export interface SoundSephirot {
  /** Sound or mantra identifier (e.g., "AUM", "EL", "YHVH") */
  som: string;
  /** Pronunciation guide for the mantra/sound */
  pronunciacao: string;
  /** Associated Sephirah (e.g., "Kether", "Chokmah", "Malkuth") */
  sephirah: string;
  /** Path number on the Tree of Life (1-10) */
  numero_caminho: number;
  /** Primary element associated */
  elemento: string;
  /** Element in English */
  elemento_en: string;
  /** Healing properties and spiritual benefits */
  propriedades_cura: string[];
  /** Associated classical planet */
  planeta: string;
  /** Direction associated with the element */
  direcao: string;
  /** Divine name from Kabbalah */
  nome_divino: string;
  /** Hebrew letter associated with this sephirah */
  letra_hebraica: string;
  /** Spiritual dynamics and purpose */
  dinamica: string;
}

/** Map of sacred sounds/mantras mapped to Sephiroth with healing properties */
const SOUND_SEPHIROT_MAPPINGS: Record<string, SoundSephirot> = {
  // 1. Kether (Corona) - AUM/OM - Éter - Pureza Divina Primordial
  AUM: {
    som: 'AUM',
    pronunciacao: 'a-u-umm (tríade sonora sagrada, vibração no topo da cabeça)',
    sephirah: 'Kether',
    numero_caminho: 1,
    elemento: 'Éter',
    elemento_en: 'Ether',
    propriedades_cura: [
      'Conexão com a fonte divina',
      'Dissolução de ilusões de separação',
      'Despertar da consciência transcedental',
      'Purificação do campo áurico',
      'Alinhamento com o propósito de alma',
    ],
    planeta: 'Vênus',
    direcao: 'Zênite / Centro',
    nome_divino: 'EHEIEH',
    letra_hebraica: 'א',
    dinamica: 'Integração com a coroa divina, acesso direto à fonte da criação.',
  },
  OM: {
    som: 'OM',
    pronunciacao: 'oh-umm (som primordial, vibração no centro da testa)',
    sephirah: 'Kether',
    numero_caminho: 1,
    elemento: 'Éter',
    elemento_en: 'Ether',
    propriedades_cura: [
      'Expansão da consciência além do ego',
      'Meditação profunda e silêncio interior',
      'Despertar da intuição pura',
      'Dissolução de apegos mentais',
      'Conexão com a unidade universal',
    ],
    planeta: 'Vênus',
    direcao: 'Zênite / Centro',
    nome_divino: 'EHEIEH',
    letra_hebraica: 'א',
    dinamica: 'Som primordial que ressoa com a coroa, ponto de acesso ao divino.',
  },

  // 2. Chokmah (Sabedoria) - YAH - Éter - Sabedoria Dinâmica Primordial
  YAH: {
    som: 'YAH',
    pronunciacao: 'yah (sopro divino, vibração rápida no topo da cabeça)',
    sephirah: 'Chokmah',
    numero_caminho: 2,
    elemento: 'Éter',
    elemento_en: 'Ether',
    propriedades_cura: [
      'Ativação da sabedoria inata',
      'Quebra de padrões de pensamento rígidos',
      'Despertar do dinamismo criativo',
      'Inspiração para novos caminhos',
      'Coragem para assumir riscos sagrados',
    ],
    planeta: 'Vênus',
    direcao: 'Norte',
    nome_divino: 'YAH',
    letra_hebraica: 'ב',
    dinamica: 'Impulso divino que rompe a estagnação, catalisador de transformação.',
  },
  AH: {
    som: 'AH',
    pronunciacao: 'ahh (som de criação, como a primeira respiração)',
    sephirah: 'Chokmah',
    numero_caminho: 2,
    elemento: 'Éter',
    elemento_en: 'Ether',
    propriedades_cura: [
      'Expressão da verdade interior',
      'Libertação da voz autêntica',
      'Energização do campo vital',
      'Ativação do princípio masculino divino',
      'Despertar da inteligência criativa',
    ],
    planeta: 'Vênus',
    direcao: 'Norte',
    nome_divino: 'YAH',
    letra_hebraica: 'ב',
    dinamica: 'O som do nascimento, da respiração vital que inicia toda existência.',
  },

  // 3. Binah (Entendimento) - EHEIEH - Água - Compreensão Profunda
  EHEIEH: {
    som: 'EHEIEH',
    pronunciacao: 'eh-eh-yeh-h (som quíntuplo, vibração no centro da testa)',
    sephirah: 'Binah',
    numero_caminho: 3,
    elemento: 'Água',
    elemento_en: 'Water',
    propriedades_cura: [
      'Dissolução de traumas emocionais profundos',
      'Liberação de padrões maternos carregados',
      'Transformação do luto em sabedoria',
      'Compreensão de ciclos de vida e morte',
      'Aprofundamento da meditação contemplativa',
    ],
    planeta: 'Saturno',
    direcao: 'Oeste',
    nome_divino: 'ELOHIM',
    letra_hebraica: 'ג',
    dinamica: 'Receptáculo lunar que transforma experiência em compreensão sagrada.',
  },
  EM: {
    som: 'EM',
    pronunciacao: 'ehm (som de contenção, vibração na garganta)',
    sephirah: 'Binah',
    numero_caminho: 3,
    elemento: 'Água',
    elemento_en: 'Water',
    propriedades_cura: [
      'Harmonização do campo emocional',
      'Purificação de memórias dolorosas',
      'Estabelecimento de limites saudáveis',
      'Aprofundamento da compaixão',
      'Conexão com a sabedoria ancestral',
    ],
    planeta: 'Saturno',
    direcao: 'Oeste',
    nome_divino: 'ELOHIM',
    letra_hebraica: 'ג',
    dinamica: 'Som que estruturaliza a emoção em forma sagrada de compreensão.',
  },

  // 4. Chesed (Misericórdia) - EL - Água - Abundância Divina
  EL: {
    som: 'EL',
    pronunciacao: 'el (sons curtos e amplos, vibração no coração)',
    sephirah: 'Chesed',
    numero_caminho: 4,
    elemento: 'Água',
    elemento_en: 'Water',
    propriedades_cura: [
      'Atração de abundância e prosperidade',
      'Expansão da misericórdia infinita',
      'Dissolução de escassez e medo financeiro',
      'Fortalecimento da fé em abundância',
      'Abertura para bênçãos celestiais',
    ],
    planeta: 'Júpiter',
    direcao: 'Norte',
    nome_divino: 'EL',
    letra_hebraica: 'ד',
    dinamica: 'Misericórdia que flui como rio abundante, nutrição divina ilimitada.',
  },
  ALEPH: {
    som: 'ALEPH',
    pronunciacao: 'alef (sopro suave, vibração na garganta superior)',
    sephirah: 'Chesed',
    numero_caminho: 4,
    elemento: 'Água',
    elemento_en: 'Water',
    propriedades_cura: [
      'Respiração sagrada de vida',
      'Conexão com o sopro divino',
      'Energização do corpo de luz',
      'Despertar da voz do silêncio',
      'Integração do poder do éter',
    ],
    planeta: 'Júpiter',
    direcao: 'Norte',
    nome_divino: 'EL',
    letra_hebraica: 'ד',
    dinamica: 'Primeira letra hebraica, o sopro primordial da criação.',
  },

  // 5. Geburah (Severidade) - ELOHIM - Fogo - Força Retificadora
  ELOHIM: {
    som: 'ELOHIM',
    pronunciacao: 'e-lo-him (sons cortantes, vibração no plexo solar)',
    sephirah: 'Geburah',
    numero_caminho: 5,
    elemento: 'Fogo',
    elemento_en: 'Fire',
    propriedades_cura: [
      'Dissolução de medos ancestrais',
      'Transformação de padrões destrutivos',
      'Força para estabelecer limites firmes',
      'Coragem para enfrentar verdades difíceis',
      'Quebra de ilusões e autossabotagem',
    ],
    planeta: 'Marte',
    direcao: 'Sul',
    nome_divino: 'ELOHIM GIBOR',
    letra_hebraica: 'ה',
    dinamica: 'Força cortante que remove o que não serve, fogo purificador da alma.',
  },
  GE: {
    som: 'GE',
    pronunciacao: 'gué (som de impacto, vibração no plexo solar)',
    sephirah: 'Geburah',
    numero_caminho: 5,
    elemento: 'Fogo',
    elemento_en: 'Fire',
    propriedades_cura: [
      'Quebra de resistência e teimosia',
      'Liberação de fúria suprimida',
      'Transformação de raiva em poder construtivo',
      'Despertar da assertividade sagrada',
      'Corte de attachamentos nocivos',
    ],
    planeta: 'Marte',
    direcao: 'Sul',
    nome_divino: 'ELOHIM GIBOR',
    letra_hebraica: 'ה',
    dinamica: 'Som de separação e julgamento sagrado, que distingue luz de escuridão.',
  },

  // 6. Tiphereth (Beleza) - YHVH - Fogo - Harmonia Solar
  YHVH: {
    som: 'YHVH',
    pronunciacao: 'iod-hé-vav-hé (tetagrámaton, vibração no coração solar)',
    sephirah: 'Tiphereth',
    numero_caminho: 6,
    elemento: 'Fogo',
    elemento_en: 'Fire',
    propriedades_cura: [
      'Harmonização do ego com o eu superior',
      'Despertar do amor-próprio incondicional',
      'Integração de opostos internos',
      'Soltar mágoas e ressentimentos',
      'Conexão com o sacrifício amoroso',
    ],
    planeta: 'Sol',
    direcao: 'Leste',
    nome_divino: 'YHVH ELOAH VA-DAATH',
    letra_hebraica: 'ו',
    dinamica: 'Nome sagrado de Deus, ponto de equilíbrio entre espírito e matéria.',
  },
  RA: {
    som: 'RA',
    pronunciacao: 'rah (solstício, vibração no coração)',
    sephirah: 'Tiphereth',
    numero_caminho: 6,
    elemento: 'Fogo',
    elemento_en: 'Fire',
    propriedades_cura: [
      'Despertar da luz interior',
      'Dissolução de sombras emocionais',
      'Ressonância com o sol espiritual',
      'Purificação por fogo de amor',
      'Iluminação do caminho pessoal',
    ],
    planeta: 'Sol',
    direcao: 'Leste',
    nome_divino: 'YHVH ELOAH VA-DAATH',
    letra_hebraica: 'ו',
    dinamica: 'Sol interior que brilha através de toda escuridão.',
  },

  // 7. Netzach (Vitória) - ELOHIM SABBAOTH - Fogo - Paixão Vitoriosa
  ELOHIM_SABBAOTH: {
    som: 'ELOHIM SABBAOTH',
    pronunciacao: 'e-lo-him sa-ba-ot (exército divino, vibração no baixo ventre)',
    sephirah: 'Netzach',
    numero_caminho: 7,
    elemento: 'Fogo',
    elemento_en: 'Fire',
    propriedades_cura: [
      'Superação de obstáculos emocionais',
      'Dissolução de mágoas e traições',
      'Restauração da autoestima ferida',
      'Transformação de relacionamentos tóxicos',
      'Liberação da culpa e vergonha',
    ],
    planeta: 'Vênus',
    direcao: 'Sul',
    nome_divino: 'ELOHIM TZABAOTH',
    letra_hebraica: 'ז',
    dinamica: 'Vitória emocional que restaura a confiança na capacidade de amar.',
  },
  VA: {
    som: 'VA',
    pronunciacao: 'vá (ação, vibração no plexo inferior)',
    sephirah: 'Netzach',
    numero_caminho: 7,
    elemento: 'Fogo',
    elemento_en: 'Fire',
    propriedades_cura: [
      'Motivação para ação criativa',
      'Superação da inércia emocional',
      'Despertar da paixão de viver',
      'Transformação de frustração em成果',
      'Celebração da vida e vitalidade',
    ],
    planeta: 'Vênus',
    direcao: 'Sul',
    nome_divino: 'ELOHIM TZABAOTH',
    letra_hebraica: 'ז',
    dinamica: 'Som de movimento que desperta a vitalidade adormecida.',
  },

  // 8. Hod (Glória) - ELOHIM TZABAOTH - Ar - Gloria Intelectual
  ELOHIM_TZABAOTH: {
    som: 'ELOHIM TZABAOTH',
    pronunciacao: 'e-lo-him tsa-ba-ot (exército divino, vibração na garganta)',
    sephirah: 'Hod',
    numero_caminho: 8,
    elemento: 'Ar',
    elemento_en: 'Air',
    propriedades_cura: [
      'Clarificação de pensamentos confusos',
      'Dissolução de mentiras e autoengano',
      'Despertar da inteligência verbal',
      'Purificação da comunicação tóxica',
      'Conexão com a verdade interior',
    ],
    planeta: 'Mercúrio',
    direcao: 'Leste',
    nome_divino: 'ELOHIM TZABAOTH',
    letra_hebraica: 'ח',
    dinamica: 'Glória intelectual que restaura a integridade do pensamento e palavra.',
  },
  HE: {
    som: 'HE',
    pronunciacao: 'hé (janela, vibração na garganta superior)',
    sephirah: 'Hod',
    numero_caminho: 8,
    elemento: 'Ar',
    elemento_en: 'Air',
    propriedades_cura: [
      'Abertura para novas perspectivas',
      'Liberação de julgamento crítico',
      'Despertar da capacidade de escuta',
      'Harmonização da comunicação',
      'Tradução entre coração e mente',
    ],
    planeta: 'Mercúrio',
    direcao: 'Leste',
    nome_divino: 'ELOHIM TZABAOTH',
    letra_hebraica: 'ח',
    dinamica: 'Som de janela que permite a luz entrar e a verdade sair.',
  },

  // 9. Yesod (Fundação) - SHADDAI - Água - Fundação Lunar
  SHADDAI: {
    som: 'SHADDAI',
    pronunciacao: 'sha-dai (onipotente, vibração na base da coluna)',
    sephirah: 'Yesod',
    numero_caminho: 9,
    elemento: 'Água',
    elemento_en: 'Water',
    propriedades_cura: [
      'Aterramento em situações de caos',
      'Transformação de pesadelos em mensagens',
      'Conexão com o inconsciente profundo',
      'Dissolução de medos noturnos',
      'Integração de material subconsciente',
    ],
    planeta: 'Lua',
    direcao: 'Oeste',
    nome_divino: 'SHADDAI EL CHAI',
    letra_hebraica: 'ט',
    dinamica: 'Poder vivificante que ancora o divino na matéria através do sonho.',
  },
  IM: {
    som: 'IM',
    pronunciacao: 'im (com, junto, vibração no sagrado)',
    sephirah: 'Yesod',
    numero_caminho: 9,
    elemento: 'Água',
    elemento_en: 'Water',
    propriedades_cura: [
      'União com o feminino sagrado',
      'Conexão com ancestrais maternos',
      'Dissolução de solidão existencial',
      'Recepção de guias e protectores',
      'Sincronicidades e sinais do universo',
    ],
    planeta: 'Lua',
    direcao: 'Oeste',
    nome_divino: 'SHADDAI EL CHAI',
    letra_hebraica: 'ט',
    dinamica: 'Som de companhia divina, estar junto do sagrado em qualquer lugar.',
  },

  // 10. Malkuth (Reino) - ADONAI - Terra - Manifestação Material
  ADONAI: {
    som: 'ADONAI',
    pronunciacao: 'a-do-nai (senhor, vibração nos pés e根基)',
    sephirah: 'Malkuth',
    numero_caminho: 10,
    elemento: 'Terra',
    elemento_en: 'Earth',
    propriedades_cura: [
      'Aterramento em momentos de fuga',
      'Transformação de stress em presença',
      'Conexão com o corpo físico sagrado',
      'Dissolução deansiedade e pressa',
      'Manifestação de intentions na matéria',
    ],
    planeta: 'Terra',
    direcao: 'Sul',
    nome_divino: 'ADONAI HA-ARETZ',
    letra_hebraica: 'י',
    dinamica: 'Nome que traz o céu à terra,manifestando o divino na matéria.',
  },
  MAL: {
    som: 'MAL',
    pronunciacao: 'mahl (reino, vibração nos pés)',
    sephirah: 'Malkuth',
    numero_caminho: 10,
    elemento: 'Terra',
    elemento_en: 'Earth',
    propriedades_cura: [
      'Reconexão com o corpo e sensações',
      'Dissolução de espiritualidade dissociada',
      'Gratidão pelo corpo físico',
      'Honra à jornada da encarnação',
      'Sagramento do cotidiano',
    ],
    planeta: 'Terra',
    direcao: 'Sul',
    nome_divino: 'ADONAI HA-ARETZ',
    letra_hebraica: 'י',
    dinamica: 'Som que lembra que o divino habita no reino material da Terra.',
  },
} as const;

// Freeze the mapping object to prevent modifications
Object.freeze(SOUND_SEPHIROT_MAPPINGS);
Object.values(SOUND_SEPHIROT_MAPPINGS).forEach(mapping => Object.freeze(mapping));

/**
 * Retrieves the sound-Sephirot correlation mapping for a given sound
 * @param som - Sound identifier (e.g., "AUM", "OM", "YHVH") or any case variation
 * @returns SoundSephirot mapping or undefined if not found
 */
export function getSoundSephirot(som: string): SoundSephirot | undefined {
  const normalized = som.toUpperCase().trim();
  return SOUND_SEPHIROT_MAPPINGS[normalized];
}

/**
 * Retrieves the sound/mantra associated with a given Sephirah
 * @param sephirah - Sephirah name (e.g., "Kether", "Tiphereth", "Malkuth")
 * @returns Sound name or undefined if sephirah not found
 */
export function getSephirotSound(sephirah: string): string | undefined {
  const normalized = sephirah.trim();
  const found = Object.values(SOUND_SEPHIROT_MAPPINGS).find(
    mapping => mapping.sephirah.toLowerCase() === normalized.toLowerCase()
  );
  return found?.som;
}

/**
 * Get all sound-Sephirot mappings
 * @returns Array of all SoundSephirot objects ordered by path number
 */
export function getAllSoundSephiroth(): SoundSephirot[] {
  return Object.values(SOUND_SEPHIROT_MAPPINGS).sort(
    (a, b) => a.numero_caminho - b.numero_caminho
  );
}

/**
 * Get all sounds used in sound-Sephirot correlations
 * @returns Array of unique sound names
 */
export function getAllSounds(): string[] {
  return Object.keys(SOUND_SEPHIROT_MAPPINGS);
}

/**
 * Get all Sephiroth used in sound correlations
 * @returns Array of unique Sephirah names sorted by path number
 */
export function getAllSephiroth(): string[] {
  const sephiroth = new Set<string>();
  Object.values(SOUND_SEPHIROT_MAPPINGS).forEach(mapping => {
    sephiroth.add(mapping.sephirah);
  });
  return Array.from(sephiroth).sort((a, b) => {
    const pathA = SOUND_SEPHIROT_MAPPINGS[Object.keys(SOUND_SEPHIROT_MAPPINGS).find(
      key => SOUND_SEPHIROT_MAPPINGS[key].sephirah === a
    )!]!.numero_caminho;
    const pathB = SOUND_SEPHIROT_MAPPINGS[Object.keys(SOUND_SEPHIROT_MAPPINGS).find(
      key => SOUND_SEPHIROT_MAPPINGS[key].sephirah === b
    )!]!.numero_caminho;
    return pathA - pathB;
  });
}

/**
 * Get all sounds mapped to a specific Sephirah
 * @param sephirah - The Sephirah name (e.g., 'Kether', 'Tiphereth')
 * @returns Array of SoundSephirot objects for that Sephirah
 */
export function getSoundsBySephirah(sephirah: string): SoundSephirot[] {
  return Object.values(SOUND_SEPHIROT_MAPPINGS).filter(
    mapping => mapping.sephirah.toLowerCase() === sephirah.toLowerCase()
  );
}

/**
 * Get the healing properties for a given sound/mantra
 * @param som - Sound identifier
 * @returns Array of healing properties or undefined if sound not found
 */
export function getHealingProperties(som: string): string[] | undefined {
  return getSoundSephirot(som)?.propriedades_cura;
}

/**
 * Get the element associated with a given sound/mantra
 * @param som - Sound identifier
 * @returns Element name or undefined if sound not found
 */
export function getElementBySound(som: string): string | undefined {
  return getSoundSephirot(som)?.elemento;
}

/**
 * Get the planet associated with a given sound/mantra
 * @param som - Sound identifier
 * @returns Planet name or undefined if sound not found
 */
export function getPlanetBySound(som: string): string | undefined {
  return getSoundSephirot(som)?.planeta;
}

/**
 * Get all sounds mapped to a specific element
 * @param elemento - Element name (e.g., 'Fogo', 'Água', 'Ar', 'Terra', 'Éter')
 * @returns Array of SoundSephirot objects that contain the element
 */
export function getSoundsByElement(elemento: string): SoundSephirot[] {
  return Object.values(SOUND_SEPHIROT_MAPPINGS).filter(
    mapping => mapping.elemento.toLowerCase() === elemento.toLowerCase()
  );
}

/**
 * Get all sounds mapped to a specific planet
 * @param planeta - Planet name (e.g., 'Sol', 'Lua', 'Marte')
 * @returns Array of SoundSephirot objects associated with the planet
 */
export function getSoundsByPlanet(planeta: string): SoundSephirot[] {
  return Object.values(SOUND_SEPHIROT_MAPPINGS).filter(
    mapping => mapping.planeta.toLowerCase() === planeta.toLowerCase()
  );
}

/**
 * Check if a sound exists in the sound-Sephirot mappings
 * @param som - Sound identifier to check
 * @returns True if sound exists in mapping
 */
export function hasSoundSephirot(som: string): boolean {
  return som.toUpperCase().trim() in SOUND_SEPHIROT_MAPPINGS;
}

/**
 * Get the path number for a given sound
 * @param som - Sound identifier
 * @returns Path number or undefined if sound not found
 */
export function getPathBySound(som: string): number | undefined {
  return getSoundSephirot(som)?.numero_caminho;
}

// Default export for convenience
export default {
  getSoundSephirot,
  getSephirotSound,
  getAllSoundSephiroth,
  getAllSounds,
  getAllSephiroth,
  getSoundsBySephirah,
  getHealingProperties,
  getElementBySound,
  getPlanetBySound,
  getSoundsByElement,
  getSoundsByPlanet,
  hasSoundSephirot,
  getPathBySound,
  SOUND_SEPHIROT_MAPPINGS,
};
