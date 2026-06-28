'use client';

// ============================================================================
// /me/bookmarks — Salvos para ler depois
// ============================================================================
// Lista os posts que o usuário salvou (com toggle via BookmarkButton).
// Sidebar mostra as collections; clicar filtra. Mobile-first: a sidebar
// vira um seletor horizontal no topo em telas pequenas.
// ============================================================================

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Bookmark, Loader2, FolderOpen } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookmarkButton } from '@/components/community/BookmarkButton';
import { formatRelativeTime } from '@/components/community/PostCard';
import type { ApiResponse, Post } from '@/types/community';
import { cn } from '@/lib/utils';

interface BookmarkItem {
  bookmarkId: string;
  post: Post;
  collectionName: string;
  createdAt: string;
}
interface BookmarksPayload {
  items: BookmarkItem[];
  collections: Array<{ name: string; count: number }>;
  total: number;
}

export default function BookmarksPage() {
  const [data, setData] = useState<BookmarksPayload | null>(null);
  const [activeCollection, setActiveCollection] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBookmarks = useCallback(async (collection: string | null) => {
    setLoading(true);
    setError(null);
    try {
      const url =
        collection === null
          ? '/api/users/me/bookmarks?limit=50'
          : `/api/users/me/bookmarks?collection=${encodeURIComponent(collection)}&limit=50`;
      const res = await fetch(url, { headers: { 'Content-Type': 'application/json' } });
      const json = (await res.json().catch(() => null)) as
        | ApiResponse<BookmarksPayload>
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
    void fetchBookmarks(activeCollection);
  }, [activeCollection, fetchBookmarks]);

  const handleBookmarkChange = useCallback(
    (postId: string, _bookmarked: boolean) => {
      // Refetch para atualizar contadores / collections
      void fetchBookmarks(activeCollection);
      // Otimisticamente remove o item da lista quando desfavorita
      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          items: prev.items.filter((i) => i.post.id !== postId),
          total: prev.total - 1,
        };
      });
      void postId; // explícito: usamos o id só pra trigger
    },
    [activeCollection, fetchBookmarks]
  );

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
            <Bookmark className="w-5 h-5 text-amber-400" aria-hidden="true" />
            Salvos
          </h1>
          <p className="text-sm text-slate-400">
            Posts que você guardou para ler depois.
          </p>
        </div>
      </header>

      {/* Collection chips — horizontal scroll no mobile */}
      {data && data.collections.length > 0 && (
        <nav
          aria-label="Coleções"
          className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1"
        >
          <CollectionChip
            label="Todas"
            count={data.collections.reduce((s, c) => s + c.count, 0)}
            active={activeCollection === null}
            onClick={() => setActiveCollection(null)}
          />
          {data.collections.map((c) => (
            <CollectionChip
              key={c.name}
              label={c.name}
              count={c.count}
              active={activeCollection === c.name}
              onClick={() => setActiveCollection(c.name)}
            />
          ))}
        </nav>
      )}

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
              onClick={() => void fetchBookmarks(activeCollection)}
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
            <FolderOpen className="w-10 h-10 mx-auto text-slate-600" aria-hidden="true" />
            <p className="text-slate-300 font-medium">
              Nenhum post salvo por aqui.
            </p>
            <p className="text-sm text-slate-500">
              Toque no ícone de bookmark em qualquer post para guardá-lo.
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
        <ul className="space-y-3" aria-label="Posts salvos">
          {data.items.map((item) => (
            <li key={item.bookmarkId}>
              <Card className="bg-slate-900/40 border-slate-800/50">
                <CardContent className="p-4 sm:p-5 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <Link
                      href={`/post/${item.post.id}`}
                      className="flex-1 min-w-0 group"
                    >
                      <p className="text-slate-200 leading-relaxed whitespace-pre-wrap break-words line-clamp-4 group-hover:text-amber-200 transition-colors">
                        {item.post.content}
                      </p>
                    </Link>
                    <BookmarkButton
                      postId={item.post.id}
                      bookmarked={true}
                      onChange={(b) => handleBookmarkChange(item.post.id, b)}
                      label="Remover dos salvos"
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1">
                      <span className="px-2 py-0.5 rounded-full bg-slate-800/60 text-slate-300">
                        {item.collectionName}
                      </span>
                      <span>· salvo {formatRelativeTime(item.createdAt)}</span>
                    </span>
                    {item.post.likesCount + item.post.commentsCount > 0 && (
                      <span>
                        {item.post.likesCount} curtidas · {item.post.commentsCount} comentários
                      </span>
                    )}
                  </div>
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
// CollectionChip
// ============================================================================

interface CollectionChipProps {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}

function CollectionChip({ label, count, active, onClick }: CollectionChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 min-h-[44px] px-3.5 py-2 rounded-full text-sm whitespace-nowrap transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/60',
        active
          ? 'bg-amber-500/20 text-amber-200 border border-amber-500/40'
          : 'bg-slate-800/40 text-slate-300 hover:bg-slate-800/70 border border-slate-700/40'
      )}
      aria-pressed={active}
    >
      <span>{label}</span>
      <span
        className={cn(
          'text-xs px-1.5 py-0.5 rounded-full',
          active ? 'bg-amber-500/30' : 'bg-slate-700/60'
        )}
      >
        {count}
      </span>
    </button>
  );
}
