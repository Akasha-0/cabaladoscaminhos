// ============================================================================
// MODERATION PAGE — W90-D
// ============================================================================
// Server Component que carrega a fila de fixtures e renderiza o cliente.
//
// Comportamento:
//   - Lê userId e isModerator via cookies (server-side)
//   - Default demo: isModerator=true se cookie ausente
//   - Carrega FIXTURE_QUEUE e serializa para props do client component
//   - 403-style page se não-moderador (mensagem respeitosa, sem "banir")
//
// LGPD: nenhum dado pessoal é exposto na URL. userId é apenas identificador
// de moderação.
// ============================================================================

import { cookies } from 'next/headers';
import { Shield, AlertTriangle } from 'lucide-react';
import { ModerationQueueList } from '@/components/community/ModerationQueueList';
import { FIXTURE_QUEUE } from '@/lib/w90/__fixtures__/moderation-fixtures';
import { asUserId } from '@/lib/w90/comments-moderation';

// ----------------------------------------------------------------------------
// Page meta
// ----------------------------------------------------------------------------

export const metadata = {
  title: 'Moderação · Cabala dos Caminhos',
  description:
    'Fila de moderação da comunidade — revisão respeitosa de comentários sinalizados.',
  robots: { index: false, follow: false },
};

// ----------------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------------

function readCookies(): { userId: string; isModerator: boolean } {
  // Fallback seguro se cookies() falhar (default = demo moderator)
  try {
    const store = cookies();
    const userId = store.get('userId')?.value ?? 'mod-demo';
    const isModeratorRaw = store.get('isModerator')?.value;
    const isModerator =
      isModeratorRaw === undefined ? true : isModeratorRaw === 'true';
    return { userId, isModerator };
  } catch {
    return { userId: 'mod-demo', isModerator: true };
  }
}

// ----------------------------------------------------------------------------
// Page
// ----------------------------------------------------------------------------

export default function ModerationPage() {
  const { userId, isModerator } = readCookies();

  if (!isModerator) {
    return (
      <main
        data-testid="moderation-page-denied"
        className="mx-auto flex min-h-screen max-w-full flex-col items-center justify-center gap-4 px-4 py-12 md:max-w-2xl"
      >
        <AlertTriangle
          className="h-12 w-12 text-amber-500"
          aria-hidden="true"
        />
        <h1 className="text-xl font-semibold text-slate-800">
          Acesso restrito a moderadores
        </h1>
        <p className="max-w-md text-center text-sm text-slate-600">
          Esta página é exclusiva para a equipe de moderação. Se você precisa
          reportar um conteúdo, use o botão de denúncia em cada comentário.
        </p>
        <a
          href="/community"
          className="text-sm font-medium text-slate-700 underline hover:text-slate-900"
        >
          Voltar para a comunidade
        </a>
      </main>
    );
  }

  const moderatorId = asUserId(userId);

  return (
    <main
      data-testid="moderation-page"
      role="main"
      aria-label="Página de moderação"
      className="mx-auto max-w-full px-4 py-6 md:max-w-4xl"
    >
      {/* Header */}
      <header className="mb-6 border-b border-slate-200 pb-4">
        <div className="mb-2 flex items-center gap-2">
          <Shield className="h-6 w-6 text-slate-700" aria-hidden="true" />
          <h1 className="text-2xl font-semibold text-slate-900">
            Moderação da comunidade
          </h1>
        </div>
        <p className="text-sm text-slate-600">
          Ações aqui são <strong>orientações</strong>, não punições. Nosso tom
          é acolhedor e respeitoso. Caso tenha dúvida, escale para outro
          moderador.
        </p>
        <p className="mt-2 text-xs text-slate-500">
          Logado como: <code className="rounded bg-slate-100 px-1">{userId}</code>
        </p>
      </header>

      {/* Queue list (client component) */}
      <ModerationQueueList
        items={FIXTURE_QUEUE}
        currentModeratorId={moderatorId}
        onAction={(id, action, note) => {
          // Stub de action handler — em produção, chamaria uma API
          // Aqui apenas logamos no servidor (dev mode).
          if (typeof window === 'undefined') {
            // eslint-disable-next-line no-console
            console.log(`[moderation] ${action} ${id} note=${note.length}chars`);
          }
        }}
      />

      {/* Footer com disclaimer */}
      <footer className="mt-8 border-t border-slate-200 pt-4 text-xs text-slate-500">
        <p>
          <strong>Compromisso cultural:</strong> todas as 5 tradições
          (Cigano, Umbanda, Candomblé, Cabala, Tantra, Astrologia, Ifá) são
          moderadas com o mesmo critério. Nenhuma identidade religiosa é
          alvo de regras de moderação.
        </p>
      </footer>
    </main>
  );
}