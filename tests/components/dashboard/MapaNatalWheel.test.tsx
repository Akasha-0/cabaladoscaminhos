/** @vitest-environment jsdom */
import { render, screen } from '@testing-library/react';
import { MapaNatalWheel } from '@/components/dashboard/MapaNatalWheel';

describe('MapaNatalWheel', () => {
  const mockData = {
    sun: { planeta: 'Sol', signo: 'Leão', grau: 15, minuto: 30 },
    moon: { planeta: 'Lua', signo: 'Câncer', grau: 22, minuto: 45 },
    mercury: { planeta: 'Mercurio', signo: 'Virgem', grau: 8, minuto: 15 },
    venus: { planeta: 'Venus', signo: 'Libra', grau: 3, minuto: 0 },
    mars: { planeta: 'Marte', signo: 'Escorpião', grau: 27, minuto: 20 },
    jupiter: { planeta: 'Jupiter', signo: 'Sagitário', grau: 12, minuto: 10 },
    saturn: { planeta: 'Saturno', signo: 'Capricórnio', grau: 5, minuto: 30 },
    houses: [
      { casa: 1, signo: 'Leão', grau: 15 }, { casa: 2, signo: 'Virgem', grau: 8 }, { casa: 3, signo: 'Libra', grau: 3 },
      { casa: 4, signo: 'Escorpião', grau: 27 }, { casa: 5, signo: 'Sagitário', grau: 12 }, { casa: 6, signo: 'Capricórnio', grau: 5 },
      { casa: 7, signo: 'Aquário', grau: 15 }, { casa: 8, signo: 'Peixes', grau: 8 }, { casa: 9, signo: 'Áries', grau: 3 },
      { casa: 10, signo: 'Touro', grau: 27 }, { casa: 11, signo: 'Gêmeos', grau: 12 }, { casa: 12, signo: 'Câncer', grau: 5 },
    ],
  };

  it('renders SVG wheel structure', () => {
    render(<MapaNatalWheel data={mockData} />);
    expect(document.querySelector('svg')).toBeInTheDocument();
  });

  it('renders with correct viewBox for md size', () => {
    render(<MapaNatalWheel data={mockData} size="md" />);
    expect(document.querySelector('svg')).toHaveAttribute('viewBox', '0 0 500 500');
  });

  it('renders zodiac ring', () => {
    render(<MapaNatalWheel data={mockData} />);
    expect(document.querySelector('.zodiac-ring')).toBeInTheDocument();
  });

  it('renders house cusp ring', () => {
    render(<MapaNatalWheel data={mockData} />);
    expect(document.querySelector('.house-cusp-ring')).toBeInTheDocument();
  });

  it('renders planet ring', () => {
    render(<MapaNatalWheel data={mockData} />);
    expect(document.querySelector('.planet-ring')).toBeInTheDocument();
  });

  it('renders axis lines', () => {
    render(<MapaNatalWheel data={mockData} />);
    expect(document.querySelector('.axis-lines')).toBeInTheDocument();
  });

  it('renders ASC and MC labels', () => {
    render(<MapaNatalWheel data={mockData} />);
    const svg = document.querySelector('svg');
    expect(svg?.textContent).toContain('ASC');
    expect(svg?.textContent).toContain('MC');
    expect(svg?.textContent).toContain('DSC');
    expect(svg?.textContent).toContain('IC');
  });

  it('displays planet symbols', () => {
    render(<MapaNatalWheel data={mockData} />);
    const svg = document.querySelector('svg');
    expect(svg?.textContent).toContain('☉');
    expect(svg?.textContent).toContain('☽');
  });

  it('renders aspect lines when enabled', () => {
    render(<MapaNatalWheel data={mockData} showAspects={true} />);
    expect(document.querySelector('.aspect-lines')).toBeInTheDocument();
  });

  it('renders with dark theme', () => {
    render(<MapaNatalWheel data={mockData} theme="dark" />);
    expect(document.querySelector('svg')).toBeInTheDocument();
  });

  it('renders with light theme', () => {
    render(<MapaNatalWheel data={mockData} theme="light" />);
    expect(document.querySelector('svg')).toBeInTheDocument();
  });

  it('has aria-label for accessibility', () => {
    render(<MapaNatalWheel data={mockData} />);
    expect(document.querySelector('svg[role="img"]')).toHaveAttribute('aria-label', 'Mapa Natal - Roda Astrológica');
  });

  it('displays house numbers', () => {
    render(<MapaNatalWheel data={mockData} />);
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
  });

  it('renders element legend', () => {
    render(<MapaNatalWheel data={mockData} />);
    expect(screen.getByText('Fogo')).toBeInTheDocument();
    expect(screen.getByText('Terra')).toBeInTheDocument();
  });

  it('renders loading skeleton when data is null', () => {
    render(<MapaNatalWheel data={null as any} />);
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
  });
});
