/**
 * Comments Threading + @Mentions (Wave 29)
 *
 * Pure tree operations for nested comment threads. No DB calls; the API
 * layer feeds a flat list and these helpers produce the tree, sort it,
 * flatten it for rendering, and extract @mentions for notifications.
 */

export interface CommentNode {
  readonly id: string;
  readonly parentId: string | null;
  readonly postId: string;
  readonly authorId: string;
  readonly authorName: string;
  readonly content: string;
  readonly createdAt: number;
  readonly editedAt: number | null;
  readonly deletedAt: number | null;
}

export interface CommentTreeNode extends CommentNode {
  readonly children: CommentTreeNode[];
  readonly depth: number;
  readonly descendantCount: number;
}

export interface ExtractedMention {
  readonly handle: string;
  readonly index: number;
  readonly length: number;
}

const MENTION_REGEX = /@([a-zA-Z0-9_]{3,32})/g;

/** Build a nested tree from a flat list. Orphaned replies (parent deleted) attach to root. */
export function buildCommentTree(flat: readonly CommentNode[]): CommentTreeNode[] {
  const byId = new Map<string, CommentTreeNode>();
  for (const c of flat) {
    byId.set(c.id, { ...c, children: [], depth: 0, descendantCount: 0 });
  }
  const roots: CommentTreeNode[] = [];
  for (const node of byId.values()) {
    if (node.parentId && byId.has(node.parentId)) {
      const parent = byId.get(node.parentId)!;
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  }
  // Compute depth + descendant count bottom-up.
  const stamp = (n: CommentTreeNode, depth: number): number => {
    n.depth = depth;
    let total = 0;
    for (const child of n.children) total += 1 + stamp(child, depth + 1);
    n.descendantCount = total;
    return total;
  };
  for (const r of roots) stamp(r, 0);
  // Sort: top-level by createdAt asc, replies by createdAt asc.
  const sortRecursive = (nodes: CommentTreeNode[]): void => {
    nodes.sort((a, b) => a.createdAt - b.createdAt);
    for (const n of nodes) sortRecursive(n.children);
  };
  sortRecursive(roots);
  return roots;
}

/** Flatten a tree back to a list, depth-first, with depth metadata preserved. */
export function flattenTree(roots: readonly CommentTreeNode[]): CommentTreeNode[] {
  const out: CommentTreeNode[] = [];
  const walk = (n: CommentTreeNode): void => {
    out.push(n);
    for (const c of n.children) walk(c);
  };
  for (const r of roots) walk(r);
  return out;
}

/** Recursively count all descendants of a given node id. */
export function countDescendants(roots: readonly CommentTreeNode[], id: string): number {
  const stack: CommentTreeNode[] = [...roots];
  let count = 0;
  while (stack.length) {
    const n = stack.pop()!;
    if (n.id === id) {
      return n.descendantCount;
    }
    for (const c of n.children) stack.push(c);
  }
  return count;
}

/** Extract @mentions from raw comment content. Returns unique handles with first index. */
export function extractMentions(content: string): ExtractedMention[] {
  const seen = new Map<string, ExtractedMention>();
  for (const match of content.matchAll(MENTION_REGEX)) {
    const handle = match[1].toLowerCase();
    if (!seen.has(handle)) {
      seen.set(handle, { handle, index: match.index ?? 0, length: match[0].length });
    }
  }
  return Array.from(seen.values()).sort((a, b) => a.index - b.index);
}

/** Validate a parent assignment — refuses cycles and depth > 8. */
export function validateParentAssignment(
  candidate: Pick<CommentNode, "id" | "parentId">,
  existing: readonly CommentNode[],
  maxDepth: number = 8,
): { ok: true } | { ok: false; reason: "cycle" | "depth-exceeded" | "parent-missing" } {
  if (!candidate.parentId) return { ok: true };
  const byId = new Map(existing.map((c) => [c.id, c]));
  if (!byId.has(candidate.parentId)) return { ok: false, reason: "parent-missing" };
  let cursor: string | null = candidate.parentId;
  let depth = 1;
  const visited = new Set<string>([candidate.id]);
  while (cursor) {
    if (visited.has(cursor)) return { ok: false, reason: "cycle" };
    visited.add(cursor);
    if (depth > maxDepth) return { ok: false, reason: "depth-exceeded" };
    const parent = byId.get(cursor);
    cursor = parent?.parentId ?? null;
    depth += 1;
  }
  return { ok: true };
}
