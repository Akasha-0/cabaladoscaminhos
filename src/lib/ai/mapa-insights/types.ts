/**
 * Mapa Insights Module Types
 * @module ai/mapa-insights/types
 */

import type { MapaAlmaCompleto } from '@/lib/engines/types/mapa-alma';

// Re-export MapaAlmaCompleto for convenience
// fallow-ignore-next-line unused-type
export type { MapaAlmaCompleto } from '@/lib/engines/types/mapa-alma';

/**
 * Insight sections for POI/POA analysis
 */
// fallow-ignore-next-line unused-type
export interface InsightSection {
  titulo: string;
  descricao: string;
  sistemas: string[];
  convergencias?: 'tríplice' | 'dual' | 'simples';
}

/**
 * Coração / Alma section
 */
export interface InsightCoracao {
  tema: string;
  descricao: string;
  sistemas: string[];
  affirmation?: string;
}

/**
 * Mente / Pensamentos section
 */
export interface InsightMente {
  tema: string;
  descricao: string;
  sistemas: string[];
  affirmation?: string;
}

/**
 * Corpo / Sagrado section
 */
export interface InsightCorpo {
  tema: string;
  descricao: string;
  sistemas: string[];
  affirmation?: string;
  ritual?: string;
  cores?: string[];
  ervas?: string[];
}

/**
 * Caminho / Destino section
 */
export interface InsightCaminho {
  tema: string;
  descricao: string;
  sistemas: string[];
  affirmation?: string;
  orixasProtegentes?: string[];
}

/**
 * Retorno / Lições section
 */
export interface InsightRetorno {
  tema: string;
  descricao: string;
  sistemas: string[];
  affirmation?: string;
}

/**
 * Completo insight data returned by the AI
 * Supports both POI/POA structured format and flat AI response format (resumo, proposito, etc.)
 */
export interface InsightData {
  // ── POI/POA structured fields ────────────────────────────
  titulo: string;
  subtitulo?: string;
  overview: string;
  coração: InsightCoracao;
  mente: InsightMente;
  corpo: InsightCorpo;
  caminho: InsightCaminho;
  retorno: InsightRetorno;
  convergencias: {
    triplices: Array<{
      sistemas: string[];
      energia: string;
      forca: string;
      descricao: string;
    }>;
    duplas: Array<{
      sistemas: string[];
      energia: string;
      forca: string;
      descricao: string;
    }>;
  };
  orixasProtegentes?: string[];
  sephirotAlinhadas?: string[];
  cicloAtual?: string;
  temaGeral?: string;

  // ── Legacy/AI response format fields ─────────────────────
  id?: string;
  dataGeracao?: string;
  resumo?: string;
  proposito?: string;
  dons?: Array<{
    titulo: string;
    descricao: string;
    sistema: string;
    forca: string;
  }>;
  desafios?: Array<{
    titulo: string;
    descricao: string;
    sistema: string;
    forca: string;
  }>;
  preceitos?: Array<{
    odu: string;
    quizilas: string[];
    preceitos: string[];
    ebos: string[];
    orientacao?: string;
  }>;
  praticas?: Array<{
    nome: string;
    descricao: string;
    frequencia?: string;
  }>;
  orixas?: Array<{
    nome: string;
    caminho?: string;
    saudacao?: string;
    cores?: string[];
    dia?: string;
    pratica?: string;
    conexao?: string;
  }>;
  ciclos?: Array<{
    tipo: string;
    valor: number;
    descricao: string;
    sephirah?: string;
  }>;
  mensagemSemanal?: string;
}

// ── Generator option/result types ───────────────────────────────────────────

export interface GenerateInsightsOptions {
  usarCache?: boolean;
  temperatura?: number;
  maxTokens?: number;
  forcar?: boolean;
}

export interface GenerateInsightsResult {
  insight: InsightData;
  fromCache: boolean;
  retries: number;
  cacheKey: string;
}
