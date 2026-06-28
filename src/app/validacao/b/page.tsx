// ============================================================================
// /validacao/b — Variante B: Hero com vídeo embed (Wave 20)
// ============================================================================
// Hipótese: vídeo embed (60s) reduz incerteza sobre o produto, aumenta
// tempo de página e conversion rate.
//
// Placeholder de vídeo: usa `<video>` com poster estático. Quando vídeo real
// estiver pronto, substituir `src` por URL do CDN.
//
// Métricas:
//   - Tempo médio na página (vs A)
//   - CTA clicks / pageview
//   - Conversion rate para waitlist
// ============================================================================

import type { Metadata } from 'next';
import { Sparkles, Mail, PlayCircle, ShieldCheck } from 'lucide-react';
import { WaitlistForm } from '@/components/validation/WaitlistForm';
import { ExitIntentModal } from '@/components/conversion/ExitIntentModal';
import { MobileCaptureBar } from '@/components/conversion/MobileCaptureBar';
import { LandingTracker } from '@/components/conversion/LandingTracker';
import { SocialShareButtons } from '@/components/conversion/SocialShareButtons';
import { VideoHero } from '@/components/conversion/VideoHero';

interface Props {
  searchParams?: Promise<{ ref?: string; utm_source?: string }>;
}

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'Akasha Portal em 60s — Lista de espera',
  description:
    'Veja em 60 segundos como funciona a primeira comunidade multi-tradição do Brasil. Cabala, Ifá, Tantra, Reiki — com rigor científico.',
  openGraph: {
    title: 'Akasha Portal em 60s',
    description: 'Veja como funciona a comunidade multi-tradição com rigor científico.',
    type: 'video.other',
    images: [{ url: '/og/validacao-b.png', width: 1200, height: 630 }],
  },
};

export default async function VariantBPage({ searchParams }: Props) {
  const params = (await searchParams) ?? {};
  const { ref, utm_source } = params;

  return (
    <main id="main-content" tabIndex={-1} className="focus:outline-none min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <LandingTracker variant="B" />

      <section className="relative overflow-hidden">
        <div aria-hidden className="absolute inset-0 bg-gradient-to-br from-violet-500/15 via-pink-500/10 to-amber-500/10" />

        <div className="relative max-w-4xl mx-auto px-5 pt-12 pb-12 md:pt-20 md:pb-16 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-300 text-xs mb-6">
            <PlayCircle className="w-3.5 h-3.5" />
            Veja em 60 segundos
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-cinzel font-bold leading-[1.1] mb-5">
            <span className="bg-gradient-to-r from-violet-300 via-pink-300 to-amber-300 bg-clip-text text-transparent">
              Cabala, Ifá, Tantra, Reiki
            </span>
            <br />
            <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 bg-clip-text text-transparent">
              com o rigor que sua prática merece
            </span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            Uma comunidade que une tradição milenar e ciência moderna.
            Assista e decida se é para você.
          </p>

          {/* Vídeo hero — placeholder */}
          <div className="mb-10 max-w-3xl mx-auto">
            <VideoHero
              posterSrc="/og/validacao-hero.png"
              videoSrc="/videos/akasha-60s.mp4"
              title="Akasha Portal — 60 segundos"
            />
          </div>

          <WaitlistForm ctaLabel="Quero entrar na beta" source="validacao-B" />

          <ul className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-x-5 gap-y-2 text-xs text-slate-400">
            <li className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              50 vagas neste beta
            </li>
            <li className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Sem cartão de crédito
            </li>
            <li className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Cancele quando quiser
            </li>
          </ul>

          {ref && (
            <p className="mt-3 text-xs text-violet-300">
              ✨ Indicado por <code className="font-mono">{ref}</code>
            </p>
          )}
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-5 pb-20 text-center">
        <div className="p-8 md:p-10 rounded-3xl bg-gradient-to-br from-violet-500/10 via-pink-500/10 to-amber-500/10 border border-violet-500/25">
          <Mail className="w-8 h-8 mx-auto text-violet-400 mb-3" />
          <h2 className="text-2xl md:text-3xl font-cinzel text-slate-100 mb-3">
            Pronto para começar?
          </h2>
          <p className="text-slate-400 mb-6 text-sm md:text-base">
            Junte-se ao beta privado. Sem custo, sem compromisso.
          </p>
          <WaitlistForm ctaLabel="Entrar agora" source="validacao-B-cta-final" />

          <div className="mt-8 pt-6 border-t border-slate-800/60">
            <SocialShareButtons
              url="https://akashaportal.com/validacao/b"
              title="Vi o vídeo do Akasha Portal — espiritualidade com rigor científico"
              variant="B"
            />
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-800/50 py-6 text-center text-xs text-slate-500">
        <p>
          <Sparkles className="w-3 h-3 inline mr-1" />
          Akasha Portal · Dúvidas?{' '}
          <a
            href="mailto:contato@akashaportal.com"
            className="text-amber-400 hover:text-amber-300 underline underline-offset-2"
          >
            contato@akashaportal.com
          </a>
        </p>
      </footer>

      <ExitIntentModal variant="B" />
      <MobileCaptureBar variant="B" />
    </main>
  );
}
