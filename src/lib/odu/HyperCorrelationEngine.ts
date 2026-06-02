/**
 * ════════════════════════════════════════════════════════════════════════════
 * UNIFIED ODU HYPER-CORRELATION ENGINE — Cabala dos Caminhos
 * ════════════════════════════════════════════════════════════════════════════
 * 
 * Centralized engine for cross-tradition Odu Ifá correlations.
 * Consolidates 8 separate correlation modules into single unified API.
 * 
 * Consolidated Modules:
 * - odu-element.ts     → Element correlations
 * - odu-frequency.ts   → Frequency correlations  
 * - odu-numerology.ts  → Numerology correlations
 * - odu-orixa.ts       → Orixá correlations
 * - odu-planet.ts      → Planet correlations
 * - odu-sephirot.ts    → Kabbalah Sephirot correlations
 * - odu-tarot.ts        → Tarot correlations
 * - odu-zodiac.ts      → Astrology correlations
 * 
 * Version: 1.0.0
 * Created: Sprint 315
 */

import { z } from 'zod';

// ════════════════════════════════════════════════════════════════════════════
// CORE TYPES
// ════════════════════════════════════════════════════════════════════════════

export const ODU_NOMES = [
  'Okaran', 'Ejiokô', 'Etaogundá', 'Ogundá', 'Oxê', 'Obara', 'Okanran',
  'Ogou', 'Ossaim', 'Iojibá', 'Ofun', 'Awure', 'Ejiá', 'Irete', 'Oros',
  'Oxum'
] as const;

export const ELEMENTOS = ['Fogo', 'Água', 'Terra', 'Ar', 'Éter'] as const;

export const PLANETAS = [
  'Sol', 'Lua', 'Marte', 'Mercúrio', 'Júpiter', 'Vênus', 'Saturno'
] as const;

export const SEFIROT = [
  'Keter', 'Chokhmah', 'Binah', 'Chesed', 'Gevurah', 'Tiferet',
  'Netzach', 'Hod', 'Yesod', 'Malkuth'
] as const;

// ─── Zod Schemas ───────────────────────────────────────────────────────────

export const OduSchema = z.object({
  numero: z.number().min(1).max(16),
  nome: z.string(),
  nomeYoruba: z.string().optional(),
  elemento: z.enum(ELEMENTOS),
  orixa: z.string(),
  planeta: z.enum(PLANETAS).optional(),
  sephirot: z.enum(SEFIROT).optional(),
  tarot: z.string().optional(),
  numerologia: z.number().optional(),
  qualidade: z.string().optional(),
  desafio: z.string().optional(),
});

export type Odu = z.infer<typeof OduSchema>;

// ════════════════════════════════════════════════════════════════════════════
// UNIFIED ODU DATA MAP
// ════════════════════════════════════════════════════════════════════════════

export const ODUS_UNIFIED: Record<number, Odu> = {
  1: {
    numero: 1,
    nome: 'Okaran',
    nomeYoruba: 'Ogbe',
    elemento: 'Terra',
    orixa: 'Exu',
    planeta: 'Mercúrio',
    sephirot: 'Hod',
    tarot: 'O Mago',
    numerologia: 1,
    qualidade: 'Começo, Caminho, Destino',
    desafio: 'Insubordinação',
  },
  2: {
    numero: 2,
    nome: 'Ejiokô',
    nomeYoruba: 'Oyeku',
    elemento: 'Água',
    orixa: 'Iemanjá',
    planeta: 'Lua',
    sephirot: 'Yesod',
    tarot: 'A Sacerdotisa',
    numerologia: 2,
    qualidade: 'Dualidade, Parceria, Duas cabeças',
    desafio: 'Indecisão',
  },
  3: {
    numero: 3,
    nome: 'Etaogundá',
    nomeYoruba: 'Iwori',
    elemento: 'Fogo',
    orixa: 'Ogum',
    planeta: 'Marte',
    sephirot: 'Gevurah',
    tarot: 'A Imperatriz',
    numerologia: 3,
    qualidade: 'Revolta, Força, Criação',
    desafio: 'Agressividade',
  },
  4: {
    numero: 4,
    nome: 'Ogundá',
    nomeYoruba: 'Odi',
    elemento: 'Ar',
    orixa: 'Ogum',
    planeta: 'Mercúrio',
    sephirot: 'Chesed',
    tarot: 'O Imperador',
    numerologia: 4,
    qualidade: 'Caminhos múltiplos, Jornada',
    desafio: 'Dispersão',
  },
  5: {
    numero: 5,
    nome: 'Oxê',
    nomeYoruba: 'Osogbo',
    elemento: 'Fogo',
    orixa: 'Oxóssi',
    planeta: 'Marte',
    sephirot: 'Netzach',
    tarot: 'O Hierofante',
    numerologia: 5,
    qualidade: 'Caça, Busca, Fuga',
    desafio: 'Ansiedade',
  },
  6: {
    numero: 6,
    nome: 'Obara',
    nomeYoruba: 'Iobari',
    elemento: 'Terra',
    orixa: 'Oxum',
    planeta: 'Vênus',
    sephirot: 'Tiferet',
    tarot: 'Os Enamorados',
    numerologia: 6,
    qualidade: 'Civilização, Namoro, Tratados',
    desafio: 'Vaidade',
  },
  7: {
    numero: 7,
    nome: 'Okanran',
    nomeYoruba: 'Iosalor',
    elemento: 'Terra',
    orixa: 'Oxum',
    planeta: 'Vênus',
    sephirot: 'Malkuth',
    tarot: 'O Carro',
    numerologia: 7,
    qualidade: 'Fuga, Abandono, Viagem',
    desafio: 'Medo',
  },
  8: {
    numero: 8,
    nome: 'Ogou',
    nomeYoruba: 'Irin',
    elemento: 'Fogo',
    orixa: 'Ogum',
    planeta: 'Marte',
    sephirot: 'Gevurah',
    tarot: 'A Justiça',
    numerologia: 8,
    qualidade: 'Força, Luta, Justiça',
    desafio: 'Guerra',
  },
  9: {
    numero: 9,
    nome: 'Ossaim',
    nomeYoruba: 'Ishu',
    elemento: 'Ar',
    orixa: 'Oxóssi',
    planeta: 'Mercúrio',
    sephirot: 'Hod',
    tarot: 'O Eremita',
    numerologia: 9,
    qualidade: 'Conhecimento, Ervas, Sabedoria',
    desafio: 'Segredos',
  },
  10: {
    numero: 10,
    nome: 'Iojibá',
    nomeYoruba: 'Ibara',
    elemento: 'Terra',
    orixa: 'Oxalá',
    planeta: 'Saturno',
    sephirot: 'Malkuth',
    tarot: 'A Roda da Fortuna',
    numerologia: 10,
    qualidade: 'Sorte, Jogo, Destino',
    desafio: 'Dependência',
  },
  11: {
    numero: 11,
    nome: 'Ofun',
    nomeYoruba: 'Ofun',
    elemento: 'Fogo',
    orixa: 'Oxalá',
    planeta: 'Sol',
    sephirot: 'Chokhmah',
    tarot: 'A Força',
    numerologia: 11,
    qualidade: 'Purificação, Louvação, Feito',
    desafio: 'Culpa',
  },
  12: {
    numero: 12,
    nome: 'Awure',
    nomeYoruba: 'Awonle',
    elemento: 'Água',
    orixa: 'Iemanjá',
    planeta: 'Lua',
    sephirot: 'Yesod',
    tarot: 'O Enforcado',
    numerologia: 12,
    qualidade: 'Vitória, Sucesso, Expediente',
    desafio: 'Fraude',
  },
  13: {
    numero: 13,
    nome: 'Ejiá',
    nomeYoruba: 'Ayan',
    elemento: 'Terra',
    orixa: 'Nanã',
    planeta: 'Saturno',
    sephirot: 'Binah',
    tarot: 'A Morte',
    numerologia: 13,
    qualidade: 'Morte, Renascimento, Arco-íris',
    desafio: 'Pesar',
  },
  14: {
    numero: 14,
    nome: 'Irete',
    nomeYoruba: 'Irete',
    elemento: 'Fogo',
    orixa: 'Ogum',
    planeta: 'Marte',
    sephirot: 'Tiferet',
    tarot: 'A Temperança',
    numerologia: 14,
    qualidade: 'Amizade, Recreação, Afeto',
    desafio: 'Inveja',
  },
  15: {
    numero: 15,
    nome: 'Oros',
    nomeYoruba: 'Oro',
    elemento: 'Fogo',
    orixa: 'Xangô',
    planeta: 'Júpiter',
    sephirot: 'Keter',
    tarot: 'O Diabo',
    numerologia: 15,
    qualidade: 'Poder, Trovão, Assunto de rei',
    desafio: 'Tirania',
  },
  16: {
    numero: 16,
    nome: 'Oxum',
    nomeYoruba: 'Oxum',
    elemento: 'Água',
    orixa: 'Oxum',
    planeta: 'Vênus',
    sephirot: 'Netzach',
    tarot: 'A Torre',
    numerologia: 16,
    qualidade: 'Amor, Dinheiro, Beleza',
    desafio: 'Gosto excessivo',
  },
};

// ════════════════════════════════════════════════════════════════════════════
// CROSS-TRADITION CORRELATION FUNCTIONS
// ════════════════════════════════════════════════════════════════════════════

/**
 * Get Odu by number (1-16)
 */
export function getOdu(numero: number): Odu | undefined {
  return ODUS_UNIFIED[numero];
}

/**
 * Get all Odus as array
 */
export function getAllOdus(): Odu[] {
  return Object.values(ODUS_UNIFIED);
}

/**
 * Get Odus by element
 */
export function getOdusByElement(elemento: string): Odu[] {
  return Object.values(ODUS_UNIFIED).filter(o => o.elemento === elemento);
}

/**
 * Get Odus by Orixá
 */
export function getOdusByOrixa(orixa: string): Odu[] {
  return Object.values(ODUS_UNIFIED).filter(
    o => o.orixa.toLowerCase() === orixa.toLowerCase()
  );
}

/**
 * Get Odus by planet
 */
export function getOdusByPlaneta(planeta: string): Odu[] {
  return Object.values(ODUS_UNIFIED).filter(
    o => o.planeta?.toLowerCase() === planeta.toLowerCase()
  );
}

/**
 * Get Odus by sephirot
 */
export function getOdusBySephirot(sephirot: string): Odu[] {
  return Object.values(ODUS_UNIFIED).filter(
    o => o.sephirot?.toLowerCase() === sephirot.toLowerCase()
  );
}

/**
 * Get Odus by tarot arcano
 */
export function getOdusByTarot(tarot: string): Odu[] {
  return Object.values(ODUS_UNIFIED).filter(
    o => o.tarot?.toLowerCase().includes(tarot.toLowerCase())
  );
}

/**
 * Find resonance between Odu, Orixá, and another tradition
 */
export function findResonance(
  oduNumero: number,
  tradicao: 'orixa' | 'planeta' | 'sephirot' | 'tarot' | 'numerologia'
): string[] {
  const odu = ODUS_UNIFIED[oduNumero];
  if (!odu) return [];

  const correlations: string[] = [];
  
  if (tradicao === 'orixa') {
    correlations.push(odu.orixa);
  }
  if (tradicao === 'planeta' && odu.planeta) {
    correlations.push(odu.planeta);
  }
  if (tradicao === 'sephirot' && odu.sephirot) {
    correlations.push(odu.sephirot);
  }
  if (tradicao === 'tarot' && odu.tarot) {
    correlations.push(odu.tarot);
  }
  if (tradicao === 'numerologia' && odu.numerologia) {
    correlations.push(String(odu.numerologia));
  }
  
  return correlations;
}

/**
 * Analyze compatibility between two Odus
 */
export function analyzeOduCompatibility(
  odu1Numero: number,
  odu2Numero: number
): { elementos: string[]; harmonia: number; recomendacao: string } {
  const odu1 = ODUS_UNIFIED[odu1Numero];
  const odu2 = ODUS_UNIFIED[odu2Numero];
  
  if (!odu1 || !odu2) {
    return { elementos: [], harmonia: 0, recomendacao: 'Odus não encontrados' };
  }
  
  const elementos = [odu1.elemento, odu2.elemento];
  const harmonieMap: Record<string, Record<string, number>> = {
    'Fogo': { 'Fogo': 10, 'Terra': 5, 'Água': 3, 'Ar': 8 },
    'Água': { 'Fogo': 3, 'Terra': 8, 'Água': 10, 'Ar': 5 },
    'Terra': { 'Fogo': 5, 'Terra': 10, 'Água': 8, 'Ar': 3 },
    'Ar': { 'Fogo': 8, 'Terra': 3, 'Água': 5, 'Ar': 10 },
  };
  
  const harmonia = harmonieMap[odu1.elemento]?.[odu2.elemento] ?? 5;
  
  let recomendacao = '';
  if (harmonia >= 8) {
    recomendacao = 'Compatibilidade Alta — Elementos em ressonância';
  } else if (harmonia >= 5) {
    recomendacao = 'Compatibilidade Média — Harmonização possível com trabalho';
  } else {
    recomendacao = 'Compatibilidade Baixa — Requer atenção e equilíbrio';
  }
  
  return { elementos, harmonia, recomendacao };
}

// ════════════════════════════════════════════════════════════════════════════
// VALIDATION SCHEMA FOR API
// ════════════════════════════════════════════════════════════════════════════

export const OduQuerySchema = z.object({
  numero: z.coerce.number().min(1).max(16).optional(),
  elemento: z.string().optional(),
  orixa: z.string().optional(),
  planeta: z.string().optional(),
  sephirot: z.string().optional(),
});

export const OduAnalysisInputSchema = z.object({
  odu1: z.number().min(1).max(16),
  odu2: z.number().min(1).max(16).optional(),
  tradicao: z.enum(['orixa', 'planeta', 'sephirot', 'tarot', 'numerologia']).optional(),
});

export type OduQuery = z.infer<typeof OduQuerySchema>;
export type OduAnalysisInput = z.infer<typeof OduAnalysisInputSchema>;

export default {
  ODUS_UNIFIED,
  getOdu,
  getAllOdus,
  getOdusByElement,
  getOdusByOrixa,
  getOdusByPlaneta,
  getOdusBySephirot,
  findResonance,
  analyzeOduCompatibility,
  OduSchema,
  OduQuerySchema,
  OduAnalysisInputSchema,
};
