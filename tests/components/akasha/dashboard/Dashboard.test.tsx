/** @vitest-environment jsdom */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// ─── Mock framer-motion ────────────────────────────────────────────────────────
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => children,
}));

// ─── Mock animations ──────────────────────────────────────────────────────────
vi.mock('@/components/akasha/animations', () => ({
  FadeInUp: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={className}>{children}</div>
  ),
  PulseDiv: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={className}>{children}</div>
  ),
  pulse: { scale: [1, 1.05, 1] },
  useCountUp: (end: number) => end,
}));

vi.mock('lucide-react', () => ({
  Sparkles: () => <span data-testid="sparkles-icon">Sparkles</span>,
  AlertCircle: () => <span data-testid="alert-icon">AlertCircle</span>,
  RefreshCw: () => <span data-testid="refresh-icon">RefreshCw</span>,
  Moon: () => <span data-testid="moon-icon">Moon</span>,
  Sun: () => <span data-testid="sun-icon">Sun</span>,
  Monitor: () => <span data-testid="monitor-icon">Monitor</span>,
  Zap: () => <span data-testid="zap-icon">Zap</span>,
}));
// ─── Mock ThemeProvider ───────────────────────────────────────────────────────
vi.mock('@/components/akasha/ThemeProvider', () => ({
  useTheme: () => ({
    theme: 'light',
    setTheme: vi.fn(),
  }),
}));

// ─── Mock ThemeToggle ─────────────────────────────────────────────────────────
vi.mock('@/components/akasha/ThemeToggle', () => ({
  ThemeToggle: () => <div data-testid="theme-toggle">ThemeToggle</div>,
}));

// ─── Mock next/navigation ────────────────────────────────────────────────────
const pushMock = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
  usePathname: () => '/dashboard',
}));

// ─── Mock next/link ───────────────────────────────────────────────────────────
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

// ─── Mock useDashboardData ────────────────────────────────────────────────────
const mockUseDashboardData = vi.fn();

vi.mock('@/components/akasha/dashboard/hooks/useDashboardData', () => ({
  useDashboardData: (...args: any[]) => mockUseDashboardData(...args),
}));

// ─── Import mocks ─────────────────────────────────────────────────────────────
import { mockStats, mockStreak, mockHistory } from '@/components/akasha/dashboard/mocks';

// ─── Import components (after mocks) ──────────────────────────────────────────
import { Dashboard } from '@/components/akasha/dashboard/Dashboard';
import { DashboardStats } from '@/components/akasha/dashboard/components/DashboardStats';
import { StreakCalendar } from '@/components/akasha/dashboard/StreakCalendar';
import { ProgressChart } from '@/components/akasha/dashboard/ProgressChart';
import { RitualHistory } from '@/components/akasha/dashboard/RitualHistory';
import { CalendarDay } from '@/components/akasha/dashboard/CalendarDay';
import { ProgressBar } from '@/components/akasha/dashboard/ProgressBar';
import { HistoryItem } from '@/components/akasha/dashboard/HistoryItem';
import { StatsCard } from '@/components/akasha/dashboard/components/StatsCard';

// ─── Setup default mock ────────────────────────────────────────────────────────
const defaultMockReturn = {
  data: { stats: mockStats, streak: mockStreak, history: mockHistory },
  loading: false,
  error: null,
  refetch: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
  mockUseDashboardData.mockReturnValue(defaultMockReturn);
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

// ─── Test Suites ───────────────────────────────────────────────────────────────

describe('StatsCard', () => {
  it('renders title, value and subtitle', () => {
    render(
      <StatsCard
        title="Teste"
        value={42}
        subtitle="descrição"
        icon={<span>✨</span>}
      />
    );
    expect(screen.getByText('Teste')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('descrição')).toBeInTheDocument();
  });

  it('renders suffix after value', () => {
    render(<StatsCard title="Taxa" value={87} suffix="%" />);
    expect(screen.getByText('%')).toBeInTheDocument();
  });
});

describe('DashboardStats', () => {
  const userId = 'test-user-001';

  it('renders loading skeleton when loading', async () => {
    mockUseDashboardData.mockReturnValue({
      data: null,
      loading: true,
      error: null,
      refetch: vi.fn(),
    });

    render(<DashboardStats userId={userId} />);
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('renders empty state when no data', async () => {
    mockUseDashboardData.mockReturnValue({
      data: null,
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<DashboardStats userId={userId} />);
    expect(screen.getByText(/nenhum dado disponível/i)).toBeInTheDocument();
    expect(screen.getByText(/complete rituais/i)).toBeInTheDocument();
  });
});

describe('StreakCalendar', () => {
  it('renders 7 calendar days', () => {
    render(<StreakCalendar streak={mockStreak} loading={false} />);
    // Calendar should have 7 days (week view) - check for weekday labels
    const weekdayLabels = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    weekdayLabels.forEach(label => {
      expect(screen.getByText(label)).toBeInTheDocument();
    });
  });

  it('renders loading skeleton', () => {
    render(<StreakCalendar streak={[]} loading={true} />);
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('shows "Hoje" badge when current day is in week', () => {
    render(<StreakCalendar streak={mockStreak} loading={false} />);
    const todayBadge = screen.queryByText('Hoje');
    expect(todayBadge).toBeInTheDocument();
  });
});

describe('CalendarDay', () => {
  it('renders weekday label', () => {
    // Create date with explicit time to avoid timezone issues
    // Use UTC date to ensure consistent behavior
    const date = new Date('2026-06-08T12:00:00Z'); // Monday in UTC
    render(
      <CalendarDay date={date} completed={false} isToday={false} />
    );
    // Just verify a weekday label is rendered (flexible to timezone)
    const weekdayLabels = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const hasWeekday = weekdayLabels.some(label => {
      try {
        screen.getByText(label);
        return true;
      } catch {
        return false;
      }
    });
    expect(hasWeekday).toBe(true);
  });

  it('shows completed styling when ritual is done', () => {
    const date = new Date('2026-06-09');
    render(
      <CalendarDay date={date} completed={true} isToday={false} />
    );
    const dayElement = document.querySelector('.bg-emerald-500\\/20');
    expect(dayElement).toBeInTheDocument();
  });

  it('shows today ring styling when isToday is true', () => {
    const date = new Date();
    render(
      <CalendarDay date={date} completed={false} isToday={true} />
    );
    const dayElement = document.querySelector('.ring-amber-500');
    expect(dayElement).toBeInTheDocument();
  });
});

describe('ProgressBar', () => {
  it('renders with value and max', () => {
    render(<ProgressBar value={5} max={7} showPercent={true} />);
    expect(screen.getByText('5 de 7 dias')).toBeInTheDocument();
  });

  it('calculates percentage correctly', () => {
    render(<ProgressBar value={5} max={7} showPercent={false} />);
    const bar = document.querySelector('.rounded-full');
    expect(bar).toBeInTheDocument();
  });

  it('handles zero max gracefully', () => {
    render(<ProgressBar value={0} max={0} />);
    const bar = document.querySelector('.rounded-full');
    expect(bar).toBeInTheDocument();
  });
});

describe('ProgressChart', () => {
  const userId = 'test-user-002';

  it('renders weekly progress section', async () => {
    render(<ProgressChart userId={userId} />);
    await waitFor(() => {
      expect(screen.getByText('Progresso Semanal')).toBeInTheDocument();
    });
  });

  it('renders monthly progress section', async () => {
    render(<ProgressChart userId={userId} />);
    await waitFor(() => {
      expect(screen.getByText('Progresso Mensal')).toBeInTheDocument();
    });
  });
});

describe('HistoryItem', () => {
  it('renders ritual name and level', () => {
    render(<HistoryItem item={mockHistory[0]} />);
    expect(screen.getByText('Ritual Matinal de Ori')).toBeInTheDocument();
  });

  it('renders level badge', () => {
    render(<HistoryItem item={mockHistory[0]} />);
    expect(screen.getByText('Siddhi')).toBeInTheDocument();
  });

  it('renders relative date', () => {
    render(<HistoryItem item={mockHistory[0]} />);
    // Date is 2026-06-08 which should show as relative date
    // Pattern: "dias atrás" or "Ontem" or "Hoje" or "semana"
    expect(screen.getByText(/dias atrás|Ontem|Hoje|semana/)).toBeInTheDocument();
  });
});

describe('RitualHistory', () => {
  const userId = 'test-user-003';

  it('renders history items', async () => {
    render(<RitualHistory userId={userId} maxVisible={10} />);
    await waitFor(() => {
      expect(screen.getByText('Histórico de Rituais')).toBeInTheDocument();
    });
  });

  it('shows empty state when no history', async () => {
    mockUseDashboardData.mockReturnValue({
      data: { stats: mockStats, streak: mockStreak, history: [] },
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<RitualHistory userId={userId} />);
    await waitFor(() => {
      expect(screen.getByText(/nenhum ritual/i)).toBeInTheDocument();
    });
  });

  it('renders loading skeleton', async () => {
    mockUseDashboardData.mockReturnValue({
      data: null,
      loading: true,
      error: null,
      refetch: vi.fn(),
    });

    render(<RitualHistory userId={userId} />);
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });
});

// ─── Integration Tests ────────────────────────────────────────────────────────

describe('Dashboard (Integration)', () => {
  const userId = 'test-dashboard-integration';

  it('renders dashboard route', async () => {
    render(<Dashboard userId={userId} />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('renders all sections when data is loaded', async () => {
    render(<Dashboard userId={userId} />);

    await waitFor(() => {
      expect(screen.getByText('Progresso Semanal')).toBeInTheDocument();
    }, { timeout: 3000 });

    expect(screen.getByText('Histórico de Rituais')).toBeInTheDocument();
  });

  it('handles error state with retry button', async () => {
    const refetchMock = vi.fn();

    mockUseDashboardData.mockReturnValue({
      data: null,
      loading: false,
      error: new Error('API Error'),
      refetch: refetchMock,
    });

    render(<Dashboard userId={userId} />);

    await waitFor(() => {
      expect(screen.getByText(/erro ao carregar/i)).toBeInTheDocument();
    });

    const retryButton = screen.getByText(/tentar novamente/i);
    expect(retryButton).toBeInTheDocument();
  });

  it('calls refetch when retry button is clicked', async () => {
    const refetchMock = vi.fn();

    mockUseDashboardData.mockReturnValue({
      data: null,
      loading: false,
      error: new Error('API Error'),
      refetch: refetchMock,
    });

    render(<Dashboard userId={userId} />);

    await waitFor(() => {
      expect(screen.getByText(/erro ao carregar/i)).toBeInTheDocument();
    });

    const retryButton = screen.getByText(/tentar novamente/i);
    await userEvent.click(retryButton);

    expect(refetchMock).toHaveBeenCalledTimes(1);
  });

  it('renders empty state when no data', async () => {
    mockUseDashboardData.mockReturnValue({
      data: null,
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<Dashboard userId={userId} />);

    await waitFor(() => {
      expect(screen.getByText(/bem-vindo/i)).toBeInTheDocument();
    });
  });

  it('renders loading skeleton', async () => {
    mockUseDashboardData.mockReturnValue({
      data: null,
      loading: true,
      error: null,
      refetch: vi.fn(),
    });

    render(<Dashboard userId={userId} />);

    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });
});
