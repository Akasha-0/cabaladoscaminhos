'use client';

import { useState } from 'react';
import { CosmicBackground } from '@/components/design-system/CosmicBackground';
import { cn } from '@/lib/utils';

/**
 * Props for the AppShell component
 */
export interface AppShellProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * AppShell layout component providing the main app structure with sidebar navigation.
 * 
 * Features:
 * - Responsive sidebar that collapses on mobile
 * - Dark mystical theme with cosmic background
 * - Gold and purple spiritual accents
 * - Smooth CSS transitions (no Framer Motion)
 * - WCAG AA accessibility support
 * 
 * @example
 * ```tsx
 * <AppShell>
 *   <DashboardPage />
 * </AppShell>
 * ```
 */
export function AppShell({ children, className = '' }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <CosmicBackground variant="default" className="min-h-screen">
      <div className="flex min-h-screen">
        {/* Mobile sidebar backdrop */}
        <div
          className={cn(
            'fixed inset-0 z-40 bg-void/80 backdrop-blur-sm transition-opacity duration-300 md:hidden',
            sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          )}
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />

        {/* Sidebar navigation */}
        <aside
          className={cn(
            'fixed left-0 top-0 z-50 h-full w-64 bg-cosmos/95 backdrop-blur-md border-r border-gold/10',
            'transform transition-transform duration-300 ease-out md:translate-x-0 md:static md:border-l-0',
            'shadow-[4px_0_24px_rgba(201,162,39,0.08)]',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          )}
          aria-label="Main navigation"
        >
          {/* Sidebar header */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gold/10">
            <h1 className="font-cinzel text-lg font-semibold text-gold tracking-wide">
              Cabala dos Caminhos
            </h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded-lg hover:bg-gold/10 transition-colors duration-200 md:hidden"
              aria-label="Close navigation menu"
            >
              <svg
                className="w-5 h-5 text-gold/80"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Sidebar content */}
          <nav className="p-4 space-y-1">
            <NavLink href="/dashboard" icon="dashboard">
              Dashboard
            </NavLink>
            <NavLink href="/mapa" icon="map">
              Mapa Natal
            </NavLink>
            <NavLink href="/tarot" icon="cards">
              Tarot
            </NavLink>
            <NavLink href="/afirmacoes" icon="affirmation">
              Afirmações
            </NavLink>
            <NavLink href="/astrologia" icon="astrology">
              Astrologia
            </NavLink>
          </nav>

          {/* Decorative bottom accent */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
        </aside>

        {/* Main content area */}
        <main
          className={cn(
            'flex-1 flex flex-col min-h-screen transition-all duration-300',
            className
          )}
        >
          {/* Mobile header with menu toggle */}
          <header className="flex items-center h-16 px-4 border-b border-gold/10 md:hidden">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 -ml-2 rounded-lg hover:bg-gold/10 transition-colors duration-200"
              aria-label="Open navigation menu"
            >
              <svg
                className="w-6 h-6 text-gold"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
            <h2 className="ml-4 font-cinzel text-sm font-semibold text-gold/80 tracking-wide">
              Cabala dos Caminhos
            </h2>
          </header>

          {/* Page content */}
          <div className="flex-1 p-4 md:p-8">
            {children}
          </div>
        </main>
      </div>

      <style jsx>{`
        /* Navigation link styles */
        .nav-link {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          border-radius: 0.5rem;
          font-family: 'Inter', sans-serif;
          font-size: 0.875rem;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.7);
          transition: all 0.2s ease;
          text-decoration: none;
        }

        .nav-link:hover {
          background: rgba(201, 162, 39, 0.1);
          color: rgba(201, 162, 39, 0.9);
        }

        .nav-link:active {
          background: rgba(123, 47, 190, 0.15);
          color: rgba(123, 47, 190, 0.9);
        }

        .nav-link:focus-visible {
          outline: 2px solid rgba(201, 162, 39, 0.6);
          outline-offset: 2px;
        }

        /* Icon styling */
        .nav-icon {
          width: 1.25rem;
          height: 1.25rem;
          opacity: 0.8;
        }

        .nav-link:hover .nav-icon {
          opacity: 1;
        }

        /* Responsive adjustments */
        @media (max-width: 767px) {
          main {
            padding-top: 0;
          }
        }

        /* Desktop spacing */
        @media (min-width: 768px) {
          aside {
            box-shadow: none;
          }
        }
      `}</style>
    </CosmicBackground>
  );
}

/**
 * Navigation link component for sidebar
 */
function NavLink({ href, icon, children }: { href: string; icon: string; children: React.ReactNode }) {
  return (
    <a href={href} className="nav-link">
      <NavIcon name={icon} className="nav-icon" />
      <span>{children}</span>
    </a>
  );
}

/**
 * SVG icons for navigation items
 */
function NavIcon({ name, className }: { name: string; className?: string }) {
  const icons: Record<string, JSX.Element> = {
    dashboard: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
      </svg>
    ),
    map: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
      </svg>
    ),
    cards: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
    affirmation: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
      </svg>
    ),
    astrology: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    ),
  };

  return icons[name] || null;
}