/**
 * ════════════════════════════════════════════════════════════════════════════
 * UNIFIED ORIXÁ TYPE SYSTEM — Cabala dos Caminhos
 * ════════════════════════════════════════════════════════════════════════════
 * 
 * Centralized type definitions for all Orixás in the system.
 * Provides Zod validation, cross-tradition correlations, and unified data access.
 * 
 * Data Sources:
 * - Candomblé Ketu tradition
 * - Umbanda cosmology  
 * - Ifá/Odu system
 * - Cross-tradition correlations (IDEIA.md)
 * 
 * Version: 1.0.0
 * Last Updated: 2026-05-30
 */

// ════════════════════════════════════════════════════════════════════════════
// CORE TYPES
// ════════════════════════════════════════════════════════════════════════════

import { z } from 'zod';

// ─── Base Enums ─────────────────────────────────────────────────────────────

export const ORIXAS_PRINCIPAIS = [
  'Oxalá', 'Iemanjá', 'Ogum', 'Xangô', 'Oxum', 'Shango',
  'Obatalá', 'Nanã', 'Ibeji', 'Omolu', 'Oxóssi', 'Logunedé',
  'Ewa', 'Oba', 'Ori', 'Osain', 'Oxumar', 'Olokun'
] as const;

export const ELEMENTOS = ['Fogo', 'Água', 'Terra', 'Ar', 'Éter'] as const;

export const PLANETAS_ORIXAS = [
  'Sol', 'Lua', 'Marte', 'Mercúrio', 'Júpiter', 'Vênus', 'Saturno'
] as const;

export const DIAS_SEMANA = [
  'Segunda-feira', 'Terça-feira', 'Quarta-feira', 
  'Quinta-feira', 'Sexta-feira', 'Sábado', 'Domingo'
] as const;

// ─── Zod Schemas ────────────────────────────────────────────────────────────

export const OrixaSchema = z.object({
  id: z.string(),
  nome: z.string(),
  nomeYoruba: z.string().optional(),
  saudacao: z.string(),
  planeta: z.enum(PLANETAS_ORIXAS),
  elemento: z.enum(ELEMENTOS),
  cores: z.array(z.string()),
  chakraPrincipal: z.number().min(1).max(7),
  numerosSagrados: z.array(z.number()),
  diaSemana: z.enum(DIAS_SEMANA),
  qualidade: z.string().optional(),
  desafio: z.string().optional(),
  archetype: z.string().optional(),
});

export type Orixa = z.infer<typeof OrixaSchema>;

// ─── Cross-Tradition Types ─────────────────────────────────────────────────

export interface OrixaNumerologia {
  orixa: string;
  numero: number;
  elemento: string;
  significado: string;
  cor: string;
  chakra: string;
  planeta: string;
  ebós: string[];
  quizilas: string[];
}

export interface OrixaChakra {
  orixa: string;
  chakra: string;
  numero: number;
  elemento: string;
  cor: string;
  harmonizacao: string[];
  mantras: string[];
}

export interface OrixaFrequency {
  orixa: string;
  frequencia: number;
  elemento: string;
  chakra: string;
  dia_semana: string;
  cor: string;
  aplicacao_healing: {
    fisico: string;
    emocional: string;
    espiritual: string;
  };
}

export interface OrixaAstrologia {
  orixa: string;
  signo: string;
  planeta: string;
  casa: number;
  aspecto: string;
  transito: string;
}

// ════════════════════════════════════════════════════════════════════════════
// UNIFIED ORIXÁ DATA MAP
// ════════════════════════════════════════════════════════════════════════════

export const ORIXAS_UNIFIED: Record<string, OrixaCore> = {
  'oxala': {
    id: 'oxala',
    nome: 'Oxalá',
    nomeYoruba: 'Olodumarê / Orisháala',
    saudacao: 'Epa!',
    planeta: 'Sol',
    elemento: 'Ar',
    cores: ['Branco', 'Rosa'],
    chakraPrincipal: 7,
    numerosSagrados: [1, 8],
    diaSemana: 'Segunda-feira',
    qualidade: 'Paz, Pureza, Criação',
    desafio: 'Inação excessiva',
    archetype: 'O Criador Ancestral',
  },
  'iemanja': {
    id: 'iemanja',
    nome: 'Iemanjá',
    nomeYoruba: 'Yemoja',
    saudacao: 'Oiá!',
    planeta: 'Lua',
    elemento: 'Água',
    cores: ['Azul', 'Branco', 'Verde-mar'],
    chakraPrincipal: 2,
    numerosSagrados: [2, 9],
    diaSemana: 'Sábado',
    qualidade: 'Maternidade, Intuição, emoção',
    desafio: 'Vulnerabilidade emocional',
    archetype: 'A Mãe do Mundo',
  },
  'ogum': {
    id: 'ogum',
    nome: 'Ogum',
    nomeYoruba: 'Ogou',
    saudacao: 'Êi!',
    planeta: 'Marte',
    elemento: 'Fogo',
    cores: ['Vermelho', 'Azul-escuro'],
    chakraPrincipal: 3,
    numerosSagrados: [4, 7],
    diaSemana: 'Terça-feira',
    qualidade: 'Coragem, Tecnologia, Civilização',
    desafio: 'Agressividade',
    archetype: 'O Guerreiro Civilizador',
  },
  'xango': {
    id: 'xango',
    nome: 'Xangô',
    nomeYoruba: 'Shango',
    saudacao: 'Ê Pau!',
    planeta: 'Júpiter',
    elemento: 'Fogo',
    cores: ['Vermelho', 'Marrom', 'Laranja'],
    chakraPrincipal: 5,
    numerosSagrados: [6, 11],
    diaSemana: 'Quarta-feira',
    qualidade: 'Justiça, Trováo, Diplomacia',
    desafio: 'Impulsividade',
    archetype: 'O Deus do Trovão',
  },
  'oxum': {
    id: 'oxum',
    nome: 'Oxum',
    nomeYoruba: 'Oshun',
    saudacao: 'Êdasho!',
    planeta: 'Vênus',
    elemento: 'Água',
    cores: ['Amarelo', 'Dourado', 'Azul-claro'],
    chakraPrincipal: 4,
    numerosSagrados: [3, 7],
    diaSemana: 'Sexta-feira',
    qualidade: 'Amor, Beleza, Fertilidade',
    desafio: 'Vaidade',
    archetype: 'A Deusa do Amor e das Águas Doces',
  },
  'obatala': {
    id: 'obatala',
    nome: 'Obatalá',
    nomeYoruba: 'Obatalá',
    saudacao: 'Êpa!',
    planeta: 'Saturno',
    elemento: 'Terra',
    cores: ['Branco', 'Cinza'],
    chakraPrincipal: 6,
    numerosSagrados: [8, 10],
    diaSemana: 'Segunda-feira',
    qualidade: 'Pureza, Sabedoria, Misericórdia',
    desafio: 'Rigidez moral',
    archetype: 'O Ancião de Caminhos Brancos',
  },
  'nana': {
    id: 'nana',
    nome: 'Nanã',
    nomeYoruba: 'Nanã Buruku',
    saudacao: 'Saluba!',
    planeta: 'Lua',
    elemento: 'Água',
    cores: ['Azul-escuro', 'Roxo'],
    chakraPrincipal: 1,
    numerosSagrados: [7, 9],
    diaSemana: 'Domingo',
    qualidade: 'Sabedoria Ancestral, Mortes e Transformações',
    desafio: 'Melancolia',
    archetype: 'A Anciã do Tempo',
  },
  'ibeji': {
    id: 'ibeji',
    nome: 'Ibeji',
    nomeYoruba: 'Ibeji',
    saudacao: 'Epa!',
    planeta: 'Sol',
    elemento: 'Terra',
    cores: ['Vermelho', 'Preto'],
    chakraPrincipal: 4,
    numerosSagrados: [2],
    diaSemana: 'Quinta-feira',
    qualidade: 'Dualidade, Vitalidade Infantil',
    desafio: 'Perda e luto',
    archetype: 'Os Gêmeos Sagrados',
  },
  'omolu': {
    id: 'omolu',
    nome: 'Omolu',
    nomeYoruba: 'Obaluaye',
    saudacao: 'Ê obaluaiê!',
    planeta: 'Saturno',
    elemento: 'Terra',
    cores: ['Preto', 'Vermelho'],
    chakraPrincipal: 3,
    numerosSagrados: [4, 9],
    diaSemana: 'Segunda-feira',
    qualidade: 'Saúde, Medicina, peste',
    desafio: 'Medo da morte',
    archetype: 'O Senhor das Doenças e da Cura',
  },
  'oxossi': {
    id: 'oxossi',
    nome: 'Oxóssi',
    nomeYoruba: 'Ogun',
    saudacao: 'Êokê!',
    planeta: 'Mercúrio',
    elemento: 'Terra',
    cores: ['Verde', 'Amarelo'],
    chakraPrincipal: 5,
    numerosSagrados: [5, 11],
    diaSemana: 'Quinta-feira',
    qualidade: 'Caça, Floresta, Abundância',
    desafio: 'Inveja',
    archetype: 'O Caçador da Floresta',
  },
  'logunedé': {
    id: 'logunedé',
    nome: 'Logunedé',
    nomeYoruba: 'Ogun',
    saudacao: 'Ê!',
    planeta: 'Mercúrio',
    elemento: 'Água',
    cores: ['Azul', 'Verde'],
    chakraPrincipal: 6,
    numerosSagrados: [6, 9],
    diaSemana: 'Quarta-feira',
    qualidade: 'Caça Fluvial, Medicinal',
    desafio: 'Confusão de identidade',
    archetype: 'O Caçador das Águas',
  },
  'ewa': {
    id: 'ewa',
    nome: 'Ewa',
    nomeYoruba: 'Eshu',
    saudacao: 'Êaluaiê!',
    planeta: 'Vênus',
    elemento: 'Ar',
    cores: ['Multicolorido'],
    chakraPrincipal: 5,
    numerosSagrados: [3, 7],
    diaSemana: 'Sexta-feira',
    qualidade: 'Beleza, Sedução, Charme',
    desafio: 'Ciúmes',
    archetype: 'A Deusa da Beleza',
  },
  'oba': {
    id: 'oba',
    nome: 'Oba',
    nomeYoruba: 'Oba',
    saudacao: 'Êobá!',
    planeta: 'Sol',
    elemento: 'Fogo',
    cores: ['Vermelho', 'Laranja'],
    chakraPrincipal: 4,
    numerosSagrados: [6, 11],
    diaSemana: 'Segunda-feira',
    qualidade: 'Fidelidade, Coragem',
    desafio: 'Orgulho',
    archetype: 'A Rainha Guerreira',
  },
  'ori': {
    id: 'ori',
    nome: 'Ori',
    nomeYoruba: 'Ori',
    saudacao: 'Eê!',
    planeta: 'Sol',
    elemento: 'Fogo',
    cores: ['Dourado', 'Amarelo'],
    chakraPrincipal: 7,
    numerosSagrados: [1, 8],
    diaSemana: 'Segunda-feira',
    qualidade: 'Cabeça, Destino, Propósito',
    desafio: 'Obstinação',
    archetype: 'O Senhor da Cabeça e do Destino',
  },
  'osain': {
    id: 'osain',
    nome: 'Osain',
    nomeYoruba: 'Osain',
    saudacao: 'Ê!',
    planeta: 'Sol',
    elemento: 'Plantas',
    cores: ['Verde', 'Marrom'],
    chakraPrincipal: 5,
    numerosSagrados: [5, 11],
    diaSemana: 'Terça-feira',
    qualidade: 'Ervas, Medicinas, Magia',
    desafio: 'Segredos perigosos',
    archetype: 'O Senhor das Ervas',
  },
  'oxumar': {
    id: 'oxumar',
    nome: 'Oxumar',
    nomeYoruba: 'Oxumar',
    saudacao: 'Ê!',
    planeta: 'Lua',
    elemento: 'Água',
    cores: ['Azul', 'Verde'],
    chakraPrincipal: 6,
    numerosSagrados: [2, 8],
    diaSemana: 'Domingo',
    qualidade: 'Arco-íris, Jogo, Dívidas',
    desafio: 'Instabilidade',
    archetype: 'O Deus do Arco-íris e do Jogo',
  },
  'olokun': {
    id: 'olokun',
    nome: 'Olokun',
    nomeYoruba: 'Olokun',
    saudacao: 'Êolokun!',
    planeta: 'Lua',
    elemento: 'Água',
    cores: ['Azul-escuro', 'Preto'],
    chakraPrincipal: 1,
    numerosSagrados: [9, 12],
    diaSemana: 'Domingo',
    qualidade: 'Riqueza Submarina, Abismo',
    desafio: 'Avidez material',
    archetype: 'O Senhor das Profundezas',
  },
};

interface OrixaCore {
  id: string;
  nome: string;
  nomeYoruba?: string;
  saudacao: string;
  planeta: string;
  elemento: string;
  cores: string[];
  chakraPrincipal: number;
  numerosSagrados: number[];
  diaSemana: string;
  qualidade?: string;
  desafio?: string;
  archetype?: string;
}

// ════════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ════════════════════════════════════════════════════════════════════════════

/**
 * Get Orixá by name (case-insensitive)
 */
export function getOrixa(nome: string): OrixaCore | undefined {
  const normalized = nome.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return ORIXAS_UNIFIED[normalized];
}

/**
 * Get all Orixás as array
 */
export function getAllOrixas(): OrixaCore[] {
  return Object.values(ORIXAS_UNIFIED);
}

/**
 * Get Orixás by element
 */
export function getOrixasByElement(elemento: string): OrixaCore[] {
  return getAllOrixas().filter(o => o.elemento.toLowerCase() === elemento.toLowerCase());
}

/**
 * Get Orixás by day of week
 */
export function getOrixasByDay(dia: string): OrixaCore[] {
  return getAllOrixas().filter(o => o.diaSemana.toLowerCase() === dia.toLowerCase());
}

/**
 * Get Orixás by planet
 */
export function getOrixasByPlanet(planeta: string): OrixaCore[] {
  return getAllOrixas().filter(o => o.planeta.toLowerCase() === planeta.toLowerCase());
}

/**
 * Get Orixás by chakra
 */
export function getOrixasByChakra(chakraNum: number): OrixaCore[] {
  return getAllOrixas().filter(o => o.chakraPrincipal === chakraNum);
}

/**
 * Get Orixá colors
 */
export function getOrixaCores(nome: string): string[] {
  return getOrixa(nome)?.cores ?? [];
}

/**
 * Get Orixá sacred numbers
 */
export function getOrixaNumeros(nome: string): number[] {
  return getOrixa(nome)?.numerosSagrados ?? [];
}

/**
 * Normalize Orixá name for lookup
 */
export function normalizeOrixaKey(nome: string): string {
  return nome.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/**
 * Get Orixá element
 */
export function getOrixaElemento(nome: string): string | null {
  return getOrixa(nome)?.elemento ?? null;
}

/**
 * Get Orixá planet
 */
export function getOrixaPlaneta(nome: string): string | null {
  return getOrixa(nome)?.planeta ?? null;
}

/**
 * Get Orixá chakra number
 */
export function getOrixaChakra(nome: string): number | null {
  return getOrixa(nome)?.chakraPrincipal ?? null;
}

// ════════════════════════════════════════════════════════════════════════════
// CROSS-TRADITION CORRELATIONS
// ════════════════════════════════════════════════════════════════════════════

/**
 * Get Orixá-Tarot correlation
 */
export function getOrixaTarot(orixa: string): { arcano: number; nome: string } | null {
  const map: Record<string, { arcano: number; nome: string }> = {
    'oxala': { arcano: 0, nome: 'O Louco' },
    'iemanja': { arcano: 17, nome: 'A Estrela' },
    'ogum': { arcano: 6, nome: 'Os Enamorados' },
    'xango': { arcano: 11, nome: 'A Justiça' },
    'oxum': { arcano: 3, nome: 'A Imperatriz' },
    'obatala': { arcano: 21, nome: 'O Mundo' },
    'nana': { arcano: 13, nome: 'A Morte' },
    'oxossi': { arcano: 5, nome: 'O Papa' },
  };
  return map[normalizeOrixaKey(orixa)] ?? null;
}

/**
 * Get Orixá-Sephirah correlation (Kabbalah)
 */
export function getOrixaSephirah(orixa: string): { sephirah: number; nome: string } | null {
  const map: Record<string, { sephirah: number; nome: string }> = {
    'oxala': { sephirah: 1, nome: 'Kether (Coroa)' },
    'iemanja': { sephirah: 2, nome: 'Chokmah (Sabedoria)' },
    'ogum': { sephirah: 4, nome: 'Chesed (Misericórdia)' },
    'xango': { sephirah: 8, nome: 'Hod (Glória)' },
    'oxum': { sephirah: 6, nome: 'Tiphereth (Beleza)' },
    'obatala': { sephirah: 3, nome: 'Binah (Entendimento)' },
    'nana': { sephirah: 7, nome: 'Netzach (Vitória)' },
    'oxossi': { sephirah: 5, nome: 'Geburah (Severidade)' },
  };
  return map[normalizeOrixaKey(orixa)] ?? null;
}

/**
 * Get Orixá-Sign correlation (Astrology)
 */
export function getOrixaSigno(orixa: string): { signo: string; elemento: string } | null {
  const map: Record<string, { signo: string; elemento: string }> = {
    'oxala': { signo: 'Libra', elemento: 'Ar' },
    'iemanja': { signo: 'Câncer', elemento: 'Água' },
    'ogum': { signo: 'Áries', elemento: 'Fogo' },
    'xango': { signo: 'Sagitário', elemento: 'Fogo' },
    'oxum': { signo: 'Touro', elemento: 'Terra' },
    'obatala': { signo: 'Capricórnio', elemento: 'Terra' },
    'nana': { signo: 'Escorpião', elemento: 'Água' },
    'oxossi': { signo: 'Sagitário', elemento: 'Fogo' },
  };
  return map[normalizeOrixaKey(orixa)] ?? null;
}

/**
 * Get Orixá-Odu correlation (Ifá system)
 */
export function getOrixaOdu(orixa: string): { odu: number; nome: string }[] {
  const map: Record<string, { odu: number; nome: string }[]> = {
    'oxala': [{ odu: 1, nome: 'Ogbe' }],
    'iemanja': [{ odu: 2, nome: 'Oyeku' }],
    'ogum': [{ odu: 3, nome: 'Iwori' }],
    'xango': [{ odu: 11, nome: 'Otura' }],
    'oxum': [{ odu: 12, nome: 'Irosun' }],
  };
  return map[normalizeOrixaKey(orixa)] ?? [];
}

// ════════════════════════════════════════════════════════════════════════════
// VALIDATORS
// ════════════════════════════════════════════════════════════════════════════

export function isValidOrixa(nome: string): boolean {
  return getOrixa(nome) !== undefined;
}

export function validateOrixaInput(input: unknown): { valid: boolean; errors?: string[] } {
  try {
    const result = OrixaSchema.safeParse(input);
    return {
      valid: result.success,
      errors: result.success ? undefined : result.error.errors.map(e => e.message),
    };
  } catch {
    return { valid: false, errors: ['Invalid input type'] };
  }
}