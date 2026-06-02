/**
 * Mesa Real Type Definitions
 * TypeScript types for the Mesa Real (Lenormand) dossier system
 * @module lenormand/mesa-real-types
 */

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
  data?: string;
  matrixData?: Record<number, {
    carta: { numero: number; nome: string; significado: string };
    odu?: { numero: number; nome: string; significado: string };
  }>;
  options?: OpcoesGeracaoDossiê;
}

/**
 * Casa Cigana — the 36 houses of the Mesa Real
 * Matches the shape used in mesa-real-data.ts (houseNumber, name, meaning, etc.)
 */
export interface CasaCigana {
  houseNumber: number;
  name: string;
  meaning: string;
  element: string;
  archetype: string;
  associatedPlanet?: string;
  astrologyHouse?: number;
  numerologyAspects: string[];
  oduAspects: string[];
}

/**
 * Carta Cigana — Lenormand card drawn for a house
 */
export interface CartaCigana {
  numero: number;
  nome: string;
  significado: string;
  palavrasChave?: string[];
}

/**
 * Odu information for Ifá correlation
 */
export interface OduInfo {
  numero: number;
  nome: string;
  significado: string;
  elemento: string;
  orixas: string[];
  quizilas: string[];
}

/**
 * Dados do Consulente (client data for reading)
 */
export interface DadosConsulente {
  nome: string;
  dataNascimento: string;
  localNascimento?: string;
  horaNascimento?: string;
}

/**
 * Correlação entre casa e cartas/Odus
 */
export interface CorrelacaoCasa {
  casaNumero: number;
  carta: CartaCigana;
  odu?: OduInfo;
  convergencias?: string[];
}

/**
 * Resultado de uma leitura completa
 */
export interface ResultadoLeitura {
  clienteId: string;
  consulente: DadosConsulente;
  tiragem: TiragemMesaReal;
  dossiê?: DossiêCompleto;
  dataLeitura: string;
}

/**
 * Posição em uma tiragem
 */
export interface PosicaoTiragem {
  posicao: number;
  casa: CasaCigana;
  carta?: CartaCigana;
  odu?: OduInfo;
}