// ============================================================================
// W91s — /settings/notifications (Server Component)
// ============================================================================
// Página dedicada de preferências. Sub-rota de /settings pra manter cada
// superfície responsável por uma única tarefa:
//
//   * /settings/profile            → perfil público
//   * /settings/account            → conta & segurança
//   * /settings/privacy            → privacidade & LGPD
//   * /settings/notifications      → AQUI — canais, quiet hours, tipos
//   * /settings/traditions         → tradições acompanhadas
//
// Esta página é SERVER COMPONENT: lê estado inicial diretamente do
// NotificationPreference do DB (mesma fonte que /api/notifications/preferences
// retorna) e delega toda a interação ao <NotificationsPrefsForm /> client-side.
//
// Fluxo de save:
//   1) user clica "Salvar preferências" → form chama onPersist (PATCH bulk)
//   2) PATCH /api/notifications/preferences com lista de tipos+canais
//   3) resposta ok → router.refresh() (re-renderiza o Server Component)
//   4) estado novo entra via `saved` prop no form
//
// LGPD:
//   * 401 quando sem auth → mostra mensagem + CTA login
//   * Defaults (engine `preferences.ts`) preservam privacidade do usuário
//     (push=opt-in)
//   * SGPD (não LGPD?) + ANPD alignment — copy clara, sem dark patterns
// ============================================================================

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { getViewer } from '@/lib/community/auth';
import { resolvePreferences } from '@/lib/notifications/preferences';
import type { NotificationPreferenceDto } from '@/lib/notifications';
import type {
  NotificationType,
  ResolvedPreferences,
  QuietHoursWindow,
  NotificationTradicao,
} from '@/lib/w91s/notifications-prefs-engine';
import { NotificationsPrefsForm } from '@/components/community/settings/NotificationsPrefsForm';

export const dynamic = 'force-dynamic';
export const metadata = {
  title: 'Preferências de notificações | Cabala dos Caminhos',
  description:
    'Escolha como receber avisos da comunidade — no app, por e-mail ou push — com janela de silêncio e tipos preferidos por tradição.',
  robots: { index: false, follow: false },
};

// ============================================================================
// Data load
// ============================================================================

interface PageData {
  readonly initial: ResolvedPreferences;
  readonly saved: NotificationPreferenceDto[];
  readonly tradicao: NotificationTradicao;
  readonly quietHours: QuietHoursWindow;
}

async function loadInitial(): Promise<PageData | null> {
  const viewer = await getViewer();
  if (!viewer) return null;

  // Lê preferências cruas do DB (sem defaults aplicados).
  const rows = await prisma.notificationPreference.findMany({
    where: { userId: viewer.id },
    select: {
      type: true,
      inApp: true,
      email: true,
      push: true,
      weeklyDigest: true,
    },
  });

  const initial = resolvePreferences(rows);

  // Salva-shape DTO para o form reconciliar.
  const saved: NotificationPreferenceDto[] = (
    Object.keys(initial) as NotificationType[]
  ).map((type) => ({
    type,
    inApp: initial[type].inApp,
    email: initial[type].email,
    push: initial[type].push,
    weeklyDigest: initial[type].weeklyDigest,
  }));

  // Perfil do usuário → tradição ativa + quiet hours.
  const profile = await prisma.user.findUnique({
    where: { id: viewer.id },
    select: {
      tradicoes: { select: { tradicao: true } },
      preferences: true,
    },
  });

  const tradicaoList: NotificationTradicao[] = (profile?.tradicoes ?? []).map((t: { tradicao: NotificationTradicao }) => t.tradicao);
  // Tradição dominante = primeira ordem canônica que aparece no perfil.
  const ORDEM: NotificationTradicao[] = [
    'cigano',
    'ifa',
    'cabala',
    'candomble',
    'umbanda',
    'astrologia',
  ];
  const tradicao: NotificationTradicao =
    ORDEM.find((t: NotificationTradicao) => tradicaoList.includes(t)) ?? 'cigano';

  // Quiet hours a partir de preferences JSON (schema livre).
  const quietHours = parseQuietHours(profile?.preferences) ?? {
    startMinutes: 22 * 60,
    endMinutes: 8 * 60,
    tz: 'America/Sao_Paulo',
  };

  return Object.freeze({
    initial,
    saved,
    tradicao,
    quietHours,
  });
}

function parseQuietHours(
  prefs: unknown
): QuietHoursWindow | null {
  if (!prefs || typeof prefs !== 'object') return null;
  const qh = (prefs as Record<string, unknown>).quietHours;
  if (!qh || typeof qh !== 'object') return null;
  const obj = qh as Record<string, unknown>;
  const start = Number(obj.startMinutes);
  const end = Number(obj.endMinutes);
  if (!Number.isFinite(start) || !Number.isFinite(end)) return null;
  return Object.freeze({
    startMinutes: Math.min(1439, Math.max(0, Math.floor(start))),
    endMinutes: Math.min(1439, Math.max(0, Math.floor(end))),
    tz: typeof obj.tz === 'string' ? obj.tz : 'America/Sao_Paulo',
  });
}

// ============================================================================
// Page (Server Component)
// ============================================================================

export default async function NotificationsSettingsPage() {
  let data: PageData | null = null;
  try {
    data = await loadInitial();
  } catch (err) {
    // Log silencioso: a UI vai mostrar fallback.
    console.error(
      '[settings/notifications] failed to load initial:',
      err
    );
  }
  if (!data) {
    notFound();
  }

  const persist = async (payload: {
    readonly prefs: ResolvedPreferences;
    readonly quietHours: QuietHoursWindow;
  }): Promise<{ ok: boolean; error?: string }> => {
    'use server';
    try {
      const viewer = await getViewer();
      if (!viewer) {
        return { ok: false, error: 'Não autenticado' };
      }
      const bulk = Object.keys(payload.prefs).map((type) => {
        const r = payload.prefs[type as NotificationType];
        return {
          type: type as NotificationType,
          inApp: r.inApp,
          email: r.email,
          push: r.push,
          weeklyDigest: r.weeklyDigest,
        };
      });

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/api/notifications/preferences`,
        {
          method: 'PATCH',
          headers: {
            'content-type': 'application/json',
            'x-dev-user-id': viewer.id,
          },
          body: JSON.stringify({ bulk }),
        }
      );
      if (!res.ok) {
        const text = await res.text();
        return { ok: false, error: `Falha ao salvar (${res.status}): ${text || 'erro'}` };
      }
      return { ok: true };
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'save-failed';
      return { ok: false, error: msg };
    }
  };

  return (
    <main
      className="min-h-screen bg-background text-foreground"
      data-testid="notifications-settings-page"
    >
      <header className="border-b border-border/40 bg-background/40">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-2 text-sm">
          <Link href="/settings" className="text-muted-foreground hover:text-foreground">
            Configurações
          </Link>
          <ChevronRight className="w-3 h-3 text-muted-foreground" aria-hidden="true" />
          <span className="font-medium">Notificações</span>
        </div>
      </header>
      <NotificationsPrefsForm
        initial={data.initial}
        saved={data.saved}
        tradicao={data.tradicao}
        quietHours={data.quietHours}
        onPersist={persist}
        redirectTo="/settings"
      />
    </main>
  );
}
