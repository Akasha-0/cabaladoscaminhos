import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MoonRitualPlanner } from '@/components/dashboard/MoonRitualPlanner';

// Mock the moon calculator to return predictable values
vi.mock('@/lib/astrologia/moon-calculator', () => ({
  getMoonPhaseInfo: vi.fn(() => ({
    phase: 'full',
    name: 'Lua Cheia',
    emoji: '🌕',
    illumination: 100,
    daysIntoPhase: 14,
    daysUntilNextPhase: 15,
    isWaxing: false,
  })),
  getUpcoming7Days: vi.fn(() => [
    { date: new Date(), phase: 'full', name: 'Lua Cheia' },
    { date: new Date(Date.now() + 86400000), phase: 'waningGibbous', name: 'Gib. Minguante' },
    { date: new Date(Date.now() + 86400000 * 2), phase: 'lastQuarter', name: 'Quarto Meng.' },
  ]),
  isCurrentlyVoidOfCourse: vi.fn(() => false),
  getNextVoidOfCourse: vi.fn(() => null),
  getBestRitualTime: vi.fn(() => ({
    start: new Date(),
    end: new Date(Date.now() + 7200000),
    quality: 'good' as const,
  })),
}));

describe('MoonRitualPlanner', () => {
  it('renders without crashing', () => {
    render(<MoonRitualPlanner />);
    // Component should render without throwing
  });

  it('displays the lunar ritual title', () => {
    render(<MoonRitualPlanner />);
    expect(screen.getByText('Ritual Lunar')).toBeDefined();
  });
});
