/**
 * @akasha/portal — EmotionalStateToggle tests
 *
 * Wave 22.2 Zelador Attendance UI. Toggle compacto com 4 estados
 * emocionais (Wave 9.1). Testa seleção, ativo visual e acessibilidade.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import { EmotionalStateToggle } from '../components/EmotionalStateToggle';

const LABELS = {
  centrado: 'Centrado',
  ansioso: 'Ansioso',
  perdido: 'Perdido',
  curioso: 'Curioso',
};

describe('EmotionalStateToggle', () => {
  it('renderiza o toggle com role=radiogroup', () => {
    render(<EmotionalStateToggle value="ansioso" onChange={vi.fn()} labels={LABELS} />);
    const group = screen.getByTestId('attendance-emotional-toggle');
    expect(group).toHaveAttribute('role', 'radiogroup');
  });

  it('renderiza os 4 estados emocionais', () => {
    render(<EmotionalStateToggle value="ansioso" onChange={vi.fn()} labels={LABELS} />);
    expect(screen.getByTestId('attendance-emotional-centrado')).toBeInTheDocument();
    expect(screen.getByTestId('attendance-emotional-ansioso')).toBeInTheDocument();
    expect(screen.getByTestId('attendance-emotional-perdido')).toBeInTheDocument();
    expect(screen.getByTestId('attendance-emotional-curioso')).toBeInTheDocument();
  });

  it('marca o estado ativo via data-active', () => {
    render(<EmotionalStateToggle value="perdido" onChange={vi.fn()} labels={LABELS} />);
    expect(screen.getByTestId('attendance-emotional-perdido').getAttribute('data-active')).toBe('true');
    expect(screen.getByTestId('attendance-emotional-ansioso').getAttribute('data-active')).toBe('false');
  });

  it('dispara onChange ao clicar em outro estado', () => {
    const onChange = vi.fn();
    render(<EmotionalStateToggle value="ansioso" onChange={onChange} labels={LABELS} />);
    fireEvent.click(screen.getByTestId('attendance-emotional-curioso'));
    expect(onChange).toHaveBeenCalledWith('curioso');
  });

  it('dispara onChange ao clicar no mesmo estado (toggle idempotente)', () => {
    const onChange = vi.fn();
    render(<EmotionalStateToggle value="ansioso" onChange={onChange} labels={LABELS} />);
    fireEvent.click(screen.getByTestId('attendance-emotional-ansioso'));
    expect(onChange).toHaveBeenCalledWith('ansioso');
  });

  it('expõe aria-checked=true apenas no estado ativo', () => {
    render(<EmotionalStateToggle value="centrado" onChange={vi.fn()} labels={LABELS} />);
    expect(screen.getByTestId('attendance-emotional-centrado').getAttribute('aria-checked')).toBe('true');
    expect(screen.getByTestId('attendance-emotional-ansioso').getAttribute('aria-checked')).toBe('false');
  });
});
