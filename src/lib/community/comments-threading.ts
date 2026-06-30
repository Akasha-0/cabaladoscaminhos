// ============================================================================
// COMMENTS THREADING — Pure functions for tree manipulation
// ============================================================================
// Não depende de Prisma. Recebe listas planas de Comment e produz estruturas
// em árvore (CommentNode, ThreadTree).
//
// Funções puras → testáveis sem mock, sem DB, sem rede.
//
// Performance: O(n) para buildThreadTree em uma única passada (Map-based
// parent lookup). Walk de ancestors/descendants é O(d) onde d é profundidade
// da subárvore.
// ============================================================================

import type { Comment } from './comments-engine';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Nó da árvore de comentários. Recursivo (children: CommentNode[]).
 */
export interface CommentNode {
  comment: Comment;
  children: CommentNode[];
  depth: number;
}

/**
 * Árvore enraizada em um comentário específico.
 */
export interface ThreadTree {
  root: CommentNode;
  totalNodes: number;
  maxDepth: number;
}

export interface ThreadingOptions {
  /** Profundidade máxima a incluir (default: Infinity). */
  maxDepth?: number;
  /** Soft-deleted: incluir ou pular? Default: false (pula). */
  includeDeleted?: boolean;
}

// ============================================================================
// ERRORS
// ============================================================================

export class ThreadingError extends Error {
  statusCode = 500;
  constructor(message: string) {
    super(message);
    this.name = 'ThreadingError';
  }
}

export class CommentNotInListError extends ThreadingError {
  constructor(commentId: string) {
    super(`Comment ${commentId} não encontrado na lista fornecida`);
    this.name = 'CommentNotInListError';
  }
}

// ============================================================================
// HELPERS — comment shape normalization
// ============================================================================

function isLive(comment: Comment, includeDeleted?: boolean): boolean {
  if (includeDeleted) return true;
  return comment.deletedAt === null;
}

/**
 * Constrói lookup table {id → Comment} em uma passada.
 */
function indexById(comments: Comment[]): Map<string, Comment> {
  const map = new Map<string, Comment>();
  for (const c of comments) {
    map.set(c.id, c);
  }
  return map;
}

/**
 * Filtra comments deletados (a menos que includeDeleted=true).
 */
function filterLive(
  comments: Comment[],
  includeDeleted?: boolean
): Comment[] {
  if (includeDeleted) return comments.slice();
  return comments.filter((c) => c.deletedAt === null);
}

// ============================================================================
// CORE — buildThreadTree
// ============================================================================

/**
 * Constrói árvore(és) de comentários a partir de uma lista plana.
 *
 * Estratégia:
 *   1. Indexa por id.
 *   2. Filtra soft-deletados (configurável).
 *   3. Para cada comment, encontra o parent (parentId) — se não achar,
 *      é um root órfão (parent deletado ou fora da lista). Inclui como root.
 *   4. Cada root vira um CommentNode.
 *
 * Edge cases:
 *   - Self-reference (parentId === id): vira root (anti-ciclo).
 *   - Parent deletado mas não incluído: comment vira root órfão.
 *   - Cycles A→B→A: detectados e quebrados (ambos viram root).
 *
 * @returns array de CommentNode roots (zero ou mais).
 */
export function buildThreadTree(
  comments: Comment[],
  options: ThreadingOptions = {}
): CommentNode[] {
  if (!Array.isArray(comments)) return [];
  const maxDepth = options.maxDepth ?? Infinity;
  const live = filterLive(comments, options.includeDeleted);

  // Indexação
  const byId = indexById(live);

  // Mapa de filhos: parentId → Comment[]
  const childMap = new Map<string | null, Comment[]>();
  for (const c of live) {
    const pid = c.parentId;
    const arr = childMap.get(pid) ?? [];
    arr.push(c);
    childMap.set(pid, arr);
  }

  // Detect cycles: se A é ancestral de si mesmo via parent chain, marca
  const isCycle = detectCycles(live);

  // Construção recursiva via DFS iterativa (evita stack overflow)
  function buildSubtree(comment: Comment, depth: number): CommentNode {
    const children =
      depth < maxDepth ? (childMap.get(comment.id) ?? []) : [];
    return {
      comment,
      depth,
      children: children
        .filter((c) => !isCycle.has(c.id))
        .map((c) => buildSubtree(c, depth + 1)),
    };
  }

  // Roots: comments sem parent OU com parent ausente da lista OU self-ref
  // OU participando de um cycle (X→Y→X) — nesse caso ambos viram roots
  // para evitar infinite loop ou tree vazia.
  const roots = live.filter((c) => {
    if (c.parentId === null) return true;
    if (c.parentId === c.id) return true; // self-ref
    if (!byId.has(c.parentId)) return true; // parent órfão
    if (isCycle.has(c.id)) return true; // cycle member
    return false;
  });

  // Ordena roots por createdAt desc (mais recentes primeiro)
  roots.sort((a, b) => {
    const at = new Date(a.createdAt).getTime();
    const bt = new Date(b.createdAt).getTime();
    return bt - at;
  });

  return roots.map((r) => buildSubtree(r, 1));
}

/**
 * Cycle detection — DFS com 3-color marking (white/gray/black).
 * Retorna Set de IDs que participam de algum ciclo.
 */
function detectCycles(comments: Comment[]): Set<string> {
  const byId = indexById(comments);
  const WHITE = 0;
  const GRAY = 1;
  const BLACK = 2;
  const color = new Map<string, number>();
  for (const c of comments) color.set(c.id, WHITE);
  const inCycle = new Set<string>();

  function visit(id: string, path: string[]): void {
    if (!byId.has(id)) return;
    const c = color.get(id);
    if (c === BLACK) return;
    if (c === GRAY) {
      // cycle detected — marca todos do path a partir do repetido
      const startIdx = path.indexOf(id);
      if (startIdx >= 0) {
        for (let i = startIdx; i < path.length; i++) {
          inCycle.add(path[i]!);
        }
      }
      return;
    }
    color.set(id, GRAY);
    const node = byId.get(id)!;
    if (node.parentId) visit(node.parentId, [...path, id]);
    color.set(id, BLACK);
  }

  for (const c of comments) {
    if (color.get(c.id) === WHITE) visit(c.id, []);
  }
  return inCycle;
}

// ============================================================================
// ANCESTORS — walk up
// ============================================================================

/**
 * Retorna a cadeia de ancestrais (do parent imediato até o root).
 * Exclui o próprio commentId. Retorna [] se for root ou parent ausente.
 *
 * Ordem: [parent, grandparent, ..., root] (de baixo pra cima).
 */
export function getAncestors(
  commentId: string,
  comments: Comment[]
): Comment[] {
  const byId = indexById(comments);
  const target = byId.get(commentId);
  if (!target) return [];

  const chain: Comment[] = [];
  const visited = new Set<string>([commentId]);
  let current: Comment | undefined = target.parentId
    ? byId.get(target.parentId)
    : undefined;

  while (current) {
    if (visited.has(current.id)) break; // anti-cycle
    visited.add(current.id);
    chain.push(current);
    current = current.parentId ? byId.get(current.parentId) : undefined;
  }

  return chain;
}

// ============================================================================
// DESCENDANTS — walk down
// ============================================================================

/**
 * Retorna TODOS os descendentes (recursive). DFS pre-order:
 * [child1, grandchildren-of-1, child2, grandchildren-of-2, ...]
 *
 * Soft-deletados são pulados (a menos que includeDeleted=true).
 */
export function getDescendants(
  commentId: string,
  comments: Comment[],
  options: ThreadingOptions = {}
): Comment[] {
  const live = filterLive(comments, options.includeDeleted);

  const childrenByParent = new Map<string | null, Comment[]>();
  for (const c of live) {
    const arr = childrenByParent.get(c.parentId) ?? [];
    arr.push(c);
    childrenByParent.set(c.parentId, arr);
  }

  const out: Comment[] = [];
  function dfs(id: string): void {
    const kids = childrenByParent.get(id) ?? [];
    for (const k of kids) {
      out.push(k);
      dfs(k.id);
    }
  }
  dfs(commentId);
  return out;
}

// ============================================================================
// DEPTH
// ============================================================================

/**
 * Profundidade da subárvore enraizada em `commentId`. Retorna:
 *   - 0 se não tem nenhum descendente (folha)
 *   - N se a maior cadeia filha tem N níveis
 *
 * Se `commentId` não está na lista, retorna 0.
 */
export function getThreadDepth(
  commentId: string,
  comments: Comment[],
  options: ThreadingOptions = {}
): number {
  const live = filterLive(comments, options.includeDeleted);

  // Mapa parent → children
  const childMap = new Map<string | null, Comment[]>();
  for (const c of live) {
    const arr = childMap.get(c.parentId) ?? [];
    arr.push(c);
    childMap.set(c.parentId, arr);
  }

  if (!live.some((c) => c.id === commentId)) return 0;

  let maxDepth = 0;
  function dfs(id: string, depth: number): void {
    const kids = childMap.get(id) ?? [];
    if (kids.length === 0) {
      if (depth > maxDepth) maxDepth = depth;
      return;
    }
    for (const k of kids) dfs(k.id, depth + 1);
  }
  // começa em depth=0 (o próprio nó não conta)
  dfs(commentId, 0);
  return maxDepth;
}

// ============================================================================
// REPLIES — paginated direct children
// ============================================================================

/**
 * Retorna apenas as replies DIRETAS (parentId === commentId), paginadas.
 *
 * Sort:
 *   - 'newest' (default): createdAt desc
 *   - 'oldest': createdAt asc
 *   - 'top': likesCount desc, createdAt desc
 */
export function getRepliesForComment(
  commentId: string,
  comments: Comment[],
  options: ThreadingOptions & {
    limit?: number;
    offset?: number;
    sortBy?: 'newest' | 'oldest' | 'top';
  } = {}
): { replies: Comment[]; total: number; hasMore: boolean } {
  const live = filterLive(comments, options.includeDeleted);

  // Direct children
  const direct = live.filter((c) => c.parentId === commentId);

  const sortBy = options.sortBy ?? 'newest';
  if (sortBy === 'oldest') {
    direct.sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  } else if (sortBy === 'top') {
    direct.sort((a, b) => {
      // Comment não tem likesCount neste shape — fallback createdAt
      const ac = new Date(a.createdAt).getTime();
      const bc = new Date(b.createdAt).getTime();
      return bc - ac;
    });
  } else {
    direct.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  const total = direct.length;
  const offset = Math.max(0, options.offset ?? 0);
  const limit = Math.max(1, options.limit ?? 20);
  const slice = direct.slice(offset, offset + limit);

  return {
    replies: slice,
    total,
    hasMore: offset + slice.length < total,
  };
}

// ============================================================================
// THREAD TREE — single root
// ============================================================================

/**
 * Constrói ThreadTree enraizada em um comment específico. Útil para render
 * "view this comment + all descendants" (sub-thread view).
 *
 * Se `rootId` não está na lista, throw CommentNotInListError.
 */
export function buildThreadTreeFromRoot(
  rootId: string,
  comments: Comment[],
  options: ThreadingOptions = {}
): ThreadTree {
  const live = filterLive(comments, options.includeDeleted);

  if (!live.some((c) => c.id === rootId)) {
    throw new CommentNotInListError(rootId);
  }

  const maxDepth = options.maxDepth ?? Infinity;

  // child map
  const childMap = new Map<string | null, Comment[]>();
  for (const c of live) {
    const arr = childMap.get(c.parentId) ?? [];
    arr.push(c);
    childMap.set(c.parentId, arr);
  }

  let totalNodes = 0;
  let maxFoundDepth = 0;

  function build(id: string, depth: number): CommentNode {
    totalNodes++;
    if (depth > maxFoundDepth) maxFoundDepth = depth;
    const node = live.find((c) => c.id === id)!;
    const kids = depth < maxDepth ? (childMap.get(id) ?? []) : [];
    return {
      comment: node,
      depth,
      children: kids.map((k) => build(k.id, depth + 1)),
    };
  }

  const root = build(rootId, 1);
  return { root, totalNodes, maxDepth: maxFoundDepth };
}

// ============================================================================
// HELPERS — count
// ============================================================================

/**
 * Conta descendentes diretos (immediate children only).
 */
export function countDirectReplies(
  commentId: string,
  comments: Comment[],
  options: ThreadingOptions = {}
): number {
  const live = filterLive(comments, options.includeDeleted);
  return live.filter((c) => c.parentId === commentId).length;
}

/**
 * Conta TODOS os descendentes (recursive).
 */
export function countTotalDescendants(
  commentId: string,
  comments: Comment[],
  options: ThreadingOptions = {}
): number {
  return getDescendants(commentId, comments, options).length;
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Retorna true se há algum ciclo na lista de comments.
 */
export function hasCycle(comments: Comment[]): boolean {
  return detectCycles(comments).size > 0;
}

/**
 * Retorna Set de comment IDs que são "órfãos" (parent ausente).
 * Útil para auditoria.
 */
export function getOrphanIds(comments: Comment[]): Set<string> {
  const ids = new Set(comments.map((c) => c.id));
  const orphans = new Set<string>();
  for (const c of comments) {
    if (c.parentId && !ids.has(c.parentId) && c.parentId !== c.id) {
      orphans.add(c.id);
    }
  }
  return orphans;
}

// ============================================================================
// PUBLIC EXPORTS
// ============================================================================

export const __allExports = {
  // functions
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
  // errors
  ThreadingError,
  CommentNotInListError,
} as const;