// ui/MessageComposer.ts — input with @mention autocomplete + quote-reply
// W83-A dm-messages-ui. Mobile-first bottom-sheet.
// Pure h() calls.

import { h, type ComponentType } from '../../react-stubs.js';
import type {
  ComposerDraft,
  QuoteReply,
  Usuario,
  UsuarioId,
} from '../../../lib/engines/dm-ui/types.ts';

export interface MessageComposerProps {
  readonly draft: ComposerDraft;
  readonly possibleMentions: ReadonlyArray<Usuario>;
  readonly stateName: 'idle' | 'composing' | 'sending' | 'awaiting-consent' | 'error';
  readonly errorMessage?: string | null;
  readonly onChangeText: (texto: string) => void;
  readonly onAcceptSuggestion: (usuarioId: UsuarioId, handle: string) => void;
  readonly onClearReply: () => void;
  readonly onSend: () => void;
  readonly consentPending?: boolean;
}

const MAX_LEN = 4000;

function getMentionAutocompleteState(texto: string, cursorPos: number): { query: string; startIdx: number } | null {
  // Look back from cursor for the most recent '@' that hasn't been closed yet.
  const upToCursor = texto.slice(0, cursorPos);
  const atIdx = upToCursor.lastIndexOf('@');
  if (atIdx < 0) return null;
  const after = upToCursor.slice(atIdx + 1);
  if (/\s/.test(after)) return null;
  // Also check no space before '@'
  if (atIdx > 0 && !/[\s]/.test(texto.charAt(atIdx - 1))) return null;
  return { query: after, startIdx: atIdx };
}

function filterSuggestions(
  usuarios: ReadonlyArray<Usuario>,
  query: string
): ReadonlyArray<Usuario> {
  if (!query) return usuarios.slice(0, 5);
  const q = query.toLowerCase();
  const out: Usuario[] = [];
  for (const u of usuarios) {
    if (u.handle.toLowerCase().includes(q) || u.nome.toLowerCase().includes(q)) {
      out.push(u);
    }
    if (out.length >= 5) break;
  }
  return Object.freeze(out);
}

export const MessageComposer: ComponentType<MessageComposerProps> = (props) => {
  const {
    draft,
    possibleMentions,
    stateName,
    errorMessage,
    onChangeText,
    onAcceptSuggestion,
    onClearReply,
    onSend,
    consentPending,
  } = props;

  const texto = draft.texto;
  const cursorPos = texto.length; // approximation
  const ac = getMentionAutocompleteState(texto, cursorPos);
  const suggestions = ac ? filterSuggestions(possibleMentions, ac.query) : [];

  const remaining = MAX_LEN - texto.length;
  const canSend = texto.trim().length > 0 && stateName !== 'sending' && stateName !== 'awaiting-consent' && !consentPending;
  const isError = stateName === 'error';
  const isSending = stateName === 'sending';

  return h(
    'section',
    {
      className: 'message-composer' + (isError ? ' message-composer--error' : ''),
      'aria-label': 'Compositor de mensagem',
      role: 'region',
    },
    isError && errorMessage
      ? h(
          'div',
          {
            className: 'message-composer__error',
            role: 'alert',
            'aria-live': 'assertive',
          },
          errorMessage
        )
      : null,
    draft.replyTo
      ? h(
          'div',
          {
            className: 'message-composer__reply',
            'aria-label': 'Respondendo a ' + draft.replyTo.autorNome,
          },
          h(
            'div',
            { className: 'message-composer__reply-content' },
            h('strong', { className: 'message-composer__reply-autor' }, draft.replyTo.autorNome),
            h(
              'span',
              { className: 'message-composer__reply-preview' },
              draft.replyTo.preview
            )
          ),
          h(
            'button',
            {
              type: 'button',
              className: 'message-composer__reply-cancel',
              onClick: onClearReply,
              'aria-label': 'Cancelar resposta',
            },
            'Cancelar'
          )
        )
      : null,
    suggestions.length > 0
      ? h(
          'ul',
          {
            className: 'message-composer__suggestions',
            role: 'listbox',
            'aria-label': 'Sugestoes de mencao',
          },
          ...suggestions.map((u) =>
            h(
              'li',
              { key: u.id, className: 'mention-suggestion', role: 'option' },
              h(
                'button',
                {
                  type: 'button',
                  className: 'mention-suggestion__btn',
                  onClick: () => onAcceptSuggestion(u.id, u.handle),
                  'aria-label': 'Mencionar ' + u.nome,
                },
                h('span', { className: 'mention-suggestion__handle' }, u.handle),
                h('span', { className: 'mention-suggestion__nome' }, u.nome)
              )
            )
          )
        )
      : null,
    h(
      'form',
      {
        className: 'message-composer__form',
        onSubmit: (e: { preventDefault?: () => void }) => {
          e?.preventDefault?.();
          if (canSend) onSend();
        },
        'aria-label': 'Enviar mensagem',
      },
      h(
        'div',
        { className: 'message-composer__input-row' },
        h(
          'label',
          { className: 'message-composer__label', htmlFor: 'dm-composer-input' },
          'Mensagem'
        ),
        h('textarea', {
          id: 'dm-composer-input',
          className: 'message-composer__input',
          value: texto,
          rows: 3,
          maxLength: MAX_LEN,
          placeholder: 'Digite uma mensagem. Use @ para mencionar.',
          'aria-label': 'Mensagem',
          'aria-describedby': 'dm-composer-counter',
          onInput: (e: { target: { value: string } }) => onChangeText(e.target.value),
          onKeyDown: (e: { key: string; shiftKey: boolean; preventDefault?: () => void }) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault?.();
              if (canSend) onSend();
            }
          },
          disabled: isSending,
        }),
        h(
          'div',
          {
            id: 'dm-composer-counter',
            className: 'message-composer__counter',
            'aria-live': 'polite',
          },
          remaining + ' caracteres restantes'
        )
      ),
      h(
        'div',
        { className: 'message-composer__actions' },
        h(
          'button',
          {
            type: 'submit',
            className: 'message-composer__send',
            disabled: !canSend,
            'aria-label': 'Enviar mensagem',
            'aria-busy': isSending,
          },
          isSending ? 'Enviando\u2026' : 'Enviar'
        )
      )
    )
  );
};