'use client'

import { useState } from 'react'

export default function TestPage() {
  const [result, setResult] = useState('')

  const testLogin = async () => {
    setResult('Fazendo login...')
    
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: 'demo@cabala.com', 
          password: 'Demo123456' 
        })
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        setResult('Erro: ' + (data.error || 'falhou'))
        return
      }
      
      // Save to localStorage
      const userData = {
        id: data.user?.id || 'no-id',
        email: 'demo@cabala.com',
        name: 'demo'
      }
      localStorage.setItem('cabala_auth_user', JSON.stringify(userData))
      
      setResult('Login OK! Salvou: ' + JSON.stringify(userData))
      
      // Try to go to dashboard
      setTimeout(() => {
        window.location.href = '/dashboard'
      }, 1000)
      
    } catch (err) {
      setResult('Erro: ' + String(err))
    }
  }

  const checkLocalStorage = () => {
    const stored = localStorage.getItem('cabala_auth_user')
    setResult('localStorage: ' + (stored || 'VAZIO'))
  }

  const clearAndGo = () => {
    localStorage.removeItem('cabala_auth_user')
    window.location.href = '/login'
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', padding: '2rem', color: 'white' }}>
      <h1 style={{ color: '#fbbf24', marginBottom: '2rem' }}>TEST AUTH</h1>
      
      <button 
        onClick={testLogin}
        style={{ 
          padding: '1rem 2rem', 
          background: '#7c3aed', 
          color: 'white', 
          border: 'none', 
          borderRadius: '0.5rem',
          cursor: 'pointer',
          marginRight: '1rem'
        }}
      >
        1. Login (demo@cabala.com)
      </button>
      
      <button 
        onClick={checkLocalStorage}
        style={{ 
          padding: '1rem 2rem', 
          background: '#059669', 
          color: 'white', 
          border: 'none', 
          borderRadius: '0.5rem',
          cursor: 'pointer',
          marginRight: '1rem'
        }}
      >
        2. Ver localStorage
      </button>
      
      <button 
        onClick={clearAndGo}
        style={{ 
          padding: '1rem 2rem', 
          background: '#dc2626', 
          color: 'white', 
          border: 'none', 
          borderRadius: '0.5rem',
          cursor: 'pointer'
        }}
      >
        3. Limpar e ir Login
      </button>
      
      <p style={{ marginTop: '2rem', fontFamily: 'monospace', color: '#94a3b8' }}>{result}</p>
      
      <div style={{ marginTop: '2rem' }}>
        <a href="/dashboard" style={{ color: '#7c3aed', marginRight: '1rem' }}>Ir para Dashboard</a>
        <a href="/login" style={{ color: '#7c3aed' }}>Ir para Login</a>
      </div>
    </div>
  )
}