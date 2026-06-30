// types.ts — branded primitives + DTOs for the comments/threading/mentions domain.
// Cycle 78/79/82 pattern: Brand<TBase, TBrand> + regex-validated factories.
// All DTOs are readonly; Object.freeze enforced at construction sites.

declare const process: { env: Record<string, string | undefined> };

// --- Branded primitives -----------------------------------------------------

export type Brand<TBase, TBrand extends string> = TBase & {
  readonly __brand: TBrand;
};

export type PostId = Brand<string, 'PostId'>;
export type CommentId = Brand<string, 'CommentId'>;
export type UsuarioId = Brand<string, 'UsuarioId'>;
export type MentionHandle = Brand<string, 'MentionHandle'>; // without leading '@'

// --- ID factories -----------------------------------------------------------
// Cycle 79 W79-D lesson: regex validation at construction sites.

const POST_ID_RE = /^p-[a-z0-9]{1,16}$/;
const COMMENT_ID_RE = /^c-[a-z0-9]{1,16}$/;
const USUARIO_ID_RE = /^u-[a-z0-9]{1,16}$/;
const MENTION_HANDLE_RE = /^[a-zA-Z0-9_]{2,24}$/;

export function asPostId(raw: string): PostId {
  if (!POST_ID_RE.test(raw)) {
    throw new Error(`Invalid PostId: ${JSON.stringify(raw)}`);
  }
  return raw as PostId;
}

export function asCommentId(raw: string): CommentId {
  if (!COMMENT_ID_RE.test(raw)) {
    throw new Error(`Invalid CommentId: ${JSON.stringify(raw)}`);
  }
  return raw as CommentId;
}

export function asUsuarioId(raw: string): UsuarioId {
  if (!USUARIO_ID_RE.test(raw)) {
    throw new Error(`Invalid UsuarioId: ${JSON.stringify(raw)}`);
  }
  return raw as UsuarioId;
}

export function asMentionHandle(raw: string): MentionHandle {
  // Strip leading '@' if present
  const stripped = raw.startsWith('@') ? raw.slice(1) : raw;
  if (!MENTION_HANDLE_RE.test(stripped)) {
    throw new Error(`Invalid MentionHandle: ${JSON.stringify(raw)}`);
  }
  return stripped as MentionHandle;
}

// --- Domain types -----------------------------------------------------------

export type Tradicao =
  | 'cigano'
  | 'orixas'
  | 'candomble'
  | 'umbanda'
  | 'ifa'
  | 'cabala'
  | 'astrologia'
  | 'tantra'
  | 'numerologia'
  | 'tarot';

export const TRADICOES: ReadonlyArray<Tradicao> = Object.freeze([
  'cigano',
  'orixas',
  'candomble',
  'umbanda',
  'ifa',
  'cabala',
  'astrologia',
  'tantra',
  'numerologia',
  'tarot',
]);

export const TRADICAO_EMOJI: Readonly<Record<Tradicao, string>> = Object.freeze({
  cigano: '🃏',
  orixas: '⚡',
  candomble: '🌿',
  umbanda: '🕯️',
  ifa: '📿',
  cabala: '✡️',
  astrologia: '♈',
  tantra: '🕉️',
  numerologia: '🔢',
  tarot: '🃏',
});

export interface Usuario {
  readonly id: UsuarioId;
  readonly handle: MentionHandle;
  readonly nome: string;
  readonly tradicaoPrincipal: Tradicao;
  readonly bio: string;
}

export interface Post {
  readonly id: PostId;
  readonly autorId: UsuarioId;
  readonly titulo: string;
  readonly corpo: string;
  readonly createdAt: string; // ISO date
  readonly tags: ReadonlyArray<Tradicao>;
}

export interface Comment {
  readonly id: CommentId;
  readonly postId: PostId;
  readonly autorId: UsuarioId;
  /** null = root comment on the post */
  readonly parentId: CommentId | null;
  readonly corpo: string;
  readonly createdAt: string;
  /** Handles (without @) extracted from corpo at write time */
  readonly mentionedHandles: ReadonlyArray<MentionHandle>;
  /** Pre-computed depth after buildTree + flattening */
  readonly depth: 0 | 1 | 2 | 3;
}

export interface CommentTreeNode extends Comment {
  readonly children: ReadonlyArray<CommentTreeNode>;
}

export interface Notificacao {
  readonly id: string;
  readonly destinatarioId: UsuarioId;
  readonly tipo: 'reply' | 'mention';
  readonly postId: PostId;
  readonly commentId: CommentId;
  readonly origemAutorId: UsuarioId;
  readonly createdAt: string;
  readonly lida: boolean;
}

// --- Adapter contracts ------------------------------------------------------

export interface CommentsAdapter {
  readonly getPost: (postId: PostId) => Post | null;
  readonly listComments: (postId: PostId) => ReadonlyArray<Comment>;
  readonly buildTree: (postId: PostId) => ReadonlyArray<CommentTreeNode>;
  readonly addComment: (input: {
    readonly postId: PostId;
    readonly autorId: UsuarioId;
    readonly parentId: CommentId | null;
    readonly corpo: string;
  }) => Comment;
  readonly listNotificacoes: (
    usuarioId: UsuarioId,
  ) => ReadonlyArray<Notificacao>;
  readonly marcarLida: (notifId: string) => Notificacao | null;
}

export interface MentionsAdapter {
  readonly listActive: () => ReadonlyArray<Usuario>;
  readonly getByHandle: (handle: MentionHandle) => Usuario | null;
  readonly getById: (id: UsuarioId) => Usuario | null;
  readonly search: (
    prefix: string,
    limit?: number,
  ) => ReadonlyArray<Usuario>;
}

// --- Constants used across the UI -------------------------------------------

export const MAX_THREAD_DEPTH = 3 as const;

// Process / console ambient stub — only used in tests, not exported.
export const _internals = Object.freeze({
  env: typeof process !== 'undefined' ? process.env : {},
});