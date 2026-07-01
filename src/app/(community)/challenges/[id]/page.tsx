'use client';

// ============================================================================
// CHALLENGE PARTICIPATION — /challenges/[id]
// ============================================================================
// Hero + host + daily reflection form + progress tracker + community feed.
// ============================================================================

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Sparkles, Calendar, Users, ArrowLeft, Loader2, Lock, Globe,
  Heart, Send, Check, MessageCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// ============================================================
// Tipos
// ============================================================
type Reflection = {
  dayIndex: number;
  text: string;
  isPublic: boolean;
  authorName?: string;
  createdAt: string;
};

const MOCK_CHALLENGE = {
  id: 'ch-7d-meditation',
  title: '7 dias de meditação silenciosa',
  description:
    'Uma prática simples por dia. 15 minutos sentado, focando na respiração. Sem performance, sem métrica além de você mesmo. O que importa é sentar.',
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
};

const MOCK_REFLECTIONS: Reflection[] = [
  {
    dayIndex: 0,
    text: 'Primeiro dia. Senti agitação, mas respirei. Voltarei amanhã.',
    isPublic: true,
    authorName: 'Maria L.',
    createdAt: '2026-07-07T08:15:00Z',
  },
  {
    dayIndex: 1,
    text: 'A respiração acalmou. Menos pensamentos do que esperava.',
    isPublic: true,
    authorName: 'João P.',
    createdAt: '2026-07-08T07:42:00Z',
  },
];

export default function ChallengeParticipationPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const challenge = MOCK_CHALLENGE;
  const [participating, setParticipating] = useState(false);
  const [dayIndex, setDayIndex] = useState(0);
  const [reflectionText, setReflectionText] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  async function handleParticipate() {
    setParticipating(true);
    try {
      const res = await fetch(`/api/challenges/${params.id}/participate`, {
        method: 'POST',
      });
      if (!res.ok) {
        alert('Erro ao se inscrever');
        return;
      }
      alert('Inscrição confirmada!');
    } catch {
      alert('Falha de rede');
    } finally {
      setParticipating(false);
    }
  }

  async function handleReflect() {
    if (reflectionText.trim().length < 5) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/challenges/${params.id}/reflect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dayIndex,
          text: reflectionText,
          isPublic,
        }),
      });
      if (!res.ok) {
        alert('Erro ao salvar reflexão');
        return;
      }
      setReflectionText('');
      alert('Reflexão salva!');
    } catch {
      alert('Falha de rede');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50/40 via-white to-amber-50/20 dark:from-violet-950/20 dark:via-zinc-950">
      <div className="mx-auto max-w-3xl px-4 py-8 md:py-12">
        <Link
          href="/challenges"
          className="mb-6 inline-flex items-center text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Todos os desafios
        </Link>

        {/* Hero */}
        <Card className="mb-6 border-zinc-200 dark:border-zinc-800">
          {challenge.coverImage ? (
            <div
              className="h-48 rounded-t-lg bg-cover bg-center"
              style={{ backgroundImage: `url(${challenge.coverImage})` }}
            />
          ) : (
            <div className="flex h-48 items-center justify-center rounded-t-lg bg-gradient-to-br from-violet-500/20 via-amber-500/20 to-emerald-500/20">
              <Sparkles className="h-12 w-12 text-violet-500/60" />
            </div>
          )}
          <CardContent className="space-y-4 p-6">
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{challenge.type}</Badge>
              <Badge variant="outline">
                <Calendar className="mr-1 h-3 w-3" />
                {challenge.durationDays} dias
              </Badge>
              <Badge variant="outline">{challenge.cadence}</Badge>
            </div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              {challenge.title}
            </h1>
            <p className="text-zinc-700 dark:text-zinc-300">{challenge.description}</p>

            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-zinc-100 pt-4 dark:border-zinc-800">
              <div className="flex items-center gap-3 text-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300">
                  {challenge.hostName?.charAt(0) || '?'}
                </div>
                <div>
                  <div className="text-xs text-zinc-500">Hospedado por</div>
                  <div className="font-medium">{challenge.hostName}</div>
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-zinc-600 dark:text-zinc-400">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {challenge.participantsCount} participantes
                </div>
                <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                  <Check className="h-4 w-4" />
                  {challenge.completionCount} completaram
                </div>
              </div>
            </div>

            <Button
              onClick={handleParticipate}
              disabled={participating}
              className="w-full bg-violet-600 hover:bg-violet-700"
              size="lg"
            >
              {participating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Inscrevendo…
                </>
              ) : (
                <>
                  <Heart className="mr-2 h-4 w-4" />
                  Participar deste desafio
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Daily reflection */}
        <Card className="mb-6 border-zinc-200 dark:border-zinc-800">
          <CardHeader>
            <CardTitle>Sua reflexão de hoje</CardTitle>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Dia {dayIndex + 1} de {challenge.durationDays}
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <textarea
              value={reflectionText}
              onChange={(e) => setReflectionText(e.target.value)}
              rows={4}
              placeholder="Como foi a prática hoje? Sem julgamento…"
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            />

            <div className="flex items-center justify-between">
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="h-4 w-4 rounded border-zinc-300"
                />
                <span className="flex items-center gap-1">
                  {isPublic ? (
                    <>
                      <Globe className="h-3 w-3" /> Compartilhar com a comunidade
                    </>
                  ) : (
                    <>
                      <Lock className="h-3 w-3" /> Privado (só você vê)
                    </>
                  )}
                </span>
              </label>

              <Button
                onClick={handleReflect}
                disabled={submitting || reflectionText.trim().length < 5}
                className="bg-violet-600 hover:bg-violet-700"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Salvar
                  </>
                )}
              </Button>
            </div>

            <div className="text-xs text-zinc-500">
              Próximo dia estará disponível após a meia-noite (UTC).
            </div>
          </CardContent>
        </Card>

        {/* Progress tracker */}
        <Card className="mb-6 border-zinc-200 dark:border-zinc-800">
          <CardHeader>
            <CardTitle>Progresso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: challenge.durationDays }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setDayIndex(i)}
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-full text-xs font-medium transition-colors',
                    i < dayIndex + 1
                      ? 'bg-violet-600 text-white'
                      : i === dayIndex
                      ? 'border-2 border-violet-600 text-violet-700 dark:text-violet-300'
                      : 'bg-zinc-100 text-zinc-400 dark:bg-zinc-800',
                  )}
                  aria-label={`Dia ${i + 1}`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <p className="mt-3 text-xs text-zinc-500">
              Você completou 1 de {challenge.durationDays} dias.
            </p>
          </CardContent>
        </Card>

        {/* Community feed */}
        <Card className="border-zinc-200 dark:border-zinc-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Reflexões compartilhadas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {MOCK_REFLECTIONS.length === 0 ? (
              <p className="rounded-lg border border-dashed border-zinc-200 p-8 text-center text-sm text-zinc-500 dark:border-zinc-700">
                Nenhuma reflexão pública ainda.
              </p>
            ) : (
              MOCK_REFLECTIONS.map((r, i) => (
                <div
                  key={i}
                  className="rounded-lg border border-zinc-100 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/50"
                >
                  <div className="mb-2 flex items-center justify-between text-xs text-zinc-500">
                    <span className="font-medium text-zinc-700 dark:text-zinc-300">
                      {r.authorName || 'Anônimo'}
                    </span>
                    <span>
                      Dia {r.dayIndex + 1} ·{' '}
                      {new Date(r.createdAt).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-700 dark:text-zinc-300">{r.text}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
