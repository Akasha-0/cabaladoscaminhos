// ============================================================================
// /help/faq — Página principal de FAQ (Wave 36)
// ============================================================================
// Server component: renderiza as 80+ FAQs categorizadas com search client-side,
// voting e trending. LGPD: nenhuma PII exposta aqui.
//
// Funcionalidades:
//  - Lista por categoria (12 categorias)
//  - Search semântico (case-insensitive, multi-campo)
//  - Filter por tradição
//  - Voting helpful/not (POST /api/help/feedback)
//  - Trending sidebar
//  - PT-BR primário, EN em <details>
// ============================================================================

import { Metadata } from 'next';
import {
  FAQ_ENTRIES,
  FAQ_CATEGORIES,
  type FaqCategory,
} from '@/lib/help/faq-data';
import { FaqSearch } from './FaqSearch';
import { TrendingSidebar } from './TrendingSidebar';

export const metadata: Metadata = {
  title: 'FAQ · Cabala dos Caminhos',
  description:
    'Respostas para as 80+ perguntas mais frequentes sobre o Akasha Portal: tradições, Akasha IA, marketplace, LGPD, segurança e beta.',
  alternates: { canonical: '/help/faq' },
  openGraph: {
    title: 'FAQ · Cabala dos Caminhos',
    description: '80+ respostas às dúvidas mais comuns — PT-BR primário.',
    type: 'website',
  },
};

export const revalidate = 300; // 5min — FAQ data não muda em segundos

export default function FaqPage() {
  const total = FAQ_ENTRIES.length;
  const trendingCount = FAQ_ENTRIES.filter((e) => e.trending).length;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 lg:px-8">
      {/* Header */}
      <header className="mb-8 text-center sm:text-left">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-violet-900/30 px-3 py-1 text-xs font-medium text-violet-200 ring-1 ring-violet-700/50">
          <span aria-hidden>📚</span>
          <span>Base de conhecimento · {total} artigos</span>
        </div>
        <h1 className="mb-3 text-3xl font-bold text-slate-50 sm:text-4xl">
          Perguntas Frequentes
        </h1>
        <p className="max-w-2xl text-base text-slate-300 sm:text-lg">
          Respostas para as dúvidas mais comuns da comunidade. PT-BR é o idioma
          primário; clique em <span aria-hidden>🇬🇧</span> English para ver a versão em
          inglês quando disponível.
        </p>
      </header>

      {/* Categorias rápidas */}
      <nav className="mb-8 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4" aria-label="Categorias">
        {FAQ_CATEGORIES.map((cat) => (
          <a
            key={cat.slug}
            href={`#cat-${cat.slug}`}
            className="group rounded-lg border border-slate-800 bg-slate-900/40 p-3 transition hover:border-violet-700 hover:bg-slate-900/70 focus:outline-none focus:ring-2 focus:ring-violet-500"
          >
            <div className="text-sm font-semibold text-slate-100 group-hover:text-violet-200">
              {cat.label}
            </div>
            <div className="mt-1 text-xs text-slate-400 line-clamp-2">{cat.description}</div>
          </a>
        ))}
      </nav>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_280px]">
        {/* Main: search + sections */}
        <div className="min-w-0">
          <FaqSearch entries={FAQ_ENTRIES} categories={FAQ_CATEGORIES} />

          {/* Per-category sections */}
          {FAQ_CATEGORIES.map((cat) => {
            const catEntries = FAQ_ENTRIES.filter((e) => e.category === cat.slug);
            if (catEntries.length === 0) return null;
            return (
              <section
                key={cat.slug}
                id={`cat-${cat.slug}`}
                aria-labelledby={`cat-${cat.slug}-h`}
                className="mt-12 border-t border-slate-800 pt-8"
              >
                <header className="mb-6">
                  <h2
                    id={`cat-${cat.slug}-h`}
                    className="text-2xl font-bold text-slate-50"
                  >
                    {cat.label}
                  </h2>
                  <p className="mt-1 text-sm text-slate-400">{cat.description}</p>
                </header>

                <div className="space-y-3">
                  {catEntries.map((entry) => (
                    <details
                      key={entry.id}
                      className="group rounded-lg border border-slate-800 bg-slate-900/30 open:bg-slate-900/60"
                    >
                      <summary className="flex cursor-pointer list-none items-start gap-3 rounded-lg p-4 transition hover:bg-slate-800/40 [&::-webkit-details-marker]:hidden">
                        <span
                          aria-hidden
                          className="mt-1 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-900/40 text-violet-200 transition group-open:rotate-45"
                        >
                          +
                        </span>
                        <div className="flex-1">
                          <h3 className="text-base font-medium text-slate-100">
                            {entry.question}
                          </h3>
                          <div className="mt-1 flex flex-wrap gap-2 text-xs text-slate-400">
                            <span>👍 {entry.helpCount}</span>
                            <span aria-hidden>·</span>
                            <span>Atualizado {entry.updatedAt}</span>
                            {entry.trending && (
                              <span className="rounded-full bg-amber-900/30 px-2 py-0.5 text-amber-200 ring-1 ring-amber-700/50">
                                🔥 Trending
                              </span>
                            )}
                          </div>
                        </div>
                      </summary>

                      <div className="border-t border-slate-800 px-4 py-4">
                        <p className="text-sm leading-relaxed text-slate-200">
                          {entry.answer}
                        </p>

                        {entry.answerEn && (
                          <details className="mt-4 rounded-md border border-slate-700/50 bg-slate-950/60 p-3 text-xs">
                            <summary className="cursor-pointer text-slate-400">
                              🇬🇧 English version
                            </summary>
                            <p className="mt-2 leading-relaxed text-slate-300">
                              {entry.answerEn}
                            </p>
                          </details>
                        )}

                        {entry.relatedSlugs && entry.relatedSlugs.length > 0 && (
                          <div className="mt-4">
                            <span className="text-xs font-semibold text-slate-400">
                              Veja também:
                            </span>
                            <div className="mt-2 flex flex-wrap gap-2">
                              {entry.relatedSlugs.map((s) => (
                                <a
                                  key={s}
                                  href={`/help/kb/features/${s}`}
                                  className="rounded-full bg-slate-800 px-3 py-1 text-xs text-violet-200 hover:bg-slate-700"
                                >
                                  {s}
                                </a>
                              ))}
                            </div>
                          </div>
                        )}

                        {entry.relatedTradition && (
                          <div className="mt-3">
                            <span className="text-xs font-semibold text-slate-400">Tradição:</span>
                            <a
                              href={`/help/kb/traditions/${entry.relatedTradition}`}
                              className="ml-2 rounded-full bg-violet-900/40 px-3 py-1 text-xs text-violet-200 hover:bg-violet-900/60"
                            >
                              {entry.relatedTradition}
                            </a>
                          </div>
                        )}

                        {/* Voting widget (client-rendered via plain form) */}
                        <FaqVoting faqId={entry.id} />
                      </div>
                    </details>
                  ))}
                </div>
              </section>
            );
          })}

          {/* Footer CTA — não achou? */}
          <div className="mt-16 rounded-2xl border border-violet-700/40 bg-gradient-to-br from-violet-950/60 to-slate-900 p-8">
            <h2 className="text-2xl font-bold text-slate-50">Não achou sua dúvida?</h2>
            <p className="mt-2 text-slate-300">
              Estamos aqui pra ajudar. Manda sua pergunta por um desses canais:
            </p>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <a href="/help/search" className="text-violet-300 hover:text-violet-200">
                  🔍 Buscar em toda a base de conhecimento →
                </a>
              </li>
              <li>
                <a href="/feedback?category=FAQ" className="text-violet-300 hover:text-violet-200">
                  💬 Sugerir uma nova pergunta →
                </a>
              </li>
              <li>
                <a href="mailto:akasha@akashaportal.com.br" className="text-violet-300 hover:text-violet-200">
                  ✉️ Email akasha@akashaportal.com.br →
                </a>
              </li>
              <li>
                <a href="/akashic" className="text-violet-300 hover:text-violet-200">
                  ✨ Perguntar diretamente à Akasha IA →
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Sidebar: trending */}
        <aside className="hidden lg:block">
          <TrendingSidebar entries={FAQ_ENTRIES} trendingCount={trendingCount} total={total} />
        </aside>
      </div>
    </div>
  );
}

// ============================================================================
// Voting (simplified — production uses /api/help/feedback)
// ============================================================================

function FaqVoting({ faqId }: { faqId: string }) {
  return (
    <form
      action="/api/help/feedback"
      method="post"
      className="mt-4 flex items-center gap-2 border-t border-slate-800 pt-3 text-xs text-slate-400"
      data-faq-id={faqId}
    >
      <input type="hidden" name="faqId" value={faqId} />
      <input type="hidden" name="kind" value="faq_vote" />
      <span>Esta resposta foi útil?</span>
      <button
        type="submit"
        name="vote"
        value="helpful"
        className="rounded bg-emerald-900/30 px-2 py-1 text-emerald-200 ring-1 ring-emerald-700/40 hover:bg-emerald-900/50"
      >
        👍 Sim
      </button>
      <button
        type="submit"
        name="vote"
        value="not_helpful"
        className="rounded bg-rose-900/30 px-2 py-1 text-rose-200 ring-1 ring-rose-700/40 hover:bg-rose-900/50"
      >
        👎 Não
      </button>
      <a
        href={`/feedback?type=CONTENT&category=FAQ&id=${faqId}`}
        className="ml-auto text-violet-300 hover:text-violet-200"
      >
        Sugerir melhoria →
      </a>
    </form>
  );
}
