// ============================================================================
// /help/videos/[slug] — Página individual de vídeo tutorial (Wave 36)
// ============================================================================
// Renderiza vídeo + transcript + chapters + PDF download + related.
// ============================================================================

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { VIDEOS, getVideoBySlug, getRelatedVideos, formatDuration } from '@/lib/help/videos-data';

interface Props {
  params: Promise<{ slug: string }>;
}

export const revalidate = 600;

export async function generateStaticParams() {
  return VIDEOS.map((v) => ({ slug: v.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const v = getVideoBySlug(slug);
  if (!v) return { title: 'Vídeo não encontrado' };
  return {
    title: `${v.title} · Vídeos`,
    description: v.description,
    alternates: { canonical: `/help/videos/${v.slug}` },
  };
}

export default async function VideoPage({ params }: Props) {
  const { slug } = await params;
  const v = getVideoBySlug(slug);
  if (!v) notFound();
  const related = getRelatedVideos(v.slug);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 lg:px-8">
      <nav className="mb-6 text-sm text-slate-400" aria-label="breadcrumb">
        <ol className="flex items-center gap-2">
          <li><Link href="/help" className="hover:text-violet-300">Ajuda</Link></li>
          <li aria-hidden>/</li>
          <li><Link href="/help/videos" className="hover:text-violet-300">Vídeos</Link></li>
          <li aria-hidden>/</li>
          <li className="text-slate-200 line-clamp-1">{v.title}</li>
        </ol>
      </nav>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_280px]">
        <main>
          {/* Player area (placeholder) */}
          <div className="aspect-video w-full overflow-hidden rounded-2xl border border-slate-800 bg-slate-950">
            <div className="flex h-full w-full items-center justify-center text-slate-400">
              <div className="text-center">
                <div className="mb-3 text-5xl">🎬</div>
                <div className="text-sm">Player de vídeo — placeholder Wave 36</div>
                <div className="mt-1 text-xs text-slate-500">
                  {v.youtubeId ? `YouTube ID: ${v.youtubeId}` : 'Aguardando upload'}
                </div>
                <div className="mt-3 inline-block rounded-md bg-slate-900 px-3 py-1 text-xs">
                  {formatDuration(v.durationSeconds)}
                </div>
              </div>
            </div>
          </div>

          {/* Header meta */}
          <header className="mt-6">
            <h1 className="text-2xl font-bold text-slate-50 sm:text-3xl">{v.title}</h1>
            <p className="mt-2 text-base text-slate-300">{v.description}</p>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-400">
              <span className="rounded-full bg-violet-900/30 px-2 py-1 text-violet-200 ring-1 ring-violet-700/50">
                {v.category}
              </span>
              <span>{v.language}</span>
              <span aria-hidden>·</span>
              <span>{v.views.toLocaleString('pt-BR')} visualizações</span>
              <span aria-hidden>·</span>
              <span>Publicado {v.publishedAt}</span>
            </div>
          </header>

          {/* Chapters */}
          {v.chapters.length > 0 && (
            <section className="mt-8">
              <h2 className="mb-3 text-lg font-bold text-slate-100">📑 Capítulos</h2>
              <ol className="space-y-2 text-sm">
                {v.chapters.map((c, i) => (
                  <li key={i} className="flex items-center gap-3 rounded bg-slate-900/40 px-3 py-2">
                    <span className="font-mono text-xs text-violet-300">{formatDuration(c.timeSec)}</span>
                    <span className="text-slate-200">{c.label}</span>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {/* Transcript */}
          <section className="mt-8">
            <h2 className="mb-3 text-lg font-bold text-slate-100">📝 Transcrição completa</h2>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-5 text-sm leading-relaxed text-slate-200">
              {v.transcript.split('\n\n').map((para, i) => (
                <p key={i} className="mb-3 last:mb-0">{para}</p>
              ))}
            </div>
            <div className="mt-3 flex gap-3 text-xs">
              <a href={v.captionsPtBr} className="text-violet-300 hover:text-violet-200">
                📥 Legendas PT-BR (.vtt)
              </a>
              <a href={v.captionsEn} className="text-violet-300 hover:text-violet-200">
                📥 Captions EN (.vtt)
              </a>
              <a href={`/api/help/videos/${v.slug}/pdf`} className="ml-auto text-violet-300 hover:text-violet-200">
                📄 Baixar resumo em PDF
              </a>
            </div>
          </section>
        </main>

        {/* Sidebar */}
        <aside>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
            <h2 className="mb-3 text-sm font-bold text-slate-100">📄 Resumo em PDF</h2>
            <p className="text-sm text-slate-300">{v.pdfSummary}</p>
            <a
              href={`/api/help/videos/${v.slug}/pdf`}
              className="mt-3 block rounded-lg bg-violet-700 px-4 py-2 text-center text-sm font-medium text-white hover:bg-violet-600"
            >
              Baixar resumo (PDF)
            </a>
          </div>

          {/* Related */}
          {related.length > 0 && (
            <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
              <h2 className="mb-3 text-sm font-bold text-slate-100">🎬 Vídeos relacionados</h2>
              <ul className="space-y-3 text-sm">
                {related.map((r) => (
                  <li key={r.slug}>
                    <Link href={`/help/videos/${r.slug}`} className="block rounded p-2 hover:bg-slate-800/40">
                      <div className="font-medium text-slate-200 line-clamp-2">{r.title}</div>
                      <div className="mt-1 text-xs text-slate-500">{formatDuration(r.durationSeconds)}</div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
