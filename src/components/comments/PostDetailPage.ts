// PostDetailPage.ts — top-level page (post header + threaded comments + composer).
// Pure presentational. Consumes a CommentsAdapter + MentionsAdapter from props.

import { h, type ComponentType } from './react-stubs.js';
import type {
  CommentTreeNode,
  CommentsAdapter,
  MentionHandle,
  Notificacao,
  Post,
  PostId,
  SuggestionMatch,
  Usuario,
  UsuarioId,
} from '../../lib/engines/comments/index.ts';
import { htmlEscape, matchSuggestions } from '../../lib/engines/comments/index.ts';
import { ThreadedComments } from './ThreadedComments.ts';
import { CommentComposer } from './CommentComposer.ts';

export interface PostDetailPageProps {
  readonly post: Post;
  readonly autor: Usuario | null;
  readonly roots: ReadonlyArray<CommentTreeNode>;
  readonly usuariosById: ReadonlyMap<string, Usuario>;
  readonly notificacoes: ReadonlyArray<Notificacao>;
  readonly composerOpen: boolean;
  readonly composerParentId: string | null;
  readonly composerDraft: string;
  readonly composerSuggestions: ReadonlyArray<SuggestionMatch>;
  readonly composerActiveIndex: number;
  readonly composerError: string | null;
  readonly currentUserId: UsuarioId | null;
  readonly onOpenComposer: (parentId: string | null) => void;
  readonly onCloseComposer: () => void;
  readonly onChangeDraft: (text: string, cursor: number) => void;
  readonly onPickSuggestion: (index: number) => void;
  readonly onHoverSuggestion: (index: number) => void;
  readonly onSubmitComment: () => void;
  readonly adapter: CommentsAdapter;
  readonly mentions: ReadonlyArray<Usuario>;
  readonly postId: PostId;
  readonly knownHandles: ReadonlyArray<MentionHandle>;
}

export const PostDetailPage: ComponentType<PostDetailPageProps> = (props) => {
  const {
    post,
    autor,
    roots,
    usuariosById,
    notificacoes,
    composerOpen,
    composerParentId,
    composerDraft,
    composerSuggestions,
    composerActiveIndex,
    composerError,
    currentUserId,
    onOpenComposer,
    onCloseComposer,
    onChangeDraft,
    onPickSuggestion,
    onHoverSuggestion,
    onSubmitComment,
    knownHandles,
  } = props;

  const myNotifs = currentUserId
    ? notificacoes.filter((n) => n.destinatarioId === currentUserId && !n.lida)
    : [];
  const unreadCount = myNotifs.length;
  const autorEmoji = autor ? autor.tradicaoPrincipal : 'cigano';
  const autorEmojiChar =
    autorEmoji === 'cigano'
      ? '🃏'
      : autorEmoji === 'candomble'
      ? '🌿'
      : autorEmoji === 'umbanda'
      ? '🕯️'
      : autorEmoji === 'ifa'
      ? '📿'
      : autorEmoji === 'cabala'
      ? '✡️'
      : autorEmoji === 'astrologia'
      ? '♈'
      : autorEmoji === 'tantra'
      ? '🕉️'
      : autorEmoji === 'numerologia'
      ? '🔢'
      : autorEmoji === 'tarot'
      ? '🃏'
      : '🃏';

  return h(
    'article',
    {
      className: 'post-detail-page',
      'data-post-id': post.id,
      style: {
        maxWidth: '720px',
        margin: '0 auto',
        padding: '16px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      },
    },
    // Notifications banner
    unreadCount > 0
      ? h(
          'div',
          {
            className: 'post-detail-page-notifs',
            role: 'status',
            'aria-live': 'polite',
            style: {
              background: '#fff3cd',
              border: '1px solid #ffe082',
              borderRadius: '8px',
              padding: '8px 12px',
              marginBottom: '12px',
              fontSize: '14px',
            },
          },
          unreadCount +
            ' notificação(ões) não lida(s) —' +
            (myNotifs.filter((n) => n.tipo === 'mention').length > 0
              ? ' alguém te mencionou!'
              : ' alguém respondeu!'),
        )
      : null,

    // Post header
    h(
      'header',
      {
        className: 'post-detail-page-header',
        style: { paddingBottom: '12px', borderBottom: '1px solid #eee' },
      },
      h(
        'div',
        { className: 'post-detail-page-autor', style: { display: 'flex', alignItems: 'center', gap: '8px' } },
        h(
          'span',
          { className: 'post-detail-page-emoji', 'aria-hidden': 'true' },
          autorEmojiChar,
        ),
        h(
          'strong',
          { className: 'post-detail-page-autor-nome' },
          htmlEscape(autor ? autor.nome : 'Autor removido'),
        ),
        autor
          ? h(
              'span',
              { className: 'post-detail-page-autor-handle', style: { color: '#666' } },
              '@' + autor.handle,
            )
          : null,
        h(
          'time',
          {
            className: 'post-detail-page-date',
            dateTime: post.createdAt,
            style: { marginLeft: 'auto', color: '#999', fontSize: '12px' },
          },
          post.createdAt.slice(0, 10),
        ),
      ),
      h(
        'h1',
        { className: 'post-detail-page-title', style: { margin: '8px 0', fontSize: '22px' } },
        htmlEscape(post.titulo),
      ),
      h(
        'div',
        {
          className: 'post-detail-page-body',
          style: { lineHeight: '1.5', whiteSpace: 'pre-wrap' },
        },
        htmlEscape(post.corpo),
      ),
      h(
        'div',
        {
          className: 'post-detail-page-tags',
          style: { marginTop: '8px', display: 'flex', gap: '6px', flexWrap: 'wrap' },
        },
        ...post.tags.map((t) =>
          h(
            'span',
            {
              key: t,
              className: 'post-detail-page-tag',
              style: {
                background: '#eef',
                color: '#335',
                padding: '2px 8px',
                borderRadius: '10px',
                fontSize: '12px',
              },
              'data-tag': t,
            },
            '#' + t,
          ),
        ),
      ),
    ),

    // Comments
    h(ThreadedComments, {
      roots,
      usuariosById,
      highlightedCommentId: composerParentId,
      onReply: (id: string) => onOpenComposer(id),
    }),

    // FAB / button to open composer
    h(
      'div',
      {
        className: 'post-detail-page-fab-wrap',
        style: {
          position: 'sticky',
          bottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)',
          marginTop: '16px',
        },
      },
      h(
        'button',
        {
          type: 'button',
          className: 'post-detail-page-fab',
          'aria-label': 'Comentar no post',
          onClick: () => onOpenComposer(null),
          style: {
            minHeight: '44px',
            minWidth: '44px',
            padding: '12px 20px',
            border: 'none',
            background: '#1f4e79',
            color: '#fff',
            borderRadius: '24px',
            cursor: 'pointer',
            fontSize: '15px',
            fontWeight: 600,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          },
        },
        '+ Comentar',
      ),
    ),

    // Bottom-sheet composer
    h(CommentComposer, {
      open: composerOpen,
      parentId: composerParentId,
      draftText: composerDraft,
      suggestions: composerSuggestions,
      activeSuggestionIndex: composerActiveIndex,
      knownHandles,
      errorMessage: composerError,
      onChange: onChangeDraft,
      onPickSuggestion: onPickSuggestion,
      onHoverSuggestion: onHoverSuggestion,
      onClose: onCloseComposer,
      onSubmit: onSubmitComment,
    }),
  );
};

// --- Stateful wrapper helpers ---------------------------------------------

export interface StatefulPostDetailPageOptions {
  readonly adapter: CommentsAdapter;
  readonly mentions: ReadonlyArray<Usuario>;
  readonly postId: PostId;
  readonly currentUserId: UsuarioId | null;
  readonly knownHandles: ReadonlyArray<MentionHandle>;
  readonly initialOpen?: boolean;
  readonly initialDraft?: string;
  readonly initialSuggestions?: ReadonlyArray<SuggestionMatch>;
  readonly initialActiveIndex?: number;
  readonly initialError?: string | null;
  readonly initialNotifs?: ReadonlyArray<Notificacao>;
  readonly initialRoots?: ReadonlyArray<CommentTreeNode>;
}

export interface StatefulPostDetailPageState {
  composerOpen: boolean;
  composerParentId: string | null;
  composerDraft: string;
  composerSuggestions: ReadonlyArray<SuggestionMatch>;
  composerActiveIndex: number;
  composerError: string | null;
  notifs: ReadonlyArray<Notificacao>;
  roots: ReadonlyArray<CommentTreeNode>;
}

export function createInitialState(
  options: StatefulPostDetailPageOptions,
): StatefulPostDetailPageState {
  const roots = options.initialRoots ?? options.adapter.buildTree(options.postId);
  const notifs = options.initialNotifs ?? (
    options.currentUserId
      ? options.adapter.listNotificacoes(options.currentUserId)
      : []
  );
  return {
    composerOpen: options.initialOpen ?? false,
    composerParentId: null,
    composerDraft: options.initialDraft ?? '',
    composerSuggestions: options.initialSuggestions ?? [],
    composerActiveIndex: options.initialActiveIndex ?? -1,
    composerError: options.initialError ?? null,
    notifs,
    roots,
  };
}

/**
 * Recompute suggestions + active index from the current draft.
 * Pure function — usable from specs.
 */
export function recomputeSuggestions(
  draft: string,
  mentions: ReadonlyArray<Usuario>,
  cursor: number,
  knownHandles: ReadonlyArray<MentionHandle>,
): {
  suggestions: ReadonlyArray<SuggestionMatch>;
  activeIndex: number;
} {
  // Token at cursor: if it starts with @ and is a valid handle prefix, match.
  let prefix = '';
  const before = draft.slice(0, cursor);
  let i = before.length;
  while (i > 0) {
    const ch = before.charAt(i - 1);
    if (ch === ' ' || ch === '\n' || ch === '\t') break;
    i--;
  }
  const token = before.slice(i);
  if (token.startsWith('@')) {
    prefix = token.slice(1);
    if (!/^[A-Za-z0-9_]*$/.test(prefix)) prefix = '';
  }
  const suggestions = matchSuggestions(prefix, mentions, 6);
  const activeIndex = suggestions.length > 0 ? 0 : -1;
  // Reference knownHandles to keep it as a parameter (used in composer).
  void knownHandles;
  return { suggestions, activeIndex };
}