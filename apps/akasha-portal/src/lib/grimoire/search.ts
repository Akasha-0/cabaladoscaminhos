export interface KnowledgeEntry {
  id: string;
  title: string;
  content: string;
  tags: string[];
  source: string;
  domain: string;  // Área temática (tarot, iching, odas, etc.)
  key: string;     // Identificador único dentro do domínio
  data: Record<string, unknown>;  // Dados específicos do domínio
}

export interface GrimoireContext {
  library: string;
  entries: KnowledgeEntry[];
}

export interface SearchQuery {
  text: string;
  library?: string;
}

export interface SearchFilters {
  tags?: string[];
  source?: string;
}

export interface SearchResult {
  entries: KnowledgeEntry[];
  context: GrimoireContext;
}

/**
 * Busca híbrida no Grimório (filtro JSONB + semântico pgvector)
 * 
 * STUB: Implementação real na Onda 3 (Oráculo Vivo)
 * Por enquanto retorna dados mockados para tests passarem.
 */
export function searchGrimoireHybrid(
  query: SearchQuery,
  filters?: SearchFilters
): Promise<SearchResult> {
  return Promise.resolve({
    entries: [],
    context: { library: query.library || 'all', entries: [] },
  });
}
