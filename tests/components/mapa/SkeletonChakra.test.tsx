/** @vitest-environment jsdom */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SkeletonChakra } from '@/components/mapa/SkeletonChakra';

describe('SkeletonChakra', () => {
  it('renders without crashing', () => {
    render(<SkeletonChakra />);
    expect(screen.getByRole('status')).toBeDefined();
  });

  it('has correct aria-label for accessibility', () => {
    const { getByRole } = render(<SkeletonChakra />);
    expect(getByRole('status')).toHaveAttribute('aria-label', 'Carregando chakras...');
  });

  it('renders with aria-busy loading state', () => {
    const { getByRole } = render(<SkeletonChakra />);
    expect(getByRole('status')).toHaveAttribute('aria-busy', 'true');
  });

  it('renders skeleton elements with shimmer animation', () => {
    const { container } = render(<SkeletonChakra />);
    expect(container.querySelector('.skeleton-spiritual')).toBeDefined();
    expect(container.querySelector('.animate-shimmer')).toBeDefined();
  });

  it('contains rounded elements for chakra circles', () => {
    const { container } = render(<SkeletonChakra />);
    const roundedElements = container.querySelectorAll('.rounded-full');
    expect(roundedElements.length).toBeGreaterThan(0);
  });
});
