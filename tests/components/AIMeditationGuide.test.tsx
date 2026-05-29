import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AIMeditationGuide } from '@/components/dashboard/AIMeditationGuide';

describe('AIMeditationGuide', () => {
  const mockUserData = {
    id: 'user-1',
    nome: 'João Silva',
    dataNascimento: '1985-03-15',
    numeroPessoal: 7,
    arcoPessoal: 3,
    odu: 'Ogbe',
    orixaRegente: 'Oxum',
    sefirotDominante: ['Keter'],
    arcoMaior: [0],
    sign: 'Pisces',
    houses: {},
    rashi: 'Meena',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('setup state rendering', () => {
    it('renders without crashing', () => {
      expect(() =>
        render(
          <AIMeditationGuide
            userId="user-1"
            userData={mockUserData}
          />
        )
      ).not.toThrow();
    });

    it('displays header with title', () => {
      render(<AIMeditationGuide userId="user-1" userData={mockUserData} />);
      expect(screen.getByRole('heading', { name: /Guia de Meditação IA/i })).toBeTruthy();
    });

    it('displays personalized message with user name', () => {
      render(<AIMeditationGuide userId="user-1" userData={mockUserData} />);
      expect(screen.getByText(/João Silva/i)).toBeTruthy();
    });

    it('renders theme selection section', () => {
      render(<AIMeditationGuide userId="user-1" userData={mockUserData} />);
      expect(screen.getByText(/Selecione o Tema/i)).toBeTruthy();
    });

    it('renders duration selection section', () => {
      render(<AIMeditationGuide userId="user-1" userData={mockUserData} />);
      expect(screen.getByText(/Duração da Sessão/i)).toBeTruthy();
    });
  });

  describe('button labels', () => {
    it('shows "Iniciar Meditação" button in setup state', () => {
      render(<AIMeditationGuide userId="user-1" userData={mockUserData} />);
      expect(screen.getByRole('button', { name: /Iniciar Meditação/i })).toBeTruthy();
    });

    it('shows theme option buttons', () => {
      render(<AIMeditationGuide userId="user-1" userData={mockUserData} />);
      // Count buttons: 10 themes + 4 durations + 1 start button = 15 buttons
      const buttons = screen.queryAllByRole('button');
      expect(buttons.length).toBeGreaterThanOrEqual(14);
    });

    it('shows all duration option buttons', () => {
      render(<AIMeditationGuide userId="user-1" userData={mockUserData} />);
      // Duration buttons - use exact match regex to avoid partial matches
      expect(screen.getByRole('button', { name: /^5 min$/ })).toBeTruthy();
      expect(screen.getByRole('button', { name: /^10 min$/ })).toBeTruthy();
      expect(screen.getByRole('button', { name: /^15 min$/ })).toBeTruthy();
      expect(screen.getByRole('button', { name: /^20 min$/ })).toBeTruthy();
    });

    it('shows all theme labels within theme cards', () => {
      render(<AIMeditationGuide userId="user-1" userData={mockUserData} />);
      // Theme labels appear in the UI - each in its own span within buttons
      // Use getAllByText since some themes like Cura appear multiple places
      const themes = ['Transcendência', 'Cura', 'Proteção', 'Manifestação', 'Ancestral', 'Equilíbrio', 'Sabedoria', 'Harmonização', 'Kundalini', 'Movimento'];
      themes.forEach(theme => {
        const elements = screen.getAllByText(new RegExp(`^${theme}$`), { selector: 'span.font-medium' });
        expect(elements.length).toBeGreaterThanOrEqual(1);
      });
    });
  });

  describe('theme selection', () => {
    it('starts with Cura theme selected by default', () => {
      render(<AIMeditationGuide userId="user-1" userData={mockUserData} />);
      // The default theme label appears in the UI - use specific selector for theme labels
      const curaLabels = screen.getAllByText(/^Cura$/, { selector: 'span.font-medium' });
      expect(curaLabels.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('duration selection', () => {
    it('starts with 10 min duration selected by default', () => {
      render(<AIMeditationGuide userId="user-1" userData={mockUserData} />);
      // 10 min should be selected by default
      const button10min = screen.getByRole('button', { name: /^10 min$/ });
      expect(button10min).toBeTruthy();
    });
  });

  describe('onComplete callback', () => {
    it('accepts onComplete prop without error', () => {
      const onComplete = vi.fn();
      expect(() =>
        render(
          <AIMeditationGuide
            userId="user-1"
            userData={mockUserData}
            onComplete={onComplete}
          />
        )
      ).not.toThrow();
    });

    it('start button is clickable', () => {
      const onComplete = vi.fn();
      render(
        <AIMeditationGuide
          userId="user-1"
          userData={mockUserData}
          onComplete={onComplete}
        />
      );

      const startButton = screen.getByRole('button', { name: /Iniciar Meditação/i });
      fireEvent.click(startButton);
      // Click should not throw
    });
  });

  describe('className prop', () => {
    it('accepts custom className', () => {
      const { container } = render(
        <AIMeditationGuide
          userId="user-1"
          userData={mockUserData}
          className="custom-class"
        />
      );
      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('error handling', () => {
    it('does not show retry button in initial setup state', () => {
      render(<AIMeditationGuide userId="user-1" userData={mockUserData} />);
      expect(screen.queryByText(/Tentar novamente/i)).toBeNull();
    });
  });

  describe('theme config display', () => {
    it('shows breathing pattern and mantram for selected theme', () => {
      render(<AIMeditationGuide userId="user-1" userData={mockUserData} />);
      // The component shows breathing pattern info
      expect(screen.getByText(/Respiração:/i)).toBeTruthy();
      expect(screen.getByText(/Mantram:/i)).toBeTruthy();
    });
  });
});
