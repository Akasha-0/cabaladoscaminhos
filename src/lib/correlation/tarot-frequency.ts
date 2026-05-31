
/**
 * Tarot-Frequency Correlation Module
 * Maps Tarot Major Arcana cards to Solfeggio frequencies
 * Inverse correlation from frequency-tarot.ts
 * Based on IDEIA.md - Matriz de Geometria Sagrada e correspondências espirituais
 */

export interface TarotFrequencyMapping {
  arcano: string;
  numero_carta: number;
  frequencia: number;
  chakra_numero: number;
  chakra_nome: string;
  elemento: string;
  energia_espiritual: string;
  vibracao: string;
}

export const TAROT_FREQUENCY_MAP: Record<string, TarotFrequencyMapping> = {
  'O Louco': {
    arcano: 'O Louco',
    numero_carta: 0,
    frequencia: 396,
    chakra_numero: 1,
    chakra_nome: 'Muladhara',
    elemento: 'Terra',
    energia_espiritual: 'Liberdade, novo começo, salto de fé, transformação',
    vibracao: 'Libertação de medos e limitações',
  },
  'O Mago': {
    arcano: 'O Mago',
    numero_carta: 1,
    frequencia: 417,
    chakra_numero: 2,
    chakra_nome: 'Svadhisthana',
    elemento: 'Água',
    energia_espiritual: 'Manifestação, poder pessoal, habilidade, comunicação',
    vibracao: 'Facilitando mudanças e transformação',
  },
  'A Sacerdotisa': {
    arcano: 'A Sacerdotisa',
    numero_carta: 2,
    frequencia: 528,
    chakra_numero: 3,
    chakra_nome: 'Manipura',
    elemento: 'Fogo',
    energia_espiritual: 'Intuição, mistério, sabedoria interior, feminina divina',
    vibracao: 'Milagres, reparação de DNA,泉水',
  },
  'A Imperatriz': {
    arcano: 'A Imperatriz',
    numero_carta: 3,
    frequencia: 639,
    chakra_numero: 4,
    chakra_nome: 'Anahata',
    elemento: 'Ar',
    energia_espiritual: 'Fertilidade, abundância, natureza, creatividade',
    vibracao: 'Harmonia em relacionamentos e conexão',
  },
  'O Imperador': {
    arcano: 'O Imperador',
    numero_carta: 4,
    frequencia: 741,
    chakra_numero: 5,
    chakra_nome: 'Vishuddha',
    elemento: 'Ar',
    energia_espiritual: 'Autoridade, estrutura, liderança, estabilidade',
    vibracao: 'Despertar da expressão e fluidez',
  },
  'O Hierofante': {
    arcano: 'O Hierofante',
    numero_carta: 5,
    frequencia: 852,
    chakra_numero: 6,
    chakra_nome: 'Ajna',
    elemento: 'Éter',
    energia_espiritual: 'Tradição, espiritualidade, ensino, sacralidade',
    vibracao: 'Despertar da intuição espiritual',
  },
  'Os Enamorados': {
    arcano: 'Os Enamorados',
    numero_carta: 6,
    frequencia: 963,
    chakra_numero: 7,
    chakra_nome: 'Sahasrara',
    elemento: 'Éter',
    energia_espiritual: 'Amor, união, escolhas, harmonia',
    vibracao: 'Conexão divina e iluminação',
  },
  'O Carro': {
    arcano: 'O Carro',
    numero_carta: 7,
    frequencia: 396,
    chakra_numero: 1,
    chakra_nome: 'Muladhara',
    elemento: 'Terra',
    energia_espiritual: 'Vitória, determinação, controle, conquista',
    vibracao: 'Libertação de obstáculos e triunfo',
  },
  'A Justiça': {
    arcano: 'A Justiça',
    numero_carta: 8,
    frequencia: 417,
    chakra_numero: 2,
    chakra_nome: 'Svadhisthana',
    elemento: 'Água',
    energia_espiritual: 'Equilíbrio, verdade, lei cósmica, retidão',
    vibracao: 'Transformação através da verdade',
  },
  'O Eremita': {
    arcano: 'O Eremita',
    numero_carta: 9,
    frequencia: 528,
    chakra_numero: 3,
    chakra_nome: 'Manipura',
    elemento: 'Fogo',
    energia_espiritual: 'Introspecção, solidão sábia, iluminação interior',
    vibracao: 'Foco em soluções e auto-reflexão',
  },
  'A Roda da Fortuna': {
    arcano: 'A Roda da Fortuna',
    numero_carta: 10,
    frequencia: 639,
    chakra_numero: 4,
    chakra_nome: 'Anahata',
    elemento: 'Ar',
    energia_espiritual: 'Ciclos, destino, mudança, sorte',
    vibracao: 'Harmonização em tempos de mudança',
  },
  'A Força': {
    arcano: 'A Força',
    numero_carta: 11,
    frequencia: 741,
    chakra_numero: 5,
    chakra_nome: 'Vishuddha',
    elemento: 'Ar',
    energia_espiritual: 'Coragem, força interior, compassion, autocontrole',
    vibracao: 'Despertar da autenticidade e poder suave',
  },
  'O Enforcado': {
    arcano: 'O Enforcado',
    numero_carta: 12,
    frequencia: 852,
    chakra_numero: 6,
    chakra_nome: 'Ajna',
    elemento: 'Éter',
    energia_espiritual: 'Sacrifício, nova perspectiva, rendição, pausa',
    vibracao: 'Desbloqueio da visão além do visível',
  },
  'A Morte': {
    arcano: 'A Morte',
    numero_carta: 13,
    frequencia: 963,
    chakra_numero: 7,
    chakra_nome: 'Sahasrara',
    elemento: 'Éter',
    energia_espiritual: 'Transformação profunda, fim de ciclo, renascimento',
    vibracao: 'Conexão com estados superiores de consciência',
  },
  'A Temperança': {
    arcano: 'A Temperança',
    numero_carta: 14,
    frequencia: 396,
    chakra_numero: 1,
    chakra_nome: 'Muladhara',
    elemento: 'Terra',
    energia_espiritual: 'Equilíbrio, paciência, propósito, integração',
    vibracao: 'Libertação de padrões limitantes',
  },
  'O Diabo': {
    arcano: 'O Diabo',
    numero_carta: 15,
    frequencia: 417,
    chakra_numero: 2,
    chakra_nome: 'Svadhisthana',
    elemento: 'Água',
    energia_espiritual: 'Ilusão, materialismo, prisão interior, sombra',
    vibracao: 'Libertação de padrões de manipulação',
  },
  'A Torre': {
    arcano: 'A Torre',
    numero_carta: 16,
    frequencia: 528,
    chakra_numero: 3,
    chakra_nome: 'Manipura',
    elemento: 'Fogo',
    energia_espiritual: 'Destruição criativa, revelação, despertar abrupto',
    vibracao: 'Quebra de estruturas falsas para renovação',
  },
  'A Estrela': {
    arcano: 'A Estrela',
    numero_carta: 17,
    frequencia: 639,
    chakra_numero: 4,
    chakra_nome: 'Anahata',
    elemento: 'Ar',
    energia_espiritual: 'Esperança, inspiração, serenidade, cura',
    vibracao: 'Reconexão com a luz interior e propósito',
  },
  'A Lua': {
    arcano: 'A Lua',
    numero_carta: 18,
    frequencia: 741,
    chakra_numero: 5,
    chakra_nome: 'Vishuddha',
    elemento: 'Ar',
    energia_espiritual: 'Ilusão, inconsciente, sonho,intuição',
    vibracao: 'Despertar para Wahrheit e percepção clara',
  },
  'O Sol': {
    arcano: 'O Sol',
    numero_carta: 19,
    frequencia: 852,
    chakra_numero: 6,
    chakra_nome: 'Ajna',
    elemento: 'Éter',
    energia_espiritual: 'Alegria, sucesso, vitalidade, clareza, criança interior',
    vibracao: 'Iluminação e realização de desejos',
  },
  'O Julgamento': {
    arcano: 'O Julgamento',
    numero_carta: 20,
    frequencia: 963,
    chakra_numero: 7,
    chakra_nome: 'Sahasrara',
    elemento: 'Éter',
    energia_espiritual: 'Renovação, redenção, despertar, chamada interior',
    vibracao: 'Ascensão e integração da experiência',
  },
  'O Mundo': {
    arcano: 'O Mundo',
    numero_carta: 21,
    frequencia: 963,
    chakra_numero: 7,
    chakra_nome: 'Sahasrara',
    elemento: 'Éter',
    energia_espiritual: 'Completude, realização, integração, dança da vida',
    vibracao: 'Alcanhando a consciência universal',
  },
} as const;

Object.freeze(TAROT_FREQUENCY_MAP);
Object.values(TAROT_FREQUENCY_MAP).forEach((mapping) => Object.freeze(mapping));

export function getTarotFrequency(arcano: string): TarotFrequencyMapping | null {
  return TAROT_FREQUENCY_MAP[arcano] ?? null;
}

export function getFrequencyFromTarot(arcano: string): number | null {
  return TAROT_FREQUENCY_MAP[arcano]?.frequencia ?? null;
}

export function getArcanoByNumber(numero: number): string | null {
  const entry = Object.values(TAROT_FREQUENCY_MAP).find((m) => m.numero_carta === numero);
  return entry?.arcano ?? null;
}

export function getFrequencyByNumber(numero: number): number | null {
  const entry = Object.values(TAROT_FREQUENCY_MAP).find((m) => m.numero_carta === numero);
  return entry?.frequencia ?? null;
}

export function getAllTarotFrequencies(): TarotFrequencyMapping[] {
  return Object.values(TAROT_FREQUENCY_MAP).sort((a, b) => a.numero_carta - b.numero_carta);
}

export function getAllArcanos(): string[] {
  return Object.values(TAROT_FREQUENCY_MAP)
    .sort((a, b) => a.numero_carta - b.numero_carta)
    .map((m) => m.arcano);
}

export function getAllFrequencies(): number[] {
  const frequencies = [...new Set(Object.values(TAROT_FREQUENCY_MAP).map((m) => m.frequencia))];
  return frequencies.sort((a, b) => a - b);
}

export function hasTarotFrequency(arcano: string): boolean {
  return arcano in TAROT_FREQUENCY_MAP;
}

export function getChakraByTarot(arcano: string): number | null {
  return TAROT_FREQUENCY_MAP[arcano]?.chakra_numero ?? null;
}

export function getChakraNameByTarot(arcano: string): string | null {
  return TAROT_FREQUENCY_MAP[arcano]?.chakra_nome ?? null;
}

export function getElementByTarot(arcano: string): string | null {
  return TAROT_FREQUENCY_MAP[arcano]?.elemento ?? null;
}

export function getTarotsByElement(elemento: string): TarotFrequencyMapping[] {
  return Object.values(TAROT_FREQUENCY_MAP).filter((m) => m.elemento === elemento);
}

export function getTarotsByFrequency(frequencia: number): TarotFrequencyMapping[] {
  return Object.values(TAROT_FREQUENCY_MAP).filter((m) => m.frequencia === frequencia);
}

export function getTarotsByChakra(chakra: number): TarotFrequencyMapping[] {
  return Object.values(TAROT_FREQUENCY_MAP).filter((m) => m.chakra_numero === chakra);
}

export function getEnergiaEspiritual(arcano: string): string | null {
  return TAROT_FREQUENCY_MAP[arcano]?.energia_espiritual ?? null;
}

export function getVibracao(arcano: string): string | null {
  return TAROT_FREQUENCY_MAP[arcano]?.vibracao ?? null;
}

export default {
  getTarotFrequency,
  getFrequencyFromTarot,
  getArcanoByNumber,
  getFrequencyByNumber,
  getAllTarotFrequencies,
  getAllArcanos,
  getAllFrequencies,
  hasTarotFrequency,
  getChakraByTarot,
  getChakraNameByTarot,
  getElementByTarot,
  getTarotsByElement,
  getTarotsByFrequency,
  getTarotsByChakra,
  getEnergiaEspiritual,
  getVibracao,
  TAROT_FREQUENCY_MAP,
};
