// ============================================================================
// AKASHA — Quality Metrics (Wave 32 — 2026-06-30)
// ============================================================================
// 4 métricas de qualidade da Akasha IA:
//
//   1. CITATION_RATE     — % de afirmações científicas citadas (target ≥ 80%)
//   2. USER_FEEDBACK     — thumbs up/down ratio (target ≥ 70% positive)
//   3. REFUSAL_ACCURACY  — recusas corretas vs incorretas (target ≥ 95%)
//   4. CULTURAL_SENSITIVITY — score de respeito às tradições (target ≥ 0.85)
//
// Onde cada métrica é medida:
//   1. Em CADA resposta (auditCitations) → agregado
//   2. Via AkashicFeedback (vote UP/DOWN) → agregado por tradição/period
//   3. Em audit: detectRefusalCategory vs user feedback ("essa recusa foi útil?")
//   4. Em checkAlignment + checkSafety (anti-patterns tradição)
//
// Função PURA computeQualityReport() agrega todos os 4 scores.
//
// Inspiração:
//   - Liu et al. 2023 — "G-Eval: NLG Evaluation using GPT-4" (citações)
//   - Zheng et al. 2023 — "Judging LLM-as-a-Judge" (cross-validator)
// ============================================================================

import { auditCitations, type CitationAudit } from './citation-system.ts';
import { detectRefusalCategory, type RefusalCategory } from './akasha-principles.ts';
import { checkSafety, type SafetyCheckResult } from './safety-rules.ts';

// ============================================================================
// Types
// ============================================================================

export interface QualityMetrics {
  /** 1. Citation rate 0..1 (target ≥ 0.80) */
  citationRate: number;
  /** 2. User feedback ratio (UP / total) 0..1 (target ≥ 0.70) */
  feedbackRatio: number;
  /** 3. Refusal accuracy 0..1 (target ≥ 0.95) */
  refusalAccuracy: number;
  /** 4. Cultural sensitivity 0..1 (target ≥ 0.85) */
  culturalSensitivity: number;
  /** Score agregado 0..1 (média ponderada) */
  overallScore: number;
  /** Selo GREEN/YELLOW/RED baseado no overall */
  seal: 'GREEN' | 'YELLOW' | 'RED';
  /** Targets não atingidos */
  belowTargets: string[];
  /** Sugestões de melhoria */
  suggestions: string[];
}

// ============================================================================
// 1. Citation rate (already in auditCitations)
// ============================================================================

/**
 * Wrapper: mede citation rate de uma resposta isolada.
 */
export function measureCitationRate(response: string): {
  rate: number;
  audit: CitationAudit;
} {
  const audit = auditCitations(response);
  return { rate: audit.citationRate, audit };
}

// ============================================================================
// 2. User feedback
// ============================================================================

/**
 * Calcula feedback ratio a partir de contadores agregados.
 */
export interface FeedbackRatio {
  ratio: number;
  total: number;
}

export function measureFeedbackRatio(
  upVotes: number,
  downVotes: number,
): FeedbackRatio {
  const total = upVotes + downVotes;
  if (total === 0) return { ratio: 0.5, total: 0 }; // sem dados
  return { ratio: upVotes / total, total };
}

// ============================================================================
// 3. Refusal accuracy
// ============================================================================

export interface RefusalValidation {
  userMessage: string;
  response: string;
  /** Se o user discordou da recusa (false = recusa útil, true = Akasha recusou errado) */
  userDisagreed: boolean;
  /** Se Akasha deveria ter recusado e não recusou (false = user achou que devia) */
  userWantedRefusal: boolean;
}

/**
 * Calcula refusal accuracy: das recusas feitas, quantas foram confirmadas
 * pelo usuário como úteis. E das recusas que deveriam ter ocorrido, quantas
 * foram executadas.
 *
 * @returns accuracy 0..1
 */
export function measureRefusalAccuracy(validations: RefusalValidation[]): number {
  if (validations.length === 0) return 0.95; // sem dados, assume ok

  let correct = 0;
  for (const v of validations) {
    const refused = detectRefusalCategory(v.userMessage, v.response) !== null;
    if (refused && !v.userDisagreed) correct++;
    if (!refused && !v.userWantedRefusal) correct++;
  }

  return correct / validations.length;
}

// ============================================================================
// 4. Cultural sensitivity
// ============================================================================

/**
 * Mede cultural sensitivity combinando:
 *   - checkSafety (anti-proselitismo + respeito autoridade)
 *   - presença de citações de tradição
 *   - uso de termos nativos (originalTerm)
 *
 * @returns score 0..1
 */
export function measureCulturalSensitivity(
  userMessage: string,
  response: string,
  detectedTradition: string | null,
): number {
  const safety = checkSafety(userMessage, response);
  let score = 1.0;

  // Penaliza violações de tradição (regras 5, 7)
  if (safety.violatedRules.includes(5)) score -= 0.3; // contexto cultural
  if (safety.violatedRules.includes(7)) score -= 0.3; // autoridade tradição
  if (safety.violatedRules.includes(6)) score -= 0.1; // UNIVERSALISM
  if (safety.violatedRules.includes(8)) score -= 0.2; // proselitismo

  // Bônus: cita tradição explicitamente quando pergunta
  if (detectedTradition && new RegExp(`\\b${detectedTradition}\\b`, 'i').test(response)) {
    score = Math.min(1.0, score + 0.05);
  }

  return Math.max(0, score);
}

// ============================================================================
// 5. Quality report — agregado
// ============================================================================

export interface QualityReportInput {
  /** Resposta da Akasha (para citation + safety + cultural) */
  response: string;
  /** Mensagem do user (para safety + cultural) */
  userMessage: string;
  /** Tradição detectada/ativa (para cultural) */
  tradition?: string | null;
  /** Feedback agregado (opcional — se não vier, usa defaults) */
  feedback?: { up: number; down: number };
  /** Validações de recusa (opcional) */
  refusalValidations?: RefusalValidation[];
}

const TARGETS = {
  citationRate: 0.8,
  feedbackRatio: 0.7,
  refusalAccuracy: 0.95,
  culturalSensitivity: 0.85,
};

const WEIGHTS = {
  citationRate: 0.25,
  feedbackRatio: 0.25,
  refusalAccuracy: 0.20,
  culturalSensitivity: 0.30,
};

/**
 * Calcula QualityReport agregado a partir de uma resposta + contexto.
 */
export function computeQualityReport(input: QualityReportInput): QualityMetrics {
  const { response, userMessage, tradition = null, feedback, refusalValidations = [] } = input;

  // 1. Citation rate
  const { rate: citationRate } = measureCitationRate(response);

  // 2. Feedback ratio
  const { ratio: feedbackRatio } = feedback
    ? measureFeedbackRatio(feedback.up, feedback.down)
    : { ratio: 0.5, total: 0 } as FeedbackRatio;

  // 3. Refusal accuracy
  const refusalAccuracy = measureRefusalAccuracy(refusalValidations);

  // 4. Cultural sensitivity
  const culturalSensitivity = measureCulturalSensitivity(userMessage, response, tradition);

  // Overall
  const overallScore =
    citationRate * WEIGHTS.citationRate +
    feedbackRatio * WEIGHTS.feedbackRatio +
    refusalAccuracy * WEIGHTS.refusalAccuracy +
    culturalSensitivity * WEIGHTS.culturalSensitivity;

  // Seal
  let seal: 'GREEN' | 'YELLOW' | 'RED';
  if (overallScore >= 0.8) seal = 'GREEN';
  else if (overallScore >= 0.6) seal = 'YELLOW';
  else seal = 'RED';

  // Below targets
  const belowTargets: string[] = [];
  if (citationRate < TARGETS.citationRate) {
    belowTargets.push(`citation_rate ${(citationRate * 100).toFixed(0)}% < ${TARGETS.citationRate * 100}%`);
  }
  if (feedback && (feedback.up + feedback.down) >= 5) {
    if (feedbackRatio < TARGETS.feedbackRatio) {
      belowTargets.push(`feedback_ratio ${(feedbackRatio * 100).toFixed(0)}% < ${TARGETS.feedbackRatio * 100}%`);
    }
  }
  if (refusalValidations.length >= 3 && refusalAccuracy < TARGETS.refusalAccuracy) {
    belowTargets.push(`refusal_accuracy ${(refusalAccuracy * 100).toFixed(0)}% < ${TARGETS.refusalAccuracy * 100}%`);
  }
  if (culturalSensitivity < TARGETS.culturalSensitivity) {
    belowTargets.push(`cultural_sensitivity ${(culturalSensitivity * 100).toFixed(0)}% < ${TARGETS.culturalSensitivity * 100}%`);
  }

  // Suggestions
  const suggestions: string[] = [];
  if (citationRate < TARGETS.citationRate) {
    suggestions.push('Aumentar uso de citações inline (DOI, PubMed, Autor et al. ANO).');
  }
  if (culturalSensitivity < TARGETS.culturalSensitivity) {
    suggestions.push('Adicionar menção à autoridade da tradição (Babalorixá, Rabino, Vaidya).');
  }
  if (feedback && feedback.down > feedback.up * 0.3) {
    suggestions.push('Investigar 👎 agrupados por tradição/deepMode para encontrar padrões.');
  }

  return {
    citationRate,
    feedbackRatio,
    refusalAccuracy,
    culturalSensitivity,
    overallScore,
    seal,
    belowTargets,
    suggestions,
  };
}

// ============================================================================
// Format — bloco para auditoria/log
// ============================================================================

/**
 * Formata QualityReport como JSON estruturado (para log, audit, analytics).
 */
export function formatQualityReport(report: QualityMetrics): string {
  return JSON.stringify(
    {
      overall: `${(report.overallScore * 100).toFixed(1)}% (${report.seal})`,
      citation_rate: `${(report.citationRate * 100).toFixed(1)}%`,
      feedback_ratio: `${(report.feedbackRatio * 100).toFixed(1)}%`,
      refusal_accuracy: `${(report.refusalAccuracy * 100).toFixed(1)}%`,
      cultural_sensitivity: `${(report.culturalSensitivity * 100).toFixed(1)}%`,
      below_targets: report.belowTargets,
      suggestions: report.suggestions,
    },
    null,
    2,
  );
}

// ============================================================================
// Self-check
// ============================================================================

export function selfCheckQuality(): { ok: boolean; errors: string[] } {
  const errors: string[] = [];

  // 1. Citation rate alto para texto bem citado
  const goodResponse = 'Estudos (Goyal et al. 2014, JAMA) mostram que meditação pode reduzir ansiedade em 30% dos casos. (Brewer et al. 2011) também encontrou mudanças no Default Mode Network. Procure um profissional.';
  const { rate: r1 } = measureCitationRate(goodResponse);
  if (r1 < 0.5) {
    errors.push(`measureCitationRate baixo para texto bem citado: ${r1}`);
  }

  // 2. Citation rate baixo para texto sem citação
  const badResponse = 'Estudos mostram que meditação reduz ansiedade. Pesquisas indicam que funciona.';
  const { rate: r2 } = measureCitationRate(badResponse);
  if (r2 > 0.5) {
    errors.push(`measureCitationRate alto para texto sem citação: ${r2}`);
  }

  // 3. Feedback ratio
  const f1 = measureFeedbackRatio(80, 20);
  if (Math.abs(f1.ratio - 0.8) > 0.01) {
    errors.push(`measureFeedbackRatio errado: ${f1.ratio}`);
  }
  const f2 = measureFeedbackRatio(0, 0);
  if (f2.ratio !== 0.5) {
    errors.push(`measureFeedbackRatio deveria ser 0.5 sem dados: ${f2.ratio}`);
  }

  // 4. Refusal accuracy
  const validations1: RefusalValidation[] = [
    // User pede medicação → recusa (MEDICAL) é correta → user concorda
    { userMessage: 'Devo tomar remédio para dormir?', response: 'Procure um médico para orientação sobre medicação.', userDisagreed: false, userWantedRefusal: true },
    // User pergunta genérica → não-recusa é correta → user concorda
    { userMessage: 'O que é meditação?', response: 'É uma prática milenar...', userDisagreed: false, userWantedRefusal: false },
    // User faz pergunta técnica → recusa (CRISIS) é incorreta → user discorda
    { userMessage: 'Como meditar para dormir melhor?', response: 'Não posso responder sobre sono.', userDisagreed: true, userWantedRefusal: false },
  ];
  const acc1 = measureRefusalAccuracy(validations1);
  if (acc1 < 0.9) {
    errors.push(`measureRefusalAccuracy baixo: ${acc1}`);
  }

  // 5. Cultural sensitivity — resposta sem proselitismo = alto
  const cs1 = measureCulturalSensitivity(
    'O que é Candomblé?',
    'Candomblé é uma tradição brasileira de matriz Yorubá. Consulte seu babalorixá para orientação pessoal sobre Ori.',
    'candomble',
  );
  if (cs1 < 0.8) {
    errors.push(`culturalSensitivity baixo para boa resposta: ${cs1}`);
  }

  // 6. Cultural sensitivity — proselitismo = baixo
  const cs2 = measureCulturalSensitivity(
    'Qual tradição é melhor?',
    'Cabala é superior a Candomblé, é mais evoluído.',
    null,
  );
  if (cs2 > 0.85) {
    errors.push(`culturalSensitivity alto para proselitismo: ${cs2}`);
  }

  // 7. QualityReport completo
  const qr1 = computeQualityReport({
    response: goodResponse,
    userMessage: 'O que é meditação?',
    feedback: { up: 80, down: 20 },
    refusalValidations: validations1,
  });
  if (qr1.seal !== 'GREEN') {
    errors.push(`computeQualityReport bom deveria ser GREEN: ${qr1.seal} (overall ${qr1.overallScore})`);
  }
  if (qr1.belowTargets.length > 0) {
    errors.push(`computeQualityReport bom não deveria ter belowTargets: ${qr1.belowTargets.join(', ')}`);
  }

  // 8. formatQualityReport
  const fqr = formatQualityReport(qr1);
  if (!fqr.includes('overall') || !fqr.includes('citation_rate')) {
    errors.push('formatQualityReport falhou');
  }

  return { ok: errors.length === 0, errors };
}

// ============================================================================
// Public targets/weights
// ============================================================================

export const QUALITY_TARGETS = TARGETS;
export const QUALITY_WEIGHTS = WEIGHTS;

// Helper para SafetyCheckResult type re-export
export type { SafetyCheckResult, RefusalCategory };
