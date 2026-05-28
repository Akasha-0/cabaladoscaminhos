'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { User } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  signOut: async () => {},
})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within SupabaseProvider')
  }
  return context
}

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Criar cliente Supabase apenas no cliente
  const [supabase] = useState(() =>
    createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    )
  )

  useEffect(() => {
    console.log('[SupabaseProvider] useEffect triggered. supabase:', !!supabase);
    console.log('[SupabaseProvider] Env variables:', {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    });

    if (!supabase) {
      console.warn('[SupabaseProvider] Supabase client is null!');
      return;
    }

    // Failsafe timeout: force isLoading to false after 2.5 seconds to prevent frozen screen
    const failsafeTimeout = setTimeout(() => {
      console.warn('[SupabaseProvider] Failsafe timeout triggered! Supabase took too long to respond. Unfreezing screen.');
      setIsLoading(false);
    }, 2500);

    // Verificar usuário atual
    const getUser = async () => {
      console.log('[SupabaseProvider] getUser started');
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        console.log('[SupabaseProvider] getUser success:', user ? user.email : 'No user');
        if (error) {
          console.error('[SupabaseProvider] getUser returned error:', error);
        }
        setUser(user)
      } catch (error) {
        console.error('[SupabaseProvider] Error getting user (exception):', error)
        setUser(null)
      } finally {
        console.log('[SupabaseProvider] getUser finally block. Setting isLoading to false');
        clearTimeout(failsafeTimeout);
        setIsLoading(false)
      }
    }

    getUser()

    // Escutar mudanças de auth
    console.log('[SupabaseProvider] Registering onAuthStateChange listener');
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[SupabaseProvider] onAuthStateChange event:', event, 'session:', !!session);
      setUser(session?.user ?? null)
      clearTimeout(failsafeTimeout);
      setIsLoading(false)
      
      if (event === 'SIGNED_OUT') {
        console.log('[SupabaseProvider] Signed out event, redirecting to /login');
        router.push('/login')
      }
    })

    return () => {
      console.log('[SupabaseProvider] Cleaning up onAuthStateChange listener');
      clearTimeout(failsafeTimeout);
      subscription.unsubscribe()
    }
  }, [supabase, router])

  const signOut = async () => {
    if (!supabase) return
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}