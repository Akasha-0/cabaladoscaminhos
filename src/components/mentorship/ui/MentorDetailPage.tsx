// ui/MentorDetailPage.tsx — single mentor + booking
// Pure h() calls. No JSX literals.

import { h, type ComponentType } from '../../react-stubs.js';
import type { BookingFormState } from './BookingForm.tsx';
import type { Mentor, Slot } from '../types.tsx';
import { TRADICAO_LABELS, TRADICAO_BADGE_COLORS, TRADICAO_DESCRICOES } from '../constants.tsx';
import { BookingForm } from './BookingForm.tsx';

export interface MentorDetailPageProps {
  readonly mentor: Mentor | null;
  readonly slots: ReadonlyArray<Slot>;
  readonly bookingState: BookingFormState;
  readonly onChangeBooking: (next: BookingFormState) => void;
  readonly onSubmitBooking: () => void;
  readonly submitting: boolean;
  readonly bookingError: string | null;
  readonly bookedSuccessfully: boolean;
  readonly onBack: () => void;
  readonly onOpenMinhasSessoes: () => void;
}

export const MentorDetailPage: ComponentType<MentorDetailPageProps> = (
  props
) => {
  const {
    mentor,
    slots,
    bookingState,
    onChangeBooking,
    onSubmitBooking,
    submitting,
    bookingError,
    bookedSuccessfully,
    onBack,
    onOpenMinhasSessoes,
  } = props;

  if (!mentor) {
    return h(
      'main',
      { className: 'mentor-detail-page mentor-detail-page--missing' },
      h(
        'header',
        null,
        h(
          'button',
          {
            type: 'button',
            className: 'mentor-detail-page__back',
            onClick: onBack,
            'aria-label': 'Voltar para lista de mentores',
          },
          '< Voltar'
        )
      ),
      h('p', { role: 'status' }, 'Mentor nao encontrado.')
    );
  }

  const badgeColor = TRADICAO_BADGE_COLORS[mentor.tradicaoPrincipal];

  return h(
    'main',
    { className: 'mentor-detail-page', 'aria-label': 'Perfil de ' + mentor.nome },
    h(
      'header',
      { className: 'mentor-detail-page__header' },
      h(
        'button',
        {
          type: 'button',
          className: 'mentor-detail-page__back',
          onClick: onBack,
          'aria-label': 'Voltar para lista de mentores',
        },
        '< Voltar'
      )
    ),
    h(
      'section',
      { className: 'mentor-detail-page__hero', style: { borderColor: badgeColor } },
      h(
        'div',
        { className: 'mentor-detail-page__avatar', 'aria-hidden': true, style: { background: badgeColor + '22' } },
        h('span', null, mentor.nome.charAt(0))
      ),
      h(
        'div',
        { className: 'mentor-detail-page__head' },
        h('h1', { className: 'mentor-detail-page__name' }, mentor.nome),
        h(
          'span',
          {
            className: 'tradicao-badge',
            style: { background: badgeColor, color: '#fff' },
          },
          TRADICAO_LABELS[mentor.tradicaoPrincipal]
        ),
        h(
          'p',
          { className: 'mentor-detail-page__descricao' },
          TRADICAO_DESCRICOES[mentor.tradicaoPrincipal]
        )
      )
    ),
    h(
      'section',
      { className: 'mentor-detail-page__bio' },
      h('h2', null, 'Sobre'),
      h('p', null, mentor.bio),
      h(
        'dl',
        { className: 'mentor-detail-page__stats' },
        h('dt', null, 'Avaliacao'),
        h('dd', null, mentor.rating.toFixed(1) + ' / 5.0'),
        h('dt', null, 'Sessoes completas'),
        h('dd', null, mentor.sessoesCompletas.toString()),
        h('dt', null, 'Cidade'),
        h('dd', null, mentor.cidade ?? 'Nao informada'),
        h('dt', null, 'Atende online'),
        h('dd', null, mentor.atendeOnline ? 'Sim' : 'Nao'),
        h('dt', null, 'Idiomas'),
        h('dd', null, mentor.linguas.join(', '))
      )
    ),
    h(
      'section',
      { className: 'mentor-detail-page__specialties' },
      h('h2', null, 'Especialidades'),
      h(
        'ul',
        { className: 'mentor-detail-page__specialty-list' },
        ...mentor.specialties.map((s) =>
          h('li', { key: s, className: 'specialty-chip' }, s)
        )
      )
    ),
    h(
      'section',
      { className: 'mentor-detail-page__booking' },
      h('h2', null, 'Agendar sessao'),
      bookedSuccessfully
        ? h(
            'div',
            {
              className: 'mentor-detail-page__success',
              role: 'status',
            },
            h('strong', null, 'Sessao agendada!'),
            h('p', null, 'Voce recebera a confirmacao em breve.'),
            h(
              'button',
              {
                type: 'button',
                className: 'mentor-detail-page__cta',
                onClick: onOpenMinhasSessoes,
              },
              'Ver minhas sessoes'
            )
          )
        : h(BookingForm, {
            slots,
            state: bookingState,
            onChange: onChangeBooking,
            onSubmit: onSubmitBooking,
            submitting,
            errorMessage: bookingError,
            precoBRL: mentor.precoBRL,
          })
    )
  );
};
