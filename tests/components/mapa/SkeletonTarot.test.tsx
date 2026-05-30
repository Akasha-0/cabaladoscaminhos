/** @vitest-environment jsdom */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SkeletonTarot } from '@/components/mapa/SkeletonTarot';

describe('SkeletonTarot', () => {
  it('renders without crashing', () => {
    render(<SkeletonTarot />);
    expect(screen.getByRole('status')).toBeDefined();
  });

  it('has correct aria-label for accessibility', () => {
    const { getByRole } = render(<SkeletonTarot />);
    expect(getByRole('status')).toHaveAttribute('aria-label', 'Carregando tarot...');
  });

  it('renders with aria-busy loading state', () => {
    const { getByRole } = render(<SkeletonTarot />);
    expect(getByRole('status')).toHaveAttribute('aria-busy', 'true');
  });

  it('renders skeleton elements with shimmer animation', () => {
    const { container } = render(<SkeletonTarot />);
    expect(container.querySelector('.skeleton-spiritual')).toBeDefined();
  });

  it('contains card-like structure for tarot display', () => {
    const { container } = render(<SkeletonTarot />);
    const cardElements = container.querySelectorAll('.rounded-xl');
    expect(cardElements.length).toBeGreaterThan(0);
  });
});
