/** @vitest-environment jsdom */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SkeletonCalendario } from '@/components/mapa/SkeletonCalendario';

describe('SkeletonCalendario', () => {
  it('renders without crashing', () => {
    render(<SkeletonCalendario />);
    expect(screen.getByRole('status')).toBeDefined();
  });

  it('has correct aria-label for accessibility', () => {
    const { getByRole } = render(<SkeletonCalendario />);
    expect(getByRole('status')).toHaveAttribute('aria-label', 'Carregando calendário...');
  });

  it('renders with aria-busy loading state', () => {
    const { getByRole } = render(<SkeletonCalendario />);
    expect(getByRole('status')).toHaveAttribute('aria-busy', 'true');
  });

  it('renders skeleton elements with shimmer animation', () => {
    const { container } = render(<SkeletonCalendario />);
    expect(container.querySelector('.skeleton-spiritual')).toBeDefined();
  });

  it('contains grid layout for calendar days', () => {
    const { container } = render(<SkeletonCalendario />);
    const grids = container.querySelectorAll('.grid');
    expect(grids.length).toBeGreaterThan(0);
  });
});
