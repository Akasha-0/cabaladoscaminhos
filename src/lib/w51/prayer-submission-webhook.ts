/**
 * w51/prayer-submission-webhook
 * -----------------------------------------------------------------------------
 * Webhook notifier for w50/curated-prayer-submission state transitions.
 * SCOPE
 * Outbound webhook bus that mirrors every state transition produced by the
 * w50 curated prayer submission engine into per-channel notifications
 * (Slack, Discord, Email RFC 5322, generic JSON webhook, Telegram HTML,
 * PagerDuty). The engine does NOT execute the HTTP delivery itself — it
 * produces structured payloads, signs them, formats per-channel bodies,
 * and enqueues them on the local delivery queue. A downstream worker
 * (the "fanout driver") consumes the queue; this module gives it
 * everything it needs to format a request, decide whether to retry,
 * mark a delivery as terminal, and so on.
 * ADJACENT MODULES
 * w50/curated-prayer-submission   — produces PrayerSubmission transitions.
 * w50/curated-prayer-submission.reviewTrail / auditLog feed the renderer.
 * w49/tradition-prayer-corpus     — TRADITION list mirrored below; the
 * webhook routing rules must reject
 * subscriptions for sacred-tradition
 * events without explicit consent.
 * w50/admin-cockpit-ui            — uses exportDeliveriesForAudit to render
 * the "system messages" tab.
 * w49/push-ab-experiment-dashboard — retry/backoff stats can feed it.
 * DURABLE POLICY (DON'T)
 * 1. NEVER let a webhook payload for `sacred_text_reserved_slot_filled`
 * include the prayer body or title — only prayerId + tradition +
 * sensitivity + locale. This is the house rule that protects Orixá,
 * Ifá, Umbanda, Indigenous and Buddhist initiatior-only invocations
 * from leaking into Slack/Discord/email logs.
 * 2. NEVER dispatch without an HMAC SHA-256 signature. Receivers verify
 * with verifySignature + constantTimeEquals. The signing secret is
 * never written to logs (sanitizeWebhookSecretForLog masks it).
 * 3. NEVER retry on HTTP 4xx (except 408/425/429). 5xx + network errors
 * are retryable via DEFAULT_RETRY_POLICY.
 * 4. NEVER bypass LGPD Art. 7 consent; subscriptions created without
 * `consentCaptured: true` are rejected by subscribeWebhook with
 * PSW_007 (consent_missing).
 * 5. NEVER forget Art. 18: every webhook subscription has a per-channel
 * opt-out path. `recordLGPDDisable(id)` flips the storage flag;
 * `pruneDisabledSubscriptions` reaps them after a 30-day grace.
 * LGPD ANCHORS
 * Art.  7 — explicit consent for outbound notification; enforced via
 * `assertLGPDConsent(consent)` inside subscribeWebhook.
 * Art. 18 — right to disable / export / delete; surfaced through
 * `recordLGPDDisable`, `recordLGPDExportRequest`, and
 * `pruneDisabledSubscriptions`.
 * SIGNATURE SCHEME
 * HMAC-SHA-256 over the canonical body (UTF-8, LF-newlines, sorted
 * JSON when format == 'json'). Output is hex. Receivers compare with
 * constantTimeEquals to avoid timing oracles. The signature header is
 * `X-Webhook-Signature: sha256=<hex>`; the timestamp header is
 * `X-Webhook-Timestamp: <epoch-ms>` (anti-replay).
 * @module w51/prayer-submission-webhook
 */

// ═════════════════════════════════════════════════════════════════════════════
// §1  MIRRORED w50 TYPES (composition types — kept local to avoid import)
// ═════════════════════════════════════════════════════════════════════════════
//
// We mirror — not import — the w50 contract so the module can type-check
// against origin/main's tsconfig (which does NOT yet ship w50 on its main
// branch). Any divergence will fail at compile time of the integration glue
// that eventually joins w50 + w51.

// Mirrored from w50 :: `Tradition`.
export type Tradition =
  | 'candomble'
  | 'ifa'
  | 'umbanda'
  | 'buddhism'
  | 'hinduism'
  | 'christianity'
  | 'islam'
  | 'judaism'
  | 'taoism'
  | 'indigenous_brazilian'
  | 'syncretic'
  | 'secular_mystical';

// Mirrored from w50 :: `LocaleId`.
export type LocaleId = 'pt-BR' | 'en-US' | 'es-ES';

// Mirrored from w50 :: `SacredSensitivityLevel`.
export type SacredSensitivityLevel = 1 | 2 | 3 | 4 | 5;

// Mirrored from w50 :: `CuratedAuthority`.
export type CuratedAuthority =
  | 'zelador_de_santo'
  | 'babalao'
  | 'mestre_cigano'
  | 'rabino'
  | 'imam'
  | 'monge_budista'
  | 'sacerdote_cristao'
  | 'leader_indigena'
  | 'curador_akashia'
  | 'community_vote';

// Mirrored from w50 :: `PrayerSubmissionStatus`.
export type PrayerSubmissionStatus =
  | 'draft'
  | 'submitted'
  | 'in_review'
  | 'needs_revision'
  | 'approved'
  | 'rejected'
  | 'withdrawn'
  | 'published'
  | 'retracted';

// ═════════════════════════════════════════════════════════════════════════════
// §2  WEBHOOK CHANNEL TYPES
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Supported webhook channels. Each maps to a dedicated `formatXxxMessage`
 * function. PagerDuty is treated as a special case of generic-webhook
 * with `severity` metadata; Telegram inherits the Slack mrkdwn dialect but
 * switches to HTML entities.
 */
export type WebhookChannel =
  | 'slack'
  | 'discord'
  | 'email'
  | 'generic-webhook'
  | 'pagerduty'
  | 'telegram';

// Canonical list — used in dashboards and select widgets.
export const ALL_WEBHOOK_CHANNELS: readonly WebhookChannel[] = [
  'slack',
  'discord',
  'email',
  'generic-webhook',
  'pagerduty',
  'telegram',
] as const;

// Convenience alias for the union.
export type WebhookChannelSet = typeof ALL_WEBHOOK_CHANNELS[number];

/**
 * Standard channel header keys we always emit. Receivers can rely on the
 * presence of these for routing, regardless of channel.
 */
export const WEBHOOK_HEADER_NAMES = {
  signature: 'X-Webhook-Signature',
  timestamp: 'X-Webhook-Timestamp',
  event: 'X-Webhook-Event',
  deliveryId: 'X-Webhook-Delivery-Id',
  attempt: 'X-Webhook-Attempt',
  policy: 'X-Webhook-Policy-Version',
  contentType: 'Content-Type',
} as const;

// Custom HTTP headers the receiver may want.
export type WebhookHeaders = Readonly<Record<string, string>>;

// ═════════════════════════════════════════════════════════════════════════════
// §3  WEBHOOK EVENT TYPE ENUM
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Mapped string union (acts as enum). Each event corresponds to a w50
 * state transition or to a cross-engine coordinator event:
 * submission_created                  ← submitForReview
 * submission_consent_captured         ← attachConsent
 * submission_in_review                ← assignReviewer (1st)
 * submission_authority_requested      ← requestRevision / escalate
 * submission_double_review_started    ← second reviewer assigned
 * submission_approved                 ← approveSubmission (Nth approval)
 * submission_rejected                 ← rejectSubmission
 * submission_archived                 ← soft-archive (outside w50 core)
 * sacred_text_reserved_slot_filled    ← slot.filled (forbidden body)
 */
export type WebhookEventType =
  | 'submission_created'
  | 'submission_consent_captured'
  | 'submission_in_review'
  | 'submission_authority_requested'
  | 'submission_double_review_started'
  | 'submission_approved'
  | 'submission_rejected'
  | 'submission_archived'
  | 'sacred_text_reserved_slot_filled';

// All event types, ordered.
export const ALL_EVENT_TYPES: readonly WebhookEventType[] = [
  'submission_created',
  'submission_consent_captured',
  'submission_in_review',
  'submission_authority_requested',
  'submission_double_review_started',
  'submission_approved',
  'submission_rejected',
  'submission_archived',
  'sacred_text_reserved_slot_filled',
] as const;

/**
 * Subset of events that MUST be routed with extra-care:
 * - body / title are redacted from payload
 * - receiver must consent to "sacred notifications" path
 */
export const SACRED_TEXT_EVENT_TYPES = new Set<WebhookEventType>([
  'sacred_text_reserved_slot_filled',
]);

// Default locale for templates + log messages (Brazilian audience first).
export const DEFAULT_AGENT_LOCALE: LocaleId = 'pt-BR';

// ═════════════════════════════════════════════════════════════════════════════
// §4  WEBHOOK EVENT (SUBSCRIPTION) TYPE
// ═════════════════════════════════════════════════════════════════════════════

/**
 * A single subscriber to one event type on one channel. Created via
 * `subscribeWebhook`; removed via `unsubscribeWebhook`. Immutable from
 * the subscriber's perspective — to "modify" a webhook, unsubscribe + add
 * a new one with the new shape, so the audit trail is clean.
 */
export interface WebhookEvent {
  readonly id: string;
  readonly channel: WebhookChannel;
  /** Receivere URL (HTTPS recommended). */
  readonly url: string;
  /** HMAC signing secret. NEVER logged in cleartext. */
  readonly secret: string;
  readonly enabled: boolean;
  /** Per-subscription override headers (e.g. Slack channel override). */
  readonly headers?: WebhookHeaders;
  /** Per-subscription retry policy override. */
  readonly retryPolicy?: WebhookRetryPolicy;
  /** Event types this subscription cares about. Empty = subscribe to all. */
  readonly eventTypes: readonly WebhookEventType[];
  /** Free-text label for dashboards. */
  readonly label: string;
  /** Owner (typically the team channel). */
  readonly owner: string;
  /** LGPD Art. 7 consent marker — captured at subscription time. */
  readonly consentCaptured: boolean;
  /** LGPD Art. 18 disable flag — flips true after `recordLGPDDisable`. */
  readonly disabled: boolean;
  /** Created at (epoch ms). */
  readonly createdAt: number;
  /** Last delivery attempt (epoch ms) — useful for backlog displays. */
  readonly lastDispatchedAt?: number;
}

// * Subscription filter — convenience type for queries like "list Slack webhooks for `submission_approved`". /
export interface WebhookSubscriptionFilter {
  readonly channel?: WebhookChannel;
  readonly eventType?: WebhookEventType;
  readonly enabledOnly?: boolean;
  readonly owner?: string;
}

// ═════════════════════════════════════════════════════════════════════════════
// §5  WEBHOOK PAYLOAD TYPE
// ═════════════════════════════════════════════════════════════════════════════

/**
 * The structured payload emitted for every state transition. Receivers are
 * expected to verify `signature` against the canonical JSON body and the
 * per-subscription `secret` before acting.
 * FIELDS
 * submissionId       — opaque w50 id (no PII).
 * tradition          — mirrored from w50; receivers use this for routing.
 * sensitivity        — mirrored from w50; receivers may opt to filter
 * out notifications at sensitivity >= 4.
 * locale             — mirrored from w50; the originating locale.
 * status             — current status after the transition (target state).
 * occurredAt         — epoch ms when the transition was emitted.
 * hash               — sha-256 of the canonical payload (no signature,
 * no secret) for cross-engine deduplication.
 * signature          — sha256=<hex> HMAC over the canonical body.
 * authority          — mirrored from w50; useful for review queues.
 * reservedSlotId     — only set for `sacred_text_reserved_slot_filled`;
 * NEVER combined with body/title.
 * SACRED-TEXT POLICY
 * For SACRED_TEXT_EVENT_TYPES, only the 4 ID-style fields are populated:
 * submissionId, tradition, sensitivity, locale.
 * The engine's `redactSacredTextPayload` enforces this; the formats
 * also branch off `isSacredTextEvent` so the wire body never carries
 * sensitive content even if a buggy caller skips the redaction path.
 */
export interface WebhookPayload {
  readonly event: WebhookEventType;
  readonly submissionId: string;
  readonly tradition: Tradition;
  readonly sensitivity: SacredSensitivityLevel;
  readonly locale: LocaleId;
  readonly status: PrayerSubmissionStatus;
  readonly occurredAt: number;
  readonly hash: string;
  readonly signature: WebhookSignature;
  readonly authority?: CuratedAuthority;
  readonly reservedSlotId?: string;
  /** Title is intentionally ABSENT for sacred events. */
  readonly title?: string;
  /** Body is intentionally ABSENT for sacred events. */
  readonly body?: string;
  /** Reviewer id (approval/rejection only). */
  readonly reviewerId?: string;
  /** Optional human note from the transition. */
  readonly note?: string;
}

/**
 * String literal `"sha256=<hex>"` shape — keeps the signature contract
 * symmetric between sender and receiver (header and embedded).
 */
export type WebhookSignature = `sha256=${string}`;

// ═════════════════════════════════════════════════════════════════════════════
// §6  WEBHOOK DELIVERY TYPE
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Delivery lifecycle states.
 * pending    — queued, not yet dispatched.
 * retrying   — attempted, scheduled for retry (see nextRetryAt).
 * delivered  — terminal success.
 * failed     — terminal failure (retry_exhausted OR non-retryable).
 * expired    — purged via expireStaleDeliveries (TTL breach).
 */
export type WebhookDeliveryStatus =
  | 'pending'
  | 'delivered'
  | 'failed'
  | 'retrying'
  | 'expired';

/**
 * Snapshot of one delivery attempt set. The store may keep one row per
 * (webhookId, transition), updated in place rather than appended, so
 * `processDeliveryQueue` can find them with a single index scan.
 */
export interface WebhookDelivery {
  readonly id: string;
  readonly webhookId: string;
  readonly channel: WebhookChannel;
  readonly payload: WebhookPayload;
  readonly status: WebhookDeliveryStatus;
  readonly attempt: number;
  readonly maxAttempts: number;
  readonly nextRetryAt: number | null;
  /** Last HTTP response metadata (if any). */
  readonly lastResponse: WebhookResponseSummary | null;
  /** Last error message (if any). */
  readonly lastError: string | null;
  readonly firstDispatchedAt: number;
  readonly lastUpdatedAt: number;
  /** TTL breach epoch (set on queueing; used by expireStaleDeliveries). */
  readonly expiresAt: number;
  /** Audit chain — append-only. */
  readonly auditTrail: readonly WebhookAuditEntry[];
}

/**
 * Trimmed HTTP response metadata. We never store full bodies (PII risk +
 * storage bloat); only the bits a debugger needs.
 */
export interface WebhookResponseSummary {
  readonly httpStatus: number;
  readonly durationMs: number;
  readonly bodyExcerpt: string;
  readonly responseHeaders: WebhookHeaders;
  readonly receivedAt: number;
}

// Append-only audit entry; one per dispatcher action.
export interface WebhookAuditEntry {
  readonly action: WebhookAuditAction;
  readonly timestamp: number;
  readonly actor: string;
  readonly metadata: Readonly<Record<string, string | number | boolean>>;
}

// Audit actions — every state-modifying call appends one.
export type WebhookAuditAction =
  | 'queued'
  | 'dispatched'
  | 'delivered'
  | 'retry_scheduled'
  | 'retry_exhausted'
  | 'failed'
  | 'expired'
  | 'signed'
  | 'verified'
  | 'consent_asserted'
  | 'consent_missing'
  | 'lgpd_disabled'
  | 'lgpd_export_requested'
  | 'redacted_sacred'
  | 'template_resolved';

// ═════════════════════════════════════════════════════════════════════════════
// §7  WEBHOOK RETRY POLICY (3 presets)
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Exponential-backoff retry schedule. `backoffMs[i]` is the delay between
 * attempt `i+1` and attempt `i+2`, indexed from the first retry. `jitter`
 * adds multiplicative randomness in `[0, jitter)` (factor between 0 and 1).
 * `retryOn` lists the HTTP status codes that trigger another attempt.
 */
export interface WebhookRetryPolicy {
  readonly maxAttempts: number;
  readonly backoffMs: readonly number[];
  readonly jitter: number;
  readonly retryOn: readonly number[];
  /** Hard TTL (epoch-ms span) before a pending/retrying delivery is expired. */
  readonly maxAgeMs: number;
}

/** Backward-compat alias for code that imports the strict 5-tuple type. */
export type BackoffTuple = readonly [number, number, number, number, number];

// Default — production preset. Mirrors industry default for outbound webhooks.
export const DEFAULT_RETRY_POLICY: WebhookRetryPolicy = {
  maxAttempts: 5,
  backoffMs: [1000, 5000, 30000, 120000, 600000],
  jitter: 0.2,
  retryOn: [408, 425, 429, 500, 502, 503, 504],
  maxAgeMs: 7 * 24 * 60 * 60 * 1000, // 7 days
} as const;

// Strict — for the sacred text slot webhook (must not lose events).
export const STRICT_RETRY_POLICY: WebhookRetryPolicy = {
  maxAttempts: 8,
  backoffMs: [2000, 8000, 30000, 120000, 600000, 1_800_000, 3_600_000, 7_200_000],
  jitter: 0.15,
  retryOn: [408, 425, 429, 500, 502, 503, 504],
  maxAgeMs: 14 * 24 * 60 * 60 * 1000, // 14 days
} as const;

// Lenient — for advisory/non-critical channels (Discord bot, etc).
export const LENIENT_RETRY_POLICY: WebhookRetryPolicy = {
  maxAttempts: 3,
  backoffMs: [2000, 20000, 180000],
  jitter: 0.4,
  retryOn: [408, 429, 500, 502, 503, 504],
  maxAgeMs: 3 * 24 * 60 * 60 * 1000, // 3 days
} as const;

// Lookup helper for the 3 presets.
export const WEBHOOK_RETRY_POLICY_PRESETS: Readonly<
  Record<'default' | 'strict' | 'lenient', WebhookRetryPolicy>
> = {
  default: DEFAULT_RETRY_POLICY,
  strict: STRICT_RETRY_POLICY,
  lenient: LENIENT_RETRY_POLICY,
} as const;

/**
 * Suggested retry policy per channel — callers may override per webhook.
 * - pagerduty   — strictest (alert must never vanish silently)
 * - slack       — default (most receivers tolerate)
 * - discord     — lenient (best-effort bot delivery)
 * - email       — default (inbox providers retry on 4xx)
 * - telegram    — default (Telegram itself rate-limits)
 * - generic     — default (most spec-compliant receivers)
 */
export const DEFAULT_RETRY_POLICY_BY_CHANNEL: Readonly<
  Record<WebhookChannel, WebhookRetryPolicy>
> = {
  pagerduty: STRICT_RETRY_POLICY,
  slack: DEFAULT_RETRY_POLICY,
  discord: LENIENT_RETRY_POLICY,
  email: DEFAULT_RETRY_POLICY,
  telegram: DEFAULT_RETRY_POLICY,
  'generic-webhook': DEFAULT_RETRY_POLICY,
} as const;

// ═════════════════════════════════════════════════════════════════════════════
// §8  STATE TRANSITION GRAPH (w50 hook surface)
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Tuple-shaped transition: `[from, to]`. Mirrors w50's
 * `illegalSubmissionTransition` graph so we can attach a webhook event
 * to each legal transition.
 */
export type PrayerSubmissionStateTransition = readonly [
  PrayerSubmissionStatus,
  PrayerSubmissionStatus,
];

/**
 * Map every transition → emitted webhook event. The orchestrator reads
 * this to decide whether `notifyStateChange` should enqueue anything.
 */
export const STATE_MACHINE_TRANSITION_TO_EVENT: Readonly<
  Record<string, WebhookEventType>
> = {
  'draft->submitted': 'submission_created',
  'draft->submitted(review)': 'submission_in_review',
  'submitted->in_review': 'submission_in_review',
  'in_review->approved': 'submission_approved',
  'submitted->approved': 'submission_approved',
  'in_review->needs_revision': 'submission_authority_requested',
  'needs_revision->in_review': 'submission_in_review',
  'in_review->rejected': 'submission_rejected',
  'submitted->rejected': 'submission_rejected',
  'draft->withdrawn': 'submission_archived',
  'submitted->withdrawn': 'submission_archived',
  'needs_revision->withdrawn': 'submission_archived',
  'approved->published': 'submission_approved',
  'published->retracted': 'submission_archived',
  // sacral slot pipeline (separate from status, but exposed here)
  'slot->reserved_slot_filled': 'sacred_text_reserved_slot_filled',
} as const;

// Direct map from a single status to canonical webhook event.
export const STATUS_TO_WEBHOOK_EVENT: Readonly<
  Record<PrayerSubmissionStatus, WebhookEventType>
> = {
  draft: 'submission_created',
  submitted: 'submission_created',
  in_review: 'submission_in_review',
  needs_revision: 'submission_authority_requested',
  approved: 'submission_approved',
  rejected: 'submission_rejected',
  withdrawn: 'submission_archived',
  published: 'submission_approved',
  retracted: 'submission_archived',
} as const;

// ═════════════════════════════════════════════════════════════════════════════
// §9  ROUTING RULES (per-channel pubsub)
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Optional runtime rule that limits which subscriptions a given event
 * actually fires. Subscriptions with no matching rule still get the
 * default behavior (send if enabled + consent captured).
 */
export interface WebhookRoutingRule {
  readonly id: string;
  readonly name: string;
  readonly eventType: WebhookEventType;
  readonly traditions?: readonly Tradition[];
  readonly minSensitivity?: SacredSensitivityLevel;
  readonly maxSensitivity?: SacredSensitivityLevel;
  readonly authorities?: readonly CuratedAuthority[];
  readonly requireDoubleReview?: boolean;
}

// Engine-default routing rules. Conservative: sacred slots fan out to all.
export const DEFAULT_ROUTING_RULES: readonly WebhookRoutingRule[] = [
  {
    id: 'rule.review-queue.slack',
    name: 'Slack review queue for everything except sacred slot fills',
    eventType: 'submission_in_review',
    minSensitivity: 1,
    maxSensitivity: 5,
  },
  {
    id: 'rule.double-review.slack',
    name: 'Slack alert when double review is started',
    eventType: 'submission_double_review_started',
  },
  {
    id: 'rule.sacred-slot.email',
    name: 'Email + Slack fanout for sacred text slot fills',
    eventType: 'sacred_text_reserved_slot_filled',
    minSensitivity: 4,
    maxSensitivity: 5,
  },
  {
    id: 'rule.approval.pagerduty',
    name: 'PagerDuty when high-sensitivity submission is approved',
    eventType: 'submission_approved',
    minSensitivity: 4,
    maxSensitivity: 5,
  },
  {
    id: 'rule.rejection.telegram',
    name: 'Telegram alert for rejections',
    eventType: 'submission_rejected',
  },
] as const;

// ═════════════════════════════════════════════════════════════════════════════
// §10 TYPED ERRORS (PSW_001..PSW_008)
// ═════════════════════════════════════════════════════════════════════════════

// Base class — all webhook-engine errors extend this. PSW = Prayer Submission Webhook.
export class PrayerSubmissionWebhookError extends Error {
  public readonly code: string;
  public readonly context: Readonly<Record<string, unknown>>;

  public constructor(
    code: string,
    message: string,
    context: Readonly<Record<string, unknown>> = {},
  ) {
    super(message);
    this.name = 'PrayerSubmissionWebhookError';
    this.code = code;
    this.context = context;
  }
}

// PSW_001 — webhook id is unknown to the in-memory store.
export class WebhookNotFoundError extends PrayerSubmissionWebhookError {
  public constructor(webhookId: string) {
    super(
      'PSW_001',
      `Webhook "${webhookId}" was not found in the subscription store.`,
      { webhookId },
    );
    this.name = 'WebhookNotFoundError';
  }
}

// PSW_002 — channel unsupported by a registered format adapter.
export class ChannelUnsupportedError extends PrayerSubmissionWebhookError {
  public constructor(channel: string) {
    super(
      'PSW_002',
      `Channel "${channel}" is not supported by this engine build.`,
      { channel },
    );
    this.name = 'ChannelUnsupportedError';
  }
}

// PSW_003 — signature mismatch during verifySignature.
export class WebhookSignatureInvalidError extends PrayerSubmissionWebhookError {
  public constructor(
    expectedPrefix: string,
    received: string,
    bodyExcerpt: string,
  ) {
    super(
      'PSW_003',
      `Webhook signature mismatch: expected prefix "${expectedPrefix}", received "${received}".`,
      { expectedPrefix, received, bodyExcerpt },
    );
    this.name = 'WebhookSignatureInvalidError';
  }
}

// PSW_004 — payload exceeds MAX_PAYLOAD_BYTES.
export class WebhookPayloadTooLargeError extends PrayerSubmissionWebhookError {
  public constructor(actualBytes: number, maxBytes: number) {
    super(
      'PSW_004',
      `Webhook payload is ${actualBytes} bytes; the limit is ${maxBytes} bytes.`,
      { actualBytes, maxBytes },
    );
    this.name = 'WebhookPayloadTooLargeError';
  }
}

// PSW_005 — delivery reported failure (HTTP or transport).
export class WebhookDeliveryFailedError extends PrayerSubmissionWebhookError {
  public constructor(deliveryId: string, httpStatus: number, message: string) {
    super(
      'PSW_005',
      `Webhook delivery "${deliveryId}" failed with HTTP ${httpStatus}: ${message}.`,
      { deliveryId, httpStatus, message },
    );
    this.name = 'WebhookDeliveryFailedError';
  }
}

// PSW_006 — retry budget exhausted; delivery marked failed permanently.
export class WebhookRetryExhaustedError extends PrayerSubmissionWebhookError {
  public constructor(deliveryId: string, attempts: number) {
    super(
      'PSW_006',
      `Webhook delivery "${deliveryId}" exhausted its retry budget after ${attempts} attempts.`,
      { deliveryId, attempts },
    );
    this.name = 'WebhookRetryExhaustedError';
  }
}

// PSW_007 — subscription created without LGPD Art. 7 consent.
export class WebhookConsentMissingError extends PrayerSubmissionWebhookError {
  public constructor(webhookId: string, owner: string) {
    super(
      'PSW_007',
      `Webhook "${webhookId}" for owner "${owner}" was created without LGPD Art. 7 consent — rejected.`,
      { webhookId, owner },
    );
    this.name = 'WebhookConsentMissingError';
  }
}

// PSW_008 — sacred-text rule tripped (body present in a sacred event).
export class SacredTextWebhookBlockedError extends PrayerSubmissionWebhookError {
  public constructor(event: WebhookEventType, leakedField: string) {
    super(
      'PSW_008',
      `Webhook for "${event}" attempted to leak the sacred field "${leakedField}". Blocked.`,
      { event, leakedField },
    );
    this.name = 'SacredTextWebhookBlockedError';
  }
}

// §11 CONSTANTS — sizing, limits, defaults
export const MIN_WEBHOOK_SECRET_BYTES = 16;

// Maximum wire payload size (Slack-compatible).
export const MAX_PAYLOAD_BYTES = 200_000;

// Slack message ceiling.
export const SLACK_TEXT_LIMIT = 40_000;

// Slack block kit block count.
export const SLACK_BLOCK_LIMIT = 50;

// Discord message ceiling.
export const DISCORD_TEXT_LIMIT = 2000;

// Discord embed field count.
export const DISCORD_EMBED_FIELD_LIMIT = 25;

// Telegram message ceiling (HTML parse mode).
export const TELEGRAM_TEXT_LIMIT = 4096;

// RFC 5322 line ceiling for body content (chars per line).
export const EMAIL_LINE_LIMIT = 998;

// RFC 5322 total body ceiling (~10 MB is the spec floor; we cap at 1 MB).
export const EMAIL_BODY_LIMIT = 1_000_000;

// Version of the engine + wire format. Bump on incompatible change.
export const W51_POLICY_VERSION = '1.0.0';

/**
 * Sent in every payload as `hash`. Prefix `w51-prayer-sha256:` is human-
 * readable in logs but is NOT a signature; receivers must verify
 * `signature` against the canonical body, not `hash`.
 */
export const PAYLOAD_HASH_PREFIX = 'w51-prayer-sha256';

// Hard upper bound on retries we will read from a policy.
export const MAX_RETRY_BACKOFF_INDEX = 7;

// Hard-coded agent id for the orchestrator-issued calls.
export const DEFAULT_AGENT_ID = 'w51-webhook-engine';

// Default from address for email channel.
export const EMAIL_FROM_DEFAULT = 'no-reply@cabala-dos-caminhos.local';

// Maximum queue batch size for `processDeliveryQueue`.
export const WEBHOOK_QUEUE_BATCH_SIZE = 50;

// Channel-health-check cadence (used by future cron, not by this engine).
export const CHANNEL_HEALTH_CHECK_INTERVAL_MS = 24 * 60 * 60 * 1000;

// Signature header — also encoded in WebhookSignature literal type.
export const SIGNATURE_HEADER = WEBHOOK_HEADER_NAMES.signature;

// LGPD consent marker key (used in WebhookEvent.consentCaptured).
export const LGPD_CONSENT_KEY = 'consent.lgpd.art7';

// LGPD disable-delay grace days.
export const LGPD_DISABLE_GRACE_DAYS = 30;

// Slack username for system messages.
export const SLACK_USERNAME = 'Cabala dos Caminhos';

// Discord username for bot messages.
export const DISCORD_USERNAME = 'Akasha Bot';

// Telegram bot display name.
export const TELEGRAM_BOT_NAME = 'AkashaBot';

// Default channel header prefix used by all channels.
export const CHANNEL_HEADER_PREFIX = 'X-Cabala-Webhook';

// PII fields that must NEVER appear in logs.
export const WEBHOOK_PII_FIELDS = new Set<string>([
  'secret',
  'authorization',
  'signature',
  'reviewerId',
  'submitterId',
  'emailTo',
  'telegramChatId',
]);

// Constants tuple — exported for callers that want immutable iteration.
export const WEBHOOK_CONSTANTS_TUPLE = {
  MAX_PAYLOAD_BYTES,
  SLACK_TEXT_LIMIT,
  DISCORD_TEXT_LIMIT,
  TELEGRAM_TEXT_LIMIT,
  EMAIL_LINE_LIMIT,
  EMAIL_BODY_LIMIT,
  MAX_RETRY_BACKOFF_INDEX,
  WEBHOOK_QUEUE_BATCH_SIZE,
  CHANNEL_HEALTH_CHECK_INTERVAL_MS,
  LGPD_DISABLE_GRACE_DAYS,
  DEFAULT_AGENT_LOCALE,
  MIN_WEBHOOK_SECRET_BYTES,
  W51_POLICY_VERSION,
} as const;

// §12 IN-MEMORY WEBHOOK STORE — swap for PrismaWebhookStore in prod
export interface WebhookStore {
  putWebhook(webhook: WebhookEvent): WebhookEvent;
  getWebhook(id: string): WebhookEvent | null;
  removeWebhook(id: string): WebhookEvent | null;
  listWebhooks(filter?: WebhookSubscriptionFilter): readonly WebhookEvent[];
  putDelivery(delivery: WebhookDelivery): WebhookDelivery;
  getDelivery(id: string): WebhookDelivery | null;
  listDeliveries(filter?: {
    readonly status?: WebhookDeliveryStatus;
    readonly webhookId?: string;
    readonly before?: number;
  }): readonly WebhookDelivery[];
  removeDelivery(id: string): WebhookDelivery | null;
  /** Optional — used by exportDeliveriesForAudit. */
  countDeliveries(): number;
}

/**
 * Default in-memory implementation. Single-process; not thread-safe. For
 * Vercel/Edge runtimes, use the future `PrismaWebhookStore`.
 */
export class InMemoryWebhookStore implements WebhookStore {
  private readonly webhooks: Map<string, WebhookEvent> = new Map();
  private readonly deliveries: Map<string, WebhookDelivery> = new Map();

  public putWebhook(webhook: WebhookEvent): WebhookEvent {
    this.webhooks.set(webhook.id, webhook);
    return webhook;
  }

  public getWebhook(id: string): WebhookEvent | null {
    return this.webhooks.get(id) ?? null;
  }

  public removeWebhook(id: string): WebhookEvent | null {
    const existing = this.webhooks.get(id);
    if (!existing) return null;
    this.webhooks.delete(id);
    return existing;
  }

  public listWebhooks(filter?: WebhookSubscriptionFilter): readonly WebhookEvent[] {
    const all = Array.from(this.webhooks.values());
    if (!filter) return all;
    return all.filter((w) => {
      if (filter.channel && w.channel !== filter.channel) return false;
      if (filter.enabledOnly && !w.enabled) return false;
      if (filter.owner && w.owner !== filter.owner) return false;
      if (
        filter.eventType &&
        w.eventTypes.length > 0 &&
        !w.eventTypes.includes(filter.eventType)
      ) {
        return false;
      }
      return true;
    });
  }

  public putDelivery(delivery: WebhookDelivery): WebhookDelivery {
    this.deliveries.set(delivery.id, delivery);
    return delivery;
  }

  public getDelivery(id: string): WebhookDelivery | null {
    return this.deliveries.get(id) ?? null;
  }

  public listDeliveries(filter?: {
    readonly status?: WebhookDeliveryStatus;
    readonly webhookId?: string;
    readonly before?: number;
  }): readonly WebhookDelivery[] {
    const all = Array.from(this.deliveries.values());
    if (!filter) return all;
    return all.filter((d) => {
      if (filter.status && d.status !== filter.status) return false;
      if (filter.webhookId && d.webhookId !== filter.webhookId) return false;
      if (filter.before && d.firstDispatchedAt >= filter.before) return false;
      return true;
    });
  }

  public removeDelivery(id: string): WebhookDelivery | null {
    const existing = this.deliveries.get(id);
    if (!existing) return null;
    this.deliveries.delete(id);
    return existing;
  }

  public countDeliveries(): number {
    return this.deliveries.size;
  }
}

// §13 HASHING + SIGNING PRIMITIVES — hand-rolled, zero external deps
// FIPS 180-4 SHA-256 + RFC 2104 HMAC; compact ~150L.

const SHA256_K: readonly number[] = [
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1,
  0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
  0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786,
  0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147,
  0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
  0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b,
  0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a,
  0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
  0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
];

// 32-bit right rotate.
function rotr(n: number, k: number): number {
  return ((n >>> k) | (n << (32 - k))) >>> 0;
}

// Encode a UTF-8 string to a Uint8Array.
function utf8Encode(input: string): Uint8Array {
  if (typeof TextEncoder !== 'undefined') {
    return new TextEncoder().encode(input);
  }
  // Node fallback (older runtimes): Buffer.from.
  const out: number[] = [];
  for (let i = 0; i < input.length; i++) {
    let c = input.charCodeAt(i);
    if (c < 0x80) {
      out.push(c);
    } else if (c < 0x800) {
      out.push(0xc0 | (c >> 6));
      out.push(0x80 | (c & 0x3f));
    } else if (c < 0xd800 || c >= 0xe000) {
      out.push(0xe0 | (c >> 12));
      out.push(0x80 | ((c >> 6) & 0x3f));
      out.push(0x80 | (c & 0x3f));
    } else {
      i++;
      const low = input.charCodeAt(i);
      c = 0x10000 + (((c & 0x3ff) << 10) | (low & 0x3ff));
      out.push(0xf0 | (c >> 18));
      out.push(0x80 | ((c >> 12) & 0x3f));
      out.push(0x80 | ((c >> 6) & 0x3f));
      out.push(0x80 | (c & 0x3f));
    }
  }
  return Uint8Array.from(out);
}

// * SHA-256 — returns a 32-byte Uint8Array. Pure-JS, follows FIPS 180-4 §6.2. Compact (~80 LOC). /
export function sha256Bytes(input: string | Uint8Array): Uint8Array {
  const bytes = typeof input === 'string' ? utf8Encode(input) : input;
  const len = bytes.length;
  // Pad: append 0x80 then zeros until length ≡ 56 (mod 64), then 8-byte big-endian length.
  const padded = new Uint8Array(((len + 9 + 63) >> 6) << 6);
  padded.set(bytes);
  padded[len] = 0x80;
  const bitLen = (len * 8) >>> 0;
  // BigInt path only used when bitLen > 2^32 — extremely long inputs (>500MB). We
  // use Number for the common case and switch to BigInt only when needed.
  if (bitLen <= 0xffffffff) {
    for (let i = 0; i < 8; i++) {
      padded[padded.length - 1 - i] = (bitLen >>> (i * 8)) & 0xff;
    }
  } else {
    const big = BigInt(len) * BigInt(8);
    for (let i = 0; i < 8; i++) {
      padded[padded.length - 1 - i] = Number((big >> BigInt(i * 8)) & BigInt(255));
    }
  }

  // Initial hash values (§5.3.3).
  let h0 = 0x6a09e667, h1 = 0xbb67ae85, h2 = 0x3c6ef372, h3 = 0xa54ff53a;
  let h4 = 0x510e527f, h5 = 0x9b05688c, h6 = 0x1f83d9ab, h7 = 0x5be0cd19;

  // Process each 512-bit block.
  for (let off = 0; off < padded.length; off += 64) {
    const w = new Uint32Array(64);
    for (let i = 0; i < 16; i++) {
      const j = off + i * 4;
      w[i] = ((padded[j] << 24) | (padded[j + 1] << 16) | (padded[j + 2] << 8) | padded[j + 3]) >>> 0;
    }
    for (let i = 16; i < 64; i++) {
      const s0 = rotr(w[i - 15], 7) ^ rotr(w[i - 15], 18) ^ (w[i - 15] >>> 3);
      const s1 = rotr(w[i - 2], 17) ^ rotr(w[i - 2], 19) ^ (w[i - 2] >>> 10);
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) >>> 0;
    }
    let a = h0, b = h1, c = h2, d = h3, e = h4, f = h5, g = h6, hh = h7;
    for (let i = 0; i < 64; i++) {
      const S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
      const ch = (e & f) ^ (~e & g);
      const t1 = (hh + S1 + ch + SHA256_K[i] + w[i]) >>> 0;
      const S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const t2 = (S0 + maj) >>> 0;
      hh = g; g = f; f = e; e = (d + t1) >>> 0;
      d = c; c = b; b = a; a = (t1 + t2) >>> 0;
    }
    h0 = (h0 + a) >>> 0;
    h1 = (h1 + b) >>> 0;
    h2 = (h2 + c) >>> 0;
    h3 = (h3 + d) >>> 0;
    h4 = (h4 + e) >>> 0;
    h5 = (h5 + f) >>> 0;
    h6 = (h6 + g) >>> 0;
    h7 = (h7 + hh) >>> 0;
  }

  const out = new Uint8Array(32);
  const vals = [h0, h1, h2, h3, h4, h5, h6, h7];
  for (let i = 0; i < 8; i++) {
    out[i * 4 + 0] = (vals[i] >>> 24) & 0xff;
    out[i * 4 + 1] = (vals[i] >>> 16) & 0xff;
    out[i * 4 + 2] = (vals[i] >>> 8) & 0xff;
    out[i * 4 + 3] = vals[i] & 0xff;
  }
  return out;
}

// Hex-lower encoding.
export function bytesToHex(bytes: Uint8Array): string {
  let s = '';
  for (let i = 0; i < bytes.length; i++) {
    s += (bytes[i] >>> 4).toString(16);
    s += (bytes[i] & 0x0f).toString(16);
  }
  return s;
}

// SHA-256 → hex string (the format used by `hash` in WebhookPayload).
export function sha256Hex(input: string | Uint8Array): string {
  return bytesToHex(sha256Bytes(input));
}

/**
 * HMAC-SHA-256 (RFC 2104). Returns 32-byte Uint8Array.
 * Inner-pad = bytes 0x36, outer-pad = bytes 0x5c; key is padded to 64 bytes
 * (we hash first if longer than the block size).
 */
export function hmacSha256Bytes(key: string | Uint8Array, message: string | Uint8Array): Uint8Array {
  const keyBytes = typeof key === 'string' ? utf8Encode(key) : key;
  let k = keyBytes;
  if (k.length > 64) k = sha256Bytes(k);
  const padded = new Uint8Array(64);
  padded.set(k);
  const inner = new Uint8Array(64);
  const outer = new Uint8Array(64);
  for (let i = 0; i < 64; i++) {
    inner[i] = padded[i] ^ 0x36;
    outer[i] = padded[i] ^ 0x5c;
  }
  const msgBytes = typeof message === 'string' ? utf8Encode(message) : message;
  const innerInput = new Uint8Array(64 + msgBytes.length);
  innerInput.set(inner, 0);
  innerInput.set(msgBytes, 64);
  const innerHash = sha256Bytes(innerInput);
  const outerInput = new Uint8Array(64 + innerHash.length);
  outerInput.set(outer, 0);
  outerInput.set(innerHash, 64);
  return sha256Bytes(outerInput);
}

// HMAC-SHA-256 → hex string. The shape used by `signature` in WebhookPayload.
export function hmacSha256Hex(key: string, message: string): string {
  return bytesToHex(hmacSha256Bytes(key, message));
}

// Hex → bytes (used by verifySignature to compare received).
function hexToBytes(hex: string): Uint8Array {
  if (hex.length % 2 !== 0) {
    throw new Error('hex string length must be even');
  }
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}

// * Constant-time equality on hex strings. Receivers MUST use this to avoid timing oracles on signature verification. /
export function constantTimeEqualsHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

// Constant-time equality on raw strings.
export function constantTimeEquals(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

// §14 SIGN / VERIFY — public surface
export function signPayload(secret: string, body: string): WebhookSignature {
  if (secret.length < MIN_WEBHOOK_SECRET_BYTES) {
    throw new Error(
      `Webhook secret is ${secret.length} chars; min ${MIN_WEBHOOK_SECRET_BYTES} required.`,
    );
  }
  const hex = hmacSha256Hex(secret, body);
  return `sha256=${hex}`;
}

/**
 * Verify an incoming signature. Returns true on match; throws
 * WebhookSignatureInvalidError on mismatch. Compares in constant time.
 */
export function verifySignature(
  secret: string,
  body: string,
  signature: string,
): boolean {
  if (typeof signature !== 'string' || !signature.startsWith('sha256=')) {
    throw new WebhookSignatureInvalidError('sha256=', String(signature), body.slice(0, 64));
  }
  const receivedHex = signature.slice('sha256='.length);
  const expectedHex = hmacSha256Hex(secret, body);
  const ok = constantTimeEqualsHex(receivedHex, expectedHex);
  if (!ok) {
    throw new WebhookSignatureInvalidError('sha256=', receivedHex, body.slice(0, 64));
  }
  return ok;
}

/**
 * Build the standard set of HTTP headers for a single dispatch. Receivers
 * can override per-subscription via `WebhookEvent.headers`.
 */
export function generateSignatureHeader(
  webhook: WebhookEvent,
  body: string,
  attempt: number,
  deliveryId: string,
): WebhookHeaders {
  const sig = signPayload(webhook.secret, body);
  return {
    [WEBHOOK_HEADER_NAMES.signature]: sig,
    [WEBHOOK_HEADER_NAMES.timestamp]: String(Date.now()),
    [WEBHOOK_HEADER_NAMES.event]: webhook.eventTypes.join(',') || '*',
    [WEBHOOK_HEADER_NAMES.deliveryId]: deliveryId,
    [WEBHOOK_HEADER_NAMES.attempt]: String(attempt),
    [WEBHOOK_HEADER_NAMES.policy]: W51_POLICY_VERSION,
  };
}

// Random webhook secret (hex-encoded 32 bytes).
export function generateWebhookSecret(): string {
  const bytes = new Uint8Array(32);
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }
  return bytesToHex(bytes);
}

/**
 * Produce the SHA-256 hash used in `WebhookPayload.hash` (NOT signature).
 * Always prefixed with `w51-prayer-sha256:` so receivers can distinguish
 * engine-internal hashes from signatures in logs.
 */
export function hashWebhookPayload(payload: WebhookPayload): string {
  // Strip signature so a re-derivation doesn't churn on the same logical payload.
  const canonical = canonicalJson(payload);
  return `${PAYLOAD_HASH_PREFIX}:${sha256Hex(canonical)}`;
}

// §15 CANONICAL JSON — deterministic key ordering for hashing + signing
export function canonicalJson(input: unknown): string {
  return JSON.stringify(sortKeysDeep(input));
}

// Recursively sort object keys (does NOT sort arrays).
function sortKeysDeep(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortKeysDeep);
  if (value && typeof value === 'object') {
    const sorted: Record<string, unknown> = {};
    const keys = Object.keys(value as Record<string, unknown>).sort();
    for (const k of keys) {
      sorted[k] = sortKeysDeep((value as Record<string, unknown>)[k]);
    }
    return sorted;
  }
  return value;
}

// §16 SACRED-TEXT REDACTION
export function redactSacredTextPayload(
  payload: WebhookPayload,
): WebhookPayload {
  if (!SACRED_TEXT_EVENT_TYPES.has(payload.event)) return payload;
  return {
    event: payload.event,
    submissionId: payload.submissionId,
    tradition: payload.tradition,
    sensitivity: payload.sensitivity,
    locale: payload.locale,
    status: payload.status,
    occurredAt: payload.occurredAt,
    hash: payload.hash,
    signature: payload.signature,
    reservedSlotId: payload.reservedSlotId,
  };
}

/**
 * Throw `SacredTextWebhookBlockedError` if a sacred event payload
 * somehow still has body / title. Defensive double-check before
 * `notifyStateChange` enqueues anything.
 */
export function assertSacredTextClean(payload: WebhookPayload): void {
  if (!SACRED_TEXT_EVENT_TYPES.has(payload.event)) return;
  if (payload.title !== undefined) {
    throw new SacredTextWebhookBlockedError(payload.event, 'title');
  }
  if (payload.body !== undefined) {
    throw new SacredTextWebhookBlockedError(payload.event, 'body');
  }
}

// Predicate: is this event subject to sacred-text redaction?
export function isSacredTextEvent(event: WebhookEventType): boolean {
  return SACRED_TEXT_EVENT_TYPES.has(event);
}

// §17 SUBSCRIPTION CRUD — public API
let subscriptionCounter = 0;
let deliveryCounter = 0;

// Mint a webhook subscription id.
export function deterministicWebhookId(seed?: number): string {
  const n = seed ?? ++subscriptionCounter;
  return `wh_${Date.now().toString(36)}_${n.toString(36)}`;
}

// Mint a delivery id.
export function deterministicDeliveryId(seed?: number): string {
  const n = seed ?? ++deliveryCounter;
  return `dlv_${Date.now().toString(36)}_${n.toString(36)}`;
}

/**
 * Convenience input shape for `subscribeWebhook` — hides the immutables
 * from the caller so the engine can compute `id`, `createdAt`, etc.
 */
export interface SubscribeWebhookInput {
  readonly channel: WebhookChannel;
  readonly url: string;
  readonly secret: string;
  readonly enabled?: boolean;
  readonly headers?: WebhookHeaders;
  readonly retryPolicy?: WebhookRetryPolicy;
  readonly eventTypes?: readonly WebhookEventType[];
  readonly label: string;
  readonly owner: string;
  /** LGPD Art. 7 — explicit consent captured by the calling UI. */
  readonly consentCaptured?: boolean;
}

/**
 * Add a new webhook subscription. Persists via the supplied store, or
 * the engine's default in-memory store when none is provided.
 */
export function subscribeWebhook(
  input: SubscribeWebhookInput,
  store: WebhookStore = defaultStore,
  now: number = Date.now(),
): WebhookEvent {
  // LGPD Art. 7 gate.
  assertLGPDConsent(input.consentCaptured, input.owner);
  // Channel sanity.
  if (!ALL_WEBHOOK_CHANNELS.includes(input.channel)) {
    throw new ChannelUnsupportedError(input.channel);
  }
  // Secret length gate.
  if (input.secret.length < MIN_WEBHOOK_SECRET_BYTES) {
    throw new Error(
      `Webhook secret must be at least ${MIN_WEBHOOK_SECRET_BYTES} chars.`,
    );
  }
  // URL sanity (very loose — protocol + host).
  if (!input.url || !/^https?:\/\//.test(input.url)) {
    throw new Error(`Webhook URL "${input.url}" is not a valid http(s) URL.`);
  }
  const id = deterministicWebhookId();
  const event: WebhookEvent = {
    id,
    channel: input.channel,
    url: input.url,
    secret: input.secret,
    enabled: input.enabled ?? true,
    headers: input.headers,
    retryPolicy: input.retryPolicy,
    eventTypes: input.eventTypes ?? ALL_EVENT_TYPES,
    label: input.label,
    owner: input.owner,
    consentCaptured: true, // re-asserted post-gate above
    disabled: false,
    createdAt: now,
  };
  const stored = store.putWebhook(event);
  appendAudit(stored, 'consent_asserted', input.owner, { id });
  return stored;
}

/**
 * Remove a webhook subscription. Records the unsubscribe in the audit
 * trail but, since `WebhookEvent` is immutable, the audit lives in the
 * delivery trail of the NEXT event emitted through the same subscription.
 */
export function unsubscribeWebhook(
  id: string,
  store: WebhookStore = defaultStore,
  actor: string = DEFAULT_AGENT_ID,
): WebhookEvent {
  const existing = store.getWebhook(id);
  if (!existing) throw new WebhookNotFoundError(id);
  store.removeWebhook(id);
  appendAudit(existing, 'queued', actor, { unsubscribed: true });
  return existing;
}

// * List all webhooks for a specific channel, optionally filtered by enabled state, owner, or subscribed event types. /
export function listWebhooksForChannel(
  channel: WebhookChannel,
  options?: { readonly enabledOnly?: boolean; readonly owner?: string },
  store: WebhookStore = defaultStore,
): readonly WebhookEvent[] {
  return store.listWebhooks({
    channel,
    enabledOnly: options?.enabledOnly ?? false,
    owner: options?.owner,
  });
}

// Generic list — kept separate so the API doesn't balloon.
export function listAllWebhooks(
  filter?: WebhookSubscriptionFilter,
  store: WebhookStore = defaultStore,
): readonly WebhookEvent[] {
  return filter ? store.listWebhooks(filter) : store.listWebhooks();
}

// Lookup one webhook by id.
export function getWebhook(id: string, store: WebhookStore = defaultStore): WebhookEvent | null {
  return store.getWebhook(id);
}

// Enable or disable a webhook (LGPD Art. 18 — soft disable).
export function setWebhookEnabled(
  id: string,
  enabled: boolean,
  store: WebhookStore = defaultStore,
): WebhookEvent {
  const existing = store.getWebhook(id);
  if (!existing) throw new WebhookNotFoundError(id);
  const updated: WebhookEvent = { ...existing, enabled };
  store.putWebhook(updated);
  return updated;
}

// §18 LGPD GATES — Art. 7 (consent) + Art. 18 (rights)
export interface LGPDConsentMarker {
  readonly userOrOwner: string;
  readonly capturedAt: number;
  readonly capturedBy: string;
  readonly consentText: string;
  readonly channel: WebhookChannel;
  readonly lgpdArticle: 7 | 18;
}

// Convenience to mint a marker.
export function buildLGPDConsentMarker(
  userOrOwner: string,
  consentText: string,
  channel: WebhookChannel,
  capturedBy: string = DEFAULT_AGENT_ID,
  capturedAt: number = Date.now(),
  lgpdArticle: 7 | 18 = 7,
): LGPDConsentMarker {
  return {
    userOrOwner,
    capturedAt,
    capturedBy,
    consentText,
    channel,
    lgpdArticle,
  };
}

// * Throws WebhookConsentMissingError if consent was not captured. Used by subscribeWebhook right before putWebhook. /
export function assertLGPDConsent(
  consentCaptured: boolean | undefined,
  owner: string,
): void {
  if (!consentCaptured) {
    throw new WebhookConsentMissingError('pending', owner);
  }
}

/**
 * LGPD Art. 18 — flip a webhook into the disabled state. Caller is
 * typically the UI when the owner opts out of notifications.
 */
export function recordLGPDDisable(
  id: string,
  store: WebhookStore = defaultStore,
  actor: string = DEFAULT_AGENT_ID,
): WebhookEvent {
  const existing = store.getWebhook(id);
  if (!existing) throw new WebhookNotFoundError(id);
  const disabled: WebhookEvent = { ...existing, disabled: true, enabled: false };
  store.putWebhook(disabled);
  appendAudit(disabled, 'lgpd_disabled', actor, { id, graceDays: LGPD_DISABLE_GRACE_DAYS });
  return disabled;
}

/**
 * LGPD Art. 18 — export demand. Caller invokes this when a user asks
 * for a copy of the data the engine holds about them. Returns a bundle
 * that's safe to ship to the user (no secrets).
 */
export function recordLGPDExportRequest(
  id: string,
  store: WebhookStore = defaultStore,
  actor: string = DEFAULT_AGENT_ID,
): {
  readonly webhookId: string;
  readonly deliveries: readonly WebhookDelivery[];
  readonly exportedAt: number;
} {
  const existing = store.getWebhook(id);
  if (!existing) throw new WebhookNotFoundError(id);
  const deliveries = store.listDeliveries({ webhookId: id });
  appendAudit(existing, 'lgpd_export_requested', actor, { id, deliveryCount: deliveries.length });
  return {
    webhookId: id,
    deliveries,
    exportedAt: Date.now(),
  };
}

// * Prune subscriptions that have been disabled for more than `LGPD_DISABLE_GRACE_DAYS`. Returns the count removed. /
export function pruneDisabledSubscriptions(
  store: WebhookStore = defaultStore,
  now: number = Date.now(),
): number {
  const graceMs = LGPD_DISABLE_GRACE_DAYS * 24 * 60 * 60 * 1000;
  const all = store.listWebhooks();
  let removed = 0;
  for (const w of all) {
    if (w.disabled && now - w.createdAt > graceMs) {
      store.removeWebhook(w.id);
      removed++;
    }
  }
  return removed;
}

// §19 NOTIFY STATE CHANGE — main entry-point for w50 integration
export interface WebhookSubmissionView {
  readonly id: string;
  readonly tradition: Tradition;
  readonly sensitivity: SacredSensitivityLevel;
  readonly locale: LocaleId;
  readonly authority: CuratedAuthority;
  readonly status: PrayerSubmissionStatus;
  readonly proposedTitle?: string;
  readonly proposedBody?: string;
  readonly reservedSlotId?: string;
  /** Optional reviewer (approval/rejection events). */
  readonly reviewerId?: string;
  /** Optional human note (revision request, withdrawal, etc). */
  readonly note?: string;
  readonly createdAt: number;
  readonly updatedAt: number;
}

// Result of `notifyStateChange`. Callers can log + reply.
export interface NotificationResult {
  readonly event: WebhookEventType;
  readonly enqueued: number;
  readonly skipped: number;
  readonly skippedReasons: readonly string[];
  readonly deliveries: readonly WebhookDelivery[];
  readonly dispatchedAt: number;
}

/**
 * Main public entry-point. The w50 module calls this whenever a state
 * transition happens. The engine resolves the canonical WebhookEventType
 * for the transition, builds the WebhookPayload (redacting sacred-text
 * fields), walks the subscription store to find eligible subscribers,
 * builds per-channel deliveries and enqueues them, then returns a
 * NotificationResult for audit / dashboard.
 */
export function notifyStateChange(submission: WebhookSubmissionView, fromState: PrayerSubmissionStatus, toState: PrayerSubmissionStatus, store: WebhookStore = defaultStore, now: number = Date.now(), options?: { readonly forceEvent?: WebhookEventType; readonly includeSacredText?: boolean }): NotificationResult {
  // 1. Resolve event type.
  const event = options?.forceEvent ?? getTransitionEvent(fromState, toState);
  if (!event) {
    return { event: 'submission_created', enqueued: 0, skipped: 0, skippedReasons: [`no event mapped for transition ${fromState}->${toState}`], deliveries: [], dispatchedAt: now };
  }
  // 2. Build the base payload.
  const body: WebhookPayload = {
    event,
    submissionId: submission.id,
    tradition: submission.tradition,
    sensitivity: submission.sensitivity,
    locale: submission.locale,
    status: toState,
    occurredAt: now,
    hash: '',
    signature: 'sha256=',
    authority: submission.authority,
    reservedSlotId: submission.reservedSlotId,
    title: submission.proposedTitle,
    body: submission.proposedBody,
    reviewerId: submission.reviewerId,
    note: submission.note,
  };
  // 3. Sacred-text guard: strip body/title unless caller overrides.
  const redacted = options?.includeSacredText ? body : redactSacredTextPayload(body);
  assertSacredTextClean(redacted);
  // 4. Find eligible subscribers and enqueue.
  const eligible = findEligibleSubscriptions(redacted.event, submission, store);
  const skippedReasons: string[] = [];
  const deliveries: WebhookDelivery[] = [];
  let enqueued = 0;
  for (const subscriber of eligible) {
    if (!subscriber.enabled || subscriber.disabled) { skippedReasons.push(`webhook:${subscriber.id}:disabled`); continue; }
    if (!subscriber.consentCaptured) { skippedReasons.push(`webhook:${subscriber.id}:consent_missing`); continue; }
    deliveries.push(enqueueDelivery(subscriber, redacted, store, now));
    enqueued++;
  }
  return { event: redacted.event, enqueued, skipped: skippedReasons.length, skippedReasons, deliveries, dispatchedAt: now };
}

/**
 * Map a `[from, to]` state transition to its canonical webhook event.
 * Returns `null` if the transition is unknown.
 */
export function getTransitionEvent(from: PrayerSubmissionStatus, to: PrayerSubmissionStatus): WebhookEventType | null {
  const key = `${from}->${to}`;
  if (key in STATE_MACHINE_TRANSITION_TO_EVENT) return STATE_MACHINE_TRANSITION_TO_EVENT[key];
  if (to in STATUS_TO_WEBHOOK_EVENT) return STATUS_TO_WEBHOOK_EVENT[to];
  return null;
}

/**
 * Mirrors w50's `illegalSubmissionTransition` graph so callers can
 * surface errors earlier than waiting for `notifyStateChange` to drop.
 */
const LEGAL_TRANSITIONS: Readonly<Record<PrayerSubmissionStatus, readonly PrayerSubmissionStatus[]>> = {
  draft: ['submitted', 'withdrawn'],
  submitted: ['in_review', 'rejected', 'withdrawn', 'approved'],
  in_review: ['needs_revision', 'approved', 'rejected'],
  needs_revision: ['in_review', 'withdrawn'],
  approved: ['published', 'retracted'],
  rejected: ['withdrawn'],
  withdrawn: [],
  published: ['retracted'],
  retracted: [],
};

export function canTransition(from: PrayerSubmissionStatus, to: PrayerSubmissionStatus): boolean {
  return (LEGAL_TRANSITIONS[from] ?? []).includes(to);
}

/**
 * Find every subscription that cares about this event. Respects enabled
 * flag, consent, subscribed eventTypes, and sensitivity gate.
 */
export function findEligibleSubscriptions(event: WebhookEventType, submission: WebhookSubmissionView, store: WebhookStore = defaultStore): readonly WebhookEvent[] {
  const candidates = store.listWebhooks({ eventType: event }).filter((w) => w.enabled && !w.disabled);
  return candidates.filter((w) => {
    if (!w.consentCaptured) return false;
    if (w.eventTypes.length > 0 && !w.eventTypes.includes(event)) return false;
    if (shouldNotifyForSensitivity(event, submission.sensitivity)) return true;
    return matchesRoutingRule(w, event, submission);
  });
}

/**
 * Sacred events always pass; ordinary events pass when sensitivity is in
 * band (min <= sens <= max).
 */
export function shouldNotifyForSensitivity(event: WebhookEventType, sensitivity: SacredSensitivityLevel, rule?: WebhookRoutingRule): boolean {
  if (isSacredTextEvent(event) || !rule) return true;
  if (rule.minSensitivity !== undefined && sensitivity < rule.minSensitivity) return false;
  if (rule.maxSensitivity !== undefined && sensitivity > rule.maxSensitivity) return false;
  return true;
}

/** True if `webhook` matches the rule's authority / tradition gating. */
export function matchesRoutingRule(webhook: WebhookEvent, event: WebhookEventType, submission: WebhookSubmissionView): boolean {
  const rules = DEFAULT_ROUTING_RULES.filter((r) => r.eventType === event);
  if (rules.length === 0) return true;
  return rules.some((rule) => {
    if (rule.traditions && !rule.traditions.includes(submission.tradition)) return false;
    if (rule.authorities && !rule.authorities.includes(submission.authority)) return false;
    if (rule.minSensitivity !== undefined && submission.sensitivity < rule.minSensitivity) return false;
    if (rule.maxSensitivity !== undefined && submission.sensitivity > rule.maxSensitivity) return false;
    return true;
  });
}

/** Build the routing matrix table used by the admin cockpit. */
export function buildRoutingRulesTable(): readonly WebhookRoutingRule[] {
  return DEFAULT_ROUTING_RULES;
}

// §20 ENQUEUE DELIVERY — private helper, exported for tests
export function enqueueDelivery(
  subscriber: WebhookEvent,
  payload: WebhookPayload,
  store: WebhookStore = defaultStore,
  now: number = Date.now(),
): WebhookDelivery {
  const policy = subscriber.retryPolicy
    ?? DEFAULT_RETRY_POLICY_BY_CHANNEL[subscriber.channel];
  const canonical = canonicalJson(payload);
  const signature = signPayload(subscriber.secret, canonical);
  const signed: WebhookPayload = {
    ...payload,
    hash: hashWebhookPayload({ ...payload, signature }),
    signature,
  };
  const delivery: WebhookDelivery = {
    id: deterministicDeliveryId(),
    webhookId: subscriber.id,
    channel: subscriber.channel,
    payload: signed,
    status: 'pending',
    attempt: 0,
    maxAttempts: policy.maxAttempts,
    nextRetryAt: now,
    lastResponse: null,
    lastError: null,
    firstDispatchedAt: now,
    lastUpdatedAt: now,
    expiresAt: now + policy.maxAgeMs,
    auditTrail: [
      {
        action: 'queued',
        timestamp: now,
        actor: DEFAULT_AGENT_ID,
        metadata: {
          webhookId: subscriber.id,
          channel: subscriber.channel,
          event: signed.event,
        },
      },
      {
        action: 'signed',
        timestamp: now,
        actor: DEFAULT_AGENT_ID,
        metadata: {
          algorithm: 'hmac-sha256',
          policyVersion: W51_POLICY_VERSION,
        },
      },
    ],
  };
  store.putDelivery(delivery);
  return delivery;
}

// §21 DISPATCH TO CHANNEL — formats + enqueues
export interface WebhookFormatAdapter {
  readonly channel: WebhookChannel;
  formatBody(payload: WebhookPayload): string;
  formatHeaders(
    webhook: WebhookEvent,
    payload: WebhookPayload,
    delivery: WebhookDelivery,
  ): WebhookHeaders;
  /** Max body size in bytes (used by assertPayloadSize). */
  readonly maxBodyBytes: number;
}

// * Generic adapter — used as the fallback for `generic-webhook` and as the base shape every concrete adapter extends. /
export const GENERIC_WEBHOOK_ADAPTER: WebhookFormatAdapter = {
  channel: 'generic-webhook',
  formatBody: (payload) => canonicalJson(payload),
  formatHeaders: (webhook, _payload, delivery) =>
    generateSignatureHeader(webhook, canonicalJson(_payload), delivery.attempt, delivery.id),
  maxBodyBytes: MAX_PAYLOAD_BYTES,
} as const;

// §22 FORMAT FUNCTIONS — Slack, Discord, Email, Generic, Telegram, PagerDuty
export interface ChannelTemplate {
  readonly channel: WebhookChannel;
  readonly event: WebhookEventType;
  readonly subject: string;
  readonly summary: string;
  readonly emoji: string;
  readonly colorHint: 'good' | 'warning' | 'danger' | 'neutral';
}

export const EVENT_SUBJECTS: Readonly<Record<WebhookEventType, string>> = {
  submission_created: 'Nova submissão na fila',
  submission_consent_captured: 'Consentimento LGPD registrado',
  submission_in_review: 'Revisão iniciada',
  submission_authority_requested: 'Escalonamento solicitado',
  submission_double_review_started: 'Dupla revisão em curso',
  submission_approved: 'Submissão aprovada',
  submission_rejected: 'Submissão rejeitada',
  submission_archived: 'Submissão arquivada',
  sacred_text_reserved_slot_filled: 'Slot sagrado preenchido',
};

export const EVENT_SUMMARIES: Readonly<Record<WebhookEventType, string>> = {
  submission_created: 'Pedido entrou na fila de revisão.',
  submission_consent_captured: 'Consentimento LGPD Art. 7 registrado.',
  submission_in_review: 'Revisão iniciada por curador responsável.',
  submission_authority_requested: 'Autoridade foi solicitada para escalonamento.',
  submission_double_review_started: 'Segunda revisão iniciada (sensibilidade ≥4).',
  submission_approved: 'Submissão aprovada — aguardando publicação.',
  submission_rejected: 'Submissão rejeitada por decisão da curadoria.',
  submission_archived: 'Submissão arquivada (retração / retirada).',
  sacred_text_reserved_slot_filled: 'Slot reservado de texto sagrado preenchido.',
};

export const EVENT_EMOJI: Readonly<Record<WebhookEventType, string>> = {
  submission_created: '📥',
  submission_consent_captured: '🔐',
  submission_in_review: '🔍',
  submission_authority_requested: '⚖️',
  submission_double_review_started: '👥',
  submission_approved: '✅',
  submission_rejected: '⛔',
  submission_archived: '🗄️',
  sacred_text_reserved_slot_filled: '🕯️',
};

export function resolveChannelTemplate(channel: WebhookChannel, event: WebhookEventType): ChannelTemplate {
  const colorHint: ChannelTemplate['colorHint'] =
    event === 'submission_approved' ? 'good'
      : event === 'submission_rejected' || event === 'submission_archived' ? 'danger'
      : event === 'submission_authority_requested' || event === 'sacred_text_reserved_slot_filled' ? 'warning'
      : 'neutral';
  return {
    channel,
    event,
    subject: EVENT_SUBJECTS[event],
    summary: EVENT_SUMMARIES[event] + (channel === 'email' ? '\n\nID de entrega: %deliveryId%.' : channel === 'pagerduty' ? ' | severity: alert' : ''),
    emoji: EVENT_EMOJI[event],
    colorHint,
  };
}

export const CHANNEL_TEMPLATE_REGISTRY: readonly ChannelTemplate[] = (() => {
  const out: ChannelTemplate[] = [];
  for (const c of ALL_WEBHOOK_CHANNELS) for (const e of ALL_EVENT_TYPES) out.push(resolveChannelTemplate(c, e));
  return out;
})();

export function buildChannelTemplateRegistry(): readonly ChannelTemplate[] { return CHANNEL_TEMPLATE_REGISTRY; }
export function getChannelTemplate(channel: WebhookChannel, event: WebhookEventType): ChannelTemplate { return resolveChannelTemplate(channel, event); }

const SUBMISSION_FIELD_LABELS: Readonly<Record<string, string>> = {
  tradition: 'Tradição',
  status: 'Status',
  sensitivity: 'Sensibilidade',
  locale: 'Locale',
};

// Slack formatter — chat.postMessage shape (mrkdwn)
export function formatSlackMessage(payload: WebhookPayload): string {
  const tpl = getChannelTemplate('slack', payload.event);
  const sacred = isSacredTextEvent(payload.event);
  const body = {
    text: payload.title ?? tpl.subject,
    blocks: buildSlackBlocks(payload, tpl),
    username: SLACK_USERNAME,
    icon_emoji: tpl.emoji,
  };
  // Compact legacy `text` field for backward compat.
  const lines: string[] = [`*${tpl.subject}*`, tpl.summary];
  if (sacred) {
    lines.push(`🕯️ _Conteúdo sacro omitido por política de redação._`);
    if (payload.reservedSlotId) lines.push(`Slot: \`${payload.reservedSlotId}\``);
  } else {
    if (payload.title) lines.push(`*Título:* ${payload.title}`);
    if (payload.body) lines.push('> ' + payload.body.slice(0, 600) + (payload.body.length > 600 ? '…' : ''));
    if (payload.note) lines.push(`Nota: ${payload.note}`);
    if (payload.reviewerId) lines.push(`Revisor: \`${payload.reviewerId}\``);
  }
  lines.push(`Submission: \`${payload.submissionId}\``);
  return JSON.stringify({ text: truncate(lines.join('\n'), SLACK_TEXT_LIMIT - 100), body });
}

export function buildSlackBlocks(payload: WebhookPayload, tpl: ChannelTemplate): ReadonlyArray<Record<string, unknown>> {
  const sacred = isSacredTextEvent(payload.event);
  const blocks: Record<string, unknown>[] = [
    { type: 'header', text: { type: 'plain_text', text: truncate(`${tpl.emoji} ${tpl.subject}`, 150) } },
    { type: 'section', text: { type: 'mrkdwn', text: tpl.summary } },
    {
      type: 'section',
      fields: (['tradition', 'status', 'sensitivity', 'locale'] as const).map((k) => ({
        type: 'mrkdwn',
        text: `*${SUBMISSION_FIELD_LABELS[k]}*\n\`${(payload as unknown as Record<string, unknown>)[k]}\``,
      })),
    },
  ];
  if (sacred) {
    blocks.push({ type: 'context', elements: [{ type: 'mrkdwn', text: '_Conteúdo sacro omitido por política de redação._' }] });
    if (payload.reservedSlotId) blocks.push({ type: 'section', text: { type: 'mrkdwn', text: `Slot: \`${payload.reservedSlotId}\`` } });
  } else {
    if (payload.title) blocks.push({ type: 'section', text: { type: 'mrkdwn', text: `*Título:* ${payload.title}` } });
    if (payload.body) blocks.push({ type: 'section', text: { type: 'mrkdwn', text: truncate(payload.body.slice(0, 1500), 2900) } });
    if (payload.note) blocks.push({ type: 'context', elements: [{ type: 'mrkdwn', text: `Nota: ${payload.note}` }] });
  }
  blocks.push({ type: 'context', elements: [{ type: 'mrkdwn', text: `Submission: \`${payload.submissionId}\` · ${new Date(payload.occurredAt).toISOString()}` }] });
  return blocks.slice(0, SLACK_BLOCK_LIMIT);
}

// Discord formatter — webhook shape (markdown)
export function formatDiscordMessage(payload: WebhookPayload): string {
  const tpl = getChannelTemplate('discord', payload.event);
  return JSON.stringify({ username: DISCORD_USERNAME, content: tpl.subject, embeds: [buildDiscordEmbed(payload, tpl)] });
}

export function buildDiscordEmbed(payload: WebhookPayload, tpl: ChannelTemplate): Record<string, unknown> {
  const sacred = isSacredTextEvent(payload.event);
  const fields: { name: string; value: string; inline?: boolean }[] = [];
  for (const [k, label] of Object.entries(SUBMISSION_FIELD_LABELS)) {
    fields.push({ name: label, value: `\`${(payload as unknown as Record<string, unknown>)[k]}\``, inline: true });
  }
  if (sacred) {
    fields.push({ name: 'Política', value: '_Conteúdo sacro omitido por política de redação. Apenas IDs._', inline: false });
    if (payload.reservedSlotId) fields.push({ name: 'Slot reservado', value: `\`${payload.reservedSlotId}\``, inline: true });
  } else {
    if (payload.title) fields.push({ name: 'Título', value: truncate(payload.title, 1024) });
    if (payload.body) fields.push({ name: 'Corpo', value: truncate(payload.body, 1024) });
    if (payload.note) fields.push({ name: 'Nota', value: truncate(payload.note, 1024) });
    if (payload.reviewerId) fields.push({ name: 'Revisor', value: `\`${payload.reviewerId}\``, inline: true });
  }
  return {
    title: truncate(`${tpl.emoji} ${tpl.subject}`, 256),
    description: truncate(tpl.summary, DISCORD_TEXT_LIMIT),
    color: DISCORD_COLOR_BY_HINT[tpl.colorHint],
    timestamp: new Date(payload.occurredAt).toISOString(),
    footer: { text: `Submissão: ${payload.submissionId}` },
    fields: fields.slice(0, DISCORD_EMBED_FIELD_LIMIT),
  };
}

const DISCORD_COLOR_BY_HINT: Readonly<Record<ChannelTemplate['colorHint'], number>> = {
  good: 0x2ecc71, warning: 0xf39c12, danger: 0xe74c3c, neutral: 0x95a5a6,
};

// Email formatter — RFC 5322 (multipart/alternative ready)
export function formatEmailMessage(payload: WebhookPayload): string {
  const tpl = getChannelTemplate('email', payload.event);
  const sacred = isSacredTextEvent(payload.event);
  const rows = (['submissionId', 'tradition', 'status', 'sensitivity', 'locale'] as const)
    .map((k) => `<tr><th>${k}</th><td>${escHtml(String((payload as unknown as Record<string, unknown>)[k === 'submissionId' ? 'submissionId' : k]))}</td></tr>`)
    .join('');
  const textLines = [
    tpl.subject, '',
    tpl.summary, '',
    `Submission: ${payload.submissionId}`,
    `Tradição:   ${payload.tradition}`,
    `Status:     ${payload.status}`,
    `Sensibilidade: ${payload.sensitivity}`,
    `Locale:     ${payload.locale}`,
    `Ocorrido em: ${new Date(payload.occurredAt).toISOString()}`,
  ];
  if (sacred) {
    textLines.push('', '[Policy] Conteúdo sacro omitido por política de redação (Art. w51 §16).');
    if (payload.reservedSlotId) textLines.push(`Slot:       ${payload.reservedSlotId}`);
  } else {
    if (payload.title) textLines.push(`Título:     ${payload.title}`);
    if (payload.body) textLines.push('', payload.body);
    if (payload.note) textLines.push('', 'Nota:', payload.note);
    if (payload.reviewerId) textLines.push(`Revisor:    ${payload.reviewerId}`);
  }
  textLines.push('', '--', 'Cabala dos Caminhos · webhook w51');
  const text = foldEmailLines(textLines.join('\n'));
  const html = `<!doctype html><html><body><h1>${escHtml(tpl.subject)}</h1><p>${escHtml(tpl.summary)}</p><table border="1" cellpadding="4" cellspacing="0">${rows}</table>${payload.title && !sacred ? `<h2>${escHtml(payload.title)}</h2>` : ''}${sacred ? '<p><em>Conteúdo sacro omitido por política de redação.</em></p>' : payload.body ? `<pre>${escHtml(payload.body.slice(0, 4000))}</pre>` : ''}<hr/><p style="font-size:smaller">Cabala dos Caminhos · w51-prayer-submission-webhook</p></body></html>`;
  return JSON.stringify({ subject: tpl.subject, from: EMAIL_FROM_DEFAULT, to: [], text, html });
}

// Build MIME envelope (RFC 5322 §3 + §5).
export function buildEmailMime(messageId: string, fromAddress: string, toAddresses: readonly string[], subject: string, textBody: string): string {
  const lines = [
    `Message-ID: ${messageId}`,
    `Date: ${new Date().toUTCString()}`,
    `From: ${fromAddress}`,
    ...toAddresses.map((to) => `To: ${to}`),
    `Subject: ${subject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=utf-8',
    'Content-Transfer-Encoding: 8bit',
    '',
    textBody,
  ];
  return lines.join('\r\n');
}

function foldEmailLines(s: string): string {
  const out: string[] = [];
  for (const line of s.split('\n')) {
    if (line.length <= EMAIL_LINE_LIMIT) { out.push(line); continue; }
    for (let i = 0; i < line.length; i += EMAIL_LINE_LIMIT) {
      out.push((i === 0 ? '' : ' ') + line.slice(i, i + EMAIL_LINE_LIMIT));
    }
  }
  return out.join('\r\n');
}

function escHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Generic webhook — JSON body (canonical)
export function formatGenericWebhookBody(payload: WebhookPayload): string {
  return canonicalJson(payload);
}

// Telegram formatter — HTML parse mode
export function formatTelegramMessage(payload: WebhookPayload): string {
  const tpl = getChannelTemplate('telegram', payload.event);
  const sacred = isSacredTextEvent(payload.event);
  const lines: string[] = [`<b>${escHtml(tpl.subject)}</b>`, escHtml(tpl.summary)];
  for (const [k, label] of Object.entries(SUBMISSION_FIELD_LABELS)) {
    lines.push(`<b>${label}:</b> <code>${escHtml(String((payload as unknown as Record<string, unknown>)[k]))}</code>`);
  }
  if (sacred) {
    if (payload.reservedSlotId) lines.push(`<b>Slot:</b> <code>${escHtml(payload.reservedSlotId)}</code>`);
    lines.push('', '<i>Conteúdo sacro omitido por política de redação.</i>');
  } else {
    if (payload.title) lines.push(`<b>Título:</b> ${escHtml(payload.title)}`);
    if (payload.note) lines.push(`<b>Nota:</b> ${escHtml(payload.note)}`);
    if (payload.reviewerId) lines.push(`<b>Revisor:</b> <code>${escHtml(payload.reviewerId)}</code>`);
    if (payload.body) lines.push('', `<pre>${escHtml(payload.body.slice(0, 2000))}</pre>`);
  }
  lines.push('', `<i>Submission ${escHtml(payload.submissionId)} · ${escHtml(new Date(payload.occurredAt).toISOString())}</i>`);
  const text = truncate(lines.join('\n'), TELEGRAM_TEXT_LIMIT - 100);
  return JSON.stringify({ chat_id: '%CHAT_ID%', text, parse_mode: 'HTML', disable_web_page_preview: true });
}

// Telegram HTML entities helper — for downstream entities-based adapters.
export function buildTelegramHtmlEntities(text: string): ReadonlyArray<{ offset: number; length: number; type: 'bold' | 'italic' | 'code' | 'pre' }> {
  const entities: { offset: number; length: number; type: 'bold' | 'italic' | 'code' | 'pre' }[] = [];
  const re = /<\/?(b|i|code|pre)>/g;
  const stack: { tag: 'bold' | 'italic' | 'code' | 'pre'; start: number }[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    const isClose = m[0].startsWith('</');
    const tag = m[1] as 'b' | 'i' | 'code' | 'pre';
    if (!isClose) {
      stack.push({ tag: tag === 'b' ? 'bold' : tag === 'i' ? 'italic' : tag, start: m.index });
    } else {
      const open = stack.pop();
      if (open) entities.push({ offset: open.start, length: m.index - open.start - open.tag.length - 2, type: open.tag });
    }
  }
  return entities;
}

// PagerDuty Events API v2 formatter
export function formatPagerDutyEvent(payload: WebhookPayload): string {
  const tpl = getChannelTemplate('pagerduty', payload.event);
  const severity = severityForEvent(payload.event, payload.sensitivity);
  const body = {
    routing_key: '%ROUTING_KEY%',
    event_action: 'trigger',
    dedup_key: `${payload.submissionId}:${payload.event}`,
    payload: {
      summary: `${tpl.subject} — submissão ${payload.submissionId}`,
      severity,
      source: 'cabala-dos-caminhos-prayer-submission-webhook',
      component: 'prayer-submission',
      group: payload.tradition,
      class: payload.event,
      custom_details: {
        submissionId: payload.submissionId,
        tradition: payload.tradition,
        locale: payload.locale,
        sensitivity: payload.sensitivity,
        status: payload.status,
        occurredAt: payload.occurredAt,
        isSacred: isSacredTextEvent(payload.event),
        reservedSlotId: payload.reservedSlotId,
        title: isSacredTextEvent(payload.event) ? null : payload.title ?? null,
        note: payload.note ?? null,
      },
    },
  };
  return JSON.stringify(body);
}

export const PAGERDUTY_SEVERITIES: readonly string[] = ['critical', 'error', 'warning', 'info', 'debug'] as const;

export function severityForEvent(event: WebhookEventType, sensitivity: SacredSensitivityLevel): 'critical' | 'error' | 'warning' | 'info' {
  if (event === 'submission_approved' && sensitivity >= 4) return 'warning';
  if (event === 'submission_rejected') return 'error';
  if (event === 'sacred_text_reserved_slot_filled' && sensitivity >= 5) return 'critical';
  return 'info';
}

function truncate(s: string, max: number): string {
  return s.length <= max ? s : s.slice(0, max - 1) + '…';
}

// §23 DISPATCH TO CHANNEL — one driver call
export function formatterForChannel(channel: WebhookChannel): (payload: WebhookPayload) => string {
  switch (channel) {
    case 'slack': return formatSlackMessage;
    case 'discord': return formatDiscordMessage;
    case 'email': return formatEmailMessage;
    case 'generic-webhook': return formatGenericWebhookBody;
    case 'telegram': return formatTelegramMessage;
    case 'pagerduty': return formatPagerDutyEvent;
  }
}

export function adapterForChannel(channel: WebhookChannel): WebhookFormatAdapter {
  const headers = (w: WebhookEvent, p: WebhookPayload, d: WebhookDelivery): WebhookHeaders =>
    generateSignatureHeader(w, canonicalJson(p), d.attempt, d.id);
  switch (channel) {
    case 'slack': return { channel, formatBody: formatSlackMessage, formatHeaders: headers, maxBodyBytes: MAX_PAYLOAD_BYTES };
    case 'discord': return { channel, formatBody: formatDiscordMessage, formatHeaders: headers, maxBodyBytes: MAX_PAYLOAD_BYTES };
    case 'email': return { channel, formatBody: formatEmailMessage, formatHeaders: headers, maxBodyBytes: EMAIL_BODY_LIMIT };
    case 'telegram': return { channel, formatBody: formatTelegramMessage, formatHeaders: headers, maxBodyBytes: MAX_PAYLOAD_BYTES };
    case 'pagerduty': return { channel, formatBody: formatPagerDutyEvent, formatHeaders: headers, maxBodyBytes: MAX_PAYLOAD_BYTES };
    case 'generic-webhook': return GENERIC_WEBHOOK_ADAPTER;
  }
}

/**
 * Dispatch to the channel — pure data-shaping step. Returns the formatted
 * body + headers + size. The actual HTTP send is the caller's job. Throws
 * `WebhookPayloadTooLargeError` if body > channel limit.
 */
export function dispatchToChannel(webhook: WebhookEvent, delivery: WebhookDelivery): {
  readonly url: string;
  readonly headers: WebhookHeaders;
  readonly body: string;
  readonly bytes: number;
} {
  if (!webhook.enabled || webhook.disabled) {
    throw new WebhookConsentMissingError(webhook.id, webhook.owner);
  }
  const adapter = adapterForChannel(webhook.channel);
  const body = adapter.formatBody(delivery.payload);
  const mergedHeaders: WebhookHeaders = {
    ...adapter.formatHeaders(webhook, delivery.payload, delivery),
    ...(webhook.headers ?? {}),
  };
  const bytes = utf8Encode(body).length;
  if (bytes > adapter.maxBodyBytes) {
    throw new WebhookPayloadTooLargeError(bytes, adapter.maxBodyBytes);
  }
  return {
    url: webhook.url,
    headers: mergedHeaders,
    body,
    bytes,
  };
}

// §24 DELIVERY QUEUE PROCESSING — pure, no I/O
export interface RetryDecision {
  readonly shouldRetry: boolean;
  readonly nextRetryAt: number | null;
  readonly terminal: boolean;
  readonly reason: 'retry_pending' | 'max_attempts_reached' | 'non_retryable';
}

// * Decide whether an attempt counts against the retry budget and when the next attempt should be scheduled. /
export function computeNextRetry(
  policy: WebhookRetryPolicy,
  attempt: number,
  lastErrorStatus: number | null,
  now: number = Date.now(),
): RetryDecision {
  const nextAttempt = attempt + 1;
  if (nextAttempt >= policy.maxAttempts) {
    return { shouldRetry: false, nextRetryAt: null, terminal: true, reason: 'max_attempts_reached' };
  }
  if (lastErrorStatus !== null && !policy.retryOn.includes(lastErrorStatus)) {
    return { shouldRetry: false, nextRetryAt: null, terminal: true, reason: 'non_retryable' };
  }
  const baseDelay = policy.backoffMs[Math.min(attempt, policy.backoffMs.length - 1)];
  const delay = applyJitter(baseDelay, policy.jitter);
  return {
    shouldRetry: true,
    nextRetryAt: now + delay,
    terminal: false,
    reason: 'retry_pending',
  };
}

// Apply multiplicative jitter (`jitter ∈ [0, 1)`) to a delay.
export function applyJitter(baseMs: number, jitter: number): number {
  if (jitter <= 0) return baseMs;
  const r = deterministicRandom(); // [0, 1)
  return Math.round(baseMs * (1 - jitter + r * jitter * 2));
}

// Deterministic PRNG; seedable for testability.
export function deterministicRandom(seed: number = Date.now() % 1_000_000): number {
  // Mulberry32 — 32-bit, 2^32 period, fine for jitter.
  let t = (seed + 0x6D2B79F5) | 0;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4_294_967_295;
}

// Returns the next backoff delay for a given attempt index (no jitter).
export function nextBackoffDelay(
  policy: WebhookRetryPolicy,
  attempt: number,
): number {
  return policy.backoffMs[Math.min(attempt, policy.backoffMs.length - 1)];
}

// Should this HTTP status code trigger a retry on this policy?
export function isRetryableHttpStatus(
  policy: WebhookRetryPolicy,
  httpStatus: number,
): boolean {
  return policy.retryOn.includes(httpStatus);
}

/**
 * Process one batch from the queue. Pure: returns a new
 * `NotificationResult` of how many were dispatched, retried, or marked
 * failed. The actual HTTP call is the caller's responsibility after this
 * function decides on the next action.
 */
export interface ProcessQueueResult {
  readonly dispatched: readonly WebhookDelivery[];
  readonly retried: readonly WebhookDelivery[];
  readonly failed: readonly WebhookDelivery[];
  readonly untouched: readonly WebhookDelivery[];
  readonly processedAt: number;
}

export function processDeliveryQueue(
  store: WebhookStore = defaultStore,
  options: {
    readonly now?: number;
    readonly batchSize?: number;
    readonly maxAttemptsCap?: number;
  } = {},
): ProcessQueueResult {
  const now = options.now ?? Date.now();
  const batchSize = options.batchSize ?? WEBHOOK_QUEUE_BATCH_SIZE;
  const cap = options.maxAttemptsCap;

  // Pick up deliveries that are pending and due.
  const due = store
    .listDeliveries({ status: 'pending' })
    .filter((d) => d.nextRetryAt !== null && d.nextRetryAt <= now)
    .slice(0, batchSize);

  const retrying = store.listDeliveries({ status: 'retrying' })
    .filter((d) => d.nextRetryAt !== null && d.nextRetryAt <= now)
    .slice(0, batchSize);
  const allDue = [...due, ...retrying].slice(0, batchSize);

  const dispatched: WebhookDelivery[] = [];
  const retried: WebhookDelivery[] = [];
  const failed: WebhookDelivery[] = [];
  const untouched: WebhookDelivery[] = [];

  for (const delivery of allDue) {
    const subscriber = store.getWebhook(delivery.webhookId);
    if (!subscriber || !subscriber.enabled || subscriber.disabled) {
      const updated = bumpAttempt(delivery, store, now, 'failed', 'webhook_disabled');
      failed.push(updated);
      continue;
    }
    const policy = subscriber.retryPolicy
      ?? DEFAULT_RETRY_POLICY_BY_CHANNEL[subscriber.channel];
    const next = computeNextRetry(policy, delivery.attempt, null, now);
    const capLimit = cap ?? policy.maxAttempts;
    if (delivery.attempt + 1 >= capLimit) {
      const updated = bumpAttempt(delivery, store, now, 'failed', 'cap_exceeded');
      failed.push(updated);
      continue;
    }
    if (next.terminal) {
      const updated = bumpAttempt(delivery, store, now, 'failed', next.reason);
      failed.push(updated);
      continue;
    }
    const refreshed: WebhookDelivery = {
      ...delivery,
      status: next.shouldRetry ? 'retrying' : 'pending',
      attempt: delivery.attempt + 1,
      nextRetryAt: next.nextRetryAt,
      lastUpdatedAt: now,
    };
    store.putDelivery(refreshed);
    if (next.shouldRetry) retried.push(refreshed);
    else dispatched.push(refreshed);
  }

  return {
    dispatched,
    retried,
    failed,
    untouched,
    processedAt: now,
  };
}

// Bump the attempt counter and apply a status — pure helper.
function bumpAttempt(delivery: WebhookDelivery, store: WebhookStore, now: number, status: WebhookDeliveryStatus, reason: string): WebhookDelivery {
  // Map status + reason → WebhookAuditAction (terminal -> 'failed'/'expired'/'retried' discriminated).
  const action: WebhookAuditAction =
    status === 'failed' && (reason === 'cap_exceeded' || reason === 'max_attempts_reached')
      ? 'retry_exhausted'
      : status === 'failed'
        ? 'failed'
        : status === 'retrying'
          ? 'retry_scheduled'
          : 'queued';
  const entry: WebhookAuditEntry = {
    action,
    timestamp: now,
    actor: DEFAULT_AGENT_ID,
    metadata: { reason, attempt: delivery.attempt + 1 },
  };
  const updated: WebhookDelivery = {
    ...delivery,
    attempt: delivery.attempt + 1,
    status,
    lastUpdatedAt: now,
    nextRetryAt: status === 'retrying' ? delivery.nextRetryAt : null,
    lastError: status === 'failed' ? reason : null,
    auditTrail: [...delivery.auditTrail, entry],
  };
  store.putDelivery(updated);
  return updated;
}

// §25 MARK DELIVERED / FAILED — terminal transitions
export function markDelivered(deliveryId: string, response: WebhookResponseSummary, store: WebhookStore = defaultStore, actor: string = DEFAULT_AGENT_ID): WebhookDelivery {
  const delivery = store.getDelivery(deliveryId);
  if (!delivery) throw new WebhookNotFoundError(deliveryId);
  const updated: WebhookDelivery = {
    ...delivery,
    status: 'delivered',
    lastResponse: response,
    lastUpdatedAt: response.receivedAt,
    nextRetryAt: null,
    auditTrail: [...delivery.auditTrail, { action: 'delivered', timestamp: response.receivedAt, actor, metadata: { httpStatus: response.httpStatus, durationMs: response.durationMs } }],
  };
  store.putDelivery(updated);
  return updated;
}

// Mark a delivery as terminal-failed (after retries or non-retryable).
export function markFailed(deliveryId: string, error: string, store: WebhookStore = defaultStore, actor: string = DEFAULT_AGENT_ID, now: number = Date.now()): WebhookDelivery {
  const delivery = store.getDelivery(deliveryId);
  if (!delivery) throw new WebhookNotFoundError(deliveryId);
  const updated: WebhookDelivery = {
    ...delivery,
    status: 'failed',
    lastError: error,
    lastUpdatedAt: now,
    nextRetryAt: null,
    auditTrail: [...delivery.auditTrail, { action: 'failed', timestamp: now, actor, metadata: { error, attempt: delivery.attempt } }],
  };
  store.putDelivery(updated);
  return updated;
}

/**
 * Retry a single delivery manually (used by "force retry" buttons in the
 * admin cockpit). Resets attempt counter to 0 with fresh firstDispatchedAt.
 */
export function retryDelivery(deliveryId: string, store: WebhookStore = defaultStore, actor: string = DEFAULT_AGENT_ID, now: number = Date.now()): WebhookDelivery {
  const delivery = store.getDelivery(deliveryId);
  if (!delivery) throw new WebhookNotFoundError(deliveryId);
  const updated: WebhookDelivery = {
    ...delivery,
    status: 'pending',
    attempt: 0,
    nextRetryAt: now,
    lastUpdatedAt: now,
    firstDispatchedAt: now,
    expiresAt: now + (store.getWebhook(delivery.webhookId)?.retryPolicy?.maxAgeMs ?? DEFAULT_RETRY_POLICY.maxAgeMs),
    auditTrail: [...delivery.auditTrail, { action: 'retry_scheduled', timestamp: now, actor, metadata: { manual: true, fromStatus: delivery.status } }],
  };
  store.putDelivery(updated);
  return updated;
}

// §26 EXPIRE STALE DELIVERIES — TTL sweep + per-expiresAt purge
export function expireStaleDeliveries(
  store: WebhookStore = defaultStore,
  maxAgeDays: number = 7,
  now: number = Date.now(),
): number {
  const cutoff = now - maxAgeDays * 24 * 60 * 60 * 1000;
  let expired = 0;
  const all = [
    ...store.listDeliveries({ status: 'pending' }),
    ...store.listDeliveries({ status: 'retrying' }),
    ...store.listDeliveries({ status: 'delivered' }),
    ...store.listDeliveries({ status: 'failed' }),
  ];
  for (const d of all) {
    if (d.firstDispatchedAt < cutoff && d.status !== 'expired') {
      const entry: WebhookAuditEntry = {
        action: 'expired',
        timestamp: now,
        actor: DEFAULT_AGENT_ID,
        metadata: { maxAgeDays, firstDispatchedAt: d.firstDispatchedAt },
      };
      const updated: WebhookDelivery = {
        ...d,
        status: 'expired',
        nextRetryAt: null,
        lastUpdatedAt: now,
        auditTrail: [...d.auditTrail, entry],
      };
      store.putDelivery(updated);
      expired++;
    }
  }
  return expired;
}

// Drop deliveries older than `expiresAt` regardless of status.
export function purgeExpiredByExpiresAt(
  store: WebhookStore = defaultStore,
  now: number = Date.now(),
): number {
  let purged = 0;
  for (const d of store.listDeliveries()) {
    if (d.expiresAt < now && d.status !== 'expired') {
      store.removeDelivery(d.id);
      purged++;
    }
  }
  return purged;
}

// §27 AUDIT EXPORTS + LOGGING HYGIENE — PII-redacted, secrets masked
export function exportDeliveriesForAudit(
  from: number,
  to: number,
  store: WebhookStore = defaultStore,
): readonly WebhookDelivery[] {
  if (from > to) {
    throw new Error(`exportDeliveriesForAudit: from (${from}) > to (${to})`);
  }
  const all: WebhookDelivery[] = [];
  for (const d of store.listDeliveries()) {
    if (d.firstDispatchedAt >= from && d.firstDispatchedAt <= to) {
      all.push(stripDeliverySecrets(d));
    }
  }
  return all.sort((a, b) => a.firstDispatchedAt - b.firstDispatchedAt);
}

// Strip the payload's signature / reservedSlotId-derived secrets from a delivery.
export function stripDeliverySecrets(delivery: WebhookDelivery): WebhookDelivery {
  return {
    ...delivery,
    payload: {
      ...delivery.payload,
      signature: 'sha256=<redacted>',
    },
  };
}

/**
 * Strip PII from a payload before logging. Body is preserved (it's not
 * PII per se; it's user content), but reserved slots + signatures are.
 */
export interface WebhookSanitizedLog {
  readonly event: WebhookEventType;
  readonly submissionId: string;
  readonly channel: WebhookChannel;
  readonly attempt: number;
  readonly status: WebhookDeliveryStatus;
  readonly occurredAt: number;
  readonly signature: 'sha256=<redacted>' | string;
  readonly titleExcerpt: string | null;
  readonly bodyExcerpt: string | null;
  readonly noteExcerpt: string | null;
}

export function sanitizePayloadForLog(
  delivery: WebhookDelivery,
  excerptChars: number = 80,
): WebhookSanitizedLog {
  return {
    event: delivery.payload.event,
    submissionId: delivery.payload.submissionId,
    channel: delivery.channel,
    attempt: delivery.attempt,
    status: delivery.status,
    occurredAt: delivery.payload.occurredAt,
    signature: 'sha256=<redacted>',
    titleExcerpt: excerpt(delivery.payload.title, excerptChars),
    bodyExcerpt: excerpt(delivery.payload.body, excerptChars),
    noteExcerpt: excerpt(delivery.payload.note, excerptChars),
  };
}

// Mask secret fields in a webhook for log display.
export function sanitizeWebhookSecretForLog(secret: string): string {
  if (!secret) return '';
  if (secret.length <= 8) return '*'.repeat(secret.length);
  return secret.slice(0, 4) + '*'.repeat(Math.max(0, secret.length - 8)) + secret.slice(-4);
}

// Excerpt helper.
function excerpt(input: string | undefined, max: number): string | null {
  if (!input) return null;
  if (input.length <= max) return input;
  return input.slice(0, max - 1) + '…';
}

// Drop a list of PII fields from an arbitrary object.
export function redactPiiFields<T extends Record<string, unknown>>(input: T): T {
  const clone: Record<string, unknown> = { ...input };
  for (const key of Object.keys(clone)) {
    if (WEBHOOK_PII_FIELDS.has(key)) clone[key] = '<redacted>';
  }
  return clone as T;
}

// §28 INTERNAL AUDIT APPEND — private helper
export function appendAudit(
  webhook: WebhookEvent,
  action: WebhookAuditAction,
  actor: string,
  metadata: Readonly<Record<string, string | number | boolean>>,
  now: number = Date.now(),
): WebhookAuditEntry {
  return {
    action,
    timestamp: now,
    actor,
    metadata,
  };
}

// §29 DEFAULT STORE — singleton, swappable for tests
export let defaultStore: WebhookStore = new InMemoryWebhookStore();

export function setDefaultStore(store: WebhookStore): WebhookStore {
  defaultStore = store;
  return store;
}

export function resetDefaultStore(): void {
  defaultStore = new InMemoryWebhookStore();
}

// §30 ROUTING RULE HELPERS — factory + matcher
export function buildRoutingRule(
  partial: Partial<WebhookRoutingRule> & {
    readonly id: string;
    readonly name: string;
    readonly eventType: WebhookEventType;
  },
): WebhookRoutingRule {
  return {
    id: partial.id,
    name: partial.name,
    eventType: partial.eventType,
    traditions: partial.traditions,
    minSensitivity: partial.minSensitivity,
    maxSensitivity: partial.maxSensitivity,
    authorities: partial.authorities,
    requireDoubleReview: partial.requireDoubleReview,
  };
}

// Match a rule against an event + submission.
export function matchRoutingRule(
  rule: WebhookRoutingRule,
  event: WebhookEventType,
  submission: WebhookSubmissionView,
): boolean {
  if (rule.eventType !== event) return false;
  if (rule.traditions && !rule.traditions.includes(submission.tradition)) return false;
  if (rule.authorities && !rule.authorities.includes(submission.authority)) return false;
  if (rule.minSensitivity !== undefined && submission.sensitivity < rule.minSensitivity) return false;
  if (rule.maxSensitivity !== undefined && submission.sensitivity > rule.maxSensitivity) return false;
  return true;
}

// §31 METRICS / COUNTERS — read-only views into a store
export interface WebhookChannelStats {
  readonly channel: WebhookChannel;
  readonly pending: number;
  readonly retrying: number;
  readonly delivered: number;
  readonly failed: number;
  readonly expired: number;
  readonly total: number;
}

// Aggregate stats — used by the admin cockpit UI.
export function computeChannelStats(
  store: WebhookStore = defaultStore,
): readonly WebhookChannelStats[] {
  const stats = new Map<WebhookChannel, WebhookChannelStats>();
  for (const channel of ALL_WEBHOOK_CHANNELS) {
    stats.set(channel, {
      channel,
      pending: 0,
      retrying: 0,
      delivered: 0,
      failed: 0,
      expired: 0,
      total: 0,
    });
  }
  for (const d of store.listDeliveries()) {
    const s = stats.get(d.channel);
    if (!s) continue;
    const next: WebhookChannelStats = bumpCounter(s, d.status);
    stats.set(d.channel, next);
  }
  return Array.from(stats.values());
}

function bumpCounter(s: WebhookChannelStats, status: WebhookDeliveryStatus): WebhookChannelStats {
  switch (status) {
    case 'pending': return { ...s, pending: s.pending + 1, total: s.total + 1 };
    case 'retrying': return { ...s, retrying: s.retrying + 1, total: s.total + 1 };
    case 'delivered': return { ...s, delivered: s.delivered + 1, total: s.total + 1 };
    case 'failed': return { ...s, failed: s.failed + 1, total: s.total + 1 };
    case 'expired': return { ...s, expired: s.expired + 1, total: s.total + 1 };
  }
}

// Per-event delivery counts.
export function computeEventStats(
  store: WebhookStore = defaultStore,
): Readonly<Record<WebhookEventType, number>> {
  const out = {} as Record<WebhookEventType, number>;
  for (const e of ALL_EVENT_TYPES) out[e] = 0;
  for (const d of store.listDeliveries()) {
    out[d.payload.event] = (out[d.payload.event] ?? 0) + 1;
  }
  return out;
}

// §32 POLICY DESCRIPTOR — governance snapshot
export interface PrayerSubmissionWebhookPolicyDescriptor {
  readonly policyVersion: typeof W51_POLICY_VERSION;
  readonly channels: readonly WebhookChannel[];
  readonly eventTypes: readonly WebhookEventType[];
  readonly sacredEvents: readonly WebhookEventType[];
  readonly retryPresets: Readonly<Record<'default' | 'strict' | 'lenient', WebhookRetryPolicy>>;
  readonly routingRules: readonly WebhookRoutingRule[];
  readonly constants: typeof WEBHOOK_CONSTANTS_TUPLE;
  readonly signatureScheme: 'HMAC-SHA-256';
  readonly timestampHeader: typeof WEBHOOK_HEADER_NAMES.timestamp;
  readonly signatureHeader: typeof WEBHOOK_HEADER_NAMES.signature;
  readonly lgpd: { readonly consentArticle: 7; readonly rightsArticle: 18 };
}

// Build a fresh policy descriptor snapshot.
export function describeWebhookPolicy(): PrayerSubmissionWebhookPolicyDescriptor {
  return {
    policyVersion: W51_POLICY_VERSION,
    channels: ALL_WEBHOOK_CHANNELS,
    eventTypes: ALL_EVENT_TYPES,
    sacredEvents: Array.from(SACRED_TEXT_EVENT_TYPES),
    retryPresets: WEBHOOK_RETRY_POLICY_PRESETS,
    routingRules: DEFAULT_ROUTING_RULES,
    constants: WEBHOOK_CONSTANTS_TUPLE,
    signatureScheme: 'HMAC-SHA-256',
    timestampHeader: WEBHOOK_HEADER_NAMES.timestamp,
    signatureHeader: WEBHOOK_HEADER_NAMES.signature,
    lgpd: { consentArticle: 7, rightsArticle: 18 },
  };
}

// §33 HANDOFF — w50 → w51 boundary shape
export interface WebhookHandoff {
  readonly event: WebhookEventType;
  readonly enqueued: number;
  readonly deliveries: readonly { readonly id: string; readonly webhookId: string; readonly status: WebhookDeliveryStatus }[];
  readonly dispatchedAt: number;
}

// Build a w50-friendly handoff from a full NotificationResult.
export function toHandoff(result: NotificationResult): WebhookHandoff {
  return {
    event: result.event,
    enqueued: result.enqueued,
    deliveries: result.deliveries.map((d) => ({ id: d.id, webhookId: d.webhookId, status: d.status })),
    dispatchedAt: result.dispatchedAt,
  };
}

// §34 TEST HOOKS — used by tests/lib/w51/...
export function _resetCountersForTests(): void {
  subscriptionCounter = 0;
  deliveryCounter = 0;
}

// Re-export the v-for formatters as a lookup map.
export const FORMATTERS_BY_CHANNEL: Readonly<
  Record<WebhookChannel, (payload: WebhookPayload) => string>
> = {
  slack: formatSlackMessage,
  discord: formatDiscordMessage,
  email: formatEmailMessage,
  'generic-webhook': formatGenericWebhookBody,
  telegram: formatTelegramMessage,
  pagerduty: formatPagerDutyEvent,
} as const;

// §35 ENGINE NAMESPACE — aggregator (re-exports every public entry-point)
export const PrayerSubmissionWebhookEngine = {
  // Versioning
  POLICY_VERSION: W51_POLICY_VERSION,
  SACRED_TEXT_POLICY_VERSION: W51_POLICY_VERSION,

  // Channel registry
  ALL_CHANNELS: ALL_WEBHOOK_CHANNELS,
  ALL_EVENT_TYPES,

  // Retry policies (3 presets + per-channel defaults)
  DEFAULT_RETRY_POLICY,
  STRICT_RETRY_POLICY,
  LENIENT_RETRY_POLICY,
  DEFAULT_RETRY_POLICY_BY_CHANNEL,

  // Subscription CRUD
  subscribeWebhook,
  unsubscribeWebhook,
  listWebhooksForChannel,
  listAllWebhooks,
  getWebhook,
  setWebhookEnabled,

  // State-change hook
  notifyStateChange,
  getTransitionEvent,
  canTransition,
  findEligibleSubscriptions,
  shouldNotifyForSensitivity,
  matchesRoutingRule,
  buildRoutingRule,
  matchRoutingRule,
  buildRoutingRulesTable,

  // Delivery pipeline
  dispatchToChannel,
  processDeliveryQueue,
  computeNextRetry,
  isRetryableHttpStatus,
  nextBackoffDelay,
  applyJitter,
  deterministicRandom,
  markDelivered,
  markFailed,
  retryDelivery,
  expireStaleDeliveries,
  purgeExpiredByExpiresAt,

  // Formatting
  formatSlackMessage,
  formatDiscordMessage,
  formatEmailMessage,
  formatGenericWebhookBody,
  formatTelegramMessage,
  formatPagerDutyEvent,
  formatterForChannel,
  adapterForChannel,
  buildSlackBlocks,
  buildDiscordEmbed,
  buildEmailMime,
  buildTelegramHtmlEntities,
  buildChannelTemplateRegistry,
  getChannelTemplate,
  resolveChannelTemplate,
  severityForEvent,
  PAGERDUTY_SEVERITIES,

  // Signing + canonicalization
  signPayload,
  verifySignature,
  generateSignatureHeader,
  generateWebhookSecret,
  hashWebhookPayload,
  canonicalJson,
  constantTimeEquals,
  constantTimeEqualsHex,
  bytesToHex,
  sha256Hex,
  hmacSha256Hex,

  // Sacred-text policy
  redactSacredTextPayload,
  assertSacredTextClean,
  isSacredTextEvent,
  SACRED_TEXT_EVENT_TYPES,
  SACRED_TEXT_POLICY: {
    name: 'prayer-submission-webhook-sacred-redaction',
    version: W51_POLICY_VERSION,
    redactionRule:
      'Payloads for sacred_text_reserved_slot_filled MUST NOT include title or body fields; only submissionId + tradition + sensitivity + locale (+ optional reservedSlotId) are propagated.',
    errorOnViolation: 'PSW_008',
  },

  // LGPD
  assertLGPDConsent,
  recordLGPDDisable,
  recordLGPDExportRequest,
  pruneDisabledSubscriptions,
  buildLGPDConsentMarker,
  LGPD_CONSENT_KEY,
  LGPD_DISABLE_GRACE_DAYS,

  // Stores + audit
  defaultStore,
  setDefaultStore,
  resetDefaultStore,
  InMemoryWebhookStore,
  appendAudit,
  exportDeliveriesForAudit,
  stripDeliverySecrets,
  computeChannelStats,
  computeEventStats,
  describeWebhookPolicy,
  toHandoff,
  sanitizePayloadForLog,
  sanitizeWebhookSecretForLog,
  redactPiiFields,

  // Errors
  PrayerSubmissionWebhookError,
  WebhookNotFoundError,
  ChannelUnsupportedError,
  WebhookSignatureInvalidError,
  WebhookPayloadTooLargeError,
  WebhookDeliveryFailedError,
  WebhookRetryExhaustedError,
  WebhookConsentMissingError,
  SacredTextWebhookBlockedError,

  // Constants
  WEBHOOK_HEADER_NAMES,
  WEBHOOK_CONSTANTS_TUPLE,
  WEBHOOK_PII_FIELDS,
  SIGNATURE_HEADER,
  PAYLOAD_HASH_PREFIX,
  DEFAULT_AGENT_LOCALE,
  DEFAULT_AGENT_ID,
  SACRED_TEXT_RESERVED_TRADITIONS_HINT:
    'Sacred traditions: candomble, ifa, umbanda, indigenous_brazilian, buddhism (esoteric), taoism (esoteric). Webhook rule: only IDs leak.',
} as const;

export type PrayerSubmissionWebhookEngineType = typeof PrayerSubmissionWebhookEngine;
