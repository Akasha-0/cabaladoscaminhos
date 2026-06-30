// ui/BookingForm.tsx — date + slot picker + notes
// Pure presentational + light state for slot selection.

import { h, type ComponentType } from '../../react-stubs.js';
import type { Slot } from '../types.tsx';

export interface BookingFormState {
  readonly slotId: string | null;
  readonly notas: string;
}

export interface BookingFormProps {
  readonly slots: ReadonlyArray<Slot>;
  readonly state: BookingFormState;
  readonly onChange: (next: BookingFormState) => void;
  readonly onSubmit: () => void;
  readonly submitting: boolean;
  readonly errorMessage: string | null;
  readonly precoBRL: number;
}

function fmtDate(iso: string): string {
  const d = new Date(iso);
  const dd = d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    weekday: 'short',
  });
  const hh = d.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
  return dd + ' as ' + hh;
}

function groupByDay(slots: ReadonlyArray<Slot>): ReadonlyArray<{
  dia: string;
  slots: ReadonlyArray<Slot>;
}> {
  const groups = new Map<string, Slot[]>();
  for (const s of slots) {
    const d = new Date(s.inicio);
    const key = d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(s);
  }
  return Array.from(groups.entries()).map(([dia, list]) => ({
    dia,
    slots: list,
  }));
}

export const BookingForm: ComponentType<BookingFormProps> = (props) => {
  const {
    slots,
    state,
    onChange,
    onSubmit,
    submitting,
    errorMessage,
    precoBRL,
  } = props;

  const grouped = groupByDay(slots);

  return h(
    'form',
    {
      className: 'booking-form',
      'aria-label': 'Formulario de agendamento',
      onSubmit: (e: { preventDefault: () => void }) => {
        e.preventDefault();
        onSubmit();
      },
    },
    h(
      'div',
      { className: 'booking-form__preco' },
      h('span', { className: 'booking-form__preco-label' }, 'Preco por sessao: '),
      h('strong', null, 'R$ ' + precoBRL.toFixed(0))
    ),
    slots.length === 0
      ? h(
          'div',
          { className: 'booking-form__empty', role: 'status' },
          'Sem horarios disponiveis no momento.'
        )
      : h(
          'fieldset',
          { className: 'booking-form__slots' },
          h('legend', null, 'Escolha um horario'),
          ...grouped.map((g) =>
            h(
              'div',
              { key: g.dia, className: 'booking-form__day' },
              h('h4', { className: 'booking-form__day-title' }, g.dia),
              h(
                'div',
                { className: 'booking-form__day-slots', role: 'radiogroup' },
                ...g.slots.map((s) => {
                  const active = state.slotId === s.id;
                  return h(
                    'label',
                    {
                      key: s.id,
                      className:
                        'slot-pill' + (active ? ' slot-pill--active' : ''),
                      'data-slot-id': s.id,
                    },
                    h('input', {
                      type: 'radio',
                      name: 'slot',
                      value: s.id,
                      checked: active,
                      onChange: () => onChange({ ...state, slotId: s.id }),
                    }),
                    fmtDate(s.inicio)
                  );
                })
              )
            )
          )
        ),
    h(
      'div',
      { className: 'booking-form__notes' },
      h('label', { for: 'booking-notes' }, 'Observacoes (opcional)'),
      h('textarea', {
        id: 'booking-notes',
        rows: 3,
        placeholder: 'O que voce busca nesta sessao?',
        value: state.notas,
        onInput: (e: { target: { value: string } }) =>
          onChange({ ...state, notas: e.target.value }),
      })
    ),
    errorMessage
      ? h(
          'div',
          { className: 'booking-form__error', role: 'alert' },
          errorMessage
        )
      : null,
    h(
      'button',
      {
        type: 'submit',
        className: 'booking-form__submit',
        disabled: submitting || !state.slotId,
        'aria-busy': submitting,
      },
      submitting ? 'Agendando...' : 'Confirmar agendamento'
    )
  );
};
