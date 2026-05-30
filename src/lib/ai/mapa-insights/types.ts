/**
 * Mapa Insights Module Types
 * @module ai/mapa-insights/types
 */

import type { MapaAlmaCompleto } from '@/lib/engines/types/mapa-alma';

// Re-export MapaAlmaCompleto for convenience
export type { MapaAlmaCompleto } from '@/lib/engines/types/mapa-alma';

/**
 * Insight sections for POI/POA analysis
 */
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
 */
export interface InsightData {
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
}
