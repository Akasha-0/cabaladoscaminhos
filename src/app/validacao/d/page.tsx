// ============================================================================
// /validacao/d — Variante D: Interactive quiz (Wave 20)
// ============================================================================
// Hipótese: quiz de 4 perguntas engaja o usuário (tempo de página ↑),
// cria personalização (segmenta leads) e aumenta conversion rate.
//
// Fluxo:
//   1. Pergunta 1: intenção (autoconhecimento / prática / estudo / comunidade)
//   2. Pergunta 2: tradição principal (Cabala / Ifá / Tantra / Outra)
//   3. Pergunta 3: nível de experiência (iniciante / intermediário / avançado)
//   4. Pergunta 4: chegou até nós por (amigo / rede social / busca / evento)
//   → Resultado: recomendação personalizada + CTA waitlist
//
// O quiz inteiro é client-side (estado local). No submit, dispara evento
// `quiz_completed` para analytics.
// ============================================================================

import type { Metadata } from 'next';
import { Sparkles } from 'lucide-react';
import { ExitIntentModal } from '@/components/conversion/ExitIntentModal';
import { MobileCaptureBar } from '@/components/conversion/MobileCaptureBar';
import { LandingTracker } from '@/components/conversion/LandingTracker';
import { SocialShareButtons } from '@/components/conversion/SocialShareButtons';
import { TraditionQuiz } from '@/components/conversion/TraditionQuiz';

interface Props {
  searchParams?: Promise<{ ref?: string; utm_source?: string }>;
}

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'Descubra sua tradição — Akasha Portal',
  description:
    'Quiz de 60 segundos: descubra qual tradição combina com você e entre na lista de espera da primeira comunidade multi-tradição do Brasil.',
  openGraph: {
    title: 'Qual tradição combina com você? — Akasha Portal',
    description: 'Quiz de 60s + lista de espera do beta privado.',
    images: [{ url: '/og/validacao-d.png', width: 1200, height: 630 }],
  },
};

export default async function VariantDPage({ searchParams }: Props) {
  const params = (await searchParams) ?? {};
  const { ref, utm_source } = params;

  return (
    <main id="main-content" tabIndex={-1} className="focus:outline-none min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <LandingTracker variant="D" />

      <section className="relative overflow-hidden">
        <div aria-hidden className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-amber-500/10 to-violet-500/10" />

        <div className="relative max-w-2xl mx-auto px-5 pt-12 pb-12 md:pt-20 md:pb-16 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            Quiz · 60 segundos
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-cinzel font-bold leading-[1.1] mb-5">
            <span className="bg-gradient-to-r from-emerald-300 via-amber-300 to-violet-300 bg-clip-text text-transparent">
              Qual tradição combina
            </span>
            <br />
            <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 bg-clip-text text-transparent">
              com você?
            </span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            Responda 4 perguntas rápidas e ganhe uma recomendação personalizada
            de qual caminho iniciar — com curadoria científica.
          </p>

          <TraditionQuiz utmSource={utm_source} referralCode={ref} />
        </div>
      </section>

      <section className="max-w-2xl mx-auto px-5 pb-20 text-center">
        <div className="p-8 md:p-10 rounded-3xl bg-gradient-to-br from-emerald-500/10 via-amber-500/10 to-violet-500/10 border border-emerald-500/25">
          <h2 className="text-xl md:text-2xl font-cinzel text-slate-100 mb-3">
            Compartilhe com quem busca
          </h2>
          <p className="text-slate-400 mb-6 text-sm">
            Conhece alguém em busca de espiritualidade com rigor?
          </p>
          <SocialShareButtons
            url="https://akashaportal.com/validacao/d"
            title="Fiz o quiz do Akasha Portal — descubra sua tradição"
            variant="D"
          />
        </div>
      </section>

      <ExitIntentModal variant="D" />
      <MobileCaptureBar variant="D" />
    </main>
  );
}
