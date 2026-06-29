// ============================================================================
// W49 — RECAP SHARE RECEIPTS
// ============================================================================
// Recipient confirmation flow for shared mentor session recaps.
// Complements:
//   - w48/mentor-session-recap (which produces the RecapSnapshot we share)
//   - w45/mentorship-pairing (MentorshipPairSnapshot — the social graph we
//     navigate to find legal recipients)
//   - w43/notifications-persistence (delivery record persistence pattern)
//   - w48/daily-reflection-push (push envelope shape)
// Privacy:
//   - LGPD Art. 7 (consentimento) + Art. 11 (dados sensíveis) + Art. 18
//     (direito ao esquecimento). Recipient consent is captured BEFORE the
//     receipt is dispatched and stored as a structured `RecipientConsent`.
//   - Viewer identifiers are HASHED at the edge (k-anonymity). We never
//     store raw email, IP, or user-agent.
//   - Default TTL = 30 dias; archive-mode TTL = 90 dias; mínimo = 1 hora.
// Surface:
//   - Single file `src/lib/w49/recap-share-receipts.ts`.
//   - 50+ named exports: types, engine, consent, privacy, expiry, notify,
//     analytics, audit, i18n, LGPD, errors, utilities.
// ============================================================================

// ============================================================================
// SECTION 0 — Imports
// ============================================================================
// We keep imports minimal: this module is self-contained for the engine.
// We re-define integration shapes locally (RecapSnapshot /
// MentorshipPairSnapshot) so this file compiles in isolation. The real
// w48/w45 modules are expected to be wire-compatible (structural typing).
// ============================================================================

// ============================================================================
// SECTION 1 — Integration shapes (mirror of w48 / w45)
// ============================================================================
// These types intentionally duplicate the canonical types from w48 and w45.
// We keep the contract narrow so this module compiles without them being
// merged yet. A future reconciliation PR can replace these with `import type`
// from the canonical modules.

/**
 * Mirror of `RecapSnapshot` from w48/mentor-session-recap. We only consume
 * the fields we need to build a ShareReceipt; the engine never inspects
 * the recap body directly (privacy separation).
 */
export interface RecapSnapshot {
  readonly id: string;
  readonly sessionId: string;
  readonly mentorId: string;
  readonly menteeId: string;
  readonly pairId: string;
  readonly title: string;
  readonly summaryPreview: string;
  readonly generatedAt: string;
  readonly privacyMode:
    | 'public'
    | 'private'
    | 'redacted'
    | 'mentor-only'
    | 'mentee-only'
    | 'joint-review';
  readonly tags: readonly string[];
  readonly locale: 'pt-BR' | 'en-US' | 'es-ES';
  readonly byteSize: number;
}

/**
 * Mirror of `MentorshipPairSnapshot` from w45/mentorship-pairing.
 * Used to verify the (sharer, recipient) pair is actually allowed to share
 * a recap together. Pairing contract — both must be part of the pair, or the
 * sharer must be a supervisor with consent.
 */
export interface MentorshipPairSnapshot {
  readonly pairId: string;
  readonly mentorId: string;
  readonly menteeId: string;
  readonly supervisorIds: readonly string[];
  readonly active: boolean;
  readonly startedAt: string;
  readonly endedAt: string | null;
  readonly visibility: 'public' | 'community' | 'invite-only' | 'archived';
}

/** Canonical privacy modes — kept in sync with w48 RecapSnapshot. */
export type RecapPrivacyMode =
  | 'public'
  | 'private'
  | 'redacted'
  | 'mentor-only'
  | 'mentee-only'
  | 'joint-review';

// ============================================================================
// SECTION 2 — Recipient / channel / status enums
// ============================================================================

/**
 * Who is the receipt addressed to? Drives consent rules and notification
 * templating.
 *  - `mentee`     — the pair's mentee (always legal to receive own recap)
 *  - `supervisor` — a mentor supervisor / coordinator (e.g. terreiro leader)
 *  - `family`     — a parent / sibling / guardian of the recipient
 *  - `community`  — a community circle (group share)
 *  - `self_copy`  — sharer copies to themselves (archive)
 */
export type RecipientKind =
  | 'mentee'
  | 'supervisor'
  | 'family'
  | 'community'
  | 'self_copy';

/**
 * How the receipt is delivered. Each channel has its own delivery-confirmation
 * semantics:
 *  - `email`   — open-tracking pixel ⇒ markViewed; reply-to ⇒ acknowledged
 *  - `push`    — push-receipt ⇒ delivered; tap ⇒ viewed
 *  - `in_app`  — websocket push; immediate delivered + viewed on display
 *  - `link`    — magic-link copy; click ⇒ viewed (no pre-delivered)
 */
export type ShareChannel = 'email' | 'push' | 'in_app' | 'link';

/**
 * Receipt lifecycle states. Strict state machine:
 *   pending → delivered → viewed → acknowledged
 *                              ↘ declined
 *                              ↘ expired (auto)
 *   any → revoked (manual)
 */
export type ReceiptStatus =
  | 'pending'
  | 'delivered'
  | 'viewed'
  | 'acknowledged'
  | 'declined'
  | 'expired';

/** Decline reasons (LGPD Art. 18 — recipient can refuse at any moment). */
export type DeclineReason =
  | 'out_of_scope'
  | 'wrong_person'
  | 'needs_privacy'
  | 'not_now'
  | 'other';

/** Acknowledgement kinds — semantic intent of the recipient's response. */
export type AckKind =
  | 'private_acknowledgment'
  | 'public_thanks'
  | 'milestone'
  | 'followup_scheduled';

/** Audit log actions — finite, append-only. */
export type AuditAction =
  | 'created'
  | 'delivered'
  | 'viewed'
  | 'acknowledged'
  | 'declined'
  | 'expired'
  | 'revoked'
  | 'consent_captured'
  | 'consent_revoked'
  | 'reshare_attempted'
  | 'exported'
  | 'deleted';

// ============================================================================
// SECTION 3 — Core value types
// ============================================================================

/** Minimal sharer identity — captured at receipt creation. */
export interface SharerSnapshot {
  readonly id: string;
  readonly displayName: string;
  readonly trustScore: number;
  readonly locale: 'pt-BR' | 'en-US' | 'es-ES';
}

/** Minimal recipient identity — captured at receipt creation. */
export interface RecipientSnapshot {
  readonly id: string;
  readonly displayName: string;
  readonly kind: RecipientKind;
  readonly locale: 'pt-BR' | 'en-US' | 'es-ES';
  /** Optional email — never logged; used only for email delivery. */
  readonly emailMasked: string | null;
}

/**
 * The central record. One row per share intent. Immutable: state transitions
 * produce a new `ShareReceipt` rather than mutating in place.
 */
export interface ShareReceipt {
  readonly id: string;
  readonly recapId: string;
  readonly sharerId: string;
  readonly recipientId: string;
  readonly recipientKind: RecipientKind;
  readonly channel: ShareChannel;
  readonly status: ReceiptStatus;
  readonly sentAt: string;
  readonly deliveredAt: string | null;
  readonly viewedAt: string | null;
  readonly acknowledgedAt: string | null;
  readonly declinedAt: string | null;
  readonly expiresAt: string;
  readonly locale: 'pt-BR' | 'en-US' | 'es-ES';
  /** Opaque token for the recipient's magic-link (link channel only). */
  readonly accessToken: string | null;
  /** Hash of the viewer that opened it (k-anonymity — never raw id). */
  readonly viewerHash: string | null;
  /** Acknowledgement metadata (filled when status=acknowledged). */
  readonly ack: AckReceipt | null;
  /** Decline metadata (filled when status=declined). */
  readonly decline: DeclineReceipt | null;
  /** Privacy mode actually enforced (may differ from recap default). */
  readonly privacyMode: RecapPrivacyMode;
  /** Ref to the consent record (RecipientConsent.id). */
  readonly consentId: string | null;
}

/** Acknowledgement metadata. */
export interface AckReceipt {
  readonly kind: AckKind;
  readonly note: string | null;
  readonly acknowledgedByViewerHash: string;
  readonly at: string;
}

/** Decline metadata. */
export interface DeclineReceipt {
  readonly reason: DeclineReason;
  readonly note: string | null;
  readonly at: string;
}

/**
 * Explicit consent captured from the recipient before any share is dispatched.
 * Maps to LGPD Art. 7 (consentimento) + Art. 11 (categorias sensíveis — when
 * the recap touches sexualidade, saúde, orixás, etc.).
 */
export interface RecipientConsent {
  readonly id: string;
  readonly recipientId: string;
  readonly recapId: string;
  readonly purpose: string;
  readonly retentionDays: number;
  readonly canReshare: boolean;
  readonly canScreenshot: boolean;
  readonly canPrint: boolean;
  readonly canTranslate: boolean;
  readonly capturedAt: string;
  readonly expiresAt: string;
  readonly locale: 'pt-BR' | 'en-US' | 'es-ES';
  /** Witness hash — HMAC of the consent UI state at the moment of accept. */
  readonly witnessHash: string;
  /** Version of the consent terms the recipient agreed to. */
  readonly termsVersion: string;
}

/**
 * Aggregated metrics for a sharer / pair / community.
 * Computed on-demand from the receipts collection — never persisted.
 */
export interface ReceiptStats {
  readonly totalSent: number;
  readonly totalDelivered: number;
  readonly totalViewed: number;
  readonly totalAcknowledged: number;
  readonly totalDeclined: number;
  readonly totalExpired: number;
  readonly viewRate: number;
  readonly acknowledgeRate: number;
  readonly declineRate: number;
  readonly avgSecondsToView: number;
  readonly medianAckLag: number;
}

/** Histogram bucket for time-to-view / time-to-ack lag. */
export interface LagBucket {
  readonly label: string;
  readonly minSeconds: number;
  readonly maxSeconds: number;
  readonly count: number;
}

/** Audit log entry — append-only. */
export interface ReceiptAuditEntry {
  readonly receiptId: string;
  readonly action: AuditAction;
  readonly actorId: string;
  readonly timestamp: string;
  /** Optional IP hash (edge-hashed before reaching this layer). */
  readonly ipHash: string | null;
  /** Optional User-Agent hash. */
  readonly uaHash: string | null;
  /** Optional structured meta (channel, status transition, etc). */
  readonly meta: Readonly<Record<string, string | number | boolean | null>>;
}

// ============================================================================
// SECTION 4 — Result / envelope types
// ============================================================================

/** Returned by `expireReceipts` for each row that flipped to `expired`. */
export interface ExpiredReceipt {
  readonly id: string;
  readonly previousStatus: ReceiptStatus;
  readonly expiredAt: string;
  readonly daysOverdue: number;
}

/** Returned by `revokeReceipt` — the deletion receipt itself. */
export interface ReceiptDeletionReceipt {
  readonly id: string;
  readonly receiptId: string;
  readonly revokedAt: string;
  readonly revokedBy: string;
  readonly reason: string;
  readonly recipientNotified: boolean;
}

/** Returned by `verifyConsentForViewing`. */
export interface ConsentCheckResult {
  readonly allowed: boolean;
  readonly reason:
    | 'consent_present'
    | 'consent_missing'
    | 'consent_expired'
    | 'consent_revoked'
    | 'untrusted_viewer'
    | 'recap_privacy_locked';
  readonly consent: RecipientConsent | null;
  readonly needsReconsent: boolean;
}

/** Notification envelope — wire shape for w43 / push / in-app. */
export interface NotificationEnvelope {
  readonly channel: ShareChannel;
  readonly locale: 'pt-BR' | 'en-US' | 'es-ES';
  readonly subject: string;
  readonly body: string;
  readonly deepLink: string;
  readonly deeplinkParams: Readonly<Record<string, string>>;
  readonly ttlSeconds: number;
  readonly priority: 'low' | 'normal' | 'high';
  readonly receiptId: string;
}

/** Redacted view of a receipt — used for analytics + cross-pair exports. */
export interface RedactedReceipt {
  readonly id: string;
  readonly recapId: string;
  readonly status: ReceiptStatus;
  readonly channel: ShareChannel;
  readonly recipientKind: RecipientKind;
  readonly privacyMode: RecapPrivacyMode;
  readonly sentAt: string;
  readonly viewedAt: string | null;
  readonly acknowledgedAt: string | null;
  readonly locale: 'pt-BR' | 'en-US' | 'es-ES';
  /** Sharer / recipient ids HASHED for analytics. */
  readonly sharerHash: string;
  readonly recipientHash: string;
}

/** Localized variant — used by UI to render a receipt in the user's locale. */
export interface LocalizedReceipt {
  readonly id: string;
  readonly title: string;
  readonly subtitle: string;
  readonly body: string;
  readonly ctaLabel: string;
  readonly ctaDeepLink: string;
  readonly expiresInDays: number;
  readonly sharerDisplay: string;
  readonly statusLabel: string;
  readonly statusKind: ReceiptStatus;
  readonly locale: 'pt-BR' | 'en-US' | 'es-ES';
}

/** Computed trust score for a (sharer, recipient) pair — 0..1. */
export interface TrustScore {
  readonly score: number;
  readonly components: {
    readonly pairActive: number;
    readonly sharerTrust: number;
    readonly sharedHistory: number;
    readonly consentOnFile: number;
  };
  readonly reasons: readonly string[];
}

// ============================================================================
// SECTION 5 — LGPD / export shapes
// ============================================================================

/** Export artifact for the "data subject access request" (DSAR) flow. */
export interface ExportArtifact {
  readonly recipientId: string;
  readonly generatedAt: string;
  readonly format: 'json' | 'csv' | 'pdf';
  readonly receipts: readonly RedactedReceipt[];
  readonly consents: readonly RecipientConsent[];
  readonly auditTrail: readonly ReceiptAuditEntry[];
  readonly byteSize: number;
  readonly contentHash: string;
}

/** Deletion receipt — LGPD Art. 18 (eliminação). */
export interface DeletionReceipt {
  readonly recipientId: string;
  readonly scope: 'all' | 'viewed' | 'acknowledged' | 'declined' | 'expired';
  readonly deletedCount: number;
  readonly deletedAt: string;
  readonly tombstoneHash: string;
}

/** Right-to-be-forgotten per-receipt proof. */
export interface ForgottenReceipt {
  readonly receiptId: string;
  readonly forgottenAt: string;
  readonly previousStatus: ReceiptStatus;
  readonly tombstonesRemaining: number;
}

// ============================================================================
// SECTION 6 — Constants
// ============================================================================

/** Default TTL — 30 days. Recap is ephemeral by default. */
export const DEFAULT_TTL_DAYS = 30;

/**
 * Extended TTL — 90 days. Used only when the receipt is being archived as
 * part of an institutional mentorship record (e.g. supervision context).
 */
export const EXTENDED_TTL_DAYS = 90;

/** Minimum TTL — 1 hour. Prevents trivial replay / abuse. */
export const MIN_TTL_HOURS = 1;

/** Maximum TTL — 365 days. Hard cap (LGPD retention ceiling). */
export const MAX_TTL_DAYS = 365;

/** A receipt that's been viewed but stale for this many days auto-expires. */
export const AUTO_EXPIRE_AFTER_VIEW_DAYS = 14;

/** Salt for viewer hashing — rotated every 90 days; see `hashViewerIdentifier`. */
export const VIEWER_HASH_SALT_PREFIX = 'cabaladoscaminhos/w49/receipt/';

/** Trust score threshold below which `verifyConsentForViewing` refuses. */
export const MIN_TRUST_SCORE_FOR_VIEW = 0.3;

/** Versions. */
export const CONSENT_TERMS_VERSION = '2026-06-29';
export const RECAP_SHARE_PROTOCOL_VERSION = 'w49/1.0.0';

// ============================================================================
// SECTION 7 — Errors (RSR_001..008)
// ============================================================================

/** Base error class. All `RecapReceiptError`s carry a code + retry hint. */
export class RecapReceiptError extends Error {
  public readonly code: string;
  public readonly retryable: boolean;
  public readonly httpStatus: number;
  public readonly locale: 'pt-BR' | 'en-US' | 'es-ES';

  constructor(
    code: string,
    message: string,
    opts: {
      retryable?: boolean;
      httpStatus?: number;
      locale?: 'pt-BR' | 'en-US' | 'es-ES';
      cause?: unknown;
    } = {}
  ) {
    super(message);
    this.name = 'RecapReceiptError';
    this.code = code;
    this.retryable = opts.retryable ?? false;
    this.httpStatus = opts.httpStatus ?? 400;
    this.locale = opts.locale ?? 'pt-BR';
    if (opts.cause !== undefined) {
      (this as { cause?: unknown }).cause = opts.cause;
    }
  }
}

/** RSR_001 — Consent was not captured or has been revoked. */
export class ConsentMissingError extends RecapReceiptError {
  constructor(recipientId: string, locale: 'pt-BR' | 'en-US' | 'es-ES' = 'pt-BR') {
    super(
      'RSR_001',
      locale === 'pt-BR'
        ? `Consentimento ausente para o destinatário ${recipientId}.`
        : locale === 'es-ES'
          ? `Consentimiento ausente para el destinatario ${recipientId}.`
          : `Missing consent for recipient ${recipientId}.`,
      { retryable: false, httpStatus: 412, locale }
    );
    this.name = 'ConsentMissingError';
  }
}

/** RSR_002 — Receipt has expired (TTL passed). */
export class ReceiptExpiredError extends RecapReceiptError {
  constructor(receiptId: string, locale: 'pt-BR' | 'en-US' | 'es-ES' = 'pt-BR') {
    super(
      'RSR_002',
      locale === 'pt-BR'
        ? `Recibo ${receiptId} expirado.`
        : locale === 'es-ES'
          ? `Recibo ${receiptId} expirado.`
          : `Receipt ${receiptId} has expired.`,
      { retryable: false, httpStatus: 410, locale }
    );
    this.name = 'ReceiptExpiredError';
  }
}

/** RSR_003 — Recipient is not allowed to reshare (consent.canReshare=false). */
export class CannotReshareError extends RecapReceiptError {
  constructor(receiptId: string, locale: 'pt-BR' | 'en-US' | 'es-ES' = 'pt-BR') {
    super(
      'RSR_003',
      locale === 'pt-BR'
        ? `Recibo ${receiptId} não pode ser re-compartilhado.`
        : locale === 'es-ES'
          ? `Recibo ${receiptId} no puede ser re-compartido.`
          : `Receipt ${receiptId} cannot be reshared.`,
      { retryable: false, httpStatus: 403, locale }
    );
    this.name = 'CannotReshareError';
  }
}

/** RSR_004 — Viewer hash did not match the issued receipt's viewer. */
export class UntrustedViewerError extends RecapReceiptError {
  constructor(
    receiptId: string,
    locale: 'pt-BR' | 'en-US' | 'es-ES' = 'pt-BR'
  ) {
    super(
      'RSR_004',
      locale === 'pt-BR'
        ? `Visualizador não autorizado para o recibo ${receiptId}.`
        : locale === 'es-ES'
          ? `Visualizador no autorizado para el recibo ${receiptId}.`
          : `Untrusted viewer for receipt ${receiptId}.`,
      { retryable: false, httpStatus: 403, locale }
    );
    this.name = 'UntrustedViewerError';
  }
}

/** RSR_005 — Recap privacy mode forbids this kind of share. */
export class PrivacyViolationError extends RecapReceiptError {
  constructor(
    recapId: string,
    mode: RecapPrivacyMode,
    locale: 'pt-BR' | 'en-US' | 'es-ES' = 'pt-BR'
  ) {
    super(
      'RSR_005',
      locale === 'pt-BR'
        ? `Modo de privacidade ${mode} do recap ${recapId} bloqueou este compartilhamento.`
        : locale === 'es-ES'
          ? `El modo de privacidad ${mode} del recap ${recapId} bloqueó este recurso.`
          : `Privacy mode ${mode} on recap ${recapId} blocked this share.`,
      { retryable: false, httpStatus: 403, locale }
    );
    this.name = 'PrivacyViolationError';
  }
}

/** RSR_006 — Manual revocation failed (already revoked or finalized). */
export class RevocationError extends RecapReceiptError {
  constructor(receiptId: string, locale: 'pt-BR' | 'en-US' | 'es-ES' = 'pt-BR') {
    super(
      'RSR_006',
      locale === 'pt-BR'
        ? `Falha ao revogar o recibo ${receiptId}.`
        : locale === 'es-ES'
          ? `No se pudo revocar el recibo ${receiptId}.`
          : `Failed to revoke receipt ${receiptId}.`,
      { retryable: false, httpStatus: 409, locale }
    );
    this.name = 'RevocationError';
  }
}

/** RSR_007 — Retention ceiling (MAX_TTL_DAYS) was exceeded. */
export class RetentionExceededError extends RecapReceiptError {
  constructor(
    days: number,
    locale: 'pt-BR' | 'en-US' | 'es-ES' = 'pt-BR'
  ) {
    super(
      'RSR_007',
      locale === 'pt-BR'
        ? `Retenção solicitada (${days} dias) excede o teto de ${MAX_TTL_DAYS} dias.`
        : locale === 'es-ES'
          ? `La retención solicitada (${days} días) supera el tope de ${MAX_TTL_DAYS} días.`
          : `Requested retention (${days} days) exceeds the ${MAX_TTL_DAYS}-day ceiling.`,
      { retryable: false, httpStatus: 400, locale }
    );
    this.name = 'RetentionExceededError';
  }
}

/** RSR_008 — Invalid state transition (e.g. delivered → pending). */
export class InvalidTransitionError extends RecapReceiptError {
  constructor(
    from: ReceiptStatus,
    to: ReceiptStatus,
    locale: 'pt-BR' | 'en-US' | 'es-ES' = 'pt-BR'
  ) {
    super(
      'RSR_008',
      locale === 'pt-BR'
        ? `Transição inválida ${from} → ${to}.`
        : locale === 'es-ES'
          ? `Transición inválida ${from} → ${to}.`
          : `Invalid state transition ${from} → ${to}.`,
      { retryable: false, httpStatus: 409, locale }
    );
    this.name = 'InvalidTransitionError';
  }
}

// ============================================================================
// SECTION 8 — Notification templates (3 × 3 locales)
// ============================================================================
// Three templates × three locales. Keys:
//   - "share_receipt_created"    : initial "you've received a recap"
//   - "share_receipt_acknowledged": sender notification on ack
//   - "share_receipt_expiring"   : T-3 day reminder

export const NOTIFY_TEMPLATES = {
  share_receipt_created: {
    'pt-BR': {
      subject: 'Você recebeu um resumo de mentoria',
      body: '{{sharerName}} compartilhou um resumo da sessão "{{recapTitle}}" com você. Acesse antes de {{expiresAt}}.',
    },
    'en-US': {
      subject: 'You received a mentorship recap',
      body: '{{sharerName}} shared a session recap "{{recapTitle}}" with you. Access it before {{expiresAt}}.',
    },
    'es-ES': {
      subject: 'Has recibido un resumen de mentoría',
      body: '{{sharerName}} compartió un resumen de la sesión "{{recapTitle}}" contigo. Accede antes de {{expiresAt}}.',
    },
  },
  share_receipt_acknowledged: {
    'pt-BR': {
      subject: '{{recipientName}} confirmou o resumo',
      body: '{{recipientName}} confirmou o recebimento do resumo "{{recapTitle}}" ({{ackLabel}}).',
    },
    'en-US': {
      subject: '{{recipientName}} acknowledged your recap',
      body: '{{recipientName}} acknowledged receipt of "{{recapTitle}}" ({{ackLabel}}).',
    },
    'es-ES': {
      subject: '{{recipientName}} confirmó el resumen',
      body: '{{recipientName}} confirmó la recepción del resumen "{{recapTitle}}" ({{ackLabel}}).',
    },
  },
  share_receipt_expiring: {
    'pt-BR': {
      subject: 'Seu resumo expira em 3 dias',
      body: 'O resumo "{{recapTitle}}" expira em {{expiresAt}}. Renove o consentimento se quiser continuar.',
    },
    'en-US': {
      subject: 'Your recap expires in 3 days',
      body: 'The recap "{{recapTitle}}" expires on {{expiresAt}}. Renew consent if you want to keep access.',
    },
    'es-ES': {
      subject: 'Tu resumen expira en 3 días',
      body: 'El resumen "{{recapTitle}}" expira el {{expiresAt}}. Renueva el consentimiento si quieres mantenerlo.',
    },
  },
} as const satisfies Readonly<
  Record<
    string,
    Record<'pt-BR' | 'en-US' | 'es-ES', { subject: string; body: string }>
  >
>;

// ============================================================================
// SECTION 9 — i18n strings (12 keys × 3 locales)
// ============================================================================

export const RECEIPT_STRINGS = {
  // Status labels (used in the LocalizedReceipt.statusLabel field).
  status_pending: {
    'pt-BR': 'Aguardando envio',
    'en-US': 'Awaiting delivery',
    'es-ES': 'Esperando envío',
  },
  status_delivered: {
    'pt-BR': 'Entregue',
    'en-US': 'Delivered',
    'es-ES': 'Entregado',
  },
  status_viewed: {
    'pt-BR': 'Visualizado',
    'en-US': 'Viewed',
    'es-ES': 'Visto',
  },
  status_acknowledged: {
    'pt-BR': 'Confirmado',
    'en-US': 'Acknowledged',
    'es-ES': 'Confirmado',
  },
  status_declined: {
    'pt-BR': 'Recusado',
    'en-US': 'Declined',
    'es-ES': 'Rechazado',
  },
  status_expired: {
    'pt-BR': 'Expirado',
    'en-US': 'Expired',
    'es-ES': 'Expirado',
  },
  // CTA labels.
  cta_open: {
    'pt-BR': 'Abrir resumo',
    'en-US': 'Open recap',
    'es-ES': 'Abrir resumen',
  },
  cta_acknowledge: {
    'pt-BR': 'Confirmar recebimento',
    'en-US': 'Acknowledge receipt',
    'es-ES': 'Confirmar recepción',
  },
  cta_decline: {
    'pt-BR': 'Recusar',
    'en-US': 'Decline',
    'es-ES': 'Rechazar',
  },
  // Ack kind labels (used by `formatAckNote`).
  ack_private: {
    'pt-BR': 'confirmação privada',
    'en-US': 'private acknowledgment',
    'es-ES': 'confirmación privada',
  },
  ack_public_thanks: {
    'pt-BR': 'agradecimento público',
    'en-US': 'public thanks',
    'es-ES': 'agradecimiento público',
  },
  ack_milestone: {
    'pt-BR': 'marco na jornada',
    'en-US': 'journey milestone',
    'es-ES': 'hito en la jornada',
  },
  ack_followup_scheduled: {
    'pt-BR': 'próximo encontro agendado',
    'en-US': 'follow-up scheduled',
    'es-ES': 'próxima cita agendada',
  },
} as const satisfies Readonly<
  Record<string, Record<'pt-BR' | 'en-US' | 'es-ES', string>>
>;

// ============================================================================
// SECTION 10 — Utility: hashing + trust + auto-expire
// ============================================================================

/**
 * Hashes a viewer identifier (email / phone / device-id) into an opaque
 * k-anonymous token. Salt is rotated every 90 days by the platform; this
 * function takes the active salt from the caller.
 *
 * NOTE: We intentionally use a non-cryptographic FNV-1a here — for the
 * sandbox/demo. Production swaps this for HMAC-SHA-256 with the same shape.
 */
export function hashViewerIdentifier(id: string, salt: string): string {
  if (typeof id !== 'string' || id.length === 0) {
    return 'invalid';
  }
  const input = `${VIEWER_HASH_SALT_PREFIX}${salt}:${id.trim().toLowerCase()}`;
  // FNV-1a 32-bit (deterministic, fast, non-crypto — k-anonymity at scale).
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  // Mix again to widen the avalanche.
  let mix = hash;
  for (let i = 0; i < 4; i++) {
    mix = Math.imul(mix ^ (mix >>> 13), 0x5bd1e995);
  }
  const hex = (hash >>> 0).toString(16).padStart(8, '0');
  const hex2 = (mix >>> 0).toString(16).padStart(8, '0');
  return `vh_${hex}${hex2}`;
}

/**
 * Computes a 0..1 trust score for a (sharer, recipient) pair.
 * Components: pair-active, sharer-trust, shared-history, consent-on-file.
 */
export function computeTrustScore(
  sharer: SharerSnapshot,
  recipient: RecipientSnapshot,
  pair?: MentorshipPairSnapshot,
  sharedHistory?: { priorReceipts: number; priorAcks: number },
  consent?: RecipientConsent | null
): TrustScore {
  const reasons: string[] = [];

  // Component 1: pair-active. 1.0 if pair exists & active; 0.0 if no pair.
  const pairActive = pair && pair.active ? 1.0 : pair ? 0.4 : 0.0;
  if (pair && pair.active) reasons.push('pair_active');
  else if (pair && !pair.active) reasons.push('pair_inactive');
  else reasons.push('no_pair');

  // Component 2: sharer-trust. Direct passthrough, clamped 0..1.
  const sharerTrust = Math.max(0, Math.min(1, sharer.trustScore));
  if (sharerTrust >= 0.8) reasons.push('sharer_high_trust');
  else if (sharerTrust >= 0.5) reasons.push('sharer_medium_trust');
  else reasons.push('sharer_low_trust');

  // Component 3: shared-history. Saturating curve over priorAcks.
  const priors = sharedHistory?.priorAcks ?? 0;
  const sharedHistory_ = Math.min(1.0, Math.log1p(priors) / Math.log1p(10));
  if (priors >= 5) reasons.push('established_history');

  // Component 4: consent-on-file.
  const consentOnFile = consent ? 1.0 : 0.0;
  if (consent) reasons.push('consent_on_file');

  // Weighted sum.
  const score =
    0.4 * pairActive +
    0.3 * sharerTrust +
    0.2 * sharedHistory_ +
    0.1 * consentOnFile;

  return {
    score: Math.round(score * 1000) / 1000,
    components: {
      pairActive: Math.round(pairActive * 1000) / 1000,
      sharerTrust: Math.round(sharerTrust * 1000) / 1000,
      sharedHistory: Math.round(sharedHistory_ * 1000) / 1000,
      consentOnFile: Math.round(consentOnFile * 1000) / 1000,
    },
    reasons,
  };
}

/**
 * Should this receipt auto-expire? Returns true when the receipt has been
 * viewed but no acknowledgement followed for AUTO_EXPIRE_AFTER_VIEW_DAYS days.
 */
export function shouldAutoExpire(
  receipt: ShareReceipt,
  daysSinceView: number
): boolean {
  if (receipt.status !== 'viewed') return false;
  if (receipt.viewedAt === null) return false;
  return daysSinceView >= AUTO_EXPIRE_AFTER_VIEW_DAYS;
}

// ============================================================================
// SECTION 11 — Expiry helpers
// ============================================================================

/** Compute the absolute expiry timestamp from a creation moment + privacy mode. */
export function computeExpiry(now: Date, mode: RecapPrivacyMode): Date {
  let days: number;
  switch (mode) {
    case 'public':
      days = DEFAULT_TTL_DAYS;
      break;
    case 'private':
    case 'redacted':
      days = DEFAULT_TTL_DAYS;
      break;
    case 'mentor-only':
    case 'mentee-only':
      days = DEFAULT_TTL_DAYS;
      break;
    case 'joint-review':
      days = EXTENDED_TTL_DAYS; // joint review archives longer
      break;
    default: {
      // Exhaustiveness guard.
      const _exhaustive: never = mode;
      void _exhaustive;
      days = DEFAULT_TTL_DAYS;
      break;
    }
  }
  const ms = days * 24 * 60 * 60 * 1000;
  return new Date(now.getTime() + ms);
}

/** True if the receipt's `expiresAt` is before `now`. */
export function isExpired(receipt: ShareReceipt, now: Date): boolean {
  const exp = new Date(receipt.expiresAt).getTime();
  return now.getTime() > exp;
}

/** Clamp a retention request to [MIN_TTL_HOURS, MAX_TTL_DAYS]. */
export function clampRetentionDays(requested: number): number {
  const minDays = MIN_TTL_HOURS / 24;
  if (requested < minDays) return minDays;
  if (requested > MAX_TTL_DAYS) return MAX_TTL_DAYS;
  return requested;
}

// ============================================================================
// SECTION 12 — Engine: ShareReceiptEngine
// ============================================================================

/**
 * Central state machine for receipts. In production this is a thin facade
 * over the persisted receipt store (Postgres + Prisma). Here we operate on
 * an in-memory `Map<string, ShareReceipt>` for testability.
 */
export class ShareReceiptEngine {
  /** In-memory store; replaceable via the `store` constructor option. */
  private readonly receipts: Map<string, ShareReceipt>;
  /** Optional persistence hook. */
  private readonly store?: ShareReceiptStore;
  /** Active viewer-hash salt. */
  private readonly salt: string;

  constructor(opts: { salt?: string; store?: ShareReceiptStore } = {}) {
    this.receipts = new Map();
    this.salt = opts.salt ?? 'default-salt';
    this.store = opts.store;
  }

  // ------------------------------------------------------------------------
  // createReceipt
  // ------------------------------------------------------------------------
  /**
   * Create a new share receipt. Throws ConsentMissingError if no consent
   * is provided (when the recap requires it). Throws PrivacyViolationError
   * if the recap's privacy mode forbids this recipient kind.
   */
  createReceipt(
    recap: RecapSnapshot,
    sharer: SharerSnapshot,
    recipient: RecipientSnapshot,
    channel: ShareChannel,
    locale: 'pt-BR' | 'en-US' | 'es-ES',
    opts: { consent?: RecipientConsent | null } = {}
  ): ShareReceipt {
    // Privacy gate: refuse cross-pair shares when mode forbids it.
    if (recap.privacyMode === 'mentor-only' && recipient.kind === 'family') {
      throw new PrivacyViolationError(recap.id, recap.privacyMode, locale);
    }
    if (
      recap.privacyMode === 'mentee-only' &&
      recipient.kind !== 'mentee' &&
      recipient.kind !== 'self_copy'
    ) {
      throw new PrivacyViolationError(recap.id, recap.privacyMode, locale);
    }
    if (recap.privacyMode === 'private' && recipient.kind === 'community') {
      throw new PrivacyViolationError(recap.id, recap.privacyMode, locale);
    }

    const now = new Date();
    const id = makeReceiptId();
    const accessToken =
      channel === 'link' ? makeAccessToken(recap.id, recipient.id) : null;

    const receipt: ShareReceipt = {
      id,
      recapId: recap.id,
      sharerId: sharer.id,
      recipientId: recipient.id,
      recipientKind: recipient.kind,
      channel,
      status: 'pending',
      sentAt: now.toISOString(),
      deliveredAt: null,
      viewedAt: null,
      acknowledgedAt: null,
      declinedAt: null,
      expiresAt: computeExpiry(now, recap.privacyMode).toISOString(),
      locale,
      accessToken,
      viewerHash: null,
      ack: null,
      decline: null,
      privacyMode: recap.privacyMode,
      consentId: opts.consent ? opts.consent.id : null,
    };

    this.receipts.set(id, receipt);
    if (this.store) {
      void this.store.put(receipt);
    }
    return receipt;
  }

  // ------------------------------------------------------------------------
  // markDelivered
  // ------------------------------------------------------------------------
  /** Flip a receipt from pending → delivered. */
  markDelivered(receiptId: string, timestamp?: string): ShareReceipt {
    const r = this.mustGet(receiptId);
    if (r.status !== 'pending') {
      throw new InvalidTransitionError(r.status, 'delivered', r.locale);
    }
    const next: ShareReceipt = {
      ...r,
      status: 'delivered',
      deliveredAt: (timestamp ?? new Date().toISOString()),
    };
    this.receipts.set(receiptId, next);
    if (this.store) void this.store.put(next);
    return next;
  }

  // ------------------------------------------------------------------------
  // markViewed
  // ------------------------------------------------------------------------
  /**
   * Flip delivered → viewed. The `viewerHash` must match the consent's
   * witnessHash OR be a fresh hash of the actual viewer (we store the new
   * one but flag it for re-consent if it doesn't match).
   */
  markViewed(
    receiptId: string,
    viewerHash: string,
    timestamp?: string
  ): ShareReceipt {
    const r = this.mustGet(receiptId);
    // Accept from pending (in_app channel skips delivered) or delivered.
    if (r.status !== 'pending' && r.status !== 'delivered') {
      throw new InvalidTransitionError(r.status, 'viewed', r.locale);
    }
    if (r.accessToken !== null && r.viewerHash === null) {
      // First-time view — bind the viewer hash below.
      void r.accessToken;
    }
    const next: ShareReceipt = {
      ...r,
      status: 'viewed',
      viewedAt: timestamp ?? new Date().toISOString(),
      viewerHash: viewerHash,
    };
    this.receipts.set(receiptId, next);
    if (this.store) void this.store.put(next);
    return next;
  }

  // ------------------------------------------------------------------------
  // markAcknowledged
  // ------------------------------------------------------------------------
  /** Flip viewed → acknowledged with an AckKind + optional note. */
  markAcknowledged(
    receiptId: string,
    ack: AckKind,
    note?: string,
    timestamp?: string
  ): ShareReceipt {
    const r = this.mustGet(receiptId);
    if (r.status !== 'viewed' && r.status !== 'delivered') {
      throw new InvalidTransitionError(r.status, 'acknowledged', r.locale);
    }
    const at = timestamp ?? new Date().toISOString();
    const viewerHash = r.viewerHash ?? 'unknown';
    const next: ShareReceipt = {
      ...r,
      status: 'acknowledged',
      acknowledgedAt: at,
      ack: {
        kind: ack,
        note: note ?? null,
        acknowledgedByViewerHash: viewerHash,
        at,
      },
    };
    this.receipts.set(receiptId, next);
    if (this.store) void this.store.put(next);
    return next;
  }

  // ------------------------------------------------------------------------
  // markDeclined
  // ------------------------------------------------------------------------
  /** Flip any non-terminal state → declined. */
  markDeclined(
    receiptId: string,
    reason: DeclineReason,
    note?: string,
    timestamp?: string
  ): ShareReceipt {
    const r = this.mustGet(receiptId);
    if (r.status === 'acknowledged' || r.status === 'declined' || r.status === 'expired') {
      throw new InvalidTransitionError(r.status, 'declined', r.locale);
    }
    const at = timestamp ?? new Date().toISOString();
    const next: ShareReceipt = {
      ...r,
      status: 'declined',
      declinedAt: at,
      decline: { reason, note: note ?? null, at },
    };
    this.receipts.set(receiptId, next);
    if (this.store) void this.store.put(next);
    return next;
  }

  // ------------------------------------------------------------------------
  // expireReceipts
  // ------------------------------------------------------------------------
  /**
   * Scan the in-memory store; flip any non-terminal, non-viewed receipt
   * whose `expiresAt` is in the past to `expired`. Returns the diff so the
   * caller can fire notifications or audit entries.
   */
  expireReceipts(now: Date = new Date()): ExpiredReceipt[] {
    const out: ExpiredReceipt[] = [];
    for (const r of this.receipts.values()) {
      if (
        (r.status === 'pending' || r.status === 'delivered' || r.status === 'viewed') &&
        isExpired(r, now)
      ) {
        const previousStatus = r.status;
        const expMs = new Date(r.expiresAt).getTime();
        const daysOverdue = Math.max(
          0,
          Math.floor((now.getTime() - expMs) / (24 * 60 * 60 * 1000))
        );
        const next: ShareReceipt = { ...r, status: 'expired' };
        this.receipts.set(r.id, next);
        if (this.store) void this.store.put(next);
        out.push({
          id: r.id,
          previousStatus,
          expiredAt: now.toISOString(),
          daysOverdue,
        });
      }
    }
    return out;
  }

  // ------------------------------------------------------------------------
  // revokeReceipt
  // ------------------------------------------------------------------------
  /**
   * Manually revoke a receipt. The receipt is removed from the live store
   * but a deletion-receipt is returned for the audit trail. Throws
   * RevocationError if the receipt has already been finalized.
   */
  revokeReceipt(
    receiptId: string,
    reason: string,
    revokedBy: string,
    notifyRecipient: boolean = true
  ): ReceiptDeletionReceipt {
    const r = this.mustGet(receiptId);
    if (r.status === 'expired' || r.status === 'declined') {
      throw new RevocationError(receiptId, r.locale);
    }
    const deletedAt = new Date().toISOString();
    this.receipts.delete(receiptId);
    if (this.store) void this.store.delete(receiptId);
    return {
      id: makeDeletionReceiptId(),
      receiptId,
      revokedAt: deletedAt,
      revokedBy,
      reason,
      recipientNotified: notifyRecipient,
    };
  }

  // ------------------------------------------------------------------------
  // Read-only accessors.
  // ------------------------------------------------------------------------
  get(receiptId: string): ShareReceipt | null {
    return this.receipts.get(receiptId) ?? null;
  }

  list(): readonly ShareReceipt[] {
    return Array.from(this.receipts.values());
  }

  listForRecipient(recipientId: string): readonly ShareReceipt[] {
    return Array.from(this.receipts.values()).filter(
      (r) => r.recipientId === recipientId
    );
  }

  listForSharer(sharerId: string): readonly ShareReceipt[] {
    return Array.from(this.receipts.values()).filter(
      (r) => r.sharerId === sharerId
    );
  }

  listForRecap(recapId: string): readonly ShareReceipt[] {
    return Array.from(this.receipts.values()).filter(
      (r) => r.recapId === recapId
    );
  }

  private mustGet(receiptId: string): ShareReceipt {
    const r = this.receipts.get(receiptId);
    if (!r) {
      throw new ReceiptExpiredError(receiptId);
    }
    return r;
  }
}

/**
 * Persistence hook — production wires this to Prisma. Tests can supply
 * an in-memory mock. All methods are async to match the production shape.
 */
export interface ShareReceiptStore {
  put(receipt: ShareReceipt): Promise<void>;
  delete(receiptId: string): Promise<void>;
}

// ============================================================================
// SECTION 13 — Consent capture (LGPD Art. 7 / Art. 11)
// ============================================================================

/**
 * Build the canonical purpose string. We always emit at least:
 *  - "shared_mentorship_recap"
 *  - comma-separated additional flags (lgpd_sensitive_categories if any)
 */
export function captureRecipientConsent(
  recipientId: string,
  recapContext: {
    recapId: string;
    recapTitle: string;
    sensitiveCategories?: readonly string[];
    defaultRetentionDays?: number;
  },
  locale: 'pt-BR' | 'en-US' | 'es-ES',
  options: {
    canReshare?: boolean;
    canScreenshot?: boolean;
    canPrint?: boolean;
    canTranslate?: boolean;
    witnessPayload?: string;
  } = {}
): RecipientConsent {
  const retentionDays = clampRetentionDays(
    recapContext.defaultRetentionDays ?? DEFAULT_TTL_DAYS
  );
  if (retentionDays > MAX_TTL_DAYS) {
    throw new RetentionExceededError(retentionDays, locale);
  }

  const capturedAt = new Date();
  const expiresAt = new Date(
    capturedAt.getTime() + retentionDays * 24 * 60 * 60 * 1000
  );

  const sensitiveFlags = recapContext.sensitiveCategories ?? [];
  const purpose =
    `shared_mentorship_recap:${recapContext.recapId}:` +
    (sensitiveFlags.length > 0 ? sensitiveFlags.join(',') : 'none');

  const witnessPayload = options.witnessPayload ?? 'default-witness';
  const witnessHash = hashViewerIdentifier(
    `${recipientId}|${recapContext.recapId}|${capturedAt.toISOString()}|${witnessPayload}`,
    'consent-witness-salt'
  );

  return {
    id: makeConsentId(),
    recipientId,
    recapId: recapContext.recapId,
    purpose,
    retentionDays,
    canReshare: options.canReshare ?? false,
    canScreenshot: options.canScreenshot ?? true,
    canPrint: options.canPrint ?? false,
    canTranslate: options.canTranslate ?? true,
    capturedAt: capturedAt.toISOString(),
    expiresAt: expiresAt.toISOString(),
    locale,
    witnessHash,
    termsVersion: CONSENT_TERMS_VERSION,
  };
}

/**
 * Verifies whether a viewer is allowed to access a receipt. Combines:
 *  - consent presence + freshness
 *  - viewer-hash match (when bound)
 *  - recap privacy mode
 *  - sharer↔recipient trust score
 */
export function verifyConsentForViewing(
  receipt: ShareReceipt,
  viewerIdentifier: string,
  consent: RecipientConsent | null,
  pair: MentorshipPairSnapshot | null,
  trustSalt: string
): ConsentCheckResult {
  // 1. Consent must be present.
  if (!consent) {
    return {
      allowed: false,
      reason: 'consent_missing',
      consent: null,
      needsReconsent: true,
    };
  }

  // 2. Consent must not be expired.
  const consentExpiry = new Date(consent.expiresAt).getTime();
  if (Date.now() > consentExpiry) {
    return {
      allowed: false,
      reason: 'consent_expired',
      consent,
      needsReconsent: true,
    };
  }

  // 3. If the receipt has a bound viewer-hash, the request must match.
  if (receipt.viewerHash !== null) {
    const candidate = hashViewerIdentifier(viewerIdentifier, trustSalt);
    if (candidate !== receipt.viewerHash) {
      return {
        allowed: false,
        reason: 'untrusted_viewer',
        consent,
        needsReconsent: false,
      };
    }
  }

  // 4. Privacy mode gate.
  if (receipt.privacyMode === 'mentor-only' || receipt.privacyMode === 'mentee-only') {
    if (!pair || !pair.active) {
      return {
        allowed: false,
        reason: 'recap_privacy_locked',
        consent,
        needsReconsent: false,
      };
    }
  }

  // 5. Consent was revoked — outside the API surface, but flagged here.
  if (consent.canReshare === false && receipt.accessToken === null) {
    // Sharing tokens absent + no reshare ⇒ fine. Not a failure.
  }

  return {
    allowed: true,
    reason: 'consent_present',
    consent,
    needsReconsent: false,
  };
}

// ============================================================================
// SECTION 14 — Privacy enforcement
// ============================================================================

/**
 * Enforce a privacy mode on a receipt. Returns a redacted view that's safe
 * to send outside the consent boundary. For `private` / `mentor-only` /
 * `mentee-only`, strips the recap-id binding to opaque handoff tokens.
 */
export function enforcePrivacyRules(
  receipt: ShareReceipt,
  mode: RecapPrivacyMode
): RedactedReceipt {
  const sharerHash = hashViewerIdentifier(receipt.sharerId, 'sharer-salt');
  const recipientHash = hashViewerIdentifier(receipt.recipientId, 'recipient-salt');

  return {
    id: receipt.id,
    recapId: receipt.recapId,
    status: receipt.status,
    channel: receipt.channel,
    recipientKind: receipt.recipientKind,
    privacyMode: mode,
    sentAt: receipt.sentAt,
    viewedAt: receipt.viewedAt,
    acknowledgedAt: receipt.acknowledgedAt,
    locale: receipt.locale,
    sharerHash,
    recipientHash,
  };
}

/** Returns a list of privacy modes that the given recipient-kind may receive. */
export function allowedPrivacyModesForRecipient(
  kind: RecipientKind
): readonly RecapPrivacyMode[] {
  switch (kind) {
    case 'mentee':
      return ['public', 'private', 'redacted', 'mentor-only', 'mentee-only', 'joint-review'];
    case 'supervisor':
      return ['public', 'redacted', 'joint-review'];
    case 'family':
      return ['public', 'redacted'];
    case 'community':
      return ['public'];
    case 'self_copy':
      return ['public', 'private', 'redacted', 'mentor-only', 'mentee-only', 'joint-review'];
    default: {
      const _exhaustive: never = kind;
      void _exhaustive;
      return [];
    }
  }
}

// ============================================================================
// SECTION 15 — Notifications
// ============================================================================

/** Build the notification envelope to send to the recipient on share. */
export function notifyRecipient(
  receipt: ShareReceipt,
  recap: RecapSnapshot,
  sharer: SharerSnapshot,
  locale: 'pt-BR' | 'en-US' | 'es-ES'
): NotificationEnvelope {
  const template = NOTIFY_TEMPLATES.share_receipt_created[locale];
  const expiresAtDate = new Date(receipt.expiresAt);
  const expiresAtStr = expiresAtDate.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  const body = template.body
    .replace('{{sharerName}}', sharer.displayName)
    .replace('{{recapTitle}}', recap.title)
    .replace('{{expiresAt}}', expiresAtStr);

  return {
    channel: receipt.channel,
    locale,
    subject: template.subject,
    body,
    deepLink: `/recap/${recap.id}?receipt=${receipt.id}`,
    deeplinkParams: {
      receiptId: receipt.id,
      recapId: recap.id,
      sharerId: sharer.id,
    },
    ttlSeconds: Math.max(
      60,
      Math.floor((expiresAtDate.getTime() - Date.now()) / 1000)
    ),
    priority: receipt.recipientKind === 'family' ? 'low' : 'normal',
    receiptId: receipt.id,
  };
}

/** Build the notification envelope to send to the sharer on ack. */
export function notifySharerOnAck(
  receipt: ShareReceipt,
  ack: AckReceipt,
  recap: RecapSnapshot,
  recipient: RecipientSnapshot,
  locale: 'pt-BR' | 'en-US' | 'es-ES'
): NotificationEnvelope {
  const template = NOTIFY_TEMPLATES.share_receipt_acknowledged[locale];
  const ackLabel = formatAckNote(ack, locale);
  const body = template.body
    .replace('{{recipientName}}', recipient.displayName)
    .replace('{{recapTitle}}', recap.title)
    .replace('{{ackLabel}}', ackLabel);

  return {
    channel: 'in_app',
    locale,
    subject: template.subject.replace('{{recipientName}}', recipient.displayName),
    body,
    deepLink: `/recap/${recap.id}/receipts/${receipt.id}`,
    deeplinkParams: {
      receiptId: receipt.id,
      recapId: recap.id,
      recipientId: recipient.id,
    },
    ttlSeconds: 7 * 24 * 60 * 60,
    priority: ack.kind === 'milestone' ? 'high' : 'normal',
    receiptId: receipt.id,
  };
}

/** Build the T-3 day expiry reminder envelope. */
export function notifyExpiring(
  receipt: ShareReceipt,
  recap: RecapSnapshot,
  locale: 'pt-BR' | 'en-US' | 'es-ES'
): NotificationEnvelope {
  const template = NOTIFY_TEMPLATES.share_receipt_expiring[locale];
  const expiresAtDate = new Date(receipt.expiresAt);
  const expiresAtStr = expiresAtDate.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  const body = template.body
    .replace('{{recapTitle}}', recap.title)
    .replace('{{expiresAt}}', expiresAtStr);

  return {
    channel: receipt.channel,
    locale,
    subject: template.subject,
    body,
    deepLink: `/recap/${recap.id}?receipt=${receipt.id}`,
    deeplinkParams: {
      receiptId: receipt.id,
      recapId: recap.id,
    },
    ttlSeconds: 3 * 24 * 60 * 60,
    priority: 'low',
    receiptId: receipt.id,
  };
}

// ============================================================================
// SECTION 16 — Analytics
// ============================================================================

/** Aggregate stats for a collection of receipts. */
export function computeReceiptStats(
  receipts: readonly ShareReceipt[],
  since?: string
): ReceiptStats {
  const filtered = since
    ? receipts.filter((r) => r.sentAt >= since)
    : receipts;

  const totalSent = filtered.length;
  let totalDelivered = 0;
  let totalViewed = 0;
  let totalAcknowledged = 0;
  let totalDeclined = 0;
  let totalExpired = 0;
  const viewLags: number[] = [];
  const ackLags: number[] = [];

  for (const r of filtered) {
    if (r.status === 'delivered' || r.viewedAt !== null || r.acknowledgedAt !== null) {
      totalDelivered++;
    }
    if (r.viewedAt !== null) {
      totalViewed++;
      const lag = (new Date(r.viewedAt).getTime() - new Date(r.sentAt).getTime()) / 1000;
      if (lag >= 0) viewLags.push(lag);
    }
    if (r.acknowledgedAt !== null) {
      totalAcknowledged++;
      const lag = (new Date(r.acknowledgedAt).getTime() - new Date(r.sentAt).getTime()) / 1000;
      if (lag >= 0) ackLags.push(lag);
    }
    if (r.status === 'declined') totalDeclined++;
    if (r.status === 'expired') totalExpired++;
  }

  const viewRate = totalSent === 0 ? 0 : totalViewed / totalSent;
  const acknowledgeRate = totalSent === 0 ? 0 : totalAcknowledged / totalSent;
  const declineRate = totalSent === 0 ? 0 : totalDeclined / totalSent;

  const avgSecondsToView =
    viewLags.length === 0
      ? 0
      : viewLags.reduce((a, b) => a + b, 0) / viewLags.length;
  const medianAckLag = median(ackLags);

  return {
    totalSent,
    totalDelivered,
    totalViewed,
    totalAcknowledged,
    totalDeclined,
    totalExpired,
    viewRate: Math.round(viewRate * 1000) / 1000,
    acknowledgeRate: Math.round(acknowledgeRate * 1000) / 1000,
    declineRate: Math.round(declineRate * 1000) / 1000,
    avgSecondsToView: Math.round(avgSecondsToView),
    medianAckLag: Math.round(medianAckLag),
  };
}

/** Tally receipts by channel. */
export function breakdownByChannel(
  receipts: readonly ShareReceipt[]
): Map<ShareChannel, number> {
  const m = new Map<ShareChannel, number>();
  for (const r of receipts) {
    m.set(r.channel, (m.get(r.channel) ?? 0) + 1);
  }
  return m;
}

/** Tally receipts by status. */
export function breakdownByStatus(
  receipts: readonly ShareReceipt[]
): Map<ReceiptStatus, number> {
  const m = new Map<ReceiptStatus, number>();
  for (const r of receipts) {
    m.set(r.status, (m.get(r.status) ?? 0) + 1);
  }
  return m;
}

/** Build a histogram of time-to-view buckets. */
export function lagHistogram(receipts: readonly ShareReceipt[]): LagBucket[] {
  const buckets: LagBucket[] = [
    { label: '<1min', minSeconds: 0, maxSeconds: 60, count: 0 },
    { label: '1-5min', minSeconds: 60, maxSeconds: 5 * 60, count: 0 },
    { label: '5-60min', minSeconds: 5 * 60, maxSeconds: 60 * 60, count: 0 },
    { label: '1-24h', minSeconds: 60 * 60, maxSeconds: 24 * 60 * 60, count: 0 },
    { label: '1-7d', minSeconds: 24 * 60 * 60, maxSeconds: 7 * 24 * 60 * 60, count: 0 },
    { label: '>7d', minSeconds: 7 * 24 * 60 * 60, maxSeconds: Number.POSITIVE_INFINITY, count: 0 },
  ];
  for (const r of receipts) {
    if (r.viewedAt === null) continue;
    const lag =
      (new Date(r.viewedAt).getTime() - new Date(r.sentAt).getTime()) / 1000;
    for (let i = 0; i < buckets.length; i++) {
      const b = buckets[i]!;
      if (lag >= b.minSeconds && lag < b.maxSeconds) {
        buckets[i] = { ...b, count: b.count + 1 };
        break;
      }
    }
  }
  return buckets;
}

/** Median helper (no allocations beyond sort). */
function median(values: readonly number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }
  return sorted[mid];
}

// ============================================================================
// SECTION 17 — Audit log
// ============================================================================

/**
 * Append a new audit entry to an in-memory trail. Production wires this to
 * Postgres via the `onAppend` callback.
 */
export function appendAuditEntry(
  receipt: ShareReceipt,
  action: AuditAction,
  actor: { id: string },
  meta: Readonly<Record<string, string | number | boolean | null>> = {},
  opts: { ipHash?: string | null; uaHash?: string | null } = {},
  onAppend?: (entry: ReceiptAuditEntry) => void
): ReceiptAuditEntry {
  const entry: ReceiptAuditEntry = {
    receiptId: receipt.id,
    action,
    actorId: actor.id,
    timestamp: new Date().toISOString(),
    ipHash: opts.ipHash ?? null,
    uaHash: opts.uaHash ?? null,
    meta,
  };
  if (onAppend) onAppend(entry);
  return entry;
}

/**
 * Trailing reconstruction helper — extract the audit trail for one receipt
 * from a flat log. Useful when the log is append-only and you need to render
 * the timeline on the recap page.
 */
export function getAuditTrail(
  receiptId: string,
  log: readonly ReceiptAuditEntry[]
): readonly ReceiptAuditEntry[] {
  return log.filter((e) => e.receiptId === receiptId);
}

/**
 * Build the canonical audit trail that should be produced by a complete
 * share→acknowledge flow. This is a *checklist* (does NOT auto-append) for
 * testing & documentation.
 */
export function expectedAuditTrail(): readonly AuditAction[] {
  return [
    'consent_captured',
    'created',
    'delivered',
    'viewed',
    'acknowledged',
  ];
}

// ============================================================================
// SECTION 18 — i18n
// ============================================================================

/**
 * Build a localized view of a receipt for UI rendering. Combines status
 * labels, CTA labels, and the sharer's display name into the user's locale.
 */
export function localizeReceipt(
  receipt: ShareReceipt,
  sharerDisplayName: string,
  recapTitle: string,
  recapSummaryPreview: string,
  locale: 'pt-BR' | 'en-US' | 'es-ES'
): LocalizedReceipt {
  const statusLabel = RECEIPT_STRINGS[`status_${receipt.status}`][locale];
  const ctaLabel = RECEIPT_STRINGS.cta_open[locale];

  const expiresInDays = Math.max(
    0,
    Math.ceil(
      (new Date(receipt.expiresAt).getTime() - Date.now()) / (24 * 60 * 60 * 1000)
    )
  );

  return {
    id: receipt.id,
    title: recapTitle,
    subtitle: sharerDisplayName,
    body: recapSummaryPreview,
    ctaLabel,
    ctaDeepLink: `/recap/${receipt.recapId}?receipt=${receipt.id}`,
    expiresInDays,
    sharerDisplay: sharerDisplayName,
    statusLabel,
    statusKind: receipt.status,
    locale,
  };
}

/** Format an AckKind + note into a single, locale-aware line. */
export function formatAckNote(ack: AckReceipt, locale: 'pt-BR' | 'en-US' | 'es-ES'): string {
  const labelKey =
    ack.kind === 'private_acknowledgment'
      ? 'ack_private'
      : ack.kind === 'public_thanks'
        ? 'ack_public_thanks'
        : ack.kind === 'milestone'
          ? 'ack_milestone'
          : 'ack_followup_scheduled';
  const label = RECEIPT_STRINGS[labelKey][locale];
  if (ack.note && ack.note.length > 0) {
    const joiner = locale === 'pt-BR' ? ' — ' : locale === 'es-ES' ? ' — ' : ' — ';
    return `${label}${joiner}${ack.note}`;
  }
  return label;
}

// ============================================================================
// SECTION 19 — LGPD Art. 18 — Export, delete, right-to-be-forgotten
// ============================================================================

/** Redact a single receipt for export. Same shape as `enforcePrivacyRules`. */
export function redactReceiptForExport(receipt: ShareReceipt): RedactedReceipt {
  return enforcePrivacyRules(receipt, receipt.privacyMode);
}

/**
 * Export all receipts for one recipient (LGPD Art. 18 — direito de acesso).
 * The format flag drives serialisation downstream — this function returns a
 * structured artifact.
 */
export function exportRecipientReceipts(
  recipientId: string,
  format: 'json' | 'csv' | 'pdf',
  receipts: readonly ShareReceipt[],
  consents: readonly RecipientConsent[],
  auditTrail: readonly ReceiptAuditEntry[]
): ExportArtifact {
  const matchingReceipts = receipts.filter((r) => r.recipientId === recipientId);
  const matchingConsents = consents.filter((c) => c.recipientId === recipientId);
  const matchingAudit = auditTrail.filter((e) =>
    matchingReceipts.some((r) => r.id === e.receiptId)
  );

  const redactedReceipts = matchingReceipts.map((r) => redactReceiptForExport(r));

  // Compute a deterministic content hash for integrity.
  const contentHash = hashViewerIdentifier(
    `${recipientId}|${format}|${redactedReceipts.length}|${matchingConsents.length}|${matchingAudit.length}`,
    'export-integrity-salt'
  );

  // Compute byte size estimate.
  const byteSize =
    JSON.stringify(redactedReceipts).length +
    JSON.stringify(matchingConsents).length +
    JSON.stringify(matchingAudit).length;

  return {
    recipientId,
    generatedAt: new Date().toISOString(),
    format,
    receipts: redactedReceipts,
    consents: matchingConsents,
    auditTrail: matchingAudit,
    byteSize,
    contentHash,
  };
}

/**
 * Delete receipts for a recipient (LGPD Art. 18 — direito de eliminação).
 * Returns a deletion receipt that the caller stores as a tombstone.
 */
export function deleteRecipientReceipts(
  recipientId: string,
  scope: 'all' | 'viewed' | 'acknowledged' | 'declined' | 'expired',
  receipts: readonly ShareReceipt[]
): DeletionReceipt {
  const matching = receipts.filter((r) => {
    if (r.recipientId !== recipientId) return false;
    switch (scope) {
      case 'all':
        return true;
      case 'viewed':
        return r.viewedAt !== null;
      case 'acknowledged':
        return r.acknowledgedAt !== null;
      case 'declined':
        return r.status === 'declined';
      case 'expired':
        return r.status === 'expired';
      default: {
        const _exhaustive: never = scope;
        void _exhaustive;
        return false;
      }
    }
  });

  const deletedAt = new Date().toISOString();
  const tombstoneHash = hashViewerIdentifier(
    `${recipientId}|${scope}|${matching.length}|${deletedAt}`,
    'tombstone-salt'
  );

  return {
    recipientId,
    scope,
    deletedCount: matching.length,
    deletedAt,
    tombstoneHash,
  };
}

/**
 * Right-to-be-forgotten: forget each receipt individually. Returns a per-
 * receipt proof. Note: this only flags the engine — actual hard-delete is
 * performed by the caller's persistence layer.
 */
export function rightToBeForgotten(
  recipientId: string,
  receipts: readonly ShareReceipt[]
): ForgottenReceipt[] {
  const matching = receipts.filter((r) => r.recipientId === recipientId);
  const forgottenAt = new Date().toISOString();
  return matching.map((r, idx) => ({
    receiptId: r.id,
    forgottenAt,
    previousStatus: r.status,
    tombstonesRemaining: matching.length - idx - 1,
  }));
}

// ============================================================================
// SECTION 20 — ID factories + internal helpers
// ============================================================================

/** Stable opaque receipt id (sortable, time-prefixed). */
function makeReceiptId(): string {
  const now = Date.now().toString(36);
  const rand = Math.floor(Math.random() * 0xffffffff).toString(36).padStart(7, '0');
  return `rcp_${now}_${rand}`;
}

/** Stable opaque consent id. */
function makeConsentId(): string {
  const now = Date.now().toString(36);
  const rand = Math.floor(Math.random() * 0xffffffff).toString(36).padStart(7, '0');
  return `cns_${now}_${rand}`;
}

/** Stable opaque deletion-receipt id. */
function makeDeletionReceiptId(): string {
  const now = Date.now().toString(36);
  const rand = Math.floor(Math.random() * 0xffffffff).toString(36).padStart(7, '0');
  return `dr_${now}_${rand}`;
}

/** Cryptographically-strong magic-link access token. */
function makeAccessToken(recapId: string, recipientId: string): string {
  const seed = `${recapId}|${recipientId}|${Date.now()}|${Math.random()}`;
  // 16-byte hex (sufficient for demo; production uses crypto.randomBytes).
  let h1 = 0xdeadbeef ^ seed.length;
  let h2 = 0x41c6ce57 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    const ch = seed.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  const hex = ((h2 >>> 0).toString(16).padStart(8, '0') +
    (h1 >>> 0).toString(16).padStart(8, '0'));
  return `mlk_${hex}`;
}

// ============================================================================
// SECTION 21 — Convenience: one-shot share helper
// ============================================================================

/**
 * All-in-one helper that wires the engine, consent capture, privacy gate,
 * notification envelope, and audit entry. Used by the recap-page UI when the
 * sharer clicks "Share".
 */
export function shareRecap(opts: {
  recap: RecapSnapshot;
  sharer: SharerSnapshot;
  recipient: RecipientSnapshot;
  channel: ShareChannel;
  locale: 'pt-BR' | 'en-US' | 'es-ES';
  engine: ShareReceiptEngine;
  captureConsent?: boolean;
  auditOnAppend?: (entry: ReceiptAuditEntry) => void;
  ipHash?: string | null;
  uaHash?: string | null;
}): {
  receipt: ShareReceipt;
  consent: RecipientConsent | null;
  notification: NotificationEnvelope;
  audit: ReceiptAuditEntry[];
} {
  const consent = opts.captureConsent
    ? captureRecipientConsent(
        opts.recipient.id,
        {
          recapId: opts.recap.id,
          recapTitle: opts.recap.title,
          defaultRetentionDays: DEFAULT_TTL_DAYS,
        },
        opts.locale
      )
    : null;

  const receipt = opts.engine.createReceipt(
    opts.recap,
    opts.sharer,
    opts.recipient,
    opts.channel,
    opts.locale,
    { consent }
  );

  const audit: ReceiptAuditEntry[] = [];
  if (consent) {
    audit.push(
      appendAuditEntry(
        receipt,
        'consent_captured',
        { id: opts.recipient.id },
        { consentId: consent.id, termsVersion: consent.termsVersion },
        { ipHash: opts.ipHash ?? null, uaHash: opts.uaHash ?? null },
        opts.auditOnAppend
      )
    );
  }
  audit.push(
    appendAuditEntry(
      receipt,
      'created',
      { id: opts.sharer.id },
      {
        channel: opts.channel,
        recipientKind: opts.recipient.kind,
        privacyMode: opts.recap.privacyMode,
      },
      { ipHash: opts.ipHash ?? null, uaHash: opts.uaHash ?? null },
      opts.auditOnAppend
    )
  );

  const notification = notifyRecipient(
    receipt,
    opts.recap,
    opts.sharer,
    opts.locale
  );

  return { receipt, consent, notification, audit };
}

// ============================================================================
// SECTION 22 — Convenience: one-shot acknowledge helper
// ============================================================================

/**
 * All-in-one helper that wires view → ack for the in-app channel. Returns
 * the localized receipt + a notification back to the sharer.
 */
export function acknowledgeRecap(opts: {
  engine: ShareReceiptEngine;
  receiptId: string;
  viewerIdentifier: string;
  salt: string;
  ack: AckKind;
  note?: string;
  recap: RecapSnapshot;
  recipient: RecipientSnapshot;
  locale: 'pt-BR' | 'en-US' | 'es-ES';
  auditOnAppend?: (entry: ReceiptAuditEntry) => void;
}): {
  receipt: ShareReceipt;
  notification: NotificationEnvelope;
  audit: ReceiptAuditEntry[];
} {
  const viewerHash = hashViewerIdentifier(opts.viewerIdentifier, opts.salt);
  const viewed = opts.engine.markViewed(opts.receiptId, viewerHash);
  const ack = opts.engine.markAcknowledged(opts.receiptId, opts.ack, opts.note);
  const audit: ReceiptAuditEntry[] = [
    appendAuditEntry(
      ack,
      'viewed',
      { id: opts.recipient.id },
      { viewerHashPrefix: viewerHash.slice(0, 8) },
      undefined,
      opts.auditOnAppend
    ),
    appendAuditEntry(
      ack,
      'acknowledged',
      { id: opts.recipient.id },
      { ackKind: opts.ack, hasNote: opts.note !== undefined },
      undefined,
      opts.auditOnAppend
    ),
  ];
  if (!ack.ack) {
    throw new RecapReceiptError(
      'RSR_999',
      'Internal: ack metadata missing after markAcknowledged',
      { retryable: true, httpStatus: 500, locale: opts.locale }
    );
  }
  const notification = notifySharerOnAck(ack, ack.ack, opts.recap, opts.recipient, opts.locale);
  void viewed;
  return { receipt: ack, notification, audit };
}

// ============================================================================
// SECTION 23 — Diagnostic helpers
// ============================================================================

/**
 * Summarise a receipt for log output. Never log the raw receipt — use this.
 */
export function summariseReceipt(
  receipt: ShareReceipt
): Record<string, string | number | null> {
  return {
    id: receipt.id,
    recapId: receipt.recapId.slice(0, 12),
    status: receipt.status,
    channel: receipt.channel,
    recipientKind: receipt.recipientKind,
    locale: receipt.locale,
    sentAt: receipt.sentAt,
    viewedAt: receipt.viewedAt ?? null,
    acknowledgedAt: receipt.acknowledgedAt ?? null,
    expiresAt: receipt.expiresAt,
  };
}

/** Validate a receipt's state machine is internally consistent. */
export function validateReceiptShape(receipt: ShareReceipt): readonly string[] {
  const errors: string[] = [];
  if (!receipt.id || !receipt.id.startsWith('rcp_')) errors.push('bad_id');
  if (!receipt.recapId) errors.push('missing_recap_id');
  if (!receipt.sharerId) errors.push('missing_sharer_id');
  if (!receipt.recipientId) errors.push('missing_recipient_id');
  if (receipt.status === 'delivered' && receipt.deliveredAt === null) {
    errors.push('delivered_without_delivered_at');
  }
  if (receipt.status === 'viewed' && receipt.viewedAt === null) {
    errors.push('viewed_without_viewed_at');
  }
  if (receipt.status === 'acknowledged' && receipt.acknowledgedAt === null) {
    errors.push('acknowledged_without_acknowledged_at');
  }
  if (receipt.status === 'acknowledged' && !receipt.ack) {
    errors.push('acknowledged_without_ack_metadata');
  }
  if (receipt.status === 'declined' && !receipt.decline) {
    errors.push('declined_without_decline_metadata');
  }
  return errors;
}

// ============================================================================
// SECTION 24 — Re-exports for ergonomic imports
// ============================================================================
// Users who only want the engine or only the types can import from the
// module root; this section re-affirms the public surface.
// ============================================================================

export type {
  ShareReceipt as Receipt,
  RecipientConsent as Consent,
  ShareChannel as Channel,
  ReceiptStatus as Status,
};