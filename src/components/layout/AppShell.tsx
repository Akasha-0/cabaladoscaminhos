'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { 
  Compass, 
  Users, 
  FileText, 
  Settings,
  ChevronLeft,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';

/**
 * Props for the AppShell component
 */
export interface AppShellProps {
  children?: React.ReactNode;
  className?: string;
}

const NAV_ITEMS = [
  { href: '/dashboard', icon: Compass, label: 'Painel' },
  { href: '/dashboard/clientes', icon: Users, label: 'Clientes' },
  { href: '/dashboard/mesa-real', icon: FileText, label: 'Mesa Real' },
  { href: '/dashboard/consulta', icon: FileText, label: 'Consultas' },
  { href: '/dashboard/perfil', icon: Settings, label: 'Configurações' },
];

/**
 * AppShell layout component for Mesa Real cockpit.
 * Provides sidebar navigation and main content area.
 */
export function AppShell({ children, className = '' }: AppShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Desktop Sidebar */}
      <aside 
        className={cn(
          'fixed left-0 top-0 h-full z-40',
          'bg-slate-900/80 backdrop-blur-xl border-r border-slate-800/50',
          'transition-all duration-300 hidden lg:block',
          sidebarCollapsed ? 'w-16' : 'w-64'
        )}
      >
        {/* Logo */}
        <div className={cn(
          'h-16 flex items-center border-b border-slate-800/50',
          'px-4',
          sidebarCollapsed ? 'justify-center' : 'justify-between'
        )}>
          {!sidebarCollapsed && (
            <span className="text-lg font-semibold text-amber-500">
              Cabala dos Caminhos
            </span>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-2 rounded-lg hover:bg-slate-800/50 transition-colors"
            aria-label={sidebarCollapsed ? 'Expandir menu' : 'Recolher menu'}
          >
            {sidebarCollapsed ? (
              <ChevronRight className="w-5 h-5 text-slate-400" />
            ) : (
              <ChevronLeft className="w-5 h-5 text-slate-400" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl',
                'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50',
                'transition-all duration-200',
                sidebarCollapsed && 'justify-center'
              )}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!sidebarCollapsed && (
                <span className="text-sm font-medium">{item.label}</span>
              )}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800/50">
        <div className="h-16 px-4 flex items-center justify-between">
          <span className="text-lg font-semibold text-amber-500">
            Cabala dos Caminhos
          </span>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg hover:bg-slate-800/50 transition-colors"
            aria-label="Menu"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5 text-slate-400" />
            ) : (
              <Menu className="w-5 h-5 text-slate-400" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <nav className="p-4 bg-slate-900 border-t border-slate-800/50">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl',
                  'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50',
                  'transition-all duration-200'
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>
        )}
      </header>

      {/* Main Content */}
      <main 
        className={cn(
          'min-h-screen pt-16 lg:pt-0',
          sidebarCollapsed ? 'lg:pl-16' : 'lg:pl-64',
          className
        )}
      >
        {children}
      </main>
    </div>
  );
}

export default AppShell;