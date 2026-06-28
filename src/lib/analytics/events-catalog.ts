/**
 * events-catalog.ts — Catálogo tipado de eventos de analytics (Wave 18)
 * ============================================================================
 * Single source of truth para eventos de tracking do Akasha Portal.
 *
 * Cada evento tem:
 *   - name: identificador snake_case (enviado para PostHog)
 *   - description: o que significa
 *   - category: agrupamento semântico (auth, feed, library, ...)
 *   - sensitivity: classification LGPD (none | low | high)
 *   - schema: zod schema para validar properties em runtime
 *
 * Helper universal `trackEvent()` valida o payload e despacha:
 *   - client: via window.akasha.posthog singleton (batch)
 *   - server: via fetch direto para /capture
 *
 * LGPD:
 *   - Propriedades nunca devem conter PII cru (email, telefone, cpf).
 *   - Use apenas IDs (uuid) e categorias agregadas.
 *   - Eventos com sensitivity='high' NÃO devem ser enviados a menos que
 *     o usuário tenha consentido explicitamente (ver CookieConsent).
 *
 * Como adicionar um evento novo:
 *   1. Adicione entrada em EVENT_CATALOG_* com schema zod.
 *   2. Helper opcional em HELPERS (ou chame trackEvent diretamente).
 *   3. Documente em docs/ANALYTICS-CATALOG-W18.md.
 *
 * Refs:
 *   - https://posthog.com/docs/api/capture
 *   - docs/MONITORING-WAVE11.md (PostHog setup)
 *   - docs/CONSENT-LGPD.md (consentimento)
 * ============================================================================
 */

import { z } from "zod";

// ============================================================================
// Types
// ============================================================================

export type EventCategory =
  | "auth"
  | "onboarding"
  | "feed"
  | "library"
  | "akashic"
  | "events"
  | "groups"
  | "mentorship"
  | "marketplace"
  | "reputation"
  | "errors"
  | "navigation";

export type EventSensitivity = "none" | "low" | "high";

export interface EventDefinition<T extends z.ZodTypeAny> {
  /** Identificador snake_case. */
  name: string;
  /** Categoria semantica. */
  category: EventCategory;
  /** Nivel de sensibilidade LGPD. */
  sensitivity: EventSensitivity;
  /** Descricao do evento (quando dispara). */
  description: string;
  /** Schema zod das properties. */
  schema: T;
}

// ============================================================================
// AUTH (7 eventos)
// ============================================================================

export const EVENT_CATALOG_AUTH = {
  SIGNUP: {
    name: "user_signed_up",
    category: "auth",
    sensitivity: "low",
    description: "Usuario completou signup (email+senha ou OAuth).",
    schema: z.object({
      method: z.enum(["email", "google", "apple", "magic_link"]),
      userId: z.string().uuid(),
      tradition: z.string().optional(),
    }),
  },
  LOGIN: {
    name: "user_logged_in",
    category: "auth",
    sensitivity: "low",
    description: "Usuario fez login com sucesso.",
    schema: z.object({
      method: z.enum(["email", "google", "apple", "magic_link"]),
      userId: z.string().uuid(),
    }),
  },
  LOGOUT: {
    name: "user_logged_out",
    category: "auth",
    sensitivity: "none",
    description: "Usuario fez logout.",
    schema: z.object({
      userId: z.string().uuid().optional(),
    }),
  },
  PASSWORD_RESET_REQUEST: {
    name: "password_reset_requested",
    category: "auth",
    sensitivity: "low",
    description: "Usuario pediu reset de senha.",
    schema: z.object({
      /** Hash do email (nunca o email cru). */
      emailHash: z.string().optional(),
    }),
  },
  PASSWORD_RESET_COMPLETE: {
    name: "password_reset_completed",
    category: "auth",
    sensitivity: "low",
    description: "Usuario completou reset de senha.",
    schema: z.object({
      userId: z.string().uuid().optional(),
    }),
  },
  OAUTH_START: {
    name: "oauth_flow_started",
    category: "auth",
    sensitivity: "low",
    description: "Fluxo OAuth iniciado (provider button click).",
    schema: z.object({
      provider: z.enum(["google", "apple", "github", "facebook"]),
    }),
  },
  OAUTH_COMPLETE: {
    name: "oauth_flow_completed",
    category: "auth",
    sensitivity: "low",
    description: "Fluxo OAuth completou (sucesso ou erro).",
    schema: z.object({
      provider: z.enum(["google", "apple", "github", "facebook"]),
      success: z.boolean(),
      errorCode: z.string().optional(),
    }),
  },
} as const satisfies Record<string, EventDefinition<z.ZodTypeAny>>;

// ============================================================================
// ONBOARDING (6 eventos)
// ============================================================================

export const EVENT_CATALOG_ONBOARDING = {
  STEP_VIEW: {
    name: "onboarding_step_viewed",
    category: "onboarding",
    sensitivity: "none",
    description: "Usuario visualizou uma etapa do onboarding.",
    schema: z.object({
      step: z.number().int().min(1).max(10),
      stepName: z.string(),
    }),
  },
  STEP_COMPLETE: {
    name: "onboarding_step_completed",
    category: "onboarding",
    sensitivity: "low",
    description: "Usuario completou uma etapa do onboarding.",
    schema: z.object({
      step: z.number().int().min(1).max(10),
      stepName: z.string(),
      durationMs: z.number().int().nonnegative().optional(),
    }),
  },
  TRADITION_SELECTED: {
    name: "onboarding_tradition_selected",
    category: "onboarding",
    sensitivity: "low",
    description: "Usuario escolheu suas tradicoes de interesse.",
    schema: z.object({
      traditions: z.array(z.string()).min(1).max(10),
    }),
  },
  SKIPPED: {
    name: "onboarding_skipped",
    category: "onboarding",
    sensitivity: "none",
    description: "Usuario pulou o onboarding (cta skip).",
    schema: z.object({
      step: z.number().int().min(1).max(10),
    }),
  },
  COMPLETED: {
    name: "onboarding_completed",
    category: "onboarding",
    sensitivity: "low",
    description: "Onboarding 100% completo (todas etapas).",
    schema: z.object({
      totalDurationMs: z.number().int().positive(),
      traditionsCount: z.number().int().min(0),
    }),
  },
  ABANDONED: {
    name: "onboarding_abandoned",
    category: "onboarding",
    sensitivity: "none",
    description: "Usuario abandonou onboarding no meio.",
    schema: z.object({
      lastStep: z.number().int().min(1).max(10),
    }),
  },
} as const satisfies Record<string, EventDefinition<z.ZodTypeAny>>;

// ============================================================================
// FEED (8 eventos)
// ============================================================================

export const EVENT_CATALOG_FEED = {
  FEED_VIEW: {
    name: "feed_viewed",
    category: "feed",
    sensitivity: "none",
    description: "Usuario visualizou o feed (home /community /group).",
    schema: z.object({
      feedType: z.enum(["home", "group", "tradition", "user_profile", "explore"]),
      groupSlug: z.string().optional(),
      tradition: z.string().optional(),
      page: z.number().int().nonnegative().optional(),
    }),
  },
  POST_CREATE: {
    name: "post_created",
    category: "feed",
    sensitivity: "low",
    description: "Usuario criou um post.",
    schema: z.object({
      postId: z.string(),
      authorId: z.string().uuid(),
      postType: z.enum(["text", "image", "link", "quote", "ritual"]),
      tradition: z.string().optional(),
      groupSlug: z.string().optional(),
      hasMedia: z.boolean(),
      contentLength: z.number().int().nonnegative(),
    }),
  },
  POST_VIEW: {
    name: "post_viewed",
    category: "feed",
    sensitivity: "none",
    description: "Usuario abriu um post individual.",
    schema: z.object({
      postId: z.string(),
      authorId: z.string().uuid(),
    }),
  },
  POST_LIKE: {
    name: "post_liked",
    category: "feed",
    sensitivity: "none",
    description: "Usuario curtiu um post.",
    schema: z.object({
      postId: z.string(),
      authorId: z.string().uuid(),
    }),
  },
  POST_UNLIKE: {
    name: "post_unliked",
    category: "feed",
    sensitivity: "none",
    description: "Usuario removeu curtida de um post.",
    schema: z.object({
      postId: z.string(),
    }),
  },
  POST_SHARE: {
    name: "post_shared",
    category: "feed",
    sensitivity: "low",
    description: "Usuario compartilhou um post.",
    schema: z.object({
      postId: z.string(),
      channel: z.enum(["copy_link", "twitter", "whatsapp", "telegram", "native_share"]),
    }),
  },
  COMMENT_CREATE: {
    name: "comment_created",
    category: "feed",
    sensitivity: "low",
    description: "Usuario criou um comentario.",
    schema: z.object({
      commentId: z.string(),
      postId: z.string(),
      parentCommentId: z.string().optional(),
      contentLength: z.number().int().nonnegative(),
    }),
  },
  COMMENT_LIKE: {
    name: "comment_liked",
    category: "feed",
    sensitivity: "none",
    description: "Usuario curtiu um comentario.",
    schema: z.object({
      commentId: z.string(),
      postId: z.string(),
    }),
  },
} as const satisfies Record<string, EventDefinition<z.ZodTypeAny>>;

// ============================================================================
// LIBRARY (5 eventos)
// ============================================================================

export const EVENT_CATALOG_LIBRARY = {
  ARTICLE_VIEW: {
    name: "library_article_viewed",
    category: "library",
    sensitivity: "none",
    description: "Usuario abriu artigo da biblioteca.",
    schema: z.object({
      articleId: z.string(),
      slug: z.string(),
      tradition: z.string().optional(),
      source: z.enum(["feed", "search", "direct", "related", "bookmark"]),
    }),
  },
  ARTICLE_READ_COMPLETE: {
    name: "library_article_read_completed",
    category: "library",
    sensitivity: "none",
    description: "Usuario rolou ate o fim do artigo (>= 90% scroll).",
    schema: z.object({
      articleId: z.string(),
      tradition: z.string().optional(),
      readDurationMs: z.number().int().nonnegative().optional(),
    }),
  },
  ARTICLE_BOOKMARK: {
    name: "library_article_bookmarked",
    category: "library",
    sensitivity: "none",
    description: "Usuario salvou artigo nos favoritos.",
    schema: z.object({
      articleId: z.string(),
      action: z.enum(["add", "remove"]),
    }),
  },
  ARTICLE_SHARE: {
    name: "library_article_shared",
    category: "library",
    sensitivity: "low",
    description: "Usuario compartilhou artigo.",
    schema: z.object({
      articleId: z.string(),
      channel: z.enum(["copy_link", "twitter", "whatsapp", "telegram", "native_share"]),
    }),
  },
  LIBRARY_SEARCH: {
    name: "library_searched",
    category: "library",
    sensitivity: "none",
    description: "Usuario fez busca na biblioteca.",
    schema: z.object({
      query: z.string(),
      resultCount: z.number().int().nonnegative(),
      tradition: z.string().optional(),
    }),
  },
} as const satisfies Record<string, EventDefinition<z.ZodTypeAny>>;

// ============================================================================
// AKASHIC (6 eventos)
// ============================================================================

export const EVENT_CATALOG_AKASHIC = {
  CHAT_OPEN: {
    name: "akashic_chat_opened",
    category: "akashic",
    sensitivity: "none",
    description: "Usuario abriu o chat Akasha IA.",
    schema: z.object({
      entryPoint: z.enum(["fab", "menu", "direct_link", "deep_link"]),
    }),
  },
  MESSAGE_SENT: {
    name: "akashic_message_sent",
    category: "akashic",
    sensitivity: "low",
    description: "Usuario enviou mensagem para Akasha IA.",
    schema: z.object({
      messageLength: z.number().int().positive(),
      tradition: z.string().optional(),
      /** Se RAG foi usado para responder. */
      ragUsed: z.boolean(),
      /** Latencia da resposta em ms. */
      tookMs: z.number().int().nonnegative().optional(),
    }),
  },
  MESSAGE_RECEIVED: {
    name: "akashic_message_received",
    category: "akashic",
    sensitivity: "none",
    description: "Usuario recebeu resposta da Akasha IA.",
    schema: z.object({
      responseLength: z.number().int().nonnegative(),
      sourcesCount: z.number().int().nonnegative(),
      model: z.string().optional(),
    }),
  },
  VOICE_PLAY: {
    name: "akashic_voice_played",
    category: "akashic",
    sensitivity: "none",
    description: "Usuario ouviu uma resposta em audio (TTS).",
    schema: z.object({
      messageId: z.string(),
      durationMs: z.number().int().nonnegative(),
    }),
  },
  FEEDBACK_POSITIVE: {
    name: "akashic_feedback_positive",
    category: "akashic",
    sensitivity: "none",
    description: "Usuario deu thumbs up para uma resposta.",
    schema: z.object({
      messageId: z.string(),
    }),
  },
  FEEDBACK_NEGATIVE: {
    name: "akashic_feedback_negative",
    category: "akashic",
    sensitivity: "low",
    description: "Usuario deu thumbs down (pode ter comentario).",
    schema: z.object({
      messageId: z.string(),
      reason: z.string().optional(),
    }),
  },
} as const satisfies Record<string, EventDefinition<z.ZodTypeAny>>;

// ============================================================================
// EVENTS (4 eventos)
// ============================================================================

export const EVENT_CATALOG_EVENTS = {
  EVENT_VIEW: {
    name: "event_viewed",
    category: "events",
    sensitivity: "none",
    description: "Usuario abriu pagina de um evento.",
    schema: z.object({
      eventId: z.string(),
      eventSlug: z.string().optional(),
    }),
  },
  EVENT_JOIN: {
    name: "event_joined",
    category: "events",
    sensitivity: "low",
    description: "Usuario confirmou participacao em evento.",
    schema: z.object({
      eventId: z.string(),
      isOnline: z.boolean(),
      tradition: z.string().optional(),
    }),
  },
  EVENT_CREATE: {
    name: "event_created",
    category: "events",
    sensitivity: "low",
    description: "Usuario criou um novo evento.",
    schema: z.object({
      eventId: z.string(),
      isOnline: z.boolean(),
      tradition: z.string().optional(),
    }),
  },
  EVENT_LEAVE: {
    name: "event_left",
    category: "events",
    sensitivity: "none",
    description: "Usuario cancelou participacao em evento.",
    schema: z.object({
      eventId: z.string(),
    }),
  },
} as const satisfies Record<string, EventDefinition<z.ZodTypeAny>>;

// ============================================================================
// GROUPS (2 eventos)
// ============================================================================

export const EVENT_CATALOG_GROUPS = {
  GROUP_CREATED: {
    name: "group_created",
    category: "groups",
    sensitivity: "low",
    description: "Usuario criou um novo grupo.",
    schema: z.object({
      groupId: z.string(),
      groupSlug: z.string(),
      tradition: z.string(),
      isPublic: z.boolean(),
    }),
  },
  GROUP_JOINED: {
    name: "group_joined",
    category: "groups",
    sensitivity: "low",
    description: "Usuario entrou em um grupo.",
    schema: z.object({
      groupId: z.string(),
      groupSlug: z.string(),
      via: z.enum(["search", "invite", "feed", "direct"]),
    }),
  },
} as const satisfies Record<string, EventDefinition<z.ZodTypeAny>>;

// ============================================================================
// MENTORSHIP (4 eventos)
// ============================================================================

export const EVENT_CATALOG_MENTORSHIP = {
  MENTOR_VIEW: {
    name: "mentor_profile_viewed",
    category: "mentorship",
    sensitivity: "none",
    description: "Usuario abriu perfil de mentor.",
    schema: z.object({
      mentorId: z.string(),
      traditions: z.array(z.string()).optional(),
    }),
  },
  REQUEST_SENT: {
    name: "mentorship_request_sent",
    category: "mentorship",
    sensitivity: "low",
    description: "Usuario enviou solicitacao de mentoria.",
    schema: z.object({
      mentorId: z.string(),
      requestId: z.string(),
    }),
  },
  REQUEST_ACCEPTED: {
    name: "mentorship_request_accepted",
    category: "mentorship",
    sensitivity: "low",
    description: "Mentor aceitou solicitacao.",
    schema: z.object({
      requestId: z.string(),
      mentorId: z.string(),
    }),
  },
  MESSAGE_SENT: {
    name: "mentorship_message_sent",
    category: "mentorship",
    sensitivity: "low",
    description: "Mensagem enviada dentro de mentoria ativa.",
    schema: z.object({
      mentorshipId: z.string(),
      messageLength: z.number().int().positive(),
    }),
  },
} as const satisfies Record<string, EventDefinition<z.ZodTypeAny>>;

// ============================================================================
// MARKETPLACE (4 eventos)
// ============================================================================

export const EVENT_CATALOG_MARKETPLACE = {
  LISTING_VIEW: {
    name: "marketplace_listing_viewed",
    category: "marketplace",
    sensitivity: "none",
    description: "Usuario abriu um produto/servico.",
    schema: z.object({
      listingId: z.string(),
      category: z.string(),
      priceCents: z.number().int().nonnegative(),
    }),
  },
  AFFILIATE_CLICK: {
    name: "marketplace_affiliate_clicked",
    category: "marketplace",
    sensitivity: "low",
    description: "Usuario clicou em link de afiliado.",
    schema: z.object({
      listingId: z.string(),
      destination: z.enum(["external", "internal"]),
    }),
  },
  PURCHASE_INTENT: {
    name: "marketplace_purchase_intent",
    category: "marketplace",
    sensitivity: "high",
    description: "Usuario iniciou checkout (alta sensibilidade).",
    schema: z.object({
      listingId: z.string(),
      priceCents: z.number().int().positive(),
      currency: z.string().length(3),
    }),
  },
  NEWSLETTER_SUBSCRIBED: {
    name: "newsletter_subscribed",
    category: "marketplace",
    sensitivity: "low",
    description: "Usuario se inscreveu na newsletter.",
    schema: z.object({
      /** Hash do email (nunca email cru). */
      emailHash: z.string(),
      frequency: z.enum(["WEEKLY", "MONTHLY", "NEVER"]),
      traditionsCount: z.number().int().nonnegative(),
    }),
  },
} as const satisfies Record<string, EventDefinition<z.ZodTypeAny>>;

// ============================================================================
// REPUTATION (1 evento - background)
// ============================================================================

export const EVENT_CATALOG_REPUTATION = {
  CONTRIBUTION_EARNED: {
    name: "reputation_contribution_earned",
    category: "reputation",
    sensitivity: "low",
    description: "Usuario ganhou pontos de reputacao (background).",
    schema: z.object({
      userId: z.string().uuid(),
      points: z.number().int().positive(),
      source: z.enum(["post", "comment", "article", "helpful", "event", "mentorship"]),
      reason: z.string().optional(),
    }),
  },
} as const satisfies Record<string, EventDefinition<z.ZodTypeAny>>;

// ============================================================================
// ERRORS (3 eventos)
// ============================================================================

export const EVENT_CATALOG_ERRORS = {
  API_ERROR: {
    name: "api_error",
    category: "errors",
    sensitivity: "low",
    description: "API retornou erro >= 500.",
    schema: z.object({
      endpoint: z.string(),
      method: z.enum(["GET", "POST", "PUT", "PATCH", "DELETE"]),
      statusCode: z.number().int().min(500).max(599),
      errorCode: z.string().optional(),
    }),
  },
  VALIDATION_ERROR: {
    name: "validation_error",
    category: "errors",
    sensitivity: "none",
    description: "Usuario enviou dados invalidos (4xx).",
    schema: z.object({
      endpoint: z.string(),
      field: z.string().optional(),
    }),
  },
  NETWORK_ERROR: {
    name: "network_error",
    category: "errors",
    sensitivity: "none",
    description: "Falha de rede (offline, timeout, dns).",
    schema: z.object({
      endpoint: z.string().optional(),
      errorType: z.enum(["offline", "timeout", "dns", "cors", "unknown"]),
    }),
  },
} as const satisfies Record<string, EventDefinition<z.ZodTypeAny>>;

// ============================================================================
// NAVIGATION (1 evento)
// ============================================================================

export const EVENT_CATALOG_NAVIGATION = {
  PAGE_VIEW: {
    name: "page_viewed",
    category: "navigation",
    sensitivity: "none",
    description: "Mudanca de rota (automatica via PostHogProvider).",
    schema: z.object({
      path: z.string(),
      query: z.record(z.string(), z.string()).optional(),
      referrer: z.string().optional(),
    }),
  },
} as const satisfies Record<string, EventDefinition<z.ZodTypeAny>>;

// ============================================================================
// Master catalog (todos os eventos indexados por nome)
// ============================================================================

export const ALL_EVENT_CATALOGS = [
  EVENT_CATALOG_AUTH,
  EVENT_CATALOG_ONBOARDING,
  EVENT_CATALOG_FEED,
  EVENT_CATALOG_LIBRARY,
  EVENT_CATALOG_AKASHIC,
  EVENT_CATALOG_EVENTS,
  EVENT_CATALOG_GROUPS,
  EVENT_CATALOG_MENTORSHIP,
  EVENT_CATALOG_MARKETPLACE,
  EVENT_CATALOG_REPUTATION,
  EVENT_CATALOG_ERRORS,
  EVENT_CATALOG_NAVIGATION,
] as const;

const CATALOG_INDEX: Map<string, EventDefinition<z.ZodTypeAny>> = (() => {
  const map = new Map<string, EventDefinition<z.ZodTypeAny>>();
  for (const catalog of ALL_EVENT_CATALOGS) {
    for (const def of Object.values(catalog)) {
      map.set(def.name, def);
    }
  }
  return map;
})();

/** Total de eventos catalogados. */
export const TOTAL_EVENTS = CATALOG_INDEX.size;

/** Lista plana de todos os event names. */
export const ALL_EVENT_NAMES: readonly string[] = Array.from(CATALOG_INDEX.keys());

/** Recupera definition de um evento pelo nome. */
export function getEventDefinition(name: string): EventDefinition<z.ZodTypeAny> | undefined {
  return CATALOG_INDEX.get(name);
}

// ============================================================================
// Types derivados
// ============================================================================

export type CatalogEvent =
  | EventDefinition<z.ZodTypeAny> & { name: string };

export type EventName = string;
export type EventPropertiesByName<TName extends string = string> =
  TName extends keyof EventSchemaMap ? EventSchemaMap[TName] : Record<string, unknown>;

// Schema map (inferencia de tipos por nome)
type EventSchemaMap = {
  user_signed_up: z.infer<typeof EVENT_CATALOG_AUTH.SIGNUP.schema>;
  user_logged_in: z.infer<typeof EVENT_CATALOG_AUTH.LOGIN.schema>;
  user_logged_out: z.infer<typeof EVENT_CATALOG_AUTH.LOGOUT.schema>;
  password_reset_requested: z.infer<typeof EVENT_CATALOG_AUTH.PASSWORD_RESET_REQUEST.schema>;
  password_reset_completed: z.infer<typeof EVENT_CATALOG_AUTH.PASSWORD_RESET_COMPLETE.schema>;
  oauth_flow_started: z.infer<typeof EVENT_CATALOG_AUTH.OAUTH_START.schema>;
  oauth_flow_completed: z.infer<typeof EVENT_CATALOG_AUTH.OAUTH_COMPLETE.schema>;
  onboarding_step_viewed: z.infer<typeof EVENT_CATALOG_ONBOARDING.STEP_VIEW.schema>;
  onboarding_step_completed: z.infer<typeof EVENT_CATALOG_ONBOARDING.STEP_COMPLETE.schema>;
  onboarding_tradition_selected: z.infer<typeof EVENT_CATALOG_ONBOARDING.TRADITION_SELECTED.schema>;
  onboarding_skipped: z.infer<typeof EVENT_CATALOG_ONBOARDING.SKIPPED.schema>;
  onboarding_completed: z.infer<typeof EVENT_CATALOG_ONBOARDING.COMPLETED.schema>;
  onboarding_abandoned: z.infer<typeof EVENT_CATALOG_ONBOARDING.ABANDONED.schema>;
  feed_viewed: z.infer<typeof EVENT_CATALOG_FEED.FEED_VIEW.schema>;
  post_created: z.infer<typeof EVENT_CATALOG_FEED.POST_CREATE.schema>;
  post_viewed: z.infer<typeof EVENT_CATALOG_FEED.POST_VIEW.schema>;
  post_liked: z.infer<typeof EVENT_CATALOG_FEED.POST_LIKE.schema>;
  post_unliked: z.infer<typeof EVENT_CATALOG_FEED.POST_UNLIKE.schema>;
  post_shared: z.infer<typeof EVENT_CATALOG_FEED.POST_SHARE.schema>;
  comment_created: z.infer<typeof EVENT_CATALOG_FEED.COMMENT_CREATE.schema>;
  comment_liked: z.infer<typeof EVENT_CATALOG_FEED.COMMENT_LIKE.schema>;
  library_article_viewed: z.infer<typeof EVENT_CATALOG_LIBRARY.ARTICLE_VIEW.schema>;
  library_article_read_completed: z.infer<typeof EVENT_CATALOG_LIBRARY.ARTICLE_READ_COMPLETE.schema>;
  library_article_bookmarked: z.infer<typeof EVENT_CATALOG_LIBRARY.ARTICLE_BOOKMARK.schema>;
  library_article_shared: z.infer<typeof EVENT_CATALOG_LIBRARY.ARTICLE_SHARE.schema>;
  library_searched: z.infer<typeof EVENT_CATALOG_LIBRARY.LIBRARY_SEARCH.schema>;
  akashic_chat_opened: z.infer<typeof EVENT_CATALOG_AKASHIC.CHAT_OPEN.schema>;
  akashic_message_sent: z.infer<typeof EVENT_CATALOG_AKASHIC.MESSAGE_SENT.schema>;
  akashic_message_received: z.infer<typeof EVENT_CATALOG_AKASHIC.MESSAGE_RECEIVED.schema>;
  akashic_voice_played: z.infer<typeof EVENT_CATALOG_AKASHIC.VOICE_PLAY.schema>;
  akashic_feedback_positive: z.infer<typeof EVENT_CATALOG_AKASHIC.FEEDBACK_POSITIVE.schema>;
  akashic_feedback_negative: z.infer<typeof EVENT_CATALOG_AKASHIC.FEEDBACK_NEGATIVE.schema>;
  event_viewed: z.infer<typeof EVENT_CATALOG_EVENTS.EVENT_VIEW.schema>;
  event_joined: z.infer<typeof EVENT_CATALOG_EVENTS.EVENT_JOIN.schema>;
  event_created: z.infer<typeof EVENT_CATALOG_EVENTS.EVENT_CREATE.schema>;
  event_left: z.infer<typeof EVENT_CATALOG_EVENTS.EVENT_LEAVE.schema>;
  group_created: z.infer<typeof EVENT_CATALOG_GROUPS.GROUP_CREATED.schema>;
  group_joined: z.infer<typeof EVENT_CATALOG_GROUPS.GROUP_JOINED.schema>;
  mentor_profile_viewed: z.infer<typeof EVENT_CATALOG_MENTORSHIP.MENTOR_VIEW.schema>;
  mentorship_request_sent: z.infer<typeof EVENT_CATALOG_MENTORSHIP.REQUEST_SENT.schema>;
  mentorship_request_accepted: z.infer<typeof EVENT_CATALOG_MENTORSHIP.REQUEST_ACCEPTED.schema>;
  mentorship_message_sent: z.infer<typeof EVENT_CATALOG_MENTORSHIP.MESSAGE_SENT.schema>;
  marketplace_listing_viewed: z.infer<typeof EVENT_CATALOG_MARKETPLACE.LISTING_VIEW.schema>;
  marketplace_affiliate_clicked: z.infer<typeof EVENT_CATALOG_MARKETPLACE.AFFILIATE_CLICK.schema>;
  marketplace_purchase_intent: z.infer<typeof EVENT_CATALOG_MARKETPLACE.PURCHASE_INTENT.schema>;
  newsletter_subscribed: z.infer<typeof EVENT_CATALOG_MARKETPLACE.NEWSLETTER_SUBSCRIBED.schema>;
  reputation_contribution_earned: z.infer<typeof EVENT_CATALOG_REPUTATION.CONTRIBUTION_EARNED.schema>;
  api_error: z.infer<typeof EVENT_CATALOG_ERRORS.API_ERROR.schema>;
  validation_error: z.infer<typeof EVENT_CATALOG_ERRORS.VALIDATION_ERROR.schema>;
  network_error: z.infer<typeof EVENT_CATALOG_ERRORS.NETWORK_ERROR.schema>;
  page_viewed: z.infer<typeof EVENT_CATALOG_NAVIGATION.PAGE_VIEW.schema>;
};

// ============================================================================
// Helper universal de tracking
// ============================================================================

export interface TrackOptions {
  /** Forca envio server-side (sem checar window). */
  serverSide?: boolean;
  /** Distinct ID custom (default = anon ou user id do singleton). */
  distinctId?: string;
  /** Timestamp custom (ms epoch). */
  timestamp?: number;
}

/**
 * trackEvent — entry point universal de analytics.
 *
 * Valida o payload contra o schema do evento e despacha para PostHog.
 * Falhas sao silenciosas (analytics nao deve quebrar UX).
 *
 * Em ambiente client: usa window.akasha.posthog singleton (batch /5s).
 * Em ambiente server: chama /capture diretamente (fire-and-forget).
 */
export function trackEvent<TName extends keyof EventSchemaMap>(
  name: TName,
  properties: EventSchemaMap[TName],
  options: TrackOptions = {}
): void {
  trackEventAny(name as string, properties as Record<string, unknown>, options);
}

/** Variant que aceita qualquer string (escape hatch). */
export function trackEventAny(
  name: string,
  properties: Record<string, unknown>,
  options: TrackOptions = {}
): void {
  const def = CATALOG_INDEX.get(name);
  if (!def) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(`[analytics] evento nao catalogado: ${name}`);
    }
    return;
  }

  // LGPD: bloqueia eventos high-sensitivity sem consentimento explicito.
  if (def.sensitivity === "high" && typeof window !== "undefined") {
    const consent = (window as unknown as { akasha?: { consent?: { analytics?: boolean } } })
      .akasha?.consent?.analytics;
    if (consent === false) return;
  }

  const parsed = def.schema.safeParse(properties);
  if (!parsed.success) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        `[analytics] payload invalido para ${name}:`,
        parsed.error.flatten()
      );
    }
    return;
  }

  // Despacha via singleton (client) ou captura direta (server).
  if (options.serverSide === true || typeof window === "undefined") {
    void import("./server").then(({ captureServerEventSafe }) => {
      captureServerEventSafe({
        name,
        properties: parsed.data as Record<string, unknown>,
        distinctId: options.distinctId,
        timestamp: options.timestamp,
      });
    });
  } else {
    const w = window as unknown as {
      akasha?: {
        posthog?: {
          capture: (e: {
            name: string;
            properties?: Record<string, unknown>;
            timestamp?: number;
          }) => void;
        };
      };
    };
    if (w.akasha?.posthog) {
      w.akasha.posthog.capture({
        name,
        properties: parsed.data as Record<string, unknown>,
        timestamp: options.timestamp,
      });
    } else {
      // Singleton ainda nao inicializou — descarta silenciosamente.
      if (process.env.NODE_ENV !== "production") {
        console.debug(`[analytics] posthog nao pronto, descartando ${name}`);
      }
    }
  }
}

// ============================================================================
// Helpers semanticos (typed wrappers para casos de uso frequentes)
// ============================================================================

export function trackSignup(
  userId: string,
  method: "email" | "google" | "apple" | "magic_link",
  tradition?: string
) {
  trackEvent("user_signed_up", { userId, method, tradition });
}

export function trackLogin(
  userId: string,
  method: "email" | "google" | "apple" | "magic_link"
) {
  trackEvent("user_logged_in", { userId, method });
}

export function trackLogout(userId?: string) {
  trackEvent("user_logged_out", { userId });
}

export function trackPostCreate(opts: {
  postId: string;
  authorId: string;
  postType: "text" | "image" | "link" | "quote" | "ritual";
  tradition?: string;
  groupSlug?: string;
  hasMedia: boolean;
  contentLength: number;
}) {
  trackEvent("post_created", opts);
}

export function trackPostLike(postId: string, authorId: string) {
  trackEvent("post_liked", { postId, authorId });
}

export function trackArticleView(opts: {
  articleId: string;
  slug: string;
  tradition?: string;
  source?: "feed" | "search" | "direct" | "related" | "bookmark";
}) {
  trackEvent("library_article_viewed", {
    articleId: opts.articleId,
    slug: opts.slug,
    tradition: opts.tradition,
    source: opts.source ?? "direct",
  });
}

export function trackAkashicMessageSent(opts: {
  messageLength: number;
  tradition?: string;
  ragUsed: boolean;
  tookMs?: number;
}) {
  trackEvent("akashic_message_sent", opts);
}

export function trackNewsletterSubscribe(opts: {
  emailHash: string;
  frequency: "WEEKLY" | "MONTHLY" | "NEVER";
  traditionsCount: number;
}) {
  trackEvent("newsletter_subscribed", opts);
}

export function trackGroupJoined(opts: {
  groupId: string;
  groupSlug: string;
  via: "search" | "invite" | "feed" | "direct";
}) {
  trackEvent("group_joined", opts);
}

export function trackApiError(opts: {
  endpoint: string;
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  statusCode: number;
  errorCode?: string;
}) {
  trackEvent("api_error", opts);
}

// ============================================================================
// Email hashing (utilitario LGPD)
// ============================================================================

/**
 * hashEmailForAnalytics — gera um hash estavel do email para uso em analytics.
 * NAO usar para autenticacao; e' apenas fingerprint.
 *
 * Implementacao: SHA-256 via Web Crypto (browser) ou node:crypto (server).
 * Retorna primeiros 16 chars do hex digest.
 */
export async function hashEmailForAnalytics(email: string): Promise<string> {
  const normalized = email.trim().toLowerCase();
  const data = new TextEncoder().encode(normalized);

  if (typeof crypto !== "undefined" && crypto.subtle) {
    try {
      const buffer = await crypto.subtle.digest("SHA-256", data);
      const hex = Array.from(new Uint8Array(buffer))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
      return hex.slice(0, 16);
    } catch {
      // Fallback abaixo
    }
  }

  // Fallback sync (Node)
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { createHash } = await import("node:crypto").catch(() => ({ createHash: null }) as never);
  if (createHash) {
    return createHash("sha256").update(normalized).digest("hex").slice(0, 16);
  }

  // Ultimo fallback: substring (sem crypto) — NUNCA usar em prod
  return normalized.slice(0, 16);
}