// ui/MinhasSessoesPage.tsx — my sessions
// Pure h() calls.

import { h, type ComponentType } from '../../react-stubs.js';
import type { Mentor, Sessao, Slot } from '../types.tsx';
import { SessaCard } from './SessaCard.tsx';

export interface MinhasSessoesPageProps {
  readonly items: ReadonlyArray<{
    readonly sessao: Sessao;
    readonly mentor: Mentor;
    readonly slot: Slot;
  }>;
  readonly onBack: () => void;
  readonly onCancel: (sessaoId: string) => void;
  readonly onVerNotas: (sessaoId: string) => void;
  readonly onBrowse: () => void;
}

function splitUpcomingPast(
  items: ReadonlyArray<{
    sessao: Sessao;
    mentor: Mentor;
    slot: Slot;
  }>
): {
  upcoming: Array<{ sessao: Sessao; mentor: Mentor; slot: Slot }>;
  past: Array<{ sessao: Sessao; mentor: Mentor; slot: Slot }>;
} {
  const now = new Date();
  const upcoming: Array<{ sessao: Sessao; mentor: Mentor; slot: Slot }> = [];
  const past: Array<{ sessao: Sessao; mentor: Mentor; slot: Slot }> = [];
  for (const it of items) {
    const isFuture = new Date(it.sessao.inicio) >= now;
    if (isFuture && it.sessao.status === 'agendada') {
      upcoming.push(it);
    } else {
      past.push(it);
    }
  }
  return { upcoming, past };
}

export const MinhasSessoesPage: ComponentType<MinhasSessoesPageProps> = (
  props
) => {
  const { items, onBack, onCancel, onVerNotas, onBrowse } = props;
  const { upcoming, past } = splitUpcomingPast(items);

  return h(
    'main',
    { className: 'minhas-sessoes-page', 'aria-label': 'Minhas sessoes' },
    h(
      'header',
      { className: 'minhas-sessoes-page__header' },
      h(
        'button',
        {
          type: 'button',
          className: 'minhas-sessoes-page__back',
          onClick: onBack,
          'aria-label': 'Voltar para lista de mentores',
        },
        '< Voltar'
      ),
      h('h1', { className: 'minhas-sessoes-page__title' }, 'Minhas Sessoes')
    ),
    h(
      'section',
      { className: 'minhas-sessoes-page__section' },
      h('h2', null, 'Proximas (' + upcoming.length + ')'),
      upcoming.length === 0
        ? h(
            'div',
            { className: 'minhas-sessoes-page__empty', role: 'status' },
            h('p', null, 'Nenhuma sessao agendada.'),
            h(
              'button',
              {
                type: 'button',
                className: 'minhas-sessoes-page__cta',
                onClick: onBrowse,
              },
              'Buscar mentor'
            )
          )
        : h(
            'ul',
            { className: 'minhas-sessoes-page__list' },
            ...upcoming.map((it) =>
              h(
                'li',
                { key: it.sessao.id },
                h(SessaCard, {
                  sessao: it.sessao,
                  mentor: it.mentor,
                  slot: it.slot,
                  onCancel,
                })
              )
            )
          )
    ),
    past.length > 0
      ? h(
          'section',
          { className: 'minhas-sessoes-page__section' },
          h('h2', null, 'Passadas (' + past.length + ')'),
          h(
            'ul',
            { className: 'minhas-sessoes-page__list' },
            ...past.map((it) =>
              h(
                'li',
                { key: it.sessao.id },
                h(SessaCard, {
                  sessao: it.sessao,
                  mentor: it.mentor,
                  slot: it.slot,
                  onVerNotas,
                })
              )
            )
          )
        )
      : null
  );
};
