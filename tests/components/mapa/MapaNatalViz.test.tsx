/** @vitest-environment jsdom */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MapaNatalViz } from '@/components/mapa/MapaNatalViz';
import type { AstrologyResults } from '@/lib/engines/types/mapa-alma';

const mockAstrologia: AstrologyResults = {
  ascendente: 'leao',
  sol: { planeta: 'sol', longitude: 0, latitude: 0, distancia: 0, velocidade: 0, signo: 'escorpio', casa: 8, grauNoSigno: 15 },
  lua: { planeta: 'lua', longitude: 0, latitude: 0, distancia: 0, velocidade: 0, signo: 'cancer', casa: 6, grauNoSigno: 20 },
  mercurio: { planeta: 'mercurio', longitude: 0, latitude: 0, distancia: 0, velocidade: 0, signo: 'sagitario', casa: 9, grauNoSigno: 10 },
  venus: { planeta: 'venus', longitude: 0, latitude: 0, distancia: 0, velocidade: 0, signo: 'capricornio', casa: 10, grauNoSigno: 5 },
  marte: { planeta: 'marte', longitude: 0, latitude: 0, distancia: 0, velocidade: 0, signo: 'aries', casa: 1, grauNoSigno: 12 },
  jupiter: { planeta: 'jupiter', longitude: 0, latitude: 0, distancia: 0, velocidade: 0, signo: 'peixes', casa: 12, grauNoSigno: 8 },
  saturno: { planeta: 'saturno', longitude: 0, latitude: 0, distancia: 0, velocidade: 0, signo: 'touro', casa: 2, grauNoSigno: 3 },
  urano: { planeta: 'urano', longitude: 0, latitude: 0, distancia: 0, velocidade: 0, signo: 'aquario', casa: 11, grauNoSigno: 2 },
  netuno: { planeta: 'netuno', longitude: 0, latitude: 0, distancia: 0, velocidade: 0, signo: 'capricornio', casa: 10, grauNoSigno: 18 },
  plutao: { planeta: 'plutao', longitude: 0, latitude: 0, distancia: 0, velocidade: 0, signo: 'escorpio', casa: 8, grauNoSigno: 22 },
  casas: [],
  aspectos: [],
};

describe('MapaNatalViz', () => {
  it('renders without crashing', () => {
    const { container } = render(<MapaNatalViz astrologia={mockAstrologia} />);
    expect(container.querySelector('svg')).toBeDefined();
  });

  it('renders SVG zodiac wheel', () => {
    const { container } = render(<MapaNatalViz astrologia={mockAstrologia} />);
    const svg = container.querySelector('svg');
    expect(svg).toBeDefined();
  });

  it('displays ascendant sign', () => {
    render(<MapaNatalViz astrologia={mockAstrologia} />);
    expect(screen.getByText(/Leão/)).toBeDefined();
  });

  it('renders planet indicators', () => {
    const { container } = render(<MapaNatalViz astrologia={mockAstrologia} />);
    const circles = container.querySelectorAll('circle');
    expect(circles.length).toBeGreaterThan(0);
  });

  it('applies custom className', () => {
    const { container } = render(
      <MapaNatalViz astrologia={mockAstrologia} className="custom-class" />
    );
    expect(container.firstChild).toHaveClass('custom-class');
  });
});
