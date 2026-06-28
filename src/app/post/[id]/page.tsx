'use client';

// ============================================================================
// AKASHA PORTAL — Post Detail Page
// ============================================================================
// Detalhe de um post individual da comunidade. Wave 17 — type system.
// ============================================================================

import { use } from 'react';
import Link from 'next/link';
import { Heart, MessageCircle, Share2, ArrowLeft, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';

type PostDetailParams = { id: string };

export default function PostDetailPage({ params }: { params: Promise<PostDetailParams> }) {
  const { id } = use(params);

  return (
    <article className="min-h-screen">
      {/* Top nav */}
      <div className="border-b border-slate-800/50 bg-slate-950/40 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <Link
            href="/feed"
            className="inline-flex items-center gap-2 text-caption text-slate-400 hover:text-amber-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar ao feed
          </Link>
        </div>
      </div>

      <main id="main-content" tabIndex={-1} className="focus:outline-none max-w-3xl mx-auto px-4 py-10">
        {/* Meta header */}
        <div className="mb-6">
          <span className="text-caps text-tiny text-amber-300 mb-3 inline-block">
            Cabala · há 2 horas
          </span>
          <h2 className="mb-4">
            Hoje no estudo da Árvore da Vida entendi que cada sephirah é um espelho da jornada interior.
          </h2>

          {/* Author */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500/30 to-violet-500/30" />
            <div>
              <h4 className="text-base font-semibold text-slate-100">Maria Helena</h4>
              <p className="text-tiny text-slate-500">Praticante de Cabala · 2 anos na comunidade</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="prose prose-invert max-w-none mb-8 space-y-4">
          <p className="text-body text-slate-300 leading-relaxed">
            Hoje no estudo da Árvore da Vida entendi que cada sephirah é um espelho da jornada
            interior. Malchuth nos ensina sobre presença, sobre aterrar o divino no cotidiano —
            é a sephirah do reino, do corpo, da matéria que sustenta todas as outras.
          </p>
          <p className="text-body text-slate-300 leading-relaxed">
            Quando subimos para Yesod, encontramos a fundação. É o inconsciente, os sonhos, a
            imaginação fértil. De lá, partimos para Tiferet — beleza, equilíbrio, coração —
            onde a misericórdia (Chesed) encontra o rigor (Gevurah).
          </p>
          <p className="text-body text-slate-300 leading-relaxed">
            Essa escada não é hierárquica. É um respirar. Cada sephirah convida a outra. E no
            topo, Kether — a coroa — nos lembra que o início e o fim são o mesmo silêncio.
          </p>
          <blockquote className="border-l-4 border-amber-500/40 pl-4 italic text-slate-400">
            "Quem caminha nas sephiroth não sobe — aprende a descer com graça."
          </blockquote>
          <p className="text-body text-slate-300 leading-relaxed">
            Vou continuar refletindo sobre isso nos próximos dias. Se alguém quiser compartilhar
            suas próprias experiências com meditação na Árvore, será uma honra trocar.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-6 py-4 border-y border-slate-800/50 mb-8">
          <button
            className="flex items-center gap-2 text-caption text-slate-400 hover:text-amber-300 transition-colors min-h-[44px] min-w-[44px] px-2"
            aria-label="Curtir publicação (42 curtidas)"
          >
            <Heart className="w-5 h-5" aria-hidden="true" /> 42
          </button>
          <button
            className="flex items-center gap-2 text-caption text-slate-400 hover:text-violet-300 transition-colors min-h-[44px] min-w-[44px] px-2"
            aria-label="Ver comentários (7 comentários)"
          >
            <MessageCircle className="w-5 h-5" aria-hidden="true" /> 7 comentários
          </button>
          <button
            className="flex items-center gap-2 text-caption text-slate-400 hover:text-emerald-300 transition-colors min-h-[44px] min-w-[44px] px-2"
            aria-label="Compartilhar publicação"
          >
            <Share2 className="w-5 h-5" aria-hidden="true" /> Compartilhar
          </button>
        </div>

        {/* Comments preview */}
        <section className="space-y-6">
          <h3 className="mb-4">Comentários</h3>

          <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/50">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500/30 to-pink-500/30" />
              <h4 className="text-base font-semibold text-slate-100">João de Oxalá</h4>
            </div>
            <p className="text-body text-slate-300">
              Lindo, Maria. Em Ifá a gente fala algo parecido com Odu Ofun — a fundação é
              paciência e respeito. Cada degrau da escada pede seu tempo.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/50">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500/30 to-emerald-500/30" />
              <h4 className="text-base font-semibold text-slate-100">Ana Luz</h4>
            </div>
            <p className="text-body text-slate-300">
              Obrigada por compartilhar. Vou levar essa leitura para minha prática de Tantra hoje à noite.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/30 border border-dashed border-slate-700/50">
            <p className="text-caption text-slate-500 text-center">
              <BookOpen className="w-4 h-4 inline mr-1" />
              Comentários adicionais visíveis para membros autenticados.
            </p>
          </div>
        </section>
      </main>
    </article>
  );
}