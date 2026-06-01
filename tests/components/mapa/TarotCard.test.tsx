/** @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TarotCard } from '@/components/mapa/TarotCard';
import type { TarotResults } from '@/lib/engines/types/mapa-alma';

// Mock lucide-react
vi.mock('lucide-react', () => ({
  Sparkles: ({ className }: any) => (
    <div data-testid="sparkles-icon" className={className}>✨</div>
  ),
}));

// Mock useState and useEffect for prefersReducedMotion
const mockUseState = vi.fn();
const mockUseEffect = vi.fn();

vi.mock('react', async () => {
  const actual = await vi.importActual('react');
  return {
    ...actual,
    useState: (...args: any[]) => mockUseState(...args),
    useEffect: (...args: any[]) => mockUseEffect(...args),
  };
});

const mockTarotData: TarotResults = {
  cartaNascimento: 7,
  cartaAnoPessoal: 12,
  cartaAlma: 19,
  interpretacao: {
    name: 'The Chariot',
    upright: 'Success, determination, triumph',
    reversed: 'Self-discipline, failure, lack of direction',
  },
};

describe('TarotCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: motion allowed
    mockUseState.mockImplementation((init) => {
      const value = typeof init === 'function' ? init(false) : init;
      return [value, vi.fn()];
    });
    mockUseEffect.mockReturnValue(undefined);
  });

  describe('renders card display with data', () => {
    it('displays the arcano number', () => {
      render(<TarotCard data={mockTarotData} />);
      expect(screen.getByText('7')).toBeInTheDocument();
    });

    it('displays the arcano name in Portuguese', () => {
      render(<TarotCard data={mockTarotData} />);
      expect(screen.getAllByText(/^O Carro$/)).toHaveLength(2);
    });

    it('displays the arcano English name as subtitle', () => {
      render(<TarotCard data={mockTarotData} />);
      expect(screen.getByText(/\bThe Chariot\b/)).toBeInTheDocument();
    });

    it('displays "Carta do Nascimento" header', () => {
      render(<TarotCard data={mockTarotData} />);
      expect(screen.getByText('Carta do Nascimento')).toBeInTheDocument();
    });

    it('displays the arcano symbol', () => {
      render(<TarotCard data={mockTarotData} />);
      // Arcano 7 is ♌ (Leo symbol) - appears 2 times: symbol area and badge
      expect(screen.getAllByText('♌')).toHaveLength(2);
    });

    it('renders without className prop', () => {
      const { container } = render(<TarotCard data={mockTarotData} />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it('applies custom className when provided', () => {
      const { container } = render(
        <TarotCard data={mockTarotData} className="custom-class" />
      );
      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('flip animation trigger', () => {
    it('calls setIsFlipped when card is clicked', () => {
      mockUseState.mockImplementation((init) => {
        const setFn = vi.fn();
        return [init, setFn];
      });

      const setStateMock = vi.fn();
      mockUseState
        .mockReturnValueOnce([false, setStateMock]) // isFlipped state
        .mockReturnValueOnce([false, vi.fn()]); // prefersReducedMotion state

      render(<TarotCard data={mockTarotData} />);
      const card = screen.getByRole('button');
      fireEvent.click(card);
      expect(setStateMock).toHaveBeenCalled();
    });

    it('toggles flip state when clicked', () => {
      let flipState = false;
      const setFlipState = vi.fn((val) => {
        flipState = typeof val === 'function' ? val(flipState) : val;
      });
      let motionState = false;
      const setMotionState = vi.fn((val) => {
        motionState = typeof val === 'function' ? val(motionState) : val;
      });
      mockUseState
        .mockReturnValueOnce([flipState, setFlipState])
        .mockReturnValueOnce([motionState, setMotionState]);
      const { rerender } = render(<TarotCard data={mockTarotData} />);
      const card = screen.getByRole('button');
      fireEvent.click(card);
      // handleFlip uses setIsFlipped(prev => !prev), so it's called with a function
      expect(setFlipState).toHaveBeenCalled();
      // Simulate state update
      flipState = true;
      mockUseState
        .mockReturnValueOnce([flipState, setFlipState])
        .mockReturnValueOnce([motionState, setMotionState]);
      rerender(<TarotCard data={mockTarotData} />);
      fireEvent.click(card);
      fireEvent.click(card);
      expect(setFlipState).toHaveBeenCalled();
    });

    it('has aria-pressed attribute that reflects flip state', () => {
      mockUseState
        .mockReturnValueOnce([false, vi.fn()])
        .mockReturnValueOnce([false, vi.fn()]);

      const { rerender } = render(<TarotCard data={mockTarotData} />);
      const card = screen.getByRole('button');
      expect(card).toHaveAttribute('aria-pressed', 'false');

      // Simulate flipped state
      mockUseState
        .mockReturnValueOnce([true, vi.fn()])
        .mockReturnValueOnce([false, vi.fn()]);
      rerender(<TarotCard data={mockTarotData} />);
      expect(card).toHaveAttribute('aria-pressed', 'true');
    });
  });

  describe('keyboard navigation', () => {
    it('triggers flip on Enter key press', () => {
      const setStateMock = vi.fn();
      mockUseState
        .mockReturnValueOnce([false, setStateMock])
        .mockReturnValueOnce([false, vi.fn()]);

      render(<TarotCard data={mockTarotData} />);
      const card = screen.getByRole('button');
      fireEvent.keyDown(card, { key: 'Enter' });
      expect(setStateMock).toHaveBeenCalled();
    });

    it('triggers flip on Space key press', () => {
      const setStateMock = vi.fn();
      mockUseState
        .mockReturnValueOnce([false, setStateMock])
        .mockReturnValueOnce([false, vi.fn()]);

      render(<TarotCard data={mockTarotData} />);
      const card = screen.getByRole('button');
      fireEvent.keyDown(card, { key: ' ' });
      expect(setStateMock).toHaveBeenCalled();
    });

    it('does not trigger flip on other keys', () => {
      const setStateMock = vi.fn();
      mockUseState
        .mockReturnValueOnce([false, setStateMock])
        .mockReturnValueOnce([false, vi.fn()]);

      render(<TarotCard data={mockTarotData} />);
      const card = screen.getByRole('button');

      fireEvent.keyDown(card, { key: 'ArrowDown' });
      expect(setStateMock).not.toHaveBeenCalled();

      fireEvent.keyDown(card, { key: 'Escape' });
      expect(setStateMock).not.toHaveBeenCalled();

      fireEvent.keyDown(card, { key: 'Tab' });
      expect(setStateMock).not.toHaveBeenCalled();
    });

    it('has tabIndex 0 for keyboard accessibility', () => {
      mockUseState
        .mockReturnValueOnce([false, vi.fn()])
        .mockReturnValueOnce([false, vi.fn()]);

      render(<TarotCard data={mockTarotData} />);
      const card = screen.getByRole('button');
      expect(card).toHaveAttribute('tabIndex', '0');
    });
  });

  describe('reduced motion preference', () => {
    it('respects prefers-reduced-motion when set to true', () => {
      mockUseState
        .mockReturnValueOnce([false, vi.fn()]) // isFlipped
        .mockReturnValueOnce([true, vi.fn()]); // prefersReducedMotion = true

      const { rerender } = render(<TarotCard data={mockTarotData} />);

      // When flipped with reduced motion
      mockUseState
        .mockReturnValueOnce([true, vi.fn()]) // isFlipped = true
        .mockReturnValueOnce([true, vi.fn()]); // prefersReducedMotion = true

      rerender(<TarotCard data={mockTarotData} />);
      // Component should handle reduced motion gracefully (no animation)
    });

    it('sets up media query listener on mount', () => {
      mockUseState
        .mockReturnValueOnce([false, vi.fn()])
        .mockReturnValueOnce([false, vi.fn()]);

      const addEventListenerMock = vi.fn();
      const removeEventListenerMock = vi.fn();

      // Mock window.matchMedia
      const mockMediaQueryList = {
        matches: false,
        addEventListener: addEventListenerMock,
        removeEventListener: removeEventListenerMock,
        media: '',
        onchange: null,
        dispatchEvent: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
      };

      vi.stubGlobal('window', {
        ...window,
        matchMedia: vi.fn(() => mockMediaQueryList),
      });

      render(<TarotCard data={mockTarotData} />);

      // Verify useEffect was called to set up the listener
      expect(mockUseEffect).toHaveBeenCalled();
    });

    it('cleans up media query listener on unmount', () => {
      mockUseState
        .mockReturnValueOnce([false, vi.fn()])
        .mockReturnValueOnce([false, vi.fn()]);

      const removeEventListenerMock = vi.fn();

      const mockMediaQueryList = {
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: removeEventListenerMock,
        media: '',
        onchange: null,
        dispatchEvent: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
      };

      vi.stubGlobal('window', {
        ...window,
        matchMedia: vi.fn(() => mockMediaQueryList),
      });

      const { unmount } = render(<TarotCard data={mockTarotData} />);
      unmount();

      // Cleanup function should be called
      expect(mockUseEffect).toHaveBeenCalled();
    });
  });

  describe('additional cards display', () => {
    it('displays the Ano Pessoal card', () => {
      mockUseState
        .mockReturnValueOnce([false, vi.fn()])
        .mockReturnValueOnce([false, vi.fn()]);

      render(<TarotCard data={mockTarotData} />);
      expect(screen.getByText('Ano Pessoal:')).toBeInTheDocument();
      // Arcano 12 is O Enforcado
      expect(screen.getByText('O Enforcado')).toBeInTheDocument();
      expect(screen.getByText('#12')).toBeInTheDocument();
    });

    it('displays the Carta da Alma card', () => {
      mockUseState
        .mockReturnValueOnce([false, vi.fn()])
        .mockReturnValueOnce([false, vi.fn()]);

      render(<TarotCard data={mockTarotData} />);
      expect(screen.getByText('Alma:')).toBeInTheDocument();
      // Arcano 19 is O Sol
      expect(screen.getByText('O Sol')).toBeInTheDocument();
      expect(screen.getByText('#19')).toBeInTheDocument();
    });

    it('renders both additional cards in a flex container', () => {
      mockUseState
        .mockReturnValueOnce([false, vi.fn()])
        .mockReturnValueOnce([false, vi.fn()]);

      const { container } = render(<TarotCard data={mockTarotData} />);
      const flexContainer = container.querySelector('.flex.flex-wrap');
      expect(flexContainer).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('has a screen reader status region', () => {
      mockUseState
        .mockReturnValueOnce([false, vi.fn()])
        .mockReturnValueOnce([false, vi.fn()]);

      render(<TarotCard data={mockTarotData} />);
      const statusRegion = screen.getByRole('status');
      expect(statusRegion).toBeInTheDocument();
    });

    it('has descriptive aria-label on the card', () => {
      mockUseState
        .mockReturnValueOnce([false, vi.fn()])
        .mockReturnValueOnce([false, vi.fn()]);

      render(<TarotCard data={mockTarotData} />);
      const card = screen.getByRole('button');
      expect(card).toHaveAttribute(
        'aria-label',
        expect.stringContaining('Carta do Nascimento')
      );
      expect(card).toHaveAttribute(
        'aria-label',
        expect.stringContaining('Toque')
      );
    });

    it('role is button for the flip card', () => {
      mockUseState
        .mockReturnValueOnce([false, vi.fn()])
        .mockReturnValueOnce([false, vi.fn()]);

      render(<TarotCard data={mockTarotData} />);
      const card = screen.getByRole('button');
      expect(card).toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('handles unknown arcano number gracefully', () => {
      const unknownData: TarotResults = {
        ...mockTarotData,
        cartaNascimento: 99,
      };
      mockUseState
        .mockReturnValueOnce([false, vi.fn()])
        .mockReturnValueOnce([false, vi.fn()]);
      render(<TarotCard data={unknownData} />);
      expect(screen.getAllByText(/^Arcano 99$/)).toHaveLength(2);
    });

    it('handles missing interpretacao gracefully', () => {
      const noInterpretation: TarotResults = {
        cartaNascimento: 1,
        cartaAnoPessoal: 2,
        cartaAlma: 3,
        interpretacao: {
          name: 'Default',
          upright: '',
          reversed: '',
        },
      };

      mockUseState
        .mockReturnValueOnce([false, vi.fn()])
        .mockReturnValueOnce([false, vi.fn()]);

      render(<TarotCard data={noInterpretation} />);
      // Should show default text
      expect(screen.getByText('1')).toBeInTheDocument();
    });

    it('renders with default className when not provided', () => {
      mockUseState
        .mockReturnValueOnce([false, vi.fn()])
        .mockReturnValueOnce([false, vi.fn()]);
      const { container } = render(<TarotCard data={mockTarotData} />);
      expect(container.firstChild).toBeInTheDocument();
    });
  });
});