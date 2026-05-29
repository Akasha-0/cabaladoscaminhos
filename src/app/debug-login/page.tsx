'use client'

const AUTH_KEY = 'cabala_auth_user'

export default function DebugPage() {
  const testLogin = () => {
    const user = {
      id: 'test-' + Date.now(),
      email: 'debug@test.com',
      name: 'Debug User'
    }
    localStorage.setItem(AUTH_KEY, JSON.stringify(user))
    window.location.href = '/dashboard'
  }

  const clearAndLogin = () => {
    localStorage.removeItem(AUTH_KEY)
    window.location.href = '/login'
  }

  const checkStorage = () => {
    const stored = localStorage.getItem(AUTH_KEY)
    alert(stored || 'localStorage está vazio!')
  }

  return (
    <div className="min-h-screen bg-slate-900 p-8">
      <h1 className="text-amber-400 font-cinzel text-3xl mb-8">Debug Auth</h1>
      
      <div className="max-w-md space-y-4">
        <div className="bg-slate-800 p-6 rounded-lg border border-amber-500/20">
          <h2 className="text-white font-cinzel mb-4">Teste de Autenticação</h2>
          
          <div className="space-y-3">
            <button 
              onClick={testLogin}
              className="w-full px-4 py-3 bg-green-600 text-white rounded-lg font-cinzel hover:bg-green-700 transition-colors"
            >
              1. Simular Login (define localStorage)
            </button>
            
            <button 
              onClick={clearAndLogin}
              className="w-full px-4 py-3 bg-red-600 text-white rounded-lg font-cinzel hover:bg-red-700 transition-colors"
            >
              2. Limpar localStorage e ir para Login
            </button>
            
            <button 
              onClick={checkStorage}
              className="w-full px-4 py-3 bg-amber-600 text-white rounded-lg font-cinzel hover:bg-amber-700 transition-colors"
            >
              3. Verificar localStorage atual
            </button>
            
            <a 
              href="/dashboard"
              className="block w-full px-4 py-3 bg-purple-600 text-white rounded-lg font-cinzel hover:bg-purple-700 transition-colors text-center"
            >
              4. Ir para Dashboard (sem auth)
            </a>
          </div>
        </div>
        
        <div className="bg-slate-800 p-4 rounded-lg">
          <h3 className="text-slate-400 font-cinzel mb-2">Como testar:</h3>
          <ol className="text-slate-500 text-sm space-y-1 list-decimal list-inside">
            <li>Clique em "Simular Login" para criar usuário fake</li>
            <li>Você será redirecionado para /dashboard</li>
            <li>Se dashboard carregar → Auth funciona</li>
            <li>Se travar → há problema no auth provider</li>
          </ol>
        </div>
      </div>
    </div>
  )
}