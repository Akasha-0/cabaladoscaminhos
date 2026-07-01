'use client';

// ============================================================================
// CIRCLES — /circles
// ============================================================================
// Círculos recorrentes por tradição (Cabala semanal, Ifá mensal, Tantra, etc.)
// com mentor designado + cronograma + arquivo de gravações.
// ============================================================================

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Heart, Users, Calendar, Clock, ArrowRight, Video, FileText,
  Sparkles,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

type Circle = {
  id: string;
  name: string;
  slug: string;
  description: string;
  tradition: string | null;
  cadence: 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'IRREGULAR';
  nextSessionAt: string | null;
  durationMins: number;
  mentorName: string;
  participantsCount: number;
  coverImage: string | null;
};

const CIRCLES: Circle[] = [
  {
    id: 'c1',
    name: 'Círculo Cabala',
    slug: 'circulo-cabala',
    description:
      'Weekly Q&A sobre o Zohar e a Árvore da Vida. Aberto a estudantes de todos os níveis.',
    tradition: 'cabala',
    cadence: 'WEEKLY',
    nextSessionAt: '2026-07-02T20:00:00Z',
    durationMins: 90,
    mentorName: 'Rabbi David Ben Solomon',
    participantsCount: 87,
    coverImage: null,
  },
  {
    id: 'c2',
    name: 'Círculo Ifá',
    slug: 'circulo-ifa',
    description:
      'Estudo mensal dos Odus — 16odu principal e variações. Aprofundamento do Ifá litúrgico.',
    tradition: 'ifa',
    cadence: 'MONTHLY',
    nextSessionAt: '2026-07-15T19:00:00Z',
    durationMins: 120,
    mentorName: 'Babalawo Adekunle',
    participantsCount: 34,
    coverImage: null,
  },
  {
    id: 'c3',
    name: 'Círculo Tantra',
    slug: 'circulo-tantra',
    description:
      'Práticas de meditação tântrica, kundalini, e estudo dos textos não-duais.',
    tradition: 'tantra',
    cadence: 'WEEKLY',
    nextSessionAt: '2026-07-04T07:00:00Z',
    durationMins: 75,
    mentorName: 'Maestra Lalita Devi',
    participantsCount: 56,
    coverImage: null,
  },
  {
    id: 'c4',
    name: 'Círculo Meditação',
    slug: 'circulo-meditacao',
    description:
      'Daily sit — 30 minutos de meditação silenciosa em grupo. Tradição-agnóstico.',
    tradition: null,
    cadence: 'WEEKLY',
    nextSessionAt: '2026-07-03T06:00:00Z',
    durationMins: 30,
    mentorName: 'Comunidade Akasha',
    participantsCount: 211,
    coverImage: null,
  },
  {
    id: 'c5',
    name: 'Círculo Xamanismo',
    slug: 'circulo-xamanismo',
    description:
      'Discussão aberta sobre medicinas vegetais, canto, e práticas xamânicas sul-americanas.',
    tradition: 'xamanismo',
    cadence: 'BIWEEKLY',
    nextSessionAt: '2026-07-08T21:00:00Z',
    durationMins: 90,
    mentorName: 'Pajé Tupã Mirim',
    participantsCount: 41,
    coverImage: null,
  },
];

const CADENCE_LABELS = {
  WEEKLY: 'Semanal',
  BIWEEKLY: 'Quinzenal',
  MONTHLY: 'Mensal',
  IRREGULAR: 'Sob demanda',
};

function formatNextSession(iso: string | null): string {
  if (!iso) return 'A definir';
  const date = new Date(iso);
  const now = new Date();
  const diffDays = Math.round((date.getTime() - now.getTime()) / 86400000);
  if (diffDays === 0) return 'Hoje';
  if (diffDays === 1) return 'Amanhã';
  if (diffDays > 1 && diffDays <= 7) return `Em ${diffDays} dias`;
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

export default function CirclesPage() {
  const [filter, setFilter] = useState('');

  const filtered = CIRCLES.filter(
    (c) => !filter || c.tradition === filter,
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50/30 via-white to-violet-50/30 dark:from-rose-950/10 dark:via-zinc-950 dark:to-violet-950/10">
      <div className="mx-auto max-w-6xl px-4 py-8 md:py-12">
        <header className="mb-8">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-rose-100/60 px-3 py-1 text-xs font-medium text-rose-800 dark:bg-rose-900/30 dark:text-rose-200">
            <Heart className="h-3 w-3" />
            Comunidade — Círculos W38
          </div>
          <h1 className="mb-2 text-3xl font-bold tracking-tight md:text-4xl">
            Círculos de prática
          </h1>
          <p className="max-w-2xl text-base text-zinc-600 dark:text-zinc-300">
            Encontros recorrentes por tradição, com mentor designado e arquivo de gravações.
            Subscribe à série para receber lembretes automáticos via ICS.
          </p>
        </header>

        {/* Filter */}
        <div className="mb-6 flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('')}
            className={`rounded-full px-3 py-1.5 text-xs font-medium ${
              filter === ''
                ? 'bg-violet-600 text-white'
                : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800'
            }`}
          >
            Todos
          </button>
          {['cabala', 'ifa', 'tantra', 'meditacao', 'xamanismo'].map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                filter === t
                  ? 'bg-violet-600 text-white'
                  : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800'
              }`}
            >
              {t === 'meditacao' ? 'Meditação' : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => (
            <Card
              key={c.id}
              className="flex flex-col border-zinc-200 transition-all hover:border-violet-400 hover:shadow-md dark:border-zinc-800"
            >
              <CardHeader className="pb-2">
                <div className="mb-2 flex items-center justify-between">
                  <Badge variant="outline" className="text-[10px]">
                    {c.tradition || 'universal'}
                  </Badge>
                  <Badge variant="secondary" className="text-[10px]">
                    {CADENCE_LABELS[c.cadence]}
                  </Badge>
                </div>
                <CardTitle className="text-lg">{c.name}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col">
                <p className="mb-3 line-clamp-3 text-sm text-zinc-600 dark:text-zinc-400">
                  {c.description}
                </p>

                <div className="mb-3 space-y-1 text-xs text-zinc-500">
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    Mentor: {c.mentorName}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Próxima: {formatNextSession(c.nextSessionAt)}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {c.durationMins} min
                  </div>
                </div>

                <div className="mt-auto flex items-center justify-between border-t border-zinc-100 pt-3 dark:border-zinc-800">
                  <span className="text-xs text-zinc-500">
                    {c.participantsCount} membros
                  </span>
                  <Link href={`/circles/${c.slug}`}>
                    <Button variant="ghost" size="sm">
                      Entrar
                      <ArrowRight className="ml-1 h-3 w-3" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Section: ICS subscription */}
        <section className="mt-12 rounded-lg border border-violet-200 bg-violet-50/50 p-6 dark:border-violet-900 dark:bg-violet-950/20">
          <div className="mb-3 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-violet-600" />
            <h3 className="text-lg font-semibold">Assine a série via ICS</h3>
          </div>
          <p className="mb-4 text-sm text-zinc-700 dark:text-zinc-300">
            Cada círculo oferece um feed ICS compatível com Google Calendar,
            Apple Calendar e Outlook. Receba próximos encontros automaticamente
            sem precisar conferir manualmente.
          </p>
          <div className="flex flex-wrap gap-2">
            {CIRCLES.map((c) => (
              <a
                key={c.id}
                href={`/api/circles/${c.slug}/ics`}
                className="inline-flex items-center gap-1 rounded-md border border-violet-300 bg-white px-3 py-1.5 text-xs font-mono text-violet-700 hover:bg-violet-100 dark:border-violet-800 dark:bg-violet-950 dark:text-violet-300"
              >
                <Calendar className="h-3 w-3" />
                {c.slug}.ics
              </a>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
