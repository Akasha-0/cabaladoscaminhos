// ui/MentorCard.tsx — presentational card for a mentor
// Pure h() calls. No JSX literals.

import { h, type ComponentType } from '../../react-stubs.js';
import type { Mentor } from '../types.tsx';
import { TRADICAO_LABELS, TRADICAO_BADGE_COLORS } from '../constants.tsx';

export interface MentorCardProps {
  readonly mentor: Mentor;
  readonly onClick?: (id: string) => void;
  readonly selected?: boolean;
}

function stars(rating: number): string {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  return (
    '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(5 - full - (half ? 1 : 0))
  );
}

export const MentorCard: ComponentType<MentorCardProps> = (props) => {
  const { mentor, onClick, selected } = props;
  const badgeColor = TRADICAO_BADGE_COLORS[mentor.tradicaoPrincipal];

  return h(
    'article',
    {
      className: 'mentor-card' + (selected ? ' mentor-card--selected' : ''),
      'data-mentor-id': mentor.id,
      'data-tradicao': mentor.tradicaoPrincipal,
      onClick: () => onClick?.(mentor.id),
      onKeyDown: (e: { key: string }) => {
        if (e.key === 'Enter' || e.key === ' ') onClick?.(mentor.id);
      },
      tabIndex: 0,
      role: 'button',
      'aria-label': 'Mentor ' + mentor.nome + ', ' + mentor.tradicaoPrincipal,
    },
    h(
      'div',
      { className: 'mentor-avatar', 'aria-label': 'Avatar de ' + mentor.nome, style: { background: badgeColor + '22' } },
      h('span', { className: 'mentor-avatar-initial' }, mentor.nome.charAt(0))
    ),
    h(
      'div',
      { className: 'mentor-body' },
      h('h3', { className: 'mentor-name' }, mentor.nome),
      h(
        'span',
        {
          className: 'tradicao-badge',
          'data-tradicao': mentor.tradicaoPrincipal,
          style: { background: badgeColor, color: '#fff' },
        },
        TRADICAO_LABELS[mentor.tradicaoPrincipal]
      ),
      h(
        'div',
        { className: 'mentor-rating', 'aria-label': 'Avaliacao ' + mentor.rating },
        h('span', { className: 'mentor-stars' }, stars(mentor.rating)),
        h('span', { className: 'mentor-rating-num' }, mentor.rating.toFixed(1))
      ),
      h(
        'div',
        { className: 'mentor-specialties' },
        ...mentor.specialties.map((s) =>
          h('span', { className: 'specialty-chip', key: s }, s)
        )
      ),
      h(
        'div',
        { className: 'mentor-footer' },
        h(
          'span',
          { className: 'mentor-preco' },
          'R$ ' + mentor.precoBRL.toFixed(0) + ' / sessao'
        ),
        h(
          'span',
          { className: 'mentor-sessoes' },
          mentor.sessoesCompletas + ' sessoes'
        )
      )
    )
  );
};
