/**
 * Sound-Numerology Spiritual Correlation Module
 * Maps sacred sounds, mantras, and seed syllables to numerology numbers
 * with their healing properties and spiritual dynamics.
 *
 * Based on the sound-number correlations from Cabala vibrational numerology
 * and the seven sacred seed syllables (bija mantras) aligned with numbers 1-13.
 */

export interface SoundNumerology {
  /** Sound or mantra identifier (e.g., "LAM", "OM") */
  som: string;
  /** Sound pronunciation guide */
  pronunciacao: string;
  /** Associated numerology number (1-13) */
  numero: number;
  /** Spiritual meaning of the number */
  significado_numero: string;
  /** Primary element associated */
  elemento: string;
  /** Element in English */
  elemento_en: string;
  /** Chakra associated with this sound */
  chakra: string;
  /** Sanskrit chakra name */
  chakra_sanskrit: string;
  /** Chakra number (1-7) */
  chakra_numero: number;
  /** Frequency in Hertz */
  frequencia: number;
  /** Healing properties and spiritual benefits */
  propriedades_cura: string[];
  /** Orixá associated with this sound-number */
  orixa: string;
  /** Sephirah correspondence */
  sephirah: string;
  /** Spiritual dynamics */
  dinamica: string;
}
/** Map of sacred sounds mapped to numerology with healing properties */
export const SOUND_NUMEROLOGY: Record<string, SoundNumerology> = {
  LAM: {
    som: "LAM",
    pronunciacao: "lahm (vibração na base da coluna, som grave e ancorante)",
    numero: 1,
    significado_numero: "O começo divino, a força de vontade que move o universo, o impulso de criação",
    elemento: "Terra",
    elemento_en: "Earth",
    chakra: "1º Básico",
    chakra_sanskrit: "Muladhara",
    chakra_numero: 1,
    frequencia: 396,
    propriedades_cura: [
      "Dissolução de medos de sobrevivência e escassez",
      "Ancoramento energético e estabilidade física",
      "Fortalecimento da vontade de viver",
      "Conexão com a natureza e o mundo material",
      "Eliminação de energias pesadas e densas",
      "Manifestação da vontade interior",
    ],
    orixa: "Iemanjá / Omolu",
    sephirah: "Malkuth",
    dinamica: "Enraizamento profundo e firmness material através da ressonância terrestre. O número 1 ativa a força de vontade e a capacidade de manifestação.",
  },
  VAM: {
    som: "VAM",
    pronunciacao: "vahm (vibração no baixo ventre, som fluido e purificador)",
    numero: 2,
    significado_numero: "A polaridade divina, a capacidade de receber e adaptar-se, o fluxo emocional",
    elemento: "Água",
    elemento_en: "Water",
    chakra: "2º Sacro",
    chakra_sanskrit: "Svadhisthana",
    chakra_numero: 2,
    frequencia: 417,
    propriedades_cura: [
      "Limpeza de traumas emocionais do passado",
      "Transmutação de energias criativas bloqueadas",
      "Fluidez vital e harmonia nas relações",
      "Dissolução de ressentimentos e mágoas",
      "Purificação do campo emocional",
      "Abertura para a receptividade",
    ],
    orixa: "Oxum / Ibeji",
    sephirah: "Yesod",
    dinamica: "Fluxo contínuo de limpeza emocional através da ressonância aquática. O número 2 traz o equilíbrio entre dar e receber.",
  },
  RAM: {
    som: "RAM",
    pronunciacao: "rahm (vibração no plexo solar, som ardente e transformador)",
    numero: 3,
    significado_numero: "A expansão da chama criativa, a expressão divina em movimento, a festividade da existência",
    elemento: "Fogo",
    elemento_en: "Fire",
    chakra: "3º Plexo Solar",
    chakra_sanskrit: "Manipura",
    chakra_numero: 3,
    frequencia: 528,
    propriedades_cura: [
      "Transformação da força de vontade e autoconfiança",
      "Quebra de padrões de medo e limitação",
      "Ativação do poder pessoal e do brilho interior",
      "Combustão de energias estagnadas e negativas",
      "Manifestação de objetivos e desejos",
      "Expressão criativa e comunicação",
    ],
    orixa: "Ogum / Xangô",
    sephirah: "Binah",
    dinamica: "Queima transformadora de velhas limitações através da ressonância ígnea. O número 3 ativa a criatividade e a expressão.",
  },
  YAM: {
    som: "YAM",
    pronunciacao: "yyahm (vibração no coração, som expansivo e libertador)",
    numero: 4,
    significado_numero: "A materialização divina, a estabilidade do reino físico, a construção de alicerces",
    elemento: "Ar",
    elemento_en: "Air",
    chakra: "4º Cardíaco",
    chakra_sanskrit: "Anahata",
    chakra_numero: 4,
    frequencia: 639,
    propriedades_cura: [
      "Expansão do afeto incondicional e compaixão",
      "Harmonização de relacionamentos e conexões",
      "Libertação de mágoas e feridas emocionais",
      "Abertura para dar e receber amor",
      "Equilíbrio entre razão e emoção",
      "Construção de estruturas emocionais sólidas",
    ],
    orixa: "Oxalá / Iansã",
    sephirah: "Tiphereth",
    dinamica: "Expansão ilimitada do coração através da ressonância aérea. O número 4 traz estabilidade e construção harmoniosa.",
  },
  HAM: {
    som: "HAM",
    pronunciacao: "hahm (vibração na garganta, som purificador e expressivo)",
    numero: 5,
    significado_numero: "A fluidez alquímica, a liberdade dentro do fluxo, a mudança interior e transformação",
    elemento: "Ar",
    elemento_en: "Air",
    chakra: "5º Laríngeo",
    chakra_sanskrit: "Vishuddha",
    chakra_numero: 5,
    frequencia: 741,
    propriedades_cura: [
      "Expressão da verdade interna e autenticidade",
      "Purificação da garganta e sistema respiratório",
      "Poder da palavra falada e escrita",
      "Libertação de medos de julgamento",
      "Abertura da criatividade e comunicação",
      "Libertação e transformação interior",
    ],
    orixa: "Iansã / Nana",
    sephirah: "Netzach",
    dinamica: "Purificação e expressão através da ressonância laríngea. O número 5 ativa a liberdade e a adaptabilidade espiritual.",
  },
  OM: {
    som: "OM",
    pronunciacao: "oh-umm (som primordial, vibração em todo o corpo sutil)",
    numero: 6,
    significado_numero: "O fogo do amor harmonioso, o equilíbrio entre dar e receber, a integração coração-ação",
    elemento: "Éter",
    elemento_en: "Ether",
    chakra: "6º Frontal",
    chakra_sanskrit: "Ajna",
    chakra_numero: 6,
    frequencia: 852,
    propriedades_cura: [
      "Despertar da intuição profunda e sabedoria interior",
      "Dissolução de ilusões mentais e confusão",
      "Conexão com a consciência cósmica",
      "Expansão da percepção além do ego",
      "Silêncio interior e paz profunda",
      "Harmonia e equilíbrio universal",
    ],
    orixa: "Orunmilá / Oxalá",
    sephirah: "Daath",
    dinamica: "Abertura do terceiro olho através da ressonância etérea primordial. O número 6 traz harmonia e intuição desperta.",
  },
  AUM: {
    som: "AUM",
    pronunciacao: "a-u-umm (tríade sonora sagrada, vibração no topo da cabeça)",
    numero: 7,
    significado_numero: "O sopro da sabedoria divina, a introspecção que revela verdades ocultas, a busca espiritual",
    elemento: "Éter",
    elemento_en: "Ether",
    chakra: "7º Coronário",
    chakra_sanskrit: "Sahasrara",
    chakra_numero: 7,
    frequencia: 963,
    propriedades_cura: [
      "Conexão espiritual direta com a Fonte",
      "Iluminação da mente através do silêncio",
      "Expansão da consciência além dos limites",
      "Integração dos corpos físico e espiritual",
      "Despertar da consciência universal",
      "Sabedoria interior e introspecção",
    ],
    orixa: "Oxalá / Obaluaiê",
    sephirah: "Kether",
    dinamica: "Unificação da tríade sonora com o cosmos através da ressonância coronária. O número 7 representa a iluminação espiritual completa.",
  },
  // Additional sacred sounds for numbers 8-13
  EIM: {
    som: "EIM",
    pronunciacao: "eim (vibração de purificação solar, som quente e brilhante)",
    numero: 8,
    significado_numero: "O vento da justiça kármica, o equilíbrio entre esforço e recompensa, o poder pessoal",
    elemento: "Fogo",
    elemento_en: "Fire",
    chakra: "3º Plexo Solar",
    chakra_sanskrit: "Manipura",
    chakra_numero: 3,
    frequencia: 528,
    propriedades_cura: [
      "Resiliência e perseverança",
      "Autoridade interior e gestão",
      "Equilíbrio kármico e justiça",
      "Fortificação da vontade",
      "Transformação de obstáculos em oportunidades",
      "Manifestação do poder pessoal",
    ],
    orixa: "Xangô / Ogum",
    sephirah: "Hod",
    dinamica: "Autoridade interior e equilíbrio através da ressonância solar. O número 8 ativa a gestão do poder pessoal.",
  },
  HRIM: {
    som: "HRIM",
    pronunciacao: "hrim (vibração do coração divino, som de adoração solar)",
    numero: 9,
    significado_numero: "A água da sabedoria universal, a compaixão que transcende o individual, a iluminação espiritual",
    elemento: "Água",
    elemento_en: "Water",
    chakra: "6º Frontal",
    chakra_sanskrit: "Ajna",
    chakra_numero: 6,
    frequencia: 852,
    propriedades_cura: [
      "Humanitarismo e compaixão universal",
      "Sabedoria transcendental",
      "Libertação de padrões do ego",
      "Iluminação espiritual",
      "Fim de ciclos e renovação",
      "Integração da consciência universal",
    ],
    orixa: "Ossá / Nanã",
    sephirah: "Yesod",
    dinamica: "Sabedoria universal e compaixão através da ressonância cardíaca divina. O número 9 traz a iluminação que transcende o individual.",
  },
  KLIM: {
    som: "KLIM",
    pronunciacao: "klim (vibração de magnetismo e abundância, som atrativo)",
    numero: 10,
    significado_numero: "A terra da transformação profunda, o retorno ao centro, a manifestação material",
    elemento: "Terra",
    elemento_en: "Earth",
    chakra: "1º Básico",
    chakra_sanskrit: "Muladhara",
    chakra_numero: 1,
    frequencia: 396,
    propriedades_cura: [
      "Abundância e prosperidade",
      "Magnetismo para oportunidades",
      "Renovação e transformação",
      "Manifestação de desejos",
      "Conexão com a natureza",
      "Encerramento de ciclos antigos",
    ],
    orixa: "Oxalá / Iemanjá",
    sephirah: "Malkuth",
    dinamica: "Manifestação material e abundância através da ressonância magnética. O número 10 traz a завершение ciclos e renovação.",
  },
  HUM: {
    som: "HUM",
    pronunciacao: "hum (vibração do果断 e proteção, som cortante e firme)",
    numero: 11,
    significado_numero: "O éter da intuição desperta, o canal entre o humano e o divino, o alinhamento com a vontade divina",
    elemento: "Fogo",
    elemento_en: "Fire",
    chakra: "3º Plexo Solar",
    chakra_sanskrit: "Manipura",
    chakra_numero: 3,
    frequencia: 528,
    propriedades_cura: [
      "Intuição espiritual desperta",
      "Channeling de energia divina",
      "Inspiração criativa",
      "Proteção contra energias negativas",
      "Determinação e ação focalizada",
      "Iluminação do caminho",
    ],
    orixa: "Exu / Ogum",
    sephirah: "Kether / Tiphereth",
    dinamica: "Poder do despertar espiritual através da ressonância果断. O número 11 é um número mestre que ativa a intuição desperta.",
  },
  PHAT: {
    som: "PHAT",
    pronunciacao: "phat (vibração de proteção e purificação, som que corta ilusões)",
    numero: 12,
    significado_numero: "O fogo purificador da justiça divina, a transformação por provações, o equilíbrio entre razão e emoção",
    elemento: "Fogo",
    elemento_en: "Fire",
    chakra: "5º Laríngeo",
    chakra_sanskrit: "Vishuddha",
    chakra_numero: 5,
    frequencia: 741,
    propriedades_cura: [
      "Proteção contra energias negativas",
      "Purificação de ambientes e pessoas",
      "Quebra de feitiços e maldições",
      "Coragem moral e integridade",
      "Justiça divina e equidade",
      "Transformação por provações",
    ],
    orixa: "Xangô / Exu",
    sephirah: "Geburah",
    dinamica: "Proteção e purificação através da ressonância cortante. O número 12 traz a justiça divina e a transformação purificadora.",
  },
  NAMAH: {
    som: "NAMAH",
    pronunciacao: "na-mah (vibração de reverência e entrega, som de devoção)",
    numero: 13,
    significado_numero: "A terra da morte e renascimento, o fim de ciclos, a sabedoria dos ancestrais, a evolução física",
    elemento: "Terra",
    elemento_en: "Earth",
    chakra: "1º Básico",
    chakra_sanskrit: "Muladhara",
    chakra_numero: 1,
    frequencia: 396,
    propriedades_cura: [
      "Transformação profunda e renascimento",
      "Sabedoria dos ancestrais",
      "Libertação de padrões kármicos",
      "Renovação celular e física",
      "Fim de ciclos e novoscomeços",
      "Conexão com a sabedoria antiga",
    ],
    orixa: "Nanã / Omolu",
    sephirah: "Malkuth",
    dinamica: "Morte e renascimento através da ressonância de reverência. O número 13 traz a transformação profunda e a sabedoria dos mais velhos.",
  },
};

/**
 * Retrieves the sound-numerology correlation mapping for a given sound
 * @param som - Sound identifier (e.g., "LAM", "OM", "AUM") or any case variation
 * @returns SoundNumerology mapping or undefined if not found
 */
export function getSoundNumerology(som: string): SoundNumerology | undefined {
  if (!som) return undefined;
  
  const upperSom = som.toUpperCase().trim();
  return SOUND_NUMEROLOGY[upperSom];
}

/**
 * Retrieves the numerology number associated with a given sound/mantra
 * @param som - Sound identifier (e.g., "LAM", "VAM", "OM")
 * @returns Number or undefined if not found
 */
export function getNumerologySound(som: string): number | undefined {
  const mapping = getSoundNumerology(som);
  return mapping?.numero;
}

/**
 * Get all sound-numerology mappings
 * @returns Array of all SoundNumerology objects ordered by number
 */
export function getAllSoundNumerology(): SoundNumerology[] {
  return Object.values(SOUND_NUMEROLOGY).sort((a, b) => a.numero - b.numero);
}

/**
 * Get all numerology numbers used in sound correlations
 * @returns Array of unique numbers (1-13)
 */
export function getAllNumbers(): number[] {
  const numbers = new Set(Object.values(SOUND_NUMEROLOGY).map(s => s.numero));
  return Array.from(numbers).sort((a, b) => a - b);
}

/**
 * Get all sounds mapped to a specific numerology number
 * @param numero - Number to look up (1-13)
 * @returns Array of SoundNumerology objects for that number
 */
export function getSoundsByNumber(numero: number): SoundNumerology[] {
  return Object.values(SOUND_NUMEROLOGY).filter(
    s => s.numero === numero
  ).sort((a, b) => a.chakra_numero - b.chakra_numero);
}

/**
 * Get all sounds mapped to a specific element
 * @param elemento - Element name (e.g., "Terra", "Água", "Fogo", "Ar", "Éter")
 * @returns Array of SoundNumerology objects for that element
 */
export function getSoundsByElement(elemento: string): SoundNumerology[] {
  if (!elemento) return [];
  
  const upperElemento = elemento.toLowerCase().trim();
  return Object.values(SOUND_NUMEROLOGY).filter(
    s => s.elemento.toLowerCase() === upperElemento
  ).sort((a, b) => a.numero - b.numero);
}

/**
 * Get the healing properties for a given sound/mantra
 * @param som - Sound identifier
 * @returns Array of healing properties or undefined if sound not found
 */
export function getHealingProperties(som: string): string[] | undefined {
  const mapping = getSoundNumerology(som);
  return mapping?.propriedades_cura;
}

/**
 * Get the spiritual dynamics for a given sound/mantra
 * @param som - Sound identifier
 * @returns Spiritual dynamic string or undefined if sound not found
 */
export function getSpiritualDynamics(som: string): string | undefined {
  const mapping = getSoundNumerology(som);
  return mapping?.dinamica;
}