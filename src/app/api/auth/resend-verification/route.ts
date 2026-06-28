import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { emailField } from '@/lib/validation/auth';

/**
 * POST /api/auth/resend-verification
 * ----------------------------------------------------------------------------
 * Reenvia email de verificação para um usuário que ainda não confirmou o
 * cadastro. Compatível com Supabase Auth (signUp/resend).
 *
 * Body: { email: string }
 * 200 OK:                — email reenviado (ou silenciosamente aceito)
 * 400 Bad Request:       — body inválido (Zod)
 * 429 Too Many Requests: — rate limit (middleware raiz)
 * 503 Service Unavailable: Supabase não configurado (sandbox)
 *
 * Anti-enumeração (OWASP A07):
 *   - Mesmo se Supabase retornar erro, respondemos 200 ao cliente para
 *     evitar descoberta de emails cadastrados.
 *
 * Wave 11 (auth integration).
 */

export const runtime = 'nodejs';

const schema = z.object({ email: emailField });

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Body inválido' }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Email inválido' },
      { status: 400 }
    );
  }

  const { email } = parsed.data;

  const supabase = await createClient();
  if (!supabase) {
    if (process.env.NODE_ENV !== 'production') {
       
      console.warn('[auth/resend-verification] Supabase não configurado.');
    }
    return NextResponse.json(
      { error: 'Serviço de email indisponível. Configure Supabase.' },
      { status: 503 }
    );
  }

  const origin =
    request.headers.get('origin') ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    'http://localhost:3000';
  const emailRedirectTo = `${origin}/feed?welcome=1`;

  // resend() — Supabase v2: usa o email do body e dispara novo email de
  // confirmação. Antes do verify-email o user fica em estado "unconfirmed".
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email,
    options: { emailRedirectTo },
  });

  if (error) {
    if (process.env.NODE_ENV !== 'production') {
       
      console.error('[auth/resend-verification] Supabase error:', error);
    }
    // Anti-enumeração: sempre 200 (Supabase devolve erro "user not found" se
    // email inexistente, mas mascaramos para o cliente).
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ ok: true });
}
