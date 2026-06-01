/**
 * Mesa Real Type Definitions
 * TypeScript types for the Mesa Real (Lenormand) dossier system
 * @module lenormand/mesa-real-types
 */

import type { MapaAlmaCompleto } from '@/lib/engines/types/mapa-alma';

/**
 * Card position in a Mesa Real spread
 */
export interface CartaPosicao {
  posicao: number;
  casaNumero: number;
  cartaNumero: number;
  nomeCarta: string;
  significado: string;
  orientacao: 'normal' | 'invertida';
}

/**
 * Odu (Ifá) card associated with a Mesa Real position
 */
export interface OduCarta {
  oduNumero: number;
  nome: string;
  significado: string;
  orixa?: string;
  conselho?: string;
}

/**
 * Complete Mesa Real matrix data for dossier generation
 */
export interface TiragemMesaReal {
  clienteId?: string;
  formato: '9x4' | '8x4+4';
  cartas: CartaPosicao[];
  odus: OduCarta[];
  timestamp: string;
  seed?: number;
}

/**
 * Dossier architecture item for a single house
 * Contains the spiritual injection data for AI analysis
 */
export interface ArquiteturaDossiê {
  casa_numero: number;
  casa_nome: string;
  casa_significado: string;
  carta_numero: number;
  carta_nome: string;
  carta_significado: string;
  carta_orientacao: 'normal' | 'invertida';
  odu_numero?: number;
  odu_nome?: string;
  odu_significado?: string;
  odu_conselho?: string;
  odu_orixa?: string;
  injeccao_terreno?: {
    tipo: 'ascendente' | 'numero_alma' | 'fundo_ceus' | 'numero_motivacao' | 'dom_divino' | 'numero_karma';
    valor: string | number;
    fonte: 'astrologia' | 'numerologia' | 'tantrica' | 'cabala';
  }[];
  element?: string;
  sefirot?: string[];
  chakra?: number;
}

/**
 * Dossier section types for structured output
 */
export interface SecaoDossiê {
  casa: number;
  titulo: string;
  interpretacao: string;
  recomendacao?: string;
  convergencias?: string[];
}

/**
 * Complete dossier report
 */
export interface DossiêCompleto {
  clienteId: string;
  clienteNome: string;
  dataGeracao: string;
  secoes: SecaoDossiê[];
  sumario: string;
  conselhosGerais: string[];
}

/**
 * Dossier generation options
 */
export interface OpcoesGeracaoDossiê {
  usarCache?: boolean;
  temperatura?: number;
  maxTokens?: number;
  forcar?: boolean;
}

/**
 * Dossier generation result
 */
export interface ResultadoGeracaoDossiê {
  success: boolean;
  reportId?: string;
  content?: string;
  cacheHit?: boolean;
  error?: string;
}

/**
 * Input for dossier generation API
 */
export interface EntradaGeracaoDossiê {
  clientId: string;
  matrixData: TiragemMesaReal;
  mapaAlma?: MapaAlmaCompleto;
}