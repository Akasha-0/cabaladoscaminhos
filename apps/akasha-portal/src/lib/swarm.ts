/**
 * Swarm / Knowledge Base module.
 * @deprecated Movido para application/swarm/knowledge-base.ts
 */

export interface KnowledgeEntry {
  id: string;
  title: string;
  content: string;
  tags: string[];
  source: string;
  domain: string;
  key: string;
  data: Record<string, unknown>;
}

export interface KnowledgeBase {
  load(): Promise<void>;
  getRelevant(domains: string[]): { entries: KnowledgeEntry[] };
  entries: KnowledgeEntry[];
}

/**
 * @deprecated Use application/swarm/knowledge-base.ts
 */
export function getKnowledgeBase(_library?: string): KnowledgeBase {
  return {
    entries: [],
    async load() {},
    getRelevant(domains: string[]) {
      return {
        entries: this.entries.filter(e => domains.includes(e.domain)),
      };
    },
  };
}
