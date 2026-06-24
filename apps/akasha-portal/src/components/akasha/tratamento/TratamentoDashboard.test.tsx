/**
 * TratamentoDashboard.test.tsx
 *
 * Wave 7.4 — A.4 (jest-dom setup).
 *
 * Cobertura do componente TratamentoDashboard:
 *   1. Loading state (useTratamento retorna isLoading=true)
 *   2. Error state com botão "Tentar novamente" que dispara refetch
 *   3. Empty state quando não há output (sem initialData e fetch sem sucesso)
 *   4. Render com initialData (7 camadas + disclaimer visível)
 *   5. Disclaimer oculto quando output.disclaimer é falsy
 *   6. Cadeia de Pensamento visível quando output.cadeia_pensamento tem passos
 *
 * Mocks:
 *   - `@/i18n` → useTranslation retorna t(key) === key (stub)
 *   - `./useTratamento` → controlável por mockUseTratamento (loading/error/data)
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { TratamentoDashboard } from './TratamentoDashboard';

// ─── Mocks ──────────────────────────────────────────────────────────────────

vi.mock('@/i18n', () => ({
  useTranslation: () => ({ t: (key: string, params?: Record<string, unknown>) => {
    if (!params) return key;
    return Object.entries(params).reduce(
      (acc, [k, v]) => acc.replace(`{${k}}`, String(v)),
      key
    );
  } }),
}));

const mockRefetch = vi.fn();
const mockUseTratamento = vi.fn();

vi.mock('./useTratamento', () => ({
  useTratamento: (...args: unknown[]) => mockUseTratamento(...args),
}));

// ─── Fixtures ──────────────────────────────────────────────────────────────

const validInput = {
  zeladorId: 'cl1234567890abcdefghij',
  caminhadaId: 'cl1234567890abcdefghij',
  consulenteNome: 'João da Silva',
  dataNascimento: '1990-01-01',
  horaNascimento: '12:00',
  localNascimento: 'São Paulo, Brasil',
};

const fullOutput = {
  versao: 'v1',
  disclaimer: 'Conteúdo orientativo. Acompanhe com profissional.',
  camadas: {
    'camada-1-diagnostico': {
      id: 'camada-1-diagnostico',
      titulo: 'Diagnóstico Imediato',
      conteudo: 'Pessoa com orí quente.',
      fontes: [],
      requires_professional_review: false,
    },
    'camada-2-praticas-imediatas': {
      id: 'camada-2-praticas-imediatas',
      titulo: 'Práticas',
      conteudo: null,
      fontes: [],
      requires_professional_review: false,
    },
    'camada-3-tratamento-por-area': {
      id: 'camada-3-tratamento-por-area',
      titulo: 'Tratamento',
      conteudo: null,
      fontes: [],
      requires_professional_review: false,
    },
    'camada-4-quisilas': {
      id: 'camada-4-quisilas',
      titulo: 'O que Evitar',
      conteudo: 'Evitar alimentos muito quentes.',
      fontes: [{ id: 'fonte-1', path: 'odu/1.json' }],
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
      conteudo: null,
      fontes: [],
      requires_professional_review: true,
    },
    'camada-7-coaching': {
      id: 'camada-7-coaching',
      titulo: 'Coaching',
      conteudo: null,
      fontes: [],
      requires_professional_review: true,
    },
  },
  cadeia_pensamento: [
    { step: 1, descricao: 'Analisou Odu de Nascimento.', fontes_usadas: ['fonte-1'] },
    { step: 2, descricao: 'Correlacionou com Astrologia.', fontes_usadas: ['fonte-2'] },
  ],
};

// ─── Setup ──────────────────────────────────────────────────────────────────

const defaultMockReturn = {
  data: null,
  isLoading: false,
  error: null,
  cvv188: false,
  refetch: mockRefetch,
};

beforeEach(() => {
  mockRefetch.mockClear();
  mockUseTratamento.mockReset();
  // Baseline: hook sempre retorna um objeto válido para que o destructuring
  // em TratamentoDashboard não falhe. Cada teste sobrescreve conforme necessário.
  mockUseTratamento.mockReturnValue(defaultMockReturn);
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('TratamentoDashboard', () => {
  it('1. renders loading state when useTratamento reports isLoading', () => {
    mockUseTratamento.mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
      cvv188: false,
      refetch: mockRefetch,
    });

    render(<TratamentoDashboard input={validInput} />);

    // data-testid="tratamento-loading" + texto da i18n 'loading'
    const loading = screen.getByTestId('tratamento-loading');
    expect(loading).toBeInTheDocument();
    expect(loading).toBeVisible();
    expect(loading).toHaveTextContent('loading');
  });

  it('2. renders error state with retry button that calls refetch on click', async () => {
    mockUseTratamento.mockReturnValue({
      data: null,
      isLoading: false,
      error: 'engine_unavailable',
      cvv188: false,
      refetch: mockRefetch,
    });

    render(<TratamentoDashboard input={validInput} />);

    const errorBox = screen.getByTestId('tratamento-error');
    expect(errorBox).toBeInTheDocument();
    expect(errorBox).toHaveTextContent('errorTitle');
    expect(errorBox).toHaveTextContent('engine_unavailable');

    const retryButton = screen.getByRole('button', { name: 'errorRetry' });
    expect(retryButton).toBeInTheDocument();

    const user = userEvent.setup();
    await user.click(retryButton);

    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });

  it('3. renders "no auth" empty state when output is null and no error', () => {
    mockUseTratamento.mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
      cvv188: false,
      refetch: mockRefetch,
    });

    render(<TratamentoDashboard input={validInput} />);

    // sem dashboard, sem loading, sem error → mostra noAuth
    expect(screen.queryByTestId('tratamento-dashboard')).not.toBeInTheDocument();
    expect(screen.queryByTestId('tratamento-loading')).not.toBeInTheDocument();
    expect(screen.queryByTestId('tratamento-error')).not.toBeInTheDocument();
    expect(screen.getByText('noAuth')).toBeInTheDocument();
  });

  it('4. renders dashboard with 7 camadas and disclaimer when initialData is provided', () => {
    render(<TratamentoDashboard input={validInput} initialData={fullOutput} />);

    const dashboard = screen.getByTestId('tratamento-dashboard');
    expect(dashboard).toBeInTheDocument();
    expect(dashboard).toBeVisible();

    // 7 camadas com data-testid camada-card-{id}
    Object.keys(fullOutput.camadas).forEach((id) => {
      const camada = screen.getByTestId(`camada-card-${id}`);
      expect(camada).toBeInTheDocument();
    });

    // Disclaimer exibido quando output.disclaimer é truthy
    expect(dashboard).toHaveTextContent('Conteúdo orientativo');
  });

  it('5. hides disclaimer when output.disclaimer is empty/null', () => {
    const outputWithoutDisclaimer = {
      ...fullOutput,
      disclaimer: '',
    };

    render(
      <TratamentoDashboard input={validInput} initialData={outputWithoutDisclaimer} />
    );

    const dashboard = screen.getByTestId('tratamento-dashboard');
    expect(dashboard).toBeInTheDocument();

    // Disclaimer box NÃO deve aparecer quando output.disclaimer é vazio.
    // (Outros ⚠️ podem existir em CamadaCard para requires_professional_review,
    // mas o texto "Conteúdo orientativo" do disclaimer só aparece aqui.)
    expect(dashboard).not.toHaveTextContent('Conteúdo orientativo');
  });

  it('6. renders cadeia de pensamento card with passos when output has cadeia_pensamento', () => {
    render(<TratamentoDashboard input={validInput} initialData={fullOutput} />);

    const cadeia = screen.getByTestId('cadeia-pensamento-card');
    expect(cadeia).toBeInTheDocument();
    expect(cadeia).toHaveTextContent('cadeia_pensamento');
    expect(cadeia).toHaveTextContent('Analisou Odu de Nascimento.');
    expect(cadeia).toHaveTextContent('Correlacionou com Astrologia.');
    expect(cadeia).toHaveTextContent('fonte-1');
  });

  it('7. does not call useTratamento fetch when initialData is provided (passes null as input)', () => {
    mockUseTratamento.mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
      cvv188: false,
      refetch: mockRefetch,
    });

    render(<TratamentoDashboard input={validInput} initialData={fullOutput} />);

    // Quando initialData é fornecido, o hook deve ser chamado com null
    expect(mockUseTratamento).toHaveBeenCalledWith(null);
    // Mas o output renderizado vem do initialData
    expect(screen.getByTestId('tratamento-dashboard')).toBeInTheDocument();
  });
});
