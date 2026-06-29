/**
 * Comments Deep-Thread Visualization (Wave 39)
 *
 * Pure TypeScript — no runtime imports from app code. Builds a thread tree
 * from a flat comments list, supports collapse/expand, mention tooltips,
 * and deep-reply indicators for very deep threads.
 *
 * Composes with:
 *   - w34/comments-moderation-appeals (ModeratedComment shape, validation)
 *   - w35/comments-reputation-weighting (WeightedComment, weighting)
 *   - w38/comments-reputation-trending-v2 (TrendingClass buckets, leaderboard kinds)
 *   - src/types/community.ts (Comment, Author, PostReference)
 *
 * The renderer (UI layer) consumes `buildThreadTree` once, then uses
 * `toggleCollapse` / `getCollapsedView` to derive what to render. Mention
 * tooltips are computed lazily via `getMentionTooltip` to avoid scanning
 * the whole tree on every hover.
 */

// ============================================================================
// Types
// ============================================================================

export type CommentId = string;
export type UserId = string;
export type IsoDate = string;

/** A single comment as it appears in the tree (normalized). */
export interface CommentNode {
  id: CommentId;
  parentId: CommentId | null;
  authorId: UserId;
  authorName: string;
  body: string;
  createdAt: number; // epoch ms
  depth: number; // 0 = top-level
  childCount: number;
  isCollapsed: boolean;
  mentionedUserIds: UserId[];
  /** True if this comment has been moderated (e.g. hidden / removed). */
  isModerated: boolean;
  /** Optional score from w35 weighting, used to flag "hot" replies. */
  weightedScore?: number;
}

/** A flattened tree view of all comments under one post. */
export interface ThreadTree {
  rootId: CommentId; // synthetic root
  nodesById: Record<CommentId, CommentNode>;
  childIdsById: Record<CommentId, CommentId[]>;
  maxDepth: number;
  totalComments: number;
}

/** Subset of the tree that should be rendered given current collapse state. */
export interface CollapsedView {
  visibleNodeIds: CommentId[];
  hiddenChildCounts: Record<CommentId, number>;
  lastReplies: Record<CommentId, CommentNode | null>;
}

/** Hover/tooltip data for a mentioned user. */
export interface MentionTooltip {
  userId: UserId;
  contextSnippet: string;
  surroundingComments: CommentNode[];
  lastSeenAt: number | null;
  mentionCount: number;
}

/** Indicator that a thread is unusually deep. */
export type DeepLevel = "shallow" | "medium" | "deep" | "abyss";

export interface DeepReplyIndicator {
  commentId: CommentId;
  level: DeepLevel;
  depth: number;
  suggestedAction: "show" | "collapse-subtree" | "scroll-top" | "warn";
}

/** Depth histogram for analytics / debugging. */
export interface ThreadDepthSummary {
  totalComments: number;
  maxDepth: number;
  meanDepth: number;
  medianDepth: number;
  histogram: Record<DeepLevel, number>;
  deepestPath: CommentId[];
}

// ============================================================================
// Constants
// ============================================================================

/** Depth bands. Tuned for typical forum UX. */
export const DEPTH_THRESHOLDS = {
  /** 0..SHALLOW_MAX: top-level + first reply. */
  SHALLOW_MAX: 2,
  /** ..MEDIUM_MAX: readable nested conversation. */
  MEDIUM_MAX: 5,
  /** ..DEEP_MAX: long but followable. */
  DEEP_MAX: 9,
  /** beyond DEEP_MAX = abyss. */
} as const;

/** Default snippet length for mention tooltips (chars). */
export const MENTION_SNIPPET_CHARS = 180;

/** Max surrounding comments to include in a mention tooltip. */
export const MENTION_CONTEXT_WINDOW = 4;

// ============================================================================
// Helpers
// ============================================================================

function safeStr(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v : fallback;
}

function safeNum(v: unknown, fallback = 0): number {
  return typeof v === "number" && Number.isFinite(v) ? v : fallback;
}

function safeArr<T>(v: unknown): T[] {
  return Array.isArray(v) ? (v as T[]) : [];
}

function clampInt(n: number, lo: number, hi: number): number {
  if (!Number.isFinite(n)) return lo;
  return Math.max(lo, Math.min(hi, Math.trunc(n)));
}

function median(nums: number[]): number {
  if (nums.length === 0) return 0;
  const sorted = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }
  return sorted[mid];
}

function classifyDepth(depth: number): DeepLevel {
  if (depth <= DEPTH_THRESHOLDS.SHALLOW_MAX) return "shallow";
  if (depth <= DEPTH_THRESHOLDS.MEDIUM_MAX) return "medium";
  if (depth <= DEPTH_THRESHOLDS.DEEP_MAX) return "deep";
  return "abyss";
}

function suggestActionForLevel(level: DeepLevel): DeepReplyIndicator["suggestedAction"] {
  switch (level) {
    case "shallow":
      return "show";
    case "medium":
      return "show";
    case "deep":
      return "collapse-subtree";
    case "abyss":
      return "warn";
  }
}

function truncate(s: string, max: number): string {
  if (s.length <= max) return s;
  return s.slice(0, Math.max(0, max - 1)).trimEnd() + "…";
}

/** Extract @mentions from a body. Cheap regex; not Markdown-aware. */
function extractMentions(body: string): UserId[] {
  if (!body) return [];
  const out: UserId[] = [];
  const re = /(?:^|\s)@([a-zA-Z0-9_-]{2,40})/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(body)) !== null) {
    const id = m[1];
    if (id && !out.includes(id)) out.push(id);
  }
  return out;
}

// ============================================================================
// Tree construction
// ============================================================================

/**
 * Normalize a flat comment record (from the wire / API) into our internal
 * `CommentNode` shape. Tolerates missing/odd fields.
 */
export function normalizeComment(raw: unknown): CommentNode | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const id = safeStr(r.id ?? r.commentId);
  if (!id) return null;
  const author = r.author;
  const authorObj = (author && typeof author === "object" ? author : {}) as Record<string, unknown>;
  const authorId = safeStr(
    r.authorId ?? r.userId ?? authorObj.id ?? (typeof r.authorHandle === "string" ? r.authorHandle : "")
  );
  const authorName = safeStr(
    r.authorName ?? r.displayName ?? authorObj.displayName ?? authorObj.name ?? "unknown"
  );
  const body = safeStr(r.body ?? r.content ?? r.text);
  const createdAt = safeNum(
    typeof r.createdAt === "number"
      ? r.createdAt
      : typeof r.createdAt === "string"
        ? Date.parse(r.createdAt)
        : 0
  );
  const parentId = r.parentId == null ? null : safeStr(r.parentId) || null;
  const depth = safeNum(r.depth);
  const childCount = safeNum(r.childCount);
  const isCollapsed = Boolean(r.isCollapsed);
  const mentionedUserIds = safeArr<string>(r.mentionedUserIds).filter(Boolean);
  // If mentions not pre-computed, extract from body.
  const finalMentions = mentionedUserIds.length > 0 ? mentionedUserIds : extractMentions(body);
  const isModerated = Boolean(r.isModerated ?? r.isHidden ?? r.isRemoved);
  const weightedScore =
    typeof r.weightedScore === "number" && Number.isFinite(r.weightedScore)
      ? r.weightedScore
      : undefined;
  return {
    id,
    parentId,
    authorId: authorId || "unknown",
    authorName,
    body,
    createdAt,
    depth: Math.max(0, depth),
    childCount: Math.max(0, childCount),
    isCollapsed,
    mentionedUserIds: finalMentions,
    isModerated,
    weightedScore,
  };
}

/**
 * Build a thread tree from a flat list of comments. Top-level comments are
 * those with no `parentId` (or whose parent is not in the input set).
 *
 * The synthetic `rootId` is "ROOT" and never appears in `nodesById` —
 * instead, `childIdsById[rootId]` is the list of top-level comment IDs.
 */
export function buildThreadTree(flatComments: unknown[]): ThreadTree {
  const nodes: CommentNode[] = [];
  for (const raw of safeArr<unknown>(flatComments)) {
    const n = normalizeComment(raw);
    if (n) nodes.push(n);
  }

  const nodesById: Record<CommentId, CommentNode> = {};
  const childIdsById: Record<CommentId, CommentId[]> = { ROOT: [] };
  const presentIds = new Set<CommentId>();

  for (const n of nodes) {
    nodesById[n.id] = n;
    presentIds.add(n.id);
  }

  // First pass: compute depth + bucket children. We sort by createdAt so
  // siblings render in chronological order.
  const sorted = [...nodes].sort((a, b) => a.createdAt - b.createdAt);

  for (const n of sorted) {
    if (n.parentId && presentIds.has(n.parentId)) {
      if (!childIdsById[n.parentId]) childIdsById[n.parentId] = [];
      childIdsById[n.parentId].push(n.id);
    } else {
      childIdsById.ROOT.push(n.id);
    }
  }

  // Recompute depths via BFS from the synthetic root.
  const depthById: Record<CommentId, number> = {};
  const queue: CommentId[] = [...childIdsById.ROOT];
  let maxDepth = 0;
  while (queue.length > 0) {
    const id = queue.shift()!;
    const d = depthById[id] ?? 0;
    nodesById[id] = { ...nodesById[id], depth: d };
    maxDepth = Math.max(maxDepth, d);
    const kids = childIdsById[id] ?? [];
    for (const k of kids) {
      depthById[k] = d + 1;
      queue.push(k);
    }
  }

  // Recompute childCount from childIdsById.
  for (const id of Object.keys(nodesById)) {
    const c = childIdsById[id]?.length ?? 0;
    nodesById[id] = { ...nodesById[id], childCount: c };
  }

  return {
    rootId: "ROOT",
    nodesById,
    childIdsById,
    maxDepth,
    totalComments: nodes.length,
  };
}

// ============================================================================
// Collapse / expand
// ============================================================================

/**
 * Return a new tree with the collapse state of `nodeId` flipped. The input
 * tree is NOT mutated; this is a pure function.
 */
export function toggleCollapse(tree: ThreadTree, nodeId: CommentId): ThreadTree {
  const node = tree.nodesById[nodeId];
  if (!node) return tree;
  const updated: CommentNode = { ...node, isCollapsed: !node.isCollapsed };
  return {
    ...tree,
    nodesById: { ...tree.nodesById, [nodeId]: updated },
  };
}

/**
 * Bulk collapse: returns a new tree where every node at depth >= `fromDepth`
 * is collapsed. Useful for "collapse all deep replies" UI buttons.
 */
export function collapseFromDepth(tree: ThreadTree, fromDepth: number): ThreadTree {
  const updated: Record<CommentId, CommentNode> = { ...tree.nodesById };
  for (const id of Object.keys(updated)) {
    const n = updated[id];
    if (n.depth >= fromDepth) updated[id] = { ...n, isCollapsed: true };
  }
  return { ...tree, nodesById: updated };
}

/**
 * Compute the visible-node set given the current collapse state. A node is
 * hidden iff any ancestor is collapsed. Hidden subtrees contribute their
 * descendant count to `hiddenChildCounts` so the UI can show "[+N replies]".
 */
export function getCollapsedView(tree: ThreadTree): CollapsedView {
  const visibleNodeIds: CommentId[] = [];
  const hiddenChildCounts: Record<CommentId, number> = {};
  const lastReplies: Record<CommentId, CommentNode | null> = {};

  // BFS from root. When we encounter a collapsed node, skip its subtree but
  // record the hidden descendant count.
  type Frame = { id: CommentId; hidden: boolean };
  const queue: Frame[] = [{ id: tree.rootId, hidden: false }];
  let head = 0;
  while (head < queue.length) {
    const { id, hidden } = queue[head++];
    const kids = tree.childIdsById[id] ?? [];
    for (const kid of kids) {
      const node = tree.nodesById[kid];
      if (!node) continue;
      const kidHidden = hidden || node.isCollapsed;
      if (!kidHidden) visibleNodeIds.push(kid);
      // Always compute last reply for collapsed subtrees.
      const subtreeLast = lastReplyInSubtree(tree, kid);
      lastReplies[kid] = subtreeLast;
      if (kidHidden) {
        // Count hidden descendants (including the kid itself if hidden).
        const count = hidden ? countSubtree(tree, kid) : countSubtree(tree, kid) - 1;
        if (count > 0) hiddenChildCounts[kid] = count;
        // Don't enqueue kids of a hidden subtree.
      } else {
        queue.push({ id: kid, hidden: false });
      }
    }
  }

  return { visibleNodeIds, hiddenChildCounts, lastReplies };
}

function countSubtree(tree: ThreadTree, nodeId: CommentId): number {
  let count = 0;
  const stack: CommentId[] = [nodeId];
  while (stack.length > 0) {
    const cur = stack.pop()!;
    count++;
    const kids = tree.childIdsById[cur] ?? [];
    for (const k of kids) stack.push(k);
  }
  return count;
}

function lastReplyInSubtree(tree: ThreadTree, nodeId: CommentId): CommentNode | null {
  let best: CommentNode | null = null;
  const stack: CommentId[] = [nodeId];
  while (stack.length > 0) {
    const cur = stack.pop()!;
    const node = tree.nodesById[cur];
    if (!node) continue;
    if (!best || node.createdAt > best.createdAt) best = node;
    const kids = tree.childIdsById[cur] ?? [];
    for (const k of kids) stack.push(k);
  }
  return best;
}

// ============================================================================
// Mention tooltips
// ============================================================================

/**
 * Build a mention tooltip for `userId` given a context node. The tooltip
 * includes the user's most recent mention in the thread, the surrounding
 * comments (up to MENTION_CONTEXT_WINDOW), and a snippet of the body.
 */
export function getMentionTooltip(
  tree: ThreadTree,
  userId: UserId,
  contextNodeId: CommentId
): MentionTooltip | null {
  if (!userId) return null;
  const contextNode = tree.nodesById[contextNodeId];
  if (!contextNode) return null;

  // Walk up the tree from the context node to find the path, then collect
  // siblings of the context node as "surrounding".
  const path: CommentNode[] = [];
  let cur: CommentNode | null = contextNode;
  while (cur) {
    path.unshift(cur);
    if (cur.parentId && tree.nodesById[cur.parentId]) {
      cur = tree.nodesById[cur.parentId];
    } else {
      cur = null;
    }
  }
  // Find the root comment in the path (top-level) and its siblings as context.
  const rootOfContext = path[0];
  const siblings = tree.childIdsById[rootOfContext.parentId ?? tree.rootId] ?? [];
  const surrounding: CommentNode[] = [];
  for (const sid of siblings) {
    const sn = tree.nodesById[sid];
    if (sn) surrounding.push(sn);
  }
  // Sort by createdAt desc, take top N.
  surrounding.sort((a, b) => b.createdAt - a.createdAt);
  const top = surrounding.slice(0, MENTION_CONTEXT_WINDOW);

  // Find the most recent mention of `userId` across the whole tree.
  let lastSeenAt: number | null = null;
  let lastSnippet = "";
  let mentionCount = 0;
  for (const id of Object.keys(tree.nodesById)) {
    const n = tree.nodesById[id];
    if (!n) continue;
    if (n.mentionedUserIds.includes(userId)) {
      mentionCount++;
      if (lastSeenAt == null || n.createdAt > lastSeenAt) {
        lastSeenAt = n.createdAt;
        lastSnippet = n.body;
      }
    }
  }

  return {
    userId,
    contextSnippet: truncate(lastSnippet, MENTION_SNIPPET_CHARS),
    surroundingComments: top,
    lastSeenAt,
    mentionCount,
  };
}

// ============================================================================
// Deep-reply indicators
// ============================================================================

/**
 * Build deep-reply indicators for every node in the tree. The UI uses these
 * to render "→ scroll to top" warnings on abyss-level threads, or
 * "collapse subtree" suggestions on deep threads.
 */
export function getDeepReplyIndicators(tree: ThreadTree): DeepReplyIndicator[] {
  const out: DeepReplyIndicator[] = [];
  for (const id of Object.keys(tree.nodesById)) {
    const n = tree.nodesById[id];
    if (!n) continue;
    const level = classifyDepth(n.depth);
    if (level === "shallow") continue; // shallow comments don't need a badge
    out.push({
      commentId: id,
      level,
      depth: n.depth,
      suggestedAction: suggestActionForLevel(level),
    });
  }
  // Stable order: deepest first.
  out.sort((a, b) => b.depth - a.depth);
  return out;
}

// ============================================================================
// Depth summary
// ============================================================================

/**
 * Compute a depth histogram + deepest path for analytics. The deepest path
 * is the path from the root of the tree to the deepest leaf (by depth, then
 * by createdAt desc as tiebreak).
 */
export function summarizeThreadDepth(tree: ThreadTree): ThreadDepthSummary {
  const depths: number[] = [];
  const histogram: Record<DeepLevel, number> = {
    shallow: 0,
    medium: 0,
    deep: 0,
    abyss: 0,
  };
  for (const id of Object.keys(tree.nodesById)) {
    const n = tree.nodesById[id];
    if (!n) continue;
    depths.push(n.depth);
    histogram[classifyDepth(n.depth)]++;
  }
  // Find deepest leaf.
  let deepestId: CommentId | null = null;
  let deepestDepth = -1;
  let deepestCreated = 0;
  for (const id of Object.keys(tree.nodesById)) {
    const n = tree.nodesById[id];
    if (!n) continue;
    if (
      n.depth > deepestDepth ||
      (n.depth === deepestDepth && n.createdAt > deepestCreated)
    ) {
      deepestId = id;
      deepestDepth = n.depth;
      deepestCreated = n.createdAt;
    }
  }

  // Walk up from deepest leaf to build the path.
  const path: CommentId[] = [];
  if (deepestId) {
    let cur: CommentNode | null = tree.nodesById[deepestId] ?? null;
    while (cur) {
      path.unshift(cur.id);
      if (cur.parentId && tree.nodesById[cur.parentId]) {
        cur = tree.nodesById[cur.parentId];
      } else {
        cur = null;
      }
    }
  }

  const total = depths.length;
  const meanDepth = total === 0 ? 0 : depths.reduce((a, b) => a + b, 0) / total;

  return {
    totalComments: total,
    maxDepth: tree.maxDepth,
    meanDepth,
    medianDepth: median(depths),
    histogram,
    deepestPath: path,
  };
}

// ============================================================================
// Re-exports for callers
// ============================================================================

export const __TESTING__ = {
  classifyDepth,
  extractMentions,
  suggestActionForLevel,
  normalizeComment,
  clampInt,
  median,
};
