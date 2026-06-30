// ============================================================================
// COMMENTS ENGINE — CRUD + threading + mention trigger
// ============================================================================
// Cobre o ciclo de vida de um Comment: create / edit / delete / fetch.
// Integra com:
//   - Prisma (persistência real)
//   - comments-notifications (trigger de @mention notifications)
//   - comments-mentions (extração de handles)
//
// Prisma é carregado lazy (dynamic import) para:
//   1. Permitir testes unitários sem fixture de DB
//   2. Evitar falha de import em ambientes sem DATABASE_URL
//   3. Permitir mocking limpo via vi.mock('@/lib/prisma')
//
// Soft-delete: comments usam `deletedAt` (já no schema Prisma).
// Threading: parentId auto-referencial (1-N). Máx profundidade NÃO é
//   enforçada aqui — apenas no UI (maxDepth=3). Server permite profundidade
//   arbitrária para suportar cases legítimos (moderação, export).
//
// MAX_CONTENT_LENGTH: 2000 chars (mesmo limite do CommentThread UI).
// ============================================================================

import { Prisma } from '@prisma/client';
import type { Author } from '@/types/community';

// ============================================================================
// CONSTANTS
// ============================================================================

export const MAX_COMMENT_LENGTH = 2000;
export const MAX_MENTIONS_PER_COMMENT = 10;
export const DEFAULT_PAGE_LIMIT = 20;
export const MAX_PAGE_LIMIT = 100;

export const COMMENT_SORT_OPTIONS = ['newest', 'oldest', 'top'] as const;
export type CommentSortBy = (typeof COMMENT_SORT_OPTIONS)[number];

// ============================================================================
// ERRORS
// ============================================================================

export class CommentValidationError extends Error {
  statusCode = 400;
  constructor(message: string) {
    super(message);
    this.name = 'CommentValidationError';
  }
}

export class CommentNotFoundError extends Error {
  statusCode = 404;
  constructor(commentId: string) {
    super(`Comment não encontrado: ${commentId}`);
    this.name = 'CommentNotFoundError';
  }
}

export class CommentForbiddenError extends Error {
  statusCode = 403;
  constructor(message = 'Você não tem permissão para esta ação') {
    super(message);
    this.name = 'CommentForbiddenError';
  }
}

export class CommentParentMismatchError extends Error {
  statusCode = 400;
  constructor() {
    super('parentId não pertence ao post informado');
    this.name = 'CommentParentMismatchError';
  }
}

export class PostNotFoundError extends Error {
  statusCode = 404;
  constructor(postId: string) {
    super(`Post não encontrado: ${postId}`);
    this.name = 'PostNotFoundError';
  }
}

// ============================================================================
// TYPES
// ============================================================================

/**
 * Comment shape retornado pela engine. Serializável (ISO dates).
 * Inclui `mentions` (handles detectados) e `replyCount` quando aplicável.
 */
export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  parentId: string | null;
  content: string;
  createdAt: string;
  editedAt: string | null;
  deletedAt: string | null;
  mentions: string[];
  author?: Author;
}

export interface CommentWithReplies extends Comment {
  replyCount: number;
  descendants: number;
}

export interface CommentOptions {
  limit?: number;
  offset?: number;
  sortBy?: CommentSortBy;
  /** Quando true, inclui comments soft-deletados (default: false). */
  includeDeleted?: boolean;
  /** Quando true, só top-level (parentId IS NULL). Default: false (flat). */
  topLevelOnly?: boolean;
}

export interface PaginatedComments {
  comments: Comment[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export interface CommentCount {
  total: number;
  topLevel: number;
  replies: number;
}

// ============================================================================
// LAZY PRISMA — evita import-time DB connection
// ============================================================================

type PrismaLike = {
  comment: {
    findUnique: (args: unknown) => Promise<unknown>;
    findFirst: (args: unknown) => Promise<unknown>;
    findMany: (args: unknown) => Promise<unknown[]>;
    count: (args: unknown) => Promise<number>;
    create: (args: unknown) => Promise<unknown>;
    update: (args: unknown) => Promise<unknown>;
    updateMany: (args: unknown) => Promise<unknown>;
  };
  post: {
    findUnique: (args: unknown) => Promise<unknown>;
    update: (args: unknown) => Promise<unknown>;
  };
  user: {
    findUnique: (args: unknown) => Promise<unknown>;
    findMany: (args: unknown) => Promise<unknown[]>;
  };
};

let _prisma: PrismaLike | null = null;
async function getPrisma(): Promise<PrismaLike> {
  if (_prisma) return _prisma;
  const mod = await import('@/lib/prisma');
  _prisma = mod.prisma as unknown as PrismaLike;
  return _prisma;
}

/**
 * Para testes: permite injetar um mock diretamente.
 * NÃO usar em código de produção.
 */
export function _setPrismaForTesting(mock: PrismaLike | null): void {
  _prisma = mock;
}

// ============================================================================
// HELPERS — DTO mapping
// ============================================================================

type RawComment = {
  id: string;
  postId: string;
  authorId: string;
  parentId: string | null;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

function toDto(raw: RawComment, mentions: string[] = []): Comment {
  return {
    id: raw.id,
    postId: raw.postId,
    authorId: raw.authorId,
    parentId: raw.parentId,
    content: raw.content,
    createdAt: raw.createdAt.toISOString(),
    editedAt: raw.updatedAt && raw.createdAt.getTime() !== raw.updatedAt.getTime()
      ? raw.updatedAt.toISOString()
      : null,
    deletedAt: raw.deletedAt ? raw.deletedAt.toISOString() : null,
    mentions,
  };
}

function validateContent(content: string): void {
  if (typeof content !== 'string') {
    throw new CommentValidationError('content deve ser string');
  }
  const trimmed = content.trim();
  if (trimmed.length === 0) {
    throw new CommentValidationError('content não pode ser vazio');
  }
  if (content.length > MAX_COMMENT_LENGTH) {
    throw new CommentValidationError(
      `content excede ${MAX_COMMENT_LENGTH} caracteres`
    );
  }
}

function validatePostId(postId: string): void {
  if (!postId || typeof postId !== 'string') {
    throw new CommentValidationError('postId inválido');
  }
}

function validateAuthorId(authorId: string): void {
  if (!authorId || typeof authorId !== 'string') {
    throw new CommentValidationError('authorId inválido');
  }
}

// ============================================================================
// CREATE
// ============================================================================

/**
 * Cria um comentário novo. Se `parentId` for informado, valida que o parent
 * existe E pertence ao mesmo post (consistência referencial).
 *
 * Após persistir:
 *   - Incrementa `commentsCount` no Post (best-effort, não falha a op).
 *   - Extrai @mentions e dispara notifications (best-effort).
 *
 * @returns Comment persistido
 */
export async function createComment(input: {
  postId: string;
  authorId: string;
  content: string;
  parentId?: string | null;
}): Promise<Comment> {
  validatePostId(input.postId);
  validateAuthorId(input.authorId);
  validateContent(input.content);

  const prisma = await getPrisma();

  // 1. Valida que o post existe e não está deletado
  const post = await prisma.post.findUnique({
    where: { id: input.postId },
    select: { id: true, deletedAt: true },
  }) as { id: string; deletedAt: Date | null } | null;

  if (!post || post.deletedAt) {
    throw new PostNotFoundError(input.postId);
  }

  // 2. Valida parent (se houver)
  if (input.parentId) {
    const parent = await prisma.comment.findUnique({
      where: { id: input.parentId },
      select: { id: true, postId: true, deletedAt: true },
    }) as { id: string; postId: string; deletedAt: Date | null } | null;

    if (!parent || parent.deletedAt) {
      throw new CommentNotFoundError(input.parentId);
    }
    if (parent.postId !== input.postId) {
      throw new CommentParentMismatchError();
    }
  }

  // 3. Cria o comment
  const created = await prisma.comment.create({
    data: {
      postId: input.postId,
      authorId: input.authorId,
      content: input.content,
      parentId: input.parentId ?? null,
    },
  }) as RawComment;

  // 4. Incrementa contador (best-effort)
  try {
    await prisma.post.update({
      where: { id: input.postId },
      data: { commentsCount: { increment: 1 } },
    });
  } catch {
    // best-effort
  }

  // 5. Extrai mentions e dispara notifications (best-effort)
  const mentions = await safeExtractMentions(input.content);
  await safeTriggerMentionNotifications({
    commentId: created.id,
    postId: created.postId,
    mentionerId: created.authorId,
    mentions,
  });

  return toDto(created, mentions);
}

// ============================================================================
// EDIT
// ============================================================================

/**
 * Edita o conteúdo de um comentário. Apenas o autor original pode editar.
 * - Se o comentário está soft-deletado, rejeita.
 * - Re-extrai mentions do novo conteúdo e dispara notifications para
 *   usuários NOVAMENTE mencionados (não duplica para já mencionados).
 */
export async function editComment(input: {
  commentId: string;
  authorId: string;
  newContent: string;
}): Promise<Comment> {
  if (!input.commentId || typeof input.commentId !== 'string') {
    throw new CommentValidationError('commentId inválido');
  }
  validateAuthorId(input.authorId);
  validateContent(input.newContent);

  const prisma = await getPrisma();

  const existing = await prisma.comment.findUnique({
    where: { id: input.commentId },
  }) as RawComment | null;

  if (!existing || existing.deletedAt) {
    throw new CommentNotFoundError(input.commentId);
  }
  if (existing.authorId !== input.authorId) {
    throw new CommentForbiddenError(
      'Apenas o autor pode editar este comentário'
    );
  }

  const updated = await prisma.comment.update({
    where: { id: input.commentId },
    data: { content: input.newContent },
  }) as RawComment;

  // Re-trigger mentions (apenas handles NOVAMENTE mencionados)
  const oldMentions = await safeExtractMentions(existing.content);
  const newMentions = await safeExtractMentions(input.newContent);
  const freshMentions = newMentions.filter((m) => !oldMentions.includes(m));
  await safeTriggerMentionNotifications({
    commentId: updated.id,
    postId: updated.postId,
    mentionerId: updated.authorId,
    mentions: freshMentions,
  });

  return toDto(updated, newMentions);
}

// ============================================================================
// DELETE
// ============================================================================

/**
 * Soft-delete: set `deletedAt = now()`. Apenas o autor pode deletar.
 * Conteúdo é preservado no banco (audit) mas a UI esconde via filtro.
 */
export async function deleteComment(input: {
  commentId: string;
  authorId: string;
}): Promise<void> {
  if (!input.commentId) {
    throw new CommentValidationError('commentId inválido');
  }
  validateAuthorId(input.authorId);

  const prisma = await getPrisma();

  const existing = await prisma.comment.findUnique({
    where: { id: input.commentId },
  }) as RawComment | null;

  if (!existing) {
    throw new CommentNotFoundError(input.commentId);
  }
  if (existing.deletedAt) {
    // idempotente: já deletado, noop
    return;
  }
  if (existing.authorId !== input.authorId) {
    throw new CommentForbiddenError(
      'Apenas o autor pode deletar este comentário'
    );
  }

  await prisma.comment.update({
    where: { id: input.commentId },
    data: { deletedAt: new Date() },
  });

  // Decrementa contador (best-effort)
  try {
    await prisma.post.update({
      where: { id: existing.postId },
      data: { commentsCount: { decrement: 1 } },
    });
  } catch {
    // best-effort
  }
}

// ============================================================================
// FETCH
// ============================================================================

/**
 * Fetch um comment por ID. Retorna null se soft-deletado (a menos que
 * `includeDeleted=true`).
 */
export async function getCommentById(
  commentId: string,
  options?: { includeDeleted?: boolean }
): Promise<Comment | null> {
  if (!commentId) {
    throw new CommentValidationError('commentId inválido');
  }
  const prisma = await getPrisma();

  const raw = await prisma.comment.findUnique({
    where: { id: commentId },
  }) as RawComment | null;

  if (!raw) return null;
  if (raw.deletedAt && !options?.includeDeleted) return null;

  const mentions = await safeExtractMentions(raw.content);
  return toDto(raw, mentions);
}

/**
 * Lista paginada de comentários de um post. Flat (não-aninhado).
 *
 * `sortBy`:
 *   - 'newest' (default): createdAt desc
 *   - 'oldest':           createdAt asc
 *   - 'top':              likesCount desc, createdAt desc
 */
export async function getCommentsForPost(
  postId: string,
  options: CommentOptions = {}
): Promise<PaginatedComments> {
  validatePostId(postId);

  const limit = clampLimit(options.limit ?? DEFAULT_PAGE_LIMIT);
  const offset = Math.max(0, options.offset ?? 0);
  const sortBy = options.sortBy ?? 'newest';

  const prisma = await getPrisma();

  const where: Prisma.CommentWhereInput = {
    postId,
    ...(options.includeDeleted ? {} : { deletedAt: null }),
    ...(options.topLevelOnly ? { parentId: null } : {}),
  };

  const orderBy: Prisma.CommentOrderByWithRelationInput[] =
    sortBy === 'oldest'
      ? [{ createdAt: 'asc' }]
      : sortBy === 'top'
      ? [{ likesCount: 'desc' }, { createdAt: 'desc' }]
      : [{ createdAt: 'desc' }];

  const [rows, total] = await Promise.all([
    prisma.comment.findMany({
      where,
      orderBy,
      take: limit,
      skip: offset,
    }) as Promise<RawComment[]>,
    prisma.comment.count({ where }),
  ]);

  const comments = await Promise.all(
    rows.map(async (raw) => {
      const mentions = await safeExtractMentions(raw.content);
      return toDto(raw, mentions);
    })
  );

  return {
    comments,
    total,
    limit,
    offset,
    hasMore: offset + comments.length < total,
  };
}

/**
 * Conta comentários (total + top-level + replies) para um post.
 */
export async function getCommentCount(postId: string): Promise<CommentCount> {
  validatePostId(postId);
  const prisma = await getPrisma();

  const baseWhere: Prisma.CommentWhereInput = {
    postId,
    deletedAt: null,
  };

  const [total, topLevel, replies] = await Promise.all([
    prisma.comment.count({ where: baseWhere }),
    prisma.comment.count({
      where: { ...baseWhere, parentId: null },
    }),
    prisma.comment.count({
      where: { ...baseWhere, NOT: { parentId: null } },
    }),
  ]);

  return { total, topLevel, replies };
}

// ============================================================================
// HELPERS — safe wrappers (best-effort)
// ============================================================================

async function safeExtractMentions(content: string): Promise<string[]> {
  try {
    const { extractMentions } = await import('./comments-mentions');
    // extractMentions returns Mention[]; we only need usernames (string[])
    return extractMentions(content)
      .map((m) => m.username)
      .slice(0, MAX_MENTIONS_PER_COMMENT);
  } catch {
    return [];
  }
}

async function safeTriggerMentionNotifications(input: {
  commentId: string;
  postId: string;
  mentionerId: string;
  mentions: string[];
}): Promise<void> {
  if (input.mentions.length === 0) return;
  try {
    const { createMentionNotificationsForUsernames } = await import(
      './comments-notifications'
    );
    await createMentionNotificationsForUsernames({
      commentId: input.commentId,
      postId: input.postId,
      mentionerId: input.mentionerId,
      usernames: input.mentions,
    });
  } catch {
    // best-effort — failures em notifications não quebram createComment
  }
}

function clampLimit(raw: number): number {
  if (!Number.isFinite(raw) || raw <= 0) return DEFAULT_PAGE_LIMIT;
  return Math.min(Math.floor(raw), MAX_PAGE_LIMIT);
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

export function isCommentSortBy(value: unknown): value is CommentSortBy {
  return (
    typeof value === 'string' &&
    (COMMENT_SORT_OPTIONS as readonly string[]).includes(value)
  );
}

// ============================================================================
// PUBLIC EXPORTS — canonical surface
// ============================================================================

export const __allExports = {
  // functions
  createComment,
  editComment,
  deleteComment,
  getCommentById,
  getCommentsForPost,
  getCommentCount,
  _setPrismaForTesting,
  // errors
  CommentValidationError,
  CommentNotFoundError,
  CommentForbiddenError,
  CommentParentMismatchError,
  PostNotFoundError,
  // types (exported via type-only)
  // constants
  MAX_COMMENT_LENGTH,
  MAX_MENTIONS_PER_COMMENT,
  DEFAULT_PAGE_LIMIT,
  MAX_PAGE_LIMIT,
  COMMENT_SORT_OPTIONS,
  // type guards
  isCommentSortBy,
} as const;