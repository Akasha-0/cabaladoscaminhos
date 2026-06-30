// ============================================================================
// COMMENTS THREADING — Vitest spec (pure functions, no Prisma)
// ============================================================================
// Cobre: buildThreadTree, getAncestors, getDescendants, getThreadDepth,
// getRepliesForComment, cycle detection, orphan detection.
// ============================================================================

import { describe, it, expect } from 'vitest';
import type { Comment } from '../comments-engine';
import {
  buildThreadTree,
  buildThreadTreeFromRoot,
  getAncestors,
  getDescendants,
  getThreadDepth,
  getRepliesForComment,
  countDirectReplies,
  countTotalDescendants,
  hasCycle,
  getOrphanIds,
  CommentNotInListError,
} from '../comments-threading';

// ============================================================================
// FIXTURES
// ============================================================================

function mkComment(overrides: Partial<Comment>): Comment {
  return {
    id: 'cmt_x',
    postId: 'p1',
    authorId: 'u1',
    parentId: null,
    content: '',
    createdAt: '2026-06-30T12:00:00.000Z',
    editedAt: null,
    deletedAt: null,
    mentions: [],
    ...overrides,
  };
}

function flatList(): Comment[] {
  return [
    mkComment({ id: 'A', createdAt: '2026-06-30T10:00:00.000Z' }),
    mkComment({ id: 'B', parentId: 'A', createdAt: '2026-06-30T10:01:00.000Z' }),
    mkComment({ id: 'C', parentId: 'A', createdAt: '2026-06-30T10:02:00.000Z' }),
    mkComment({ id: 'D', parentId: 'B', createdAt: '2026-06-30T10:03:00.000Z' }),
    mkComment({ id: 'E', parentId: 'B', createdAt: '2026-06-30T10:04:00.000Z' }),
    mkComment({ id: 'F', parentId: 'D', createdAt: '2026-06-30T10:05:00.000Z' }),
  ];
}

// ============================================================================
// SECTION 1: buildThreadTree — happy paths
// ============================================================================

describe('buildThreadTree — basics', () => {
  it('1.1 — returns empty array for empty input', () => {
    expect(buildThreadTree([])).toEqual([]);
  });

  it('1.2 — returns single root for one comment', () => {
    const tree = buildThreadTree([mkComment({ id: 'A' })]);
    expect(tree).toHaveLength(1);
    expect(tree[0]!.comment.id).toBe('A');
    expect(tree[0]!.children).toHaveLength(0);
    expect(tree[0]!.depth).toBe(1);
  });

  it('1.3 — builds correct tree from 2-level flat list', () => {
    const tree = buildThreadTree(flatList());
    expect(tree).toHaveLength(1); // A é o único root
    const a = tree[0]!;
    expect(a.comment.id).toBe('A');
    expect(a.children).toHaveLength(2); // B, C
    const b = a.children.find((n) => n.comment.id === 'B')!;
    expect(b.children).toHaveLength(2); // D, E
    const d = b.children.find((n) => n.comment.id === 'D')!;
    expect(d.children).toHaveLength(1); // F
  });

  it('1.4 — sets depth correctly (root=1, child=2, etc)', () => {
    const tree = buildThreadTree(flatList());
    const f = tree[0]!
      .children[0]!
      .children[0]!
      .children[0]!;
    expect(f.depth).toBe(4);
  });

  it('1.5 — sorts roots by createdAt desc', () => {
    const list = [
      mkComment({ id: 'old', createdAt: '2020-01-01T00:00:00.000Z' }),
      mkComment({ id: 'new', createdAt: '2026-01-01T00:00:00.000Z' }),
    ];
    const tree = buildThreadTree(list);
    expect(tree[0]!.comment.id).toBe('new');
    expect(tree[1]!.comment.id).toBe('old');
  });
});

// ============================================================================
// SECTION 2: buildThreadTree — edge cases
// ============================================================================

describe('buildThreadTree — edge cases', () => {
  it('2.1 — handles orphans (parent missing from list)', () => {
    const list = [
      mkComment({ id: 'A' }),
      mkComment({ id: 'B', parentId: 'GHOST' }), // parent ausente
    ];
    const tree = buildThreadTree(list);
    // Ambos viram roots
    expect(tree).toHaveLength(2);
    const ids = tree.map((n) => n.comment.id).sort();
    expect(ids).toEqual(['A', 'B']);
  });

  it('2.2 — handles self-reference (parentId === id)', () => {
    const list = [mkComment({ id: 'A', parentId: 'A' })];
    const tree = buildThreadTree(list);
    expect(tree).toHaveLength(1);
    expect(tree[0]!.children).toHaveLength(0);
  });

  it('2.3 — skips soft-deleted by default', () => {
    const list = [
      mkComment({ id: 'A' }),
      mkComment({ id: 'B', parentId: 'A', deletedAt: '2026-06-30T11:00:00.000Z' }),
    ];
    const tree = buildThreadTree(list);
    expect(tree[0]!.children).toHaveLength(0);
  });

  it('2.4 — includes soft-deleted when requested', () => {
    const list = [
      mkComment({ id: 'A' }),
      mkComment({ id: 'B', parentId: 'A', deletedAt: '2026-06-30T11:00:00.000Z' }),
    ];
    const tree = buildThreadTree(list, { includeDeleted: true });
    expect(tree[0]!.children).toHaveLength(1);
  });

  it('2.5 — respects maxDepth', () => {
    const tree = buildThreadTree(flatList(), { maxDepth: 2 });
    const a = tree[0]!;
    expect(a.children).toHaveLength(2); // B, C
    const b = a.children[0]!;
    expect(b.children).toHaveLength(0); // D, E omitidos
  });

  it('2.6 — hasCycle detects A→B→A', () => {
    const list = [
      mkComment({ id: 'A', parentId: 'B' }),
      mkComment({ id: 'B', parentId: 'A' }),
    ];
    expect(hasCycle(list)).toBe(true);
  });

  it('2.7 — hasCycle returns false for normal tree', () => {
    expect(hasCycle(flatList())).toBe(false);
  });
});

// ============================================================================
// SECTION 3: getAncestors
// ============================================================================

describe('getAncestors', () => {
  it('3.1 — returns empty for root', () => {
    expect(getAncestors('A', flatList())).toEqual([]);
  });

  it('3.2 — returns chain for deep comment', () => {
    const ancestors = getAncestors('F', flatList());
    expect(ancestors.map((c) => c.id)).toEqual(['D', 'B', 'A']);
  });

  it('3.3 — returns empty for missing id', () => {
    expect(getAncestors('GHOST', flatList())).toEqual([]);
  });

  it('3.4 — stops at first cycle', () => {
    const list = [
      mkComment({ id: 'A', parentId: 'B' }),
      mkComment({ id: 'B', parentId: 'A' }),
    ];
    const ancestors = getAncestors('A', list);
    expect(ancestors.length).toBeLessThan(2);
  });
});

// ============================================================================
// SECTION 4: getDescendants
// ============================================================================

describe('getDescendants', () => {
  it('4.1 — returns empty for leaf', () => {
    expect(getDescendants('F', flatList())).toEqual([]);
  });

  it('4.2 — returns full subtree', () => {
    const descs = getDescendants('A', flatList());
    expect(descs.map((c) => c.id).sort()).toEqual(['B', 'C', 'D', 'E', 'F']);
  });

  it('4.3 — returns direct + transitive', () => {
    const descs = getDescendants('B', flatList());
    expect(descs.map((c) => c.id).sort()).toEqual(['D', 'E', 'F']);
  });

  it('4.4 — skips deleted', () => {
    const list = [
      mkComment({ id: 'A' }),
      mkComment({ id: 'B', parentId: 'A', deletedAt: '2026-06-30T11:00:00.000Z' }),
      mkComment({ id: 'C', parentId: 'B' }),
    ];
    const descs = getDescendants('A', list);
    expect(descs).toEqual([]); // B deletado, C órfão
  });
});

// ============================================================================
// SECTION 5: getThreadDepth + count helpers
// ============================================================================

describe('getThreadDepth', () => {
  it('5.1 — returns 0 for leaf', () => {
    expect(getThreadDepth('F', flatList())).toBe(0);
  });

  it('5.2 — returns 3 for root A (A→B→D→F)', () => {
    expect(getThreadDepth('A', flatList())).toBe(3);
  });

  it('5.3 — returns 0 for missing id', () => {
    expect(getThreadDepth('GHOST', flatList())).toBe(0);
  });

  it('5.4 — returns 1 for A→{B,C} when no grandchildren', () => {
    const list = [
      mkComment({ id: 'A' }),
      mkComment({ id: 'B', parentId: 'A' }),
      mkComment({ id: 'C', parentId: 'A' }),
    ];
    expect(getThreadDepth('A', list)).toBe(1);
  });
});

describe('countDirectReplies + countTotalDescendants', () => {
  it('5.5 — counts direct children only', () => {
    expect(countDirectReplies('A', flatList())).toBe(2);
    expect(countDirectReplies('B', flatList())).toBe(2);
    expect(countDirectReplies('F', flatList())).toBe(0);
  });

  it('5.6 — counts all recursive', () => {
    expect(countTotalDescendants('A', flatList())).toBe(5);
    expect(countTotalDescendants('B', flatList())).toBe(3);
    expect(countTotalDescendants('F', flatList())).toBe(0);
  });
});

// ============================================================================
// SECTION 6: getRepliesForComment + buildThreadTreeFromRoot
// ============================================================================

describe('getRepliesForComment', () => {
  it('6.1 — returns direct replies sorted newest-first (default)', () => {
    const result = getRepliesForComment('A', flatList());
    expect(result.replies).toHaveLength(2);
    expect(result.replies[0]!.id).toBe('C'); // 10:02 > 10:01
    expect(result.replies[1]!.id).toBe('B');
    expect(result.total).toBe(2);
  });

  it('6.2 — paginates with limit + offset', () => {
    const result = getRepliesForComment('A', flatList(), {
      limit: 1,
      offset: 1,
    });
    expect(result.replies).toHaveLength(1);
    expect(result.replies[0]!.id).toBe('B');
    expect(result.hasMore).toBe(false);
  });

  it('6.3 — oldest sort', () => {
    const result = getRepliesForComment('A', flatList(), {
      sortBy: 'oldest',
    });
    expect(result.replies[0]!.id).toBe('B');
  });
});

describe('buildThreadTreeFromRoot', () => {
  it('6.4 — builds subtree from any root', () => {
    const tree = buildThreadTreeFromRoot('B', flatList());
    expect(tree.root.comment.id).toBe('B');
    expect(tree.totalNodes).toBe(4); // B + D + E + F
    expect(tree.maxDepth).toBe(3);
  });

  it('6.5 — throws CommentNotInListError when missing', () => {
    expect(() => buildThreadTreeFromRoot('GHOST', flatList())).toThrow(
      CommentNotInListError
    );
  });

  it('6.6 — single-node tree has totalNodes=1, maxDepth=1', () => {
    const tree = buildThreadTreeFromRoot('F', flatList());
    expect(tree.totalNodes).toBe(1);
    expect(tree.maxDepth).toBe(1);
    expect(tree.root.children).toHaveLength(0);
  });
});

// ============================================================================
// SECTION 7: getOrphanIds
// ============================================================================

describe('getOrphanIds', () => {
  it('7.1 — identifies comments with missing parents', () => {
    const list = [
      mkComment({ id: 'A' }),
      mkComment({ id: 'B', parentId: 'GHOST' }),
      mkComment({ id: 'C', parentId: 'A' }),
    ];
    const orphans = getOrphanIds(list);
    expect(orphans.has('B')).toBe(true);
    expect(orphans.has('C')).toBe(false);
  });

  it('7.2 — empty when no orphans', () => {
    expect(getOrphanIds(flatList()).size).toBe(0);
  });

  it('7.3 — does NOT flag self-reference as orphan', () => {
    const orphans = getOrphanIds([mkComment({ id: 'A', parentId: 'A' })]);
    expect(orphans.has('A')).toBe(false);
  });
});