/** @vitest-environment jsdom */
import type React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SignificadoSection } from '@/components/akasha/diario/SignificadoSection';
import type { Pilar, SignificadoCurado } from '@/lib/grimoire/significados-curados';

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

// ─── Mock framer-motion ─────────────────────────────────────────────────────
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: { children: React.ReactNode }): React.ReactElement => (
      <div data-motion="true" {...props}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }): React.ReactElement => <>{children}</>,
}));

// ─── Mock SignificadoPilar (dynamic ssr:false — async in jsdom) ─────────────
vi.mock('@/components/akasha/SignificadoPilar', () => ({
  __esModule: true,
  default: ({ significado, cor, destaque }: {
    significado: SignificadoCurado;
    cor: string;
    destaque?: boolean;
  }): React.ReactElement => (
    <span data-testid="significado-pilar" data-pilar={significado.pilar}>
      {significado.titulo} ({cor}){destaque ? ' [principal]' : ''}
    </span>
  ),
}));

// ─── Fixture data ─────────────────────────────────────────────────────────────
const makeSignificado = (pilar: Pilar, id: number, titulo: string): SignificadoCurado => ({
  pilar,
  id,
  titulo,
  tipo: 'numero' as const,
  serie: [id],
  o_que_e: `Significado de ${titulo}.`,
  o_que_pedir: 'Peça clareza.',
  sombra: 'Risco.',
  pratica: 'Pratique.',
  conexao: 'Conexão.',
  fonte: 'Teste',
});

const FIXTURE_SIGNIFICADOS: Record<Pilar, SignificadoCurado> = {
  cabala: makeSignificado('cabala', 3, 'Caminho de Fogo'),
  astrologia: makeSignificado('astrologia', 1, 'Sol em Leão'),
  tantrica: makeSignificado('tantrica', 1, 'Corpo 1 — Alma'),
  odu: makeSignificado('odu', 1, 'Ogbe — Clareza Total'),
  iching: makeSignificado('iching', 1, 'Hexagrama 1 — O Criativo'),
};

const FIXTURE_PILARES = {
  cabala: { life_path: 3, birthday: 15, expression: 5, ano_pessoal: 6 },
  astrologia: {
    sol_signo: 'Leão', asc_signo: 'Escorpião', lua_signo: 'Câncer',
    lua_fase: 'cheia' as const,
    trinity: { sombra: 2, dom: 7, graca: 3 },
    trinity_dominante: 'dom' as const,
    lilith_signo: 'Áries', casa_8_signo: 'Escorpião',
  },
  odu: { odu_principal: 'Ogbe', odu_secundario: 'Oyeku', fonte: 'Ifá' as const, aviso: 'Mantenha a mente clara.' },
  iching: { hexagrama_natal: 1, hexagrama_dia: 26, level: 'gift' as const },
};

describe('SignificadoSection', () => {
  const defaultProps = {
    pilares: FIXTURE_PILARES,
    pilarPrincipal: 'cabala' as Pilar,
    significados: FIXTURE_SIGNIFICADOS,
    locale: 'pt-BR',
  };

  beforeEach(() => {
    mockT.mockClear();
  });

  describe('render', () => {
    it('renders the section', () => {
      render(<SignificadoSection {...defaultProps} />);
      expect(screen.getByRole('region', { name: 'diario.significado.titulo' })).toBeInTheDocument();
    });

    it('renders the section title from i18n', () => {
      render(<SignificadoSection {...defaultProps} />);
      expect(screen.getByText('diario.significado.titulo')).toBeInTheDocument();
    });

    // Component now shows only 3 pilares (principal + 2 nearest), not all 5
    it('renders 3 pilar buttons (principal + 2 nearest)', () => {
      render(<SignificadoSection {...defaultProps} />);
      // defaultProps.pilarPrincipal='cabala' → shows ['cabala','astrologia','tantrica']
      expect(screen.getAllByRole('button')).toHaveLength(3);
    });
  });

  describe('expand/collapse per pilar', () => {
    it('has aria-expanded=false on all buttons by default', () => {
      render(<SignificadoSection {...defaultProps} />);
      screen.getAllByRole('button').forEach((btn) => {
        expect(btn).toHaveAttribute('aria-expanded', 'false');
      });
    });

    it('toggles aria-expanded on cabala button after click', () => {
      render(<SignificadoSection {...defaultProps} />);
      // Button name = t('diario.significado.pilarNames.cabala')
      const cabalaBtn = screen.getByRole('button', { name: /diario\.significado\.pilarNames\.cabala/i });
      expect(cabalaBtn).toHaveAttribute('aria-expanded', 'false');
      fireEvent.click(cabalaBtn);
      expect(cabalaBtn).toHaveAttribute('aria-expanded', 'true');
    });

    it('has aria-controls pointing to the correct panel id on all visible buttons', () => {
      render(<SignificadoSection {...defaultProps} />);
      // With pilarPrincipal='cabala', shows: cabala, astrologia, tantrica
      const pilarIds = ['cabala', 'astrologia', 'tantrica'];
      const pilarKeys = ['pilarNames.cabala', 'pilarNames.astrologia', 'pilarNames.tantrica'];

      pilarIds.forEach((pilarId, i) => {
        const btn = screen.getByRole('button', { name: new RegExp(pilarKeys[i], 'i') });
        expect(btn).toHaveAttribute('aria-controls', `significado-${pilarId}`);
      });
    });

    it('opens only one panel at a time (mutual exclusivity)', () => {
      render(<SignificadoSection {...defaultProps} />);
      // Shows: cabala (principal), astrologia, tantrica
      const cabalaBtn = screen.getByRole('button', { name: /diario\.significado\.pilarNames\.cabala/i });
      const astroBtn = screen.getByRole('button', { name: /diario\.significado\.pilarNames\.astrologia/i });

      fireEvent.click(cabalaBtn);
      expect(cabalaBtn).toHaveAttribute('aria-expanded', 'true');

      fireEvent.click(astroBtn);
      expect(cabalaBtn).toHaveAttribute('aria-expanded', 'false');
      expect(astroBtn).toHaveAttribute('aria-expanded', 'true');
    });

    it('shows unavailable message when significado is undefined for a pilar', () => {
      // With pilarPrincipal='cabala', astrologia is visible; set it to undefined
      const significadosParciais = { ...FIXTURE_SIGNIFICADOS, astrologia: undefined } as typeof FIXTURE_SIGNIFICADOS;
      render(<SignificadoSection {...defaultProps} significados={significadosParciais} />);
      const astroBtn = screen.getByRole('button', { name: /diario\.significado\.pilarNames\.astrologia/i });
      fireEvent.click(astroBtn);
      // t('diario.significado.indisponivel') returns the key
      expect(screen.getByText('diario.significado.indisponivel')).toBeInTheDocument();
    });
  });

  describe('principal badge', () => {
    it('renders the principal badge when pilarPrincipal is astrologia', () => {
      // pilarPrincipal='astrologia' (index 1) → shows [cabala, astrologia, tantrica]
      render(<SignificadoSection {...defaultProps} pilarPrincipal="astrologia" />);
      expect(screen.getByText('diario.significado.principal')).toBeInTheDocument();
    });
  });

  describe('i18n wiring', () => {
    it('renders without error with locale en', () => {
      render(<SignificadoSection {...defaultProps} locale="en" />);
      expect(screen.getByRole('region')).toBeInTheDocument();
    });

    it('renders principal badge for iching when iching is principal', () => {
      render(
        <SignificadoSection
          {...defaultProps}
          pilarPrincipal="iching"
          pilarInfo={{ nome: 'I Ching', cor: '#A0763A' }}
        />
      );
      expect(screen.getByText('diario.significado.principal')).toBeInTheDocument();
    });
  });
});
