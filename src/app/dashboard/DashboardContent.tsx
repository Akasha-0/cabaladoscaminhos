'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface DashboardContentProps {
  userEmail: string
  userName: string
}

export default function DashboardContent({ userEmail, userName }: DashboardContentProps) {
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' })
      if (res.ok) {
        router.push('/login')
      } else {
        setIsLoggingOut(false)
      }
    } catch {
      setIsLoggingOut(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#020617' }}>
      <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontFamily: 'Cinzel, serif', fontSize: '2rem', color: '#fef3c7' }}>
              Bem-vindo, {userName}!
            </h1>
            <p style={{ color: '#fde68a', opacity: 0.6 }}>Dashboard Carregado via Server</p>
          </div>
          <button 
            onClick={handleLogout}
            disabled={isLoggingOut}
            style={{ 
              padding: '0.5rem 1rem', 
              border: '1px solid rgba(251, 191, 36, 0.3)', 
              background: 'transparent', 
              color: '#fbbf24',
              cursor: isLoggingOut ? 'wait' : 'pointer',
              opacity: isLoggingOut ? 0.5 : 1
            }}
          >
            {isLoggingOut ? 'Saindo...' : 'Sair'}
          </button>
        </div>
        
        {/* Success message */}
        <div style={{ 
          background: 'rgba(15, 23, 42, 0.5)', 
          border: '1px solid rgba(251, 191, 36, 0.2)', 
          borderRadius: '0.5rem', 
          padding: '1.5rem',
          marginBottom: '1.5rem'
        }}>
          <h2 style={{ fontFamily: 'Cinzel, serif', color: '#fde68a', marginBottom: '0.5rem' }}>
            ✦ Login Realizado com Sucesso! ✦
          </h2>
          <p style={{ color: '#fde68a', opacity: 0.8 }}>
            Email: {userEmail}
          </p>
          <p style={{ color: '#fde68a', opacity: 0.6, fontSize: '0.875rem', marginTop: '0.5rem' }}>
            Esta página foi carregada no servidor
          </p>
        </div>
        
        {/* Navigation */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
          <Link href="/dashboard/perfil" style={{ 
            display: 'block', 
            background: 'rgba(15, 23, 42, 0.5)', 
            border: '1px solid rgba(251, 191, 36, 0.2)', 
            borderRadius: '0.5rem', 
            padding: '1.5rem',
            textDecoration: 'none',
            cursor: 'pointer'
          }}>
            <h3 style={{ fontFamily: 'Cinzel, serif', color: '#fde68a' }}>Perfil Espiritual</h3>
            <p style={{ color: '#fde68a', opacity: 0.6, fontSize: '0.875rem', marginTop: '0.5rem' }}>
              Configure seus dados
            </p>
          </Link>
          
          <Link href="/dashboard/relatorios" style={{ 
            display: 'block', 
            background: 'rgba(15, 23, 42, 0.5)', 
            border: '1px solid rgba(251, 191, 36, 0.2)', 
            borderRadius: '0.5rem', 
            padding: '1.5rem',
            textDecoration: 'none',
            cursor: 'pointer'
          }}>
            <h3 style={{ fontFamily: 'Cinzel, serif', color: '#fde68a' }}>Relatórios</h3>
            <p style={{ color: '#fde68a', opacity: 0.6, fontSize: '0.875rem', marginTop: '0.5rem' }}>
              Suas análises
            </p>
          </Link>
        </div>
        
      </div>
    </div>
  )
}