'use client';

// ============================================================================
// /me/history — Histórico de leituras
// ============================================================================
// Lista os posts que o usuário abriu/leu recentemente, com a barra de
// progresso de leitura de cada um. Ordena por readAt desc.
//
// Mobile-first: cards compactos com preview de conteúdo + barra fina
// de progresso (% lido).
// ============================================================================

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, History, Loader2, BookOpen } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatRelativeTime } from '@/components/community/PostCard';
import type { ApiResponse, Post } from '@/types/community';

interface HistoryItem {
  post: Post;
  percentRead: number;
  readAt: string;
}
interface HistoryPayload {
  items: HistoryItem[];
  total: number;
}

export default function HistoryPage() {
  const [data, setData] = useState<HistoryPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/users/me/history?limit=50', {
        headers: { 'Content-Type': 'application/json' },
      });
      const json = (await res.json().catch(() => null)) as
        | ApiResponse<HistoryPayload>
        | null;
      if (!res.ok || !json?.data) {
        setError(json?.error?.message ?? `Erro ${res.status}`);
        return;
      }
      setData(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro de rede');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchHistory();
  }, [fetchHistory]);

  return (
    <main className="max-w-4xl mx-auto px-4 py-4 sm:py-6 space-y-4">
      <header className="flex items-center gap-3">
        <Link
          href="/feed"
          className="inline-flex items-center justify-center min-h-[44px] min-w-[44px] rounded-lg text-slate-300 hover:text-amber-300 hover:bg-slate-800/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/60"
          aria-label="Voltar ao feed"
        >
          <ArrowLeft className="w-5 h-5" aria-hidden="true" />
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-slate-100 flex items-center gap-2">
            <History className="w-5 h-5 text-amber-400" aria-hidden="true" />
            Histórico
          </h1>
          <p className="text-sm text-slate-400">
            Continue de onde parou — seus posts lidos recentemente.
          </p>
        </div>
      </header>

      {loading && (
        <div className="flex items-center justify-center min-h-[30vh] text-slate-400">
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
          Carregando…
        </div>
      )}

      {error && !loading && (
        <Card className="bg-red-950/30 border-red-800/50">
          <CardContent className="p-4">
            <p className="text-red-300 text-sm">{error}</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => void fetchHistory()}
              className="mt-2 min-h-[44px] text-red-300 hover:text-red-200"
            >
              Tentar de novo
            </Button>
          </CardContent>
        </Card>
      )}

      {!loading && !error && data && data.items.length === 0 && (
        <Card className="bg-slate-900/40 border-slate-800/50">
          <CardContent className="p-8 text-center space-y-3">
            <BookOpen className="w-10 h-10 mx-auto text-slate-600" aria-hidden="true" />
            <p className="text-slate-300 font-medium">
              Você ainda não abriu nenhum post.
            </p>
            <p className="text-sm text-slate-500">
              Conforme você ler, eles aparecem aqui pra você continuar depois.
            </p>
            <Link
              href="/feed"
              className="inline-block mt-2 text-amber-400 hover:text-amber-300 underline-offset-2 hover:underline min-h-[44px] leading-[44px]"
            >
              Explorar o feed
            </Link>
          </CardContent>
        </Card>
      )}

      {!loading && !error && data && data.items.length > 0 && (
        <ul className="space-y-3" aria-label="Histórico de leituras">
          {data.items.map((item) => (
            <li key={item.post.id}>
              <Card className="bg-slate-900/40 border-slate-800/50 hover:border-slate-700/60 transition-colors">
                <CardContent className="p-4 sm:p-5 space-y-3">
                  <Link href={`/post/${item.post.id}`} className="block group">
                    <p className="text-slate-200 leading-relaxed whitespace-pre-wrap break-words line-clamp-4 group-hover:text-amber-200 transition-colors">
                      {item.post.content}
                    </p>
                  </Link>
                  <ProgressRow
                    percent={item.percentRead}
                    readAt={item.readAt}
                    likesCount={item.post.likesCount}
                    commentsCount={item.post.commentsCount}
                  />
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

// ============================================================================
// ProgressRow
// ============================================================================

interface ProgressRowProps {
  percent: number;
  readAt: string;
  likesCount: number;
  commentsCount: number;
}

function ProgressRow({ percent, readAt, likesCount, commentsCount }: ProgressRowProps) {
  const safePercent = Math.max(0, Math.min(100, percent));
  return (
    <div className="space-y-1.5">
      <div
        className="h-1.5 w-full rounded-full bg-slate-800/60 overflow-hidden"
        role="progressbar"
        aria-valuenow={safePercent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Progresso de leitura"
      >
        <div
          className="h-full bg-gradient-to-r from-amber-500 to-amber-300 transition-[width] duration-300"
          style={{ width: `${safePercent}%` }}
        />
      </div>
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>
          {safePercent}% lido · {formatRelativeTime(readAt)}
        </span>
        {likesCount + commentsCount > 0 && (
          <span>
            {likesCount} curtidas · {commentsCount} comentários
          </span>
        )}
      </div>
    </div>
  );
}
