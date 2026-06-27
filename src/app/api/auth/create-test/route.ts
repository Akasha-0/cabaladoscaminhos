import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

/**
 * Cria usuário de teste com email único — APENAS DESENVOLVIMENTO.
 *
 * ⚠️ SECURITY (wave 10, F11): Rota originalmente exposta em produção.
 * Criava conta com senha `Test123456` hardcoded + email confirmado
 * automaticamente — se deployada, atacantes poderiam criar contas
 * arbitrariamente e fazer spam/farming.
 *
 * Agora retorna 404 fora de `NODE_ENV === 'development'`.
 */
function isDevEnvironment(): boolean {
  return process.env.NODE_ENV === 'development';
}

export async function POST() {
  if (!isDevEnvironment()) {
    return new NextResponse('Not Found', { status: 404 });
  }

  try {
    const supabase = createAdminClient();

    if (!supabase) {
      return NextResponse.json(
        { error: 'admin_client_unavailable' },
        { status: 503 }
      );
    }

    const email = 'test' + Date.now() + '@testlogin.com';
    const password = 'Test123456';

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Skip email confirmation (dev only)
    });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      email,
      password,
      message: 'User created! Use these credentials to login.',
    });
  } catch (err: any) {
    // Não vaza mensagem do Supabase em produção (F14 — error messages
    // sem reconnaissance). Aqui já estamos gated por NODE_ENV então é OK.
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
