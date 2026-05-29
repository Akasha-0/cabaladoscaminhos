'use client'

// This page shows content INSTANTLY - no loading, no checks
export default function Dashboard() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#0f172a', 
      color: 'white', 
      fontFamily: 'Arial, sans-serif',
      padding: '2rem'
    }}>
      <h1 style={{ color: '#fbbf24', fontSize: '3rem', textAlign: 'center', marginBottom: '2rem' }}>
        ✦ DASHBOARD ✦
      </h1>
      
      <div style={{ 
        maxWidth: '600px', 
        margin: '0 auto',
        background: '#1e293b',
        padding: '2rem',
        borderRadius: '1rem'
      }}>
        <h2 style={{ color: '#4ade80', fontSize: '2rem', textAlign: 'center', marginBottom: '1rem' }}>
          ✅ FUNCIONANDO!
        </h2>
        
        <p style={{ color: '#94a3b8', textAlign: 'center', marginBottom: '1rem' }}>
          Se você está vendo esta página, o dashboard carregou!
        </p>
        
        <div style={{ 
          background: '#0f172a', 
          padding: '1rem', 
          borderRadius: '0.5rem',
          marginTop: '1rem'
        }}>
          <p style={{ color: '#94a3b8' }}>
            Logado como: <span style={{ color: 'white' }}>demo@cabala.com</span>
          </p>
          <p style={{ color: '#94a3b8' }}>
            Nome: <span style={{ color: 'white' }}>demo</span>
          </p>
        </div>
      </div>
      
      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <p style={{ color: '#64748b' }}>
          Esta página NÃO tem loading state, NÃO verifica auth, mostra conteúdo IMEDIATAMENTE.
        </p>
      </div>
    </div>
  )
}