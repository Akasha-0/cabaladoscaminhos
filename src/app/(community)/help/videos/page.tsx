// ============================================================================
// /help/videos — Índice de vídeos tutoriais (Wave 36)
// ============================================================================

import type { Metadata } from 'next';
import Link from 'next/link';
import { VIDEOS, VIDEO_CATEGORIES, formatDuration, totalVideosCount } from '@/lib/help/videos-data';

export const metadata: Metadata = {
  title: 'Vídeos tutoriais · Cabala dos Caminhos',
  description: 'Vídeo-tutoriais curtos sobre onboarding, Akasha IA, mapa astral, marketplace e comunidade.',
  alternates: { canonical: '/help/videos' },
};

export const revalidate = 600;

export default function VideosIndexPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 lg:px-8">
      <header className="mb-10">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-violet-900/30 px-3 py-1 text-xs font-medium text-violet-200 ring-1 ring-violet-700/50">
          <span aria-hidden>🎬</span>
          <span>Vídeos · {totalVideosCount()} tutoriais</span>
        </div>
        <h1 className="mb-3 text-3xl font-bold text-slate-50 sm:text-4xl">
          Vídeos tutoriais
        </h1>
        <p className="max-w-2xl text-base text-slate-300 sm:text-lg">
          7-12min cada. PT-BR primário, legenda EN disponível. PDF resumo ao final de cada vídeo.
        </p>
      </header>

      {/* Por categoria */}
      {VIDEO_CATEGORIES.map((cat) => {
        const list = VIDEOS.filter((v) => v.category === cat.slug);
        if (list.length === 0) return null;
        return (
          <section key={cat.slug} aria-labelledby={`cat-${cat.slug}`} className="mb-10">
            <h2 id={`cat-${cat.slug}`} className="mb-4 text-xl font-bold text-slate-100">
              {cat.label}
            </h2>
            <p className="mb-4 text-sm text-slate-400">{cat.description}</p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {list.map((v) => (
                <Link
                  key={v.slug}
                  href={`/help/videos/${v.slug}`}
                  className="group rounded-2xl border border-slate-800 bg-slate-900/30 p-4 transition hover:border-violet-700 hover:bg-slate-900/60"
                >
                  <div className="mb-3 flex aspect-video items-center justify-center rounded-lg bg-slate-950 text-4xl text-slate-600 group-hover:bg-slate-900">
                    🎬
                  </div>
                  <h3 className="font-semibold text-slate-100 group-hover:text-violet-200 line-clamp-2">
                    {v.title}
                  </h3>
                  <p className="mt-1 text-sm text-slate-400 line-clamp-2">{v.description}</p>
                  <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                    <span className="font-mono">{formatDuration(v.durationSeconds)}</span>
                    <span>{v.views.toLocaleString('pt-BR')} views</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
