/** @vitest-environment jsdom */
import type React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AreasSection } from '@/components/akasha/diario/AreasSection';
import type { Pilar } from '@/lib/grimoire/significados-curados';
import type { TraducaoArea } from '@/lib/grimoire/traducao-areas';

// ─── Mock useReducedMotion ────────────────────────────────────────────────────
vi.mock('@/components/akasha/hooks/useReducedMotion', () => ({
  useReducedMotion: vi.fn(() => false),
}));

// ─── Mock next/navigation ────────────────────────────────────────────────────
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn() }),
  usePathname: () => '/pt-BR/diario',
  useSearchParams: () => new URLSearchParams(),
}));

// ─── Mock framer-motion ─────────────────────────────────────────────────────
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: { children: React.ReactNode }): React.ReactElement => (
      <div data-motion="true" {...props}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }): React.ReactElement => <>{children}</>,
}));

// ─── Mock TraducaoAreaPanel (dynamic ssr:false) ─────────────────────────────
vi.mock('@/components/akasha/TraducaoAreaPanel', () => ({
  __esModule: true,
  default: ({ area, traducao }: { area: string; traducao: TraducaoArea }): React.ReactElement => (
    <span data-testid="traducao-area-panel" data-area={area}>
      {traducao.nome}: {traducao.descricao}
    </span>
  ),
}));

describe('AreasSection', () => {
  const defaultProps = {
    pilarPrincipal: 'cabala' as Pilar,
    pilarInfo: { nome: 'Numerologia Cabalística', cor: '#7C5CFF' },
    locale: 'pt-BR',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('render', () => {
    it('renders the section with translated aria-label', () => {
      render(<AreasSection {...defaultProps} />);
      // Manual mock returns 'Áreas da Vida' for 'diario.areas.titulo'
      expect(screen.getByRole('region', { name: 'Áreas da Vida' })).toBeInTheDocument();
    });

    it('renders the expand/collapse button with translated text', () => {
      render(<AreasSection {...defaultProps} />);
      // Button contains h2 text 'Áreas da Vida' and p text (instruction)
      expect(screen.getByRole('button', { name: /áreas da vida/i })).toBeInTheDocument();
    });
  });

  describe('expand/collapse', () => {
    it('is collapsed by default (aria-expanded=false)', () => {
      render(<AreasSection {...defaultProps} />);
      const btn = screen.getByRole('button', { name: /áreas da vida/i });
      expect(btn).toHaveAttribute('aria-expanded', 'false');
    });

    it('expands after clicking', () => {
      render(<AreasSection {...defaultProps} />);
      const btn = screen.getByRole('button', { name: /áreas da vida/i });
      fireEvent.click(btn);
      expect(btn).toHaveAttribute('aria-expanded', 'true');
    });

    it('has aria-controls pointing to areas-panel', () => {
      render(<AreasSection {...defaultProps} />);
      const btn = screen.getByRole('button', { name: /áreas da vida/i });
      expect(btn).toHaveAttribute('aria-controls', 'areas-panel');
    });

    it('collapses after clicking again', () => {
      render(<AreasSection {...defaultProps} />);
      const btn = screen.getByRole('button', { name: /áreas da vida/i });
      fireEvent.click(btn);
      expect(btn).toHaveAttribute('aria-expanded', 'true');
      fireEvent.click(btn);
      expect(btn).toHaveAttribute('aria-expanded', 'false');
    });
  });
});
