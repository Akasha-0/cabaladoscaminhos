// CommentNode.ts — single comment with reply button.
// A11Y: aria-label, role="article", thread depth data-attribute.

import { h, type ComponentType } from './react-stubs.js';
import type {
  CommentTreeNode,
  MentionHandle,
  Usuario,
} from '../../lib/engines/comments/index.ts';
import { htmlEscape, renderBodyWithMentions } from '../../lib/engines/comments/index.ts';

export interface CommentNodeProps {
  readonly node: CommentTreeNode;
  readonly autor: Usuario | null;
  readonly isHighlighted: boolean;
  readonly onReply: (commentId: string) => void;
  readonly mentionedAutorHandles: ReadonlyArray<MentionHandle>;
}

function timeAgo(iso: string, nowIso: string): string {
  const t = Date.parse(iso);
  const n = Date.parse(nowIso);
  if (Number.isNaN(t) || Number.isNaN(n)) return iso;
  const diff = Math.max(0, n - t);
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'agora';
  if (mins < 60) return mins + 'min';
  const hours = Math.floor(mins / 60);
  if (hours < 24) return hours + 'h';
  const days = Math.floor(hours / 24);
  return days + 'd';
}

export const CommentNode: ComponentType<CommentNodeProps> = (props) => {
  const { node, autor, isHighlighted, onReply, mentionedAutorHandles } = props;
  const emoji = autor ? autor.tradicaoPrincipal : 'cigano';
  const handle = autor ? '@' + autor.handle : '@anonimo';
  const nome = autor ? autor.nome : 'Usuário removido';
  const bio = autor ? autor.bio : '';
  const depthClass = 'comment-node--depth-' + node.depth;
  const highlightedClass = isHighlighted ? ' comment-node--highlighted' : '';
  // Render corpo with mention bolding (only known handles bold).
  const knownHandles: ReadonlyArray<MentionHandle> = autor
    ? [autor.handle, ...mentionedAutorHandles.map((h) => h as MentionHandle)]
    : [];
  const html = renderBodyWithMentions(node.corpo, knownHandles);
  const safeHtml = html; // already escaped by renderBodyWithMentions

  return h(
    'article',
    {
      className: 'comment-node ' + depthClass + highlightedClass,
      'data-comment-id': node.id,
      'data-depth': node.depth,
      'data-autor-id': node.autorId,
      role: 'article',
      'aria-label':
        'Comentário de ' + nome + ' · profundidade ' + node.depth,
      style: {
        marginLeft: node.depth === 0 ? '0' : '12px',
        paddingLeft: node.depth === 0 ? '0' : '12px',
        borderLeft:
          node.depth === 0
            ? 'none'
            : '2px solid #e2e2e2',
        marginBottom: '12px',
        padding: '10px 12px',
        background: isHighlighted ? '#fff8e1' : '#fafafa',
        borderRadius: '8px',
        minHeight: '44px',
      },
    },
    h(
      'header',
      { className: 'comment-node-header', style: { display: 'flex', alignItems: 'center', gap: '8px' } },
      h(
        'span',
        {
          className: 'comment-node-emoji',
          'aria-hidden': 'true',
          style: { fontSize: '18px' },
        },
        emoji === 'cigano'
          ? '🃏'
          : emoji === 'candomble'
          ? '🌿'
          : emoji === 'umbanda'
          ? '🕯️'
          : emoji === 'ifa'
          ? '📿'
          : emoji === 'cabala'
          ? '✡️'
          : emoji === 'astrologia'
          ? '♈'
          : emoji === 'tantra'
          ? '🕉️'
          : emoji === 'numerologia'
          ? '🔢'
          : emoji === 'tarot'
          ? '🃏'
          : '🃏',
      ),
      h(
        'strong',
        { className: 'comment-node-nome' },
        htmlEscape(nome),
      ),
      h(
        'span',
        { className: 'comment-node-handle', style: { color: '#666' } },
        htmlEscape(handle),
      ),
      h(
        'time',
        {
          className: 'comment-node-time',
          dateTime: node.createdAt,
          style: { color: '#999', fontSize: '12px', marginLeft: 'auto' },
        },
        timeAgo(node.createdAt, '2026-06-30T09:00:00.000Z'),
      ),
    ),
    bio
      ? h(
          'div',
          { className: 'comment-node-bio', style: { fontSize: '12px', color: '#888', marginBottom: '4px' } },
          htmlEscape(bio),
        )
      : null,
    // corpo rendered as raw HTML (already escaped + mention-bolded)
    h('div', {
      className: 'comment-node-body',
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML: { __html: safeHtml },
      style: { lineHeight: '1.5', marginTop: '4px' },
    }),
    h(
      'footer',
      { className: 'comment-node-footer', style: { marginTop: '8px' } },
      h(
        'button',
        {
          type: 'button',
          className: 'comment-node-reply',
          'aria-label': 'Responder a ' + nome,
          onClick: () => onReply(node.id),
          disabled: node.depth >= 3,
          style: {
            minHeight: '44px',
            minWidth: '44px',
            padding: '0 12px',
            border: 'none',
            background: 'transparent',
            color: node.depth >= 3 ? '#999' : '#1f4e79',
            cursor: node.depth >= 3 ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: 500,
          },
          title:
            node.depth >= 3
              ? 'Limite de profundidade (3) atingido — respostas viram nível 3'
              : 'Responder',
        },
        node.depth >= 3 ? '↳ Reply flatten' : '↳ Responder',
      ),
      node.mentionedHandles.length > 0
        ? h(
            'span',
            {
              className: 'comment-node-mentions',
              style: { marginLeft: '12px', color: '#888', fontSize: '12px' },
            },
            'mencionou: ' +
              node.mentionedHandles
                .map((m) => '@' + m)
                .join(', '),
          )
        : null,
    ),
  );
};