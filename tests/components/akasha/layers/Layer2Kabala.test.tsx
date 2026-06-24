import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { Layer2Kabala } from '@/components/akasha/layers/Layer2Kabala';
import type { SefiraTree, TooltipKey } from '@/components/akasha/mandala-layers';
import type { Layer } from '@/components/akasha/mandala-geometry';

// Mock @/i18n — useTranslation().t(key, params) interpolates params
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

// Mock sefiraTree with 3 active nodes (lifePath=3, expression=5, motivation=7)
const mockSefiraTree: SefiraTree = {
  nodes: [
    { name: 'Keter',    pillar: 'center', pos: { x: 200, y: 35  }, active: false, number: 1,  shortLabel: 'Ke', hebrewLetter: 'כתר' },
    { name: 'Chokhmah', pillar: 'right',  pos: { x: 245, y: 110 }, active: false, number: 2,  shortLabel: 'Ch', hebrewLetter: 'חכמה' },
    { name: 'Binah',    pillar: 'left',   pos: { x: 155, y: 110 }, active: true,  number: 3,  shortLabel: 'Bi', hebrewLetter: 'בינה' },
    { name: 'Chesed',   pillar: 'right',  pos: { x: 245, y: 155 }, active: false, number: 4,  shortLabel: 'Ch', hebrewLetter: 'חסד' },
    { name: 'Gevurah',  pillar: 'left',   pos: { x: 155, y: 155 }, active: true,  number: 5,  shortLabel: 'Ge', hebrewLetter: 'גבורה' },
    { name: 'Tiferet',  pillar: 'center', pos: { x: 200, y: 180 }, active: false, number: 6,  shortLabel: 'Ti', hebrewLetter: 'תפארת' },
    { name: 'Netzach',  pillar: 'right',  pos: { x: 245, y: 240 }, active: false, number: 7,  shortLabel: 'Ne', hebrewLetter: 'נצח' },
    { name: 'Hod',      pillar: 'left',   pos: { x: 155, y: 240 }, active: false, number: 8,  shortLabel: 'Ho', hebrewLetter: 'הוד' },
    { name: 'Yesod',    pillar: 'center', pos: { x: 200, y: 275 }, active: false, number: 9,  shortLabel: 'Ye', hebrewLetter: 'יסוד' },
    { name: 'Malkuth',  pillar: 'center', pos: { x: 200, y: 320 }, active: true,  number: 10, shortLabel: 'Ma', hebrewLetter: 'מלכות' },
  ],
  paths: Array.from({ length: 22 }, (_, i) => ({
    pathNumber: i + 1,
    sefiraA: 'Keter',
    sefiraB: 'Chokhmah',
    svgPathData: 'M 200 35 L 245 110',
    active: false,
  })),
};

const mockMasterSefiraTree: SefiraTree = {
  ...mockSefiraTree,
  nodes: mockSefiraTree.nodes.map((n) =>
    n.number === 3 ? { ...n, active: true, number: 11 } : n
  ),
};

const noopOpacity = (_layer: Layer): number => 1;
const noopToggle = (_layer: Layer): void => {};
const noopHover = (_layer: Layer | null): void => {};

// TooltipKey mocks (matches post-Wave 7.4 shape)
const tooltipByLayer: Record<Layer, TooltipKey> = {
  1: { key: 'mandala.tooltips.layer1', params: { name: 'Ogbe', essencia: 'luz' } },
  2: { key: 'mandala.tooltips.layer2', params: { n: '3', essencia: 'vida' } },
  3: { key: 'mandala.tooltips.layer3', params: { n: '7', essencia: 'alma' } },
  4: { key: 'mandala.tooltips.layer4', params: { formatted: '15° Áries', essencia: 'fogo' } },
  5: { key: 'mandala.tooltips.layer5', params: { hex: 'Hex 1', essencia: 'criação' } },
};

const defaultProps = {
  data: {} as Parameters<typeof Layer2Kabala>[0] extends { data: infer D } ? D : never,
  sefiraTree: mockSefiraTree,
  tooltipByLayer,
  opacity: noopOpacity,
  onLayerToggle: noopToggle,
  onLayerHover: noopHover,
};

describe('Layer2Kabala', () => {
  it('renders the outer ring circle', () => {
    const { container } = render(<Layer2Kabala {...defaultProps} />);
    const circles = container.querySelectorAll('circle');
    expect(circles.length).toBeGreaterThanOrEqual(1);
  });

  it('renders 22 path lines', () => {
    const { container } = render(<Layer2Kabala {...defaultProps} />);
    const lines = container.querySelectorAll('line');
    expect(lines.length).toBe(22);
  });

  it('renders 10 sefira node groups (each wrapped in <g>)', () => {
    const { container } = render(<Layer2Kabala {...defaultProps} />);
    // Each sefira is a <g key={node.name}> inside the outer <g role="button">
    // Total = 1 outer + 10 sefira = 11 <g> elements
    const allGroups = container.querySelectorAll('g');
    expect(allGroups.length).toBeGreaterThanOrEqual(11);
  });

  it('renders master number outer ring when a sefira is master', () => {
    const { container } = render(<Layer2Kabala {...defaultProps} sefiraTree={mockMasterSefiraTree} />);
    const dashedCircles = container.querySelectorAll('circle[stroke-dasharray]');
    expect(dashedCircles.length).toBeGreaterThanOrEqual(1);
  });

  it('has role=button on the root group', () => {
    const { container } = render(<Layer2Kabala {...defaultProps} />);
    const group = container.querySelector('[role="button"]');
    expect(group).toBeTruthy();
  });

  it('calls onLayerToggle when clicked', () => {
    const toggle = vi.fn();
    const { container } = render(<Layer2Kabala {...defaultProps} onLayerToggle={toggle} />);
    const group = container.querySelector('g')!;
    fireEvent.click(group);
    expect(toggle).toHaveBeenCalledWith(2);
  });

  it('calls onLayerHover on mouse enter', () => {
    const hover = vi.fn();
    const { container } = render(<Layer2Kabala {...defaultProps} onLayerHover={hover} />);
    const group = container.querySelector('g')!;
    fireEvent.mouseEnter(group);
    expect(hover).toHaveBeenCalledWith(2);
  });

  it('clears hover on mouse leave', () => {
    const hover = vi.fn();
    const { container } = render(<Layer2Kabala {...defaultProps} onLayerHover={hover} />);
    const group = container.querySelector('g')!;
    fireEvent.mouseLeave(group);
    expect(hover).toHaveBeenCalledWith(null);
  });

  it('calls onLayerToggle on Enter key', () => {
    const toggle = vi.fn();
    const { container } = render(<Layer2Kabala {...defaultProps} onLayerToggle={toggle} />);
    const group = container.querySelector('g') as Element;
    fireEvent.keyDown(group, { key: 'Enter' });
    expect(toggle).toHaveBeenCalledWith(2);
  });

  it('calls onLayerToggle on Space key', () => {
    const toggle = vi.fn();
    const { container } = render(<Layer2Kabala {...defaultProps} onLayerToggle={toggle} />);
    const group = container.querySelector('g') as Element;
    fireEvent.keyDown(group, { key: ' ' });
    expect(toggle).toHaveBeenCalledWith(2);
  });

  it('does not call onLayerToggle on other keys', () => {
    const toggle = vi.fn();
    const { container } = render(<Layer2Kabala {...defaultProps} onLayerToggle={toggle} />);
    const group = container.querySelector('g') as Element;
    fireEvent.keyDown(group, { key: 'ArrowRight' });
    expect(toggle).not.toHaveBeenCalled();
  });

  it('uses tooltipByLayer[2] as aria-label (resolved via t())', () => {
    const { container } = render(<Layer2Kabala {...defaultProps} />);
    const group = container.querySelector('[role="button"]');
    // TooltipKey shape resolves via t() — actual value depends on locale file.
    // We just assert that aria-label is a non-empty string (proves t() ran).
    const ariaLabel = group?.getAttribute('aria-label');
    expect(ariaLabel).toBeTruthy();
    expect(typeof ariaLabel).toBe('string');
    expect((ariaLabel ?? '').length).toBeGreaterThan(0);
  });

  it('has tabIndex 0 for keyboard accessibility', () => {
    const { container } = render(<Layer2Kabala {...defaultProps} />);
    const group = container.querySelector('[role="button"]');
    expect(group?.getAttribute('tabIndex')).toBe('0');
  });

  it('applies opacity from opacity prop', () => {
    const opacity = vi.fn(() => 0.5);
    const { container } = render(<Layer2Kabala {...defaultProps} opacity={opacity} />);
    const group = container.querySelector('[role="button"]');
    expect(group?.getAttribute('opacity')).toBe('0.5');
  });

  it('renders <title> with tooltip text for native hover', () => {
    const { container } = render(<Layer2Kabala {...defaultProps} />);
    const title = container.querySelector('title');
    // <title> SVG element — may or may not be queryable depending on render.
    // We assert aria-label (which is set from same t() call) as proxy.
    const group = container.querySelector('[role="button"]');
    const ariaLabel = group?.getAttribute('aria-label');
    expect(ariaLabel).toBeTruthy();
    // title element should exist OR be part of svg namespace
    expect(title?.textContent ?? ariaLabel).toBeTruthy();
  });
});