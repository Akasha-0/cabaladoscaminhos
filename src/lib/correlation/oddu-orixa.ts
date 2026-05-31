/**
 * Od'u-Orixá Correlation Module
 * Direct mappings of the 16 Odú Ifá (Odus) to their ruling Orixás
 * With spiritual meaning for divination and ritual practice
 */

// ─── Type Definitions ────────────────────────────────────────────────────────

export type ElementType = 'fogo' | 'água' | 'ar' | 'terra' | 'éter';

export interface OdduOrixa {
  /** Odu number (1-16) */
  odu_numero: number;
  /** Odu name in Portuguese */
  odu_nome: string;
  /** Odu name in Yoruba */
  odu_nome_yoruba: string;
  /** Ruling Orixá name */
  orixa: string;
  /** Alternative Orixá or aspect */
  orixa_aspect?: string;
  /** Primary element */
  elemento: ElementType;
  /** Spiritual meaning for divination */
  significado_espiritual: string;
  /** Key spiritual message */
  mensagem_central: string;
  /** Associated colors */
  cores: string[];
  /** Sacred days */
  dias_sagrados: string[];
}

// ─── Odú Ifá-to-Orixá Mapping (Merindilogun 1-16) ────────────────────────────

export const ODDU_ORIXA_MAPPINGS: Record<number, OdduOrixa> = {
  // ─── 1: Okaran (Okànràn) ───────────────────────────────────────────────────
  1: {
    odu_numero: 1,
    odu_nome: 'Okaran',
    odu_nome_yoruba: 'Okànràn',
    orixa: 'Oxalá',
    orixa_aspect: 'Logun Ede',
    elemento: 'éter',
    significado_espiritual: 'Coragem, recomeço, liberdade. Odu da fé que move montanhas e do pioneiro que abre caminhos.',
    mensagem_central: 'Novos inícios pedem coragem. Confie na força criadora de Oxalá.',
    cores: ['branco', 'ouro'],
    dias_sagrados: ['Segunda-feira', 'Domingo'],
  },

  // ─── 2: Ejiokô ─────────────────────────────────────────────────────────────
  2: {
    odu_numero: 2,
    odu_nome: 'Ejiokô',
    odu_nome_yoruba: 'Ejìokò',
    orixa: 'Oxum',
    orixa_aspect: 'Oba',
    elemento: 'água',
    significado_espiritual: 'Dualidade, escolha, equilíbrio. Revela que toda decisão importante exige intuição e harmonização de opostos.',
    mensagem_central: 'Escolhas significativas pedem equilíbrio. Oxum traz clareza.',
    cores: ['amarelo', 'dourado'],
    dias_sagrados: ['Sábado'],
  },

  // ─── 3: Etaogundá ──────────────────────────────────────────────────────────
  3: {
    odu_numero: 3,
    odu_nome: 'Etaogundá',
    odu_nome_yoruba: 'Ẹtaọgúndá',
    orixa: 'Iemanjá',
    orixa_aspect: 'Yemanjá',
    elemento: 'fogo',
    significado_espiritual: 'Força transformadora, criação, ferramenta. Poder de transformar matéria e criar vida através da vontade.',
    mensagem_central: 'A transformação está ao seu alcance. Iemanjá oferece proteção maternal e renovação.',
    cores: ['azul', 'branco'],
    dias_sagrados: ['Segunda-feira', 'Domingo'],
  },

  // ─── 4: Irosun ─────────────────────────────────────────────────────────────
  4: {
    odu_numero: 4,
    odu_nome: 'Irosun',
    odu_nome_yoruba: 'Ìrosùn',
    orixa: 'Oxum',
    orixa_aspect: 'Oba',
    elemento: 'água',
    significado_espiritual: 'Intuição lunar, mensagens ocultas, segredos. Revela verdades escondidas e a visão além das ilusões.',
    mensagem_central: 'Confie na sua intuição. Oxum revela o que está oculto.',
    cores: ['amarelo', 'azul celeste'],
    dias_sagrados: ['Sábado'],
  },

  // ─── 5: Oxé ────────────────────────────────────────────────────────────────
  5: {
    odu_numero: 5,
    odu_nome: 'Oxé',
    odu_nome_yoruba: 'Ọ̀sà',
    orixa: 'Ogum',
    orixa_aspect: 'Xangô',
    elemento: 'fogo',
    significado_espiritual: 'Lei divina, justiça cósmica, julgamento. Traz responsabilidade espiritual e decisões que afetam destinos.',
    mensagem_central: 'Age com equilíbrio entre rigor e compaixão. Ogum protege e fortalece.',
    cores: ['vermelho', 'preto'],
    dias_sagrados: ['Terça-feira'],
  },

  // ─── 6: Obará ───────────────────────────────────────────────────────────────
  6: {
    odu_numero: 6,
    odu_nome: 'Obará',
    odu_nome_yoruba: 'Ọbàlúayé',
    orixa: 'Oxalá',
    orixa_aspect: 'Obatalá',
    elemento: 'terra',
    significado_espiritual: 'Terra, mortalidade, transformação física. Conexão entre espiritual e material, doença e cura.',
    mensagem_central: 'Purificação traz cura. Oxalá abre o caminho entre vida e morte.',
    cores: ['branco', 'marrom'],
    dias_sagrados: ['Segunda-feira', 'Domingo'],
  },

  // ─── 7: Odi ────────────────────────────────────────────────────────────────
  7: {
    odu_numero: 7,
    odu_nome: 'Odi',
    odu_nome_yoruba: 'Òdí',
    orixa: 'Iemanjá',
    orixa_aspect: 'Yemanjá',
    elemento: 'água',
    significado_espiritual: 'Destino, forças ocultas, inconsciente. Revela padrões ocultos que direcionam a vida.',
    mensagem_central: 'O destino se manifesta. Reconheça padrões com Iemanjá.',
    cores: ['azul', 'branco'],
    dias_sagrados: ['Segunda-feira', 'Domingo'],
  },

  // ─── 8: Ejionlá ─────────────────────────────────────────────────────────────
  8: {
    odu_numero: 8,
    odu_nome: 'Ejionlá',
    odu_nome_yoruba: 'Ejìọnlá',
    orixa: 'Logun Ede',
    orixa_aspect: 'Oxum',
    elemento: 'água',
    significado_espiritual: 'Abundância infinita, prosperidade cósmica. Transformação da escassez em riqueza espiritual e material.',
    mensagem_central: 'A abundância flui para ti. Logun Ede abençoa a prosperidade.',
    cores: ['verde', 'amarelo'],
    dias_sagrados: ['Sábado'],
  },

  // ─── 9: Oshe ────────────────────────────────────────────────────────────────
  9: {
    odu_numero: 9,
    odu_nome: 'Oshe',
    odu_nome_yoruba: 'Ọ̀shẹ́',
    orixa: 'Iemanjá',
    orixa_aspect: 'Nanã',
    elemento: 'água',
    significado_espiritual: 'Alegría, celebração divina, comunidade. Rituais de agradecimento e conexão com a diversidade cultural.',
    mensagem_central: 'Celebre com gratidão. Iemanjá abençoa a comunidade.',
    cores: ['azul', 'verde'],
    dias_sagrados: ['Segunda-feira', 'Domingo'],
  },

  // ─── 10: Ofun ───────────────────────────────────────────────────────────────
  10: {
    odu_numero: 10,
    odu_nome: 'Ofun',
    odu_nome_yoruba: 'Ọ̀fún',
    orixa: 'Oxalá',
    orixa_aspect: 'Obatalá',
    elemento: 'éter',
    significado_espiritual: 'Silêncio, paciência, contemplação. Sabedoria que vem do silêncio e verdade que se revela no tempo certo.',
    mensagem_central: 'O silêncio revela a verdade. Oxalá traz paz através da espera sagrada.',
    cores: ['branco', 'cinza'],
    dias_sagrados: ['Segunda-feira', 'Domingo'],
  },

  // ─── 11: Eyonla ─────────────────────────────────────────────────────────────
  11: {
    odu_numero: 11,
    odu_nome: 'Eyonla',
    odu_nome_yoruba: 'Èyọ́nlá',
    orixa: 'Nanã Buruku',
    orixa_aspect: 'Nanã',
    elemento: 'terra',
    significado_espiritual: 'Sabedoria anciã, tecnologias espirituais. Conhecimento que transcende gerações e exige humildade.',
    mensagem_central: 'A sabedoria anciã te chama. Nanã Buruku guarda os segredos primordiais.',
    cores: ['roxo', 'marrom'],
    dias_sagrados: ['Terça-feira'],
  },

  // ─── 12: Merinla ─────────────────────────────────────────────────────────────
  12: {
    odu_numero: 12,
    odu_nome: 'Merinla',
    odu_nome_yoruba: 'Mẹ̀rìnlá',
    orixa: 'Nanã Buruku',
    orixa_aspect: 'Nanã',
    elemento: 'terra',
    significado_espiritual: 'Mistério, segredos sagrados, incognoscível. Reverência ao sagrado e aceitação do que não pode ser explicado.',
    mensagem_central: 'Alguns mistérios não devem ser revelados. Respeite o sagrado com Nanã.',
    cores: ['roxo', 'preto'],
    dias_sagrados: ['Terça-feira'],
  },

  // ─── 13: Mero ────────────────────────────────────────────────────────────────
  13: {
    odu_numero: 13,
    odu_nome: 'Mero',
    odu_nome_yoruba: 'Mẹ̀rọ̀',
    orixa: 'Oxum',
    orixa_aspect: 'Logun Ede',
    elemento: 'água',
    significado_espiritual: 'Riqueza escondida, tesouros ocultos, descobertas inesperadas. Prosperidade que surge do inesperado.',
    mensagem_central: 'Tesouros te esperam em lugares improváveis. Oxum revela a riqueza oculta.',
    cores: ['amarelo', 'dourado', 'verde'],
    dias_sagrados: ['Sábado'],
  },

  // ─── 14: Jinza ────────────────────────────────────────────────────────────────
  14: {
    odu_numero: 14,
    odu_nome: 'Jinza',
    odu_nome_yoruba: 'Jìnza',
    orixa: 'Ogum',
    orixa_aspect: 'Xangô',
    elemento: 'fogo',
    significado_espiritual: 'Guerra espiritual, batalha luz versus escuridão. Proteção contra forças negativas e vitória da luz.',
    mensagem_central: 'A espada de Ogum corta energias hostis. A luz vence.',
    cores: ['vermelho', 'preto', 'laranja'],
    dias_sagrados: ['Terça-feira'],
  },

  // ─── 15: Jotagbe ────────────────────────────────────────────────────────────
  15: {
    odu_numero: 15,
    odu_nome: 'Jotagbe',
    odu_nome_yoruba: 'Jọ́tágbè',
    orixa: 'Oxalá',
    orixa_aspect: 'Obatalá',
    elemento: 'éter',
    significado_espiritual: 'Comunicação ancestral, linhagem espiritual. Conexão com antepassados e herança espiritual.',
    mensagem_central: 'Seus ancestrais te guiam. Oxalá conecta passado e presente.',
    cores: ['branco', 'prata'],
    dias_sagrados: ['Segunda-feira', 'Domingo'],
  },

  // ─── 16: Otura ──────────────────────────────────────────────────────────────
  16: {
    odu_numero: 16,
    odu_nome: 'Otura',
    odu_nome_yoruba: 'Òtúrá',
    orixa: 'Nanã Buruku',
    orixa_aspect: 'Oxalá',
    elemento: 'terra',
    significado_espiritual: 'Caminho, jornada, destino revelado. O destino se forma sob os pés, construindo-se a cada passo.',
    mensagem_central: 'O caminho se revela enquanto caminha. Nanã Buruku orienta a jornada.',
    cores: ['roxo', 'verde'],
    dias_sagrados: ['Terça-feira', 'Segunda-feira'],
  },
};

// Freeze to prevent accidental modifications
Object.freeze(ODDU_ORIXA_MAPPINGS);

// ─── Lookup Functions ────────────────────────────────────────────────────────

/**
 * Get Od'u-Orixá correlation mapping
 * @param odu - Odu number (1-16) or name
 * @returns OdduOrixa mapping or null if not found
 */
export function getOduOrixa(odu: number | string): OdduOrixa | null {
  // Handle number input
  if (typeof odu === 'number') {
    if (odu >= 1 && odu <= 16) {
      return ODDU_ORIXA_MAPPINGS[odu] ?? null;
    }
    return null;
  }

  // Handle string input (name lookup)
  const normalizedInput = odu.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  for (const mapping of Object.values(ODDU_ORIXA_MAPPINGS)) {
    const nomePT = mapping.odu_nome.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const nomeYoruba = mapping.odu_nome_yoruba.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    if (nomePT === normalizedInput || nomeYoruba === normalizedInput) {
      return mapping;
    }
  }

  return null;
}

/**
 * Get Orixá by Odu number
 * @param orixa - Orixá name (case-insensitive)
 * @returns Array of OdduOrixa mappings for that Orixá
 */
export function getOrixaOdu(orixa: string): OdduOrixa[] {
  const normalized = orixa.toLowerCase();
  return Object.values(ODDU_ORIXA_MAPPINGS)
    .filter(
      (m) =>
        m.orixa.toLowerCase() === normalized ||
        m.orixa_aspect?.toLowerCase() === normalized
    )
    .sort((a, b) => a.odu_numero - b.odu_numero);
}

/**
 * Get all Od'u-Orixá mappings
 * @returns Array of all mappings sorted by Odu number
 */
export function getAllOduOrixas(): OdduOrixa[] {
  return Object.values(ODDU_ORIXA_MAPPINGS).sort(
    (a, b) => a.odu_numero - b.odu_numero
  );
}

/**
 * Get all Odu numbers (1-16)
 * @returns Array of Odu numbers
 */
export function getAllOduNumbers(): number[] {
  return Object.keys(ODDU_ORIXA_MAPPINGS).map(Number).sort((a, b) => a - b);
}

/**
 * Get all Odu names in Portuguese
 * @returns Array of Odu names
 */
export function getAllOduNames(): string[] {
  return Object.values(ODDU_ORIXA_MAPPINGS)
    .map((m) => m.odu_nome)
    .sort((a, b) => a.localeCompare(b, 'pt-BR'));
}

/**
 * Get all unique Orixá names
 * @returns Array of Orixá names (deduplicated)
 */
export function getAllOrixaNames(): string[] {
  const names = new Set<string>();
  Object.values(ODDU_ORIXA_MAPPINGS).forEach((m) => {
    names.add(m.orixa);
    if (m.orixa_aspect) {
      names.add(m.orixa_aspect);
    }
  });
  return Array.from(names).sort((a, b) => a.localeCompare(b, 'pt-BR'));
}

/**
 * Get Odús by element
 * @param elemento - Element type
 * @returns Array of OdduOrixa mappings for that element
 */
export function getOduByElement(elemento: ElementType): OdduOrixa[] {
  return Object.values(ODDU_ORIXA_MAPPINGS)
    .filter((m) => m.elemento === elemento)
    .sort((a, b) => a.odu_numero - b.odu_numero);
}

/**
 * Check if an Odu number exists
 * @param oduNumero - Odu number to check
 * @returns True if Odu exists in mapping
 */
export function hasOduOrixa(oduNumero: number): boolean {
  return oduNumero in ODDU_ORIXA_MAPPINGS;
}

/**
 * Get the element for a given Odu number
 * @param oduNumero - Odu number (1-16)
 * @returns Element type or null if not found
 */
export function getOduElement(oduNumero: number): ElementType | null {
  return ODDU_ORIXA_MAPPINGS[oduNumero]?.elemento ?? null;
}

/**
 * Get the spiritual message for a given Odu
 * @param oduNumero - Odu number (1-16)
 * @returns Spiritual message or null if not found
 */
export function getOduMessage(oduNumero: number): string | null {
  return ODDU_ORIXA_MAPPINGS[oduNumero]?.mensagem_central ?? null;
}

// ─── Default Export ───────────────────────────────────────────────────────────

export default {
  getOduOrixa,
  getOrixaOdu,
  getAllOduOrixas,
  getAllOduNumbers,
  getAllOduNames,
  getAllOrixaNames,
  getOduByElement,
  hasOduOrixa,
  getOduElement,
  getOduMessage,
};