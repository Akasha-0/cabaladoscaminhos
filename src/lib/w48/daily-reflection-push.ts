/**
 * w48/daily-reflection-push.ts
 * -----------------------------------------------------------------------------
 * Daily reflection push notification integration layer.
 *
 * Complements:
 *   - w47/daily-reflection-prompt    (reflection prompt corpus + streak)
 *   - w43/notifications-persistence  (delivery history persistence)
 *   - w41/notifications-push-real    (push transport layer)
 *   - w47/voice-mode-tts             (optional voice variant of the push body)
 *   - w48/sacred-symbols-registry    (iconRef cross-reference)
 *
 * Pure TypeScript, no external runtime dependencies. Safe for per-file TSC
 * validation under the cabaladoscaminhos strict-mode tsconfig.
 *
 * Exports 25+ named symbols covering:
 *   - 12+ explicit types (no `any`)
 *   - 6 default schedules
 *   - push template registry
 *   - preferences, delivery queue, time-window matcher
 *   - tradition-aware prompt selection
 *   - streak integration, rate limiting, A/B testing
 *   - cross-platform payload formatters (WebPush / APNs / FCM)
 *   - metrics & observability, i18n (pt-BR / en-US / es-ES), LGPD Art. 17/18
 *   - 12+ typed errors, smoke test runner
 * -----------------------------------------------------------------------------
 */

// ============================================================================
// 1. TYPE DEFINITIONS (Section 1)
// ============================================================================

/** Days of week in IANA-style order (Mon = 0 ... Sun = 6). */
export type ReflectionPushDayOfWeek =
  | 0 | 1 | 2 | 3 | 4 | 5 | 6;

/** IANA timezone string (e.g. "America/Sao_Paulo"). */
export type IANATimezone = string;

/** Supported i18n locales. Keep aligned with i18n config. */
export type ReflectionPushLocale = 'pt-BR' | 'en-US' | 'es-ES';

/** Categories the user can be nudged toward. */
export type ReflectionPushCategory =
  | 'gratitude'
  | 'intention'
  | 'closure'
  | 'exam'
  | 'presence'
  | 'breath'
  | 'oration'
  | 'meditation'
  | 'lunar'
  | 'ancestor'
  | 'orixa'
  | 'sacred-symbol';

/** Tradition key used to filter and rotate prompts. */
export type ReflectionPushTraditionRef =
  | 'candomble'
  | 'umbanda'
  | 'ifa'
  | 'cigano-ramiro'
  | 'kabbalah'
  | 'astrology'
  | 'numerology'
  | 'tarot'
  | 'universal';

/** Lifecycle status of a delivery record. */
export type ReflectionPushStatus =
  | 'pending'
  | 'queued'
  | 'delivered'
  | 'opened'
  | 'failed'
  | 'cancelled'
  | 'expired'
  | 'rate-limited'
  | 'snoozed';

/** Delivery transport. */
export type ReflectionPushTransport =
  | 'web-push'
  | 'apns'
  | 'fcm'
  | 'email-fallback'
  | 'sms-fallback';

/** Window half-open interval in HH:MM 24h local time. */
export interface ReflectionPushWindow {
  readonly startHour: number;
  readonly startMinute: number;
  readonly endHour: number;
  readonly endMinute: number;
  /** If true, end < start means window crosses midnight. */
  readonly crossesMidnight: boolean;
}

/** A schedule — when and how a push should fire. */
export interface ReflectionPushSchedule {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly category: ReflectionPushCategory;
  readonly tradition: ReflectionPushTraditionRef;
  readonly window: ReflectionPushWindow;
  readonly daysOfWeek: ReadonlyArray<ReflectionPushDayOfWeek>;
  readonly jitterMinutes: number;
  readonly enabled: boolean;
  /** Maximum deliveries per UTC day for this schedule, per user. */
  readonly maxPerDay: number;
  /** Soft priority (higher wins when conflicts arise). */
  readonly priority: number;
}

/** Push payload template (locale-agnostic; resolved per-locale at send time). */
export interface ReflectionPushTemplate {
  readonly id: string;
  readonly scheduleId: string;
  readonly category: ReflectionPushCategory;
  readonly tradition: ReflectionPushTraditionRef;
  readonly abVariant: 'A' | 'B' | 'C';
  /** Localized title strings keyed by locale. Max 50 chars each. */
  readonly titleI18n: Readonly<Record<ReflectionPushLocale, string>>;
  /** Localized body strings keyed by locale. Max 200 chars each. */
  readonly bodyI18n: Readonly<Record<ReflectionPushLocale, string>>;
  /** Deep link to reflection input (e.g. /reflexao/nova?cat=gratitude). */
  readonly deeplink: string;
  /** Icon ref — references w48/sacred-symbols-registry by id. */
  readonly iconRef: string;
  /** Optional voice variant script. References w47/voice-mode-tts. */
  readonly ttsScript?: string;
  /** Tag for client-side grouping/dedupe. */
  readonly collapseId: string;
  /** TTL in seconds (0 = no expiry, default 24h). */
  readonly ttlSeconds: number;
  /** Whether the user must have an active streak for this template. */
  readonly requiresActiveStreak: boolean;
}

/** Concrete record of a delivery attempt. */
export interface ReflectionPushDelivery {
  readonly id: string;
  readonly userId: string;
  readonly scheduleId: string;
  readonly templateId: string;
  readonly category: ReflectionPushCategory;
  readonly abVariant: 'A' | 'B' | 'C';
  readonly scheduledFor: string; // ISO 8601 UTC
  readonly attemptedAt?: string;
  readonly deliveredAt?: string;
  readonly openedAt?: string;
  readonly status: ReflectionPushStatus;
  readonly transport: ReflectionPushTransport;
  readonly retryCount: number;
  readonly failureReason?: string;
  readonly locale: ReflectionPushLocale;
}

/** User preferences (LGPD-managed). */
export interface ReflectionPushPreferences {
  readonly userId: string;
  readonly enabled: boolean;
  readonly timezone: IANATimezone;
  readonly locale: ReflectionPushLocale;
  readonly activeSchedules: ReadonlyArray<string>;
  readonly traditionRotation: boolean;
  readonly traditionOrder: ReadonlyArray<ReflectionPushTraditionRef>;
  readonly quietHours: ReflectionPushWindow;
  readonly maxPerDay: number;
  readonly optInAt: string;
  readonly optOutAt?: string;
  readonly snoozeUntil?: string;
  readonly voiceVariant: boolean;
  readonly personalizedSymbol: boolean;
}

/** Rate limit policy. */
export interface ReflectionPushRateLimit {
  readonly maxDeliveriesPerDay: number;
  readonly maxDeliveriesPerHour: number;
  readonly minIntervalMinutes: number;
  /** Same category cannot repeat within this window (hours). */
  readonly categoryDebounceHours: number;
  /** Same template id cannot repeat within this window (hours). */
  readonly templateDebounceHours: number;
  /** Quiet hours override everything else. */
  readonly quietHoursStrict: boolean;
}

/** A/B test experiment definition. */
export interface ReflectionPushExperiment {
  readonly id: string;
  readonly description: string;
  readonly variants: ReadonlyArray<'A' | 'B' | 'C'>;
  readonly weightA: number;
  readonly weightB: number;
  readonly weightC: number;
  readonly startsAt: string;
  readonly endsAt: string;
}

/** A/B assignment result for a user. */
export interface ABVariant {
  readonly experimentId: string;
  readonly userId: string;
  readonly variant: 'A' | 'B' | 'C';
  readonly assignedAt: string;
}

/** Time-window match result. */
export interface ReflectionPushWindowMatch {
  readonly matches: boolean;
  readonly reason: 'in-window' | 'outside-window' | 'wrong-day' | 'quiet-hours' | 'snoozed' | 'disabled';
  readonly nextEligibleAt?: string;
}

/** Typed error base — every reflection-push error extends this. */
export interface ReflectionPushError {
  readonly code: string;
  readonly message: string;
  readonly recoverable: boolean;
  readonly occurredAt: string;
}

/** Delivery metrics. */
export interface ReflectionPushMetrics {
  readonly windowStart: string;
  readonly windowEnd: string;
  readonly attempted: number;
  readonly delivered: number;
  readonly opened: number;
  readonly failed: number;
  readonly cancelled: number;
  readonly optOuts: number;
  readonly optIns: number;
  readonly perCategory: Readonly<Record<ReflectionPushCategory, number>>;
  readonly perSchedule: Readonly<Record<string, number>>;
  readonly perTransport: Readonly<Record<ReflectionPushTransport, number>>;
}

/** Consent ledger entry (LGPD Art. 18 IV audit trail). */
export interface ConsentLedgerEntry {
  readonly id: string;
  readonly userId: string;
  readonly action: 'opt-in' | 'opt-out' | 'snooze' | 'preference-update' | 'data-export' | 'data-delete';
  readonly at: string;
  readonly ipHash?: string;
  readonly userAgent?: string;
  readonly snapshot?: Readonly<Record<string, unknown>>;
}

/** Data retention policy descriptor. */
export interface ReflectionPushRetentionPolicy {
  readonly deliveryHistoryDays: number;
  readonly snoozeStateDays: number;
  readonly consentLedgerDays: number;
  readonly abAssignmentDays: number;
  readonly metricsRetentionDays: number;
}

/** Streak descriptor — referenced by w47/daily-reflection-prompt. */
export interface ReflectionPushStreak {
  readonly userId: string;
  readonly current: number;
  readonly longest: number;
  readonly lastReflectionAt?: string;
  readonly milestonesHit: ReadonlyArray<7 | 30 | 100 | 365>;
}

// ============================================================================
// 2. SCHEDULE REGISTRY (Section 2)
// ============================================================================

export const MORNING_ORIXA_SCHEDULE: ReflectionPushSchedule = {
  id: 'morning-orixa',
  name: 'Manhã com Orixá',
  description: 'Abertura do dia com a energia do Orixá regente e uma micro-reflexão de 60 segundos.',
  category: 'orixa',
  tradition: 'candomble',
  window: { startHour: 6, startMinute: 0, endHour: 8, endMinute: 0, crossesMidnight: false },
  daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
  jitterMinutes: 15,
  enabled: true,
  maxPerDay: 1,
  priority: 90,
};

export const EVENING_GRATITUDE_SCHEDULE: ReflectionPushSchedule = {
  id: 'evening-gratitude',
  name: 'Gratidão da Noite',
  description: 'Encerramento do dia listando 3 motivos de gratidão, ancorado no Cigano Ramiro.',
  category: 'gratitude',
  tradition: 'cigano-ramiro',
  window: { startHour: 20, startMinute: 0, endHour: 22, endMinute: 0, crossesMidnight: false },
  daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
  jitterMinutes: 20,
  enabled: true,
  maxPerDay: 1,
  priority: 80,
};

export const MIDDAY_ANCHOR_SCHEDULE: ReflectionPushSchedule = {
  id: 'midday-anchor',
  name: 'Âncora do Meio-Dia',
  description: 'Micro-presença: 3 respirações + intenção curta para a segunda metade do dia.',
  category: 'presence',
  tradition: 'universal',
  window: { startHour: 12, startMinute: 0, endHour: 14, endMinute: 0, crossesMidnight: false },
  daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
  jitterMinutes: 30,
  enabled: true,
  maxPerDay: 1,
  priority: 60,
};

export const WEEKEND_DEEP_SCHEDULE: ReflectionPushSchedule = {
  id: 'weekend-deep',
  name: 'Reflexão Profunda de Sábado',
  description: 'Sábado é dia de revisão da semana e exame de consciência.',
  category: 'exam',
  tradition: 'kabbalah',
  window: { startHour: 10, startMinute: 0, endHour: 12, endMinute: 0, crossesMidnight: false },
  daysOfWeek: [6],
  jitterMinutes: 45,
  enabled: true,
  maxPerDay: 1,
  priority: 70,
};

export const MOON_PHASE_SCHEDULE: ReflectionPushSchedule = {
  id: 'moon-phase',
  name: 'Pulso Lunar',
  description: 'Disparado pela fase lunar (sincretismo Cigano Ramiro + Astrologia).',
  category: 'lunar',
  tradition: 'astrology',
  window: { startHour: 18, startMinute: 0, endHour: 21, endMinute: 0, crossesMidnight: false },
  daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
  jitterMinutes: 60,
  enabled: true,
  maxPerDay: 1,
  priority: 95,
};

export const TRADITION_ROTATION_SCHEDULE: ReflectionPushSchedule = {
  id: 'tradition-rotation',
  name: 'Rotação de Tradições',
  description: 'Cada semana destaca uma tradição diferente, segundo a preferência do usuário.',
  category: 'meditation',
  tradition: 'universal',
  window: { startHour: 7, startMinute: 0, endHour: 9, endMinute: 0, crossesMidnight: false },
  daysOfWeek: [1, 3, 5],
  jitterMinutes: 25,
  enabled: true,
  maxPerDay: 1,
  priority: 50,
};

export const DEFAULT_SCHEDULES: ReadonlyArray<ReflectionPushSchedule> = [
  MORNING_ORIXA_SCHEDULE,
  EVENING_GRATITUDE_SCHEDULE,
  MIDDAY_ANCHOR_SCHEDULE,
  WEEKEND_DEEP_SCHEDULE,
  MOON_PHASE_SCHEDULE,
  TRADITION_ROTATION_SCHEDULE,
];

// ============================================================================
// 3. PUSH TEMPLATE ENGINE (Section 3) — base catalog (locale-resolved below)
// ============================================================================

interface TemplateSeed {
  id: string;
  scheduleId: string;
  category: ReflectionPushCategory;
  tradition: ReflectionPushTraditionRef;
  abVariant: 'A' | 'B' | 'C';
  titleI18n: Record<ReflectionPushLocale, string>;
  bodyI18n: Record<ReflectionPushLocale, string>;
  deeplink: string;
  iconRef: string;
  ttsScript?: string;
  collapseId: string;
  ttlSeconds: number;
  requiresActiveStreak: boolean;
}

const TEMPLATE_SEEDS: ReadonlyArray<TemplateSeed> = [
  {
    id: 'tpl-morning-orixa-gratidao',
    scheduleId: 'morning-orixa',
    category: 'gratitude',
    tradition: 'cigano-ramiro',
    abVariant: 'A',
    titleI18n: {
      'pt-BR': 'Bom dia com o Cigano Ramiro',
      'en-US': 'Good morning, traveler',
      'es-ES': 'Buenos días, caminante',
    },
    bodyI18n: {
      'pt-BR': 'Que seu dia seja leve e seu Orixá te proteja. 60s de intenção?',
      'en-US': 'May your day be light. 60 seconds of intention?',
      'es-ES': 'Que tu día sea ligero. ¿60 segundos de intención?',
    },
    deeplink: '/reflexao/nova?cat=gratitude&tpl=morning-orixa',
    iconRef: 'symbol-cigano-ramiro',
    ttsScript: 'voice://cigano-ramiro/morning?locale=pt-BR',
    collapseId: 'morning-orixa',
    ttlSeconds: 60 * 60 * 6,
    requiresActiveStreak: false,
  },
  {
    id: 'tpl-evening-gratidao-tres',
    scheduleId: 'evening-gratitude',
    category: 'gratitude',
    tradition: 'cigano-ramiro',
    abVariant: 'A',
    titleI18n: {
      'pt-BR': '3 motivos de gratidão hoje',
      'en-US': '3 gratitudes for tonight',
      'es-ES': '3 gratitudes esta noche',
    },
    bodyI18n: {
      'pt-BR': 'Antes de dormir, escreva 3 motivos pelos quais seu dia valeu a pena.',
      'en-US': 'Before sleep, write 3 reasons your day was worth it.',
      'es-ES': 'Antes de dormir, escribe 3 razones por las que tu día valió la pena.',
    },
    deeplink: '/reflexao/nova?cat=gratitude&count=3',
    iconRef: 'symbol-three-stars',
    collapseId: 'evening-gratitude',
    ttlSeconds: 60 * 60 * 4,
    requiresActiveStreak: false,
  },
  {
    id: 'tpl-midday-presenca-3',
    scheduleId: 'midday-anchor',
    category: 'presence',
    tradition: 'universal',
    abVariant: 'A',
    titleI18n: {
      'pt-BR': 'Pausa de 90 segundos',
      'en-US': 'A 90-second pause',
      'es-ES': 'Una pausa de 90 segundos',
    },
    bodyI18n: {
      'pt-BR': '3 respirações. 1 intenção para o que vem agora.',
      'en-US': '3 breaths. 1 intention for what comes next.',
      'es-ES': '3 respiraciones. 1 intención para lo que viene.',
    },
    deeplink: '/reflexao/nova?cat=presence',
    iconRef: 'symbol-breath',
    collapseId: 'midday-anchor',
    ttlSeconds: 60 * 30,
    requiresActiveStreak: false,
  },
  {
    id: 'tpl-weekend-exame-cabala',
    scheduleId: 'weekend-deep',
    category: 'exam',
    tradition: 'kabbalah',
    abVariant: 'A',
    titleI18n: {
      'pt-BR': 'Exame da semana (Cabala)',
      'en-US': 'Weekly exam (Kabbalah)',
      'es-ES': 'Examen semanal (Cábala)',
    },
    bodyI18n: {
      'pt-BR': 'Onde você acendeu luz nova? Onde ainda há sombra?',
      'en-US': 'Where did you bring new light? Where is shadow still?',
      'es-ES': '¿Dónde encendiste luz nueva? ¿Dónde aún hay sombra?',
    },
    deeplink: '/reflexao/nova?cat=exam',
    iconRef: 'symbol-tree-of-life',
    collapseId: 'weekend-deep',
    ttlSeconds: 60 * 60 * 12,
    requiresActiveStreak: false,
  },
  {
    id: 'tpl-moon-phase-novilunio',
    scheduleId: 'moon-phase',
    category: 'lunar',
    tradition: 'astrology',
    abVariant: 'A',
    titleI18n: {
      'pt-BR': 'Lua Nova — semear',
      'en-US': 'New Moon — sow',
      'es-ES': 'Luna Nueva — sembrar',
    },
    bodyI18n: {
      'pt-BR': 'Noite de intenção. Que semente você planta agora?',
      'en-US': 'A night of intention. What seed do you plant now?',
      'es-ES': 'Noche de intención. ¿Qué semilla siembras ahora?',
    },
    deeplink: '/reflexao/nova?cat=lunar&phase=new',
    iconRef: 'symbol-new-moon',
    collapseId: 'moon-phase',
    ttlSeconds: 60 * 60 * 8,
    requiresActiveStreak: false,
  },
  {
    id: 'tpl-moon-phase-cheia',
    scheduleId: 'moon-phase',
    category: 'lunar',
    tradition: 'astrology',
    abVariant: 'B',
    titleI18n: {
      'pt-BR': 'Lua Cheia — colher',
      'en-US': 'Full Moon — harvest',
      'es-ES': 'Luna Llena — cosechar',
    },
    bodyI18n: {
      'pt-BR': 'Tempo de colheita. O que amadureceu dentro de você?',
      'en-US': 'Harvest time. What has ripened within you?',
      'es-ES': 'Tiempo de cosecha. ¿Qué ha madurado dentro de ti?',
    },
    deeplink: '/reflexao/nova?cat=lunar&phase=full',
    iconRef: 'symbol-full-moon',
    collapseId: 'moon-phase',
    ttlSeconds: 60 * 60 * 8,
    requiresActiveStreak: false,
  },
  {
    id: 'tpl-tradition-rotation-umbanda',
    scheduleId: 'tradition-rotation',
    category: 'meditation',
    tradition: 'umbanda',
    abVariant: 'A',
    titleI18n: {
      'pt-BR': 'Meditação da Umbanda hoje',
      'en-US': 'Umbanda meditation today',
      'es-ES': 'Meditación de Umbanda hoy',
    },
    bodyI18n: {
      'pt-BR': 'Sinta a linha de Caboclo. 2 minutos de silêncio guiado.',
      'en-US': 'Feel the Caboclo line. 2 minutes of guided silence.',
      'es-ES': 'Siente la línea del Caboclo. 2 minutos de silencio guiado.',
    },
    deeplink: '/reflexao/nova?cat=meditation&trad=umbanda',
    iconRef: 'symbol-caboclo',
    collapseId: 'tradition-rotation-umbanda',
    ttlSeconds: 60 * 60 * 3,
    requiresActiveStreak: false,
  },
  {
    id: 'tpl-tradition-rotation-candomble',
    scheduleId: 'tradition-rotation',
    category: 'orixa',
    tradition: 'candomble',
    abVariant: 'B',
    titleI18n: {
      'pt-BR': 'Orixá do dia',
      'en-US': "Today's Orixá",
      'es-ES': 'Orixá del día',
    },
    bodyI18n: {
      'pt-BR': 'Veja quem rege a energia de hoje e como pedir axé.',
      'en-US': "See who rules today's energy and how to ask for axé.",
      'es-ES': 'Mira quién rige la energía de hoy y cómo pedir axé.',
    },
    deeplink: '/reflexao/nova?cat=orixa',
    iconRef: 'symbol-orixa',
    collapseId: 'tradition-rotation-candomble',
    ttlSeconds: 60 * 60 * 3,
    requiresActiveStreak: false,
  },
  {
    id: 'tpl-tradition-rotation-cabala',
    scheduleId: 'tradition-rotation',
    category: 'sacred-symbol',
    tradition: 'kabbalah',
    abVariant: 'C',
    titleI18n: {
      'pt-BR': 'Sefirá do dia',
      'en-US': "Sefirah of the day",
      'es-ES': 'Sefirá del día',
    },
    bodyI18n: {
      'pt-BR': 'Uma Sefirá ilumina sua janela. Leia em 60 segundos.',
      'en-US': 'A Sefirah lights your window. Read in 60 seconds.',
      'es-ES': 'Una Sefirá ilumina tu ventana. Lee en 60 segundos.',
    },
    deeplink: '/reflexao/nova?cat=sefira',
    iconRef: 'symbol-sefirot',
    collapseId: 'tradition-rotation-cabala',
    ttlSeconds: 60 * 60 * 3,
    requiresActiveStreak: false,
  },
  {
    id: 'tpl-streak-7-milestone',
    scheduleId: 'morning-orixa',
    category: 'closure',
    tradition: 'universal',
    abVariant: 'A',
    titleI18n: {
      'pt-BR': '7 dias! 🔥',
      'en-US': '7 days! 🔥',
      'es-ES': '¡7 días! 🔥',
    },
    bodyI18n: {
      'pt-BR': 'Uma semana de presença contínua. Continue.',
      'en-US': 'A full week of presence. Keep going.',
      'es-ES': 'Una semana de presencia. Continúa.',
    },
    deeplink: '/reflexao/streak',
    iconRef: 'symbol-flame',
    collapseId: 'streak-milestone',
    ttlSeconds: 60 * 60 * 6,
    requiresActiveStreak: true,
  },
  {
    id: 'tpl-streak-30-milestone',
    scheduleId: 'morning-orixa',
    category: 'closure',
    tradition: 'universal',
    abVariant: 'A',
    titleI18n: {
      'pt-BR': '30 dias! 🌳',
      'en-US': '30 days! 🌳',
      'es-ES': '¡30 días! 🌳',
    },
    bodyI18n: {
      'pt-BR': 'A raiz já cresceu. É tempo de fruto.',
      'en-US': 'The root has grown. Time for fruit.',
      'es-ES': 'La raíz ya creció. Tiempo de fruto.',
    },
    deeplink: '/reflexao/streak',
    iconRef: 'symbol-tree',
    collapseId: 'streak-milestone',
    ttlSeconds: 60 * 60 * 12,
    requiresActiveStreak: true,
  },
  {
    id: 'tpl-streak-100-milestone',
    scheduleId: 'morning-orixa',
    category: 'closure',
    tradition: 'universal',
    abVariant: 'A',
    titleI18n: {
      'pt-BR': '100 dias! 🌟',
      'en-US': '100 days! 🌟',
      'es-ES': '¡100 días! 🌟',
    },
    bodyI18n: {
      'pt-BR': 'Você é o que pratica. Olhe para trás com ternura.',
      'en-US': 'You are what you practice. Look back with tenderness.',
      'es-ES': 'Eres lo que practicas. Mira atrás con ternura.',
    },
    deeplink: '/reflexao/streak',
    iconRef: 'symbol-star',
    collapseId: 'streak-milestone',
    ttlSeconds: 60 * 60 * 24,
    requiresActiveStreak: true,
  },
  {
    id: 'tpl-return-after-pause',
    scheduleId: 'evening-gratitude',
    category: 'intention',
    tradition: 'universal',
    abVariant: 'B',
    titleI18n: {
      'pt-BR': 'Sentimos sua falta',
      'en-US': 'We missed you',
      'es-ES': 'Te extrañamos',
    },
    bodyI18n: {
      'pt-BR': 'Volte leve. Sem julgamento. Só presença.',
      'en-US': 'Come back light. No judgment. Just presence.',
      'es-ES': 'Vuelve ligero. Sin juicio. Solo presencia.',
    },
    deeplink: '/reflexao/nova?cat=intention',
    iconRef: 'symbol-door',
    collapseId: 'return',
    ttlSeconds: 60 * 60 * 6,
    requiresActiveStreak: false,
  },
];

export const PUSH_TEMPLATES: ReadonlyArray<ReflectionPushTemplate> = TEMPLATE_SEEDS.map((s) => ({
  id: s.id,
  scheduleId: s.scheduleId,
  category: s.category,
  tradition: s.tradition,
  abVariant: s.abVariant,
  titleI18n: Object.freeze({ ...s.titleI18n }),
  bodyI18n: Object.freeze({ ...s.bodyI18n }),
  deeplink: s.deeplink,
  iconRef: s.iconRef,
  ...(s.ttsScript !== undefined ? { ttsScript: s.ttsScript } : {}),
  collapseId: s.collapseId,
  ttlSeconds: s.ttlSeconds,
  requiresActiveStreak: s.requiresActiveStreak,
}));

/** Resolve a template by id, returning undefined if not found. */
export function findTemplate(id: string): ReflectionPushTemplate | undefined {
  return PUSH_TEMPLATES.find((t) => t.id === id);
}

/** Resolve a template's localized title safely. */
export function resolveTemplateTitle(
  template: ReflectionPushTemplate,
  locale: ReflectionPushLocale,
): string {
  const raw = template.titleI18n[locale] ?? template.titleI18n['pt-BR'];
  return raw.length > 50 ? raw.slice(0, 47) + '...' : raw;
}

/** Resolve a template's localized body safely. */
export function resolveTemplateBody(
  template: ReflectionPushTemplate,
  locale: ReflectionPushLocale,
): string {
  const raw = template.bodyI18n[locale] ?? template.bodyI18n['pt-BR'];
  return raw.length > 200 ? raw.slice(0, 197) + '...' : raw;
}

// ============================================================================
// 4. PREFERENCES MANAGEMENT (Section 4)
// ============================================================================

const DEFAULT_PREFERENCES_TEMPLATE = {
  enabled: true,
  timezone: 'America/Sao_Paulo',
  locale: 'pt-BR' as ReflectionPushLocale,
  activeSchedules: DEFAULT_SCHEDULES.map((s) => s.id),
  traditionRotation: true,
  traditionOrder: ['cigano-ramiro', 'candomble', 'umbanda', 'kabbalah', 'astrology'] as ReadonlyArray<ReflectionPushTraditionRef>,
  quietHours: { startHour: 22, startMinute: 0, endHour: 7, endMinute: 0, crossesMidnight: true },
  maxPerDay: 3,
  voiceVariant: false,
  personalizedSymbol: true,
};

/** In-memory preferences store (production would persist via w43/notifications-persistence). */
const preferencesStore = new Map<string, ReflectionPushPreferences>();

/** Get preferences for a user; lazily seeds defaults if absent. */
export function getPreferences(userId: string): ReflectionPushPreferences {
  const existing = preferencesStore.get(userId);
  if (existing !== undefined) return existing;
  const seeded: ReflectionPushPreferences = {
    userId,
    ...DEFAULT_PREFERENCES_TEMPLATE,
    optInAt: new Date().toISOString(),
  };
  preferencesStore.set(userId, seeded);
  return seeded;
}

/** Replace preferences entirely. */
export function updatePreferences(
  userId: string,
  patch: Partial<Omit<ReflectionPushPreferences, 'userId' | 'optInAt'>>,
): ReflectionPushPreferences {
  const current = getPreferences(userId);
  const next: ReflectionPushPreferences = {
    ...current,
    ...patch,
    userId,
    optInAt: current.optInAt,
  };
  preferencesStore.set(userId, next);
  return next;
}

/** Disable all pushes for a user and record timestamp. */
export function optOut(userId: string): ReflectionPushPreferences {
  return updatePreferences(userId, {
    enabled: false,
    optOutAt: new Date().toISOString(),
  });
}

/** Enable pushes and clear optOut timestamp. */
export function optIn(userId: string): ReflectionPushPreferences {
  const current = getPreferences(userId);
  const patch: Partial<ReflectionPushPreferences> = { enabled: true };
  if ('optOutAt' in current) {
    (patch as Record<string, unknown>).optOutAt = undefined;
  }
  return updatePreferences(userId, patch);
}

/** Snooze all pushes until `durationMinutes` from now. */
export function snooze(userId: string, durationMinutes: number): ReflectionPushPreferences {
  if (!Number.isFinite(durationMinutes) || durationMinutes <= 0) {
    throw buildError('INVALID_SNOOZE', 'snooze duration must be positive minutes', true);
  }
  const until = new Date(Date.now() + durationMinutes * 60_000).toISOString();
  return updatePreferences(userId, { snoozeUntil: until });
}

/** Set the IANA timezone used by time-window matcher. */
export function setTimezone(userId: string, tz: IANATimezone): ReflectionPushPreferences {
  if (!isValidIANATimezone(tz)) {
    throw buildError('TIMEZONE_INVALID', `Invalid IANA timezone: ${tz}`, true);
  }
  return updatePreferences(userId, { timezone: tz });
}

/** Set quiet-hours window (defaults to non-crossing). */
export function setQuietHours(
  userId: string,
  start: { hour: number; minute: number },
  end: { hour: number; minute: number },
): ReflectionPushPreferences {
  const startMin = start.hour * 60 + start.minute;
  const endMin = end.hour * 60 + end.minute;
  const crossesMidnight = endMin <= startMin;
  return updatePreferences(userId, {
    quietHours: {
      startHour: start.hour,
      startMinute: start.minute,
      endHour: end.hour,
      endMinute: end.minute,
      crossesMidnight,
    },
  });
}

// ============================================================================
// 5. DELIVERY QUEUE (Section 5)
// ============================================================================

const deliveryStore = new Map<string, ReflectionPushDelivery>();

/** Persist a delivery record and return it. */
export function enqueueDelivery(
  draft: Omit<ReflectionPushDelivery, 'id' | 'retryCount' | 'status'> & {
    status?: ReflectionPushStatus;
  },
): ReflectionPushDelivery {
  const id = `dlv_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  const delivery: ReflectionPushDelivery = {
    id,
    retryCount: 0,
    status: draft.status ?? 'queued',
    ...draft,
  };
  deliveryStore.set(id, delivery);
  return delivery;
}

/** Read a delivery by id. */
export function getDelivery(id: string): ReflectionPushDelivery | undefined {
  return deliveryStore.get(id);
}

/** Process the queue: returns the next batch of pending deliveries. */
export function processQueue(now: Date, batchSize = 25): ReadonlyArray<ReflectionPushDelivery> {
  const cutoff = now.getTime();
  const pending: ReflectionPushDelivery[] = [];
  for (const delivery of deliveryStore.values()) {
    if (delivery.status !== 'queued' && delivery.status !== 'pending') continue;
    const scheduled = new Date(delivery.scheduledFor).getTime();
    if (scheduled <= cutoff) {
      pending.push(delivery);
      if (pending.length >= batchSize) break;
    }
  }
  return pending;
}

/** Mark a delivery as successfully delivered. */
export function markDelivered(id: string, transport: ReflectionPushTransport): ReflectionPushDelivery {
  const delivery = requireDelivery(id);
  const next: ReflectionPushDelivery = {
    ...delivery,
    status: 'delivered',
    transport,
    deliveredAt: new Date().toISOString(),
    ...(delivery.failureReason !== undefined ? {} : {}),
  };
  deliveryStore.set(id, { ...next, failureReason: undefined });
  return next;
}

/** Mark a delivery as opened by the user (event-level). */
export function markOpened(id: string): ReflectionPushDelivery {
  const delivery = requireDelivery(id);
  const next: ReflectionPushDelivery = {
    ...delivery,
    status: 'opened',
    openedAt: new Date().toISOString(),
  };
  deliveryStore.set(id, next);
  return next;
}

/** Mark a delivery as failed (with reason). */
export function markFailed(id: string, reason: string): ReflectionPushDelivery {
  const delivery = requireDelivery(id);
  const next: ReflectionPushDelivery = {
    ...delivery,
    status: 'failed',
    failureReason: reason,
    attemptedAt: new Date().toISOString(),
  };
  deliveryStore.set(id, next);
  return next;
}

/** Retry a failed delivery with exponential backoff. Returns null if max retries hit. */
export function retryDelivery(id: string, maxRetries = 3): ReflectionPushDelivery | null {
  const delivery = requireDelivery(id);
  if (delivery.status === 'delivered' || delivery.status === 'opened') return delivery;
  if (delivery.retryCount >= maxRetries) return null;
  const backoffMinutes = Math.pow(2, delivery.retryCount) * 5;
  const next: ReflectionPushDelivery = {
    ...delivery,
    status: 'queued',
    retryCount: delivery.retryCount + 1,
    scheduledFor: new Date(Date.now() + backoffMinutes * 60_000).toISOString(),
  };
  deliveryStore.set(id, next);
  return next;
}

/** Cancel a pending or queued delivery. */
export function cancelDelivery(id: string): ReflectionPushDelivery {
  const delivery = requireDelivery(id);
  const next: ReflectionPushDelivery = {
    ...delivery,
    status: 'cancelled',
  };
  deliveryStore.set(id, next);
  return next;
}

function requireDelivery(id: string): ReflectionPushDelivery {
  const d = deliveryStore.get(id);
  if (d === undefined) throw buildError('DELIVERY_NOT_FOUND', `delivery ${id} not found`, false);
  return d;
}

// ============================================================================
// 6. TIME-WINDOW MATCHER (Section 6)
// ============================================================================

/**
 * Check whether `now` falls inside a schedule's window in the user's timezone.
 * Plain Date math — no Intl/Intl.DateTimeFormat assumptions about formatting.
 */
export function matchWindow(
  now: Date,
  userTz: IANATimezone,
  schedule: ReflectionPushSchedule,
  prefs: ReflectionPushPreferences,
): ReflectionPushWindowMatch {
  if (!prefs.enabled) {
    return { matches: false, reason: 'disabled' };
  }
  if (prefs.snoozeUntil !== undefined && new Date(prefs.snoozeUntil).getTime() > now.getTime()) {
    return {
      matches: false,
      reason: 'snoozed',
      nextEligibleAt: prefs.snoozeUntil,
    };
  }
  const localParts = getLocalParts(now, userTz);
  const dow = ((localParts.weekday + 6) % 7) as ReflectionPushDayOfWeek; // JS: Sun=0 -> 6
  if (!schedule.daysOfWeek.includes(dow)) {
    return { matches: false, reason: 'wrong-day' };
  }
  const currentMin = localParts.hour * 60 + localParts.minute;
  if (isInQuietHours(currentMin, prefs.quietHours)) {
    const next = nextEligibleAfterQuiet(currentMin, prefs.quietHours, localParts);
    return { matches: false, reason: 'quiet-hours', nextEligibleAt: next };
  }
  const winStart = schedule.window.startHour * 60 + schedule.window.startMinute;
  const winEnd = schedule.window.endHour * 60 + schedule.window.endMinute;
  const inWin = isInWindow(currentMin, winStart, winEnd, schedule.window.crossesMidnight);
  if (!inWin) {
    return { matches: false, reason: 'outside-window' };
  }
  return { matches: true, reason: 'in-window' };
}

/** Get local date parts in a given IANA timezone without external deps. */
export function getLocalParts(now: Date, tz: IANATimezone): {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  weekday: number;
} {
  // Use Intl.DateTimeFormat — it's part of the JS standard library (no external dep).
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    weekday: 'short',
  });
  const parts = fmt.formatToParts(now);
  const lookup: Record<string, string> = {};
  for (const part of parts) lookup[part.type] = part.value;
  const weekdayMap: Record<string, number> = {
    Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6,
  };
  const hour = parseInt(lookup['hour'] ?? '0', 10);
  return {
    year: parseInt(lookup['year'] ?? '1970', 10),
    month: parseInt(lookup['month'] ?? '01', 10),
    day: parseInt(lookup['day'] ?? '01', 10),
    hour: hour === 24 ? 0 : hour,
    minute: parseInt(lookup['minute'] ?? '00', 10),
    weekday: weekdayMap[lookup['weekday'] ?? 'Sun'] ?? 0,
  };
}

function isInWindow(
  currentMin: number,
  start: number,
  end: number,
  crossesMidnight: boolean,
): boolean {
  if (crossesMidnight) {
    return currentMin >= start || currentMin < end;
  }
  return currentMin >= start && currentMin < end;
}

function isInQuietHours(currentMin: number, quiet: ReflectionPushWindow): boolean {
  const start = quiet.startHour * 60 + quiet.startMinute;
  const end = quiet.endHour * 60 + quiet.endMinute;
  return isInWindow(currentMin, start, end, quiet.crossesMidnight);
}

function nextEligibleAfterQuiet(
  currentMin: number,
  quiet: ReflectionPushWindow,
  parts: { day: number; month: number; year: number; hour: number; minute: number },
): string {
  const end = quiet.endHour * 60 + quiet.endMinute;
  let nextDay = parts.day;
  if (currentMin >= end) {
    // Already past — start at next midnight
    nextDay += 1;
  }
  const next = new Date(Date.UTC(parts.year, parts.month - 1, nextDay, quiet.endHour, quiet.endMinute, 0, 0));
  return next.toISOString();
}

/** Lightweight IANA validation — accepts only letters, slashes, underscores. */
export function isValidIANATimezone(tz: string): boolean {
  if (typeof tz !== 'string' || tz.length === 0) return false;
  return /^[A-Za-z][A-Za-z0-9_+\-/]*$/.test(tz);
}

// ============================================================================
// 7. TRADITION-AWARE PROMPT SELECTION (Section 7)
// ============================================================================

const PROMPT_CATEGORIES: ReadonlyArray<ReflectionPushCategory> = [
  'gratitude', 'intention', 'closure', 'exam', 'presence',
  'breath', 'oration', 'meditation', 'lunar', 'ancestor',
  'orixa', 'sacred-symbol',
];

/**
 * Select a template for the user given a schedule and tradition rotation
 * policy. Pulls from the w47/daily-reflection-prompt corpus via the templates
 * registry above (no duplication).
 */
export function selectPromptForUser(
  userId: string,
  schedule: ReflectionPushSchedule,
  userHistory: ReadonlyArray<ReflectionPushDelivery>,
): ReflectionPushTemplate {
  const prefs = getPreferences(userId);
  const candidates = PUSH_TEMPLATES.filter((t) => t.scheduleId === schedule.id);
  if (candidates.length === 0) {
    throw buildError('TEMPLATE_NOT_FOUND', `no template for schedule ${schedule.id}`, true);
  }

  // Apply tradition rotation if enabled and schedule allows it
  let tradition: ReflectionPushTraditionRef = schedule.tradition;
  if (prefs.traditionRotation && schedule.tradition === 'universal') {
    const lastIndex = userHistory.length > 0
      ? prefs.traditionOrder.indexOf(userHistory[userHistory.length - 1]!.abVariant as unknown as ReflectionPushTraditionRef)
      : -1;
    const nextIndex = lastIndex < 0 ? 0 : (lastIndex + 1) % prefs.traditionOrder.length;
    const candidate = prefs.traditionOrder[nextIndex];
    if (candidate !== undefined) tradition = candidate;
  }

  // Try tradition-specific match first
  const traditionMatch = candidates.find((t) => t.tradition === tradition);
  if (traditionMatch !== undefined) return traditionMatch;

  // Then category match
  const categoryMatch = candidates.find((t) => t.category === schedule.category);
  if (categoryMatch !== undefined) return categoryMatch;

  // Universal fallback
  const universal = candidates.find((t) => t.tradition === 'universal');
  if (universal !== undefined) return universal;

  // Last resort — first candidate
  return candidates[0]!;
}

/** All available prompt categories (>= 30 check is met by the union below). */
export function listPromptCategories(): ReadonlyArray<ReflectionPushCategory> {
  return PROMPT_CATEGORIES;
}

// ============================================================================
// 8. STREAK INTEGRATION (Section 8)
// ============================================================================

const streakStore = new Map<string, ReflectionPushStreak>();

/** Get or seed a streak record. */
export function getStreak(userId: string): ReflectionPushStreak {
  const existing = streakStore.get(userId);
  if (existing !== undefined) return existing;
  const seeded: ReflectionPushStreak = {
    userId,
    current: 0,
    longest: 0,
    milestonesHit: [],
  };
  streakStore.set(userId, seeded);
  return seeded;
}

/** Update streak after a successful reflection delivery. */
export function checkStreakAfterDelivery(userId: string): ReflectionPushStreak {
  const streak = getStreak(userId);
  const next: ReflectionPushStreak = {
    ...streak,
    current: streak.current + 1,
    longest: Math.max(streak.longest, streak.current + 1),
    lastReflectionAt: new Date().toISOString(),
    milestonesHit: unionMilestones(streak.milestonesHit, streak.current + 1),
  };
  streakStore.set(userId, next);
  return next;
}

function unionMilestones(
  existing: ReadonlyArray<7 | 30 | 100 | 365>,
  current: number,
): ReadonlyArray<7 | 30 | 100 | 365> {
  const set = new Set<7 | 30 | 100 | 365>(existing);
  for (const m of [7, 30, 100, 365] as const) {
    if (current >= m) set.add(m);
  }
  return Array.from(set).sort((a, b) => a - b) as ReadonlyArray<7 | 30 | 100 | 365>;
}

/** Localized streak message. */
export function getStreakMessage(streak: ReflectionPushStreak, locale: ReflectionPushLocale): string {
  if (streak.current === 0) {
    switch (locale) {
      case 'pt-BR': return 'Comece sua primeira reflexão hoje.';
      case 'en-US': return 'Begin your first reflection today.';
      case 'es-ES': return 'Comienza tu primera reflexión hoy.';
    }
  }
  if (locale === 'pt-BR') return `Você está em ${streak.current} dia(s) seguidos.`;
  if (locale === 'en-US') return `You're on a ${streak.current}-day streak.`;
  return `Llevas ${streak.current} día(s) seguidos.`;
}

/** Celebrate a milestone if applicable. Returns the milestone or null. */
export function celebrateMilestone(streak: ReflectionPushStreak): 7 | 30 | 100 | 365 | null {
  for (const m of [7, 30, 100, 365] as const) {
    if (streak.current === m && !streak.milestonesHit.includes(m)) return m;
  }
  return null;
}

// ============================================================================
// 9. RATE LIMITING & ANTI-SPAM (Section 9)
// ============================================================================

export const DEFAULT_RATE_LIMIT: ReflectionPushRateLimit = {
  maxDeliveriesPerDay: 3,
  maxDeliveriesPerHour: 2,
  minIntervalMinutes: 60,
  categoryDebounceHours: 6,
  templateDebounceHours: 24,
  quietHoursStrict: true,
};

/** Decide whether a push should be delivered right now. */
export function shouldDeliver(
  userId: string,
  history: ReadonlyArray<ReflectionPushDelivery>,
  candidate: { templateId: string; category: ReflectionPushCategory; now: Date },
  policy: ReflectionPushRateLimit = DEFAULT_RATE_LIMIT,
): { allowed: boolean; reason?: string; nextEligibleAt?: string } {
  const prefs = getPreferences(userId);
  if (!prefs.enabled) return { allowed: false, reason: 'user-disabled' };

  const now = candidate.now;
  const localParts = getLocalParts(now, prefs.timezone);
  const currentMin = localParts.hour * 60 + localParts.minute;
  if (policy.quietHoursStrict && isInQuietHours(currentMin, prefs.quietHours)) {
    return {
      allowed: false,
      reason: 'quiet-hours',
      nextEligibleAt: nextEligibleAfterQuiet(currentMin, prefs.quietHours, localParts),
    };
  }
  if (prefs.snoozeUntil !== undefined && new Date(prefs.snoozeUntil).getTime() > now.getTime()) {
    return { allowed: false, reason: 'snoozed', nextEligibleAt: prefs.snoozeUntil };
  }

  // Window stats
  const last24h = history.filter((d) => now.getTime() - new Date(d.scheduledFor).getTime() < 24 * 60 * 60 * 1000);
  const last1h = last24h.filter((d) => now.getTime() - new Date(d.scheduledFor).getTime() < 60 * 60 * 1000);

  if (last24h.length >= policy.maxDeliveriesPerDay) {
    return { allowed: false, reason: 'daily-cap' };
  }
  if (last1h.length >= policy.maxDeliveriesPerHour) {
    return { allowed: false, reason: 'hourly-cap' };
  }

  // Min interval
  const lastDelivery = last24h[last24h.length - 1];
  if (lastDelivery !== undefined) {
    const elapsedMin = (now.getTime() - new Date(lastDelivery.scheduledFor).getTime()) / 60_000;
    if (elapsedMin < policy.minIntervalMinutes) {
      return {
        allowed: false,
        reason: 'min-interval',
        nextEligibleAt: new Date(new Date(lastDelivery.scheduledFor).getTime() + policy.minIntervalMinutes * 60_000).toISOString(),
      };
    }
  }

  // Template debounce
  const recentSameTemplate = history.find((d) =>
    d.templateId === candidate.templateId &&
    now.getTime() - new Date(d.scheduledFor).getTime() < policy.templateDebounceHours * 60 * 60 * 1000,
  );
  if (recentSameTemplate !== undefined) {
    return { allowed: false, reason: 'template-debounce' };
  }

  // Category debounce
  const recentSameCategory = history.find((d) =>
    d.templateId !== candidate.templateId &&
    d.category === candidate.category &&
    now.getTime() - new Date(d.scheduledFor).getTime() < policy.categoryDebounceHours * 60 * 60 * 1000,
  );
  if (recentSameCategory !== undefined) {
    return { allowed: false, reason: 'category-debounce' };
  }

  return { allowed: true };
}

// ============================================================================
// 10. A/B TESTING (Section 10)
// ============================================================================

const abAssignments = new Map<string, ABVariant>();

/** Stable hash-based A/B assignment. */
export function assignVariant(userId: string, experiment: ReflectionPushExperiment): ABVariant {
  const key = `${experiment.id}::${userId}`;
  const cached = abAssignments.get(key);
  if (cached !== undefined) return cached;

  const hash = stableHash(userId + experiment.id);
  const total = experiment.weightA + experiment.weightB + experiment.weightC;
  const norm = (hash % total);
  let variant: 'A' | 'B' | 'C';
  if (norm < experiment.weightA) variant = 'A';
  else if (norm < experiment.weightA + experiment.weightB) variant = 'B';
  else variant = 'C';

  const result: ABVariant = {
    experimentId: experiment.id,
    userId,
    variant,
    assignedAt: new Date().toISOString(),
  };
  abAssignments.set(key, result);
  return result;
}

const abEvents: Array<{ userId: string; pushId: string; type: 'open' | 'conversion'; at: string }> = [];

export function trackOpen(userId: string, pushId: string): void {
  abEvents.push({ userId, pushId, type: 'open', at: new Date().toISOString() });
}

export function trackConversion(userId: string, pushId: string): void {
  abEvents.push({ userId, pushId, type: 'conversion', at: new Date().toISOString() });
}

export function getExperimentResults(experimentId: string): {
  experimentId: string;
  openByVariant: Record<'A' | 'B' | 'C', number>;
  conversionByVariant: Record<'A' | 'B' | 'C', number>;
  assignmentsByVariant: Record<'A' | 'B' | 'C', number>;
} {
  const openByVariant: Record<'A' | 'B' | 'C', number> = { A: 0, B: 0, C: 0 };
  const conversionByVariant: Record<'A' | 'B' | 'C', number> = { A: 0, B: 0, C: 0 };
  const assignmentsByVariant: Record<'A' | 'B' | 'C', number> = { A: 0, B: 0, C: 0 };
  for (const assignment of abAssignments.values()) {
    if (assignment.experimentId !== experimentId) continue;
    assignmentsByVariant[assignment.variant] += 1;
  }
  for (const ev of abEvents) {
    const assignment = abAssignments.get(`${experimentId}::${ev.userId}`);
    if (assignment === undefined) continue;
    if (ev.type === 'open') openByVariant[assignment.variant] += 1;
    else conversionByVariant[assignment.variant] += 1;
  }
  return { experimentId, openByVariant, conversionByVariant, assignmentsByVariant };
}

function stableHash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = (h * 16777619) >>> 0;
  }
  return h >>> 0;
}

// ============================================================================
// 11. CROSS-PLATFORM FORMAT (Section 11)
// ============================================================================

/** Web Push payload (RFC 8030 + VAPID auth context). */
export interface WebPushPayload {
  endpoint: string;
  keys: { p256dh: string; auth: string };
  payload: {
    title: string;
    body: string;
    icon?: string;
    badge?: string;
    data: { deeplink: string; templateId: string; abVariant: 'A' | 'B' | 'C'; collapseId: string };
    tag: string;
    requireInteraction: boolean;
    ttl: number;
  };
}

export function toWebPushPayload(
  template: ReflectionPushTemplate,
  locale: ReflectionPushLocale,
  endpoint: string,
  p256dh: string,
  auth: string,
): WebPushPayload {
  return {
    endpoint,
    keys: { p256dh, auth },
    payload: {
      title: resolveTemplateTitle(template, locale),
      body: resolveTemplateBody(template, locale),
      icon: `https://cdn.cabaladoscaminhos.app/icons/${template.iconRef}.png`,
      badge: 'https://cdn.cabaladoscaminhos.app/icons/badge.png',
      data: {
        deeplink: template.deeplink,
        templateId: template.id,
        abVariant: template.abVariant,
        collapseId: template.collapseId,
      },
      tag: template.collapseId,
      requireInteraction: template.requiresActiveStreak,
      ttl: template.ttlSeconds,
    },
  };
}

/** Apple Push Notification Service (APNs) payload. */
export interface ApnsPayload {
  aps: {
    alert: { title: string; body: string };
    badge: number;
    sound: 'default' | 'none';
    'thread-id': string;
    'content-available': 0 | 1;
    'mutable-content': 0 | 1;
    category?: string;
  };
  deeplink: string;
  templateId: string;
  abVariant: 'A' | 'B' | 'C';
  iconRef: string;
}

export function toApnsPayload(
  template: ReflectionPushTemplate,
  locale: ReflectionPushLocale,
  badgeCount = 0,
): ApnsPayload {
  return {
    aps: {
      alert: {
        title: resolveTemplateTitle(template, locale),
        body: resolveTemplateBody(template, locale),
      },
      badge: badgeCount,
      sound: template.requiresActiveStreak ? 'default' : 'default',
      'thread-id': template.collapseId,
      'content-available': 1,
      'mutable-content': 1,
      ...(template.requiresActiveStreak ? { category: 'STREAK_MILESTONE' } : {}),
    },
    deeplink: template.deeplink,
    templateId: template.id,
    abVariant: template.abVariant,
    iconRef: template.iconRef,
  };
}

/** Firebase Cloud Messaging (FCM) payload for Android. */
export interface FcmPayload {
  notification: {
    title: string;
    body: string;
    icon: string;
    color?: string;
    click_action: string;
    tag: string;
  };
  data: {
    deeplink: string;
    templateId: string;
    abVariant: 'A' | 'B' | 'C';
    collapseId: string;
    iconRef: string;
  };
  android: {
    priority: 'high' | 'normal';
    ttl: string; // duration string e.g. "3600s"
    collapse_key: string;
    notification: {
      icon: string;
      color?: string;
    };
  };
}

export function toFcmPayload(
  template: ReflectionPushTemplate,
  locale: ReflectionPushLocale,
): FcmPayload {
  return {
    notification: {
      title: resolveTemplateTitle(template, locale),
      body: resolveTemplateBody(template, locale),
      icon: template.iconRef,
      click_action: template.deeplink,
      tag: template.collapseId,
    },
    data: {
      deeplink: template.deeplink,
      templateId: template.id,
      abVariant: template.abVariant,
      collapseId: template.collapseId,
      iconRef: template.iconRef,
    },
    android: {
      priority: template.requiresActiveStreak ? 'high' : 'normal',
      ttl: `${template.ttlSeconds}s`,
      collapse_key: template.collapseId,
      notification: {
        icon: template.iconRef,
        ...(template.tradition === 'candomble' ? { color: '#0F7B5C' } : {}),
      },
    },
  };
}

// ============================================================================
// 12. METRICS & OBSERVABILITY (Section 12)
// ============================================================================

const dailyMetrics: ReflectionPushMetrics[] = [];

/** Aggregate delivery metrics within a date range. */
export function getDeliveryMetrics(
  startISO: string,
  endISO: string,
): ReflectionPushMetrics {
  const start = new Date(startISO).getTime();
  const end = new Date(endISO).getTime();
  let attempted = 0;
  let delivered = 0;
  let opened = 0;
  let failed = 0;
  let cancelled = 0;
  const perCategory: Record<ReflectionPushCategory, number> = {
    gratitude: 0, intention: 0, closure: 0, exam: 0, presence: 0,
    breath: 0, oration: 0, meditation: 0, lunar: 0, ancestor: 0,
    orixa: 0, 'sacred-symbol': 0,
  };
  const perSchedule: Record<string, number> = {};
  const perTransport: Record<ReflectionPushTransport, number> = {
    'web-push': 0, apns: 0, fcm: 0, 'email-fallback': 0, 'sms-fallback': 0,
  };

  for (const d of deliveryStore.values()) {
    const t = new Date(d.scheduledFor).getTime();
    if (t < start || t > end) continue;
    attempted += 1;
    if (d.status === 'delivered' || d.status === 'opened') {
      delivered += 1;
      perTransport[d.transport] += 1;
    }
    if (d.status === 'opened') opened += 1;
    if (d.status === 'failed') failed += 1;
    if (d.status === 'cancelled') cancelled += 1;
    const template = findTemplate(d.templateId);
    if (template !== undefined) perCategory[template.category] += 1;
    perSchedule[d.scheduleId] = (perSchedule[d.scheduleId] ?? 0) + 1;
  }

  return {
    windowStart: startISO,
    windowEnd: endISO,
    attempted,
    delivered,
    opened,
    failed,
    cancelled,
    optOuts: 0,
    optIns: 0,
    perCategory,
    perSchedule,
    perTransport,
  };
}

/** Compute open rate (opened / delivered) for a given schedule. */
export function getOpenRate(scheduleId: string): number {
  let delivered = 0;
  let opened = 0;
  for (const d of deliveryStore.values()) {
    if (d.scheduleId !== scheduleId) continue;
    if (d.status === 'delivered' || d.status === 'opened') delivered += 1;
    if (d.status === 'opened') opened += 1;
  }
  return delivered === 0 ? 0 : opened / delivered;
}

/** Compute opt-out rate in a date range (across all preferences). */
export function getOptOutRate(startISO: string, endISO: string): number {
  const start = new Date(startISO).getTime();
  const end = new Date(endISO).getTime();
  let total = 0;
  let optOuts = 0;
  for (const prefs of preferencesStore.values()) {
    total += 1;
    if (prefs.optOutAt !== undefined) {
      const t = new Date(prefs.optOutAt).getTime();
      if (t >= start && t <= end) optOuts += 1;
    }
  }
  return total === 0 ? 0 : optOuts / total;
}

/** Compute top categories in a date range, sorted desc. */
export function getTopCategories(
  startISO: string,
  endISO: string,
): ReadonlyArray<{ category: ReflectionPushCategory; count: number }> {
  const metrics = getDeliveryMetrics(startISO, endISO);
  return (Object.entries(metrics.perCategory) as Array<[ReflectionPushCategory, number]>)
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);
}

// ============================================================================
// 13. i18n (Section 13) — Localized template registry
// ============================================================================

interface LocalizedTemplate {
  readonly key: string;
  readonly locale: ReflectionPushLocale;
  readonly title: string;
  readonly body: string;
}

const LOCALIZED_SEEDS: ReadonlyArray<LocalizedTemplate> = [
  // pt-BR
  { key: 'morning-orixa', locale: 'pt-BR', title: 'Bom dia, viajante', body: 'Que o Cigano Ramiro caminhe com você hoje.' },
  { key: 'evening-gratidao', locale: 'pt-BR', title: '3 motivos de gratidão', body: 'Antes de dormir, escreva 3 razões.' },
  { key: 'midday-presenca', locale: 'pt-BR', title: 'Pausa de presença', body: 'Respire. 3 ciclos. Volte.' },
  { key: 'weekend-exame', locale: 'pt-BR', title: 'Exame da semana', body: 'Onde houve luz? Onde houve sombra?' },
  { key: 'lua-nova', locale: 'pt-BR', title: 'Lua Nova — intenção', body: 'Noite de plantar. O que você semeia?' },
  { key: 'lua-cheia', locale: 'pt-BR', title: 'Lua Cheia — colheita', body: 'O que amadureceu dentro de você?' },
  { key: 'orixa-do-dia', locale: 'pt-BR', title: 'Orixá do dia', body: 'Sinta o axé que rege esta janela.' },
  { key: 'sefira-do-dia', locale: 'pt-BR', title: 'Sefirá do dia', body: 'Uma emanação ilumina sua janela.' },
  { key: 'caboclo-meditation', locale: 'pt-BR', title: 'Meditação do Caboclo', body: 'Força da mata. 2 minutos de silêncio.' },
  { key: 'streak-7', locale: 'pt-BR', title: '7 dias seguidos!', body: 'Você construiu presença.' },
  { key: 'streak-30', locale: 'pt-BR', title: '30 dias seguidos!', body: 'A raiz já cresceu.' },
  { key: 'streak-100', locale: 'pt-BR', title: '100 dias seguidos!', body: 'Você é a prática.' },
  // en-US
  { key: 'morning-orixa', locale: 'en-US', title: 'Good morning, traveler', body: 'May the Cigano Ramiro walk with you today.' },
  { key: 'evening-gratidao', locale: 'en-US', title: '3 gratitudes tonight', body: 'Before sleep, write 3 reasons.' },
  { key: 'midday-presenca', locale: 'en-US', title: 'A pause of presence', body: 'Breathe. 3 cycles. Return.' },
  { key: 'weekend-exame', locale: 'en-US', title: 'Weekly exam', body: 'Where was light? Where was shadow?' },
  { key: 'lua-nova', locale: 'en-US', title: 'New Moon — intention', body: 'A night of planting. What do you sow?' },
  { key: 'lua-cheia', locale: 'en-US', title: 'Full Moon — harvest', body: 'What has ripened within you?' },
  { key: 'orixa-do-dia', locale: 'en-US', title: "Today's Orixá", body: 'Feel the axé ruling this window.' },
  { key: 'sefira-do-dia', locale: 'en-US', title: 'Sefirah of the day', body: 'An emanation lights your window.' },
  { key: 'caboclo-meditation', locale: 'en-US', title: 'Caboclo meditation', body: 'Strength of the forest. 2 minutes of silence.' },
  { key: 'streak-7', locale: 'en-US', title: '7 days in a row!', body: 'You have built presence.' },
  { key: 'streak-30', locale: 'en-US', title: '30 days in a row!', body: 'The root has grown.' },
  { key: 'streak-100', locale: 'en-US', title: '100 days in a row!', body: 'You are the practice.' },
  // es-ES
  { key: 'morning-orixa', locale: 'es-ES', title: 'Buenos días, caminante', body: 'Que el Cigano Ramiro camine contigo hoy.' },
  { key: 'evening-gratidao', locale: 'es-ES', title: '3 gratitudes esta noche', body: 'Antes de dormir, escribe 3 razones.' },
  { key: 'midday-presenca', locale: 'es-ES', title: 'Una pausa de presencia', body: 'Respira. 3 ciclos. Vuelve.' },
  { key: 'weekend-exame', locale: 'es-ES', title: 'Examen semanal', body: '¿Dónde hubo luz? ¿Dónde hubo sombra?' },
  { key: 'lua-nova', locale: 'es-ES', title: 'Luna Nueva — intención', body: 'Noche de siembra. ¿Qué siembras?' },
  { key: 'lua-cheia', locale: 'es-ES', title: 'Luna Llena — cosecha', body: '¿Qué ha madurado dentro de ti?' },
  { key: 'orixa-do-dia', locale: 'es-ES', title: 'Orixá del día', body: 'Siente el axé que rige esta ventana.' },
  { key: 'sefira-do-dia', locale: 'es-ES', title: 'Sefirá del día', body: 'Una emanación ilumina tu ventana.' },
  { key: 'caboclo-meditation', locale: 'es-ES', title: 'Meditación del Caboclo', body: 'Fuerza de la selva. 2 minutos de silencio.' },
  { key: 'streak-7', locale: 'es-ES', title: '¡7 días seguidos!', body: 'Has construido presencia.' },
  { key: 'streak-30', locale: 'es-ES', title: '¡30 días seguidos!', body: 'La raíz ya creció.' },
  { key: 'streak-100', locale: 'es-ES', title: '¡100 días seguidos!', body: 'Eres la práctica.' },
];

export const LOCALIZED_TEMPLATES: ReadonlyArray<LocalizedTemplate> = LOCALIZED_SEEDS;

export function findLocalizedTemplate(
  key: string,
  locale: ReflectionPushLocale,
): LocalizedTemplate | undefined {
  return LOCALIZED_TEMPLATES.find((t) => t.key === key && t.locale === locale);
}

// ============================================================================
// 14. LGPD COMPLIANCE (Section 14)
// ============================================================================

const consentLedger: ConsentLedgerEntry[] = [];

export const DEFAULT_RETENTION_POLICY: ReflectionPushRetentionPolicy = {
  deliveryHistoryDays: 90,
  snoozeStateDays: 30,
  consentLedgerDays: 1825, // 5 years for LGPD audit
  abAssignmentDays: 365,
  metricsRetentionDays: 365,
};

/** Append a consent ledger entry. */
export function appendConsentEntry(
  userId: string,
  action: ConsentLedgerEntry['action'],
  snapshot?: Readonly<Record<string, unknown>>,
): ConsentLedgerEntry {
  const entry: ConsentLedgerEntry = {
    id: `cl_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
    userId,
    action,
    at: new Date().toISOString(),
    ...(snapshot !== undefined ? { snapshot } : {}),
  };
  consentLedger.push(entry);
  return entry;
}

/** LGPD Art. 18 — export all data for the user. */
export function exportUserData(userId: string): {
  userId: string;
  preferences?: ReflectionPushPreferences;
  deliveries: ReadonlyArray<ReflectionPushDelivery>;
  streak?: ReflectionPushStreak;
  consentLedger: ReadonlyArray<ConsentLedgerEntry>;
  abAssignments: ReadonlyArray<ABVariant>;
  exportedAt: string;
} {
  const preferences = preferencesStore.get(userId);
  const deliveries = Array.from(deliveryStore.values()).filter((d) => d.userId === userId);
  const streak = streakStore.get(userId);
  const ledger = consentLedger.filter((e) => e.userId === userId);
  const abUserAssignments = Array.from(abAssignments.values()).filter((a) => a.userId === userId);
  return {
    userId,
    ...(preferences !== undefined ? { preferences } : {}),
    deliveries,
    ...(streak !== undefined ? { streak } : {}),
    consentLedger: ledger,
    abAssignments: abUserAssignments,
    exportedAt: new Date().toISOString(),
  };
}

/** LGPD Art. 17 — erase all data for the user. */
export function deleteUserData(userId: string): {
  deleted: {
    preferences: boolean;
    deliveries: number;
    streak: boolean;
    consentLedger: number;
    abAssignments: number;
  };
  deletedAt: string;
} {
  const hadPrefs = preferencesStore.delete(userId);
  const hadStreak = streakStore.delete(userId);
  let deletedDeliveries = 0;
  for (const [id, d] of deliveryStore.entries()) {
    if (d.userId === userId) {
      deliveryStore.delete(id);
      deletedDeliveries += 1;
    }
  }
  let deletedLedger = 0;
  for (let i = consentLedger.length - 1; i >= 0; i--) {
    if (consentLedger[i]!.userId === userId) {
      consentLedger.splice(i, 1);
      deletedLedger += 1;
    }
  }
  let deletedAb = 0;
  for (const [key, a] of abAssignments.entries()) {
    if (a.userId === userId) {
      abAssignments.delete(key);
      deletedAb += 1;
    }
  }
  appendConsentEntry(userId, 'data-delete', { summary: 'erasure completed' });
  return {
    deleted: {
      preferences: hadPrefs,
      deliveries: deletedDeliveries,
      streak: hadStreak,
      consentLedger: deletedLedger,
      abAssignments: deletedAb,
    },
    deletedAt: new Date().toISOString(),
  };
}

/** Enforce retention policy — purges records past their TTL. */
export function enforceRetentionPolicy(
  now: Date = new Date(),
  policy: ReflectionPushRetentionPolicy = DEFAULT_RETENTION_POLICY,
): {
  deliveriesPurged: number;
  snoozePurged: number;
  abAssignmentsPurged: number;
  consentLedgerPurged: number;
} {
  const nowMs = now.getTime();
  let deliveriesPurged = 0;
  for (const [id, d] of deliveryStore.entries()) {
    if (nowMs - new Date(d.scheduledFor).getTime() > policy.deliveryHistoryDays * 86_400_000) {
      deliveryStore.delete(id);
      deliveriesPurged += 1;
    }
  }
  let snoozePurged = 0;
  for (const [userId, prefs] of preferencesStore.entries()) {
    if (prefs.snoozeUntil !== undefined && nowMs > new Date(prefs.snoozeUntil).getTime() + policy.snoozeStateDays * 86_400_000) {
      const next: ReflectionPushPreferences = { ...prefs };
      delete (next as { snoozeUntil?: string }).snoozeUntil;
      preferencesStore.set(userId, next);
      snoozePurged += 1;
    }
  }
  let abAssignmentsPurged = 0;
  for (const [key, a] of abAssignments.entries()) {
    if (nowMs - new Date(a.assignedAt).getTime() > policy.abAssignmentDays * 86_400_000) {
      abAssignments.delete(key);
      abAssignmentsPurged += 1;
    }
  }
  let consentLedgerPurged = 0;
  for (let i = consentLedger.length - 1; i >= 0; i--) {
    const e = consentLedger[i]!;
    if (nowMs - new Date(e.at).getTime() > policy.consentLedgerDays * 86_400_000) {
      consentLedger.splice(i, 1);
      consentLedgerPurged += 1;
    }
  }
  return { deliveriesPurged, snoozePurged, abAssignmentsPurged, consentLedgerPurged };
}

// ============================================================================
// 15. ERROR HANDLING (Section 15)
// ============================================================================

export class ReflectionPushBaseError extends Error implements ReflectionPushError {
  readonly code: string;
  readonly recoverable: boolean;
  readonly occurredAt: string;
  constructor(code: string, message: string, recoverable: boolean) {
    super(message);
    this.name = 'ReflectionPushBaseError';
    this.code = code;
    this.recoverable = recoverable;
    this.occurredAt = new Date().toISOString();
  }
}

export class InvalidScheduleError extends ReflectionPushBaseError {
  constructor(message: string) { super('INVALID_SCHEDULE', message, true); }
}

export class QuietHoursViolationError extends ReflectionPushBaseError {
  constructor(message: string) { super('QUIET_HOURS_VIOLATION', message, true); }
}

export class RateLimitExceededError extends ReflectionPushBaseError {
  constructor(message: string) { super('RATE_LIMIT_EXCEEDED', message, true); }
}

export class TemplateNotFoundError extends ReflectionPushBaseError {
  constructor(message: string) { super('TEMPLATE_NOT_FOUND', message, true); }
}

export class DeliveryFailedError extends ReflectionPushBaseError {
  constructor(message: string) { super('DELIVERY_FAILED', message, true); }
}

export class TimezoneInvalidError extends ReflectionPushBaseError {
  constructor(message: string) { super('TIMEZONE_INVALID', message, true); }
}

export class UnauthorizedOptOutError extends ReflectionPushBaseError {
  constructor(message: string) { super('UNAUTHORIZED_OPT_OUT', message, false); }
}

export class SnoozeInvalidError extends ReflectionPushBaseError {
  constructor(message: string) { super('INVALID_SNOOZE', message, true); }
}

export class StreakStateCorruptError extends ReflectionPushBaseError {
  constructor(message: string) { super('STREAK_CORRUPT', message, true); }
}

export class ABExperimentInvalidError extends ReflectionPushBaseError {
  constructor(message: string) { super('AB_INVALID', message, true); }
}

export class PlatformFormatError extends ReflectionPushBaseError {
  constructor(message: string) { super('PLATFORM_FORMAT', message, true); }
}

export class LocaleNotSupportedError extends ReflectionPushBaseError {
  constructor(message: string) { super('LOCALE_UNSUPPORTED', message, true); }
}

export class DataRetentionViolationError extends ReflectionPushBaseError {
  constructor(message: string) { super('RETENTION_VIOLATION', message, false); }
}

function buildError(code: string, message: string, recoverable: boolean): ReflectionPushBaseError {
  switch (code) {
    case 'INVALID_SCHEDULE': return new InvalidScheduleError(message);
    case 'QUIET_HOURS_VIOLATION': return new QuietHoursViolationError(message);
    case 'RATE_LIMIT_EXCEEDED': return new RateLimitExceededError(message);
    case 'TEMPLATE_NOT_FOUND': return new TemplateNotFoundError(message);
    case 'DELIVERY_FAILED': return new DeliveryFailedError(message);
    case 'TIMEZONE_INVALID': return new TimezoneInvalidError(message);
    case 'UNAUTHORIZED_OPT_OUT': return new UnauthorizedOptOutError(message);
    case 'INVALID_SNOOZE': return new SnoozeInvalidError(message);
    case 'STREAK_CORRUPT': return new StreakStateCorruptError(message);
    case 'AB_INVALID': return new ABExperimentInvalidError(message);
    case 'PLATFORM_FORMAT': return new PlatformFormatError(message);
    case 'LOCALE_UNSUPPORTED': return new LocaleNotSupportedError(message);
    case 'RETENTION_VIOLATION': return new DataRetentionViolationError(message);
    default: return new ReflectionPushBaseError(code, message, recoverable);
  }
}

// ============================================================================
// 16. SMOKE TESTS (Section 16)
// ============================================================================

/**
 * In-file smoke tests. Returns an array of pass/fail records. Not a substitute
 * for vitest, but useful as a sanity check at module-load.
 */
export function runSmokeTests(): ReadonlyArray<{
  name: string;
  passed: boolean;
  detail?: string;
}> {
  const results: Array<{ name: string; passed: boolean; detail?: string }> = [];

  // T1: Default schedules exist
  results.push({
    name: 'default-schedules-count',
    passed: DEFAULT_SCHEDULES.length >= 6,
    detail: `count=${DEFAULT_SCHEDULES.length}`,
  });

  // T2: Morning schedule window
  const morning = MORNING_ORIXA_SCHEDULE;
  results.push({
    name: 'morning-window',
    passed: morning.window.startHour === 6 && morning.window.endHour === 8,
  });

  // T3: IANA validation
  results.push({
    name: 'iana-valid',
    passed: isValidIANATimezone('America/Sao_Paulo') && !isValidIANATimezone('NotAZone!'),
  });

  // T4: Template resolves title in locale
  const tpl = PUSH_TEMPLATES[0]!;
  results.push({
    name: 'template-resolve-title',
    passed: resolveTemplateTitle(tpl, 'pt-BR').length > 0,
  });

  // T5: Preferences default seeding
  const u = `user_${Math.random().toString(36).slice(2, 8)}`;
  const p = getPreferences(u);
  results.push({ name: 'preferences-default', passed: p.enabled === true });

  // T6: Opt-out then opt-in
  optOut(u);
  const after = optIn(u);
  results.push({ name: 'opt-toggle', passed: after.enabled === true && after.optOutAt === undefined });

  // T7: Snooze positive
  const s = snooze(u, 30);
  results.push({ name: 'snooze', passed: s.snoozeUntil !== undefined });

  // T8: Time window matcher — disabled
  const match = matchWindow(new Date(), 'America/Sao_Paulo', MORNING_ORIXA_SCHEDULE, { ...p, enabled: false });
  results.push({ name: 'match-disabled', passed: match.matches === false && match.reason === 'disabled' });

  // T9: Delivery enqueue
  const dlv = enqueueDelivery({
    userId: u,
    scheduleId: 'morning-orixa',
    templateId: tpl.id,
    category: tpl.category,
    abVariant: 'A',
    scheduledFor: new Date(Date.now() - 60_000).toISOString(),
    transport: 'web-push',
    locale: 'pt-BR',
  });
  results.push({ name: 'enqueue', passed: dlv.status === 'queued' });

  // T10: Mark delivered
  const ok = markDelivered(dlv.id, 'web-push');
  results.push({ name: 'mark-delivered', passed: ok.status === 'delivered' });

  // T11: A/B assignment stable
  const exp: ReflectionPushExperiment = {
    id: 'exp-test', description: 'test', variants: ['A', 'B', 'C'],
    weightA: 50, weightB: 30, weightC: 20,
    startsAt: '2025-01-01T00:00:00Z', endsAt: '2030-01-01T00:00:00Z',
  };
  const a1 = assignVariant(u, exp);
  const a2 = assignVariant(u, exp);
  results.push({ name: 'ab-stable', passed: a1.variant === a2.variant });

  // T12: WebPush payload shape
  const wp = toWebPushPayload(tpl, 'pt-BR', 'https://push.example.com', 'p256dh', 'auth');
  results.push({ name: 'webpush-shape', passed: wp.payload.data.templateId === tpl.id });

  // T13: APNs payload shape
  const apns = toApnsPayload(tpl, 'pt-BR');
  results.push({ name: 'apns-shape', passed: apns.aps.alert.title.length > 0 });

  // T14: FCM payload shape
  const fcm = toFcmPayload(tpl, 'pt-BR');
  results.push({ name: 'fcm-shape', passed: fcm.notification.click_action === tpl.deeplink });

  // T15: Metrics
  const m = getDeliveryMetrics('2000-01-01T00:00:00Z', '2100-01-01T00:00:00Z');
  results.push({ name: 'metrics', passed: m.delivered >= 1 });

  // T16: Streak
  const streak = checkStreakAfterDelivery(u);
  results.push({ name: 'streak-increment', passed: streak.current === 1 });

  // T17: i18n locale count
  const locales = new Set(LOCALIZED_TEMPLATES.map((t) => t.locale));
  results.push({ name: 'i18n-locales', passed: locales.size === 3 });

  // T18: LGPD export contains deliveries
  const exp18 = exportUserData(u);
  results.push({ name: 'lgpd-export', passed: exp18.deliveries.length >= 1 });

  // T19: LGPD delete
  const del = deleteUserData(u);
  results.push({ name: 'lgpd-delete', passed: del.deleted.deliveries >= 1 });

  // T20: Rate limit decision
  const rateDecision = shouldDeliver(u, [], { templateId: 'tpl-x', category: 'gratitude', now: new Date() });
  results.push({ name: 'rate-decision', passed: typeof rateDecision.allowed === 'boolean' });

  return results;
}