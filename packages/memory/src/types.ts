/**
 * Tipos públicos do @akasha/memory.
 *
 * Decisão: types ficam em arquivo separado para evitar ciclos entre
 * distillation.ts e storage.ts (consolidator.ts importa ambos).
 */

export type Pilar =
  | 'cabala'
  | 'astrologia'
  | 'tantrica'
  | 'odus'
  | 'iching';

/**
 * Frequência de cada Pilar nas memórias do cluster.
 * Stored como Json no Prisma (ver `pilarCounts` em ConsolidatedInsight).
 */
export interface PilarCounts {
  cabala: number;
  astrologia: number;
  tantrica: number;
  odus: number;
  iching: number;
}

/**
 * Memória de entrada para destilação. Abstrai a fonte — pode vir de
 * SessaoChunk, Discovery, InsightJob, ou outro. O consolidator.ts
 * mapeia as tabelas Prisma para este shape.
 */
export interface ConsolidationSource {
  /** Tipo da fonte (ex: 'sessao_chunk', 'discovery', 'notas_consulente'). */
  type: string;
  /** ID da fonte (cuid da tabela de origem). */
  id: string;
  /** Título curto (≤200 chars idealmente). */
  title: string;
  /** Conteúdo (snippet, idealmente ≤1000 chars para performance). */
  content?: string;
  /** Data de criação da fonte (ISO-8601). */
  createdAt: Date;
}

/**
 * Cluster destilado. Output de `distillClusters()`.
 * Este é o "insight consolidado" que vai para o storage.
 */
export interface DistilledCluster {
  /** Etiqueta human-legível (ex: "Cabala · vida+path"). */
  theme: string;
  /** Síntese template (1-2 frases). */
  content: string;
  /** Sources que formaram o cluster. */
  sources: ConsolidationSource[];
  /** Frequência de Pilares nas sources. */
  pilarCounts: PilarCounts;
  /** Confiança heurística 0..1. */
  confidence: number;
}

/**
 * Input do consolidator.ts. Aceita sources já normalizadas (a conversão
 * Prisma → ConsolidationSource é responsabilidade do chamador).
 */
export interface ConsolidateInput {
  userId: string;
  workspaceId: string;
  /** Data inicial do período (inclusive). */
  since: Date;
  /** Anchor do mês (sempre dia 1° UTC). Default: 1° do mês de `since`. */
  anchorMonth?: Date;
  /** Override do minClusterSize / maxClusters (default 3 / 5). */
  minClusterSize?: number;
  maxClusters?: number;
}

/**
 * Output do consolidator.ts. Inclui métricas para logging/monitoria.
 */
export interface ConsolidateOutput {
  userId: string;
  workspaceId: string;
  anchorMonth: string; // ISO-8601
  sourcesRead: number;
  clustersCreated: number;
  insights: ConsolidatedInsightRecord[];
}

/**
 * Record pronto para persistir no Prisma.
 * `id` e `createdAt` são gerados pelo Prisma no insert — omitidos aqui.
 */
export interface ConsolidatedInsightRecord {
  userId: string;
  workspaceId: string;
  theme: string;
  content: string;
  sources: ReadonlyArray<ConsolidationSource>;
  pilarCounts: PilarCounts;
  confidence: number;
  anchorMonth: Date;
  generatedBy: string;
}
