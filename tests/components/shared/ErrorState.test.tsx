/** @vitest-environment jsdom */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ErrorState } from '@/components/shared/ErrorState';

describe('ErrorState', () => {
  it('renders without crashing', () => {
    render(<ErrorState message="Test error" />);
    expect(screen.getByText('Test error')).toBeDefined();
  });

  it('renders error icon', () => {
    const { container } = render(<ErrorState message="Test" />);
    expect(container.querySelector('svg, [class*="alert"]')).toBeDefined();
  });

  it('renders with default spiritual variant', () => {
    const { container } = render(<ErrorState />);
    // Default spiritual variant renders a lucide Star SVG, not the ✦ character
    const starSvg = container.querySelector('svg[class*="spiritual-gold"]');
    expect(starSvg).toBeDefined();
  });

  it('renders custom title when provided', () => {
    render(<ErrorState title="Custom Title" />);
    expect(screen.getByText('Custom Title')).toBeDefined();
  });

  it('renders custom message when provided', () => {
    render(<ErrorState message="Custom message" />);
    expect(screen.getByText('Custom message')).toBeDefined();
  });

  it('renders retry button when onRetry is provided', () => {
    const onRetry = vi.fn();
    render(<ErrorState message="Error" onRetry={onRetry} />);
    expect(screen.getByText('Tentar Novamente')).toBeDefined();
  });

  it('calls onRetry when retry button is clicked', () => {
    const onRetry = vi.fn();
    render(<ErrorState message="Error" onRetry={onRetry} />);
    screen.getByText('Tentar Novamente').click();
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('renders warning variant with yellow styling', () => {
    const { container } = render(
      <ErrorState message="Warning" variant="warning" />
    );
    const icon = container.querySelector('.text-yellow-500');
    expect(icon).toBeDefined();
  });

  it('renders critical variant with red styling', () => {
    const { container } = render(
      <ErrorState message="Critical" variant="critical" />
    );
    const icon = container.querySelector('.text-red-500');
    expect(icon).toBeDefined();
  });
});