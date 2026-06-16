import type { 
  SimilarPractice, 
  PracticeFilters,
  IntegrativePracticeRef,
  RAGConfig 
} from './index';

/**
 * Cohere Embedder - Uses Cohere's embed-multilingual-v3.0 model
 * 
 * Environment variables required:
 * - COHERE_API_KEY: Your Cohere API key
 * 
 * This is the fallback embedder when OpenAI is not available.
 */
export class CohereEmbedder {
  private apiKey: string;
  private model = 'embed-multilingual-v3.0';
  private cache: Map<string, number[]> = new Map();

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.COHERE_API_KEY || '';
  }

  /**
   * Initialize the embedder with configuration
   */
  async initialize(config: RAGConfig): Promise<void> {
    this.apiKey = config.apiKey;
  }

  /**
   * Generate embedding for text using Cohere API
   */
  async embed(text: string): Promise<number[]> {
    // Check cache first
    const cacheKey = text.slice(0, 100);
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    if (!this.apiKey) {
      throw new Error('Cohere API key not configured');
    }

    const response = await fetch('https://api.cohere.ai/v1/embed', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        texts: [text],
        input_type: 'search_document',
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Cohere API error: ${response.status} - ${error}`);
    }

    const data = await response.json() as { embeddings: number[][] };
    const embedding = data.embeddings[0];

    // Cache the result
    this.cache.set(cacheKey, embedding);
    
    return embedding;
  }

  /**
   * Find similar practices using Cohere embeddings
   */
  async findSimilar(
    query: string,
    limit: number,
    _filters?: PracticeFilters
  ): Promise<SimilarPractice[]> {
    // Generate query embedding
    const queryEmbedding = await this.embed(query);

    // In production, this would query a vector database
    // For now, return mock results structure (same as OpenAI)
    const mockPractices: IntegrativePracticeRef[] = [
      { id: '1', name: 'Meditação Kundalini', category: 'meditation', description: 'Prática de despertar energia' },
      { id: '2', name: 'Respirações Prânicas', category: 'breathwork', description: 'Técnicas de respiração energética' },
    ];

    // Calculate cosine similarity (mock)
    const results: SimilarPractice[] = mockPractices.map((practice, index) => ({
      practice,
      score: 1 - (index * 0.1),
      highlights: practice.description ? [practice.description] : [],
    }));

    return results.slice(0, limit);
  }

  /**
   * Index a practice by storing its embedding
   */
  async indexPractice(
    practice: IntegrativePracticeRef & { description?: string; tags?: string[] }
  ): Promise<void> {
    const text = `${practice.name} ${practice.description || ''} ${(practice.tags || []).join(' ')}`;
    await this.embed(text);
  }

  /**
   * Clear the embedding cache
   */
  clearCache(): void {
    this.cache.clear();
  }
}

/**
 * Factory function to create Cohere embedder
 */
export function createCohereEmbedder(apiKey?: string): CohereEmbedder {
  return new CohereEmbedder(apiKey);
}
