/**
 * Analytics Events — Typed Event Catalog (PostHog)
 * -----------------------------------------------------------------------------
 * Single source of truth for ALL analytics events emitted by the Akasha Portal.
 *
 * Conventions:
 *  - Event names use `snake_case` (PostHog convention)
 *  - Every event has a typed `properties` schema
 *  - Properties are NEVER PII — see FEEDBACK-LOOP.md §2 for the forbidden list
 *  - Optional properties use `?:`; required properties are mandatory
 *  - Event names are grouped by domain (auth_, content_, ai_, feedback_, etc)
 *
 * Adding a new event:
 *  1. Add a new entry to `EventName` (the discriminated union below)
 *  2. Add its properties type to `EventProperties`
 *  3. Use `trackEvent('your_event_name', { ... })` — typed at call site
 *
 * @see docs/FEEDBACK-LOOP.md §3
 */

// ─── Domain: Authentication ──────────────────────────────────────────────────

export type AuthSignedUp = {
  /** How they signed up: 'email' | 'google' | 'magic_link' */
  method: 'email' | 'google' | 'magic_link'
  /** Optional referral source — never the referring user id. */
  referrer?: string
  /** Server-set: timezone region, e.g. 'America/Sao_Paulo'. Not a city. */
  region?: string
}

export type AuthLoggedIn = {
  method: 'email' | 'google' | 'magic_link' | 'session_refresh'
}

export type AuthLoggedOut = {
  /** Was this manual or session-timeout. */
  trigger: 'manual' | 'timeout' | 'all_devices'
}

// ─── Domain: Onboarding ──────────────────────────────────────────────────────

export type OnboardingStepCompleted = {
  /** Identifier of the step — see /onboarding flow. */
  step: 'profile_completed' | 'tradition_selected' | 'interest_picked' | 'tutorial_done'
}

export type OnboardingCompleted = {
  /** Total steps actually shown (may be fewer if user skips). */
  total_steps: number
  /** Seconds from landing to completion. */
  duration_seconds: number
}

// ─── Domain: Content (posts, articles, comments, likes) ──────────────────────

export type ContentPostCreated = {
  post_id: string
  /** Length bucket — never raw text. */
  length_bucket: 'short' | 'medium' | 'long'
  /** Whether attachments (images, etc.) were included. */
  has_attachments: boolean
  /** Tradition tag, if any. */
  tradition?: string
}

export type ContentPostViewed = {
  post_id: string
  source: 'feed' | 'search' | 'profile' | 'share_link' | 'notification'
}

export type ContentPostShared = {
  post_id: string
  channel: 'copy_link' | 'twitter' | 'whatsapp' | 'telegram' | 'email' | 'other'
}

export type ContentArticleRead = {
  article_id: string
  tradition?: string
  /** Seconds actually reading — server validates. */
  read_seconds: number
  /** Whether user scrolled to the end (proxy for "completion"). */
  scrolled_to_end: boolean
}

export type ContentLikeToggled = {
  target_type: 'post' | 'comment' | 'article'
  target_id: string
  action: 'liked' | 'unliked'
}

export type ContentCommentCreated = {
  comment_id: string
  target_type: 'post' | 'article'
  target_id: string
  /** Length bucket. */
  length_bucket: 'short' | 'medium' | 'long'
}

// ─── Domain: AI Chat (Akasha IA) ─────────────────────────────────────────────

export type AiChatStarted = {
  /** Where the chat was launched from. */
  source: 'home' | 'article' | 'profile' | 'search' | 'notification'
  /** First user-selected tradition if they picked one in the chat UI. */
  initial_tradition?: string
}

export type AiMessageSent = {
  /** Conversation id (not content). */
  conversation_id: string
  /** Sequential message index in the conversation (1-based). */
  message_index: number
  /** Length bucket. */
  length_bucket: 'short' | 'medium' | 'long'
}

export type AiChatFeedback = {
  conversation_id: string
  /** 'positive' = helpful, 'negative' = unhelpful. */
  rating: 'positive' | 'negative'
  /** Optional category for negative ratings. */
  category?: 'inaccurate' | 'inappropriate' | 'generic' | 'off_topic' | 'other'
}

export type AiCitationClicked = {
  conversation_id: string
  citation_id: string
  /** Source type of the citation. */
  source_type: 'paper' | 'book' | 'tradition' | 'web' | 'community_post'
}

// ─── Domain: Feedback (NPS, feature requests, bug reports) ──────────────────

export type FeedbackNpsSubmitted = {
  /** 0–10 score. */
  score: number
  /** Whether user provided qualitative follow-up. */
  has_comment: boolean
}

export type FeedbackFeatureRequestCreated = {
  request_id: string
  category: 'content' | 'ai' | 'community' | 'profile' | 'notifications' | 'accessibility' | 'other'
}

export type FeedbackFeatureRequestUpvoted = {
  request_id: string
}

export type FeedbackBugReportSubmitted = {
  report_id: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  category: 'ui' | 'performance' | 'ai' | 'auth' | 'data' | 'other'
}

// ─── Domain: Notifications ───────────────────────────────────────────────────

export type NotificationReceived = {
  notification_id: string
  type: 'like' | 'comment' | 'follow' | 'mention' | 'ai_reply' | 'system'
}

export type NotificationClicked = {
  notification_id: string
  type: NotificationReceived['type']
}

export type NotificationPrefsUpdated = {
  /** Count of categories toggled. */
  toggled_count: number
}

// ─── Domain: Search & Discovery ──────────────────────────────────────────────

export type SearchPerformed = {
  /** Length bucket of query — never raw query. */
  query_length_bucket: 'short' | 'medium' | 'long'
  /** Result count bucket. */
  result_count_bucket: 'none' | 'few' | 'many'
  /** Whether user clicked at least one result. */
  clicked_result: boolean
}

export type SearchResultClicked = {
  position_bucket: 'top3' | 'mid' | 'bottom'
  result_type: 'post' | 'article' | 'user' | 'tradition'
}

// ─── Domain: Errors & Performance ────────────────────────────────────────────

export type ErrorClientThrown = {
  error_name: string // e.g. 'TypeError', 'NetworkError'
  /** Surface — where the error happened. */
  surface: 'page' | 'route_handler' | 'server_action' | 'client_component'
  /** Component or route name. */
  context: string
}

export type PerformancePageMetric = {
  page: string
  /** Largest Contentful Paint in ms. */
  lcp_ms: number
  /** Interaction to Next Paint in ms (0 if no interaction yet). */
  inp_ms: number
  /** Cumulative Layout Shift × 1000 (integer). */
  cls_x1000: number
}

// ─── Discriminated union of all events ───────────────────────────────────────

export type AnalyticsEvent =
  | { name: 'auth_signed_up'; properties: AuthSignedUp }
  | { name: 'auth_logged_in'; properties: AuthLoggedIn }
  | { name: 'auth_logged_out'; properties: AuthLoggedOut }
  | { name: 'onboarding_step_completed'; properties: OnboardingStepCompleted }
  | { name: 'onboarding_completed'; properties: OnboardingCompleted }
  | { name: 'content_post_created'; properties: ContentPostCreated }
  | { name: 'content_post_viewed'; properties: ContentPostViewed }
  | { name: 'content_post_shared'; properties: ContentPostShared }
  | { name: 'content_article_read'; properties: ContentArticleRead }
  | { name: 'content_like_toggled'; properties: ContentLikeToggled }
  | { name: 'content_comment_created'; properties: ContentCommentCreated }
  | { name: 'ai_chat_started'; properties: AiChatStarted }
  | { name: 'ai_message_sent'; properties: AiMessageSent }
  | { name: 'ai_chat_feedback'; properties: AiChatFeedback }
  | { name: 'ai_citation_clicked'; properties: AiCitationClicked }
  | { name: 'feedback_nps_submitted'; properties: FeedbackNpsSubmitted }
  | { name: 'feedback_feature_request_created'; properties: FeedbackFeatureRequestCreated }
  | { name: 'feedback_feature_request_upvoted'; properties: FeedbackFeatureRequestUpvoted }
  | { name: 'feedback_bug_report_submitted'; properties: FeedbackBugReportSubmitted }
  | { name: 'notification_received'; properties: NotificationReceived }
  | { name: 'notification_clicked'; properties: NotificationClicked }
  | { name: 'notification_prefs_updated'; properties: NotificationPrefsUpdated }
  | { name: 'search_performed'; properties: SearchPerformed }
  | { name: 'search_result_clicked'; properties: SearchResultClicked }
  | { name: 'error_client_thrown'; properties: ErrorClientThrown }
  | { name: 'performance_page_metric'; properties: PerformancePageMetric }

export type EventName = AnalyticsEvent['name']
export type EventPropertiesOf<E extends EventName> = Extract<AnalyticsEvent, { name: E }>['properties']

// ─── Track helpers ───────────────────────────────────────────────────────────

import { captureClientEvent } from './posthog-setup'

/**
 * Type-safe client-side event tracker. Auto-resolves properties type from
 * the event name. Use this everywhere instead of calling `posthog.capture` directly.
 *
 * @example
 *   trackEvent('content_post_created', {
 *     post_id: 'p_abc123',
 *     length_bucket: 'medium',
 *     has_attachments: false,
 *   })
 */
export function trackEvent<E extends EventName>(
  name: E,
  properties: EventPropertiesOf<E>,
): void {
  // Dev-time PII guard — throws before the event ever leaves the browser.
  assertNoPii(properties as Record<string, unknown>)
  captureClientEvent(name, properties as Record<string, string | number | boolean | null>)
}

/**
 * Forbidden PII keys — used by lint rules (and at runtime in dev mode).
 *
 * If you need to send something on this list, hash it first (`sha256(value)`)
 * and suffix with `_hash`. Do NOT add an exception — file an issue.
 */
export const FORBIDDEN_PROPERTY_KEYS = [
  'email',
  'name',
  'full_name',
  'first_name',
  'last_name',
  'phone',
  'cpf',
  'rg',
  'address',
  'street',
  'birth_date',
  'dob',
  'birthdate',
  'password',
  'token',
  'auth_token',
  'session_token',
  'credit_card',
  'card_number',
  'cvv',
  'ssn',
] as const

/**
 * Dev-time guard: throw if `properties` contains forbidden PII keys.
 * Called by `trackEvent` only when `NODE_ENV === 'development'`.
 */
export function assertNoPii(properties: Record<string, unknown>): void {
  if (process.env.NODE_ENV !== 'development') return
  for (const key of Object.keys(properties)) {
    if ((FORBIDDEN_PROPERTY_KEYS as readonly string[]).includes(key)) {
      throw new Error(
        `[analytics] Forbidden PII property "${key}" — see FORBIDDEN_PROPERTY_KEYS in events.ts. ` +
          `Hash the value instead, or file an issue if this is intentional.`,
      )
    }
  }
}
