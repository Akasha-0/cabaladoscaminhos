'use client';

/**
 * BottomNav — Wave 10.5 mobile-first persistent bottom navigation.
 *
 * Why this exists:
 *   Before Wave 10.5, mobile users had to open a hamburger drawer
 *   (AkashaNavigation) to reach any route. With 5+ primary destinations
 *   (Meu Dia, Mandala, Diário, Mentor, Conta), a hamburger adds two
 *   taps per navigation. This component renders the standard
 *   mobile-app tab bar pattern (WhatsApp, Instagram, iOS native apps).
 *
 * Design choices:
 *   - 5 items, fixed-bottom, full-width, equally distributed.
 *   - Icons 22px (visually balanced with the 9-10px label below).
 *   - Touch targets ≥ 48px (F-228 mobile accessibility).
 *   - Safe-area inset for iPhone home indicator:
 *     `padding-bottom: env(safe-area-inset-bottom)`.
 *   - Active route: violet accent (#9D86FF) + dot indicator above icon.
 *   - Desktop (≥ 768px) is hidden — desktop already has the sidebar.
 *   - Hidden on /login and /register (auth pages shouldn't show app nav).
 *   - Uses 'use client' because it reads usePathname().
 *
 * Why a custom component instead of an external lib:
 *   - Need 5 fixed icons + active dot + safe area — shadcn's NavigationMenu
 *     is desktop-oriented; Headless UI's Tabs would need significant glue.
 *   - This pattern is small enough (~100 LOC) to own directly.
 *
 * Accessibility:
 *   - <nav aria-label="Navegação principal">.
 *   - Each link is an <a> with aria-current="page" when active.
 *   - 48px tap target on every item (WCAG 2.5.5).
 *   - prefers-reduced-motion: no slide animation.
 */

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Sun, Compass, BookOpen, MessageCircle, CircleUser } from 'lucide-react';

interface BottomNavItem {
  /** Path-prefix used to decide `active` (we match startsWith on pathname). */
  hrefBase: string;
  /** Full href passed to <Link href>. Usually `${hrefBase}` (no locale prefix needed
   *  here — caller passes the locale-prefixed href directly). */
  href: string;
  /** Translation key for the label. */
  labelKey: string;
  /** Lucide icon component. */
  Icon: typeof Sun;
  /** data-testid for the link, used by tests. */
  testId: string;
}

interface BottomNavProps {
  /** Already-prefixed locale, e.g. 'pt-BR' or 'en'. */
  locale: string;
}

const NAV_LABEL_KEYS = {
  meuDia: 'bottomNav.meuDia',
  mandala: 'bottomNav.mandala',
  diario: 'bottomNav.diario',
  mentor: 'bottomNav.mentor',
  conta: 'bottomNav.conta',
} as const;

const FALLBACK_LABELS: Record<(typeof NAV_LABEL_KEYS)[keyof typeof NAV_LABEL_KEYS], string> = {
  'bottomNav.meuDia': 'Meu Dia',
  'bottomNav.mandala': 'Mandala',
  'bottomNav.diario': 'Diário',
  'bottomNav.mentor': 'Mentor',
  'bottomNav.conta': 'Conta',
};

/**
 * Routes where the bottom nav MUST NOT appear (auth flows).
 *
 * Exported so callers (and tests) can re-use the same predicate —
 * e.g. the auth pages could check `shouldHideBottomNav(pathname)`
 * before mounting full app chrome.
 *
 * The regex matches:
 *   - /login        (followed by end-of-string)
 *   - /login/...    (followed by /)
 * It also handles locale-prefixed paths because the matched segment
 * just looks for `/login` anywhere after a path boundary. This means
 * `/pt-BR/login`, `/en/login`, `/pt-BR/login/verify` all match.
 */
export function isAuthRoute(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  return /\/login(?:\/|$)/.test(pathname) || /\/register(?:\/|$)/.test(pathname);
}

export function BottomNav({ locale }: BottomNavProps) {
  const pathname = usePathname();

  // Hide on /login and /register.
  if (isAuthRoute(pathname)) return null;

  const items: BottomNavItem[] = [
    {
      hrefBase: '/meu-dia',
      href: `/${locale}/meu-dia`,
      labelKey: NAV_LABEL_KEYS.meuDia,
      Icon: Sun,
      testId: 'bottom-nav-meu-dia',
    },
    {
      hrefBase: '/mandala',
      href: `/${locale}/mandala`,
      labelKey: NAV_LABEL_KEYS.mandala,
      Icon: Compass,
      testId: 'bottom-nav-mandala',
    },
    {
      hrefBase: '/diario',
      href: `/${locale}/diario`,
      labelKey: NAV_LABEL_KEYS.diario,
      Icon: BookOpen,
      testId: 'bottom-nav-diario',
    },
    {
      hrefBase: '/oraculo',
      href: `/${locale}/oraculo`,
      labelKey: NAV_LABEL_KEYS.mentor,
      Icon: MessageCircle,
      testId: 'bottom-nav-mentor',
    },
    {
      hrefBase: '/conta',
      href: `/${locale}/conta`,
      labelKey: NAV_LABEL_KEYS.conta,
      Icon: CircleUser,
      testId: 'bottom-nav-conta',
    },
  ];

  return (
    <nav
      aria-label="Navegação principal"
      data-testid="bottom-nav"
      className="md:hidden fixed bottom-0 left-0 right-0 z-30 border-t border-white/10 bg-[#06070F]/92 backdrop-blur-md"
      style={{
        // iPhone home indicator + Android nav bar gap. The CSS variable
        // --akasha-safe-bottom is defined in src/styles/safe-area.css
        // and resolves to env(safe-area-inset-bottom) on supporting
        // browsers, falling back to 0px elsewhere.
        paddingBottom: 'var(--akasha-safe-bottom, 0px)',
        // Slight darken gradient so content scrolling behind stays legible.
        background:
          'linear-gradient(180deg, rgba(6,7,15,0.86) 0%, rgba(6,7,15,0.96) 100%)',
      }}
    >
      <ul
        className="flex items-stretch justify-around"
        style={{ minHeight: 56 }}
        role="list"
      >
        {items.map(({ href, hrefBase, labelKey, Icon, testId }) => {
          // Active when pathname matches exactly OR is a sub-route
          // (e.g. /pt-BR/diario/alguma-coisa still highlights Diário).
          // We strip the locale prefix before comparing so hrefBase stays
          // locale-agnostic in the comparison.
          const pathWithoutLocale = pathname?.replace(/^\/[^/]+/, '') ?? '';
          const isActive =
            pathWithoutLocale === hrefBase ||
            pathWithoutLocale.startsWith(hrefBase + '/');
          const label = FALLBACK_LABELS[labelKey as keyof typeof FALLBACK_LABELS];

          return (
            <li key={hrefBase} className="flex-1 min-w-0">
              <Link
                href={href}
                data-testid={testId}
                data-active={isActive ? 'true' : 'false'}
                aria-current={isActive ? 'page' : undefined}
                aria-label={label}
                className="group flex h-full min-h-[48px] flex-col items-center justify-center gap-0.5 px-1 py-1.5 text-[10px] font-medium tracking-wide transition-colors"
                style={{
                  // 48px touch target (WCAG 2.5.5)
                  minHeight: 48,
                  color: isActive ? '#9D86FF' : 'rgba(167, 174, 207, 0.7)',
                }}
              >
                {/* Active dot indicator */}
                <span
                  aria-hidden="true"
                  className="block rounded-full transition-all"
                  style={{
                    width: isActive ? 4 : 0,
                    height: isActive ? 4 : 0,
                    background: '#9D86FF',
                    marginBottom: isActive ? 2 : 0,
                  }}
                />
                <Icon
                  size={22}
                  strokeWidth={isActive ? 2.2 : 1.6}
                  aria-hidden="true"
                  className="shrink-0 transition-transform group-active:scale-95"
                />
                <span className="leading-none truncate max-w-full">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export default BottomNav;