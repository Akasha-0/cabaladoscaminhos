// ui/MessageBubble.ts — single chat message
// W83-A dm-messages-ui. Pure h() calls.

import { h, type ComponentType } from '../../react-stubs.js';
import type {
  ConversaId,
  Mensagem,
  MensagemId,
  SacredHit,
  StatusMensagem,
  Usuario,
} from '../../../lib/engines/dm-ui/types.ts';

export interface MessageBubbleProps {
  readonly mensagem: Mensagem;
  readonly autor: Usuario;
  readonly isMinha: boolean;
  readonly replyTo: { id: MensagemId; autorNome: string; preview: string } | null;
  readonly onReply?: (mensagemId: MensagemId) => void;
  readonly onMentionClick?: (handle: string) => void;
  readonly tradicaoBadgeColor?: string;
}

const STATUS_ICON: Readonly<Record<StatusMensagem, string>> = Object.freeze({
  sent: '\u2713',
  delivered: '\u2713\u2713',
  read: '\u2713\u2713',
});

function formatTime(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return iso;
  }
}

export const MessageBubble: ComponentType<MessageBubbleProps> = (props) => {
  const { mensagem, autor, isMinha, replyTo, onReply, onMentionClick } = props;

  // Render mentions as <span class="mention">@handle</span> by splitting text.
  const segments: Array<{ kind: 'text' | 'mention'; value: string }> = [];
  const mentionRegex = /@[\w-]+/g;
  let lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = mentionRegex.exec(mensagem.conteudo)) !== null) {
    if (m.index > lastIndex) {
      segments.push({ kind: 'text', value: mensagem.conteudo.slice(lastIndex, m.index) });
    }
    segments.push({ kind: 'mention', value: m[0] });
    lastIndex = m.index + m[0].length;
  }
  if (lastIndex < mensagem.conteudo.length) {
    segments.push({ kind: 'text', value: mensagem.conteudo.slice(lastIndex) });
  }

  return h(
    'article',
    {
      className: 'message-bubble' + (isMinha ? ' message-bubble--mine' : ' message-bubble--other'),
      'data-mensagem-id': mensagem.id,
      'data-conversa-id': mensagem.conversaId,
      'data-status': mensagem.status,
      'aria-label': 'Mensagem de ' + autor.nome + ' as ' + formatTime(mensagem.createdAt),
    },
    h(
      'div',
      { className: 'message-bubble__avatar', 'aria-hidden': 'true', style: { background: props.tradicaoBadgeColor ? props.tradicaoBadgeColor + '22' : '#8882' } },
      h('span', { className: 'message-bubble__avatar-initial' }, autor.avatarInicial)
    ),
    h(
      'div',
      { className: 'message-bubble__body' },
      h(
        'div',
        { className: 'message-bubble__header' },
        h('span', { className: 'message-bubble__autor' }, autor.nome),
        h('time', { className: 'message-bubble__time', dateTime: mensagem.createdAt }, formatTime(mensagem.createdAt))
      ),
      replyTo
        ? h(
            'div',
            { className: 'message-bubble__reply-to', 'aria-label': 'Respondendo a ' + replyTo.autorNome },
            h('span', { className: 'message-bubble__reply-autor' }, replyTo.autorNome),
            h('span', { className: 'message-bubble__reply-preview' }, replyTo.preview)
          )
        : null,
      h(
        'div',
        { className: 'message-bubble__conteudo' },
        ...segments.map((seg, i) =>
          seg.kind === 'mention'
            ? h(
                'button',
                {
                  type: 'button',
                  key: 'seg-' + i,
                  className: 'mention',
                  onClick: () => onMentionClick?.(seg.value),
                  'aria-label': 'Mencionar ' + seg.value,
                },
                seg.value
              )
            : h('span', { key: 'seg-' + i }, seg.value)
        )
      ),
      mensagem.sacredHits.length > 0
        ? h(
            'ul',
            { className: 'message-bubble__sacred-hits', 'aria-label': 'Termos sagrados detectados' },
            ...mensagem.sacredHits.map((hit: SacredHit, i: number) =>
              h(
                'li',
                { key: 'hit-' + i, className: 'sacred-hit', 'data-slug': hit.slug, 'data-tradicao': hit.tradicao },
                hit.term + ' (' + hit.tradicao + ')'
              )
            )
          )
        : null,
      h(
        'div',
        { className: 'message-bubble__footer' },
        isMinha
          ? h(
              'span',
              { className: 'message-bubble__status', 'aria-label': 'Status: ' + mensagem.status },
              STATUS_ICON[mensagem.status]
            )
          : null,
        onReply
          ? h(
              'button',
              {
                type: 'button',
                className: 'message-bubble__reply',
                onClick: () => onReply(mensagem.id),
                'aria-label': 'Responder mensagem de ' + autor.nome,
              },
              'Responder'
            )
          : null
      )
    )
  );
};