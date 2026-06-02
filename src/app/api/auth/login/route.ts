import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/api/auth-utils';

export async function POST(request: Request) {
  let email: string;
  let password: string;
  try {
    const body = await request.json();
    email = body.email;
    password = body.password;
  } catch {
    return NextResponse.json({ error: 'Email e senha são obrigatórios' }, { status: 400 });
  }

  if (!email || !password) {
    return NextResponse.json({ error: 'Email e senha são obrigatórios' }, { status: 400 });
  }

  try {
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    return NextResponse.json({ success: true, user: data.user });
  } catch (err) {
    console.error('[API /auth/login]', err);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
