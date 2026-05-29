'use client'

import { useState, useEffect } from 'react'

export default function DebugPage() {
  const [state, setState] = useState({
    cookies: '',
    hasAuth: false,
    authValue: '',
    mounted: false
  })

  useEffect(() => {
    const cookies = document.cookie.split(';')
    const authCookie = cookies.find(c => c.trim().startsWith('cabala_auth='))
    
    setState({
      cookies: document.cookie,
      hasAuth: !!authCookie,
      authValue: authCookie ? authCookie.split('=')[1] : '',
      mounted: true
    })
  }, [])

  const setTestCookie = () => {
    const data = { email: 'test@test.com', name: 'Test' }
    document.cookie = `cabala_auth=${encodeURIComponent(JSON.stringify(data))}; path=/; max-age=3600`
    window.location.reload()
  }

  const clearCookie = () => {
    document.cookie = 'cabala_auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/'
    window.location.reload()
  }

  if (!state.mounted) {
    return <div style={{ minHeight: '100vh', background: '#0f172a', color: 'white', padding: '2rem' }}>Carregando...</div>
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', color: 'white', padding: '2rem', fontFamily: 'monospace' }}>
      <h1 style={{ color: '#fbbf24', fontSize: '2rem' }}>🔍 DEBUG AUTH</h1>
      
      <div style={{ background: '#1e293b', padding: '1rem', borderRadius: '0.5rem', marginTop: '1rem' }}>
        <p><strong style={{ color: '#94a3b8' }}>All Cookies:</strong></p>
        <pre style={{ color: '#e2e8f0', fontSize: '0.875rem', wordBreak: 'break-all' }}>
          {state.cookies || '(empty)'}
        </pre>
      </div>
      
      <div style={{ background: '#1e293b', padding: '1rem', borderRadius: '0.5rem', marginTop: '1rem' }}>
        <p><strong style={{ color: '#94a3b8' }}>Has cabala_auth cookie:</strong> 
          <span style={{ color: state.hasAuth ? '#4ade80' : '#f87171' }}>
            {state.hasAuth ? 'YES ✓' : 'NO ✗'}
          </span>
        </p>
      </div>
      
      {state.hasAuth && (
        <div style={{ background: '#1e293b', padding: '1rem', borderRadius: '0.5rem', marginTop: '1rem' }}>
          <p><strong style={{ color: '#94a3b8' }}>Cookie Value:</strong></p>
          <pre style={{ color: '#4ade80', fontSize: '0.875rem', wordBreak: 'break-all' }}>
            {state.authValue.substring(0, 100)}...
          </pre>
        </div>
      )}
      
      <div style={{ marginTop: '2rem' }}>
        <h2 style={{ color: '#94a3b8', marginBottom: '1rem' }}>Actions:</h2>
        
        <button 
          onClick={setTestCookie}
          style={{ padding: '1rem 2rem', background: '#059669', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', marginRight: '1rem' }}
        >
          Set Test Cookie
        </button>
        
        <button 
          onClick={clearCookie}
          style={{ padding: '1rem 2rem', background: '#dc2626', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}
        >
          Clear Cookie
        </button>
      </div>
      
      <div style={{ marginTop: '2rem' }}>
        <a href="/dashboard" style={{ color: '#7c3aed', marginRight: '1rem' }}>→ Dashboard</a>
        <a href="/login" style={{ color: '#7c3aed' }}>→ Login</a>
      </div>
      
      {state.hasAuth && (
        <div style={{ marginTop: '2rem' }}>
          <a 
            href="/dashboard" 
            style={{ 
              display: 'inline-block',
              padding: '1rem 2rem', 
              background: '#7c3aed', 
              color: 'white', 
              textDecoration: 'none',
              borderRadius: '0.5rem',
              fontSize: '1.25rem'
            }}
          >
            Go to Dashboard (you have auth cookie) →
          </a>
        </div>
      )}
    </div>
  )
}