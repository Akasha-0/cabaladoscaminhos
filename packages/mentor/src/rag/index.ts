// RAG Types — Akasha OS v0.0.14
import type { IntegrativePracticeRef } from '../types';

export type { IntegrativePracticeRef } from '../types';

// RAG Provider type
export type RAGProvider = 'openai' | 'cohere';

// RAG Configuration
export interface RAGConfig {
  provider: RAGProvider;
  apiKey: string;
  indexName: string;
}

// Practice Embedding stored in cache/database
export interface PracticeEmbedding {
  practiceId: string;
  text: string;
  embedding: number[];
  metadata?: {
    category?: string;
    tags?: string[];
  };
}

// Similar practice result
export interface SimilarPractice {
  practice: IntegrativePracticeRef;
  score: number;
  highlights?: string[];
}

// Practice filters for search
export interface PracticeFilters {
  category?: string;
  tags?: string[];
  safetyLevel?: 'safe' | 'caution' | 'restricted';
}

// RAG Service interface
export interface RAGService {
  initialize(config: RAGConfig): Promise<void>;
  embed(text: string): Promise<number[]>;
  findSimilar(query: string, limit: number, filters?: PracticeFilters): Promise<SimilarPractice[]>;
  indexPractice(
    practice: IntegrativePracticeRef & { description?: string; tags?: string[] }
  ): Promise<void>;
}

// Re-export functions from rag-service
export {
  initializeRAG,
  findSimilarPractices,
  indexPractice,
  createRAGConfigFromEnv,
  embedText,
  getRAGService,
  RAGServiceFactory,
} from './rag-service';
