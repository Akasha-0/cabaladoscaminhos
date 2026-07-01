// ============================================================================
// NOTIFICATIONS V2 — Preference Matrix (categories × 4 channels)
// ============================================================================
// Camada de preferências v2, independente do modelo NotificationType granular
// do W30. Agrupa notificações por CATEGORIA semântica (mention, reply,
// follow, akasha, marketplace, mentorship, event, system, marketing), cada
// uma com toggle por CANAL (inApp/email/push/SMS).
//
// Diferenças vs preferences.ts (W30):
//   - Categorias semânticas (não tipos de evento brutos) — UX mais limpa.
//   - 4 canais: in-app, email, push web/mobile, SMS (Twilio, opt-in hard).
//   - Quiet hours (timezone-aware) + digest frequency (REALTIME/DAILY/.../OFF).
//   - LGPD Art. 18 — opt-in para MARKETING; opt-out granular para outros.
//
// Persistência: stored como JSON em NotificationPreferenceV2.payloadJson
// (modelo adicionado nesta W36). Mantém compat retroativa com W30.
// ============================================================================

import type { NotificationType } from '@prisma/client';

// ============================================================================
// Categorias semânticas (9) — agrupam tipos do W30 sob UX conceitual
// ============================================================================

export type NotificationCategory =
  | 'mention'     // MENTION
  | 'reply'       // POST_REPLY, COMMENT
  | 'follow'      // FOLLOW
  | 'akasha'      // Akasha IA milestones (W35+)
  | 'marketplace' // Offering reservado, pagamento confirmado (W28 marketplace)
  | 'mentorship'  // Sessão agendada, lembrete mentor (W29 mentorship)
  | 'event'       // Live stream, ritual, evento calendário (W33 sacred-calendar)
  | 'system'      // SYSTEM_ALERT, MODERATION_ACTION
  | 'marketing';  // Opt-in explícito (LGPD Art. 7, 18)

export const ALL_CATEGORIES: readonly NotificationCategory[] = [
  'mention',
  'reply',
  'follow',
  'akasha',
  'marketplace',
  'mentorship',
  'event',
  'system',
  'marketing',
] as const;

// ============================================================================
// Canais (4) — IN_APP (SSE), EMAIL (Resend), PUSH (web VAPID + FCM/APNs), SMS
// ============================================================================

export type NotificationChannelV2 = 'inApp' | 'email' | 'push' | 'sms';

export const ALL_CHANNELS_V2: readonly NotificationChannelV2[] = [
  'inApp',
  'email',
  'push',
  'sms',
] as const;

// ============================================================================
// Quiet hours + digest frequency
// ============================================================================

export interface QuietHours {
  enabled: boolean;
  start: string;          // "HH:MM" — 24h, no fuso do user
  end: string;            // "HH:MM"
  timezone: string;       // IANA, ex: "America/Sao_Paulo"
}

export type DigestFrequency = 'REALTIME' | 'DAILY' | 'WEEKLY' | 'OFF';

// ============================================================================
// Matriz de preferências
// ============================================================================

/** Toggle por (categoria × canal). `true` = entrega permitida. */
export type CategoryChannelMatrix = Record<
  NotificationCategory,
  Record<NotificationChannelV2, boolean>
>;

// ============================================================================
// Defaults LGPD-friendly (opt-in para marketing e SMS)
// ============================================================================

export const DEFAULT_MATRIX: CategoryChannelMatrix = {
  mention:     { inApp: true,  email: true,  push: true,  sms: false },
  reply:       { inApp: true,  email: true,  push: true,  sms: false },
  follow:      { inApp: true,  email: false, push: false, sms: false },
  akasha:      { inApp: true,  email: false, push: false, sms: false },
  marketplace: { inApp: true,  email: true,  push: true,  sms: true  }, // SMS crítico p/ pagamento
  mentorship:  { inApp: true,  email: true,  push: true,  sms: true  }, // SMS crítico p/ sessão
  event:       { inApp: true,  email: true,  push: true,  sms: true  }, // SMS crítico p/ live
  system:      { inApp: true,  email: true,  push: true,  sms: false }, // critical, alta prioridade
  marketing:   { inApp: false, email: false, push: false, sms: false }, // OPT-IN hard (LGPD)
};

export const DEFAULT_QUIET_HOURS: QuietHours = {
  enabled: true,
  start: '22:00',
  end: '07:00',
  timezone: 'America/Sao_Paulo',
};

export const DEFAULT_DIGEST: DigestFrequency = 'REALTIME';

// ============================================================================
// Preferences top-level
// ============================================================================

export interface NotificationPreference {
  userId: string;
  categories: CategoryChannelMatrix;
  quietHours: QuietHours;
  digestFrequency: DigestFrequency;
  /** ISO 8601 — atualizado quando o user modifica. */
  updatedAt: string;
}

// ============================================================================
// Mapear NotificationType → Categoria semântica (bridge W30 ↔ W36)
// ============================================================================

const TYPE_TO_CATEGORY: Partial<Record<NotificationType, NotificationCategory>> = {
  MENTION: 'mention',
  POST_REPLY: 'reply',
  COMMENT: 'reply',
  FOLLOW: 'follow',
  LIKE: 'reply',         // like é um reply "leve" p/ batching
  GROUP_INVITE: 'event', // convite de grupo se assemelha a evento
  GROUP_POST: 'reply',
  GROUP_ROLE_CHANGE: 'system',
  ARTICLE_RECOMMENDATION: 'akasha',
  ARTICLE_PUBLISHED: 'akasha',
  SYSTEM_ALERT: 'system',
  MODERATION_ACTION: 'system',
  DIGEST_WEEKLY: 'marketing',
};

/**
 * Resolve a categoria semântica de um tipo granular (W30).
 * Tipos não mapeados caem em 'system' (fail-safe).
 */
export function categoryFor(type: NotificationType): NotificationCategory {
  return TYPE_TO_CATEGORY[type] ?? 'system';
}

// ============================================================================
// Resolver e helpers
// ============================================================================

export interface CategoryPreference {
  inApp: boolean;
  email: boolean;
  push: boolean;
  sms: boolean;
}

/**
 * Resolve permissões finais a partir de prefs parciais (storage).
 * Defaults aplicados onde o user não optou explicitamente.
 */
export function resolveCategoryMatrix(
  partial: Partial<CategoryChannelMatrix> | null | undefined
): CategoryChannelMatrix {
  const out = {} as CategoryChannelMatrix;
  for (const cat of ALL_CATEGORIES) {
    const fromStorage = partial?.[cat];
    const def = DEFAULT_MATRIX[cat];
    out[cat] = fromStorage
      ? {
          inApp: fromStorage.inApp ?? def.inApp,
          email: fromStorage.email ?? def.email,
          push:  fromStorage.push  ?? def.push,
          sms:   fromStorage.sms   ?? def.sms,
        }
      : { ...def };
  }
  return out;
}

/** Decide se deve entregar uma notif v2 num canal, dado prefs e categoria. */
export function shouldDeliverV2(
  matrix: CategoryChannelMatrix,
  category: NotificationCategory,
  channel: NotificationChannelV2
): boolean {
  return matrix[category]?.[channel] === true;
}

/** Quantos canais estão habilitados para uma categoria (métrica de reach). */
export function enabledChannelCount(
  matrix: CategoryChannelMatrix,
  category: NotificationCategory
): number {
  const m = matrix[category];
  if (!m) return 0;
  return [m.inApp, m.email, m.push, m.sms].filter(Boolean).length;
}

// ============================================================================
// Validações + Zod-like runtime check (sem dep extra)
// ============================================================================

const VALID_FREQS = new Set<DigestFrequency>(['REALTIME', 'DAILY', 'WEEKLY', 'OFF']);
const VALID_HHMM = /^([01]\d|2[0-3]):[0-5]\d$/;

export interface ValidationResult {
  ok: boolean;
  errors: string[];
}

export function validatePreferences(prefs: NotificationPreference): ValidationResult {
  const errors: string[] = [];

  if (!prefs.userId) errors.push('userId requerido');

  for (const cat of ALL_CATEGORIES) {
    const ch = prefs.categories[cat];
    if (!ch) {
      errors.push(`categoria ${cat} sem canais definidos`);
      continue;
    }
    for (const c of ALL_CHANNELS_V2) {
      if (typeof ch[c] !== 'boolean') {
        errors.push(`categoria ${cat} canal ${c} sem boolean`);
      }
    }
  }

  if (prefs.quietHours.enabled) {
    if (!VALID_HHMM.test(prefs.quietHours.start)) {
      errors.push(`quietHours.start inválido: ${prefs.quietHours.start}`);
    }
    if (!VALID_HHMM.test(prefs.quietHours.end)) {
      errors.push(`quietHours.end inválido: ${prefs.quietHours.end}`);
    }
    if (!prefs.quietHours.timezone) {
      errors.push('quietHours.timezone requerido');
    }
  }

  if (!VALID_FREQS.has(prefs.digestFrequency)) {
    errors.push(`digestFrequency inválido: ${prefs.digestFrequency}`);
  }

  return { ok: errors.length === 0, errors };
}

// ============================================================================
// Self-check (smoke tests executados em build)
// ============================================================================

export const PREFERENCES_V2_META = {
  version: 2,
  schema: 'notification-preferences-v2',
  categories: ALL_CATEGORIES.length,
  channels: ALL_CHANNELS_V2.length,
  cells: ALL_CATEGORIES.length * ALL_CHANNELS_V2.length,
} as const;

export function preferencesV2SelfCheck(): { ok: boolean; details: string[] } {
  const details: string[] = [];
  try {
    // Round-trip
    const mat = resolveCategoryMatrix(null);
    if (Object.keys(mat).length !== ALL_CATEGORIES.length) {
      details.push(`matriz deve ter ${ALL_CATEGORIES.length} categorias, tem ${Object.keys(mat).length}`);
    }
    // Marketing deve ser opt-in
    if (mat.marketing.email !== false) {
      details.push('marketing.email deveria ser false (LGPD opt-in)');
    }
    // Marketplace SMS deve ser true (crítico)
    if (mat.marketplace.sms !== true) {
      details.push('marketplace.sms deveria ser true (critical path)');
    }
    // Category mapping OK
    if (categoryFor('MENTION') !== 'mention') {
      details.push('categoryFor(MENTION) deveria ser "mention"');
    }
    if (categoryFor('LIKE') !== 'reply') {
      details.push('categoryFor(LIKE) deveria ser "reply"');
    }
    if (categoryFor('NAO_EXISTE') !== 'system') {
      details.push('categoria desconhecida deveria falhar para "system"');
    }
    // Validação round-trip
    const valid = validatePreferences({
      userId: 'u1',
      categories: DEFAULT_MATRIX,
      quietHours: DEFAULT_QUIET_HOURS,
      digestFrequency: DEFAULT_DIGEST,
      updatedAt: new Date().toISOString(),
    });
    if (!valid.ok) details.push(`validação falhou: ${valid.errors.join('; ')}`);
  } catch (e) {
    details.push(`exceção: ${(e as Error).message}`);
  }
  return { ok: details.length === 0, details };
}
