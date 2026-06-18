import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';

// Mock MandalaAtmosphere at top level — uses Three.js/matchMedia unavailable in jsdom
vi.mock('@/components/akasha/MandalaAtmosphere', () => ({
  __esModule: true,
  MandalaAtmosphere: () => null,
  default: () => null,
}));

const mockMandalaData = {
  incomplete: false,
  odus: { oduName: 'Ogbe', oduNumber: 1, orixaRegency: ['Obatalá'], elementalForce: 'Oxumaré', provisional: false },
  kabala: {
    lifePath: 3, lifePathMaster: false, expression: 5, expressionMaster: false,
    motivation: 7, impression: 9, mission: 4, personalYear: 6, personalMonth: 2, personalDay: 15,
    sefira: null, hebrewLetter: null, tarotCard: null, challenges: null, pinnacles: null, lifeCycles: null,
  },
  tantra: {
    soul: 1, karma: 2, divineGift: 3, destiny: 4, tantricPath: 5,
    bodies: [
      { index: 1, name: 'Corpo da Alma', active: true },
      { index: 2, name: 'Mente Negativa', active: true },
      { index: 3, name: 'Mente Positiva', active: false },
      { index: 4, name: 'Mente Neutra', active: true },
      { index: 5, name: 'Corpo Físico', active: true },
      { index: 6, name: 'Linha do Arco', active: false },
      { index: 7, name: 'Aura', active: true },
      { index: 8, name: 'Corpo Prânico', active: true },
      { index: 9, name: 'Corpo Sutil', active: false },
      { index: 10, name: 'Corpo Radiante', active: true },
      { index: 11, name: 'Mente Divina', active: true },
    ],
  },
  astrology: {
    ascendant: 'Leão', midheaven: 'Áries', dominantPlanet: 'Sol',
    planets: [
      { name: 'Sol', sign: 'Leão', degree: 120, absoluteLongitude: 120, retrograde: false, house: 1 },
      { name: 'Lua', sign: 'Câncer', degree: 90, absoluteLongitude: 90, retrograde: false, house: 2 },
    ],
    aspects: [],
    elementalBalance: { fire: 2, earth: 3, air: 2, water: 3 },
  },
  iching: {
    hexagramNumber: 1, hexagramName: 'Qián', hexagramChineseName: '乾',
    upperTrigram: 1, lowerTrigram: 1, upperTrigramName: 'Qián', lowerTrigramName: 'Qián',
    lines: [true, true, true, true, true, true],
    algorithm: 'test', provisional: false, birthDate: null, birthTime: null, available: true, error: null,
  },
};

import MandalaChart from '@/components/akasha/MandalaChart';

describe('MandalaChart', () => {
  describe('rendering', () => {
    it('renders the SVG element', () => {
      const { container } = render(<MandalaChart data={mockMandalaData} />);
      expect(container.querySelector('svg')).toBeTruthy();
    });

    it('renders with aria-label', () => {
      const { container } = render(<MandalaChart data={mockMandalaData} />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('aria-label');
    });

    it('renders with viewBox 0 0 400 400', () => {
      const { container } = render(<MandalaChart data={mockMandalaData} />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('viewBox', '0 0 400 400');
    });
  });

  describe('data handling', () => {
    it('handles incomplete=true', () => {
      const { container } = render(<MandalaChart data={{ ...mockMandalaData, incomplete: true }} />);
      expect(container.querySelector('svg')).toBeTruthy();
    });

    it('handles empty planets array', () => {
      const data = { ...mockMandalaData, astrology: { ...mockMandalaData.astrology, planets: [] } };
      const { container } = render(<MandalaChart data={data} />);
      expect(container.querySelector('svg')).toBeTruthy();
    });

    it('handles null iching available', () => {
      const data = { ...mockMandalaData, iching: { ...mockMandalaData.iching, available: false } };
      const { container } = render(<MandalaChart data={data} />);
      expect(container.querySelector('svg')).toBeTruthy();
    });
  });
});
