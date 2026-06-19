import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Layer2Kabala } from '@/components/akasha/layers/Layer2Kabala';
import type { KabVert } from '@/components/akasha/mandala-layers';
import type { Layer } from '@/components/akasha/mandala-geometry';

const mockKabVerts: KabVert[] = [
  { angleDeg: 0, value: 3, master: false, label: 'VP', pos: { x: 280, y: 200 } },
  { angleDeg: 120, value: 5, master: false, label: 'EX', pos: { x: 160, y: 130 } },
  { angleDeg: 240, value: 7, master: false, label: 'MO', pos: { x: 160, y: 270 } },
];

const mockMasterKabVerts: KabVert[] = [
  { angleDeg: 0, value: 11, master: true, label: 'VP', pos: { x: 280, y: 200 } },
  { angleDeg: 120, value: 5, master: false, label: 'EX', pos: { x: 160, y: 130 } },
  { angleDeg: 240, value: 7, master: false, label: 'MO', pos: { x: 160, y: 270 } },
];

const noopOpacity = (_layer: Layer): number => 1;
const noopToggle = (_layer: Layer): void => {};
const noopHover = (_layer: Layer | null): void => {};

const defaultProps = {
  data: {} as Parameters<typeof Layer2Kabala>[0] extends { data: infer D } ? D : never,
  kabVerts: mockKabVerts,
  trianglePath: 'M 280 200 L 160 130 L 160 270 Z',
  tooltipByLayer: { 1: 'L1', 2: 'Camada 2 · Número de Vida (Vida 3)', 3: 'L3', 4: 'L4', 5: 'L5' } as Record<Layer, string>,
  opacity: noopOpacity,
  onLayerToggle: noopToggle,
  onLayerHover: noopHover,
};

describe('Layer2Kabala', () => {
  it('renders the outer ring circle', () => {
    render(<Layer2Kabala {...defaultProps} />);
    const circles = document.querySelectorAll('circle');
    // First circle should be the outer decorative ring
    expect(circles.length).toBeGreaterThanOrEqual(1);
  });

  it('renders the triangle path', () => {
    render(<Layer2Kabala {...defaultProps} />);
    const path = document.querySelector('path');
    expect(path).toBeTruthy();
    expect(path?.getAttribute('d')).toBe('M 280 200 L 160 130 L 160 270 Z');
  });

  it('renders 3 vertex circles', () => {
    render(<Layer2Kabala {...defaultProps} />);
    // The component renders 3 groups, each with a main circle
    const circles = document.querySelectorAll('circle');
    // 1 outer ring + 3 main circles + master ring (if any) = 4 or 5 circles
    expect(circles.length).toBeGreaterThanOrEqual(4);
  });

  it('renders vertex labels as text', () => {
    render(<Layer2Kabala {...defaultProps} />);
    const texts = document.querySelectorAll('text');
    // 3 vertex value texts (VP=3, EX=5, MO=7)
    expect(texts.length).toBeGreaterThanOrEqual(3);
  });

  it('renders master number outer ring when a vertex is master', () => {
    render(<Layer2Kabala {...defaultProps} kabVerts={mockMasterKabVerts} />);
    // Should have extra dashed circle for master number (VP=11)
    const dashedCircles = document.querySelectorAll('circle[stroke-dasharray]');
    expect(dashedCircles.length).toBeGreaterThanOrEqual(1);
  });

  it('has role=button on the root group', () => {
    render(<Layer2Kabala {...defaultProps} />);
    const group = document.querySelector('[role="button"]');
    expect(group).toBeTruthy();
  });

  it('calls onLayerToggle when clicked', () => {
    const toggle = vi.fn();
    render(<Layer2Kabala {...defaultProps} onLayerToggle={toggle} />);
    const group = document.querySelector('g')!;
    fireEvent.click(group);
    expect(toggle).toHaveBeenCalledWith(2);
  });

  it('calls onLayerHover on mouse enter', () => {
    const hover = vi.fn();
    render(<Layer2Kabala {...defaultProps} onLayerHover={hover} />);
    const group = document.querySelector('g')!;
    fireEvent.mouseEnter(group);
    expect(hover).toHaveBeenCalledWith(2);
  });

  it('clears hover on mouse leave', () => {
    const hover = vi.fn();
    render(<Layer2Kabala {...defaultProps} onLayerHover={hover} />);
    const group = document.querySelector('g')!;
    fireEvent.mouseLeave(group);
    expect(hover).toHaveBeenCalledWith(null);
  });

  it('calls onLayerToggle on Enter key', () => {
    const toggle = vi.fn();
    render(<Layer2Kabala {...defaultProps} onLayerToggle={toggle} />);
    const group = document.querySelector('g') as Element;
    fireEvent.keyDown(group, { key: 'Enter' });
    expect(toggle).toHaveBeenCalledWith(2);
  });

  it('calls onLayerToggle on Space key', () => {
    const toggle = vi.fn();
    render(<Layer2Kabala {...defaultProps} onLayerToggle={toggle} />);
    const group = document.querySelector('g') as Element;
    fireEvent.keyDown(group, { key: ' ' });
    expect(toggle).toHaveBeenCalledWith(2);
  });

  it('does not call onLayerToggle on other keys', () => {
    const toggle = vi.fn();
    render(<Layer2Kabala {...defaultProps} onLayerToggle={toggle} />);
    const group = document.querySelector('g') as Element;
    fireEvent.keyDown(group, { key: 'ArrowRight' });
    expect(toggle).not.toHaveBeenCalled();
  });

  it('uses tooltipByLayer[2] as aria-label', () => {
    render(<Layer2Kabala {...defaultProps} />);
    const group = document.querySelector('[role="button"]');
    expect(group?.getAttribute('aria-label')).toBe('Camada 2 · Número de Vida (Vida 3)');
  });

  it('has tabIndex 0 for keyboard accessibility', () => {
    render(<Layer2Kabala {...defaultProps} />);
    const group = document.querySelector('[role="button"]');
    expect(group?.getAttribute('tabIndex')).toBe('0');
  });

  it('applies opacity from opacity prop', () => {
    const opacity = vi.fn(() => 0.5);
    render(<Layer2Kabala {...defaultProps} opacity={opacity} />);
    const group = document.querySelector('g');
    expect(group?.getAttribute('opacity')).toBe('0.5');
  });

  it('renders <title> with tooltip text for native hover', () => {
    render(<Layer2Kabala {...defaultProps} />);
    const title = document.querySelector('title');
    expect(title?.textContent).toBe('Camada 2 · Número de Vida (Vida 3)');
  });
});
