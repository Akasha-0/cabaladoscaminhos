import { render, screen } from '@testing-library/react';
import { SpiritualRadarChart } from '@/components/dashboard/SpiritualRadarChart';

describe('SpiritualRadarChart', () => {
  const mockUserData = {
    nome: 'Maria Silva',
    dataNascimento: '1990-05-15',
  };

  const mockCurrentLevels = {
    numerologia: 75,
    astrologia: 80,
    orixas: 65,
    tarot: 70,
    cabala: 55,
    ifa: 40,
  };

  const mockPreviousLevels = {
    numerologia: 70,
    astrologia: 75,
    orixas: 60,
    tarot: 65,
    cabala: 50,
    ifa: 35,
  };

  it('renders without crashing', () => {
    render(<SpiritualRadarChart userData={mockUserData} />);
    expect(screen.getByText('Mapa Espiritual')).toBeInTheDocument();
  });

  it('displays user name in badge', () => {
    render(<SpiritualRadarChart userData={mockUserData} />);
    expect(screen.getByText('Maria Silva')).toBeInTheDocument();
  });

  it('renders with custom levels', () => {
    render(
      <SpiritualRadarChart 
        userData={mockUserData} 
        currentLevels={mockCurrentLevels} 
      />
    );
    expect(screen.getByText('Mapa Espiritual')).toBeInTheDocument();
  });

  it('renders with comparison mode', () => {
    render(
      <SpiritualRadarChart 
        userData={mockUserData} 
        currentLevels={mockCurrentLevels}
        previousLevels={mockPreviousLevels}
      />
    );
    expect(screen.getByText('Comparar')).toBeInTheDocument();
  });

  it('renders trend tab', () => {
    render(
      <SpiritualRadarChart 
        userData={mockUserData} 
        showTrend={true}
      />
    );
    expect(screen.getByText('Tendência')).toBeInTheDocument();
  });

  it('renders all system labels', () => {
    render(<SpiritualRadarChart userData={mockUserData} />);
    expect(screen.getAllByText('Numerologia')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Astrologia')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Orixás')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Tarot')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Cabala')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Ifá')[0]).toBeInTheDocument();
  });
});
