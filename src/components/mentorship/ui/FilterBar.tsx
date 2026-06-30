// ui/FilterBar.tsx — tradição multi-select + specialty chip filter
// Pure presentational. No state.

import { h, type ComponentType } from '../../react-stubs.js';
import type { FiltroMentor, Tradicao } from '../types.tsx';
import { TRADICOES } from '../types.tsx';
import { TRADICAO_LABELS, ALL_SPECIALTIES } from '../constants.tsx';

export interface FilterBarProps {
  readonly filtro: FiltroMentor;
  readonly onChange: (next: FiltroMentor) => void;
  readonly totalResultados: number;
}

function toggle<T>(arr: ReadonlyArray<T>, v: T): ReadonlyArray<T> {
  return arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];
}

export const FilterBar: ComponentType<FilterBarProps> = (props) => {
  const { filtro, onChange, totalResultados } = props;

  return h(
    'section',
    { className: 'filter-bar', 'aria-label': 'Filtros de mentores' },
    h(
      'div',
      { className: 'filter-bar__count', 'aria-live': 'polite' },
      totalResultados + ' mentores disponiveis'
    ),
    h(
      'div',
      { className: 'filter-bar__group' },
      h('label', { className: 'filter-bar__label' }, 'Tradicao'),
      h(
        'div',
        { className: 'filter-bar__tradicoes', role: 'group' },
        ...TRADICOES.map((t: Tradicao) => {
          const active = filtro.tradicoes.includes(t);
          return h(
            'button',
            {
              type: 'button',
              key: t,
              className:
                'filter-pill' + (active ? ' filter-pill--active' : ''),
              'aria-pressed': active,
              'data-tradicao': t,
              onClick: () =>
                onChange({ ...filtro, tradicoes: toggle(filtro.tradicoes, t) }),
            },
            TRADICAO_LABELS[t]
          );
        })
      )
    ),
    h(
      'div',
      { className: 'filter-bar__group' },
      h('label', { className: 'filter-bar__label' }, 'Especialidades'),
      h(
        'div',
        { className: 'filter-bar__specialties' },
        ...ALL_SPECIALTIES.map((s) => {
          const active = filtro.specialties.includes(s);
          return h(
            'button',
            {
              type: 'button',
              key: s,
              className:
                'specialty-chip specialty-chip--filter' +
                (active ? ' specialty-chip--active' : ''),
              'aria-pressed': active,
              onClick: () =>
                onChange({ ...filtro, specialties: toggle(filtro.specialties, s) }),
            },
            s
          );
        })
      )
    ),
    h(
      'div',
      { className: 'filter-bar__group' },
      h('label', { className: 'filter-bar__label', for: 'mentor-busca' }, 'Buscar'),
      h('input', {
        type: 'search',
        id: 'mentor-busca',
        className: 'filter-bar__search',
        placeholder: 'Nome, especialidade ou bio...',
        value: filtro.busca ?? '',
        onInput: (e: { target: { value: string } }) =>
          onChange({ ...filtro, busca: e.target.value }),
        'aria-label': 'Buscar mentor',
      })
    ),
    h(
      'div',
      { className: 'filter-bar__group' },
      h(
        'label',
        { className: 'filter-bar__toggle' },
        h('input', {
          type: 'checkbox',
          checked: filtro.apenasOnline,
          onChange: (e: { target: { checked: boolean } }) =>
            onChange({ ...filtro, apenasOnline: e.target.checked }),
        }),
        h('span', null, 'Apenas atendimento online')
      )
    )
  );
};
