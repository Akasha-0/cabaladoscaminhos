/**
 * Sound-Odú Spiritual Correlation Module
 * Maps sacred sounds, mantras, and seed syllables to Odú Ifá (Merindilogun)
 * with their healing properties and spiritual dynamics.
 *
 * Based on the Cabala dos Caminhos spiritual system.
 */

export interface SoundOdu {
  /** Sound or mantra identifier (e.g., "LAM", "OM", "KRAF") */
  som: string;
  /** Sound pronunciation guide */
  pronunciacao: string;
  /** Associated Odú Ifá */
  odu: string;
  /** Odu number (1-16) */
  odu_numero: number;
  /** Primary element associated */
  elemento: string;
  /** Element in English */
  elemento_en: string;
  /** Healing properties and spiritual benefits */
  propriedades_cura: string[];
  /** Chakra associated with this sound */
  chakra: string;
  /** Sanskrit chakra name */
  chakra_sanskrit: string;
  /** Chakra number (1-7) */
  chakra_numero: number;
  /** Frequency in Hertz */
  frequencia: number;
  /** Direction associated with the element */
  direcao: string;
  /** Orixá guardian of this sound-odu correlation */
  orixa: string;
  /** Seasonal association */
  estacao: string;
  /** Spiritual dynamics */
  dinamica: string;
}

/** Map of sacred sounds mapped to Odú Ifá with healing properties */
const SOUND_ODUS: Record<string, SoundOdu> = {
  // ─── LAM - Terra/Fogo correspondences ────────────────────────────────────────
  LAM: {
    som: "LAM",
    pronunciacao: "lahm (vibração na base da coluna, som grave e ancorante)",
    odu: "Ogundá",
    odu_numero: 4,
    elemento: "Terra",
    elemento_en: "Earth",
    propriedades_cura: [
      "Dissolução de medos de sobrevivência e escassez",
      "Ancoramento energético e estabilidade física",
      "Fortalecimento da vontade de viver",
      "Conexão com a natureza e o mundo material",
      "Proteção contra energias pesadas densas",
    ],
    chakra: "1º Básico",
    chakra_sanskrit: "Muladhara",
    chakra_numero: 1,
    frequencia: 396,
    direcao: "Norte",
    orixa: "Ogum",
    estacao: "Inverno",
    dinamica: "Enraizamento profundo e firmeza material através da ressonância terrestre.",
  },

  // ─── VAM - Água correspondences ───────────────────────────────────────────────
  VAM: {
    som: "VAM",
    pronunciacao: "vahm (vibração no baixo ventre, som fluido e purificador)",
    odu: "Irossun",
    odu_numero: 11,
    elemento: "Água",
    elemento_en: "Water",
    propriedades_cura: [
      "Limpeza de traumas emocionais do passado",
      "Transmutação de energias criativas bloqueadas",
      "Fluidez vital e harmonia nas relações",
      "Dissolução de ressentimentos e mágoas",
      "Purificação do campo emocional",
    ],
    chakra: "2º Sacro",
    chakra_sanskrit: "Svadhisthana",
    chakra_numero: 2,
    frequencia: 417,
    direcao: "Oeste",
    orixa: "Oxum",
    estacao: "Primavera",
    dinamica: "Fluxo contínuo de limpeza emocional através da ressonância aquática.",
  },

  // ─── RAM - Fogo correspondences ──────────────────────────────────────────────
  RAM: {
    som: "RAM",
    pronunciacao: "rahm (vibração no plexo solar, som ardente e transformador)",
    odu: "Ejilsebora",
    odu_numero: 12,
    elemento: "Fogo",
    elemento_en: "Fire",
    propriedades_cura: [
      "Transformação da força de vontade e autoconfiança",
      "Quebra de padrões de medo e limitações",
      "Ativação do poder pessoal e do brilho interior",
      "Combustão de energias estagnadas e negativas",
      "Manifestação de objetivos e desejos",
    ],
    chakra: "3º Plexo Solar",
    chakra_sanskrit: "Manipura",
    chakra_numero: 3,
    frequencia: 528,
    direcao: "Sul",
    orixa: "Xangô",
    estacao: "Verão",
    dinamica: "Queima transformadora de velhas limitações através da ressonância ígnea.",
  },

  // ─── YAM - Ar (Coração) correspondences ──────────────────────────────────────
  YAM: {
    som: "YAM",
    pronunciacao: "yyahm (vibração no coração, som expansivo e libertador)",
    odu: "Oxum",
    odu_numero: 10,
    elemento: "Ar",
    elemento_en: "Air",
    propriedades_cura: [
      "Libertação de traumas emocionais e prisões internas",
      "Expansão da consciência e abertura do coração",
      "Dissolução de mágoas e perdão profundo",
      "Conexão com o amor universal e compaixão",
      "Harmonização das relações interpessoais",
    ],
    chakra: "4º Cardíaco",
    chakra_sanskrit: "Anahata",
    chakra_numero: 4,
    frequencia: 639,
    direcao: "Leste",
    orixa: "Oxum",
    estacao: "Outono",
    dinamica: "Expansão contínua do amor incondicional através da ressonância cardíaca.",
  },

  // ─── HAM (Laringe) - Ar correspondences ─────────────────────────────────────
  HAM: {
    som: "HAM",
    pronunciacao: "hahm (vibração na laringe, som purificador e libertador)",
    odu: "Obará",
    odu_numero: 6,
    elemento: "Ar",
    elemento_en: "Air",
    propriedades_cura: [
      "Libertação da expressão criativa e comunicação",
      "Purificação da garganta e sistema respiratório",
      "Dissolução de bloqueios na comunicação",
      "Abertura do canal de expressão divina",
      "Harmonização da voz e da verdade interior",
    ],
    chakra: "5º Laríngeo",
    chakra_sanskrit: "Vishuddha",
    chakra_numero: 5,
    frequencia: 741,
    direcao: "Nordeste",
    orixa: "Oxalá",
    estacao: "Equinócio",
    dinamica: "Purificação da expressão e开门 da comunicação espiritual.",
  },

  // ─── KSHAM - Terra/Intuição correspondences ──────────────────────────────────
  KSHAM: {
    som: "KSHAM",
    pronunciacao: "kshahm (vibração no terceiro olho, som de dissolução kármica)",
    odu: "Etaogundá",
    odu_numero: 3,
    elemento: "Terra",
    elemento_en: "Earth",
    propriedades_cura: [
      "Dissolução de padrões kármicos densos",
      "Purificação de memórias dolorosas",
      "Libertação de dívidas espirituais antigas",
      "Transformação de energias pesadas em leveza",
      "Regeneração do campo áurico",
    ],
    chakra: "6º Terceiro Olho",
    chakra_sanskrit: "Ajna",
    chakra_numero: 6,
    frequencia: 852,
    direcao: "Centro",
    orixa: "Obaluayê",
    estacao: "Ciclo completo",
    dinamica: "Dissolução de velhas energias e renovação espiritual profunda.",
  },

  // ─── OM - Éter (Coronário) correspondences ───────────────────────────────────
  OM: {
    som: "OM",
    pronunciacao: "Aum (som primordial, vibração universal e cósmica)",
    odu: "Ofun",
    odu_numero: 16,
    elemento: "Éter",
    elemento_en: "Ether",
    propriedades_cura: [
      "Restauração do padrão original da criação",
      "Conexão com a consciência cósmica e universal",
      "Dissolução de ilusões e maya",
      "Iluminação espiritual e paz profunda",
      "Integração com o todo e unidade existencial",
    ],
    chakra: "7º Coronário",
    chakra_sanskrit: "Sahasrara",
    chakra_numero: 7,
    frequencia: 963,
    direcao: "Zenite",
    orixa: "Oxalá",
    estacao: "Eternidade",
    dinamica: "Expansão infinita da consciência através da ressonância primordial.",
  },

  // ─── AUM - Éter (Coronário Alternativo) ─────────────────────────────────────
  AUM: {
    som: "AUM",
    pronunciacao: "Aum (vibração tríplice: criação, preservação, dissolução)",
    odu: "Alafia",
    odu_numero: 1,
    elemento: "Éter",
    elemento_en: "Ether",
    propriedades_cura: [
      "Restauração da saúde e vitalidade original",
      "Cura de enfermidades físicas e espirituais",
      "Renovação do campo energético",
      "Harmonização dos corpos sutis",
      "Retorno à harmonia cósmica",
    ],
    chakra: "7º Coronário",
    chakra_sanskrit: "Sahasrara",
    chakra_numero: 7,
    frequencia: 963,
    direcao: "Zenite",
    orixa: "Oxalá",
    estacao: "Eternidade",
    dinamica: "Restauração da inteireza através da ressonância tríplice sagrada.",
  },

  // ─── HUM - Fogo (Plexo Solar) ───────────────────────────────────────────────
  HUM: {
    som: "HUM",
    pronunciacao: "hoom (vibração do poder pessoal e proteção)",
    odu: "Ejilsebora",
    odu_numero: 12,
    elemento: "Fogo",
    elemento_en: "Fire",
    propriedades_cura: [
      "Proteção contra energias negativas",
      "Ativação da força de vontade e determinação",
      "Quebra de feitiços e encantamentos",
      "Fortificação do campo áurico",
      "Manifestação da verdade e justiça",
    ],
    chakra: "3º Plexo Solar",
    chakra_sanskrit: "Manipura",
    chakra_numero: 3,
    frequencia: 528,
    direcao: "Sul",
    orixa: "Xangô",
    estacao: "Verão",
    dinamica: "Poder de proteção e transformação através da ressonância ígnea.",
  },

  // ─── KLIM - Água/Criatividade ───────────────────────────────────────────────
  KLIM: {
    som: "KLIM",
    pronunciacao: "kleem (vibração da abundância e nutrição divina)",
    odu: "Oxum",
    odu_numero: 10,
    elemento: "Água",
    elemento_en: "Water",
    propriedades_cura: [
      "Abundância e prosperidade material e espiritual",
      "Nutrição do corpo emocional",
      "Fertilidade em todos os níveis",
      "Beleza interior e exterior",
      "Conexão com a energia criativa divina",
    ],
    chakra: "2º Sacro",
    chakra_sanskrit: "Svadhisthana",
    chakra_numero: 2,
    frequencia: 417,
    direcao: "Oeste",
    orixa: "Oxum",
    estacao: "Primavera",
    dinamica: "Fluxo de abundância e nutrição através da ressonância aquática.",
  },

  // ─── STRIM - Terra/Abundância ────────────────────────────────────────────────
  STRIM: {
    som: "STRIM",
    pronunciacao: "streem (vibração da abundância cósmica)",
    odu: "Obará",
    odu_numero: 6,
    elemento: "Terra",
    elemento_en: "Earth",
    propriedades_cura: [
      "Manifestação de abundância em todas as formas",
      "Dissolução de bloqueios de prosperidade",
      "Conexão com a energia do dinheiro espiritual",
      "Harmonização com os fluxos econômicos",
      "Ativação da gratidão infinita",
    ],
    chakra: "1º Básico",
    chakra_sanskrit: "Muladhara",
    chakra_numero: 1,
    frequencia: 396,
    direcao: "Norte",
    orixa: "Ogum",
    estacao: "Inverno",
    dinamica: "Fluxo de abundância material através da ressonância terrestre.",
  },

  // ─── KRIM - Fogo/Transformação ───────────────────────────────────────────────
  KRIM: {
    som: "KRIM",
    pronunciacao: "kreem (vibração da purificação e elevação)",
    odu: "Etaogundá",
    odu_numero: 3,
    elemento: "Fogo",
    elemento_en: "Fire",
    propriedades_cura: [
      "Purificação de toxins físicas e energéticas",
      "Elevação da frequência vibratória",
      "Queima de padrões densos e negativos",
      "Transmutação da energia impura",
      "Abertura parachannel de luz",
    ],
    chakra: "3º Plexo Solar",
    chakra_sanskrit: "Manipura",
    chakra_numero: 3,
    frequencia: 528,
    direcao: "Sul",
    orixa: "Xangô",
    estacao: "Verão",
    dinamica: "Transmutação e elevação através da ressonância ígnea purificadora.",
  },

  // ─── AIM - Água/Lua ─────────────────────────────────────────────────────────
  AIM: {
    som: "AIM",
    pronunciacao: "ah-eem (vibração da sabedoria oculta)",
    odu: "Irossun",
    odu_numero: 11,
    elemento: "Água",
    elemento_en: "Water",
    propriedades_cura: [
      "Desenvolvimento da intuição e clarividência",
      "Acesso à sabedoria ancestral",
      "Purificação do corpo mental",
      "Conexão com os orixás e guias",
      "Desbloqueio da memória akáshica",
    ],
    chakra: "6º Terceiro Olho",
    chakra_sanskrit: "Ajna",
    chakra_numero: 6,
    frequencia: 852,
    direcao: "Centro",
    orixa: "Oxumaré",
    estacao: "Ciclo completo",
    dinamica: "Acesso à sabedoria oculta através da ressonância lunar.",
  },

  // ─── KLIM - Variação para Oxum ─────────────────────────────────────────────
  // (Already defined above - KLIM entry)

  // ─── DUM - Terra/Proteção ────────────────────────────────────────────────────
  DUM: {
    som: "DUM",
    pronunciacao: "doom (vibração de proteção e ancoramento)",
    odu: "Ogundá",
    odu_numero: 4,
    elemento: "Terra",
    elemento_en: "Earth",
    propriedades_cura: [
      "Proteção contra maldições e energias negativas",
      "Ancoramento em situações de caos",
      "Fortalecimento da estrutura física e energética",
      "Estabilidade em momentos de transição",
      "Conexão com as forças protetoras da terra",
    ],
    chakra: "1º Básico",
    chakra_sanskrit: "Muladhara",
    chakra_numero: 1,
    frequencia: 396,
    direcao: "Norte",
    orixa: "Ogum",
    estacao: "Inverno",
    dinamica: "Proteção e firmeza através da ressonância terrestre protetora.",
  },

  // ─── IM - Água/Intuição ─────────────────────────────────────────────────────
  IM: {
    som: "IM",
    pronunciacao: "eem (vibração da mente e intuição)",
    odu: "Irossun",
    odu_numero: 11,
    elemento: "Água",
    elemento_en: "Water",
    propriedades_cura: [
      "Desenvolvimento da clareza mental",
      "Aumento da capacidade intuitiva",
      "Harmonização dos hemisférios cerebrais",
      "Acesso à informação além do tempo",
      "Expansão da consciência",
    ],
    chakra: "6º Terceiro Olho",
    chakra_sanskrit: "Ajna",
    chakra_numero: 6,
    frequencia: 852,
    direcao: "Centro",
    orixa: "Oxumaré",
    estacao: "Ciclo completo",
    dinamica: "Expansão da percepção através da ressonância aquática intuitiva.",
  },
};

// Freeze the mapping object to prevent modifications
Object.freeze(SOUND_ODUS);
Object.values(SOUND_ODUS).forEach(mapping => Object.freeze(mapping));

/**
 * Retrieves the sound-odu correlation mapping for a given sound
 * @param som - Sound identifier (e.g., "LAM", "OM", "AUM") or any case variation
 * @returns SoundOdu mapping or undefined if not found
 */
export function getSoundOdu(som: string): SoundOdu | undefined {
  if (!som || typeof som !== "string") return undefined;
  const normalized = som.toUpperCase().trim();
  return SOUND_ODUS[normalized];
}

/**
 * Retrieves the odu associated with a given sound/mantra
 * @param som - Sound identifier (e.g., "LAM", "VAM", "OM")
 * @returns Odu name or undefined if not found
 */
export function getOduSound(som: string): string | undefined {
  const mapping = getSoundOdu(som);
  return mapping?.odu;
}

/**
 * Get all sound-odu mappings
 * @returns Array of all SoundOdu objects ordered by odu_numero
 */
export function getAllSoundOdus(): SoundOdu[] {
  return Object.values(SOUND_ODUS).sort((a, b) => a.odu_numero - b.odu_numero);
}

/**
 * Get all Odus used in sound correlations
 * @returns Array of unique Odu names
 */
export function getAllOdus(): string[] {
  const odus = new Set<string>();
  Object.values(SOUND_ODUS).forEach(mapping => {
    odus.add(mapping.odu);
  });
  return Array.from(odus).sort();
}

/**
 * Get all sounds mapped to a specific Odu
 * @param odu - Odu name (e.g., "Ogundá", "Irossun", "Ejilsebora")
 * @returns Array of SoundOdu objects for that Odu
 */
export function getSoundsByOdu(odu: string): SoundOdu[] {
  if (!odu || typeof odu !== "string") return [];
  const normalized = odu.trim();
  return Object.values(SOUND_ODUS).filter(mapping => mapping.odu === normalized);
}

/**
 * Get the healing properties for a given sound/mantra
 * @param som - Sound identifier
 * @returns Array of healing properties or undefined if sound not found
 */
export function getHealingProperties(som: string): string[] | undefined {
  const mapping = getSoundOdu(som);
  return mapping?.propriedades_cura;
}

/**
 * Get the element associated with a given sound/mantra
 * @param som - Sound identifier
 * @returns Element name or undefined if sound not found
 */
export function getElementSoundOdu(som: string): string | undefined {
  const mapping = getSoundOdu(som);
  return mapping?.elemento;
}

/**
 * Get the Orixá associated with a given sound/mantra
 * @param som - Sound identifier
 * @returns Orixá name or undefined if sound not found
 */
export function getOrixaBySound(som: string): string | undefined {
  const mapping = getSoundOdu(som);
  return mapping?.orixa;
}

// Default export for convenience
