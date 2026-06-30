// InMemoryCommentsAdapter.ts — 1 sample post + 12 comments across 3 threads.
// Cycle 78 pattern: buildTree via Map + parent walk, enforce MAX_THREAD_DEPTH = 3
// by flattening deep comments to depth 3.
// Cycle 82: Object.freeze everywhere; addComment auto-extracts mentions and
// generates reply/mention notifications for the relevant destinatario(s).

import {
  asCommentId,
  asPostId,
  asUsuarioId,
  MAX_THREAD_DEPTH,
  type Comment,
  type CommentId,
  type CommentTreeNode,
  type CommentsAdapter,
  type Notificacao,
  type Post,
  type PostId,
  type UsuarioId,
} from './types.ts';
import { extractMentions, resolveMentions } from './mentions.ts';
import { SAMPLE_USUARIOS } from './InMemoryMentionsAdapter.ts';
import type { Usuario } from './types.ts';

// --- Sample post -----------------------------------------------------------

const SAMPLE_POST: Post = Object.freeze({
  id: asPostId('p-001'),
  autorId: asUsuarioId('u-1'),
  titulo: 'Cruzamento por Casa — onde a Astrologia encontra o Cigano',
  corpo:
    'Abrimos a Mesa Real e cruzamos o Mapa Astral com o Odu de Nascimento. ' +
    'Cada casa ilumina um eixo: amor, trabalho, saúde, espiritualidade. ' +
    'Bora discutir o método nos comentários?',
  createdAt: '2026-06-15T10:00:00.000Z',
  tags: Object.freeze(['cigano', 'astrologia'] as ReadonlyArray<'cigano' | 'astrologia'>),
});

// --- 12 sample comments across 3 threads -----------------------------------
// Layout:
//   thread A (depth 0 → 1 → 2 → 3): c-001 → c-002 → c-003 → c-004
//   thread B (depth 0 → 1 → 2):     c-005 → c-006 → c-007
//   thread C (depth 0 → 1):         c-008 → c-009
//   thread D (depth 0 → 1 → 2 → 3): c-010 → c-011 → c-012 → (will be flattened)
//
// c-004 is depth 3 (legal). c-013 will be added via addComment and forced to depth 3.

type SampleCommentSeed = {
  readonly id: string;
  readonly parentId: string | null;
  readonly autorId: string;
  readonly corpo: string;
  readonly createdAt: string;
};

const SAMPLE_COMMENT_SEEDS: ReadonlyArray<SampleCommentSeed> = Object.freeze([
  // Thread A
  {
    id: 'c-001',
    parentId: null,
    autorId: 'u-2',
    corpo: 'Belo post @cigano_ramiro! Já apliquei o Cruzamento com Ifá e casa 8 de sexualidade.',
    createdAt: '2026-06-15T11:00:00.000Z',
  },
  {
    id: 'c-002',
    parentId: 'c-001',
    autorId: 'u-1',
    corpo: 'Valeu @mae_iya! Casa 8 com Ifá é lindo. A força de Iansã rege transformações profundas.',
    createdAt: '2026-06-15T11:30:00.000Z',
  },
  {
    id: 'c-003',
    parentId: 'c-002',
    autorId: 'u-7',
    corpo: 'Do Tantra, vejo Casa 8 como o Chakra Sexual — concordo com @cigano_ramiro.',
    createdAt: '2026-06-15T12:00:00.000Z',
  },
  {
    id: 'c-004',
    parentId: 'c-003',
    autorId: 'u-8',
    corpo: 'E o Tarot na Casa 8 puxa a carta da Morte — transformação, @swami_ananda.',
    createdAt: '2026-06-15T12:30:00.000Z',
  },
  // Thread B
  {
    id: 'c-005',
    parentId: null,
    autorId: 'u-5',
    corpo: 'Na Cabala, a Casa 8 da Astrologia corresponde a Hod na Árvore da Vida.',
    createdAt: '2026-06-15T13:00:00.000Z',
  },
  {
    id: 'c-006',
    parentId: 'c-005',
    autorId: 'u-6',
    corpo: 'Boa @rabino_moshe! Hod rege intelecto e comunicação, faz sentido com Casa 8.',
    createdAt: '2026-06-15T13:30:00.000Z',
  },
  {
    id: 'c-007',
    parentId: 'c-006',
    autorId: 'u-1',
    corpo: '@astrologo_stella @rabino_moshe — então cruzamento Cabala × Astrologia tem fundamento na Sefirot.',
    createdAt: '2026-06-15T14:00:00.000Z',
  },
  // Thread C
  {
    id: 'c-008',
    parentId: null,
    autorId: 'u-3',
    corpo: 'Umbanda também lê Casas — a Entidade de cada casa espiritual vai na consulta.',
    createdAt: '2026-06-15T14:30:00.000Z',
  },
  {
    id: 'c-009',
    parentId: 'c-008',
    autorId: 'u-4',
    corpo: 'Em Ifá, @pai_ogum, cada Odu rege uma casa do corpo — não uma casa astral.',
    createdAt: '2026-06-15T15:00:00.000Z',
  },
  // Thread D
  {
    id: 'c-010',
    parentId: null,
    autorId: 'u-2',
    corpo: 'Numerologia Pitagórica soma o número da casa com o do signo.',
    createdAt: '2026-06-15T15:30:00.000Z',
  },
  {
    id: 'c-011',
    parentId: 'c-010',
    autorId: 'u-1',
    corpo: 'Puxa a Numerologia Cabalística e soma com a Gematria do nome — @mae_iya.',
    createdAt: '2026-06-15T16:00:00.000Z',
  },
  {
    id: 'c-012',
    parentId: 'c-011',
    autorId: 'u-5',
    corpo: 'Gematria + Numerologia cruzadas — adorei @cigano_ramiro.',
    createdAt: '2026-06-15T16:30:00.000Z',
  },
]);

// --- Helper ----------------------------------------------------------------

function buildComment(seed: SampleCommentSeed, postId: PostId): Comment {
  const mentioned = extractMentions(seed.corpo).map((e) => e.handle);
  return Object.freeze({
    id: asCommentId(seed.id),
    postId,
    autorId: asUsuarioId(seed.autorId),
    parentId: seed.parentId ? asCommentId(seed.parentId) : null,
    corpo: Object.freeze(seed.corpo),
    createdAt: Object.freeze(seed.createdAt),
    mentionedHandles: Object.freeze(mentioned),
    depth: 0,
  });
}

// --- Adapter factory -------------------------------------------------------

export interface InMemoryCommentsAdapterOptions {
  readonly post?: Post;
  readonly comments?: ReadonlyArray<SampleCommentSeed>;
  readonly users?: ReadonlyArray<Usuario>;
  readonly now?: () => Date;
}

export function createInMemoryCommentsAdapter(
  options: InMemoryCommentsAdapterOptions = {},
): CommentsAdapter {
  const post: Post = options.post ?? SAMPLE_POST;
  const users: ReadonlyArray<Usuario> = options.users ?? SAMPLE_USUARIOS;
  const seeds: ReadonlyArray<SampleCommentSeed> =
    options.comments ?? SAMPLE_COMMENT_SEEDS;
  const now: () => Date = options.now ?? (() => new Date('2026-06-30T09:00:00.000Z'));

  const comments: Comment[] = seeds.map((s) => buildComment(s, post.id));
  const notifs: Notificacao[] = [];
  let notifCounter = 0;

  function nextNotifId(): string {
    notifCounter++;
    return 'n-' + String(notifCounter).padStart(4, '0');
  }

  function resolveAutorHandle(uid: UsuarioId): string {
    const u = users.find((x) => x.id === uid);
    return u ? u.handle : '';
  }

  function emitNotifsFor(comment: Comment): void {
    // Reply notification: if parent exists, parent autor gets a reply
    if (comment.parentId) {
      const parent = comments.find((c) => c.id === comment.parentId);
      if (parent && parent.autorId !== comment.autorId) {
        notifs.push(
          Object.freeze({
            id: nextNotifId(),
            destinatarioId: parent.autorId,
            tipo: 'reply',
            postId: comment.postId,
            commentId: comment.id,
            origemAutorId: comment.autorId,
            createdAt: comment.createdAt,
            lida: false,
          }),
        );
      }
    }
    // Mention notifications: each mentioned user gets one (unless they wrote the comment)
    for (const handle of comment.mentionedHandles) {
      const u = users.find((x) => x.handle === handle);
      if (u && u.id !== comment.autorId) {
        notifs.push(
          Object.freeze({
            id: nextNotifId(),
            destinatarioId: u.id,
            tipo: 'mention',
            postId: comment.postId,
            commentId: comment.id,
            origemAutorId: comment.autorId,
            createdAt: comment.createdAt,
            lida: false,
          }),
        );
      }
    }
  }

  // Emit initial notifications for the seed comments
  for (const c of comments) emitNotifsFor(c);

  // Compute depth at insertion time (used by addComment). Walks the parent
  // chain through the existing comments array.
  function computeDepthAtInsert(parentId: CommentId | null): 0 | 1 | 2 | 3 {
    if (!parentId) return 0;
    let cursor: CommentId | null = parentId;
    let hops = 1;
    const seen = new Set<CommentId>();
    while (cursor && !seen.has(cursor)) {
      seen.add(cursor);
      const p = comments.find((c) => c.id === cursor);
      if (!p) break;
      if (hops >= MAX_THREAD_DEPTH) return MAX_THREAD_DEPTH as 0 | 1 | 2 | 3;
      cursor = p.parentId;
      if (cursor) hops++;
    }
    return hops as 0 | 1 | 2 | 3;
  }

  function computeDepths(rawComments: ReadonlyArray<Comment>): Comment[] {
    const byId = new Map<CommentId, Comment>();
    for (const c of rawComments) byId.set(c.id, c);

    // depth(comment) =
    //   0 if parentId is null
    //   min(depth(parent)+1, 3) otherwise
    function depthOf(c: Comment): 0 | 1 | 2 | 3 {
      if (!c.parentId) return 0;
      const p = byId.get(c.parentId);
      if (!p) return 0;
      const dp = depthOf(p) + 1;
      return (dp > MAX_THREAD_DEPTH ? MAX_THREAD_DEPTH : dp) as 0 | 1 | 2 | 3;
    }

    // To honor MAX_THREAD_DEPTH with flattening, the tree must re-parent
    // comments whose parent is at depth 3 to that depth-3 parent.
    // That keeps the tree a real tree (not a flat list).
    const result: Comment[] = [];
    for (const c of rawComments) {
      const depth = depthOf(c);
      // If parent exists and is already at depth 3, re-parent to that parent.
      let parentId = c.parentId;
      if (parentId) {
        let p = byId.get(parentId);
        while (p && depthOf(p) >= MAX_THREAD_DEPTH) {
          parentId = p.parentId;
          if (!parentId) break;
          p = byId.get(parentId);
        }
      }
      result.push(
        Object.freeze({
          ...c,
          parentId,
          depth,
        }),
      );
    }
    return result;
  }

  function buildTreeInternal(postId: PostId): ReadonlyArray<CommentTreeNode> {
    const flat = computeDepths(comments.filter((c) => c.postId === postId));
    // Build an in-memory mutable tree, then freeze recursively.
    type Mutable = { -readonly [K in keyof CommentTreeNode]: CommentTreeNode[K] } & {
      children: Mutable[];
    };
    const byId = new Map<CommentId, Mutable>();
    for (const c of flat) {
      byId.set(c.id, { ...c, children: [] } as Mutable);
    }
    const roots: Mutable[] = [];
    for (const c of flat) {
      const node = byId.get(c.id)!;
      if (c.parentId && byId.has(c.parentId)) {
        const parent = byId.get(c.parentId)!;
        parent.children.push(node);
      } else {
        roots.push(node);
      }
    }
    function freezeTree(n: Mutable): CommentTreeNode {
      return Object.freeze({
        id: n.id,
        postId: n.postId,
        autorId: n.autorId,
        parentId: n.parentId,
        corpo: n.corpo,
        createdAt: n.createdAt,
        mentionedHandles: n.mentionedHandles,
        depth: n.depth,
        children: Object.freeze(n.children.map(freezeTree)),
      });
    }
    return Object.freeze(roots.map(freezeTree));
  }

  return Object.freeze({
    getPost(postId: PostId): Post | null {
      return post.id === postId ? post : null;
    },
    listComments(postId: PostId): ReadonlyArray<Comment> {
      const flat = computeDepths(comments.filter((c) => c.postId === postId));
      return Object.freeze(flat);
    },
    buildTree(postId: PostId): ReadonlyArray<CommentTreeNode> {
      return buildTreeInternal(postId);
    },
    addComment(input: {
      readonly postId: PostId;
      readonly autorId: UsuarioId;
      readonly parentId: CommentId | null;
      readonly corpo: string;
    }): Comment {
      const handled = input.corpo.trim();
      if (handled.length === 0) {
        throw new Error('Empty comment body');
      }
      const mentioned = extractMentions(handled).map((e) => e.handle);
      const id = asCommentId(
        'c-' + String(comments.length + 1).padStart(3, '0'),
      );
      const isoNow = now().toISOString();
      // Compute depth at write time by walking up parents.
      const depth = computeDepthAtInsert(input.parentId);
      const novo: Comment = Object.freeze({
        id,
        postId: input.postId,
        autorId: input.autorId,
        parentId: input.parentId,
        corpo: Object.freeze(handled),
        createdAt: Object.freeze(isoNow),
        mentionedHandles: Object.freeze(mentioned),
        depth,
      });
      comments.push(novo);
      emitNotifsFor(novo);
      return novo;
    },
    listNotificacoes(usuarioId: UsuarioId): ReadonlyArray<Notificacao> {
      return Object.freeze(notifs.filter((n) => n.destinatarioId === usuarioId));
    },
    marcarLida(notifId: string): Notificacao | null {
      const idx = notifs.findIndex((n) => n.id === notifId);
      if (idx < 0) return null;
      const updated = Object.freeze({ ...notifs[idx]!, lida: true });
      notifs[idx] = updated;
      return updated;
    },
  });
}

export const defaultCommentsAdapter: CommentsAdapter =
  createInMemoryCommentsAdapter();

export const SAMPLE_POST_FOR_TEST: Post = SAMPLE_POST;
export const SAMPLE_COMMENT_SEEDS_FOR_TEST: ReadonlyArray<SampleCommentSeed> =
  SAMPLE_COMMENT_SEEDS;

// Re-export for tests
export { resolveMentions };

// Helper to fetch a usuario handle from a Comment (handy for tree rendering)
export function autorHandleFor(
  comment: Comment,
  users: ReadonlyArray<Usuario>,
): string {
  return resolveAutorHandleFrom(comment.autorId, users);
}

function resolveAutorHandleFrom(
  uid: UsuarioId,
  users: ReadonlyArray<Usuario>,
): string {
  const u = users.find((x) => x.id === uid);
  return u ? u.handle : '';
}