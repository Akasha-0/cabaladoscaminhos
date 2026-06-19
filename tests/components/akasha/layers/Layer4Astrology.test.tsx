import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { Layer4Astrology } from '@/components/akasha/layers/Layer4Astrology';
import type { PlanetDot } from '@/components/akasha/mandala-layers';
import type { Layer } from '@/components/akasha/mandala-geometry';

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

describe('Layer4Astrology', () => {
  it('renders the outer decorative rings', () => {
    const { container } = render(
      <Layer4Astrology
        planetDots={mockPlanetDots}
        tooltipByLayer={{ 1: 'L1', 2: 'L2', 3: 'L3', 4: 'Camada 4', 5: 'L5' } as Record<Layer, string>}
        opacity={noopOpacity}
        onLayerToggle={noopToggle}
        onLayerHover={noopHover}
        ringPaused={false}
        reducedMotion={false}
      />
    );
    const circles = container.querySelectorAll('circle');
    expect(circles.length).toBeGreaterThanOrEqual(2); // decorative rings
  });

  it('renders zodiac sign segments (12 segments)', () => {
    const { container } = render(
      <Layer4Astrology
        planetDots={mockPlanetDots}
        tooltipByLayer={{ 1: 'L1', 2: 'L2', 3: 'L3', 4: 'L4', 5: 'L5' } as Record<Layer, string>}
        opacity={noopOpacity}
        onLayerToggle={noopToggle}
        onLayerHover={noopHover}
        ringPaused={false}
        reducedMotion={false}
      />
    );
    const paths = container.querySelectorAll('path');
    // 12 zodiac segments
    expect(paths.length).toBeGreaterThanOrEqual(12);
  });

  it('renders planet glyphs', () => {
    const { container } = render(
      <Layer4Astrology
        planetDots={mockPlanetDots}
        tooltipByLayer={{ 1: 'L1', 2: 'L2', 3: 'L3', 4: 'L4', 5: 'L5' } as Record<Layer, string>}
        opacity={noopOpacity}
        onLayerToggle={noopToggle}
        onLayerHover={noopHover}
        ringPaused={false}
        reducedMotion={false}
      />
    );
    const texts = container.querySelectorAll('text');
    // Should have planet glyphs + sign labels + possibly layer label
    expect(texts.length).toBeGreaterThan(0);
  });

  it('renders particle dots', () => {
    const { container } = render(
      <Layer4Astrology
        planetDots={mockPlanetDots}
        tooltipByLayer={{ 1: 'L1', 2: 'L2', 3: 'L3', 4: 'L4', 5: 'L5' } as Record<Layer, string>}
        opacity={noopOpacity}
        onLayerToggle={noopToggle}
        onLayerHover={noopHover}
        ringPaused={false}
        reducedMotion={false}
      />
    );
    // Particle dots are small circles (r=1.5)
    const circles = container.querySelectorAll('circle');
    // 2 decorative rings + zodiac arcs + particles + planet dots
    expect(circles.length).toBeGreaterThan(12);
  });

  it('applies ring-astrological class when not paused', () => {
    const { container } = render(
      <Layer4Astrology
        planetDots={mockPlanetDots}
        tooltipByLayer={{ 1: 'L1', 2: 'L2', 3: 'L3', 4: 'L4', 5: 'L5' } as Record<Layer, string>}
        opacity={noopOpacity}
        onLayerToggle={noopToggle}
        onLayerHover={noopHover}
        ringPaused={false}
        reducedMotion={false}
      />
    );
    const g = container.querySelector('g');
    expect(g?.classList.contains('ring-astrological')).toBe(true);
  });

  it('applies ring-astrological-paused class when ringPaused=true', () => {
    const { container } = render(
      <Layer4Astrology
        planetDots={mockPlanetDots}
        tooltipByLayer={{ 1: 'L1', 2: 'L2', 3: 'L3', 4: 'L4', 5: 'L5' } as Record<Layer, string>}
        opacity={noopOpacity}
        onLayerToggle={noopToggle}
        onLayerHover={noopHover}
        ringPaused={true}
        reducedMotion={false}
      />
    );
    const g = container.querySelector('g');
    expect(g?.classList.contains('ring-astrological-paused')).toBe(true);
  });

  it('applies ring-astrological-paused class when reducedMotion=true', () => {
    const { container } = render(
      <Layer4Astrology
        planetDots={mockPlanetDots}
        tooltipByLayer={{ 1: 'L1', 2: 'L2', 3: 'L3', 4: 'L4', 5: 'L5' } as Record<Layer, string>}
        opacity={noopOpacity}
        onLayerToggle={noopToggle}
        onLayerHover={noopHover}
        ringPaused={false}
        reducedMotion={true}
      />
    );
    const g = container.querySelector('g');
    expect(g?.classList.contains('ring-astrological-paused')).toBe(true);
  });

  it('has role=button on root group', () => {
    const { container } = render(
      <Layer4Astrology
        planetDots={mockPlanetDots}
        tooltipByLayer={{ 1: 'L1', 2: 'L2', 3: 'L3', 4: 'L4', 5: 'L5' } as Record<Layer, string>}
        opacity={noopOpacity}
        onLayerToggle={noopToggle}
        onLayerHover={noopHover}
        ringPaused={false}
        reducedMotion={false}
      />
    );
    const g = container.querySelector('[role="button"]');
    expect(g).toBeTruthy();
  });

  it('calls onLayerToggle on click', () => {
    const toggle = vi.fn();
    const { container } = render(
      <Layer4Astrology
        planetDots={mockPlanetDots}
        tooltipByLayer={{ 1: 'L1', 2: 'L2', 3: 'L3', 4: 'L4', 5: 'L5' } as Record<Layer, string>}
        opacity={noopOpacity}
        onLayerToggle={toggle}
        onLayerHover={noopHover}
        ringPaused={false}
        reducedMotion={false}
      />
    );
    const g = container.querySelector('g')!;
    fireEvent.click(g);
    expect(toggle).toHaveBeenCalledWith(4);
  });

  it('calls onLayerHover on mouseEnter', () => {
    const hover = vi.fn();
    const { container } = render(
      <Layer4Astrology
        planetDots={mockPlanetDots}
        tooltipByLayer={{ 1: 'L1', 2: 'L2', 3: 'L3', 4: 'L4', 5: 'L5' } as Record<Layer, string>}
        opacity={noopOpacity}
        onLayerToggle={noopToggle}
        onLayerHover={hover}
        ringPaused={false}
        reducedMotion={false}
      />
    );
    const g = container.querySelector('g')!;
    fireEvent.mouseEnter(g);
    expect(hover).toHaveBeenCalledWith(4);
  });

  it('clears hover on mouseLeave', () => {
    const hover = vi.fn();
    const { container } = render(
      <Layer4Astrology
        planetDots={mockPlanetDots}
        tooltipByLayer={{ 1: 'L1', 2: 'L2', 3: 'L3', 4: 'L4', 5: 'L5' } as Record<Layer, string>}
        opacity={noopOpacity}
        onLayerToggle={noopToggle}
        onLayerHover={hover}
        ringPaused={false}
        reducedMotion={false}
      />
    );
    const g = container.querySelector('g')!;
    fireEvent.mouseLeave(g);
    expect(hover).toHaveBeenCalledWith(null);
  });

  it('calls onLayerToggle on Enter key', () => {
    const toggle = vi.fn();
    const { container } = render(
      <Layer4Astrology
        planetDots={mockPlanetDots}
        tooltipByLayer={{ 1: 'L1', 2: 'L2', 3: 'L3', 4: 'L4', 5: 'L5' } as Record<Layer, string>}
        opacity={noopOpacity}
        onLayerToggle={toggle}
        onLayerHover={noopHover}
        ringPaused={false}
        reducedMotion={false}
      />
    );
    fireEvent.keyDown(container.querySelector('g')!, { key: 'Enter' });
    expect(toggle).toHaveBeenCalledWith(4);
  });

  it('calls onLayerToggle on Space key', () => {
    const toggle = vi.fn();
    const { container } = render(
      <Layer4Astrology
        planetDots={mockPlanetDots}
        tooltipByLayer={{ 1: 'L1', 2: 'L2', 3: 'L3', 4: 'L4', 5: 'L5' } as Record<Layer, string>}
        opacity={noopOpacity}
        onLayerToggle={toggle}
        onLayerHover={noopHover}
        ringPaused={false}
        reducedMotion={false}
      />
    );
    fireEvent.keyDown(container.querySelector('g')!, { key: ' ' });
    expect(toggle).toHaveBeenCalledWith(4);
  });

  it('renders <title> with tooltip', () => {
    const { container } = render(
      <Layer4Astrology
        planetDots={mockPlanetDots}
        tooltipByLayer={{ 1: 'L1', 2: 'L2', 3: 'L3', 4: 'Camada 4 astrology', 5: 'L5' } as Record<Layer, string>}
        opacity={noopOpacity}
        onLayerToggle={noopToggle}
        onLayerHover={noopHover}
        ringPaused={false}
        reducedMotion={false}
      />
    );
    const title = container.querySelector('title');
    expect(title?.textContent).toBe('Camada 4 astrology');
  });
});
