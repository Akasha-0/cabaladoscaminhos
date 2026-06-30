// ============================================================================
// COMMENTS ENGINE — Vitest spec (mocked Prisma)
// ============================================================================
// Cobre CRUD: createComment, editComment, deleteComment, fetch helpers.
// Prisma é mockado via vi.mock (padrão do projeto — ver groups-api.test.ts).
//
// @total: 30+ assertions across 6 sections
// ============================================================================

import { describe, it, expect, beforeEach, vi } from 'vitest';

// ============================================================================
// MOCK PRISMA
// ============================================================================

const postFindUnique = vi.fn();
const postUpdate = vi.fn();
const commentFindUnique = vi.fn();
const commentFindFirst = vi.fn();
const commentFindMany = vi.fn();
const commentCount = vi.fn();
const commentCreate = vi.fn();
const commentUpdate = vi.fn();
const commentUpdateMany = vi.fn();
const userFindUnique = vi.fn();
const userFindMany = vi.fn();

// Mock do comments-mentions (extrai @handles)
const extractMentions = vi.fn(() => []);

// Mock do comments-notifications (trigger)
const createMentionNotificationsForUsernames = vi.fn(async () => [] as unknown[]);

vi.mock('@/lib/prisma', () => ({
  prisma: {
    post: {
      findUnique: (...args: unknown[]) => postFindUnique(...args),
      update: (...args: unknown[]) => postUpdate(...args),
    },
    comment: {
      findUnique: (...args: unknown[]) => commentFindUnique(...args),
      findFirst: (...args: unknown[]) => commentFindFirst(...args),
      findMany: (...args: unknown[]) => commentFindMany(...args),
      count: (...args: unknown[]) => commentCount(...args),
      create: (...args: unknown[]) => commentCreate(...args),
      update: (...args: unknown[]) => commentUpdate(...args),
      updateMany: (...args: unknown[]) => commentUpdateMany(...args),
    },
    user: {
      findUnique: (...args: unknown[]) => userFindUnique(...args),
      findMany: (...args: unknown[]) => userFindMany(...args),
    },
  },
}));

vi.mock('../comments-mentions', () => ({
  extractMentions: (...args: unknown[]) => extractMentions(...args),
}));

vi.mock('../comments-notifications', () => ({
  createMentionNotificationsForUsernames: (...args: unknown[]) =>
    createMentionNotificationsForUsernames(...args),
}));

// Importa após mock
import {
  createComment,
  editComment,
  deleteComment,
  getCommentById,
  getCommentsForPost,
  getCommentCount,
  CommentValidationError,
  CommentNotFoundError,
  CommentForbiddenError,
  CommentParentMismatchError,
  PostNotFoundError,
  MAX_COMMENT_LENGTH,
  COMMENT_SORT_OPTIONS,
  isCommentSortBy,
} from '../comments-engine';

// ============================================================================
// FIXTURES
// ============================================================================

const now = new Date('2026-06-30T12:00:00Z');
function mkRawComment(overrides: Partial<{
  id: string;
  postId: string;
  authorId: string;
  parentId: string | null;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  likesCount: number;
}> = {}) {
  return {
    id: 'cmt_1',
    postId: 'post_1',
    authorId: 'user_alice',
    parentId: null,
    content: 'hello world',
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    likesCount: 0,
    ...overrides,
  };
}

// ============================================================================
// SETUP
// ============================================================================

beforeEach(() => {
  vi.clearAllMocks();
  extractMentions.mockReturnValue([]);
  createMentionNotificationsForUsernames.mockResolvedValue([]);

  postUpdate.mockResolvedValue({});
  commentUpdateMany.mockResolvedValue({ count: 0 });
});

// ============================================================================
// SECTION 1: createComment — happy path
// ============================================================================

describe('createComment — happy path', () => {
  it('1.1 — creates a top-level comment', async () => {
    const raw = mkRawComment({ id: 'cmt_new', content: 'first!' });
    postFindUnique.mockResolvedValue({ id: 'post_1', deletedAt: null });
    commentCreate.mockResolvedValue(raw);

    const result = await createComment({
      postId: 'post_1',
      authorId: 'user_alice',
      content: 'first!',
    });

    expect(result.id).toBe('cmt_new');
    expect(result.postId).toBe('post_1');
    expect(result.authorId).toBe('user_alice');
    expect(result.content).toBe('first!');
    expect(result.parentId).toBeNull();
    expect(result.deletedAt).toBeNull();
  });

  it('1.2 — creates a reply with parentId and validates same post', async () => {
    const raw = mkRawComment({
      id: 'cmt_reply',
      parentId: 'cmt_root',
      content: 'reply!',
    });
    postFindUnique.mockResolvedValue({ id: 'post_1', deletedAt: null });
    commentFindUnique.mockResolvedValue({
      id: 'cmt_root',
      postId: 'post_1',
      deletedAt: null,
    });
    commentCreate.mockResolvedValue(raw);

    const result = await createComment({
      postId: 'post_1',
      authorId: 'user_bob',
      content: 'reply!',
      parentId: 'cmt_root',
    });

    expect(result.parentId).toBe('cmt_root');
    expect(commentCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ parentId: 'cmt_root' }),
      })
    );
  });

  it('1.3 — increments post.commentsCount after create', async () => {
    const raw = mkRawComment({ id: 'cmt_x' });
    postFindUnique.mockResolvedValue({ id: 'post_1', deletedAt: null });
    commentCreate.mockResolvedValue(raw);

    await createComment({
      postId: 'post_1',
      authorId: 'user_x',
      content: 'x',
    });

    expect(postUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ commentsCount: { increment: 1 } }),
      })
    );
  });

  it('1.4 — extracts mentions and triggers notification batch', async () => {
    const raw = mkRawComment({ id: 'cmt_m', content: 'oi @bob @carol' });
    postFindUnique.mockResolvedValue({ id: 'post_1', deletedAt: null });
    commentCreate.mockResolvedValue(raw);
    extractMentions.mockReturnValue(['bob', 'carol']);
    createMentionNotificationsForUsernames.mockResolvedValue([
      { id: 'notif_1' }, { id: 'notif_2' },
    ]);

    const result = await createComment({
      postId: 'post_1',
      authorId: 'user_alice',
      content: 'oi @bob @carol',
    });

    expect(result.mentions).toEqual(['bob', 'carol']);
    expect(createMentionNotificationsForUsernames).toHaveBeenCalledWith(
      expect.objectContaining({
        commentId: 'cmt_m',
        mentionerId: 'user_alice',
        usernames: ['bob', 'carol'],
      })
    );
  });
});

// ============================================================================
// SECTION 2: createComment — validation errors
// ============================================================================

describe('createComment — validation', () => {
  it('2.1 — throws CommentValidationError on empty content', async () => {
    await expect(
      createComment({ postId: 'p1', authorId: 'u1', content: '   ' })
    ).rejects.toBeInstanceOf(CommentValidationError);
  });

  it('2.2 — throws on content exceeding MAX_COMMENT_LENGTH', async () => {
    const tooLong = 'x'.repeat(MAX_COMMENT_LENGTH + 1);
    await expect(
      createComment({ postId: 'p1', authorId: 'u1', content: tooLong })
    ).rejects.toBeInstanceOf(CommentValidationError);
  });

  it('2.3 — throws on invalid postId', async () => {
    await expect(
      createComment({ postId: '', authorId: 'u1', content: 'hi' })
    ).rejects.toBeInstanceOf(CommentValidationError);
  });

  it('2.4 — throws on invalid authorId', async () => {
    await expect(
      createComment({ postId: 'p1', authorId: '', content: 'hi' })
    ).rejects.toBeInstanceOf(CommentValidationError);
  });

  it('2.5 — throws PostNotFoundError when post is missing', async () => {
    postFindUnique.mockResolvedValue(null);
    await expect(
      createComment({ postId: 'p_ghost', authorId: 'u1', content: 'hi' })
    ).rejects.toBeInstanceOf(PostNotFoundError);
  });

  it('2.6 — throws PostNotFoundError when post is soft-deleted', async () => {
    postFindUnique.mockResolvedValue({ id: 'p1', deletedAt: now });
    await expect(
      createComment({ postId: 'p1', authorId: 'u1', content: 'hi' })
    ).rejects.toBeInstanceOf(PostNotFoundError);
  });

  it('2.7 — throws CommentParentMismatchError when parent belongs to another post', async () => {
    postFindUnique.mockResolvedValue({ id: 'p1', deletedAt: null });
    commentFindUnique.mockResolvedValue({
      id: 'cmt_other',
      postId: 'p2',
      deletedAt: null,
    });
    await expect(
      createComment({
        postId: 'p1',
        authorId: 'u1',
        content: 'hi',
        parentId: 'cmt_other',
      })
    ).rejects.toBeInstanceOf(CommentParentMismatchError);
  });

  it('2.8 — throws CommentNotFoundError when parent is missing', async () => {
    postFindUnique.mockResolvedValue({ id: 'p1', deletedAt: null });
    commentFindUnique.mockResolvedValue(null);
    await expect(
      createComment({
        postId: 'p1',
        authorId: 'u1',
        content: 'hi',
        parentId: 'cmt_ghost',
      })
    ).rejects.toBeInstanceOf(CommentNotFoundError);
  });
});

// ============================================================================
// SECTION 3: editComment
// ============================================================================

describe('editComment', () => {
  it('3.1 — edits content when author matches', async () => {
    const original = mkRawComment({
      id: 'cmt_e',
      content: 'old',
      authorId: 'user_alice',
      createdAt: now,
      updatedAt: new Date('2026-06-30T12:00:00Z'),
    });
    const edited = mkRawComment({
      id: 'cmt_e',
      content: 'new',
      authorId: 'user_alice',
      createdAt: now,
      updatedAt: new Date('2026-06-30T12:30:00Z'),
    });
    commentFindUnique.mockResolvedValue(original);
    commentUpdate.mockResolvedValue(edited);

    const result = await editComment({
      commentId: 'cmt_e',
      authorId: 'user_alice',
      newContent: 'new',
    });

    expect(result.content).toBe('new');
    expect(result.editedAt).not.toBeNull();
  });

  it('3.2 — throws CommentForbiddenError when author differs', async () => {
    commentFindUnique.mockResolvedValue(
      mkRawComment({ id: 'cmt_e', authorId: 'user_alice' })
    );
    await expect(
      editComment({
        commentId: 'cmt_e',
        authorId: 'user_bob',
        newContent: 'hacked',
      })
    ).rejects.toBeInstanceOf(CommentForbiddenError);
  });

  it('3.3 — throws CommentNotFoundError on missing comment', async () => {
    commentFindUnique.mockResolvedValue(null);
    await expect(
      editComment({
        commentId: 'cmt_ghost',
        authorId: 'u1',
        newContent: 'x',
      })
    ).rejects.toBeInstanceOf(CommentNotFoundError);
  });

  it('3.4 — throws on soft-deleted comment', async () => {
    commentFindUnique.mockResolvedValue(
      mkRawComment({ id: 'cmt_e', deletedAt: now, authorId: 'u1' })
    );
    await expect(
      editComment({
        commentId: 'cmt_e',
        authorId: 'u1',
        newContent: 'x',
      })
    ).rejects.toBeInstanceOf(CommentNotFoundError);
  });

  it('3.5 — only triggers notifications for NEW mentions (delta)', async () => {
    const original = mkRawComment({
      id: 'cmt_e',
      content: 'oi @bob',
      authorId: 'user_alice',
    });
    const edited = mkRawComment({
      id: 'cmt_e',
      content: 'oi @bob @carol',
      authorId: 'user_alice',
    });
    commentFindUnique.mockResolvedValue(original);
    commentUpdate.mockResolvedValue(edited);

    // First call (old content) → ['bob']; second call (new) → ['bob', 'carol']
    extractMentions
      .mockReturnValueOnce(['bob'])
      .mockReturnValueOnce(['bob', 'carol']);

    await editComment({
      commentId: 'cmt_e',
      authorId: 'user_alice',
      newContent: 'oi @bob @carol',
    });

    // Only 'carol' should be in the delta (not 'bob')
    expect(createMentionNotificationsForUsernames).toHaveBeenCalledWith(
      expect.objectContaining({ usernames: ['carol'] })
    );
  });
});

// ============================================================================
// SECTION 4: deleteComment
// ============================================================================

describe('deleteComment', () => {
  it('4.1 — soft-deletes when author matches', async () => {
    commentFindUnique.mockResolvedValue(
      mkRawComment({ id: 'cmt_d', authorId: 'user_alice', postId: 'p1' })
    );
    commentUpdate.mockResolvedValue(
      mkRawComment({
        id: 'cmt_d',
        authorId: 'user_alice',
        postId: 'p1',
        deletedAt: now,
      })
    );

    await deleteComment({ commentId: 'cmt_d', authorId: 'user_alice' });

    expect(commentUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'cmt_d' },
        data: expect.objectContaining({ deletedAt: expect.any(Date) }),
      })
    );
    expect(postUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ commentsCount: { decrement: 1 } }),
      })
    );
  });

  it('4.2 — is idempotent when already deleted', async () => {
    commentFindUnique.mockResolvedValue(
      mkRawComment({ id: 'cmt_d', authorId: 'u1', deletedAt: now })
    );

    await deleteComment({ commentId: 'cmt_d', authorId: 'u1' });

    expect(commentUpdate).not.toHaveBeenCalled();
  });

  it('4.3 — throws CommentForbiddenError when author differs', async () => {
    commentFindUnique.mockResolvedValue(
      mkRawComment({ id: 'cmt_d', authorId: 'user_alice' })
    );
    await expect(
      deleteComment({ commentId: 'cmt_d', authorId: 'user_bob' })
    ).rejects.toBeInstanceOf(CommentForbiddenError);
  });

  it('4.4 — throws CommentNotFoundError on missing', async () => {
    commentFindUnique.mockResolvedValue(null);
    await expect(
      deleteComment({ commentId: 'cmt_ghost', authorId: 'u1' })
    ).rejects.toBeInstanceOf(CommentNotFoundError);
  });
});

// ============================================================================
// SECTION 5: getCommentsForPost + getCommentCount
// ============================================================================

describe('getCommentsForPost', () => {
  it('5.1 — returns paginated flat list with hasMore', async () => {
    const rows = [
      mkRawComment({ id: 'cmt_1' }),
      mkRawComment({ id: 'cmt_2' }),
    ];
    commentFindMany.mockResolvedValue(rows);
    commentCount.mockResolvedValue(50);

    const result = await getCommentsForPost('p1', { limit: 20, offset: 0 });

    expect(result.comments).toHaveLength(2);
    expect(result.total).toBe(50);
    expect(result.limit).toBe(20);
    expect(result.hasMore).toBe(true);
  });

  it('5.2 — defaults to newest sort', async () => {
    commentFindMany.mockResolvedValue([]);
    commentCount.mockResolvedValue(0);

    await getCommentsForPost('p1');

    expect(commentFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: [{ createdAt: 'desc' }],
      })
    );
  });

  it('5.3 — topLevelOnly=true filters parentId=null', async () => {
    commentFindMany.mockResolvedValue([]);
    commentCount.mockResolvedValue(0);

    await getCommentsForPost('p1', { topLevelOnly: true });

    expect(commentFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ parentId: null }),
      })
    );
  });

  it('5.4 — top sort uses likesCount desc', async () => {
    commentFindMany.mockResolvedValue([]);
    commentCount.mockResolvedValue(0);

    await getCommentsForPost('p1', { sortBy: 'top' });

    expect(commentFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: [{ likesCount: 'desc' }, { createdAt: 'desc' }],
      })
    );
  });

  it('5.5 — clamps limit to MAX_PAGE_LIMIT', async () => {
    commentFindMany.mockResolvedValue([]);
    commentCount.mockResolvedValue(0);

    const result = await getCommentsForPost('p1', { limit: 9999 });

    expect(result.limit).toBeLessThanOrEqual(100);
  });

  it('5.6 — oldest sort uses createdAt asc', async () => {
    commentFindMany.mockResolvedValue([]);
    commentCount.mockResolvedValue(0);

    await getCommentsForPost('p1', { sortBy: 'oldest' });

    expect(commentFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: [{ createdAt: 'asc' }],
      })
    );
  });
});

describe('getCommentCount', () => {
  it('5.7 — returns total + topLevel + replies breakdown', async () => {
    commentCount
      .mockResolvedValueOnce(100)
      .mockResolvedValueOnce(40)
      .mockResolvedValueOnce(60);

    const result = await getCommentCount('p1');

    expect(result).toEqual({ total: 100, topLevel: 40, replies: 60 });
  });
});

// ============================================================================
// SECTION 6: getCommentById + type guards + constants
// ============================================================================

describe('getCommentById', () => {
  it('6.1 — returns null when missing', async () => {
    commentFindUnique.mockResolvedValue(null);
    expect(await getCommentById('cmt_ghost')).toBeNull();
  });

  it('6.2 — returns null when soft-deleted (default)', async () => {
    commentFindUnique.mockResolvedValue(
      mkRawComment({ id: 'cmt_d', deletedAt: now })
    );
    expect(await getCommentById('cmt_d')).toBeNull();
  });

  it('6.3 — returns soft-deleted when includeDeleted=true', async () => {
    const raw = mkRawComment({ id: 'cmt_d', deletedAt: now });
    commentFindUnique.mockResolvedValue(raw);
    const result = await getCommentById('cmt_d', { includeDeleted: true });
    expect(result).not.toBeNull();
    expect(result!.deletedAt).not.toBeNull();
  });
});

describe('type guards & constants', () => {
  it('6.4 — isCommentSortBy accepts valid values', () => {
    expect(isCommentSortBy('newest')).toBe(true);
    expect(isCommentSortBy('oldest')).toBe(true);
    expect(isCommentSortBy('top')).toBe(true);
  });

  it('6.5 — isCommentSortBy rejects invalid values', () => {
    expect(isCommentSortBy('bogus')).toBe(false);
    expect(isCommentSortBy(null)).toBe(false);
    expect(isCommentSortBy(42)).toBe(false);
  });

  it('6.6 — COMMENT_SORT_OPTIONS has 3 entries', () => {
    expect(COMMENT_SORT_OPTIONS).toHaveLength(3);
  });

  it('6.7 — MAX_COMMENT_LENGTH is 2000', () => {
    expect(MAX_COMMENT_LENGTH).toBe(2000);
  });
});