'use client';

import Link from 'next/link';
import { CosmicBackground } from '@/components/design-system/CosmicBackground';
import { MysticButton } from '@/components/shared/MysticButton';
import { MysticDivider } from '@/components/shared/MysticDivider';
import { Heading } from '@/components/design-system/Typography';
import { Sparkles, Home, ArrowLeft, Compass } from 'lucide-react';
import { useState, useEffect } from 'react';

const mysticalQuotes = [
  "O caminho que procuras já existe dentro de ti.",
  "Quando um caminho se fecha, outro se abre no cosmos.",
  "A jornada de mil léguas começa com um único passo.",
  "O universo conspira a favor da tua transformação.",
];

export default function NotFound() {
  const [quote] = useState(() => {
    // Generate random quote only once on mount
    return mysticalQuotes[Math.floor(Math.random() * mysticalQuotes.length)];
  });
  const [fadeIn, setFadeIn] = useState(false);
  useEffect(() => {
    setFadeIn(true);
  }, []);
  return (
    <CosmicBackground variant="default">
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-12">
        {/* Background stars */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-amber-400 rounded-full animate-twinkle opacity-60" />
          <div className="absolute top-1/3 right-1/4 w-1.5 h-1.5 bg-amber-300 rounded-full animate-twinkle opacity-40" style={{ animationDelay: '0.5s' }} />
          <div className="absolute top-1/2 left-1/6 w-1 h-1 bg-yellow-300 rounded-full animate-twinkle opacity-50" style={{ animationDelay: '1s' }} />
          <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-yellow-200 rounded-full animate-twinkle opacity-30" style={{ animationDelay: '0.3s' }} />
        </div>

        {/* Gradient orb */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-500/5 rounded-full blur-3xl" aria-hidden="true" />

        <div
          className={`text-center max-w-2xl mx-auto transition-all duration-1000 ${
            fadeIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {/* Mystical icon */}
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-amber-500/20 to-violet-500/20 border border-amber-500/30 shadow-[0_0_60px_rgba(212,175,55,0.2)]">
              <Compass className="w-12 h-12 text-amber-400 animate-pulse" />
            </div>
          </div>

          {/* 404 number */}
          <div className="mb-6">
            <span className="text-[150px] sm:text-[200px] font-playfair font-bold bg-gradient-to-b from-amber-400/30 to-amber-600/10 bg-clip-text text-transparent leading-none select-none">
              404
            </span>
          </div>

          {/* Mystic divider */}
          <div className="mb-8">
            <MysticDivider variant="glow" className="max-w-xs mx-auto" />
          </div>

          {/* Heading */}
          <Heading variant="display" glow="gold" className="mb-6">
            Caminho Não Encontrado
          </Heading>

          {/* Description */}
          <p className="text-lg text-slate-400 mb-8 font-raleway leading-relaxed">
            A página que você busca não existe nesta dimensão do existir.
            O universo guarda mistérios que ainda não foram revelados.
          </p>

          {/* Mystical quote */}
          <div className="mb-12 p-6 rounded-2xl bg-white/5 border border-amber-500/20">
            <p className="text-amber-300/80 font-cormorant italic text-lg">
              &ldquo;{quote}&rdquo;
            </p>
          </div>

          {/* Mystic divider */}
          <div className="mb-12">
            <MysticDivider variant="subtle" className="max-w-xs mx-auto" />
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/">
              <MysticButton variant="golden" size="lg">
                <Home className="w-5 h-5 mr-2" />
                Retornar ao Início
              </MysticButton>
            </Link>
            <button
              onClick={() => window.history.back()}
              className="group flex items-center gap-3 px-8 py-4 rounded-xl border border-amber-500/30 text-slate-300 hover:text-amber-400 hover:border-amber-500/50 hover:bg-amber-500/5 transition-all duration-300 font-raleway"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" />
              <span>Página Anterior</span>
            </button>
          </div>

          {/* Additional links */}
          <div className="mt-12 pt-8 border-t border-amber-500/10">
            <p className="text-slate-500 text-sm font-raleway mb-4">
              Explore outros caminhos:
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6">
              <Link
                href="/onboarding"
                className="text-slate-400 hover:text-amber-400 transition-colors font-raleway text-sm flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Criar Mapa
              </Link>
              <Link
                href="/calendario"
                className="text-slate-400 hover:text-amber-400 transition-colors font-raleway text-sm"
              >
                Calendário
              </Link>
              <Link
                href="/mapa"
                className="text-slate-400 hover:text-amber-400 transition-colors font-raleway text-sm"
              >
                Mapa Natal
              </Link>
              <Link
                href="/pricing"
                className="text-slate-400 hover:text-amber-400 transition-colors font-raleway text-sm"
              >
                Planos
              </Link>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-8 left-0 right-0 text-center">
          <p className="text-slate-600 text-xs font-raleway">
            Cabala dos Caminhos • Tecnologia Sagrada
          </p>
        </div>
      </div>
    </CosmicBackground>
  );
}
