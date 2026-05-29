/**
 * MapaNatalWheel Component Tests
 * Tests for the natal chart SVG wheel visualization
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import MapaNatal from '@/components/dashboard/MapaNatal';

describe('MapaNatal', () => {
  const mockMapaNatal = {
    usuarioId: 'user-1',
    dataCalculo: new Date('2024-01-01'),
    planeta: {
      sol: { planeta: 'sol' as const, longitude: 24.5, latitude: 0, distancia: 1, velocidade: 1, signo: 'aries' as const, casa: 1, grauNoSigno: 24 },
      lua: { planeta: 'lua' as const, longitude: 102.75, latitude: 0, distancia: 1, velocidade: 1, signo: 'cancer' as const, casa: 4, grauNoSigno: 12 },
      mercurio: { planeta: 'mercurio' as const, longitude: 15.2, latitude: 0, distancia: 1, velocidade: 1, signo: 'aries' as const, casa: 1, grauNoSigno: 15 },
      venus: { planeta: 'venus' as const, longitude: 45.6, latitude: 0, distancia: 1, velocidade: 1, signo: 'touro' as const, casa: 2, grauNoSigno: 15 },
      marte: { planeta: 'marte' as const, longitude: 180.0, latitude: 0, distancia: 1, velocidade: 1, signo: 'libra' as const, casa: 7, grauNoSigno: 0 },
      jupiter: { planeta: 'jupiter' as const, longitude: 270.5, latitude: 0, distancia: 1, velocidade: 1, signo: 'capricornio' as const, casa: 10, grauNoSigno: 0 },
      saturno: { planeta: 'saturno' as const, longitude: 300.1, latitude: 0, distancia: 1, velocidade: 1, signo: 'aquario' as const, casa: 11, grauNoSigno: 0 },
      urano: { planeta: 'urano' as const, longitude: 10.0, latitude: 0, distancia: 1, velocidade: 1, signo: 'aries' as const, casa: 1, grauNoSigno: 10 },
      netuno: { planeta: 'netuno' as const, longitude: 350.0, latitude: 0, distancia: 1, velocidade: 1, signo: 'peixes' as const, casa: 12, grauNoSigno: 20 },
      plutao: { planeta: 'plutao' as const, longitude: 280.0, latitude: 0, distancia: 1, velocidade: 1, signo: 'capricornio' as const, casa: 10, grauNoSigno: 10 },
    },
    casas: [],
    ascendente: 15,
    mediumCoeli: 195,
    nodes: {
      norte: { planeta: 'node_norte' as const, longitude: 120, latitude: 0, distancia: 0, velocidade: 0, signo: 'leao' as const, casa: 5, grauNoSigno: 0 },
      sul: { planeta: 'node_sul' as const, longitude: 300, latitude: 0, distancia: 0, velocidade: 0, signo: 'aquario' as const, casa: 11, grauNoSigno: 0 },
    },
  };

  it('renders SVG wheel with viewBox', () => {
    render(<MapaNatal mapaNatal={mockMapaNatal} />);
    const svg = document.querySelector('svg[viewBox]');
    expect(svg).toBeInTheDocument();
  });

  it('renders zodiac sign symbols in SVG', () => {
    render(<MapaNatal mapaNatal={mockMapaNatal} />);
    // Aries symbol ♈ is at index 0
    const svgText = document.querySelectorAll('svg text');
    expect(svgText.length).toBeGreaterThan(12); // 12 zodiac signs + planets + house numbers
  });

  it('renders planet positions as text symbols', () => {
    render(<MapaNatal mapaNatal={mockMapaNatal} />);
    const svgText = document.querySelectorAll('svg text');
    // Should have planet symbols (☉, ☽, ☿, ♀, ♂, ♃, ♄)
    expect(svgText.length).toBeGreaterThan(7);
  });

  it('renders house cusp lines', () => {
    render(<MapaNatal mapaNatal={mockMapaNatal} />);
    const lines = document.querySelectorAll('svg line');
    expect(lines.length).toBeGreaterThan(0);
  });

  it('renders house numbers 1-12', () => {
    render(<MapaNatal mapaNatal={mockMapaNatal} />);
    const svgText = Array.from(document.querySelectorAll('svg text'));
    const houseNumbers = svgText
      .map(el => el.textContent)
      .filter(text => text !== null)
      .map(text => parseInt(text!, 10))
      .filter(n => !isNaN(n) && n >= 1 && n <= 12);
    // Should contain house numbers 1-12
    expect(houseNumbers.length).toBeGreaterThanOrEqual(12);
  });

  it('renders with custom size', () => {
    const { container } = render(<MapaNatal mapaNatal={mockMapaNatal} size={600} />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg?.getAttribute('viewBox')).toBe('0 0 600 600');
  });

  it('renders with small size', () => {
    const { container } = render(<MapaNatal mapaNatal={mockMapaNatal} size={200} />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg?.getAttribute('viewBox')).toBe('0 0 200 200');
  });

  it('renders with large size', () => {
    const { container } = render(<MapaNatal mapaNatal={mockMapaNatal} size={800} />);
    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('viewBox')).toBe('0 0 800 800');
  });

  it('renders zodiac sign arc segments', () => {
    render(<MapaNatal mapaNatal={mockMapaNatal} />);
    const paths = document.querySelectorAll('svg path');
    // Should have 12 zodiac segments
    expect(paths.length).toBeGreaterThanOrEqual(12);
  });

  it('applies custom className', () => {
    const { container } = render(
      <MapaNatal mapaNatal={mockMapaNatal} className="custom-wheel" />
    );
    expect(container.firstChild).toHaveClass('custom-wheel');
  });

  it('renders with default size of 400', () => {
    const { container } = render(<MapaNatal mapaNatal={mockMapaNatal} />);
    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('viewBox')).toBe('0 0 400 400');
  });

  it('renders with ascendant indicator (AC)', () => {
    render(<MapaNatal mapaNatal={mockMapaNatal} />);
    const svgText = Array.from(document.querySelectorAll('svg text'));
    const acText = svgText.find(el => el.textContent === 'AC');
    expect(acText).toBeInTheDocument();
  });

  it('renders gradient definitions in defs', () => {
    render(<MapaNatal mapaNatal={mockMapaNatal} />);
    const defs = document.querySelector('svg defs');
    expect(defs).toBeInTheDocument();
    // Should have gradient definitions
    const gradients = defs?.querySelectorAll('linearGradient, radialGradient');
    expect(gradients?.length).toBeGreaterThan(0);
  });

  it('renders filter for planet glow effect', () => {
    render(<MapaNatal mapaNatal={mockMapaNatal} />);
    const filter = document.querySelector('svg defs filter');
    expect(filter).toBeInTheDocument();
  });

  it('renders center decoration circles', () => {
    render(<MapaNatal mapaNatal={mockMapaNatal} />);
    const circles = document.querySelectorAll('svg circle');
    expect(circles.length).toBeGreaterThanOrEqual(2); // background + center decoration
  });

  it('handles mapa natal with missing optional planets', () => {
    const minimalMapa: typeof mockMapaNatal = {
      ...mockMapaNatal,
      planeta: {
        sol: mockMapaNatal.planeta.sol,
        lua: mockMapaNatal.planeta.lua,
      } as typeof mockMapaNatal.planeta,
    };
    render(<MapaNatal mapaNatal={minimalMapa} />);
    const svg = document.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('renders degree markers on outer ring', () => {
    render(<MapaNatal mapaNatal={mockMapaNatal} />);
    const lines = document.querySelectorAll('svg line');
    // Should have zodiac segments + degree markers + house lines
    expect(lines.length).toBeGreaterThan(12);
  });

  it('renders planets from all sign ranges', () => {
    render(<MapaNatal mapaNatal={mockMapaNatal} />);
    const svg = document.querySelector('svg');
    expect(svg).toBeInTheDocument();
    // Planets span across multiple signs: Aries, Cancer, Touro, Libra, Capricornio, Aquario, Peixes
  });

  it('renders without crashing with zero ascendant', () => {
    const zeroAscMapa: typeof mockMapaNatal = {
      ...mockMapaNatal,
      ascendente: 0,
    };
    render(<MapaNatal mapaNatal={zeroAscMapa} />);
    expect(document.querySelector('svg')).toBeInTheDocument();
  });

  it('renders without crashing with 360 ascendant', () => {
    const maxAscMapa: typeof mockMapaNatal = {
      ...mockMapaNatal,
      ascendente: 359,
    };
    render(<MapaNatal mapaNatal={maxAscMapa} />);
    expect(document.querySelector('svg')).toBeInTheDocument();
  });
});
