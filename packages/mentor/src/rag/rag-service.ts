import type { 
  RAGConfig, 
  RAGService, 
  RAGProvider,
  SimilarPractice, 
  PracticeFilters,
  IntegrativePracticeRef
} from './index';
import { OpenAIEmbedder } from './openai-embedder';
import { CohereEmbedder } from './cohere-embedder';

/**
 * RAG Service Factory - Creates and manages RAG embedders
 * 
 * Supports:
 * - OpenAI (text-embedding-3-small)
 * - Cohere (embed-multilingual-v3.0)
 */
export class RAGServiceFactory {
  private embedder: RAGService | null = null;
  private config: RAGConfig | null = null;
  
  /**
   * Initialize the RAG service with configuration
   */
  async initialize(config: RAGConfig): Promise<void> {
    this.config = config;
    
    switch (config.provider) {
      case 'openai':
        this.embedder = new OpenAIEmbedder(config.apiKey);
        break;
      case 'cohere':
        this.embedder = new CohereEmbedder(config.apiKey);
        break;
      default:
        throw new Error(`Unsupported RAG provider: ${config.provider}`);
    }
  }

  /**
   * Get the current embedder instance
   */
  getEmbedder(): RAGService {
    if (!this.embedder) {
      throw new Error('RAG service not initialized. Call initialize() first.');
    }
    return this.embedder;
  }

  /**
   * Check if service is initialized
   */
  isInitialized(): boolean {
    return this.embedder !== null;
  }

  /**
   * Get current provider
   */
  getProvider(): RAGProvider | null {
    return this.config?.provider || null;
  }
}

/**
 * Global singleton instance
 */
let globalRAGService: RAGServiceFactory | null = null;

/**
 * Get or create the global RAG service instance
 */
export function getRAGService(): RAGServiceFactory {
  if (!globalRAGService) {
    globalRAGService = new RAGServiceFactory();
  }
  return globalRAGService;
}

/**
 * Initialize the global RAG service
 */
export async function initializeRAG(config: RAGConfig): Promise<void> {
  const service = getRAGService();
  await service.initialize(config);
}

/**
 * Create a RAG config from environment variables
 */
export function createRAGConfigFromEnv(): RAGConfig {
  const provider = (process.env.RAG_PROVIDER as RAGProvider) || 'openai';
  
  let apiKey = '';
  if (provider === 'openai') {
    apiKey = process.env.OPENAI_API_KEY || '';
  } else if (provider === 'cohere') {
    apiKey = process.env.COHERE_API_KEY || '';
  }

  return {
    provider,
    apiKey,
    indexName: process.env.RAG_INDEX_NAME || 'practices_v1',
  };
}

/**
 * Helper to generate embedding for text
 */
export async function embedText(text: string): Promise<number[]> {
  const service = getRAGService();
  return service.getEmbedder().embed(text);
}

/**
 * Helper to find similar practices
 */
export async function findSimilarPractices(
  query: string,
  limit: number,
  filters?: PracticeFilters
): Promise<SimilarPractice[]> {
  const service = getRAGService();
  return service.getEmbedder().findSimilar(query, limit, filters);
}

/**
 * Helper to index a practice
 */
export async function indexPractice(
  practice: IntegrativePracticeRef & { description?: string; tags?: string[] }
): Promise<void> {
  const service = getRAGService();
  return service.getEmbedder().indexPractice(practice);
}
