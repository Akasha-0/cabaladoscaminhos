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
