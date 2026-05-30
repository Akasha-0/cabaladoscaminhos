/** @vitest-environment jsdom */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ConvergenciasCard } from '@/components/mapa/ConvergenciasCard';
import type { Convergence } from '@/lib/engines/types/mapa-alma';

const mockConvergencias: Convergence[] = [
  {
    energia: 'Luz Interior',
    sistemas: ['Numerologia', 'Odu', 'Astrologia'],
    forca: 'forte',
    descricao: 'Conexão poderosa entre sistemas',
  },
  {
    energia: 'Transformação',
    sistemas: ['Tarot', 'Cabala'],
    forca: 'medio',
    descricao: 'Padrão de transformação identificado',
  },
];

describe('ConvergenciasCard', () => {
  it('renders without crashing', () => {
    render(<ConvergenciasCard convergencias={mockConvergencias} orixasDominantes={[]} />);
    expect(screen.getByText('Convergências Espirituais')).toBeDefined();
  });

  it('displays orixás dominantes when provided', () => {
    render(
      <ConvergenciasCard
        convergencias={mockConvergencias}
        orixasDominantes={['Ogum', 'Oxum']}
      />
    );
    expect(screen.getByText('Ogum')).toBeDefined();
    expect(screen.getByText('Oxum')).toBeDefined();
  });

  it('renders all convergence items', () => {
    render(<ConvergenciasCard convergencias={mockConvergencias} orixasDominantes={[]} />);
    expect(screen.getByText('Luz Interior')).toBeDefined();
    expect(screen.getByText('Transformação')).toBeDefined();
  });

  it('displays empty state when no convergencias', () => {
    render(<ConvergenciasCard convergencias={[]} orixasDominantes={[]} />);
    expect(screen.getByText('Nenhuma convergência registrada')).toBeDefined();
  });

  it('applies strength-based styling', () => {
    render(<ConvergenciasCard convergencias={mockConvergencias} orixasDominantes={[]} />);
    expect(screen.getByText('Forte')).toBeDefined();
    expect(screen.getByText('Médio')).toBeDefined();
  });
});