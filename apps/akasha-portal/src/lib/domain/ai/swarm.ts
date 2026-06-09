import type { KnowledgeEntry } from '../../grimoire/search';

export type { KnowledgeEntry };

/**
 * Retorna a base de conhecimento do Grimório para RAG
 * Stub: retorna array vazio (implementação real virá na Onda 3)
 */
export async function getKnowledgeBase(library?: string): Promise<KnowledgeEntry[]> {
  return [];
}
