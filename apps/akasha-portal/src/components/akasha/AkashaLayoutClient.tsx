'use client';

import React from 'react';
import { AkashaNavigation } from '@/components/akasha/AkashaNavigation';
import { BottomNav } from '@/components/akasha/layout/BottomNav';
import { PwaInstallPrompt } from '@/components/shared/PwaInstallPrompt';
import { SearchPalette } from '@/components/akasha/search/SearchPalette';
import { useCockpitStore } from '@/stores/cockpit-store';
import { isSupportedLocale, type SupportedLocale } from '@/lib/i18n';

interface UserProfile {
  name: string;
  birthDate: Date | string | null;
  birthTime: string | null;
  birthCity: string | null;
}

interface AkashaLayoutClientProps {
  children: React.ReactNode;
  locale: string;
  user: UserProfile | null;
}

export function AkashaLayoutClient({ children, locale, user }: AkashaLayoutClientProps) {
  const sidebarCollapsed = useCockpitStore((s) => s.sidebarCollapsed);
  // Narrow the locale for child components that require a typed locale.
  const safeLocale: SupportedLocale = isSupportedLocale(locale) ? locale : 'pt-BR';

  return (
    <div className="min-h-screen flex flex-col md:flex-row antialiased bg-[#06070F] text-[#F4F5FF]">
      <AkashaNavigation locale={locale} user={user} />

      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 pt-14 md:pt-0 ${
          sidebarCollapsed ? 'md:pl-16' : 'md:pl-64'
        }`}
      >
        {/* Wave 10.5: extra bottom padding on mobile to clear the fixed
            BottomNav (height ~56px + safe-area-inset-bottom). Desktop is
            untouched because BottomNav is md:hidden. */}
        <main className="flex-grow w-full max-w-5xl mx-auto px-4 py-6 md:p-8 pb-[calc(72px+env(safe-area-inset-bottom,0px))] md:pb-8">
          {children}
        </main>
      </div>

      {/* Wave 9.4 — PWA install prompt. Listens for `beforeinstallprompt`
          and renders a bottom-sheet install bar. Renders nothing on
          unsupported browsers or when already installed. */}
      <PwaInstallPrompt />

      {/* Wave 10.5 — Mobile-first persistent bottom nav (5 items).
          Renders nothing on /login + /register; hidden on desktop via
          the md:hidden class inside the component itself. */}
      <BottomNav locale={safeLocale} />

      {/* Wave 13.2 — Global Cmd+K / Ctrl+K search palette. Mounted at the
          layout root so it works on every page inside the authenticated
          shell. Listens for the shortcut globally; renders nothing when
          closed (no chrome cost). */}
      <SearchPalette locale={safeLocale} />
    </div>
  );
}
