// tests/cockpit/consultation/RoutingChips.test.tsx
// Tests for RoutingChips — transparency of theme routing (Doc 12 §8, royal chips).

import '@testing-library/jest-dom/vitest';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { RoutingChips } from '@/components/cockpit/consultation/RoutingChips';

beforeEach(cleanup);

describe('RoutingChips', () => {
  it('renders house chips with Casa prefix', () => {
    render(<RoutingChips themes={[]} houses={[24, 22]} />);
    expect(screen.getByText('Casa 24')).toBeInTheDocument();
    expect(screen.getByText('Casa 22')).toBeInTheDocument();
  });

  it('renders theme chips', () => {
    render(<RoutingChips themes={['amor', 'dinheiro']} houses={[]} />);
    expect(screen.getByText('amor')).toBeInTheDocument();
    expect(screen.getByText('dinheiro')).toBeInTheDocument();
  });

  it('renders both house and theme chips together', () => {
    render(<RoutingChips themes={['espiritualidade']} houses={[16, 26]} />);
    expect(screen.getByText('Casa 16')).toBeInTheDocument();
    expect(screen.getByText('Casa 26')).toBeInTheDocument();
    expect(screen.getByText('espiritualidade')).toBeInTheDocument();
  });

  it('renders the transparency label', () => {
    render(<RoutingChips themes={['karma_destino']} houses={[36, 22]} />);
    expect(screen.getByText('· casas consultadas')).toBeInTheDocument();
  });

  it('returns null when both arrays are empty', () => {
    const { container } = render(<RoutingChips themes={[]} houses={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('house chips use small uppercase tracking-widest text style', () => {
    render(<RoutingChips themes={[]} houses={[8]} />);
    const chip = screen.getByText('Casa 8');
    expect(chip).toBeInTheDocument();
    expect(chip.className).toContain('uppercase');
    expect(chip.className).toContain('tracking-widest');
  });
});
