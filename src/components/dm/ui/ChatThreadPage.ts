// ui/ChatThreadPage.ts — single conversation view
// W83-A dm-messages-ui. Pure h() calls.

import { h, type ComponentType } from '../../react-stubs.js';
import type {
  Conversa,
  ConversaId,
  Mensagem,
  MensagemId,
  Tradicao,
  Usuario,
  UsuarioId,
} from '../../../lib/engines/dm-ui/types.ts';
import type { ChatState } from '../../../lib/engines/dm-ui/chatReducer.ts';
import {
  MessageBubble,
  type MessageBubbleProps,
} from './MessageBubble.ts';
import { MessageComposer } from './MessageComposer.ts';

export interface ChatThreadPageProps {
  readonly conversa: Conversa;
  readonly mensagens: ReadonlyArray<Mensagem>;
  readonly currentUserId: UsuarioId;
  readonly outros: ReadonlyArray<Usuario>;
  readonly autoresByMensagemId: Readonly<Record<UsuarioId, Usuario>>;
  readonly state: ChatState;
  readonly errorMessage: string | null;
  readonly onChangeDraft: (texto: string) => void;
  readonly onAcceptMentionSuggestion: (usuarioId: UsuarioId, handle: string) => void;
  readonly onClearReply: () => void;
  readonly onReplyTo: (mensagemId: MensagemId) => void;
  readonly onSend: () => void;
  readonly onBack: () => void;
  readonly onToggleMute: () => void;
  readonly onArchive: () => void;
  readonly consentOpen: boolean;
  readonly onAcceptConsent: (scopes: ReadonlyArray<'message_read' | 'message_send' | 'presence'>) => void;
  readonly onDeclineConsent: () => void;
}

const TRADICAO_BADGE_COLORS: Readonly<Record<Tradicao, string>> = Object.freeze({
  candomble: '#C9A227',
  umbanda: '#0F8B5F',
  ifa: '#0E5E3F',
  cabala: '#6B2FA0',
  astrologia: '#3B2F8C',
  tantra: '#B0226F',
  tarot: '#1F4E79',
});

const TRADICAO_LABELS: Readonly<Record<Tradicao, string>> = Object.freeze({
  candomble: 'Candomble',
  umbanda: 'Umbanda',
  ifa: 'Ifa',
  cabala: 'Cabala',
  astrologia: 'Astrologia',
  tantra: 'Tantra',
  tarot: 'Tarot',
});

function headerTitle(conversa: Conversa, outros: ReadonlyArray<Usuario>): string {
  if (conversa.titulo) return conversa.titulo;
  return outros.map((u) => u.nome).join(', ');
}

function findReplyTo(
  mensagem: Mensagem,
  mensagensAll: ReadonlyArray<Mensagem>,
  autoresById: Readonly<Record<MensagemId, Usuario>>
): { id: MensagemId; autorNome: string; preview: string } | null {
  if (!mensagem.replyToId) return null;
  const target = mensagensAll.find((m) => m.id === mensagem.replyToId);
  if (!target) return null;
  const autor = autoresById[target.id];
  return {
    id: target.id,
    autorNome: autor ? autor.nome : 'alguem',
    preview: target.conteudo.slice(0, 60),
  };
}

export const ChatThreadPage: ComponentType<ChatThreadPageProps> = (props) => {
  const {
    conversa,
    mensagens,
    currentUserId,
    outros,
    autoresByMensagemId,
    state,
    errorMessage,
    onChangeDraft,
    onAcceptMentionSuggestion,
    onClearReply,
    onReplyTo,
    onSend,
    onBack,
    onToggleMute,
    onArchive,
    consentOpen,
    onAcceptConsent,
    onDeclineConsent,
  } = props;

  const titleText = headerTitle(conversa, outros);

  return h(
    'main',
    {
      className: 'chat-thread-page',
      'aria-label': 'Conversa com ' + titleText,
    },
    h(
      'header',
      { className: 'chat-thread-page__header' },
      h(
        'button',
        {
          type: 'button',
          className: 'chat-thread-page__back',
          onClick: onBack,
          'aria-label': 'Voltar para lista de conversas',
        },
        '\u2190 Voltar'
      ),
      h(
        'div',
        { className: 'chat-thread-page__title-block' },
        h('h1', { className: 'chat-thread-page__title' }, titleText),
        h(
          'div',
          { className: 'chat-thread-page__topics' },
          ...conversa.topicosTradicao.map((t: Tradicao) =>
            h(
              'span',
              {
                key: t,
                className: 'tradicao-badge',
                style: { background: TRADICAO_BADGE_COLORS[t] },
                'data-tradicao': t,
              },
              TRADICAO_LABELS[t]
            )
          )
        )
      ),
      h(
        'div',
        { className: 'chat-thread-page__actions' },
        h(
          'button',
          {
            type: 'button',
            className: 'chat-thread-page__mute',
            onClick: onToggleMute,
            'aria-pressed': conversa.isMuted,
            'aria-label': conversa.isMuted ? 'Reativar som' : 'Silenciar conversa',
          },
          conversa.isMuted ? 'Reativar som' : 'Silenciar'
        ),
        h(
          'button',
          {
            type: 'button',
            className: 'chat-thread-page__archive',
            onClick: onArchive,
            'aria-label': conversa.isArchived ? 'Desarquivar' : 'Arquivar',
          },
          conversa.isArchived ? 'Desarquivar' : 'Arquivar'
        )
      )
    ),
    h(
      'section',
      {
        className: 'chat-thread-page__messages',
        role: 'log',
        'aria-live': 'polite',
        'aria-label': 'Mensagens da conversa',
      },
      mensagens.length === 0
        ? h(
            'div',
            { className: 'chat-thread-page__empty', role: 'status' },
            'Sem mensagens ainda. Comece a conversa abaixo.'
          )
        : h(
            'ul',
            { className: 'chat-thread-page__message-list', role: 'list' },
            ...mensagens.map((m: Mensagem) => {
              const autor = autoresByMensagemId[m.remetenteId];
              if (!autor) return null;
              const reply = findReplyTo(m, mensagens, autoresByMensagemId);
              const tradBadgeColor = autor.tradicaoPrincipal
                ? TRADICAO_BADGE_COLORS[autor.tradicaoPrincipal]
                : undefined;
              const bubbleProps: MessageBubbleProps = {
                mensagem: m,
                autor,
                isMinha: m.remetenteId === currentUserId,
                replyTo: reply,
                onReply: onReplyTo,
                tradicaoBadgeColor: tradBadgeColor,
              };
              return h(
                'li',
                {
                  key: m.id,
                  className: 'chat-thread-page__message-item',
                  role: 'listitem',
                },
                h(MessageBubble, bubbleProps)
              );
            })
          )
    ),
    h(MessageComposer, {
      draft: state.draft,
      possibleMentions: outros,
      stateName: state.name,
      errorMessage,
      onChangeText: onChangeDraft,
      onAcceptSuggestion: onAcceptMentionSuggestion,
      onClearReply,
      onSend,
      consentPending: state.name === 'awaiting-consent',
    }),
    consentOpen
      ? h(
          'aside',
          { className: 'chat-thread-page__consent-overlay' },
          h(
            'div',
            { className: 'consent-wrapper' },
            h(
              'button',
              {
                type: 'button',
                className: 'consent-fallback-decline',
                onClick: onDeclineConsent,
                'aria-label': 'Recusar consentimento',
              },
              'Recusar'
            ),
            h(
              'button',
              {
                type: 'button',
                className: 'consent-fallback-accept',
                onClick: () => onAcceptConsent(['message_send', 'message_read', 'presence']),
                'aria-label': 'Aceitar consentimento',
              },
              'Aceitar'
            )
          )
        )
      : null
  );
};