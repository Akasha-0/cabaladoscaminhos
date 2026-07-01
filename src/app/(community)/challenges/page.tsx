'use client';

// ============================================================================
// CHALLENGES LIST — /challenges
// ============================================================================
// Catálogo de desafios comunitários estruturados (7-day meditation,
// 21-day mantra, study week, etc.). Filtros por tipo + tradição.
// ============================================================================

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Sparkles, Search, Loader2, Plus, Calendar, Users, Flame,
  BookOpen, Heart, Leaf, Moon, Sun, Infinity as InfinityIcon,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// ============================================================
// Constantes — tipos de challenge (see prisma/schema.prisma)
// ============================================================

const TYPE_FILTERS = [
  { value: '', label: 'Todos os tipos', icon: Sparkles },
  { value: 'MEDITATION', label: 'Meditação', icon: Sun },
  { value: 'PRAYER', label: 'Mantra / Oração', icon: Flame },
  { value: 'STUDY', label: 'Estudo', icon: BookOpen },
  { value: 'JOURNALING', label: 'Journaling', icon: BookOpen },
  { value: 'COMMUNITY', label: 'Comunidade', icon: Heart },
  { value: 'FASTING', label: 'Jejum consciente', icon: Leaf },
  { value: 'TRADITION_SPECIFIC', label: 'Tradição específica', icon: Moon },
];

const TRADITION_FILTERS = [
  { value: '', label: 'Todas as tradições' },
  { value: 'cabala', label: 'Cabala' },
  { value: 'ifa', label: 'Ifá' },
  { value: 'tantra', label: 'Tantra' },
  { value: 'meditacao', label: 'Meditação' },
  { value: 'xamanismo', label: 'Xamanismo' },
  { value: 'cristianismo-mistico', label: 'Cristianismo Místico' },
  { value: 'sufismo', label: 'Sufismo' },
  { value: 'taoismo', label: 'Taoísmo' },
  { value: 'umbanda', label: 'Umbanda' },
  { value: 'candomble', label: 'Candomblé' },
  { value: 'reiki', label: 'Reiki' },
  { value: 'astrologia', label: 'Astrologia' },
];

type Challenge = {
  id: string;
  title: string;
  description: string;
  type: string;
  cadence: string;
  durationDays: number;
  tradition: string | null;
  startsAt: string;
  endsAt: string;
  participantsCount: number;
  completionCount: number;
  coverImage: string | null;
  hostName?: string;
};

// Mock data — em produção vem de /api/challenges
const MOCK: Challenge[] = [
  {
    id: 'ch-7d-meditation',
    title: '7 dias de meditação silenciosa',
    description: 'Uma prática simples por dia. Sem performance, sem métrica. Apenas sentar.',
    type: 'MEDITATION',
    cadence: 'DAILY',
    durationDays: 7,
    tradition: null,
    startsAt: '2026-07-07T00:00:00Z',
    endsAt: '2026-07-13T23:59:59Z',
    participantsCount: 142,
    completionCount: 89,
    coverImage: null,
    hostName: 'Comunidade Akasha',
  },
  {
    id: 'ch-21d-mantra',
    title: '21 dias de mantra — Shiva Yoga',
    description: 'Repetição contemplativa do Mahamrityunjaya. 108 repetições por dia.',
    type: 'PRAYER',
    cadence: 'DAILY',
    durationDays: 21,
    tradition: 'tantra',
    startsAt: '2026-07-14T00:00:00Z',
    endsAt: '2026-08-03T23:59:59Z',
    participantsCount: 67,
    completionCount: 0,
    coverImage: null,
    hostName: 'Círculo Tantra',
  },
  {
    id: 'ch-study-zohar',
    title: 'Semana de estudo do Zohar',
    description: '7 artigos da Sêptupla do Zohar — um por dia, com reflexão compartilhada.',
    type: 'STUDY',
    cadence: 'DAILY',
    durationDays: 7,
    tradition: 'cabala',
    startsAt: '2026-07-21T00:00:00Z',
    endsAt: '2026-07-27T23:59:59Z',
    participantsCount: 23,
    completionCount: 0,
    coverImage: null,
    hostName: 'Círculo Cabala',
  },
];

export default function ChallengesPage() {
  const [typeFilter, setTypeFilter] = useState('');
  const [traditionFilter, setTraditionFilter] = useState('');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    return MOCK.filter((c) => {
      if (typeFilter && c.type !== typeFilter) return false;
      if (traditionFilter && c.tradition !== traditionFilter) return false;
      if (search && !c.title.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [typeFilter, traditionFilter, search]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50/40 via-white to-amber-50/20 dark:from-violet-950/20 dark:via-zinc-950 dark:to-amber-950/10">
      <div className="mx-auto max-w-6xl px-4 py-8 md:py-12">
        {/* Header */}
        <header className="mb-8">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-violet-100/60 px-3 py-1 text-xs font-medium text-violet-800 dark:bg-violet-900/30 dark:text-violet-200">
            <Sparkles className="h-3 w-3" />
            Comunidade — Challenges W38
          </div>
          <h1 className="mb-2 text-3xl font-bold tracking-tight md:text-4xl">
            Práticas estruturadas em grupo
          </h1>
          <p className="max-w-2xl text-base text-zinc-600 dark:text-zinc-300">
            Desafios de 7, 21 ou 40 dias — meditação, mantra, estudo, journaling — com
            acompanhamento leve e reflexões opcionais compartilhadas. Sem ranking, sem streak
            como troféu. Apenas continuidade.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/challenges/new">
              <Button className="bg-violet-600 hover:bg-violet-700">
                <Plus className="mr-2 h-4 w-4" />
                Criar desafio
              </Button>
            </Link>
            <Link href="/circles">
              <Button variant="outline">
                <Heart className="mr-2 h-4 w-4" />
                Ver círculos
              </Button>
            </Link>
          </div>
        </header>

        {/* Filters */}
        <Card className="mb-6 border-zinc-200 dark:border-zinc-800">
          <CardContent className="space-y-4 p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                type="search"
                placeholder="Buscar por título…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-md border border-zinc-300 bg-white py-2 pl-9 pr-3 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 dark:border-zinc-700 dark:bg-zinc-900"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Tipo de prática
              </label>
              <div className="flex flex-wrap gap-2">
                {TYPE_FILTERS.map((f) => {
                  const Icon = f.icon;
                  const active = typeFilter === f.value;
                  return (
                    <button
                      key={f.value || 'all'}
                      onClick={() => setTypeFilter(f.value)}
                      className={cn(
                        'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
                        active
                          ? 'bg-violet-600 text-white'
                          : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700',
                      )}
                    >
                      <Icon className="h-3 w-3" />
                      {f.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Tradição
              </label>
              <select
                value={traditionFilter}
                onChange={(e) => setTraditionFilter(e.target.value)}
                className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 dark:border-zinc-700 dark:bg-zinc-900"
              >
                {TRADITION_FILTERS.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* List */}
        {filtered.length === 0 ? (
          <div className="rounded-lg border border-dashed border-zinc-300 p-12 text-center dark:border-zinc-700">
            <Sparkles className="mx-auto mb-3 h-8 w-8 text-zinc-400" />
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Nenhum desafio corresponde aos filtros atuais.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((c) => (
              <Link key={c.id} href={`/challenges/${c.id}`}>
                <Card className="h-full border-zinc-200 transition-all hover:border-violet-400 hover:shadow-md dark:border-zinc-800">
                  {c.coverImage ? (
                    <div
                      className="h-32 rounded-t-lg bg-cover bg-center"
                      style={{ backgroundImage: `url(${c.coverImage})` }}
                    />
                  ) : (
                    <div className="flex h-32 items-center justify-center rounded-t-lg bg-gradient-to-br from-violet-500/10 via-amber-500/10 to-emerald-500/10">
                      <Sparkles className="h-8 w-8 text-violet-500/60" />
                    </div>
                  )}
                  <CardHeader className="pb-2">
                    <div className="mb-1 flex flex-wrap gap-1">
                      <Badge variant="secondary" className="text-[10px]">
                        {TYPE_FILTERS.find((t) => t.value === c.type)?.label || c.type}
                      </Badge>
                      {c.tradition && (
                        <Badge variant="outline" className="text-[10px]">
                          {TRADITION_FILTERS.find((t) => t.value === c.tradition)?.label ||
                            c.tradition}
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="line-clamp-2 text-base">{c.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-zinc-600 dark:text-zinc-400">
                    <p className="line-clamp-2 mb-3">{c.description}</p>
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1 text-zinc-500">
                        <Calendar className="h-3 w-3" />
                        {c.durationDays} dias
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1 text-zinc-500">
                          <Users className="h-3 w-3" />
                          {c.participantsCount}
                        </span>
                        <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                          {c.completionCount} completaram
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
