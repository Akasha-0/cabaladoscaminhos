import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

export default async function DebugPage() {
  const cookieStore = await cookies()
  const allCookies = cookieStore.getAll()
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  
  const { data: { session } } = await supabase.auth.getSession()
  
  return (
    <div style={{ padding: '2rem', fontFamily: 'monospace', background: '#000', color: '#0f0', minHeight: '100vh' }}>
      <h1 style={{ color: '#0f0' }}>Debug Auth Page</h1>
      
      <h2>Cookies ({allCookies.length})</h2>
      <ul>
        {allCookies.map(c => (
          <li key={c.name}>{c.name}: {c.value.substring(0, 50)}...</li>
        ))}
      </ul>
      
      <h2>Session</h2>
      <pre style={{ background: '#111', padding: '1rem', overflow: 'auto' }}>
        {JSON.stringify({
          hasSession: !!session,
          userEmail: session?.user?.email || 'null',
          userId: session?.user?.id || 'null'
        }, null, 2)}
      </pre>
      
      <h2>Actions</h2>
      <a href="/login" style={{ color: '#0ff', marginRight: '1rem' }}>Go to Login</a>
      <a href="/dashboard" style={{ color: '#0ff' }}>Go to Dashboard</a>
    </div>
  )
}