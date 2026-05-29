'use client'

import { useRouter } from 'next/navigation'

export default function Login() {
  const router = useRouter()

  const handleLogin = () => {
    // Instant redirect - no API call, no loading
    router.push('/dashboard')
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#0f172a', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center'
    }}>
      <div style={{ 
        background: '#1e293b', 
        padding: '2rem', 
        borderRadius: '1rem',
        textAlign: 'center',
        maxWidth: '400px',
        width: '90%'
      }}>
        <h1 style={{ color: '#fbbf24', fontSize: '2rem', marginBottom: '1rem' }}>
          ✦ CABALA ✦
        </h1>
        
        <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>
          Clique abaixo para entrar
        </p>
        
        <button 
          onClick={handleLogin}
          style={{
            width: '100%',
            padding: '1rem',
            background: '#7c3aed',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            fontSize: '1rem',
            cursor: 'pointer'
          }}
        >
          ENTRAR (Demo)
        </button>
        
        <p style={{ color: '#64748b', marginTop: '1rem', fontSize: '0.875rem' }}>
          demo@cabala.com / Demo123456
        </p>
      </div>
    </div>
  )
}