'use client'

import { useState } from 'react'

const AUTH_KEY = 'cabala_auth_user'

export default function CompleteTestPage() {
  const [step, setStep] = useState<'choice' | 'login' | 'dashboard' | 'done'>('choice')
  const [email, setEmail] = useState('demo@cabala.com')
  const [password, setPassword] = useState('Demo123456')
  const [msg, setMsg] = useState('')
  const [userData, setUserData] = useState<any>(null)

  const handleLogin = async () => {
    setMsg('Fazendo login...')
    
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        setMsg('❌ Erro: ' + (data.error || 'falhou'))
        return
      }
      
      const user = {
        id: data.user?.id || 'no-id',
        email: email,
        name: email.split('@')[0]
      }
      
      localStorage.setItem(AUTH_KEY, JSON.stringify(user))
      setUserData(user)
      setMsg('✅ Login OK! Salvou no localStorage.')
      
      // Go to dashboard check
      setTimeout(() => setStep('done'), 1000)
      
    } catch (err) {
      setMsg('❌ Erro: ' + String(err))
    }
  }

  const checkDashboard = () => {
    const stored = localStorage.getItem(AUTH_KEY)
    if (stored) {
      setUserData(JSON.parse(stored))
      setStep('dashboard')
    } else {
      setMsg('❌ localStorage vazio!')
    }
  }

  const clearAll = () => {
    localStorage.removeItem(AUTH_KEY)
    setUserData(null)
    setMsg('')
    setStep('choice')
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', color: 'white', padding: '2rem' }}>
      <h1 style={{ color: '#fbbf24', fontSize: '2rem', marginBottom: '2rem' }}>🔑 TESTE COMPLETO DE AUTH</h1>
      
      {step === 'choice' && (
        <div>
          <h2 style={{ color: '#94a3b8', marginBottom: '1rem' }}>Escolha uma ação:</h2>
          
          <button 
            onClick={() => setStep('login')}
            style={btnStyle('#7c3aed')}
          >
            1️⃣ Fazer Login
          </button>
          
          <button 
            onClick={checkDashboard}
            style={btnStyle('#059669')}
          >
            2️⃣ Ver Dashboard (com localStorage)
          </button>
          
          <button 
            onClick={clearAll}
            style={btnStyle('#dc2626')}
          >
            3️⃣ Limpar Tudo
          </button>
          
          <div style={{ marginTop: '2rem', color: '#64748b' }}>
            <p>Credenciais: demo@cabala.com / Demo123456</p>
            <p style={{ marginTop: '0.5rem' }}>
              Links: <a href="/login" style={linkStyle}>/login</a> | <a href="/dashboard" style={linkStyle}>/dashboard</a>
            </p>
          </div>
        </div>
      )}
      
      {step === 'login' && (
        <div>
          <h2 style={{ color: '#fbbf24', marginBottom: '1rem' }}>Login</h2>
          
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            style={inputStyle}
          />
          
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Senha"
            style={inputStyle}
          />
          
          <button onClick={handleLogin} style={{ ...btnStyle('#7c3aed'), width: '100%', marginTop: '1rem' }}>
            ENTRAR
          </button>
          
          <button onClick={() => setStep('choice')} style={{ ...btnStyle('#475569'), width: '100%', marginTop: '0.5rem' }}>
            Voltar
          </button>
        </div>
      )}
      
      {step === 'dashboard' && (
        <div>
          <h2 style={{ color: '#4ade80', fontSize: '1.5rem', marginBottom: '1rem' }}>✅ DASHBOARD FUNCIONANDO!</h2>
          
          <div style={{ background: '#1e293b', padding: '1rem', borderRadius: '0.5rem', fontFamily: 'monospace' }}>
            <p style={{ color: '#94a3b8' }}>Usuário logado:</p>
            <p style={{ color: '#fbbf24' }}>Email: {userData?.email}</p>
            <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>ID: {userData?.id}</p>
          </div>
          
          <button 
            onClick={clearAll}
            style={{ ...btnStyle('#dc2626'), marginTop: '2rem' }}
          >
            Logout e Voltar
          </button>
        </div>
      )}
      
      {step === 'done' && (
        <div>
          <h2 style={{ color: '#4ade80', fontSize: '1.5rem' }}>✅ LOGIN REALIZADO!</h2>
          <p style={{ color: '#94a3b8', marginTop: '1rem' }}>Salvamos no localStorage:</p>
          <pre style={{ background: '#1e293b', padding: '1rem', borderRadius: '0.5rem', marginTop: '0.5rem', overflow: 'auto' }}>
            {JSON.stringify(userData, null, 2)}
          </pre>
          
          <div style={{ marginTop: '2rem' }}>
            <button onClick={checkDashboard} style={btnStyle('#059669')}>
              Ver Dashboard
            </button>
            <button onClick={clearAll} style={{ ...btnStyle('#dc2626'), marginLeft: '1rem' }}>
              Logout
            </button>
          </div>
        </div>
      )}
      
      {msg && (
        <p style={{ 
          marginTop: '2rem', 
          padding: '1rem', 
          background: msg.includes('❌') ? '#7f1d1d' : '#064e3b',
          borderRadius: '0.5rem',
          color: msg.includes('❌') ? '#fca5a5' : '#6ee7b7'
        }}>
          {msg}
        </p>
      )}
    </div>
  )
}

const btnStyle = (bg: string) => ({
  padding: '1rem 2rem',
  background: bg,
  color: 'white',
  border: 'none',
  borderRadius: '0.5rem',
  cursor: 'pointer',
  fontSize: '1rem',
  marginRight: '1rem',
  marginBottom: '0.5rem'
})

const linkStyle = {
  color: '#7c3aed',
  marginRight: '1rem'
}

const inputStyle = {
  width: '100%',
  padding: '1rem',
  background: '#1e293b',
  border: '1px solid #475569',
  color: 'white',
  borderRadius: '0.5rem',
  marginBottom: '0.5rem',
  fontSize: '1rem',
  display: 'block'
}