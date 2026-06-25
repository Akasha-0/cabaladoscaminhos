/** @vitest-environment jsdom */
/**
 * BottomNav tests — Wave 10.5 mobile-first persistent navigation.
 *
 * Verifies:
 *   1. Renders 5 nav items: Meu Dia, Mandala, Diário, Mentor, Conta.
 *   2. Active route gets `aria-current="page"` + data-active="true".
 *   3. Hidden on /login and /register.
 *   4. Hidden on desktop (md: breakpoint via Tailwind class).
 *   5. Each link has ≥ 48px touch target.
 *   6. Safe-area CSS variable used for bottom padding.
 *   7. Pathname sub-routes still mark parent as active
 *      (e.g. /pt-BR/diario/foo → Diário active).
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';

import { BottomNav, isAuthRoute } from '../BottomNav';

// ─── i18n mock ──────────────────────────────────────────────────────
// Provides t() that returns the key itself for missing translations
// (consistent with the production fallback chain in @/i18n).
const I18N_MAP: Record<string, string> = {
  'nav.bottomNav.ariaLabel': 'Navegação principal',
  'nav.bottomNav.meuDia': 'Meu Dia',
  'nav.bottomNav.mandala': 'Mandala',
  'nav.bottomNav.diario': 'Diário',
  'nav.bottomNav.mentor': 'Mentor',
  'nav.bottomNav.conta': 'Conta',
};

vi.mock('@/i18n', () => ({
  useTranslation: () => ({
    t: (key: string, params?: Record<string, string | number>) => {
      let value = I18N_MAP[key] ?? key;
      if (params) {
        value = value.replace(/\{(\w+)\}/g, (_, k) =>
          Object.prototype.hasOwnProperty.call(params, k) ? String(params[k]) : `{${k}}`
        );
      }
      return value;
    },
  }),
}));

// ─── next/navigation mock ────────────────────────────────────────────────
// We control `pathname` per-test by reassigning the mock variable.
let mockPathname = '/pt-BR/meu-dia';

vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname,
}));

// next/link is used by BottomNav; in tests it just renders <a href=...>.
vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    ...rest
  }: {
    href: string;
    children: React.ReactNode;
  } & React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

// ─── Helpers ─────────────────────────────────────────────────────────────
function setPath(p: string) {
  mockPathname = p;
  cleanup();
}

const NAV_IDS = [
  'bottom-nav-meu-dia',
  'bottom-nav-mandala',
  'bottom-nav-diario',
  'bottom-nav-mentor',
  'bottom-nav-conta',
] as const;

describe('BottomNav', () => {
  beforeEach(() => {
    mockPathname = '/pt-BR/meu-dia';
  });

  it('renders the bottom nav element', () => {
    render(<BottomNav locale="pt-BR" />);
    expect(screen.getByTestId('bottom-nav')).toBeInTheDocument();
  });

  it('renders 5 nav items in order', () => {
    render(<BottomNav locale="pt-BR" />);
    for (const id of NAV_IDS) {
      expect(screen.getByTestId(id)).toBeInTheDocument();
    }
  });

  it('each link has the expected href with locale prefix', () => {
    render(<BottomNav locale="pt-BR" />);
    expect(screen.getByTestId('bottom-nav-meu-dia')).toHaveAttribute(
      'href',
      '/pt-BR/meu-dia'
    );
    expect(screen.getByTestId('bottom-nav-mandala')).toHaveAttribute(
      'href',
      '/pt-BR/mandala'
    );
    expect(screen.getByTestId('bottom-nav-diario')).toHaveAttribute(
      'href',
      '/pt-BR/diario'
    );
    expect(screen.getByTestId('bottom-nav-mentor')).toHaveAttribute(
      'href',
      '/pt-BR/oraculo'
    );
    expect(screen.getByTestId('bottom-nav-conta')).toHaveAttribute(
      'href',
      '/pt-BR/conta'
    );
  });

  it('marks the active link with aria-current="page" + data-active="true"', () => {
    render(<BottomNav locale="pt-BR" />);
    const meuDia = screen.getByTestId('bottom-nav-meu-dia');
    expect(meuDia).toHaveAttribute('aria-current', 'page');
    expect(meuDia).toHaveAttribute('data-active', 'true');
    // The rest are NOT active: aria-current is not rendered at all,
    // and data-active is the literal string "false".
    const mandala = screen.getByTestId('bottom-nav-mandala');
    expect(mandala.getAttribute('aria-current')).toBeNull();
    expect(mandala).toHaveAttribute('data-active', 'false');
  });

  it('honors a different locale (en) and still marks the active route', () => {
    setPath('/en/diario');
    render(<BottomNav locale="en" />);
    expect(screen.getByTestId('bottom-nav-meu-dia')).toHaveAttribute(
      'href',
      '/en/meu-dia'
    );
    expect(screen.getByTestId('bottom-nav-diario')).toHaveAttribute(
      'aria-current',
      'page'
    );
  });

  it('marks a parent route active for sub-routes', () => {
    // /pt-BR/diario/foo should still highlight Diário (path startsWith).
    setPath('/pt-BR/diario/mandato-do-dia');
    render(<BottomNav locale="pt-BR" />);
    expect(screen.getByTestId('bottom-nav-diario')).toHaveAttribute(
      'aria-current',
      'page'
    );
  });

  it('hides the nav on /login (auth route)', () => {
    setPath('/pt-BR/login');
    render(<BottomNav locale="pt-BR" />);
    expect(screen.queryByTestId('bottom-nav')).toBeNull();
  });

  it('hides the nav on /register (auth route)', () => {
    setPath('/pt-BR/register');
    render(<BottomNav locale="pt-BR" />);
    expect(screen.queryByTestId('bottom-nav')).toBeNull();
  });

  it('hides the nav on locale-prefixed /en/login', () => {
    setPath('/en/login');
    render(<BottomNav locale="en" />);
    expect(screen.queryByTestId('bottom-nav')).toBeNull();
  });

  it('hides the nav on auth subroutes like /pt-BR/login/foo', () => {
    setPath('/pt-BR/login/verify');
    render(<BottomNav locale="pt-BR" />);
    expect(screen.queryByTestId('bottom-nav')).toBeNull();
  });

  it('every link has a ≥ 48px touch target (mobile accessibility)', () => {
    render(<BottomNav locale="pt-BR" />);
    for (const id of NAV_IDS) {
      const el = screen.getByTestId(id);
      const styles = window.getComputedStyle(el);
      // Inline style sets minHeight: 48.
      expect(styles.minHeight).toBe('48px');
    }
  });

  it('uses a nav landmark with aria-label', () => {
    render(<BottomNav locale="pt-BR" />);
    const nav = screen.getByRole('navigation', { name: 'Navegação principal' });
    expect(nav).toBeInTheDocument();
  });

  it('contains accessible labels via aria-label on each link', () => {
    render(<BottomNav locale="pt-BR" />);
    expect(screen.getByTestId('bottom-nav-meu-dia')).toHaveAttribute(
      'aria-label',
      'Meu Dia'
    );
    expect(screen.getByTestId('bottom-nav-mandala')).toHaveAttribute(
      'aria-label',
      'Mandala'
    );
    expect(screen.getByTestId('bottom-nav-diario')).toHaveAttribute(
      'aria-label',
      'Diário'
    );
    expect(screen.getByTestId('bottom-nav-mentor')).toHaveAttribute(
      'aria-label',
      'Mentor'
    );
    expect(screen.getByTestId('bottom-nav-conta')).toHaveAttribute(
      'aria-label',
      'Conta'
    );
  });

  it('has safe-area padding (env fallback) applied to the nav element', () => {
    render(<BottomNav locale="pt-BR" />);
    const nav = screen.getByTestId('bottom-nav');
    // inline style sets paddingBottom to the CSS var. We verify the
    // *property is set* — exact value depends on env() support, which
    // jsdom doesn't compute, but the property must be present.
    const inlineStyle = (nav as HTMLElement).style;
    expect(inlineStyle.paddingBottom).not.toBe('');
    // The CSS uses var(--akasha-safe-bottom, 0px) — should reference the var.
    expect(inlineStyle.paddingBottom).toMatch(/var\(--akasha-safe-bottom/);
  });

  it('hides on desktop via md:hidden Tailwind class', () => {
    render(<BottomNav locale="pt-BR" />);
    const nav = screen.getByTestId('bottom-nav');
    expect(nav.className).toContain('md:hidden');
  });
});

describe('isAuthRoute (BottomNav hide predicate)', () => {
  it('returns false for null/undefined/empty', () => {
    expect(isAuthRoute(null)).toBe(false);
    expect(isAuthRoute(undefined)).toBe(false);
    expect(isAuthRoute('')).toBe(false);
  });

  it('returns true for /login', () => {
    expect(isAuthRoute('/login')).toBe(true);
  });

  it('returns true for /register', () => {
    expect(isAuthRoute('/register')).toBe(true);
  });

  it('returns true for locale-prefixed auth routes', () => {
    expect(isAuthRoute('/pt-BR/login')).toBe(true);
    expect(isAuthRoute('/en/register')).toBe(true);
  });

  it('returns true for auth sub-routes', () => {
    expect(isAuthRoute('/pt-BR/login/verify')).toBe(true);
    expect(isAuthRoute('/pt-BR/register/email-sent')).toBe(true);
  });

  it('returns false for non-auth routes', () => {
    expect(isAuthRoute('/pt-BR/meu-dia')).toBe(false);
    expect(isAuthRoute('/pt-BR/diario')).toBe(false);
    expect(isAuthRoute('/')).toBe(false);
    // A path that contains "login" as part of another word (not a segment)
    // is NOT an auth route. e.g. /prelogin-flow or /loginfo.
    expect(isAuthRoute('/pt-BR/prelogin-flow')).toBe(false);
  });

  it('does NOT treat /loginfo or /signin as auth routes (only /login)', () => {
    // Confirm the predicate is strict to /login and /register.
    expect(isAuthRoute('/pt-BR/loginfo')).toBe(false);
    expect(isAuthRoute('/pt-BR/signin')).toBe(false);
  });
});