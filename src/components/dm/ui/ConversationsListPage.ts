// ui/ConversationsListPage.ts — top-level page
// W83-A dm-messages-ui. Pure h() calls.

import { h, type ComponentType } from '../../react-stubs.js';
import type {
  Conversa,
  ConversaId,
  Usuario,
  UsuarioId,
} from '../../../lib/engines/dm-ui/types.ts';
import {
  ConversationListItem,
  type ConversationListItemProps,
} from './ConversationListItem.ts';

export interface ConversationsListPageProps {
  readonly conversas: ReadonlyArray<Conversa>;
  readonly outrosByConversa: Readonly<Record<ConversaId, ReadonlyArray<Usuario>>>;
  readonly onlineUsers: ReadonlyArray<UsuarioId>;
  readonly selectedConversaId: ConversaId | null;
  readonly unreadTotal: number;
  readonly searchQuery: string;
  readonly incluirArquivadas: boolean;
  readonly onSelectConversa: (id: ConversaId) => void;
  readonly onChangeSearchQuery: (q: string) => void;
  readonly onToggleArquivadas: () => void;
  readonly currentUserNome: string;
}

function isOnline(onlineUsers: ReadonlyArray<UsuarioId>, id: UsuarioId): boolean {
  return onlineUsers.some((u) => u === id);
}

export const ConversationsListPage: ComponentType<ConversationsListPageProps> = (props) => {
  const {
    conversas,
    outrosByConversa,
    onlineUsers,
    selectedConversaId,
    unreadTotal,
    searchQuery,
    incluirArquivadas,
    onSelectConversa,
    onChangeSearchQuery,
    onToggleArquivadas,
    currentUserNome,
  } = props;

  return h(
    'main',
    {
      className: 'conversations-list-page',
      'aria-label': 'Lista de conversas',
    },
    h(
      'header',
      { className: 'conversations-list-page__header' },
      h(
        'h1',
        { className: 'conversations-list-page__title' },
        'Mensagens'
      ),
      h(
        'p',
        { className: 'conversations-list-page__subtitle' },
        'Ola, ' + currentUserNome + '. Voce tem ' + unreadTotal + ' mensagens nao lidas.'
      )
    ),
    h(
      'div',
      { className: 'conversations-list-page__toolbar' },
      h('input', {
        type: 'search',
        className: 'conversations-list-page__search',
        placeholder: 'Buscar conversas ou topicos...',
        value: searchQuery,
        'aria-label': 'Buscar conversas',
        onInput: (e: { target: { value: string } }) => onChangeSearchQuery(e.target.value),
      }),
      h(
        'button',
        {
          type: 'button',
          className: 'conversations-list-page__archive-toggle',
          onClick: onToggleArquivadas,
          'aria-pressed': incluirArquivadas,
          'aria-label': incluirArquivadas
            ? 'Ocultar conversas arquivadas'
            : 'Mostrar conversas arquivadas',
        },
        incluirArquivadas ? 'Ocultar arquivadas' : 'Mostrar arquivadas'
      )
    ),
    conversas.length === 0
      ? h(
          'div',
          { className: 'conversations-list-page__empty', role: 'status' },
          'Nenhuma conversa encontrada.'
        )
      : h(
          'ul',
          {
            className: 'conversations-list-page__list',
            role: 'list',
            'aria-label': 'Conversas',
          },
          ...conversas.map((c: Conversa) => {
            const outros = outrosByConversa[c.id] ?? [];
            const outro = outros[0] ?? null;
            if (!outro) return null;
            const itemProps: ConversationListItemProps = {
              conversa: c,
              outro,
              isSelected: selectedConversaId === c.id,
              isOnline: isOnline(onlineUsers, outro.id),
              onClick: onSelectConversa,
            };
            return h(
              'li',
              { key: c.id, className: 'conversations-list-page__list-item', role: 'listitem' },
              h(ConversationListItem, itemProps)
            );
          })
        )
  );
};