// ============================================================================
// (admin) layout — Shell do painel admin (Wave 20)
// ============================================================================
// Protege todas as rotas filhas. Se o user não for admin, redireciona para /.
//
// Filosofia:
//   - Fail closed em produção (redirect)
//   - Fail open em dev com banner amarelo (sandbox permite iterar)
//   - AdminNav é renderizado por página para que cada uma possa passar
//     seu próprio active state.
// ============================================================================

import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/admin/session';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdmin();
  if (!session.ok) {
    if (process.env.NODE_ENV === 'production') {
      redirect('/');
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {!session.ok && (
        <div className="border-b border-amber-500/30 bg-amber-500/10 px-4 py-2 text-xs text-amber-200">
          ⚠️ Acesso negado em produção: {session.reason}. (DEV: exibindo com banner.)
        </div>
      )}
      <div className="mx-auto max-w-7xl md:px-4 md:py-6">
        {/* W24 a11y: id="main-content" permite o SkipToContent (WCAG 2.4.1)
            focar este main via teclado. id legado "admin-main" removido. */}
        <main
          id="main-content"
          tabIndex={-1}
          className="w-full flex-1 px-4 py-4 pb-20 md:pb-4 focus:outline-none"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
