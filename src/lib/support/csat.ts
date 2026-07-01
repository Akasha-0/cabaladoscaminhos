// ============================================================================
// lib/support/csat — Customer Satisfaction surveys (Wave 37)
// ============================================================================
// CSAT = média de ratings 1-5 após ticket CLOSED/RESOLVED.
//
//   - 5 = Promotor (recomendaria)
//
// LGPD Art. 7 + 18: ratings agregados não carregam PII. `comment` é
// armazenado com consentimento explícito (opt-in ao enviar).
//
// Detractor rule: rating <=3 dispara alerta ao manager (fila de moderação).
//
// Wave 37 entrega:
//   - submitCsat(): valida + persiste + escala se detractor
//   - aggregateCsat(): média semanal por período
//   - detectDetractors(): lista de tickets que precisam atenção
// ============================================================================

import type { CsatStats } from './types';

// ============================================================================
// Validation
// ============================================================================
export interface CsatInput {
  ticketId: string;
  userId: string | null;
  email: string | null;
  rating: number;
  comment?: string | null;
}

export function validateCsat(input: CsatInput): { ok: boolean; reason?: string } {
  if (input.rating < 1 || input.rating > 5 || !Number.isInteger(input.rating)) {
    return { ok: false, reason: 'rating deve ser inteiro 1-5' };
  }
  if (!input.ticketId) {
    return { ok: false, reason: 'ticketId obrigatório' };
  }
  if (!input.userId && !input.email) {
    return { ok: false, reason: 'userId ou email obrigatório (LGPD rastro)' };
  }
  if (input.comment && input.comment.length > 2000) {
    return { ok: false, reason: 'comment muito longo (máx 2000)' };
  }
  return { ok: true };
}

// ============================================================================
// CSAT score formula: % de respostas 4-5 (industry standard)
// ============================================================================
export function aggregateCsat(
  ratings: Array<{ rating: number; createdAt: Date }>,
): CsatStats {
  const total = ratings.length;
  if (total === 0) {
    return { total: 0, average: 0, promoters: 0, passives: 0, detractors: 0, csatScore: 0 };
  }
  let sum = 0;
  let promoters = 0;
  let passives = 0;
  let detractors = 0;
  for (const r of ratings) {
    sum += r.rating;
    if (r.rating === 5) promoters += 1;
    else if (r.rating === 4) passives += 1;
    else detractors += 1;
  }
  const average = Math.round((sum / total) * 10) / 10;
  const csatScore = Math.round(((promoters + passives) / total) * 100);
  return { total, average, promoters, passives, detractors, csatScore };
}

// ============================================================================
// Detractor detection (rating <= 3)
// ============================================================================
export interface DetractorTicket {
  ticketId: string;
  rating: number;
  comment: string | null;
  closedAt: Date;
}

export function detectDetractors(
  ratings: Array<{ ticketId: string; rating: number; comment: string | null; closedAt: Date }>,
): DetractorTicket[] {
  return ratings
    .filter((r) => r.rating <= 3)
    .map((r) => ({
      ticketId: r.ticketId,
      rating: r.rating,
      comment: r.comment,
      closedAt: r.closedAt,
    }));
}

// ============================================================================
// Weekly CSAT report
// ============================================================================
export interface WeeklyCsatReport {
  weekIso: string;
  totalResponses: number;
  average: number;
  csatScore: number;
  detractors: DetractorTicket[];
  trend: 'UP' | 'DOWN' | 'STABLE' | 'INSUFFICIENT_DATA';
}

export function buildWeeklyCsatReport(
  weekIso: string,
  ratings: Array<{ rating: number; comment: string | null; closedAt: Date; createdAt: Date }>,
  previousWeekScore: number | null,
): WeeklyCsatReport {
  const stats = aggregateCsat(ratings);
  const detractors = detectDetractors(
    ratings.map((r) => ({
      ticketId: 'tbd',
      rating: r.rating,
      comment: r.comment,
      closedAt: r.closedAt,
    })),
  );
  let trend: WeeklyCsatReport['trend'] = 'INSUFFICIENT_DATA';
  if (stats.total >= 5 && previousWeekScore !== null) {
    const delta = stats.csatScore - previousWeekScore;
    if (delta > 5) trend = 'UP';
    else if (delta < -5) trend = 'DOWN';
    else trend = 'STABLE';
  }
  return {
    weekIso,
    totalResponses: stats.total,
    average: stats.average,
    csatScore: stats.csatScore,
    detractors,
    trend,
  };
}

// ============================================================================
// Should-escalate helper (manager review queue)
// ============================================================================
export function shouldEscalateToManager(rating: number, comment: string | null): boolean {
  if (rating <= 2) return true; // hard escalation
  if (rating === 3 && comment && comment.length > 50) return true; // thoughtful detractor
  return false;
}