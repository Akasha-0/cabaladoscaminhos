import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
  try {
    const { email, password, nomeCompleto, dataNascimento } = await request.json()
    
    if (!email || !password) {
      return NextResponse.json({ error: 'Email e senha são obrigatórios' }, { status: 400 })
    }
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: nomeCompleto,
        data_nascimento: dataNascimento
      }
    })
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    
    return NextResponse.json({ success: true, user: { id: data.user?.id, email: data.user?.email } })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Erro interno' }, { status: 500 })
  }
}