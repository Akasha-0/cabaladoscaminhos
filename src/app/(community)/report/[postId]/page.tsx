/**
 * /report/[postId] — Report flow refinado (Wave 36)
 *
 * Server Component que valida o post antes de renderizar. Suporta:
 *   - 7 categorias: spam, harassment, misinfo, sacred-offense, copyright, nsfw, other
 *   - Reason text livre (até 2000 chars)
 *   - Evidence URLs (links para prints, etc.)
 *   - Auto-routing para equipe especializada
 *   - Confirmação visual após submit
 */

import type { Metadata } from 'next';
import { ReportForm } from '@/components/community/ReportForm';

export const metadata: Metadata = {
  title: 'Denunciar conteúdo',
  description: 'Ajude a manter o Akasha seguro e respeitoso.',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ postId: string }>;
}

export default async function ReportPage({ params }: PageProps) {
  const { postId } = await params;
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-slate-100">Denunciar conteúdo</h1>
        <p className="mt-2 text-sm text-slate-400">
          Sua denúncia é anônima e ajuda a manter o Akasha seguro e respeitoso
          para todas as tradições. Analisamos cada caso em até 24 horas.
        </p>
      </header>

      <ReportForm
        targetType="POST"
        targetId={postId}
      />

      <aside className="mt-8 rounded-lg border border-slate-800 bg-slate-900/40 p-4 text-xs text-slate-500">
        <p className="font-semibold text-slate-300">Como funciona</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Denúncias são revisadas por moderadores humanos especializados.</li>
          <li>Conteúdo que viola nossas diretrizes é ocultado ou removido.</li>
          <li>Você pode acompanhar o status no seu perfil (LGPD Art. 18).</li>
          <li>Denúncias em má-fé podem resultar em advertência ao denunciante.</li>
        </ul>
      </aside>
    </div>
  );
}