// ============================================================================
// GET /api/library/videos — Wave 39 (Video + Streaming 6/8)
// ============================================================================
// JSON API for the video library. Used by the mobile PWA app and by
// external clients (mobile app, RSS generator, partner sites).
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import type { LibraryVideo } from '@/app/(community)/library/videos/page';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface ListQuery {
  trad?: string;
  fac?: string;
  sort?: 'recent' | 'popular';
  q?: string;
  limit?: number;
  cursor?: string;
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  const url = new URL(req.url);
  const params: ListQuery = {
    trad: url.searchParams.get('trad') ?? undefined,
    fac: url.searchParams.get('fac') ?? undefined,
    sort: (url.searchParams.get('sort') as 'recent' | 'popular') ?? 'recent',
    q: url.searchParams.get('q') ?? undefined,
    limit: Number(url.searchParams.get('limit') ?? '24'),
    cursor: url.searchParams.get('cursor') ?? undefined,
  };
  const videos = listMockVideos();
  let filtered = [...videos];
  if (params.trad) filtered = filtered.filter(v => v.tradicao === params.trad);
  if (params.fac) filtered = filtered.filter(v => v.facilitatorName.toLowerCase().includes(params.fac!.toLowerCase()));
  if (params.q) filtered = filtered.filter(v => v.title.toLowerCase().includes(params.q!.toLowerCase()));
  filtered.sort((a, b) => {
    if (params.sort === 'popular') return b.views - a.views;
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
  });
  const limit = Math.min(50, Math.max(1, params.limit ?? 24));
  const sliced = filtered.slice(0, limit);
  const nextCursor = filtered.length > limit ? sliced[sliced.length - 1]!.id : null;
  return NextResponse.json({
    ok: true,
    data: sliced,
    pagination: { limit, nextCursor, total: filtered.length },
  });
}

function listMockVideos(): readonly LibraryVideo[] {
  const NOW = Date.now();
  return Object.freeze([
    {
      id: 'v1', title: 'Roda de Candomblé — Aruanã', facilitatorName: 'Mãe Iyá Dayo',
      tradicao: 'Candomblé', thumbnailUrl: '', durationSeconds: 3_600, views: 1240,
      publishedAt: new Date(NOW - 86_400_000).toISOString(),
      visibility: 'public', chapters: 5,
    },
    {
      id: 'v2', title: 'Meditação Guiada — Chakra Coronário', facilitatorName: 'Pai Ogã Beira-Mar',
      tradicao: 'Umbanda', thumbnailUrl: '', durationSeconds: 1_800, views: 980,
      publishedAt: new Date(NOW - 86_400_000 * 3).toISOString(),
      visibility: 'public', chapters: 3,
    },
    {
      id: 'v3', title: 'Aula: Ifá e o Odu Iwori', facilitatorName: 'Babalorixá Olukoya',
      tradicao: 'Ifá', thumbnailUrl: '', durationSeconds: 7_200, views: 540,
      publishedAt: new Date(NOW - 86_400_000 * 7).toISOString(),
      visibility: 'public', chapters: 8,
    },
    {
      id: 'v4', title: 'Cabala — Árvore da Vida (Merkavah)', facilitatorName: 'Rabino Shlomo B.',
      tradicao: 'Cabala', thumbnailUrl: '', durationSeconds: 5_400, views: 1_750,
      publishedAt: new Date(NOW - 86_400_000 * 5).toISOString(),
      visibility: 'public', chapters: 6,
    },
  ]);
}
