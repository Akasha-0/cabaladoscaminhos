/**
 * @akasha/core — RecommendationGenerator
 *
 * Gera recomendações de práticas integrativas usando abordagem híbrida:
 * - Regras baseadas no CorrelationEngine
 * - RAG (Retrieval Augmented Generation) para busca semântica
 */
import { PRACTICES as MOCK_PRACTICES } from '../../core-iching/src/practices';
import type { IntegrativePractice } from '../../core-iching/src/types';
import { createCorrelationEngine, type RecommendationContext } from './correlation-engine';
import { validatePractice } from './practices-guardrails';

// ─── Tipos do RecommendationGenerator ────────────────────────────────────────

/** Fonte de geração da recomendação. */
export type RecommendationSource = 'rules' | 'rag' | 'hybrid';

/** Recomendação personalizada com fonte e confiança. */
export interface PracticeRecommendationWithConfidence {
  practice: IntegrativePractice;
  confidence: number; // 0-1
  source: RecommendationSource;
  personalizedReason: string; // Explicação para o usuário
}

// ─── Pesos para Combinação Híbrida ───────────────────────────────────────────

const HYBRID_WEIGHTS = {
  rules: 0.6,
  rag: 0.4,
};

// ─── RAG Service (Lazy Import) ─────────────────────────────────────────────────

/** Lazy-loaded RAG functions with fallback to simulated */
let findSimilarPractices: typeof import('@akasha/mentor/rag').findSimilarPractices | null = null;
let embedText: typeof import('@akasha/mentor/rag').embedText | null = null;

async function getRAGFunctions() {
  if (!findSimilarPractices) {
    try {
      const rag = await import('@akasha/mentor/rag');
      findSimilarPractices = rag.findSimilarPractices;
      embedText = rag.embedText;
    } catch {
      // RAG not available, use simulated
    }
  }
  return { findSimilarPractices, embedText };
}

// ─── Funções Auxiliares de RAG Simulado ───────────────────────────────────────

/**
 * Simula embedding de texto para busca semântica.
 * Em produção, usar embeddings reais (OpenAI, Cohere, etc.)
 */
function simulateEmbedding(text: string): number[] {
  const words = text.toLowerCase().split(/\s+/);
  const embedding = new Array(128).fill(0);

  words.forEach((word) => {
    const hash = hashString(word);
    embedding[hash % 128] = 1;
  });

  return embedding;
}

/**
 * Hash simples para distribuir palavras no vetor.
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

/**
 * Calcula similaridade cosseno entre dois vetores.
 */
function cosineSimilarity(a: number[], b: number[]): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  return denominator === 0 ? 0 : dotProduct / denominator;
}

/**
 * Extrai texto representativo de uma prática para embedding.
 */
function practiceToText(practice: IntegrativePractice): string {
  return [
    practice.name,
    practice.tradition,
    practice.category,
    practice.howTo,
    ...practice.lifeAreas,
  ].join(' ');
}

// ─── RecommendationGenerator ───────────────────────────────────────────────────

/**
 * Gerador de recomendações híbrido (Regras + RAG).
 *
 * Uso:
 * ```typescript
 * const generator = new RecommendationGenerator();
 *
 * // Baseado em regras
 * const byRules = generator.generateFromRules({
 *   userCode: { hexagram: 1, level: 'gift', lifeArea: 'espiritualidade' },
 * });
 *
 * // Baseado em RAG
 * const byRAG = generator.generateFromRAG('meditação para ansiedade', 5);
 *
 * // Híbrido (combinação)
 * const hybrid = generator.generateHybrid({
 *   userCode: { hexagram: 1, level: 'gift', lifeArea: 'espiritualidade' },
 * }, 5);
 * ```
 */
export class RecommendationGenerator {
  /**
   * Gera recomendações baseadas exclusivamente em regras (CorrelationEngine).
   */
  generateFromRules(context: RecommendationContext): PracticeRecommendationWithConfidence[] {
    const engine = createCorrelationEngine(context);
    const recommendations = engine.recommend(20);

    return recommendations.map((rec) => ({
      practice: rec.practice,
      confidence: rec.score / 100,
      source: 'rules' as const,
      personalizedReason: rec.reason,
    }));
  }

  /**
   * Gera recomendações baseadas em busca semântica (RAG).
   * Usa embeddings reais quando disponíveis, simulados como fallback.
   */
  async generateFromRAG(
    query: string,
    limit: number
  ): Promise<PracticeRecommendationWithConfidence[]> {
    const rag = await getRAGFunctions();

    if (rag.findSimilarPractices) {
      // Use real RAG
      try {
        const results = await rag.findSimilarPractices(query, limit);
        return results.map((r) => ({
          practice: MOCK_PRACTICES.find((p) => p.id === r.practice.id) || MOCK_PRACTICES[0],
          confidence: r.score,
          source: 'rag' as const,
          personalizedReason: r.highlights?.[0] || `Recomendado para: "${query}"`,
        }));
      } catch (err) {
        // Fall through to simulated
        void err;
      }
    }

    // Fallback to simulated RAG
    const queryEmbedding = simulateEmbedding(query);

    // Calcula similaridade de cada prática com a query
    const scoredPractices = MOCK_PRACTICES.map((practice) => {
      const practiceText = practiceToText(practice);
      const practiceEmbedding = simulateEmbedding(practiceText);
      const similarity = cosineSimilarity(queryEmbedding, practiceEmbedding);

      return {
        practice,
        similarity,
        personalizedReason: gerarRazaoRAG(practice, query),
      };
    });

    // Ordena por similaridade e filtra práticas válidas
    return scoredPractices
      .filter((s) => {
        const validation = validatePractice(s.practice);
        return validation.isValid;
      })
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit)
      .map((s) => ({
        practice: s.practice,
        confidence: s.similarity,
        source: 'rag' as const,
        personalizedReason: s.personalizedReason,
      }));
  }

  /**
   * Gera recomendações híbridas combinando regras e RAG.
   * Usa ponderação para mesclar scores de ambas as fontes.
   */
  async generateHybrid(
    context: RecommendationContext,
    limit: number
  ): Promise<PracticeRecommendationWithConfidence[]> {
    // Obtém recomendações de ambas as fontes
    const fromRules = this.generateFromRules(context);
    const queryText = context.context || context.lifeArea || '';
    const fromRAG = await this.generateFromRAG(queryText, limit * 2);

    // Mapa para agregar práticas
    const practiceMap = new Map<
      string,
      {
        practice: IntegrativePractice;
        rulesScore: number;
        ragScore: number;
        rulesReason: string;
        ragReason: string;
      }
    >();

    // Processa regras
    fromRules.forEach((rec) => {
      practiceMap.set(rec.practice.id, {
        practice: rec.practice,
        rulesScore: rec.confidence,
        ragScore: 0,
        rulesReason: rec.personalizedReason,
        ragReason: '',
      });
    });

    // Processa RAG
    fromRAG.forEach((rec) => {
      const existing = practiceMap.get(rec.practice.id);
      if (existing) {
        existing.ragScore = rec.confidence;
        existing.ragReason = rec.personalizedReason;
      } else {
        practiceMap.set(rec.practice.id, {
          practice: rec.practice,
          rulesScore: 0,
          ragScore: rec.confidence,
          rulesReason: '',
          ragReason: rec.personalizedReason,
        });
      }
    });

    // Calcula scores combinados e gera recomendações
    const combined: PracticeRecommendationWithConfidence[] = [];

    practiceMap.forEach(({ practice, rulesScore, ragScore, rulesReason, ragReason }) => {
      // Score combinado ponderado
      const combinedScore = HYBRID_WEIGHTS.rules * rulesScore + HYBRID_WEIGHTS.rag * ragScore;

      // Razão combinada (prioriza regras, complementa com RAG se relevante)
      let personalizedReason = rulesReason;
      if (ragScore > rulesScore && ragReason) {
        personalizedReason = `${ragReason} (complementado por correlações do código)`;
      }

      // Só inclui se tiver score significativo de alguma fonte
      if (rulesScore > 0 || ragScore > 0.1) {
        combined.push({
          practice,
          confidence: Math.min(1, combinedScore),
          source: 'hybrid',
          personalizedReason,
        });
      }
    });

    // Ordena por confiança e limita resultado
    return combined.sort((a, b) => b.confidence - a.confidence).slice(0, limit);
  }
}

// ─── Funções Auxiliares ───────────────────────────────────────────────────────

/**
 * Gera razão descritiva para recomendação RAG.
 */
function gerarRazaoRAG(practice: IntegrativePractice, query: string): string {
  const queryLower = query.toLowerCase();
  const praticaText = `${practice.name} ${practice.howTo}`.toLowerCase();

  if (praticaText.includes(queryLower) || queryLower.includes(praticaText.slice(0, 20))) {
    return `Semelhante à busca: "${query}"`;
  }

  if (practice.lifeAreas.some((area) => queryLower.includes(area))) {
    return `Relacionado à área de vida solicitada`;
  }

  if (practice.associations.element && queryLower.includes(practice.associations.element)) {
    return `Elemento ${practice.associations.element} alinhado com a busca`;
  }

  return `Recomendação semântica para: "${query}"`;
}

// ─── Funções Exportadas ───────────────────────────────────────────────────────

/**
 * Cria uma nova instância do RecommendationGenerator.
 */
export function createRecommendationGenerator(): RecommendationGenerator {
  return new RecommendationGenerator();
}

/**
 * Gera recomendações baseadas apenas em regras.
 */
export function generateFromRules(
  context: RecommendationContext
): PracticeRecommendationWithConfidence[] {
  return new RecommendationGenerator().generateFromRules(context);
}

/**
 * Gera recomendações baseadas em RAG.
 */
export async function generateFromRAG(
  query: string,
  limit: number
): Promise<PracticeRecommendationWithConfidence[]> {
  return new RecommendationGenerator().generateFromRAG(query, limit);
}

/**
 * Gera recomendações híbridas (padrão).
 */
export async function generateHybrid(
  context: RecommendationContext,
  limit: number
): Promise<PracticeRecommendationWithConfidence[]> {
  return new RecommendationGenerator().generateHybrid(context, limit);
}
