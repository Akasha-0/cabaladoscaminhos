'use client';

import React from 'react';
import { AkashaNavigation } from '@/components/akasha/AkashaNavigation';
import { BottomNav } from '@/components/akasha/layout/BottomNav';
import { PwaInstallPrompt } from '@/components/shared/PwaInstallPrompt';
import { NotificationsBell } from '@/components/akasha/notifications/NotificationsBell';
import { useCockpitStore } from '@/stores/cockpit-store';

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

  return (
    <div className="min-h-screen flex flex-col md:flex-row antialiased bg-[#06070F] text-[#F4F5FF]">
      <AkashaNavigation locale={locale} user={user} />

      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 pt-14 md:pt-0 ${
          sidebarCollapsed ? 'md:pl-16' : 'md:pl-64'
        }`}
      >
        {/* Wave 13.3 — Notifications bell floating top-right.
            Mobile: pt-14 reserve + top-3 right-3 (clear of status bar).
            Desktop: pushed below sidebar header. The component handles
            its own dropdown positioning (right-0 anchored to its own
            container). */}
        <div
          className="fixed right-3 top-3 z-40 md:top-4 md:right-4"
          data-testid="notifications-bell-slot"
        >
          <NotificationsBell locale={locale} />
        </div>

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
      <BottomNav locale={locale} />
    </div>
  );
}
