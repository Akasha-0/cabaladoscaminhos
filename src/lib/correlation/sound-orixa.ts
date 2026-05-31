/**
 * Sound-Orixá Spiritual Correlation Module
 * Maps sacred sounds, mantras, and seed syllables to Orixás of Candomblé/Umbanda
 * Based on Solfeggio frequencies and the Cabala dos Caminhos system.
 * Each sound carries the vibrational signature of its corresponding Orixá.
 */

/**
 * Represents the correlation between a sacred sound/mantra and its Orixá correspondence
 */
export interface SoundOrixa {
  /** Sound or mantra identifier (e.g., "LAM", "OM", "AUM") */
  som: string;
  /** Sound pronunciation guide */
  pronunciacao: string;
  /** Primary Orixá name */
  orixa: string;
  /** Secondary Orixá (if applicable) */
  orixa_secundario?: string;
  /** Solfeggio frequency in Hz */
  frequencia: number;
  /** Element associated with this sound-Orixá */
  elemento: string;
  /** Chakra correspondence */
  chakra: string;
  /** Chakra number (1-7) */
  chakra_numero: number;
  /** Healing properties and spiritual benefits */
  propriedades: string[];
  /** Yoruba affirmation or prayer */
  oracao_yoruba: string;
  /** Day of week associated */
  dia_semana: string;
  /** Color correspondence */
  cor: string;
  /** Ritual tool or offering */
  ferramenta_ritual: string;
}

/**
 * Complete mapping of sacred sounds to their Orixá correspondences.
 * Based on the Solfeggio frequencies and Candomblé/Umbanda traditions.
 * Each sound carries the vibrational signature of its corresponding Orixá.
 */
export const SOUND_ORIXA_MAP: Record<string, SoundOrixa> = {
  LAM: {
    som: 'LAM',
    pronunciacao: 'lahm (vibração na base da coluna, som grave e ancorante)',
    orixa: 'Oxalufã',
    orixa_secundario: 'Omulu',
    frequencia: 396,
    elemento: 'Terra',
    chakra: '1º Básico (Muladhara)',
    chakra_numero: 1,
    propriedades: [
      'Dissolução de medos de sobrevivência e escassez',
      'Ancoramento energético e estabilidade física',
      'Conexão com ancestrais e a terra',
      'Fortalecimento da vontade de viver',
      'Proteção contra energias densas',
    ],
    oracao_yoruba: 'Oxalufã / Obaluayê, dá-me firmeza e proteção',
    dia_semana: 'Segunda-feira',
    cor: 'Branco',
    ferramenta_ritual: 'Al Guidanceê (cabaça)',
  },
  VAM: {
    som: 'VAM',
    pronunciacao: 'vahm (vibração no baixo ventre, som fluido e purificador)',
    orixa: 'Oxum',
    orixa_secundario: 'Iemanjá',
    frequencia: 417,
    elemento: 'Água',
    chakra: '2º Sacro (Svadhisthana)',
    chakra_numero: 2,
    propriedades: [
      'Limpeza de traumas emocionais do passado',
      'Transmutação de energias criativas bloqueadas',
      'Fluidez vital e harmonia nas relações',
      'Dissolução de ressentimentos e mágoas',
      'Purificação do campo emocional',
    ],
    oracao_yoruba: 'Oxum, abre as águas da prosperidade em minha vida',
    dia_semana: 'Sábado',
    cor: 'Amarelo-dourado',
    ferramenta_ritual: 'Espelho, flores amarelas, mel',
  },
  RAM: {
    som: 'RAM',
    pronunciacao: 'rahm (vibração no plexo solar, som ardente e transformador)',
    orixa: 'Xangô',
    orixa_secundario: 'Logun Ede',
    frequencia: 528,
    elemento: 'Fogo',
    chakra: '3º Plexo Solar (Manipura)',
    chakra_numero: 3,
    propriedades: [
      'Transformação da força de vontade e autoconfiança',
      'Quebra de padrões de medo e limitações',
      'Ativação do poder pessoal e do brilho interior',
      'Combustão de energias estagnadas e negativas',
      'Manifestação de objetivos e desejos',
    ],
    oracao_yoruba: 'Xangô, concede-me a força da justiça e do equilíbrio',
    dia_semana: 'Quarta-feira',
    cor: 'Vermelho',
    ferramenta_ritual: 'Oxê (Machado de dois Bost), pedras de raio',
  },
  YAM: {
    som: 'YAM',
    pronunciacao: 'yyahm (vibração no coração, som expansivo e libertador)',
    orixa: 'Oxóssi',
    orixa_secundario: 'Nanã Buruquá',
    frequencia: 639,
    elemento: 'Ar',
    chakra: '4º Cardíaco (Anahata)',
    chakra_numero: 4,
    propriedades: [
      'Expansão do afeto incondicional e compaixão',
      'Harmonização de relacionamentos e conexões',
      'Libertação de mágoas e feridas emocionais',
      'Abertura para dar e receber amor',
      'Equilíbrio entre razão e emoção',
    ],
    oracao_yoruba: 'Oxóssi, guia-me pela trilha da sabedoria',
    dia_semana: 'Terça-feira',
    cor: 'Verde',
    ferramenta_ritual: 'Arco e flecha, cabaça, ervas de mato',
  },
  HAM: {
    som: 'HAM',
    pronunciacao: 'hahm (vibração na garganta, som purificador e expressivo)',
    orixa: 'Iansã',
    orixa_secundario: 'Obá',
    frequencia: 741,
    elemento: 'Ar',
    chakra: '5º Laríngeo (Vishuddha)',
    chakra_numero: 5,
    propriedades: [
      'Expressão da verdade interna e autenticidade',
      'Purificação da garganta e sistema respiratório',
      'Poder da palavra falada e escrita',
      'Libertação de medos de julgamento',
      'Abertura da criatividade e comunicação',
    ],
    oracao_yoruba: 'Iansã, dá-me coragem para transformação',
    dia_semana: 'Quarta-feira',
    cor: 'Laranja',
    ferramenta_ritual: 'Eruexim (chicote), espada, fogo',
  },
  OM: {
    som: 'OM',
    pronunciacao: 'oh-umm (som primordial, vibração em todo o corpo sutil)',
    orixa: 'Oxumaré',
    orixa_secundario: 'Ossaim',
    frequencia: 852,
    elemento: 'Éter',
    chakra: '6º Frontal (Ajna)',
    chakra_numero: 6,
    propriedades: [
      'Despertar da intuição profunda e sabedoria interior',
      'Dissolução de ilusões mentais e confusão',
      'Conexão com a consciência cósmica',
      'Expansão da percepção além do ego',
      'Silêncio interior e paz profunda',
    ],
    oracao_yoruba: 'Oxumaré, completa o ciclo da minha transformação',
    dia_semana: 'Domingo',
    cor: 'Arco-íris',
    ferramenta_ritual: 'Cobra de madeira, jimboa (serpente)',
  },
  AUM: {
    som: 'AUM',
    pronunciacao: 'a-u-umm (tríade sonora sagrada, vibração no topo da cabeça)',
    orixa: 'Ori',
    orixa_secundario: 'Olokun',
    frequencia: 963,
    elemento: 'Éter',
    chakra: '7º Coronário (Sahasrara)',
    chakra_numero: 7,
    propriedades: [
      'Conexão espiritual direta com a Fonte',
      'Iluminação da mente através do silêncio',
      'Expansão da consciência além dos limites',
      'Integração dos corpos físico e espiritual',
      'Despertar da consciência universal',
    ],
    oracao_yoruba: 'Ori mi, que minha cabeça seja iluminada pela verdade',
    dia_semana: 'Domingo',
    cor: 'Branco-dourado',
    ferramenta_ritual: 'Pranche (prancha), coco, água do mar',
  },
};

/**
 * Freeze the mapping object to prevent modifications
 */
Object.freeze(SOUND_ORIXA_MAP);
Object.values(SOUND_ORIXA_MAP).forEach((mapping) => Object.freeze(mapping));

/**
 * Retrieves the sound-Orixá correlation mapping for a given sound
 * @param som - Sound identifier (e.g., "LAM", "OM", "AUM") or any case variation
 * @returns SoundOrixa mapping or undefined if not found
 */
export function getSoundOrixa(som: string): SoundOrixa | undefined {
  if (!som) return undefined;

  const upperSom = som.toUpperCase().trim();
  return SOUND_ORIXA_MAP[upperSom];
}

/**
 * Retrieves the Orixá associated with a given sound/mantra
 * @param som - Sound identifier (e.g., "LAM", "VAM", "OM")
 * @returns Orixá name or undefined if not found
 */
export function getOrixaSound(som: string): string | undefined {
  const mapping = getSoundOrixa(som);
  return mapping?.orixa;
}

/**
 * Get all sound-Orixá mappings
 * @returns Array of all SoundOrixa objects ordered by chakra number
 */
export function getAllSoundOrixas(): SoundOrixa[] {
  return Object.values(SOUND_ORIXA_MAP).sort((a, b) => a.chakra_numero - b.chakra_numero);
}

/**
 * Get all sounds mapped to a specific Orixá
 * @param orixa - Orixá name (case-insensitive)
 * @returns Array of SoundOrixa objects for that Orixá
 */
export function getSoundsByOrixa(orixa: string): SoundOrixa[] {
  if (!orixa) return [];

  const normalizedOrixa = orixa.trim().toLowerCase();
  return Object.values(SOUND_ORIXA_MAP).filter(
    (mapping) =>
      mapping.orixa.toLowerCase() === normalizedOrixa ||
      mapping.orixa_secundario?.toLowerCase() === normalizedOrixa
  );
}

/**
 * Get all sounds mapped to a specific element
 * @param elemento - Element name (e.g., "Terra", "Água", "Fogo", "Ar", "Éter")
 * @returns Array of SoundOrixa objects for that element
 */
export function getSoundsByElement(elemento: string): SoundOrixa[] {
  if (!elemento) return [];

  const upperElemento = elemento.toLowerCase().trim();
  return Object.values(SOUND_ORIXA_MAP).filter(
    (mapping) => mapping.elemento.toLowerCase() === upperElemento
  );
}

/**
 * Get the healing properties for a given sound/mantra
 * @param som - Sound identifier
 * @returns Array of healing properties or undefined if sound not found
 */
export function getSoundProperties(som: string): string[] | undefined {
  const mapping = getSoundOrixa(som);
  return mapping?.propriedades;
}

/**
 * Get the frequency for a given sound/mantra
 * @param som - Sound identifier
 * @returns Frequency in Hz or undefined if sound not found
 */
export function getSoundFrequency(som: string): number | undefined {
  const mapping = getSoundOrixa(som);
  return mapping?.frequencia;
}

/**
 * Get all registered Orixá names
 * @returns Array of unique Orixá names
 */
export function getAllOrixas(): string[] {
  const orixas = new Set(
    Object.values(SOUND_ORIXA_MAP).flatMap((mapping) => {
      const names = [mapping.orixa];
      if (mapping.orixa_secundario) names.push(mapping.orixa_secundario);
      return names;
    })
  );
  return Array.from(orixas).sort();
}

/**
 * Get the Yoruba prayer for a given sound/mantra
 * @param som - Sound identifier
 * @returns Prayer string or undefined if sound not found
 */
export function getSoundPrayer(som: string): string | undefined {
  const mapping = getSoundOrixa(som);
  return mapping?.oracao_yoruba;
}

/**
 * Get the color for a given sound/mantra
 * @param som - Sound identifier
 * @returns Color string or undefined if sound not found
 */
export function getSoundColor(som: string): string | undefined {
  const mapping = getSoundOrixa(som);
  return mapping?.cor;
}

/**
 * Get the chakra for a given sound/mantra
 * @param som - Sound identifier
 * @returns Chakra name or undefined if sound not found
 */
export function getSoundChakra(som: string): string | undefined {
  const mapping = getSoundOrixa(som);
  return mapping?.chakra;
}