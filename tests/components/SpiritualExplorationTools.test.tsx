import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
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

  it('renders all four tools', () => {
    render(
      <SpiritualExplorationTools
        userData={mockUserData}
        userId="test-user"
      />
    );

    expect(screen.getByText('Decodificador de Símbolos')).toBeInTheDocument();
    expect(screen.getByText('Calculadora de Energia')).toBeInTheDocument();
    expect(screen.getByText('Explorador de Sistemas')).toBeInTheDocument();
    expect(screen.getByText('Testador de Correlações')).toBeInTheDocument();
  });

  it('renders tool icons', () => {
    render(
      <SpiritualExplorationTools
        userData={mockUserData}
        userId="test-user"
      />
    );

    const decoderTool = screen.getByText('Decodificador de Símbolos').closest('button');
    expect(decoderTool?.textContent).toContain('🔮');
  });

  it('shows progress stats', () => {
    render(
      <SpiritualExplorationTools
        userData={mockUserData}
        userId="test-user"
      />
    );

    // Use getAllByText since there are multiple progress elements
    const progressElements = screen.getAllByText('Progresso');
    expect(progressElements.length).toBeGreaterThan(0);
  });

  it('calls onToolSelect callback when tool is selected', () => {
    const mockOnSelect = vi.fn();
    render(
      <SpiritualExplorationTools
        userData={mockUserData}
        userId="test-user"
        onToolSelect={mockOnSelect}
      />
    );

    const decoderTool = screen.getByText('Decodificador de Símbolos').closest('button');
    if (decoderTool) {
      fireEvent.click(decoderTool);
    }

    expect(mockOnSelect).toHaveBeenCalledWith('symbol-decoder');
  });

  it('displays affinity scores', () => {
    render(
      <SpiritualExplorationTools
        userData={mockUserData}
        userId="test-user"
      />
    );

    // Check that affinity text appears
    const affinityElements = screen.getAllByText('Afinidade');
    expect(affinityElements.length).toBeGreaterThan(0);
  });

  it('displays tool descriptions', () => {
    render(
      <SpiritualExplorationTools
        userData={mockUserData}
        userId="test-user"
      />
    );

    expect(screen.getByText(/Decode spiritual symbols/)).toBeInTheDocument();
  });

  it('renders section header', () => {
    render(
      <SpiritualExplorationTools
        userData={mockUserData}
        userId="test-user"
      />
    );

    expect(screen.getByText('Ferramentas de Exploração Espiritual')).toBeInTheDocument();
  });

  it('renders without crashing', () => {
    expect(() => {
      render(
        <SpiritualExplorationTools
          userData={mockUserData}
          userId="test-user"
        />
      );
    }).not.toThrow();
  });

  it('renders all tool names', () => {
    render(
      <SpiritualExplorationTools
        userData={mockUserData}
        userId="test-user"
      />
    );

    const toolNames = [
      'Decodificador de Símbolos',
      'Calculadora de Energia',
      'Explorador de Sistemas',
      'Testador de Correlações',
    ];

    toolNames.forEach((name) => {
      expect(screen.getByText(name)).toBeInTheDocument();
    });
  });
});

describe('Tool Progress Calculation', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
  });

  it('calculates progress for user with odu', () => {
    render(
      <SpiritualExplorationTools
        userData={mockUserData}
        userId="test-user"
      />
    );

    // Check that affinity is displayed
    const affinityElements = screen.getAllByText('Afinidade');
    expect(affinityElements.length).toBe(4); // 4 tools, each has affinity
  });

  it('renders tool selection buttons', () => {
    render(
      <SpiritualExplorationTools
        userData={mockUserData}
        userId="test-user"
      />
    );

    // All tools should be rendered as buttons
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBe(4); // 4 tool buttons
  });
});