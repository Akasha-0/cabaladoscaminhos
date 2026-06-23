'use client';

import { useState, useEffect, useRef } from 'react';
import { getTranslations } from '@/lib/i18n';
import { MandalaMiniBadge } from './MandalaMiniBadge';

interface DiarioScrollContainerProps {
  children: React.ReactNode;
  date: string;
  pilarInfo: { nome: string; cor: string };
  pilarPrincipal: string;
  lua_fase?: string;
  totalSections?: number;
  locale: string;
  /** DailyResponse.climate — e.g. "Equilíbrio", "Turbilhão", "Clareza" */
  climate?: string;
}

const SECTION_LABELS: Record<string, string[]> = {
  'pt-BR': ['Mandato', 'Autoridade', 'Ritual', 'Significado', 'Áreas'],
  en: ['Mandate', 'Authority', 'Ritual', 'Meaning', 'Areas'],
};

export function DiarioScrollContainer({
  children,
  date,
  pilarInfo,
  pilarPrincipal,
  lua_fase,
  totalSections = 5,
  locale,
  climate,
}: DiarioScrollContainerProps) {
  const [currentSection, setCurrentSection] = useState(1);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const t = getTranslations(locale);

  const labels = SECTION_LABELS[locale] ?? SECTION_LABELS['pt-BR'];

  const formattedDate = new Date(date + 'T12:00:00').toLocaleDateString(locale || 'pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute('data-section-index'));
            if (!isNaN(index)) setCurrentSection(index);
          }
        }
      },
      { rootMargin: '-40% 0px -40% 0px' }
    );
    observerRef.current = observer;

    const sections = document.querySelectorAll('[data-section-index]');
    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-dvh bg-[#06070F] flex flex-col">
      <a
        href="#diario-main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[200] focus:px-4 focus:py-2 focus:bg-[#7C5CFF] focus:text-white focus:rounded-xl focus:outline-2 focus:outline-offset-2 focus:outline-[#7C5CFF] focus:font-cinzel focus:text-sm"
      >
        {t('diario.scrollContainer.skipToContent')}
      </a>
      <header
        className="sticky top-0 z-50 backdrop-blur-xl bg-[rgba(6,7,15,0.85)] border-b border-white/5"
        aria-label={t('diario.scrollContainer.headerLabel')}
      >
        <div className="flex items-center justify-between px-4 py-3 gap-3">
          <div className="flex flex-col gap-0.5 min-w-0">
            <time
              dateTime={date}
              className="text-[0.8rem] text-white/60 font-light capitalize"
            >
              {formattedDate}
            </time>
            {climate ? (
              <span className="text-[0.65rem] text-[#2DD4BF] truncate">
                {climate}
              </span>
            ) : null}
          </div>
          <MandalaMiniBadge phase={pilarPrincipal} moonPhase={lua_fase} color={pilarInfo.cor} size="sm" />
          <span data-testid="section-counter" className="text-[0.75rem] text-white/40 font-light tabular-nums">
            {currentSection} · {labels[currentSection - 1] ?? ''}
          </span>
        </div>
      </header>
      <main id="diario-main" className="flex-1 overflow-y-auto" tabIndex={-1}>{children}</main>
    </div>
  );
}
