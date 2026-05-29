'use client'

// STEP 1: Login saves to localStorage
// STEP 2: Dashboard reads from localStorage  
// STEP 3: Show result

export default function SimpleTest() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#0f172a', 
      color: 'white', 
      padding: '2rem',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <h1 style={{ color: '#fbbf24', fontSize: '2rem' }}>🔑 TESTE SIMPLES</h1>
      
      {/* STEP 1 */}
      <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#1e293b', borderRadius: '1rem' }}>
        <h2 style={{ color: '#a78bfa', marginBottom: '1rem' }}>Passo 1: Login</h2>
        <input id="email" type="email" placeholder="Email" defaultValue="demo@cabala.com"
          style={{ width: '100%', padding: '0.75rem', background: '#0f172a', border: '1px solid #475569', color: 'white', borderRadius: '0.5rem', marginBottom: '0.5rem' }} />
        <input id="password" type="password" placeholder="Senha" defaultValue="Demo123456"
          style={{ width: '100%', padding: '0.75rem', background: '#0f172a', border: '1px solid #475569', color: 'white', borderRadius: '0.5rem', marginBottom: '0.5rem' }} />
        <button id="loginBtn" onClick={async () => {
          try {
            const emailEl = document.getElementById('email') as HTMLInputElement | null
            const passwordEl = document.getElementById('password') as HTMLInputElement | null
            const email = emailEl?.value || ''
            const password = passwordEl?.value || ''
            const res = await fetch('/api/auth/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email, password })
            })
            const data = await res.json()
            if (res.ok) {
              localStorage.setItem('cabala_auth_user', JSON.stringify({ id: data.user?.id, email, name: email.split('@')[0] }))
              const resultEl = document.getElementById('result1')
              if (resultEl) {
                resultEl.textContent = '✅ OK!'
                resultEl.style.color = '#4ade80'
              }
            } else {
              const resultEl = document.getElementById('result1')
              if (resultEl) {
                resultEl.textContent = '❌ ' + (data.error || 'Erro')
                resultEl.style.color = '#f87171'
              }
            }
          } catch (e) {
            const resultEl = document.getElementById('result1')
            if (resultEl) {
              resultEl.textContent = '❌ Erro de rede'
              resultEl.style.color = '#f87171'
            }
          }
        }}
          style={{ padding: '0.75rem 1.5rem', background: '#7c3aed', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}>
          Login
        </button>
        <span id="result1" style={{ marginLeft: '1rem', fontWeight: 'bold' }}></span>
      </div>
      
      {/* STEP 2 */}
      <div style={{ marginTop: '1.5rem', padding: '1.5rem', background: '#1e293b', borderRadius: '1rem' }}>
        <h2 style={{ color: '#a78bfa', marginBottom: '1rem' }}>Passo 2: Verificar localStorage</h2>
        <button onClick={() => {
          const stored = localStorage.getItem('cabala_auth_user')
          const resultEl = document.getElementById('result2')
          if (resultEl) {
            resultEl.textContent = stored ? '✅ Tem dados: ' + stored.substring(0, 50) : '❌ Vazio'
            resultEl.style.color = stored ? '#4ade80' : '#f87171'
          }
        }}
          style={{ padding: '0.75rem 1.5rem', background: '#059669', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}>
          Verificar
        </button>
        <p id="result2" style={{ marginTop: '0.5rem', fontFamily: 'monospace', fontSize: '0.875rem' }}></p>
      </div>
      
      {/* STEP 3 */}
      <div style={{ marginTop: '1.5rem', padding: '1.5rem', background: '#1e293b', borderRadius: '1rem' }}>
        <h2 style={{ color: '#a78bfa', marginBottom: '1rem' }}>Passo 3: Ir para Dashboard</h2>
        <a href="/dashboard" style={{ 
          display: 'inline-block',
          padding: '0.75rem 1.5rem', 
          background: '#7c3aed', 
          color: 'white', 
          borderRadius: '0.5rem',
          textDecoration: 'none'
        }}>
          Abrir Dashboard →
        </a>
        <p style={{ marginTop: '0.5rem', color: '#64748b', fontSize: '0.875rem' }}>
          Este link vai para /dashboard
        </p>
      </div>
      
      {/* STATUS */}
      <div style={{ marginTop: '2rem', padding: '1rem', background: '#1e293b', borderRadius: '1rem' }}>
        <p style={{ color: '#64748b' }}>Se Step 1 e 2 funcionaram mas Step 3 não carrega → o problema é no Dashboard</p>
      </div>
    </div>
  )
}