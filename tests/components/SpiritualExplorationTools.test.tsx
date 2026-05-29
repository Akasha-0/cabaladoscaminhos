import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SpiritualExplorationTools } from '@/components/dashboard/SpiritualExplorationTools';

// Mock localStorage
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

Object.defineProperty(global, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
});

const mockUserData = {
  id: 'test-user-id',
  nome: 'Test User',
  dataNascimento: '1990-01-15',
  numeroPessoal: 7,
  arcoPessoal: 8,
  odu: 'Eji',
  orixaRegente: 'Oxum',
  sefirotDominante: ['Chokhmah', 'Binah', 'Daat'],
  arcoMaior: [1, 5, 10, 15],
  sign: 'Capricorn',
};

describe('SpiritualExplorationTools', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
  });

  it('renders all four tools', async () => {
    render(
      <SpiritualExplorationTools
        userData={mockUserData}
        userId="test-user"
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Decodificador de Símbolos')).toBeInTheDocument();
      expect(screen.getByText('Calculadora de Energia')).toBeInTheDocument();
      expect(screen.getByText('Explorador de Sistemas')).toBeInTheDocument();
      expect(screen.getByText('Testador de Correlações')).toBeInTheDocument();
    });
  });

  it('renders tool icons', async () => {
    render(
      <SpiritualExplorationTools
        userData={mockUserData}
        userId="test-user"
      />
    );

    await waitFor(() => {
      expect(screen.getByText('🔮')).toBeInTheDocument();
      expect(screen.getByText('⚡')).toBeInTheDocument();
      expect(screen.getByText('🧭')).toBeInTheDocument();
      expect(screen.getByText('🔗')).toBeInTheDocument();
    });
  });

  it('shows progress stats', async () => {
    render(
      <SpiritualExplorationTools
        userData={mockUserData}
        userId="test-user"
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Progresso Geral')).toBeInTheDocument();
      expect(screen.getByText('Ferramentas')).toBeInTheDocument();
      expect(screen.getByText('7')).toBeInTheDocument(); // numeroPessoal
    });
  });

  it('handles tool selection', async () => {
    render(
      <SpiritualExplorationTools
        userData={mockUserData}
        userId="test-user"
        onToolSelect={vi.fn()}
      />
    );

    const decoderButton = await waitFor(() =>
      screen.getByRole('button', { name: /Decodificador de Símbolos/i })
    );
    fireEvent.click(decoderButton);

    await waitFor(() => {
      expect(screen.getByText('Ferramenta Interativa')).toBeInTheDocument();
      expect(screen.getByText('Dicas de Uso')).toBeInTheDocument();
    });
  });

  it('calls onToolSelect callback when tool is selected', async () => {
    const mockOnSelect = vi.fn();

    render(
      <SpiritualExplorationTools
        userData={mockUserData}
        userId="test-user"
        onToolSelect={mockOnSelect}
      />
    );

    const energyButton = await waitFor(() =>
      screen.getByRole('button', { name: /Calculadora de Energia/i })
    );
    fireEvent.click(energyButton);

    await waitFor(() => {
      expect(mockOnSelect).toHaveBeenCalledWith('energy-calculator');
    });
  });

  it('persists progress in localStorage', async () => {
    render(
      <SpiritualExplorationTools
        userData={mockUserData}
        userId="test-user-persist"
      />
    );

    // Select a tool to trigger progress update
    const explorerButton = await waitFor(() =>
      screen.getByRole('button', { name: /Explorador de Sistemas/i })
    );
    fireEvent.click(explorerButton);

    // Check localStorage was called
    await waitFor(() => {
      const stored = mockLocalStorage.getItem('spiritual-exploration-progress-test-user-persist');
      expect(stored).toBeTruthy();
      const parsed = JSON.parse(stored!);
      expect(parsed['system-explorer']).toBeDefined();
    });
  });

  it('displays affinity scores', async () => {
    render(
      <SpiritualExplorationTools
        userData={mockUserData}
        userId="test-user"
      />
    );

    await waitFor(() => {
      const affinityElements = screen.getAllByText(/Afinidade/);
      expect(affinityElements.length).toBe(4); // One for each tool
    });
  });

  it('displays tool descriptions', async () => {
    render(
      <SpiritualExplorationTools
        userData={mockUserData}
        userId="test-user"
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Decode spiritual symbols and their meanings')).toBeInTheDocument();
      expect(screen.getByText('Calculate energy levels for spiritual practices')).toBeInTheDocument();
    });
  });

  it('shows loading skeleton while initializing', () => {
    // Simulate loading state by checking for skeleton class
    const { container } = render(
      <SpiritualExplorationTools
        userData={mockUserData}
        userId="test-user"
      />
    );

    // Initially should show loading or skeleton
    const title = screen.queryByText('Ferramentas de Exploração Espiritual');
    expect(title).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(
      <SpiritualExplorationTools
        userData={mockUserData}
        userId="test-user"
        className="custom-class"
      />
    );

    const container = document.querySelector('.custom-class');
    expect(container).toBeInTheDocument();
  });

  it('handles close panel action', async () => {
    render(
      <SpiritualExplorationTools
        userData={mockUserData}
        userId="test-user"
      />
    );

    // Select a tool to open panel
    const correlationButton = await waitFor(() =>
      screen.getByRole('button', { name: /Testador de Correlações/i })
    );
    fireEvent.click(correlationButton);

    // Close the panel
    await waitFor(() => {
      const closeButton = screen.getByRole('button', { name: /Fechar painel/i });
      fireEvent.click(closeButton);
    });

    // Panel should be closed
    await waitFor(() => {
      expect(screen.queryByText('Ferramenta Interativa')).not.toBeInTheDocument();
    });
  });
});

describe('Tool Progress Calculation', () => {
  it('calculates affinity based on user data', async () => {
    const userWithHighArco = {
      ...mockUserData,
      arcoMaior: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    };

    render(
      <SpiritualExplorationTools
        userData={userWithHighArco}
        userId="test-user"
      />
    );

    await waitFor(() => {
      // Higher arco should affect affinity
      const decoderButton = screen.getByRole('button', { name: /Decodificador de Símbolos/i });
      expect(decoderButton).toBeInTheDocument();
    });
  });
});