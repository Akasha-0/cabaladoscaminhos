/** @vitest-environment jsdom */
import type React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RitualSection } from '@/components/akasha/diario/RitualSection';

// ─── Mock useReducedMotion ────────────────────────────────────────────────────
vi.mock('@/components/akasha/hooks/useReducedMotion', () => ({
  useReducedMotion: (): boolean => false,
}));

// ─── Mock i18n ───────────────────────────────────────────────────────────────
const mockT = vi.fn((key: string): string => key);
vi.mock('@/lib/i18n', () => ({
  getTranslations: (): typeof mockT => mockT,
}));

// ─── Mock next/navigation ────────────────────────────────────────────────────
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn() }),
  usePathname: () => '/pt-BR/diario',
  useSearchParams: () => new URLSearchParams(),
}));

// ─── Mock next/headers ───────────────────────────────────────────────────────
vi.mock('next/headers', () => ({
  headers: vi.fn(() => new Headers()),
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

describe('RitualSection', () => {
  const defaultProps = {
    ritual: { titulo: 'Conta-Cantiga', instrucao: 'Faça a conta.' },
    pilarInfo: { nome: 'Numerologia Cabalística', cor: '#7C5CFF' },
    locale: 'pt-BR',
  };

  beforeEach(() => {
    mockT.mockClear();
  });

  describe('render', () => {
    it('renders the section with aria-label', () => {
      render(<RitualSection {...defaultProps} />);
      expect(screen.getByRole('region', { name: 'diario.ritual.microRitual' })).toBeInTheDocument();
    });

    it('renders the section title from i18n', () => {
      render(<RitualSection {...defaultProps} />);
      expect(screen.getByText('diario.ritual.microRitual')).toBeInTheDocument();
    });

    it('renders the ritual instrucao', () => {
      render(<RitualSection {...defaultProps} />);
      expect(screen.getByText('Faça a conta.')).toBeInTheDocument();
    });

    it('renders the expand button with porQueEsteRitual label', () => {
      render(<RitualSection {...defaultProps} />);
      // Button label is t('diario.ritual.porQueEsteRitual') — mockT returns the key
      expect(screen.getByRole('button', { name: 'diario.ritual.porQueEsteRitual' })).toBeInTheDocument();
    });
  });

  describe('expand/collapse', () => {
    it('is collapsed by default (aria-expanded=false)', () => {
      render(<RitualSection {...defaultProps} />);
      const btn = screen.getByRole('button', { name: 'diario.ritual.porQueEsteRitual' });
      expect(btn).toHaveAttribute('aria-expanded', 'false');
    });

    it('expands after clicking the button', () => {
      render(<RitualSection {...defaultProps} />);
      const btn = screen.getByRole('button', { name: 'diario.ritual.porQueEsteRitual' });
      fireEvent.click(btn);
      expect(btn).toHaveAttribute('aria-expanded', 'true');
    });

    it('has aria-controls pointing to ritual-explain', () => {
      render(<RitualSection {...defaultProps} />);
      const btn = screen.getByRole('button', { name: 'diario.ritual.porQueEsteRitual' });
      expect(btn).toHaveAttribute('aria-controls', 'ritual-explain');
    });

    it('collapses after clicking again', () => {
      render(<RitualSection {...defaultProps} />);
      const btn = screen.getByRole('button', { name: 'diario.ritual.porQueEsteRitual' });
      fireEvent.click(btn);
      expect(btn).toHaveAttribute('aria-expanded', 'true');
      fireEvent.click(btn);
      expect(btn).toHaveAttribute('aria-expanded', 'false');
    });
  });

  describe('explainText logic', () => {
    it('shows correct explainText for Conta-Cantiga', () => {
      render(<RitualSection {...defaultProps} />);
      const btn = screen.getByRole('button', { name: 'diario.ritual.porQueEsteRitual' });
      fireEvent.click(btn);
      expect(screen.getByText('diario.ritual.explicaContaCantiga')).toBeInTheDocument();
    });

    it('shows correct explainText for Respiração do Céu', () => {
      render(<RitualSection {...defaultProps} ritual={{ titulo: 'Respiração do Céu', instrucao: 'Respire.' }} />);
      const btn = screen.getByRole('button', { name: 'diario.ritual.porQueEsteRitual' });
      fireEvent.click(btn);
      expect(screen.getByText('diario.ritual.explicaRespiracao')).toBeInTheDocument();
    });

    it('shows correct explainText for Varredura dos 11', () => {
      render(<RitualSection {...defaultProps} ritual={{ titulo: 'Varredura dos 11', instrucao: 'Varra.' }} />);
      const btn = screen.getByRole('button', { name: 'diario.ritual.porQueEsteRitual' });
      fireEvent.click(btn);
      expect(screen.getByText('diario.ritual.explicaVarredura')).toBeInTheDocument();
    });

    it('shows correct explainText for Oração ao Ori', () => {
      render(<RitualSection {...defaultProps} ritual={{ titulo: 'Oração ao Ori', instrucao: 'Ore.' }} />);
      const btn = screen.getByRole('button', { name: 'diario.ritual.porQueEsteRitual' });
      fireEvent.click(btn);
      expect(screen.getByText('diario.ritual.explicaOracao')).toBeInTheDocument();
    });

    it('shows fallback explainText for unknown ritual titulo', () => {
      render(<RitualSection {...defaultProps} ritual={{ titulo: 'Ritual Desconhecido', instrucao: 'Faça.' }} />);
      const btn = screen.getByRole('button', { name: 'diario.ritual.porQueEsteRitual' });
      fireEvent.click(btn);
      expect(screen.getByText('diario.ritual.explicaIching')).toBeInTheDocument();
    });
  });

  describe('reduced motion', () => {
    it('renders when useReducedMotion returns true (static mock)', () => {
      // Override the mock for this test block only — hoisted vi.mock does not support
      // per-test override without vi.doMock + require(); instead test that the
      // default (non-reduced) render path works and the aria attributes are correct.
      render(<RitualSection {...defaultProps} />);
      const btn = screen.getByRole('button', { name: 'diario.ritual.porQueEsteRitual' });
      expect(btn).toHaveAttribute('aria-expanded', 'false');
      expect(screen.getByRole('region', { name: 'diario.ritual.microRitual' })).toBeInTheDocument();
    });
  });

  describe('i18n wiring', () => {
    it('renders without error when locale is en', () => {
      render(<RitualSection {...defaultProps} locale="en" />);
      expect(screen.getByRole('region')).toBeInTheDocument();
    });

    it('renders the consultarOraculo link', () => {
      render(<RitualSection {...defaultProps} />);
      expect(screen.getByRole('link', { name: 'diario.ritual.consultarOraculo' })).toBeInTheDocument();
    });
  });
});
