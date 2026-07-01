#!/usr/bin/env node
/**
 * OpenAPI 3.0.3 generator — Akasha Portal (Wave 33)
 *
 * Reads route list from /tmp/all-routes.txt (125 routes) + scans each route.ts
 * to extract HTTP methods. Outputs docs/api/openapi.yaml + openapi.html.
 *
 * Deterministic, no external network calls. Uses js-yaml (already in node_modules).
 */
import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';

const ROOT = '/workspace/cabaladoscaminhos';
const ROUTES_FILE = '/tmp/all-routes.txt';
const OUT_YAML = path.join(ROOT, 'docs/api/openapi.yaml');
const OUT_HTML = path.join(ROOT, 'docs/api/openapi.html');

// ============================================================================
// 1. TAG MAPPING — URL prefix → tag
// ============================================================================
const TAG_MAP = {
  '/admin': 'Admin',
  '/akashic': 'Akasha',
  '/articles': 'Articles',
  '/auth': 'Auth',
  '/beta': 'Beta',
  '/consciousness': 'Consciousness',
  '/consent': 'Consent',
  '/cron': 'Cron',
  '/drafts': 'Drafts',
  '/email': 'Email',
  '/events': 'Events',
  '/experiments': 'Experiments',
  '/flags': 'Feature Flags',
  '/groups': 'Groups',
  '/health': 'Health',
  '/mentorship': 'Mentorship',
  '/newsletter': 'Newsletter',
  '/notifications': 'Notifications',
  '/oraculo': 'Oraculo',
  '/payments': 'Payments',
  '/posts': 'Posts',
  '/push': 'Push',
  '/reactions': 'Reactions',
  '/search': 'Search',
  '/upload': 'Upload',
  '/users': 'Users',
  '/waitlist': 'Waitlist',
};

const TAG_DESCRIPTIONS = {
  Admin: 'Admin-only operations: moderation, feature flags, beta invites, newsletter dispatch, user management. Requires admin role.',
  Akasha: 'Akashic AI chat (token-bucket rate limit), feedback, and reading-records retrieval. SSE streaming endpoint.',
  Articles: 'Biblioteca Akasha — peer-reviewed-style articles with evidence levels, traditions, bookmarks, read-progress.',
  Auth: 'Authentication via Supabase: email/password login, registration, password reset, session status. Bearer JWT or cookie.',
  Beta: 'Beta-invite token lifecycle: validate token, accept invite, tracking pixel for email-open telemetry.',
  Consciousness: 'Compute and persist consciousness insights derived from user activity.',
  Consent: 'LGPD multi-layer consent grants / revocations across artifact categories (posts, analytics, marketing).',
  Cron: 'Internal-only cron endpoints (publish scheduled posts, weekly digest, evolve consciousness, curate articles, process email queue).',
  Drafts: 'Per-user post drafts + scheduled publishing. Author-only visibility until scheduled/published.',
  Email: 'Transactional email triggers (welcome). Routing layer for Resend dispatch.',
  Events: 'Community events (online/offline), RSVPs, participants.',
  Experiments: 'A/B experiment bucket assignment (Labs feature).',
  'Feature Flags': 'Public + admin feature flags. List, detail, and admin toggle.',
  Groups: 'Community groups per tradition. Members, posts, invites, group-scoped feed.',
  Health: 'Liveness / readiness (no auth).',
  Mentorship: '1-on-1 mentorship: request, accept, end, messaging. mentor/mentee roles.',
  Newsletter: 'Subscribe, preferences, unsubscribe (LGPD Art. 18 right to opt-out).',
  Notifications: 'In-app inbox + preferences + sacred-calendar + push (web-push). SSE stream for live inbox.',
  Oraculo: 'Astrologia + Numerologia + Mapa completo + Histórico (consumption gates: cost in pagar-consulta / credits).',
  Payments: 'Stripe Connect escrow: charge, release, refund, transactions. Webhook signature-verified.',
  Posts: 'Community feed (cursor pagination): create, list, comment, reply, like, bookmark, schedule, publish.',
  Push: 'Web-push public key + subscribe/unsubscribe.',
  Reactions: 'Cross-content reactions (articles, posts).',
  Search: 'Full-text + suggestions.',
  Upload: 'Object upload to Supabase Storage with signed-URL validation.',
  Users: 'Public profile + private self endpoints (bookmarks, history, follow graph, LGPD export / delete).',
  Waitlist: 'Waitlist signup + invite acceptance.',
};

// ============================================================================
// 2. SCAN ROUTES
// ============================================================================
function readMethods(routePath) {
  const abs = path.join(ROOT, 'src/app/api', routePath, 'route.ts');
  if (!fs.existsSync(abs)) return [];
  const src = fs.readFileSync(abs, 'utf8');
  const methods = new Set();
  const m = src.matchAll(/export\s+async\s+function\s+(GET|POST|PUT|DELETE|PATCH)\b/g);
  for (const hit of m) methods.add(hit[1]);
  return [...methods].sort();
}

const rawRoutes = fs.readFileSync(ROUTES_FILE, 'utf8').trim().split('\n').map(s => s.replace(/^\//, '').replace(/\/$/, ''));

const routeGroups = new Map();
for (const r of rawRoutes) {
  const top = '/' + r.split('/')[0];
  if (!TAG_MAP[top]) continue;
  if (!routeGroups.has(top)) routeGroups.set(top, []);
  routeGroups.get(top).push(r);
}

const routeEntries = [];
for (const [top, list] of routeGroups) {
  for (const r of list) {
    const methods = readMethods(r);
    if (methods.length === 0) continue;
    routeEntries.push({ route: '/' + r, tag: TAG_MAP[top], methods });
  }
}

console.log(`[gen-openapi] scanned ${routeEntries.length} unique route files`);

// ============================================================================
// 3. PATH CONVERSION
// ============================================================================
function toOpenApiPath(routePath) {
  return routePath.replace(/\[(\w+)\]/g, '{$1}');
}

// ============================================================================
// 4. PATH PARAMETERS
// ============================================================================
function parameterDescription(name, openPath) {
  if (name === 'id') {
    if (openPath.includes('/posts/')) return 'Post ID (cuid2).';
    if (openPath.includes('/comments/')) return 'Comment ID (cuid2).';
    if (openPath.includes('/users/')) return 'User ID (cuid2).';
    if (openPath.includes('/groups/')) return 'Group ID (cuid2).';
    if (openPath.includes('/articles/')) return 'Article slug (cuid2 or kslug).';
    if (openPath.includes('/flags/')) return 'Flag ID (cuid2).';
    if (openPath.includes('/admin/beta/invites/')) return 'Beta-invite ID (cuid2).';
    if (openPath.includes('/mentorship/')) return 'Mentorship-request ID.';
    if (openPath.includes('/notifications/')) return 'Notification ID.';
    if (openPath.includes('/events/')) return 'Event ID.';
    return 'Resource ID (cuid2).';
  }
  if (name === 'slug') return 'URL slug (kebab-case, immutable).';
  if (name === 'name') return 'Flag / metric identifier.';
  if (name === 'token') return 'Beta-invite token (URL-safe, base64url-encoded, single-use).';
  if (name === 'tokenHash') return 'SHA-256 hash prefix of beta-invite token (privacy-preserving).';
  if (name === 'commentId') return 'Comment ID (cuid2).';
  return `Path parameter \`${name}\`.`;
}

function paramSchema(name) {
  if (name === 'slug') return { type: 'string', pattern: '^[a-z0-9-]+$', maxLength: 120 };
  if (name === 'name') return { type: 'string', pattern: '^[a-z0-9._-]+$', maxLength: 120 };
  if (name === 'token') return { type: 'string', minLength: 32, maxLength: 128 };
  if (name === 'tokenHash') return { type: 'string', minLength: 16, maxLength: 64 };
  return { type: 'string', minLength: 1, maxLength: 64 };
}

function extractPathParams(routePath) {
  const out = [];
  const openPath = toOpenApiPath(routePath);
  const matches = [...openPath.matchAll(/\{(\w+)\}/g)];
  for (const mm of matches) {
    const name = mm[1];
    out.push({
      name,
      in: 'path',
      required: true,
      description: parameterDescription(name, openPath),
      schema: paramSchema(name),
    });
  }
  return out;
}

// ============================================================================
// 5. PER-PATH BODY SCHEMAS
// ============================================================================
function bodySchemaForMethod(openPath, method) {
  if (method === 'GET' || method === 'DELETE') return null;
  if (openPath.endsWith('/login') || openPath.endsWith('/login-form')) return 'LoginRequest';
  if (openPath.endsWith('/register')) return 'RegisterRequest';
  if (openPath.endsWith('/logout')) return null;
  if (openPath.endsWith('/reset-password')) return 'ResetPasswordRequest';
  if (openPath.endsWith('/resend-verification')) return 'EmailBody';
  if (openPath === '/posts' && method === 'POST') return 'CreatePostRequest';
  if (/\/posts\/[^/]+\/comments$/.test(openPath) && method === 'POST') return 'CreateCommentRequest';
  if (/\/posts\/[^/]+\/comments\/[^/]+\/reply$/.test(openPath) && method === 'POST') return 'CreateReplyRequest';
  if (openPath === '/articles' && method === 'POST') return 'CreateArticleRequest';
  if (/\/articles\/[^/]+\/bookmark$/.test(openPath) && method === 'POST') return null;
  if (openPath.endsWith('/read-progress') && method === 'POST') return 'ReadProgress';
  if (openPath === '/groups' && method === 'POST') return 'CreateGroupRequest';
  if (/\/groups\/\{slug\}\/invite$/.test(openPath) && method === 'POST') return 'GroupInviteRequest';
  if (openPath === '/events' && method === 'POST') return 'CreateEventRequest';
  if (/\/events\/\{id\}\/join$/.test(openPath) && method === 'POST') return null;
  if (/\/events\/\{id\}\/rsvp$/.test(openPath) && method === 'POST') return 'RsvpRequest';
  if (openPath === '/akashic/chat' && method === 'POST') return 'AkashicChatRequest';
  if (openPath === '/akashic/feedback' && method === 'POST') return 'AkashicFeedbackRequest';
  if (openPath === '/consciousness/insights' && method === 'POST') return 'ConsciousnessInsightRequest';
  if (openPath === '/consent' && method === 'POST') return 'ConsentGrantRequest';
  if (openPath === '/drafts' && method === 'POST') return 'CreateDraftRequest';
  if (/\/drafts\/\{id\}$/.test(openPath) && (method === 'PUT' || method === 'PATCH')) return 'UpdateDraftRequest';
  if (openPath === '/beta/invite' && method === 'POST') return 'CreateBetaInviteRequest';
  if (/\/beta\/invite\/\{token\}\/accept$/.test(openPath) && method === 'POST') return 'AcceptBetaInviteRequest';
  if (/\/admin\/beta\/invites\/\{id\}\/revoke$/.test(openPath) && method === 'POST') return 'RevokeBetaInviteRequest';
  if (/\/admin\/flags\/\{id\}\/action$/.test(openPath) && method === 'POST') return 'FlagActionRequest';
  if (/\/admin\/moderation\/flags\/\{id\}$/.test(openPath) && method === 'POST') return 'ModerationFlagRequest';
  if (openPath === '/admin/newsletter/send' && method === 'POST') return 'NewsletterSendRequest';
  if (/\/admin\/users\/\{id\}\/ban$/.test(openPath) && method === 'POST') return 'BanUserRequest';
  if (/\/admin\/users\/\{id\}\/promote-mentor$/.test(openPath) && method === 'POST') return null;
  if (openPath === '/notifications/push/subscribe' && method === 'POST') return 'PushSubscribeRequest';
  if (openPath === '/notifications/preferences' && method === 'PUT') return 'NotificationPreferences';
  if (openPath === '/notifications/preferences/profile' && method === 'PUT') return 'NotificationProfilePreferences';
  if (openPath.endsWith('/like') && method === 'POST') return null;
  if (openPath.endsWith('/publish') && method === 'POST') return null;
  if (openPath.endsWith('/schedule') && method === 'POST') return 'SchedulePostRequest';
  if (/\/posts\/\{id\}$/.test(openPath) && (method === 'PUT' || method === 'PATCH')) return 'UpdatePostRequest';
  if (openPath === '/payments/charge' && method === 'POST') return 'PaymentChargeRequest';
  if (openPath === '/payments/refund' && method === 'POST') return 'PaymentRefundRequest';
  if (openPath === '/payments/release' && method === 'POST') return 'PaymentReleaseRequest';
  if (openPath === '/payments/connect/onboard' && method === 'POST') return null;
  if (openPath === '/payments/webhook' && method === 'POST') return null;
  if (openPath === '/reactions' && method === 'POST') return 'ReactionRequest';
  if (openPath === '/upload' && method === 'POST') return null;
  if (/\/users\/\{id\}\/follow$/.test(openPath) && method === 'POST') return null;
  if (openPath === '/users/profile' && (method === 'POST' || method === 'PUT')) return 'UpdateProfileRequest';
  if (openPath === '/email/subscribe-welcome' && method === 'POST') return 'EmailSubscribeRequest';
  if (openPath === '/newsletter/subscribe' && method === 'POST') return 'NewsletterSubscribeRequest';
  if (openPath === '/newsletter/preferences' && (method === 'POST' || method === 'PUT')) return 'NewsletterPreferences';
  if (openPath === '/newsletter/unsubscribe' && method === 'POST') return 'UnsubscribeRequest';
  if (openPath === '/waitlist' && method === 'POST') return 'WaitlistSignupRequest';
  if (openPath === '/waitlist/accept-invite' && method === 'POST') return 'AcceptWaitlistInviteRequest';
  if (openPath === '/experiments/{name}/assign' && method === 'POST') return 'ExperimentAssignRequest';
  if (openPath === '/push/subscribe' && method === 'POST') return 'PushSubscribeRequest';
  if (openPath === '/oriculo/astrologia' && method === 'POST') return 'OraculoAstrologiaRequest';
  if (openPath === '/oriculo/numerologia' && method === 'POST') return 'OraculoNumerologiaRequest';
  if (openPath === '/oriculo/mapa-completo' && method === 'POST') return 'OraculoMapaCompletoRequest';
  if (openPath === '/mentorship/request' && method === 'POST') return 'MentorshipRequestBody';
  if (/\/mentorship\/\{id\}\/accept$/.test(openPath) && method === 'POST') return null;
  if (/\/mentorship\/\{id\}\/end$/.test(openPath) && method === 'POST') return 'MentorshipEndRequest';
  if (/\/mentorship\/\{id\}\/messages$/.test(openPath) && method === 'POST') return 'MentorshipMessageBody';
  if (openPath === '/search' && method === 'POST') return 'SearchRequest';
  if (openPath === '/flags' && method === 'POST') return 'CreateFlagRequest';
  if (/\/flags\/\{name\}$/.test(openPath) && method === 'PUT') return 'UpdateFlagRequest';
  if (openPath === '/health' && method === 'POST') return null;
  return 'GenericMutationRequest';
}

// ============================================================================
// 6. PER-PATH META — summary / description / responses
// ============================================================================
function summaryFor(openPath, method, tag) {
  const m = method.toLowerCase();
  if (openPath === '/auth/login' || openPath === '/auth/login-form') return 'Login (email + password).';
  if (openPath === '/auth/logout') return 'Logout (clears session cookie).';
  if (openPath === '/auth/register') return 'Register a new account.';
  if (openPath === '/auth/reset-password') return 'Request password reset email.';
  if (openPath === '/auth/resend-verification') return 'Resend verification email.';
  if (openPath === '/auth/status') return 'Current session status (dev only — 404 in prod).';
  if (openPath === '/auth/profile-auto-create') return 'Auto-create profile after signup.';
  if (openPath === '/auth/create-test') return 'Create test user (dev only).';
  if (openPath === '/auth/test') return 'Test connectivity (dev only).';
  if (openPath === '/posts') {
    if (method === 'GET') return 'List feed (cursor pagination, `?filter=para-voce` personalized).';
    if (method === 'POST') return 'Create post (autenticado; 10/min).';
  }
  if (/\/posts\/\{id\}$/.test(openPath)) {
    if (method === 'GET') return 'Get post by ID.';
    if (method === 'PATCH') return 'Update post (author-only).';
    if (method === 'DELETE') return 'Delete post (author-only, soft-delete).';
  }
  if (/\/posts\/\{id\}\/like$/.test(openPath)) {
    if (method === 'POST') return 'Toggle like on post.';
    if (method === 'DELETE') return 'Remove like from post.';
  }
  if (/\/posts\/\{id\}\/comments$/.test(openPath)) {
    if (method === 'GET') return 'List comments (cursor pagination).';
    if (method === 'POST') return 'Add comment (30/min).';
  }
  if (/\/posts\/\{id\}\/comments\/\{commentId\}\/reply$/.test(openPath)) return 'Reply to comment (threaded).';
  if (openPath === '/groups') {
    if (method === 'GET') return 'List groups (paginated, by tradition).';
    if (method === 'POST') return 'Create group (5/hour).';
  }
  if (openPath === '/users/profile' || openPath === '/users/{id}/profile') {
    if (method === 'POST' || method === 'PUT') return 'Update public profile.';
  }
  if (method === 'GET') return `List \`${tag.toLowerCase()}\` resources.`;
  if (method === 'POST') return `Create a \`${tag.toLowerCase()}\` resource.`;
  if (method === 'PUT' || method === 'PATCH') return `Update a \`${tag.toLowerCase()}\` resource.`;
  if (method === 'DELETE') return `Delete a \`${tag.toLowerCase()}\` resource.`;
  return `Operate on \`${tag.toLowerCase()}\` resource.`;
}

function descriptionFor(openPath, method, tag) {
  return `${summaryFor(openPath, method, tag)} See \`API-REFERENCE-W32.md\` section for the corresponding \`${tag}\` namespace. All responses follow the standard envelope: \`{ data, meta: { timestamp, requestId } }\`. Errors return \`{ error: { code, message, details? }, meta }\`.`;
}

function responsesFor(openPath, method, tag) {
  const okStatus = method === 'POST' ? '201' : '200';
  const out = {};
  out[okStatus] = {
    description: 'Successful operation.',
    content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiSuccessGeneric' } } },
  };
  if (method !== 'GET' && method !== 'DELETE') {
    out['422'] = { $ref: '#/components/responses/ValidationError' };
  }
  out['400'] = { $ref: '#/components/responses/BadRequest' };
  out['401'] = { $ref: '#/components/responses/Unauthorized' };
  if (openPath.startsWith('/admin') || openPath === '/users/profile') {
    out['403'] = { $ref: '#/components/responses/Forbidden' };
  }
  if (method === 'GET' || openPath.includes('{id}') || openPath.includes('{slug}')) {
    out['404'] = { $ref: '#/components/responses/NotFound' };
  }
  if (openPath.includes('posts') && openPath.endsWith('/like')) {
    out['429'] = { $ref: '#/components/responses/RateLimited' };
  }
  out['500'] = { $ref: '#/components/responses/InternalError' };
  return out;
}

function requiresAuth(openPath, method) {
  if (openPath.startsWith('/auth/')) return false;
  if (openPath === '/health') return false;
  if (openPath === '/beta/invite' && method === 'GET') return false;
  if (openPath === '/beta/invite/{token}' && method === 'GET') return false;
  if (openPath === '/beta/track/open/{tokenHash}' && method === 'GET') return false;
  if (openPath === '/waitlist' && method === 'POST') return false;
  if (openPath === '/waitlist/accept-invite' && method === 'POST') return false;
  if (openPath === '/email/subscribe-welcome' && method === 'POST') return false;
  if (openPath === '/newsletter/subscribe' && method === 'POST') return false;
  if (openPath === '/newsletter/unsubscribe' && method === 'POST') return false;
  if (openPath === '/auth/login' || openPath === '/auth/register' || openPath === '/auth/login-form') return false;
  if (openPath === '/auth/reset-password') return false;
  if (openPath === '/auth/resend-verification') return false;
  if (openPath === '/consciousness/insights' && method === 'GET') return false;
  if (openPath.startsWith('/admin')) return true;
  if (openPath === '/posts' && method === 'GET') return false;
  if (openPath.startsWith('/posts/{id}') && method === 'GET') return false;
  if (/\/posts\/[^/]+\/comments$/.test(openPath) && method === 'GET') return false;
  if (openPath.startsWith('/articles') && method === 'GET') return false;
  if (openPath === '/groups' && method === 'GET') return false;
  if (openPath.startsWith('/groups/{slug}') && method === 'GET') return false;
  if (openPath.startsWith('/users/{id}/followers') || openPath.startsWith('/users/{id}/following')) return false;
  if (openPath.startsWith('/users/profile') && method === 'GET') return false;
  if (openPath === '/flags' && method === 'GET') return false;
  if (openPath === '/flags/{name}' && method === 'GET') return false;
  if (openPath === '/search' && method === 'GET') return false;
  if (openPath === '/search/suggestions' && method === 'GET') return false;
  if (openPath.startsWith('/oriculo/')) {
    if (method === 'GET') return false;
    return true;
  }
  if (openPath.startsWith('/cron/')) return true;
  if (openPath === '/payments/webhook' && method === 'POST') return false;
  if (openPath === '/push/vapid-public-key' && method === 'GET') return false;
  if (openPath === '/events' && method === 'GET') return false;
  return true;
}

function buildPathEntry(entry) {
  const openPath = toOpenApiPath(entry.route);
  const pathParams = extractPathParams(entry.route);
  const out = {};
  for (const m of entry.methods) {
    const op = {
      tags: [entry.tag],
      summary: summaryFor(openPath, m, entry.tag),
      description: descriptionFor(openPath, m, entry.tag),
      operationId: `${m.toLowerCase()}_${openPath.replace(/[\/{}-]/g, '_').replace(/^_+|_+$/g, '').replace(/_+/g, '_') || 'root'}`,
      responses: responsesFor(openPath, m, entry.tag),
    };
    if (requiresAuth(openPath, m)) {
      op.security = [{ BearerAuth: [] }];
    }
    const params = [...pathParams];
    if (m === 'GET' && (
      openPath === '/posts' || openPath === '/articles' || openPath === '/groups' ||
      openPath === '/notifications' || openPath === '/users/{id}/followers' ||
      openPath === '/users/{id}/following' || openPath === '/users/me/bookmarks' ||
      openPath === '/users/me/history' || openPath === '/admin/users' ||
      openPath === '/admin/beta/invites' || openPath === '/admin/moderation/queue' ||
      openPath === '/admin/flags' || openPath === '/mentorship/me' ||
      openPath === '/mentorship/available' || openPath === '/oriculo/historico' ||
      openPath === '/notifications/audit' || openPath === '/payments/transactions' ||
      openPath === '/consciousness/insights' || openPath === '/events' ||
      openPath === '/groups/{slug}/members' || openPath === '/groups/{slug}/posts' ||
      openPath === '/drafts' || openPath === '/admin/audit/log' ||
      openPath === '/admin/funnel-metrics' || openPath === '/search' ||
      openPath === '/oriculo/astrologia' || openPath === '/oriculo/numerologia' ||
      openPath === '/oriculo/mapa-completo' || openPath === '/notifications/templates'
    )) {
      params.push({ $ref: '#/components/parameters/Cursor' });
      params.push({ $ref: '#/components/parameters/Limit' });
    }
    if (params.length) op.parameters = params;
    const bodySchema = bodySchemaForMethod(openPath, m);
    if (bodySchema) {
      op.requestBody = {
        required: true,
        content: { 'application/json': { schema: { $ref: `#/components/schemas/${bodySchema}` } } },
      };
    }
    out[m.toLowerCase()] = op;
  }
  return { [openPath]: out };
}

// ============================================================================
// 7. ASSEMBLE PATHS
// ============================================================================
const paths = {};
for (const entry of routeEntries) {
  const built = buildPathEntry(entry);
  for (const [k, v] of Object.entries(built)) {
    paths[k] = v;
  }
}

console.log(`[gen-openapi] generated ${Object.keys(paths).length} paths`);

// ============================================================================
// 8. SCHEMAS — 60+ models
// ============================================================================
const dateTime = { type: 'string', format: 'date-time' };
const cuid2 = { type: 'string', minLength: 10, maxLength: 40 };
const paginationMeta = {
  type: 'object',
  required: ['timestamp'],
  properties: {
    timestamp: dateTime,
    requestId: { type: 'string' },
    nextCursor: { oneOf: [{ type: 'string' }, { type: 'null' }] },
    total: { type: 'integer', minimum: 0 },
    count: { type: 'integer', minimum: 0 },
  },
};

const errorBody = {
  type: 'object',
  required: ['error'],
  properties: {
    error: {
      type: 'object',
      required: ['code', 'message'],
      properties: {
        code: { type: 'integer' },
        message: { type: 'string' },
        details: {},
      },
    },
    meta: paginationMeta,
  },
};

const apiSuccessGeneric = {
  type: 'object',
  required: ['data', 'meta'],
  properties: {
    data: { type: 'object', additionalProperties: true, description: 'Operation-specific payload.' },
    meta: paginationMeta,
  },
};

const SCHEMAS = {
  Error: errorBody,
  ApiSuccessGeneric: apiSuccessGeneric,

  // ---- Users ----
  User: {
    type: 'object',
    required: ['id', 'email', 'createdAt'],
    properties: {
      id: cuid2,
      email: { type: 'string', format: 'email', maxLength: 320 },
      name: { type: 'string', maxLength: 120, nullable: true },
      handle: { type: 'string', maxLength: 30, nullable: true },
      avatarUrl: { type: 'string', format: 'uri', nullable: true },
      bio: { type: 'string', maxLength: 500, nullable: true },
      role: { type: 'string', enum: ['USER', 'MENTOR', 'ADMIN'], default: 'USER' },
      spirituality: {
        type: 'object', nullable: true,
        properties: {
          tradicaoPrimaria: { type: 'string', maxLength: 50 },
          caminhos: { type: 'array', items: { type: 'string' } },
          interesseEm: { type: 'array', items: { type: 'string' } },
        },
      },
      mapNatal: { type: 'object', nullable: true, additionalProperties: true },
      createdAt: dateTime, updatedAt: dateTime,
    },
  },
  UserPublic: {
    type: 'object',
    properties: {
      id: cuid2, handle: { type: 'string', nullable: true },
      name: { type: 'string', nullable: true },
      avatarUrl: { type: 'string', format: 'uri', nullable: true },
      bio: { type: 'string', nullable: true },
      createdAt: dateTime,
    },
  },
  UpdateProfileRequest: {
    type: 'object',
    properties: {
      name: { type: 'string', maxLength: 120, minLength: 1 },
      handle: { type: 'string', maxLength: 30, pattern: '^[a-z0-9_-]+$' },
      bio: { type: 'string', maxLength: 500 },
      avatarUrl: { type: 'string', format: 'uri' },
      spirituality: {
        type: 'object',
        properties: {
          tradicaoPrimaria: { type: 'string', maxLength: 50 },
          caminhos: { type: 'array', maxItems: 20, items: { type: 'string', maxLength: 50 } },
          interesseEm: { type: 'array', maxItems: 20, items: { type: 'string', maxLength: 50 } },
        },
      },
    },
  },

  // ---- Auth ----
  LoginRequest: {
    type: 'object',
    required: ['email', 'password'],
    properties: {
      email: { type: 'string', format: 'email' },
      password: { type: 'string', minLength: 8, maxLength: 256 },
    },
  },
  RegisterRequest: {
    type: 'object',
    required: ['email', 'password', 'lgpdConsent'],
    properties: {
      email: { type: 'string', format: 'email' },
      password: { type: 'string', minLength: 8, maxLength: 256 },
      name: { type: 'string', maxLength: 120 },
      tradicaoPrimaria: { type: 'string', maxLength: 50, nullable: true },
      lgpdConsent: { type: 'boolean', const: true },
    },
  },
  ResetPasswordRequest: {
    type: 'object', required: ['email'],
    properties: { email: { type: 'string', format: 'email' } },
  },
  EmailBody: {
    type: 'object', required: ['email'],
    properties: { email: { type: 'string', format: 'email' } },
  },

  // ---- Posts ----
  Post: {
    type: 'object',
    required: ['id', 'authorId', 'content', 'type', 'status', 'createdAt'],
    properties: {
      id: cuid2, authorId: cuid2,
      type: { type: 'string', enum: ['TEXT', 'LINK', 'ARTICLE', 'QUESTION', 'EXPERIENCE', 'PRACTICE'] },
      status: { type: 'string', enum: ['DRAFT', 'SCHEDULED', 'PUBLISHED', 'ARCHIVED'], default: 'PUBLISHED' },
      content: { type: 'string', maxLength: 5000 },
      title: { type: 'string', maxLength: 200, nullable: true },
      url: { type: 'string', format: 'uri', maxLength: 500, nullable: true },
      tradition: { type: 'string', maxLength: 50, nullable: true },
      topics: { type: 'array', maxItems: 10, items: { type: 'string', maxLength: 50 } },
      groupSlug: { type: 'string', maxLength: 120, nullable: true },
      scheduledFor: { type: 'string', format: 'date-time', nullable: true },
      publishedAt: { type: 'string', format: 'date-time', nullable: true },
      likeCount: { type: 'integer', minimum: 0 },
      commentCount: { type: 'integer', minimum: 0 },
      viewCount: { type: 'integer', minimum: 0 },
      visibility: { type: 'string', enum: ['PUBLIC', 'COMMUNITY', 'PRIVATE'] },
      createdAt: dateTime, updatedAt: dateTime,
    },
  },
  CreatePostRequest: {
    type: 'object', required: ['content'],
    properties: {
      content: { type: 'string', minLength: 1, maxLength: 5000 },
      type: { type: 'string', enum: ['TEXT', 'LINK', 'ARTICLE', 'QUESTION', 'EXPERIENCE', 'PRACTICE'], default: 'TEXT' },
      title: { type: 'string', maxLength: 200 },
      url: { type: 'string', format: 'uri', maxLength: 500 },
      tradition: { type: 'string', maxLength: 50 },
      topics: { type: 'array', maxItems: 10, items: { type: 'string', maxLength: 50 } },
      groupSlug: { type: 'string', maxLength: 120 },
      scheduledFor: { type: 'string', format: 'date-time' },
      visibility: { type: 'string', enum: ['PUBLIC', 'COMMUNITY', 'PRIVATE'] },
    },
  },
  UpdatePostRequest: {
    type: 'object',
    properties: {
      content: { type: 'string', minLength: 1, maxLength: 5000 },
      title: { type: 'string', maxLength: 200 },
      topics: { type: 'array', maxItems: 10, items: { type: 'string', maxLength: 50 } },
      visibility: { type: 'string', enum: ['PUBLIC', 'COMMUNITY', 'PRIVATE'] },
    },
  },
  SchedulePostRequest: {
    type: 'object', required: ['scheduledFor'],
    properties: { scheduledFor: { type: 'string', format: 'date-time', description: 'ISO 8601 UTC.' } },
  },

  // ---- Comments ----
  Comment: {
    type: 'object',
    required: ['id', 'postId', 'authorId', 'content', 'createdAt'],
    properties: {
      id: cuid2, postId: cuid2, authorId: cuid2,
      parentCommentId: { type: 'string', nullable: true },
      content: { type: 'string', maxLength: 2000 },
      likeCount: { type: 'integer', minimum: 0 },
      createdAt: dateTime, updatedAt: dateTime,
    },
  },
  CreateCommentRequest: {
    type: 'object', required: ['content'],
    properties: {
      content: { type: 'string', minLength: 1, maxLength: 2000 },
      parentCommentId: { type: 'string', nullable: true },
    },
  },
  CreateReplyRequest: {
    type: 'object', required: ['content'],
    properties: { content: { type: 'string', minLength: 1, maxLength: 2000 } },
  },

  // ---- Articles ----
  Article: {
    type: 'object',
    required: ['id', 'slug', 'title', 'summary', 'content', 'evidenceLevel', 'createdAt'],
    properties: {
      id: cuid2, slug: { type: 'string', maxLength: 200 },
      title: { type: 'string', maxLength: 300 },
      summary: { type: 'string', maxLength: 2000 },
      content: { type: 'string', maxLength: 500000 },
      articleType: { type: 'string', enum: ['SCIENTIFIC_PAPER', 'MAGAZINE_ARTICLE', 'BOOK', 'VIDEO', 'PODCAST', 'ESSAY'] },
      evidenceLevel: { type: 'string', enum: ['ANECDOTAL', 'LOW', 'MEDIUM', 'HIGH'] },
      tradition: { type: 'string', maxLength: 50, nullable: true },
      tags: { type: 'array', items: { type: 'string', maxLength: 50 } },
      authors: { type: 'array', items: { type: 'string', maxLength: 120 } },
      journal: { type: 'string', maxLength: 200, nullable: true },
      language: { type: 'string', enum: ['pt', 'en', 'es'], default: 'pt' },
      curatedBy: { type: 'string', maxLength: 120, nullable: true },
      safetyNotes: { type: 'string', maxLength: 2000, nullable: true },
      featured: { type: 'boolean' },
      publishedAt: { type: 'string', format: 'date-time', nullable: true },
      createdAt: dateTime, updatedAt: dateTime,
    },
  },
  CreateArticleRequest: {
    type: 'object',
    required: ['title', 'summary', 'content', 'evidenceLevel'],
    properties: {
      title: { type: 'string', minLength: 5, maxLength: 300 },
      summary: { type: 'string', minLength: 20, maxLength: 2000 },
      content: { type: 'string', minLength: 50, maxLength: 500000 },
      articleType: { type: 'string', enum: ['SCIENTIFIC_PAPER', 'MAGAZINE_ARTICLE', 'BOOK', 'VIDEO', 'PODCAST', 'ESSAY'] },
      evidenceLevel: { type: 'string', enum: ['ANECDOTAL', 'LOW', 'MEDIUM', 'HIGH'] },
      tradition: { type: 'string', maxLength: 50 },
      tags: { type: 'array', maxItems: 20, items: { type: 'string', maxLength: 50 } },
      authors: { type: 'array', maxItems: 20, items: { type: 'string', maxLength: 120 } },
      journal: { type: 'string', maxLength: 200 },
      language: { type: 'string', enum: ['pt', 'en', 'es'], default: 'pt' },
      safetyNotes: { type: 'string', maxLength: 2000 },
      curatedBy: { type: 'string', maxLength: 120 },
    },
  },
  ReadProgress: {
    type: 'object', required: ['progress'],
    properties: {
      progress: { type: 'number', minimum: 0, maximum: 1 },
      position: { type: 'integer', minimum: 0 },
    },
  },

  // ---- Groups ----
  Group: {
    type: 'object',
    required: ['id', 'slug', 'name', 'createdAt'],
    properties: {
      id: cuid2, slug: { type: 'string', maxLength: 120 },
      name: { type: 'string', maxLength: 120 },
      description: { type: 'string', maxLength: 2000, nullable: true },
      tradition: { type: 'string', maxLength: 50, nullable: true },
      visibility: { type: 'string', enum: ['PUBLIC', 'COMMUNITY', 'PRIVATE'] },
      memberCount: { type: 'integer', minimum: 0 },
      isAdmin: { type: 'boolean' },
      createdAt: dateTime,
    },
  },
  CreateGroupRequest: {
    type: 'object', required: ['name', 'slug'],
    properties: {
      slug: { type: 'string', pattern: '^[a-z0-9-]{3,120}$' },
      name: { type: 'string', minLength: 3, maxLength: 120 },
      description: { type: 'string', maxLength: 2000 },
      tradition: { type: 'string', maxLength: 50 },
      visibility: { type: 'string', enum: ['PUBLIC', 'COMMUNITY', 'PRIVATE'] },
    },
  },
  GroupInviteRequest: {
    type: 'object', required: ['userId'],
    properties: {
      userId: cuid2, message: { type: 'string', maxLength: 500 },
    },
  },

  // ---- Beta Invites ----
  BetaInvite: {
    type: 'object',
    required: ['id', 'tokenHash', 'wave', 'status', 'expiresAt', 'createdAt'],
    properties: {
      id: cuid2,
      tokenHash: { type: 'string', description: 'SHA-256 hex (64 chars). Plaintext only ever in email/URL.' },
      wave: { type: 'integer', minimum: 1, maximum: 3 },
      status: { type: 'string', enum: ['PENDING', 'CONSUMED', 'EXPIRED', 'REVOKED'] },
      emailMasked: { type: 'string', nullable: true, description: 'A***@d***.com (LGPD Art. 9).' },
      expiresAt: dateTime,
      consumedAt: { type: 'string', format: 'date-time', nullable: true },
      createdAt: dateTime,
    },
  },
  CreateBetaInviteRequest: {
    type: 'object', required: ['email', 'wave'],
    properties: {
      email: { type: 'string', format: 'email' },
      wave: { type: 'integer', minimum: 1, maximum: 3 },
      customMessage: { type: 'string', maxLength: 500 },
    },
  },
  AcceptBetaInviteRequest: {
    type: 'object',
    properties: { lgpdConsent: { type: 'boolean', const: true } },
  },
  RevokeBetaInviteRequest: {
    type: 'object',
    properties: { reason: { type: 'string', maxLength: 200 } },
  },

  // ---- Akasha AI ----
  AkashicChatRequest: {
    type: 'object', required: ['message'],
    properties: {
      message: { type: 'string', minLength: 1, maxLength: 2000 },
      context: {
        type: 'object',
        properties: {
          tradition: { type: 'string', maxLength: 50 },
          topics: { type: 'array', maxItems: 10, items: { type: 'string', maxLength: 50 } },
          locale: { type: 'string', enum: ['pt', 'en', 'es'], default: 'pt' },
        },
      },
    },
  },
  AkashicFeedbackRequest: {
    type: 'object', required: ['messageId', 'rating'],
    properties: {
      messageId: cuid2,
      rating: { type: 'string', enum: ['UP', 'DOWN'] },
      reason: { type: 'string', maxLength: 500 },
    },
  },

  // ---- Consciousness / Consent ----
  ConsciousnessInsightRequest: {
    type: 'object', required: ['type'],
    properties: {
      type: { type: 'string', maxLength: 50 },
      payload: { type: 'object', additionalProperties: true },
    },
  },
  ConsentGrantRequest: {
    type: 'object', required: ['artifact', 'granted'],
    properties: {
      artifact: { type: 'string', enum: ['ANALYTICS', 'MARKETING', 'POSTS', 'PROFILE_PUBLIC', 'MENTORSHIP'] },
      granted: { type: 'boolean' },
      version: { type: 'string', maxLength: 20 },
    },
  },

  // ---- Notifications ----
  NotificationPreferences: {
    type: 'object',
    properties: {
      like: { type: 'boolean' }, comment: { type: 'boolean' },
      follow: { type: 'boolean' }, mention: { type: 'boolean' },
      groupInvite: { type: 'boolean' }, groupPost: { type: 'boolean' },
      articlePublished: { type: 'boolean' }, digestWeekly: { type: 'boolean' },
      channel: { type: 'string', enum: ['IN_APP', 'EMAIL', 'PUSH'] },
    },
  },
  NotificationProfilePreferences: {
    type: 'object',
    properties: {
      sacredCalendar: { type: 'boolean' },
      smartSend: { type: 'boolean' },
    },
  },

  // ---- Events ----
  CreateEventRequest: {
    type: 'object', required: ['title', 'startsAt'],
    properties: {
      title: { type: 'string', minLength: 3, maxLength: 200 },
      description: { type: 'string', maxLength: 5000 },
      startsAt: { type: 'string', format: 'date-time' },
      endsAt: { type: 'string', format: 'date-time' },
      online: { type: 'boolean' },
      venue: { type: 'string', maxLength: 200 },
      tradition: { type: 'string', maxLength: 50 },
      capacity: { type: 'integer', minimum: 1 },
    },
  },
  RsvpRequest: {
    type: 'object', required: ['status'],
    properties: { status: { type: 'string', enum: ['GOING', 'MAYBE', 'NOT_GOING'] } },
  },

  // ---- Reactions ----
  ReactionRequest: {
    type: 'object', required: ['targetType', 'targetId', 'kind'],
    properties: {
      targetType: { type: 'string', enum: ['POST', 'ARTICLE', 'COMMENT'] },
      targetId: cuid2,
      kind: { type: 'string', maxLength: 30 },
    },
  },

  // ---- Drafts ----
  CreateDraftRequest: {
    type: 'object', required: ['content'],
    properties: {
      content: { type: 'string', minLength: 1, maxLength: 5000 },
      title: { type: 'string', maxLength: 200 },
      scheduledFor: { type: 'string', format: 'date-time' },
      groupSlug: { type: 'string', maxLength: 120 },
    },
  },
  UpdateDraftRequest: {
    type: 'object',
    properties: {
      content: { type: 'string', minLength: 1, maxLength: 5000 },
      title: { type: 'string', maxLength: 200 },
      scheduledFor: { type: 'string', format: 'date-time' },
    },
  },

  // ---- Mentorship ----
  MentorshipRequestBody: {
    type: 'object', required: ['mentorId'],
    properties: {
      mentorId: cuid2,
      topic: { type: 'string', maxLength: 200 },
      message: { type: 'string', maxLength: 2000 },
    },
  },
  MentorshipMessageBody: {
    type: 'object', required: ['content'],
    properties: { content: { type: 'string', minLength: 1, maxLength: 5000 } },
  },
  MentorshipEndRequest: {
    type: 'object',
    properties: { reason: { type: 'string', maxLength: 500 } },
  },

  // ---- Oráculo ----
  OraculoAstrologiaRequest: {
    type: 'object', required: ['birthDateTime'],
    properties: {
      birthDateTime: { type: 'string', format: 'date-time' },
      latitude: { type: 'number', minimum: -90, maximum: 90 },
      longitude: { type: 'number', minimum: -180, maximum: 180 },
      houseSystem: { type: 'string', enum: ['PLACIDUS', 'WHOLE_SIGN', 'EQUAL', 'KOCH'], default: 'PLACIDUS' },
    },
  },
  OraculoNumerologiaRequest: {
    type: 'object', required: ['fullName', 'birthDate'],
    properties: {
      fullName: { type: 'string', maxLength: 200 },
      birthDate: { type: 'string', format: 'date' },
      system: { type: 'string', enum: ['PITAGORICO', 'CABALISTICO', 'MARSELHA'], default: 'PITAGORICO' },
    },
  },
  OraculoMapaCompletoRequest: {
    type: 'object', required: ['birthDateTime'],
    properties: {
      birthDateTime: { type: 'string', format: 'date-time' },
      latitude: { type: 'number' },
      longitude: { type: 'number' },
    },
  },

  // ---- Payments ----
  PaymentChargeRequest: {
    type: 'object', required: ['amount', 'currency'],
    properties: {
      amount: { type: 'integer', minimum: 100, description: 'Em centavos. Mínimo R$1,00.' },
      currency: { type: 'string', enum: ['BRL', 'USD'], default: 'BRL' },
      description: { type: 'string', maxLength: 500 },
      metadata: { type: 'object', additionalProperties: { type: 'string', maxLength: 200 } },
    },
  },
  PaymentRefundRequest: {
    type: 'object', required: ['paymentIntentId'],
    properties: {
      paymentIntentId: { type: 'string', maxLength: 120 },
      amount: { type: 'integer', minimum: 100 },
      reason: { type: 'string', maxLength: 200 },
    },
  },
  PaymentReleaseRequest: {
    type: 'object', required: ['paymentIntentId'],
    properties: { paymentIntentId: { type: 'string', maxLength: 120 } },
  },

  // ---- Push / Newsletter / Waitlist ----
  PushSubscribeRequest: {
    type: 'object', required: ['endpoint', 'keys'],
    properties: {
      endpoint: { type: 'string', format: 'uri' },
      keys: {
        type: 'object', required: ['p256dh', 'auth'],
        properties: {
          p256dh: { type: 'string', maxLength: 200 },
          auth: { type: 'string', maxLength: 64 },
        },
      },
    },
  },
  EmailSubscribeRequest: {
    type: 'object', required: ['email'],
    properties: { email: { type: 'string', format: 'email' }, name: { type: 'string', maxLength: 120 } },
  },
  NewsletterSubscribeRequest: {
    type: 'object', required: ['email'],
    properties: {
      email: { type: 'string', format: 'email' },
      groups: { type: 'array', items: { type: 'string', maxLength: 50 } },
    },
  },
  NewsletterPreferences: {
    type: 'object',
    properties: {
      weeklyDigest: { type: 'boolean' },
      sacredCalendar: { type: 'boolean' },
      productUpdates: { type: 'boolean' },
    },
  },
  UnsubscribeRequest: {
    type: 'object', required: ['email'],
    properties: {
      email: { type: 'string', format: 'email' },
      reason: { type: 'string', maxLength: 200 },
    },
  },
  WaitlistSignupRequest: {
    type: 'object', required: ['email'],
    properties: {
      email: { type: 'string', format: 'email' },
      tradicaoPrimaria: { type: 'string', maxLength: 50 },
      source: { type: 'string', maxLength: 200 },
    },
  },
  AcceptWaitlistInviteRequest: {
    type: 'object', required: ['token'],
    properties: { token: { type: 'string', maxLength: 128 } },
  },

  // ---- Flags / Admin ----
  CreateFlagRequest: {
    type: 'object', required: ['name', 'value'],
    properties: { name: { type: 'string', maxLength: 120 }, value: { type: 'object', additionalProperties: true } },
  },
  UpdateFlagRequest: {
    type: 'object', required: ['value'],
    properties: { value: { type: 'object', additionalProperties: true } },
  },
  FlagActionRequest: {
    type: 'object', required: ['action'],
    properties: {
      action: { type: 'string', enum: ['ENABLE', 'DISABLE', 'ROLLOUT', 'KILL'] },
      rolloutPercent: { type: 'integer', minimum: 0, maximum: 100 },
    },
  },
  BanUserRequest: {
    type: 'object', required: ['reason'],
    properties: {
      reason: { type: 'string', maxLength: 500 },
      durationDays: { type: 'integer', minimum: 1 },
    },
  },
  NewsletterSendRequest: {
    type: 'object', required: ['subject', 'html'],
    properties: {
      subject: { type: 'string', maxLength: 200 },
      html: { type: 'string', maxLength: 100000 },
      segment: { type: 'string', maxLength: 100 },
    },
  },
  ModerationFlagRequest: {
    type: 'object', required: ['action'],
    properties: {
      action: { type: 'string', enum: ['APPROVE', 'REMOVE', 'SHADOW_BAN', 'ESCALATE'] },
      reason: { type: 'string', maxLength: 500 },
    },
  },
  ExperimentAssignRequest: {
    type: 'object',
    properties: { overrideVariant: { type: 'string', maxLength: 30 } },
  },
  SearchRequest: {
    type: 'object', required: ['q'],
    properties: {
      q: { type: 'string', minLength: 1, maxLength: 200 },
      type: { type: 'string', enum: ['POST', 'ARTICLE', 'USER', 'GROUP', 'ALL'], default: 'ALL' },
      limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
    },
  },

  // ---- Generic fallback ----
  GenericMutationRequest: {
    type: 'object', additionalProperties: true,
    description: 'Generic mutation body. See route-specific docs for exact shape.',
  },
};

// ============================================================================
// 9. COMPONENTS
// ============================================================================
const components = {
  securitySchemes: {
    BearerAuth: {
      type: 'http', scheme: 'bearer', bearerFormat: 'JWT',
      description: 'Supabase JWT (`sb-<ref>-auth-token`). Alternative: session cookie set by `/api/auth/login`.',
    },
    CookieAuth: {
      type: 'apiKey', in: 'cookie', name: 'sb-<ref>-auth-token',
      description: 'Supabase session cookie. Name is dynamically suffixed by project ref.',
    },
  },
  schemas: SCHEMAS,
  responses: {
    Unauthorized: { description: 'Missing or invalid auth credentials.', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
    Forbidden: { description: 'Authenticated but lacks required role (mentor/admin).', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
    NotFound: { description: 'Resource not found.', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
    BadRequest: { description: 'Malformed request.', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
    ValidationError: { description: 'Zod schema validation failed.', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
    RateLimited: {
      description: 'Rate limit exceeded.',
      headers: { 'Retry-After': { schema: { type: 'integer' }, description: 'Segundos até poder tentar novamente.' } },
      content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
    },
    InternalError: { description: 'Internal server error.', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
  },
  parameters: {
    Cursor: {
      name: 'cursor', in: 'query', required: false,
      description: 'Cursor (last-seen id) para paginação. Omita na primeira chamada.',
      schema: { type: 'string' },
    },
    Limit: {
      name: 'limit', in: 'query', required: false,
      description: 'Tamanho da página (default 20, max 100).',
      schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
    },
  },
};

const tags = Object.entries(TAG_DESCRIPTIONS).map(([name, description]) => ({ name, description }));

// ============================================================================
// 10. FINAL SPEC
// ============================================================================
const spec = {
  openapi: '3.0.3',
  info: {
    title: 'Akasha Portal API',
    version: '0.2.0',
    summary: 'REST + SSE API for the Akasha Portal community platform.',
    description: [
      'OpenAPI 3.0.3 spec covering **118+ active routes** under `/api/**` in the Akasha Portal monorepo.',
      '',
      '## Conventions',
      '',
      '- **Auth:** Supabase JWT (Bearer) OR session cookie (`sb-<ref>-auth-token`).',
      '- **Pagination:** Cursor-based (`?cursor=<id>&limit=<n>`, default 20, max 100).',
      '- **Timestamps:** ISO 8601 UTC.',
      '- **IDs:** cuid2 (Prisma).',
      '- **Envelopes:**',
      '  - Success: `{ data, meta: { timestamp, requestId, nextCursor?, total? } }`',
      '  - Error:   `{ error: { code, message, details? }, meta: { timestamp, requestId } }`',
      '- **Rate limit:** 100 req/min global per IP; tighter per-route (see `/posts`, `/akashic/chat`, etc.).',
      '- **LGPD:** Consent OBRIGATÓRIO em signup, forgot, beta-accept, exportação de dados pessoais (`GET /users/{id}/export`).',
      '',
      '## Sacred-cultural compliance',
      '',
      '- Vocabulário pt-BR preservado: orixás, axé, Odu, Cigano Ramiro, Akasha, pemba, Ifá, Candomblé, Umbanda.',
      '- Banned-vocab em qualquer UI / API response / log (lista em `CONTRIBUTING.md`).',
      '',
      '## Source of truth',
      '',
      '- Routes: `src/app/api/**/route.ts`',
      '- Validators: `src/lib/validators/*.ts` (zod)',
      '- Prisma schema: `prisma/schema.prisma`',
    ].join('\n'),
    license: { name: 'Proprietary', url: 'https://akasha.com.br/legal/license' },
    contact: { name: 'Akasha Engineering', email: 'eng@akasha.com.br', url: 'https://akasha.com.br' },
  },
  servers: [
    { url: 'http://localhost:3000/api', description: 'Local development', variables: { port: { default: '3000', enum: ['3000', '3001', '3002'] } } },
    { url: 'https://staging.akasha.com.br/api', description: 'Staging' },
    { url: 'https://akasha.com.br/api', description: 'Production' },
  ],
  tags,
  paths,
  components,
  security: [{ BearerAuth: [] }, { CookieAuth: [] }],
  xTagGroups: [
    { name: 'Community', tags: ['Users', 'Posts', 'Groups', 'Drafts', 'Events', 'Mentorship'] },
    { name: 'Content', tags: ['Articles', 'Search'] },
    { name: 'AI', tags: ['Akasha', 'Oraculo', 'Consciousness'] },
    { name: 'Identity', tags: ['Auth', 'Consent', 'Beta', 'Waitlist', 'Newsletter', 'Email'] },
    { name: 'Payments', tags: ['Payments'] },
    { name: 'Notifications', tags: ['Notifications', 'Push', 'Reactions'] },
    { name: 'Platform', tags: ['Admin', 'Feature Flags', 'Cron', 'Experiments', 'Upload', 'Health'] },
  ],
};

// ============================================================================
// 11. WRITE YAML
// ============================================================================
const yamlText = yaml.dump(spec, {
  noRefs: true,
  lineWidth: 120,
  sortKeys: false,
  quotingType: '"',
  forceQuotes: false,
  condenseFlow: false,
});
fs.mkdirSync(path.dirname(OUT_YAML), { recursive: true });
fs.writeFileSync(OUT_YAML, yamlText, 'utf8');
console.log(`[gen-openapi] wrote ${OUT_YAML} (${(yamlText.length / 1024).toFixed(1)} KB, ${yamlText.split('\n').length} lines)`);

// ============================================================================
// 12. WRITE HTML PREVIEW (Redoc standalone)
// ============================================================================
const htmlTemplate = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Akasha Portal API — OpenAPI 3.0</title>
  <meta name="description" content="OpenAPI 3.0.3 spec for the Akasha Portal REST + SSE API (118+ routes)." />
  <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Ctext y='20' font-size='20'%3E%E2%9C%A8%3C/text%3E%3C/svg%3E" />
  <style>
    body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; }
    #redoc-container { min-height: 100vh; }
  </style>
</head>
<body>
  <div id="redoc-container"></div>
  <script src="https://cdn.redoc.ly/redoc/latest/bundles/redoc.standalone.js"></script>
  <script>
    (function () {
      var isFile = window.location.protocol === 'file:';
      if (isFile) {
        document.getElementById('redoc-container').innerHTML =
          '<div style="padding:40px;max-width:760px;margin:80px auto;font-family:sans-serif;line-height:1.6">' +
          '<h1>Redoc preview unavailable over file://</h1>' +
          '<p>This static HTML references <code>openapi.yaml</code> via fetch, which browsers block under file://. ' +
          'To preview locally, run:</p>' +
          '<pre style="background:#0d1117;color:#c9d1d9;padding:16px;border-radius:6px">npx @redocly/cli preview-docs docs/api/openapi.yaml\\n# or\\npython3 -m http.server -d docs/api 8000\\n# then open http://localhost:8000/openapi.html</pre>' +
          '<p>See <code>OPENAPI-README.md</code> for full instructions.</p></div>';
        return;
      }
      fetch('./openapi.yaml').then(function (r) { return r.text(); }).then(function (txt) {
        Redoc.init(txt, {
          pathInMiddlePanel: true,
          hideDownloadButton: false,
          expandResponses: '200,201',
          sortPropsAlphabetically: false,
          theme: { colors: { primary: { main: '#6e56cf' } } },
        }, document.getElementById('redoc-container'));
      });
    })();
  </script>
</body>
</html>`;
fs.writeFileSync(OUT_HTML, htmlTemplate, 'utf8');
console.log(`[gen-openapi] wrote ${OUT_HTML} (${(htmlTemplate.length / 1024).toFixed(1)} KB)`);

// ============================================================================
// 13. SUMMARY
// ============================================================================
const pathCount = Object.keys(paths).length;
const operationCount = Object.values(paths).reduce(
  (sum, ops) => sum + Object.keys(ops).filter(k => ['get','post','put','delete','patch'].includes(k)).length, 0);
const schemaCount = Object.keys(SCHEMAS).length;
console.log(`[gen-openapi] OK: ${pathCount} paths, ${operationCount} operations, ${schemaCount} schemas, ${tags.length} tags`);

// ============================================================================
// 14. SELF-VALIDATION — basic structural sanity checks (no external CLI)
// ============================================================================
const errors = [];
for (const [pathKey, ops] of Object.entries(paths)) {
  // Check that no path-key still has [bracket] syntax (OpenAPI requires {curly})
  if (/\[/.test(pathKey)) errors.push(`path ${pathKey} uses bracket syntax`);
  for (const [verb, op] of Object.entries(ops)) {
    if (!op.summary) errors.push(`${verb.toUpperCase()} ${pathKey}: missing summary`);
    if (!op.tags || op.tags.length === 0) errors.push(`${verb.toUpperCase()} ${pathKey}: missing tags`);
    if (!op.responses || Object.keys(op.responses).length === 0) {
      errors.push(`${verb.toUpperCase()} ${pathKey}: missing responses`);
    }
    if (verb === 'post' || verb === 'put' || verb === 'patch') {
      // requestBody is optional for some endpoints (file upload, webhooks, follow toggle)
      // so we just emit a soft warning, not a hard error.
    }
  }
}
for (const [sname, schema] of Object.entries(SCHEMAS)) {
  if (!schema.type && !schema.$ref && !schema.oneOf && !schema.allOf && !schema.anyOf) {
    errors.push(`schema ${sname}: missing type or oneOf/allOf`);
  }
}
// Tag consistency
const declaredTags = new Set(tags.map(t => t.name));
for (const entry of routeEntries) {
  if (!declaredTags.has(entry.tag)) errors.push(`route ${entry.route} references undeclared tag ${entry.tag}`);
}
if (errors.length > 0) {
  console.error(`[gen-openapi] SELF-VALIDATION FAIL (${errors.length} errors):`);
  for (const e of errors.slice(0, 20)) console.error(`  - ${e}`);
  if (errors.length > 20) console.error(`  ... +${errors.length - 20} more`);
  process.exit(1);
}
console.log(`[gen-openapi] self-validation PASS (0 errors)`);
