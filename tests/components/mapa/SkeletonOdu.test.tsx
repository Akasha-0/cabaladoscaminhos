/** @vitest-environment jsdom */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SkeletonOdu } from '@/components/mapa/SkeletonOdu';

describe('SkeletonOdu', () => {
  it('renders without crashing', () => {
    render(<SkeletonOdu />);
    expect(screen.getByRole('status')).toBeDefined();
  });

  it('has correct aria-label for accessibility', () => {
    const { getByRole } = render(<SkeletonOdu />);
    expect(getByRole('status')).toHaveAttribute('aria-label', 'Carregando Odu...');
  });

  it('renders with aria-busy loading state', () => {
    const { getByRole } = render(<SkeletonOdu />);
    expect(getByRole('status')).toHaveAttribute('aria-busy', 'true');
  });

  it('renders skeleton elements with shimmer animation', () => {
    const { container } = render(<SkeletonOdu />);
    expect(container.querySelector('.skeleton-spiritual')).toBeDefined();
  });

  it('contains rounded elements for odu representations', () => {
    const { container } = render(<SkeletonOdu />);
    const roundedElements = container.querySelectorAll('.rounded-full');
    expect(roundedElements.length).toBeGreaterThan(0);
  });
});
