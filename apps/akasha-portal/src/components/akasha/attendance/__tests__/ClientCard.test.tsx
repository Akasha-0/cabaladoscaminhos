/**
 * @akasha/portal — ClientCard tests
 *
 * Wave 22.2 Zelador Attendance UI. Testes estruturais (data-testids),
 * sem asserts em copy (PT-BR pode mudar).
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

import { ClientCard } from '../components/ClientCard';

const CLIENT = {
  id: 'consulente_001',
  fullName: 'João Silva',
  age: 34,
  sunSign: 'Escorpião',
  birthCity: 'Salvador, BA',
  emotionalState: 'ansioso' as const,
};

describe('ClientCard', () => {
  it('renderiza o card do consulente', () => {
    render(<ClientCard client={CLIENT} locale="pt-BR" />);
    expect(screen.getByTestId('attendance-client-card')).toBeInTheDocument();
  });

  it('mostra o nome completo', () => {
    render(<ClientCard client={CLIENT} locale="pt-BR" />);
    expect(screen.getByTestId('attendance-client-name')).toHaveTextContent('João Silva');
  });

  it('mostra idade, signo e cidade na meta-linha', () => {
    render(<ClientCard client={CLIENT} locale="pt-BR" />);
    expect(screen.getByTestId('attendance-client-age')).toHaveTextContent('34a');
    expect(screen.getByTestId('attendance-client-sign')).toHaveTextContent('Escorpião');
    expect(screen.getByTestId('attendance-client-city')).toHaveTextContent('Salvador, BA');
  });

  it('omite cidade quando null/undefined (LGPD-friendly)', () => {
    render(
      <ClientCard
        client={{ ...CLIENT, birthCity: null }}
        locale="pt-BR"
      />
    );
    expect(screen.queryByTestId('attendance-client-city')).toBeNull();
  });

  it('expõe o id do consulente via data attribute', () => {
    render(<ClientCard client={CLIENT} locale="pt-BR" />);
    const card = screen.getByTestId('attendance-client-card');
    expect(card.getAttribute('data-client-id')).toBe('consulente_001');
  });

  it('mostra badge "Em sessão"', () => {
    render(<ClientCard client={CLIENT} locale="pt-BR" />);
    expect(screen.getByTestId('attendance-client-status')).toHaveTextContent(/em sessão/i);
  });
});
