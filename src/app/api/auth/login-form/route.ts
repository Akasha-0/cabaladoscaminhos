import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

/**
 * Login via form (legacy) — APENAS DESENVOLVIMENTO.
 *
 * ⚠️ SECURITY (wave 10, F3): Esta rota continha um bypass de credenciais
 * demo (`demo@cabala.com` / `Demo123456`) hardcoded que permitia login
 * irrestrito se fosse deployada em produção. Agora ela retorna 404 em
 * qualquer ambiente não-dev (`NODE_ENV === 'production'` ou ausente).
 *
 * Em desenvolvimento, mantém o bypass para conveniência local — mas
 * **NUNCA** em produção. Ver `docs/SECURITY-FIXES-WAVE10.md`.
 */
function isDevEnvironment(): boolean {
  return process.env.NODE_ENV === 'development';
}

function prodBlockedResponse() {
  return new NextResponse('Not Found', { status: 404 });
}

export async function POST(request: Request) {
  // Fail-closed: bloqueia em prod, mesmo que a rota seja deployada por engano.
  if (!isDevEnvironment()) {
    return prodBlockedResponse();
  }

  try {
    const formData = await request.formData()
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    if (!email || !password) {
      return NextResponse.redirect(new URL('/login?error=missing', request.url))
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // For demo, accept the test credentials (DEV ONLY — gated above)
    if (email === 'demo@cabala.com' && password === 'Demo123456') {
      const cookieStore = await cookies()
      cookieStore.set('cabala_auth', JSON.stringify({
        email,
        id: '3970b317-1591-49ce-97d9-b8833ea0614e',
        name: 'demo'
      }), {
        httpOnly: false,
        secure: false,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7 // 1 week
      })

      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // Fallback to Supabase auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (authError) {
      return NextResponse.redirect(new URL('/login?error=invalid', request.url))
    }

    // Set cookie
    const cookieStore = await cookies()
    cookieStore.set('cabala_auth', JSON.stringify({
      email: authData.user?.email,
      id: authData.user?.id,
      name: authData.user?.user_metadata?.full_name || email.split('@')[0]
    }), {
      httpOnly: false,
      secure: false,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7
    })

    return NextResponse.redirect(new URL('/dashboard', request.url))

  } catch (err) {
    return NextResponse.redirect(new URL('/login?error=server', request.url))
  }
}
