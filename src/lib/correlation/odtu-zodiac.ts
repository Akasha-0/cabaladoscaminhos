/**
 * Odú-Ifá Zodíaco Correlation Module
 * Direct mappings of the 16 Odú Ifá (Merindilogun) to their corresponding Zodiac signs
 * With spiritual meaning for divination and astrological interpretation
 */

export type ZodiacSign =
  | 'Áries'
  | 'Touro'
  | 'Gêmeos'
  | 'Câncer'
  | 'Leão'
  | 'Virgem'
  | 'Libra'
  | 'Escorpião'
  | 'Sagitário'
  | 'Capricórnio'
  | 'Aquário'
  | 'Peixes';

export type ElementType = 'fogo' | 'água' | 'ar' | 'terra';

export interface OdTuZodiac {
  /** Odu number (1-16) */
  odu_numero: number;
  /** Odu name in Portuguese */
  odu_nome: string;
  /** Odu name in Yoruba */
  odu_nome_yoruba: string;
  /** Corresponding Zodiac sign */
  signo: ZodiacSign;
  /** Primary element */
  elemento: ElementType;
  /** Spiritual meaning for divination */
  significado_espiritual: string;
  /** Key spiritual message */
  mensagem_central: string;
}

// ─── Odú Ifá-to-Zodiac Mapping (Merindilogun 1-16) ────────────────────────────

export const ODTU_ZODIAC_MAPPINGS: Record<number, OdTuZodiac> = {
  1: {
    odu_numero: 1,
    odu_nome: 'Okaran',
    odu_nome_yoruba: 'Okànràn',
    signo: 'Áries',
    elemento: 'fogo',
    significado_espiritual: 'Coragem, recomeço, pioneirismo. Odu do líder que abre caminhos e da chama que acende novas jornadas.',
    mensagem_central: 'A coragem move montanhas. Okaran traz a força do fogo para iniciar.',
  },

  2: {
    odu_numero: 2,
    odu_nome: 'Ejiokô',
    odu_nome_yoruba: 'Ejìokò',
    signo: 'Touro',
    elemento: 'terra',
    significado_espiritual: 'Estabilidade, valor, escolha consciente. Revela a necessidade de construir sobre fundamentos sólidos.',
    mensagem_central: 'Escolhas importantes pedem firmeza. Ejiokô orienta decisões com persistência.',
  },

  3: {
    odu_numero: 3,
    odu_nome: 'Etaogundá',
    odu_nome_yoruba: 'Ẹtaọgúndá',
    signo: 'Gêmeos',
    elemento: 'ar',
    significado_espiritual: 'Comunicação, dualidade, transformação. Reflete a natureza mutável e a capacidade de adaptar-se.',
    mensagem_central: 'A fluidez entre opostos traz sabedoria. Etaogundá abre portas da comunicação.',
  },

  4: {
    odu_numero: 4,
    odu_nome: 'Irosun',
    odu_nome_yoruba: 'Ìrosùn',
    signo: 'Câncer',
    elemento: 'água',
    significado_espiritual: 'Intuição lunar, emoções profundas, proteção. Revela verdades ocultas e a sabedoria do inconsciente.',
    mensagem_central: 'Confie na voz interior. Irosun conecta com a memória ancestral.',
  },

  5: {
    odu_numero: 5,
    odu_nome: 'Oxé',
    odu_nome_yoruba: 'Ọ̀sà',
    signo: 'Leão',
    elemento: 'fogo',
    significado_espiritual: 'Poder pessoal, criatividade, realeza interior. Ação decisiva que transforma realidades.',
    mensagem_central: 'O fogo do destino brilha em ti. Oxé desperta a força criadora.',
  },

  6: {
    odu_numero: 6,
    odu_nome: 'Obará',
    odu_nome_yoruba: 'Ọbàlúayé',
    signo: 'Virgem',
    elemento: 'terra',
    significado_espiritual: 'Purificação, serviço, análise. Transformação através da cura e do discernimento preciso.',
    mensagem_central: 'A purificação traz restauração. Obará limpa e transforma.',
  },

  7: {
    odu_numero: 7,
    odu_nome: 'Odi',
    odu_nome_yoruba: 'Òdí',
    signo: 'Libra',
    elemento: 'ar',
    significado_espiritual: 'Harmonia, equilíbrio, destino. Padrões ocultos que direcionam relacionamentos e escolhas.',
    mensagem_central: 'O equilíbrio revela o caminho. Odi traz justiça aos destinos.',
  },

  8: {
    odu_numero: 8,
    odu_nome: 'Ejionlá',
    odu_nome_yoruba: 'Ejìọnlá',
    signo: 'Escorpião',
    elemento: 'água',
    significado_espiritual: 'Transformação profunda, regeneração, mistério. Morte e renascimento espiritual.',
    mensagem_central: 'Das cinzas surge a força. Ejionlá desperta o poder transformador.',
  },

  9: {
    odu_numero: 9,
    odu_nome: 'Oshe',
    odu_nome_yoruba: 'Ọ̀shẹ́',
    signo: 'Sagitário',
    elemento: 'fogo',
    significado_espiritual: 'Expansão, fé, aventura espiritual. Busca por significado e conexão com o divino.',
    mensagem_central: 'O conhecimento ilumina a jornada. Oshe expande horizontes.',
  },

  10: {
    odu_numero: 10,
    odu_nome: 'Ofun',
    odu_nome_yoruba: 'Ọ̀fún',
    signo: 'Capricórnio',
    elemento: 'terra',
    significado_espiritual: 'Disciplina, paciência, conquistas materiais. Sabedoria conquistada através da perseverança.',
    mensagem_central: 'A paciência constrói impérios. Ofun traz realizações duradouras.',
  },

  11: {
    odu_numero: 11,
    odu_nome: 'Eyonla',
    odu_nome_yoruba: 'Èyọ́nlá',
    signo: 'Aquário',
    elemento: 'ar',
    significado_espiritual: 'Inovação, humanitarianismo, sabedoria libertária. Visão que transcende convenções.',
    mensagem_central: 'A sabedoria libertária transforma. Eyonla abre a mente para o novo.',
  },

  12: {
    odu_numero: 12,
    odu_nome: 'Merinla',
    odu_nome_yoruba: 'Mẹ̀rìnlá',
    signo: 'Peixes',
    elemento: 'água',
    significado_espiritual: 'Unidade cósmica, sacrifício, compaixão infinita. Dissolução de fronteiras entre self e universo.',
    mensagem_central: 'A compaixão une todos os seres. Merinla dissolve o véu entre dimensões.',
  },

  13: {
    odu_numero: 13,
    odu_nome: 'Mero',
    odu_nome_yoruba: 'Mẹ̀rọ̀',
    signo: 'Áries',
    elemento: 'fogo',
    significado_espiritual: 'Descoberta, tesouros ocultos, revelação. Prosperidade que surge do inesperado e da coragem.',
    mensagem_central: 'Tesouros escondidos esperam coragem. Mero revela a riqueza do caminho.',
  },

  14: {
    odu_numero: 14,
    odu_nome: 'Jinza',
    odu_nome_yoruba: 'Jìnza',
    signo: 'Touro',
    elemento: 'terra',
    significado_espiritual: 'Força interior, proteção, vitória. Batalha espiritual ganha através da determinação inabalável.',
    mensagem_central: 'A determinação vence obstáculos. Jinza traz a força do guerreiro.',
  },

  15: {
    odu_numero: 15,
    odu_nome: 'Jotagbe',
    odu_nome_yoruba: 'Jọ́tágbè',
    signo: 'Gêmeos',
    elemento: 'ar',
    significado_espiritual: 'Comunicação ancestral, linhagem espiritual. Conexão entre passado e presente através da palavra sagrada.',
    mensagem_central: 'A ancestralidade fala através de ti. Jotagbe abre canais de sabedoria.',
  },

  16: {
    odu_numero: 16,
    odu_nome: 'Otura',
    odu_nome_yoruba: 'Òtúrá',
    signo: 'Câncer',
    elemento: 'água',
    significado_espiritual: 'Jornada, destino, caminho revelado. O destino se forma a cada passo da jornada.',
    mensagem_central: 'O caminho se revela na caminhada. Otura orienta a jornada do destino.',
  },
};

Object.freeze(ODTU_ZODIAC_MAPPINGS);

// ─── Lookup Functions ─────────────────────────────────────────────────────────

/**
 * Get Odu-Ifá Zodiac correlation mapping
 * @param odu - Odu number (1-16) or name
 * @returns OdTuZodiac mapping or null if not found
 */
export function getOduZodiac(odu: number | string): OdTuZodiac | null {
  if (typeof odu === 'number') {
    if (odu >= 1 && odu <= 16) return ODTU_ZODIAC_MAPPINGS[odu] ?? null;
    return null;
  }
  const normalizedInput = odu.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const parsed = parseInt(normalizedInput, 10);
  if (!isNaN(parsed) && parsed >= 1 && parsed <= 16) return ODTU_ZODIAC_MAPPINGS[parsed] ?? null;
  for (const mapping of Object.values(ODTU_ZODIAC_MAPPINGS)) {
    const nomePT = mapping.odu_nome.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const nomeYoruba = mapping.odu_nome_yoruba.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (nomePT.includes(normalizedInput) || nomeYoruba.includes(normalizedInput)) return mapping;
  }
  return null;
}

/**
 * Get all Odu-Ifá Zodiac mappings
 * @returns Array of all mappings sorted by Odu number
 */
export function getAllOduZodiacs(): OdTuZodiac[] {
  return Object.values(ODTU_ZODIAC_MAPPINGS).sort((a, b) => a.odu_numero - b.odu_numero);
}

/**
 * Get all Odu numbers (1-16)
 * @returns Array of Odu numbers
 */
export function getAllOduNumbers(): number[] {
  return Object.keys(ODTU_ZODIAC_MAPPINGS).map(Number).sort((a, b) => a - b);
}

/**
 * Get all Odu names in Portuguese
 * @returns Array of Odu names
 */
export function getAllOduNames(): string[] {
  return Object.values(ODTU_ZODIAC_MAPPINGS).map((m) => m.odu_nome).sort((a, b) => a.localeCompare(b, 'pt-BR'));
}

/**
 * Get all unique Zodiac sign names
 * @returns Array of Zodiac signs (deduplicated)
 */
export function getAllZodiacSigns(): ZodiacSign[] {
  const signs = new Set<ZodiacSign>();
  Object.values(ODTU_ZODIAC_MAPPINGS).forEach((m) => { signs.add(m.signo); });
  return Array.from(signs);
}

/**
 * Get Odús by element
 * @param elemento - Element type
 * @returns Array of OdTuZodiac mappings for that element
 */
export function getOduByElement(elemento: ElementType): OdTuZodiac[] {
  return Object.values(ODTU_ZODIAC_MAPPINGS)
    .filter((m) => m.elemento === elemento)
    .sort((a, b) => a.odu_numero - b.odu_numero);
}

/**
 * Get Odús by Zodiac sign
 * @param signo - Zodiac sign name (case-insensitive)
 * @returns Array of OdTuZodiac mappings for that sign
 */
export function getZodiacOdu(signo: string): OdTuZodiac[] {
  const normalized = signo.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return Object.values(ODTU_ZODIAC_MAPPINGS)
    .filter((m) => m.signo.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') === normalized)
    .sort((a, b) => a.odu_numero - b.odu_numero);
}

/**
 * Check if an Odu number exists
 * @param oduNumero - Odu number to check
 * @returns True if Odu exists in mapping
 */
export function hasOduZodiac(oduNumero: number): boolean {
  return oduNumero in ODTU_ZODIAC_MAPPINGS;
}

/**
 * Get the Zodiac sign for a given Odu number
 * @param oduNumero - Odu number (1-16)
 * @returns Zodiac sign or null if not found
 */
export function getOduZodiacSign(oduNumero: number): ZodiacSign | null {
  return ODTU_ZODIAC_MAPPINGS[oduNumero]?.signo ?? null;
}

/**
 * Get the element for a given Odu number
 * @param oduNumero - Odu number (1-16)
 * @returns Element type or null if not found
 */
export function getOduElement(oduNumero: number): ElementType | null {
  return ODTU_ZODIAC_MAPPINGS[oduNumero]?.elemento ?? null;
}

/**
 * Get the spiritual message for a given Odu
 * @param oduNumero - Odu number (1-16)
 * @returns Spiritual message or null if not found
 */
export function getOduMessage(oduNumero: number): string | null {
  return ODTU_ZODIAC_MAPPINGS[oduNumero]?.mensagem_central ?? null;
}

// ─── Default Export ───────────────────────────────────────────────────────────

export default {
  getOduZodiac,
  getZodiacOdu,
  getAllOduZodiacs,
  getAllOduNumbers,
  getAllOduNames,
  getAllZodiacSigns,
  getOduByElement,
  hasOduZodiac,
  getOduZodiacSign,
  getOduElement,
  getOduMessage,
};
