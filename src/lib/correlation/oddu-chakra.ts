/**
 * Odú Ifá Chakra Correlation Module
 * Direct mappings of the 16 Odú Ifá (Merindilogun) to the 7 main chakras
 * With spiritual meaning for divination and energy work
 */

import type { ChakraName, Elemento } from './chakra-element';

// ─── Type Definitions ────────────────────────────────────────────────────────

export type OduElementoType = 'fogo' | 'água' | 'ar' | 'terra' | 'éter';

export interface OduChakraMapping {
  /** Odu number (1-16) */
  odu_numero: number;
  /** Odu name in Portuguese */
  odu_nome: string;
  /** Odu name in Yoruba */
  odu_nome_yoruba: string;
  /** Primary chakra associated with this Odu */
  chakra: ChakraName;
  /** Chakra number description (e.g., '1º Básico') */
  chakra_numero: string;
  /** Element associated with this Odu-Chakra correlation */
  elemento: OduElementoType;
  /** Chakra element type for consistency */
  chakra_elemento: Elemento;
  /** Spiritual meaning for divination and energy work */
  significado_espiritual: string;
  /** Key spiritual message */
  mensagem_central: string;
  /** Associated colors */
  cores: string[];
  /** Key qualities and energies */
  qualidades: string[];
}

// ─── Odú Ifá-to-Chakra Mapping (Merindilogun 1-16) ───────────────────────────

export const ODDU_CHAKRA_MAPPINGS: Record<number, OduChakraMapping> = {
  // ─── 1: Okaran (Okànràn) ───────────────────────────────────────────────────
  // Ajna (Third Eye) - Intuição, visão espiritual, fé
  1: {
    odu_numero: 1,
    odu_nome: 'Okaran',
    odu_nome_yoruba: 'Okànràn',
    chakra: 'Ajna',
    chakra_numero: '6º Terceiro Olho',
    elemento: 'éter',
    chakra_elemento: 'Éter',
    significado_espiritual: 'Coragem, recomeço, visão além das ilusões. Abre o terceiro olho para enxergar a verdade espiritual.',
    mensagem_central: 'Confie na sua intuição. Abra seu terceiro olho para ver além das aparências.',
    cores: ['branco', 'roxo', 'indigo'],
    qualidades: ['intuição', 'visão espiritual', 'coragem', 'fé', 'recomeço'],
  },

  // ─── 2: Ejiokô ─────────────────────────────────────────────────────────────
  // Svadhisthana (Sacral) - Criatividade, emoções, dualidade
  2: {
    odu_numero: 2,
    odu_nome: 'Ejiokô',
    odu_nome_yoruba: 'Ejìokò',
    chakra: 'Svadhisthana',
    chakra_numero: '2º Sacral',
    elemento: 'água',
    chakra_elemento: 'Água',
    significado_espiritual: 'Dualidade, escolha, equilíbrio entre opostos. desperta a criatividade e o fluxo emocional.',
    mensagem_central: 'Harmonize seus opostos. Permita que suas emoções guiem sua criatividade.',
    cores: ['laranja', 'amarelo'],
    qualidades: ['criatividade', 'equilíbrio', 'emoções', 'fluidez', 'escolha'],
  },

  // ─── 3: Etaogundá ──────────────────────────────────────────────────────────
  // Manipura (Solar) - Poder pessoal, transformação, vontade
  3: {
    odu_numero: 3,
    odu_nome: 'Etaogundá',
    odu_nome_yoruba: 'Ẹtaọgúndá',
    chakra: 'Manipura',
    chakra_numero: '3º Plexo Solar',
    elemento: 'fogo',
    chakra_elemento: 'Fogo',
    significado_espiritual: 'Força transformadora, poder de criar mudança. Ativa o fogo interior para transformar realidade.',
    mensagem_central: 'Desperte seu poder interior. Você tem força para transformar sua vida.',
    cores: ['amarelo', 'dourado'],
    qualidades: ['vontade', 'poder pessoal', 'transformação', 'confiança', 'ação'],
  },

  // ─── 4: Irosun ─────────────────────────────────────────────────────────────
  // Ajna (Third Eye) - Intuição lunar, segredos, conhecimento oculto
  4: {
    odu_numero: 4,
    odu_nome: 'Irosun',
    odu_nome_yoruba: 'Ìrosùn',
    chakra: 'Ajna',
    chakra_numero: '6º Terceiro Olho',
    elemento: 'água',
    chakra_elemento: 'Éter',
    significado_espiritual: 'Mensagens ocultas, intuição lunar, revelação de verdades escondidas. Clarividência e insight profundo.',
    mensagem_central: 'Confie na sua visão interior. Os segredos serão revelados no tempo certo.',
    cores: ['azul escuro', 'roxo', 'indigo'],
    qualidades: ['intuição', 'clarividência', 'sabedoria oculta', 'discernimento', 'lunar'],
  },

  // ─── 5: Oxé ────────────────────────────────────────────────────────────────
  // Muladhara (Root) - Lei divina, justiça, ancoramento
  5: {
    odu_numero: 5,
    odu_nome: 'Oxé',
    odu_nome_yoruba: 'Ọ̀sà',
    chakra: 'Muladhara',
    chakra_numero: '1º Básico',
    elemento: 'fogo',
    chakra_elemento: 'Terra',
    significado_espiritual: 'Lei divina, ordem cósmica, julgamento espiritual. Traz ancoramento e estabilidade para decisões importantes.',
    mensagem_central: 'Mantenha-se firme em sua verdade. A justiça divina está a seu favor.',
    cores: ['vermelho', 'preto', 'marrom'],
    qualidades: ['ancoramento', 'força', 'estabilidade', 'justiça', 'determinação'],
  },

  // ─── 6: Obará ──────────────────────────────────────────────────────────────
  // Anahata (Heart) - Paz, compaixão, equilíbrio do coração
  6: {
    odu_numero: 6,
    odu_nome: 'Obará',
    odu_nome_yoruba: 'Ọbàrà',
    chakra: 'Anahata',
    chakra_numero: '4º Cardíaco',
    elemento: 'terra',
    chakra_elemento: 'Ar',
    significado_espiritual: 'Caminho, destino, decisões que moldam o futuro. Abre o coração para a compaixão infinita.',
    mensagem_central: 'Siga com o coração aberto. A paz vem do equilíbrio entre dar e receber.',
    cores: ['verde', 'rosa'],
    qualidades: ['compaixão', 'amor incondicional', 'perdão', 'harmonia', ' paz'],
  },

  // ─── 7: Odi ─────────────────────────────────────────────────────────────────
  // Manipura (Solar) - Decisões rápidas, ação, dinamismo
  7: {
    odu_numero: 7,
    odu_nome: 'Odi',
    odu_nome_yoruba: 'Òdì',
    chakra: 'Manipura',
    chakra_numero: '3º Plexo Solar',
    elemento: 'água',
    chakra_elemento: 'Fogo',
    significado_espiritual: 'Decisões rápidas, respostas imediatas, ação dinâmica. Ativa o poder de vontade e transformação.',
    mensagem_central: 'Aja com propósito. Seu poder de transformação está desperto.',
    cores: ['laranja', 'amarelo', 'verde'],
    qualidades: ['ação', 'vontade', 'determinação', 'iniciativa', 'transformação'],
  },

  // ─── 8: Osí ─────────────────────────────────────────────────────────────────
  // Sahasrara (Crown) - Sabedoria superior, conexão divina, transcendência
  8: {
    odu_numero: 8,
    odu_nome: 'Osí',
    odu_nome_yoruba: 'Òsì',
    chakra: 'Sahasrara',
    chakra_numero: '7º Coronário',
    elemento: 'éter',
    chakra_elemento: 'Éter',
    significado_espiritual: 'Sabedoria divina, proteção superior, graça espiritual. Abre conexão direta com a consciência universal.',
    mensagem_central: 'Você está protegido pela luz superior. Confie na sabedoria que vem de cima.',
    cores: ['branco', 'violeta', 'dourado'],
    qualidades: ['sabedoria divina', 'proteção', 'graça', 'transcendência', 'iluminação'],
  },

  // ─── 9: Iuní ────────────────────────────────────────────────────────────────
  // Ajna (Third Eye) - Mistérios, sabedoria lunar, intuição profunda
  9: {
    odu_numero: 9,
    odu_nome: 'Iuní',
    odu_nome_yoruba: 'Ìwùrìn',
    chakra: 'Ajna',
    chakra_numero: '6º Terceiro Olho',
    elemento: 'ar',
    chakra_elemento: 'Éter',
    significado_espiritual: 'Mistérios profundos, sabedoria ancestral, ciclos de transformação. Desperta visão além do véu.',
    mensagem_central: 'Os mistérios serão revelados. Confie no processo de transformação.',
    cores: ['indigo', 'azul escuro', 'prata'],
    qualidades: ['mistério', 'sabedoria lunar', 'transformação', 'ciclos', 'ancestral'],
  },

  // ─── 10: Owonrin ────────────────────────────────────────────────────────────
  // Muladhara (Root) - Natureza, força física, sobrevivência
  10: {
    odu_numero: 10,
    odu_nome: 'Owonrin',
    odu_nome_yoruba: 'Òwónrìn',
    chakra: 'Muladhara',
    chakra_numero: '1º Básico',
    elemento: 'terra',
    chakra_elemento: 'Terra',
    significado_espiritual: 'Força natural, conexão com a terra, estabilidade fundamental. Ancoramento na realidade física.',
    mensagem_central: 'Conecte-se com a energia da terra. Sua força física é sua foundation.',
    cores: ['vermelho', 'marrom', 'verde escuro'],
    qualidades: ['força física', 'sobrevivência', 'estabilidade', 'natureza', 'prosperidade material'],
  },

  // ─── 11: Ejila ──────────────────────────────────────────────────────────────
  // Vishuddha (Throat) - Verdade, comunicação, expressão autêntica
  11: {
    odu_numero: 11,
    odu_nome: 'Ejila',
    odu_nome_yoruba: 'Ẹjìlà',
    chakra: 'Vishuddha',
    chakra_numero: '5º Laríngeo',
    elemento: 'éter',
    chakra_elemento: 'Ar',
    significado_espiritual: 'Verdade, comunicação sagrada, expressão autêntica. Abre a garganta para a voz da alma.',
    mensagem_central: 'Fale sua verdade com amor. Sua voz tem poder de cura e transformação.',
    cores: ['azul claro', 'turquesa', 'branco'],
    qualidades: ['comunicação', 'verdade', 'expressão', 'autenticidade', 'criatividade verbal'],
  },

  // ─── 12: Logumí ─────────────────────────────────────────────────────────────
  // Svadhisthana (Sacral) - Abundância, prosperidade, fluxo criativo
  12: {
    odu_numero: 12,
    odu_nome: 'Logumí',
    odu_nome_yoruba: 'Ògóndódò',
    chakra: 'Svadhisthana',
    chakra_numero: '2º Sacral',
    elemento: 'água',
    chakra_elemento: 'Água',
    significado_espiritual: 'Abundância, prosperidade, fluxo de energia criativa. Abre o fluxo de riqueza e sucesso.',
    mensagem_central: 'Você merece prosperidade. Permita que a energia flua livremente.',
    cores: ['laranja', 'dourado', 'amarelo'],
    qualidades: ['abundância', 'prosperidade', 'fluidez criativa', 'sucesso', 'celebração'],
  },

  // ─── 13: Odí ───────────────────────────────────────────────────────────────
  // Anahata (Heart) - Equilíbrio, proteção, amor divino
  13: {
    odu_numero: 13,
    odu_nome: 'Odí',
    odu_nome_yoruba: 'Òdí',
    chakra: 'Anahata',
    chakra_numero: '4º Cardíaco',
    elemento: 'fogo',
    chakra_elemento: 'Ar',
    significado_espiritual: 'Equilíbrio entre luz e escuridão, proteção especial, decisão entre dois caminhos.',
    mensagem_central: 'Encontre o equilíbrio no coração. A proteção divina está ao seu redor.',
    cores: ['verde', 'amarelo', 'branco'],
    qualidades: ['equilíbrio', 'proteção', 'discernimento', 'relacionamentos', 'harmonia'],
  },

  // ─── 14: Bejí ──────────────────────────────────────────────────────────────
  // Manipura (Solar) - Vitória, sucesso, persistência
  14: {
    odu_numero: 14,
    odu_nome: 'Bejí',
    odu_nome_yoruba: 'Ìrè',
    chakra: 'Manipura',
    chakra_numero: '3º Plexo Solar',
    elemento: 'fogo',
    chakra_elemento: 'Fogo',
    significado_espiritual: 'Vitória após dificuldade, sucesso através de perseverança. Desperta o fogo da conquista.',
    mensagem_central: 'A persistência traz vitória. Seu esforço será recompensado.',
    cores: ['amarelo', 'dourado', 'laranja'],
    qualidades: ['vitória', 'persistência', 'sucesso', 'fortaleza', 'conquista'],
  },

  // ─── 15: Ibí ───────────────────────────────────────────────────────────────
  // Svadhisthana (Sacral) - Encantamento, mudança, renovação
  15: {
    odu_numero: 15,
    odu_nome: 'Ibí',
    odu_nome_yoruba: 'Ìbí',
    chakra: 'Svadhisthana',
    chakra_numero: '2º Sacral',
    elemento: 'água',
    chakra_elemento: 'Água',
    significado_espiritual: 'Encantamento, magia, mudanças profundas e renovações. Desperta o poder criativo transformador.',
    mensagem_central: 'A magia está ao seu redor. Abrace as mudanças com coração aberto.',
    cores: ['roxo', 'azul', 'prata'],
    qualidades: ['magia', 'transformação', 'encantamento', 'renovação', 'fluidez'],
  },

  // ─── 16: Okandí ─────────────────────────────────────────────────────────────
  // Muladhara (Root) - Completion, renovação, reintegração
  16: {
    odu_numero: 16,
    odu_nome: 'Okandí',
    odu_nome_yoruba: 'Òkandí',
    chakra: 'Muladhara',
    chakra_numero: '1º Básico',
    elemento: 'éter',
    chakra_elemento: 'Terra',
    significado_espiritual: 'Completude, fim de ciclo, reintegração e novos começos. Ancoramento da transformação completada.',
    mensagem_central: 'Um ciclo se completa para outro começar. Aterre as bênçãos recebidas.',
    cores: ['branco', 'dourado', 'verde'],
    qualidades: ['completude', 'renovação', 'reinício', 'integração', 'ancoramento'],
  },
};

// Freeze to prevent accidental modifications
Object.freeze(ODDU_CHAKRA_MAPPINGS);

// ─── Lookup Functions ────────────────────────────────────────────────────────

/**
 * Get Odu-Chakra correlation mapping
 * @param odu - Odu number (1-16) or name
 * @returns OduChakraMapping or null if not found
 */
export function getOduChakra(odu: number | string): OduChakraMapping | null {
  if (typeof odu === 'number') {
    return ODDU_CHAKRA_MAPPINGS[odu] ?? null;
  }

  // Search by name (case-insensitive)
  const normalizedName = odu.toLowerCase().trim();
  const found = Object.values(ODDU_CHAKRA_MAPPINGS).find(
    (m) =>
      m.odu_nome.toLowerCase() === normalizedName ||
      m.odu_nome_yoruba.toLowerCase() === normalizedName
  );

  return found ?? null;
}

/**
 * Get Chakra-Odu correlation (reverse lookup)
 * @param chakra - Chakra name or number (e.g., 'Ajna', '6º Terceiro Olho')
 * @returns Array of OduChakraMapping for that chakra
 */
export function getChakraOdu(chakra: string): OduChakraMapping[] {
  const normalizedChakra = chakra.toLowerCase().trim();

  // Find matching chakra
  return Object.values(ODDU_CHAKRA_MAPPINGS).filter((mapping) => {
    const chakraLower = mapping.chakra.toLowerCase();
    const chakraNumeroLower = mapping.chakra_numero.toLowerCase();

    return (
      chakraLower === normalizedChakra ||
      chakraNumeroLower.includes(normalizedChakra) ||
      normalizedChakra.includes(chakraLower) ||
      normalizedChakra.includes(chakraNumeroLower)
    );
  });
}

/**
 * Get all Odu-Chakra mappings
 * @returns Array of all mappings sorted by Odu number
 */
export function getAllOduChakras(): OduChakraMapping[] {
  return Object.values(ODDU_CHAKRA_MAPPINGS).sort(
    (a, b) => a.odu_numero - b.odu_numero
  );
}

/**
 * Get all Odu numbers (1-16)
 * @returns Array of Odu numbers
 */
export function getAllOduNumbers(): number[] {
  return Object.keys(ODDU_CHAKRA_MAPPINGS)
    .map(Number)
    .sort((a, b) => a - b);
}

/**
 * Get all Odu names in Portuguese
 * @returns Array of Odu names
 */
export function getAllOduNames(): string[] {
  return Object.values(ODDU_CHAKRA_MAPPINGS)
    .map((m) => m.odu_nome)
    .sort();
}

/**
 * Get all unique Chakra names
 * @returns Array of Chakra names (deduplicated)
 */
export function getAllChakraNames(): string[] {
  const chakras = Object.values(ODDU_CHAKRA_MAPPINGS).map((m) => m.chakra);
  return [...new Set(chakras)].sort();
}

/**
 * Get Odús by element
 * @param elemento - Element type
 * @returns Array of OduChakraMapping for that element
 */
export function getOduByElement(elemento: OduElementoType): OduChakraMapping[] {
  return Object.values(ODDU_CHAKRA_MAPPINGS).filter(
    (m) => m.elemento === elemento
  );
}

/**
 * Get Odús by Chakra
 * @param chakra - Chakra name
 * @returns Array of OduChakraMapping for that chakra
 */
export function getOduByChakra(chakra: string): OduChakraMapping[] {
  return getChakraOdu(chakra);
}

/**
 * Check if an Odu number exists
 * @param oduNumero - Odu number to check
 * @returns True if Odu exists in mapping
 */
export function hasOduChakra(oduNumero: number): boolean {
  return oduNumero in ODDU_CHAKRA_MAPPINGS;
}

/**
 * Get the element for a given Odu number
 * @param oduNumero - Odu number (1-16)
 * @returns Element type or null if not found
 */
export function getOduElement(oduNumero: number): OduElementoType | null {
  return ODDU_CHAKRA_MAPPINGS[oduNumero]?.elemento ?? null;
}

/**
 * Get the Chakra name for a given Odu number
 * @param oduNumero - Odu number (1-16)
 * @returns Chakra name or null if not found
 */
export function getOduChakraName(oduNumero: number): ChakraName | null {
  return (ODDU_CHAKRA_MAPPINGS[oduNumero]?.chakra as ChakraName) ?? null;
}

/**
 * Get the spiritual message for a given Odu
 * @param oduNumero - Odu number (1-16)
 * @returns Spiritual message or null if not found
 */
export function getOduMessage(oduNumero: number): string | null {
  return ODDU_CHAKRA_MAPPINGS[oduNumero]?.mensagem_central ?? null;
}

// ─── Default Export ───────────────────────────────────────────────────────────

export default {
  getOduChakra,
  getChakraOdu,
  getAllOduChakras,
  getAllOduNumbers,
  getAllOduNames,
  getAllChakraNames,
  getOduByElement,
  getOduByChakra,
  hasOduChakra,
  getOduElement,
  getOduChakraName,
  getOduMessage,
  ODDU_CHAKRA_MAPPINGS,
};