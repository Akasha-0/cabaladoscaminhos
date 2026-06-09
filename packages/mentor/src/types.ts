// Placeholder types for mentor package

export interface MentorConfig {
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface MentorMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: number;
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
