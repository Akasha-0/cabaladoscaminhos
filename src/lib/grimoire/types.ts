/**
 * Tipos do Grimório Digital — busca híbrida (Camada 2 do Oráculo).
 *
 * Doc 25 §5: a busca combina **filtro determinístico JSONB** (tags) com
 * **similaridade semântica pgvector** (cosine distance) para garantir
 * rastreabilidade anti-alucinação (Camada 3).
 */

/** Query de busca híbrida. */
export interface GrimoireSearchQuery {
  /** Tags determinísticas para filtro JSONB containment.
   *  Ex.: `{ elemento: 'Agua', corpos_tantricos_alvo: [2] }` */
  tags: Record<string, string | number | boolean | (string | number)[]>;
  /** Query semântica (string livre) — embedada via Ollama para `<=>`. */
  query: string;
  /** Limite de resultados (default 10). */
  limit?: number;
}

/** Resultado de busca híbrida. */
export interface GrimoireSearchResult {
  id: string;
  slug: string;
  categoria: string;
  biblioteca: string;
  /** Markdown completo para injeção no System Prompt da Camada 3. */
  conteudo: string;
  /** Distância cosseno pgvector — 0 = idêntico, 1 = ortogonal. */
  distance: number;
  /** Metadados crus (para filtros de fallback). */
  metadata: Record<string, unknown>;
}

/** Contexto de retorno da busca do Grimório (consumido pela Camada 3
 *  do prompt do LLM em /api/akasha/consult). */
export interface GrimoireContext {
  entries: Array<{
    titulo: string;
    conteudo: string;
    categoria: string;
    metadata: Record<string, unknown>;
  }>;
  pillarsConsulted: string[];
}

/** Contexto do mapa do consulente — alimenta a busca do Grimório. */
export interface ChartContext {
  element?: string;
  oduId?: string;
  lifePath?: number;
  activeBodies?: number[];
  tensionBodies?: number[];
}
