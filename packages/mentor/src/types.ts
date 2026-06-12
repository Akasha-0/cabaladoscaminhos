// Types for mentor package

export interface MentorConfig {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  apiUrl?: string;
}

export interface MentorMessage {
  id: string;
  userId?: string;
  role: 'user' | 'mentor';
  content: string;
  maps?: string[];
  createdAt: Date;
}

export interface UserMaps {
  cabala?: CabalaData;
  astrology?: AstrologyData;
  odus?: OduData;
  tantra?: TantraData;
}

export interface AskResponse {
  answer: string;
  maps: string[];
  confidence?: number;
}

export interface MentorContext {
  userId?: string;
  birthData?: BirthData;
  question?: string;
}

export interface BirthData {
  name: string;
  birthDate: string;
  birthPlace?: string;
}

export interface MentorResponse {
  answer: string;
  correlations?: Correlation[];
  confidence?: number;
}

export interface Correlation {
  system: 'cabala' | 'astrology' | 'odus' | 'tantra';
  reference: string;
  insight: string;
}

export interface ChatSession {
  id: string;
  messages: MentorMessage[];
  context: MentorContext;
  createdAt: number;
}

// ============================================================================
// Mapas Espirituais — tipos para os 4 sistemas
// ============================================================================

export interface CabalaMap {
  lifePath: number;
  lifePathMaster: boolean;
  description: string;
  sefirot: string[];
}

export interface OduMap {
  primary: string;
  secondary?: string;
  sign: string;
}

export interface AstrologyMap {
  sun: string;
  moon: string;
  rising: string;
  planets: Record<string, string>;
}

export interface TantraMap {
  primary: string;
  secondary: string;
  bodies: string[];
}

// UserSpiritualMaps — tipo completo para o maps wrapper
export interface UserSpiritualMaps {
  cabala: CabalaMap;
  odu: OduMap;
  astrology: AstrologyMap;
  tantra: TantraMap;
}

export interface CabalaData {
  sefirot?: string[];
  paths?: string[];
  dominantSefira?: string;
  lifePath?: number;
  lifePathMaster?: boolean;
  description?: string;
}

export interface OduData {
  primary?: string;
  secondary?: string;
  sign?: string;
  odu?: string;
}

export interface AstrologyData {
  sign?: string;
  houses?: Record<string, number>;
  rashi?: string;
  sun?: string;
  moon?: string;
  rising?: string;
  planets?: Record<string, string>;
}

export interface TantraData {
  primary?: string;
  secondary?: string;
  bodies?: string[];
}

// ============================================================
// Correlation Types
// ============================================================

export interface CorrelationResult {
  primary: string;
  secondary: string;
  insight: string;
}

// ============================================================
// Legacy types for compatibility
// ============================================================

export interface LegacyMentorMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: number;
}

// ============================================================================
// Chat API — F-205 Mentor (R-023 persona + R-022b ética)
// ============================================================================

/**
 * Intenção detectada da mensagem do usuário.
 * Usada por `detectIntent()` e `chat()` para rotear a resposta.
 *
 * - 'practice'  → sugestões de práticas (meditação, banho, oração)
 * - 'ritual'    → ritual completo com hexagrama do dia
 * - 'guidance'  → orientação reflexiva sem prática
 * - 'general'   → conversa aberta
 */
export type ChatIntent = 'practice' | 'ritual' | 'guidance' | 'general';

/**
 * Request payload para `MentorEngine.chat()`.
 *
 * `userCode` é o código do dia do usuário (formato "hex-lev-area" ou número
 * puro de hexagrama) — quando presente, o mentor personaliza a resposta
 * com base no Pilar 5 (I Ching 64).
 *
 * `conversationHistory` permite manter contexto de turnos anteriores
 * (limitado a N mensagens pelo caller — o mentor não persiste estado).
 */
export interface ChatRequest {
  message: string;
  intent?: ChatIntent;
  userCode?: string;
  conversationHistory?: Array<{
    role: 'user' | 'mentor' | 'assistant';
    content: string;
    timestamp?: number;
  }>;
}

/**
 * Referência a uma prática espiritual curada (Grimório Akasha).
 * Usado pelo RAG para devolver práticas similares ao hexagrama do dia.
 */
export interface IntegrativePracticeRef {
  id: string;
  name: string;
  category: string;
  description?: string;
  tags?: string[];
}

/**
 * Prática sugerida pelo mentor (subset de IntegrativePracticeRef).
 */
export interface SuggestedPractice {
  id: string;
  name: string;
  category: string;
}

/**
 * Ritual sugerido pelo mentor (referência ao hexagrama do dia).
 */
export interface MentorRitual {
  id: string;
  name: string;
  level: 'shadow' | 'gift' | 'siddhi' | 'sombra' | 'dom' | 'graca';
}

/**
 * Quizila (proibição ritual) relevante ao contexto do usuário.
 */
export interface MentorQuizila {
  texto: string;
  tipo?: 'proibicao' | 'cuidado' | 'observacao';
}

/**
 * Response payload de `MentorEngine.chat()`.
 *
 * Campos opcionais — populados apenas quando o intent detectado
 * (ou explícito) é 'practice' ou 'ritual'.
 */
export interface ChatResponse {
  message: string;
  intent: ChatIntent;
  suggestedPractices?: SuggestedPractice[];
  ritual?: MentorRitual;
  relevantQuizilas?: MentorQuizila[];
}

