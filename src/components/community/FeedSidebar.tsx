'use client';

// ============================================================================
// FeedSidebar — Right-rail widgets (lazy-loaded)
// ============================================================================
// Shows: trending traditions, IA suggestions, "complete seu mapa" CTA.
// Below the fold on desktop (right rail) and offscreen on mobile. Loading
// this lazily keeps the main feed column (PostCard + CreatePost) in the
// initial bundle.
//
// Wave 11 (perf deep) — 2026-06-27.
// ============================================================================

import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Flame, Sparkles } from 'lucide-react';

const TRADITION_LABELS: Record<string, string> = {
  cabala: 'Cabala',
  ifa: 'Ifá',
  xamanismo: 'Xamanismo',
  tantra: 'Tantra',
  reiki: 'Reiki',
  ayurveda: 'Ayurveda',
};

// Membros mock — determinístico por tradição (não usar Math.random em render)
const TRADITION_MEMBERS: Record<string, number> = {
  cabala: 482,
  ifa: 631,
  xamanismo: 297,
  tantra: 415,
  reiki: 753,
  ayurveda: 218,
};

export function FeedSidebar() {
  return (
    <div className="space-y-4">
      <Card className="card-spiritual bg-gradient-to-br from-slate-900/90 to-slate-950/90 backdrop-blur-sm border-slate-800/50">
        <CardHeader className="pb-3 border-b border-slate-800/50">
          <h3 className="text-sm font-semibold bg-gradient-to-r from-amber-400 to-violet-400 bg-clip-text text-transparent flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-400" />
            Tradições em destaque
          </h3>
        </CardHeader>
        <CardContent className="pt-3 space-y-2">
          {['cabala', 'ifa', 'xamanismo', 'tantra', 'reiki'].map((t) => (
            <Link
              key={t}
              href={`/groups/${t}`}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-800/50 transition-all group"
            >
              <span className="text-sm text-slate-300 group-hover:text-amber-300 transition-colors">
                {TRADITION_LABELS[t] || t}
              </span>
              <Badge variant="outline" className="text-xs border-slate-700 text-slate-500">
                {(TRADITION_MEMBERS[t] ?? 200)}+ membros
              </Badge>
            </Link>
          ))}
        </CardContent>
      </Card>

      <Card className="card-spiritual bg-gradient-to-br from-violet-900/30 to-slate-900/90 border-violet-500/20">
        <CardHeader className="pb-3">
          <h3 className="text-sm font-semibold bg-gradient-to-r from-violet-300 to-pink-300 bg-clip-text text-transparent flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-violet-400" />
            Sugestões da Akasha IA
          </h3>
          <p className="text-xs text-slate-500 mt-1">Baseado no seu mapa espiritual</p>
        </CardHeader>
        <CardContent className="pt-0 space-y-3">
          <SuggestionItem
            title="Como Escorpião pode usar a meditação Vipassana"
            reason="seu signo lunar"
          />
          <SuggestionItem
            title="Estudo: Reiki em pacientes oncológicos (2023)"
            reason="tradição que você segue"
          />
          <SuggestionItem
            title="Ayahuasca e neuroplasticidade — revisão de 47 papers"
            reason="tópico que você curtiu"
          />
        </CardContent>
      </Card>

      <Card className="card-spiritual bg-gradient-to-br from-amber-500/10 to-violet-500/10 border-amber-500/20">
        <CardContent className="pt-4 text-center space-y-2">
          <Sparkles className="w-8 h-8 mx-auto text-amber-400" />
          <p className="text-sm text-slate-200">Complete seu mapa espiritual</p>
          <p className="text-xs text-slate-400">
            Quanto mais dados você compartilhar, mais personalizadas são as sugestões da IA
          </p>
          <Button
            variant="outline"
            className="w-full mt-2 border-amber-500/30 text-amber-300 hover:bg-amber-500/10"
          >
            Ver meu perfil espiritual
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function SuggestionItem({ title, reason }: { title: string; reason: string }) {
  return (
    <Link
      href="/library"
      className="block p-2.5 rounded-lg bg-slate-800/30 hover:bg-slate-800/60 transition-all group"
    >
      <p className="text-sm text-slate-200 group-hover:text-amber-300 transition-colors line-clamp-2">
        {title}
      </p>
      <p className="text-xs text-slate-500 mt-1">Por causa de: {reason}</p>
    </Link>
  );
}