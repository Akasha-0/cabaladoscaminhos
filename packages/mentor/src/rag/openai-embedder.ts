import type { 
  PracticeEmbedding, 
  SimilarPractice, 
  PracticeFilters,
  IntegrativePracticeRef,
  RAGConfig 
} from './index';

/**
 * OpenAI Embedder - Uses OpenAI's text-embedding-3-small model
 * 
 * Environment variables required:
 * - OPENAI_API_KEY: Your OpenAI API key
 */
export class OpenAIEmbedder {
  private apiKey: string;
  private model = 'text-embedding-3-small';
  private cache: Map<string, number[]> = new Map();

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.OPENAI_API_KEY || '';
    if (!this.apiKey) {
      console.warn('OpenAIEmbedder: OPENAI_API_KEY not set');
    }
  }

  /**
   * Initialize the embedder with configuration
   */
  async initialize(config: RAGConfig): Promise<void> {
    this.apiKey = config.apiKey;
  }

  /**
   * Generate embedding for text using OpenAI API
   */
  async embed(text: string): Promise<number[]> {
    // Check cache first
    const cacheKey = text.slice(0, 100);
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    if (!this.apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        input: text,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${error}`);
    }

    const data = await response.json() as { data: Array<{ embedding: number[] }> };
    const embedding = data.data[0].embedding;

    // Cache the result
    this.cache.set(cacheKey, embedding);
    
    return embedding;
  }

  /**
   * Find similar practices using OpenAI embeddings
   * 
   * This is a mock implementation that stores practices in memory.
   * In production, use a vector database like Pinecone, Weaviate, or pgvector.
   */
  async findSimilar(
    query: string,
    limit: number,
    _filters?: PracticeFilters
  ): Promise<SimilarPractice[]> {
    // Generate query embedding
    const queryEmbedding = await this.embed(query);

    // In production, this would query a vector database
    // For now, return mock results structure
    const mockPractices: IntegrativePracticeRef[] = [
      { id: '1', name: 'Meditação Kundalini', category: 'meditation', description: 'Prática de despertar energia' },
      { id: '2', name: 'Respirações Prânicas', category: 'breathwork', description: 'Técnicas de respiração energética' },
    ];

    // Calculate cosine similarity (mock)
    const results: SimilarPractice[] = mockPractices.map((practice, index) => ({
      practice,
      score: 1 - (index * 0.1), // Mock scores: 1.0, 0.9, etc.
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
 * Factory function to create OpenAI embedder
 */
export function createOpenAIEmbedder(apiKey?: string): OpenAIEmbedder {
  return new OpenAIEmbedder(apiKey);
}
