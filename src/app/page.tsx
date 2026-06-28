'use client';

// ============================================================================
// AKASHA PORTAL — Landing Page (Wave 19 i18n)
// ============================================================================
// Apresenta a comunidade + CTA pra entrar.
// Migration W19: todas as strings viraram t('home.*') — PT-BR/EN/ES.
// ============================================================================

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from '@/components/i18n/LanguageSwitcher';
import {
  Sparkles, Users, BookOpen, Heart, ArrowRight, Star,
  Brain, MessageCircle, Lightbulb, Globe, Loader2,
} from 'lucide-react';
import { InlineEmailCapture } from '@/components/conversion/InlineEmailCapture';
import { useT } from '@/lib/i18n/useT';

export default function HomePage() {
  const t = useT();

  // Tradições estáticas (nomes próprios preservados em todos os locales)
  const TRADITIONS = [
    { name: 'Cabala', emoji: '✡️', slug: 'cabala' },
    { name: 'Ifá', emoji: '🪶', slug: 'ifa' },
    { name: 'Xamanismo', emoji: '🌿', slug: 'xamanismo' },
    { name: 'Tantra', emoji: '🕉️', slug: 'tantra' },
    { name: 'Reiki', emoji: '🙏', slug: 'reiki' },
    { name: 'Ayurveda', emoji: '🌺', slug: 'ayurveda' },
    { name: 'Meditação', emoji: '🧘', slug: 'meditacao' },
    { name: 'Astrologia', emoji: '⭐', slug: 'astrologia' },
  ];

  return (
    <div className="min-h-screen">
      {/* Top-right language switcher (não conflita com CTAs mobile) */}
      <div className="fixed top-4 right-4 z-40 print:hidden">
        <LanguageSwitcher variant="pill" />
      </div>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-violet-500/10 to-pink-500/10" />
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(ellipse at top, rgba(251, 191, 36, 0.15), transparent 60%)',
        }} />

        <div className="relative max-w-6xl mx-auto px-4 py-20 md:py-32 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs text-caps mb-6">
            <Sparkles className="w-3 h-3" />
            {t('home.badge')}
          </div>

          <h1 className="text-display-7xl mb-6">
            <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 bg-clip-text text-transparent">
              {t('home.titleAkasha')}
            </span>
            <br />
            <span className="bg-gradient-to-r from-violet-400 via-pink-400 to-violet-400 bg-clip-text text-transparent text-display-5xl">
              {t('home.titleSubline')}
            </span>
          </h1>

          <p className="text-lg text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            {t('home.subtitle')}{' '}
            <span className="text-amber-300 font-medium">{t('home.subtitleTraditions')}</span>{' '}
            {t('home.subtitleAnd')}{' '}
            <span className="text-emerald-300 font-medium">{t('home.subtitleScience')}</span>.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/validacao">
              <Button
                size="lg"
                className="bg-gradient-to-r from-amber-500 to-violet-500 hover:from-amber-600 hover:to-violet-600 text-white border-0 px-8 h-12 text-base"
              >
                {t('home.ctaWaitlist')}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/explore">
              <Button
                size="lg"
                variant="outline"
                className="border-slate-700 bg-slate-800/50 hover:bg-slate-700/50 h-12 px-8"
              >
                {t('home.ctaExplore')}
              </Button>
            </Link>
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-tiny text-slate-500">
            <span className="flex items-center gap-1.5">
              <Users className="w-3 h-3" /> {t('home.stats.practitioners')}
            </span>
            <span className="flex items-center gap-1.5">
              <BookOpen className="w-3 h-3" /> {t('home.stats.articles')}
            </span>
            <span className="flex items-center gap-1.5">
              <Globe className="w-3 h-3" /> {t('home.stats.traditions')}
            </span>
            <span className="flex items-center gap-1.5">
              <Heart className="w-3 h-3" /> {t('home.stats.nonprofit')}
            </span>
          </div>
        </div>
      </section>

      {/* O que é */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-display-5xl bg-gradient-to-r from-amber-400 to-violet-400 bg-clip-text text-transparent mb-3">
            {t('home.pillarsTitle')}
          </h2>
          <p className="text-body text-slate-400 max-w-2xl mx-auto">
            {t('home.pillarsSubtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FeatureCard
            icon={<Users className="w-6 h-6" />}
            color="amber"
            title={t('home.pillar1Title')}
            description={t('home.pillar1Desc')}
          />
          <FeatureCard
            icon={<Brain className="w-6 h-6" />}
            color="violet"
            title={t('home.pillar2Title')}
            description={t('home.pillar2Desc')}
          />
          <FeatureCard
            icon={<BookOpen className="w-6 h-6" />}
            color="emerald"
            title={t('home.pillar3Title')}
            description={t('home.pillar3Desc')}
          />
        </div>
      </section>

      {/* Tradições */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl text-slate-200 mb-2">
            {t('home.traditionsTitle')}
          </h2>
          <p className="text-caption text-slate-400">
            {t('home.traditionsSubtitle')}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {TRADITIONS.map((trad) => (
            <Link
              key={trad.slug}
              href={`/groups/${trad.slug}`}
              className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/50 hover:border-amber-500/30 hover:bg-slate-800/50 transition-all text-center group"
            >
              <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">{trad.emoji}</div>
              <p className="text-caption text-slate-300 group-hover:text-amber-300 transition-colors">
                {trad.name}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA final */}
      <section className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="p-8 md:p-12 rounded-3xl bg-gradient-to-br from-amber-500/10 via-violet-500/10 to-pink-500/10 border border-amber-500/20">
          <Sparkles className="w-10 h-10 mx-auto text-amber-400 mb-4" />
          <h2 className="text-3xl text-slate-100 mb-3">
            {t('home.ctaFinalTitle')}
          </h2>
          <p className="text-body text-slate-400 mb-6 max-w-xl mx-auto">
            {t('home.ctaFinalBody')}
          </p>
          <Link href="/validacao">
            <Button
              variant="outline"
              className="border-amber-500/40 text-amber-300 hover:bg-amber-500/10 px-6 h-11"
            >
              {t('home.ctaFinalButton')}
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({
  icon, title, description, color,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: 'amber' | 'violet' | 'emerald';
}) {
  const colorClasses = {
    amber: 'from-amber-500/10 to-amber-500/5 border-amber-500/20 text-amber-400',
    violet: 'from-violet-500/10 to-violet-500/5 border-violet-500/20 text-violet-400',
    emerald: 'from-emerald-500/10 to-emerald-500/5 border-emerald-500/20 text-emerald-400',
  };

  return (
    <div className={`p-6 rounded-2xl bg-gradient-to-br ${colorClasses[color]} border backdrop-blur-sm`}>
      <div className="w-12 h-12 rounded-xl bg-slate-900/50 flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-xl text-slate-100 mb-2">{title}</h3>
      <p className="text-caption text-slate-400 leading-relaxed">{description}</p>
    </div>
  );
}