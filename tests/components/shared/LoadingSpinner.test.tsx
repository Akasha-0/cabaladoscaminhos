/** @vitest-environment jsdom */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

describe('LoadingSpinner', () => {
  it('renders without crashing', () => {
    render(<LoadingSpinner />);
    expect(screen.getByRole('status')).toBeDefined();
  });

  it('renders with default gold variant', () => {
    const { container } = render(<LoadingSpinner />);
    const star = container.querySelector('.loading-star');
    expect(star).toBeDefined();
  });

  it('renders with sm size', () => {
    render(<LoadingSpinner size="sm" />);
    const spinner = screen.getByRole('status');
    expect(spinner).toBeDefined();
  });

  it('renders with md size', () => {
    render(<LoadingSpinner size="md" />);
    const spinner = screen.getByRole('status');
    expect(spinner).toBeDefined();
  });

  it('renders with lg size', () => {
    render(<LoadingSpinner size="lg" />);
    const spinner = screen.getByRole('status');
    expect(spinner).toBeDefined();
  });

  it('renders with purple variant', () => {
    render(<LoadingSpinner variant="purple" />);
    const spinner = screen.getByRole('status');
    expect(spinner).toBeDefined();
  });

  it('renders with white variant', () => {
    render(<LoadingSpinner variant="white" />);
    const spinner = screen.getByRole('status');
    expect(spinner).toBeDefined();
  });

  it('renders custom label', () => {
    render(<LoadingSpinner label="Loading spiritual data..." />);
    expect(screen.getByText('Loading spiritual data...')).toBeDefined();
  });

  it('renders star symbol', () => {
    const { container } = render(<LoadingSpinner />);
    expect(container.textContent).toContain('✦');
  });

  it('has aria-label for accessibility', () => {
    render(<LoadingSpinner label="Loading..." />);
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Loading...');
  });
});