/**
 * @akasha/core — CorrelationEngine
 * 
 * Motor de correlações para recomendações de práticas integrativas.
 * Conecta o código Akasha (hexagrama + Odu + nível) com práticas seguras
 * através de correlações cross-tradição.
 */

import type { IntegrativePractice } from '../../core-iching/src/types';
import {
  type CrossTraditionCorrelation,
  findCorrelations,
  getIchingsByIfa,
  ifaToIchingMap,
} from './correlation-map';
import { validatePractice, isSafePractice } from './practices-guardrails';
import { PRACTICES as MOCK_PRACTICES } from '../../core-iching/src/practices';

// ─── Tipos do CorrelationEngine ──────────────────────────────────────────────

/** Áreas de vida para filtro de relevância. */
export type LifeArea = 
  | 'saude' 
  | 'financas' 
  | 'relacionamentos' 
  | 'carreira' 
  | 'espiritualidade' 
  | 'familia' 
  | 'criatividade';

/** Nível do código Akasha. */
export type CodeLevel = 'shadow' | 'gift' | 'siddhi';

/** Código Akasha - combinação de hexagrama, Odu opcional e nível. */
export interface AkashaCode {
  hexagram: number;
  odu?: string;
  level: CodeLevel;
  lifeArea: LifeArea;
}

/** Resultado do scoring de uma prática. */
export interface ScoredPractice {
  practice: IntegrativePractice;
  score: number;
  reason: string;
  correlation: string;
}

/** Recomendação final de prática. */
export interface PracticeRecommendation {
  practice: IntegrativePractice;
  score: number;
  reason: string;
  correlations: CrossTraditionCorrelation[];
  validation: {
    isValid: boolean;
    warnings: string[];
    recommendations: string[];
  };
}

/** Contexto para recomendações. */
export interface RecommendationContext {
  userCode: AkashaCode;
  lifeArea?: LifeArea;
  context?: string;
}

// ─── Pesos do Algoritmo de Scoring ───────────────────────────────────────────
// Soma = 1.0 (média ponderada direta, sem necessidade de normalização)

const SCORING_WEIGHTS = {
  correlation: 0.4,
  safety: 0.3,
  relevance: 0.2,
  recency: 0.1,
};

// ─── Funções Auxiliares ──────────────────────────────────────────────────────

/**
 * Verifica se um hexagrama está associado a uma prática.
 */
function hexagramMatchesPractice(practice: IntegrativePractice, hexagram: number): boolean {
  return practice.associations.hexagrams?.includes(hexagram) ?? false;
}

/**
 * Verifica se uma área de vida está associada a uma prática.
 */
function lifeAreaMatchesPractice(practice: IntegrativePractice, lifeArea: LifeArea): boolean {
  return practice.lifeAreas.includes(lifeArea);
}

/**
 * Verifica se o Odu do usuário está correlacionado com o hexagrama da prática.
 */
function oduCorrelatesWithHexagram(odu: string, hexagram: number): boolean {
  const hexagrams = getIchingsByIfa(odu as keyof typeof ifaToIchingMap);
  return hexagrams.includes(hexagram);
}

/**
 * Calcula o score de correlação entre código e prática.
 * Retorna valor entre 0 e 100.
 */
function calculateCorrelationScore(
  code: AkashaCode,
  practice: IntegrativePractice
): number {
  let score = 0;
  let matches = 0;

  // Correlação direta por hexagrama
  if (hexagramMatchesPractice(practice, code.hexagram)) {
    score += 40;
    matches++;
  }

  // Correlação por Odu (se disponível)
  if (code.odu && oduCorrelatesWithHexagram(code.odu, code.hexagram)) {
    score += 25;
    matches++;
  }

  // Correlação por nível (shadow/gift/siddhi)
  if (code.level === 'siddhi') {
    // Práticas avançadas para nível siddhi
    if (practice.category === 'oracao' || practice.category === 'defumacao') {
      score += 15;
      matches++;
    }
  } else if (code.level === 'gift') {
    // Práticas de desenvolvimento para nível gift
    if (practice.category === 'cromoterapia' || practice.category === 'cristal') {
      score += 15;
      matches++;
    }
  } else {
    // Práticas básicas para nível shadow
    if (practice.category === 'cha' || practice.category === 'banho_de_ervas') {
      score += 15;
      matches++;
    }
  }

  // Normaliza para 0-100
  return Math.min(100, score);
}

/**
 * Calcula o score de segurança de uma prática.
 * Retorna valor entre 0 e 100.
 */
function calculateSafetyScore(practice: IntegrativePractice): number {
  if (!isSafePractice(practice)) {
    return 0;
  }

  if (practice.warnings && practice.warnings.length > 0) {
    return 70;
  }

  return 100;
}

/**
 * Calcula o score de relevância por área de vida.
 * Retorna valor entre 0 e 100.
 */
function calculateRelevanceScore(
  practice: IntegrativePractice,
  lifeArea?: LifeArea
): number {
  if (!lifeArea) {
    return 50; // Sem filtro, neutral
  }

  if (lifeAreaMatchesPractice(practice, lifeArea)) {
    return 100;
  }

  // Verifica se a área de vida está no nome ou descrição
  const searchText = `${practice.name} ${practice.howTo}`.toLowerCase();
  if (searchText.includes(lifeArea)) {
    return 60;
  }

  return 30;
}

/**
 * Gera razão descritiva para o score.
 */
function generateReason(
  code: AkashaCode,
  practice: IntegrativePractice,
  correlationScore: number
): string {
  const reasons: string[] = [];

  if (hexagramMatchesPractice(practice, code.hexagram)) {
    reasons.push(`Hexagrama ${code.hexagram} diretamente associado`);
  }

  if (code.odu && oduCorrelatesWithHexagram(code.odu, code.hexagram)) {
    reasons.push(`Odú ${code.odu} correlacionado`);
  }

  if (lifeAreaMatchesPractice(practice, code.lifeArea)) {
    reasons.push(`Área de vida "${code.lifeArea}" alinhada`);
  }

  if (!isSafePractice(practice)) {
    reasons.push('⚠️ Prática requer cautela');
  }

  if (reasons.length === 0) {
    reasons.push('Correlação genérica por tradição');
  }

  return reasons.join(' | ');
}

// ─── CorrelationEngine ────────────────────────────────────────────────────────

/**
 * Motor de correlações para recomendações de práticas integrativas.
 * 
 * Uso:
 * ```typescript
 * const engine = new CorrelationEngine({
 *   userCode: { hexagram: 1, level: 'gift', lifeArea: 'espiritualidade' },
 *   lifeArea: 'espiritualidade',
 * });
 * 
 * const correlations = engine.findCorrelations();
 * const scored = engine.scorePractices(practices);
 * const recommendations = engine.recommend(5);
 * ```
 */
export class CorrelationEngine {
  private readonly userCode: AkashaCode;
  private readonly lifeArea?: LifeArea;
  private readonly context?: string;

  constructor(context: RecommendationContext) {
    this.userCode = context.userCode;
    this.lifeArea = context.lifeArea;
    this.context = context.context;
  }

  /**
   * Encontra correlações cross-tradição para o código do usuário.
   */
  findCorrelations(): CrossTraditionCorrelation[] {
    const correlations: CrossTraditionCorrelation[] = [];

    // Correlações diretas com I Ching
    const ichingCorrs = findCorrelations('iching', this.userCode.hexagram);
    correlations.push(...ichingCorrs);

    // Correlações via Ifá (se Odu disponível)
    if (this.userCode.odu) {
      const ifaCorrs = findCorrelations('ifa', this.userCode.odu);
      correlations.push(...ifaCorrs);
    }

    return correlations;
  }

  /**
   * Calcula o score de uma única prática.
   */
  scorePractice(practice: IntegrativePractice): ScoredPractice {
    const correlationScore = calculateCorrelationScore(this.userCode, practice);
    const safetyScore = calculateSafetyScore(practice);
    const relevanceScore = calculateRelevanceScore(practice, this.lifeArea);

    // Score final ponderado (spec 13.2) — pesos somam 1.0
    const score = Math.round(
      SCORING_WEIGHTS.correlation * correlationScore +
        SCORING_WEIGHTS.safety * safetyScore +
        SCORING_WEIGHTS.relevance * relevanceScore +
        SCORING_WEIGHTS.recency * 100 // TODO: implementar tracking de uso para recência real
    );

    const reason = generateReason(this.userCode, practice, correlationScore);
    const correlation = this.getCorrelationDescription(practice);

    return {
      practice,
      score,
      reason,
      correlation,
    };
  }

  /**
   * Calcula scores para múltiplas práticas.
   */
  scorePractices(practices: IntegrativePractice[]): ScoredPractice[] {
    return practices.map(p => this.scorePractice(p));
  }

  /**
   * Gera recomendações ordenadas por score.
   * 
   * @param count Número de recomendações a retornar
   */
  recommend(count: number): PracticeRecommendation[] {
    // Busca práticas do banco de práticas
    // Em produção, isso viria de um repositório/external source
    const practices = this.getPracticesForCode();

    // Filtra, valida e calcula scores em uma única passagem
    const scored = this.scorePractices(practices)
      .filter(s => {
        const validation = validatePractice(s.practice);
        return validation.isValid;
      });

    // Ordena por score decrescente
    scored.sort((a, b) => b.score - a.score);

    // Gera recomendações com validação já calculada
    const correlations = this.findCorrelations();

    return scored.slice(0, count).map(s => ({
      practice: s.practice,
      score: s.score,
      reason: s.reason,
      correlations,
      validation: validatePractice(s.practice),
    }));
  }

  /**
   * Retorna descrição textual da correlação com a prática.
   */
  private getCorrelationDescription(practice: IntegrativePractice): string {
    const parts: string[] = [];

    if (practice.associations.hexagrams?.length) {
      parts.push(`Hexagramas: ${practice.associations.hexagrams.join(', ')}`);
    }

    if (practice.associations.orixa) {
      parts.push(`Orixá: ${practice.associations.orixa}`);
    }

    if (practice.associations.element) {
      parts.push(`Elemento: ${practice.associations.element}`);
    }

    return parts.join(' | ') || 'Sem correlações específicas';
  }

  /**
   * Obtém práticas relevantes para o código atual.
   * Retorna práticas do banco mock para demonstração.
   * Em produção, implementar busca por hexagrama, área de vida, etc.
   */
  private getPracticesForCode(): IntegrativePractice[] {
    // Filtra práticas que correspondem ao hexagrama do usuário
    const matchingPractices = MOCK_PRACTICES.filter(
      p => p.associations.hexagrams?.includes(this.userCode.hexagram)
    );

    // Se não houver correspondência direta, retorna todas as práticas (fallback)
    return matchingPractices.length > 0 ? matchingPractices : MOCK_PRACTICES;
  }
}

// ─── Funções Exportadas ───────────────────────────────────────────────────────

/**
 * Cria um CorrelationEngine com contexto.
 */
export function createCorrelationEngine(context: RecommendationContext): CorrelationEngine {
  return new CorrelationEngine(context);
}

/**
 * Score rápido de uma prática contra um código.
 */
export function quickScore(
  practice: IntegrativePractice,
  code: AkashaCode,
  lifeArea?: LifeArea
): number {
  const engine = new CorrelationEngine({ userCode: code, lifeArea });
  return engine.scorePractice(practice).score;
}
