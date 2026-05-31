/**
 * Odú-Ifá Solfeggio Frequency Correlation Module
 * Direct mappings of the 16 Odú Ifá (Merindilogun) to Solfeggio frequencies
 * With spiritual meaning for sound healing and ritual practice
 */

// ─── Type Definitions ────────────────────────────────────────────────────────

export type ElementType = 'fogo' | 'água' | 'ar' | 'terra' | 'éter';

export interface OdTuFrequency {
  /** Odu number (1-16) */
  odu_numero: number;
  /** Odu name in Portuguese */
  odu_nome: string;
  /** Odu name in Yoruba */
  odu_nome_yoruba: string;
  /** Primary Solfeggio frequency in Hz */
  frequencia: number;
  /** Alternative Solfeggio frequency */
  frequencia_alternativa?: number;
  /** Primary element */
  elemento: ElementType;
  /** Spiritual meaning for sound healing */
  significado_healing: string;
  /** Key spiritual message */
  mensagem_central: string;
  /** Associated colors */
  cores: string[];
  /** Sacred days */
  dias_sagrados: string[];
  /** Healing applications */
  aplicacoes_healing: string[];
}

// ─── Solfeggio Frequencies ────────────────────────────────────────────────────

/** All 9 Solfeggio frequencies in ascending order */
export const SOLFEGGIO_FREQUENCIES: readonly number[] = Object.freeze([174, 285, 396, 417, 528, 639, 741, 852, 963]);

// ─── Odú Ifá-to-Frequency Mapping (Merindilogun 1-16) ────────────────────────

export const ODTU_FREQUENCY_MAPPINGS: Record<number, OdTuFrequency> = {
  // ─── 1: Okaran (Okànràn) ───────────────────────────────────────────────────
  1: {
    odu_numero: 1,
    odu_nome: 'Okaran',
    odu_nome_yoruba: 'Okànràn',
    frequencia: 174,
    frequencia_alternativa: 963,
    elemento: 'éter',
    significado_healing: 'Fundação e estruturação. Esta frequência cria a base para todo trabalho de cura, estabelecendo o ancoramento necessário para transformações espirituais profundas.',
    mensagem_central: 'Todo começo exige raízes firmes. 174 Hz ancora seu espírito na terra enquanto abre caminho para o divino.',
    cores: ['branco', 'ouro'],
    dias_sagrados: ['Segunda-feira', 'Domingo'],
    aplicacoes_healing: ['Ancoramento', 'Fundação espiritual', 'Preparação para cura', 'Estabilização energética'],
  },

  // ─── 2: Ejiokô ─────────────────────────────────────────────────────────────
  2: {
    odu_numero: 2,
    odu_nome: 'Ejiokô',
    odu_nome_yoruba: 'Ejìokò',
    frequencia: 285,
    elemento: 'água',
    significado_healing: 'Nurturing e expansão do campo energético. Esta frequência expande suavemente a aura, criando espaço para cura e crescimento espiritual.',
    mensagem_central: 'A expansão gentil permite que a abundância flua. 285 Hz nutre seu campo energético.',
    cores: ['amarelo', 'dourado'],
    dias_sagrados: ['Sábado'],
    aplicacoes_healing: ['Expansão do campo áurico', 'Nurturing energético', 'Crescimento espiritual', 'Aceitação'],
  },

  // ─── 3: Etaogundá ──────────────────────────────────────────────────────────
  3: {
    odu_numero: 3,
    odu_nome: 'Etaogundá',
    odu_nome_yoruba: 'Ẹtaọgúndá',
    frequencia: 396,
    frequencia_alternativa: 528,
    elemento: 'fogo',
    significado_healing: 'Libertação de traumas e medos fundamentais. Esta frequência profunda libera padrões de culpa e medo que impedem a evolução espiritual.',
    mensagem_central: 'Libertação dos medos ancestrais abre espaço para a verdade. 396 Hz quebra correntes do passado.',
    cores: ['azul', 'branco'],
    dias_sagrados: ['Segunda-feira', 'Domingo'],
    aplicacoes_healing: ['Libertação de medos', 'Transmutação de traumas', 'Limpeza de culpa', 'Renovação interior'],
  },

  // ─── 4: Irosun ─────────────────────────────────────────────────────────────
  4: {
    odu_numero: 4,
    odu_nome: 'Irosun',
    odu_nome_yoruba: 'Ìrosùn',
    frequencia: 417,
    elemento: 'água',
    significado_healing: 'Facilitação de mudanças e transformação de situações bloqueadas. Esta frequência remove obstáculos e permite que o impossível se torne possível.',
    mensagem_central: 'A transformação está ao seu alcance quando você permite. 417 Hz facilita mudanças impossíveis.',
    cores: ['amarelo', 'azul celeste'],
    dias_sagrados: ['Sábado'],
    aplicacoes_healing: ['Facilitação de mudanças', 'Remoção de obstáculos', 'Transformação situacional', 'Possibilidade'],
  },

  // ─── 5: Oxé ────────────────────────────────────────────────────────────────
  5: {
    odu_numero: 5,
    odu_nome: 'Oxé',
    odu_nome_yoruba: 'Ọ̀sà',
    frequencia: 528,
    frequencia_alternativa: 639,
    elemento: 'fogo',
    significado_healing: 'Frequência dos milagres e reparação do DNA. Conhecida como a Frequência do Amor, traz transformação profunda e cura de-level molecular.',
    mensagem_central: 'O amor é a frequência mais alta. 528 Hz repara, transforma e traz milagres.',
    cores: ['vermelho', 'preto'],
    dias_sagrados: ['Terça-feira'],
    aplicacoes_healing: ['Milagres', 'Reparação do DNA', 'Cura do amor', 'Transformação profunda', 'Justiça cósmica'],
  },

  // ─── 6: Obará ───────────────────────────────────────────────────────────────
  6: {
    odu_numero: 6,
    odu_nome: 'Obará',
    odu_nome_yoruba: 'Ọbàlúayé',
    frequencia: 639,
    elemento: 'terra',
    significado_healing: 'Harmonização de relacionamentos e restauração do equilíbrio. Esta frequência traz harmonia onde há dissonância e reconciliação onde há separação.',
    mensagem_central: 'A harmonia se constrói com pacientes ajustes. 639 Hz reconcilia e harmoniza.',
    cores: ['branco', 'marrom'],
    dias_sagrados: ['Segunda-feira', 'Domingo'],
    aplicacoes_healing: ['Harmonização de relacionamentos', 'Reconciliação', 'Equilíbrio', 'Conexão com a terra'],
  },

  // ─── 7: Odi ────────────────────────────────────────────────────────────────
  7: {
    odu_numero: 7,
    odu_nome: 'Odi',
    odu_nome_yoruba: 'Òdí',
    frequencia: 741,
    frequencia_alternativa: 417,
    elemento: 'água',
    significado_healing: 'Despertar da expressão e purificação através da frequência correta. Esta frequência desperta a voz interior e purifica canais de comunicação espiritual.',
    mensagem_central: 'Expresse sua verdade com clareza. 741 Hz desperta expressão e purifica comunicação.',
    cores: ['azul', 'branco'],
    dias_sagrados: ['Segunda-feira', 'Domingo'],
    aplicacoes_healing: ['Despertar da expressão', 'Purificação vocal', 'Comunicação espiritual', 'Intuição'],
  },

  // ─── 8: Ejionlá ─────────────────────────────────────────────────────────────
  8: {
    odu_numero: 8,
    odu_nome: 'Ejionlá',
    odu_nome_yoruba: 'Ejìọnlá',
    frequencia: 852,
    frequencia_alternativa: 741,
    elemento: 'água',
    significado_healing: 'Despertar da claridade mental e acesso ao terceiro olho. Esta frequência desperta a sabedoria interior e fortalece a visão espiritual.',
    mensagem_central: 'A sabedoria se revela quando você abre os olhos internos. 852 Hz desperta o terceiro olho.',
    cores: ['verde', 'amarelo'],
    dias_sagrados: ['Sábado'],
    aplicacoes_healing: ['Despertar do terceiro olho', 'Claridade mental', 'Visão espiritual', 'Sabedoria interior'],
  },

  // ─── 9: Oshe ───────────────────────────────────────────────────────────────
  9: {
    odu_numero: 9,
    odu_nome: 'Oshe',
    odu_nome_yoruba: 'Ọ̀shẹ́',
    frequencia: 963,
    frequencia_alternativa: 852,
    elemento: 'éter',
    significado_healing: 'Conexão com o divino e iluminação completa. Esta frequência de nível mais alto desperta a consciência cósmica e a unidade com o Criador.',
    mensagem_central: 'A iluminação aguarda sua decisão de buscar. 963 Hz conecta com o divino supremo.',
    cores: ['azul', 'verde'],
    dias_sagrados: ['Segunda-feira', 'Domingo'],
    aplicacoes_healing: ['Iluminação divina', 'Consciência cósmica', 'Conexão com o Criador', 'Unidade espiritual'],
  },

  // ─── 10: Ofun ───────────────────────────────────────────────────────────────
  10: {
    odu_numero: 10,
    odu_nome: 'Ofun',
    odu_nome_yoruba: 'Ọ̀fún',
    frequencia: 396,
    frequencia_alternativa: 174,
    elemento: 'éter',
    significado_healing: 'Sabedoria do silêncio e verdade revelada no tempo certo. Esta frequência trabalha com o tempo espiritual, revelando verdades quando é hora.',
    mensagem_central: 'O silêncio é a voz mais alta do espírito. 396 Hz revela verdades no tempo divino.',
    cores: ['branco', 'cinza'],
    dias_sagrados: ['Segunda-feira', 'Domingo'],
    aplicacoes_healing: ['Sabedoria do silêncio', 'Revelação temporal', 'Paciência sagrada', 'Verdade'],
  },

  // ─── 11: Eyonla ─────────────────────────────────────────────────────────────
  11: {
    odu_numero: 11,
    odu_nome: 'Eyonla',
    odu_nome_yoruba: 'Èyọ́nlá',
    frequencia: 528,
    frequencia_alternativa: 285,
    elemento: 'terra',
    significado_healing: 'Sabedoria anciã e tecnologias espirituais de cura. Esta frequência carrega a sabedoria dos ancestrais para aplicação em cura moderna.',
    mensagem_central: 'A sabedoria dos anciões se torna acessível a você. 528 Hz canaliza conhecimento ancestral.',
    cores: ['roxo', 'marrom'],
    dias_sagrados: ['Terça-feira'],
    aplicacoes_healing: ['Sabedoria anciã', 'Tecnologias espirituais', 'Cura ancestral', 'Humildade'],
  },

  // ─── 12: Merinla ─────────────────────────────────────────────────────────────
  12: {
    odu_numero: 12,
    odu_nome: 'Merinla',
    odu_nome_yoruba: 'Mẹ̀rìnlá',
    frequencia: 741,
    frequencia_alternativa: 963,
    elemento: 'terra',
    significado_healing: 'Mistério sagrado e reverência ao incognoscível. Esta frequência trabalha com o que está além da compreensão racional.',
    mensagem_central: 'Alguns mistérios devem ser contemplados, não resolvidos. 741 Hz honra o sagrado incognoscível.',
    cores: ['roxo', 'preto'],
    dias_sagrados: ['Terça-feira'],
    aplicacoes_healing: ['Contemplação mística', 'Reverência ao sagrado', 'Aceitação do mistério', 'Devoção'],
  },

  // ─── 13: Mero ────────────────────────────────────────────────────────────────
  13: {
    odu_numero: 13,
    odu_nome: 'Mero',
    odu_nome_yoruba: 'Mẹ̀rọ̀',
    frequencia: 417,
    frequencia_alternativa: 285,
    elemento: 'água',
    significado_healing: 'Riqueza escondida e tesouros da alma. Esta frequência revela prosperidade oculta e recursos internos não descobertos.',
    mensagem_central: 'Tesouros inesperados aguardam sua descoberta interior. 417 Hz revela riqueza oculta.',
    cores: ['amarelo', 'dourado', 'verde'],
    dias_sagrados: ['Sábado'],
    aplicacoes_healing: ['Descoberta de tesouros', 'Prosperidade oculta', 'Recursos internos', 'Abundância'],
  },

  // ─── 14: Jinza ────────────────────────────────────────────────────────────────
  14: {
    odu_numero: 14,
    odu_nome: 'Jinza',
    odu_nome_yoruba: 'Jìnza',
    frequencia: 528,
    frequencia_alternativa: 741,
    elemento: 'fogo',
    significado_healing: 'Guerra espiritual e vitória da luz sobre a escuridão. Esta frequência é uma arma de proteção contra energias negativas.',
    mensagem_central: 'A espada de som corta toda energia hostil. 528 Hz traz vitória da luz.',
    cores: ['vermelho', 'preto', 'laranja'],
    dias_sagrados: ['Terça-feira'],
    aplicacoes_healing: ['Proteção espiritual', 'Batalha contra negatividades', 'Vitória da luz', 'Força'],
  },

  // ─── 15: Jotagbe ────────────────────────────────────────────────────────────
  15: {
    odu_numero: 15,
    odu_nome: 'Jotagbe',
    odu_nome_yoruba: 'Jọ́tágbè',
    frequencia: 963,
    frequencia_alternativa: 396,
    elemento: 'éter',
    significado_healing: 'Comunicação ancestral e linhagem espiritual. Esta frequência abre canais de comunicação com antepassados e mestres elevados.',
    mensagem_central: 'Seus ancestrais desejam guiá-lo agora. 963 Hz abre comunicação com a linhagem espiritual.',
    cores: ['branco', 'prata'],
    dias_sagrados: ['Segunda-feira', 'Domingo'],
    aplicacoes_healing: ['Comunicação ancestral', 'Conexão com a linhagem', 'Orientação dos mestres', 'Herança espiritual'],
  },

  // ─── 16: Otura ──────────────────────────────────────────────────────────────
  16: {
    odu_numero: 16,
    odu_nome: 'Otura',
    odu_nome_yoruba: 'Òtúrá',
    frequencia: 852,
    frequencia_alternativa: 639,
    elemento: 'terra',
    significado_healing: 'Caminho revelado e destino iluminado. Esta frequência clareia o caminho espiritual e fortalece a visão do destino.',
    mensagem_central: 'O caminho se revela enquanto você caminha. 852 Hz ilumina seu destino.',
    cores: ['roxo', 'verde'],
    dias_sagrados: ['Terça-feira', 'Segunda-feira'],
    aplicacoes_healing: ['Iluminação do caminho', 'Visão do destino', 'Orientação espiritual', 'Clareza de propósito'],
  },
};

// Freeze to prevent accidental modifications
Object.freeze(ODTU_FREQUENCY_MAPPINGS);
Object.values(ODTU_FREQUENCY_MAPPINGS).forEach((mapping) => Object.freeze(mapping));

// ─── Lookup Functions ────────────────────────────────────────────────────────

/**
 * Get Odu-Frequency correlation mapping
 * @param odu - Odu number (1-16) or name
 * @returns OdTuFrequency mapping or null if not found
 */
export function getOduFrequency(odu: number | string): OdTuFrequency | null {
  // Handle number input
  if (typeof odu === 'number') {
    if (odu >= 1 && odu <= 16) {
      return ODTU_FREQUENCY_MAPPINGS[odu] ?? null;
    }
    return null;
  }

  // Handle string input (name lookup)
  const normalizedInput = odu.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  for (const mapping of Object.values(ODTU_FREQUENCY_MAPPINGS)) {
    const nomePT = mapping.odu_nome.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const nomeYoruba = mapping.odu_nome_yoruba.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    if (nomePT === normalizedInput || nomeYoruba === normalizedInput) {
      return mapping;
    }
  }

  return null;
}

/**
 * Get the frequency associated with an Odu
 * @param odu - Odu number (1-16) or name
 * @returns Frequency in Hz or null if not found
 */
export function getFrequencyByOdu(odu: number | string): number | null {
  const mapping = getOduFrequency(odu);
  return mapping?.frequencia ?? null;
}

/**
 * Get all Odu-Frequency mappings
 * @returns Array of all mappings sorted by Odu number
 */
export function getAllOduFrequencies(): OdTuFrequency[] {
  return Object.values(ODTU_FREQUENCY_MAPPINGS).sort(
    (a, b) => a.odu_numero - b.odu_numero
  );
}

/**
 * Get all Odu numbers (1-16)
 * @returns Array of Odu numbers
 */
export function getAllOduNumbers(): number[] {
  return Object.keys(ODTU_FREQUENCY_MAPPINGS).map(Number).sort((a, b) => a - b);
}

/**
 * Get all Odu names in Portuguese
 * @returns Array of Odu names
 */
export function getAllOduNames(): string[] {
  return Object.values(ODTU_FREQUENCY_MAPPINGS)
    .map((m) => m.odu_nome)
    .sort((a, b) => a.localeCompare(b, 'pt-BR'));
}

/**
 * Get all Odu names in Yoruba
 * @returns Array of Odu names in Yoruba
 */
export function getAllOduNamesYoruba(): string[] {
  return Object.values(ODTU_FREQUENCY_MAPPINGS)
    .map((m) => m.odu_nome_yoruba)
    .sort((a, b) => a.localeCompare(b, 'pt-BR'));
}

/**
 * Get Odús by element
 * @param elemento - Element type
 * @returns Array of OdTuFrequency mappings for that element
 */
export function getOduByElement(elemento: ElementType): OdTuFrequency[] {
  return Object.values(ODTU_FREQUENCY_MAPPINGS)
    .filter((m) => m.elemento === elemento)
    .sort((a, b) => a.odu_numero - b.odu_numero);
}

/**
 * Get Odús by frequency
 * @param frequencia - Solfeggio frequency in Hz
 * @returns Array of OdTuFrequency mappings for that frequency
 */
export function getOduByFrequency(frequencia: number): OdTuFrequency[] {
  return Object.values(ODTU_FREQUENCY_MAPPINGS)
    .filter((m) => m.frequencia === frequencia || m.frequencia_alternativa === frequencia)
    .sort((a, b) => a.odu_numero - b.odu_numero);
}

/**
 * Get the element for a given Odu
 * @param odu - Odu number (1-16) or name
 * @returns Element type or null if not found
 */
export function getElementByOdu(odu: number | string): ElementType | null {
  const mapping = getOduFrequency(odu);
  return mapping?.elemento ?? null;
}

/**
 * Get the spiritual message for a given Odu
 * @param odu - Odu number (1-16) or name
 * @returns Spiritual message or null if not found
 */
export function getMessageByOdu(odu: number | string): string | null {
  const mapping = getOduFrequency(odu);
  return mapping?.mensagem_central ?? null;
}

/**
 * Get healing applications for a given Odu
 * @param odu - Odu number (1-16) or name
 * @returns Array of healing applications or null if not found
 */
export function getHealingByOdu(odu: number | string): string[] | null {
  const mapping = getOduFrequency(odu);
  return mapping?.aplicacoes_healing ?? null;
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
 * Get all unique frequencies used in the mapping
 * @returns Array of unique frequencies sorted in ascending order
 */
export function getUsedFrequencies(): number[] {
  const frequencies = new Set<number>();
  Object.values(ODTU_FREQUENCY_MAPPINGS).forEach((m) => {
    frequencies.add(m.frequencia);
    if (m.frequencia_alternativa) {
      frequencies.add(m.frequencia_alternativa);
    }
  });
  return Array.from(frequencies).sort((a, b) => a - b);
}

/**
 * Get all unique elements used in the mapping
 * @returns Array of unique elements
 */
export function getUsedElements(): ElementType[] {
  const elements = new Set<ElementType>();
  Object.values(ODTU_FREQUENCY_MAPPINGS).forEach((m) => {
    elements.add(m.elemento);
  });
  return Array.from(elements);
}

// ─── Default Export ───────────────────────────────────────────────────────────

export default {
  getOduFrequency,
  getFrequencyByOdu,
  getAllOduFrequencies,
  getAllOduNumbers,
  getAllOduNames,
  getAllOduNamesYoruba,
  getOduByElement,
  getOduByFrequency,
  getElementByOdu,
  getMessageByOdu,
  getHealingByOdu,
  hasOduFrequency,
  getUsedFrequencies,
  getUsedElements,
};
