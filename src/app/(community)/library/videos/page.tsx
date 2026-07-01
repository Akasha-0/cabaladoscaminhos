// ============================================================================
// Video Library — Wave 39 (Video + Streaming 6/8)
// ============================================================================
// Browse all recorded live events + uploaded pre-recorded videos.
// Filter by tradição + facilitator, search by title, sort by recency / popularity.
// Series subscriptions + watch progress tracking.
//
// Server-rendered list with optional view-count badge + saved-for-later.
// LGPD Art. 7: progress tracking is opt-in per user.
// ============================================================================

import React from 'react';
import Link from 'next/link';
import { Clock, Users, Eye, Bookmark, Play, Filter } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export interface LibraryVideo {
  id: string;
  title: string;
  facilitatorName: string;
  tradicao?: string;
  thumbnailUrl: string;
  durationSeconds: number;
  views: number;
  publishedAt: string;
  visibility: 'public' | 'rsvp-only' | 'private';
  chapters: number;
  savedByUser?: boolean;
  watchProgressPercent?: number;
}

interface LibraryVideosPageProps {
  searchParams: Promise<{ trad?: string; fac?: string; sort?: 'recent' | 'popular'; q?: string }>;
}

export default async function LibraryVideosPage(props: LibraryVideosPageProps) {
  const sp = await props.searchParams;
  const tradFilter = sp.trad ?? '';
  const facFilter = sp.fac ?? '';
  const sort = sp.sort ?? 'recent';
  const query = sp.q ?? '';

  // In production: fetch via Prisma.
  // For type-safety we return a fully-typed mock list.
  const allVideos: readonly LibraryVideo[] = buildMockLibrary();
  const filtered = allVideos
    .filter(v => !tradFilter || v.tradicao === tradFilter)
    .filter(v => !facFilter || v.facilitatorName.toLowerCase().includes(facFilter.toLowerCase()))
    .filter(v => !query || v.title.toLowerCase().includes(query.toLowerCase()));

  const sorted = [...filtered].sort((a, b) => {
    if (sort === 'popular') return b.views - a.views;
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
  });

  const tradicoes = Array.from(new Set(allVideos.map(v => v.tradicao).filter(Boolean))) as string[];
  const facilitators = Array.from(new Set(allVideos.map(v => v.facilitatorName)));

  return (
    <main className="container mx-auto px-4 py-8">
      <header className="mb-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">Biblioteca de Vídeos</h1>
          <p className="text-slate-400 mt-1">
            Gravações de eventos ao vivo e aulas pregravadas da nossa comunidade.
          </p>
        </div>
        <Link href="/library/videos/subscriptions">
          <Button variant="outline" className="gap-2">
            <Bookmark className="w-4 h-4" />
            Minhas séries
          </Button>
        </Link>
      </header>

      <div className="flex flex-wrap gap-2 mb-6" role="search" aria-label="Filtrar biblioteca">
        <Link href="/library/videos" className={`text-xs px-3 py-1.5 rounded-full border ${!tradFilter ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300' : 'border-slate-700 text-slate-300 hover:bg-slate-800'}`}>
          Todas
        </Link>
        {tradicoes.map((t) => (
          <Link key={t} href={`/library/videos?trad=${encodeURIComponent(t)}`} className={`text-xs px-3 py-1.5 rounded-full border ${tradFilter === t ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300' : 'border-slate-700 text-slate-300 hover:bg-slate-800'}`}>
            <Filter className="inline w-3 h-3 mr-1" /> {t}
          </Link>
        ))}
        <div className="ml-auto flex gap-2 items-center text-xs">
          <span className="text-slate-500">Ordenar:</span>
          <Link href={`/library/videos?sort=recent${tradFilter ? `&trad=${tradFilter}` : ''}`} className={sort === 'recent' ? 'text-emerald-300' : 'text-slate-300 hover:text-white'}>
            Mais recentes
          </Link>
          <span className="text-slate-700">·</span>
          <Link href={`/library/videos?sort=popular${tradFilter ? `&trad=${tradFilter}` : ''}`} className={sort === 'popular' ? 'text-emerald-300' : 'text-slate-300 hover:text-white'}>
            Mais assistidos
          </Link>
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <Filter className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Nenhum vídeo encontrado para esses filtros.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {sorted.map((v) => (
            <Card
              key={v.id}
              className="bg-slate-900/50 border-slate-800 overflow-hidden hover:border-emerald-500/30 transition group"
            >
              <Link href={`/library/videos/${v.id}`} className="block">
                <div className="relative aspect-video bg-slate-950 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/40 via-slate-900 to-violet-900/40 flex items-center justify-center">
                    <Play className="w-12 h-12 text-white/80 group-hover:scale-110 transition" />
                  </div>
                  {v.visibility === 'rsvp-only' && (
                    <Badge className="absolute top-2 left-2 bg-amber-500/20 border-amber-500/40 text-amber-300 text-xs">
                      Inscritos
                    </Badge>
                  )}
                  {v.watchProgressPercent !== undefined && v.watchProgressPercent > 0 && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/20">
                      <div className="h-full bg-emerald-400" style={{ width: `${v.watchProgressPercent}%` }} />
                    </div>
                  )}
                  <span className="absolute bottom-2 right-2 text-xs bg-black/70 text-white px-1.5 py-0.5 rounded">
                    {formatDuration(v.durationSeconds)}
                  </span>
                </div>
                <CardContent className="p-3">
                  <h3 className="font-medium text-sm line-clamp-2 text-slate-100">{v.title}</h3>
                  <p className="text-xs text-slate-400 mt-1">{v.facilitatorName}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" /> {formatCount(v.views)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {new Date(v.publishedAt).toLocaleDateString('pt-BR')}
                    </span>
                    {v.chapters > 0 && (
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" /> {v.chapters} caps.
                      </span>
                    )}
                  </div>
                  {v.tradicao && (
                    <Badge variant="outline" className="mt-2 text-xs border-slate-700 text-slate-400">
                      {v.tradicao}
                    </Badge>
                  )}
                </CardContent>
              </Link>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}

function buildMockLibrary(): readonly LibraryVideo[] {
  const NOW = Date.now();
  return Object.freeze([
    Object.freeze({
      id: 'v1', title: 'Roda de Candomblé — Aruanã',
      facilitatorName: 'Mãe Iyá Dayo', tradicao: 'Candomblé',
      thumbnailUrl: '', durationSeconds: 3_600, views: 1240,
      publishedAt: new Date(NOW - 86_400_000 * 1).toISOString(),
      visibility: 'public' as const, chapters: 5,
    }),
    Object.freeze({
      id: 'v2', title: 'Meditação Guiada — Chakra Coronário',
      facilitatorName: 'Pai Ogã Beira-Mar', tradicao: 'Umbanda',
      thumbnailUrl: '', durationSeconds: 1_800, views: 980,
      publishedAt: new Date(NOW - 86_400_000 * 3).toISOString(),
      visibility: 'public' as const, chapters: 3,
    }),
    Object.freeze({
      id: 'v3', title: 'Aula: Ifá e o Odu Iwori',
      facilitatorName: 'Babalorixá Olukoya', tradicao: 'Ifá',
      thumbnailUrl: '', durationSeconds: 7_200, views: 540,
      publishedAt: new Date(NOW - 86_400_000 * 7).toISOString(),
      visibility: 'public' as const, chapters: 8,
    }),
    Object.freeze({
      id: 'v4', title: 'Cabala — Árvore da Vida (Merkavah)',
      facilitatorName: 'Rabino Shlomo B.', tradicao: 'Cabala',
      thumbnailUrl: '', durationSeconds: 5_400, views: 1_750,
      publishedAt: new Date(NOW - 86_400_000 * 5).toISOString(),
      visibility: 'public' as const, chapters: 6,
    }),
    Object.freeze({
      id: 'v5', title: 'Tantra — Meditação do Som',
      facilitatorName: 'Swami Anand', tradicao: 'Tantra',
      thumbnailUrl: '', durationSeconds: 3_000, views: 720,
      publishedAt: new Date(NOW - 86_400_000 * 14).toISOString(),
      visibility: 'public' as const, chapters: 4,
    }),
    Object.freeze({
      id: 'v6', title: 'Astrologia — Eclipse Solar em Leão',
      facilitatorName: 'Astróloga Marina V.', tradicao: 'Astrologia',
      thumbnailUrl: '', durationSeconds: 4_200, views: 1_100,
      publishedAt: new Date(NOW - 86_400_000 * 2).toISOString(),
      visibility: 'public' as const, chapters: 5,
    }),
    Object.freeze({
      id: 'v7', title: 'Série Eckankar — Viagem da Alma I',
      facilitatorName: 'Mestra Saranya', tradicao: 'Eckankar',
      thumbnailUrl: '', durationSeconds: 2_400, views: 430,
      publishedAt: new Date(NOW - 86_400_000 * 12).toISOString(),
      visibility: 'public' as const, chapters: 3,
    }),
    Object.freeze({
      id: 'v8', title: 'Umbanda — A linha das Almas',
      facilitatorName: 'Pai Ogã Jaguaribe', tradicao: 'Umbanda',
      thumbnailUrl: '', durationSeconds: 3_600, views: 860,
      publishedAt: new Date(NOW - 86_400_000 * 9).toISOString(),
      visibility: 'public' as const, chapters: 4,
    }),
  ]);
}

function formatDuration(s: number): string {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h > 0) return `${h}h${m.toString().padStart(2, '0')}m`;
  return `${m}min`;
}

function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}
