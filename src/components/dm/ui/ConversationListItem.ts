// ui/ConversationListItem.ts — one row in the conversation list
// W83-A dm-messages-ui. Pure h() calls.

import { h, type ComponentType } from '../../react-stubs.js';
import type {
  Conversa,
  ConversaId,
  Tradicao,
  Usuario,
} from '../../../lib/engines/dm-ui/types.ts';

export interface ConversationListItemProps {
  readonly conversa: Conversa;
  readonly outro: Usuario;
  readonly isSelected: boolean;
  readonly isOnline: boolean;
  readonly onClick?: (conversaId: ConversaId) => void;
  readonly tradicaoBadgeColor?: string;
}

function relTime(iso: string): string {
  try {
    const d = new Date(iso);
    const now = new Date('2026-06-30T09:00:00.000Z');
    const diff = (now.getTime() - d.getTime()) / 1000;
    if (diff < 60) return 'agora';
    if (diff < 3600) return Math.floor(diff / 60) + 'min';
    if (diff < 86400) return Math.floor(diff / 3600) + 'h';
    return Math.floor(diff / 86400) + 'd';
  } catch {
    return iso;
  }
}

const TRADICAO_LABELS: Readonly<Record<Tradicao, string>> = Object.freeze({
  candomble: 'Candomble',
  umbanda: 'Umbanda',
  ifa: 'Ifa',
  cabala: 'Cabala',
  astrologia: 'Astrologia',
  tantra: 'Tantra',
  tarot: 'Tarot',
});

const TRADICAO_BADGE_COLORS: Readonly<Record<Tradicao, string>> = Object.freeze({
  candomble: '#C9A227',
  umbanda: '#0F8B5F',
  ifa: '#0E5E3F',
  cabala: '#6B2FA0',
  astrologia: '#3B2F8C',
  tantra: '#B0226F',
  tarot: '#1F4E79',
});

export const ConversationListItem: ComponentType<ConversationListItemProps> = (props) => {
  const { conversa, outro, isSelected, isOnline, onClick } = props;
  const unread = conversa.unreadCount;
  const badgeColor = props.tradicaoBadgeColor
    ?? (conversa.topicosTradicao[0]
      ? TRADICAO_BADGE_COLORS[conversa.topicosTradicao[0]]
      : '#888');

  const titleText = conversa.titulo ?? outro.nome;

  return h(
    'article',
    {
      className:
        'conversation-list-item' +
        (isSelected ? ' conversation-list-item--selected' : '') +
        (unread > 0 ? ' conversation-list-item--unread' : ''),
      'data-conversa-id': conversa.id,
      'data-tipo': conversa.tipo,
      'data-mutada': conversa.isMuted ? 'true' : 'false',
      'data-arquivada': conversa.isArchived ? 'true' : 'false',
      role: 'button',
      tabIndex: 0,
      'aria-label':
        'Conversa com ' +
        titleText +
        (unread > 0 ? ', ' + unread + ' mensagens nao lidas' : '') +
        (isOnline ? ', online' : ', offline'),
      onClick: () => onClick?.(conversa.id),
      onKeyDown: (e: { key: string; preventDefault?: () => void }) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault?.();
          onClick?.(conversa.id);
        }
      },
    },
    h(
      'div',
      {
        className: 'conversation-list-item__avatar',
        style: { background: badgeColor + '22' },
        'aria-hidden': 'true',
      },
      h('span', { className: 'conversation-list-item__avatar-initial' }, outro.avatarInicial),
      isOnline
        ? h('span', { className: 'conversation-list-item__online-dot', 'aria-hidden': 'true' })
        : null
    ),
    h(
      'div',
      { className: 'conversation-list-item__body' },
      h(
        'div',
        { className: 'conversation-list-item__title-row' },
        h('h3', { className: 'conversation-list-item__title' }, titleText),
        h(
          'span',
          { className: 'conversation-list-item__time' },
          relTime(conversa.ultimaMensagemEm)
        )
      ),
      h(
        'div',
        { className: 'conversation-list-item__preview' },
        conversa.ultimaMensagemPreview
      ),
      h(
        'div',
        { className: 'conversation-list-item__badges' },
        ...conversa.topicosTradicao.map((t: Tradicao) =>
          h(
            'span',
            {
              key: t,
              className: 'tradicao-badge tradicao-badge--small',
              style: { background: TRADICAO_BADGE_COLORS[t] },
              'data-tradicao': t,
            },
            TRADICAO_LABELS[t]
          )
        ),
        conversa.isMuted
          ? h(
              'span',
              { className: 'conversation-list-item__muted', 'aria-label': 'Silenciada' },
              '\u{1F507}'
            )
          : null,
        conversa.isArchived
          ? h(
              'span',
              { className: 'conversation-list-item__archived', 'aria-label': 'Arquivada' },
              '\u{1F4E6}'
            )
          : null,
        unread > 0
          ? h(
              'span',
              {
                className: 'conversation-list-item__unread-badge',
                'aria-label': unread + ' mensagens nao lidas',
              },
              unread > 99 ? '99+' : String(unread)
            )
          : null
      )
    )
  );
};