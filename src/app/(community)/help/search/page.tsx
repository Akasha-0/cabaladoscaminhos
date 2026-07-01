// ============================================================================
// /help/search — Help search server page (Wave 36)
// ============================================================================
// Server component: chama searchAllHelp() e renderiza resultados.
// Filtros client-side via URL (q, type, category).
// ============================================================================

import type { Metadata } from 'next';
import { searchAllHelp, type HelpResultType } from '@/lib/help/search-data';
import { SearchResults } from './SearchResults';

interface Props {
  searchParams: Promise<{
    q?: string;
    type?: HelpResultType;
    category?: string;
  }>;
}

export const metadata: Metadata = {
  title: 'Busca · Ajuda',
  description: 'Busca unificada na base de conhecimento da Cabala dos Caminhos.',
  alternates: { canonical: '/help/search' },
};

export const dynamic = 'force-dynamic';   // search is dynamic by nature

export default async function HelpSearchPage({ searchParams }: Props) {
  const sp = await searchParams;
  const q = (sp.q ?? '').trim();
  const type = sp.type;
  const category = sp.category;

  if (!q) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="mb-4 text-3xl font-bold text-slate-50">🔍 Busca na Ajuda</h1>
        <p className="text-slate-300">
          Digite uma pergunta na caixa acima. Procuramos em{' '}
          <strong>FAQ</strong>, <strong>Knowledge Base</strong>, <strong>Wiki da comunidade</strong> e{' '}
          <strong>Vídeos tutoriais</strong>.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <a href="/help/faq" className="rounded-lg border border-slate-800 bg-slate-900/40 p-3 hover:border-violet-700">
            <div className="font-semibold text-slate-100">📚 FAQ (80+ artigos)</div>
            <div className="text-xs text-slate-400">Respostas curtas e diretas</div>
          </a>
          <a href="/help/kb" className="rounded-lg border border-slate-800 bg-slate-900/40 p-3 hover:border-violet-700">
            <div className="font-semibold text-slate-100">📖 Knowledge Base (50+ artigos)</div>
            <div className="text-xs text-slate-400">Conteúdo aprofundado</div>
          </a>
          <a href="/wiki" className="rounded-lg border border-slate-800 bg-slate-900/40 p-3 hover:border-violet-700">
            <div className="font-semibold text-slate-100">📜 Wiki da comunidade</div>
            <div className="text-xs text-slate-400">Artigos curados pelos usuários</div>
          </a>
          <a href="/help/videos" className="rounded-lg border border-slate-800 bg-slate-900/40 p-3 hover:border-violet-700">
            <div className="font-semibold text-slate-100">🎬 Vídeos (5 tutoriais)</div>
            <div className="text-xs text-slate-400">Tour guiado e demonstrações</div>
          </a>
        </div>
      </div>
    );
  }

  const results = searchAllHelp(q, { type, category });

  return <SearchResults query={q} results={results} activeType={type} activeCategory={category} />;
}
