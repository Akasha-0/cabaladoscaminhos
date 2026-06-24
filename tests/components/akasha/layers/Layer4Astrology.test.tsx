import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { Layer4Astrology } from '@/components/akasha/layers/Layer4Astrology';
import type { PlanetDot, TooltipKey } from '@/components/akasha/mandala-layers';
import type { Layer } from '@/components/akasha/mandala-geometry';

// Mock @/i18n — same pattern as Layer2Kabala test (Wave 8.1)
vi.mock('@/i18n', () => ({
  useTranslation: () => ({
    t: (key: string, params?: Record<string, string>) => {
      if (!params) return key;
      return Object.entries(params).reduce(
        (acc, [k, v]) => acc.replace(`{${k}}`, v),
        key
      );
    },
  }),
}));

const mockPlanetDots: PlanetDot[] = [
  {
    name: 'Sol',
    sign: 'Leão',
    degree: 120,
    absoluteLongitude: 120,
    retrograde: false,
    house: 1,
    pos: { x: 289, y: 200 },
    glyph: '☉',
    color: '#FFD700',
  },
  {
    name: 'Lua',
    sign: 'Câncer',
    degree: 90,
    absoluteLongitude: 90,
    retrograde: false,
    house: 2,
    pos: { x: 200, y: 289 },
    glyph: '☽',
    color: '#C0C0C0',
  },
];

const noopOpacity = (_layer: Layer): number => 1;
const noopToggle = (_layer: Layer): void => {};
const noopHover = (_layer: Layer | null): void => {};

// TooltipKey shape (post-Wave 7.4 migration)
const tooltipByLayer: Record<Layer, TooltipKey> = {
  1: { key: 'mandala.tooltips.layer1', params: { name: 'Ogbe', essencia: 'luz' } },
  2: { key: 'mandala.tooltips.layer2', params: { n: '3', essencia: 'vida' } },
  3: { key: 'mandala.tooltips.layer3', params: { n: '7', essencia: 'alma' } },
  4: { key: 'mandala.tooltips.layer4', params: { formatted: '15° Áries', essencia: 'fogo' } },
  5: { key: 'mandala.tooltips.layer5', params: { hex: 'Hex 1', essencia: 'criação' } },
};

const defaultProps = {
  planetDots: mockPlanetDots,
  tooltipByLayer,
  opacity: noopOpacity,
  onLayerToggle: noopToggle,
  onLayerHover: noopHover,
  ringPaused: false,
  reducedMotion: false,
};

describe('Layer4Astrology', () => {
  it('renders the outer decorative rings', () => {
    const { container } = render(<Layer4Astrology {...defaultProps} />);
    const circles = container.querySelectorAll('circle');
    expect(circles.length).toBeGreaterThanOrEqual(2);
  });

  it('renders zodiac sign segments (12 segments)', () => {
    const { container } = render(<Layer4Astrology {...defaultProps} />);
    const paths = container.querySelectorAll('path');
    expect(paths.length).toBeGreaterThanOrEqual(12);
  });

  it('renders planet glyphs', () => {
    const { container } = render(<Layer4Astrology {...defaultProps} />);
    const texts = container.querySelectorAll('text');
    expect(texts.length).toBeGreaterThan(0);
  });

  it('renders particle dots', () => {
    const { container } = render(<Layer4Astrology {...defaultProps} />);
    const circles = container.querySelectorAll('circle');
    expect(circles.length).toBeGreaterThan(12);
  });

  it('applies ring-astrological class when not paused', () => {
    const { container } = render(<Layer4Astrology {...defaultProps} />);
    const g = container.querySelector('g');
    expect(g?.classList.contains('ring-astrological')).toBe(true);
  });

  it('applies ring-astrological-paused class when ringPaused=true', () => {
    const { container } = render(<Layer4Astrology {...defaultProps} ringPaused={true} />);
    const g = container.querySelector('g');
    expect(g?.classList.contains('ring-astrological-paused')).toBe(true);
  });

  it('applies ring-astrological-paused class when reducedMotion=true', () => {
    const { container } = render(<Layer4Astrology {...defaultProps} reducedMotion={true} />);
    const g = container.querySelector('g');
    expect(g?.classList.contains('ring-astrological-paused')).toBe(true);
  });

  it('has role=button on root group', () => {
    const { container } = render(<Layer4Astrology {...defaultProps} />);
    const g = container.querySelector('[role="button"]');
    expect(g).toBeTruthy();
  });

  it('calls onLayerToggle on click', () => {
    const toggle = vi.fn();
    const { container } = render(<Layer4Astrology {...defaultProps} onLayerToggle={toggle} />);
    const g = container.querySelector('g')!;
    fireEvent.click(g);
    expect(toggle).toHaveBeenCalledWith(4);
  });

  it('calls onLayerHover on mouseEnter', () => {
    const hover = vi.fn();
    const { container } = render(<Layer4Astrology {...defaultProps} onLayerHover={hover} />);
    const g = container.querySelector('g')!;
    fireEvent.mouseEnter(g);
    expect(hover).toHaveBeenCalledWith(4);
  });

  it('clears hover on mouseLeave', () => {
    const hover = vi.fn();
    const { container } = render(<Layer4Astrology {...defaultProps} onLayerHover={hover} />);
    const g = container.querySelector('g')!;
    fireEvent.mouseLeave(g);
    expect(hover).toHaveBeenCalledWith(null);
  });

  it('calls onLayerToggle on Enter key', () => {
    const toggle = vi.fn();
    const { container } = render(<Layer4Astrology {...defaultProps} onLayerToggle={toggle} />);
    fireEvent.keyDown(container.querySelector('g')!, { key: 'Enter' });
    expect(toggle).toHaveBeenCalledWith(4);
  });

  it('calls onLayerToggle on Space key', () => {
    const toggle = vi.fn();
    const { container } = render(<Layer4Astrology {...defaultProps} onLayerToggle={toggle} />);
    fireEvent.keyDown(container.querySelector('g')!, { key: ' ' });
    expect(toggle).toHaveBeenCalledWith(4);
  });

  it('renders <title> with tooltip text (resolved via t())', () => {
    const { container } = render(<Layer4Astrology {...defaultProps} />);
    const title = container.querySelector('title');
    // t() resolves key + params. Assert title OR aria-label (same source).
    const group = container.querySelector('[role="button"]');
    const ariaLabel = group?.getAttribute('aria-label');
    expect(title?.textContent ?? ariaLabel).toBeTruthy();
  });
});