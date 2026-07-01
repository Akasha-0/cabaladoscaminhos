'use client';

// ============================================================================
// EVENTS SERIES — /events/series
// ============================================================================
// Recurring events (every Monday meditation, etc). Series per tradição.
// Subscribe → ICS feed. Bundle pricing (10 sessions subscription).
// ============================================================================

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Calendar, Repeat, Bell, Sparkles, ArrowRight, Tag, Users,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

type EventSeries = {
  id: string;
  name: string;
  description: string;
  tradition: string | null;
  recurrence: string; // ex: "every Monday 20:00 UTC"
  totalSessions: number;
  bundlePriceCents: number | null;
  subscribers: number;
  nextSessionAt: string;
  coverImage: string | null;
};

const SERIES: EventSeries[] = [
  {
    id: 's1',
    name: 'Meditação Segunda-feira',
    description:
      'Sessão semanal de meditação guiada em grupo. Toda segunda 20:00 UTC. Aberta a todos.',
    tradition: null,
    recurrence: 'Toda segunda 20:00 UTC',
    totalSessions: 0, // ongoing
    bundlePriceCents: null,
    subscribers: 312,
    nextSessionAt: '2026-07-06T20:00:00Z',
    coverImage: null,
  },
  {
    id: 's2',
    name: 'Aulas de Cabala — Trato 1',
    description:
      'Curso introdutório de Cabala em 10 sessões semanais. Cada sessão foca um dos 10 Sefirot.',
    tradition: 'cabala',
    recurrence: '10 sessões semanais',
    totalSessions: 10,
    bundlePriceCents: 14900, // R$ 149,00
    subscribers: 47,
    nextSessionAt: '2026-07-09T19:00:00Z',
    coverImage: null,
  },
  {
    id: 's3',
    name: 'Círculo de Estudos — Ifá',
    description:
      'Estudo quinzenal dos Odus. Aprofundamento do sistema Ifá-litúrgico Yoruba.',
    tradition: 'ifa',
    recurrence: 'Quinzenal — sábado',
    totalSessions: 0,
    bundlePriceCents: null,
    subscribers: 24,
    nextSessionAt: '2026-07-11T18:00:00Z',
    coverImage: null,
  },
  {
    id: 's4',
    name: 'Tantra Yoga 21 Dias',
    description: '21 dias de práticas tântricas progressivas. Sessão diária 07:00 UTC.',
    tradition: 'tantra',
    recurrence: '21 sessões diárias',
    totalSessions: 21,
    bundlePriceCents: 24900,
    subscribers: 92,
    nextSessionAt: '2026-07-07T07:00:00Z',
    coverImage: null,
  },
];

function formatBRL(cents: number | null): string {
  if (cents === null) return 'Gratuito';
  return `R$ ${(cents / 100).toFixed(2)}`;
}

function formatNextSession(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffDays = Math.round((date.getTime() - now.getTime()) / 86400000);
  if (diffDays === 0) return 'Hoje ' + date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  if (diffDays === 1) return 'Amanhã ' + date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  return (
    date.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' }) +
    ' ' +
    date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  );
}

export default function EventsSeriesPage() {
  const [subscribing, setSubscribing] = useState<string | null>(null);

  async function handleSubscribe(seriesId: string) {
    setSubscribing(seriesId);
    try {
      const res = await fetch(`/api/events/series/${seriesId}/subscribe`, {
        method: 'POST',
      });
      if (!res.ok) {
        alert('Erro ao inscrever');
        return;
      }
      alert('Inscrição confirmada! Verifique seu e-mail para o ICS feed.');
    } catch {
      alert('Falha de rede');
    } finally {
      setSubscribing(null);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/30 via-white to-emerald-50/30 dark:from-amber-950/10 dark:via-zinc-950">
      <div className="mx-auto max-w-6xl px-4 py-8 md:py-12">
        <header className="mb-8">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-amber-100/60 px-3 py-1 text-xs font-medium text-amber-800 dark:bg-amber-900/30 dark:text-amber-200">
            <Repeat className="h-3 w-3" />
            Comunidade — Eventos em série W38
          </div>
          <h1 className="mb-2 text-3xl font-bold tracking-tight md:text-4xl">
            Eventos recorrentes
          </h1>
          <p className="max-w-2xl text-base text-zinc-600 dark:text-zinc-300">
            Sessões semanais, quinzenais, mensais. Subscribe à série para receber
            automaticamente cada encontro no seu calendário via ICS — sem FOMO,
            sem notificações invasivas.
          </p>
        </header>

        <div className="grid gap-5 md:grid-cols-2">
          {SERIES.map((s) => (
            <Card
              key={s.id}
              className="flex flex-col border-zinc-200 transition-all hover:border-amber-400 hover:shadow-md dark:border-zinc-800"
            >
              {s.coverImage ? (
                <div
                  className="h-32 rounded-t-lg bg-cover bg-center"
                  style={{ backgroundImage: `url(${s.coverImage})` }}
                />
              ) : (
                <div className="flex h-32 items-center justify-center rounded-t-lg bg-gradient-to-br from-amber-500/10 via-rose-500/10 to-violet-500/10">
                  <Repeat className="h-8 w-8 text-amber-500/60" />
                </div>
              )}
              <CardHeader className="pb-2">
                <div className="mb-2 flex flex-wrap gap-2">
                  {s.tradition && (
                    <Badge variant="outline" className="text-[10px]">
                      {s.tradition}
                    </Badge>
                  )}
                  {s.bundlePriceCents !== null ? (
                    <Badge variant="default" className="bg-amber-600 text-[10px]">
                      <Tag className="mr-1 h-2.5 w-2.5" />
                      Bundle
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-[10px]">
                      Gratuito
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-lg">{s.name}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col">
                <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-400">
                  {s.description}
                </p>

                <div className="mb-4 space-y-1.5 text-xs text-zinc-500">
                  <div className="flex items-center gap-1.5">
                    <Repeat className="h-3 w-3" />
                    {s.recurrence}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3 w-3" />
                    Próxima: {formatNextSession(s.nextSessionAt)}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="h-3 w-3" />
                    {s.subscribers} inscritos
                  </div>
                  {s.bundlePriceCents !== null && (
                    <div className="flex items-center gap-1.5 font-medium text-amber-700 dark:text-amber-400">
                      Bundle completo: {formatBRL(s.bundlePriceCents)} ({s.totalSessions} sessões)
                    </div>
                  )}
                </div>

                <div className="mt-auto flex flex-col gap-2">
                  <Button
                    onClick={() => handleSubscribe(s.id)}
                    disabled={subscribing === s.id}
                    className="w-full bg-violet-600 hover:bg-violet-700"
                  >
                    {subscribing === s.id ? (
                      'Inscrevendo…'
                    ) : (
                      <>
                        <Bell className="mr-2 h-4 w-4" />
                        Inscrever + receber ICS
                      </>
                    )}
                  </Button>
                  <Link href={`/events`}>
                    <Button variant="ghost" size="sm" className="w-full">
                      Ver próximas sessões
                      <ArrowRight className="ml-1 h-3 w-3" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <section className="mt-12 rounded-lg border border-emerald-200 bg-emerald-50/50 p-6 dark:border-emerald-900 dark:bg-emerald-950/20">
          <div className="mb-3 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-emerald-600" />
            <h3 className="text-lg font-semibold">Bundle pricing</h3>
          </div>
          <p className="text-sm text-zinc-700 dark:text-zinc-300">
            Séries pagas oferecem bundle único com todas as N sessões. Sem mensalidade,
            sem renovação automática — você paga uma vez e tem acesso ao ciclo completo
            (com bundle de 21 dias = Tantra Yoga). Recordings ficam disponíveis
            após a sessão para quem comprou o bundle.
          </p>
        </section>
      </div>
    </div>
  );
}
