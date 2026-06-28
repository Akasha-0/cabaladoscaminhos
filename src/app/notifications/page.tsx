'use client';

// ============================================================================
// AKASHA PORTAL — Notifications Page (Wave 17)
// ============================================================================
// Empty state via <EmptyScreen variant="notifications" />.
// Real notifications list (when present) lives in the notifications system;
// this page is the catch-all landing for /notifications.
// ============================================================================

import * as React from 'react';
import { Bell, BellRing } from 'lucide-react';

import { EmptyScreen } from '@/components/design-system/empty-illustrations';
import { ApiError } from '@/components/design-system/error-states';
import { NotificationItemSkeleton } from '@/components/design-system/skeleton';

type FetchState = 'loading' | 'empty' | 'error' | 'success';

const MOCK_NOTIFICATIONS = [
  {
    id: 'n1',
    title: 'João de Oxalá respondeu ao seu comentário',
    body: 'Sua reflexão sobre Ogum trouxe clareza para a minha jornada, obrigado por partilhar.',
    timeAgo: 'há 15 minutos',
  },
  {
    id: 'n2',
    title: 'Maria Helena iniciou um círculo de Cabala',
    body: 'O círculo "Os 4 Mundos" começa amanhã às 19h. Há 4 vagas restantes.',
    timeAgo: 'há 1 hora',
  },
  {
    id: 'n3',
    title: 'Novo artigo na biblioteca: Os 72 nomes de Deus',
    body: 'Adicionado por curadoria da IA. 12 min de leitura, evidência revisada.',
    timeAgo: 'ontem',
  },
];

export default function NotificationsPage() {
  const [state, setState] = React.useState<FetchState>('loading');

  React.useEffect(() => {
    const t = setTimeout(
      () => setState(MOCK_NOTIFICATIONS.length === 0 ? 'empty' : 'success'),
      600
    );
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-slate-800/50 bg-slate-950/40 backdrop-blur-md">
        <div className="mx-auto max-w-2xl px-4 py-6">
          <div className="mb-2 flex items-center gap-2">
            <Bell className="h-4 w-4 text-amber-400" />
            <span className="text-caps text-tiny text-amber-300">Atividade</span>
          </div>
          <h1 className="mb-1">Notificações</h1>
          <p className="text-body text-slate-400">
            Movimentos da sua jornada, círculos e respostas da comunidade.
          </p>

          {/* State demo controls — remove in production */}
          <div className="mt-3 flex flex-wrap gap-1.5 text-xs">
            {(['loading', 'empty', 'success', 'error'] as FetchState[]).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setState(s)}
                className="rounded-md border border-slate-700 px-2 py-0.5 text-slate-400 hover:bg-slate-800/60"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8">
        {state === 'loading' && (
          <div className="space-y-3">
            <NotificationItemSkeleton />
            <NotificationItemSkeleton />
            <NotificationItemSkeleton />
          </div>
        )}

        {state === 'empty' && (
          <EmptyScreen
            variant="notifications"
            title="Sem notificações"
            description="Você está em paz. Quando alguém interagir com você, círculos abrirem ou artigos forem publicados nas tradições que você segue, avisamos aqui."
            primaryLabel="Configurar preferências"
            primaryHref="/settings/notifications"
            secondaryLabel="Ir para o feed"
            secondaryHref="/feed"
          />
        )}

        {state === 'success' && (
          <div className="space-y-3">
            {MOCK_NOTIFICATIONS.map((n) => (
              <article
                key={n.id}
                className="flex items-start gap-3 rounded-xl border border-slate-800/50 bg-slate-900/30 p-4 transition-colors hover:bg-slate-900/50"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-amber-300">
                  <BellRing className="h-4 w-4" aria-hidden />
                </div>
                <div className="flex-1 space-y-1">
                  <h3 className="text-sm font-medium text-slate-100">{n.title}</h3>
                  <p className="text-xs leading-relaxed text-slate-400">{n.body}</p>
                  <p className="text-tiny text-slate-500">{n.timeAgo}</p>
                </div>
              </article>
            ))}
          </div>
        )}

        {state === 'error' && (
          <ApiError
            title="Não conseguimos carregar suas notificações"
            description="Houve uma dissonância ao buscar suas atualizações."
            onRetry={() => setState('loading')}
          />
        )}
      </main>
    </div>
  );
}
