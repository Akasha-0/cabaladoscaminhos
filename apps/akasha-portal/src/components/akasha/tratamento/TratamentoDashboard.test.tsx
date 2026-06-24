import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { TratamentoDashboard } from '../TratamentoDashboard';
import type { SynthesisOutput } from '../useTratamento';

const mockOutput: SynthesisOutput = {
  versao: 'v1',
  disclaimer: 'Conteúdo orientativo.',
  camadas: {
    'camada-1-diagnostico': {
      id: 'camada-1-diagnostico',
      titulo: 'Diagnóstico',
      conteudo: 'Pessoa com orí quente.',
      fontes: [],
      requires_professional_review: false,
    },
    'camada-2-praticas-imediatas': {
      id: 'camada-2-praticas-imediatas',
      titulo: 'Práticas',
      conteudo: 'Banho de alecrim.',
      fontes: [{ id: 'camada-2-fonte-1' }],
      requires_professional_review: false,
    },
    'camada-3-tratamento-por-area': {
      id: 'camada-3-tratamento-por-area',
      titulo: 'Tratamento',
      conteudo: 'Saúde: 1 prática.',
      fontes: [],
      requires_professional_review: false,
    },
    'camada-4-quisilas': {
      id: 'camada-4-quisilas',
      titulo: 'Quisilas',
      conteudo: 'Não fazer X.',
      fontes: [],
      requires_professional_review: false,
    },
    'camada-5-alinhamento-energetico': {
      id: 'camada-5-alinhamento-energetico',
      titulo: 'Alinhamento',
      conteudo: null,
      fontes: [],
      requires_professional_review: false,
    },
    'camada-6-psicanalise': {
      id: 'camada-6-psicanalise',
      titulo: 'Psicanálise',
      conteudo: 'Padrão repetido detectado.',
      fontes: [],
      requires_professional_review: true,
    },
    'camada-7-coaching': {
      id: 'camada-7-coaching',
      titulo: 'Coaching',
      conteudo: 'Meta 30 dias.',
      fontes: [],
      requires_professional_review: true,
    },
  },
  cadeia_pensamento: [
    { step: 1, descricao: 'Calculei Pilar 1-7', fontes_usadas: ['akasha-core'] },
  ],
};

describe('TratamentoDashboard', () => {
  it('renders 8 cards (7 camadas + cadeia_pensamento) when given valid output', () => {
    const input = {
      zeladorId: 'z1',
      caminhadaId: 'c1',
      consulenteNome: 'Test',
      dataNascimento: '1990-01-01',
      horaNascimento: '12:00',
      localNascimento: 'SP',
    };
    render(<TratamentoDashboard input={input} initialData={mockOutput} />);
    expect(screen.getByTestId('tratamento-dashboard')).toBeInTheDocument();
    expect(screen.getByTestId('camada-card-camada-1-diagnostico')).toBeInTheDocument();
    expect(screen.getByTestId('camada-card-camada-7-coaching')).toBeInTheDocument();
    expect(screen.getByTestId('cadeia-pensamento-card')).toBeInTheDocument();
  });

  it('shows warning icon for camadas requiring professional review', () => {
    const input = {
      zeladorId: 'z1',
      caminhadaId: 'c1',
      consulenteNome: 'Test',
      dataNascimento: '1990-01-01',
      horaNascimento: '12:00',
      localNascimento: 'SP',
    };
    render(<TratamentoDashboard input={input} initialData={mockOutput} />);
    // ⚠️ appears for camadas 6 and 7 (2 occurrences)
    const warnings = screen.getAllByText('⚠️');
    expect(warnings.length).toBeGreaterThanOrEqual(2);
  });

  it('shows loading state when fetching', () => {
    const input = {
      zeladorId: 'z1',
      caminhadaId: 'c1',
      consulenteNome: 'Test',
      dataNascimento: '1990-01-01',
      horaNascimento: '12:00',
      localNascimento: 'SP',
    };
    // Mock fetch to never resolve
    global.fetch = vi.fn(() => new Promise(() => {})) as never;
    render(<TratamentoDashboard input={input} />);
    expect(screen.getByTestId('tratamento-loading')).toBeInTheDocument();
  });
});
