// ============================================================
// API TYPES - CABALA DOS CAMINHOS
// ============================================================
// Shared types for API requests, responses, and domain models
// ============================================================

import { z } from 'zod';

// ============================================================
// API RESPONSE WRAPPERS
// ============================================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: ResponseMeta;
}

export interface ApiError {
  code: number;
  message: string;
  details?: Record<string, unknown>;
}

export interface ResponseMeta {
  timestamp: string;
  requestId?: string;
  pagination?: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

// ============================================================
// GENERIC API TYPES
// ============================================================

export interface PaginatedRequest {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: PaginationMeta;
}

// ============================================================
// USER TYPES
// ============================================================

const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  nomeCompleto: z.string().min(1),
  dataNascimento: z.string().datetime(),
  horaNascimento: z.string().optional(),
  localNascimento: z.string().optional(),
  temaPreferido: z.string().optional(),
  createdAt: z.string().datetime(),
});

export interface TransacaoCreditoType {
  id: string;
  tipo: 'CREDITO' | 'DEBITO';
  quantidade: number;
  descricao: string | null;
  operacao: string | null;
  createdAt: string;
}

const TransacaoCreditoSchema = z.object({
  id: z.string(),
  tipo: z.enum(['CREDITO', 'DEBITO']),
  quantidade: z.number(),
  descricao: z.string().nullable(),
  operacao: z.string().nullable(),
  createdAt: z.string().datetime(),
});

export interface AssinaturaInfo {
  plano: string;
  status: string;
  dataInicio: string;
  dataProximoCobro?: string;
}

export interface CreditosInfo {
  saldo: number;
  transacoes?: TransacaoCreditoType[];
}

// ============================================================

const NumerologiaRequestSchema = z.object({
  nome: z.string().optional(),
  data: z.string().optional(),
  tipo: z.enum(['pitagorica', 'caldeia', 'cabalistica', 'tantrica', 'pitagorica-data', 'destino']),
});

export type NumerologiaRequest = z.infer<typeof NumerologiaRequestSchema>;

export interface NumerologiaResponse {
  numero: number;
  tipo: string;
  interpretacao: string;
}

// ============================================================
// ASTROLOGY TYPES
// ============================================================

const PosicaoPlanetaSchema = z.object({
  planeta: z.string(),
  longitude: z.number(),
  latitude: z.number(),
  distancia: z.number(),
  velocidade: z.number(),
  signo: z.string(),
  casa: z.number(),
  grauNoSigno: z.number(),
});

const CasaSchema = z.object({
  numero: z.number(),
  signo: z.string(),
  grauNoSigno: z.number(),
  planetaRegente: z.string().nullable(),
});

const MapaNatalSchema = z.object({
  usuarioId: z.string(),
  dataCalculo: z.string().datetime(),
  planeta: z.record(PosicaoPlanetaSchema),
  casas: z.array(CasaSchema),
  ascendente: z.number(),
  mediumCoeli: z.number(),
  nodes: z.object({
    norte: PosicaoPlanetaSchema,
    sul: PosicaoPlanetaSchema,
  }),
});

export type MapaNatal = z.infer<typeof MapaNatalSchema>;

export interface MapaNatalSummary {
  signoSolar: string;
  signoLunar: string;
  ascendente: string;
}

export interface Transito {
  id: string;
  planeta: string;
  aspecto: string;
  planetaNatal: string;
  impacto: 'alto' | 'medio' | 'baixo';
  descricao: string;
  dataInicio: string;
  dataFim: string;
}

export interface TransitosResponse {
  transitos: Transito[];
  mapaNatal: MapaNatalSummary;
}

// ============================================================
// ODÚ TYPES
// ============================================================

export interface OduInfo {
  numero: number;
  nome: string;
  significado: string;
  elementos: string;
  orixaRegente: string;
  quizilas: string[];
  preceitos: string[];
  ebos: string[];
}

export interface OdusResponse {
  principal: OduInfo;
  secundario: OduInfo | null;
}

 // CREDITS TYPES
 // ============================================================
 const CreditosSchema = z.object({
   saldo: z.number(),
   transacoes: z.array(TransacaoCreditoSchema).optional(),
 });

export type Creditos = z.infer<typeof CreditosSchema>;

export interface CreditosRequest {
  quantidade?: number;
  operacao?: string;
  descricao?: string;
}

// ============================================================
// CHAT TYPES
// ============================================================

export type TemaChat =
  | 'relacionamento'
  | 'trabalho'
  | 'dinheiro'
  | 'saude'
  | 'espiritualidade'
  | 'proposito'
  | 'outros';

export interface MensagemChat {
  id: string;
  tipo: 'usuario' | 'assistente';
  conteudo: string;
  tema?: TemaChat;
  timestamp: string;
}

export interface ConversaChat {
  id: string;
  userId: string;
  tema: TemaChat;
  mensagens: MensagemChat[];
  criadaEm: string;
  atualizadaEm: string;
}

export interface ChatRequest {
  pergunta: string;
  tema: TemaChat;
  historico?: MensagemChat[];
}

export interface ChatResponse {
  resposta: string;
  novoSaldo: number;
}

// ============================================================
// CYCLES TYPES
// ============================================================

export interface CiclosResponse {
  ano: {
    numero: number;
    energia: string;
    descricao: string;
  };
  mes: {
    numero: number;
    energia: string;
    descricao: string;
  };
  dia: {
    numero: number;
    energia: string;
    descricao: string;
  };
}

// ============================================================
// INSIGHTS TYPES
// ============================================================

export interface Insight {
  id: string;
  tipo: 'diario' | 'semanal' | 'mensal';
  titulo: string;
  conteudo: string;
  data: string;
  relacionado?: {
    tipo: 'planeta' | 'signo' | 'numero' | 'orixa';
    valor: string;
  };
}

export interface InsightsResponse {
  insights: Insight[];
}

// ============================================================
// VALIDATORS - Zod schemas for API validation
// ============================================================

const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

const idParamSchema = z.object({
  id: z.string().min(1, 'ID é obrigatório'),
});

// Query params with pagination
const paginatedQuerySchema = z.object({
  ...paginationSchema.shape,
});

// ============================================================
// RESPONSE FACTORIES
// ============================================================

function createSuccessResponse<T>(
  data: T,
  meta?: ResponseMeta
): ApiResponse<T> {
  return {
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      ...meta,
    },
  };
}

function createPaginatedResponse<T>(
  items: T[],
  pagination: PaginationMeta
): PaginatedResponse<T> {
  return {
    items,
    pagination: {
      ...pagination,
      totalPages: Math.ceil(pagination.total / pagination.pageSize),
    },
  };
}

function createErrorResponse(
  code: number,
  message: string,
  details?: Record<string, unknown>
): ApiResponse {
  return {
    success: false,
    error: {
      code,
      message,
      details,
    },
  };
}

// ============================================================
// TYPE GUARDS
// ============================================================

function isApiError(response: ApiResponse): response is ApiResponse & { error: ApiError } {
  return !response.success && 'error' in response;
}

function isPaginatedResponse<T>(
  response: ApiResponse<T> | PaginatedResponse<T>
): response is PaginatedResponse<T> {
  return 'items' in response && 'pagination' in response;
}
