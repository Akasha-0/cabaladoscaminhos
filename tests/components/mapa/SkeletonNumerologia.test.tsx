/** @vitest-environment jsdom */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SkeletonNumerologia } from '@/components/mapa/SkeletonNumerologia';

describe('SkeletonNumerologia', () => {
  it('renders without crashing', () => {
    render(<SkeletonNumerologia />);
    expect(screen.getByRole('status')).toBeDefined();
  });

  it('has correct aria-label for accessibility', () => {
    const { getByRole } = render(<SkeletonNumerologia />);
    expect(getByRole('status')).toHaveAttribute('aria-label', 'Carregando numerologia...');
  });

  it('renders with aria-busy loading state', () => {
    const { getByRole } = render(<SkeletonNumerologia />);
    expect(getByRole('status')).toHaveAttribute('aria-busy', 'true');
  });

  it('renders skeleton elements with shimmer animation', () => {
    const { container } = render(<SkeletonNumerologia />);
    expect(container.querySelector('.skeleton-spiritual')).toBeDefined();
  });

  it('contains grid layout for numerology cards', () => {
    const { container } = render(<SkeletonNumerologia />);
    const grids = container.querySelectorAll('.grid');
    expect(grids.length).toBeGreaterThan(0);
  });
});
