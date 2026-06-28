// ============================================================================
// Admin Session Helper — gate /admin routes & API
// ============================================================================
// Wave 20 (2026-06-28) — Admin Dashboard + User Management + Moderation.
//
// Filosofia:
//   - Admin = papel em memória desta sessão; controlado por `ADMIN_EMAILS`
//     (env, lista separada por vírgula) OU campo `planoAssinatura="ADMIN"`
//     no User (escape hatch operacional).
//   - Fail closed: erro 500 se ADMIN_EMAILS não estiver definido (evita
//     abrir o dashboard em produção por engano).
//   - Retorna shape discriminado: { ok: true, user } | { ok: false, reason }.
//
// Refs: Wave 11 Audit Log, Wave 14 Moderation, GTM Readiness Wave 20.
// ============================================================================

import 'server-only';
import { createClient } from '@/lib/supabase-server';
import { prisma } from '@/lib/prisma';

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

export type AdminSessionResult =
  | { ok: true; userId: string; email: string }
  | { ok: false; reason: 'no_session' | 'not_admin' | 'config_error' };

// ---------------------------------------------------------------------------
// Constantes
// ---------------------------------------------------------------------------

/**
 * Lista de e-mails com acesso admin. Configurável por env var.
 * Fallback seguro: se não definida, nenhum e-mail é admin (fail closed).
 *
 * Exemplo de .env:
 *   ADMIN_EMAILS="eu@meudominio.com,cofundador@meudominio.com"
 */
function getAdminEmails(): string[] {
  const raw = process.env.ADMIN_EMAILS;
  if (!raw) return [];
  return raw
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

// ---------------------------------------------------------------------------
// API pública
// ---------------------------------------------------------------------------

/**
 * Resolver a sessão admin a partir do request atual.
 *
 * Uso:
 *   const session = await requireAdmin();
 *   if (!session.ok) return NextResponse.json({ error: ... }, { status: 403 });
 */
export async function requireAdmin(): Promise<AdminSessionResult> {
  const adminEmails = getAdminEmails();
  if (adminEmails.length === 0 && process.env.NODE_ENV === 'production') {
    return { ok: false, reason: 'config_error' };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    return { ok: false, reason: 'no_session' };
  }

  const email = (data.user.email ?? '').toLowerCase();
  if (!email) return { ok: false, reason: 'no_session' };

  // Caminho 1: ADMIN_EMAILS env var
  if (adminEmails.includes(email)) {
    return { ok: true, userId: data.user.id, email };
  }

  // Caminho 2: User.planoAssinatura === 'ADMIN' no DB (escape hatch)
  // Fazemos fallback aqui para casos em que ADMIN_EMAILS ainda não foi
  // propagado mas alguém já virou admin operacionalmente.
  try {
    const dbUser = await prisma.user.findUnique({
      where: { id: data.user.id },
      select: { planoAssinatura: true, email: true },
    });
    if (dbUser?.planoAssinatura === 'ADMIN') {
      return { ok: true, userId: data.user.id, email };
    }
  } catch {
    // DB indisponível; cai para not_admin (não podemos garantir)
  }

  return { ok: false, reason: 'not_admin' };
}

/**
 * Versão que lança erro (apenas para uso em page.tsx com redirect).
 * Import dinâmico para evitar ciclos.
 */
export async function requireAdminOrThrow(): Promise<{ userId: string; email: string }> {
  const result = await requireAdmin();
  if (!result.ok) {
    const err = new Error(`Admin access denied: ${result.reason}`);
    (err as Error & { code?: string }).code = result.reason;
    throw err;
  }
  return { userId: result.userId, email: result.email };
}

// ============================================================================
// Wave 25 — Comments Moderation: requireModerator()
// ============================================================================
// Aceita tanto ADMIN quanto MODERADOR. ADMIN ⊃ MODERADOR (todo admin pode
// moderar). Resolve a sessão Supabase uma vez e checa os dois caminhos.
//
// Política:
//   - ADMIN  → ADMIN_EMAILS env OR planoAssinatura='ADMIN'
//   - MODER  → User.isModerator = true (operacional, definido manualmente)
//
// Retorna o mesmo shape discriminado que requireAdmin. Use em endpoints
// públicos-de-interno (queue + action de moderação).
// ============================================================================

export interface ModeratorSessionResult {
  ok: boolean;
  reason?: 'no_session' | 'not_admin' | 'not_moderator' | 'config_error';
  userId?: string;
  email?: string;
  /** Tag do papel efetivo: ADMIN sempre pode, MODERATOR se isModerator=true. */
  role?: 'ADMIN' | 'MODERATOR';
}

export async function requireModerator(): Promise<ModeratorSessionResult> {
  // Caminho 1: ADMIN (reusa requireAdmin; se ok, é admin ⊃ moderator)
  const adminResult = await requireAdmin();
  if (adminResult.ok) {
    return {
      ok: true,
      userId: adminResult.userId,
      email: adminResult.email,
      role: 'ADMIN',
    };
  }

  // ADMIN falhou por config_error em prod é fatal — não tenta fallback
  if (adminResult.reason === 'config_error') {
    return { ok: false, reason: 'config_error' };
  }

  // Caminho 2: MODERADOR site-wide (User.isModerator = true)
  // Recria o client Supabase (requireAdmin acima já consumiu; refazer é barato)
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getUser();

    if (error || !data?.user) {
      return { ok: false, reason: 'no_session' };
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: data.user.id },
      select: { isModerator: true, email: true },
    });

    if (!dbUser?.isModerator) {
      return { ok: false, reason: 'not_moderator' };
    }

    return {
      ok: true,
      userId: data.user.id,
      email: (dbUser.email ?? data.user.email ?? '').toLowerCase(),
      role: 'MODERATOR',
    };
  } catch {
    return { ok: false, reason: 'not_moderator' };
  }
}

