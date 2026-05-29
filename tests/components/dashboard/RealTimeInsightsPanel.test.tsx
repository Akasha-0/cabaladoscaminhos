import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import { RealTimeInsightsPanel } from '@/components/dashboard/RealTimeInsightsPanel';

// Mock lucide icons
vi.mock('lucide-react', () => ({
  Lightbulb: ({ className }: any) => <div data-testid="lightbulb-icon" className={className}>💡</div>,
  Clock: ({ className }: any) => <div data-testid="clock-icon" className={className}>🕐</div>,
  Eye: ({ className }: any) => <div data-testid="eye-icon" className={className}>👁️</div>,
  Check: ({ className }: any) => <div data-testid="check-icon" className={className}>✓</div>,
  ChevronDown: ({ className }: any) => <div data-testid="chevron-down-icon" className={className}>▼</div>,
  ChevronRight: ({ className }: any) => <div data-testid="chevron-right-icon" className={className}>▶</div>,
  Zap: ({ className }: any) => <div data-testid="zap-icon" className={className}>⚡</div>,
  Activity: ({ className }: any) => <div data-testid="activity-icon" className={className}>📊</div>,
  RefreshCw: ({ className }: any) => <div data-testid="refresh-icon" className={className}>🔄</div>,
}));

describe('RealTimeInsightsPanel', () => {
  const mockInsights = [
    {
      id: 'insight-1',
      type: 'mixed' as const,
      title: 'Test Insight 1',
      description: 'This is a test insight',
      timestamp: new Date().toISOString(),
      read: false,
      priority: 'high' as const,
    },
    {
      id: 'insight-2',
      type: 'spiritual' as const,
      title: 'Test Insight 2',
      description: 'Another test insight',
      timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      read: true,
      priority: 'medium' as const,
    },
  ];

  const defaultProps = {
    insights: mockInsights,
    onInsightClick: vi.fn(),
    onMarkAsRead: vi.fn(),
    onRefresh: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  describe('Rendering', () => {
    it('renders the component', () => {
      render(<RealTimeInsightsPanel {...defaultProps} />);
      expect(screen.getByTestId('lightbulb-icon')).toBeInTheDocument();
    });

    it('renders all insights', () => {
      render(<RealTimeInsightsPanel {...defaultProps} />);
      expect(screen.getByText('Test Insight 1')).toBeInTheDocument();
      expect(screen.getByText('Test Insight 2')).toBeInTheDocument();
    });

    it('displays live indicator', () => {
      render(<RealTimeInsightsPanel {...defaultProps} />);
      expect(screen.getByText('Live')).toBeInTheDocument();
    });
  });

  describe('Unread Count', () => {
    it('shows unread count badge', () => {
      render(<RealTimeInsightsPanel {...defaultProps} />);
      expect(screen.getByText(/\d+ novo\(s\)/)).toBeInTheDocument();
    });
  });

  describe('Expand/Collapse', () => {
    it('expands insight on click', () => {
      render(<RealTimeInsightsPanel {...defaultProps} />);
      
      const insight = screen.getByText('Test Insight 1');
      fireEvent.click(insight);
      
      // Should show expand indicator
      expect(screen.getByTestId('chevron-down-icon')).toBeInTheDocument();
    });
  });

  describe('Mark as Read', () => {
    it('calls onMarkAsRead when marked as read', () => {
      render(<RealTimeInsightsPanel {...defaultProps} />);
      
      // Expand insight
      fireEvent.click(screen.getByText('Test Insight 1'));
      
      // Find and click mark as read button
      const markAsReadButton = screen.getByRole('button', { name: /marcar como lido/i });
      fireEvent.click(markAsReadButton);
      
      expect(defaultProps.onMarkAsRead).toHaveBeenCalledWith('insight-1');
    });
  });

  describe('Refresh', () => {
    it('calls onRefresh when refresh button is clicked', () => {
      render(<RealTimeInsightsPanel {...defaultProps} />);
      
      const refreshButton = screen.getByTestId('refresh-icon');
      fireEvent.click(refreshButton);
      
      expect(defaultProps.onRefresh).toHaveBeenCalled();
    });
  });

  describe('Pause/Resume', () => {
    it('toggles live status when pause button is clicked', () => {
      render(<RealTimeInsightsPanel {...defaultProps} />);
      
      const pauseButton = screen.getByRole('button', { name: /pausar/i });
      fireEvent.click(pauseButton);
      
      expect(screen.getByText('Pausado')).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('handles empty insights array', () => {
      render(<RealTimeInsightsPanel {...defaultProps} insights={[]} />);
      
      expect(screen.getByText('0 insight(s)')).toBeInTheDocument();
    });
  });
});