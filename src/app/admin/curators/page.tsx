// ============================================================================
// /admin/curators — Dashboard de curadores convidados (Wave 35)
// ============================================================================// Server Component — fetch inicial via service layer (sem expor PII).
//
// Exibe:
//   - Convites pendentes (PENDING) com copy para revogar manualmente
//   - Curadores ativos com stats 30d (artigos aprovados, posts moderados, NPS)
//   - Curadores inativos (soft-deleted) com motivo
//   - Formulário mínimo para abrir nova invite (form server action
//     chama /api/admin/curators/invite via client-side)
//
// Restrição de acesso: route protegida via requireAdmin() no service.
// ============================================================================

import type { Metadata } from 'next';
import { AdminNav } from '@/components/admin/AdminNav';
import { listCurators, listPendingInvitations } from '@/lib/curators/service';

export const metadata: Metadata = {
  title: 'Admin · Curadores',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function AdminCuratorsPage() {
  const [curators, invitations] = await Promise.all([
    listCurators({ active: true }),
    listPendingInvitations(),
  ]);

  // Buscar inativos separadamente para exibir histórico
  const inactive = await listCurators({ active: false }).catch(() => []);

  const allTraditions = Array.from(
    new Set([...curators.map((c) => c.tradition), ...invitations.map((i) => i.tradition)])
  ).sort();

  return (
    <>
      <AdminNav active="/admin/curators" />

      <header className="mb-4 flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Curadores convidados</h1>
          <p className="text-sm text-slate-400">
            {curators.length} ativos · {invitations.filter((i) => i.status === 'PENDING').length} convites pendentes ·{' '}
            {inactive.length} desativados
          </p>
        </div>
      </header>

      <section className="mb-8">
        <h2 className="text-lg font-semibold text-slate-200 mb-3">Convites pendentes</h2>
        {invitations.length === 0 ? (
          <p className="text-sm text-slate-500">Nenhum convite emitido ainda.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-slate-800">
            <table className="w-full text-sm">
              <thead className="bg-slate-900 text-slate-400 text-left">
                <tr>
                  <th className="px-3 py-2">Convidado</th>
                  <th className="px-3 py-2">Tradição</th>
                  <th className="px-3 py-2">Papel</th>
                  <th className="px-3 py-2">Convidado por</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Expira</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {invitations.map((inv) => (
                  <tr key={inv.id} className="text-slate-200">
                    <td className="px-3 py-2">
                      <div className="font-medium">{inv.displayName}</div>
                      <div className="text-xs text-slate-500">{inv.email}</div>
                    </td>
                    <td className="px-3 py-2">{inv.traditionLabel}</td>
                    <td className="px-3 py-2 text-slate-300">{inv.curatorRole}</td>
                    <td className="px-3 py-2 text-slate-300">{inv.invitedByName}</td>
                    <td className="px-3 py-2">
                      <span
                        className={
                          'inline-block rounded px-2 py-0.5 text-xs ' +
                          (inv.status === 'PENDING'
                            ? 'bg-amber-900/40 text-amber-200'
                            : inv.status === 'ACCEPTED'
                            ? 'bg-emerald-900/40 text-emerald-200'
                            : 'bg-slate-800 text-slate-300')
                        }
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-slate-400">
                      {inv.expiresAt.toLocaleDateString('pt-BR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold text-slate-200 mb-3">Curadores ativos</h2>
        {curators.length === 0 ? (
          <p className="text-sm text-slate-500">Nenhum curador ativo. Use o formulário abaixo para convidar.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-slate-800">
            <table className="w-full text-sm">
              <thead className="bg-slate-900 text-slate-400 text-left">
                <tr>
                  <th className="px-3 py-2">Nome</th>
                  <th className="px-3 py-2">Tradição</th>
                  <th className="px-3 py-2">Papel</th>
                  <th className="px-3 py-2">Aprovado por</th>
                  <th className="px-3 py-2 text-right">Artigos 30d</th>
                  <th className="px-3 py-2 text-right">Moderações 30d</th>
                  <th className="px-3 py-2 text-right">NPS 30d</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {curators.map((c) => (
                  <tr key={c.id} className="text-slate-200">
                    <td className="px-3 py-2">
                      <div className="font-medium">{c.displayName}</div>
                      <div className="text-xs text-slate-500">{c.email}</div>
                    </td>
                    <td className="px-3 py-2">{c.traditionLabel}</td>
                    <td className="px-3 py-2 text-slate-300">{c.curatorRole}</td>
                    <td className="px-3 py-2 text-slate-300">{c.approvedByName ?? '—'}</td>
                    <td className="px-3 py-2 text-right text-emerald-300">{c.stats.articlesApproved}</td>
                    <td className="px-3 py-2 text-right text-amber-300">{c.stats.postsModerated}</td>
                    <td className="px-3 py-2 text-right text-violet-300">{c.stats.npsReceived}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {inactive.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-slate-200 mb-3">Desativados (histórico)</h2>
          <div className="overflow-x-auto rounded-lg border border-slate-800">
            <table className="w-full text-sm">
              <thead className="bg-slate-900 text-slate-500 text-left">
                <tr>
                  <th className="px-3 py-2">Nome</th>
                  <th className="px-3 py-2">Tradição</th>
                  <th className="px-3 py-2">Motivo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {inactive.map((c) => (
                  <tr key={c.id} className="text-slate-400">
                    <td className="px-3 py-2">{c.displayName}</td>
                    <td className="px-3 py-2">{c.traditionLabel}</td>
                    <td className="px-3 py-2 italic">{c.approvedBy ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className="mb-8">
        <h2 className="text-lg font-semibold text-slate-200 mb-3">Novo convite</h2>
        <p className="text-sm text-slate-400 mb-4">
          Para convidar um novo curador, use o endpoint{' '}
          <code className="bg-slate-800 px-1.5 py-0.5 rounded">POST /api/admin/curators/invite</code>.
          Tradições cobertas atualmente: {allTraditions.length === 0 ? 'nenhuma' : allTraditions.join(', ')}.
        </p>
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 text-xs text-slate-400 font-mono whitespace-pre">
{`POST /api/admin/curators/invite
Authorization: Admin/Iyá session cookie
Content-Type: application/json

{
  "email": "curador@exemplo.com",
  "displayName": "Mestra Fátima",
  "tradition": "ifa",
  "curatorRole": "CURATOR_IFA",
  "personalMessage": "Vimos sua liderança na comunidade Axé Opô Afonjá e queremos honrar sua contribuição na Biblioteca Akasha."
}`}
        </div>
        <p className="text-xs text-slate-500 mt-2">
          O convite expira em 14 dias; o curador recebe e-mail com link HMAC aceito uma única vez.
          LGPD Art. 7º, I — aceite registra consent explícito no audit log.
        </p>
      </section>
    </>
  );
}
