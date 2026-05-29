'use client'

export default function SimpleLogin() {
  const handleLogin = () => {
    // Simple test - just set localStorage and redirect
    localStorage.setItem('cabala_auth_user', JSON.stringify({
      id: 'test123',
      email: 'test@test.com',
      name: 'Test'
    }))
    window.location.href = '/simple-dashboard'
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ color: '#fbbf24', fontSize: '2rem', marginBottom: '2rem', fontFamily: 'serif' }}>SIMPLE LOGIN</h1>
        <button 
          onClick={handleLogin}
          style={{ 
            padding: '1rem 3rem', 
            fontSize: '1.25rem', 
            background: '#7c3aed', 
            color: 'white', 
            border: 'none', 
            borderRadius: '0.5rem',
            cursor: 'pointer'
          }}
        >
          LOGIN (NO API)
        </button>
      </div>
    </div>
  )
}