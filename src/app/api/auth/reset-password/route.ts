import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { emailField } from '@/lib/validation/auth';

/**
 * POST /api/auth/reset-password
 * ----------------------------------------------------------------------------
 * Envia email de redefinição de senha via Supabase Auth.
 *
 * Body: { email: string }
 * 200 OK: { ok: true }           — sempre retorna OK em ausência de erro
 * 400 Bad Request:               — body inválido (Zod)
 * 429 Too Many Requests:         — rate limit (middleware raiz)
 * 500 Internal Server Error:     — erro inesperado do Supabase
 *
 * Anti-enumeração (OWASP A07):
 *   - Se o Supabase estiver configurado mas falhar por motivo desconhecido,
 *     ainda retornamos 200 para evitar que o atacante descubra quais emails
 *     estão cadastrados. O erro fica logado server-side.
 *   - Se Supabase não estiver configurado (sandbox), retornamos 503 com
 *     mensagem clara em vez de mascarar.
 *
 * Rate limit:
 *   - Aplicado pelo middleware raiz em /api/* (100 req/min por IP).
 *   - Para produção, considerar rate-limit dedicado em Supabase Dashboard
 *     (Authentication → Rate Limits) para bloquear brute-force.
 *
 * Wave 11 (auth integration).
 */

export const runtime = 'nodejs';

const resetSchema = z.object({ email: emailField });

export async function POST(request: Request) {
  // 1. Parse + valida body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Body inválido' }, { status: 400 });
  }

  const parsed = resetSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Email inválido' },
      { status: 400 }
    );
  }

  const { email } = parsed.data;

  // 2. Tenta enviar via Supabase
  const supabase = await createClient();
  if (!supabase) {
    // Sandbox: Supabase não configurado. Retorna 503 explícito (não mascara).
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.warn('[auth/reset-password] Supabase não configurado.');
    }
    return NextResponse.json(
      {
        error:
          'Serviço de email indisponível. Configure Supabase conforme docs/SUPABASE-SETUP.md.',
      },
      { status: 503 }
    );
  }

  // 3. Determina redirectTo a partir do request
  const origin =
    request.headers.get('origin') ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    'http://localhost:3000';
  const redirectTo = `${origin}/login?reset=success`;

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  });

  if (error) {
    // Log detalhado server-side; cliente recebe mensagem neutra.
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.error('[auth/reset-password] Supabase error:', error);
    }
    // Anti-enumeração: 200 mesmo em erro genérico.
    // Mantém 200 também quando o email não existe (Supabase retorna
    // success: true silenciosamente para emails inexistentes).
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ ok: true });
}
