import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
export async function POST() {
  // DEV ONLY — never accessible in production
  const env = process.env.NODE_ENV ?? 'undefined';
  if (env !== 'development' && env !== 'test') {
    return NextResponse.json(
      { error: 'Este endpoint só está disponível em desenvolvimento' },
      { status: 403 }
    );
  }
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    
    const email = 'test' + Date.now() + '@testlogin.com'
    const password = 'Test123456'
    
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true // Skip email confirmation
    })
    
    if (error) throw error
    
    return NextResponse.json({ 
      success: true, 
      email,
      password,
      message: 'User created! Use these credentials to login.'
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}