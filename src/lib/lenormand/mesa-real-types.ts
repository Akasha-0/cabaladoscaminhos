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
  /**
   * Index por número da casa (1..36) → { carta, odu }.
   * Usado pelo engine para construção rápida do dossiê.
   */
  [casaNumero: number]: { carta: number; odu: number };
}

/**
 * Dossier architecture item for a single house.
 * Shape usada pelo engine (mesa-real.ts): nested objects + camelCase.
 * Compatível com a forma canônica consumida pela UI e pelo LLM.
 */
export interface ArquiteturaDossiê {
  casaNumero: number;
  casaNome: string;
  casaSignificado: string;
  posicaoGrid: { row: number; col: number };
  carta: {
    numero: number;
    nome: string;
    significado: string;
  };
  odu: {
    numero: number;
    nome: string;
    significado: string;
  };
  correlacao: CorrelacaoCasa;
  dadosConsulente: DadosConsulente;
  integracao?: string;
  sefirot?: string;
  tarot?: string;
  tiragem?: string;
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

// ============================================================================
// Tipos legados — mantidos para compat com componentes pré-Fase 10
// (mesa-real-data.ts e mesa-real.ts). Shape alinhada com os dados
// canônicos em mesa-real-data.ts (36 casas / 16 odus).
// ============================================================================

/**
 * Casa da Mesa Real — 1..36.
 * Shape alinhada com `CASAS_MESA_REAL` em mesa-real-data.ts.
 */
export interface CasaCigana {
  houseNumber: number;
  name: string;
  meaning: string;
  element: 'fogo' | 'água' | 'terra' | 'ar' | 'éter' | 'madeira' | 'metal';
  archetype: string;
  astrologyHouse: number;
  associatedPlanet: string;
  numerologyAspects: string[];
  oduAspects: string[];
}

/**
 * Carta Cigana (alias de CasaCigana no Baralho Cigano brasileiro).
 * Shape alinhada com `CARTAS_CIGANAS` em mesa-real-data.ts.
 */
export interface CartaCigana {
  numero: number;
  nome: string;
  significado: string;
  palavrasChave: string[];
}

/**
 * Odú do Ifá — 1..16.
 * Shape alinhada com `ODUS_IFA` em mesa-real-data.ts.
 */
export interface OduInfo {
  numero: number;
  nome: string;
  significado: string;
  elemento: string;
  orixaRegente: string;
  quizilas: string[];
  preceptos: string[];
}

/**
 * Dados do consulente (parcial) usados pelo engine de leitura.
 */
export interface DadosConsulente {
  nome?: string;
  signoSolar?: string;
  ascendente?: string;
  caminhoDeVida?: number;
  oduNascimento?: string;
  orixaRegente?: string;
  numerologia?: string;
  sefira?: string;
}

/**
 * Correlação de arquétipo para uma casa.
 */
export interface CorrelacaoCasa {
  casaNumero: number;
  casaNome: string;
  casaSignificado: string;
  arquetipo: string;
  casaAstrologica: number;
  planetaRegente: string;
  numerologia: string[];
  odus: string[];
  sefirot?: string;
  tarot?: string;
  integracao: string;
}

/**
 * Resultado de uma leitura completa.
 */
export interface ResultadoLeitura {
  data: string;
  consulente?: string;
  tipoTiragem: '9x4' | '8x4+4';
  posicoes: PosicaoTiragem[];
  dossiê: ArquiteturaDossiê[];
  sintese: string;
}

/**
 * Posição de uma carta+Odu na Mesa Real.
 * Forma leve para construir uma tiragem.
 */
export interface PosicaoTiragem {
  casa: number;
  carta: number;
  odu: number;
}