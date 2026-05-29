'use client'

export default function SimpleDashboard() {
  const user = typeof window !== 'undefined' ? localStorage.getItem('cabala_auth_user') : null

  if (!user) {
    return (
      <div style={{ minHeight: '100vh', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ color: '#ef4444', fontSize: '1.5rem' }}>NO USER</h1>
          <a href="/simple-login" style={{ color: '#7c3aed' }}>Go to Login</a>
        </div>
      </div>
    )
  }

  const userData = JSON.parse(user)

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a' }}>
      <div style={{ padding: '2rem' }}>
        <h1 style={{ color: '#fbbf24', fontSize: '2rem', marginBottom: '1rem' }}>DASHBOARD</h1>
        <p style={{ color: '#94a3b8' }}>User: {userData.email}</p>
        <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '0.5rem' }}>ID: {userData.id}</p>
        <button 
          onClick={() => {
            localStorage.removeItem('cabala_auth_user')
            window.location.href = '/simple-login'
          }}
          style={{ 
            marginTop: '2rem',
            padding: '0.75rem 1.5rem', 
            background: '#dc2626', 
            color: 'white', 
            border: 'none', 
            borderRadius: '0.5rem',
            cursor: 'pointer'
          }}
        >
          LOGOUT
        </button>
      </div>
    </div>
  )
}