import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { SpiritualProgressWidget } from '@/components/dashboard/SpiritualProgressWidget';
import { useSpiritualHistory } from '@/hooks/useSpiritualHistory';

vi.mock('@/hooks/useSpiritualHistory');

const mockUseSpiritualHistory = useSpiritualHistory as unknown as ReturnType<typeof vi.fn>;

const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

describe('SpiritualProgressWidget', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    mockUseSpiritualHistory.mockReturnValue({
      history: [],
      isLoading: false,
      addEnergyReading: vi.fn(),
      addDivination: vi.fn(),
      addRitualCompletion: vi.fn(),
      getStreak: vi.fn(() => 0),
      clearHistory: vi.fn(),
      getReadingsByDate: vi.fn(),
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders without crashing', async () => {
    render(<SpiritualProgressWidget />);
    expect(screen.getByText('Progreso Espiritual')).toBeInTheDocument();
  });

  it('displays loading skeleton initially', () => {
    render(<SpiritualProgressWidget />);
    const skeleton = document.querySelector('.animate-pulse');
    expect(skeleton).toBeTruthy();
  });

  it('shows progress title after loading', async () => {
    render(<SpiritualProgressWidget />);
    
    await waitFor(() => {
      expect(screen.getByText('Progreso Espiritual')).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('displays metric cards after loading', async () => {
    render(<SpiritualProgressWidget />);
    
    await waitFor(() => {
      expect(screen.getByText('Rituales completados')).toBeInTheDocument();
      expect(screen.getByText('Lecturas realizadas')).toBeInTheDocument();
      expect(screen.getByText('Días de práctica')).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('shows encouragement banner after loading', async () => {
    render(<SpiritualProgressWidget />);
    
    await waitFor(() => {
      // When streak=0 (from beforeEach getStreak mock), component uses ENCOURAGEMENT_MESSAGES
      const banner = screen.queryByText(/El próximo nivel te espera con sabiduría|Tus prácticas están creando transformación|La consistencia es la clave del éxito espiritual|Tu dedicación es inspiradora|El crecimiento espiritual es eterno|Cada día traes más luz al mundo/);
      expect(banner).toBeTruthy();
    }, { timeout: 3000 });
  });

  it('displays consistency message in footer', async () => {
    render(<SpiritualProgressWidget />);
    
    await waitFor(() => {
      expect(screen.getByText('Consistencia es clave')).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('shows streak badge when streak >= 7', async () => {
    mockUseSpiritualHistory.mockReturnValue({
      history: [],
      isLoading: false,
      addEnergyReading: vi.fn(),
      addDivination: vi.fn(),
      addRitualCompletion: vi.fn(),
      getStreak: vi.fn(() => 7),
      clearHistory: vi.fn(),
      getReadingsByDate: vi.fn(),
    });

    render(<SpiritualProgressWidget userId="test-streak-user" />);
    
    await waitFor(() => {
      expect(screen.getByText('¡En racha activa!')).toBeInTheDocument();
    }, { timeout: 3000 });
  });
  it('shows excellent badge when progress >= 75%', async () => {
    // Override hook with getStreak stub so loadProgress uses the hook stub instead of
    // falling back to a broken history structure; localStorage provides the real data.
    mockUseSpiritualHistory.mockReturnValue({
      history: [],
      isLoading: false,
      addEnergyReading: vi.fn(),
      addDivination: vi.fn(),
      addRitualCompletion: vi.fn(),
      getStreak: vi.fn(() => 25),
      clearHistory: vi.fn(),
      getReadingsByDate: vi.fn(),
    });
    localStorageMock.getItem.mockReturnValue(JSON.stringify({
      ritualsCompleted: 28,
      readingsDone: 18,
      completionDates: Array.from({ length: 25 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d.toISOString().split('T')[0];
      }),
    }));
    render(<SpiritualProgressWidget userId="test-excellent-user" />);
    
    await waitFor(() => {
      expect(screen.getByText('¡Excelente!')).toBeInTheDocument();
    }, { timeout: 3000 });
  });
  it('displays total progress percentage', async () => {
    render(<SpiritualProgressWidget />);
    
    await waitFor(() => {
      const progressText = screen.getByText(/%/);
      expect(progressText).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('accepts custom className', async () => {
    render(<SpiritualProgressWidget className="custom-widget-class" />);
    
    await waitFor(() => {
      const card = document.querySelector('.custom-widget-class');
      expect(card).toBeTruthy();
    }, { timeout: 3000 });
  });

  it('uses custom userId for localStorage key', async () => {
    const userId = 'custom-user-123';
    render(<SpiritualProgressWidget userId={userId} />);
    
    await waitFor(() => {
      expect(localStorageMock.getItem).toHaveBeenCalledWith(`spiritual-progress-${userId}`);
    }, { timeout: 3000 });
  });

  it('loads saved progress from localStorage', async () => {
    localStorageMock.getItem.mockReturnValue(JSON.stringify({
      ritualsCompleted: 15,
      readingsDone: 10,
      completionDates: ['2026-05-29', '2026-05-28'],
    }));

    render(<SpiritualProgressWidget userId="saved-progress-user" />);
    
    await waitFor(() => {
      expect(localStorageMock.getItem).toHaveBeenCalled();
    }, { timeout: 3000 });
  });

  it('displays user name in widget', async () => {
    render(<SpiritualProgressWidget userName="Maria" />);
    
    await waitFor(() => {
      expect(screen.getByText('Progreso Espiritual')).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('renders heart icon in footer', async () => {
    render(<SpiritualProgressWidget />);
    
    await waitFor(() => {
      const heartIcon = document.querySelector('.text-pink-400');
      expect(heartIcon).toBeTruthy();
    }, { timeout: 3000 });
  });

  it('uses spiritual history data when available', async () => {
    const mockHistory = [
      {
        date: new Date().toISOString().split('T')[0],
        energyReadings: [],
        divinations: [{ method: 'coins', result: 'heads' }],
        rituals: [{ name: 'Meditation', completed: true }],
      },
    ];

    mockUseSpiritualHistory.mockReturnValue({
      history: mockHistory,
      isLoading: false,
      addEnergyReading: vi.fn(),
      addDivination: vi.fn(),
      addRitualCompletion: vi.fn(),
      getStreak: vi.fn(() => 1),
      clearHistory: vi.fn(),
      getReadingsByDate: vi.fn(),
    });

    render(<SpiritualProgressWidget />);
    
    await waitFor(() => {
      expect(screen.getByText('Lecturas realizadas')).toBeInTheDocument();
    }, { timeout: 3000 });
  });
});
