// ui/ConsentGate.ts — LGPD consent modal
// W83-A dm-messages-ui. Must accept before composing messages.
// Pure h() calls. No JSX literals.

import { h, type ComponentType } from '../../react-stubs.js';

export interface ConsentGateProps {
  readonly open: boolean;
  readonly pendingConteudo: string;
  readonly onAccept: (scopes: ReadonlyArray<'message_read' | 'message_send' | 'presence'>) => void;
  readonly onDecline: () => void;
  readonly title?: string;
  readonly versao?: string;
}

const DEFAULT_TITLE = 'Consentimento LGPD necessario';
const DEFAULT_VERSAO = 'lgpd-2026-v1';

const SCOPE_LABELS: Readonly<Record<'message_read' | 'message_send' | 'presence', string>> = Object.freeze({
  message_read: 'Leitura das suas mensagens',
  message_send: 'Envio de mensagens nesta conversa',
  presence: 'Compartilhar presenca (online/away)',
});

export const ConsentGate: ComponentType<ConsentGateProps> = (props) => {
  const { open, pendingConteudo, onAccept, onDecline } = props;
  const title = props.title ?? DEFAULT_TITLE;
  const versao = props.versao ?? DEFAULT_VERSAO;

  if (!open) return null;

  const preview = pendingConteudo.length > 60
    ? pendingConteudo.slice(0, 59) + '\u2026'
    : pendingConteudo;

  return h(
    'div',
    {
      className: 'consent-gate',
      role: 'dialog',
      'aria-modal': 'true',
      'aria-labelledby': 'consent-gate-title',
      'aria-describedby': 'consent-gate-desc',
      'data-versao': versao,
    },
    h(
      'div',
      { className: 'consent-gate__backdrop', onClick: onDecline, 'aria-hidden': 'true' },
      ''
    ),
    h(
      'section',
      { className: 'consent-gate__panel' },
      h('h2', { id: 'consent-gate-title', className: 'consent-gate__title' }, title),
      h(
        'p',
        { id: 'consent-gate-desc', className: 'consent-gate__intro' },
        'Antes de enviar a mensagem abaixo, confirme os tratamentos de dados necessarios.'
      ),
      h(
        'blockquote',
        { className: 'consent-gate__preview', 'aria-label': 'Mensagem pendente' },
        preview.length > 0 ? preview : '(mensagem vazia)'
      ),
      h(
        'ul',
        { className: 'consent-gate__scopes', 'aria-label': 'Escopos do consentimento' },
        h(
          'li',
          { className: 'consent-gate__scope' },
          h('strong', null, SCOPE_LABELS.message_send),
          h('span', null, ' — obrigatorio para envio.')
        ),
        h(
          'li',
          { className: 'consent-gate__scope' },
          h('strong', null, SCOPE_LABELS.message_read),
          h('span', null, ' — para confirmar a entrega ao destinatario.')
        ),
        h(
          'li',
          { className: 'consent-gate__scope' },
          h('strong', null, SCOPE_LABELS.presence),
          h('span', null, ' — opcional. Avise se esta online.')
        )
      ),
      h(
        'div',
        { className: 'consent-gate__footer' },
        h(
          'button',
          {
            type: 'button',
            className: 'consent-gate__decline',
            onClick: onDecline,
            'aria-label': 'Recusar consentimento',
          },
          'Recusar'
        ),
        h(
          'button',
          {
            type: 'button',
            className: 'consent-gate__accept',
            onClick: () => onAccept(['message_send', 'message_read', 'presence']),
            'aria-label': 'Aceitar consentimento e enviar mensagem',
          },
          'Aceitar e enviar'
        )
      )
    )
  );
};