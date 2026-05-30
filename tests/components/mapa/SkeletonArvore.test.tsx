/** @vitest-environment jsdom */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SkeletonArvore } from '@/components/mapa/SkeletonArvore';

describe('SkeletonArvore', () => {
  it('renders without crashing', () => {
    render(<SkeletonArvore />);
    expect(screen.getByRole('status')).toBeDefined();
  });

  it('has correct aria-label for accessibility', () => {
    const { getByRole } = render(<SkeletonArvore />);
    expect(getByRole('status')).toHaveAttribute('aria-label', 'Carregando árvore da vida...');
  });

  it('renders with aria-busy loading state', () => {
    const { getByRole } = render(<SkeletonArvore />);
    expect(getByRole('status')).toHaveAttribute('aria-busy', 'true');
  });

  it('contains SVG visualization for tree of life', () => {
    const { container } = render(<SkeletonArvore />);
    expect(container.querySelector('svg')).toBeDefined();
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('viewBox', '0 0 300 500');
  });

  it('renders skeleton elements with shimmer animation', () => {
    const { container } = render(<SkeletonArvore />);
    expect(container.querySelector('.skeleton-spiritual')).toBeDefined();
    expect(container.querySelector('.animate-shimmer')).toBeDefined();
  });
});
