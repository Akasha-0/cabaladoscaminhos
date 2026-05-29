import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    
    // The issue is email confirmation. Let me create a magic link test user
    // or skip confirmation
    const email = 'devtest' + Date.now() + '@test.local'
    
    // For testing, let's just verify the API works and return instructions
    return NextResponse.json({ 
      info: 'API is working',
      instructions: [
        '1. Go to http://localhost:3000/registro',
        '2. Create an account',
        '3. Check your email for confirmation',
        '4. Click the confirmation link',
        '5. Then login at http://localhost:3000/login'
      ]
    })
  } catch (err) {
    console.error('[API /auth/bypass]', err)
    return NextResponse.json({ error: 'Erro' }, { status: 500 })
  }
}