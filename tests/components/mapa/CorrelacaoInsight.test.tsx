/** @vitest-environment jsdom */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CorrelacaoInsight } from '@/components/mapa/CorrelacaoInsight';
import type { Convergence } from '@/lib/engines/types/mapa-alma';

const mockConvergencias: Convergence[] = [
  {
    energia: 'Sabedoria Ancestral',
    sistemas: ['Numerologia', 'Odu', 'Astrologia'],
    forca: 'forte',
    descricao: 'Padrão de sabedoria identificado nos três sistemas',
  },
  {
    energia: 'Energia Vital',
    sistemas: ['Tarot', 'Chakras'],
    forca: 'medio',
    descricao: 'Fluxo energético em alinhamento',
  },
  {
    energia: 'Proteção Espiritual',
    sistemas: ['Cabala', 'Odu'],
    forca: 'fraco',
    descricao: 'Conexão protetora em desenvolvimento',
  },
];

describe('CorrelacaoInsight', () => {
  it('renders without crashing', () => {
    render(<CorrelacaoInsight convergencias={mockConvergencias} />);
    expect(screen.getByText('Convergência Espiritual')).toBeDefined();
  });

  it('displays all convergence energies', () => {
    render(<CorrelacaoInsight convergencias={mockConvergencias} />);
    expect(screen.getByText('Sabedoria Ancestral')).toBeDefined();
    expect(screen.getByText('Energia Vital')).toBeDefined();
    expect(screen.getByText('Proteção Espiritual')).toBeDefined();
  });

  it('shows strength count summary', () => {
    render(<CorrelacaoInsight convergencias={mockConvergencias} />);
    expect(screen.getByText(/1 convergência forte/)).toBeDefined();
  });

  it('displays system names in each convergence', () => {
    render(<CorrelacaoInsight convergencias={mockConvergencias} />);
    expect(screen.getByText('Numerologia')).toBeDefined();
    expect(screen.getAllByText('Odu').length).toBeGreaterThan(0);
    expect(screen.getByText('Tarot')).toBeDefined();
  });

  it('shows empty state when no convergencias', () => {
    render(<CorrelacaoInsight convergencias={[]} />);
    expect(screen.getByText(/Ainda calculando/)).toBeDefined();
  });
});