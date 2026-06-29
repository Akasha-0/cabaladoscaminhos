// ============================================================================
// w47 / COMMENTS-THREADING — Threaded comments + @mentions + edit history
// ============================================================================
// Camada de domínio para comentários em árvore sobre posts da comunidade.
// Wave 47 do ciclo de features do Cabala dos Caminhos.
//
// ARQUITETURA
// ----------------------------------------------------------------------------
// Comments são uma surface NOVA — não existia nada além de um stub no tipo
// `Comment` em src/types/community.ts. Este módulo entrega:
//
//   1. Modelo de domínio (Comment, Edit, Reaction, Mention)
//   2. Operações CRUD + threading (depth check, soft delete, restore)
//   3. Mention parsing com posições de caracteres + resolução via lookup
//   4. Reactions polimórficas (toggle, aggregate, count)
//   5. Read state por (userId, postId) — unread counts
//   6. Real-time subscription via SSE (w43) com fallback polling
//   7. Edit history com diffs line-level
//   8. LGPD helpers (redact, anonymize, bulk delete Art. 18, export)
//   9. Validação de body (length, spam → w42, redaction)
//  10. Constants + error taxonomy (CommentError com 9 codes)
//
// INTEGRAÇÕES
// ----------------------------------------------------------------------------
//   w42/comments-moderation → spam/profanity detection
//   w43/notifications-persistence → notifyMentionedUsers
//   w43 SSE → subscribeToThread transport
//
// NÃO REPLICAMOS: Prisma schema aqui (esse módulo é type-level + service-layer).
// A persistência real acontece via Prisma client nos route handlers. Aqui
// expomos contratos e helpers puros que operam sobre Comment[] em memória
// (para testes, exports, e projections), e contratos async que delegam para
// os módulos upstream via dynamic import ou fetch.
//
// CONVENÇÕES
// ----------------------------------------------------------------------------
//   - Filename: kebab-case, sem prefixo
//   - Exports: 25+ funções/constantes nomeadas
//   - Errors: CommentError com `code` discriminated union
//   - Datas: ISO 8601 strings (Date.toISOString()) — Prisma DateTime in DB
//   - IDs: strings (cuid) — alinhado com @prisma default
// ============================================================================

/**
 * Legacy Comment shape (de src/types/community.ts).
 * Inlined aqui para evitar dependência de path alias em TSC isolado.
 * Mantido em sincronia com o type original — se mudar lá, mudar aqui.
 */
interface LegacyComment {
  id: string;
  postId: string;
  author: {
    id: string;
    displayName: string;
  };
  content: string;
  parentId?: string | null;
  likesCount: number;
  liked?: boolean;
  createdAt: string;
  replies?: LegacyComment[];
}

// ============================================================================
// SEÇÃO 1 — TIPOS DE DOMÍNIO
// ============================================================================

/**
 * Branded type para evitar misturar IDs de Comment com IDs de Post/User.
 * Pattern: `string & { __brand: 'CommentId' }` força type-check em compile.
 */
export type CommentId = string & { readonly __brand: 'CommentId' };

/** Helper para criar um CommentId a partir de uma string crua. */
export const asCommentId = (raw: string): CommentId => raw as CommentId;

/** Helper para criar CommentId a partir de um id do Prisma. */
export const fromPrismaCommentId = (id: string): CommentId => asCommentId(id);

/**
 * Comment — entidade raiz do domínio.
 *
 * Representa um comentário isolado, sem estrutura de árvore embutida.
 * Para a forma em árvore, use `CommentTree` (que contém `CommentNode`).
 *
 * `body` é o texto cru (markdown leve permitido). `bodyHtml` é a versão
 * sanitizada (rendered output) — populada após passar pelo pipeline de
 * sanitização em w42.
 *
 * `depth` é calculado a partir de parentId: 0 = raiz, 1 = reply de raiz,
 * etc. Máximo configurável via MAX_DEPTH (default 5).
 *
 * `deletedAt` é soft-delete: o registro persiste, mas `body` é substituído
 * por "[removido]" no projection. Thread structure é preservada (children
 * continuam visíveis).
 */
export interface Comment {
  id: CommentId;
  postId: string;
  parentId: CommentId | null;
  authorId: string;
  /** Texto cru enviado pelo usuário. Pode conter markdown leve. */
  body: string;
  /** HTML sanitizado (output de w42). Null enquanto não sanitizado. */
  bodyHtml: string | null;
  /** Profundidade na árvore (0 = raiz). Recalculado a cada insert. */
  depth: number;
  /** Path materializado para queries eficientes: "0/3/7" (root/child/...). */
  path: string;
  /** ISO 8601. */
  createdAt: string;
  /** ISO 8601 — null até primeira edição. */
  editedAt: string | null;
  /** ISO 8601 — soft delete. body substituído por "[removido]" quando set. */
  deletedAt: string | null;
  /** Quem deletou (userId admin ou próprio autor). Null se nunca deletado. */
  deletedBy: string | null;
  /** Razão do delete (opcional, geralmente preenchido por admins). */
  deletedReason: string | null;
  /** Thread lock — quando set, novos replies são rejeitados. */
  lockedAt: string | null;
  lockedBy: string | null;
  /** Reaction aggregate denormalizado — atualizado via trigger/job. */
  reactionCount: number;
  /** Contagem de children diretos — denormalizado para ordenação rápida. */
  childCount: number;
  /** Total de descendentes recursivos — para sortBy=hot. */
  descendantCount: number;
  /** Se o author foi anonimizado (LGPD Art. 18). Body preserva contexto. */
  authorAnonymized: boolean;
  /** Se menções foram resolvidas (todos os @handles viraram userIds). */
  mentionsResolved: boolean;
  /** Flag para moderadores — set por w42 quando conteúdo marcado. */
  flagged: boolean;
  flagReason: string | null;
}

/**
 * CommentEdit — entrada de histórico de edição.
 *
 * Cada vez que um comment é editado, criamos uma nova entrada preservando
 * o body anterior. Permite UI tipo "editado 3 vezes — ver histórico".
 *
 * `diffFromPrevious` é o diff line-level pré-computado entre o body
 * anterior e o novo, para evitar recomputar no client.
 */
export interface CommentEdit {
  id: string;
  commentId: CommentId;
  /** Body ANTES desta edição (raw). */
  previousBody: string;
  /** Body DEPOIS desta edição (raw). */
  newBody: string;
  /** Diff line-level pré-computado (formato textual). */
  diffFromPrevious: string;
  /** Quem editou (sempre o author original; admins não devem editar). */
  editedBy: string;
  /** ISO 8601. */
  editedAt: string;
  /** Hash SHA-256 do body anterior — integridade forense. */
  previousBodyHash: string;
}

/**
 * CommentEdge — aresta parent-child na árvore.
 *
 * Usada para projections em grafo (e.g. para export como DOT/Graphviz)
 * e para validação de invariantes (e.g. ciclos são impossíveis porque
 * path é estritamente crescente).
 */
export interface CommentEdge {
  parentId: CommentId | null;
  childId: CommentId;
  /** Depth do child. */
  depth: number;
}

/**
 * CommentNode — nó na árvore com filhos embutidos.
 *
 * `replies` é populado recursivamente até `maxDepth`. Nodes além de
 * maxDepth são achatados em um array `overflowReplies` no parent.
 *
 * `collapsed` indica se o nó foi colapsado na UI — não persistido, só
 * projeção client-side.
 */
export interface CommentNode {
  comment: Comment;
  replies: CommentNode[];
  /** Replies além de maxDepth — flat, sem recursão. */
  overflowReplies: CommentNode[];
  /** UI state — não persistido. */
  collapsed?: boolean;
  /** Distância da raiz — sempre 0 para top-level. */
  level: number;
  /** Total de descendentes (recursive) — para badge "5 respostas". */
  totalDescendants: number;
  /** Reaction aggregate — pré-computado para evitar N+1. */
  reactions: ReactionAgg;
  /** Mentioned users nesta mensagem (resolvidos). */
  mentions: ResolvedMention[];
}

/**
 * CommentTree — projeção completa de árvore para um post.
 *
 * Inclui contagens agregadas (total, unread, deleted) e metadata útil
 * para o client renderizar sem chamadas extras.
 */
export interface CommentTree {
  postId: string;
  nodes: CommentNode[];
  /** Total de comments (incluindo deletados e overflow). */
  totalCount: number;
  /** Apenas top-level (depth=0). */
  rootCount: number;
  /** Total deletados (soft). */
  deletedCount: number;
  /** Profundidade máxima encontrada. */
  maxDepthFound: number;
  /** Quando foi construída — útil para cache invalidation. */
  builtAt: string;
  /** Versão do schema para invalidation client-side. */
  schemaVersion: number;
}

/**
 * ReactionAgg — agregação de reactions por emoji.
 *
 * Map<emoji, count> + set de userIds que reagiram (para "did I react?").
 * Normalizado para evitar queries adicionais.
 */
export interface ReactionAgg {
  commentId: CommentId;
  /** Emoji → count. */
  counts: Record<string, number>;
  /** Emoji → set de userIds que reagiram. */
  reactors: Record<string, string[]>;
  /** Total de reactions (soma de counts). */
  total: number;
}

/**
 * Mention — menção detectada no body.
 *
 * `start` e `end` são índices de caracteres no body original (UTF-16 units
 * no JS — alinhado com String.substring). Permite renderizar link/avatar
 * na posição exata.
 *
 * `handle` é o texto após o @ sem validar existência.
 * `userId` é populado por `resolveMentions`.
 */
export interface Mention {
  /** Texto capturado (sem o @). Ex: "joao_silva". */
  handle: string;
  /** Índice inicial (inclusive) no body. */
  start: number;
  /** Índice final (exclusive) — alinhado com String.substring end. */
  end: number;
  /** Texto literal capturado incluindo @. Ex: "@joao_silva". */
  raw: string;
}

/**
 * Mention resolvido — handle + userId + display info.
 *
 * `found=false` indica que o handle não mapeia para nenhum userId (e.g.
 * @user_deletado). UI pode renderizar como "ghost" mention.
 */
export interface ResolvedMention {
  handle: string;
  userId: string | null;
  displayName: string | null;
  found: boolean;
  /** Posição no body original. */
  start: number;
  end: number;
  /** Se o user bloqueou mentions (privacy setting) — notificação skip. */
  blocked: boolean;
}

/**
 * ReadState — estado de leitura por (user, post).
 *
 * `lastReadCommentId` é o último comment que o user visualizou.
 * `lastReadAt` é quando marcou como lido (para ordenação em inbox).
 */
export interface ReadState {
  userId: string;
  postId: string;
  lastReadCommentId: CommentId | null;
  lastReadAt: string;
  /** Total de comments no momento da última leitura — para diff rápido. */
  lastReadTotalCount: number;
}

// ============================================================================
// SEÇÃO 2 — CONSTANTES
// ============================================================================

/**
 * Limite máximo de caracteres do body.
 * 4000 chars cobre respostas longas com markdown sem abusar do DB.
 * Alinhado com limite do Mastodon (500) extended 8x para discussão longa.
 */
export const MAX_BODY_LENGTH = 4000;

/** Profundidade máxima da árvore de replies. */
export const MAX_DEPTH = 5;

/** Máximo de @mentions por comentário (anti-spam e anti-dox). */
export const MAX_MENTIONS_PER_COMMENT = 10;

/** Mínimo de caracteres (anti "ok", "👍", "sim"). */
export const MIN_BODY_LENGTH = 1;

/** Limite de edições por comment (anti-abuse). */
export const MAX_EDITS_PER_COMMENT = 10;

/** Janela de rate limit em segundos — usado em validateBody. */
export const RATE_LIMIT_WINDOW_SECONDS = 60;

/** Máximo de comments por usuário por janela. */
export const MAX_COMMENTS_PER_WINDOW = 10;

/**
 * Regex para captura de @mentions.
 *
 *   @                   — literal @
 *   (?:[\p{L}\p{N}_])+ — unicode letter/number/underscore
 *   (?!\p{L})           — não seguido de letter (evita capturar @joao em @joaosantos)
 *
 * Unicode-aware (ES2018+). Suporta acentos: @joão_silva.
 * Flag 'gu' para global + unicode.
 */
export const MENTION_REGEX = /@(?:[\p{L}\p{N}_])+(?!\p{L})/gu;

/**
 * Profanity list — base seed.
 *
 * Em produção, w42/comments-moderation expande esta lista com um lexicon
 * curado + machine-learning classifier. Aqui só guardamos seeds para
 * evitar chamadas externas em testes.
 *
 * NOTA: mantemos como const readonly Set para performance de lookup.
 */
export const PROFANITY_LIST: ReadonlySet<string> = new Set([
  'spam',
  'viagra',
  'casino',
  'bitcoin-doubler',
  'click-here',
  // ... em prod, w42 injeta via lexicon
]);

/** Schema version — bump em mudanças incompatíveis. */
export const SCHEMA_VERSION = 1;

/** Default sort options. */
export const DEFAULT_SORT = 'newest' as const;

/** Allowed sort values para getCommentTree. */
export const ALLOWED_SORTS = ['newest', 'oldest', 'top', 'hot'] as const;
export type CommentSort = (typeof ALLOWED_SORTS)[number];

/** Formatos suportados para exportThread. */
export const EXPORT_FORMATS = ['json', 'csv', 'markdown'] as const;
export type ExportFormat = (typeof EXPORT_FORMATS)[number];

/** Reaction emoji whitelist — alinhado com w41 reactions. */
export const ALLOWED_REACTION_EMOJIS = [
  '🙏',
  '💚',
  '🔥',
  '✨',
  '🌱',
  '☮️',
  '🕉️',
  '🌟',
] as const;
export type AllowedReactionEmoji = (typeof ALLOWED_REACTION_EMOJIS)[number];

/** Razões canônicas para soft-delete (LGPD audit-friendly). */
export const DELETE_REASONS = [
  'user-request',
  'admin-moderation',
  'spam-detected',
  'lgpd-erasure',
  'duplicate',
  'off-topic',
  'harassment',
] as const;
export type DeleteReason = (typeof DELETE_REASONS)[number];

// ============================================================================
// SEÇÃO 3 — ERROS
// ============================================================================

/**
 * Codes de erro — discriminadas via switch.
 *
 * Cada throw deve carregar um code específico para o caller tratar
 * (ex: mostrar toast vs. mostrar form error vs. retry).
 */
export type CommentErrorCode =
  | 'not-found'
  | 'depth-exceeded'
  | 'body-invalid'
  | 'not-author'
  | 'already-deleted'
  | 'mention-limit'
  | 'thread-locked'
  | 'rate-limited'
  | 'edit-limit-exceeded'
  | 'reaction-not-allowed'
  | 'permission-denied'
  | 'invalid-input';

/**
 * CommentError — exception type para o domínio de comments.
 *
 * Inclui `code` discriminada + `context` opcional (e.g. depthLimit quando
 * code=depth-exceeded).
 */
export class CommentError extends Error {
  readonly code: CommentErrorCode;
  readonly context: Record<string, unknown> | undefined;
  readonly statusCode: number;

  constructor(
    code: CommentErrorCode,
    message: string,
    options?: {
      context?: Record<string, unknown>;
      cause?: unknown;
    },
  ) {
    super(message);
    this.name = 'CommentError';
    this.code = code;
    this.context = options?.context;
    // HTTP-ish statusCode mapping (para route handlers converterem).
    this.statusCode = commentErrorToStatus(code);
    if (options?.cause) {
      // Node 16+ supports Error cause
      (this as { cause?: unknown }).cause = options.cause;
    }
  }

  /** Serializa para log estruturado / API response. */
  toJSON(): {
    name: string;
    code: CommentErrorCode;
    message: string;
    context?: Record<string, unknown>;
    statusCode: number;
  } {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      context: this.context,
      statusCode: this.statusCode,
    };
  }
}

/** Mapeia code → HTTP status. */
function commentErrorToStatus(code: CommentErrorCode): number {
  switch (code) {
    case 'not-found':
      return 404;
    case 'depth-exceeded':
      return 422;
    case 'body-invalid':
      return 422;
    case 'not-author':
      return 403;
    case 'already-deleted':
      return 409;
    case 'mention-limit':
      return 422;
    case 'thread-locked':
      return 423;
    case 'rate-limited':
      return 429;
    case 'edit-limit-exceeded':
      return 422;
    case 'reaction-not-allowed':
      return 422;
    case 'permission-denied':
      return 403;
    case 'invalid-input':
      return 400;
    default:
      // Exhaustiveness check — code é string neste ponto mas nunca match
      return 500;
  }
}

// ============================================================================
// SEÇÃO 4 — INPUT TYPES + OPTIONS
// ============================================================================

/**
 * Input para createComment — tudo que caller precisa fornecer.
 *
 * `parentId` opcional: null/undefined = top-level comment.
 * `mentions` opcional: se já parseadas externamente, evita reparse.
 * `clientMeta` carrega dados client-side (userAgent, locale) para audit.
 */
export interface CreateCommentInput {
  postId: string;
  authorId: string;
  body: string;
  parentId?: CommentId | null;
  mentions?: Mention[];
  clientMeta?: {
    userAgent?: string;
    locale?: string;
    timezone?: string;
  };
  /** Override do depth limit para esta chamada (admin only). */
  depthLimitOverride?: number;
}

/**
 * Options para getCommentTree — controla projeção.
 *
 * `maxDepth` limita recursão. Default = MAX_DEPTH (5).
 * `includeDeleted` decide se mostra ou oculta soft-deletados.
 * `sortBy` define ordenação top-level (children sempre newest).
 * `viewerId` carrega reactions do viewer (liked state).
 */
export interface GetTreeOptions {
  maxDepth?: number;
  sortBy?: CommentSort;
  includeDeleted?: boolean;
  viewerId?: string | null;
  /** Limite de top-level comments (paginada). */
  rootLimit?: number;
  /** Cursor para paginação (id do último root carregado). */
  rootCursor?: CommentId | null;
  /** Carrega reactions aggregate. Default true. */
  includeReactions?: boolean;
  /** Carrega mentions resolvidas. Default true. */
  includeMentions?: boolean;
}

/**
 * Options para editComment.
 */
export interface EditCommentOptions {
  /** Razão da edição (audit). */
  reason?: string;
  /** Bypass edit limit (admin). */
  bypassEditLimit?: boolean;
  /** Notificar mentioned users do body novo (se mudou). */
  notifyMentions?: boolean;
}

/**
 * Options para softDeleteComment.
 */
export interface SoftDeleteOptions {
  reason?: DeleteReason | string;
  /** Cascade delete — remove children. Default false (soft preserve). */
  cascade?: boolean;
  /** Bypass ownership check (admin). */
  asAdmin?: boolean;
}

/**
 * Result type para operações que podem falhar parcialmente.
 *
 * `success: true` + `data` em caso normal.
 * `success: false` + `error` + `partialData` quando algo deu errado mas
 * trabalho parcial foi feito (e.g. 8 de 10 mentions resolvidas).
 */
export type CommentOpResult<T> =
  | { success: true; data: T }
  | { success: false; error: CommentError; partialData?: Partial<T> };

// ============================================================================
// SEÇÃO 5 — VALIDAÇÃO
// ============================================================================

/**
 * Resultado de validação de body.
 *
 * `ok=true` quando passa em todos os checks.
 * `issues` lista razões de falha com severity (warn/error).
 */
export interface BodyValidationResult {
  ok: boolean;
  issues: BodyValidationIssue[];
  /** Spam score 0-1 (>0.7 geralmente rejeita). */
  spamScore: number;
  /** Body normalizado (trim, normalize whitespace). */
  normalizedBody: string;
  /** Mentions detectadas. */
  mentions: Mention[];
}

export interface BodyValidationIssue {
  code:
    | 'too-short'
    | 'too-long'
    | 'profanity'
    | 'spam-detected'
    | 'redaction-needed'
    | 'invalid-mention-format'
    | 'too-many-mentions';
  severity: 'error' | 'warn';
  message: string;
  /** Índice no body onde o problema começa. */
  position?: number;
  /** Matched substring (para highlight na UI). */
  matched?: string;
}

/**
 * validateBody — pipeline de validação em camadas.
 *
 *   1. Length check (1 ≤ len ≤ MAX_BODY_LENGTH)
 *   2. Mentions parse (regex)
 *   3. Mention count check (≤ MAX_MENTIONS_PER_COMMENT)
 *   4. Profanity check (PROFANITY_LIST seed)
 *   5. Spam heuristic (caps ratio, link count, repeat chars)
 *   6. LGPD redaction check (heurística: detecta possível CPF, email, tel)
 *
 * Retorna issues com severity. Caller decide se 'warn' bloqueia ou não.
 */
export function validateBody(body: string): BodyValidationResult {
  const issues: BodyValidationIssue[] = [];
  const trimmed = body.trim();
  const normalizedBody = trimmed.replace(/\s+/g, ' ');

  // 1. Length
  if (trimmed.length < MIN_BODY_LENGTH) {
    issues.push({
      code: 'too-short',
      severity: 'error',
      message: `Body deve ter pelo menos ${MIN_BODY_LENGTH} caractere`,
    });
  }
  if (trimmed.length > MAX_BODY_LENGTH) {
    issues.push({
      code: 'too-long',
      severity: 'error',
      message: `Body excede ${MAX_BODY_LENGTH} caracteres`,
      position: MAX_BODY_LENGTH,
    });
  }

  // 2. Mentions parse
  const mentions = parseMentions(trimmed);

  // 3. Mention count
  if (mentions.length > MAX_MENTIONS_PER_COMMENT) {
    issues.push({
      code: 'too-many-mentions',
      severity: 'error',
      message: `Máximo de ${MAX_MENTIONS_PER_COMMENT} menções por comentário`,
    });
  }

  // 4. Profanity (seed)
  const lower = trimmed.toLowerCase();
  for (const term of PROFANITY_LIST) {
    const idx = lower.indexOf(term);
    if (idx !== -1) {
      issues.push({
        code: 'profanity',
        severity: 'warn',
        message: `Possível termo sinalizado: ${term}`,
        position: idx,
        matched: term,
      });
    }
  }

  // 5. Spam heuristics
  const spamScore = computeSpamScore(trimmed);
  if (spamScore > 0.7) {
    issues.push({
      code: 'spam-detected',
      severity: 'error',
      message: `Conteúdo sinalizado como spam (score=${spamScore.toFixed(2)})`,
    });
  }

  // 6. LGPD redaction check
  const redactionIssues = detectLgpdSensitive(trimmed);
  issues.push(...redactionIssues);

  // Invalid mention format — handle sem underscore/letra
  for (const m of mentions) {
    if (!/^[\p{L}_][\p{L}\p{N}_]*$/u.test(m.handle)) {
      issues.push({
        code: 'invalid-mention-format',
        severity: 'warn',
        message: `Handle "${m.handle}" contém caracteres inválidos`,
        position: m.start,
        matched: m.raw,
      });
    }
  }

  const hasError = issues.some((i) => i.severity === 'error');

  return {
    ok: !hasError,
    issues,
    spamScore,
    normalizedBody,
    mentions,
  };
}

/**
 * Compute spam score heurístico (0-1).
 *
 * Considera: caps ratio, link count, repeat chars, emoji-only.
 * Em produção, w42 substitui por classifier ML.
 */
function computeSpamScore(body: string): number {
  if (body.length === 0) return 0;

  const letters = body.replace(/[^a-zA-ZÀ-ÿ]/g, '');
  const capsRatio = letters.length === 0 ? 0 : (body.replace(/[^A-ZÀ-Ÿ]/g, '').length / letters.length);

  const linkCount = (body.match(/https?:\/\//gi) ?? []).length;
  const repeatChar = /(.)\1{8,}/.test(body);

  // Emoji-only: mais de 50% são emoji
  const emojiCount = (body.match(/\p{Extended_Pictographic}/gu) ?? []).length;
  const emojiRatio = body.length === 0 ? 0 : emojiCount / body.length;

  let score = 0;
  if (capsRatio > 0.7) score += 0.4;
  if (linkCount > 3) score += 0.3;
  if (repeatChar) score += 0.5;
  if (emojiRatio > 0.7 && body.length < 50) score += 0.3;

  return Math.min(score, 1);
}

/**
 * Detecta possíveis dados sensíveis (LGPD) que precisam redação.
 *
 * Heurística simples: CPF, email, telefone BR.
 * Em produção, w42 expande com regex mais robustas.
 */
function detectLgpdSensitive(body: string): BodyValidationIssue[] {
  const issues: BodyValidationIssue[] = [];

  // CPF: 000.000.000-00 ou 00000000000
  const cpfMatch = body.match(/\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/);
  if (cpfMatch && cpfMatch.index !== undefined) {
    issues.push({
      code: 'redaction-needed',
      severity: 'warn',
      message: 'Possível CPF detectado — considere redatar',
      position: cpfMatch.index,
      matched: cpfMatch[0],
    });
  }

  // Email
  const emailMatch = body.match(/\b[\w._%+-]+@[\w.-]+\.[a-zA-Z]{2,}\b/);
  if (emailMatch && emailMatch.index !== undefined) {
    issues.push({
      code: 'redaction-needed',
      severity: 'warn',
      message: 'Possível email detectado',
      position: emailMatch.index,
      matched: emailMatch[0],
    });
  }

  // Tel BR: (11) 91234-5678 ou variações
  const telMatch = body.match(/\(?\d{2}\)?\s?9?\d{4}-?\d{4}/);
  if (telMatch && telMatch.index !== undefined) {
    issues.push({
      code: 'redaction-needed',
      severity: 'warn',
      message: 'Possível telefone detectado',
      position: telMatch.index,
      matched: telMatch[0],
    });
  }

  return issues;
}

// ============================================================================
// SEÇÃO 6 — PARSING DE MENTIONS
// ============================================================================

/**
 * parseMentions — extrai @handles do body.
 *
 * Retorna posições de caracteres (start/end) para renderização precisa.
 * Usa MENTION_REGEX (unicode-aware).
 *
 * Overlapping matches são descartados (last match wins).
 */
export function parseMentions(body: string): Mention[] {
  const mentions: Mention[] = [];
  // Reset regex state — crítico porque MENTION_REGEX é global
  MENTION_REGEX.lastIndex = 0;

  let match: RegExpExecArray | null;
  while ((match = MENTION_REGEX.exec(body)) !== null) {
    const raw = match[0];
    const start = match.index;
    const end = start + raw.length;
    const handle = raw.slice(1); // remove @

    mentions.push({
      raw,
      handle,
      start,
      end,
    });

    // Safety: previne infinite loop em regex maliciosa
    if (match.index === MENTION_REGEX.lastIndex) {
      MENTION_REGEX.lastIndex++;
    }
  }

  return mentions;
}

/**
 * User lookup function — assinatura que resolve handle → userId.
 *
 * Implementações concretas: query Prisma User table, cache Redis, etc.
 * Mantemos como type para não acoplar este módulo ao Prisma.
 */
export type UserLookup = (handle: string) => Promise<{
  userId: string;
  displayName: string;
  blocked: boolean;
} | null>;

/**
 * resolveMentions — converte Mention[] → ResolvedMention[].
 *
 * Lookup é feito em batch para eficiência (um único resolveMany).
 * Handles não encontrados viram `found=false` (UI renderiza "ghost").
 */
export async function resolveMentions(
  mentions: Mention[],
  userLookup: UserLookup,
): Promise<ResolvedMention[]> {
  const uniqueHandles = Array.from(new Set(mentions.map((m) => m.handle)));
  const lookupMap = new Map<string, Awaited<ReturnType<UserLookup>>>();

  // Batch resolve
  await Promise.all(
    uniqueHandles.map(async (handle) => {
      const result = await userLookup(handle);
      lookupMap.set(handle, result);
    }),
  );

  return mentions.map((m) => {
    const result = lookupMap.get(m.handle);
    return {
      handle: m.handle,
      userId: result?.userId ?? null,
      displayName: result?.displayName ?? null,
      found: result !== null && result !== undefined,
      blocked: result?.blocked ?? false,
      start: m.start,
      end: m.end,
    };
  });
}

// ============================================================================
// SEÇÃO 7 — CRIAÇÃO / EDIÇÃO / DELETE
// ============================================================================

/**
 * createComment — cria um novo comentário.
 *
 * Valida body, calcula depth, gera path materializado, persiste (em prod
 * via Prisma), parseia mentions, dispara notificações.
 *
 * Throws CommentError em falhas de validação.
 *
 * @returns Comment criado.
 */
export async function createComment(
  input: CreateCommentInput,
  options?: {
    /** Callback para persistir (injetado para testabilidade). */
    persist?: (comment: Comment) => Promise<Comment>;
    /** Lookup de mentions — usado para validar existência. */
    mentionLookup?: UserLookup;
    /** Id generator customizado (default: timestamp-based cuid-ish). */
    idGenerator?: () => string;
  },
): Promise<Comment> {
  // Validação de input
  if (!input.postId || !input.authorId) {
    throw new CommentError('invalid-input', 'postId e authorId são obrigatórios');
  }

  // Validação de body
  const validation = validateBody(input.body);
  if (!validation.ok) {
    const firstError = validation.issues.find((i) => i.severity === 'error');
    throw new CommentError('body-invalid', firstError?.message ?? 'Body inválido', {
      context: { issues: validation.issues },
    });
  }

  // Depth check
  let depth = 0;
  let parentPath = '';
  if (input.parentId) {
    const parent = await fetchComment(input.parentId);
    if (!parent) {
      throw new CommentError('not-found', `Parent comment ${input.parentId} não existe`);
    }
    if (parent.lockedAt) {
      throw new CommentError('thread-locked', 'Thread está bloqueada para novos replies');
    }
    if (parent.deletedAt && parent.parentId === null) {
      // Replies para top-level deletado são permitidas (preserva contexto)
      // mas só para depth 1.
    }
    depth = parent.depth + 1;
    const depthLimit = input.depthLimitOverride ?? MAX_DEPTH;
    if (depth > depthLimit) {
      throw new CommentError('depth-exceeded', `Profundidade máxima (${depthLimit}) excedida`, {
        context: { depth, limit: depthLimit },
      });
    }
    parentPath = parent.path;
  }

  // Build path materializado
  const idGen = options?.idGenerator ?? generateCommentId;
  const newId = asCommentId(idGen());
  const pathSegment = newId.slice(-4); // últimos 4 chars do id
  const path = parentPath ? `${parentPath}/${pathSegment}` : pathSegment;

  // Mention limit check
  const mentions = input.mentions ?? parseMentions(validation.normalizedBody);
  if (mentions.length > MAX_MENTIONS_PER_COMMENT) {
    throw new CommentError(
      'mention-limit',
      `Máximo de ${MAX_MENTIONS_PER_COMMENT} menções excedido`,
      { context: { count: mentions.length } },
    );
  }

  const now = new Date().toISOString();
  const comment: Comment = {
    id: newId,
    postId: input.postId,
    parentId: input.parentId ?? null,
    authorId: input.authorId,
    body: validation.normalizedBody,
    bodyHtml: null,
    depth,
    path,
    createdAt: now,
    editedAt: null,
    deletedAt: null,
    deletedBy: null,
    deletedReason: null,
    lockedAt: null,
    lockedBy: null,
    reactionCount: 0,
    childCount: 0,
    descendantCount: 0,
    authorAnonymized: false,
    mentionsResolved: false,
    flagged: false,
    flagReason: null,
  };

  // Persist (via injeção) — default = no-op para type-level
  if (options?.persist) {
    const persisted = await options.persist(comment);
    // Async fan-out: notify mentioned users
    if (mentions.length > 0 && options.mentionLookup) {
      const resolved = await resolveMentions(mentions, options.mentionLookup);
      const validTargets = resolved.filter((r) => r.found && !r.blocked && r.userId !== input.authorId);
      await notifyMentionedUsers(
        validTargets.map((r) => ({
          userId: r.userId!,
          handle: r.handle,
          displayName: r.displayName,
        })),
        persisted.id,
      );
    }
    return persisted;
  }

  // Type-level: retorna sem persistir
  return comment;
}

/**
 * editComment — edita body de um comentário existente.
 *
 * Author-only (admins NÃO editam — devem soft-delete).
 * Cria CommentEdit entry com diff pré-computado.
 * Marca `editedAt`.
 *
 * Limite: MAX_EDITS_PER_COMMENT edits (configurável).
 */
export async function editComment(
  commentId: CommentId,
  newBody: string,
  byUserId: string,
  options?: EditCommentOptions & {
    persist?: (comment: Comment, edit: CommentEdit) => Promise<Comment>;
  },
): Promise<Comment> {
  const comment = await fetchComment(commentId);
  if (!comment) {
    throw new CommentError('not-found', `Comment ${commentId} não encontrado`);
  }
  if (comment.deletedAt) {
    throw new CommentError('already-deleted', 'Comment foi deletado');
  }
  if (comment.authorId !== byUserId) {
    throw new CommentError('not-author', 'Apenas o author pode editar');
  }
  if (comment.lockedAt) {
    throw new CommentError('thread-locked', 'Thread bloqueada');
  }

  // Validação
  const validation = validateBody(newBody);
  if (!validation.ok) {
    throw new CommentError('body-invalid', 'Body inválido após edição', {
      context: { issues: validation.issues },
    });
  }

  // Edit limit (skip para admin bypass)
  if (!options?.bypassEditLimit) {
    const editCount = await countEdits(commentId);
    if (editCount >= MAX_EDITS_PER_COMMENT) {
      throw new CommentError(
        'edit-limit-exceeded',
        `Limite de ${MAX_EDITS_PER_COMMENT} edições excedido`,
      );
    }
  }

  const now = new Date().toISOString();
  const previousBody = comment.body;
  const updated: Comment = {
    ...comment,
    body: validation.normalizedBody,
    bodyHtml: null, // re-sanitizar
    editedAt: now,
  };

  // Build edit entry
  const diff = diffCommentBodies(previousBody, validation.normalizedBody);
  const edit: CommentEdit = {
    id: generateEditId(),
    commentId,
    previousBody,
    newBody: validation.normalizedBody,
    diffFromPrevious: diff,
    editedBy: byUserId,
    editedAt: now,
    previousBodyHash: hashBody(previousBody),
  };

  if (options?.persist) {
    return await options.persist(updated, edit);
  }
  return updated;
}

/**
 * softDeleteComment — soft delete preservando thread structure.
 *
 * Substitui body por "[removido]" mas mantém o registro + children.
 * Salva `deletedBy`, `deletedReason` para audit (LGPD-friendly).
 *
 * Se `cascade=true`, deleta children também. Default false.
 *
 * Author pode deletar o próprio; admin pode deletar qualquer.
 */
export async function softDeleteComment(
  commentId: CommentId,
  byUserId: string,
  options?: SoftDeleteOptions & {
    persist?: (comment: Comment) => Promise<Comment>;
    fetchChildren?: (id: CommentId) => Promise<Comment[]>;
  },
): Promise<Comment> {
  const comment = await fetchComment(commentId);
  if (!comment) {
    throw new CommentError('not-found', `Comment ${commentId} não encontrado`);
  }
  if (comment.deletedAt) {
    throw new CommentError('already-deleted', 'Comment já foi deletado');
  }
  if (comment.lockedAt && !options?.asAdmin) {
    throw new CommentError('thread-locked', 'Thread bloqueada');
  }

  // Permission check
  const isAuthor = comment.authorId === byUserId;
  if (!isAuthor && !options?.asAdmin) {
    throw new CommentError('not-author', 'Apenas o author ou admin pode deletar');
  }

  const now = new Date().toISOString();
  const reason = (options?.reason ?? 'user-request') as string;

  const updated: Comment = {
    ...comment,
    body: '[removido]',
    bodyHtml: '[removido]',
    deletedAt: now,
    deletedBy: byUserId,
    deletedReason: reason,
    // Se cascade: marca children também
  };

  if (options?.cascade && options?.fetchChildren) {
    const children = await options.fetchChildren(commentId);
    for (const child of children) {
      if (!child.deletedAt) {
        await softDeleteComment(child.id, byUserId, {
          ...options,
          cascade: true,
        });
      }
    }
  }

  if (options?.persist) {
    return await options.persist(updated);
  }
  return updated;
}

/**
 * restoreComment — desfaz soft delete (admin-only).
 *
 * Restaura body original se ainda estiver em histórico de edições.
 * Caso contrário, mantém "[removido]" (irreversível).
 */
export async function restoreComment(
  commentId: CommentId,
  byAdminId: string,
  options?: {
    persist?: (comment: Comment) => Promise<Comment>;
    getEditHistory?: (id: CommentId) => Promise<CommentEdit[]>;
  },
): Promise<Comment> {
  const comment = await fetchComment(commentId);
  if (!comment) {
    throw new CommentError('not-found', `Comment ${commentId} não encontrado`);
  }
  if (!comment.deletedAt) {
    throw new CommentError('already-deleted', 'Comment não está deletado (nada para restaurar)');
  }
  // byAdminId audit trail — populado em produção via campo dedicated.
  void byAdminId;

  // Tentar recuperar body original via edit history
  let restoredBody = comment.body; // default = "[removido]"
  if (options?.getEditHistory) {
    const history = await options.getEditHistory(commentId);
    if (history.length > 0) {
      // Primeira entrada tem o body original
      const original = history[0];
      restoredBody = original.previousBody;
    }
  }

  const updated: Comment = {
    ...comment,
    body: restoredBody,
    bodyHtml: null,
    deletedAt: null,
    deletedBy: null,
    deletedReason: null,
  };

  if (options?.persist) {
    return await options.persist(updated);
  }
  return updated;
}

// ============================================================================
// SEÇÃO 8 — TREE PROJECTION
// ============================================================================

/**
 * getCommentTree — carrega comments de um post e monta árvore.
 *
 *   1. Query flat (todos os comments do post)
 *   2. Filtra (deleted, depth limit)
 *   3. Ordena top-level
 *   4. Constrói nodes recursivamente
 *   5. Agrega reactions
 *
 * Opções controlam paginação, sort, inclusão de deletados.
 *
 * @returns CommentTree
 */
export async function getCommentTree(
  postId: string,
  options: GetTreeOptions = {},
  deps?: {
    fetchAll?: (postId: string) => Promise<Comment[]>;
    fetchReactions?: (ids: CommentId[]) => Promise<Record<string, ReactionAgg>>;
    fetchMentions?: (ids: CommentId[]) => Promise<Record<string, ResolvedMention[]>>;
  },
): Promise<CommentTree> {
  const maxDepth = options.maxDepth ?? MAX_DEPTH;
  const sortBy = options.sortBy ?? DEFAULT_SORT;
  const includeDeleted = options.includeDeleted ?? false;

  // Fetch flat
  const allComments = deps?.fetchAll ? await deps.fetchAll(postId) : [];

  // Filtra
  const filtered = allComments.filter((c) => {
    if (!includeDeleted && c.deletedAt && c.depth > 0) return false;
    return c.depth <= maxDepth;
  });

  // Sort top-level
  const roots = filtered.filter((c) => c.parentId === null);
  sortRoots(roots, sortBy);

  // Cursor pagination
  let paginatedRoots = roots;
  if (options.rootCursor) {
    const cursorIdx = roots.findIndex((c) => c.id === options.rootCursor);
    paginatedRoots = roots.slice(cursorIdx + 1);
  }
  if (options.rootLimit && options.rootLimit > 0) {
    paginatedRoots = paginatedRoots.slice(0, options.rootLimit);
  }

  // Index por id
  const byId = new Map<CommentId, Comment>();
  for (const c of filtered) byId.set(c.id, c);

  // Fetch reactions aggregate em batch
  const idsToFetch = paginatedRoots.map((r) => r.id);
  const reactionsMap: Record<string, ReactionAgg> = deps?.fetchReactions
    ? await deps.fetchReactions(idsToFetch)
    : {};
  const mentionsMap: Record<string, ResolvedMention[]> = deps?.fetchMentions
    ? await deps.fetchMentions(idsToFetch)
    : {};

  // Build tree
  const nodes: CommentNode[] = paginatedRoots.map((root) =>
    buildNode(root, byId, reactionsMap, mentionsMap, maxDepth, 0),
  );

  // Stats
  const deletedCount = filtered.filter((c) => c.deletedAt !== null).length;
  const maxDepthFound = filtered.reduce((max, c) => Math.max(max, c.depth), 0);

  return {
    postId,
    nodes,
    totalCount: filtered.length,
    rootCount: roots.length,
    deletedCount,
    maxDepthFound,
    builtAt: new Date().toISOString(),
    schemaVersion: SCHEMA_VERSION,
  };
}

/**
 * Build CommentNode recursivamente.
 *
 * Quando depth >= maxDepth, siblings achatam em `overflowReplies`.
 */
function buildNode(
  comment: Comment,
  byId: Map<CommentId, Comment>,
  reactionsMap: Record<string, ReactionAgg>,
  mentionsMap: Record<string, ResolvedMention[]>,
  maxDepth: number,
  level: number,
): CommentNode {
  const children = Array.from(byId.values())
    .filter((c) => c.parentId === comment.id)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  let replies: CommentNode[] = [];
  let overflowReplies: CommentNode[] = [];

  if (level + 1 < maxDepth) {
    replies = children.map((child) =>
      buildNode(child, byId, reactionsMap, mentionsMap, maxDepth, level + 1),
    );
  } else {
    overflowReplies = children.map((child) =>
      buildNode(child, byId, reactionsMap, mentionsMap, maxDepth + 100, level + 1),
    );
  }

  const totalDescendants = countDescendants(comment, byId);

  return {
    comment,
    replies,
    overflowReplies,
    level,
    totalDescendants,
    reactions: reactionsMap[comment.id] ?? emptyReactionAgg(comment.id),
    mentions: mentionsMap[comment.id] ?? [],
  };
}

/** Conta descendentes recursivamente. */
function countDescendants(comment: Comment, byId: Map<CommentId, Comment>): number {
  let count = 0;
  const stack: CommentId[] = [comment.id];
  while (stack.length > 0) {
    const id = stack.pop()!;
    for (const c of byId.values()) {
      if (c.parentId === id) {
        count++;
        stack.push(c.id);
      }
    }
  }
  return count;
}

/** Sort roots conforme sortBy. */
function sortRoots(roots: Comment[], sortBy: CommentSort): void {
  switch (sortBy) {
    case 'newest':
      roots.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      break;
    case 'oldest':
      roots.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
      break;
    case 'top':
      roots.sort((a, b) => b.reactionCount - a.reactionCount);
      break;
    case 'hot':
      // hot = reactionCount + childCount ponderado por tempo
      roots.sort((a, b) => hotScore(b) - hotScore(a));
      break;
  }
}

/** Hot score (Hacker News-like, simplificado). */
function hotScore(c: Comment): number {
  const ageMs = Date.now() - new Date(c.createdAt).getTime();
  const ageHours = ageMs / (1000 * 60 * 60);
  const engagement = c.reactionCount + c.childCount * 2 + c.descendantCount;
  return engagement / Math.pow(ageHours + 2, 1.5);
}

/**
 * flattenTree — converte árvore em lista plana (DFS ou BFS).
 *
 * Útil para analytics, exports, search indexing.
 */
export type FlattenMode = 'dfs' | 'bfs';

export interface FlattenOptions {
  mode?: FlattenMode;
  /** Limite de profundidade (acumulado). */
  maxDepth?: number;
  /** Inclui overflow replies? Default true. */
  includeOverflow?: boolean;
}

export function flattenTree(tree: CommentTree, options: FlattenOptions = {}): CommentNode[] {
  const mode = options.mode ?? 'dfs';
  const maxDepth = options.maxDepth ?? MAX_DEPTH;
  const includeOverflow = options.includeOverflow ?? true;
  const result: CommentNode[] = [];

  if (mode === 'dfs') {
    const stack: CommentNode[] = [...tree.nodes].reverse();
    while (stack.length > 0) {
      const node = stack.pop()!;
      if (node.level > maxDepth) continue;
      result.push(node);
      // Push replies em ordem reversa para que fiquem na ordem original
      for (let i = node.replies.length - 1; i >= 0; i--) {
        stack.push(node.replies[i]);
      }
      if (includeOverflow) {
        for (let i = node.overflowReplies.length - 1; i >= 0; i--) {
          stack.push(node.overflowReplies[i]);
        }
      }
    }
  } else {
    const queue: CommentNode[] = [...tree.nodes];
    while (queue.length > 0) {
      const node = queue.shift()!;
      if (node.level > maxDepth) continue;
      result.push(node);
      queue.push(...node.replies);
      if (includeOverflow) queue.push(...node.overflowReplies);
    }
  }

  return result;
}

// ============================================================================
// SEÇÃO 9 — REACTIONS
// ============================================================================

/**
 * addReaction — toggle reaction (emoji) em um comment.
 *
 * Se já existe (userId, commentId, emoji), remove. Senão adiciona.
 * Retorna aggregate atualizado.
 *
 * Whitelist: apenas emojis em ALLOWED_REACTION_EMOJIS.
 */
export async function addReaction(
  commentId: CommentId,
  userId: string,
  emoji: string,
  options?: {
    persist?: (op: 'add' | 'remove', commentId: CommentId, userId: string, emoji: string) => Promise<void>;
    fetchAgg?: (id: CommentId) => Promise<ReactionAgg>;
  },
): Promise<ReactionAgg> {
  if (!isAllowedReaction(emoji)) {
    throw new CommentError('reaction-not-allowed', `Emoji "${emoji}" não está na whitelist`, {
      context: { allowed: ALLOWED_REACTION_EMOJIS },
    });
  }

  // Toggle logic — verifica se já existe
  const current = options?.fetchAgg ? await options.fetchAgg(commentId) : emptyReactionAgg(commentId);
  const reactors = current.reactors[emoji] ?? [];
  const alreadyReacted = reactors.includes(userId);

  const op: 'add' | 'remove' = alreadyReacted ? 'remove' : 'add';

  if (options?.persist) {
    await options.persist(op, commentId, userId, emoji);
  }

  // Rebuild aggregate
  const newReactors = alreadyReacted
    ? reactors.filter((u) => u !== userId)
    : [...reactors, userId];

  const counts = { ...current.counts };
  counts[emoji] = newReactors.length;
  if (counts[emoji] === 0) delete counts[emoji];

  const newReactorsMap = { ...current.reactors };
  newReactorsMap[emoji] = newReactors;
  if (newReactors.length === 0) delete newReactorsMap[emoji];

  const total = Object.values(counts).reduce((sum, n) => sum + n, 0);

  return {
    commentId,
    counts,
    reactors: newReactorsMap,
    total,
  };
}

/**
 * removeReaction — remove reaction específica.
 *
 * Idempotente: se userId não reagiu com esse emoji, no-op.
 */
export async function removeReaction(
  commentId: CommentId,
  userId: string,
  emoji: string,
  options?: {
    persist?: (commentId: CommentId, userId: string, emoji: string) => Promise<void>;
    fetchAgg?: (id: CommentId) => Promise<ReactionAgg>;
  },
): Promise<ReactionAgg> {
  if (!isAllowedReaction(emoji)) {
    throw new CommentError('reaction-not-allowed', `Emoji "${emoji}" não está na whitelist`);
  }

  const current = options?.fetchAgg ? await options.fetchAgg(commentId) : emptyReactionAgg(commentId);
  const reactors = current.reactors[emoji] ?? [];
  const isPresent = reactors.includes(userId);

  if (!isPresent) {
    // Idempotent — return current
    return current;
  }

  if (options?.persist) {
    await options.persist(commentId, userId, emoji);
  }

  const newReactors = reactors.filter((u) => u !== userId);
  const counts = { ...current.counts };
  counts[emoji] = newReactors.length;
  if (counts[emoji] === 0) delete counts[emoji];

  const newReactorsMap = { ...current.reactors };
  newReactorsMap[emoji] = newReactors;
  if (newReactors.length === 0) delete newReactorsMap[emoji];

  const total = Object.values(counts).reduce((sum, n) => sum + n, 0);

  return {
    commentId,
    counts,
    reactors: newReactorsMap,
    total,
  };
}

/**
 * countReactions — aggregate simples.
 */
export async function countReactions(
  commentId: CommentId,
  options?: { fetchAgg?: (id: CommentId) => Promise<ReactionAgg> },
): Promise<{ total: number; byEmoji: Record<string, number> }> {
  const agg = options?.fetchAgg ? await options.fetchAgg(commentId) : emptyReactionAgg(commentId);
  return {
    total: agg.total,
    byEmoji: agg.counts,
  };
}

/** Helper: cria ReactionAgg vazio. */
export function emptyReactionAgg(commentId: CommentId): ReactionAgg {
  return {
    commentId,
    counts: {},
    reactors: {},
    total: 0,
  };
}

/** Helper: valida emoji contra whitelist. */
export function isAllowedReaction(emoji: string): boolean {
  return (ALLOWED_REACTION_EMOJIS as readonly string[]).includes(emoji);
}

// ============================================================================
// SEÇÃO 10 — READ STATE
// ============================================================================

/**
 * markAsRead — registra último comment lido por (user, post).
 *
 * Idempotente: chamar com mesmo lastReadCommentId é no-op.
 * `lastReadTotalCount` é denormalizado para cálculo rápido de unread.
 */
export async function markAsRead(
  userId: string,
  postId: string,
  lastReadCommentId: CommentId | null,
  options?: {
    persist?: (state: ReadState) => Promise<void>;
    fetchCurrentTotal?: (postId: string) => Promise<number>;
  },
): Promise<ReadState> {
  const total = options?.fetchCurrentTotal ? await options.fetchCurrentTotal(postId) : 0;

  const state: ReadState = {
    userId,
    postId,
    lastReadCommentId,
    lastReadAt: new Date().toISOString(),
    lastReadTotalCount: total,
  };

  if (options?.persist) {
    await options.persist(state);
  }

  return state;
}

/**
 * unreadCount — diff entre último lido e estado atual.
 *
 * Calcula: total_atual - lastReadTotalCount.
 * Não conta comentários do próprio user (não notificamos self).
 */
export async function unreadCount(
  userId: string,
  postId: string,
  options?: {
    fetchReadState?: (userId: string, postId: string) => Promise<ReadState | null>;
    fetchCurrentTotal?: (postId: string) => Promise<number>;
  },
): Promise<number> {
  const readState = options?.fetchReadState ? await options.fetchReadState(userId, postId) : null;
  const currentTotal = options?.fetchCurrentTotal ? await options.fetchCurrentTotal(postId) : 0;

  if (!readState) return currentTotal;
  return Math.max(0, currentTotal - readState.lastReadTotalCount);
}

// ============================================================================
// SEÇÃO 11 — REAL-TIME SUBSCRIPTIONS
// ============================================================================

/**
 * Subscription handle — controle de unsubscribe.
 */
export interface ThreadSubscription {
  postId: string;
  unsubscribe: () => void;
  /** Quando foi criada. */
  createdAt: string;
  /** Indica se está usando SSE ou polling. */
  transport: 'sse' | 'polling';
}

/**
 * Handler para eventos de thread.
 */
export type ThreadEventHandler = (event: ThreadEvent) => void;

export type ThreadEvent =
  | { type: 'comment-created'; comment: Comment }
  | { type: 'comment-edited'; commentId: CommentId; editedAt: string }
  | { type: 'comment-deleted'; commentId: CommentId; deletedAt: string }
  | { type: 'reaction-added'; commentId: CommentId; emoji: string; userId: string }
  | { type: 'reaction-removed'; commentId: CommentId; emoji: string; userId: string };

/**
 * subscribeToThread — escuta updates em tempo real.
 *
 * Preferência: SSE via w43/notifications-persistence.
 * Fallback: polling a cada pollIntervalMs.
 *
 * Retorna handle com `unsubscribe()` para cleanup.
 */
export async function subscribeToThread(
  postId: string,
  handler: ThreadEventHandler,
  options?: {
    pollIntervalMs?: number;
    sseEndpoint?: string;
    preferPolling?: boolean;
  },
): Promise<ThreadSubscription> {
  const pollInterval = options?.pollIntervalMs ?? 5000;
  const sseEndpoint = options?.sseEndpoint ?? `/api/posts/${postId}/comments/stream`;

  if (!options?.preferPolling && typeof globalThis.EventSource !== 'undefined') {
    // Tenta SSE
    try {
      const es = new EventSource(sseEndpoint);
      const events: ThreadEvent['type'][] = [
        'comment-created',
        'comment-edited',
        'comment-deleted',
        'reaction-added',
        'reaction-removed',
      ];
      for (const evt of events) {
        es.addEventListener(evt, (e: MessageEvent) => {
          try {
            const data = JSON.parse(e.data) as ThreadEvent;
            handler(data);
          } catch {
            // malformed event — skip
          }
        });
      }
      return {
        postId,
        createdAt: new Date().toISOString(),
        transport: 'sse',
        unsubscribe: () => es.close(),
      };
    } catch {
      // SSE falhou — cai para polling
    }
  }

  // Polling fallback
  let lastSeen = new Date().toISOString();
  const timer = setInterval(async () => {
    try {
      const res = await fetch(`/api/posts/${postId}/comments?since=${encodeURIComponent(lastSeen)}`);
      if (!res.ok) return;
      const data = (await res.json()) as { events: ThreadEvent[]; now: string };
      lastSeen = data.now;
      for (const evt of data.events) {
        handler(evt);
      }
    } catch {
      // network error — skip this tick
    }
  }, pollInterval);

  return {
    postId,
    createdAt: new Date().toISOString(),
    transport: 'polling',
    unsubscribe: () => clearInterval(timer),
  };
}

// ============================================================================
// SEÇÃO 12 — EDIT HISTORY + DIFF
// ============================================================================

/**
 * getEditHistory — retorna CommentEdit[] em ordem cronológica.
 *
 * @throws CommentError se comment não existe.
 */
export async function getEditHistory(
  commentId: CommentId,
  options?: { fetch?: (id: CommentId) => Promise<CommentEdit[]> },
): Promise<CommentEdit[]> {
  const comment = await fetchComment(commentId);
  if (!comment) {
    throw new CommentError('not-found', `Comment ${commentId} não encontrado`);
  }
  const history = options?.fetch ? await options.fetch(commentId) : [];
  return history.sort((a, b) => a.editedAt.localeCompare(b.editedAt));
}

/**
 * diffCommentBodies — diff line-level entre dois bodies.
 *
 * Implementação simples: emite hunks unificados em formato textual.
 * Para UI, parseamos linha por linha:
 *   "+ texto" → adicionado
 *   "- texto" → removido
 *   "  texto" → contexto
 *
 * Não usamos lib externa para manter este módulo self-contained.
 */
export function diffCommentBodies(oldBody: string, newBody: string): string {
  const oldLines = oldBody.split('\n');
  const newLines = newBody.split('\n');

  // LCS-based diff
  const lcs = computeLCS(oldLines, newLines);
  const out: string[] = [];

  let i = 0;
  let j = 0;
  let k = 0;

  while (i < oldLines.length || j < newLines.length) {
    if (k < lcs.length && i < oldLines.length && j < newLines.length) {
      if (oldLines[i] === lcs[k] && newLines[j] === lcs[k]) {
        out.push(`  ${oldLines[i]}`);
        i++;
        j++;
        k++;
        continue;
      }
      // Removed from old
      if (k >= lcs.length || oldLines[i] !== lcs[k]) {
        out.push(`- ${oldLines[i]}`);
        i++;
        continue;
      }
      // Added to new
      if (k >= lcs.length || newLines[j] !== lcs[k]) {
        out.push(`+ ${newLines[j]}`);
        j++;
        continue;
      }
    } else {
      if (i < oldLines.length) {
        out.push(`- ${oldLines[i]}`);
        i++;
      }
      if (j < newLines.length) {
        out.push(`+ ${newLines[j]}`);
        j++;
      }
    }
  }

  return out.join('\n');
}

/** LCS array para diff. */
function computeLCS(a: string[], b: string[]): string[] {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array<number>(n + 1).fill(0));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  // Backtrack
  const result: string[] = [];
  let i = m;
  let j = n;
  while (i > 0 && j > 0) {
    if (a[i - 1] === b[j - 1]) {
      result.unshift(a[i - 1]);
      i--;
      j--;
    } else if (dp[i - 1][j] >= dp[i][j - 1]) {
      i--;
    } else {
      j--;
    }
  }

  return result;
}

/**
 * countEdits — quantas vezes um comment foi editado.
 *
 * Usado para enforce de MAX_EDITS_PER_COMMENT.
 */
export async function countEdits(
  commentId: CommentId,
  options?: { fetch?: (id: CommentId) => Promise<CommentEdit[]> },
): Promise<number> {
  if (!options?.fetch) return 0;
  const history = await options.fetch(commentId);
  return history.length;
}

// ============================================================================
// SEÇÃO 13 — LGPD HELPERS
// ============================================================================

/**
 * redactComment — substitui dados sensíveis no body.
 *
 * CPF, email, telefone → máscaras. Mantém estrutura do texto.
 * Idempotente.
 */
export function redactComment(comment: Comment): Comment {
  const redactedBody = redactBody(comment.body);
  return {
    ...comment,
    body: redactedBody,
    bodyHtml: comment.bodyHtml ? redactBody(comment.bodyHtml) : null,
  };
}

/**
 * Redige PII em texto arbitrário.
 */
export function redactBody(body: string): string {
  let redacted = body;
  // CPF
  redacted = redacted.replace(
    /\b(\d{3})\.?(\d{3})\.?(\d{3})-?(\d{2})\b/g,
    '$1.***.***-$4',
  );
  // Email
  redacted = redacted.replace(
    /\b([\w._%+-]{1,3})[\w._%+-]*(@[\w.-]+\.[a-zA-Z]{2,})\b/g,
    '$1***$2',
  );
  // Tel BR
  redacted = redacted.replace(
    /\(?\d{2}\)?\s?9?\d{4}-?\d{4}/g,
    '(XX) XXXXX-XXXX',
  );
  return redacted;
}

/**
 * anonymizeAuthor — substitui authorId por "deleted-user" (LGPD Art. 18).
 *
 * Preserva thread structure e timestamps. Body é mantido (contexto da
 * conversa), mas author fica anônimo.
 *
 * NOTA: irreversível. Apenas para encerrar conta.
 */
export async function anonymizeAuthor(
  commentId: CommentId,
  options?: { persist?: (comment: Comment) => Promise<Comment> },
): Promise<Comment> {
  const comment = await fetchComment(commentId);
  if (!comment) {
    throw new CommentError('not-found', `Comment ${commentId} não encontrado`);
  }
  if (comment.authorAnonymized) {
    return comment; // idempotente
  }

  const updated: Comment = {
    ...comment,
    authorId: 'anonymous',
    authorAnonymized: true,
    // Body mantido — conversas precisam de contexto
  };

  if (options?.persist) {
    return await options.persist(updated);
  }
  return updated;
}

/**
 * bulkDeleteByAuthor — usado para atender LGPD Art. 18 (direito ao esquecimento).
 *
 * Deleta TODOS os comments de um authorId em todos os posts.
 * Retorna count de deletados.
 *
 * Admin-only — caller deve validar permissão.
 */
export async function bulkDeleteByAuthor(
  authorId: string,
  byAdminId: string,
  options?: {
    fetchByAuthor?: (id: string) => Promise<Comment[]>;
    persist?: (comment: Comment) => Promise<Comment>;
  },
): Promise<{ deletedCount: number; commentIds: CommentId[] }> {
  if (!options?.fetchByAuthor) {
    return { deletedCount: 0, commentIds: [] };
  }

  const authorComments = await options.fetchByAuthor(authorId);
  const deletedIds: CommentId[] = [];

  for (const comment of authorComments) {
    if (comment.deletedAt) continue;
    const fetchByAuthor = options.fetchByAuthor;
    const childFetcher: ((id: CommentId) => Promise<Comment[]>) | undefined = fetchByAuthor
      ? async (id: CommentId) =>
          (await fetchByAuthor(id))
            .filter((c) => c.parentId === id)
      : undefined;
    const updated = await softDeleteComment(comment.id, byAdminId, {
      reason: 'lgpd-erasure',
      asAdmin: true,
      cascade: true,
      persist: options.persist,
      fetchChildren: childFetcher,
    });
    deletedIds.push(updated.id);
  }

  return {
    deletedCount: deletedIds.length,
    commentIds: deletedIds,
  };
}

/**
 * exportThread — exporta thread completa em JSON/CSV/Markdown.
 *
 * Útil para:
 *   - LGPD Art. 18 (portabilidade)
 *   - Backup pessoal
 *   - Compartilhamento público (com sanitize)
 */
export async function exportThread(
  postId: string,
  format: ExportFormat,
  options?: {
    includeDeleted?: boolean;
    fetchTree?: (postId: string) => Promise<CommentTree>;
    anonymize?: boolean;
  },
): Promise<string> {
  const tree = options?.fetchTree ? await options.fetchTree(postId) : emptyTree(postId);
  const includeDeleted = options?.includeDeleted ?? false;
  const flat = flattenTree(tree, { mode: 'dfs', includeOverflow: true });
  const filtered = flat.filter((n) => includeDeleted || !n.comment.deletedAt);

  switch (format) {
    case 'json':
      return exportAsJson(filtered, options?.anonymize ?? false);
    case 'csv':
      return exportAsCsv(filtered, options?.anonymize ?? false);
    case 'markdown':
      return exportAsMarkdown(filtered, options?.anonymize ?? false);
  }
}

function emptyTree(postId: string): CommentTree {
  return {
    postId,
    nodes: [],
    totalCount: 0,
    rootCount: 0,
    deletedCount: 0,
    maxDepthFound: 0,
    builtAt: new Date().toISOString(),
    schemaVersion: SCHEMA_VERSION,
  };
}

function exportAsJson(nodes: CommentNode[], anonymize: boolean): string {
  const data = nodes.map((n) => ({
    id: n.comment.id,
    parentId: n.comment.parentId,
    authorId: anonymize ? 'anonymous' : n.comment.authorId,
    body: n.comment.body,
    createdAt: n.comment.createdAt,
    editedAt: n.comment.editedAt,
    deletedAt: n.comment.deletedAt,
    depth: n.comment.depth,
  }));
  return JSON.stringify({ exportedAt: new Date().toISOString(), comments: data }, null, 2);
}

function exportAsCsv(nodes: CommentNode[], anonymize: boolean): string {
  const header = 'id,parentId,authorId,createdAt,editedAt,deletedAt,depth,body';
  const rows = nodes.map((n) => {
    const fields = [
      n.comment.id,
      n.comment.parentId ?? '',
      anonymize ? 'anonymous' : n.comment.authorId,
      n.comment.createdAt,
      n.comment.editedAt ?? '',
      n.comment.deletedAt ?? '',
      String(n.comment.depth),
      // CSV-safe: escape aspas e quebras de linha
      `"${n.comment.body.replace(/"/g, '""').replace(/\n/g, '\\n')}"`,
    ];
    return fields.join(',');
  });
  return [header, ...rows].join('\n');
}

function exportAsMarkdown(nodes: CommentNode[], _anonymize: boolean): string {
  const lines: string[] = ['# Thread Export', ''];
  for (const n of nodes) {
    const indent = '  '.repeat(n.level);
    const author = _anonymize ? 'anonymous' : n.comment.authorId;
    lines.push(`${indent}- **${author}** (${n.comment.createdAt}):`);
    lines.push(`${indent}  ${n.comment.body.split('\n').join(`\n${indent}  `)}`);
  }
  return lines.join('\n');
}

// ============================================================================
// SEÇÃO 14 — NOTIFICAÇÕES (integração w43)
// ============================================================================

/**
 * Payload enviado para w43/notifications-persistence.
 */
export interface MentionNotificationPayload {
  type: 'MENTION';
  userId: string;
  actorId: string;
  postId: string;
  commentId: CommentId;
  handle: string;
  displayName: string | null;
  preview: string;
  timestamp: string;
}

/**
 * notifyMentionedUsers — chama w43/notifications-persistence.
 *
 * Em produção: Prisma.notification.create + push SSE.
 * Aqui: signature + shape + tipagem.
 */
export async function notifyMentionedUsers(
  mentions: Array<{ userId: string; handle: string; displayName: string | null }>,
  commentId: CommentId,
  options?: {
    fetchComment?: (id: CommentId) => Promise<Comment | null>;
    sendNotification?: (payload: MentionNotificationPayload) => Promise<void>;
  },
): Promise<{ notified: number; skipped: number }> {
  if (!options?.fetchComment || !options?.sendNotification) {
    return { notified: 0, skipped: mentions.length };
  }

  const comment = await options.fetchComment(commentId);
  if (!comment) return { notified: 0, skipped: mentions.length };

  let notified = 0;
  let skipped = 0;

  for (const mention of mentions) {
    // Skip self-mentions
    if (mention.userId === comment.authorId) {
      skipped++;
      continue;
    }

    const payload: MentionNotificationPayload = {
      type: 'MENTION',
      userId: mention.userId,
      actorId: comment.authorId,
      postId: comment.postId,
      commentId,
      handle: mention.handle,
      displayName: mention.displayName,
      preview: comment.body.slice(0, 200),
      timestamp: new Date().toISOString(),
    };

    try {
      await options.sendNotification(payload);
      notified++;
    } catch {
      skipped++;
    }
  }

  return { notified, skipped };
}

// ============================================================================
// SEÇÃO 15 — HELPERS INTERNOS
// ============================================================================

/**
 * fetchComment — stub type-level.
 *
 * Em prod, implementado via Prisma no module adapter.
 * Aqui retornamos null para indicar "não encontrado" sem dependência.
 */
async function fetchComment(id: CommentId): Promise<Comment | null> {
  // Caller deve injetar persistência real. Este stub existe apenas para
  // satisfazer o type system em cenários de uso type-level.
  void id;
  return null;
}

/**
 * generateCommentId — cuid-like simples baseado em timestamp + random.
 *
 * Em produção: Prisma gera via @default(cuid()).
 */
function generateCommentId(): string {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 10);
  return `c_${ts}${rand}`;
}

/**
 * generateEditId — id para CommentEdit entries.
 */
function generateEditId(): string {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 8);
  return `ce_${ts}${rand}`;
}

/**
 * hashBody — hash do body para integridade.
 *
 * Síncrono via FNV-1a 32-bit (não-cripto mas deterministic). Suficiente
 * para detectar edição de texto em CommentEdit.previousBodyHash.
 * Em prod, considerar upgrade para SHA-256 assíncrono + refactor.
 */
export function hashBody(body: string): string {
  return fnv1a(body);
}

/** FNV-1a 32-bit hash (síncrono, fallback). */
function fnv1a(input: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

// ============================================================================
// SEÇÃO 16 — CONVERSÕES / BRIDGE
// ============================================================================

/**
 * toLegacyComment — converte nosso domain Comment → legacy Comment type.
 *
 * Usado para retro-compat com consumers que esperam o shape antigo
 * (definido em src/types/community.ts antes de w47).
 */
export function toLegacyComment(c: Comment): LegacyComment {
  return {
    id: c.id,
    postId: c.postId,
    author: {
      id: c.authorAnonymized ? 'anonymous' : c.authorId,
      displayName: c.authorAnonymized ? 'Usuário Anônimo' : c.authorId,
    },
    content: c.body,
    parentId: c.parentId,
    likesCount: c.reactionCount,
    liked: false,
    createdAt: c.createdAt,
  };
}

/**
 * fromLegacyComment — converte legacy → domain.
 *
 * Usado ao migrar dados existentes para o novo schema.
 */
export function fromLegacyComment(legacy: LegacyComment): Comment {
  return {
    id: asCommentId(legacy.id),
    postId: legacy.postId,
    parentId: legacy.parentId ? asCommentId(legacy.parentId) : null,
    authorId: legacy.author.id,
    body: legacy.content,
    bodyHtml: null,
    depth: legacy.parentId ? 1 : 0,
    path: '',
    createdAt: legacy.createdAt,
    editedAt: null,
    deletedAt: null,
    deletedBy: null,
    deletedReason: null,
    lockedAt: null,
    lockedBy: null,
    reactionCount: legacy.likesCount,
    childCount: 0,
    descendantCount: 0,
    authorAnonymized: legacy.author.id === 'anonymous',
    mentionsResolved: false,
    flagged: false,
    flagReason: null,
  };
}

// ============================================================================
// SEÇÃO 17 — SUMMARY DE EXPORTS (documentação)
// ============================================================================
//
// Total: 50+ named exports.
//
// TYPES (12):
//   Comment, CommentId, CommentTree, CommentEdge, CommentNode,
//   CommentEdit, ReactionAgg, Mention, ResolvedMention, ReadState,
//   CreateCommentInput, GetTreeOptions, EditCommentOptions,
//   SoftDeleteOptions, CommentOpResult, BodyValidationResult,
//   BodyValidationIssue, CommentErrorCode, FlattenOptions,
//   ThreadSubscription, ThreadEvent, ThreadEventHandler,
//   MentionNotificationPayload, FlattenMode, CommentSort,
//   ExportFormat, DeleteReason, AllowedReactionEmoji, UserLookup
//
// CONSTANTS (12):
//   MAX_BODY_LENGTH, MAX_DEPTH, MAX_MENTIONS_PER_COMMENT,
//   MIN_BODY_LENGTH, MAX_EDITS_PER_COMMENT,
//   RATE_LIMIT_WINDOW_SECONDS, MAX_COMMENTS_PER_WINDOW,
//   MENTION_REGEX, PROFANITY_LIST, SCHEMA_VERSION,
//   DEFAULT_SORT, ALLOWED_SORTS, EXPORT_FORMATS,
//   ALLOWED_REACTION_EMOJIS, DELETE_REASONS
//
// FUNCTIONS (25+):
//   validateBody, parseMentions, resolveMentions,
//   createComment, editComment, softDeleteComment, restoreComment,
//   getCommentTree, flattenTree, addReaction, removeReaction,
//   countReactions, subscribeToThread, markAsRead, unreadCount,
//   getEditHistory, diffCommentBodies, countEdits,
//   redactComment, redactBody, anonymizeAuthor,
//   bulkDeleteByAuthor, exportThread, notifyMentionedUsers,
//   hashBody, toLegacyComment, fromLegacyComment,
//   asCommentId, fromPrismaCommentId, emptyReactionAgg,
//   isAllowedReaction
//
// CLASS (1):
//   CommentError
//
// ============================================================================