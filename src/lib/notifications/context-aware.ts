// ============================================================================
// NOTIFICATIONS V2 — Context-Aware Engine (W36)
// ============================================================================
// Decide SE e QUANDO uma notificação v2 deve ser entregue, dado o contexto
// do recipient. Camada PURA (sem I/O) — input = sinais, output = score +
// decisão. Persistência e envio ficam no dispatcher.
//
// Sinais (6 dimensões, cada uma 0..1):
//   1. Time of day    — penaliza notifs durante sleep/quiet hours
//   2. Activity level — pula se user acabou de visitar o app
//   3. Engagement     — prioriza categorias com alta interação do user
//   4. Tradição       — weight por user tradição (Candomblé > Umbanda > ...)
//   5. Locale         — timezone do user + idioma (pt-BR primario)
//   6. Device         — mobile → push, desktop → email
//
// Score final: produto ponderado → [0, 1]. Thresholds:
//   ≥ 0.7 = SEND_NOW     → entrega imediata
//   0.4..0.7 = DEFER     → enfileira para digest ou próxima janela
//   < 0.4 = SKIP         → suprime (mas loga como 'suppressed' p/ auditoria)
//
// LGPD Art. 7: se o user revogou consent de marketing, marketing é SKIP.
// ============================================================================

import type {
  CategoryChannelMatrix,
  NotificationCategory,
} from './preferences-v2';
import {
  DEFAULT_QUIET_HOURS,
  categoryFor,
} from './preferences-v2';
import type { NotificationType } from '@prisma/client';

// ============================================================================
// Tipos públicos
// ============================================================================

export interface ContextSignals {
  /** ISO 8601 timestamp da decisão (default: agora). */
  timestamp?: string;
  /** 'mobile' | 'desktop' | 'tablet' */
  device: 'mobile' | 'desktop' | 'tablet';
  /** Última visita ao app, ISO 8601 (null se nunca). */
  lastVisitAt: string | null;
  /** Engagement score por categoria, 0..1 (categorias sem dado = 0.5). */
  engagementByCategory: Partial<Record<NotificationCategory, number>>;
  /** Tradição principal do user (string livre). */
  tradition: string;
  /** Locale IETF BCP 47 — 'pt-BR' default. */
  locale: string;
  /** IANA timezone. */
  timezone: string;
  /** LGPD consent revogado (para marketing) — se true, marketing=sempre skip. */
  marketingConsentRevoked: boolean;
}

export const DEFAULT_CONTEXT: Required<Omit<ContextSignals, 'lastVisitAt' | 'engagementByCategory' | 'tradition'>> & {
  lastVisitAt: string | null;
  engagementByCategory: Record<NotificationCategory, number>;
  tradition: string;
} = {
  device: 'desktop',
  lastVisitAt: null,
  engagementByCategory: {
    mention: 0.5, reply: 0.5, follow: 0.5, akasha: 0.5,
    marketplace: 0.5, mentorship: 0.5, event: 0.5,
    system: 0.7, marketing: 0.3,
  },
  tradition: 'candomble',
  locale: 'pt-BR',
  timezone: 'America/Sao_Paulo',
  marketingConsentRevoked: false,
};

// ============================================================================
// 1) Time of day — penaliza durante quiet hours
// ============================================================================

function hoursSinceMidnight(tz: string, ts: Date): number {
  // Aproximação simples usando Intl.DateTimeFormat — robusto p/ qualquer tz.
  const fmt = new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: tz,
  });
  const parts = fmt.formatToParts(ts);
  const hh = Number(parts.find((p) => p.type === 'hour')?.value ?? '0');
  const mm = Number(parts.find((p) => p.type === 'minute')?.value ?? '0');
  return hh + mm / 60;
}

function timeInQuietHours(nowHH: number, startHH: number, endHH: number): boolean {
  if (startHH === endHH) return false;
  if (startHH < endHH) {
    return nowHH >= startHH && nowHH < endHH;
  }
  // wrap-around (22:00 → 07:00)
  return nowHH >= startHH || nowHH < endHH;
}

export function scoreTimeOfDay(
  quietHours: { enabled: boolean; start: string; end: string; timezone: string },
  ts: Date = new Date()
): { score: number; reason: string } {
  if (!quietHours.enabled) return { score: 1.0, reason: 'quiet hours desativadas' };
  const parseHHMM = (s: string): number => {
    const [h, m] = s.split(':').map(Number);
    return h + m / 60;
  };
  const tz = quietHours.timezone || 'America/Sao_Paulo';
  const now = hoursSinceMidnight(tz, ts);
  const start = parseHHMM(quietHours.start);
  const end = parseHHMM(quietHours.end);
  if (timeInQuietHours(now, start, end)) {
    return { score: 0.2, reason: `quiet hours (${quietHours.start}-${quietHours.end} ${tz})` };
  }
  // Bonus leve em horário comercial (8-20)
  if (now >= 8 && now <= 20) return { score: 1.0, reason: 'horário comercial' };
  // Fora de quiet + fora comercial = neutro
  return { score: 0.6, reason: 'horário noturno (sem quiet)' };
}

// ============================================================================
// 2) Activity level — pula se user acabou de visitar (< 10 min)
// ============================================================================

export function scoreActivity(
  lastVisitAt: string | null,
  ts: Date = new Date()
): { score: number; reason: string } {
  if (!lastVisitAt) return { score: 0.7, reason: 'sem registro de visita' };
  const last = new Date(lastVisitAt).getTime();
  const ageMin = (ts.getTime() - last) / 60000;
  if (ageMin < 10) return { score: 0.1, reason: `visita recente (${ageMin.toFixed(0)}min)` };
  if (ageMin < 60) return { score: 0.4, reason: `visita < 1h (${ageMin.toFixed(0)}min)` };
  if (ageMin < 60 * 24) return { score: 0.7, reason: `visita < 24h (${ageMin.toFixed(0)}min)` };
  return { score: 0.5, reason: `visita > 24h (${(ageMin / 60).toFixed(1)}h)` };
}

// ============================================================================
// 3) Engagement — peso por categoria
// ============================================================================

export function scoreEngagement(
  category: NotificationCategory,
  engagement: Partial<Record<NotificationCategory, number>>
): { score: number; reason: string } {
  const v = engagement[category];
  if (typeof v !== 'number') return { score: 0.5, reason: `${category}: sem dado (default 0.5)` };
  const clamped = Math.max(0, Math.min(1, v));
  return { score: clamped, reason: `${category}: engagement=${clamped.toFixed(2)}` };
}

// ============================================================================
// 4) Tradição — boost para tradições ativas
// ============================================================================

const TRADITION_BOOST: Record<string, number> = {
  candomble: 1.0,
  umbanda: 1.0,
  ifa: 0.95,
  cabala: 0.9,
  astrologia: 0.85,
  tantra: 0.85,
};

export function scoreTradition(tradition: string): { score: number; reason: string } {
  const k = tradition.toLowerCase().trim();
  const v = TRADITION_BOOST[k];
  if (v !== undefined) return { score: v, reason: `tradição ${k}: ${v}` };
  return { score: 0.6, reason: `tradição desconhecida: ${k}` };
}

// ============================================================================
// 5) Locale — pt-BR primário; outros idiomas penalizam leve
// ============================================================================

export function scoreLocale(locale: string): { score: number; reason: string } {
  const k = locale.toLowerCase();
  if (k === 'pt-br' || k === 'pt') return { score: 1.0, reason: `locale ${k}: primário` };
  if (k === 'en' || k === 'en-us') return { score: 0.8, reason: `locale ${k}: suportado` };
  return { score: 0.6, reason: `locale ${k}: não priorizado` };
}

// ============================================================================
// 6) Device — mobile → push, desktop → email
// ============================================================================

export function deviceChannelAffinity(
  device: 'mobile' | 'desktop' | 'tablet'
): { push: number; email: number } {
  if (device === 'mobile')  return { push: 1.2, email: 0.7 };
  if (device === 'tablet')  return { push: 1.0, email: 0.9 };
  return                       { push: 0.6, email: 1.2 }; // desktop
}

// ============================================================================
// Score composto + decisão
// ============================================================================

export type ContextAwareDecision =
  | 'SEND_NOW'      // score ≥ 0.7
  | 'DEFER_DIGEST'  // 0.4 ≤ score < 0.7
  | 'SKIP';         // score < 0.4

export interface ContextAwareResult {
  decision: ContextAwareDecision;
  finalScore: number;
  signals: Record<string, number>;
  rationale: string[];
}

const WEIGHTS = {
  timeOfDay: 0.25,
  activity: 0.15,
  engagement: 0.25,
  tradition: 0.10,
  locale: 0.10,
  // device não contribui p/ score (afeta affinity de canal)
  // mas pode ser injetado depois.
} as const;

export function evaluateContext(
  category: NotificationCategory,
  ctx: ContextSignals,
  quietHours: { enabled: boolean; start: string; end: string; timezone: string }
): ContextAwareResult {
  const ts = ctx.timestamp ? new Date(ctx.timestamp) : new Date();

  // LGPD Art. 7: marketing sem consent → SKIP direto
  if (category === 'marketing' && ctx.marketingConsentRevoked) {
    return {
      decision: 'SKIP',
      finalScore: 0,
      signals: { timeOfDay: 0, activity: 0, engagement: 0, tradition: 0, locale: 0 },
      rationale: ['LGPD: marketing consent revogado'],
    };
  }

  const tod = scoreTimeOfDay(quietHours, ts);
  const act = scoreActivity(ctx.lastVisitAt, ts);
  const eng = scoreEngagement(category, ctx.engagementByCategory);
  const trd = scoreTradition(ctx.tradition);
  const loc = scoreLocale(ctx.locale);

  const signals = {
    timeOfDay: tod.score,
    activity: act.score,
    engagement: eng.score,
    tradition: trd.score,
    locale: loc.score,
  };

  const weighted = (
    signals.timeOfDay  * WEIGHTS.timeOfDay   +
    signals.activity    * WEIGHTS.activity    +
    signals.engagement  * WEIGHTS.engagement  +
    signals.tradition   * WEIGHTS.tradition   +
    signals.locale      * WEIGHTS.locale
  );
  // Normaliza pela soma dos pesos (1.0 sem device).
  const norm = weighted / (
    WEIGHTS.timeOfDay + WEIGHTS.activity + WEIGHTS.engagement + WEIGHTS.tradition + WEIGHTS.locale
  );

  let decision: ContextAwareDecision;
  if (norm >= 0.7) decision = 'SEND_NOW';
  else if (norm >= 0.4) decision = 'DEFER_DIGEST';
  else decision = 'SKIP';

  return {
    decision,
    finalScore: Math.round(norm * 1000) / 1000,
    signals,
    rationale: [tod.reason, act.reason, eng.reason, trd.reason, loc.reason],
  };
}

// ============================================================================
// Bridge: NotificationType → avaliação (usado pelo scheduler)
// ============================================================================

export interface BridgeContextSignals extends ContextSignals {
  matrix: CategoryChannelMatrix;
  quietHours: { enabled: boolean; start: string; end: string; timezone: string };
}

export function evaluateForType(
  type: NotificationType,
  ctx: BridgeContextSignals
): ContextAwareResult & { category: NotificationCategory } {
  const category = categoryFor(type);
  const result = evaluateContext(category, ctx, ctx.quietHours);
  return { ...result, category };
}

// ============================================================================
// Self-check
// ============================================================================

export function contextAwareSelfCheck(): { ok: boolean; details: string[] } {
  const details: string[] = [];
  try {
    const ctx: ContextSignals = {
      device: 'mobile',
      lastVisitAt: null,
      engagementByCategory: { mention: 0.8, marketing: 0.9 },
      tradition: 'candomble',
      locale: 'pt-BR',
      timezone: 'America/Sao_Paulo',
      marketingConsentRevoked: false,
    };
    const quietHours = DEFAULT_QUIET_HOURS;
    const r1 = evaluateContext('mention', ctx, quietHours);
    if (!r1.signals.timeOfDay && r1.signals.timeOfDay !== 0) {
      details.push('sinal timeOfDay ausente');
    }
    if (r1.decision === 'SKIP' && r1.finalScore < 0.4) {
      // OK — score < 0.4
    } else if (r1.decision === 'DEFER_DIGEST' || r1.decision === 'SEND_NOW') {
      // OK
    } else {
      details.push(`decision inesperada: ${r1.decision}`);
    }

    // Marketing com consent revogado → SKIP sempre
    const r2 = evaluateContext('marketing', { ...ctx, marketingConsentRevoked: true }, quietHours);
    if (r2.decision !== 'SKIP') {
      details.push(`marketing revogado deveria ser SKIP, foi ${r2.decision}`);
    }

    // Bridge para tipo
    const r3 = evaluateForType('MENTION', { ...ctx, matrix: {} as CategoryChannelMatrix, quietHours });
    if (r3.category !== 'mention') {
      details.push('bridge MENTION → mention falhou');
    }

    // Activity recente deve reduzir score
    const recent = evaluateContext('reply', {
      ...ctx,
      lastVisitAt: new Date(Date.now() - 5 * 60000).toISOString(),
    }, { ...quietHours, enabled: false });
    if (recent.signals.activity > 0.2) {
      details.push('activity score deveria ser baixo em visita recente');
    }

    // Quiet hours penaliza
    const quiet = evaluateContext('reply', { ...ctx, lastVisitAt: null }, quietHours);
    if (quiet.signals.timeOfDay > 0.5) {
      details.push('timeOfDay deveria ser baixo durante quiet hours');
    }
  } catch (e) {
    details.push(`exceção: ${(e as Error).message}`);
  }
  return { ok: details.length === 0, details };
}
