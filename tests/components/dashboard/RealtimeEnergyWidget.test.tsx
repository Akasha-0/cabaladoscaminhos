import { render, screen } from '@testing-library/react';
import { RealtimeEnergyWidget } from '@/components/dashboard/RealtimeEnergyWidget';

// Mock the useTodayCorrelation hook
const mockCorrelation = {
  dayName: 'friday',
  dayNamePt: 'Sexta-feira',
  orixa: 'Oxalá',
  chakra: '7º Coronário',
  planet: 'Vênus',
  sefirah: 'Kether',
  element: 'Éter',
  elementEmoji: '✨',
  primaryColor: '#ffffff',
  secondaryColor: '#9333ea',
  mystery: 'Paz, pureza, silêncio, gratidão e conexão direta com o Divino.',
};

vi.mock('@/lib/correlation/useTodayCorrelation', () => ({
  useTodayCorrelation: () => mockCorrelation,
}));

// Mock moon phases
vi.mock('@/lib/calendar/moon-phases', () => ({
  getMoonPhases: () => ({
    phase: {
      name: 'full',
      displayName: 'Lua Cheia',
      emoji: '🌕',
      illumination: 98,
    },
  }),
}));

// Mock solfeggio frequencies
vi.mock('@/lib/frequency/frequency-data', () => ({
  SOLFEGGIO_FREQUENCIES: [
    { id: 'sol-741', hz: 741, name: 'Expansão Espiritual', mantra: 'YAM' },
    { id: 'sol-528', hz: 528, name: 'Milagre', mantra: 'RAM' },
  ],
}));

// Mock UI components
vi.mock('@/components/ui/card', () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardTitle: ({ children }: { children: React.ReactNode }) => <h3>{children}</h3>,
}));

describe('RealtimeEnergyWidget', () => {
  it('renders energy section title', () => {
    render(<RealtimeEnergyWidget />);
    expect(screen.getByText('Energia Espiritual')).toBeInTheDocument();
  });

  it('displays current day orixá', () => {
    render(<RealtimeEnergyWidget />);
    expect(screen.getByText('Oxalá')).toBeInTheDocument();
  });

  it('shows element of the day with emoji', () => {
    render(<RealtimeEnergyWidget />);
    expect(screen.getByText(/Elemento: Éter/)).toBeInTheDocument();
    expect(screen.getAllByText('✨').length).toBeGreaterThan(0);
  });

  it('renders lunar phase section', () => {
    render(<RealtimeEnergyWidget />);
    expect(screen.getByText(/Lua Cheia/)).toBeInTheDocument();
    expect(screen.getByText(/98% iluminada/)).toBeInTheDocument();
  });

  it('shows Solfeggio frequency', () => {
    render(<RealtimeEnergyWidget />);
    expect(screen.getByText(/741Hz/)).toBeInTheDocument();
    expect(screen.getByText('Solfeggio')).toBeInTheDocument();
  });

  it('displays planet information', () => {
    render(<RealtimeEnergyWidget />);
    expect(screen.getByText('Vênus')).toBeInTheDocument();
    expect(screen.getByText('Planeta')).toBeInTheDocument();
  });

  it('shows mystery of the day', () => {
    render(<RealtimeEnergyWidget />);
    expect(screen.getByText(/Paz, pureza, silêncio/)).toBeInTheDocument();
  });

  it('renders chakra information', () => {
    render(<RealtimeEnergyWidget />);
    expect(screen.getByText('7º Coronário')).toBeInTheDocument();
  });

  it('shows active chakras section', () => {
    render(<RealtimeEnergyWidget />);
    expect(screen.getByText('Chakras Ativos')).toBeInTheDocument();
  });
});
