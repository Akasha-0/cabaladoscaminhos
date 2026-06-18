'use client';

import React from 'react';
import { AkashaNavigation } from '@/components/akasha/AkashaNavigation';
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
        <main className="flex-grow w-full max-w-5xl mx-auto px-4 py-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}
