// ============================================================================
// POSTS MAPPER — Converte entidades Prisma em DTOs da API
// ============================================================================
// Centraliza a lógica de "hidratação" dos posts com author, group,
// likedByMe, etc. Sem isso, cada rota repetiria o mesmo include.
// ============================================================================

import type { Post, Comment, Like, Group } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import type {
  CommentDto,
  PostAuthorDto,
  PostDto,
  PostReference,
} from './types';

/** Tipo do Post carregado com relations necessárias para o feed. */
export type PostWithRelations = Post & {
  group?: Group | null;
  likes?: Like[];
};

export interface MapPostsOptions {
  /** ID do usuário atual para calcular likedByMe / bookmarkedByMe */
  currentUserId?: string | null;
  /** Limite de replies por comment (default 2 para aninhamento leve) */
  repliesLimit?: number;
}

const DEFAULT_REPLIES_LIMIT = 2;

/** Mapeia um Post (Prisma) para o DTO exposto pela API. */
export function mapPostToDto(
  post: PostWithRelations,
  opts: MapPostsOptions = {},
): PostDto {
  const { currentUserId = null } = opts;

  const references = parseReferences(post.references);

  return {
    id: post.id,
    content: post.content,
    type: post.type,
    tradition: post.tradition,
    topic: post.topic,
    mediaUrls: post.mediaUrls ?? [],
    linkUrl: post.linkUrl,
    references,
    groupId: post.groupId,
    group: post.group
      ? { id: post.group.id, slug: post.group.slug, name: post.group.name }
      : null,
    likesCount: post.likesCount,
    commentsCount: post.commentsCount,
    sharesCount: post.sharesCount,
    likedByMe: !!currentUserId && !!post.likes?.some((l) => l.userId === currentUserId),
    bookmarkedByMe: false, // TODO: integrar com bookmarks quando o feed usar
    deletedAt: post.deletedAt ? post.deletedAt.toISOString() : null,
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
    author: mapAuthorFromId(post.authorId),
  };
}

/**
 * Carrega dados do autor (PostAuthorDto) a partir do userId.
 *
 * Tenta carregar de User + SpiritualProfile em paralelo.
 * Fallback: retorna um author "fantasma" para evitar 404 silencioso
 * (ex.: autor deletou conta mas posts permanecem).
 */
export async function loadAuthor(userId: string): Promise<PostAuthorDto> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { /* spiritualProfile removido por enquanto */ },
    });

    if (!user) {
      return ghostAuthor(userId);
    }

    // Tenta enriquecer com dados espirituais
    let spiritualTag: string | null = null;
    let orixa: string | null = null;
    try {
      const profile = await prisma.spiritualProfile.findUnique({
        where: { userId: user.id },
      });
      if (profile) {
        if (profile.caminhoDeVida) {
          spiritualTag = `Caminho ${profile.caminhoDeVida}`;
          if (profile.signoSolar) spiritualTag += ` · ${profile.signoSolar}`;
        }
        if (profile.orixaRegente) orixa = profile.orixaRegente;
      }
    } catch {
      // SpiritualProfile pode não existir em dev — ignora
    }

    return {
      id: user.id,
      handle: deriveHandle(user.name, user.id),
      displayName: user.name || user.email?.split('@')[0] || 'Membro',
      avatarUrl: null,
      spiritualTag,
      orixa,
    };
  } catch {
    return ghostAuthor(userId);
  }
}

/** Carrega múltiplos autores de uma vez (evita N+1 no feed). */
export async function loadAuthors(userIds: string[]): Promise<Map<string, PostAuthorDto>> {
  const map = new Map<string, PostAuthorDto>();
  if (userIds.length === 0) return map;

  try {
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
    });

    // Perfis em paralelo (mesma query para todos)
    let profiles: Array<{ userId: string; caminhoDeVida: number | null; signoSolar: string | null; orixaRegente: string | null }> = [];
    try {
      profiles = await prisma.spiritualProfile.findMany({
        where: { userId: { in: userIds } },
        select: { userId: true, caminhoDeVida: true, signoSolar: true, orixaRegente: true },
      });
    } catch {
      // tabela pode não existir em dev
    }
    const profileByUser = new Map(profiles.map((p) => [p.userId, p]));

    for (const user of users) {
      const profile = profileByUser.get(user.id);
      const spiritualTag = profile?.caminhoDeVida
        ? `Caminho ${profile.caminhoDeVida}${profile.signoSolar ? ` · ${profile.signoSolar}` : ''}`
        : null;
      map.set(user.id, {
        id: user.id,
        handle: deriveHandle(user.name, user.id),
        displayName: user.name || user.email?.split('@')[0] || 'Membro',
        avatarUrl: null,
        spiritualTag,
        orixa: profile?.orixaRegente ?? null,
      });
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[api/posts] loadAuthors failed', err);
  }

  // Garante entrada para todos os userIds (fallback fantasma)
  for (const id of userIds) {
    if (!map.has(id)) map.set(id, ghostAuthor(id));
  }
  return map;
}

function mapAuthorFromId(userId: string): PostAuthorDto {
  // Placeholder — deve ser substituído por loadAuthor/loadAuthors em hidratação batch.
  // Mantemos ghostAuthor pra evitar quebrar o tipo em caso de hot-path sem include.
  return ghostAuthor(userId);
}

function ghostAuthor(userId: string): PostAuthorDto {
  return {
    id: userId,
    handle: userId.slice(0, 8),
    displayName: 'Membro Akasha',
    avatarUrl: null,
    spiritualTag: null,
    orixa: null,
  };
}

function deriveHandle(name: string | null, id: string): string {
  if (name && name.trim()) {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 30) || id.slice(0, 8);
  }
  return id.slice(0, 8);
}

function parseReferences(value: unknown): PostReference[] {
  if (!Array.isArray(value)) return [];
  const refs: PostReference[] = [];
  for (const item of value) {
    if (item && typeof item === 'object' && 'title' in item && typeof (item as PostReference).title === 'string') {
      refs.push(item as PostReference);
    }
  }
  return refs;
}

// ============================================================================
// Comment mapper
// ============================================================================

export type CommentWithReplies = Comment & {
  replies?: CommentWithReplies[];
  likes?: Like[];
};

export function mapCommentToDto(
  comment: CommentWithReplies,
  opts: MapPostsOptions = {},
): CommentDto {
  const { currentUserId = null, repliesLimit = DEFAULT_REPLIES_LIMIT } = opts;
  return {
    id: comment.id,
    postId: comment.postId,
    parentId: comment.parentId,
    author: mapAuthorFromId(comment.authorId),
    content: comment.content,
    likesCount: comment.likesCount,
    likedByMe: !!currentUserId && !!comment.likes?.some((l) => l.userId === currentUserId),
    createdAt: comment.createdAt.toISOString(),
    updatedAt: comment.updatedAt.toISOString(),
    deletedAt: comment.deletedAt ? comment.deletedAt.toISOString() : null,
    replies: comment.replies?.slice(0, repliesLimit).map((r) => mapCommentToDto(r, opts)),
  };
}
