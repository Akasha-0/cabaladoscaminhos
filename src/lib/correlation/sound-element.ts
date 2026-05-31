/**
 * Sound-Element Spiritual Correlation Module
 * Maps sacred sounds, mantras, and seed syllables to the five elements
 * with their healing properties and spiritual dynamics.
 *
 * Based on the element-sound correlations from IDEIA.md - Alquimia Tântrica Cabala
 * and the five elements (Terra, Água, Fogo, Ar, Éter) with their sonic signatures.
 */

export interface SoundElement {
  /** Sound or mantra identifier (e.g., "LAM", "OM") */
  som: string;
  /** Sound pronunciation guide */
  pronunciacao: string;
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
  /** Seasonal association */
  estacao: string;
  /** Spiritual dynamics */
  dinamica: string;
}

/** Map of sacred sounds mapped to elements with healing properties */
export const SOUND_ELEMENTS: Record<string, SoundElement> = {
  LAM: {
    som: "LAM",
    pronunciacao: "lahm (vibração na base da coluna, som grave e ancorante)",
    elemento: "Terra",
    elemento_en: "Earth",
    propriedades_cura: [
      "Dissolução de medos de sobrevivência e escassez",
      "Ancoramento energético e estabilidade física",
      "Fortalecimento da vontade de viver",
      "Conexão com a natureza e o mundo material",
      "Eliminação de energias pesadas e densas",
    ],
    chakra: "1º Básico",
    chakra_sanskrit: "Muladhara",
    chakra_numero: 1,
    frequencia: 396,
    direcao: "Norte",
    estacao: "Inverno",
    dinamica: "Enraizamento profundo e firmness material através da ressonância terrestre.",
  },
  VAM: {
    som: "VAM",
    pronunciacao: "vahm (vibração no baixo ventre, som fluido e purificador)",
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
    estacao: "Primavera",
    dinamica: "Fluxo contínuo de limpeza emocional através da ressonância aquática.",
  },
  RAM: {
    som: "RAM",
    pronunciacao: "rahm (vibração no plexo solar, som ardente e transformador)",
    elemento: "Fogo",
    elemento_en: "Fire",
    propriedades_cura: [
      "Transformação da força de vontade e autoconfiança",
      "Quebra de padrões de medo e的限制",
      "Ativação do poder pessoal e do brilho interior",
      "Combustão de energias estagnadas e negativas",
      "Manifestação de objetivos e desejos",
    ],
    chakra: "3º Plexo Solar",
    chakra_sanskrit: "Manipura",
    chakra_numero: 3,
    frequencia: 528,
    direcao: "Sul",
    estacao: "Verão",
    dinamica: "Queima transformadora de velhas limitações através da ressonância ígnea.",
  },
  YAM: {
    som: "YAM",
    pronunciacao: "yyahm (vibração no coração, som expansivo e libertador)",
    elemento: "Ar",
    elemento_en: "Air",
    propriedades_cura: [
      "Expansão do afeto incondicional e compaixão",
      "Harmonização de relacionamentos e conexões",
      "Libertação de mágoas e feridas emocionais",
      "Abertura para dar e receber amor",
      "Equilíbrio entre razão e emoção",
    ],
    chakra: "4º Cardíaco",
    chakra_sanskrit: "Anahata",
    chakra_numero: 4,
    frequencia: 639,
    direcao: "Leste",
    estacao: "Outono",
    dinamica: "Expansão ilimitada do coração através da ressonância aérea.",
  },
  HAM: {
    som: "HAM",
    pronunciacao: "hahm (vibração na garganta, som purificador e expressivo)",
    elemento: "Ar",
    elemento_en: "Air",
    propriedades_cura: [
      "Expressão da verdade interna e autenticidade",
      "Purificação da garganta e sistema respiratório",
      "Poder da palavra falada e escrita",
      "Libertação de medos de julgamento",
      "Abertura da criatividade e comunicação",
    ],
    chakra: "5º Laríngeo",
    chakra_sanskrit: "Vishuddha",
    chakra_numero: 5,
    frequencia: 741,
    direcao: "Leste",
    estacao: "Primavera",
    dinamica: "Purificação e expressão através da ressonância laríngea.",
  },
  OM: {
    som: "OM",
    pronunciacao: "oh-umm (som primordial, vibração em todo o corpo sutil)",
    elemento: "Éter",
    elemento_en: "Ether",
    propriedades_cura: [
      "Despertar da intuição profunda e sabedoria interior",
      "Dissolução de ilusões mentais e confusão",
      "Conexão com a consciência cósmica",
      "Expansão da percepção além do ego",
      "Silêncio interior e paz profunda",
    ],
    chakra: "6º Frontal",
    chakra_sanskrit: "Ajna",
    chakra_numero: 6,
    frequencia: 852,
    direcao: "Centro",
    estacao: "Todas",
    dinamica: "Abertura do terceiro olho através da ressonância etérea primordial.",
  },
  AUM: {
    som: "AUM",
    pronunciacao: "a-u-umm (tríade sonora sagrada, vibração no topo da cabeça)",
    elemento: "Éter",
    elemento_en: "Ether",
    propriedades_cura: [
      "Conexão espiritual direta com a Fonte",
      "Iluminação da mente através do silêncio",
      "Expansão da consciência além dos limites",
      "Integração dos corpos físico e espiritual",
      "Despertar da consciência universal",
    ],
    chakra: "7º Coronário",
    chakra_sanskrit: "Sahasrara",
    chakra_numero: 7,
    frequencia: 963,
    direcao: "Zênite",
    estacao: "Todas",
    dinamica: "Unificação da tríade sonora com o cosmos através da ressonância coronária.",
  },
};

/**
 * Retrieves the sound-element correlation mapping for a given sound
 * @param som - Sound identifier (e.g., "LAM", "OM", "AUM") or any case variation
 * @returns SoundElement mapping or undefined if not found
 */
export function getSoundElement(som: string): SoundElement | undefined {
  if (!som) return undefined;
  
  const upperSom = som.toUpperCase().trim();
  return SOUND_ELEMENTS[upperSom];
}

/**
 * Retrieves the element associated with a given sound/mantra
 * @param som - Sound identifier (e.g., "LAM", "VAM", "OM")
 * @returns Element name or undefined if not found
 */
export function getElementSound(som: string): string | undefined {
  const mapping = getSoundElement(som);
  return mapping?.elemento;
}

/**
 * Get all sound-element mappings
 * @returns Array of all SoundElement objects ordered by chakra number
 */
export function getAllSoundElements(): SoundElement[] {
  return Object.values(SOUND_ELEMENTS).sort((a, b) => a.chakra_numero - b.chakra_numero);
}

/**
 * Get all elements used in sound correlations
 * @returns Array of unique element names
 */
export function getAllElements(): string[] {
  const elements = new Set(Object.values(SOUND_ELEMENTS).map(s => s.elemento));
  return Array.from(elements).sort();
}

/**
 * Get all sounds mapped to a specific element
 * @param elemento - Element name (e.g., "Terra", "Água", "Fogo", "Ar", "Éter")
 * @returns Array of SoundElement objects for that element
 */
export function getSoundsByElement(elemento: string): SoundElement[] {
  if (!elemento) return [];
  
  const upperElemento = elemento.toLowerCase().trim();
  return Object.values(SOUND_ELEMENTS).filter(
    s => s.elemento.toLowerCase() === upperElemento
  ).sort((a, b) => a.chakra_numero - b.chakra_numero);
}

/**
 * Get the healing properties for a given sound/mantra
 * @param som - Sound identifier
 * @returns Array of healing properties or undefined if sound not found
 */
export function getHealingProperties(som: string): string[] | undefined {
  const mapping = getSoundElement(som);
  return mapping?.propriedades_cura;
}