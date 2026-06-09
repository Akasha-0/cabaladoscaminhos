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

export interface KnowledgeBase {
  load(): Promise<void>;
  getRelevant(domains: string[]): { entries: KnowledgeEntry[] };
  entries: KnowledgeEntry[];
}

/**
 * Retorna a base de conhecimento do Grimório para RAG
 * 
 * STUB: Implementação real na Onda 3 (Oráculo Vivo)
 * Por enquanto retorna stub funcional para tests passarem.
 */
export function getKnowledgeBase(library?: string): KnowledgeBase {
  return {
    entries: [],
    async load() {
      // Stub: não faz nada
    },
    getRelevant(domains: string[]) {
      return {
        entries: this.entries.filter(e => domains.includes(e.domain)),
      };
    },
  };
}
