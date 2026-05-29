'use client'

// Super simple - no hooks, no state, just static HTML
export default function Page() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#0f172a', 
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui'
    }}>
      <h1 style={{ color: '#fbbf24', fontSize: '3rem' }}>CABALA</h1>
      <p style={{ color: '#94a3b8', marginTop: '1rem' }}>Sistema funcionando!</p>
      <a 
        href="/app.html"
        style={{ 
          marginTop: '2rem',
          padding: '1rem 2rem',
          background: '#7c3aed',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '0.5rem'
        }}
      >
        ABRIR APP
      </a>
    </div>
  )
}