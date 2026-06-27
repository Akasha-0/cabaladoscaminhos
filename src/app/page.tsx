'use client';

// ============================================================================
// AKASHA PORTAL — Landing Page
// ============================================================================
// Apresenta a comunidade + CTA pra entrar.
// ============================================================================

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Sparkles, Users, BookOpen, Heart, ArrowRight, Star,
  Brain, MessageCircle, Lightbulb, Globe, Loader2,
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-violet-500/10 to-pink-500/10" />
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(ellipse at top, rgba(251, 191, 36, 0.15), transparent 60%)',
        }} />

        <div className="relative max-w-6xl mx-auto px-4 py-20 md:py-32 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs mb-6">
            <Sparkles className="w-3 h-3" />
            Comunidade + IA co-evoluindo
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-cinzel font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 bg-clip-text text-transparent">
              Akasha
            </span>
            <br />
            <span className="bg-gradient-to-r from-violet-400 via-pink-400 to-violet-400 bg-clip-text text-transparent text-3xl md:text-5xl">
              Comunidade Viva de Espiritualidade
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            Compartilhe, aprenda e evolua com uma comunidade de praticantes,
            guiado por uma IA curadora alimentada por{' '}
            <span className="text-amber-300">tradições ancestrais</span> e{' '}
            <span className="text-emerald-300">artigos científicos</span>.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/validacao">
              <Button
                size="lg"
                className="bg-gradient-to-r from-amber-500 to-violet-500 hover:from-amber-600 hover:to-violet-600 text-white border-0 px-8 h-12 text-base"
              >
                Entrar na lista de espera
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/explore">
              <Button
                size="lg"
                variant="outline"
                className="border-slate-700 bg-slate-800/50 hover:bg-slate-700/50 h-12 px-8"
              >
                Explorar tradições
              </Button>
            </Link>
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <Users className="w-3 h-3" /> 1.200+ praticantes
            </span>
            <span className="flex items-center gap-1.5">
              <BookOpen className="w-3 h-3" /> 50+ artigos curados
            </span>
            <span className="flex items-center gap-1.5">
              <Globe className="w-3 h-3" /> 8 tradições representadas
            </span>
            <span className="flex items-center gap-1.5">
              <Heart className="w-3 h-3" /> Sem fins lucrativos
            </span>
          </div>
        </div>
      </section>

      {/* O que é */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-cinzel bg-gradient-to-r from-amber-400 to-violet-400 bg-clip-text text-transparent mb-3">
            Uma consciência coletiva em movimento
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Não é uma rede social qualquer. É um espaço onde a sabedoria ancestral
            encontra a ciência, e onde a IA aprende com cada interação da comunidade.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FeatureCard
            icon={<Users className="w-6 h-6" />}
            color="amber"
            title="Comunidade real"
            description="Pessoas compartilhando jornadas, práticas, dúvidas e descobertas. Sem gurus, sem promessas mirabolantes — só gente que caminha junto."
          />
          <FeatureCard
            icon={<Brain className="w-6 h-6" />}
            color="violet"
            title="IA curadora"
            description="Uma IA que aprende com os artigos, papers e conversas da comunidade. Ela sugere leituras, encontra correlações, conecta saberes — sem prescrever."
          />
          <FeatureCard
            icon={<BookOpen className="w-6 h-6" />}
            color="emerald"
            title="Evidência + tradição"
            description="Artigos com nível de evidência classificado (anecdótico, revisado por pares, meta-análise). Tradições ancestrais respeitadas e estudadas."
          />
        </div>
      </section>

      {/* Tradições */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-cinzel text-slate-200 mb-2">
            8 tradições representadas
          </h2>
          <p className="text-slate-400 text-sm">
            Universalista, não proselitista. Cada tradição com seu grupo dedicado.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { name: 'Cabala', emoji: '✡️' },
            { name: 'Ifá', emoji: '🪶' },
            { name: 'Xamanismo', emoji: '🌿' },
            { name: 'Tantra', emoji: '🕉️' },
            { name: 'Reiki', emoji: '🙏' },
            { name: 'Ayurveda', emoji: '🌺' },
            { name: 'Meditação', emoji: '🧘' },
            { name: 'Astrologia', emoji: '⭐' },
          ].map((t) => (
            <Link
              key={t.name}
              href={`/groups/${t.name.toLowerCase()}`}
              className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/50 hover:border-amber-500/30 hover:bg-slate-800/50 transition-all text-center group"
            >
              <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">{t.emoji}</div>
              <p className="text-sm text-slate-300 group-hover:text-amber-300 transition-colors">
                {t.name}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA final */}
      <section className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="p-8 md:p-12 rounded-3xl bg-gradient-to-br from-amber-500/10 via-violet-500/10 to-pink-500/10 border border-amber-500/20">
          <Sparkles className="w-10 h-10 mx-auto text-amber-400 mb-4" />
          <h2 className="text-2xl md:text-3xl font-cinzel text-slate-100 mb-3">
            Pronto pra despertar junto?
          </h2>
          <p className="text-slate-400 mb-6 max-w-xl mx-auto">
            Entre na comunidade, compartilhe sua primeira reflexão,
            descubra artigos e conheça pessoas que trilham caminhos parecidos.
          </p>
          <Link href="/validacao">
            <Button
              size="lg"
              className="bg-gradient-to-r from-amber-500 to-violet-500 hover:from-amber-600 hover:to-violet-600 text-white border-0 px-8 h-12"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Entrar na lista de espera
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
      <h3 className="text-lg font-semibold text-slate-100 mb-2">{title}</h3>
      <p className="text-sm text-slate-400 leading-relaxed">{description}</p>
    </div>
  );
}
