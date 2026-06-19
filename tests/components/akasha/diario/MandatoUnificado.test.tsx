/** @vitest-environment jsdom */
import type React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MandatoUnificado } from '@/components/akasha/diario/MandatoUnificado';
import type { MandatoEsqueleto, MentorHook } from '@/components/akasha/diario/types';

// ─── Polyfill window.matchMedia for jsdom ─────────────────────────────────────
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(() => ({
    matches: false,
    media: '',
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// ─── Mock useReducedMotion ────────────────────────────────────────────────────
vi.mock('@/components/akasha/hooks/useReducedMotion', () => ({
  useReducedMotion: (): boolean => false,
}));

// ─── Mock i18n ───────────────────────────────────────────────────────────────
const mockT = vi.fn((key: string): string => key);
vi.mock('@/lib/i18n', () => ({
  getTranslations: (): typeof mockT => mockT,
}));

// ─── Mock next/navigation ─────────────────────────────────────────────────────
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn() }),
  usePathname: () => '/pt-BR/diario',
  useSearchParams: () => new URLSearchParams(),
}));

// ─── Mock next/headers ───────────────────────────────────────────────────────
vi.mock('next/headers', () => ({
  headers: vi.fn(() => new Headers()),
}));

describe('MandatoUnificado', () => {
  const defaultMandato: MandatoEsqueleto = {
    escala: 'D',
    pilares_relevantes: ['cabala', 'astrologia'],
    redacao_bruta: 'Texto do mandato.',
    cita_fontes: ['Fonte 1', 'Fonte 2'],
  };

  const defaultMentor: MentorHook = {
    intencao: 'Expresse sua verdade interior.',
    crise_detectada: false,
    recurso: null,
  };

  const defaultProps = {
    date: '2025-01-15',
    mandato: defaultMandato,
    mentor_hook: defaultMentor,
    frases: ['Primeira frase.', 'Segunda frase.', 'Terceira frase.'],
    pilarInfo: { nome: 'Numerologia Cabalística', cor: '#7C5CFF' },
    locale: 'pt-BR',
  };

  beforeEach(() => {
    mockT.mockClear();
    window.sessionStorage.clear();
  });

  afterEach(() => {
    window.sessionStorage.clear();
  });

  describe('render', () => {
    it('renders the section with aria-label', () => {
      render(<MandatoUnificado {...defaultProps} />);
      expect(screen.getByRole('region', { name: 'diario.mandato.ariaLabel' })).toBeInTheDocument();
    });

    it('renders the escala D in the header (text split across nodes)', () => {
      render(<MandatoUnificado {...defaultProps} />);
      // escalaPrefix key is split across text nodes — use regex to match partial text
      expect(screen.getByText(/diario\.mandato\.escalaPrefix/)).toBeInTheDocument();
    });

    it('renders the three frases', () => {
      render(<MandatoUnificado {...defaultProps} />);
      expect(screen.getByText('Primeira frase.')).toBeInTheDocument();
      expect(screen.getByText('Segunda frase.')).toBeInTheDocument();
      expect(screen.getByText('Terceira frase.')).toBeInTheDocument();
    });

    it('renders pilar badges for relevant pilares', () => {
      render(<MandatoUnificado {...defaultProps} />);
      expect(screen.getByText('cabala')).toBeInTheDocument();
      expect(screen.getByText('astrologia')).toBeInTheDocument();
    });

    it('renders escala S header (text split across nodes)', () => {
      render(<MandatoUnificado {...defaultProps} mandato={{ ...defaultMandato, escala: 'S' }} />);
      expect(screen.getByText(/diario\.mandato\.escalaPrefix/)).toBeInTheDocument();
    });
  });

  describe('crise detection (CVV-188)', () => {
    it('shows CVV block when crise_detectada is true', () => {
      render(<MandatoUnificado {...defaultProps} mentor_hook={{ ...defaultMentor, crise_detectada: true }} />);
      expect(screen.getByText('diario.mandato.cvvRecurso')).toBeInTheDocument();
    });

    it('does not show frases when crise_detectada is true', () => {
      render(<MandatoUnificado {...defaultProps} mentor_hook={{ ...defaultMentor, crise_detectada: true }} />);
      expect(screen.queryByText('Primeira frase.')).not.toBeInTheDocument();
    });

    it('shows CVV phone key when crise_detectada is true', () => {
      render(<MandatoUnificado {...defaultProps} mentor_hook={{ ...defaultMentor, crise_detectada: true }} />);
      expect(screen.getByText('diario.mandato.cvvLigue')).toBeInTheDocument();
    });
  });

  describe('pergunta expand/collapse', () => {
    it('hides pergunta panel by default', () => {
      render(<MandatoUnificado {...defaultProps} />);
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    });

    it('shows pergunta panel after clicking pergunta heading button', () => {
      render(<MandatoUnificado {...defaultProps} />);
      const perguntaBtn = screen.getByRole('button', { name: /diario\.mandato\.perguntaDoDia/i });
      fireEvent.click(perguntaBtn);
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('has aria-expanded toggling on pergunta button', () => {
      render(<MandatoUnificado {...defaultProps} />);
      const perguntaBtn = screen.getByRole('button', { name: /diario\.mandato\.perguntaDoDia/i });
      expect(perguntaBtn).toHaveAttribute('aria-expanded', 'false');
      fireEvent.click(perguntaBtn);
      expect(perguntaBtn).toHaveAttribute('aria-expanded', 'true');
    });

    it('has aria-controls pointing to pergunta-panel', () => {
      render(<MandatoUnificado {...defaultProps} />);
      const perguntaBtn = screen.getByRole('button', { name: /diario\.mandato\.perguntaDoDia/i });
      expect(perguntaBtn).toHaveAttribute('aria-controls', 'pergunta-panel');
    });
  });

  describe('sessionStorage integration', () => {
    it('pre-fills textarea from sessionStorage when a value is stored', () => {
      const sessionKey = 'diario.mandato.sessionStorageKey';
      window.sessionStorage.setItem(sessionKey, 'Minha reflexão guardada.');
      render(<MandatoUnificado {...defaultProps} />);
      const perguntaBtn = screen.getByRole('button', { name: /diario\.mandato\.perguntaDoDia/i });
      fireEvent.click(perguntaBtn);
      expect(screen.getByRole('textbox')).toHaveValue('Minha reflexão guardada.');
    });

    it('writes textarea value to sessionStorage on change', () => {
      const sessionKey = 'diario.mandato.sessionStorageKey';
      render(<MandatoUnificado {...defaultProps} />);
      const perguntaBtn = screen.getByRole('button', { name: /diario\.mandato\.perguntaDoDia/i });
      fireEvent.click(perguntaBtn);
      const textarea = screen.getByRole('textbox');
      fireEvent.change(textarea, { target: { value: 'Nova reflexão.' } });
      expect(window.sessionStorage.getItem(sessionKey)).toBe('Nova reflexão.');
    });
  });

  describe('i18n wiring', () => {
    it('renders without error when locale is en', () => {
      render(<MandatoUnificado {...defaultProps} locale="en" />);
      expect(screen.getByRole('region')).toBeInTheDocument();
    });

    it('renders with empty pilares_relevantes', () => {
      render(<MandatoUnificado {...defaultProps} mandato={{ ...defaultMandato, pilares_relevantes: [] }} />);
      expect(screen.getByRole('region')).toBeInTheDocument();
      expect(screen.getByText('Primeira frase.')).toBeInTheDocument();
    });
  });
});
