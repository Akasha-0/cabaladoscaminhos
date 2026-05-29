import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const allCookies = cookieStore.getAll()
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    
    const { data: { session } } = await supabase.auth.getSession()
    
    return NextResponse.json({
      cookies: allCookies.map(c => c.name),
      hasSession: !!session,
      userEmail: session?.user?.email || null,
      cookieHeader: allCookies.find(c => c.name.includes('supabase'))?.value ? 'present' : 'missing'
    })
  } catch (err) {
    console.error('[Debug /auth/status]', err)
    return NextResponse.json({ error: 'Erro' }, { status: 500 })
  }
}