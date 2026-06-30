// ui/MentorListPage.tsx — browse mentors page
// Pure h() calls. No JSX literals.

import { h, type ComponentType } from '../../react-stubs.js';
import type { FiltroMentor, Mentor } from '../types.tsx';
import { MentorCard } from './MentorCard.tsx';
import { FilterBar } from './FilterBar.tsx';

export interface MentorListPageProps {
  readonly mentores: ReadonlyArray<Mentor>;
  readonly filtro: FiltroMentor;
  readonly onChangeFiltro: (next: FiltroMentor) => void;
  readonly onSelectMentor: (id: string) => void;
  readonly onOpenMinhasSessoes: () => void;
}

const EMPTY_FILTRO: FiltroMentor = Object.freeze({
  tradicoes: [],
  specialties: [],
  apenasOnline: false,
});

export const MentorListPage: ComponentType<MentorListPageProps> = (props) => {
  const {
    mentores,
    filtro,
    onChangeFiltro,
    onSelectMentor,
    onOpenMinhasSessoes,
  } = props;

  return h(
    'main',
    {
      className: 'mentor-list-page',
      'aria-label': 'Pagina de mentores',
    },
    h(
      'header',
      { className: 'mentor-list-page__header' },
      h('h1', { className: 'mentor-list-page__title' }, 'Mentores Espirituais'),
      h(
        'p',
        { className: 'mentor-list-page__subtitle' },
        'Encontre um mentor para sua jornada. 7 tradicoes disponiveis.'
      ),
      h(
        'nav',
        { className: 'mentor-list-page__nav', 'aria-label': 'Navegacao secundaria' },
        h(
          'button',
          {
            type: 'button',
            className: 'mentor-list-page__nav-btn',
            onClick: onOpenMinhasSessoes,
            'aria-label': 'Ver minhas sessoes agendadas',
          },
          'Minhas Sessoes'
        )
      )
    ),
    h(FilterBar, {
      filtro: filtro,
      onChange: onChangeFiltro,
      totalResultados: mentores.length,
    }),
    mentores.length === 0
      ? h(
          'div',
          { className: 'mentor-list-page__empty', role: 'status' },
          h('h2', null, 'Nenhum mentor encontrado'),
          h(
            'p',
            null,
            'Tente ajustar os filtros. Voce pode limpar todos os filtros abaixo.'
          ),
          h(
            'button',
            {
              type: 'button',
              className: 'mentor-list-page__clear',
              onClick: () => onChangeFiltro(EMPTY_FILTRO),
            },
            'Limpar filtros'
          )
        )
      : h(
          'ul',
          { className: 'mentor-list', 'aria-label': 'Lista de mentores' },
          ...mentores.map((m) =>
            h(
              'li',
              { key: m.id, className: 'mentor-list__item' },
              h(MentorCard, { mentor: m, onClick: onSelectMentor })
            )
          )
        )
  );
};
