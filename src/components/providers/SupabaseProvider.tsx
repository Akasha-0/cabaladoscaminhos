'use client'

import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { User } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  signOut: () => Promise<void>
  supabase: ReturnType<typeof createBrowserClient> | null
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  signOut: async () => {},
  supabase: null,
})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within SupabaseProvider')
  }
  return context
}

// Singleton client
let supabaseClient: ReturnType<typeof createBrowserClient> | null = null

function getSupabaseClient() {
  if (supabaseClient) return supabaseClient
  
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!url || !anonKey) {
    console.error('[SupabaseProvider] Missing Supabase environment variables')
    return null
  }
  
  supabaseClient = createBrowserClient(url, anonKey)
  return supabaseClient
}

function SupabaseProvider({ children }: { children: React.ReactNode }) {
  // All hooks must be called unconditionally
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isHydrated, setIsHydrated] = useState(false)
  const router = useRouter()
  const initRef = useRef(false)
  
  // Always get supabase client (this is safe to call)
  const supabase = getSupabaseClient()

  // Mark as hydrated on client mount
  useEffect(() => {
    setIsHydrated(true)
  }, [])

  // Initialize auth - hooks called after all initial hooks
  useEffect(() => {
    // Don't run if not hydrated or already initialized
    if (!isHydrated || initRef.current) {
      return
    }
    
    initRef.current = true
    
    // If no supabase, just mark as not loading
    if (!supabase) {
      setIsLoading(false)
      return
    }
    
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setUser(session?.user ?? null)
      } catch (err) {
        console.error('[SupabaseProvider] Error getting session:', err)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }
    
    initAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event: string, session: any) => {
        console.log('[SupabaseProvider] Auth event:', event)
        setUser(session?.user ?? null)
        setIsLoading(false)

        if (event === 'SIGNED_OUT') {
          console.log('[SupabaseProvider] User signed out')
          router.push('/login')
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, router, isHydrated])

  const signOut = useCallback(async () => {
    if (!supabase) return
    
    try {
      await supabase.auth.signOut()
      setUser(null)
      router.push('/login')
    } catch (err) {
      console.error('[SupabaseProvider] Sign out error:', err)
    }
  }, [supabase, router])

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user && isHydrated,
    signOut,
    supabase,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}