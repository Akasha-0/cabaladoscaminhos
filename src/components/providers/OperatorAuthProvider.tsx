'use client'
// src/components/providers/OperatorAuthProvider.tsx
// Contexto React para a sessão do Operator (B2B).
// Coexiste com SupabaseProvider (B2C users) — não conflitar.
//
// Auth flow (Fase 7+8):
//   - Login/Logout/Register: POST /api/operator/auth/{login,logout,register}
//   - Sessão: cookie httpOnly 'cockpit_session' (JWT) — setado pelas rotas
//   - Verificação: GET /api/operator/auth/me
//
// O provider faz 1 fetch no boot para descobrir se o Operator está logado
// (verifica o cookie via /me). Após isso, mantém o estado em memória.

import { createContext, useContext, useEffect, useState, useCallback, useRef, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'

// ============================================================================
// Tipos
// ============================================================================

export interface OperatorInfo {
  id: string
  email: string
  name: string
  role: 'OPERATOR' | 'ADMIN'
}

interface OperatorAuthContextType {
  operator: OperatorInfo | null
  isLoading: boolean
  isHydrated: boolean
  isAuthenticated: boolean
  signIn: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>
  signOut: () => Promise<void>
  register: (name: string, email: string, password: string) => Promise<{ ok: boolean; error?: string }>
  refresh: () => Promise<void>
}

const defaultValue: OperatorAuthContextType = {
  operator: null,
  isLoading: true,
  isHydrated: false,
  isAuthenticated: false,
  signIn: async () => ({ ok: false, error: 'OperatorAuthProvider não inicializou' }),
  signOut: async () => {},
  register: async () => ({ ok: false, error: 'OperatorAuthProvider não inicializou' }),
  refresh: async () => {},
}

const OperatorAuthContext = createContext<OperatorAuthContextType>(defaultValue)

export const useOperatorAuth = () => {
  const ctx = useContext(OperatorAuthContext)
  if (!ctx) {
    throw new Error('useOperatorAuth must be used within OperatorAuthProvider')
  }
  return ctx
}

// ============================================================================
// Helpers de fetch
// ============================================================================

async function fetchMe(): Promise<OperatorInfo | null> {
  try {
    const res = await fetch('/api/operator/auth/me', {
      method: 'GET',
      credentials: 'include', // envia o cookie httpOnly
    })
    if (!res.ok) return null
    const data = await res.json()
    return data.operator ?? null
  } catch {
    return null
  }
}

// ============================================================================
// Provider
// ============================================================================

function OperatorAuthProvider({ children }: { children: ReactNode }) {
  const [operator, setOperator] = useState<OperatorInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isHydrated, setIsHydrated] = useState(false)
  const router = useRouter()
  const initRef = useRef(false)

  // Marca hidratado no client (evita mismatch SSR/hydration)
  useEffect(() => {
    setIsHydrated(true)
  }, [])

  const refresh = useCallback(async () => {
    setIsLoading(true)
    const me = await fetchMe()
    setOperator(me)
    setIsLoading(false)
  }, [])

  // Boot: checa sessão existente
  useEffect(() => {
    if (!isHydrated || initRef.current) return
    initRef.current = true
    refresh()
  }, [isHydrated, refresh])

  const signIn = useCallback(
    async (email: string, password: string): Promise<{ ok: boolean; error?: string }> => {
      try {
        const res = await fetch('/api/operator/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ email, password }),
        })
        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          return { ok: false, error: data.error ?? 'Falha no login' }
        }
        const data = await res.json()
        setOperator(data.operator)
        return { ok: true }
      } catch (err) {
        return { ok: false, error: err instanceof Error ? err.message : 'Erro de rede' }
      }
    },
    []
  )

  const signOut = useCallback(async () => {
    try {
      await fetch('/api/operator/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })
    } catch (err) {
      // best-effort — limpamos o estado de qualquer forma
      console.error('[OperatorAuthProvider] logout error', err)
    }
    setOperator(null)
    router.push('/operator/login')
  }, [router])

  const register = useCallback(
    async (name: string, email: string, password: string): Promise<{ ok: boolean; error?: string }> => {
      try {
        const res = await fetch('/api/operator/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ name, email, password }),
        })
        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          return { ok: false, error: data.error ?? 'Falha no registro' }
        }
        const data = await res.json()
        setOperator(data.operator)
        return { ok: true }
      } catch (err) {
        return { ok: false, error: err instanceof Error ? err.message : 'Erro de rede' }
      }
    },
    []
  )

  const value: OperatorAuthContextType = {
    operator,
    isLoading,
    isHydrated,
    isAuthenticated: !!operator && isHydrated,
    signIn,
    signOut,
    register,
    refresh,
  }

  return <OperatorAuthContext.Provider value={value}>{children}</OperatorAuthContext.Provider>
}
