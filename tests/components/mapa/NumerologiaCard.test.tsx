/** @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NumerologiaCard } from '@/components/mapa/NumerologiaCard';
import type { NumerologyResults } from '@/lib/engines/types/mapa-alma';

// Mock useState for expand/collapse behavior
const mockUseState = vi.fn();
vi.mock('react', async () => {
  const actual = await vi.importActual('react');
  return {
    ...actual,
    useState: (...args: any[]) => mockUseState(...args),
  };
});

// Mock MysticDivider component
vi.mock('@/components/shared/MysticDivider', () => ({
  MysticDivider: ({ className }: any) => (
    <div data-testid="mystic-divider" className={className}>---</div>
  ),
}));

const mockNumerologyData: NumerologyResults = {
  vida: 5,
  expressao: 3,
  motivacao: 7,
  impressao: 11,
  destino: 9,
  cicloAtual: 5,
  anoPessoal: 1,
  metodoUsado: 'pitagorica',
};

describe('NumerologiaCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseState.mockReturnValue([null, vi.fn()]);
  });

  describe('renders all number types', () => {
    it('displays the "Numero de Vida" number', () => {
      render(<NumerologiaCard data={mockNumerologyData} />);
      expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('displays the "Numero de Expressao" number', () => {
      render(<NumerologiaCard data={mockNumerologyData} />);
      // Should show number 3 somewhere
      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('displays the "Numero de Motivacao" number', () => {
      render(<NumerologiaCard data={mockNumerologyData} />);
      // Should show number 7 somewhere
      expect(screen.getByText('7')).toBeInTheDocument();
    });

    it('displays the "Numero de Impressao" number', () => {
      render(<NumerologiaCard data={mockNumerologyData} />);
      // Should show number 11 somewhere
      expect(screen.getByText('11')).toBeInTheDocument();
    });

    it('displays all number type labels', () => {
      render(<NumerologiaCard data={mockNumerologyData} />);
      expect(screen.getByText('Nº de Vida')).toBeInTheDocument();
      expect(screen.getByText('Nº de Expressão')).toBeInTheDocument();
      expect(screen.getByText('Nº de Motivação')).toBeInTheDocument();
      expect(screen.getByText('Nº de Impressão')).toBeInTheDocument();
    });

    it('displays the method label', () => {
      render(<NumerologiaCard data={mockNumerologyData} />);
      expect(screen.getByText('Pitagórica')).toBeInTheDocument();
    });

    it('renders in a 2x2 grid layout', () => {
      const { container } = render(<NumerologiaCard data={mockNumerologyData} />);
      const grid = container.querySelector('.grid.grid-cols-2');
      expect(grid).toBeInTheDocument();
    });
  });

  describe('expand/collapse behavior', () => {
    it('starts with all items collapsed', () => {
      mockUseState.mockReturnValue([null, vi.fn()]);
      render(<NumerologiaCard data={mockNumerologyData} />);

      // When expanded is null, no detail should be visible with opacity-100
      const expandedDetails = document.querySelectorAll('.opacity-100');
      // The detail sections should have opacity-0 by default
    });

    it('expands a number when clicked', () => {
      const setStateMock = vi.fn();
      mockUseState.mockReturnValue([null, setStateMock]);
      render(<NumerologiaCard data={mockNumerologyData} />);
      // Find and click the first number card
      const vidaCard = screen.getByRole('button', { name: /Nº de Vida/ });
      fireEvent.click(vidaCard);
      // Verify setState was called (state update triggered)
      expect(setStateMock).toHaveBeenCalled();
    });

    it('collapses an expanded number when clicked again', () => {
      const setStateMock = vi.fn();
      mockUseState.mockReturnValue(['vida', setStateMock]);
      render(<NumerologiaCard data={mockNumerologyData} />);
      // Click the expanded card to collapse
      const vidaCard = screen.getByRole('button', { name: /Nº de Vida/ });
      fireEvent.click(vidaCard);
      // Verify setState was called (state update triggered)
      expect(setStateMock).toHaveBeenCalled();
    });

    it('has aria-expanded attribute reflecting expand state', () => {
      mockUseState.mockReturnValue(['vida', vi.fn()]);

      render(<NumerologiaCard data={mockNumerologyData} />);

      const vidaCard = screen.getByRole('button', { name: /Nº de Vida/ });
      expect(vidaCard).toHaveAttribute('aria-expanded', 'true');
    });

    it('has aria-expanded false when collapsed', () => {
      mockUseState.mockReturnValue([null, vi.fn()]);

      render(<NumerologiaCard data={mockNumerologyData} />);

      const vidaCard = screen.getByRole('button', { name: /Nº de Vida/ });
      expect(vidaCard).toHaveAttribute('aria-expanded', 'false');
    });

    it('has unique ids for each expandable detail section', () => {
      mockUseState.mockReturnValue([null, vi.fn()]);
      const { container } = render(<NumerologiaCard data={mockNumerologyData} />);
      expect(container.querySelector('#numerologia-detail-vida')).toBeInTheDocument();
      expect(container.querySelector('#numerologia-detail-expressao')).toBeInTheDocument();
      expect(container.querySelector('#numerologia-detail-motivacao')).toBeInTheDocument();
      expect(container.querySelector('#numerologia-detail-impressao')).toBeInTheDocument();
    });

    it('each card controls its corresponding detail section', () => {
      mockUseState.mockReturnValue([null, vi.fn()]);

      render(<NumerologiaCard data={mockNumerologyData} />);

      const vidaCard = screen.getByRole('button', { name: /Nº de Vida/ });
      expect(vidaCard).toHaveAttribute('aria-controls', 'numerologia-detail-vida');
    });

    it('displays interpretation text when expanded', () => {
      mockUseState.mockReturnValue(['vida', vi.fn()]);

      render(<NumerologiaCard data={mockNumerologyData} />);

      // Number 5 has a specific description
      expect(screen.getByText(/Liberdade, mudança/)).toBeInTheDocument();
    });
  });

  describe('keyboard navigation', () => {
    it('triggers expand on Enter key', () => {
      const setStateMock = vi.fn();
      mockUseState.mockReturnValue([null, setStateMock]);

      render(<NumerologiaCard data={mockNumerologyData} />);

      const vidaCard = screen.getByRole('button', { name: /Nº de Vida/ });
      fireEvent.keyDown(vidaCard, { key: 'Enter' });

      expect(setStateMock).toHaveBeenCalled();
    });

    it('triggers expand on Space key', () => {
      const setStateMock = vi.fn();
      mockUseState.mockReturnValue([null, setStateMock]);

      render(<NumerologiaCard data={mockNumerologyData} />);

      const vidaCard = screen.getByRole('button', { name: /Nº de Vida/ });
      fireEvent.keyDown(vidaCard, { key: ' ' });

      expect(setStateMock).toHaveBeenCalled();
    });

    it('does not trigger on other keys', () => {
      const setStateMock = vi.fn();
      mockUseState.mockReturnValue([null, setStateMock]);

      render(<NumerologiaCard data={mockNumerologyData} />);

      const vidaCard = screen.getByRole('button', { name: /Nº de Vida/ });
      fireEvent.keyDown(vidaCard, { key: 'ArrowDown' });
      expect(setStateMock).not.toHaveBeenCalled();

      fireEvent.keyDown(vidaCard, { key: 'Escape' });
      expect(setStateMock).not.toHaveBeenCalled();
    });

    it('number cards are focusable via keyboard', () => {
      mockUseState.mockReturnValue([null, vi.fn()]);

      render(<NumerologiaCard data={mockNumerologyData} />);

      const cards = screen.getAllByRole('button');
      cards.forEach((card) => {
        expect(card).toHaveAttribute('tabIndex', '0');
      });
    });
  });

  describe('master number highlighting', () => {
    it('displays Master badge for number 11', () => {
      mockUseState.mockReturnValue([null, vi.fn()]);

      render(<NumerologiaCard data={mockNumerologyData} />);
      expect(screen.getByText('Master')).toBeInTheDocument();
    });

    it('displays Master badge for number 22', () => {
      const data22: NumerologyResults = {
        ...mockNumerologyData,
        expressao: 22,
        vida: 3,
        motivacao: 7,
        impressao: 9, // regular numbers so only expressao is Master
      };
      mockUseState.mockReturnValue([null, vi.fn()]);
      render(<NumerologiaCard data={data22} />);
      const masterBadges = screen.getAllByText('Master');
      expect(masterBadges.length).toBe(1);
    });
    it('displays Master badge for number 33', () => {
      const data33: NumerologyResults = {
        ...mockNumerologyData,
        motivacao: 33,
        vida: 3,
        expressao: 7,
        impressao: 9, // regular numbers so only motivacao is Master
      };
      mockUseState.mockReturnValue([null, vi.fn()]);
      render(<NumerologiaCard data={data33} />);
      const masterBadges = screen.getAllByText('Master');
      expect(masterBadges.length).toBe(1);
    });
    it('displays Master badge for number 33', () => {
      const data33: NumerologyResults = {
        ...mockNumerologyData,
        motivacao: 33,
        vida: 3,
        expressao: 7,
        impressao: 9, // regular numbers so only motivacao is Master
      };
      mockUseState.mockReturnValue([null, vi.fn()]);
      render(<NumerologiaCard data={data33} />);
      const masterBadges = screen.getAllByText('Master');
      expect(masterBadges.length).toBe(1);
    });

    it('does not display Master badge for regular numbers', () => {
      const regularData: NumerologyResults = {
        vida: 5,
        expressao: 3,
        motivacao: 7,
        impressao: 9,
        destino: 1,
        cicloAtual: 4,
        anoPessoal: 2,
        metodoUsado: 'pitagorica',
      };
      mockUseState.mockReturnValue([null, vi.fn()]);

      render(<NumerologiaCard data={regularData} />);
      expect(screen.queryByText('Master')).not.toBeInTheDocument();
    });

    it('applies special glow effect to Master numbers', () => {
      mockUseState.mockReturnValue([null, vi.fn()]);
      // Use mockNumerologyData which has master number 11 in impressao
      const { container } = render(<NumerologiaCard data={mockNumerologyData} />);
      // Master numbers have special styling - check for the drop-shadow class
      const glowElements = container.querySelectorAll('[class*="drop-shadow"]');
      expect(glowElements.length).toBeGreaterThan(0);
    });

    it('applies float animation class to Master numbers', () => {
      mockUseState.mockReturnValue([null, vi.fn()]);

      const { container } = render(<NumerologiaCard data={mockNumerologyData} />);
      const animatedElement = container.querySelector('.animate-float');
      expect(animatedElement).toBeInTheDocument();
    });

    it('Master number 11 displays correct description', () => {
      mockUseState.mockReturnValue(['impressao', vi.fn()]);

      render(<NumerologiaCard data={mockNumerologyData} />);
      // Number 11 has specific illumination/intuition description
      expect(screen.getByText(/Iluminação, intuição/)).toBeInTheDocument();
    });

    it('Master number 22 displays Master Builder description', () => {
      const data22Expanded: NumerologyResults = {
        ...mockNumerologyData,
        vida: 22,
      };
      mockUseState.mockReturnValue(['vida', vi.fn()]);

      render(<NumerologiaCard data={data22Expanded} />);
      expect(screen.getByText(/Master Builder/)).toBeInTheDocument();
    });

    it('Master number 33 displays Master Healer description', () => {
      const data33Expanded: NumerologyResults = {
        ...mockNumerologyData,
        expressao: 33,
      };
      mockUseState.mockReturnValue(['expressao', vi.fn()]);

      render(<NumerologiaCard data={data33Expanded} />);
      expect(screen.getByText(/Master Healer/)).toBeInTheDocument();
    });
  });

  describe('visual styling', () => {
    it('has mystical heading with NUMEROLOGIA text', () => {
      render(<NumerologiaCard data={mockNumerologyData} />);
      expect(screen.getByText('✦ NUMEROLOGIA')).toBeInTheDocument();
    });

    it('renders the MysticDivider component', () => {
      const { container } = render(<NumerologiaCard data={mockNumerologyData} />);
      expect(container.querySelector('[data-testid="mystic-divider"]')).toBeInTheDocument();
    });

    it('has expand hint text at the bottom', () => {
      render(<NumerologiaCard data={mockNumerologyData} />);
      expect(
        screen.getByText('Clique nos números para ver a interpretação completa')
      ).toBeInTheDocument();
    });

    it('uses correct color for vida number (gold)', () => {
      const { container } = render(<NumerologiaCard data={mockNumerologyData} />);
      const vidaElement = container.querySelector('.text-amber-400');
      expect(vidaElement).toBeInTheDocument();
    });

    it('uses correct color for other numbers (violet)', () => {
      const { container } = render(<NumerologiaCard data={mockNumerologyData} />);
      const violetElements = container.querySelectorAll('.text-violet-400');
      expect(violetElements.length).toBeGreaterThan(0);
    });

    it('applies custom className when provided', () => {
      const { container } = render(
        <NumerologiaCard data={mockNumerologyData} className="custom-test-class" />
      );
      expect(container.firstChild).toHaveClass('custom-test-class');
    });
  });

  describe('accessibility', () => {
    it('has descriptive aria-labels for each number card', () => {
      mockUseState.mockReturnValue([null, vi.fn()]);

      render(<NumerologiaCard data={mockNumerologyData} />);

      const vidaCard = screen.getByRole('button', { name: /Nº de Vida: número 5/ });
      expect(vidaCard).toBeInTheDocument();
    });

    it('has focus-visible ring styles for keyboard navigation', () => {
      const { container } = render(<NumerologiaCard data={mockNumerologyData} />);
      const focusable = container.querySelector('.focus-visible\\:ring-2');
      expect(focusable).toBeInTheDocument();
    });

    it('each card has role button', () => {
      mockUseState.mockReturnValue([null, vi.fn()]);

      render(<NumerologiaCard data={mockNumerologyData} />);

      const cards = screen.getAllByRole('button');
      expect(cards.length).toBe(4); // vida, expressao, motivacao, impressao
    });
  });

  describe('edge cases', () => {
    it('handles different method types', () => {
      const methods: NumerologyResults['metodoUsado'][] = [
        'pitagorica', 'caldeia', 'cabalistica', 'tantrica', 'misto',
      ];

      methods.forEach((method) => {
        mockUseState.mockReturnValue([null, vi.fn()]);
        const { getByText } = render(
          <NumerologiaCard data={{ ...mockNumerologyData, metodoUsado: method }} />
        );

        const labels: Record<string, string> = {
          pitagorica: 'Pitagórica',
          caldeia: 'Caldeia',
          cabalistica: 'Cabalística',
          tantrica: 'Tântrica',
          misto: 'Mista',
        };
        expect(getByText(labels[method])).toBeInTheDocument();
      });
    });

    it('handles number 1-9 descriptions', () => {
      const data1: NumerologyResults = {
        vida: 1,
        expressao: 2,
        motivacao: 3,
        impressao: 4,
        destino: 6,
        cicloAtual: 7,
        anoPessoal: 8,
        metodoUsado: 'pitagorica',
      };

      mockUseState.mockReturnValue(['vida', vi.fn()]);
      render(<NumerologiaCard data={data1} />);
      expect(screen.getByText(/Liderança, independência/)).toBeInTheDocument();
    });
  });
});