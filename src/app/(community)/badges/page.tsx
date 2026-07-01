'use client';

// ============================================================================
// BADGES — /badges
// ============================================================================
// Símbolos visuais recebidos por:
//   - Conclusão de challenges
//   - Regularidade (sem "streak" como troféu — apenas reconhecimento)
//   - Conclusão de mentoria
//   - Contribuição à comunidade
//   - Profundidade em uma tradição
// Sem levels, sem rank — apenas contagem.
// ============================================================================

import React, { useState } from 'react';
import {
  Award, Sparkles, Heart, BookOpen, Users, Check, Lock,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type BadgeSymbol = {
  slug: string;
  name: string;
  description: string;
  tradition: string | null;
  symbolKey: string;
  colorHex: string;
  awardedCount: number;
  earnedAt?: string;
};

// ============================================================
// 7 tradição symbols (theme-specific SVG icons)
// ============================================================
const TRADITION_SYMBOLS: Record<string, React.ComponentType<{ className?: string }>> = {
  cabala: BookOpen,        // Árvore da Vida simplificada
  ifa: Sparkles,           // Opá Ifá
  tantra: Heart,           // Chakra anahata
  meditacao: Sparkles,     // Lótus
  xamanismo: Sparkles,     // Roda xamânica
  candomble: Sparkles,     // Orixás
  umbanda: Sparkles,       // Encostos
  astrologia: Sparkles,    // Zodíaco
  reiki: Sparkles,         // Choku Rei
  sufismo: Sparkles,       // Sufi Heart
  taoismo: Sparkles,       // Yin-Yang
  'cristianismo-mistico': Sparkles,
  universal: Award,
};

const MOCK_BADGES: BadgeSymbol[] = [
  {
    slug: '7d-meditation',
    name: 'Sete Luas de Meditação',
    description: 'Conclusão do desafio de 7 dias de meditação silenciosa.',
    tradition: null,
    symbolKey: 'meditacao',
    colorHex: '#7c3aed',
    awardedCount: 89,
    earnedAt: '2026-06-15',
  },
  {
    slug: '21d-mantra',
    name: 'Mantra 21 Dias',
    description: 'Repetição contemplativa durante 21 dias consecutivos.',
    tradition: 'tantra',
    symbolKey: 'tantra',
    colorHex: '#dc2626',
    awardedCount: 23,
  },
  {
    slug: 'zohar-deep-study',
    name: 'Zohar — Sêptupla',
    description: 'Leitura profunda de 7+ artigos do Zohar Sêptuplo.',
    tradition: 'cabala',
    symbolKey: 'cabala',
    colorHex: '#7c3aed',
    awardedCount: 12,
  },
  {
    slug: 'candle-keeper',
    name: 'Guardião da Vela',
    description: 'Participação regular em Círculo Cabala por 4+ sessões.',
    tradition: 'cabala',
    symbolKey: 'cabala',
    colorHex: '#7c3aed',
    awardedCount: 8,
    earnedAt: '2026-05-20',
  },
  {
    slug: 'contributor',
    name: 'Contribuidor da Comunidade',
    description: 'Ajudou 5+ pessoas no fórum ao longo de 30 dias.',
    tradition: null,
    symbolKey: 'universal',
    colorHex: '#16a34a',
    awardedCount: 47,
  },
];

const REASON_LABELS = {
  CHALLENGE_COMPLETION: 'Challenge',
  STREAK_CONSISTENCY: 'Regularidade',
  MENTORSHIP_COMPLETION: 'Mentoria',
  COMMUNITY_CONTRIBUTION: 'Contribuição',
  TRADITION_DEPTH: 'Profundidade',
  CIRCLE_REGULARITY: 'Círculo',
};

export default function BadgesPage() {
  const [showAll, setShowAll] = useState(true);
  const [traditionFilter, setTraditionFilter] = useState('');

  const earned = MOCK_BADGES.filter((b) => b.earnedAt);
  const totalEarned = earned.length;
  const totalAvailable = 24; // pool total

  const filtered = MOCK_BADGES.filter(
    (b) => showAll || b.earnedAt !== undefined,
  ).filter(
    (b) => !traditionFilter || b.tradition === traditionFilter || b.tradition === null,
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/30 via-white to-violet-50/30 dark:from-amber-950/10 dark:via-zinc-950">
      <div className="mx-auto max-w-6xl px-4 py-8 md:py-12">
        <header className="mb-8">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-amber-100/60 px-3 py-1 text-xs font-medium text-amber-800 dark:bg-amber-900/30 dark:text-amber-200">
            <Award className="h-3 w-3" />
            Comunidade — Badges W38
          </div>
          <h1 className="mb-2 text-3xl font-bold tracking-tight md:text-4xl">
            Símbolos de reconhecimento
          </h1>
          <p className="max-w-2xl text-base text-zinc-600 dark:text-zinc-300">
            Recebidos por completar challenges, manter prática regular, aprofundar
            em uma tradição ou contribuir com a comunidade. Sem rank, sem "level" —
            apenas símbolo, história e contexto.
          </p>

          {/* Stats */}
          <div className="mt-6 grid grid-cols-3 gap-3 max-w-md">
            <Card className="border-zinc-200 dark:border-zinc-800">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold">{totalEarned}</div>
                <div className="text-xs text-zinc-500">seus badges</div>
              </CardContent>
            </Card>
            <Card className="border-zinc-200 dark:border-zinc-800">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold">{totalAvailable}</div>
                <div className="text-xs text-zinc-500">no total</div>
              </CardContent>
            </Card>
            <Card className="border-zinc-200 dark:border-zinc-800">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold">0</div>
                <div className="text-xs text-zinc-500">level</div>
              </CardContent>
            </Card>
          </div>
        </header>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowAll(true)}
            className={cn(
              'rounded-full px-3 py-1.5 text-xs font-medium',
              showAll ? 'bg-violet-600 text-white' : 'bg-zinc-100 dark:bg-zinc-800',
            )}
          >
            Todos
          </button>
          <button
            onClick={() => setShowAll(false)}
            className={cn(
              'rounded-full px-3 py-1.5 text-xs font-medium',
              !showAll ? 'bg-violet-600 text-white' : 'bg-zinc-100 dark:bg-zinc-800',
            )}
          >
            Meus
          </button>
        </div>

        {/* Grid */}
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filtered.map((badge) => {
            const Icon = TRADITION_SYMBOLS[badge.symbolKey] || Award;
            const earned = Boolean(badge.earnedAt);
            return (
              <Card
                key={badge.slug}
                className={cn(
                  'border-zinc-200 transition-all dark:border-zinc-800',
                  earned ? 'hover:shadow-md' : 'opacity-60 grayscale',
                )}
              >
                <CardContent className="flex flex-col items-center p-5 text-center">
                  <div
                    className="mb-3 flex h-16 w-16 items-center justify-center rounded-full"
                    style={{
                      backgroundColor: earned ? `${badge.colorHex}20` : '#e5e7eb',
                    }}
                  >
                    {earned ? (
                      <Icon className="h-8 w-8" style={{ color: badge.colorHex }} />
                    ) : (
                      <Lock className="h-6 w-6 text-zinc-400" />
                    )}
                  </div>
                  <h3 className="text-sm font-semibold">{badge.name}</h3>
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">
                    {badge.description}
                  </p>
                  <div className="mt-3 flex items-center gap-2 text-[10px]">
                    {badge.tradition && (
                      <Badge variant="outline" className="text-[10px]">
                        {badge.tradition}
                      </Badge>
                    )}
                    {earned && (
                      <Badge variant="default" className="bg-emerald-600 text-[10px]">
                        <Check className="mr-0.5 h-2.5 w-2.5" />
                        Recebido
                      </Badge>
                    )}
                  </div>
                  {!earned && (
                    <p className="mt-2 text-[10px] text-zinc-400">
                      {badge.awardedCount} pessoas receberam
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        <section className="mt-12 rounded-lg border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-zinc-900/50">
          <h3 className="mb-3 text-lg font-semibold">Filosofia de badges</h3>
          <p className="text-sm text-zinc-700 dark:text-zinc-300">
            Em vez de "level 47" ou "rank diamante", oferecemos símbolos com histórias.
            Cada badge tem um contexto: <em>quando</em>, <em>por quê</em>, e opcionalmente
            <em> por quem</em>. São exibidos no seu perfil se você quiser — e nunca no
            ranking de outros. Privacidade em primeiro lugar.
          </p>
        </section>
      </div>
    </div>
  );
}
