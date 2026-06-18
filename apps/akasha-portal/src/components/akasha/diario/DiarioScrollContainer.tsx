'use client';

import { useState } from 'react';
import { MandalaMiniBadge } from './MandalaMiniBadge';

interface DiarioScrollContainerProps {
  children: React.ReactNode;
  date: string;
  pilarInfo: { nome: string; cor: string };
  pilarPrincipal: string;
  totalSections?: number;
  locale: string;
}

export function DiarioScrollContainer({
  children,
  date,
  pilarInfo,
  pilarPrincipal,
  totalSections = 5,
  locale,
}: DiarioScrollContainerProps) {
  const [currentSection] = useState(1);
  const formattedDate = new Date(date + 'T12:00:00').toLocaleDateString(locale || 'pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <div className="min-h-dvh bg-[#06070F] flex flex-col">
      <header
        className="sticky top-0 z-50 backdrop-blur-xl bg-[rgba(6,7,15,0.85)] border-b border-white/5"
        aria-label="Cabeçalho do diário"
      >
        <div className="flex items-center justify-between px-4 py-3 gap-3">
          <time dateTime={date} className="text-[0.8rem] text-white/60 font-light capitalize">
            {formattedDate}
          </time>
          <MandalaMiniBadge phase={pilarPrincipal} color={pilarInfo.cor} size="sm" />
          <span data-testid="section-counter" className="text-[0.75rem] text-white/40 font-light tabular-nums">
            {currentSection}/{totalSections}
          </span>
        </div>
      </header>
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
