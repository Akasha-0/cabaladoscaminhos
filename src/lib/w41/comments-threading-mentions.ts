/**
 * @file comments-threading-mentions.ts
 * @description Threaded comments with @mention parser, notification triggers,
 *              and depth classification. Extends w34 (appeals), w36 (chatmod),
 *              and w39 (thread-viz) work with the spiritual/axé vocabulary
 *              of Cabala dos Caminhos. PT-BR friendly, mobile-first by design.
 *
 *              Standalone module — no imports from sibling w3x/w4x modules.
 *              All public surface is fully JSDoc'd for the chat-IA prompt
 *              that consumes it downstream.
 *
 * @example
 *   const body = "Oi @maria-luz, esse @amor bateu forte. @moderadores vejam!";
 *   const mentions = extractMentions(body);
 *   // → [
 *   //   { username: "maria-luz",  type: "user",  startIndex: 3,  endIndex: 13, raw: "@maria-luz" },
 *   //   { username: "amor",       type: "context", startIndex: 23, endIndex: 28, raw: "@amor" },
 *   //   { username: "moderadores", type: "role",  startIndex: 41, endIndex: 54, raw: "@moderadores" },
 *   // ]
 */

/* -------------------------------------------------------------------------- */
/*  Types — branded-ish CommentId + structural shapes                         */
/* -------------------------------------------------------------------------- */

/**
 * Opaque identifier for a comment. Branded string so accidental mixing with
 * post IDs / user IDs is caught at the type level (cast sites only).
 */
export type CommentId = string & { readonly __brand: "CommentId" };

/** Permitted lifecycle states for a comment in a thread. */
export type CommentStatus =
  | "published"
  | "pending_moderation"
  | "hidden"
  | "deleted"
  | "flagged";

/** How a @mention should be interpreted and routed. */
export type MentionType = "user" | "role" | "tradition" | "context";

/**
 * Reaction lexicon — picked to match the Akasha elemental palette
 * (axé / luz / fogo / terra / água / vento) plus a "forte" intensifier.
 * PT-BR friendly; safe across mobile keyboards.
 */
export type ReactionType =
  | "axé"
  | "luz"
  | "forte"
  | "fogo"
  | "terra"
  | "água"
  | "vento";

/** Depth classification of a thread, used by the visualizer (w39) downstream. */
export type ThreadDepth = "shallow" | "medium" | "deep" | "abyss";

/**
 * A single @mention parsed from a comment body. `raw` keeps the original
 * substring (including the leading `@`) so the UI can render it without
 * re-deriving the text.
 */
export interface Mention {
  readonly username: string;
  readonly type: MentionType;
  readonly userId: string | null;
  readonly startIndex: number;
  readonly endIndex: number;
  readonly raw: string;
}

/** A reaction applied to a comment by a single user. */
export interface CommentReaction {
  readonly reactionType: ReactionType;
  readonly userId: string;
  readonly createdAt: number;
}

/** A reaction tally map keyed by ReactionType — always 7 keys, count = 0 default. */
export type ReactionSummary = Readonly<Record<ReactionType, number>>;

/**
 * Recursive comment node. Children are eagerly nested (UI walks recursively
 * to render the tree); operations return new nodes (immutable style).
 */
export interface CommentNode {
  readonly id: CommentId;
  readonly authorId: string;
  readonly body: string;
  readonly createdAt: number;
  readonly parentId: CommentId | null;
  readonly depth: number;
  readonly children: ReadonlyArray<CommentNode>;
  readonly mentions: ReadonlyArray<Mention>;
  readonly reactions: ReadonlyArray<CommentReaction>;
  readonly status: CommentStatus;
}

/** Convenience alias for the forest returned by buildThreadTree. */
export type ThreadTree = ReadonlyArray<CommentNode>;

/** Compact thread metadata used by list views / summaries. */
export interface ThreadSummary {
  readonly threadId: string;
  readonly rootCommentId: CommentId;
  readonly totalComments: number;
  readonly maxDepth: number;
  readonly participantCount: number;
  readonly lastActivityAt: number;
}

/** Notification fan-out primitive produced when a comment is published. */
export interface NotificationTrigger {
  readonly type: "mention" | "reply" | "reaction";
  readonly userId: string;
  readonly commentId: CommentId;
  readonly createdAt: number;
  readonly payload: Readonly<Record<string, unknown>>;
}

/** Result shape for {@link validateCommentBody}. */
export interface ValidationResult {
  readonly ok: boolean;
  readonly errors: ReadonlyArray<string>;
}

/** Raw comment input — what the API layer would hand to buildCommentNode. */
export interface RawCommentInput {
  readonly id: string;
  readonly authorId: string;
  readonly body: string;
  readonly createdAt: number;
  readonly parentId: string | null;
  readonly depth: number;
}

/** Paginated slice of a thread tree. */
export interface PaginatedTree {
  readonly nodes: ReadonlyArray<CommentNode>;
  readonly totalPages: number;
  readonly currentPage: number;
}

/** Lightweight user directory entry — just enough for mention resolution. */
export interface UserDirectoryEntry {
  readonly username: string;
  readonly userId: string;
}

/* -------------------------------------------------------------------------- */
/*  Constants — limits, regexes, lexicon                                       */
/* -------------------------------------------------------------------------- */

/** Maximum chars allowed in a single comment body. */
export const MAX_COMMENT_BODY_LENGTH = 5000;

/** Hard cap on nesting — beyond this, replies are rejected at the API. */
export const MAX_THREAD_DEPTH = 50;

/** Cap on @mentions per comment — guards against spam & notification storms. */
export const MAX_MENTIONS_PER_COMMENT = 20;

/** Username length bounds — mirrors w39 parser contract. */
export const MAX_USERNAME_LENGTH = 40;
export const MIN_USERNAME_LENGTH = 2;

/**
 * Source regex (as string) for the @mention extractor. Kept identical to
 * w39's contract so cross-module tests stay aligned.
 *
 *   (?:^|\s)@([a-zA-Z0-9_-]{2,40})
 *
 * - `(?:^|\s)` requires start-of-text or whitespace before `@` (no `email@host`)
 * - `@` is literal
 * - capture group: 2–40 chars of `[a-zA-Z0-9_-]`
 */
export const MENTION_REGEX = "(?:^|\\s)@([a-zA-Z0-9_-]{2,40})";

/** Role-style mentions — route to permission-based groups, not individuals. */
export const ROLE_MENTIONS: ReadonlyArray<string> = [
  "@moderadores",
  "@curadores",
  "@mentores",
  "@aprendizes",
  "@todos",
];

/** Tradition mentions — tag a comment with a tradition context. */
export const TRADITION_MENTIONS: ReadonlyArray<string> = [
  "@candomble",
  "@umbanda",
  "@ifa",
  "@cabala",
  "@astrologia",
  "@tantra",
  "@taoismo",
  "@budismo",
  "@hinduismo",
  "@wicca",
  "@xamanismo",
];

/** Life-domain context mentions — used by the chat-IA to scope answers. */
export const CONTEXT_MENTIONS: ReadonlyArray<string> = [
  "@amor",
  "@trabalho",
  "@familia",
  "@estudo",
  "@saude",
  "@espiritual",
];

/**
 * Depth thresholds for {@link classifyThreadDepth}. Anything past DEEP_MAX
 * (9) is treated as "abyss" — engagement will likely dwindle.
 */
export const DEPTH_THRESHOLDS = {
  SHALLOW_MAX: 2,
  MEDIUM_MAX: 5,
  DEEP_MAX: 9,
} as const;

/** Default pagination page size for tree views. */
export const DEFAULT_PAGE_SIZE = 20;

/** Maximum allowed page size — guards against heavy response payloads. */
export const MAX_PAGE_SIZE = 100;

/** Reaction type set — used to zero-initialize summaries. */
export const REACTION_TYPES: ReadonlyArray<ReactionType> = [
  "axé",
  "luz",
  "forte",
  "fogo",
  "terra",
  "água",
  "vento",
];

/** Words that always warrant moderation review (PT-BR friendly). */
export const BLOCKED_WORDS: ReadonlyArray<string> = [
  "spam",
  "scam",
  "phishing",
  "violence",
  // PT-BR additions:
  "golpe",
  "falsific",
];

/** Trust score thresholds (0..1) used by shouldModerate heuristic. */
export const TRUST_THRESHOLDS = {
  AUTO_APPROVE: 0.7,
  REVIEW_BORDERLINE: 0.4,
} as const;

/* -------------------------------------------------------------------------- */
/*  Internal helpers                                                          */
/* -------------------------------------------------------------------------- */

const toCommentId = (raw: string): CommentId => raw as CommentId;

/** Build an empty reaction summary with all 7 keys zeroed. */
const emptyReactions = (): Record<ReactionType, number> => ({
  axé: 0,
  luz: 0,
  forte: 0,
  fogo: 0,
  terra: 0,
  água: 0,
  vento: 0,
});

/** Case-insensitive lookup in a read-only string array. */
const inSet = (needle: string, haystack: ReadonlyArray<string>): boolean => {
  for (const item of haystack) {
    if (item.toLowerCase() === needle.toLowerCase()) return true;
  }
  return false;
};

/** Strip the leading "@" from a mention raw text — used for classification. */
const stripAt = (raw: string): string => (raw.startsWith("@") ? raw.slice(1) : raw);

/* -------------------------------------------------------------------------- */
/*  Mention extraction + classification                                       */
/* -------------------------------------------------------------------------- */

/**
 * Parse @mentions out of a comment body.
 *
 * Walks the MENTION_REGEX (with the `g` flag added dynamically) and emits
 * one {@link Mention} per match. Classifies each via {@link classifyMention}
 * and resolves `userId` to `null` (resolution is a separate step so the
 * parser stays pure and cheap to call).
 *
 * @param body Raw comment body. May be empty.
 * @returns Read-only array of mentions, in source order. Capped implicitly
 *          by {@link MAX_MENTIONS_PER_COMMENT} on the caller side.
 *
 * @example
 *   extractMentions("Axé @joana @moderadores sobre @amor");
 *   // → three mentions: joana (user), moderadores (role), amor (context)
 */
export function extractMentions(body: string): ReadonlyArray<Mention> {
  if (!body) return [];
  const regex = new RegExp(MENTION_REGEX, "g");
  const out: Mention[] = [];
  let match: RegExpExecArray | null;
  while ((match = regex.exec(body)) !== null) {
    const username = match[1];
    // match[0] includes the leading space (or start anchor), so the @ index
    // is at match.index + (match[0].length - username.length - 1).
    const atIndex = match.index + match[0].length - username.length - 1;
    out.push({
      username,
      type: classifyMention(username),
      userId: null,
      startIndex: atIndex,
      endIndex: atIndex + username.length + 1, // include the "@"
      raw: body.slice(atIndex, atIndex + username.length + 1),
    });
    if (out.length >= MAX_MENTIONS_PER_COMMENT) break;
  }
  return out;
}

/**
 * Classify a mention username as user/role/tradition/context.
 *
 * The match is case-insensitive. Unknown usernames fall back to "user"
 * (the safe default — never misroute an unknown as a role broadcast).
 *
 * @param username Raw username (without the leading `@`).
 *
 * @example
 *   classifyMention("moderadores"); // → "role"
 *   classifyMention("Candomble");   // → "tradition"
 *   classifyMention("amor");        // → "context"
 *   classifyMention("joana-luz");   // → "user"
 */
export function classifyMention(username: string): MentionType {
  const u = stripAt(username).toLowerCase();
  if (inSet(u, ROLE_MENTIONS.map(stripAt))) return "role";
  if (inSet(u, TRADITION_MENTIONS.map(stripAt))) return "tradition";
  if (inSet(u, CONTEXT_MENTIONS.map(stripAt))) return "context";
  return "user";
}

/**
 * Resolve a username to a userId using a flat directory.
 *
 * Linear scan — fine for the directory sizes we expect (< 10k entries).
 * For larger directories, callers should build a `Map<username, userId>`
 * once and adapt.
 *
 * @param username Raw username (with or without leading `@`).
 * @param userDirectory Directory to look up in.
 * @returns `userId` if found, else `null`.
 *
 * @example
 *   resolveMentionToUserId("@joana", [{ username: "joana", userId: "u_42" }]);
 *   // → "u_42"
 */
export function resolveMentionToUserId(
  username: string,
  userDirectory: ReadonlyArray<UserDirectoryEntry>,
): string | null {
  const u = stripAt(username).toLowerCase();
  for (const entry of userDirectory) {
    if (entry.username.toLowerCase() === u) return entry.userId;
  }
  return null;
}

/* -------------------------------------------------------------------------- */
/*  Comment node construction + threading                                      */
/* -------------------------------------------------------------------------- */

/**
 * Build a single {@link CommentNode} from raw API input.
 *
 * Children are empty by default — the API returns flat lists; nesting is
 * the responsibility of {@link buildThreadTree}.
 *
 * @param raw Flat comment data from the API.
 * @param mentions Pre-extracted mentions (call {@link extractMentions} first).
 *
 * @example
 *   const node = buildCommentNode(
 *     { id: "c1", authorId: "u_1", body: "Oi @joana", createdAt: 1, parentId: null, depth: 0 },
 *     extractMentions("Oi @joana"),
 *   );
 */
export function buildCommentNode(
  raw: RawCommentInput,
  mentions: ReadonlyArray<Mention>,
): CommentNode {
  return {
    id: toCommentId(raw.id),
    authorId: raw.authorId,
    body: raw.body,
    createdAt: raw.createdAt,
    parentId: raw.parentId === null ? null : toCommentId(raw.parentId),
    depth: raw.depth,
    children: [],
    mentions,
    reactions: [],
    status: "published",
  };
}

/**
 * Nest a flat comment list into a forest of trees.
 *
 * Algorithm:
 *  1. Index nodes by id.
 *  2. Sort siblings by `createdAt` ascending (chronological inside a level).
 *  3. For each node with a parentId, push onto the parent's children array.
 *  4. Return the forest (nodes with parentId === null).
 *
 * Orphans (parentId points to a missing node) are returned at the top level
 * so the UI can still render them rather than dropping data on the floor.
 *
 * @param comments Flat list, may be empty.
 *
 * @example
 *   buildThreadTree([root, reply1, reply2, grandchild]);
 *   // → [root with children=[reply1, reply2 with children=[grandchild]]]
 */
export function buildThreadTree(
  comments: ReadonlyArray<CommentNode>,
): ThreadTree {
  if (comments.length === 0) return [];

  // Step 1 — index by id (last write wins, matches typical API behaviour).
  const byId = new Map<CommentId, CommentNode>();
  for (const c of comments) byId.set(c.id, c);

  // Step 2/3 — accumulate children + tag orphans.
  const childMap = new Map<CommentId, CommentNode[]>();
  const roots: CommentNode[] = [];
  for (const c of comments) {
    if (c.parentId !== null && byId.has(c.parentId)) {
      const list = childMap.get(c.parentId) ?? [];
      list.push(c);
      childMap.set(c.parentId, list);
    } else {
      roots.push(c);
    }
  }

  // Sort siblings by createdAt ascending.
  for (const list of childMap.values()) {
    list.sort((a, b) => a.createdAt - b.createdAt);
  }
  roots.sort((a, b) => a.createdAt - b.createdAt);

  // Step 4 — recursive re-materialize with children attached.
  const attach = (node: CommentNode): CommentNode => {
    const kids = childMap.get(node.id) ?? [];
    return { ...node, children: kids.map(attach) };
  };
  return roots.map(attach);
}

/**
 * Depth-first walk over a thread forest.
 *
 * Visitor receives `(node, depth)` where depth is the node's own depth
 * field (matching how it was stored in the tree). Visits parents before
 * children (pre-order).
 *
 * @param tree Thread forest to walk.
 * @param visitor Callback invoked once per node.
 *
 * @example
 *   walkThread(tree, (node, d) => console.log(" ".repeat(d) + node.authorId));
 */
export function walkThread(
  tree: ThreadTree,
  visitor: (node: CommentNode, depth: number) => void,
): void {
  const visit = (node: CommentNode): void => {
    visitor(node, node.depth);
    for (const child of node.children) visit(child);
  };
  for (const root of tree) visit(root);
}

/**
 * Flatten a thread forest into a DFS pre-order list.
 *
 * Useful for "show all comments" list views and for activity feeds that
 * need a flat sequence while preserving the original order.
 *
 * @param tree Thread forest.
 *
 * @example
 *   flattenThread(tree).map(n => n.id);
 *   // → ["c_root", "c_reply1", "c_grandchild", "c_reply2", ...]
 */
export function flattenThread(tree: ThreadTree): ReadonlyArray<CommentNode> {
  const out: CommentNode[] = [];
  walkThread(tree, (node) => {
    out.push(node);
  });
  return out;
}

/* -------------------------------------------------------------------------- */
/*  Summaries + classification                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Compute a {@link ThreadSummary} for a single thread (single root).
 *
 * For a forest with multiple roots, the function takes the first root
 * and returns its summary — the caller is expected to invoke this once
 * per root when summarizing many threads.
 *
 * @param tree Thread tree (single-root or forest — first root wins).
 * @param threadId Caller-supplied thread identifier (e.g. a postId).
 *
 * @example
 *   summarizeThread(tree, "post_42");
 *   // → { threadId: "post_42", totalComments: 7, maxDepth: 3, ... }
 */
export function summarizeThread(tree: ThreadTree, threadId: string): ThreadSummary {
  const root = tree[0];
  if (!root) {
    return {
      threadId,
      rootCommentId: "" as CommentId,
      totalComments: 0,
      maxDepth: 0,
      participantCount: 0,
      lastActivityAt: 0,
    };
  }
  const flat = flattenThread(tree);
  let maxDepth = 0;
  let lastActivityAt = 0;
  const participants = new Set<string>();
  for (const n of flat) {
    if (n.depth > maxDepth) maxDepth = n.depth;
    if (n.createdAt > lastActivityAt) lastActivityAt = n.createdAt;
    participants.add(n.authorId);
  }
  return {
    threadId,
    rootCommentId: root.id,
    totalComments: flat.length,
    maxDepth,
    participantCount: participants.size,
    lastActivityAt,
  };
}

/**
 * Classify a thread by its max depth using {@link DEPTH_THRESHOLDS}.
 *
 *   depth ≤ SHALLOW_MAX → "shallow"
 *   depth ≤ MEDIUM_MAX  → "medium"
 *   depth ≤ DEEP_MAX    → "deep"
 *   else                → "abyss"
 *
 * @param maxDepth The deepest nesting observed in the thread.
 *
 * @example
 *   classifyThreadDepth(3);  // → "medium"
 *   classifyThreadDepth(12); // → "abyss"
 */
export function classifyThreadDepth(maxDepth: number): ThreadDepth {
  if (maxDepth <= DEPTH_THRESHOLDS.SHALLOW_MAX) return "shallow";
  if (maxDepth <= DEPTH_THRESHOLDS.MEDIUM_MAX) return "medium";
  if (maxDepth <= DEPTH_THRESHOLDS.DEEP_MAX) return "deep";
  return "abyss";
}

/* -------------------------------------------------------------------------- */
/*  Mutation helpers — replies, removals, reactions                            */
/* -------------------------------------------------------------------------- */

/**
 * Append a reply as a child of the given parent. Returns a NEW parent node
 * with the reply appended (the rest of the tree is left intact).
 *
 * Enforces {@link MAX_THREAD_DEPTH} — a reply whose depth would exceed the
 * cap is appended but with `depth = MAX_THREAD_DEPTH` and status
 * `"pending_moderation"` so it surfaces in review queues rather than being
 * silently dropped.
 *
 * @param parent Parent comment node.
 * @param reply  Reply node (must already have `parentId === parent.id`).
 *
 * @example
 *   const next = addReply(parent, reply);
 *   // next.children[next.children.length - 1].id === reply.id
 */
export function addReply(parent: CommentNode, reply: CommentNode): CommentNode {
  const safeReply: CommentNode =
    reply.depth > MAX_THREAD_DEPTH
      ? { ...reply, depth: MAX_THREAD_DEPTH, status: "pending_moderation" }
      : reply;
  return { ...parent, children: [...parent.children, safeReply] };
}

/**
 * Soft-remove a comment from a tree.
 *
 * The node is kept in place (so child threads remain visible) but its
 * `status` is flipped to `"deleted"` and `body` is wiped. The original
 * structure — parent/child relationships — is preserved.
 *
 * @param tree Thread forest.
 * @param commentId Id of the comment to soft-remove.
 * @returns New forest with the change applied. If the id is missing,
 *          the input is returned unchanged.
 *
 * @example
 *   const next = removeComment(tree, "c_offtopic");
 *   // findCommentById(next, "c_offtopic")?.status === "deleted"
 */
export function removeComment(tree: ThreadTree, commentId: string): ThreadTree {
  const target = toCommentId(commentId);
  const visit = (node: CommentNode): CommentNode => {
    if (node.id === target) {
      return { ...node, status: "deleted", body: "", reactions: [], mentions: [] };
    }
    return { ...node, children: node.children.map(visit) };
  };
  return tree.map(visit);
}

/**
 * Add a reaction to a comment, idempotent per (userId, reactionType).
 *
 * If the same user already applied the same reaction, the existing entry
 * is preserved (no duplicate timestamps). Otherwise the reaction is
 * appended.
 *
 * @param comment Target comment node.
 * @param reaction Reaction to apply.
 *
 * @example
 *   const next = addReaction(node, { reactionType: "axé", userId: "u_1", createdAt: Date.now() });
 */
export function addReaction(
  comment: CommentNode,
  reaction: CommentReaction,
): CommentNode {
  const dup = comment.reactions.some(
    (r) => r.userId === reaction.userId && r.reactionType === reaction.reactionType,
  );
  if (dup) return comment;
  return { ...comment, reactions: [...comment.reactions, reaction] };
}

/**
 * Remove a reaction by (reactionType, userId). No-op if no such reaction exists.
 *
 * @param comment Target comment node.
 * @param reactionType Reaction to remove.
 * @param userId User whose reaction should be removed.
 *
 * @example
 *   const next = removeReaction(node, "axé", "u_1");
 */
export function removeReaction(
  comment: CommentNode,
  reactionType: ReactionType,
  userId: string,
): CommentNode {
  const filtered = comment.reactions.filter(
    (r) => !(r.reactionType === reactionType && r.userId === userId),
  );
  if (filtered.length === comment.reactions.length) return comment;
  return { ...comment, reactions: filtered };
}

/**
 * Tally reactions on a comment by type. Always returns all 7 keys.
 *
 * @param comment Target comment node.
 *
 * @example
 *   summarizeReactions(node);
 *   // → { axé: 3, luz: 1, forte: 0, fogo: 0, terra: 0, água: 0, vento: 0 }
 */
export function summarizeReactions(comment: CommentNode): ReactionSummary {
  const out = emptyReactions();
  for (const r of comment.reactions) {
    out[r.reactionType] = (out[r.reactionType] ?? 0) + 1;
  }
  return out;
}

/* -------------------------------------------------------------------------- */
/*  Validation + moderation                                                   */
/* -------------------------------------------------------------------------- */

/**
 * Validate a comment body before submission.
 *
 * Checks:
 *  1. Non-empty (after trim).
 *  2. Length ≤ {@link MAX_COMMENT_BODY_LENGTH}.
 *  3. Mention count ≤ {@link MAX_MENTIONS_PER_COMMENT}.
 *  4. No blocked words (case-insensitive substring match).
 *
 * @param body Candidate body.
 * @returns `{ ok, errors }` — `ok = true` iff `errors` is empty.
 *
 * @example
 *   validateCommentBody("Oi @joana");
 *   // → { ok: true, errors: [] }
 *   validateCommentBody("spam de @m @n @o @p @q @r @s @t @u @v @w @x @y @z @a @b @c @d @e @f @g");
 *   // → { ok: false, errors: [...length, mentions, blocked...] }
 */
export function validateCommentBody(body: string): ValidationResult {
  const errors: string[] = [];
  if (typeof body !== "string") {
    return { ok: false, errors: ["body must be a string"] };
  }
  const trimmed = body.trim();
  if (trimmed.length === 0) errors.push("body is empty");

  if (body.length > MAX_COMMENT_BODY_LENGTH) {
    errors.push(`body exceeds ${MAX_COMMENT_BODY_LENGTH} chars`);
  }

  const mentions = extractMentions(body);
  if (mentions.length > MAX_MENTIONS_PER_COMMENT) {
    errors.push(`too many mentions (${mentions.length} > ${MAX_MENTIONS_PER_COMMENT})`);
  }

  const lower = body.toLowerCase();
  for (const blocked of BLOCKED_WORDS) {
    if (lower.includes(blocked)) {
      errors.push(`blocked word: ${blocked}`);
      break; // first hit is enough
    }
  }

  return { ok: errors.length === 0, errors };
}

/**
 * Decide whether a comment should be sent to moderation review.
 *
 * Heuristic:
 *  - trust ≥ AUTO_APPROVE → never moderate.
 *  - mentions > 10 (notification-storm risk) → always moderate.
 *  - body length > 0.8 × MAX_COMMENT_BODY_LENGTH → moderate (wall-of-text).
 *  - blocked words present → moderate (defence in depth even if validation missed it).
 *  - trust < REVIEW_BORDERLINE → moderate.
 *
 * @param body Candidate body.
 * @param authorTrustScore Trust score in `[0, 1]`. Higher = more trusted.
 *
 * @example
 *   shouldModerate("Oi", 0.9);                          // → false
 *   shouldModerate("spam de @x @y ...", 0.9);           // → true (blocked + spam mentions)
 *   shouldModerate("qualquer coisa", 0.2);              // → true (low trust)
 */
export function shouldModerate(body: string, authorTrustScore: number): boolean {
  if (authorTrustScore >= TRUST_THRESHOLDS.AUTO_APPROVE) {
    // Still bounce if the body itself is clearly toxic.
    const lower = body.toLowerCase();
    for (const blocked of BLOCKED_WORDS) {
      if (lower.includes(blocked)) return true;
    }
    return false;
  }
  if (authorTrustScore < TRUST_THRESHOLDS.REVIEW_BORDERLINE) return true;

  const mentions = extractMentions(body);
  if (mentions.length > 10) return true;
  if (body.length > 0.8 * MAX_COMMENT_BODY_LENGTH) return true;
  const lower = body.toLowerCase();
  for (const blocked of BLOCKED_WORDS) {
    if (lower.includes(blocked)) return true;
  }
  return false;
}

/* -------------------------------------------------------------------------- */
/*  Notification triggers                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Build notification triggers for a newly published comment.
 *
 * Emits:
 *  - One `"mention"` trigger per unique mentioned user (skip self-mentions).
 *  - One `"reply"` trigger for the parent author if there is a parent and
 *    the replier is not the parent author themselves.
 *
 * Reaction triggers are produced elsewhere (when a reaction is added).
 *
 * @param comment The newly published comment.
 * @param parent  The parent comment, or `null` for top-level comments.
 *
 * @example
 *   createNotificationTriggers(newComment, parentComment);
 *   // → [{ type: "mention", userId: "u_42", ... }, { type: "reply", userId: "u_1", ... }]
 */
export function createNotificationTriggers(
  comment: CommentNode,
  parent: CommentNode | null,
): ReadonlyArray<NotificationTrigger> {
  const out: NotificationTrigger[] = [];

  // Mention triggers — dedupe by userId.
  const seenUsers = new Set<string>();
  for (const m of comment.mentions) {
    if (!m.userId) continue; // unresolved role/tradition/context → no per-user notify
    if (m.userId === comment.authorId) continue; // don't ping yourself
    if (seenUsers.has(m.userId)) continue;
    seenUsers.add(m.userId);
    out.push({
      type: "mention",
      userId: m.userId,
      commentId: comment.id,
      createdAt: comment.createdAt,
      payload: { mentionType: m.type, raw: m.raw },
    });
  }

  // Reply trigger — parent author gets pinged unless they wrote the reply.
  if (parent && parent.authorId !== comment.authorId) {
    out.push({
      type: "reply",
      userId: parent.authorId,
      commentId: comment.id,
      createdAt: comment.createdAt,
      payload: { parentId: parent.id, depth: comment.depth },
    });
  }

  return out;
}

/* -------------------------------------------------------------------------- */
/*  Pagination + lookup + scoring                                              */
/* -------------------------------------------------------------------------- */

/**
 * Paginate a thread forest by flattening it first (DFS pre-order) then
 * slicing. Page numbers are 1-indexed. Out-of-range pages yield empty
 * `nodes` with the corrected `totalPages`.
 *
 * @param tree Thread forest.
 * @param page 1-indexed page number. Floored to ≥ 1.
 * @param pageSize Items per page. Capped at {@link MAX_PAGE_SIZE}.
 *                 Falls back to {@link DEFAULT_PAGE_SIZE} if ≤ 0.
 *
 * @example
 *   paginateTree(tree, 1, 20);
 *   // → { nodes: [...20 items], totalPages: 3, currentPage: 1 }
 */
export function paginateTree(
  tree: ThreadTree,
  page: number,
  pageSize: number,
): PaginatedTree {
  const flat = flattenThread(tree);
  const size =
    pageSize <= 0
      ? DEFAULT_PAGE_SIZE
      : Math.min(pageSize, MAX_PAGE_SIZE);
  const currentPage = Math.max(1, Math.floor(page));
  const totalPages = Math.max(1, Math.ceil(flat.length / size));
  const start = (currentPage - 1) * size;
  const end = start + size;
  return {
    nodes: flat.slice(start, end),
    totalPages,
    currentPage,
  };
}

/**
 * Count unique authors participating in a thread.
 *
 * `deleted` comments are excluded from the count (their authors may
 * have left and we don't want to over-report engagement on a trashed
 * subthread).
 *
 * @param tree Thread forest.
 *
 * @example
 *   countThreadParticipants(tree); // → 4
 */
export function countThreadParticipants(tree: ThreadTree): number {
  const authors = new Set<string>();
  for (const n of flattenThread(tree)) {
    if (n.status !== "deleted") authors.add(n.authorId);
  }
  return authors.size;
}

/**
 * Find a comment by id anywhere in a forest. Returns `null` if missing.
 *
 * @param tree Thread forest.
 * @param commentId Id to look up.
 *
 * @example
 *   findCommentById(tree, "c_42")?.body;
 */
export function findCommentById(
  tree: ThreadTree,
  commentId: string,
): CommentNode | null {
  const target = toCommentId(commentId);
  let hit: CommentNode | null = null;
  walkThread(tree, (node) => {
    if (node.id === target) hit = node;
  });
  return hit;
}

/**
 * Compute a coarse engagement score for a thread.
 *
 * Formula (deterministic, no I/O):
 *
 *   score =
 *     total_comments * 1.0
 *   + unique_authors * 2.0
 *   + total_reactions * 0.5
 *   + max_depth_bonus        (maxDepth ≤ 5 → +1, ≤ 9 → +2, else +3)
 *   + recency_bonus          (now - lastActivityAt < 1h → +5; < 1d → +2; else 0)
 *
 * Designed for ranking on a feed — higher = hotter. Not a "popularity"
 * metric in the social-media sense; it's tuned for community signal.
 *
 * @param tree Thread forest.
 * @param now Reference timestamp (defaults to `Date.now()` is the caller's
 *            responsibility — pass `Date.now()` explicitly when calling).
 *
 * @example
 *   threadActivityScore(tree, Date.now());
 */
export function threadActivityScore(
  tree: ThreadTree,
  now: number,
): number {
  const flat = flattenThread(tree);
  if (flat.length === 0) return 0;

  let totalComments = 0;
  let totalReactions = 0;
  const authors = new Set<string>();
  let maxDepth = 0;
  let lastActivityAt = 0;

  for (const n of flat) {
    if (n.status === "deleted") continue;
    totalComments += 1;
    totalReactions += n.reactions.length;
    authors.add(n.authorId);
    if (n.depth > maxDepth) maxDepth = n.depth;
    if (n.createdAt > lastActivityAt) lastActivityAt = n.createdAt;
  }

  let depthBonus = 0;
  if (maxDepth > DEPTH_THRESHOLDS.DEEP_MAX) depthBonus = 3;
  else if (maxDepth > DEPTH_THRESHOLDS.MEDIUM_MAX) depthBonus = 2;
  else if (maxDepth > DEPTH_THRESHOLDS.SHALLOW_MAX) depthBonus = 1;

  const ageMs = Math.max(0, now - lastActivityAt);
  const HOUR = 60 * 60 * 1000;
  const DAY = 24 * HOUR;
  let recencyBonus = 0;
  if (ageMs < HOUR) recencyBonus = 5;
  else if (ageMs < DAY) recencyBonus = 2;

  return (
    totalComments * 1.0 +
    authors.size * 2.0 +
    totalReactions * 0.5 +
    depthBonus +
    recencyBonus
  );
}

/* -------------------------------------------------------------------------- */
/*  End of module                                                              */
/* -------------------------------------------------------------------------- */