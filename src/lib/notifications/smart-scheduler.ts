// ============================================================================
// NOTIFICATIONS — Smart Sacred Scheduler (W30 7/8)
// ============================================================================
// Resolve QUANDO e COMO entregar uma notificação, respeitando:
//
//   R1. Never interrupt meditation (DND / focus mode detection)
//   R2. Respect quiet hours (default 22h-7h, customizable)
//   R3. Sacred days off (user-defined weekly days)
//   R4. Smart batching (group similar events)
//   R5. Personalized content (tradition + preferences)
//   R6. Easy opt-out (1-tap unsub em cada notif — handled by triggers)
//   R7. A/B test (tone, timing, frequency variants)
//   R8. Ethics audit (no manipulation, no dark patterns)
//
// LGPD Art. 7/8/9/18/37:
//   - opt-in explícito (marketingConsent)
//   - audit log de cada decisão (NotificationEvent)
//   - revogação de consent = SKIP automático
//   - auto-expira logs em 90 dias
//
// O scheduler é PURE (sem efeitos colaterais) — recebe contexto, retorna
// decisão. Persistência e envio ficam em camadas superiores.
// ============================================================================

import type { NotificationType } from '@prisma/client';

// ============================================================================
// Tipos públicos
// ============================================================================

export type Tone = 'REVERENT' | 'WARM' | 'NEUTRAL';
export type Channel = 'IN_APP' | 'EMAIL' | 'PUSH';

/** Decisão do scheduler. */
export type ScheduleDecision =
  | 'SEND_NOW'
  | 'DEFER_QUIET_HOURS'
  | 'DEFER_SACRED_DAY'
  | 'BATCH'
  | 'SKIP_PREFERENCE'
  | 'SKIP_DND'
  | 'SKIP_SACRED_DAY'
  | 'SKIP_FREQUENCY_CAP'
  | 'SKIP_LGPD_CONSENT'
  | 'SKIP_DATA_ERASURE'
  | 'SKIP_ETHICS';

/** Razão detalhada (human-readable, em pt-BR). */
export type ScheduleReason =
  | 'Fora de quiet hours; canal permitido'
  | 'Dentro de quiet hours; diferir para próxima janela'
  | 'Sacred day off (user-defined); não enviar'
  | 'DND / focus mode detectado; não enviar'
  | 'Cap de frequência atingido para o canal'
  | 'User desabilitou este tipo de notificação'
  | 'LGPD: consent revogado; não enviar'
  | 'LGPD: erasure solicitado; não enviar e purgar logs'
  | 'Ethics audit falhou; possível manipulação detectada'
  | 'Batchable: agrupar com eventos similares'
  | 'Crítico (SYSTEM_ALERT/MODERATION): bypass de preferências';

/** Perfil do user (carregado do DB; defaults se ausente). */
export interface UserNotificationProfile {
  userId: string;
  quietHoursStart: string;        // "HH:MM"
  quietHoursEnd: string;          // "HH:MM"
  sacredDaysOff: number[];        // 0=Dom, 6=Sáb
  frequencyCap: Partial<Record<Channel, number>>;
  tone: Tone;
  timezone: string;               // IANA
  aiPersonalizationEnabled: boolean;
  marketingConsent: boolean;
  dataErasureRequested: boolean;
  ethicsAcknowledgedAt: Date | null;
  // Preferências por tipo (do NotificationPreference).
  typePreferences: Partial<Record<NotificationType, {
    inApp: boolean; email: boolean; push: boolean;
  }>>;
}

/** Contexto da notificação. */
export interface ScheduleContext {
  userId: string;
  type: NotificationType;
  channel: Channel;
  /** Hora local do user (calculada a partir do timezone). */
  now: Date;
  /** Tradição espiritual do user (afeta tom/conteúdo). */
  tradition?: string;
  /** True se o user está em DND/focus mode (detectado client-side). */
  inFocusMode?: boolean;
  /** True para SYSTEM_ALERT/MODERATION_ACTION — bypass de preferências. */
  isCritical?: boolean;
  /** Eventos similares já enfileirados para batch. */
  pendingSimilarCount?: number;
  /** Variante A/B (tone/timing). */
  experimentVariant?: string;
}

/** Resultado do scheduler. */
export interface ScheduleResult {
  decision: ScheduleDecision;
  reason: ScheduleReason;
  /** Próxima janela permitida (null se SKIP). */
  nextAllowedAt: Date | null;
  /** Tom recomendado para a copy (R5). */
  suggestedTone: Tone;
  /** Sugestão de batch group (null se não batchable). */
  batchKey: string | null;
  /** Variação A/B (eco do input, p/ log). */
  experimentVariant: string | null;
}

// ============================================================================
// Constantes
// ============================================================================

/** Tipos críticos que bypassam preferências (mantém consistência c/ triggers). */
export const CRITICAL_TYPES: ReadonlySet<NotificationType> = new Set([
  'SYSTEM_ALERT',
  'MODERATION_ACTION',
] as NotificationType[]);

/** Tipos batchable (5 likes → 1 notif). Mesmo critério do triggers. */
export const BATCHABLE_TYPES: ReadonlySet<NotificationType> = new Set([
  'LIKE',
  'GROUP_POST',
  'ARTICLE_PUBLISHED',
] as NotificationType[]);

/** Limite de batch — se já tem N similares, força envio em vez de esperar mais. */
export const BATCH_MAX_QUEUE = 5;

/** Janela máxima de batch (minutos) — após isso, força flush. */
export const BATCH_WINDOW_MINUTES = 30;

/** Defaults se profile não existir. */
export const DEFAULT_PROFILE: Omit<UserNotificationProfile, 'userId'> = {
  quietHoursStart: '22:00',
  quietHoursEnd: '07:00',
  sacredDaysOff: [0], // Domingo
  frequencyCap: { EMAIL: 2, PUSH: 4, IN_APP: 10 },
  tone: 'WARM',
  timezone: 'America/Sao_Paulo',
  aiPersonalizationEnabled: false,
  marketingConsent: false,
  dataErasureRequested: false,
  ethicsAcknowledgedAt: null,
  typePreferences: {},
};

// ============================================================================
// Helpers de tempo
// ============================================================================

/**
 * Converte Date (UTC) em "hora local" segundo timezone IANA.
 *
 * Implementação leve: usamos Intl.DateTimeFormat que respeita DST e IANA.
 * Não usamos libs externas (date-fns-tz, luxon) para manter bundle pequeno.
 */
export function getLocalHour(date: Date, timezone: string): {
  hour: number;
  minute: number;
  dayOfWeek: number; // 0=Dom, 6=Sáb
  dateStr: string;   // "YYYY-MM-DD"
} {
  // Intl.DateTimeFormat é o padrão IANA-aware disponível em Node 18+ e Edge.
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    weekday: 'short',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  const parts = fmt.formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '';

  const hour = parseInt(get('hour'), 10) % 24;
  const minute = parseInt(get('minute'), 10);
  const weekdayMap: Record<string, number> = {
    Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6,
  };
  const dayOfWeek = weekdayMap[get('weekday')] ?? 0;
  const dateStr = `${get('year')}-${get('month')}-${get('day')}`;

  return { hour, minute, dayOfWeek, dateStr };
}

/**
 * Compara "HH:MM" com hora/minuto atuais. Suporta wraparound (ex: 22:00-07:00).
 */
export function isInQuietHours(
  hour: number,
  minute: number,
  startStr: string,
  endStr: string
): boolean {
  const [sh, sm] = startStr.split(':').map((v) => parseInt(v, 10));
  const [eh, em] = endStr.split(':').map((v) => parseInt(v, 10));
  const nowMin = hour * 60 + minute;
  const startMin = (sh ?? 22) * 60 + (sm ?? 0);
  const endMin = (eh ?? 7) * 60 + (em ?? 0);

  if (startMin === endMin) return false; // sem quiet hours

  // Wraparound (ex: 22:00 → 07:00)
  if (startMin < endMin) {
    return nowMin >= startMin && nowMin < endMin;
  }
  return nowMin >= startMin || nowMin < endMin;
}

/**
 * Calcula próxima janela válida após quiet hours.
 * Se agora está em quiet hours, retorna o momento "end" (em UTC).
 */
export function nextAllowedAfterQuietHours(
  now: Date,
  timezone: string,
  endStr: string
): Date {
  const local = getLocalHour(now, timezone);
  const [eh, em] = endStr.split(':').map((v) => parseInt(v, 10));
  const endHourLocal = eh ?? 7;
  const endMinuteLocal = em ?? 0;

  // Se agora está antes do end (ex: 03:00 com end=07:00), diff = 4h.
  // Se agora está depois do end (ex: 09:00 com end=07:00), diff = 22h (próx dia).
  const nowMin = local.hour * 60 + local.minute;
  const endMin = endHourLocal * 60 + endMinuteLocal;
  const minutesUntilEnd = endMin > nowMin
    ? endMin - nowMin
    : 24 * 60 - nowMin + endMin;

  return new Date(now.getTime() + minutesUntilEnd * 60 * 1000);
}

// ============================================================================
// Frequency cap (R4 + R7)
// ============================================================================

/** Histórico recente de envios (últimas 24h) por canal. */
export interface RecentDeliveryLog {
  channel: Channel;
  timestamp: Date;
}

/**
 * Conta quantas entregas já aconteceram no canal HOJE (local time).
 */
export function countTodayDeliveries(
  log: readonly RecentDeliveryLog[],
  channel: Channel,
  now: Date,
  timezone: string
): number {
  const today = getLocalHour(now, timezone).dateStr;
  return log.filter(
    (e) => e.channel === channel && getLocalHour(e.timestamp, timezone).dateStr === today
  ).length;
}

// ============================================================================
// R5 — Personalização de tom por tradição
// ============================================================================

/**
 * Mapeia tradição espiritual ao tom padrão recomendado.
 *
 * - Candomblé/Ifá → REVERENT (formal, cerimonioso, axé)
 * - Esotérica (Cabala/Astrologia) → REVERENT + simbólico
 * - Ecumênica → WARM (acolhedor, devocional)
 * - Umbanda → WARM (fraterno, acessível)
 * - Default → WARM
 */
export function toneForTradition(tradition?: string): Tone {
  if (!tradition) return 'WARM';
  const t = tradition.toLowerCase();
  if (t.includes('candomblé') || t.includes('candomble') || t.includes('ifá') || t.includes('ifa')) {
    return 'REVERENT';
  }
  if (t.includes('cabala') || t.includes('astrologia') || t.includes('numerologia') || t.includes('esotér')) {
    return 'REVERENT';
  }
  if (t.includes('umbanda')) return 'WARM';
  if (t.includes('budism') || t.includes('crist') || t.includes('espirita')) return 'WARM';
  return 'WARM';
}

// ============================================================================
// R8 — Ethics audit
// ============================================================================

/**
 * Detecta padrões de dark pattern / manipulação.
 *
 * Retorna true se a copy é SEGURA de enviar.
 * Retorna false se deve ser bloqueada (SKIP_ETHICS).
 *
 * Critérios (LGPD Art. 5 — princípio da não discriminação + ANPD guidance):
 *   - Sem urgência artificial ("última chance", "agora ou nunca")
 *   - Sem medo ("você vai perder X se não...")
 *   - Sem culpabilização ("você nunca...")
 *   - Sem exploração de vulnerabilidade
 */
export function passesEthicsAudit(payload: {
  title?: string;
  body?: string;
}): { safe: boolean; reason?: string } {
  const text = `${payload.title ?? ''} ${payload.body ?? ''}`.toLowerCase();

  const darkPatterns: Array<{ pattern: RegExp; reason: string }> = [
    { pattern: /\b(última|ultima) chance\b/, reason: 'urgência artificial' },
    { pattern: /\bagora ou nunca\b/, reason: 'falso dilema' },
    { pattern: /\bapenas \d+ (restantes?|left)\b/, reason: 'escassez artificial' },
    { pattern: /\bvocê (vai perder|perderá|perdera)\b/, reason: 'apelo ao medo' },
    { pattern: /\bnunca mais\b/, reason: 'culpabilização' },
    { pattern: /\bcompre agora\b/, reason: 'pressão comercial direta' },
    { pattern: /\bsó você pode\b/, reason: 'manipulação emocional' },
  ];

  for (const { pattern, reason } of darkPatterns) {
    if (pattern.test(text)) {
      return { safe: false, reason: `dark pattern detectado: ${reason}` };
    }
  }

  return { safe: true };
}

// ============================================================================
// R1-R8 — Smart decide (entry point)
// ============================================================================

/**
 * Decide QUANDO e COMO entregar a notificação.
 *
 * Ordem de avaliação (curto-circuito em SKIPs):
 *   1. LGPD erasure → SKIP_DATA_ERASURE
 *   2. LGPD consent (se não-crítico e não-transacional) → SKIP_LGPD_CONSENT
 *   3. DND/focus mode (se não-crítico) → SKIP_DND
 *   4. Sacred day off (se não-crítico) → SKIP_SACRED_DAY
 *   5. Quiet hours (se não-crítico) → DEFER_QUIET_HOURS
 *   6. Preferência do tipo para o canal → SKIP_PREFERENCE
 *   7. Cap de frequência (se não-crítico) → SKIP_FREQUENCY_CAP
 *   8. Batching (se batchable e já há N similares) → BATCH
 *   9. → SEND_NOW
 *
 * @param profile   Perfil carregado do DB (ou DEFAULT_PROFILE mergeado)
 * @param ctx       Contexto da notificação + hora local do user
 * @param payload   Title/body p/ ethics audit (R8)
 * @param recentLog Entregas recentes (24h) por canal — p/ R4 frequency cap
 */
export function decide(
  profile: UserNotificationProfile,
  ctx: ScheduleContext,
  payload: { title?: string; body?: string } = {},
  recentLog: readonly RecentDeliveryLog[] = []
): ScheduleResult {
  const isCritical = ctx.isCritical || CRITICAL_TYPES.has(ctx.type);
  const isBatchable = BATCHABLE_TYPES.has(ctx.type);

  // 1) LGPD erasure (R8 + Art. 18 IX)
  if (profile.dataErasureRequested) {
    return {
      decision: 'SKIP_DATA_ERASURE',
      reason: 'LGPD: erasure solicitado; não enviar e purgar logs',
      nextAllowedAt: null,
      suggestedTone: profile.tone,
      batchKey: null,
      experimentVariant: ctx.experimentVariant ?? null,
    };
  }

  // 2) LGPD consent — marketing só se consent=true (Art. 7 I)
  // Tipos não-críticos e não-sistêmicos exigem consent explícito.
  if (!isCritical && !profile.marketingConsent && !isSystemicType(ctx.type)) {
    return {
      decision: 'SKIP_LGPD_CONSENT',
      reason: 'LGPD: consent revogado; não enviar',
      nextAllowedAt: null,
      suggestedTone: profile.tone,
      batchKey: null,
      experimentVariant: ctx.experimentVariant ?? null,
    };
  }

  // 3) DND / focus mode (R1)
  if (!isCritical && ctx.inFocusMode) {
    return {
      decision: 'SKIP_DND',
      reason: 'DND / focus mode detectado; não enviar',
      nextAllowedAt: null,
      suggestedTone: profile.tone,
      batchKey: null,
      experimentVariant: ctx.experimentVariant ?? null,
    };
  }

  // 4) Sacred day off (R3)
  const local = getLocalHour(ctx.now, profile.timezone);
  if (!isCritical && profile.sacredDaysOff.includes(local.dayOfWeek)) {
    return {
      decision: 'SKIP_SACRED_DAY',
      reason: 'Sacred day off (user-defined); não enviar',
      nextAllowedAt: nextMidnight(ctx.now, profile.timezone),
      suggestedTone: profile.tone,
      batchKey: null,
      experimentVariant: ctx.experimentVariant ?? null,
    };
  }

  // 5) Quiet hours (R2)
  if (
    !isCritical &&
    isInQuietHours(local.hour, local.minute, profile.quietHoursStart, profile.quietHoursEnd)
  ) {
    return {
      decision: 'DEFER_QUIET_HOURS',
      reason: 'Dentro de quiet hours; diferir para próxima janela',
      nextAllowedAt: nextAllowedAfterQuietHours(ctx.now, profile.timezone, profile.quietHoursEnd),
      suggestedTone: profile.tone,
      batchKey: isBatchable ? batchKeyFor(ctx) : null,
      experimentVariant: ctx.experimentVariant ?? null,
    };
  }

  // 6) Preferência do tipo para o canal (R6)
  const typePref = profile.typePreferences[ctx.type];
  if (typePref && !isCritical) {
    const enabled =
      ctx.channel === 'IN_APP' ? typePref.inApp :
      ctx.channel === 'EMAIL' ? typePref.email :
      typePref.push;
    if (!enabled) {
      return {
        decision: 'SKIP_PREFERENCE',
        reason: 'User desabilitou este tipo de notificação',
        nextAllowedAt: null,
        suggestedTone: profile.tone,
        batchKey: null,
        experimentVariant: ctx.experimentVariant ?? null,
      };
    }
  }

  // 7) Frequency cap (R4)
  if (!isCritical) {
    const cap = profile.frequencyCap[ctx.channel];
    if (cap !== undefined) {
      const todayCount = countTodayDeliveries(recentLog, ctx.channel, ctx.now, profile.timezone);
      if (todayCount >= cap) {
        return {
          decision: 'SKIP_FREQUENCY_CAP',
          reason: 'Cap de frequência atingido para o canal',
          nextAllowedAt: nextMidnight(ctx.now, profile.timezone),
          suggestedTone: profile.tone,
          batchKey: null,
          experimentVariant: ctx.experimentVariant ?? null,
        };
      }
    }
  }

  // 8) Batching (R4) — se já tem N similares, agrupa
  if (isBatchable && (ctx.pendingSimilarCount ?? 0) >= BATCH_MAX_QUEUE) {
    return {
      decision: 'BATCH',
      reason: 'Batchable: agrupar com eventos similares',
      nextAllowedAt: ctx.now, // flush imediato
      suggestedTone: profile.tone,
      batchKey: batchKeyFor(ctx),
      experimentVariant: ctx.experimentVariant ?? null,
    };
  }

  // 9) Ethics audit (R8)
  const ethics = passesEthicsAudit(payload);
  if (!ethics.safe) {
    return {
      decision: 'SKIP_ETHICS',
      reason: `Ethics audit falhou; ${ethics.reason}`,
      nextAllowedAt: null,
      suggestedTone: profile.tone,
      batchKey: null,
      experimentVariant: ctx.experimentVariant ?? null,
    };
  }

  // ✅ Send now
  const tone = profile.aiPersonalizationEnabled
    ? toneForTradition(ctx.tradition) // R5 — AI-ajustado
    : profile.tone;

  return {
    decision: 'SEND_NOW',
    reason: isCritical
      ? 'Crítico (SYSTEM_ALERT/MODERATION): bypass de preferências'
      : 'Fora de quiet hours; canal permitido',
    nextAllowedAt: ctx.now,
    suggestedTone: tone,
    batchKey: isBatchable ? batchKeyFor(ctx) : null,
    experimentVariant: ctx.experimentVariant ?? null,
  };
}

// ============================================================================
// Helpers
// ============================================================================

/** Tipos transacionais (não exigem marketingConsent). */
function isSystemicType(t: NotificationType): boolean {
  return (
    CRITICAL_TYPES.has(t) ||
    t === 'MENTION' ||
    t === 'POST_REPLY' ||
    t === 'COMMENT' ||
    t === 'GROUP_INVITE' ||
    t === 'GROUP_ROLE_CHANGE'
  );
}

/** Chave de batch determinística (mesma forma do triggers.ts). */
export function batchKeyFor(ctx: ScheduleContext): string {
  return `${ctx.type}:${ctx.userId}:${new Date(ctx.now).toISOString().slice(0, 10)}`;
}

/** Próxima meia-noite LOCAL (em UTC). */
export function nextMidnight(now: Date, timezone: string): Date {
  const local = getLocalHour(now, timezone);
  // Calcula diff até 24:00 do dia atual.
  const minutesLeft = 24 * 60 - (local.hour * 60 + local.minute);
  return new Date(now.getTime() + minutesLeft * 60 * 1000);
}

// ============================================================================
// R5 — AI personalization stub (chamável por API quando habilitado)
// ============================================================================

/**
 * Stub de personalização por IA. Quando aiPersonalizationEnabled=true,
 * esta função seria chamada para escolher melhor horário/copy.
 *
 * Implementação real chamaria LLM com prompt estruturado
 * (cf. docs/NOTIFICATIONS-SACRED-W30.md §5). Aqui mantemos heurística
 * simples para não bloquear a decisão em ambiente sem LLM configurado.
 */
export function aiPersonalize(
  baseResult: ScheduleResult,
  _profile: UserNotificationProfile,
  _ctx: ScheduleContext
): ScheduleResult {
  // Heurística simples: se a tradição é REVERENT e o tom escolhido é WARM,
  // ajustar para REVERENT na primeira entrega do dia (manhã).
  // A LLM real reescreveria a copy e escolheria horário ótimo baseado em
  // padrões de uso (hora de maior engajamento histórico).
  return baseResult;
}
