// fallow-ignore-file unused-file
/**
 * Dossier Types - Cabala Dos Caminhos
 * Cockpit Oracular - TypeScript Interfaces for Mesa Real Dossier
 * @module ai/dossier/types
 */

// ============================================================
// MESA REAL TYPES
// ============================================================

/**
 * Card position in Mesa Real
 */
export interface PosicaoCarta {
  position: number;
  house: string;
  card: string;
}

/**
 * Carta Cigana (Lenormand card)
 */
export interface CartaCigana {
  numero: number;
  nome: string;
  significado: string;
  palavrasChave?: string[];
}

/**
 * Casa Cigana (Mesa Real house)
 */
export interface CasaCigana {
  numero: number;
  nome: string;
  significado: string;
  elemento: string;
  arquetipo: string;
  planetaRegente?: string;
  casaAstrologica?: number;
  aspectosNumerologia: string[];
  aspectosOdu: string[];
}

/**
 * Odu information for correlation
 */
export interface OduInfo {
  numero: number;
  nome: string;
  significado: string;
  elemento: string;
  orixaRegente: string;
  quizilas?: string[];
  preceptos?: string[];
}

// ============================================================
// TIRAGEM MESA REAL (Assignment Spec)
// ============================================================

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
 * Matches the assignment specification
 */
export interface TiragemMesaReal {
  clienteId?: string;
  formato: '9x4' | '8x4+4';
  cartas: CartaPosicao[];
  odus?: OduCarta[];
  timestamp: string;
  seed?: number;
}

// ============================================================
// ARCHITECTURE FOR DOSSIER (Assignment Spec)
// ============================================================

/**
 * Terrain data extracted from client calculations (MapaAlma injection)
 */
export interface InjeccaoTerreno {
  tipo: 'ascendente' | 'numero_alma' | 'fundo_ceus' | 'numero_motivacao' | 'dom_divino' | 'numero_karma';
  valor: string | number;
  fonte: 'astrologia' | 'numerologia' | 'tantrica' | 'cabala';
}

/**
 * Complete architecture for one house in dossier
 * Matches the assignment specification
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
  injeccao_terreno?: InjeccaoTerreno[];
  element?: string;
  sefirot?: string[];
  chakra?: number;
}

// ============================================================
// CLIENT DATA
// ============================================================

/**
 * Client data for correlation
 */
export interface ClientData {
  fullName: string;
  birthDate: string;
  astrologyMap?: {
    signoSolar?: string;
    signos?: string[];
    ascendente?: string;
    casa3?: string;  // Mercúrio/Casa 3
    casa4?: string;  // Fundo do Céu
    casa2?: string;  // Finanças
  };
  kabalisticMap?: {
    caminhoVida?: string;
    missao?: string;
    motivacao?: string;
    expressao?: string;
    dons?: string;
  };
  tantricMap?: {
    alma?: string;
    karma?: string;
    domDivino?: string;
    destino?: string;
    caminho?: string;
  };
  oduPrincipal?: string;
}

// ============================================================
// API TYPES
// ============================================================

/**
 * Request to generate dossier
 * Matches the assignment specification
 */
export interface GenerateDossierRequest {
  clientId: string;
  matrixData: TiragemMesaReal;
}

/**
 * Dossier generation options
 */
export interface DossierGenerationOptions {
  usarCache?: boolean;
  temperatura?: number;
  maxTokens?: number;
  forcar?: boolean;
}

/**
 * Dossier result
 */
export interface DossierResult {
  clientId: string;
  readingId: string;
  reportId: string;
  content: DossiêResult;
  markdown: string;
}

/**
 * Dossiê per house analysis
 */
export interface DossiêResult {
  [casaNumero: string | number]: {
    terreno: string;
    evento: string;
    diretriz: string;
    analise: string;
    orientacao: string;
  };
}

/**
 * Dossier section for structured output
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
 * Dossier generation response
 */
export interface DossierGenerationResponse {
  success: boolean;
  reportId?: string;
  content?: string;
  cacheHit?: boolean;
  error?: string;
}

/**
 * House analysis output
 */
export interface HouseAnalysis {
  casa: number;
  titulo: string;
  interpretacao: string;
  recomendacao?: string;
  convergencias?: string[];
}

/**
 * Dossier response structure
 */
export interface DossierResponse {
  sumario: string;
  secoes: HouseAnalysis[];
  conselhosGerais: string[];
}

/**
 * Dossier report stored in database
 */
export interface DossierReport {
  id: string;
  clientId: string;
  content: string;
  generatedAt: string;
  architecture?: ArquiteturaDossiê[];
}