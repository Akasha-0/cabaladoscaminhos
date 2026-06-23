/** @vitest-environment jsdom */
import type React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MandalaMiniBadge } from '@/components/akasha/diario/MandalaMiniBadge';

describe('MandalaMiniBadge', () => {
  describe('render', () => {
    it('renders phase text by default', () => {
      render(<MandalaMiniBadge phase="Lua Nova" />);

      expect(screen.getByText('Lua Nova')).toBeInTheDocument();
    });

    it('renders moonPhase when provided instead of phase', () => {
      render(<MandalaMiniBadge phase="Lua Nova" moonPhase="Crescente" />);

      // When moonPhase is provided, it takes precedence in display
      expect(screen.getByText('Crescente')).toBeInTheDocument();
      expect(screen.queryByText('Lua Nova')).not.toBeInTheDocument();
    });

    it('default color is #7C5CFF', () => {
      render(<MandalaMiniBadge phase="Lua Nova" />);

      // Query the element with the aria-label directly
      const badge = screen.getByRole('generic', { name: 'Mandala Lua Nova' });
      expect(badge).toHaveStyle({ color: 'rgb(124, 92, 255)' });
    });

    it('custom color applied', () => {
      render(<MandalaMiniBadge phase="Lua Nova" color="#2DD4BF" />);

      const badge = screen.getByRole('generic', { name: 'Mandala Lua Nova' });
      expect(badge).toHaveStyle({ color: 'rgb(45, 212, 191)' });
    });

    it('size sm applies smaller text class', () => {
      render(<MandalaMiniBadge phase="Lua Nova" size="sm" />);

      const badge = screen.getByRole('generic', { name: 'Mandala Lua Nova' });
      expect(badge).toHaveClass('text-[0.6rem]', 'px-2', 'py-0.5');
    });

    it('size md applies larger text class', () => {
      render(<MandalaMiniBadge phase="Lua Nova" size="md" />);

      const badge = screen.getByRole('generic', { name: 'Mandala Lua Nova' });
      expect(badge).toHaveClass('text-[0.72rem]', 'px-3', 'py-1');
    });

    it('aria-label is descriptive when only phase provided', () => {
      render(<MandalaMiniBadge phase="Lua Nova" />);

      const badge = screen.getByRole('generic', { name: 'Mandala Lua Nova' });
      expect(badge).toHaveAttribute('aria-label', 'Mandala Lua Nova');
    });

    it('aria-label uses moonPhase when provided', () => {
      render(<MandalaMiniBadge phase="Lua Nova" moonPhase="Crescente" />);

      const badge = screen.getByRole('generic', { name: 'Mandala Crescente' });
      expect(badge).toHaveAttribute('aria-label', 'Mandala Crescente');
    });
  });
});
