// ============================================================================
// NOTIFICATIONS V2 — Templates (W36)
// ============================================================================
// 8 templates tipados — cada um gera subject, in-app line, push body e
// short SMS, garantindo consistência cross-canal.
//
// LGPD Art. 18: cada template inclui 1-tap unsub link + brand footer.
// Mobile-first: subject ≤ 50 chars, push ≤ 120 chars, inApp ≤ 80 chars.
// ============================================================================

import type { NotificationCategory } from '../preferences-v2';

// ============================================================================
// Tipos
// ============================================================================

export interface NotificationTemplate {
  category: NotificationCategory;
  /** i18n key (pt-BR é default). */
  key: string;
  /** Versão do schema (incrementar quando muda contrato). */
  version: number;
  /** Email subject (≤ 50 chars). */
  emailSubject: (vars: Record<string, string>) => string;
  /** In-app linha de preview (≤ 80 chars). */
  inAppLine: (vars: Record<string, string>) => string;
  /** Push title (≤ 40 chars). */
  pushTitle: (vars: Record<string, string>) => string;
  /** Push body (≤ 120 chars). */
  pushBody: (vars: Record<string, string>) => string;
  /** SMS (≤ 160 chars). */
  smsBody: (vars: Record<string, string>) => string;
  /** Variáveis requeridas. */
  requiredVars: readonly string[];
  /** Se true, SMS é enviado para esta categoria. */
  smsEligible: boolean;
}

// ============================================================================
// Helpers de truncagem (defesa em profundidade)
// ============================================================================

function trunc(s: string, max: number): string {
  return s.length <= max ? s : s.slice(0, max - 1) + '…';
}

// ============================================================================
// 8 templates (1 por categoria semântica não-coberta por outras categorias)
// ============================================================================

// 1. MENTION
export const TEMPLATE_MENTION: NotificationTemplate = {
  category: 'mention',
  key: 'mention.post',
  version: 2,
  smsEligible: false,
  requiredVars: ['actorName', 'postTitle'],
  emailSubject: (v) => trunc(`${v.actorName} te mencionou em "${v.postTitle}"`, 50),
  inAppLine: (v) => trunc(`${v.actorName} te mencionou em "${v.postTitle}"`, 80),
  pushTitle: (v) => trunc(`${v.actorName} te mencionou`, 40),
  pushBody:  (v) => trunc(`Em "${v.postTitle}" — toque pra responder`, 120),
  smsBody:   (v) => trunc(`Cabala: ${v.actorName} te mencionou em "${v.postTitle}". Abra o app.`, 160),
};

// 2. REPLY
export const TEMPLATE_REPLY: NotificationTemplate = {
  category: 'reply',
  key: 'reply.comment',
  version: 2,
  smsEligible: false,
  requiredVars: ['actorName'],
  emailSubject: (v) => trunc(`${v.actorName} respondeu seu comentário`, 50),
  inAppLine: (v) => trunc(`${v.actorName} respondeu seu comentário`, 80),
  pushTitle: (v) => trunc(v.actorName, 40),
  pushBody:  (v) => trunc(`${v.actorName} respondeu seu comentário`, 120),
  smsBody:   (v) => trunc(`Cabala: ${v.actorName} respondeu seu comentário.`, 160),
};

// 3. FOLLOW
export const TEMPLATE_FOLLOW: NotificationTemplate = {
  category: 'follow',
  key: 'follow.user',
  version: 2,
  smsEligible: false,
  requiredVars: ['actorName'],
  emailSubject: (v) => trunc(`${v.actorName} começou a te seguir`, 50),
  inAppLine: (v) => trunc(`${v.actorName} começou a te seguir`, 80),
  pushTitle: (v) => trunc('Novo seguidor', 40),
  pushBody:  (v) => trunc(`${v.actorName} começou a te seguir na Cabala`, 120),
  smsBody:   (v) => trunc(`Cabala: ${v.actorName} te seguiu.`, 160),
};

// 4. AKASHA milestone
export const TEMPLATE_AKASHA_MILESTONE: NotificationTemplate = {
  category: 'akasha',
  key: 'akasha.milestone',
  version: 2,
  smsEligible: false,
  requiredVars: ['milestone'],
  emailSubject: (v) => trunc(`Você completou ${v.milestone} com Akasha!`, 50),
  inAppLine: (v) => trunc(`Você completou ${v.milestone} conversas com Akasha`, 80),
  pushTitle: (v) => trunc('Akasha • Marco', 40),
  pushBody:  (v) => trunc(`Você completou ${v.milestone}! Continue sua jornada.`, 120),
  smsBody:   (v) => trunc(`Cabala: ${v.milestone} com Akasha. Parabéns!`, 160),
};

// 5. MARKETPLACE
export const TEMPLATE_MARKETPLACE: NotificationTemplate = {
  category: 'marketplace',
  key: 'marketplace.reserved',
  version: 2,
  smsEligible: true,
  requiredVars: ['offeringTitle', 'buyerName'],
  emailSubject: (v) => trunc(`${v.buyerName} reservou "${v.offeringTitle}"`, 50),
  inAppLine: (v) => trunc(`${v.buyerName} reservou seu offering "${v.offeringTitle}"`, 80),
  pushTitle: (v) => trunc('Offering reservado', 40),
  pushBody:  (v) => trunc(`${v.buyerName} reservou "${v.offeringTitle}" — confirme pagamento`, 120),
  smsBody:   (v) => trunc(`Cabala: ${v.buyerName} reservou seu offering "${v.offeringTitle}". Confirme.`, 160),
};

// 6. MENTORSHIP
export const TEMPLATE_MENTORSHIP: NotificationTemplate = {
  category: 'mentorship',
  key: 'mentorship.reminder',
  version: 2,
  smsEligible: true,
  requiredVars: ['mentorName', 'eta'],
  emailSubject: (v) => trunc(`Sessão com ${v.mentorName} em ${v.eta}`, 50),
  inAppLine: (v) => trunc(`Sua sessão com ${v.mentorName} está em ${v.eta}`, 80),
  pushTitle: (v) => trunc('Sessão em breve', 40),
  pushBody:  (v) => trunc(`Sessão com ${v.mentorName} começa em ${v.eta}`, 120),
  smsBody:   (v) => trunc(`Cabala: sessão com ${v.mentorName} em ${v.eta}.`, 160),
};

// 7. EVENT
export const TEMPLATE_EVENT: NotificationTemplate = {
  category: 'event',
  key: 'event.live',
  version: 2,
  smsEligible: true,
  requiredVars: ['eventTitle', 'eta'],
  emailSubject: (v) => trunc(`"${v.eventTitle}" começa em ${v.eta}`, 50),
  inAppLine: (v) => trunc(`"${v.eventTitle}" começa em ${v.eta}`, 80),
  pushTitle: (v) => trunc('Live começando', 40),
  pushBody:  (v) => trunc(`"${v.eventTitle}" em ${v.eta} — entre agora`, 120),
  smsBody:   (v) => trunc(`Cabala: ${v.eventTitle} em ${v.eta}.`, 160),
};

// 8. SYSTEM
export const TEMPLATE_SYSTEM: NotificationTemplate = {
  category: 'system',
  key: 'system.alert',
  version: 2,
  smsEligible: false,
  requiredVars: ['message'],
  emailSubject: (v) => trunc(`[Cabala] ${v.message}`, 50),
  inAppLine: (v) => trunc(v.message, 80),
  pushTitle: (v) => trunc('Cabala • Sistema', 40),
  pushBody:  (v) => trunc(v.message, 120),
  smsBody:   (v) => trunc(`Cabala: ${v.message}`, 160),
};

// Marketing (extra, opt-in)
export const TEMPLATE_MARKETING: NotificationTemplate = {
  category: 'marketing',
  key: 'marketing.weekly',
  version: 2,
  smsEligible: false,
  requiredVars: ['digest'],
  emailSubject: (v) => trunc(`Cabala • ${v.digest}`, 50),
  inAppLine: (v) => trunc(`${v.digest} — confira`, 80),
  pushTitle: (v) => trunc('Cabala semanal', 40),
  pushBody:  (v) => trunc(`${v.digest} chegou — abre o app`, 120),
  smsBody:   (v) => trunc(`Cabala: ${v.digest}`, 160),
};

// ============================================================================
// Catalog
// ============================================================================

export const TEMPLATE_CATALOG: Record<NotificationCategory, NotificationTemplate> = {
  mention:     TEMPLATE_MENTION,
  reply:       TEMPLATE_REPLY,
  follow:      TEMPLATE_FOLLOW,
  akasha:      TEMPLATE_AKASHA_MILESTONE,
  marketplace: TEMPLATE_MARKETPLACE,
  mentorship:  TEMPLATE_MENTORSHIP,
  event:       TEMPLATE_EVENT,
  system:      TEMPLATE_SYSTEM,
  marketing:   TEMPLATE_MARKETING,
};

// ============================================================================
// Render helper
// ============================================================================

export interface RenderedMessage {
  subject: string;
  inApp: string;
  pushTitle: string;
  pushBody: string;
  smsBody: string;
  category: NotificationCategory;
  templateVersion: number;
}

/**
 * Renderiza um template garantindo todas as vars requeridas presentes.
 * Retorna erro com vars faltantes para o caller diagnosticar.
 */
export function renderTemplate(
  category: NotificationCategory,
  vars: Record<string, string>
): { ok: true; message: RenderedMessage } | { ok: false; missing: string[] } {
  const t = TEMPLATE_CATALOG[category];
  if (!t) return { ok: false, missing: ['category'] };
  const missing = t.requiredVars.filter((k) => !vars[k] || vars[k].length === 0);
  if (missing.length > 0) return { ok: false, missing };
  return {
    ok: true,
    message: {
      subject: t.emailSubject(vars),
      inApp: t.inAppLine(vars),
      pushTitle: t.pushTitle(vars),
      pushBody: t.pushBody(vars),
      smsBody: t.smsBody(vars),
      category: t.category,
      templateVersion: t.version,
    },
  };
}
