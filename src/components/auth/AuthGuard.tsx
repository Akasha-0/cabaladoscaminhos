'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

interface AuthGuardProps {
  children: React.ReactNode
  fallbackPath?: string
}

export function AuthGuard({ children, fallbackPath = '/login' }: AuthGuardProps) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    
    if (!loading && !user) {
      router.push(fallbackPath)
    }
  }, [user, loading, router, fallbackPath, mounted])

  // Não mostrar nada enquanto verifica auth (SSR/hydration)
  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex justify-center gap-2 text-primary">
          {[...Array(7)].map((_, i) => (
            <span key={i} className="text-2xl animate-pulse">✦</span>
          ))}
        </div>
      </div>
    )
  }

  // Se não está logado, não mostra children
  if (!user) {
    return null
  }

  return <>{children}</>
}