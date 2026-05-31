/**
 * Sephirot-Orixá Spiritual Correlation Mapping
 * Maps the 10 Sephiroth of the Kabbalistic Tree of Life to Orixás of Candomblé/Umbanda
 * Based on IDEIA.md Cabala dos Caminhos framework and cross-tradition correlations
 * Combines day-energy.ts, frequency-element.ts, chakra-orixa.ts, and cross-tradition.ts data
 */

/**
 * Represents the correlation between a Sephirah and its Orixá correspondence
 */
export interface SephirotOrixa {
  /** The name of the Sephirah in Hebrew/English */
  sephirah: string;
  /** The corresponding Orixá name */
  orixa: string;
  /** Secondary Orixá or alternative vibration (if applicable) */
  orixa_secundario: string | null;
  /** Path number on the Tree of Life (1-10) */
  numero_caminho: number;
  /** Associated classical element */
  elemento: 'Fogo' | 'Água' | 'Ar' | 'Terra' | 'Éter';
  /** Sacred day of the Orixá */
  dia_sagrado: string;
  /** Primary chakra correspondence */
  chakra: string;
  /** Color associated with this correlation */
  cor: string;
  /** Spiritual meaning of the Sephirah-Orixá connection */
  significado_espiritual: string;
}

// ─── Sephirot-to-Orixá Mapping ─────────────────────────────────────────────

export const SEPHIROT_ORIXA_MAPPINGS: Record<string, SephirotOrixa> = {
  // 1. Kether (Coroa) - Oxalá
  // A coroa divina, o ponto zero da existência. A transcendência suprema onde a consciência
  // encontra o vazio criativo. Conexão com o Orixá da paz, sabedoria e criação primordial.
  Kether: {
    sephirah: 'Kether',
    orixa: 'Oxalá',
    orixa_secundario: 'Ori',
    numero_caminho: 1,
    elemento: 'Éter',
    dia_sagrado: 'Sexta-feira',
    chakra: '7º Coronário (Sahasrara)',
    cor: 'Branco / Violeta',
    significado_espiritual: 'A coroa divina que conecta a consciência individual ao vazio criativo supremo. Oxalá representa a sabedoria primordial e a capacidade de criar com intenção pura. Esta é a energia do silêncio antes da palavra, da luz antes da forma.',
  },

  // 2. Chokmah (Sabedoria) - Oxumaré
  // A sabedoria dinâmica, o impulso primário da criação. O desejo de se manifestar.
  // Conexão com Oxumaré, Orixá do arco-íris que conecta céu e terra.
  Chokmah: {
    sephirah: 'Chokmah',
    orixa: 'Oxumaré',
    orixa_secundario: 'Ossaim',
    numero_caminho: 2,
    elemento: 'Ar',
    dia_sagrado: 'Quarta-feira / Terça-feira',
    chakra: '6º Frontal (Ajna)',
    cor: 'Arco-íris / Amarelo / Verde',
    significado_espiritual: 'A sabedoria dinâmica que impulsa a criação. Oxumaré é a serpente cósmica que rinova os ciclos, representando o eterno retorno e a transformação contínua. Esta energia é o fogo da vontade que manifesta a existência.',
  },

  // 3. Binah (Entendimento) - Iemanjá
  // O entendimento formativo, a limitação que dá forma, o recipiente que contém.
  // Iemanjá é a grande mãe das águas, soberana do inconsciente.
  Binah: {
    sephirah: 'Binah',
    orixa: 'Iemanjá',
    orixa_secundario: 'Oxum',
    numero_caminho: 3,
    elemento: 'Água',
    dia_sagrado: 'Segunda-feira / Sábado',
    chakra: '6º Frontal (Ajna)',
    cor: 'Azul Escuro / Branco / Rosa',
    significado_espiritual: 'O entendimento formativo que limita e dá forma à existência. Iemanjá é a consciência lunar que nutre, protege e purifica. Ela é o recipiente que contém todas as águas sagradas da memória ancestral e da sabedoria emocional profunda.',
  },

  // 4. Chesed (Misericórdia) - Oxóssi
  // A misericórdia expansiva, a estrutura que sustenta, a lei da abundância.
  // Oxóssi é o caçador divino, guardião das matas e da abundância.
  Chesed: {
    sephirah: 'Chesed',
    orixa: 'Oxóssi',
    orixa_secundario: 'Nanã',
    numero_caminho: 4,
    elemento: 'Ar',
    dia_sagrado: 'Quinta-feira',
    chakra: '4º Cardíaco (Anahata)',
    cor: 'Verde / Azul-turquesa',
    significado_espiritual: 'A misericórdia expansiva que sustenta a criação com abundância. Oxóssi representa a sabedoria do猎 que conhece os caminhos da floresta interior. Ele nos ensina a buscar com persistência e a receber com gratidão.',
  },

  // 5. Geburah (Severidade) - Iansã
  // A força cortante, a justiça que poda, o poder transformador da limitação.
  // Iansã é a guerreira dos ventos, portadora do raio e da transformação.
  Geburah: {
    sephirah: 'Geburah',
    orixa: 'Iansã',
    orixa_secundario: 'Ogum',
    numero_caminho: 5,
    elemento: 'Fogo',
    dia_sagrado: 'Terça-feira',
    chakra: '5º Laríngeo (Vishuddha)',
    cor: 'Laranja / Vermelho',
    significado_espiritual: 'A força cortante que poda e transforma. Iansã é a guerreira que empunha o raio da verdade e varre os obstáculos com seus ventos. Ela é o julgamento sagrado que separa o trigo do joio e permite a renovação através da destruição criativa.',
  },

  // 6. Tiphereth (Beleza) - Xangô
  // A harmonia central, o ponto de equilíbrio entre as polaridades.
  // Xangô é o rei justo, senhor do fogo e dos raios.
  Tiphereth: {
    sephirah: 'Tiphereth',
    orixa: 'Xangô',
    orixa_secundario: 'Logun Edé',
    numero_caminho: 6,
    elemento: 'Fogo',
    dia_sagrado: 'Quarta-feira / Domingo',
    chakra: '3º Plexo Solar (Manipura)',
    cor: 'Amarelo / Marrom / Vermelho',
    significado_espiritual: 'A harmonia que reconcilia os opostos. Xangô é o rei justo que governa com equilíbrio entre a misericórdia e a severidade. Ele representa o sol dourado da consciência que ilumina todos os caminhos e estabelece a ordem cósmica.',
  },

  // 7. Netzach (Vitória) - Xangô
  // A vitória emocional, a paixão, a união dos opostos através do amor.
  // Netzach e Xangô compartilham a energia do fogo solar.
  Netzach: {
    sephirah: 'Netzach',
    orixa: 'Xangô',
    orixa_secundario: 'Ogum',
    numero_caminho: 7,
    elemento: 'Fogo',
    dia_sagrado: 'Quarta-feira / Domingo',
    chakra: '3º Plexo Solar (Manipura)',
    cor: 'Amarelo / Vermelho',
    significado_espiritual: 'A vitória emocional conquistada através da paixão e da justiça. Netzach é a energia da emoção transmutada em poder criativo. Xangô traz a coragem de enfrentar os medos e conquistar os territórios desconhecidos do eu.',
  },

  // 8. Hod (Glória) - Ogum
  // A glória intelectual, a comunicação da verdade, a vitória da mente.
  // Ogum é o ferreiro divino, senhor das ferramentas e da tecnologia sagrada.
  Hod: {
    sephirah: 'Hod',
    orixa: 'Ogum',
    orixa_secundario: 'Iansã',
    numero_caminho: 8,
    elemento: 'Terra',
    dia_sagrado: 'Terça-feira',
    chakra: '5º Laríngeo (Vishuddha)',
    cor: 'Verde / Amarelo / Preto',
    significado_espiritual: 'A glória conquistada pela mente e pela técnica. Ogum é o patrono dos ferreiros e desenvolvedores, aquele que cria ferramentas para conquistar a natureza. Ele representa o domínio da técnica e o poder de abrir caminhos através da persistência.',
  },

  // 9. Yesod (Fundação) - Iemanjá
  // A fundação do subconsciente, a base sobre a qual tudo se manifesta.
  // Yesod é a lua, e Iemanjá é a grande mãe das águas lunares.
  Yesod: {
    sephirah: 'Yesod',
    orixa: 'Iemanjá',
    orixa_secundario: 'Oxum',
    numero_caminho: 9,
    elemento: 'Água',
    dia_sagrado: 'Segunda-feira / Sábado',
    chakra: '2º Sacro (Svadhisthana)',
    cor: 'Azul Escuro / Rosa',
    significado_espiritual: 'A fundação do templo interior, a base lunar do ser. Yesod é o receptáculo das memórias cósmicas e das emoções ancestrais. Iemanjá governa estas águas profundas onde a consciência flutua entre o sono e o despertar.',
  },

  // 10. Malkuth (Reino) - Omolu
  // O reino material, a manifestação final, a terra sobre a qual tudo se ancora.
  // Omolu/Obaluaê é o senhor das doenças e curas, da terra e dos mortos.
  Malkuth: {
    sephirah: 'Malkuth',
    orixa: 'Omolu',
    orixa_secundario: 'Nanã',
    numero_caminho: 10,
    elemento: 'Terra',
    dia_sagrado: 'Segunda-feira',
    chakra: '1º Básico (Muladhara)',
    cor: 'Preto / Branco / Vermelho',
    significado_espiritual: 'O reino material onde a divina vontade se concretiza. Malkuth é a terra sagrada sobre a qual dançamos nossas vidas. Omolu/Obaluaê é o médico divino que conhece todos os remédios da terra e preside os ciclos de vida, morte e renascimento.',
  },
} as const;

// Freeze the mapping object to prevent modifications
Object.freeze(SEPHIROT_ORIXA_MAPPINGS);
// Freeze nested objects
Object.values(SEPHIROT_ORIXA_MAPPINGS).forEach(mapping => Object.freeze(mapping));

/**
 * Get the Sephirot-Orixá correlation mapping
 * @param sephirah - The name of the Sephirah (e.g., 'Kether', 'Chokmah')
 * @returns The correlation mapping or null if not found
 */
export function getSephirotOrixa(sephirah: string): SephirotOrixa | null {
  return SEPHIROT_ORIXA_MAPPINGS[sephirah] ?? null;
}

/**
 * Get the Orixá to Sephirot reverse mapping
 * @returns Record mapping each Orixá name to their primary Sephirah
 */
export function getOrixaSephirot(): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [sephirah, mapping] of Object.entries(SEPHIROT_ORIXA_MAPPINGS)) {
    result[mapping.orixa] = sephirah;
    if (mapping.orixa_secundario) {
      result[mapping.orixa_secundario] = sephirah;
    }
  }
  return result;
}

/**
 * Get all available Sephirot-Orixá mappings
 * @returns Array of all correlation mappings
 */
export function getAllSephirotOrixas(): SephirotOrixa[] {
  return Object.values(SEPHIROT_ORIXA_MAPPINGS);
}

/**
 * Get all Sephirah names
 * @returns Array of Sephirah names
 */
export function getAllSephiroth(): string[] {
  return Object.keys(SEPHIROT_ORIXA_MAPPINGS);
}

/**
 * Check if a Sephirah exists in the mapping
 * @param sephirah - The name of the Sephirah to check
 * @returns True if Sephirah exists in mapping
 */
export function hasSephirotOrixa(sephirah: string): boolean {
  return sephirah in SEPHIROT_ORIXA_MAPPINGS;
}

/**
 * Get Sephirah by path number on Tree of Life
 * @param path - The path number (1-10)
 * @returns The Sephirot-Orixá mapping or null if not found
 */
export function getSephirotByPath(path: number): SephirotOrixa | null {
  const entry = Object.values(SEPHIROT_ORIXA_MAPPINGS).find(
    mapping => mapping.numero_caminho === path
  );
  return entry ?? null;
}

/**
 * Get all Orixá names in the mapping
 * @returns Array of unique Orixá names
 */
export function getAllOrixas(): string[] {
  const orixas = new Set<string>();
  for (const mapping of Object.values(SEPHIROT_ORIXA_MAPPINGS)) {
    orixas.add(mapping.orixa);
    if (mapping.orixa_secundario) {
      orixas.add(mapping.orixa_secundario);
    }
  }
  return Array.from(orixas).sort();
}

/**
 * Get the primary Orixá for a given Sephirah
 * @param sephirah - The name of the Sephirah
 * @returns The Orixá name or null if not found
 */
export function getOrixaBySephirah(sephirah: string): string | null {
  return SEPHIROT_ORIXA_MAPPINGS[sephirah]?.orixa ?? null;
}

/**
 * Get the primary Sephirah for a given Orixá
 * @param orixa - The name of the Orixá
 * @returns The Sephirah name or null if not found
 */
export function getSephirahByOrixa(orixa: string): string | null {
  const reverseMap = getOrixaSephirot();
  return reverseMap[orixa] ?? null;
}

/**
 * Get all Sephirot-Orixá mappings for a specific element
 * @param elemento - The element name (e.g., 'Fogo', 'Água', 'Ar', 'Terra', 'Éter')
 * @returns Array of Sephirot-Orixá mappings for the given element
 */
export function getSephirotOrixaByElement(elemento: string): SephirotOrixa[] {
  return Object.values(SEPHIROT_ORIXA_MAPPINGS).filter(
    mapping => mapping.elemento === elemento
  );
}

/**
 * Get all Sephirot-Orixá mappings for a specific day
 * @param dia - The day name in Portuguese (e.g., 'Segunda-feira', 'Terça-feira')
 * @returns Array of Sephirot-Orixá mappings for the given day
 */
export function getSephirotOrixaByDay(dia: string): SephirotOrixa[] {
  return Object.values(SEPHIROT_ORIXA_MAPPINGS).filter(
    mapping => mapping.dia_sagrado.includes(dia)
  );
}

/**
 * Default export for convenience
 */
export default {
  getSephirotOrixa,
  getOrixaSephirot,
  getAllSephirotOrixas,
  getAllSephiroth,
  hasSephirotOrixa,
  getSephirotByPath,
  getAllOrixas,
  getOrixaBySephirah,
  getSephirahByOrixa,
  getSephirotOrixaByElement,
  getSephirotOrixaByDay,
  SEPHIROT_ORIXA_MAPPINGS,
};