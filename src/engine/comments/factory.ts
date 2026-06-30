/**
 * ════════════════════════════════════════════════════════════════════════════
 * W87-C — COMMENTS ENGINE FACTORY
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Wires the parser + sanitizer + adapter into a single CommentsEngine surface.
 *
 *   addComment(postId, authorId, body, parentId, lgpdConsent)
 *     ├─ validateLgpd(consent)         (throws CommentError if !consent)
 *     ├─ sanitizeBody(body)
 *     ├─ check length (MIN/MAX)
 *     ├─ check parentId (depth ≤ 1, same postId, exists)
 *     ├─ parseMentions(sanitized, knownHandles)
 *     └─ adapter.insert(...)
 *
 *   editComment(commentId, newBody)
 *     ├─ find existing, refuse if status='deleted'
 *     ├─ sanitize + parse mentions
 *     └─ adapter.update(...)
 *
 *   deleteComment(commentId)
 *     ├─ adapter.softDelete(...)  (body='', status='deleted')
 *     └─ The cascade rule: ALL replies are also soft-deleted (since a
 *        deleted root has no meaningful reply target). This matches
 *        the W84-C moderation decision (cycle 84 admin moderation).
 *
 *   listThread(postId, viewerId)
 *     ├─ adapter.listByPost(postId)
 *     ├─ filter out 'hidden' (unless viewer is the author)
 *     ├─ filter out 'deleted' from displayed body (kept in tree for reply
 *        structure preservation, but body is '')
 *     ├─ group replies by parentId → ThreadNode
 *     └─ sort replies chronologically (oldest first)
 */

// ────────────────────────────────────────────────────────────────────────────
// Imports
// ────────────────────────────────────────────────────────────────────────────

import {
  CommentError,
  ERROR_CODES,
  MAX_BODY_LENGTH,
  MAX_THREAD_DEPTH,
  MIN_BODY_LENGTH,
  nowIso,
  type Comment,
  type CommentId,
  type CommentsAdapter,
  type CommentsEngine,
  type Mention,
  type PostId,
  type ThreadNode,
  type UserId,
} from './types';
import { parseMentions, sanitizeBody } from './parser';

// ────────────────────────────────────────────────────────────────────────────
// Internal helpers (not exported)
// ────────────────────────────────────────────────────────────────────────────

function trimmed(s: string): string {
  return s.trim();
}

function checkLength(body: string): void {
  if (trimmed(body).length < MIN_BODY_LENGTH) {
    throw new CommentError(ERROR_CODES.BODY_TOO_SHORT, 'Comentário vazio.');
  }
  if (body.length > MAX_BODY_LENGTH) {
    throw new CommentError(
      ERROR_CODES.BODY_TOO_LONG,
      `Comentário excede ${MAX_BODY_LENGTH} caracteres.`,
    );
  }
}

/** Throws if LGPD consent is missing — ALWAYS required on first comment. */
export function validateLgpd(consent: boolean): void {
  if (consent !== true) {
    throw new CommentError(
      ERROR_CODES.LGPD_CONSENT_REQUIRED,
      'É necessário consentir com a Política de Privacidade (LGPD) antes de comentar.',
    );
  }
}

// ────────────────────────────────────────────────────────────────────────────
// ThreadNode grouping
// ────────────────────────────────────────────────────────────────────────────

function groupThread(
  allComments: ReadonlyArray<Comment>,
  viewerId: UserId,
): ThreadNode[] {
  // Step 1: visibility filter.
  //   - 'hidden' comments are visible only to their author.
  //   - 'deleted' replies are kept (shown with empty body for context),
  //     but 'deleted' ROOTS are excluded so the whole subtree disappears.
  const filtered = allComments.filter((c) => {
    if (c.status === 'hidden') return c.authorId === viewerId;
    return true;
  });

  const roots = filtered
    .filter((c) => c.parentId === null && c.status !== 'deleted')
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  const replyMap = new Map<CommentId, Comment[]>();
  for (const c of filtered) {
    if (c.parentId === null) continue;
    const arr = replyMap.get(c.parentId) ?? [];
    arr.push(c);
    replyMap.set(c.parentId, arr);
  }
  for (const arr of replyMap.values()) {
    arr.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }

  return roots.map((root): ThreadNode => {
    const rawReplies = replyMap.get(root.id) ?? [];
    const replies = rawReplies.map(
      (r): ThreadNode => ({ ...r, replies: [], depth: 1 }),
    );
    return { ...root, replies, depth: 0 };
  });
}

// ────────────────────────────────────────────────────────────────────────────
// Factory
// ────────────────────────────────────────────────────────────────────────────

/**
 * Build a CommentsEngine bound to the supplied adapter. The `knownHandles`
 * resolver is called lazily and may be dynamic (e.g. pulled from a
 * user-search endpoint in production).
 */
export function createCommentsEngine(
  adapter: CommentsAdapter,
  resolveKnownHandles: () => ReadonlySet<string> = () => new Set<string>(),
): CommentsEngine {
  /** Public surface — all methods are bound so `engine.addComment(...)` works. */
  const engine: CommentsEngine = {
    async addComment(postId, authorId, body, parentId, lgpdConsent) {
      // 1) LGPD gate — first and most important check.
      validateLgpd(lgpdConsent);

      // 2) Sanitize + length check.
      const sanitized = sanitizeBody(body);
      checkLength(sanitized);

      // 3) Depth + cross-post checks (only when there IS a parent).
      if (parentId !== null) {
        const parent = await adapter.findById(parentId);
        if (!parent) {
          throw new CommentError(
            ERROR_CODES.PARENT_NOT_FOUND,
            'Comentário-pai não encontrado.',
          );
        }
        if (parent.postId !== postId) {
          throw new CommentError(
            ERROR_CODES.CROSS_POST_REPLY,
            'Reply pertence a outro post.',
          );
        }
        if (parent.parentId !== null) {
          // parent is itself a reply (depth 1) → adding another level would
          // violate MAX_THREAD_DEPTH (1). Reject with a clear message.
          throw new CommentError(
            ERROR_CODES.MAX_DEPTH_EXCEEDED,
            `Profundidade máxima (${MAX_THREAD_DEPTH}) atingida. Replies de replies viram raízes.`,
          );
        }
      }

      // 4) Parse mentions (against the SANITIZED body, so we don't accidentally
      //    index text inside a removed <script> block).
      const mentions = parseMentions(sanitized, resolveKnownHandles());

      // 5) Persist via the adapter.
      const persisted = await adapter.insert({
        postId,
        authorId,
        parentId,
        body: sanitized,
        mentions,
      });
      return persisted;
    },

    async editComment(commentId, newBody) {
      const existing = await adapter.findById(commentId);
      if (!existing) {
        throw new CommentError(
          ERROR_CODES.COMMENT_NOT_FOUND,
          'Comentário não encontrado.',
        );
      }
      if (existing.status === 'deleted') {
        throw new CommentError(
          ERROR_CODES.EDIT_ON_DELETED,
          'Comentário deletado não pode ser editado.',
        );
      }
      const sanitized = sanitizeBody(newBody);
      checkLength(sanitized);
      const mentions = parseMentions(sanitized, resolveKnownHandles());
      return adapter.update(commentId, {
        body: sanitized,
        mentions,
        editedAt: nowIso(),
      });
    },

    async deleteComment(commentId) {
      const existing = await adapter.findById(commentId);
      if (!existing) {
        throw new CommentError(
          ERROR_CODES.COMMENT_NOT_FOUND,
          'Comentário não encontrado.',
        );
      }

      // Cascade: if we delete a ROOT, soft-delete all replies as well.
      if (existing.parentId === null) {
        const all = await adapter.listByPost(existing.postId);
        const replies = all.filter((c) => c.parentId === commentId);
        for (const r of replies) {
          await adapter.softDelete(r.id);
        }
      }
      return adapter.softDelete(commentId);
    },

    async listThread(postId, viewerId) {
      const all = await adapter.listByPost(postId);
      return groupThread(all, viewerId);
    },

    async findById(commentId) {
      return adapter.findById(commentId);
    },

    knownHandles() {
      return Array.from(resolveKnownHandles()).sort();
    },
  };

  return engine;
}
