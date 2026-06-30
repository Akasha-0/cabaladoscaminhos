// ui/SessaCard.tsx — session card (upcoming or past)
import { h, type ComponentType } from '../../react-stubs.js';
import type { Mentor, Sessao, Slot } from '../types.tsx';
import { TRADICAO_LABELS, TRADICAO_BADGE_COLORS } from '../constants.tsx';

export interface SessaCardProps {
  readonly sessao: Sessao;
  readonly mentor: Mentor;
  readonly slot: Slot;
  readonly onCancel?: (sessaoId: string) => void;
  readonly onVerNotas?: (sessaoId: string) => void;
}

function fmtFull(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const STATUS_LABEL: Record<Sessao['status'], string> = Object.freeze({
  agendada: 'Agendada',
  concluida: 'Concluida',
  cancelada: 'Cancelada',
  no_show: 'No-show',
});

const STATUS_CLASS: Record<Sessao['status'], string> = Object.freeze({
  agendada: 'sessao-card__status--agendada',
  concluida: 'sessao-card__status--concluida',
  cancelada: 'sessao-card__status--cancelada',
  no_show: 'sessao-card__status--no_show',
});

export const SessaCard: ComponentType<SessaCardProps> = (props) => {
  const { sessao, mentor, slot, onCancel, onVerNotas } = props;
  const badgeColor = TRADICAO_BADGE_COLORS[mentor.tradicaoPrincipal];
  const isUpcoming = sessao.status === 'agendada';
  const isPast = sessao.status === 'concluida' || sessao.status === 'no_show';
  const isCancelled = sessao.status === 'cancelada';

  return h(
    'article',
    {
      className: 'sessao-card',
      'data-sessao-id': sessao.id,
      'data-status': sessao.status,
    },
    h(
      'div',
      { className: 'sessao-card__head' },
      h(
        'span',
        {
          className: 'tradicao-badge tradicao-badge--small',
          style: { background: badgeColor, color: '#fff' },
        },
        TRADICAO_LABELS[mentor.tradicaoPrincipal]
      ),
      h(
        'span',
        {
          className:
            'sessao-card__status ' + STATUS_CLASS[sessao.status],
          'aria-label': 'Status: ' + STATUS_LABEL[sessao.status],
        },
        STATUS_LABEL[sessao.status]
      )
    ),
    h('h3', { className: 'sessao-card__mentor' }, mentor.nome),
    h(
      'div',
      { className: 'sessao-card__datetime' },
      h('span', { className: 'sessao-card__date' }, fmtFull(slot.inicio)),
      h('span', { className: 'sessao-card__dur' }, slot.duracaoMin + ' min')
    ),
    sessao.notas
      ? h(
          'div',
          { className: 'sessao-card__notes' },
          h('strong', null, 'Observacoes: '),
          h('span', null, sessao.notas)
        )
      : null,
    sessao.gravacaoUrl
      ? h(
          'div',
          { className: 'sessao-card__recording' },
          h(
            'a',
            {
              href: sessao.gravacaoUrl,
              target: '_blank',
              rel: 'noopener noreferrer',
            },
            'Ver gravacao'
          )
        )
      : null,
    isUpcoming
      ? h(
          'div',
          { className: 'sessao-card__actions' },
          h(
            'button',
            {
              type: 'button',
              className: 'sessao-card__btn sessao-card__btn--cancel',
              onClick: () => onCancel?.(sessao.id),
              'aria-label': 'Cancelar sessao com ' + mentor.nome,
            },
            'Cancelar'
          )
        )
      : null,
    isPast && onVerNotas
      ? h(
          'div',
          { className: 'sessao-card__actions' },
          h(
            'button',
            {
              type: 'button',
              className: 'sessao-card__btn',
              onClick: () => onVerNotas(sessao.id),
            },
            'Ver notas'
          )
        )
      : null,
    isCancelled
      ? h(
          'p',
          { className: 'sessao-card__cancelled-note' },
          'Sessao cancelada'
        )
      : null
  );
};
