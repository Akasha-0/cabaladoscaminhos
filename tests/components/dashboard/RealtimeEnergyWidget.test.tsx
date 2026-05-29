import { render, screen } from '@testing-library/react';
import { RealtimeEnergyWidget } from '@/components/dashboard/RealtimeEnergyWidget';

// Mock the useSpiritualEnergy hook
const mockEnergy = {
  orixa: 'Oxalá',
  cor: '#7C6EB3',
  planeta: 'Vênus',
  chakra: 'Coração',
  lunarPhase: 'Lua Nova',
  lunarIllumination: 5,
  activities: ['Meditação', 'Oração', 'Reflexão'],
};

vi.mock('@/lib/hooks/useSpiritualEnergy', () => ({
  useSpiritualEnergy: () => mockEnergy,
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
    expect(screen.getByText(/Dia de/)).toBeInTheDocument();
  });

  it('shows orixá symbol', () => {
    render(<RealtimeEnergyWidget />);
    expect(screen.getByText('✧')).toBeInTheDocument(); // Oxalá's symbol
  });

  it('shows planet and chakra info', () => {
    render(<RealtimeEnergyWidget />);
    expect(screen.getByText(/Vênus/)).toBeInTheDocument();
    expect(screen.getByText(/Coração/)).toBeInTheDocument();
  });

  it('renders lunar phase section', () => {
    render(<RealtimeEnergyWidget />);
    expect(screen.getByText(/Lua Nova/)).toBeInTheDocument();
    expect(screen.getByText(/5% iluminada/)).toBeInTheDocument();
  });

  it('shows favorable activities', () => {
    render(<RealtimeEnergyWidget />);
    expect(screen.getByText('Atividades Favoráveis')).toBeInTheDocument();
    expect(screen.getByText('Meditação')).toBeInTheDocument();
    expect(screen.getByText('Oração')).toBeInTheDocument();
    expect(screen.getByText('Reflexão')).toBeInTheDocument();
  });

  it('renders all activity tags', () => {
    render(<RealtimeEnergyWidget />);
    const activities = screen.getAllByText(/^(Meditação|Oração|Reflexão)$/);
    expect(activities).toHaveLength(3);
  });
});
